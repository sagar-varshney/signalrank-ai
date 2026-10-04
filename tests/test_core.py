from datetime import date, timedelta
import unittest
import numpy as np
from signalrank.core import Experiment, HORIZON, generate, matrix, require_source, split, reliability


class ExperimentTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.experiment = Experiment()

    def test_labels_mature_before_next_partition(self):
        train, calibration, test = split(generate())
        for left, right in [(train, calibration), (calibration, test)]:
            self.assertLess(date.fromisoformat(left[-1]["observed_at"]) + timedelta(days=HORIZON), date.fromisoformat(right[0]["observed_at"]))

    def test_outcome_cannot_enter_features_or_forecasts(self):
        rows = generate(count=10)
        changed = [{**r, "event_date": "2099-01-01"} for r in rows]
        np.testing.assert_array_equal(matrix(rows), matrix(changed))
        self.assertNotIn("event_date", self.experiment.forecasts(1)[0])

    def test_reproducible_predictions(self):
        other = Experiment()
        np.testing.assert_array_equal(other.probabilities, self.experiment.probabilities)

    def test_pending_sources_blocked(self):
        for source in ["pretrained_models", "unknown"]:
            with self.assertRaises(ValueError):
                require_source(source)

    def test_ranking_and_probability_bounds(self):
        p = [x["probability"] for x in self.experiment.forecasts(100)]
        self.assertEqual(p, sorted(p, reverse=True))
        self.assertTrue(all(0 <= x <= 1 for x in p))

    def test_budget_accounts_for_all_reviewed_records(self):
        for budget in (1, 50, len(self.experiment.test)):
            result = self.experiment.simulate(budget)
            for strategy in result["strategies"]:
                self.assertEqual(strategy["captured"] + strategy["false_positives"], budget)
                self.assertEqual(strategy["captured"] + strategy["missed"], result["total_positives"])
                if budget == len(self.experiment.test):
                    self.assertEqual(strategy["recall"], 1)
        with self.assertRaises(ValueError):
            self.experiment.simulate(0)

    def test_calibration_bins_cover_boundaries_and_empty_groups(self):
        bins = reliability(np.array([0, 1, 1]), np.array([0., .1, 1.]))
        self.assertEqual(sum(b["count"] for b in bins), 3)
        self.assertEqual(bins[0]["observed"], 0)
        self.assertEqual(bins[1]["observed"], 1)
        self.assertEqual(bins[9]["predicted"], 1)
        self.assertIsNone(bins[2]["observed"])


if __name__ == "__main__":
    unittest.main()
