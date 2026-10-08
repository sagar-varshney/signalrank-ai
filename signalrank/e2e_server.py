"""Isolated loopback server for real-browser integration tests, not deployment."""
from pathlib import Path
import os
import tempfile

import uvicorn

from signalrank.core import TrainingConfig
from signalrank.demo import prepare


def main():
    with tempfile.TemporaryDirectory(prefix="signalrank-browser-") as folder:
        prepare(TrainingConfig(count=1800), Path(folder))
        if os.environ.get("SIGNALRANK_E2E_PUBLIC") == "1":
            os.environ["SIGNALRANK_PROFILE"] = "public"
            os.environ["SIGNALRANK_ALLOWED_HOSTS"] = "127.0.0.1,localhost"
        uvicorn.run("signalrank.api:app", host="127.0.0.1", port=8026, log_level="warning")


if __name__ == "__main__":
    main()
