"""Compact, derived evidence from an existing report. No fitting or new scoring."""
from copy import deepcopy


def build(report, provenance=None):
    diagnostic = report.get("diagnostics", {})
    support = diagnostic.get("population")
    positives = diagnostic.get("positives")
    rows = [{"name": "Combined · calibrated", **report["model"]},
            {"name": "Severity ranking", **report["severity_baseline"]}]
    rows += [deepcopy(row) for row in report.get("comparisons", []) if row["name"] in ("Text only", "Structured only", "Training prevalence")]
    slices = [deepcopy(row) for row in diagnostic.get("slices", []) if row.get("metrics")]
    slices.sort(key=lambda row: (row["metrics"]["average_precision"], row["dimension"], row["group"]))
    temporal = report.get("temporal_evaluation", {})
    return {"protocol": "saved-evidence-summary-v1", "mode": report["mode"], "target": report["target"],
            "warning": report["warning"], "dataset_sha256": report["dataset_sha256"],
            "configuration": deepcopy(report["configuration"]), "splits": deepcopy(report["splits"]),
            "support": {"count": support, "positives": positives, "prevalence": report["test_prevalence"],
                        "budget": diagnostic.get("budget"), "captured": diagnostic.get("captured"),
                        "missed": diagnostic.get("missed_positives"), "selected_negatives": diagnostic.get("selected_negatives")},
            "comparisons": rows,
            "average_precision_delta_vs_severity": report["model"]["average_precision"] - report["severity_baseline"]["average_precision"],
            "calibration_bins": deepcopy(report.get("calibration_bins", [])),
            "lowest_ap_slices": slices[:3], "temporal_windows": len(temporal.get("folds", [])),
            "evaluated_temporal_windows": sum(f.get("status") == "evaluated" for f in temporal.get("folds", [])),
            "provenance": deepcopy(provenance or {}),
            "limitations": ["Original synthetic development data; no demonstrated real-world predictive performance.",
                            "These evaluation windows have been explored; they are not an untouched final test.",
                            "AP differences are descriptive. No confidence interval or significance claim is supplied by this summary.",
                            "Slice groups overlap. Lowest-AP groups are descriptive findings, not independent discoveries.",
                            "Severity is a ranking score, so its Brier score is intentionally unavailable.",
                            "Predictions and feature contributions do not establish causality or operational benefit."]}


def markdown(value):
    support = value["support"]
    number = lambda v: "Unavailable" if v is None else f"{v:.4f}"
    lines = ["# SignalRank — experiment evidence", "", value["warning"], "",
             f'Target: {value["target"]}', f'Dataset SHA-256: {value["dataset_sha256"]}',
             f'Snapshot: {value["provenance"].get("snapshot_id", "Unavailable")}',
             f'Model artifact: {value["provenance"].get("artifact_id", "Unavailable — baseline startup has no saved artifact")}',
             f'Training run: {value["provenance"].get("run_id", "Unavailable")}', "",
             "## Evaluation support", "", f'Records: {support["count"]}; positives: {support["positives"]}; prevalence: {number(support["prevalence"])}.',
             f'Global review budget: {support["budget"]}; captured: {support["captured"]}; missed: {support["missed"]}; selected negatives: {support["selected_negatives"]}.', "",
             "| Partition | Records | First observation | Last observation |", "| --- | ---: | --- | --- |"]
    for name, split in value["splits"].items():
        lines.append(f'| {name} | {split["count"]} | {split["first"]} | {split["last"]} |')
    lines += ["", "## Same-cohort comparisons", "", "| Candidate | Average precision | Brier | Recall at 50 |", "| --- | ---: | ---: | ---: |"]
    for row in value["comparisons"]:
        lines.append(f'| {row["name"]} | {number(row.get("average_precision"))} | {number(row.get("brier_score"))} | {number(row.get("recall_at_50"))} |')
    lines += ["", f'Descriptive AP difference versus severity: {value["average_precision_delta_vs_severity"]:+.4f}.',
              f'Evaluable temporal windows: {value["evaluated_temporal_windows"]} / {value["temporal_windows"]}.', "",
              "## Lowest-AP supported slices", "", "| Dimension | Group | Records | Positives | AP |", "| --- | --- | ---: | ---: | ---: |"]
    for row in value["lowest_ap_slices"]:
        lines.append(f'| {row["dimension"]} | {row["group"]} | {row["count"]} | {row["positives"]} | {number(row["metrics"]["average_precision"])} |')
    lines += ["", "## Limits of the evidence", "", *("- " + note for note in value["limitations"]), ""]
    return "\n".join(lines)
