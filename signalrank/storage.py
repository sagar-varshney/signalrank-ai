"""Inspect one artifact root; preview retention and explicitly apply a saved plan.

Never loads pickle, downloads data, scans home, or removes databases/environments.
Stop all servers/writers using this root before applying a cleanup plan.
"""
import argparse
from datetime import datetime
from hashlib import sha256
import json
import os
from pathlib import Path
import re
import shutil
import stat

from signalrank.paths import data_home

RUN_ID = re.compile(r"^[a-f0-9]{32}$")
RUN_FILES = {"run.json", "manifest.json", "model.joblib", "report.json", "model-card.json", "experiment-report.md"}
WARNING = "Preview only unless --apply-plan is supplied. Cleanup permanently removes listed model runs, not SQLite history. Those runs can no longer be reloaded. Stop all servers/writers first."


def tree_state(path):
    """No symlink traversal. Logical file bytes, not physical/iCloud accounting."""
    path = Path(path)
    if not path.exists() and not path.is_symlink():
        return {"bytes": 0, "files": [], "skipped_links": 0}
    rows, links = [], 0
    if path.is_symlink():
        return {"bytes": 0, "files": [], "skipped_links": 1}
    for parent, directories, names in os.walk(path, followlinks=False):
        safe = []
        for name in directories:
            child = Path(parent) / name
            if child.is_symlink():
                links += 1
            else:
                safe.append(name)
        directories[:] = safe
        for name in names:
            child = Path(parent) / name
            s = child.lstat()
            if not stat.S_ISREG(s.st_mode):
                links += 1
                continue
            rows.append({"file": str(child.relative_to(path)), "bytes": s.st_size,
                         "modified_ns": s.st_mtime_ns, "inode": s.st_ino})
    rows.sort(key=lambda item: item["file"])
    return {"bytes": sum(item["bytes"] for item in rows), "files": rows, "skipped_links": links}


def canonical(value):
    return sha256(json.dumps(value, sort_keys=True, allow_nan=False).encode()).hexdigest()


def checked_root(root):
    root = Path(root).expanduser().absolute()
    if root.resolve() != root or root.is_symlink() or (root / "runs").is_symlink():
        raise ValueError("Artifact root and runs must not use symlinks")
    return root


def protected_runs(root):
    protected = set()
    for value in [os.environ.get("SIGNALRANK_TRUSTED_MODEL_DIR", ""),
                  *os.environ.get("SIGNALRANK_TRUSTED_MODEL_DIRS", "").split(os.pathsep)]:
        if value:
            protected.add(str(Path(value).expanduser().resolve()))
    selection = root / "selection.json"
    if selection.exists() or selection.is_symlink():
        if selection.is_symlink():
            raise ValueError("Selection must not be a symlink")
        value = json.loads(selection.read_text())
        path = (root / value["directory"]).resolve()
        if path.parent != root / "runs" or not RUN_ID.fullmatch(path.name):
            raise ValueError("Invalid selected run; cleanup blocked")
        protected.add(str(path))
    return protected


def inventory(root, keep=3):
    if type(keep) is not int or not 1 <= keep <= 100:
        raise ValueError("keep must be between 1 and 100")
    root = checked_root(root)
    protected = protected_runs(root)
    runs = []
    directory = root / "runs"
    for path in sorted(directory.iterdir()) if directory.is_dir() else []:
        if not path.is_dir() or path.is_symlink() or not RUN_ID.fullmatch(path.name):
            continue
        state = tree_state(path)
        entry = {"run_id": path.name, "bytes": state["bytes"], "eligible": False,
                 "reason": "Unrecognized, incomplete or unsafe run; retained", "finished_at": ""}
        try:
            if state["skipped_links"] or {f["file"] for f in state["files"]} != RUN_FILES:
                raise ValueError("Unexpected run files")
            run = json.loads((path / "run.json").read_text())
            manifest = json.loads((path / "manifest.json").read_text())
            if run["run_id"] != path.name or run["status"] != "completed" or run["artifact_id"] != manifest["artifact_id"]:
                raise ValueError("Not a completed run")
            finished = datetime.fromisoformat(run["finished_at"])
            if finished.tzinfo is None:
                raise ValueError("Missing timezone")
            entry.update(eligible=True, finished_at=finished.isoformat(), finished_timestamp=finished.timestamp(),
                         fingerprint=canonical(state), reason="Completed run")
        except (OSError, ValueError, KeyError, TypeError):
            pass
        if str(path) in protected:
            entry.update(eligible=False, reason="Selected or explicitly trusted run; retained")
        runs.append(entry)
    completed = sorted([r for r in runs if r["finished_at"]], key=lambda r: (r["finished_timestamp"], r["run_id"]), reverse=True)
    for entry in completed[:keep]:
        entry.update(eligible=False, reason="Within newest-run retention; retained")
    candidates = [{"run_id": r["run_id"], "bytes": r["bytes"], "fingerprint": r["fingerprint"]}
                  for r in runs if r["eligible"]]
    plan = {"protocol": "local-retention-v1", "root": str(root), "keep": keep, "candidates": candidates}
    return {"root": str(root), "bytes": tree_state(root)["bytes"], "runs": runs,
            "reclaimable_bytes": sum(r["bytes"] for r in candidates), "plan": plan, "warning": WARNING,
            "measurement": "Logical bytes under this root only; excludes environments, other roots and skipped symlinks. Not an iCloud quota measurement."}


def apply_plan(plan):
    if not isinstance(plan, dict) or plan.get("protocol") != "local-retention-v1":
        raise ValueError("Unsupported cleanup plan")
    root = checked_root(plan["root"])
    current = inventory(root, plan["keep"])["plan"]
    if plan != current:
        raise ValueError("Cleanup preview is stale or changed; create and review a new plan")
    # Validate the whole plan before any deletion. No automatic or browser cleanup.
    deleted = []
    for item in current["candidates"]:
        path = root / "runs" / item["run_id"]
        if canonical(tree_state(path)) != item["fingerprint"]:
            raise ValueError("Run changed during cleanup; stopped")
        shutil.rmtree(path)
        deleted.append(item["run_id"])
    return {"deleted_runs": deleted, "logical_bytes_removed": sum(r["bytes"] for r in current["candidates"]),
            "history": "SQLite histories and receipts were not modified"}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, help="One artifact root containing runs/; default local demo output")
    parser.add_argument("--keep", type=int, default=3)
    parser.add_argument("--write-plan", type=Path, help="Save preview JSON for manual review (exclusive create)")
    parser.add_argument("--apply-plan", type=Path, help="Permanently remove the runs in this reviewed preview")
    args = parser.parse_args()
    if args.apply_plan and (args.root or args.write_plan or args.keep != 3):
        parser.error("--apply-plan takes its root and retention from the saved plan")
    try:
        if args.apply_plan:
            result = apply_plan(json.loads(args.apply_plan.read_text()))
        else:
            result = inventory(args.root or data_home() / "demo", args.keep)
            if args.write_plan:
                with args.write_plan.open("x") as stream:
                    json.dump(result["plan"], stream, indent=2, allow_nan=False)
                    stream.write("\n")
        print(json.dumps(result, indent=2, allow_nan=False))
    except (OSError, ValueError, KeyError, TypeError) as error:
        parser.exit(1, str(error) + "\n")


if __name__ == "__main__":
    main()
