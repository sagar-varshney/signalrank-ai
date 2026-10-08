"""Fixed-schedule offline retraining comparison with strict label availability."""
from datetime import date, timedelta
from time import perf_counter
import numpy as np
from threadpoolctl import threadpool_limits

from signalrank.core import HORIZON, generate, fitted_model, matrix
from signalrank.replay import SEEDS, SCENARIOS, DAYS, PER_DAY, CHANGE_DAY, BUDGET, stream, score, digest

UPDATE_DAYS = (84, 112, 140, 168)


def predict(model, calibrator, rows):
    return calibrator.predict_proba(model.decision_function(matrix(rows)).reshape(-1, 1))[:, 1]


def run(experiment, scenario, seed):
    original = generate(experiment.config.seed, experiment.config.count)
    start = date.fromisoformat(original[-1]["observed_at"]) + timedelta(days=1)
    inputs, oracle = stream(start, scenario, seed)
    frozen = experiment.predict(inputs)
    updated = frozen.copy()
    updates = []
    model, calibrator = experiment.model, experiment.calibrator
    for offset in UPDATE_DAYS:
        cutoff = start + timedelta(days=offset)
        calibration_start = cutoff - timedelta(days=60)
        history = [dict(row, event_date=(date.fromisoformat(row["observed_at"]) + timedelta(days=HORIZON)).isoformat() if oracle[i] else None)
                   for i, row in enumerate(inputs[:max(0, offset - HORIZON) * PER_DAY])]
        available = original + history
        train = [r for r in available if date.fromisoformat(r["observed_at"]) + timedelta(days=HORIZON) < calibration_start]
        calibration = [r for r in available if date.fromisoformat(r["observed_at"]) >= calibration_start
                       and date.fromisoformat(r["observed_at"]) + timedelta(days=HORIZON) < cutoff]
        evidence = {"at": cutoff.isoformat(), "day": offset,
                    "training": {"count": len(train), "first": train[0]["observed_at"], "last": train[-1]["observed_at"]},
                    "calibration": {"count": len(calibration), "first": calibration[0]["observed_at"], "last": calibration[-1]["observed_at"]},
                    "training_sha256": digest(train), "calibration_sha256": digest(calibration)}
        began = perf_counter()
        try:
            model, calibrator = fitted_model(train, calibration, experiment.config)
            evidence.update(status="fitted", model_version=digest({"training": evidence["training_sha256"], "calibration": evidence["calibration_sha256"], "C": experiment.config.regularization_c, "seed": experiment.config.seed}))
        except ValueError as error:
            evidence.update(status="skipped", reason=str(error))
        evidence["fit_seconds"] = perf_counter() - began
        updates.append(evidence)
        following = next((d for d in UPDATE_DAYS if d > offset), DAYS)
        updated[offset * PER_DAY:following * PER_DAY] = predict(model, calibrator, inputs[offset * PER_DAY:following * PER_DAY])
    checkpoints = []
    for day in range(6, DAYS, 7):
        mature = max(0, day - HORIZON + 1) * PER_DAY
        window = slice(max(0, mature - 30 * PER_DAY), mature)
        checkpoints.append({"as_of": (start + timedelta(days=day)).isoformat(), "mature": mature,
                            "window_first": inputs[max(0, mature - 30 * PER_DAY)]["observed_at"] if mature else None,
                            "frozen": score(oracle[window], frozen[window]), "scheduled": score(oracle[window], updated[window])})
    mature = (DAYS - HORIZON) * PER_DAY
    regions = {"all_mature": slice(0, mature), "postchange_mature": slice(CHANGE_DAY * PER_DAY, mature)}
    results = {name: {"frozen": score(oracle[indices], frozen[indices]), "scheduled": score(oracle[indices], updated[indices])}
               for name, indices in regions.items()}
    policies = []
    for name, probabilities in (("frozen", frozen), ("scheduled", updated)):
        chosen, population = [], []
        for offset in range(0, DAYS * PER_DAY, 7 * PER_DAY):
            indices = np.arange(offset, min(offset + 7 * PER_DAY, DAYS * PER_DAY))
            if int(indices[-1]) >= mature:
                continue
            chosen.extend(indices[np.argsort(-probabilities[indices], kind="stable")[:BUDGET]])
            population.extend(indices)
        policies.append({"policy": name, "reviewed": len(chosen), "population": len(population),
                         "captured": int(oracle[chosen].sum()), "positives": int(oracle[population].sum())})
    return {"scenario": scenario, "name": SCENARIOS[scenario], "seed": seed, "start": start.isoformat(),
            "end": (start + timedelta(days=DAYS - 1)).isoformat(), "change_at": (start + timedelta(days=CHANGE_DAY)).isoformat() if scenario != "stable" else None,
            "input_sha256": digest(inputs), "frozen_prediction_sha256": digest(frozen.tolist()),
            "scheduled_prediction_sha256": digest(updated.tolist()), "updates": updates, "checkpoints": checkpoints,
            "results": results, "policies": policies,
            "ledger": [{**row, "frozen_probability": float(frozen[i]), "scheduled_probability": float(updated[i]),
                        "outcome_available_at": (date.fromisoformat(row["observed_at"]) + timedelta(days=HORIZON)).isoformat(),
                        "outcome": int(oracle[i]) if i < mature else None} for i, row in enumerate(inputs)]}


def build(experiment):
    with threadpool_limits(limits=1):
        runs = [run(experiment, scenario, seed) for seed in SEEDS for scenario in SCENARIOS]
    return {"protocol": "fixed-schedule-recovery-v1", "mode": "synthetic",
            "warning": "Retrospective original synthetic development comparison. Fixed schedule, not drift-triggered or automatically promoted. Retraining may help or hurt. All fitting labels mature strictly before use; calibration is later than training with a 30-day maturity gap. Rolling metrics use only matured outcomes. No serving model changes. Fit times are local measurements, not production throughput.",
            "configuration": {"update_days": list(UPDATE_DAYS), "calibration_observation_days": 30,
                              "rolling_mature_days": 30, "weekly_budget": BUDGET, "horizon_days": HORIZON, "seeds": list(SEEDS)},
            "runs": runs}
