from contextlib import asynccontextmanager
from importlib.resources import files
import json
import os
from time import monotonic

from fastapi import FastAPI, Query, HTTPException, Request
from fastapi.responses import HTMLResponse, Response
from fastapi.staticfiles import StaticFiles

from signalrank.core import Experiment, registry
from signalrank.history import ExperimentStore, snapshot
from signalrank.inference import BatchRequest, BatchStore, BatchBodyLimit, sample, DatasetVersionConflict
from signalrank.contracts import fixture_report
from signalrank.scope import review as scope_review
from signalrank.study import audit as study_audit
from signalrank.bikes import load_report as load_bike_report
from signalrank.bike_reporting import markdown as bike_markdown
from signalrank.bike_audit import load as load_bike_audit
from signalrank.bike_external import load as load_bike_external, markdown as bike_external_markdown
from signalrank.diagnostics import build as diagnostics
from signalrank.uncertainty import compare_snapshots
from signalrank.reporting import markdown
from signalrank.evidence import build as evidence_summary, markdown as evidence_markdown
from signalrank.paths import data_home
from signalrank.storage import inventory
from signalrank.replay import at_checkpoint
from signalrank.studio import explain
from signalrank.inference import DESCRIPTIONS
from signalrank.deployment import Settings, ConfiguredHost, PublicBoundary, MemorySnapshotStore, lightweight_report
from typing import Literal
from pathlib import Path
from urllib.parse import urlsplit


@asynccontextmanager
async def lifespan(app):
    app.state.settings = Settings.load()
    app.state.public_budget = {"tokens": 120., "last": monotonic(), "active": 0}
    model_dir = os.environ.get("SIGNALRANK_TRUSTED_MODEL_DIR")
    if app.state.settings.public and (not model_dir or os.environ.get("SIGNALRANK_TRUSTED_MODEL_DIRS")):
        raise ValueError("Public demo requires one explicitly trusted build-time artifact; fallback training and extra models are disabled")
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
    if app.state.settings.public:
        required = {"diagnostics", "benchmark", "reliability", "replay", "challenge", "decision", "recovery"}
        if not required.issubset(app.state.experiment.report):
            raise ValueError("Public artifact is missing required offline evidence; startup will not compute a fallback")
    if "diagnostics" not in app.state.experiment.report:
        app.state.experiment.report["diagnostics"] = diagnostics(app.state.experiment)
    if app.state.settings.public:
        payload = snapshot(app.state.experiment)
        payload["report"] = lightweight_report(payload["report"])
        payload["provenance"] = {**payload["provenance"], "release_profile": "public_synthetic", "omitted_fields": "Complete replay/recovery ledgers; available through bounded evidence endpoints"}
        app.state.batches = None
        app.state.history = MemorySnapshotStore(payload)
        app.state.experiment_id = app.state.history.identifier
    else:
        app.state.batches = BatchStore()
        app.state.history = ExperimentStore()
        app.state.experiment_id = app.state.history.save(snapshot(app.state.experiment))
    yield


app = FastAPI(title="SignalRank AI", version="0.1.0", lifespan=lifespan)
app.add_middleware(BatchBodyLimit)
app.add_middleware(ConfiguredHost)
app.add_middleware(PublicBoundary)
app.mount("/static", StaticFiles(directory=str(files("signalrank").joinpath("static"))), name="static")


@app.get("/", response_class=HTMLResponse)
def dashboard():
    return files("signalrank").joinpath("static/index.html").read_text()


@app.get("/api/health")
def health():
    return {"status": "ok", "mode": "synthetic", "experiment_id": app.state.experiment_id,
            "profile": "public" if app.state.settings.public else "local", "visitor_storage": not app.state.settings.public}


@app.get("/api/experiments")
def experiments(limit: int = Query(default=50, ge=1, le=100), offset: int = Query(default=0, ge=0), search: str = Query(default="", max_length=128)):
    return {"current_id": app.state.experiment_id, **app.state.history.list(limit, offset, search)}


