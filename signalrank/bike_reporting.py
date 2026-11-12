"""Presentation-only export of a verified local bike benchmark."""

from signalrank.bikes import markdown as original_markdown


def markdown(report):
    if report["status"] != "available":
        return original_markdown(report)
    lines = ["# SignalRank — Seoul next-day demand benchmark", "", report["warning"], "",
             report["attribution"], "", f'Protocol: {report["protocol"]}',
             f'Dataset SHA-256: {report["dataset_sha256"]}',
             f'High-demand threshold: {report["threshold"]} rentals/hour (training-derived).', "",
             "| Partition | Candidate | Hours / positives | Captured / reviewed | AP | Brier | Precision at top 10% | Recall at top 10% |",
             "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |"]
    for part, rows in report["comparisons"].items():
        for row in rows:
            brier = "Unavailable" if row["brier_score"] is None else f'{row["brier_score"]:.4f}'
            lines.append(
                f'| {part} | {row["name"]} | {row["count"]} / {row["positives"]} | '
                f'{row["captured"]} / {row["budget"]} | {row["average_precision"]:.4f} | '
                f'{brier} | {row["precision"]:.4f} | {row["recall"]:.4f} |'
            )
    lines += ["", "## Limitations", "", *("- " + note for note in report["limitations"]), ""]
    return "\n".join(lines)
