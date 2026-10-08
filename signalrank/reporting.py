"""Portable Markdown research report from a saved synthetic experiment."""
import json


def markdown(report, provenance):
    lines = ["# SignalRank AI — synthetic experiment report", "", report["warning"], "",
             "## Scope", "", "Original fictional data only. No validated real-world prediction, causal explanation, legal certification or security advice.",
             "", "## Provenance", "", "```json", json.dumps(provenance, indent=2, sort_keys=True, allow_nan=False), "```",
             "", "## Configuration", "", "```json", json.dumps(report["configuration"], indent=2, sort_keys=True), "```",
             "", "Dataset SHA-256: " + report["dataset_sha256"], "", "## Mature evaluation", "",
             "| Metric | Value |", "| --- | ---: |"]
    for key, value in report["model"].items():
        lines.append(f"| {key} | {value:.6f} |")
    lab = report.get("reliability")
    if not lab:
        lines += ["", "Reliability probes unavailable in this snapshot. Run the current offline demo."]
    else:
        lines += ["", "## Robustness scenarios", "", lab["stress"]["warning"], "",
                  "| Scenario | n / unique / positives | AP | Brier | Recall@50 |", "| --- | ---: | ---: | ---: | ---: |"]
        for item in lab["stress"]["items"]:
            s = item["support"]
            m = item.get("calibrated")
            values = f'{m["average_precision"]:.6f} | {m["brier_score"]:.6f} | {m["recall_at_50"]:.6f}' if m else "Unavailable | Unavailable | Unavailable"
            lines.append(f'| {item["name"]} | {s["count"]} / {s["unique_records"]} / {s["positives"]} | {values} |')
        lines += ["", "## Global permutation importance", "", lab["importance"].get("warning", lab["importance"].get("reason", "")), "",
                  "| Raw input | Mean AP drop | Shuffle SD | Mean Brier increase | Shuffle SD |", "| --- | ---: | ---: | ---: | ---: |"]
        for item in lab["importance"]["items"]:
            lines.append(f'| {item["feature"]} | {item["average_precision_drop"]:.6f} | {item["average_precision_drop_sd"]:.6f} | {item["brier_increase"]:.6f} | {item["brier_increase_sd"]:.6f} |')
        lines += ["", "## Temporal learning curves", "", lab["learning_curves"]["warning"], "",
                  "| Fold | Train n | Train end | Evaluation AP | Evaluation Brier |", "| ---: | ---: | --- | ---: | ---: |"]
        for fold in lab["learning_curves"]["folds"]:
            for point in fold["points"]:
                m = point.get("evaluation")
                values = f'{m["average_precision"]:.6f} | {m["brier_score"]:.6f}' if m else "Unavailable | Unavailable"
                lines.append(f'| {fold["fold"]} | {point["train_count"]} | {point["train_last"]} | {values} |')
    replay = report.get("replay")
    if replay:
        lines += ["", "## Simulated-time replay", "", replay["warning"], "",
                  "| Scenario | Seed | Mature / pending | AP | Brier | Model captured / positives |", "| --- | ---: | ---: | ---: | ---: | ---: |"]
        for run in replay["runs"]:
            point = run["checkpoints"][-1]
            m, policy = point["metrics"], point["policies"][0]
            values = f'{m["average_precision"]:.6f} | {m["brier_score"]:.6f}' if m else "Unavailable | Unavailable"
            lines.append(f'| {run["name"]} | {run["seed"]} | {point["mature"]} / {point["pending"]} | {values} | {policy["captured"]} / {policy["positives"]} |')
        lines += ["", "Weekly budget applies at week close, once per record; policy results include only wholly mature weekly cohorts. Random selection is an analytical expectation, not an observed policy run."]
    else:
        lines += ["", "Simulated-time replay unavailable in this snapshot."]
    challenge = report.get("challenge")
    if challenge:
        lines += ["", "## Prespecified synthetic challenges", "", challenge["warning"], "",
                  "| Case | Candidate | Evaluated seeds | Mean AP | AP seed SD | Mean Brier |", "| --- | --- | ---: | ---: | ---: | ---: |"]
        for item in challenge["summary"]:
            m = item["metrics"]
            sd = f'{m["average_precision"]["seed_sd"]:.6f}' if m and m["average_precision"]["seed_sd"] is not None else "Unavailable"
            values = f'{m["average_precision"]["mean"]:.6f} | {sd} | {m["brier_score"]["mean"]:.6f}' if m else "Unavailable | Unavailable | Unavailable"
            lines.append(f'| {item["name"]} | {item["candidate"]} | {item["evaluated_seeds"]} | {values} |')
    else:
        lines += ["", "Synthetic challenge suite unavailable in this snapshot."]
    recovery = report.get("recovery")
    if recovery:
        lines += ["", "## Fixed-schedule retraining comparison", "", recovery["warning"], "",
                  "| Scenario | Seed | Frozen AP | Scheduled AP | Frozen Brier | Scheduled Brier |", "| --- | ---: | ---: | ---: | ---: | ---: |"]
        for run in recovery["runs"]:
            a, b = [run["results"]["postchange_mature"][k] for k in ("frozen", "scheduled")]
            values = f'{a["average_precision"]:.6f} | {b["average_precision"]:.6f} | {a["brier_score"]:.6f} | {b["brier_score"]:.6f}' if a and b else "Unavailable | Unavailable | Unavailable | Unavailable"
            lines.append(f'| {run["name"]} | {run["seed"]} | {values} |')
        lines += ["", "Interval: day 91 onward with mature labels only; the control has no scheduled generator change. All fixed seeds retained. No winner or serving-model promotion."]
    else:
        lines += ["", "Retraining comparison unavailable in this snapshot."]
    decision = report.get("decision")
    if decision:
        lines += ["", "## Decision trade-offs", "", decision["warning"], ""]
        if decision["status"] == "available":
            lines += [decision["selection_rule"], "", "| Policy | Budget | Validation cost | Later evaluation cost |", "| --- | ---: | ---: | ---: |"]
            for profile in decision["profiles"]:
                if (profile["missed_cost"], profile["negative_cost"], profile["review_cost"]) == (5, 1, .1):
                    lines.append(f'| {profile["policy"]} | {profile["chosen_budget"]} | {profile["validation_cost"]:.3f} | {profile["evaluation_cost"]:.3f} |')
            lines += ["", "Illustrative profile: missed-positive cost 5, selected-negative cost 1, review cost .1 units. Costs are not monetary savings."]
        else:
            lines += [decision.get("reason", "Unavailable")]
    lines += ["", "## Architecture", "", "Original generator → past-only training/preprocessing → later sigmoid calibration → mature evaluation → offline reliability, replay, retraining and decision evidence → trusted artifact → bounded prediction/explanation and read-only evidence views.",
              "", "## Limitations", "", "All windows are synthetic development data. No real-data training or redistribution permission is granted. Checksums detect accidental changes, not malicious replacement. Public multi-user deployment is not supported.", ""]
    return "\n".join(lines)
