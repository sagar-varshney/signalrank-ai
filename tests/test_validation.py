from copy import deepcopy
from unittest import TestCase
from signalrank.validation import check_snapshot, label_window, select_cohort, timestamp


class ValidationTests(TestCase):
    def test_window_boundaries_and_maturity(self):
        cutoff = timestamp("2024-01-01T12:00:00Z")
        released = timestamp("2024-03-01T00:00:00Z")
        for day, status in [("2023-12-31", "already listed"), ("2024-01-01", "ambiguous boundary"), ("2024-01-31", "ambiguous boundary"), ("2024-01-30", "positive"), (None, "provisional negative")]:
            self.assertEqual(label_window(cutoff, released, day), status)
        self.assertEqual(label_window(cutoff, cutoff), "immature")

    def test_timezone_required(self):
        with self.assertRaises(ValueError):
            timestamp("2024-01-01T12:00:00")

    def test_revisions_and_future_metadata_detected(self):
        record = {"cveMetadata": {"cveId": "CVE-2024-0012", "state": "PUBLISHED", "datePublished": "2024-01-01T00:00:00Z"}, "containers": {"cna": {"descriptions": [{"value": "description"}]}}}
        commit = {"commit": {"committer": {"date": "2024-01-01T01:00:00Z"}}}
        cutoff = timestamp("2024-01-02T00:00:00Z")
        self.assertEqual(check_snapshot(record, record, commit, cutoff), [])
        revised = deepcopy(record)
        revised["cveMetadata"]["datePublished"] = "2024-01-01T02:00:00Z"
        record["containers"]["cna"]["providerMetadata"] = {"dateUpdated": "2024-02-01T00:00:00Z"}
        self.assertEqual(check_snapshot(record, revised, commit, cutoff), ["container updated after cutoff", "publication timestamp revised"])

    def test_sampling_is_order_independent_and_deduplicated(self):
        ids = [f"CVE-2024-{n:04}" for n in range(100)]
        self.assertEqual(select_cohort(ids, 20), select_cohort(list(reversed(ids)) + ids, 20))
        self.assertEqual(len(select_cohort(ids, 20)), 20)
        with self.assertRaises(ValueError):
            select_cohort(ids, 0)
