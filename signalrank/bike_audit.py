"""Exploratory, local-only subgroup audit of the already evaluated Seoul benchmark."""
import argparse
from datetime import datetime, timedelta, timezone
import json
import math
from pathlib import Path
import platform
from time import process_time
from uuid import uuid4

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import average_precision_score, brier_score_loss
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from threadpoolctl import threadpool_limits

from signalrank import bikes


def design():
    value = json.loads(bikes.resource("bike-audit-protocol.json"))
    if value["parent_protocol"] != bikes.protocol()["id"]:
        raise ValueError("Audit protocol does not match the benchmark")
    return value


def fingerprints():
    return {name: bikes.digest(bikes.resource(name)) for name in ("bike_audit.py", "bike-audit-protocol.json")}


def audit_path(root, original_sha):
    identity = {"audit": fingerprints(), "benchmark_report": original_sha}
    return root / ("audit-" + bikes.digest(json.dumps(identity, sort_keys=True).encode())[:20] + ".json")


def build(rows, original):
    started = process_time()
    groups, _ = bikes.partitions(bikes.examples(rows))
    train, calibration, final = (groups[name] for name in ("train", "calibration", "final"))
    threshold = int(np.quantile([r["count"] for r in train], .8, method="higher"))
    if threshold != original["threshold"] or len(final) != original["partitions"]["final"]["count"]:
        raise ValueError("Reconstructed benchmark differs from the first report")
    x_train = np.array([r["x"] for r in train])
    x_calibration = np.array([r["x"] for r in calibration])
    x_final = np.array([r["x"] for r in final])
    y_train = np.array([int(r["count"] >= threshold) for r in train])
    y_calibration = np.array([int(r["count"] >= threshold) for r in calibration])
    y_final = np.array([int(r["count"] >= threshold) for r in final])
    recent_cutoff = float(np.quantile(x_train[:, 4], .25, method="higher"))
    with threadpool_limits(limits=1):
        model = make_pipeline(StandardScaler(), LogisticRegression(**bikes.protocol()["models"]["logistic"]))
        model.fit(x_train, y_train)
        calibrator = LogisticRegression(C=1., max_iter=1000).fit(bikes.logit(model, x_calibration).reshape(-1, 1), y_calibration)
        probability = calibrator.predict_proba(bikes.logit(model, x_final).reshape(-1, 1))[:, 1]
    weekly = x_final[:, 3]
    original_logistic = next(r for r in original["comparisons"]["final"] if r["id"] == "logistic")
    original_weekly = next(r for r in original["comparisons"]["final"] if r["id"] == "weekly")
    if not math.isclose(float(average_precision_score(y_final, probability)), original_logistic["average_precision"], abs_tol=1e-12) or not math.isclose(float(average_precision_score(y_final, weekly)), original_weekly["average_precision"], abs_tol=1e-12) or not math.isclose(float(brier_score_loss(y_final, probability)), original_logistic["brier_score"], abs_tol=1e-12):
        raise ValueError("Reconstructed scores differ from the first report")
    budget = original_logistic["budget"]
    selected = np.zeros(len(final), dtype=bool)
    selected[np.argsort(-probability, kind="stable")[:budget]] = True
    if int(y_final[selected].sum()) != original_logistic["captured"]:
        raise ValueError("Reconstructed review selection differs from the first report")
    target_hours = np.array([(r["target_at"].hour - 1) % 24 for r in final])
    weekdays = np.array([(r["target_at"] - timedelta(hours=1)).weekday() for r in final])
    dimensions = [
        ("Target-hour daypart", [(name, (target_hours >= lower) & (target_hours <= upper)) for name, lower, upper in (("00–05", 0, 5), ("06–11", 6, 11), ("12–17", 12, 17), ("18–23", 18, 23))]),
        ("Target-hour week", [("Weekday", weekdays < 5), ("Weekend", weekdays >= 5)]),
        ("Recent completed demand", [("Low recent demand", x_final[:, 4] <= recent_cutoff), ("Other recent demand", x_final[:, 4] > recent_cutoff)])
    ]
    slices = []
    for dimension, members in dimensions:
        if sum(int(mask.sum()) for _, mask in members) != len(final):
            raise ValueError("Audit cohorts must partition every final hour")
        for group, mask in members:
            n, positives = int(mask.sum()), int(y_final[mask].sum())
            selected_count = int((mask & selected).sum())
            captured = int(y_final[mask & selected].sum())
            enough = n >= 30 and positives >= 5 and n - positives >= 5
            slices.append({"dimension": dimension, "group": group, "count": n, "positives": positives,
                           "prevalence": positives/n if n else None, "mean_probability": float(probability[mask].mean()) if n else None,
                           "global_selected": selected_count, "global_captured": captured,
                           "global_recall": captured/positives if positives else None,
                           "logistic_ap": float(average_precision_score(y_final[mask], probability[mask])) if enough else None,
                           "weekly_ap": float(average_precision_score(y_final[mask], weekly[mask])) if enough else None,
                           "logistic_brier": float(brier_score_loss(y_final[mask], probability[mask])) if enough else None,
                           "display_warning": None if enough else "Insufficient support for within-group AP/Brier display"})
    if process_time() - started > 120:
        raise ValueError("120-second CPU budget exceeded")
    return {"protocol": design()["id"], "status": "exploratory", "parent_report_sha256": original["report_sha256"],
            "source_sha256": original["dataset_sha256"], "recent_demand_cutoff": recent_cutoff,
            "global_budget": budget, "global_captured": int(y_final[selected].sum()), "slices": slices,
            "warning": design()["claim_boundary"], "display_gate": design()["display_gate"],
            "selection": design()["selection"], "cpu_seconds": process_time() - started}


