"""Descriptive diagnostics over the complete fictional evaluation cohort."""
from collections import defaultdict
import numpy as np

from signalrank.core import FEATURES, labels, matrix, metrics, reliability


def contributions(experiment, row):
    vector = experiment.model.named_steps["features"].transform(matrix([row]))
    dense = vector.toarray()[0] if hasattr(vector, "toarray") else vector[0]
    values = dense * experiment.model.named_steps["classifier"].coef_[0]
    names = experiment.model.named_steps["features"].get_feature_names_out()
    return [{"feature": str(names[j]), "value": float(values[j])}
            for j in np.argsort(-np.abs(values), kind="stable")[:4]]


def evaluation_records(experiment):
    return [{"id": row["id"], "observed_at": row["observed_at"], "outcome": int(y), "probability": float(p)}
            for row, y, p in zip(experiment.test, labels(experiment.test), experiment.probabilities)]


def build(experiment, budget=50):
    rows, p = experiment.test, experiment.probabilities
    y = labels(rows)
    budget = min(budget, len(rows))
    order = np.argsort(-p, kind="stable")
    selected = np.zeros(len(rows), dtype=bool)
    selected[order[:budget]] = True
    groups = defaultdict(list)
    for i, row in enumerate(rows):
        year, month = row["observed_at"][:4], int(row["observed_at"][5:7])
        groups[("Period", f"{year} Q{(month - 1) // 3 + 1}")].append(i)
        groups[("Severity", "High (7–10)" if row["severity"] >= 7 else "Medium (4–<7)" if row["severity"] >= 4 else "Low (1–<4)")].append(i)
        groups[("Description category", row["description"])].append(i)
        groups[("Remote", "Remote" if row["remote"] else "Local")].append(i)
    slices = []
    for (dimension, group), idx in sorted(groups.items()):
        idx = np.array(idx)
        count, positives = len(idx), int(y[idx].sum())
        # An explicit display gate, not a sample-size or statistical-validity guarantee.
        enough = count >= 30 and positives >= 5 and count - positives >= 5
        captured = int(y[idx][selected[idx]].sum())
        slices.append({"dimension": dimension, "group": group, "count": count,
                       "positives": positives, "selected": int(selected[idx].sum()), "captured": captured,
                       "missed": positives - captured, "status": "descriptive" if enough else "insufficient evidence",
                       "metrics": {key: value for key, value in metrics(y[idx], p[idx]).items()
                                   if key in ("average_precision", "brier_score")} if enough else None,
                       "global_budget_recall": captured / positives if enough else None})
    cases = []
    for kind, mask in [("selected negative", selected & (y == 0)), ("missed positive", ~selected & (y == 1))]:
        for i in [i for i in order if mask[i]][:12]:
            row = rows[i]
            cases.append({**{key: row[key] for key in ("id", "observed_at", "description", *FEATURES)},
                          "kind": kind, "outcome": int(y[i]), "probability": float(p[i]),
                          "rank": int(np.where(order == i)[0][0]) + 1, "contributions": contributions(experiment, row)})
    raw = experiment.model.predict_proba(matrix(rows))[:, 1]
    captured = int(y[selected].sum())
    return {"mode": "synthetic", "population": len(rows), "positives": int(y.sum()), "budget": budget,
            "selected_negatives": budget - captured, "missed_positives": int(y.sum()) - captured,
            "captured": captured, "slices": slices, "examples": cases,
            "calibration": {"raw": reliability(y, raw), "calibrated": reliability(y, p)},
            "missingness": [{"feature": key, "missing": sum(row.get(key) is None for row in rows)} for key in ("description", *FEATURES)],
            "scope": "Full mature synthetic test cohort, not the top-100 forecast export. Budget applies once to the whole cohort; slice recall uses that same global selection.",
            "display_gate": "At least 30 records, five positives and five negatives per slice. This display rule does not establish statistical adequacy.",
            "warning": "Exploratory synthetic error analysis. Groups overlap; no causal interpretation, operational backtest or real-world predictive claim. Missing-data slices are absent because the generator has no missing features."}
