import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from signalrank import bike_audit, bikes
from tests.test_bikes import csv_payload, fixture_rows


class ExploratoryBikeAuditTests(unittest.TestCase):
    def test_audit_reproduces_first_benchmark_and_partitions_the_global_budget(self):
        rows = fixture_rows()
        original = bikes.evaluate(rows, fixture=True)
        original["status"] = "available"
        original["report_sha256"] = "a" * 64
        original["dataset_sha256"] = "b" * 64
        audit = bike_audit.build(rows, original)
        self.assertEqual(audit["status"], "exploratory")
        self.assertEqual(audit["global_captured"], next(r for r in original["comparisons"]["final"] if r["id"] == "logistic")["captured"])
        for dimension in {row["dimension"] for row in audit["slices"]}:
            group = [row for row in audit["slices"] if row["dimension"] == dimension]
            self.assertEqual(sum(row["count"] for row in group), original["partitions"]["final"]["count"])
            self.assertEqual(sum(row["global_selected"] for row in group), audit["global_budget"])
            self.assertEqual(sum(row["global_captured"] for row in group), audit["global_captured"])
        self.assertIn("already examined", audit["warning"])

    def test_public_mode_short_circuits_before_local_reads(self):
        with patch("signalrank.bike_audit.bikes.load_report", side_effect=AssertionError("no local reads")):
            self.assertEqual(bike_audit.load(public=True)["status"], "unavailable")

    def test_saved_audit_reuses_and_corruption_fails_closed(self):
        rows = fixture_rows()
        payload = csv_payload(rows)
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            spec = {**bikes.source(), "csv_sha256": bikes.digest(payload)}
            (root/spec["csv_name"]).write_bytes(payload)
            with patch("signalrank.bikes.source", return_value=spec):
                bikes.run(root)
                first = bike_audit.run(root)
                self.assertEqual(bike_audit.load(root)["status"], "available")
                with patch("signalrank.bike_audit.build", side_effect=AssertionError("must reuse")):
                    self.assertEqual(bike_audit.run(root), first)
                envelope = json.loads(first.read_text())
                envelope["audit"]["global_captured"] += 1
                first.write_text(json.dumps(envelope))
                self.assertEqual(bike_audit.load(root)["status"], "unavailable")
                with self.assertRaisesRegex(ValueError, "Existing audit is invalid"):
                    bike_audit.run(root)
