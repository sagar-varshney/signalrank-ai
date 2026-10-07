"""Fixed synthetic development probes, never model selection or causal evidence."""
from collections import Counter
from copy import deepcopy
from hashlib import sha256
import json

import numpy as np

from signalrank.core import FEATURES, generate, labels, matrix, metrics, reliability, fitted_model
from signalrank.temporal import partitions

PROTOCOL = "synthetic-reliability-v1"
SEED = 314159
REPEATS = 20
FRACTIONS = (.25, .5, .75, 1.0)
WARNING = "Synthetic development evidence only; not real-world accuracy, operational monitoring, causal evidence or a final holdout. No model is selected using these probes."


def supported(rows):
    return bool(rows) and len(np.unique(labels(rows))) == 2


def fingerprint(rows):
    return sha256(json.dumps(rows, sort_keys=True, allow_nan=False).encode()).hexdigest()


def summary(rows):
    y = labels(rows)
    return {"count": len(rows), "unique_records": len({r["id"] for r in rows}),
            "positives": int(y.sum()), "prevalence": float(y.mean()) if rows else None,
            "mean_severity": float(np.mean([r["severity"] for r in rows])) if rows else None,
            "remote_rate": float(np.mean([r["remote"] for r in rows])) if rows else None,
            "categories": dict(sorted(Counter(r["description"] for r in rows).items())),
            "records_sha256": fingerprint(rows)}


def scenario_rows(rows, scenario):
    """Retain outcomes. Resample composition or corrupt measurements, never relabel."""
    rng = np.random.default_rng(SEED)
    if scenario == "control":
        return deepcopy(rows)
    if scenario in ("category_mix", "severity_mix"):
        weights = np.array([3.0 if (
            r["description"] in ("authentication bypass in gateway", "remote command handling flaw")
            if scenario == "category_mix" else r["severity"] >= 7
        ) else 1.0 for r in rows])
        indices = rng.choice(len(rows), size=len(rows), replace=True, p=weights / weights.sum())
        return [deepcopy(rows[int(i)]) for i in indices]
    result = deepcopy(rows)
    if scenario == "severity_noise":
        for row, noise in zip(result, rng.normal(0, 1, len(rows))):
            row["severity"] = float(np.clip(row["severity"] + noise, 1, 10))
    elif scenario == "flag_noise":
        for row in result:
            for feature in ("remote", "authentication_required"):
                if rng.random() < .1:
                    row[feature] = 1 - row[feature]
    else:
        raise ValueError("Unknown prespecified synthetic scenario")
    return result


def stress(experiment):
    definitions = [
        ("control", "Unchanged control", "control", "Exact copy of the mature evaluation cohort; no perturbation."),
        ("category_mix", "Category composition", "composition", "Sample with replacement at 3× weight for the two original gateway/command categories; all other weights 1."),
        ("severity_mix", "Higher-severity composition", "composition", "Sample with replacement at 3× weight for severity ≥7; all other weights 1."),
        ("severity_noise", "Severity measurement noise", "measurement", "Add seeded Normal(0, 1) measurement error to severity, clipped to [1, 10]; retain original outcomes."),
        ("flag_noise", "Boolean measurement noise", "measurement", "Independently flip each remote/authentication measurement with probability 0.10; retain original outcomes."),
    ]
    original = experiment.test
    base = metrics(labels(original), experiment.predict(original)) if supported(original) else None
    items = []
    for identifier, name, kind, definition in definitions:
        rows = scenario_rows(original, identifier) if original else []
        item = {"id": identifier, "name": name, "kind": kind, "definition": definition,
                "support": summary(rows), "status": "evaluated" if supported(rows) else "unavailable"}
        if not supported(rows) or base is None:
            item["reason"] = "Both outcome classes are required; no label repair or replacement scenario."
        else:
            p = experiment.predict(rows)
            item.update(calibrated=metrics(labels(rows), p),
                        raw=metrics(labels(rows), experiment.model.predict_proba(matrix(rows))[:, 1]),
                        calibration_bins=reliability(labels(rows), p))
            item["delta_from_control"] = {key: item["calibrated"][key] - value for key, value in base.items()}
        items.append(item)
    return {"seed": SEED, "budget": 50, "items": items,
            "warning": "One fixed seeded realization per scenario, not confidence intervals. Composition probes reuse records with replacement and can change prevalence: AP/recall deltas are not paired causal effects. Measurement probes retain original outcomes and simulate corrupted observations, not changed underlying risk. Review budget applies once to the complete scenario; duplicate draws count as separate slots. No retraining or recalibration."}


