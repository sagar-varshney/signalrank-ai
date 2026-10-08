"""Offline simulated-time replay. Frozen predictions; delayed labels; no refitting."""
from datetime import date, timedelta
from hashlib import sha256
import json

import numpy as np
from sklearn.metrics import average_precision_score, brier_score_loss

from signalrank.core import HORIZON, FEATURES, generate, split
from signalrank.inference import DESCRIPTIONS

SEEDS = (2718, 3141, 1618)
DAYS, PER_DAY, CHANGE_DAY, BUDGET = 182, 12, 91, 15
THRESHOLD, MIN_SUPPORT = .20, 60
SCENARIOS = {"stable": "No-shift control", "input_shift": "Input distribution shift", "concept_shift": "Outcome relationship shift"}
WARNING = "Original synthetic simulated time, not live monitoring or operational advice. The model and calibrator stay frozen. All outcomes are withheld for the full 30-day horizon, including early positives. Input drift is not proof of model failure. Thresholds are illustrative, not validated alert guarantees."


def digest(value):
    return sha256(json.dumps(value, sort_keys=True, separators=(",", ":"), allow_nan=False).encode()).hexdigest()


def stream(start, scenario, seed, days=DAYS):
    if scenario not in SCENARIOS or type(days) is not int or not 35 <= days <= DAYS:
        raise ValueError("Unsupported bounded replay scenario")
    inputs, oracle = [], []
    # Independent input and outcome streams preserve identical inputs across concept/control.
    rng, outcomes = np.random.default_rng(seed), np.random.default_rng(seed + 100000)
    for day in range(days):
        for index in range(PER_DAY):
            kind = int(rng.integers(5))
            severity = float(np.round(rng.uniform(1, 10), 1))
            remote, auth = int(rng.integers(2)), int(rng.integers(2))
            if scenario == "input_shift" and day >= CHANGE_DAY:
                severity = float(np.round(7 + severity / 10 * 3, 1))
                remote = 1
            logit = -5 + .22 * severity + 1.2 * remote - .8 * auth + (1.1 if kind in (1, 3) else 0)
            if scenario == "concept_shift" and day >= CHANGE_DAY:
                logit = -2 - .18 * severity - .7 * remote + .9 * auth + (1.4 if kind in (0, 2) else 0)
            observed = start + timedelta(days=day)
            inputs.append({"id": f"SYN-REPLAY-{seed}-{day:03d}-{index:02d}", "observed_at": observed.isoformat(),
                           "description": DESCRIPTIONS[kind], "severity": severity,
                           "remote": remote, "authentication_required": auth})
            oracle.append(int(outcomes.random() < 1 / (1 + np.exp(-logit))))
    return inputs, np.array(oracle)


def score(y, probabilities):
    if len(y) < MIN_SUPPORT or len(np.unique(y)) != 2:
        return None
    return {"average_precision": float(average_precision_score(y, probabilities)),
            "brier_score": float(brier_score_loss(y, probabilities)), "positives": int(y.sum()),
            "count": len(y), "prevalence": float(y.mean())}


def distributions(rows, probabilities):
    return {"severity": np.histogram([r["severity"] for r in rows], bins=np.linspace(1, 10, 10))[0],
            "description": np.array([sum(r["description"] == d for r in rows) for d in DESCRIPTIONS]),
            **{key: np.array([sum(r[key] == value for r in rows) for value in (0, 1)]) for key in FEATURES[1:]},
            "prediction": np.histogram(probabilities, bins=np.linspace(0, 1, 11))[0]}


def js_distance(a, b):
    a, b = np.asarray(a, dtype=float), np.asarray(b, dtype=float)
    if a.sum() <= 0 or b.sum() <= 0:
        raise ValueError("Drift distributions require non-empty support")
    a, b = a / a.sum(), b / b.sum()
    midpoint = (a + b) / 2
    def divergence(x):
        mask = x > 0
        return float(np.sum(x[mask] * np.log2(x[mask] / midpoint[mask])))
    return float(np.sqrt(max(0., (divergence(a) + divergence(b)) / 2)))


def drift(reference, rows, probabilities):
    current = distributions(rows, probabilities)
    return [{"feature": key, "reference_count": int(reference[key].sum()), "current_count": len(rows),
             "distance": js_distance(reference[key], values) if len(rows) >= MIN_SUPPORT else None,
             "alert": js_distance(reference[key], values) >= THRESHOLD if len(rows) >= MIN_SUPPORT else None}
            for key, values in current.items()]