@app.get("/api/experiments/{identifier}")
def experiment_snapshot(identifier: str):
    result = app.state.history.get(identifier)
    if result is None:
        raise HTTPException(status_code=404, detail="Experiment snapshot not found")
    return result


def current_evidence():
    saved = app.state.history.get(app.state.experiment_id)
    model = next(iter(app.state.models.values()), (None, {}))[1]
    return evidence_summary(saved["report"], {"snapshot_id": saved["id"], "created_at": saved["created_at"], **saved["provenance"],
                            **{key: model[key] for key in ("artifact_id", "run_id", "runtime", "code_sha256") if key in model}})


@app.get("/api/evidence")
def evidence_report():
    return current_evidence()


@app.get("/api/export/evidence")
def export_evidence():
    return Response(evidence_markdown(current_evidence()), media_type="text/markdown",
                    headers={"Content-Disposition": 'attachment; filename="signalrank-evidence.md"'})


@app.get("/api/storage")
def storage_report():
    if app.state.settings.public:
        return {"status": "unavailable", "reason": "Storage inventory is local-only"}
    directory = os.environ.get("SIGNALRANK_TRUSTED_MODEL_DIR")
    root = Path(directory).resolve().parent.parent if directory else data_home() / "demo"
    try:
        result = inventory(root)
    except (OSError, ValueError, KeyError, TypeError) as error:
        raise HTTPException(409, "Storage inventory could not be read safely") from error
    return {"status": "available", **{key: value for key, value in result.items() if key != "plan"}}


@app.get("/api/bikes")
def bike_report():
    return load_bike_report(os.environ.get("SIGNALRANK_BIKE_ROOT"), public=app.state.settings.public)


@app.get("/api/bikes/audit")
def bike_audit():
    return load_bike_audit(os.environ.get("SIGNALRANK_BIKE_ROOT"), public=app.state.settings.public)


@app.get("/api/bikes/external")
def bike_external():
    return load_bike_external(os.environ.get("SIGNALRANK_BIKE_ROOT"), public=app.state.settings.public)


@app.get("/api/bikes/external/export")
def bike_external_export():
    result = bike_external()
    if result["status"] != "available":
        raise HTTPException(409, result["reason"])
    return Response(bike_external_markdown(result), media_type="text/markdown",
                    headers={"Content-Disposition": 'attachment; filename="signalrank-2019-source-gate.md"'})


@app.get("/api/bikes/export")
def bike_export():
    result = bike_report()
    if result["status"] != "available":
        raise HTTPException(409, result["reason"])
    return Response(bike_markdown(result), media_type="text/markdown",
                    headers={"Content-Disposition": 'attachment; filename="signalrank-bike-benchmark.md"'})


@app.get("/api/report")
def report():
    if app.state.settings.public:
        return {k: v for k, v in app.state.experiment.report.items() if k not in ("replay", "recovery", "challenge", "reliability", "diagnostics", "benchmark", "decision")}
    return app.state.experiment.report


@app.get("/api/studio/options")
def studio_options():
    return {"categories": list(DESCRIPTIONS), "models": [e for _, e in app.state.models.values()],
            "snapshot_id": app.state.experiment_id, "profile": "public" if app.state.settings.public else "local"}


@app.get("/api/studio/predict")
def studio_predict(category: int = Query(default=1, ge=0, le=4), severity: float = Query(default=5, ge=1, le=10, allow_inf_nan=False),
                   remote: bool = True, authentication_required: bool = False,
                   model_id: str = Query(default="", pattern="^([a-f0-9]{64})?$")):
    entry = app.state.models.get(model_id) if model_id else next(iter(app.state.models.values()), None)
    if entry is None:
        raise HTTPException(409, "Prediction Studio requires an explicitly trusted saved model; no fallback version or browser artifact loading")
    experiment, evidence = entry
    return {**explain(experiment, category, severity, remote, authentication_required), "model": evidence, "snapshot_id": app.state.experiment_id}


@app.get("/api/decision")
def decision_report():
    return {"snapshot_id": app.state.experiment_id, **app.state.experiment.report.get("decision", {
        "status": "unavailable", "warning": "No offline decision analysis loaded. Run the current local demo."})}


