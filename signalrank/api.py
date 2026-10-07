from contextlib import asynccontextmanager
from importlib.resources import files
import json
import os

from fastapi import FastAPI, Query, HTTPException, Request
from fastapi.responses import HTMLResponse, Response
from fastapi.staticfiles import StaticFiles

from signalrank.core import Experiment, registry
from signalrank.history import ExperimentStore, snapshot
from signalrank.inference import BatchRequest, BatchStore, BatchBodyLimit, sample
from signalrank.diagnostics import build as diagnostics
from signalrank.uncertainty import compare_snapshots
from signalrank.reporting import markdown
from pathlib import Path
from urllib.parse import urlsplit
from starlette.middleware.trustedhost import TrustedHostMiddleware


@asynccontextmanager
async def lifespan(app):
    model_dir = os.environ.get("SIGNALRANK_TRUSTED_MODEL_DIR")
    directories = list(dict.fromkeys(filter(None, [model_dir, *os.environ.get("SIGNALRANK_TRUSTED_MODEL_DIRS", "").split(os.pathsep)])))
    app.state.models = {}
    for directory in directories:
        from signalrank.training import load_artifact
        experiment = load_artifact(directory, trusted_local=True)
        manifest = json.loads((Path(directory) / "manifest.json").read_text())
        run = json.loads((Path(directory) / "run.json").read_text())
        evidence = {"artifact_id": manifest["artifact_id"], "run_id": run["run_id"],
                    "configuration": manifest["configuration"], "dataset_sha256": manifest["dataset_sha256"],
                    "code_sha256": manifest["code_sha256"], "runtime": manifest["runtime"]}
        app.state.models[manifest["artifact_id"]] = (experiment, evidence)
    if model_dir:
        app.state.experiment = next(iter(app.state.models.values()))[0]
    else:
        app.state.experiment = Experiment()
    if "diagnostics" not in app.state.experiment.report:
        app.state.experiment.report["diagnostics"] = diagnostics(app.state.experiment)
    app.state.batches = BatchStore()
    app.state.history = ExperimentStore()
    app.state.experiment_id = app.state.history.save(snapshot(app.state.experiment))
    yield


app = FastAPI(title="SignalRank AI", version="0.1.0", lifespan=lifespan)
app.add_middleware(BatchBodyLimit)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["127.0.0.1", "localhost", "[::1]", "testserver"])
app.mount("/static", StaticFiles(directory=str(files("signalrank").joinpath("static"))), name="static")


@app.get("/", response_class=HTMLResponse)
def dashboard():
    return files("signalrank").joinpath("static/index.html").read_text()


@app.get("/api/health")
def health():
    return {"status": "ok", "mode": "synthetic", "experiment_id": app.state.experiment_id}


@app.get("/api/experiments")
def experiments(limit: int = Query(default=50, ge=1, le=100), offset: int = Query(default=0, ge=0), search: str = Query(default="", max_length=128)):
    return {"current_id": app.state.experiment_id, **app.state.history.list(limit, offset, search)}


@app.get("/api/experiments/{identifier}")
def experiment_snapshot(identifier: str):
    result = app.state.history.get(identifier)
    if result is None:
        raise HTTPException(status_code=404, detail="Experiment snapshot not found")
    return result


@app.get("/api/report")
def report():
    return app.state.experiment.report


@app.get("/api/diagnostics")
def diagnostic_report():
    return {"snapshot_id": app.state.experiment_id, **app.state.experiment.report["diagnostics"]}


@app.get("/api/benchmark")
def benchmark_report():
    return {"snapshot_id": app.state.experiment_id, **app.state.experiment.report.get("benchmark", {
        "items": [], "warning": "No offline benchmark loaded. Train offline and start with SIGNALRANK_TRUSTED_MODEL_DIR."})}


@app.get("/api/reliability")
def reliability_report():
    result = app.state.experiment.report.get("reliability")
    if result is None:
        return {"status": "unavailable", "snapshot_id": app.state.experiment_id,
                "warning": "No offline reliability run loaded. Run python -m signalrank.demo with your project environment. The API never fits reliability probes on request."}
    return {"status": "available", "snapshot_id": app.state.experiment_id, **result}


@app.get("/api/export/report")
def export_report():
    saved = app.state.history.get(app.state.experiment_id)
    return Response(markdown(saved["report"], {"snapshot_id": saved["id"],
                    "snapshot_created_at": saved["created_at"], **saved["provenance"]}),
                    media_type="text/markdown", headers={"Content-Disposition": 'attachment; filename="signalrank-experiment.md"'})


