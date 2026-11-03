"""Separate, bounded real-data benchmark. Web requests only read saved JSON."""
import argparse
import csv
from datetime import datetime, timedelta, timezone
from hashlib import sha256
from importlib.resources import files
import io
import json
import math
import os
from pathlib import Path
import platform
import stat
from time import process_time
from urllib.request import Request, build_opener, HTTPRedirectHandler
from uuid import uuid4
import zipfile

import numpy as np
import sklearn
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import average_precision_score, brier_score_loss
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from threadpoolctl import threadpool_limits

from signalrank.paths import data_home

TZ = timezone(timedelta(hours=9))
MAX_BYTES = 2 * 1024 * 1024
MAX_STORAGE = 20 * 1024 * 1024
FEATURES = ["Latest completed hour", "Previous day at issue hour", "Previous week at issue hour", "Target hour last week",
            "Mean last 24 hours", "Mean last 168 hours", "Demand change over 24 hours",
            "Target hour sine", "Target hour cosine", "Target weekday sine", "Target weekday cosine"]
SOURCE_FIELDS = {"Date", "Rented Bike Count", "Hour", "Temperature(°C)", "Humidity(%)", "Wind speed (m/s)",
                 "Visibility (10m)", "Dew point temperature(°C)", "Solar Radiation (MJ/m2)", "Rainfall(mm)",
                 "Snowfall (cm)", "Seasons", "Holiday", "Functioning Day"}


def resource(name):
    return files("signalrank").joinpath(name).read_bytes()


def source():
    value = json.loads(resource("bike-source.json"))
    if value["id"] != "uci-seoul-560" or value["csv_name"] != "SeoulBikeData.csv" or value["download_url"] != "https://archive.ics.uci.edu/static/public/560/seoul%2Bbike%2Bsharing%2Bdemand.zip":
        raise ValueError("Unsupported source location or filename")
    return value


def protocol():
    return json.loads(resource("bike-protocol.json"))


def digest(payload):
    return sha256(payload).hexdigest()


def fingerprints():
    return {name: digest(resource(name)) for name in ("bikes.py", "bike-protocol.json", "bike-source.json", "BIKE-NOTICE.txt")}


def root_path(root=None):
    path = Path(root).expanduser() if root is not None else data_home() / "bikes"
    if path.is_symlink(): raise ValueError("Benchmark root must not be a symlink")
    return path.resolve()


def storage_bytes(root):
    total = 0
    for parent, directories, names in os.walk(root, followlinks=False):
        for name in [*directories, *names]:
            path = Path(parent) / name
            if path.is_symlink(): raise ValueError("Benchmark storage must not contain symlinks")
            if path.is_file(): total += path.stat().st_size
    return total


def save_exclusive(path, payload):
    if len(payload) > MAX_BYTES: raise ValueError("Artifact exceeds 2 MiB")
    with path.open("xb") as stream: stream.write(payload)


def strict_json(payload):
    def reject(value): raise ValueError("Non-finite JSON is not supported")
    return json.loads(payload, parse_constant=reject)


def parse_csv(payload, *, complete=True):
    if len(payload) > MAX_BYTES: raise ValueError("CSV exceeds 2 MiB")
    try:
        text = payload.decode("utf-8-sig")
    except UnicodeDecodeError:
        text = payload.decode("cp1252")
    reader = csv.DictReader(io.StringIO(text))
    fields = reader.fieldnames or []
    if len(fields) != len(set(fields)) or set(fields) != SOURCE_FIELDS:
        raise ValueError("Unexpected or duplicate CSV columns")
    rows = []
    for raw in reader:
        if set(raw) != SOURCE_FIELDS or any(raw[k] is None for k in ("Date", "Hour", "Rented Bike Count")):
            raise ValueError("Missing or extra CSV fields")
        if not raw["Hour"].isdigit() or not raw["Rented Bike Count"].isdigit():
            raise ValueError("Hour/count must be nonnegative integers")
        hour, count = int(raw["Hour"]), int(raw["Rented Bike Count"])
        if not 0 <= hour <= 23 or not 0 <= count <= 100000:
            raise ValueError("Hour/count outside contract bounds")
        stamp = datetime.strptime(raw["Date"], "%d/%m/%Y").replace(hour=hour, tzinfo=TZ)
        if rows and stamp != rows[-1]["at"] + timedelta(hours=1):
            raise ValueError("Duplicate, unordered or missing hour; no silent repair")
        rows.append({"at": stamp, "count": count})
        if len(rows) > 8760: raise ValueError("Too many source hours")
    if not rows: raise ValueError("Empty source")
    if complete and (len(rows) != 8760 or rows[0]["at"] != datetime(2017, 12, 1, tzinfo=TZ) or
                     rows[-1]["at"] != datetime(2018, 11, 30, 23, tzinfo=TZ)):
        raise ValueError("Unexpected city-year coverage")
    return rows