@app.get("/api/recovery")
def recovery_report():
    result = app.state.experiment.report.get("recovery")
    if not result:
        return {"status": "unavailable", "warning": "No offline recovery comparison loaded. Run the current local demo."}
    return {"status": "available", "snapshot_id": app.state.experiment_id,
            **{k: v for k, v in result.items() if k != "runs"},
            "runs": [{k: v for k, v in run.items() if k != "ledger"} for run in result["runs"]]}


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


@app.get("/api/replay")
def replay_report():
    result = app.state.experiment.report.get("replay")
    if result is None:
        return {"status": "unavailable", "warning": "No offline replay loaded. Run python -m signalrank.demo with the current checkout. No simulation or fitting occurs on requests."}
    return {"status": "available", "snapshot_id": app.state.experiment_id,
            **{k: v for k, v in result.items() if k != "runs"},
            "runs": [{k: v for k, v in run.items() if k != "ledger"} for run in result["runs"]]}


@app.get("/api/replay/checkpoint")
def replay_checkpoint(scenario: Literal["stable", "input_shift", "concept_shift"] = "stable", seed: int = Query(default=2718),
                      checkpoint: int = Query(default=0, ge=0, le=100), offset: int = Query(default=0, ge=0),
                      limit: int = Query(default=25, ge=1, le=100)):
    result = app.state.experiment.report.get("replay")
    run = next((r for r in result["runs"] if r["id"] == scenario and r["seed"] == seed), None) if result else None
    if run is None or checkpoint >= len(run["checkpoints"]):
        raise HTTPException(404, "Saved replay checkpoint not found")
    saved = at_checkpoint(run, checkpoint)
    return {"snapshot_id": app.state.experiment_id, "protocol": result["protocol"], "configuration": result["configuration"],
            "scenario": scenario, "seed": seed, "prediction_sha256": run["prediction_sha256"], "warning": result["warning"],
            "checkpoint": saved["checkpoint"], "total": len(saved["records"]), "offset": offset,
            "records": saved["records"][offset:offset + limit]}


@app.get("/api/replay/export")
def replay_export(scenario: Literal["stable", "input_shift", "concept_shift"] = "stable", seed: int = 2718,
                  checkpoint: int = Query(default=0, ge=0, le=100)):
    result = app.state.experiment.report.get("replay")
    run = next((r for r in result["runs"] if r["id"] == scenario and r["seed"] == seed), None) if result else None
    if run is None or checkpoint >= len(run["checkpoints"]):
        raise HTTPException(404, "Saved replay checkpoint not found")
    payload = {"snapshot_id": app.state.experiment_id, "protocol": result["protocol"], "configuration": result["configuration"],
               "warning": result["warning"], "scenario": scenario, "seed": seed, "prediction_sha256": run["prediction_sha256"],
               **at_checkpoint(run, checkpoint)}
    return Response(json.dumps(payload, allow_nan=False), media_type="application/json",
                    headers={"Content-Disposition": 'attachment; filename="signalrank-replay-checkpoint.json"'})


@app.get("/api/challenge")
def challenge_report():
    result = app.state.experiment.report.get("challenge")
    return {"status": "available", "snapshot_id": app.state.experiment_id, **result} if result else {
        "status": "unavailable", "warning": "No offline challenge suite loaded. Run python -m signalrank.demo with the current checkout. No candidate fitting occurs on requests."}


@app.get("/api/comparison")
def comparison(a: str = Query(pattern="^[a-f0-9]{64}$"), b: str = Query(pattern="^[a-f0-9]{64}$")):
    left, right = app.state.history.get(a), app.state.history.get(b)
    if left is None or right is None:
        raise HTTPException(404, "Snapshot not found")
    return {"snapshot_a": a, "snapshot_b": b, **compare_snapshots(left, right)}


@app.get("/api/inference/models")
def inference_models():
    if app.state.settings.public:
        return {"items": [], "warning": "The public demo disables shared visitor batch receipts. Prediction Studio remains interactive; run locally for saved batches."}
    return {"items": [evidence for _, evidence in app.state.models.values()],
            "warning": "Only artifacts explicitly trusted at server startup can be selected. No browser model upload or arbitrary path loading."}