@app.get("/api/comparison")
def comparison(a: str = Query(pattern="^[a-f0-9]{64}$"), b: str = Query(pattern="^[a-f0-9]{64}$")):
    left, right = app.state.history.get(a), app.state.history.get(b)
    if left is None or right is None:
        raise HTTPException(404, "Snapshot not found")
    return {"snapshot_a": a, "snapshot_b": b, **compare_snapshots(left, right)}


@app.get("/api/inference/models")
def inference_models():
    return {"items": [evidence for _, evidence in app.state.models.values()],
            "warning": "Only artifacts explicitly trusted at server startup can be selected. No browser model upload or arbitrary path loading."}


@app.get("/api/inference/sample")
def inference_sample(seed: int = Query(default=2026, ge=0, le=2**32 - 1), count: int = Query(default=20, ge=1, le=500)):
    return {"source": "synthetic", "records": sample(seed, count)}


@app.post("/api/batches", status_code=201)
def run_batch(body: BatchRequest, request: Request):
    origin = request.headers.get("origin")
    if origin and (urlsplit(origin).netloc != request.url.netloc or urlsplit(origin).scheme != request.url.scheme):
        raise HTTPException(403, "Cross-origin batch creation is not permitted")
    entry = app.state.models.get(body.model_id)
    if entry is None:
        raise HTTPException(409, "Select an artifact explicitly trusted at server startup; batch not saved")
    experiment, evidence = entry
    return app.state.batches.save(body, experiment, evidence)


@app.get("/api/batches")
def batches(limit: int = Query(default=10, ge=1, le=100), offset: int = Query(default=0, ge=0)):
    return app.state.batches.list(limit, offset)


@app.get("/api/batches/{identifier}")
def batch(identifier: str):
    receipt = app.state.batches.get(identifier)
    if receipt is None:
        raise HTTPException(404, "Batch receipt not found")
    return receipt


@app.get("/api/temporal")
def temporal_report():
    return app.state.experiment.report.get("temporal_evaluation", {
        "mode": "synthetic", "folds": [], "warning": "No temporal run loaded. Train offline and start with SIGNALRANK_TRUSTED_MODEL_DIR to inspect it."})


@app.get("/api/forecasts")
def forecasts(limit: int = Query(default=20, ge=1, le=100)):
    return {"mode": "synthetic", "items": app.state.experiment.forecasts(limit)}


@app.get("/api/sources")
def sources():
    return registry()


@app.get("/api/feasibility")
def feasibility():
    artifact = files("signalrank").joinpath("feasibility.json")
    if not artifact.is_file():
        return {"training_enabled": False, "decision": "Audit has not been run", "sample": []}
    return json.loads(artifact.read_text())


@app.get("/api/validation")
def validation():
    artifact = files("signalrank").joinpath("validation.json")
    if not artifact.is_file():
        return {"training_enabled": False, "checked": 0, "timestamp_checks_passed": 0, "label_counts": {}, "rows": []}
    return json.loads(artifact.read_text())


@app.get("/api/simulate")
def simulate(budget: int = Query(default=50, ge=1, le=100)):
    return app.state.experiment.simulate(budget)


@app.get("/api/cohort")
def cohort():
    artifact = files("signalrank").joinpath("cohort.json")
    if not artifact.is_file():
        return {"frame_count": 0, "sample_count": 0, "selected_ids": [], "training_enabled": False, "scope": "No frame acquired yet"}
    return json.loads(artifact.read_text())


def readiness_report():
    artifact = files("signalrank").joinpath("readiness.json")
    if not artifact.is_file():
        return {"training_enabled": False, "selected": 0, "processed": 0, "pending": 0, "states": {}, "candidate_labels": {}, "blockers": ["Dataset reconstruction has not run."], "rows": []}
    return json.loads(artifact.read_text())


@app.get("/api/dataset")
def dataset():
    return {k: v for k, v in readiness_report().items() if k != "rows"}


@app.get("/api/dataset/records")
def dataset_records(search: str = Query(default="", max_length=64), state: str = Query(default="", pattern="^(candidate|excluded|retryable error)?$"), offset: int = Query(default=0, ge=0), limit: int = Query(default=25, ge=1, le=100)):
    rows = [r for r in readiness_report()["rows"] if search.upper() in r["id"] and (not state or r["state"] == state)]
    return {"total": len(rows), "offset": offset, "items": [{k: v for k, v in row.items() if k != "evidence"} for row in rows[offset:offset + limit]]}


@app.get("/api/dataset/records/{identifier}")
def dataset_record(identifier: str):
    row = next((r for r in readiness_report()["rows"] if r["id"] == identifier), None)
    if row is None:
        raise HTTPException(status_code=404, detail="Record not found in reconstructed selection")
    return row
