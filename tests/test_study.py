from copy import deepcopy
from datetime import datetime, timedelta
from hashlib import sha256
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
from urllib.parse import urlencode

from signalrank.study import audit, Reader, MAX_BYTES


def write(root, name, value):
    path = root / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, sort_keys=True))
    return path


def fixture(root):
    revision, old_revision = "a" * 40, "b" * 40
    identifier, path = "CVE-2024-0042", "cves/2024/0xxx/CVE-2024-0042.json"
    published, cutoff = "2024-01-01T00:00:00+00:00", "2024-01-02T00:00:00+00:00"
    record = {"cveMetadata": {"cveId": identifier, "state": "PUBLISHED", "datePublished": published, "dateUpdated": published},
              "containers": {"cna": {"descriptions": [{"lang": "en", "value": "Original fixture"}], "metrics": [], "problemTypes": []}}}
    references = []
    query = urlencode({"path": path, "sha": revision, "until": cutoff, "per_page": 1})
    urls = ["https://raw.githubusercontent.com/CVEProject/cvelistV5/" + r + "/" + path for r in (revision, old_revision)]
    urls.append("https://api.github.com/repos/CVEProject/cvelistV5/commits?" + query)
    values = [record, record, [{"sha": old_revision, "commit": {"committer": {"date": published}}}]]
    for url, value in zip(urls, values):
        payload = json.dumps(value, sort_keys=True).encode()
        digest = sha256(payload).hexdigest()
        target = root / "data/raw/reconstruction" / (digest + ".json")
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(payload)
        meta = {"url": url, "sha256": digest, "retrieved_at": "2026-01-01T00:00:00+00:00"}
        write(root, "data/raw/reconstruction/" + sha256(url.encode()).hexdigest() + ".meta.json", meta)
        references.append(meta)
    catalog_path = write(root, "data/raw/kev.json", {"dateReleased": "2024-03-01T00:00:00+00:00", "vulnerabilities": []})
    catalog_hash = sha256(catalog_path.read_bytes()).hexdigest()
    sources = {}
    for source, filename in (("cve", "cve-terms.vue"), ("cisa_kev", "kev-license.txt")):
        notice = root / "evidence" / filename
        notice.parent.mkdir(parents=True, exist_ok=True)
        notice.write_text("Original notice fixture")
        sources[source] = {"status": "approved", "permissions": {"local_audit": "allowed", "train": "pending"}, "license_snapshot_sha256": sha256(notice.read_bytes()).hexdigest()}
    write(root, "signalrank/sources.json", sources)
    write(root, "signalrank/cohort.json", {"revision": revision, "selected_ids": [identifier]})
    row = {"id": identifier, "state": "candidate", "label_status": "provisional negative", "evidence": references,
           "published_at": published, "forecast_at": cutoff, "maturity_at": "2024-02-01T00:00:00+00:00", "commit_at": published,
           "historical_revision": old_revision, "timestamp_checks_passed": True,
           "features": {"english_text_characters": 16, "has_metrics": False, "has_weaknesses": False, "container": "historical CNA only"}}
    write(root, "signalrank/readiness.json", {"selected": 1, "processed": 1, "pending": 0, "cohort_revision": revision,
          "catalog_sha256": catalog_hash, "states": {"candidate": 1}, "candidate_labels": {"provisional negative": 1}, "rows": [row]})
    write(root, "signalrank/feasibility.json", {"catalog_sha256": catalog_hash, "catalog_released": "2024-03-01T00:00:00+00:00"})
    return row


