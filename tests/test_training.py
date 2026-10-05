from datetime import date, timedelta
from pathlib import Path
import json
import tempfile
import unittest
from unittest.mock import patch

import numpy as np
from fastapi.testclient import TestClient
from signalrank.api import app
from signalrank.core import Experiment, TrainingConfig, generate, HORIZON
from signalrank.temporal import evaluate, partitions
from signalrank.training import train, load_artifact


class TrainingTests(unittest.TestCase):
    def test_config_rejects_real_data_and_invalid_values(self):
        for kwargs in [{"source": "cve"}, {"seed": True}, {"seed": -1}, {"count": 12},
                       {"count": 40000}, {"regularization_c": float("nan")}, {"regularization_c": 0}]:
            with self.assertRaises(ValueError):
                TrainingConfig(**kwargs)

    def test_temporal_purge_maturity_and_no_duplicate_test_rows(self):
        rows = generate()
        seen = set()
        for train_rows, calibration, test in partitions(rows):
            for left, right in [(train_rows, calibration), (calibration, test)]:
                self.assertLess(date.fromisoformat(left[-1]["observed_at"]) + timedelta(days=HORIZON), date.fromisoformat(right[0]["observed_at"]))
            ids = {row["id"] for row in test}
            self.assertFalse(ids & seen)
            seen |= ids
            self.assertLessEqual(date.fromisoformat(test[-1]["observed_at"]) + timedelta(days=HORIZON), date.fromisoformat(rows[-1]["observed_at"]))

    def test_temporal_metrics_and_budget_accounting(self):
        result = evaluate(TrainingConfig())
        self.assertEqual(len(result["folds"]), 3)
        for fold in result["folds"]:
            self.assertEqual(fold["status"], "evaluated")
            self.assertEqual(sum(b["count"] for b in fold["calibration_bins"]), fold["splits"]["test"]["count"])
            self.assertEqual(len(fold["precision_recall"]["precision"]), len(fold["precision_recall"]["thresholds"]) + 1)
            for budget in fold["budgets"]:
                for strategy in ("model", "severity"):
                    self.assertLessEqual(budget[strategy]["captured"], budget["budget"])
                    self.assertTrue(0 <= budget[strategy]["recall"] <= 1)

    def test_missing_classes_fail_closed(self):
        rows = [{**row, "event_date": None} for row in generate()]
        with patch("signalrank.temporal.generate", return_value=rows):
            result = evaluate(TrainingConfig())
        self.assertTrue(all(f["status"] == "not evaluable" and "model" not in f for f in result["folds"]))

    def test_saved_predictions_and_api_do_not_retrain(self):
        with tempfile.TemporaryDirectory() as directory:
            config = TrainingConfig(seed=7, regularization_c=.5)
            path = train(config, directory)
            with self.assertRaises(ValueError):
                load_artifact(path)
            saved = load_artifact(path, trusted_local=True)
            with patch("signalrank.training.runtime", return_value={"python": "incompatible"}), patch("signalrank.training.joblib.load", side_effect=AssertionError("must not deserialize")), self.assertRaises(ValueError):
                load_artifact(path, trusted_local=True)
            np.testing.assert_allclose(saved.probabilities, Experiment(config).probabilities, rtol=0, atol=0)
            np.testing.assert_allclose(saved.predict(saved.test), saved.probabilities, rtol=0, atol=0)
            with patch.dict("os.environ", {"SIGNALRANK_TRUSTED_MODEL_DIR": str(path), "SIGNALRANK_HISTORY_PATH": str(Path(directory) / "experiments.sqlite3")}), patch("signalrank.api.Experiment", side_effect=AssertionError("must not train")), TestClient(app) as client:
                self.assertEqual(len(client.get("/api/temporal").json()["folds"]), 3)
                self.assertEqual(client.get("/api/report").json()["seed"], 7)
            (path / "model.joblib").write_bytes(b"corrupted")
            with patch("signalrank.training.joblib.load", side_effect=AssertionError("must not deserialize")), self.assertRaises(ValueError):
                load_artifact(path, trusted_local=True)

    def test_failure_is_recorded(self):
        with tempfile.TemporaryDirectory() as directory:
            with patch("signalrank.training.Experiment", side_effect=ValueError("training failed")), self.assertRaises(ValueError):
                train(TrainingConfig(), directory)
            run = json.loads(next((Path(directory) / "runs").glob("*/run.json")).read_text())
            self.assertEqual(run["status"], "failed")
            self.assertIn("finished_at", run)

    def test_each_execution_has_its_own_run_and_default_api_has_no_temporal_fit(self):
        with tempfile.TemporaryDirectory() as directory:
            first = train(TrainingConfig(), directory)
            second = train(TrainingConfig(), directory)
            self.assertNotEqual(first.name, second.name)
            self.assertEqual(json.loads((first / "run.json").read_text())["status"], "completed")
            with patch.dict("os.environ", {"SIGNALRANK_TRUSTED_MODEL_DIR": "", "SIGNALRANK_HISTORY_PATH": str(Path(directory) / "experiments.sqlite3")}), TestClient(app) as client:
                self.assertEqual(client.get("/api/temporal").json()["folds"], [])
