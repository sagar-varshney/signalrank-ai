"""Prespecified multi-seed synthetic challenges; all candidates reported, none selected."""
from datetime import date, timedelta
import numpy as np
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from threadpoolctl import threadpool_limits

from signalrank.core import HORIZON, labels, metrics, split
from signalrank.replay import digest

SEEDS = (101, 202, 303)
CASES = {"linear": "Linear control", "interaction": "Nonlinear interactions", "measurement": "Noisy measurements", "concept": "Changed outcome relationship"}
FEATURES = ("severity", "remote", "authentication_required", "category_code", "irrelevant_noise")
COUNT = 3600
WARNING = "Prespecified original synthetic development challenges, not an untouched final benchmark or real-world accuracy. Identical inputs/partitions for each candidate. No tuning, winner selection or serving-model replacement. Seed SD describes only these three simulations, not confidence intervals. Numeric category encoding is deliberate and shared, not a general NLP benchmark."


def generate_case(case, seed, count=COUNT):
    if case not in CASES or count != COUNT:
        raise ValueError("Challenge cases and size are fixed by protocol")
    rng, observations = np.random.default_rng(seed), np.random.default_rng(seed + 10000)
    rows = []
    for i in range(count):
        severity = float(rng.uniform(1, 10))
        remote, auth, kind = int(rng.integers(2)), int(rng.integers(2)), int(rng.integers(5))
        noise = float(rng.normal())
        observed = date(2030, 1, 1) + timedelta(days=i // 6)
        logit = -5 + .22 * severity + 1.2 * remote - .8 * auth + (1.1 if kind in (1, 3) else 0)
        if case == "interaction":
            logit = -4.5 + 2.8 * (remote != auth) + 2.0 * (severity >= 7 and kind in (1, 3))
        if case == "concept" and i // 6 >= 480:
            logit = -2.2 - .2 * severity - .7 * remote + 1.1 * auth + (1.5 if kind in (0, 2) else 0)
        # Independent measurement randomness keeps the same underlying outcomes in noisy/control cases.
        measured = float(np.clip(severity + observations.normal(0, 2), 1, 10)) if case == "measurement" else severity
        event = observed + timedelta(days=HORIZON) if rng.random() < 1 / (1 + np.exp(-logit)) else None
        rows.append({"id": f"SYN-CHALLENGE-{seed}-{i:05d}", "observed_at": observed.isoformat(), "event_date": event.isoformat() if event else None,
                     "severity": measured, "remote": remote, "authentication_required": auth, "category_code": kind, "irrelevant_noise": noise})
    return rows


def build():
    items = []
    parameters = {"logistic": {"C": 1., "max_iter": 1000, "standardize": True},
                  "trees": {"max_iter": 60, "learning_rate": .05, "max_leaf_nodes": 15, "min_samples_leaf": 20, "l2_regularization": 1., "early_stopping": False},
                  "calibrator": {"C": 1., "max_iter": 1000}}
    with threadpool_limits(limits=1):
        for case, name in CASES.items():
            for seed in SEEDS:
                rows = generate_case(case, seed)
                parts = split(rows)
                support = {key: {"count": len(part), "positives": int(labels(part).sum()), "first": part[0]["observed_at"], "last": part[-1]["observed_at"]}
                           for key, part in zip(("training", "calibration", "evaluation"), parts)}
                xt, xc, xe = [np.array([[r[k] for k in FEATURES] for r in part]) for part in parts]
                yt, yc, ye = [labels(part) for part in parts]
                result = {"case": case, "name": name, "seed": seed, "dataset_sha256": digest(rows), "splits": support, "items": []}
                if any(len(np.unique(y)) != 2 for y in (yt, yc, ye)):
                    result.update(status="unavailable", reason="Both outcome classes required in every partition; no resampling repair")
                else:
                    candidates = {"logistic": make_pipeline(StandardScaler(), LogisticRegression(C=1, max_iter=1000, random_state=seed)),
                                  "trees": HistGradientBoostingClassifier(**parameters["trees"], random_state=seed)}
                    for candidate, model in candidates.items():
                        model.fit(xt, yt)
                        def logits(x):
                            p = np.clip(model.predict_proba(x)[:, 1], 1e-12, 1 - 1e-12)
                            return np.log(p / (1 - p)).reshape(-1, 1)
                        calibrator = LogisticRegression(**parameters["calibrator"], random_state=seed).fit(logits(xc), yc)
                        result["items"].append({"candidate": candidate, "raw": metrics(ye, model.predict_proba(xe)[:, 1]),
                                                "calibrated": metrics(ye, calibrator.predict_proba(logits(xe))[:, 1])})
                    result["items"].append({"candidate": "prevalence", "calibrated": metrics(ye, np.full(len(ye), yt.mean()))})
                    result["status"] = "evaluated"
                items.append(result)
    summary = []
    for case, name in CASES.items():
        for candidate in ("logistic", "trees", "prevalence"):
            scores = [item["calibrated"] for run in items if run["case"] == case for item in run["items"] if item["candidate"] == candidate]
            summary.append({"case": case, "name": name, "candidate": candidate, "evaluated_seeds": len(scores),
                            "metrics": {key: {"mean": float(np.mean([s[key] for s in scores])), "seed_sd": float(np.std([s[key] for s in scores], ddof=1)) if len(scores) > 1 else None}
                                        for key in ("average_precision", "brier_score", "recall_at_50")} if scores else None})
    return {"protocol": "prespecified-synthetic-challenge-v1", "mode": "synthetic", "warning": WARNING,
            "configuration": {"seeds": list(SEEDS), "count": COUNT, "features": list(FEATURES), "parameters": parameters,
                              "concept_change_day": 480, "horizon_days": HORIZON,
                              "definitions": {"linear": "Original linear formula; independent irrelevant Gaussian feature",
                                              "interaction": "Remote/authentication XOR and severity/category interaction",
                                              "measurement": "Control outcomes; observed severity adds Normal(0,2), clipped to [1,10]",
                                              "concept": "Original relationship until day 480; new fixed formula afterwards"}},
            "items": items, "summary": summary}
