"""Local application data defaults. Reading a default never creates directories."""
import os
from pathlib import Path


def data_home():
    explicit = os.environ.get("SIGNALRANK_DATA_HOME")
    if explicit:
        path = Path(explicit).expanduser()
        if not path.is_absolute():
            raise ValueError("SIGNALRANK_DATA_HOME must be an absolute local path")
        return path
    base = os.environ.get("XDG_DATA_HOME")
    if base and Path(base).is_absolute():
        return Path(base) / "signalrank"
    return Path.home() / ".local" / "share" / "signalrank"


def database_path(variable, filename):
    explicit = os.environ.get(variable)
    if explicit:
        return Path(explicit).expanduser()
    # Preserve an existing checkout's history; do not silently move or abandon it.
    legacy = Path("artifacts") / filename
    return legacy if legacy.is_file() else data_home() / filename