@app.get("/api/inference/sample")
def inference_sample(seed: int = Query(default=2026, ge=0, le=2**32 - 1), count: int = Query(default=20, ge=1, le=500)):
    return {"source": "synthetic", "schema_version": "fictional-input-v1", "dataset_version": f"sample-{seed}-{count}", "records": sample(seed, count)}


@app.post("/api/batches", status_code=201)
def run_batch(body: BatchRequest, request: Request):
    if app.state.settings.public:
        raise HTTPException(403, "Visitor batch storage is disabled")
    origin = request.headers.get("origin")
    if origin and (urlsplit(origin).netloc != request.url.netloc or urlsplit(origin).scheme != request.url.scheme):
        raise HTTPException(403, "Cross-origin batch creation is not permitted")
    entry = app.state.models.get(body.model_id)
    if entry is None:
        raise HTTPException(409, "Select an artifact explicitly trusted at server startup; batch not saved")
    experiment, evidence = entry
    try:
        return app.state.batches.save(body, experiment, evidence)
    except DatasetVersionConflict as error:
        raise HTTPException(409, str(error)) from error


@app.get("/api/batches")
def batches(limit: int = Query(default=10, ge=1, le=100), offset: int = Query(default=0, ge=0)):
    if app.state.settings.public:
        return {"total": 0, "items": []}
    return app.state.batches.list(limit, offset)


@app.get("/api/batches/{identifier}")
def batch(identifier: str):
    if app.state.settings.public:
        raise HTTPException(404, "No shared visitor receipts in the public demo")
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
    if app.state.settings.public:
        return {"synthetic": registry()["synthetic"]}
    return registry()


@app.get("/api/scope")
def scope_report():
    result = scope_review(public=app.state.settings.public)
    result["training_scope"] = "Original synthetic/KEV pipeline. The independent local bike-demand benchmark has its own protocol and attribution."
    return result


@app.get("/api/study-readiness")
def study_readiness():
    return study_audit(public=app.state.settings.public)


@app.get("/api/contracts")
def contract_report():
    return fixture_report()


@app.get("/api/feasibility")
def feasibility():
    if app.state.settings.public:
        return {"training_enabled": False, "decision": "Official-data auditing is local-only", "sample": [], "additions_by_year": {}}
    artifact = files("signalrank").joinpath("feasibility.json")
    if not artifact.is_file():
        return {"training_enabled": False, "decision": "Audit has not been run", "sample": []}
    return json.loads(artifact.read_text())


@app.get("/api/validation")
def validation():
    if app.state.settings.public:
        return {"training_enabled": False, "checked": 0, "timestamp_checks_passed": 0, "label_counts": {}, "rows": []}
    artifact = files("signalrank").joinpath("validation.json")
    if not artifact.is_file():
        return {"training_enabled": False, "checked": 0, "timestamp_checks_passed": 0, "label_counts": {}, "rows": []}
    return json.loads(artifact.read_text())


@app.get("/api/simulate")
def simulate(budget: int = Query(default=50, ge=1, le=100)):
    return app.state.experiment.simulate(budget)


@app.get("/api/cohort")
def cohort():
    if app.state.settings.public:
        return {"frame_count": 0, "sample_count": 0, "selected_ids": [], "training_enabled": False, "scope": "Original synthetic demo only; official-data inventory is local-only"}
    artifact = files("signalrank").joinpath("cohort.json")
    if not artifact.is_file():
        return {"frame_count": 0, "sample_count": 0, "selected_ids": [], "training_enabled": False, "scope": "No frame acquired yet"}
    return json.loads(artifact.read_text())


def readiness_report():
    if app.state.settings.public:
        return {"training_enabled": False, "selected": 0, "processed": 0, "pending": 0, "states": {}, "candidate_labels": {}, "blockers": ["Public profile contains no official-data audit records. Run the local workbench for that separate gated study."], "rows": []}
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
