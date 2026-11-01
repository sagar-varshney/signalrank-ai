from dataclasses import asdict
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from signalrank.core import TrainingConfig
from signalrank.demo import prepare
from signalrank.paths import data_home, database_path
from signalrank.storage import RUN_FILES, inventory, apply_plan


def run(root, index, *, status="completed"):
    identifier = f"{index:032x}"
    directory = root / "runs" / identifier
    directory.mkdir(parents=True)
    for name in RUN_FILES:
        (directory / name).write_text("placeholder")
    (directory / "run.json").write_text(json.dumps({"run_id": identifier, "status": status,
        "finished_at": f"2026-10-{index:02d}T00:00:00+00:00", "artifact_id": "artifact", "configuration": asdict(TrainingConfig())}))
    (directory / "manifest.json").write_text(json.dumps({"artifact_id": "artifact"}))
    return directory


class StorageTests(unittest.TestCase):
    def test_defaults_do_not_create_storage_and_existing_databases_are_preserved(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder).resolve()
            with patch.dict(os.environ, {"SIGNALRANK_DATA_HOME": str(root / "local"), "SIGNALRANK_HISTORY_PATH": ""}):
                self.assertEqual(data_home(), root / "local")
                self.assertFalse(data_home().exists())
                with patch("signalrank.paths.Path.is_file", return_value=False):
                    self.assertEqual(database_path("SIGNALRANK_HISTORY_PATH", "experiments.sqlite3"), root / "local" / "experiments.sqlite3")
                with patch("signalrank.paths.Path.is_file", return_value=True):
                    self.assertEqual(database_path("SIGNALRANK_HISTORY_PATH", "experiments.sqlite3"), Path("artifacts/experiments.sqlite3"))
            with patch.dict(os.environ, {"SIGNALRANK_DATA_HOME": "relative"}), self.assertRaises(ValueError):
                data_home()

    def test_preview_preserves_selected_trusted_newest_and_database_then_applies_only_candidates(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder).resolve()
            paths = [run(root, i) for i in range(1, 7)]
            (root / "experiments.sqlite3").write_bytes(b"history")
            (root / "selection.json").write_text(json.dumps({"directory": str(paths[0].relative_to(root))}))
            with patch.dict(os.environ, {"SIGNALRANK_TRUSTED_MODEL_DIR": str(paths[1]), "SIGNALRANK_TRUSTED_MODEL_DIRS": ""}):
                preview = inventory(root, keep=2)
                self.assertEqual([r["run_id"] for r in preview["plan"]["candidates"]], [paths[2].name, paths[3].name])
                self.assertTrue(all(p.exists() for p in paths))
                result = apply_plan(preview["plan"])
                self.assertEqual(len(result["deleted_runs"]), 2)
                self.assertEqual((root / "experiments.sqlite3").read_bytes(), b"history")
                for i in [0, 1, 4, 5]:
                    self.assertTrue(paths[i].exists())
                for i in [2, 3]:
                    self.assertFalse(paths[i].exists())

    def test_stale_plan_fails_before_any_deletion(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder).resolve()
            first, second, newest = [run(root, i) for i in [1, 2, 3]]
            with patch.dict(os.environ, {"SIGNALRANK_TRUSTED_MODEL_DIR": "", "SIGNALRANK_TRUSTED_MODEL_DIRS": ""}):
                plan = inventory(root, keep=1)["plan"]
                (second / "report.json").write_text("changed report")
                with self.assertRaisesRegex(ValueError, "stale"):
                    apply_plan(plan)
                self.assertTrue(first.exists())
                self.assertTrue(second.exists())
                self.assertTrue(newest.exists())

    def test_unknown_failed_and_symlink_content_is_never_eligible(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder).resolve()
            first, second, failed, newest = [run(root, i, status="failed" if i == 3 else "completed") for i in [1, 2, 3, 4]]
            (first / "unrecognized.txt").write_text("keep")
            target = root / "precious.txt"
            target.write_text("keep")
            (second / "report.json").unlink()
            (second / "report.json").symlink_to(target)
            with patch.dict(os.environ, {"SIGNALRANK_TRUSTED_MODEL_DIR": "", "SIGNALRANK_TRUSTED_MODEL_DIRS": ""}):
                self.assertEqual(inventory(root, 1)["plan"]["candidates"], [])
            self.assertEqual(target.read_text(), "keep")
            with self.assertRaises(ValueError):
                inventory(root, 0)

    def test_new_selected_or_completed_run_invalidates_a_reviewed_plan(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder).resolve()
            first, second = [run(root, i) for i in [1, 2]]
            with patch.dict(os.environ, {"SIGNALRANK_TRUSTED_MODEL_DIR": "", "SIGNALRANK_TRUSTED_MODEL_DIRS": ""}):
                plan = inventory(root, 1)["plan"]
                (root / "selection.json").write_text(json.dumps({"directory": str(first.relative_to(root))}))
                with self.assertRaisesRegex(ValueError, "stale"):
                    apply_plan(plan)
                self.assertTrue(first.exists())

    def test_demo_reuses_only_a_compatible_completed_run_and_retrain_is_explicit(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder).resolve()
            first = run(root, 1)
            with patch.dict(os.environ), patch("signalrank.demo.load_artifact") as load, patch("signalrank.demo.train") as train:
                self.assertEqual(prepare(TrainingConfig(), root), first)
                load.assert_called_once_with(first, trusted_local=True)
                train.assert_not_called()
                self.assertEqual(json.loads((root / "selection.json").read_text())["directory"], str(first.relative_to(root)))
            second = run(root, 2)
            with patch.dict(os.environ), patch("signalrank.demo.load_artifact", side_effect=AssertionError("must not reuse")), patch("signalrank.demo.train", return_value=second) as train:
                self.assertEqual(prepare(TrainingConfig(), root, retrain=True), second)
                train.assert_called_once_with(TrainingConfig(), root)

    def test_incompatible_runs_are_not_silently_reused(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder).resolve()
            run(root, 1)
            second = root / "runs" / f"{2:032x}"
            with patch.dict(os.environ), patch("signalrank.demo.load_artifact", side_effect=ValueError("code differs")), patch("signalrank.demo.train", return_value=second) as train:
                self.assertEqual(prepare(TrainingConfig(), root), second)
                train.assert_called_once()
