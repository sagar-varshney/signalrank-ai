from copy import deepcopy
from datetime import date, timedelta
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import numpy as np
from fastapi.testclient import TestClient

from signalrank.api import app
from signalrank.core import Experiment, TrainingConfig, HORIZON, generate, fitted_model
from signalrank.studio import explain
from signalrank.decision import build as decisions, cost
from signalrank.recovery import run as recovery, UPDATE_DAYS
from signalrank.replay import PER_DAY, DAYS, stream
from signalrank.training import train, load_artifact
from signalrank.deployment import Settings, MemorySnapshotStore
from signalrank.release import selected


class WorkbenchTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.experiment = Experiment(TrainingConfig(count=1800))
        cls.decisions = decisions(cls.experiment)
        cls.recovery = recovery(cls.experiment, "concept_shift", 2718)

    def test_complete_explanation_reconstructs_raw_and_calibrated_scores(self):
        for category in range(5):
            for severity in (1., 5., 10.):
                value = explain(self.experiment, category, severity, True, False)
                self.assertGreater(len(value["contributions"]), 4)
                self.assertAlmostEqual(value["intercept"] + sum(c["value"] for c in value["contributions"]), value["logit"], places=12)
                self.assertAlmostEqual(1 / (1 + np.exp(-value["logit"])), value["raw_probability"])
                calibration = value["calibration"]
                self.assertAlmostEqual(1 / (1 + np.exp(-(calibration["slope"] * value["logit"] + calibration["intercept"]))), value["calibrated_probability"])
                self.assertLess(value["reconstruction_error"], 1e-12)
                self.assertTrue(all(a["end"] == b["start"] for a, b in zip(value["contributions"], value["contributions"][1:])))
        with self.assertRaises(ValueError): explain(self.experiment, 5, 3, True, False)
        with self.assertRaises(ValueError): explain(self.experiment, 1, float("nan"), True, False)

    def test_sensitivity_is_repeatable_without_fitting_or_mutation(self):
        before = deepcopy(self.experiment.report)
        with patch("signalrank.core.fitted_model", side_effect=AssertionError("No fitting")):
            original = explain(self.experiment, 1, 5, True, False)
            changed = explain(self.experiment, 1, 9, True, False)
            self.assertEqual(original, explain(self.experiment, 1, 5, True, False))
        self.assertNotEqual(original["input_sha256"], changed["input_sha256"])
        self.assertNotEqual(original["raw_probability"], changed["raw_probability"])
        self.assertEqual(before, self.experiment.report)

    def test_decision_validation_labels_mature_before_later_evaluation(self):
        result = self.decisions
        self.assertEqual(result["status"], "available")
        v, e = [result["partitions"][name] for name in ("validation", "evaluation")]
        self.assertLess(date.fromisoformat(v["last"]) + timedelta(days=HORIZON), date.fromisoformat(e["first"]))
        self.assertEqual(len(result["profiles"]), 54)
        for partition in ("validation", "evaluation"):
            for points in result["curves"][partition].values():
                for p in points:
                    self.assertEqual(p["captured"] + p["missed"], result["partitions"][partition]["positives"])
                    self.assertEqual(p["captured"] + p["selected_negatives"], p["budget"])
                self.assertIsNone(points[0]["precision"])

    def test_budget_choice_uses_validation_only_and_same_count_later(self):
        for p in self.decisions["profiles"]:
            curve = self.decisions["curves"]["validation"][p["policy"]]
            expected = min(curve, key=lambda x: (cost(x, p["missed_cost"], p["negative_cost"], p["review_cost"]), x["budget"]))
            self.assertEqual(p["chosen_budget"], expected["budget"])
            later = next(x for x in self.decisions["curves"]["evaluation"][p["policy"]] if x["budget"] == expected["budget"])
            self.assertEqual(p["evaluation_cost"], cost(later, p["missed_cost"], p["negative_cost"], p["review_cost"]))
        # Alter only later evaluation labels: all selected budgets must stay unchanged.
        changed = deepcopy(self.experiment)
        cutoff = self.decisions["partitions"]["evaluation"]["first"]
        for r in changed.test:
            if r["observed_at"] >= cutoff:
                r["event_date"] = None if r["event_date"] else (date.fromisoformat(r["observed_at"]) + timedelta(days=1)).isoformat()
        alternate = decisions(changed)
        self.assertEqual([p["chosen_budget"] for p in alternate["profiles"]], [p["chosen_budget"] for p in self.decisions["profiles"]])

    def test_unsupported_decision_partitions_are_not_repaired(self):
        changed = deepcopy(self.experiment)
        for row in changed.test: row["event_date"] = None
        value = decisions(changed)
        self.assertEqual(value["status"], "unavailable")
        self.assertNotIn("profiles", value)

    def test_retraining_cutoffs_and_prediction_availability(self):
        result = self.recovery
        self.assertEqual([u["day"] for u in result["updates"]], list(UPDATE_DAYS))
        for update in result["updates"]:
            self.assertEqual(update["status"], "fitted")
            self.assertLess(date.fromisoformat(update["training"]["last"]) + timedelta(days=30), date.fromisoformat(update["calibration"]["first"]))
            self.assertLess(date.fromisoformat(update["calibration"]["last"]) + timedelta(days=30), date.fromisoformat(update["at"]))
            self.assertEqual(update["calibration"]["count"], 30 * PER_DAY)
        self.assertTrue(all(r["frozen_probability"] == r["scheduled_probability"] for r in result["ledger"][:UPDATE_DAYS[0] * PER_DAY]))
        self.assertTrue(all(r["outcome"] is None for r in result["ledger"][-30 * PER_DAY:]))
        self.assertEqual(result["results"]["all_mature"]["frozen"]["count"], (DAYS - 30) * PER_DAY)
        for point in result["checkpoints"]:
            if point["frozen"]:
                self.assertEqual(point["frozen"]["count"], point["scheduled"]["count"])
                self.assertEqual(point["frozen"]["positives"], point["scheduled"]["positives"])
        self.assertEqual(result["policies"][0]["reviewed"], result["policies"][1]["reviewed"])
        self.assertEqual(result["policies"][0]["population"], result["policies"][1]["population"])

    def test_every_fitting_row_is_available_and_current_model_unchanged(self):
        before = deepcopy(self.experiment.report)
        calls = []
        def audited(training, calibration, config):
            calls.append((training, calibration))
            return fitted_model(training, calibration, config)
        with patch("signalrank.recovery.fitted_model", side_effect=audited):
            result = recovery(self.experiment, "stable", 2718)
        for update, (training, calibration) in zip(result["updates"], calls):
            cutoff = date.fromisoformat(update["at"])
            self.assertTrue(all(date.fromisoformat(r["observed_at"]) + timedelta(days=30) < cutoff for r in training + calibration))
            self.assertTrue(all(r["id"].startswith(("SYN-", "SYN-REPLAY-")) for r in training + calibration))
        self.assertEqual(before, self.experiment.report)
        self.assertEqual(result["input_sha256"], self.recovery["input_sha256"])
        self.assertEqual(result["frozen_prediction_sha256"], self.recovery["frozen_prediction_sha256"])
        # Concept labels begin arriving only after day 121; first two update datasets are identical.
        for original, changed in zip(result["updates"][:2], self.recovery["updates"][:2]):
            self.assertEqual(original["training_sha256"], changed["training_sha256"])
            self.assertEqual(original["calibration_sha256"], changed["calibration_sha256"])


class PublicProfileTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.folder = tempfile.TemporaryDirectory()
        cls.directory = train(TrainingConfig(count=1800), cls.folder.name)

    @classmethod
    def tearDownClass(cls): cls.folder.cleanup()

    def environment(self):
        return {"SIGNALRANK_PROFILE": "public", "SIGNALRANK_ALLOWED_HOSTS": "testserver", "RENDER_EXTERNAL_HOSTNAME": "", "SIGNALRANK_TRUSTED_MODEL_DIR": str(self.directory), "SIGNALRANK_TRUSTED_MODEL_DIRS": ""}

    def test_public_profile_rejects_missing_model_before_any_fitting(self):
        env = self.environment(); env["SIGNALRANK_TRUSTED_MODEL_DIR"] = ""
        with patch.dict("os.environ", env), patch("signalrank.api.Experiment", side_effect=AssertionError("No fitting")):
            with self.assertRaises(ValueError):
                with TestClient(app): pass
        experiment = load_artifact(self.directory, trusted_local=True)
        del experiment.report["diagnostics"]
        with patch.dict("os.environ", self.environment()), patch("signalrank.training.load_artifact", return_value=experiment), patch("signalrank.api.diagnostics", side_effect=AssertionError("No fallback evidence computation")):
            with self.assertRaisesRegex(ValueError, "missing required offline evidence"):
                with TestClient(app): pass

    def test_host_settings_are_explicit_and_wildcards_fail_closed(self):
        env = self.environment()
        for hosts in ("", "*", "https://demo.example", "demo.example:443", ".example/*"):
            env["SIGNALRANK_ALLOWED_HOSTS"] = hosts
            with patch.dict("os.environ", env), self.assertRaises(ValueError): Settings.load()
        env.update(SIGNALRANK_ALLOWED_HOSTS="", RENDER_EXTERNAL_HOSTNAME="signalrank-demo.onrender.com")
        with patch.dict("os.environ", env): self.assertEqual(Settings.load().hosts, ("signalrank-demo.onrender.com",))

    def test_public_profile_has_no_database_writes_official_data_or_shared_receipts(self):
        with patch.dict("os.environ", self.environment()), patch("signalrank.api.BatchStore", side_effect=AssertionError("No visitor store")), patch("signalrank.api.ExperimentStore", side_effect=AssertionError("No filesystem store")), TestClient(app) as client:
            self.assertEqual(client.get("/api/health").json()["profile"], "public")
            self.assertIsInstance(app.state.history, MemorySnapshotStore)
            for route in ("/api/validation", "/api/dataset/records"):
                response = client.get(route).json()
                self.assertFalse(response.get("rows", response.get("items")))
            self.assertEqual(client.get("/api/cohort").json()["selected_ids"], [])
            self.assertEqual(set(client.get("/api/sources").json()), {"synthetic"})
            scope = client.get("/api/scope").json()
            self.assertEqual([s["source"] for s in scope["source_permissions"]], ["synthetic"])
            self.assertFalse(scope["real_training_enabled"])
            self.assertNotIn("CVE-2024-", json.dumps(scope))
            self.assertEqual(client.get("/api/contracts").json()["version_conflict"]["status"], "blocked")
            self.assertEqual(client.get("/api/batches").json(), {"total": 0, "items": []})
            self.assertEqual(client.post("/api/batches", content=b"bad").status_code, 403)
            self.assertEqual(client.get("/api/inference/models").json()["items"], [])
            result = client.get("/api/recovery").json()
            self.assertEqual(len(result["runs"]), 9)
            self.assertNotIn("ledger", result["runs"][0])
            saved = client.get("/api/experiments/" + app.state.experiment_id).json()
            self.assertNotIn("ledger", saved["report"]["replay"]["runs"][0])
            self.assertEqual(saved["provenance"]["release_profile"], "public_synthetic")
            self.assertEqual(client.get("/api/storage").json(), {"status": "unavailable", "reason": "Storage inventory is local-only"})
            evidence = client.get("/api/evidence").json()
            self.assertEqual(evidence["mode"], "synthetic")
            self.assertEqual(evidence["provenance"]["release_profile"], "public_synthetic")
            self.assertNotIn("/Users/", json.dumps(evidence))
            for route in ("/docs", "/redoc", "/openapi.json"):
                self.assertEqual(client.get(route).status_code, 404)
            self.assertEqual(client.get("/", headers={"Host": "untrusted.example"}).status_code, 400)

    def test_saved_studio_is_bounded_stateless_and_complete_in_public_mode(self):
        with patch.dict("os.environ", self.environment()), patch("signalrank.studio.explain", wraps=explain), TestClient(app) as client:
            options = client.get("/api/studio/options").json()
            identifier = options["models"][0]["artifact_id"]
            response = client.get("/api/studio/predict?category=1&severity=9&model_id=" + identifier)
            self.assertEqual(response.status_code, 200)
            result = response.json()
            self.assertEqual(result["model"]["artifact_id"], identifier)
            self.assertGreater(len(result["contributions"]), 4)
            self.assertIn("script-src 'self'", response.headers["content-security-policy"])
            self.assertEqual(response.headers["x-frame-options"], "DENY")
            self.assertEqual(response.headers["referrer-policy"], "no-referrer")
            for query in ("category=9", "severity=nan", "severity=11", "model_id=../../model", "remote=notbool"):
                self.assertEqual(client.get("/api/studio/predict?" + query).status_code, 422)
            self.assertEqual(client.get("/api/studio/predict?model_id=" + "a" * 64).status_code, 409)

    def test_service_wide_rate_budget_health_bypass_and_query_bound(self):
        with patch.dict("os.environ", self.environment()), patch("signalrank.deployment.monotonic", return_value=0), TestClient(app) as client:
            responses = [client.get("/api/studio/options") for _ in range(121)]
            self.assertEqual(responses[-1].status_code, 429)
            self.assertEqual(responses[-1].headers["retry-after"], "5")
            self.assertEqual(client.get("/api/health").status_code, 200)
            self.assertEqual(client.get("/?q=" + "a" * 9000).status_code, 414)
            self.assertEqual(app.state.public_budget["active"], 0)

    def test_release_selection_cannot_escape_named_artifact_directory(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            for directory in ("../escape", "/tmp", "runs/missing", "runs/a/b"):
                (root / "selection.json").write_text(json.dumps({"directory": directory, "source": "synthetic"}))
                with self.assertRaises(ValueError): selected(root)
