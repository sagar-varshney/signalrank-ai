"""Local, content-addressed experiment snapshots (not a model-serving registry)."""
from datetime import datetime, timezone
from contextlib import contextmanager
from hashlib import sha256
from importlib.resources import files
import json
import os
from pathlib import Path
import platform
import sqlite3

import numpy
import sklearn


def snapshot(experiment):
    from signalrank.diagnostics import evaluation_records
    return {
        "schema_version": 2,
        "report": experiment.report,
        "evaluation_records": evaluation_records(experiment),
        "forecasts": experiment.forecasts(100),
        "provenance": {
            "core_sha256": sha256(files("signalrank").joinpath("core.py").read_bytes()).hexdigest(),
            "python": platform.python_version(),
            "numpy": numpy.__version__,
            "scikit_learn": sklearn.__version__,
            "model": "TF-IDF + standardized numeric features; logistic regression; sigmoid calibration",
            "forecast_scope": "Top 100 synthetic test records; base-model log-odds contributions",
        },
    }


class ExperimentStore:
    def __init__(self, path=None):
        self.path = Path(path or os.environ.get("SIGNALRANK_HISTORY_PATH", "artifacts/experiments.sqlite3"))
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self.connect() as db:
            db.execute("CREATE TABLE IF NOT EXISTS experiments (id TEXT PRIMARY KEY, created_at TEXT NOT NULL, payload TEXT NOT NULL)")

    @contextmanager
    def connect(self):
        db = sqlite3.connect(self.path, timeout=10)
        try:
            with db:
                yield db
        finally:
            db.close()

    def save(self, payload):
        serialized = json.dumps(payload, sort_keys=True, allow_nan=False, separators=(",", ":"))
        identifier = sha256(serialized.encode()).hexdigest()
        with self.connect() as db:
            db.execute("INSERT OR IGNORE INTO experiments VALUES (?, ?, ?)",
                       (identifier, datetime.now(timezone.utc).isoformat(), serialized))
        return identifier

    def get(self, identifier):
        with self.connect() as db:
            row = db.execute("SELECT id, created_at, payload FROM experiments WHERE id = ?", (identifier,)).fetchone()
        return {"id": row[0], "created_at": row[1], **json.loads(row[2])} if row else None

    def list(self, limit=50, offset=0, search=""):
        # Literal substring search: user input cannot become SQL or LIKE wildcards.
        where = " WHERE instr(lower(id || ' ' || json_extract(payload, '$.report.dataset_sha256') || ' ' || json_extract(payload, '$.report.seed') || ' ' || created_at), ?) > 0"
        parameters = (search.lower(),)
        with self.connect() as db:
            total = db.execute("SELECT COUNT(*) FROM experiments" + where, parameters).fetchone()[0]
            rows = db.execute("SELECT id, created_at, payload FROM experiments" + where + " ORDER BY created_at DESC, id LIMIT ? OFFSET ?", (*parameters, limit, offset)).fetchall()
        items = []
        for identifier, created_at, raw in rows:
            payload = json.loads(raw)
            report = payload["report"]
            items.append({"id": identifier, "created_at": created_at,
                          "mode": report["mode"], "dataset_sha256": report["dataset_sha256"],
                          "core_sha256": payload["provenance"]["core_sha256"],
                          "model": report["model"], "seed": report["seed"],
                          "configuration": report.get("configuration"),
                          "temporal_windows": len(report.get("temporal_evaluation", {}).get("folds", []))})
        return {"total": total, "items": items}
