from contextlib import asynccontextmanager
from importlib.resources import files
import json

from fastapi import FastAPI, Query, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

from signalrank.core import Experiment, registry


@asynccontextmanager
async def lifespan(app):
    app.state.experiment = Experiment()
    yield


app = FastAPI(title="SignalRank AI", version="0.1.0", lifespan=lifespan)
app.mount("/static", StaticFiles(directory=str(files("signalrank").joinpath("static"))), name="static")


@app.get("/", response_class=HTMLResponse)
def dashboard():
    return files("signalrank").joinpath("static/index.html").read_text()


@app.get("/api/health")
def health():
    return {"status": "ok", "mode": "synthetic"}


@app.get("/api/report")
def report():
    return app.state.experiment.report


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
