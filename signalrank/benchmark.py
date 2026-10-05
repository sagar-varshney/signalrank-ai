"""Fixed synthetic structured-feature benchmark; no test-driven selection."""
from time import perf_counter
import numpy as np
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.linear_model import LogisticRegression

from signalrank.core import FEATURES, fitted_model, labels, matrix, metrics, reliability
from signalrank.uncertainty import paired


def build(train, calibration, test, config):
    xtrain, xcal, xtest = [np.array([[r[key] for key in FEATURES] for r in rows]) for rows in (train, calibration, test)]
    y = labels(test)
    items, predictions = [], {}
    specifications = [
        ("Structured logistic", LogisticRegression(C=config.regularization_c, max_iter=1000, random_state=config.seed), {"C": config.regularization_c, "max_iter": 1000}),
        ("Structured boosted trees", HistGradientBoostingClassifier(max_iter=100, learning_rate=.05, max_leaf_nodes=15, min_samples_leaf=20, l2_regularization=1, early_stopping=False, random_state=config.seed),
         {"max_iter": 100, "learning_rate": .05, "max_leaf_nodes": 15, "min_samples_leaf": 20, "l2_regularization": 1, "early_stopping": False}),
    ]
    for name, model, parameters in specifications:
        start = perf_counter()
        model.fit(xtrain, labels(train))
        fit_seconds = perf_counter() - start
        # Raw log-odds are monotonic in probability; calibration is past-only.
        def logits(x):
            p = np.clip(model.predict_proba(x)[:, 1], 1e-12, 1 - 1e-12)
            return np.log(p / (1 - p)).reshape(-1, 1)
        start = perf_counter()
        calibrator = LogisticRegression(C=1, random_state=config.seed).fit(logits(xcal), labels(calibration))
        calibration_seconds = perf_counter() - start
        raw = model.predict_proba(xtest)[:, 1]
        times = []
        for _ in range(3):
            start = perf_counter()
            calibrated = calibrator.predict_proba(logits(xtest))[:, 1]
            times.append((perf_counter() - start) * 1000)
        predictions[name] = calibrated
        items.append({"name": name, "features": list(FEATURES), "parameters": parameters,
                      "fit_seconds": fit_seconds, "calibration_seconds": calibration_seconds,
                      "inference_ms": float(np.median(times)), "inference_records": len(test),
                      "raw": metrics(y, raw), "calibrated": metrics(y, calibrated),
                      "calibration_bins": {"raw": reliability(y, raw), "calibrated": reliability(y, calibrated)}})
    start = perf_counter()
    combined, calibrator = fitted_model(train, calibration, config)
    fitting = perf_counter() - start
    times = []
    for _ in range(3):
        start = perf_counter()
        p = calibrator.predict_proba(combined.decision_function(matrix(test)).reshape(-1, 1))[:, 1]
        times.append((perf_counter() - start) * 1000)
    items.append({"name": "Combined logistic reference", "features": ["TF-IDF text", *FEATURES],
                  "parameters": {"C": config.regularization_c, "ngram_range": [1, 2]},
                  "fit_seconds": fitting, "calibration_seconds": None, "inference_ms": float(np.median(times)),
                  "inference_records": len(test), "raw": metrics(y, combined.predict_proba(matrix(test))[:, 1]), "calibrated": metrics(y, p)})
    def records(p):
        return [{"id": row["id"], "observed_at": row["observed_at"], "outcome": int(outcome), "probability": float(probability)} for row, outcome, probability in zip(test, y, p)]
    contrast = paired(records(predictions["Structured logistic"]), records(predictions["Structured boosted trees"]))
    return {"mode": "synthetic", "protocol": "fixed-structured-benchmark-v1", "items": items,
            "training_prevalence": metrics(y, np.full(len(test), labels(train).mean())),
            "contrast": {"a": "Structured logistic", "b": "Structured boosted trees", **contrast},
            "warning": "Same chronological training, calibration and test partitions. Structured comparisons use identical three features; the combined model is a different-input reference, not a controlled architecture contrast. No test-based parameter tuning or winner selection. Timings are local single-process measurements (three inference repeats), not deployment benchmarks; combined fit includes calibration. Synthetic development only."}