def replay(experiment, scenario, seed, days=DAYS):
    original = generate(experiment.config.seed, experiment.config.count)
    training = split(original)[0]
    start = date.fromisoformat(original[-1]["observed_at"]) + timedelta(days=1)
    inputs, oracle = stream(start, scenario, seed, days)
    # Scores are calculated from input-only dictionaries before exposing any outcome.
    probabilities = np.asarray(experiment.predict(inputs), dtype=float)
    if not np.isfinite(probabilities).all() or ((probabilities < 0) | (probabilities > 1)).any():
        raise ValueError("Invalid replay probabilities")
    reference = distributions(training, experiment.predict(training))
    end = start + timedelta(days=days - 1)
    weeks, checkpoints = [], []
    for offset in range(0, len(inputs), 7 * PER_DAY):
        indices = np.arange(offset, min(offset + 7 * PER_DAY, len(inputs)))
        week_rows, p = [inputs[i] for i in indices], probabilities[indices]
        cutoff = date.fromisoformat(week_rows[-1]["observed_at"])
        model_order = indices[np.argsort(-p, kind="stable")[:BUDGET]]
        baseline_order = indices[np.argsort(-np.array([r["severity"] for r in week_rows]), kind="stable")[:BUDGET]]
        # Weekly review occurs at week close; every item is ranked once, never with outcomes.
        weeks.append({"first": week_rows[0]["observed_at"], "last": cutoff.isoformat(), "indices": indices,
                      "model": model_order, "severity": baseline_order})
        mature_count = min(len(inputs), max(0, (cutoff - start).days - HORIZON + 1) * PER_DAY)
        mature_y, mature_p = oracle[:mature_count], probabilities[:mature_count]
        closed = [w for w in weeks if date.fromisoformat(w["last"]) + timedelta(days=HORIZON) <= cutoff]
        cohort = np.concatenate([w["indices"] for w in closed]) if closed else np.array([], dtype=int)
        policies = []
        for policy in ("model", "severity"):
            selected = np.concatenate([w[policy] for w in closed]) if closed else np.array([], dtype=int)
            total = int(oracle[cohort].sum())
            captured = int(oracle[selected].sum())
            policies.append({"name": policy, "reviewed": len(selected), "population": len(cohort),
                             "positives": total, "captured": captured, "missed": total - captured,
                             "precision": captured / len(selected) if len(selected) else None,
                             "recall": captured / total if total else None})
        checkpoints.append({"as_of": cutoff.isoformat(), "seen": int(indices[-1]) + 1,
                            "mature": mature_count, "pending": int(indices[-1]) + 1 - mature_count,
                            "metrics": score(mature_y, mature_p), "closed_weeks": len(closed), "policies": policies,
                            "random_expected_captured": float(sum(len(w["model"]) * oracle[w["indices"]].mean() for w in closed)) if closed else None,
                            "drift": drift(reference, week_rows, p), "window_first": week_rows[0]["observed_at"]})
    ledger = []
    for i, row in enumerate(inputs):
        available = date.fromisoformat(row["observed_at"]) + timedelta(days=HORIZON)
        ledger.append({**row, "probability": float(probabilities[i]), "outcome_available_at": available.isoformat(),
                       "outcome": int(oracle[i]) if available <= end else None})
    change = start + timedelta(days=CHANGE_DAY) if scenario != "stable" else None
    pre = [p for p in checkpoints if change is None or date.fromisoformat(p["as_of"]) < change]
    eligible = [p for p in checkpoints if change is not None and date.fromisoformat(p["window_first"]) >= change]
    alerts = lambda p: any(d["alert"] is True for d in p["drift"] if d["feature"] != "prediction")
    detected = next((p for p in eligible if alerts(p)), None)
    return {"id": scenario, "name": SCENARIOS[scenario], "seed": seed, "start": start.isoformat(), "end": end.isoformat(),
            "change_at": change.isoformat() if change else None, "input_sha256": digest(inputs),
            "prediction_sha256": digest([{k: r[k] for k in ("id", "observed_at", "probability")} for r in ledger]),
            "checkpoints": checkpoints, "ledger": ledger,
            "alert_evidence": {"prechange_windows": len(pre), "prechange_input_alerts": sum(alerts(p) for p in pre),
                               "detection_delay_days": (date.fromisoformat(detected["as_of"]) - change).days if detected else None,
                               "interpretation": "Input-alert delay after a fully post-change window; null means no alert or no scheduled shift. Concept changes can be invisible to input monitoring. No significance or confidence claim."}}


def build(experiment):
    runs = [replay(experiment, scenario, seed) for seed in SEEDS for scenario in SCENARIOS]
    return {"mode": "synthetic", "protocol": "frozen-delayed-replay-v1", "warning": WARNING,
            "configuration": {"seeds": list(SEEDS), "days": DAYS, "records_per_day": PER_DAY, "change_day": CHANGE_DAY,
                              "weekly_budget": BUDGET, "horizon_days": HORIZON, "distance": "Jensen-Shannon distance, base 2",
                              "drift_threshold": THRESHOLD, "minimum_support": MIN_SUPPORT,
                              "reference": "Original fitted model's training inputs; fixed bins; no outcome-dependent threshold selection"},
            "runs": runs}


def at_checkpoint(run, index):
    """Export only inputs and labels available at a saved simulated checkpoint."""
    checkpoint = run["checkpoints"][index]
    as_of = checkpoint["as_of"]
    return {"checkpoint": checkpoint, "records": [{**row, "outcome": row["outcome"] if row["outcome_available_at"] <= as_of else None}
            for row in run["ledger"] if row["observed_at"] <= as_of]}
