"""Paired moving-day-block resampling, conditional on already fitted models."""
from datetime import date, timedelta
import numpy as np

from signalrank.core import metrics

KEYS = ("average_precision", "brier_score", "recall_at_50")


def incompatibilities(a, b):
    reasons = []
    for key in ("mode", "dataset_sha256", "target", "horizon_days"):
        if a.get(key) != b.get(key):
            reasons.append(key)
    for name in ("train", "calibration", "test"):
        if a.get("splits", {}).get(name) != b.get("splits", {}).get(name):
            reasons.append(name + " partition")
    return reasons


def paired(left, right, *, seed=1729, repetitions=250, block_days=30):
    if type(repetitions) is not int or repetitions < 1 or type(block_days) is not int or block_days < 1:
        raise ValueError("Positive integer repetitions and block_days are required")
    result = {"method": "paired-moving-day-block-v1", "seed": seed, "repetitions": repetitions,
              "block_days": block_days, "interval_level": .95,
              "warning": "Exploratory percentile intervals conditional on fixed fitted models, not training uncertainty or a significance test. Assumes approximately stationary short-range dependence and adequate 30-day blocks; those assumptions are not validated. Repeated entities, regime shifts and configuration search are not accounted for. Synthetic development evidence only."}
    def unavailable(reason):
        return {**result, "status": "unavailable", "reason": reason, "metrics": []}
    if not left or len(left) != len(right):
        return unavailable("Complete aligned evaluation records are required; older top-100-only snapshots cannot be used.")
    if len({row["id"] for row in left}) != len(left):
        return unavailable("Duplicate evaluation identifiers.")
    for a, b in zip(left, right):
        if (a["id"], a["observed_at"], a["outcome"]) != (b["id"], b["observed_at"], b["outcome"]):
            return unavailable("Evaluation identifiers, order, dates or outcomes differ.")
    days = sorted({row["observed_at"] for row in left})
    if any(date.fromisoformat(b) - date.fromisoformat(a) != timedelta(days=1) for a, b in zip(days, days[1:])):
        return unavailable("This protocol requires consecutive observed days; gaps need a separately specified design.")
    if len(days) < 4 * block_days:
        return unavailable("Fewer than four block lengths of observed days; insufficient temporal support for this display protocol.")
    y = np.array([row["outcome"] for row in left])
    pa, pb = [np.array([row["probability"] for row in records]) for records in (left, right)]
    if len(np.unique(y)) != 2 or not all(np.isfinite(p).all() and ((0 <= p) & (p <= 1)).all() for p in (pa, pb)):
        return unavailable("Both outcome classes and finite probabilities in [0, 1] are required.")
    day_lookup = {day: [] for day in days}
    for i, row in enumerate(left):
        day_lookup[row["observed_at"]].append(i)
    groups = [np.array(day_lookup[day]) for day in days]
    rng = np.random.default_rng(seed)
    samples = {key: [] for key in KEYS}
    for _ in range(repetitions):
        starts = rng.integers(0, len(days) - block_days + 1, size=int(np.ceil(len(days) / block_days)))
        day_idx = np.concatenate([np.arange(start, start + block_days) for start in starts])[:len(days)]
        idx = np.concatenate([groups[i] for i in day_idx])
        if len(np.unique(y[idx])) != 2:
            continue
        ma, mb = metrics(y[idx], pa[idx]), metrics(y[idx], pb[idx])
        for key in KEYS:
            samples[key].append(mb[key] - ma[key])
    valid = len(samples[KEYS[0]])
    if valid < .95 * repetitions:
        return {**unavailable("More than 5% of resamples lacked an outcome class."), "valid_repetitions": valid}
    ma, mb = metrics(y, pa), metrics(y, pb)
    return {**result, "status": "exploratory", "days": len(days), "population": len(y),
            "valid_repetitions": valid, "skipped_repetitions": repetitions - valid,
            "metrics": [{"metric": key, "delta_b_minus_a": mb[key] - ma[key],
                         "lower": float(np.quantile(samples[key], .025)), "upper": float(np.quantile(samples[key], .975))} for key in KEYS]}


def compare_snapshots(left, right):
    reasons = incompatibilities(left["report"], right["report"])
    if reasons:
        return {"status": "unavailable", "reason": "Different evaluation conditions: " + ", ".join(reasons), "metrics": []}
    return paired(left.get("evaluation_records", []), right.get("evaluation_records", []))
