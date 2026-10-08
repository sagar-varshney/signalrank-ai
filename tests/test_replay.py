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
from signalrank.core import Experiment, HORIZON, split
from signalrank.replay import replay, stream, js_distance, at_checkpoint, score, DAYS, PER_DAY, BUDGET
from signalrank.challenge import build as challenge, generate_case, SEEDS
from signalrank.training import train, load_artifact, CODE_FILES
from signalrank.reporting import markdown


class ReplayTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.experiment = Experiment()
        cls.control = replay(cls.experiment, "stable", 2718)

    def test_repeatability_frozen_input_only_predictions_and_future_start(self):
        before = deepcopy(self.experiment.report)
        seen = []
        predict = self.experiment.predict
        def audited(rows):
            seen.extend(rows)
            return predict(rows)
        with patch.object(self.experiment, "predict", side_effect=audited):
            result = replay(self.experiment, "stable", 2718)
        self.assertEqual(result, self.control)
        self.assertEqual(before, self.experiment.report)
        replay_inputs = [r for r in seen if r["id"].startswith("SYN-REPLAY")]
        self.assertEqual(len(replay_inputs), DAYS * PER_DAY)
        self.assertTrue(all("outcome" not in r and "event_date" not in r for r in replay_inputs))
        self.assertGreater(result["start"], self.experiment.report["splits"]["test"]["last"])

    def test_checkpoint_masks_future_and_all_immature_labels(self):
        run = self.control
        self.assertEqual(run["checkpoints"][0]["mature"], 0)
        self.assertIsNone(run["checkpoints"][0]["metrics"])
        self.assertEqual(run["checkpoints"][0]["closed_weeks"], 0)
        for index, point in enumerate(run["checkpoints"]):
            saved = at_checkpoint(run, index)
            self.assertEqual(len(saved["records"]), point["seen"])
            known = 0
            for row in saved["records"]:
                self.assertLessEqual(row["observed_at"], point["as_of"])
                self.assertEqual(date.fromisoformat(row["outcome_available_at"]), date.fromisoformat(row["observed_at"]) + timedelta(days=HORIZON))
                if row["outcome_available_at"] > point["as_of"]:
                    self.assertIsNone(row["outcome"])
                else:
                    self.assertIn(row["outcome"], (0, 1)); known += 1
            self.assertEqual(known, point["mature"])
            self.assertEqual(point["seen"] - known, point["pending"])
        self.assertEqual(run["checkpoints"][-1]["pending"], 30 * PER_DAY)
        self.assertTrue(all(r["outcome"] is None for r in run["ledger"][-30 * PER_DAY:]))

    def test_weekly_policies_use_same_closed_cohorts_and_no_future_selection(self):
        run = self.control
        for point in run["checkpoints"]:
            mature_weeks = point["closed_weeks"]
            policies = point["policies"]
            self.assertEqual(policies[0]["population"], policies[1]["population"])
            self.assertEqual(policies[0]["positives"], policies[1]["positives"])
            for p in policies:
                self.assertEqual(p["reviewed"], mature_weeks * BUDGET)
                self.assertEqual(p["population"], mature_weeks * 7 * PER_DAY)
                self.assertEqual(p["captured"] + p["missed"], p["positives"])
            expected = 0
            for week in range(mature_weeks):
                rows = run["ledger"][week * 84:(week + 1) * 84]
                self.assertTrue(all(r["outcome_available_at"] <= point["as_of"] for r in rows))
                ordered = sorted(rows, key=lambda r: -r["probability"])[:BUDGET]
                expected += sum(r["outcome"] for r in ordered)
            self.assertEqual(policies[0]["captured"], expected)

    def test_concept_shift_preserves_inputs_and_predictions_not_outcomes(self):
        changed = replay(self.experiment, "concept_shift", 2718)
        self.assertEqual(changed["input_sha256"], self.control["input_sha256"])
        self.assertEqual(changed["prediction_sha256"], self.control["prediction_sha256"])
        self.assertNotEqual([r["outcome"] for r in changed["ledger"]], [r["outcome"] for r in self.control["ledger"]])
        self.assertEqual([p["drift"] for p in changed["checkpoints"]], [p["drift"] for p in self.control["checkpoints"]])
        original = at_checkpoint(self.control, 7)["records"]
        altered = at_checkpoint(changed, 7)["records"]
        self.assertEqual(original, altered)

    def test_distance_properties_and_unsupported_metrics(self):
        self.assertEqual(js_distance([1, 0], [1, 0]), 0.)
        self.assertAlmostEqual(js_distance([1, 0], [0, 1]), 1.)
        self.assertEqual(js_distance([1, 3], [2, 8]), js_distance([2, 8], [1, 3]))
        with self.assertRaises(ValueError): js_distance([0, 0], [1, 1])
        self.assertIsNone(score(np.ones(100), np.full(100, .3)))
        with self.assertRaises(ValueError): stream(date(2030, 1, 1), "unknown", 1)
        for p in self.control["checkpoints"]:
            self.assertTrue(all(0 <= d["distance"] <= 1 for d in p["drift"]))
            self.assertEqual(p["drift"][0]["current_count"], 84)

    def test_saved_api_never_fits_masks_export_and_bounds_pages(self):
        with tempfile.TemporaryDirectory() as folder:
            path = train(self.experiment.config, folder)
            loaded = load_artifact(path, trusted_local=True)
            self.assertEqual(loaded.report["replay"]["runs"][0], self.control)
            manifest = json.loads((path / "manifest.json").read_text())
            self.assertEqual(set(manifest["code_sha256"]), CODE_FILES)
            env = {"SIGNALRANK_TRUSTED_MODEL_DIR": str(path), "SIGNALRANK_TRUSTED_MODEL_DIRS": "", "SIGNALRANK_HISTORY_PATH": str(Path(folder) / "history.db"), "SIGNALRANK_BATCH_PATH": str(Path(folder) / "batch.db")}
            with patch.dict("os.environ", env), patch("signalrank.api.Experiment", side_effect=AssertionError("No fitting")), patch("signalrank.challenge.build", side_effect=AssertionError("No fitting")), TestClient(app) as client:
                report = client.get("/api/replay").json()
                self.assertEqual(report["status"], "available")
                self.assertNotIn("ledger", report["runs"][0])
                early = client.get("/api/replay/checkpoint?checkpoint=0").json()
                self.assertEqual(early["total"], 84)
                self.assertEqual(len(early["records"]), 25)
                self.assertTrue(all(r["outcome"] is None for r in early["records"]))
                export = client.get("/api/replay/export?checkpoint=0")
                self.assertIn("attachment", export.headers["content-disposition"])
                self.assertTrue(all(r["outcome"] is None for r in export.json()["records"]))
                self.assertEqual(len(export.json()["records"]), 84)
                for query in ("checkpoint=-1", "checkpoint=100", "seed=99", "scenario=unknown", "limit=101", "offset=-1"):
                    self.assertIn(client.get("/api/replay/checkpoint?" + query).status_code, (404, 422))
                self.assertEqual(client.get("/api/challenge").json()["status"], "available")
                self.assertIn("Simulated-time replay", client.get("/api/export/report").text)
            env["SIGNALRANK_TRUSTED_MODEL_DIR"] = ""
            with patch.dict("os.environ", env), TestClient(app) as client:
                self.assertEqual(client.get("/api/replay").json()["status"], "unavailable")
                self.assertEqual(client.get("/api/challenge").json()["status"], "unavailable")


class ChallengeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls): cls.report = challenge()

    def test_all_cases_seeds_candidates_reported_without_winner(self):
        report = self.report
        self.assertEqual(len(report["items"]), 12)
        self.assertEqual(len(report["summary"]), 12)
        for run in report["items"]:
            self.assertEqual(run["status"], "evaluated")
            self.assertEqual([i["candidate"] for i in run["items"]], ["logistic", "trees", "prevalence"])
            self.assertIn(run["seed"], SEEDS)
            a, b, c = [run["splits"][key] for key in ("training", "calibration", "evaluation")]
            self.assertLess(date.fromisoformat(a["last"]) + timedelta(days=30), date.fromisoformat(b["first"]))
            self.assertLess(date.fromisoformat(b["last"]) + timedelta(days=30), date.fromisoformat(c["first"]))
            self.assertTrue(all(i["calibrated"]["brier_score"] <= 1 for i in run["items"]))
        self.assertNotIn("winner", report)
        json.dumps(report, allow_nan=False)

    def test_generator_preserves_measurement_outcomes_and_past_concept_rows(self):
        control = generate_case("linear", 101)
        measured, shifted = generate_case("measurement", 101), generate_case("concept", 101)
        self.assertEqual([r["event_date"] for r in control], [r["event_date"] for r in measured])
        self.assertNotEqual([r["severity"] for r in control], [r["severity"] for r in measured])
        self.assertEqual(control[:480 * 6], shifted[:480 * 6])
        self.assertEqual(control, generate_case("linear", 101))
        self.assertNotEqual(control, generate_case("linear", 202))

    def test_summary_mean_and_sd_use_every_seed(self):
        for summary in self.report["summary"]:
            scores = [i["calibrated"]["average_precision"] for r in self.report["items"] if r["case"] == summary["case"] for i in r["items"] if i["candidate"] == summary["candidate"]]
            self.assertEqual(summary["evaluated_seeds"], 3)
            self.assertEqual(summary["metrics"]["average_precision"]["mean"], float(np.mean(scores)))
            self.assertEqual(summary["metrics"]["average_precision"]["seed_sd"], float(np.std(scores, ddof=1)))
        self.assertNotIn("confidence_interval", json.dumps(self.report))
