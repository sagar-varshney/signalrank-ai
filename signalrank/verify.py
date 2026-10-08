"""Clean-install smoke verification: train, reload, compare predictions and export."""
import argparse
import json
from pathlib import Path
import tempfile

import numpy as np

from signalrank.core import Experiment, TrainingConfig
from signalrank.training import train, load_artifact, runtime


def verify():
    with tempfile.TemporaryDirectory(prefix="signalrank-verify-") as directory:
        config = TrainingConfig(count=1800)
        path = train(config, Path(directory))
        saved = load_artifact(path, trusted_local=True)
        expected = Experiment(config)
        if not np.array_equal(saved.predict(expected.test), expected.probabilities):
            raise AssertionError("Reloaded predictions differ from fresh deterministic experiment")
        manifest = json.loads((path / "manifest.json").read_text())
        if saved.report != json.loads((path / "report.json").read_text()):
            raise AssertionError("Serialized model/report mismatch")
        if not (path / "experiment-report.md").is_file():
            raise AssertionError("Missing human-readable export")
        if len(saved.report["replay"]["runs"]) != 9 or len(saved.report["challenge"]["items"]) != 12 or len(saved.report["recovery"]["runs"]) != 9 or saved.report["decision"]["status"] != "available":
            raise AssertionError("Incomplete offline evidence")
        return {"status": "verified", "mode": "synthetic", "runtime": runtime(), "artifact_id": manifest["artifact_id"],
                "code_sha256": manifest["code_sha256"], "compared_predictions": len(expected.test),
                "replay_runs": 9, "challenge_runs": 12, "recovery_runs": 9, "decision_status": saved.report["decision"]["status"],
                "scope": "Temporary original synthetic run. Bit-identical reloaded predictions in this environment; not cross-hardware reproducibility, authenticity or real-world accuracy."}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    print(json.dumps(verify(), indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