def acquire(root=None):
    root = root_path(root)
    spec = source()
    if not spec.get("csv_sha256") or not spec.get("zip_sha256"):
        raise ValueError("Source checksums must be pinned before this benchmark can run")
    root.mkdir(parents=True, exist_ok=True)
    if storage_bytes(root) > MAX_STORAGE: raise ValueError("20 MiB local storage budget reached")
    csv_path = root / spec["csv_name"]
    if csv_path.exists():
        if csv_path.stat().st_size > MAX_BYTES: raise ValueError("Cached CSV exceeds 2 MiB")
        payload = csv_path.read_bytes()
        if digest(payload) != spec["csv_sha256"]: raise ValueError("Cached CSV differs from pinned source")
        parse_csv(payload)
        return csv_path
    if storage_bytes(root) + 2 * MAX_BYTES + 20000 > MAX_STORAGE:
        raise ValueError("20 MiB local storage budget reached")
    class NoRedirect(HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, headers, newurl):
            raise ValueError("Source redirected; review the new location")
    with build_opener(NoRedirect).open(Request(spec["download_url"], headers={"User-Agent": "SignalRank-local-bike-benchmark"}), timeout=30) as response:
        if int(response.headers.get("Content-Length", "0")) > MAX_BYTES: raise ValueError("Download exceeds 2 MiB")
        archive = response.read(MAX_BYTES + 1)
    if len(archive) > MAX_BYTES or digest(archive) != spec["zip_sha256"]:
        raise ValueError("Download size or pinned archive checksum differs")
    with zipfile.ZipFile(io.BytesIO(archive)) as zipped:
        matches = [entry for entry in zipped.infolist() if entry.filename == spec["csv_name"]]
        if len(matches) != 1 or len(zipped.infolist()) > 8: raise ValueError("Unexpected source archive layout")
        info = matches[0]
        if info.file_size > MAX_BYTES or stat.S_ISLNK(info.external_attr >> 16): raise ValueError("Unsafe source member")
        with zipped.open(info) as stream: payload = stream.read(MAX_BYTES + 1)
    if len(payload) > MAX_BYTES or digest(payload) != spec["csv_sha256"]:
        raise ValueError("Extracted CSV differs from pinned source")
    parse_csv(payload)
    save_exclusive(csv_path, payload)
    if not (root / "source.zip").exists(): save_exclusive(root / "source.zip", archive)
    if not (root / "NOTICE.txt").exists(): save_exclusive(root / "NOTICE.txt", resource("BIKE-NOTICE.txt"))
    receipt = {"source": spec, "download_bytes": len(archive), "csv_bytes": len(payload), "attribution": resource("BIKE-NOTICE.txt").decode()}
    if not (root / "source-receipt.json").exists(): save_exclusive(root / "source-receipt.json", json.dumps(receipt, indent=2).encode())
    return csv_path


def examples(rows):
    counts = np.array([r["count"] for r in rows], dtype=float)
    result = []
    for i in range(168, len(rows) - 24):
        at = rows[i]["at"] + timedelta(hours=1)
        target = rows[i + 24]["at"]
        hour, weekday = target.hour, target.weekday()
        values = [counts[i], counts[i-24], counts[i-168], counts[i-144], float(counts[i-23:i+1].mean()),
                  float(counts[i-167:i+1].mean()), counts[i]-counts[i-24], math.sin(2*math.pi*hour/24),
                  math.cos(2*math.pi*hour/24), math.sin(2*math.pi*weekday/7), math.cos(2*math.pi*weekday/7)]
        result.append({"at": at, "target_at": target + timedelta(hours=1), "count": rows[i+24]["count"], "x": values})
    return result