def run(root=None):
    root = bikes.root_path(root)
    original = bikes.load_report(root)
    if original["status"] != "available":
        raise ValueError("A valid first benchmark report is required before the exploratory audit")
    path = root / bikes.source()["csv_name"]
    if not path.is_file() or path.is_symlink() or path.stat().st_size > bikes.MAX_BYTES:
        raise ValueError("Pinned local source CSV is required")
    payload = path.read_bytes()
    if bikes.digest(payload) != original["dataset_sha256"]:
        raise ValueError("Local CSV differs from first benchmark")
    destination = audit_path(root, original["report_sha256"])
    if destination.exists():
        if load(root)["status"] != "available":
            raise ValueError("Existing audit is invalid; inspect without overwriting")
        return destination
    if bikes.storage_bytes(root) + bikes.MAX_BYTES > bikes.MAX_STORAGE:
        raise ValueError("20 MiB local storage budget reached")
    result = build(bikes.parse_csv(payload), original)
    result.update(schema_version=1, audit_code_sha256=fingerprints(), run_id=uuid4().hex,
                  created_at=datetime.now(timezone.utc).isoformat(), python=platform.python_version())
    content = json.dumps(result, indent=2, sort_keys=True, allow_nan=False).encode()
    envelope = json.dumps({"sha256": bikes.digest(content), "audit": result}, indent=2, sort_keys=True, allow_nan=False).encode()
    bikes.save_exclusive(destination, envelope)
    return destination


def load(root=None, *, public=False):
    if public:
        return {"status": "unavailable", "reason": "The exploratory bike audit is local-only."}
    original = bikes.load_report(root)
    if original["status"] != "available":
        return {"status": "unavailable", "reason": "A valid first bike benchmark report is required."}
    path = audit_path(bikes.root_path(root), original["report_sha256"])
    if not path.exists():
        return {"status": "unavailable", "reason": "Run python -m signalrank.bike_audit --run locally to create the exploratory subgroup audit."}
    try:
        if path.is_symlink() or path.stat().st_size > bikes.MAX_BYTES:
            raise ValueError("Unsafe audit")
        with path.open("rb") as stream:
            payload = stream.read(bikes.MAX_BYTES + 1)
        if len(payload) > bikes.MAX_BYTES:
            raise ValueError("Audit exceeds 2 MiB")
        envelope = bikes.strict_json(payload)
        result = envelope["audit"]
        content = json.dumps(result, indent=2, sort_keys=True, allow_nan=False).encode()
        if (bikes.digest(content) != envelope["sha256"] or result["schema_version"] != 1 or
                result["audit_code_sha256"] != fingerprints() or result["parent_report_sha256"] != original["report_sha256"] or
                result["source_sha256"] != original["dataset_sha256"] or result["protocol"] != design()["id"]):
            raise ValueError("Audit provenance differs")
        return {**result, "status": "available", "audit_sha256": envelope["sha256"]}
    except (ValueError, TypeError, KeyError, OSError):
        return {"status": "unavailable", "reason": "Saved exploratory bike audit failed integrity/provenance checks."}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    action = parser.add_mutually_exclusive_group(required=True)
    action.add_argument("--run", action="store_true")
    action.add_argument("--inspect", action="store_true")
    parser.add_argument("--root", type=Path)
    args = parser.parse_args()
    print(run(args.root) if args.run else json.dumps(load(args.root), indent=2, allow_nan=False))


if __name__ == "__main__":
    main()
