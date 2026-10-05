from copy import deepcopy
from hashlib import sha256
import json
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest import TestCase
from signalrank.reconstruct import EvidenceClient, reconstruct, summarize


class FakeClient:
    def __init__(self, values):
        self.values = iter(values)

    def get(self, url):
        return deepcopy(next(self.values)), {"url": url, "sha256": "0" * 64, "retrieved_at": "2026-01-01T00:00:00Z"}


class ReconstructionTests(TestCase):
    def fixtures(self):
        record = {"cveMetadata": {"cveId": "CVE-2024-0012", "state": "PUBLISHED", "datePublished": "2024-01-01T00:00:00Z"}, "containers": {"cna": {"descriptions": [{"lang": "en", "value": "test text"}]}}}
        commit = {"sha": "a" * 40, "commit": {"committer": {"date": "2024-01-01T01:00:00Z"}}}
        return record, commit

    def test_candidate_and_pinned_history_query(self):
        record, commit = self.fixtures()
        row = reconstruct("CVE-2024-0012", "b" * 40, {"released": "2025-01-01T00:00:00Z", "events": {}}, FakeClient([record, [commit], record]))
        self.assertEqual(row["state"], "candidate")
        self.assertEqual(row["label_status"], "provisional negative")
        self.assertIn("sha=" + "b" * 40, row["evidence"][1]["url"])
        self.assertNotIn("description", row["features"])

    def test_missing_history_and_rejected_records(self):
        record, _ = self.fixtures()
        row = reconstruct("CVE-2024-0012", "b" * 40, {}, FakeClient([record, []]))
        self.assertEqual(row["state"], "excluded")
        record["cveMetadata"]["state"] = "REJECTED"
        row = reconstruct("CVE-2024-0012", "b" * 40, {}, FakeClient([record]))
        self.assertFalse(row["timestamp_checks_passed"])

    def test_future_features_excluded(self):
        record, commit = self.fixtures()
        historical = deepcopy(record)
        historical["cveMetadata"]["dateUpdated"] = "2025-01-01T00:00:00Z"
        row = reconstruct("CVE-2024-0012", "b" * 40, {"released": "2025-01-01T00:00:00Z", "events": {}}, FakeClient([record, [commit], historical]))
        self.assertEqual(row["state"], "excluded")
        self.assertIn("metadata updated after cutoff", row["issues"])

    def test_cached_integrity_and_allowlist(self):
        with TemporaryDirectory() as directory:
            client = EvidenceClient(Path(directory))
            url = "https://raw.githubusercontent.com/CVEProject/cvelistV5/test.json"
            body = b'{}'
            digest = sha256(body).hexdigest()
            (Path(directory) / (digest + ".json")).write_bytes(body)
            (Path(directory) / (sha256(url.encode()).hexdigest() + ".meta.json")).write_text(json.dumps({"url": url, "sha256": digest}))
            self.assertEqual(client.get(url)[0], {})
            (Path(directory) / (digest + ".json")).write_bytes(b'changed')
            with self.assertRaisesRegex(ValueError, "integrity"):
                client.get(url)
            with self.assertRaisesRegex(ValueError, "Unapproved"):
                client.get("https://example.com")

    def test_report_never_enables_training(self):
        report = summarize([], {"revision": "a" * 40, "selected_ids": ["CVE-2024-0012"]}, "hash", "build")
        self.assertEqual(report["pending"], 1)
        self.assertFalse(report["training_enabled"])
        self.assertTrue(any("No positive" in x for x in report["blockers"]))
