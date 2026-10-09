"""Bounded fictional batch inputs and append-only local inference receipts."""
from datetime import datetime, timezone
from contextlib import contextmanager
from hashlib import sha256
import json
import os
from pathlib import Path
import sqlite3
from uuid import uuid4
from importlib.resources import files

import numpy as np
from pydantic import Field
from signalrank.contracts import DESCRIPTIONS, FictionalRecord, DatasetEnvelope, summary, decode_json


class BatchRequest(DatasetEnvelope):
    model_id: str = Field(pattern=r"^[a-f0-9]{64}$")


class DatasetVersionConflict(ValueError):
    pass


def sample(seed=2026, count=20):
    rng = np.random.default_rng(seed)
    return [{"id": f"SYN-BATCH-{i:04d}", "description": DESCRIPTIONS[int(rng.integers(5))],
             "severity": float(np.round(rng.uniform(1, 10), 1)), "remote": bool(rng.integers(2)),
             "authentication_required": bool(rng.integers(2))} for i in range(count)]


def fingerprint(value):
    return sha256(json.dumps(value, sort_keys=True, separators=(",", ":"), allow_nan=False).encode()).hexdigest()


class BatchStore:
    def __init__(self, path=None):
        self.path = Path(path or os.environ.get("SIGNALRANK_BATCH_PATH", "artifacts/batches.sqlite3"))
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self.connect() as db:
            db.execute("CREATE TABLE IF NOT EXISTS batches (id TEXT PRIMARY KEY, created_at TEXT NOT NULL, payload TEXT NOT NULL, sha256 TEXT NOT NULL)")
            db.execute("CREATE TABLE IF NOT EXISTS dataset_versions (version TEXT PRIMARY KEY, input_sha256 TEXT NOT NULL)")

    @contextmanager
    def connect(self):
        db = sqlite3.connect(self.path, timeout=10)
        try:
            with db:
                yield db
        finally:
            db.close()

    def save(self, request, experiment, model_evidence):
        # Revalidate even constructed Python models before executing any prediction.
        request = BatchRequest.model_validate(request.model_dump())
        contract = summary(request)
        with self.connect() as db:
            db.execute("BEGIN IMMEDIATE")
            if request.dataset_version:
                previous = db.execute("SELECT input_sha256 FROM dataset_versions WHERE version=?", (request.dataset_version,)).fetchone()
                if previous and previous[0] != contract["input_sha256"]:
                    raise DatasetVersionConflict("Dataset version already names different inputs; choose a new version before predicting")
            return self._save_validated(db, request, experiment, model_evidence, contract)

    def _save_validated(self, db, request, experiment, model_evidence, contract):
        records = [row.model_dump() for row in request.records]
        p = experiment.predict(records)
        if not np.isfinite(p).all() or ((p < 0) | (p > 1)).any():
            raise ValueError("Model produced invalid probabilities; batch not saved")
        order = np.argsort(-p, kind="stable")
        receipt = {"id": uuid4().hex, "created_at": datetime.now(timezone.utc).isoformat(), "mode": "synthetic",
                   "protocol": "fictional-batch-v1", "inference_code_sha256": sha256(files("signalrank").joinpath("inference.py").read_bytes()).hexdigest(),
                   "input_sha256": fingerprint({"source": request.source, "records": records}),
                   "input_order": [r["id"] for r in records], "model": model_evidence,
                   "count": len(records), "target": experiment.report["target"],
                   "input_contract": contract,
                   "contract_code_sha256": sha256(files("signalrank").joinpath("contracts.py").read_bytes()).hexdigest(),
                   "items": [{**records[i], "rank": rank, "probability": float(p[i])} for rank, i in enumerate(order, 1)],
                   "warning": "Fictional inference only. No observed outcomes or performance metrics; rankings are not operational advice. Inputs use the training generator's category vocabulary. No model is fitted by this request."}
        digest = fingerprint(receipt)
        db.execute("INSERT INTO batches VALUES (?, ?, ?, ?)", (receipt["id"], receipt["created_at"], json.dumps(receipt, allow_nan=False), digest))
        if request.dataset_version:
            db.execute("INSERT OR IGNORE INTO dataset_versions VALUES (?, ?)", (request.dataset_version, contract["input_sha256"]))
        return {**receipt, "receipt_sha256": digest}

    def get(self, identifier):
        with self.connect() as db:
            row = db.execute("SELECT payload, sha256 FROM batches WHERE id=?", (identifier,)).fetchone()
        if row is None:
            return None
        value = json.loads(row[0])
        if fingerprint(value) != row[1]:
            raise ValueError("Stored batch receipt integrity check failed")
        return {**value, "receipt_sha256": row[1]}

    def list(self, limit=10, offset=0):
        with self.connect() as db:
            count = db.execute("SELECT COUNT(*) FROM batches").fetchone()[0]
            rows = db.execute("SELECT id FROM batches ORDER BY created_at DESC, id LIMIT ? OFFSET ?", (limit, offset)).fetchall()
        items = [self.get(row[0]) for row in rows]
        return {"total": count, "items": [{key: item[key] for key in ("id", "created_at", "count", "input_sha256", "model", "receipt_sha256")} for item in items]}


class BatchBodyLimit:
    """Buffer only bounded POST bodies, independent of Content-Length honesty."""
    def __init__(self, app, maximum=256 * 1024):
        self.app, self.maximum = app, maximum

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http" or scope["method"] != "POST" or scope["path"] != "/api/batches":
            return await self.app(scope, receive, send)
        chunks, size = [], 0
        while True:
            message = await receive()
            if message["type"] == "http.disconnect":
                return
            chunk = message.get("body", b"")
            size += len(chunk)
            if size > self.maximum:
                from starlette.responses import JSONResponse
                return await JSONResponse({"detail": "Batch body exceeds 256 KiB"}, status_code=413)(scope, receive, send)
            chunks.append(chunk)
            if not message.get("more_body", False):
                break
        body = b"".join(chunks)
        try:
            decode_json(body)
        except (ValueError, UnicodeError, RecursionError):
            from starlette.responses import JSONResponse
            return await JSONResponse({"detail": "Batch JSON must have unique fields, finite values and valid bounded structure"}, status_code=422)(scope, receive, send)
        supplied = False
        async def bounded_receive():
            nonlocal supplied
            if not supplied:
                supplied = True
                return {"type": "http.request", "body": body, "more_body": False}
            return await receive()
        return await self.app(scope, bounded_receive, send)
