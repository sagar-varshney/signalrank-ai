"""Prespecified synthetic walk-forward development benchmark, not final testing."""
from datetime import date, timedelta
import numpy as np
from sklearn.metrics import average_precision_score, precision_recall_curve

from signalrank.core import HORIZON, generate, fitted_model, matrix, labels, metrics, reliability


def partitions(rows):
    ordered = sorted(rows, key=lambda r: r["observed_at"])
    end = date.fromisoformat(ordered[-1]["observed_at"])
    # Three disjoint evaluation windows. Each fit sees only mature past labels.
    for start_fraction, stop_fraction in [(.50, .65), (.65, .80), (.80, 1.0)]:
        start = date.fromisoformat(ordered[int(len(rows) * start_fraction)]["observed_at"])
        stop = date.fromisoformat(ordered[int(len(rows) * stop_fraction)]["observed_at"]) if stop_fraction < 1 else end + timedelta(days=1)
        calibration_start = start - timedelta(days=120)
        train, calibration, test = [], [], []
        for row in ordered:
            observed = date.fromisoformat(row["observed_at"])
            mature = observed + timedelta(days=HORIZON)
            if mature < calibration_start:
                train.append(row)
            elif calibration_start <= observed and mature < start:
                calibration.append(row)
            elif start <= observed < stop and mature <= end:
                test.append(row)
        yield train, calibration, test


def evaluate(config):
    rows = generate(config.seed, config.count)
    folds = []
    for index, (train, calibration, test) in enumerate(partitions(rows), 1):
        fold = {"fold": index, "splits": {name: {"count": len(data), "first": data[0]["observed_at"] if data else None,
                 "last": data[-1]["observed_at"] if data else None, "positives": int(labels(data).sum())}
                 for name, data in [("train", train), ("calibration", calibration), ("test", test)]}}
        if any(not data or len(np.unique(labels(data))) != 2 for data in (train, calibration, test)):
            fold.update(status="not evaluable", reason="Both outcome classes are required in every partition; no resampling or substitution.")
            folds.append(fold)
            continue
        model, calibrator = fitted_model(train, calibration, config)
        probabilities = calibrator.predict_proba(model.decision_function(matrix(test)).reshape(-1, 1))[:, 1]
        y = labels(test)
        severity = np.array([r["severity"] for r in test])
        precision, recall, thresholds = precision_recall_curve(y, probabilities)
        budgets = []
        for budget in (10, 25, 50, 100):
            if budget > len(test):
                continue
            result = {"budget": budget, "random_expected_captured": float(budget * y.mean())}
            for name, scores in [("model", probabilities), ("severity", severity)]:
                captured = int(y[np.argsort(-scores, kind="stable")[:budget]].sum())
                result[name] = {"captured": captured, "precision": captured / budget, "recall": captured / int(y.sum())}
            budgets.append(result)
        fold.update(status="evaluated", model=metrics(y, probabilities), prevalence=float(y.mean()),
                    severity_average_precision=float(average_precision_score(y, severity)),
                    calibration_bins=reliability(y, probabilities), budgets=budgets,
                    precision_recall={"precision": precision.tolist(), "recall": recall.tolist(), "thresholds": thresholds.tolist()})
        folds.append(fold)
    return {"mode": "synthetic", "protocol": "synthetic-walk-forward-v1", "horizon_days": HORIZON,
            "warning": "Explored synthetic development benchmark. Not an untouched final test, operational backtest, or evidence of real-world predictive value.",
            "budget_scope": "Budget applies once to each complete fold, not per day or week.", "folds": folds}
