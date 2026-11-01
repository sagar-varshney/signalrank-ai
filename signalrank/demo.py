"""One-command, offline fictional demo. Run inside the installed project environment."""
import argparse
from datetime import datetime
import json
import os
from pathlib import Path

from signalrank.core import TrainingConfig
from signalrank.training import train, load_artifact
from signalrank.paths import data_home


def prepare(config, root, *, retrain=False):
    root = Path(root).expanduser().resolve()
    directory = None
    if not retrain and (root / "runs").is_dir():
        from dataclasses import asdict
        candidates = []
        for path in (root / "runs").iterdir():
            if not path.is_dir() or path.is_symlink():
                continue
            try:
                run = json.loads((path / "run.json").read_text())
                if not isinstance(run, dict):
                    continue
                if run.get("status") == "completed" and run.get("configuration") == asdict(config):
                    finished = datetime.fromisoformat(run["finished_at"])
                    if finished.tzinfo is None:
                        continue
                    candidates.append((finished.timestamp(), path))
            except (OSError, ValueError, KeyError, TypeError):
                continue
        for _, path in sorted(candidates, reverse=True):
            try:
                load_artifact(path, trusted_local=True)
            except (OSError, ValueError, KeyError, TypeError):
                continue
            directory = path
            print("Reusing compatible local run: " + str(directory), flush=True)
            break
    if directory is None:
        directory = train(config, root)
    directory = Path(directory).resolve()
    pointer = root / "selection.json"
    if pointer.is_symlink():
        raise ValueError("Selected-run pointer must not be a symlink")
    temporary = root / ("selection-" + directory.name + ".tmp")
    with temporary.open("x") as stream:
        json.dump({"directory": str(directory.relative_to(root)), "source": "synthetic"}, stream)
        stream.write("\n")
    temporary.replace(pointer)
    # Scope the demo to this run, rather than trusting inherited extra models.
    os.environ["SIGNALRANK_TRUSTED_MODEL_DIR"] = str(directory)
    os.environ["SIGNALRANK_TRUSTED_MODEL_DIRS"] = ""
    os.environ["SIGNALRANK_HISTORY_PATH"] = str(root / "experiments.sqlite3")
    os.environ["SIGNALRANK_BATCH_PATH"] = str(root / "batches.sqlite3")
    return directory


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", type=Path, help="Synthetic TrainingConfig JSON")
    parser.add_argument("--output", type=Path, default=data_home() / "demo")
    parser.add_argument("--retrain", action="store_true", help="Start a new run instead of reusing a compatible local artifact")
    parser.add_argument("--port", type=int, default=8015)
    parser.add_argument("--no-serve", action="store_true", help="Train and export only; useful for CI")
    args = parser.parse_args()
    if not 1024 <= args.port <= 65535:
        parser.error("port must be between 1024 and 65535")
    config = TrainingConfig(**json.loads(args.config.read_text())) if args.config else TrainingConfig()
    print("Preparing the local synthetic demo; compatible runs are reused. No downloads or external inputs.", flush=True)
    directory = prepare(config, args.output, retrain=args.retrain)
    print("Saved model and report: " + str(directory), flush=True)
    print("Markdown report: " + str(directory / "experiment-report.md"), flush=True)
    if not args.no_serve:
        import uvicorn
        print(f"Overview: http://127.0.0.1:{args.port}/#overview", flush=True)
        uvicorn.run("signalrank.api:app", host="127.0.0.1", port=args.port)


if __name__ == "__main__":
    main()
