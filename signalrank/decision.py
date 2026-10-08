"""Budget selection on earlier development validation, not later evaluation."""
from datetime import date, timedelta
import numpy as np

from signalrank.core import HORIZON, labels
from signalrank.replay import digest


def curve(rows, probabilities, budgets):
    y = labels(rows)
    order = np.argsort(-np.asarray(probabilities), kind="stable")
    positives = int(y.sum())
    return [{"budget": k, "captured": int(y[order[:k]].sum()),
             "missed": positives - int(y[order[:k]].sum()),
             "selected_negatives": k - int(y[order[:k]].sum()),
             "precision": float(y[order[:k]].mean()) if k else None,
             "recall": float(y[order[:k]].sum() / positives) if positives else None}
            for k in budgets]


def cost(point, missed, negative, review):
    return float(point["missed"] * missed + point["selected_negatives"] * negative + point["budget"] * review)


def build(experiment):
    rows = experiment.test
    boundary = date.fromisoformat(rows[int(len(rows) * .4)]["observed_at"])
    validation = [r for r in rows if date.fromisoformat(r["observed_at"]) < boundary]
    # Every validation label matures strictly before the evaluation interval starts.
    evaluation_start = boundary + timedelta(days=HORIZON)
    evaluation = [r for r in rows if date.fromisoformat(r["observed_at"]) >= evaluation_start]
    warning = "Synthetic development decision analysis, not operational advice or measured business savings. Budgets are selected on an earlier validation cohort only. Later evaluation is not used to choose a budget. These subdivisions were introduced after the original test was explored; neither is an untouched final holdout. Costs are hypothetical units, not money or causal impact."
    result = {"protocol": "past-validation-budget-v1", "warning": warning,
              "configuration": {"validation_fraction": .4, "horizon_days": HORIZON,
                                "missed_costs": [1, 5, 10], "negative_costs": [0, 1, 5], "review_costs": [0, .1, 1]},
              "partitions": {name: {"count": len(part), "positives": int(labels(part).sum()),
                                    "first": part[0]["observed_at"] if part else None,
                                    "last": part[-1]["observed_at"] if part else None,
                                    "dataset_sha256": digest(part)}
                             for name, part in (("validation", validation), ("evaluation", evaluation))}}
    if any(len(part) < 30 or len(np.unique(labels(part))) != 2 for part in (validation, evaluation)):
        return {**result, "status": "unavailable", "reason": "Both partitions need 30 records and both classes; no resampling repair."}
    maximum = min(100, len(validation), len(evaluation))
    budgets = sorted(set([0, maximum, *range(5, maximum + 1, 5)]))
    result["curves"] = {name: {"model": curve(part, experiment.predict(part), budgets),
                               "severity": curve(part, [r["severity"] for r in part], budgets)}
                        for name, part in (("validation", validation), ("evaluation", evaluation))}
    profiles = []
    for missed in result["configuration"]["missed_costs"]:
        for negative in result["configuration"]["negative_costs"]:
            for review in result["configuration"]["review_costs"]:
                for policy in ("model", "severity"):
                    chosen = min(result["curves"]["validation"][policy], key=lambda p: (cost(p, missed, negative, review), p["budget"]))
                    measured = next(p for p in result["curves"]["evaluation"][policy] if p["budget"] == chosen["budget"])
                    profiles.append({"missed_cost": missed, "negative_cost": negative, "review_cost": review,
                                     "policy": policy, "chosen_budget": chosen["budget"],
                                     "validation_cost": cost(chosen, missed, negative, review),
                                     "evaluation_cost": cost(measured, missed, negative, review)})
    return {**result, "status": "available", "budgets": budgets, "profiles": profiles,
            "selection_rule": "Minimum total hypothetical validation cost; ties choose the smaller review budget. Same count budget transferred to later evaluation, not a probability threshold or rate."}
