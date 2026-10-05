from unittest import TestCase
from signalrank.cohort import inventory, child


class CohortTests(TestCase):
    def test_inventory(self):
        tree = {"truncated": False, "tree": [{"type": "blob", "path": "0xxx/CVE-2024-0012.json"}]}
        self.assertEqual(inventory(tree, 2024), ["CVE-2024-0012"])
        tree["tree"] *= 2
        with self.assertRaises(ValueError):
            inventory(tree, 2024)

    def test_incomplete_frames_fail_closed(self):
        for truncated in (True, None):
            with self.assertRaises(ValueError):
                inventory({"truncated": truncated, "tree": []}, 2024)

    def test_wrong_year_and_missing_child(self):
        with self.assertRaises(ValueError):
            inventory({"truncated": False, "tree": [{"type": "blob", "path": "CVE-2023-0012.json"}]}, 2024)
        with self.assertRaises(ValueError):
            child({"truncated": False, "tree": []}, "2024")
