from copy import deepcopy
from pathlib import Path
import json
import tempfile
import unittest
from unittest.mock import patch

import numpy as np
from fastapi.testclient import TestClient
from pydantic import ValidationError
from signalrank.api import app
from signalrank.core import Experiment, TrainingConfig, generate, split, labels, metrics
from signalrank.diagnostics import build, contributions, evaluation_records
from signalrank.benchmark import build as benchmark
from signalrank.history import snapshot
from signalrank.inference import BatchRequest, BatchStore, sample
from signalrank.training import train, load_artifact
from signalrank.uncertainty import paired, compare_snapshots


class DiagnosticsTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.experiment = Experiment()
        cls.report = build(cls.experiment)

    def test_complete_cohort_global_budget_and_slice_accounting(self):
        report = self.report
        self.assertEqual(report["population"], len(self.experiment.test))
        self.assertGreater(report["population"], 100)
        self.assertEqual(report["captured"] + report["selected_negatives"], report["budget"])
        self.assertEqual(report["captured"] + report["missed_positives"], report["positives"])
        for dimension in {row["dimension"] for row in report["slices"]}:
            rows = [row for row in report["slices"] if row["dimension"] == dimension]
            self.assertEqual(sum(row["count"] for row in rows), report["population"])
            self.assertEqual(sum(row["selected"] for row in rows), report["budget"])
            self.assertEqual(sum(row["captured"] for row in rows), report["captured"])
            for row in rows:
                self.assertEqual(row["captured"] + row["missed"], row["positives"])
                if row["metrics"]:
                    self.assertEqual(set(row["metrics"]), {"average_precision", "brier_score"})
                if row["status"] == "insufficient evidence":
                    self.assertIsNone(row["metrics"])
                    self.assertIsNone(row["global_budget_recall"])

    def test_cases_calibration_missingness_and_no_causal_outcome_feature(self):
        for row in self.report["examples"]:
            if row["kind"] == "selected negative":
                self.assertLessEqual(row["rank"], 50)
                self.assertEqual(row["outcome"], 0)
            else:
                self.assertGreater(row["rank"], 50)
                self.assertEqual(row["outcome"], 1)
        for bins in self.report["calibration"].values():
            self.assertEqual(sum(bin["count"] for bin in bins), self.report["population"])
        self.assertTrue(all(row["missing"] == 0 for row in self.report["missingness"]))
        row = self.experiment.test[0]
        self.assertEqual(contributions(self.experiment, row), contributions(self.experiment, {**row, "event_date": "2099-01-01"}))

    def test_paired_identity_reproducibility_and_unavailable_gates(self):
        records = evaluation_records(self.experiment)
        result = paired(records, records, repetitions=20)
        self.assertEqual(result, paired(records, records, repetitions=20))
        self.assertEqual(result["status"], "exploratory")
        self.assertTrue(all(row["lower"] == row["upper"] == row["delta_b_minus_a"] == 0 for row in result["metrics"]))
        changed = deepcopy(records)
        changed[0]["outcome"] ^= 1
        self.assertEqual(paired(records, changed)["status"], "unavailable")
        self.assertEqual(paired(records[:100], records[:100])["status"], "unavailable")
        only_negative = [{**row, "outcome": 0} for row in records]
        self.assertEqual(paired(only_negative, only_negative)["status"], "unavailable")
        self.assertEqual(paired(records[::2], records[::2], block_days=10)["status"], "exploratory")
        duplicate = [records[0], *records[1:-1], records[0]]
        self.assertEqual(paired(duplicate, duplicate)["status"], "unavailable")

    def test_uncertainty_rejects_old_or_mismatched_snapshots(self):
        left = snapshot(self.experiment)
        right = deepcopy(left)
        right["report"]["splits"]["test"]["last"] = "2030-01-01"
        self.assertEqual(compare_snapshots(left, right)["status"], "unavailable")
        old = deepcopy(left)
        del old["evaluation_records"]
        self.assertEqual(compare_snapshots(left, old)["status"], "unavailable")

    def test_fixed_benchmark_partitions_params_and_metrics(self):
        config = TrainingConfig()
        training, calibration, testing = split(generate())
        report = benchmark(training, calibration, testing, config)
        self.assertEqual(len(report["items"]), 3)
        self.assertEqual(report["items"][0]["features"], report["items"][1]["features"])
        self.assertFalse(report["items"][1]["parameters"]["early_stopping"])
        self.assertEqual(report["contrast"]["status"], "exploratory")
        for item in report["items"]:
            self.assertEqual(item["inference_records"], len(testing))
            self.assertGreaterEqual(item["fit_seconds"], 0)
            self.assertTrue(0 <= item["calibrated"]["brier_score"] <= 1)
        expected = metrics(labels(testing), np.full(len(testing), labels(training).mean()))
        self.assertEqual(report["training_prevalence"], expected)


class InferenceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.directory = tempfile.TemporaryDirectory()
        cls.path = train(TrainingConfig(), cls.directory.name)
        cls.experiment = load_artifact(cls.path, trusted_local=True)
        cls.manifest = json.loads((cls.path / "manifest.json").read_text())

    @classmethod
    def tearDownClass(cls):
        cls.directory.cleanup()

    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.env = {"SIGNALRANK_TRUSTED_MODEL_DIR": str(self.path), "SIGNALRANK_TRUSTED_MODEL_DIRS": "",
                    "SIGNALRANK_HISTORY_PATH": str(Path(self.temp.name) / "history.sqlite3"),
                    "SIGNALRANK_BATCH_PATH": str(Path(self.temp.name) / "batches.sqlite3")}
        self.body = {"source": "synthetic", "model_id": self.manifest["artifact_id"], "records": sample(count=20)}

    def test_strict_schema_rejects_labels_external_content_bad_types_and_duplicates(self):
        for change in [{"event_date": None}, {"description": "Copied public description"}, {"id": "CVE-2024-1"},
                       {"severity": float("nan")}, {"severity": "5"}, {"remote": 1}, {"authentication_required": "false"}]:
            invalid = deepcopy(self.body)
            invalid["records"][0].update(change)
            with self.assertRaises(ValidationError):
                BatchRequest(**invalid)
        invalid = deepcopy(self.body)
        invalid["records"].append(invalid["records"][0])
        with self.assertRaises(ValidationError):
            BatchRequest(**invalid)
        for records in ([], sample(count=501)):
            with self.assertRaises(ValidationError):
                BatchRequest(**{**self.body, "records": records})

    def test_predictions_versioning_persistence_and_provenance_without_retraining(self):
        with patch.dict("os.environ", self.env), patch("signalrank.api.Experiment", side_effect=AssertionError("No training in server")), TestClient(app) as client:
            self.assertEqual(client.get("/api/inference/models").json()["items"][0]["artifact_id"], self.body["model_id"])
            response = client.post("/api/batches", json=self.body)
            self.assertEqual(response.status_code, 201, response.text)
            receipt = response.json()
            expected = self.experiment.predict(self.body["records"])
            actual = {row["id"]: row["probability"] for row in receipt["items"]}
            np.testing.assert_allclose([actual[row["id"]] for row in self.body["records"]], expected, atol=0, rtol=0)
            self.assertEqual(receipt, client.get("/api/batches/" + receipt["id"]).json())
            self.assertEqual(receipt["input_order"], [row["id"] for row in self.body["records"]])
            self.assertEqual(receipt["model"]["artifact_id"], self.body["model_id"])
            self.assertEqual(len(receipt["inference_code_sha256"]), 64)
            another = client.post("/api/batches", json=self.body).json()
            self.assertEqual(receipt["input_sha256"], another["input_sha256"])
            self.assertNotEqual(receipt["id"], another["id"])
            self.assertEqual(client.get("/api/batches?limit=1&offset=1").json()["total"], 2)
        with patch.dict("os.environ", self.env), TestClient(app) as client:
            self.assertEqual(client.get("/api/batches/" + receipt["id"]).json(), receipt)

    def test_unknown_model_invalid_json_cross_origin_and_oversize_do_not_save(self):
        with patch.dict("os.environ", self.env), TestClient(app) as client:
            self.assertEqual(client.post("/api/batches", json={**self.body, "model_id": "0" * 64}).status_code, 409)
            self.assertEqual(client.post("/api/batches", content="{bad", headers={"Content-Type": "application/json"}).status_code, 422)
            self.assertEqual(client.post("/api/batches", content='{"source":"synthetic","source":"real"}', headers={"Content-Type": "application/json"}).status_code, 422)
            self.assertEqual(client.post("/api/batches", json=self.body, headers={"Origin": "https://evil.example"}).status_code, 403)
            self.assertEqual(client.post("/api/batches", content="x" * (256 * 1024 + 1)).status_code, 413)
            self.assertEqual(client.get("/api/batches").json()["total"], 0)
            self.assertEqual(client.get("/api/batches/missing").status_code, 404)
            self.assertEqual(client.get("/api/report", headers={"Host": "evil.example"}).status_code, 400)

    def test_named_dataset_changes_return_conflict_without_prediction_or_receipt(self):
        body = {**self.body, "schema_version": "fictional-input-v1", "dataset_version": "api-v1"}
        with patch.dict("os.environ", self.env), TestClient(app) as client:
            first = client.post("/api/batches", json=body)
            self.assertEqual(first.status_code, 201)
            self.assertEqual(first.json()["input_contract"]["dataset_version"], "api-v1")
            changed = deepcopy(body); changed["records"][0]["severity"] = 9.99
            with patch.object(app.state.experiment, "predict", side_effect=AssertionError("Conflict must precede prediction")):
                response = client.post("/api/batches", json=changed)
            self.assertEqual(response.status_code, 409)
            self.assertIn("choose a new version", response.json()["detail"])
            self.assertEqual(client.get("/api/batches").json()["total"], 1)
            self.assertEqual(client.post("/api/batches", json={**changed, "dataset_version": "api-v2"}).status_code, 201)

    def test_missing_trusted_model_disables_inference_but_keeps_diagnostics(self):
        with patch.dict("os.environ", {**self.env, "SIGNALRANK_TRUSTED_MODEL_DIR": ""}), TestClient(app) as client:
            self.assertEqual(client.get("/api/inference/models").json()["items"], [])
            self.assertEqual(client.post("/api/batches", json=self.body).status_code, 409)
            self.assertGreater(client.get("/api/diagnostics").json()["population"], 100)
            self.assertEqual(client.get("/api/benchmark").json()["items"], [])

    def test_receipt_integrity_detects_accidental_changes(self):
        store = BatchStore(Path(self.temp.name) / "batches.sqlite3")
        receipt = store.save(BatchRequest(**self.body), self.experiment, {"artifact_id": self.body["model_id"]})
        with store.connect() as db:
            db.execute("UPDATE batches SET payload=? WHERE id=?", ('{"corrupted": true}', receipt["id"]))
        with self.assertRaises(ValueError):
            store.get(receipt["id"])

    def test_invalid_model_output_does_not_create_a_receipt(self):
        store = BatchStore(Path(self.temp.name) / "batches.sqlite3")
        with patch.object(self.experiment, "predict", return_value=np.full(20, float("nan"))), self.assertRaises(ValueError):
            store.save(BatchRequest(**self.body), self.experiment, {"artifact_id": self.body["model_id"]})
        self.assertEqual(store.list()["total"], 0)

    def test_comparison_api_full_records_and_archived_diagnostics(self):
        with patch.dict("os.environ", self.env), TestClient(app) as client:
            identifier = client.get("/api/health").json()["experiment_id"]
            self.assertEqual(client.get(f"/api/comparison?a={identifier}&b={identifier}").json()["status"], "exploratory")
            self.assertEqual(client.get("/api/comparison?a=invalid&b=invalid").status_code, 422)
            self.assertEqual(client.get(f"/api/comparison?a={'0'*64}&b={identifier}").status_code, 404)
            saved = client.get("/api/experiments/" + identifier).json()
            self.assertEqual(len(saved["evaluation_records"]), saved["report"]["splits"]["test"]["count"])
            self.assertIn("diagnostics", saved["report"])
            self.assertIn("benchmark", saved["report"])
