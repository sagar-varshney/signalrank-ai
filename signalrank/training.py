"""Explicit offline training and trusted-local artifact loading.

Joblib uses pickle: never load artifacts supplied by another person or website.
Hashes detect accidental corruption, not a malicious replacement of the manifest.
"""
import argparse
from dataclasses import asdict
from datetime import datetime, timezone
from hashlib import sha256
from importlib.resources import files
import json
from pathlib import Path
import platform
from uuid import uuid4

import joblib
import numpy
import sklearn

from signalrank.core import Experiment, TrainingConfig, generate, split
from signalrank.diagnostics import build as diagnostics
from signalrank.benchmark import build as benchmark
from signalrank.history import ExperimentStore, snapshot
from signalrank.temporal import evaluate

CODE_FILES = {"core.py", "temporal.py", "training.py", "diagnostics.py", "benchmark.py", "uncertainty.py"}


def runtime():
    return {"python": platform.python_version(), "numpy": numpy.__version__,
            "scikit_learn": sklearn.__version__, "joblib": joblib.__version__}


def write_json(path, value):
    path.write_text(json.dumps(value, indent=2, sort_keys=True, allow_nan=False) + "\n")


def train(config, root=Path("artifacts")):
    root = Path(root)
    run_id = uuid4().hex
    directory = root / "runs" / run_id
    directory.mkdir(parents=True, exist_ok=False)
    run = {"run_id": run_id, "status": "running", "started_at": datetime.now(timezone.utc).isoformat(), "configuration": asdict(config)}
    write_json(directory / "run.json", run)
    try:
        experiment = Experiment(config)
        experiment.report["temporal_evaluation"] = evaluate(config)
        experiment.report["diagnostics"] = diagnostics(experiment)
        experiment.report["benchmark"] = benchmark(*split(generate(config.seed, config.count)), config)
        joblib.dump(experiment, directory / "model.joblib", compress=3)
        write_json(directory / "report.json", experiment.report)
        write_json(directory / "model-card.json", {
            "intended_use": "Local synthetic ML engineering and evaluation demonstration only",
            "prohibited_claims": ["Real-world exploitation probability", "Validated KEV prediction", "Security or patching advice"],
            "training_source": "Original fictional generator", "target": experiment.report["target"],
            "limitations": ["Synthetic generation assumptions", "Explored development windows; no final holdout", "No real-data training approval"],
        })
        manifest = {"schema_version": 2, "runtime": runtime(), "configuration": asdict(config),
                    "dataset_sha256": experiment.report["dataset_sha256"],
                    "code_sha256": {name: sha256(files("signalrank").joinpath(name).read_bytes()).hexdigest()
                                    for name in sorted(CODE_FILES)},
                    "files": {name: sha256((directory / name).read_bytes()).hexdigest()
                              for name in ("model.joblib", "report.json", "model-card.json")}}
        artifact_id = sha256(json.dumps(manifest, sort_keys=True).encode()).hexdigest()
        manifest["artifact_id"] = artifact_id
        write_json(directory / "manifest.json", manifest)
        snapshot_id = ExperimentStore(root / "experiments.sqlite3").save(snapshot(experiment))
        run.update(status="completed", artifact_id=artifact_id, snapshot_id=snapshot_id)
    except Exception as error:
        run.update(status="failed", error_type=type(error).__name__, error=str(error))
        raise
    finally:
        run["finished_at"] = datetime.now(timezone.utc).isoformat()
        write_json(directory / "run.json", run)
    return directory


def load_artifact(directory, *, trusted_local=False):
    if not trusted_local:
        raise ValueError("Explicit trusted-local acknowledgement required: joblib can execute code")
    directory = Path(directory)
    run = json.loads((directory / "run.json").read_text())
    if run["status"] != "completed":
        raise ValueError("Artifact run is not completed")
    manifest = json.loads((directory / "manifest.json").read_text())
    identifier = manifest.pop("artifact_id")
    if identifier != sha256(json.dumps(manifest, sort_keys=True).encode()).hexdigest() or run["artifact_id"] != identifier:
        raise ValueError("Manifest integrity check failed")
    if manifest["schema_version"] != 2:
        raise ValueError("Artifact schema differs; retrain locally or use its original checkout")
    if manifest["runtime"] != runtime():
        raise ValueError("Artifact runtime differs; recreate the original environment")
    TrainingConfig(**manifest["configuration"])
    if set(manifest["code_sha256"]) != CODE_FILES:
        raise ValueError("Incomplete training code provenance")
    for name, expected in manifest["code_sha256"].items():
        if name not in CODE_FILES or sha256(files("signalrank").joinpath(name).read_bytes()).hexdigest() != expected:
            raise ValueError("Training code differs from artifact; use its original checkout")
    if set(manifest["files"]) != {"model.joblib", "report.json", "model-card.json"}:
        raise ValueError("Unexpected artifact files")
    for name, expected in manifest["files"].items():
        if sha256((directory / name).read_bytes()).hexdigest() != expected:
            raise ValueError(f"Artifact integrity check failed: {name}")
    experiment = joblib.load(directory / "model.joblib")
    if not isinstance(experiment, Experiment) or experiment.report["mode"] != "synthetic":
        raise ValueError("Unsupported experiment artifact")
    return experiment


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", type=Path, help="JSON TrainingConfig; synthetic only")
    parser.add_argument("--output", type=Path, default=Path("artifacts"))
    parser.add_argument("--inspect-artifact", type=Path, help="Reload a saved model and reproduce its top forecasts")
    parser.add_argument("--trusted-local-artifact", action="store_true")
    args = parser.parse_args()
    if args.inspect_artifact:
        experiment = load_artifact(args.inspect_artifact, trusted_local=args.trusted_local_artifact)
        print(json.dumps({"mode": "synthetic", "forecasts": experiment.forecasts(5)}, indent=2))
    else:
        config = TrainingConfig(**json.loads(args.config.read_text())) if args.config else TrainingConfig()
        print(train(config, args.output).resolve())


if __name__ == "__main__":
    main()
