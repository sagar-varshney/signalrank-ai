import unittest
from fastapi.testclient import TestClient
from signalrank.api import app


class ApiTests(unittest.TestCase):
    def test_startup_forecasts_and_limits(self):
        with TestClient(app) as client:
            self.assertEqual(client.get("/api/health").json()["mode"], "synthetic")
            self.assertEqual(len(client.get("/api/forecasts?limit=5").json()["items"]), 5)
            self.assertEqual(client.get("/api/forecasts?limit=101").status_code, 422)
            self.assertEqual(client.get("/api/report").json()["horizon_days"], 30)
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
