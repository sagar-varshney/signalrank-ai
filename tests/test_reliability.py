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
from signalrank.core import Experiment, HORIZON, TrainingConfig, fitted_model, labels, metrics
from signalrank.demo import prepare
from signalrank.history import snapshot
from signalrank.reliability import build, importance, learning_curves, scenario_rows, stress, SEED, REPEATS
from signalrank.reporting import markdown
from signalrank.training import train, load_artifact, CODE_FILES


class ReliabilityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.experiment = Experiment()
        cls.result = build(cls.experiment)

    def test_control_reproducibility_metrics_support_and_no_mutation(self):
        before = deepcopy(self.experiment.test)
        result = stress(self.experiment)
        self.assertEqual(result, stress(self.experiment))
        self.assertEqual(result, self.result["stress"])
        self.assertEqual(before, self.experiment.test)
        control = result["items"][0]
        self.assertEqual(control["calibrated"], self.experiment.report["model"])
        self.assertTrue(all(value == 0 for value in control["delta_from_control"].values()))
        for item in result["items"]:
            support = item["support"]
            self.assertEqual(support["count"], len(before))
            self.assertEqual(sum(support["categories"].values()), len(before))
            self.assertEqual(sum(bin["count"] for bin in item["calibration_bins"]), len(before))
            self.assertTrue(0 <= item["calibrated"]["brier_score"] <= 1)
            self.assertEqual(len(support["records_sha256"]), 64)
            if item["kind"] == "composition":
                self.assertLess(support["unique_records"], support["count"])

    def test_measurement_noise_retains_labels_and_metadata_and_bounds(self):
        original = self.experiment.test
        for name in ("severity_noise", "flag_noise"):
            changed = scenario_rows(original, name)
            np.testing.assert_array_equal(labels(original), labels(changed))
            self.assertNotEqual(original, changed)
            for left, right in zip(original, changed):
                for key in ("id", "description", "published", "observed_at", "event_date"):
                    self.assertEqual(left[key], right[key])
                self.assertTrue(1 <= right["severity"] <= 10)
                self.assertIn(right["remote"], (0, 1))
                self.assertIn(right["authentication_required"], (0, 1))
        with self.assertRaises(ValueError):
            scenario_rows(original, "arbitrary-input")

    def test_composition_resamples_only_original_whole_records(self):
        original = {row["id"]: row for row in self.experiment.test}
        for name in ("category_mix", "severity_mix"):
            for row in scenario_rows(self.experiment.test, name):
                self.assertEqual(row, original[row["id"]])

    def test_importance_fixed_shuffles_and_signed_metric_definitions(self):
        result = importance(self.experiment)
        self.assertEqual(result, importance(self.experiment))
        self.assertEqual(len(result["items"]), 4)
        rows = self.experiment.test
        rng = np.random.default_rng(SEED)
        ap, brier = [], []
        for _ in range(REPEATS):
            shuffled = deepcopy(rows)
            for row, source in zip(shuffled, rng.permutation(len(rows))):
                row["description"] = rows[int(source)]["description"]
            measured = metrics(labels(rows), self.experiment.predict(shuffled))
            ap.append(result["baseline"]["average_precision"] - measured["average_precision"])
            brier.append(measured["brier_score"] - result["baseline"]["brier_score"])
        self.assertEqual(result["items"][0]["average_precision_drop"], float(np.mean(ap)))
        self.assertEqual(result["items"][0]["brier_increase"], float(np.mean(brier)))
        self.assertEqual(result["items"][0]["average_precision_drop_sd"], float(np.std(ap, ddof=1)))
        self.assertNotIn("confidence_interval", result["items"][0])

    def test_learning_curves_same_day_purge_fixed_windows_and_refits(self):
        calls = []
        def fit(training, calibration, config):
            calls.append((deepcopy(training), deepcopy(calibration)))
            return fitted_model(training, calibration, config)
        with patch("signalrank.reliability.fitted_model", side_effect=fit):
            result = learning_curves(TrainingConfig())
        self.assertEqual(len(calls), 12)
        self.assertEqual(result, self.result["learning_curves"])
        for fold in result["folds"]:
            local_calls = calls[(fold["fold"] - 1) * 4:fold["fold"] * 4]
            previous = set()
            for point, (training, calibration) in zip(fold["points"], local_calls):
                ids = {row["id"] for row in training}
                self.assertTrue(previous <= ids)
                previous = ids
                self.assertEqual(len(training) % 3, 0)
                self.assertEqual(calibration, local_calls[0][1])
                last = date.fromisoformat(training[-1]["observed_at"])
                self.assertLess(last + timedelta(days=HORIZON), date.fromisoformat(calibration[0]["observed_at"]))
                last_cal = date.fromisoformat(calibration[-1]["observed_at"])
                self.assertLess(last_cal + timedelta(days=HORIZON), date.fromisoformat(fold["evaluation_first"]))
                self.assertEqual(point["train_count"], len(training))

    def test_missing_classes_and_empty_support_fail_closed(self):
        modified = deepcopy(self.experiment)
        modified.test = [{**row, "event_date": None} for row in modified.test]
        self.assertEqual(importance(modified)["status"], "unavailable")
        self.assertTrue(all(item["status"] == "unavailable" and "calibrated" not in item for item in stress(modified)["items"]))
        modified.test = []
        self.assertTrue(all(item["status"] == "unavailable" for item in stress(modified)["items"]))
        with patch("signalrank.reliability.partitions", return_value=iter([([], [], [])])), patch("signalrank.reliability.fitted_model", side_effect=AssertionError("must not fit")):
            result = learning_curves(TrainingConfig())
        self.assertTrue(all(point["status"] == "unavailable" for point in result["folds"][0]["points"]))

    def test_exports_preserve_scope_and_missing_evidence(self):
        report = {**self.experiment.report, "reliability": self.result}
        text = markdown(report, {"snapshot_id": "a" * 64})
        for phrase in ("synthetic experiment report", "Global permutation importance", "Temporal learning curves", "Robustness scenarios", "not sampling uncertainty", "a" * 64):
            self.assertIn(phrase, text)
        self.assertIn("Reliability probes unavailable", markdown(self.experiment.report, {}))
        saved = snapshot(type("ReportView", (), {"report": report, "test": self.experiment.test, "probabilities": self.experiment.probabilities, "forecasts": self.experiment.forecasts})())
        self.assertEqual(saved["provenance"]["reliability_protocol"], self.result["protocol"])
        json.dumps(self.result, allow_nan=False)

    def test_saved_api_probes_and_export_never_fit_on_request(self):
        with tempfile.TemporaryDirectory() as directory:
            path = train(TrainingConfig(), directory)
            saved = load_artifact(path, trusted_local=True)
            self.assertEqual(saved.report["reliability"], self.result)
            self.assertTrue((path / "experiment-report.md").is_file())
            manifest = json.loads((path / "manifest.json").read_text())
            self.assertEqual(set(manifest["code_sha256"]), CODE_FILES)
            env = {"SIGNALRANK_TRUSTED_MODEL_DIR": str(path), "SIGNALRANK_TRUSTED_MODEL_DIRS": "", "SIGNALRANK_HISTORY_PATH": str(Path(directory) / "history.sqlite3"), "SIGNALRANK_BATCH_PATH": str(Path(directory) / "batches.sqlite3")}
            with patch.dict("os.environ", env), patch("signalrank.reliability.fitted_model", side_effect=AssertionError("must not fit")), patch("signalrank.api.Experiment", side_effect=AssertionError("must not train")), TestClient(app) as client:
                response = client.get("/api/reliability")
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.json()["stress"], self.result["stress"])
                self.assertEqual(response.json()["status"], "available")
                exported = client.get("/api/export/report")
                self.assertIn("text/markdown", exported.headers["content-type"])
                self.assertIn("attachment", exported.headers["content-disposition"])
                self.assertIn(response.json()["snapshot_id"], exported.text)
            env["SIGNALRANK_TRUSTED_MODEL_DIR"] = ""
            with patch.dict("os.environ", env), TestClient(app) as client:
                self.assertEqual(client.get("/api/reliability").json()["status"], "unavailable")
                self.assertIn("Reliability probes unavailable", client.get("/api/export/report").text)

    def test_demo_scopes_model_and_storage_to_explicit_new_run(self):
        with tempfile.TemporaryDirectory() as directory, patch.dict("os.environ", {"SIGNALRANK_TRUSTED_MODEL_DIRS": "unrelated-model"}), patch("signalrank.demo.train", return_value=Path(directory) / "runs/new") as training:
            result = prepare(TrainingConfig(), directory)
            import os
            self.assertEqual(os.environ["SIGNALRANK_TRUSTED_MODEL_DIR"], str(result))
            self.assertEqual(os.environ["SIGNALRANK_TRUSTED_MODEL_DIRS"], "")
            self.assertEqual(os.environ["SIGNALRANK_HISTORY_PATH"], str(Path(directory).resolve() / "experiments.sqlite3"))
            training.assert_called_once_with(TrainingConfig(), Path(directory).resolve())


if __name__ == "__main__":
    unittest.main()
