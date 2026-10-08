"""Build-time synthetic artifact and fail-closed public serving; no hosting API calls."""
import argparse
import json
import os
from pathlib import Path

from threadpoolctl import threadpool_limits
from signalrank.core import TrainingConfig
from signalrank.training import train, load_artifact


def prepare(root, count=3600):
    root = Path(root).resolve()
    with threadpool_limits(limits=1):
        directory = train(TrainingConfig(count=count), root)
    load_artifact(directory, trusted_local=True)
    (root / "selection.json").write_text(json.dumps({"directory": str(directory.relative_to(root)), "source": "synthetic"}, sort_keys=True) + "\n")
    return directory


def selected(root):
    root = Path(root).resolve()
    selection = json.loads((root / "selection.json").read_text())
    directory = (root / selection["directory"]).resolve()
    if selection.get("source") != "synthetic" or directory.parent != root / "runs" or not directory.name.isalnum():
        raise ValueError("Release selection must point to a built synthetic run inside the release directory")
    if not directory.is_dir():
        raise ValueError("Built synthetic artifact is missing; startup will not train a fallback")
    return directory


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=("build", "serve"))
    parser.add_argument("--output", type=Path, default=Path("/app/demo-artifact"))
    parser.add_argument("--count", type=int, default=3600)
    args = parser.parse_args()
    if args.action == "build":
        print("Built original synthetic release artifact: " + str(prepare(args.output, args.count)), flush=True)
        return
    if os.environ.get("SIGNALRANK_PROFILE") != "public":
        raise ValueError("Release serving requires explicit SIGNALRANK_PROFILE=public")
    directory = selected(args.output)
    os.environ["SIGNALRANK_TRUSTED_MODEL_DIR"] = str(directory)
    os.environ["SIGNALRANK_TRUSTED_MODEL_DIRS"] = ""
    from signalrank.deployment import Settings
    Settings.load()
    port = int(os.environ.get("PORT", "10000"))
    if not 1024 <= port <= 65535:
        raise ValueError("PORT must be between 1024 and 65535")
    import uvicorn
    uvicorn.run("signalrank.api:app", host="0.0.0.0", port=port, workers=1,
                access_log=False, proxy_headers=False, limit_concurrency=16, timeout_keep_alive=5)


if __name__ == "__main__":
    main()
