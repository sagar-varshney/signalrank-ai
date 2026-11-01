import copy
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient
from signalrank.api import app
from signalrank.core import Experiment
from signalrank.diagnostics import build as diagnostics
from signalrank.evidence import build, markdown


class EvidenceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        experiment = Experiment()
        experiment.report["diagnostics"] = diagnostics(experiment)
        cls.report = experiment.report

    def test_summary_keeps_baseline_direction_support_and_source_report_unchanged(self):
        before = copy.deepcopy(self.report)
        result = build(self.report, {"snapshot_id": "a" * 64})
        self.assertEqual(self.report, before)
        self.assertEqual(result["support"]["count"], self.report["splits"]["test"]["count"])
        self.assertEqual(result["support"]["captured"] + result["support"]["missed"], result["support"]["positives"])
        self.assertAlmostEqual(result["average_precision_delta_vs_severity"], self.report["model"]["average_precision"] - self.report["severity_baseline"]["average_precision"])
        self.assertNotIn("brier_score", result["comparisons"][1])
        self.assertTrue(all(row["metrics"] and row["status"] == "descriptive" for row in result["lowest_ap_slices"]))
        self.assertIn("Unavailable", markdown(result))
        self.assertIn("a" * 64, markdown(result))
        result["comparisons"][0]["average_precision"] = -1
        self.assertEqual(self.report, before)

    def test_old_report_has_explicit_missing_support_and_no_invented_windows(self):
        report = {key: value for key, value in self.report.items() if key != "diagnostics"}
        result = build(report)
        self.assertIsNone(result["support"]["count"])
        self.assertEqual(result["temporal_windows"], 0)
        self.assertEqual(result["lowest_ap_slices"], [])

    def test_api_summary_and_export_do_not_fit_and_storage_has_no_mutation_route(self):
        with tempfile.TemporaryDirectory() as folder:
            env = {"SIGNALRANK_TRUSTED_MODEL_DIR": "", "SIGNALRANK_TRUSTED_MODEL_DIRS": "", "SIGNALRANK_PROFILE": "local",
                   "SIGNALRANK_DATA_HOME": str(Path(folder).resolve()),
                   "SIGNALRANK_HISTORY_PATH": str(Path(folder) / "history.sqlite3"), "SIGNALRANK_BATCH_PATH": str(Path(folder) / "batches.sqlite3")}
            with patch.dict("os.environ", env), TestClient(app) as client, patch("signalrank.api.Experiment", side_effect=AssertionError("must not fit")):
                report = client.get("/api/evidence").json()
                self.assertEqual(report["mode"], "synthetic")
                self.assertEqual(len(report["comparisons"]), 5)
                export = client.get("/api/export/evidence")
                self.assertEqual(export.status_code, 200)
                self.assertIn("text/markdown", export.headers["content-type"])
                self.assertIn(report["provenance"]["snapshot_id"], export.text)
                storage = client.get("/api/storage").json()
                self.assertEqual(storage["status"], "available")
                self.assertNotIn("plan", storage)
                self.assertFalse((Path(folder) / "demo").exists())
                self.assertEqual(client.post("/api/storage").status_code, 405)