def partitions(records, design=None):
    design = design or protocol()
    boundaries = [datetime.fromisoformat(design["boundaries"][name]) for name in ("calibration", "development", "final")]
    result = {name: [] for name in ("train", "calibration", "development", "final")}
    purged = 0
    for row in records:
        index = sum(row["at"] >= boundary for boundary in boundaries)
        if index < 3 and row["target_at"] >= boundaries[index]:
            purged += 1
            continue
        result[list(result)[index]].append(row)
    if any(not rows for rows in result.values()): raise ValueError("Empty chronological partition")
    return result, purged


def scores(y, rank, *, probability=False):
    if len(np.unique(y)) != 2: raise ValueError("Both outcome classes are required; no resampling repair")
    budget = max(1, math.ceil(len(y)*.1))
    selected = np.argsort(-rank, kind="stable")[:budget]
    captured, positives = int(y[selected].sum()), int(y.sum())
    return {"average_precision": float(average_precision_score(y, rank)),
            "brier_score": float(brier_score_loss(y, rank)) if probability else None,
            "count": len(y), "positives": positives, "prevalence": float(y.mean()), "budget": budget,
            "captured": captured, "missed": positives-captured, "selected_negatives": budget-captured,
            "precision": captured/budget, "recall": captured/positives}


def bins(y, p):
    assignments = np.minimum((p*10).astype(int), 9)
    return [{"lower": i/10, "upper": (i+1)/10, "count": int((assignments==i).sum()),
             "predicted": float(p[assignments==i].mean()) if (assignments==i).any() else None,
             "observed": float(y[assignments==i].mean()) if (assignments==i).any() else None} for i in range(10)]


def logit(model, x):
    if hasattr(model, "decision_function"): return model.decision_function(x)
    p = np.clip(model.predict_proba(x)[:, 1], 1e-9, 1-1e-9)
    return np.log(p/(1-p))


