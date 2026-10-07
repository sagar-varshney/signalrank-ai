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
    lines += ["", "## Architecture", "", "Original generator → past-only training/preprocessing → later sigmoid calibration → mature evaluation → offline reliability probes → trusted local artifact → read-only API/React evidence views.",
              "", "## Limitations", "", "All windows are synthetic development data. No real-data training or redistribution permission is granted. Checksums detect accidental changes, not malicious replacement. Public multi-user deployment is not supported.", ""]
    return "\n".join(lines)
