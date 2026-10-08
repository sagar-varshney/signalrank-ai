"""Isolated loopback server for real-browser integration tests, not deployment."""
from pathlib import Path
import tempfile

import uvicorn

from signalrank.core import TrainingConfig
from signalrank.demo import prepare


def main():
    with tempfile.TemporaryDirectory(prefix="signalrank-browser-") as folder:
        prepare(TrainingConfig(count=1800), Path(folder))
        uvicorn.run("signalrank.api:app", host="127.0.0.1", port=8026, log_level="warning")


if __name__ == "__main__":
    main()