def evaluate(rows, *, fixture=False):
    started = process_time()
    design = protocol()
    groups, purged = partitions(examples(rows), design)
    xs = {name: np.array([r["x"] for r in values]) for name, values in groups.items()}
    target_counts = np.array([r["count"] for r in groups["train"]])
    threshold = int(np.quantile(target_counts, .8, method="higher"))
    ys = {name: np.array([int(r["count"] >= threshold) for r in values]) for name, values in groups.items()}
    if any(len(np.unique(y)) != 2 for y in ys.values()):
        raise ValueError("Class-deficient partition; benchmark is not evaluable")
    models = {"logistic": make_pipeline(StandardScaler(), LogisticRegression(**design["models"]["logistic"])),
              "boosted": HistGradientBoostingClassifier(**design["models"]["boosted"])}
    fitted, predictions, comparisons = {}, {name: {} for name in ("development", "final")}, {name: [] for name in ("development", "final")}
    names = {"logistic": "Logistic regression · calibrated", "boosted": "Histogram boosting · calibrated"}
    with threadpool_limits(limits=1):
        for key, model in models.items():
            model.fit(xs["train"], ys["train"])
            calibration = LogisticRegression(C=1., max_iter=1000).fit(logit(model, xs["calibration"]).reshape(-1,1), ys["calibration"])
            fitted[key] = (model, calibration)
            for part in comparisons:
                p = calibration.predict_proba(logit(model, xs[part]).reshape(-1,1))[:, 1]
                predictions[part][key] = p
                comparisons[part].append({"id": key, "name": names[key], **scores(ys[part], p, probability=True)})
            if process_time()-started > 120: raise ValueError("120-second CPU budget exceeded")
        prevalence = float(ys["train"].mean())
        for part in comparisons:
            for key, name, values, probability in [
                ("latest", "Latest-hour demand", xs[part][:,0], False),
                ("weekly", "Same target hour last week", xs[part][:,3], False),
                ("prevalence", "Training prevalence", np.full(len(ys[part]), prevalence), True)]:
                predictions[part][key] = values
                comparisons[part].append({"id": key, "name": name, **scores(ys[part], values, probability=probability)})
    result = {"protocol": design["id"], "mode": "real_data_benchmark", "fixture": fixture,
              "target": "High citywide rental demand in the corresponding next-day hour", "horizon_hours": 24,
              "threshold": threshold, "threshold_origin": "Training target-count 80th percentile; higher method; positive is >= threshold",
              "primary": "logistic", "features": FEATURES, "source_hours": len(rows), "purged": purged,
              "partitions": {name: {"count": len(values), "positives": int(ys[name].sum()), "first": values[0]["at"].isoformat(),
                                     "last": values[-1]["at"].isoformat(), "last_target_at": values[-1]["target_at"].isoformat()} for name, values in groups.items()},
              "comparisons": comparisons, "calibration": {}, "slices": [], "errors": [], "timeline": [],
              "warning": "Historical citywide-demand benchmark. It does not validate the synthetic/KEV model, predict shortages or establish operational benefit.",
              "limitations": design["limitations"] + ["The fixed comparison family was declared before the first final evaluation. This final interval is now evaluated and cannot be reused as untouched evidence for later tuning.",
                                                      "Reported differences are descriptive; no significance or confidence-coverage claim. All outcomes are historical.", "Stable source-order ties apply. The constant-prevalence baseline selects the earliest hours under a tied budget; it is not a random-selection run."]}
    final, y, p = groups["final"], ys["final"], predictions["final"]["logistic"]
    for key in models: result["calibration"][key] = bins(y, predictions["final"][key])
    for month in sorted({r["at"].strftime("%Y-%m") for r in final}):
        idx = np.array([i for i,r in enumerate(final) if r["at"].strftime("%Y-%m") == month])
        enough = y[idx].sum() >= 5 and (1-y[idx]).sum() >= 5 and len(idx) >= 30
        result["slices"].append({"month": month, "count": len(idx), "positives": int(y[idx].sum()),
                                 "metrics": scores(y[idx],p[idx],probability=True) if enough else None,
                                 "warning": "Slice metrics use their own retrospective 10% budget; not a shared global budget or evidence of statistical adequacy."})
    order = np.argsort(-p,kind="stable")
    selected = set(order[:math.ceil(len(y)*.1)].tolist())
    model, calibration = fitted["logistic"]
    scaler, classifier = model[0], model[1]
    for kind, indices in [("selected negative", [i for i in order if i in selected and not y[i]][:6]),
                          ("missed positive", [i for i in order if i not in selected and y[i]][:6])]:
        for i in indices:
            terms = scaler.transform(xs["final"][[i]])[0]*classifier.coef_[0]
            result["errors"].append({"kind":kind,"at":final[i]["at"].isoformat(),"target_at":final[i]["target_at"].isoformat(),
                                     "count":final[i]["count"],"outcome":int(y[i]),"probability":float(p[i]),
                                     "intercept":float(classifier.intercept_[0]),"logit":float(model.decision_function(xs["final"][[i]])[0]),
                                     "factors":[{"feature":name,"value":float(value)} for name,value in zip(FEATURES,terms)],
                                     "calibration":{"slope":float(calibration.coef_[0,0]),"intercept":float(calibration.intercept_[0])}})
    for day in sorted({r["at"].date().isoformat() for r in final}):
        idx = [i for i,r in enumerate(final) if r["at"].date().isoformat() == day]
        result["timeline"].append({"day":day,"hours":len(idx),"observed_fraction":float(y[idx].mean()),
                                   "logistic":float(predictions["final"]["logistic"][idx].mean()),"boosted":float(predictions["final"]["boosted"][idx].mean())})
    if process_time()-started > 120: raise ValueError("120-second CPU budget exceeded")
    result["cpu_seconds"] = process_time()-started
    return result


def report_path(root):
    return root / ("report-" + digest(json.dumps(fingerprints(),sort_keys=True).encode())[:20] + ".json")


