from copy import deepcopy
import json
from pathlib import Path
import unittest

from signalrank.core import registry, require_source, TrainingConfig
from signalrank.scope import OPERATIONS, require_use, review


class ScopeTests(unittest.TestCase):
    def test_operations_are_separate_and_unknown_uses_fail_closed(self):
        for operation in OPERATIONS:
            require_source("synthetic", operation)
        for source in ("cve", "cisa_kev"):
            require_source(source, "local_audit")
            for operation in OPERATIONS[1:]:
                with self.assertRaises(ValueError): require_source(source, operation)
        for source, operation in [("unknown", "train"), ("pretrained_models", "local_audit"), ("synthetic", "unknown")]:
            with self.assertRaises(ValueError): require_source(source, operation)

    def test_generic_approved_and_malformed_flags_do_not_grant_use(self):
        for source in ({"status": "approved"}, {"status": "approved", "permissions": {"train": True}}, {"status": "approved", "permissions": []}, {"status": "pending", "permissions": {"train": "allowed"}}):
            with self.assertRaises(ValueError): require_use("synthetic", "train", {"synthetic": source})

    def test_register_edit_or_readiness_flag_cannot_enable_real_trainer(self):
        sources = deepcopy(registry())
        for source in ("cve", "cisa_kev"):
            sources[source]["permissions"] = {operation: "allowed" for operation in OPERATIONS}
            for operation in ("train", "release_model"):
                with self.assertRaises(ValueError): require_use(source, operation, sources)
            with self.assertRaises(ValueError): TrainingConfig(source=source)
        result = review(sources=sources, readiness={"training_enabled": True, "blockers": []})
        self.assertFalse(result["real_training_enabled"])
        self.assertFalse(result["legal_certification"])

    def test_public_review_excludes_official_audit_data(self):
        result = review(public=True, readiness={"blockers": ["SECRET AUDIT"], "rows": [{"id": "CVE-2024-0001"}]})
        self.assertEqual([r["source"] for r in result["source_permissions"]], ["synthetic"])
        self.assertNotIn("SECRET AUDIT", json.dumps(result))
        self.assertNotIn("CVE-2024-0001", json.dumps(result))
        self.assertTrue(all(gate["status"] == "review_required" for gate in result["release_gates"]))

    def test_saved_scientific_blockers_remain_separate_from_permission_decisions(self):
        permission = "The current source approval covers local feasibility auditing, not real-data model training."
        result = review(readiness={"blockers": ["Zero positive candidate outcomes", permission]})
        self.assertIn("Zero positive candidate outcomes", result["scientific_gates"])
        self.assertNotIn(permission, result["scientific_gates"])
        self.assertIn("not a finding", result["permission_note"])
        self.assertFalse(result["real_training_enabled"])

    def test_public_source_register_supports_explicit_training_only_for_fictional_data(self):
        path = Path(__file__).resolve().parents[1] / "deploy/synthetic-sources.json"
        sources = json.loads(path.read_text())
        self.assertEqual(set(sources), {"synthetic"})
        require_use("synthetic", "train", sources)
        with self.assertRaises(ValueError): require_use("cve", "train", sources)
