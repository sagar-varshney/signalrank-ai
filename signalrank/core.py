"""Deterministic synthetic experiment with purged chronological evaluation.

The synthetic outcome resembles catalog inclusion, not exploitation itself.
No public records, pretrained weights, or external network calls are used.
"""
from datetime import date, timedelta
from dataclasses import dataclass, asdict
import math
from hashlib import sha256
import json
from importlib.resources import files

import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import average_precision_score, brier_score_loss
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

HORIZON = 30
FEATURES = ["severity", "remote", "authentication_required"]


@dataclass(frozen=True)
class TrainingConfig:
    seed: int = 42
    count: int = 3600
    regularization_c: float = 1.0
    source: str = "synthetic"

    def __post_init__(self):
        if self.source != "synthetic":
            raise ValueError("Real-data training is disabled; only synthetic is permitted")
        if type(self.seed) is not int or not 0 <= self.seed <= 2**32 - 1:
            raise ValueError("seed must be an integer between 0 and 2**32 - 1")
        if type(self.count) is not int or not 1800 <= self.count <= 30000:
            raise ValueError("count must be an integer between 1800 and 30000")
        if isinstance(self.regularization_c, bool) or not isinstance(self.regularization_c, (int, float)) or not math.isfinite(self.regularization_c) or not .001 <= self.regularization_c <= 100:
            raise ValueError("regularization_c must be finite and between .001 and 100")


def fitted_model(train, calibration, config):
    for name, rows in [("train", train), ("calibration", calibration)]:
        if not rows or len(np.unique(labels(rows))) != 2:
            raise ValueError(f"{name} partition must contain both outcome classes")
    model = Pipeline([
        ("features", ColumnTransformer([
            ("text", TfidfVectorizer(ngram_range=(1, 2)), 0),
            ("numeric", StandardScaler(), [1, 2, 3]),
        ])),
        ("classifier", LogisticRegression(C=config.regularization_c, max_iter=1000, random_state=config.seed)),
    ])
    model.fit(matrix(train), labels(train))
    calibrator = LogisticRegression(C=1.0, random_state=config.seed)
    calibrator.fit(model.decision_function(matrix(calibration)).reshape(-1, 1), labels(calibration))
    return model, calibrator


def registry():
    return json.loads(files("signalrank").joinpath("sources.json").read_text())


def require_source(name, operation="local_audit"):
    from signalrank.scope import require_use
    require_use(name, operation, registry())