def run(root=None):
    root = root_path(root)
    path = root / source()["csv_name"]
    if not path.is_file() or path.is_symlink(): raise ValueError("Run the explicit --fetch step first")
    if path.stat().st_size > MAX_BYTES: raise ValueError("CSV exceeds 2 MiB")
    payload = path.read_bytes()
    if digest(payload) != source()["csv_sha256"]: raise ValueError("Source checksum differs; no fitting")
    destination = report_path(root)
    if destination.exists():
        saved = load_report(root)
        if saved["status"] != "available": raise ValueError("Existing report invalid; inspect without overwriting it")
        return destination
    if storage_bytes(root) + MAX_BYTES > MAX_STORAGE: raise ValueError("20 MiB storage budget reached")
    result = evaluate(parse_csv(payload))
    result.update(schema_version=1, dataset_sha256=digest(payload), code_sha256=fingerprints(),
                  runtime={"python":platform.python_version(),"numpy":np.__version__,"scikit_learn":sklearn.__version__},
                  source=source(), attribution=resource("BIKE-NOTICE.txt").decode(), run_id=uuid4().hex,
                  evaluated_at=datetime.now(timezone.utc).isoformat())
    content = json.dumps(result,indent=2,sort_keys=True,allow_nan=False).encode()
    envelope = json.dumps({"sha256":digest(content),"report":result},indent=2,sort_keys=True,allow_nan=False).encode()
    save_exclusive(destination,envelope)
    return destination


def load_report(root=None, *, public=False):
    if public: return {"status":"unavailable","reason":"The bike-demand benchmark is local-only; this public profile remains synthetic."}
    path = report_path(root_path(root))
    if not path.exists(): return {"status":"unavailable","reason":"Run python -m signalrank.bikes --fetch, then python -m signalrank.bikes --run in the local environment. Web requests never download or fit models."}
    try:
        if path.is_symlink() or path.stat().st_size > MAX_BYTES: raise ValueError("Unsafe report")
        with path.open("rb") as stream: payload = stream.read(MAX_BYTES+1)
        if len(payload)>MAX_BYTES: raise ValueError("Report exceeds 2 MiB")
        envelope = strict_json(payload)
        r = envelope["report"]
        content = json.dumps(r,indent=2,sort_keys=True,allow_nan=False).encode()
        if digest(content) != envelope["sha256"] or r["code_sha256"] != fingerprints() or r["dataset_sha256"] != source()["csv_sha256"] or r["fixture"] or r["schema_version"] != 1:
            raise ValueError("Report provenance differs")
        return {"status":"available",**r,"report_sha256":envelope["sha256"]}
    except (ValueError,TypeError,KeyError,OSError):
        return {"status":"unavailable","reason":"Saved bike report failed integrity/provenance checks; inspect the local artifact. No fallback fitting occurs."}


def markdown(report):
    if report["status"] != "available": return report["reason"] + "\n"
    lines=["# SignalRank — Seoul next-day demand benchmark","",report["warning"],"",report["attribution"],"",
           f'Protocol: {report["protocol"]}',f'Dataset SHA-256: {report["dataset_sha256"]}',f'High-demand threshold: {report["threshold"]} rentals/hour (training-derived).',"",
           "| Partition | Candidate | AP | Brier | Precision at top 10% | Recall at top 10% |","| --- | --- | ---: | ---: | ---: | ---: |"]
    for part,rows in report["comparisons"].items():
        for row in rows:
            brier="Unavailable" if row["brier_score"] is None else f'{row["brier_score"]:.4f}'
            lines.append(f'| {part} | {row["name"]} | {row["average_precision"]:.4f} | {brier} | {row["precision"]:.4f} | {row["recall"]:.4f} |')
    lines += ["","## Limitations","",*("- "+note for note in report["limitations"]),""]
    return "\n".join(lines)


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    action=parser.add_mutually_exclusive_group(required=True)
    action.add_argument("--fetch",action="store_true")
    action.add_argument("--run",action="store_true")
    action.add_argument("--inspect",action="store_true")
    parser.add_argument("--root",type=Path)
    args=parser.parse_args()
    if args.fetch: print(acquire(args.root))
    elif args.run: print(run(args.root))
    else: print(json.dumps(load_report(args.root),indent=2,allow_nan=False))


if __name__=="__main__": main()