class StudyTests(unittest.TestCase):
    def test_valid_archive_replays_checks_but_does_not_promote_provisional_outcomes(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            fixture(root)
            before = {str(p): p.read_bytes() for p in root.rglob("*") if p.is_file()}
            with patch("urllib.request.urlopen", side_effect=AssertionError("no network")), patch("subprocess.run", side_effect=AssertionError("no subprocess")), patch("joblib.load", side_effect=AssertionError("no model loading")):
                result = audit(root)
            gates = {g["id"]: g for g in result["gates"]}
            self.assertEqual(gates["archive"]["status"], "verified")
            self.assertEqual(gates["accounting"]["status"], "verified")
            self.assertEqual(gates["replay"]["status"], "verified")
            self.assertEqual(gates["classes"]["status"], "blocked")
            self.assertEqual(gates["availability"]["status"], "unresolved")
            self.assertEqual(result["cohort"]["replayed_candidates"], 1)
            self.assertEqual(result["cohort"]["missing_metrics"], 1)
            self.assertEqual(result["read_budget"]["network_requests"], 0)
            self.assertEqual(result["read_budget"]["bytes_written"], 0)
            self.assertFalse(result["training_enabled"])
            self.assertFalse(result["acquisition_enabled"])
            self.assertEqual(before, {str(p): p.read_bytes() for p in root.rglob("*") if p.is_file()})

    def test_corruption_or_missing_payload_blocks_archive_and_replay(self):
        for kind in ("corrupt", "missing"):
            with self.subTest(kind=kind), tempfile.TemporaryDirectory() as folder:
                root = Path(folder)
                row = fixture(root)
                payload = root / "data/raw/reconstruction" / (row["evidence"][0]["sha256"] + ".json")
                payload.write_text("changed") if kind == "corrupt" else payload.unlink()
                result = audit(root)
                self.assertEqual(result["cohort"]["candidates"], 1)
                self.assertEqual(result["cohort"]["replayed_candidates"], 0)
                self.assertGreater(result["issue_count"], 0)
                self.assertEqual(next(g for g in result["gates"] if g["id"] == "archive")["status"], "unresolved")

    def test_duplicate_membership_or_revised_feature_summary_is_not_verified(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            fixture(root)
            path = root / "signalrank/readiness.json"
            value = json.loads(path.read_text())
            value["rows"][0]["features"]["has_metrics"] = True
            path.write_text(json.dumps(value))
            self.assertEqual(audit(root)["cohort"]["replayed_candidates"], 0)
            value["rows"].append(deepcopy(value["rows"][0]))
            path.write_text(json.dumps(value))
            self.assertEqual(next(g for g in audit(root)["gates"] if g["id"] == "accounting")["status"], "unresolved")

    def test_budget_or_missing_manifests_remain_unavailable_and_read_only(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            fixture(root)
            result = audit(root, max_bytes=10)
            self.assertLessEqual(result["read_budget"]["bytes_read"], 10)
            self.assertTrue(result["read_budget"]["exhausted"])
            self.assertFalse(result["cohort"]["available"])
            self.assertEqual(next(g for g in result["gates"] if g["id"] == "classes")["status"], "unresolved")
            (root / "signalrank/readiness.json").unlink()
            self.assertFalse(audit(root)["cohort"]["available"])
        for invalid in (0, True, MAX_BYTES + 1):
            with self.assertRaises(ValueError): audit(max_bytes=invalid)

    def test_source_flags_and_claimed_readiness_cannot_enable_training(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            fixture(root)
            source_path = root / "signalrank/sources.json"
            value = json.loads(source_path.read_text())
            for source in value.values(): source["permissions"]["train"] = "allowed"
            source_path.write_text(json.dumps(value))
            result = audit(root)
            self.assertTrue(all(r["train"] == "blocked" for r in result["source_permissions"]))
            self.assertFalse(result["training_enabled"])

    def test_public_profile_does_not_read_local_archives(self):
        with patch("signalrank.study.Reader", side_effect=AssertionError("no filesystem access")):
            self.assertEqual(audit("/private/local", public=True), {"status": "unavailable", "reason": "Archived real-data feasibility is local-only", "training_enabled": False})

    def test_reader_does_not_follow_symlinks_or_escape_root(self):
        with tempfile.TemporaryDirectory() as folder, tempfile.TemporaryDirectory() as other:
            root = Path(folder)
            external = Path(other) / "secret"
            external.write_text("private")
            (root / "link").symlink_to(external)
            reader = Reader(root, 100)
            self.assertIsNone(reader.read("link"))
            self.assertIsNone(reader.read("../secret"))
            self.assertEqual(reader.bytes_read, 0)


    def test_api_is_read_only_and_does_not_accept_an_archive_path(self):
        from fastapi.testclient import TestClient
        from signalrank.api import app
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            fixture(root)
            env = {"SIGNALRANK_PROFILE": "local", "SIGNALRANK_TRUSTED_MODEL_DIR": "", "SIGNALRANK_TRUSTED_MODEL_DIRS": "",
                   "SIGNALRANK_HISTORY_PATH": str(root / "history.sqlite3"), "SIGNALRANK_BATCH_PATH": str(root / "batches.sqlite3")}
            with patch.dict("os.environ", env), TestClient(app) as client, patch("signalrank.api.Experiment", side_effect=AssertionError("must not fit")), patch("signalrank.api.study_audit", side_effect=lambda **kwargs: audit(root, **kwargs)) as check:
                response = client.get("/api/study-readiness?root=/other")
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.json()["status"], "blocked")
                check.assert_called_once_with(public=False)
                self.assertEqual(client.post("/api/study-readiness").status_code, 405)
