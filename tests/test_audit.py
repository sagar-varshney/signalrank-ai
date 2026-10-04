from datetime import timedelta
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest import TestCase
from unittest.mock import patch
from signalrank import audit


class AuditTests(TestCase):
    def test_identifier_paths(self):
        self.assertEqual(audit.cve_path("CVE-2024-0012"), "cves/2024/0xxx/CVE-2024-0012.json")
        self.assertEqual(audit.cve_path("CVE-2024-11667"), "cves/2024/11xxx/CVE-2024-11667.json")

    def test_cutoff_and_unpublished_exclusion(self):
        record = {"cveMetadata": {"state": "PUBLISHED", "datePublished": "2024-01-01T12:00:00Z"}}
        published, cutoff, lag = audit.assess(record, "2024-01-05")
        self.assertEqual(cutoff - published, timedelta(days=1))
        self.assertEqual(lag, 4)
        record["cveMetadata"]["state"] = "REJECTED"
        with self.assertRaises(ValueError):
            audit.assess(record, None)

    def test_changed_license_blocks_audit(self):
        with TemporaryDirectory() as directory:
            evidence = Path(directory) / "evidence"
            evidence.mkdir()
            (evidence / "cve-terms.vue").write_text("changed")
            with patch.object(audit, "ROOT", Path(directory)):
                with self.assertRaisesRegex(ValueError, "Changed license evidence"):
                    audit.verify_evidence()

    def test_unapproved_download_blocked_before_network(self):
        with self.assertRaisesRegex(ValueError, "Unapproved"):
            audit.fetch("https://example.com/exploit", [])