def generate(seed=42, count=3600):
    require_source("synthetic", "train")
    rng = np.random.default_rng(seed)
    rows = []
    descriptions = ["memory corruption in document parser", "authentication bypass in gateway", "information disclosure in local utility", "remote command handling flaw", "denial of service in image decoder"]
    for i in range(count):
        kind = int(rng.integers(len(descriptions)))
        severity = float(np.round(rng.uniform(1, 10), 1))
        remote, auth = int(rng.integers(2)), int(rng.integers(2))
        probability = 1 / (1 + np.exp(-(-5 + .22 * severity + 1.2 * remote - .8 * auth + (1.1 if kind in (1, 3) else 0))))
        published = date(2022, 1, 1) + timedelta(days=i // 3)
        event = published + timedelta(days=int(rng.integers(1, HORIZON + 1))) if rng.random() < probability else None
        rows.append(dict(id=f"SYN-{i:05d}", published=published.isoformat(), observed_at=published.isoformat(), description=descriptions[kind], severity=severity, remote=remote, authentication_required=auth, event_date=event.isoformat() if event else None))
    return rows


def split(rows):
    ordered = sorted(rows, key=lambda r: r["observed_at"])
    calibration_start = date.fromisoformat(ordered[int(len(rows) * .60)]["observed_at"])
    test_start = date.fromisoformat(ordered[int(len(rows) * .80)]["observed_at"])
    observation_end = date.fromisoformat(ordered[-1]["observed_at"])
    train, calibration, test = [], [], []
    for row in ordered:
        start = date.fromisoformat(row["observed_at"])
        mature = start + timedelta(days=HORIZON)
        if mature < calibration_start:
            train.append(row)
        elif calibration_start <= start and mature < test_start:
            calibration.append(row)
        elif test_start <= start and mature <= observation_end:
            test.append(row)
    return train, calibration, test


def matrix(rows):
    return np.array([[r["description"], *[r[k] for k in FEATURES]] for r in rows], dtype=object)


def labels(rows):
    result = []
    for row in rows:
        observed = date.fromisoformat(row["observed_at"])
        event = date.fromisoformat(row["event_date"]) if row["event_date"] else None
        result.append(int(event is not None and observed < event <= observed + timedelta(days=HORIZON)))
    return np.array(result)


def metrics(y, p, k=50):
    k = min(k, len(y))
    top = np.argsort(-p, kind="stable")[:k]
    return {"average_precision": float(average_precision_score(y, p)), "brier_score": float(brier_score_loss(y, p)), "precision_at_50": float(y[top].mean()), "recall_at_50": float(y[top].sum() / max(1, y.sum()))}


def reliability(y, probabilities):
    """Fixed-width bins, including empty bins; probabilities of 1 stay in bin 9."""
    assignments = np.minimum((probabilities * 10).astype(int), 9)
    bins = []
    for i in range(10):
        mask = assignments == i
        bins.append({"lower": i / 10, "upper": (i + 1) / 10,
                     "count": int(mask.sum()),
                     "predicted": float(probabilities[mask].mean()) if mask.any() else None,
                     "observed": float(y[mask].mean()) if mask.any() else None})
    return bins


class Experiment:
    def __init__(self, config=None):
        config = config or TrainingConfig()
        self.config = config
        rows = generate(seed=config.seed, count=config.count)
        train, calibration, test = split(rows)
        self.model, self.calibrator = fitted_model(train, calibration, config)
        self.test = test
        self.probabilities = self.predict(test)
        severity = np.array([r["severity"] for r in test])
        y = labels(test)
        severity_top = np.argsort(-severity, kind="stable")[:50]
        self.report = {
            "mode": "synthetic", "target": "Simulated catalog inclusion within 30 days",
            "warning": "Synthetic benchmark; not evidence of real-world predictive value or security advice.",
            "dataset_sha256": sha256(json.dumps(rows, sort_keys=True).encode()).hexdigest(),
            "seed": config.seed, "horizon_days": HORIZON, "configuration": asdict(config),
            "splits": {name: {"count": len(data), "first": data[0]["observed_at"], "last": data[-1]["observed_at"]} for name, data in [("train", train), ("calibration", calibration), ("test", test)]},
            "excluded_unmatured_or_embargoed": len(rows) - len(train) - len(calibration) - len(test),
            "test_prevalence": float(y.mean()), "model": metrics(y, self.probabilities),
            "severity_baseline": {"average_precision": float(average_precision_score(y, severity)), "recall_at_50": float(y[severity_top].sum() / max(1, y.sum()))},
        }
        self.report["comparisons"] = [
            {"name": "Combined · calibrated", **metrics(y, self.probabilities)},
            {"name": "Combined · raw", **metrics(y, self.model.predict_proba(matrix(test))[:, 1])},
        ]
        # Prespecified ablations: same training and evaluation partitions.
        for name, transforms in [
            ("Text only", [("text", TfidfVectorizer(ngram_range=(1, 2)), 0)]),
            ("Structured only", [("numeric", StandardScaler(), [1, 2, 3])]),
        ]:
            candidate = Pipeline([("features", ColumnTransformer(transforms)),
                                  ("classifier", LogisticRegression(C=config.regularization_c, max_iter=1000, random_state=config.seed))])
            candidate.fit(matrix(train), labels(train))
            self.report["comparisons"].append({"name": name, **metrics(y, candidate.predict_proba(matrix(test))[:, 1])})
        constant = np.full(len(test), labels(train).mean())
        self.report["comparisons"].append({"name": "Training prevalence", **metrics(y, constant)})
        self.report["calibration_bins"] = reliability(y, self.probabilities)
        self.report["evaluation_note"] = "Prespecified comparisons on a synthetic test set; no model selected or tuned using these results. Interactive exploration makes this a development benchmark, not a final real-world test."

    def simulate(self, budget):
        if not 1 <= budget <= len(self.test):
            raise ValueError("Budget must be within the test population")
        y = labels(self.test)
        severity = np.array([r["severity"] for r in self.test])
        strategies = []
        for name, scores in [("Combined model", self.probabilities), ("Severity ranking", severity)]:
            captured = int(y[np.argsort(-scores, kind="stable")[:budget]].sum())
            strategies.append({"name": name, "captured": captured,
                               "missed": int(y.sum()) - captured,
                               "false_positives": budget - captured,
                               "precision": captured / budget,
                               "recall": captured / max(1, int(y.sum()))})
        return {"mode": "synthetic", "budget": budget, "population": len(y),
                "total_positives": int(y.sum()), "strategies": strategies,
                "random_expected_captured": float(budget * y.mean()),
                "interpretation": "Retrospective ranking across the entire test cohort, not a weekly operational backtest or estimated risk reduction."}

    def predict(self, rows):
        scores = self.model.decision_function(matrix(rows)).reshape(-1, 1)
        return self.calibrator.predict_proba(scores)[:, 1]

    def forecasts(self, limit=20):
        order = np.argsort(-self.probabilities, kind="stable")[:limit]
        results = []
        for i in order:
            row = self.test[i]
            # Contributions are exact for the base linear log-odds, not causal claims.
            vector = self.model.named_steps["features"].transform(matrix([row]))
            dense = vector.toarray()[0] if hasattr(vector, "toarray") else vector[0]
            contributions = dense * self.model.named_steps["classifier"].coef_[0]
            names = self.model.named_steps["features"].get_feature_names_out()
            strongest = np.argsort(-np.abs(contributions))[:4]
            results.append({**{k: v for k, v in row.items() if k != "event_date"}, "probability": float(self.probabilities[i]), "explanation_type": "Base-model log-odds contributions (not causal)", "contributions": [{"feature": str(names[j]), "value": float(contributions[j])} for j in strongest]})
        return results


if __name__ == "__main__":
    print(json.dumps(Experiment().report, indent=2))
