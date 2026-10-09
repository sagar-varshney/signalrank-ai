from copy import deepcopy
from concurrent.futures import ThreadPoolExecutor
import json
from pathlib import Path
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import Mock

import numpy as np
from pydantic import ValidationError

from signalrank.contracts import DatasetEnvelope, compare, decode_json, fixture_report, inspect, read_bounded, summary
from signalrank.inference import BatchRequest, BatchStore, DatasetVersionConflict, sample


class ContractTests(unittest.TestCase):
    def setUp(self):
        self.dataset = {"source": "synthetic", "schema_version": "fictional-input-v1", "dataset_version": "v1", "records": sample(count=3)}

    def test_required_fields_types_values_and_schema_fail_closed(self):
        self.assertEqual(inspect(self.dataset)["status"], "valid")
        for field in self.dataset["records"][0]:
            data = deepcopy(self.dataset); del data["records"][0][field]
            self.assertEqual(inspect(data)["status"], "invalid", field)
        for key, value in [("severity", float("nan")), ("severity", float("inf")), ("severity", 0.), ("severity", 11.), ("severity", "5"), ("remote", 1), ("authentication_required", "false"), ("description", "External content"), ("event_date", None), ("id", "CVE-2024-0001")]:
            data = deepcopy(self.dataset); data["records"][0][key] = value
            report = inspect(data)
            self.assertEqual(report["status"], "invalid", (key, value))
            self.assertTrue(all("input" not in issue for issue in report["issues"]))
        for change in ({"schema_version": "v2"}, {"source": "real"}, {"records": []}, {"records": sample(count=501)}, {"new_field": 1}, {"dataset_version": "../v1"}):
            self.assertEqual(inspect({**self.dataset, **change})["status"], "invalid")

    def test_duplicate_ids_block_but_equal_feature_values_are_reported(self):
        row = self.dataset["records"][0]
        self.assertEqual(inspect({**self.dataset, "records": [row, row]})["status"], "invalid")
        report = inspect({**self.dataset, "records": [row, {**row, "id": "SYN-BATCH-another"}]})
        self.assertEqual(report["status"], "valid")
        self.assertEqual(report["repeated_feature_groups"], [[row["id"], "SYN-BATCH-another"]])

    def test_version_comparison_lists_membership_values_and_order(self):
        current = deepcopy(self.dataset)
        current["dataset_version"] = "v2"
        current["records"][0]["severity"] = 9.9
        current["records"].pop()
        current["records"].append({**self.dataset["records"][2], "id": "SYN-BATCH-added"})
        result = compare(self.dataset, current)
        self.assertEqual(result["status"], "compatible")
        self.assertEqual(result["added"], ["SYN-BATCH-added"])
        self.assertEqual(result["removed"], [self.dataset["records"][2]["id"]])
        self.assertEqual(result["changed"], [{"id": self.dataset["records"][0]["id"], "fields": ["severity"]}])
        self.assertTrue(result["order_changed"])
        self.assertEqual(compare(self.dataset, {**current, "dataset_version": "v1"})["status"], "blocked")
        self.assertEqual(compare(self.dataset, {**self.dataset, "schema_version": "unknown"})["status"], "blocked")

    def test_reordering_changes_identity_and_legacy_versions_are_explicit(self):
        reversed_rows = {**self.dataset, "records": self.dataset["records"][::-1]}
        self.assertEqual(compare(self.dataset, reversed_rows)["status"], "blocked")
        legacy = {**self.dataset, "dataset_version": None}
        self.assertIn("no version-identity guarantee", inspect(legacy)["versioning"])
        self.assertEqual(compare(legacy, self.dataset)["status"], "blocked")
        self.assertEqual(compare(self.dataset, deepcopy(self.dataset))["status"], "compatible")

    def test_json_rejects_duplicate_keys_nonfinite_and_oversize_files(self):
        for payload in ('{"source":"synthetic","source":"real"}', '{"records":[{"remote":true,"remote":false}]}', '{"severity":NaN}', '{"severity":Infinity}', '{"severity":1e400}', '{bad'):
            with self.assertRaises(ValueError): decode_json(payload)
        with tempfile.TemporaryDirectory() as root:
            path = Path(root) / "data.json"
            path.write_text(json.dumps(self.dataset))
            self.assertEqual(read_bounded(path), self.dataset)
            path.write_bytes(b" " * (256 * 1024 + 1))
            with self.assertRaises(ValueError): read_bounded(path)

    def test_fixture_evidence_and_schema_are_reproducible(self):
        first = fixture_report()
        self.assertEqual(first, fixture_report())
        self.assertEqual(first["checks"][0]["status"], "valid")
        self.assertTrue(all(check["status"] == "invalid" for check in first["checks"][1:]))
        self.assertEqual(first["version_conflict"]["status"], "blocked")
        self.assertEqual(first["version_change"]["status"], "compatible")
        self.assertFalse(first["schema"]["additionalProperties"])


