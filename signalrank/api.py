from contextlib import asynccontextmanager
from importlib.resources import files
import json

from fastapi import FastAPI, Query
from fastapi.responses import HTMLResponse

from signalrank.core import Experiment, registry


@asynccontextmanager
async def lifespan(app):
    app.state.experiment = Experiment()
    yield


app = FastAPI(title="SignalRank AI", version="0.1.0", lifespan=lifespan)


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
