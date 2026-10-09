"""One-command, offline fictional demo. Run inside the installed project environment."""
import argparse
import json
import os
from pathlib import Path

from signalrank.core import TrainingConfig
from signalrank.training import train


def prepare(config, root):
    root = Path(root).resolve()
    directory = train(config, root)
    # Scope the demo to this run, rather than trusting inherited extra models.
    os.environ["SIGNALRANK_TRUSTED_MODEL_DIR"] = str(directory)
    os.environ["SIGNALRANK_TRUSTED_MODEL_DIRS"] = ""
    os.environ["SIGNALRANK_HISTORY_PATH"] = str(root / "experiments.sqlite3")
    os.environ["SIGNALRANK_BATCH_PATH"] = str(root / "batches.sqlite3")
    return directory


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", type=Path, help="Synthetic TrainingConfig JSON")
    parser.add_argument("--output", type=Path, default=Path("artifacts/demo"))
    parser.add_argument("--port", type=int, default=8015)
    parser.add_argument("--no-serve", action="store_true", help="Train and export only; useful for CI")
    args = parser.parse_args()
    if not 1024 <= args.port <= 65535:
        parser.error("port must be between 1024 and 65535")
    config = TrainingConfig(**json.loads(args.config.read_text())) if args.config else TrainingConfig()
    print("Building fixed synthetic development probes offline; no downloads or external inputs.", flush=True)
    directory = prepare(config, args.output)
    print("Saved model and report: " + str(directory), flush=True)
    print("Markdown report: " + str(directory / "experiment-report.md"), flush=True)
    if not args.no_serve:
        import uvicorn
        print(f"Overview: http://127.0.0.1:{args.port}/#overview", flush=True)
        uvicorn.run("signalrank.api:app", host="127.0.0.1", port=args.port)


if __name__ == "__main__":
    main()