class VersionStoreTests(unittest.TestCase):
    def setUp(self):
        self.root = tempfile.TemporaryDirectory(); self.addCleanup(self.root.cleanup)
        self.store = BatchStore(Path(self.root.name) / "batches.sqlite3")
        self.body = {"source": "synthetic", "model_id": "a" * 64, "dataset_version": "v1", "records": sample(count=3)}
        self.experiment = SimpleNamespace(report={"target": "fictional"}, predict=Mock(return_value=np.array([.1, .2, .3])))

    def test_changed_named_version_blocks_before_prediction_and_persists(self):
        first = self.store.save(BatchRequest(**self.body), self.experiment, {})
        self.assertEqual(first["input_contract"]["dataset_version"], "v1")
        changed = deepcopy(self.body); changed["records"][0]["severity"] = 9.9
        reloaded = BatchStore(self.store.path)
        with self.assertRaises(DatasetVersionConflict): reloaded.save(BatchRequest(**changed), self.experiment, {})
        self.assertEqual(self.experiment.predict.call_count, 1)
        self.assertEqual(reloaded.list()["total"], 1)
        reloaded.save(BatchRequest(**{**changed, "dataset_version": "v2"}), self.experiment, {})
        self.assertEqual(reloaded.list()["total"], 2)

    def test_same_inputs_can_use_other_model_without_rewriting_dataset(self):
        self.store.save(BatchRequest(**self.body), self.experiment, {})
        self.store.save(BatchRequest(**{**self.body, "model_id": "b" * 64}), self.experiment, {})
        self.assertEqual(self.store.list()["total"], 2)

    def test_invalid_predictions_reserve_no_version_or_receipt(self):
        self.experiment.predict.return_value = np.array([float("nan"), .2, .3])
        with self.assertRaises(ValueError): self.store.save(BatchRequest(**self.body), self.experiment, {})
        with self.store.connect() as db:
            self.assertEqual(db.execute("SELECT COUNT(*) FROM dataset_versions").fetchone()[0], 0)
        self.assertEqual(self.store.list()["total"], 0)

    def test_python_constructed_models_cannot_bypass_contract(self):
        request = BatchRequest(**self.body)
        request.records[0].severity = 999.
        with self.assertRaises(ValidationError): self.store.save(request, self.experiment, {})
        self.experiment.predict.assert_not_called()

    def test_concurrent_conflicting_versions_only_predict_once(self):
        changed = deepcopy(self.body); changed["records"][0]["severity"] = 9.9
        def submit(body):
            try:
                self.store.save(BatchRequest(**body), self.experiment, {})
                return "saved"
            except DatasetVersionConflict:
                return "blocked"
        with ThreadPoolExecutor(max_workers=2) as pool:
            results = list(pool.map(submit, [self.body, changed]))
        self.assertEqual(sorted(results), ["blocked", "saved"])
        self.assertEqual(self.experiment.predict.call_count, 1)
        self.assertEqual(self.store.list()["total"], 1)

    def test_legacy_unversioned_clients_still_work_and_receipts_remain_readable(self):
        receipt = self.store.save(BatchRequest(**{**self.body, "dataset_version": None}), self.experiment, {})
        self.assertIn("unversioned", receipt["input_contract"]["versioning"])
        self.assertEqual(receipt, self.store.get(receipt["id"]))
