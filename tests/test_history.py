from copy import deepcopy
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient
from signalrank.api import app
from signalrank.core import Experiment
from signalrank.history import ExperimentStore, snapshot


class HistoryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.payload = snapshot(Experiment())

    def test_deduplicates_and_survives_reopening(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "runs.sqlite3"
            store = ExperimentStore(path)
            identifier = store.save(self.payload)
            first = store.get(identifier)
            self.assertEqual(store.save(self.payload), identifier)
            reopened = ExperimentStore(path)
            self.assertEqual(reopened.get(identifier), first)
            self.assertEqual(reopened.list()["total"], 1)
            self.assertEqual(first["forecasts"], self.payload["forecasts"])
            self.assertNotIn("forecasts", reopened.list()["items"][0])
            self.assertIsNone(store.get("' OR 1=1 --"))

    def test_changes_create_distinct_versions_without_overwriting(self):
        with tempfile.TemporaryDirectory() as directory:
            store = ExperimentStore(Path(directory) / "runs.sqlite3")
            original = store.save(self.payload)
            changed = deepcopy(self.payload)
            changed["provenance"]["core_sha256"] = "changed"
            other = store.save(changed)
            self.assertNotEqual(original, other)
            self.assertEqual(store.list(limit=1)["total"], 2)
            self.assertEqual(len(store.list(limit=1, offset=1)["items"]), 1)
            self.assertEqual(store.list(offset=2)["items"], [])
            self.assertEqual(store.get(original)["provenance"], self.payload["provenance"])

    def test_concurrent_duplicate_writes(self):
        with tempfile.TemporaryDirectory() as directory:
            store = ExperimentStore(Path(directory) / "runs.sqlite3")
            with ThreadPoolExecutor(max_workers=4) as pool:
                identifiers = list(pool.map(store.save, [self.payload] * 8))
            self.assertEqual(len(set(identifiers)), 1)
            self.assertEqual(store.list()["total"], 1)

    def test_search_matches_identifiers_and_fingerprints_literally(self):
        with tempfile.TemporaryDirectory() as directory:
            store = ExperimentStore(Path(directory) / "runs.sqlite3")
            identifier = store.save(self.payload)
            self.assertEqual(store.list(search=identifier[:16])["total"], 1)
            self.assertEqual(store.list(search=self.payload["report"]["dataset_sha256"][:16].upper())["total"], 1)
            for search in ("missing", "' OR 1=1 --", "%"):
                self.assertEqual(store.list(search=search)["total"], 0)

    def test_api_startup_persistence_and_validation(self):
        with tempfile.TemporaryDirectory() as directory, patch.dict("os.environ", {"SIGNALRANK_HISTORY_PATH": str(Path(directory) / "runs.sqlite3")}):
            with TestClient(app) as client:
                result = client.get("/api/experiments").json()
                identifier = result["current_id"]
                self.assertEqual(result["total"], 1)
                saved = client.get("/api/experiments/" + identifier).json()
                self.assertEqual(saved["report"], client.get("/api/report").json())
                self.assertEqual(saved["forecasts"], client.get("/api/forecasts?limit=100").json()["items"])
                self.assertEqual(client.get("/api/health").json()["experiment_id"], identifier)
                self.assertEqual(client.get("/api/experiments/missing").status_code, 404)
                self.assertEqual(client.get("/api/experiments?limit=101").status_code, 422)
                self.assertEqual(client.get("/api/experiments?offset=-1").status_code, 422)
            with TestClient(app) as client:
                self.assertEqual(client.get("/api/experiments").json()["total"], 1)