def importance(experiment):
    rows = experiment.test
    if not supported(rows):
        return {"status": "unavailable", "items": [], "reason": "Both evaluation outcome classes are required."}
    y = labels(rows)
    base = metrics(y, experiment.predict(rows))
    items = []
    for index, feature in enumerate(["description", *FEATURES]):
        rng = np.random.default_rng(SEED + index)
        ap_drop, brier_increase = [], []
        for _ in range(REPEATS):
            permuted = deepcopy(rows)
            order = rng.permutation(len(rows))
            for row, source in zip(permuted, order):
                row[feature] = rows[int(source)][feature]
            result = metrics(y, experiment.predict(permuted))
            ap_drop.append(base["average_precision"] - result["average_precision"])
            brier_increase.append(result["brier_score"] - base["brier_score"])
        items.append({"feature": feature, "average_precision_drop": float(np.mean(ap_drop)),
                      "average_precision_drop_sd": float(np.std(ap_drop, ddof=1)),
                      "brier_increase": float(np.mean(brier_increase)),
                      "brier_increase_sd": float(np.std(brier_increase, ddof=1)),
                      "repeats": REPEATS})
    return {"status": "evaluated", "seed": SEED, "population": len(rows), "baseline": base,
            "items": items, "warning": "Shuffle one raw input column at a time on the mature development evaluation cohort, using fixed fitted/calibrated models. Description is shuffled as a whole category, not individual TF-IDF tokens. Positive AP drop/Brier increase means worse performance after shuffling; negatives are retained. Standard deviation measures shuffle variability, not sampling uncertainty or confidence intervals. Correlated inputs can mask importance or produce unrealistic combinations. This is model dependence, not causation, and not a feature-selection procedure."}


def learning_curves(config):
    folds = []
    for number, (train, calibration, test) in enumerate(partitions(generate(config.seed, config.count)), 1):
        points = []
        days = sorted({row["observed_at"] for row in train})
        for fraction in FRACTIONS:
            # Include complete earliest days, never split simultaneous records.
            cutoff = days[max(0, int(len(days) * fraction) - 1)] if days else None
            subset = [row for row in train if row["observed_at"] <= cutoff] if cutoff else []
            point = {"fraction": fraction, "train_count": len(subset),
                     "train_positives": int(labels(subset).sum()),
                     "train_first": subset[0]["observed_at"] if subset else None,
                     "train_last": subset[-1]["observed_at"] if subset else None}
            if any(not supported(part) for part in (subset, calibration, test)):
                point.update(status="unavailable", reason="Both classes are required in each partition; no resampling.")
            else:
                model, calibrator = fitted_model(subset, calibration, config)
                def predict(data):
                    return calibrator.predict_proba(model.decision_function(matrix(data)).reshape(-1, 1))[:, 1]
                point.update(status="evaluated", training=metrics(labels(subset), predict(subset)),
                             evaluation=metrics(labels(test), predict(test)))
            points.append(point)
        folds.append({"fold": number, "calibration": summary(calibration), "evaluation": summary(test),
                      "calibration_first": calibration[0]["observed_at"] if calibration else None,
                      "evaluation_first": test[0]["observed_at"] if test else None,
                      "evaluation_last": test[-1]["observed_at"] if test else None, "points": points})
    return {"fractions": list(FRACTIONS), "folds": folds,
            "warning": "Earliest 25/50/75/100% of complete training days in each existing purged walk-forward fold. Calibration and mature evaluation records stay fixed within a fold. Each point refits preprocessing/classifier and fits sigmoid calibration only on the later calibration partition. Training metrics are retrospective in-sample diagnostics using that calibrator, not unbiased estimates. Increasing history also changes recency; curves do not isolate sample-size causality. Fold windows are explored development data; no tuning, winner selection, significance claim or untouched final test."}


def build(experiment):
    return {"mode": "synthetic", "protocol": PROTOCOL, "warning": WARNING,
            "dataset_sha256": experiment.report["dataset_sha256"],
            "configuration": experiment.report["configuration"],
            "stress": stress(experiment), "importance": importance(experiment),
            "learning_curves": learning_curves(experiment.config)}
