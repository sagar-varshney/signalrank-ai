import unittest
import tempfile
from pathlib import Path
from unittest.mock import patch
from fastapi.testclient import TestClient
from signalrank.api import app


class ApiTests(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        patcher = patch.dict("os.environ", {"SIGNALRANK_HISTORY_PATH": str(Path(directory.name) / "experiments.sqlite3")})
        patcher.start()
        self.addCleanup(patcher.stop)

    def test_dataset_pagination_filtering_and_detail(self):
        rows = [{"id": "CVE-2024-0012", "state": "candidate", "evidence": [{"sha256": "abc"}]}, {"id": "CVE-2024-0013", "state": "excluded", "evidence": []}]
        with patch("signalrank.api.readiness_report", return_value={"rows": rows, "training_enabled": False}), TestClient(app) as client:
            self.assertNotIn("rows", client.get("/api/dataset").json())
            page = client.get("/api/dataset/records?state=candidate&limit=1").json()
            self.assertEqual(page["total"], 1)
            self.assertNotIn("evidence", page["items"][0])
            self.assertEqual(client.get("/api/dataset/records?search=0013").json()["total"], 1)
            self.assertEqual(client.get("/api/dataset/records?offset=2").json()["items"], [])
            self.assertEqual(client.get("/api/dataset/records?limit=101").status_code, 422)
            self.assertEqual(client.get("/api/dataset/records?state=unknown").status_code, 422)
            self.assertEqual(client.get("/api/dataset/records/CVE-2024-0012").json()["evidence"], rows[0]["evidence"])
            self.assertEqual(client.get("/api/dataset/records/unknown").status_code, 404)

    def test_startup_forecasts_and_limits(self):
        with TestClient(app) as client:
            self.assertEqual(client.get("/api/health").json()["mode"], "synthetic")
            self.assertEqual(len(client.get("/api/forecasts?limit=5").json()["items"]), 5)
            self.assertEqual(client.get("/api/forecasts?limit=101").status_code, 422)
            self.assertEqual(client.get("/api/report").json()["horizon_days"], 30)
            scope = client.get("/api/scope").json()
            self.assertFalse(scope["real_training_enabled"])
            self.assertFalse(scope["legal_certification"])
            self.assertEqual(len(scope["source_permissions"]), 4)
            contract = client.get("/api/contracts").json()
            self.assertEqual(contract["version_conflict"]["status"], "blocked")
            self.assertEqual(contract["checks"][0]["status"], "valid")
            self.assertIn("Forecast explorer", client.get("/").text)
            report = client.get("/api/report").json()
            self.assertEqual(len(report["comparisons"]), 5)
            result = client.get("/api/simulate?budget=10").json()
            self.assertEqual(result["budget"], 10)
            self.assertEqual(client.get("/api/simulate?budget=0").status_code, 422)
            audit = client.get("/api/feasibility").json()
            self.assertFalse(audit["training_enabled"])
            self.assertIn("sample", audit)
            validation = client.get("/api/validation").json()
            self.assertFalse(validation["training_enabled"])
            self.assertLessEqual(validation["timestamp_checks_passed"], validation["checked"])
            cohort = client.get("/api/cohort").json()
            self.assertFalse(cohort["training_enabled"])
            self.assertEqual(cohort["sample_count"], len(cohort["selected_ids"]))
            self.assertEqual(client.get("/static/app.js").status_code, 200)
            self.assertEqual(client.get("/static/theme.js").status_code, 200)
            html = client.get("/").text
            self.assertIn('id="theme-choice"', html)
            self.assertIn('href="#main-content"', html)
            self.assertIn('aria-controls="workspace-navigation"', html)
            self.assertIn('id="workflow-description"', html)
            self.assertIn('Illustrated workflow, not live activity', html)
            self.assertIn('href="/static/editorial.css"', html)
            self.assertEqual(client.get('/static/editorial.css').status_code, 200)
            self.assertIn("text/css", client.get("/static/app.css").headers["content-type"])
            self.assertEqual(client.get("/static/../sources.json").status_code, 404)
