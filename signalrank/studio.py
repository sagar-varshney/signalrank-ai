"""Exact explanations of the saved linear model; no fitting or causal claims."""
import math
import numpy as np

from signalrank.core import matrix
from signalrank.inference import DESCRIPTIONS
from signalrank.replay import digest


def explain(experiment, category, severity, remote, authentication_required):
    if type(category) is not int or not 0 <= category < len(DESCRIPTIONS):
        raise ValueError("Choose an original fictional category")
    if not math.isfinite(severity) or not 1 <= severity <= 10:
        raise ValueError("Severity must be finite and between 1 and 10")
    row = {"description": DESCRIPTIONS[category], "severity": severity,
           "remote": int(remote), "authentication_required": int(authentication_required)}
    features = experiment.model.named_steps["features"]
    classifier = experiment.model.named_steps["classifier"]
    transformed = features.transform(matrix([row]))
    vector = transformed.toarray()[0] if hasattr(transformed, "toarray") else transformed[0]
    values = vector * classifier.coef_[0]
    intercept = float(classifier.intercept_[0])
    running = intercept
    factors = []
    for name, value in zip(features.get_feature_names_out(), values):
        start = running
        running += float(value)
        factors.append({"feature": str(name), "value": float(value), "start": start, "end": running})
    logit = float(experiment.model.decision_function(matrix([row]))[0])
    raw = float(experiment.model.predict_proba(matrix([row]))[0, 1])
    calibrated = float(experiment.calibrator.predict_proba([[logit]])[0, 1])
    if not np.isclose(running, logit, rtol=1e-12, atol=1e-12):
        raise ValueError("Explanation failed reconstruction check")
    return {"input": row, "input_sha256": digest(row), "intercept": intercept,
            "contributions": factors, "logit": logit, "raw_probability": raw,
            "calibrated_probability": calibrated,
            "calibration": {"slope": float(experiment.calibrator.coef_[0, 0]),
                            "intercept": float(experiment.calibrator.intercept_[0])},
            "reconstruction_error": abs(running - logit),
            "warning": "Original fictional inputs only. Complete base-model log-odds decomposition, not probability contributions or causal effects. Changes show model sensitivity, not real-world interventions."}
