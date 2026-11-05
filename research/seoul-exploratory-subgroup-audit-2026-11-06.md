# Exploratory Seoul subgroup audit — 6 November 2026

This analysis follows the [first fixed evaluation](seoul-benchmark-first-results-2026-11-03.md). The final interval had already been inspected. The original logistic configuration and July sigmoid calibration were refitted without changing features, parameters, outcome rule or partition dates. Full-final AP, Brier, weekly-baseline AP and top-10% captures reproduced the first saved report exactly. These rows are **exploratory diagnostics**, not an untouched holdout, model selection, significance test or operational benefit claim.

Source and attribution: [UCI Seoul Bike Sharing Demand](https://archive.ics.uci.edu/dataset/560/seoul+bike+sharing+demand), DOI [10.24432/C5F62R](https://doi.org/10.24432/C5F62R), CC BY 4.0. SignalRank added past-only features, a training-derived high-demand label, fixed model fitting and retrospective subgroup calculations. No endorsement is implied. The audit uses the original pinned local CSV; it did not acquire or redistribute data.

The training-input 25th percentile for mean completed demand over the prior 24 hours was **224.17 rentals/hour** (higher quantile method). All final hours belong to exactly one group in each dimension. The global 145-hour logistic ranking budget captures 118 positives. Captures below are intersections with that *same* global selection.

| Dimension | Group | Hours / positives | Logistic AP | Weekly AP | Global selected / captured |
| --- | --- | ---: | ---: | ---: | ---: |
| Target-hour daypart | 00–05 | 360 / 0 | Unavailable | Unavailable | 0 / 0 |
| Target-hour daypart | 06–11 | 360 / 66 | 0.475 | 0.611 | 7 / 6 |
| Target-hour daypart | 12–17 | 360 / 154 | 0.693 | 0.640 | 64 / 50 |
| Target-hour daypart | 18–23 | 361 / 168 | 0.746 | 0.729 | 74 / 62 |
| Target-hour week | Weekday | 1057 / 302 | 0.705 | 0.657 | 108 / 89 |
| Target-hour week | Weekend | 384 / 86 | 0.604 | 0.629 | 37 / 29 |
| Recent completed demand | Low (≤224.17) | 152 / 34 | 0.646 | 0.520 | 0 / 0 |
| Recent completed demand | Other | 1289 / 354 | 0.698 | 0.658 | 145 / 118 |

The overnight group has zero high-demand outcomes, so AP is not defined under the display guard. The low-recent-demand group receives no slot under the globally ranked budget; this does **not** imply the model has no ranking ability within that group. Morning and weekend AP are lower than their weekly baselines in this inspected interval. AP comparisons across groups are affected by different prevalences. These findings suggest questions for a new, independently sourced time period; changing the current model to fit them would reuse an explored final interval.

First benchmark report SHA-256: `612e77f1665b74e26956ae73b70e3f862fccebcae3df1484489128b78a93d3e7`. Exploratory audit SHA-256: `0a07bf1169e167ae90023d91e82e8bfd63449efb20ed884173ae7ddf149a5b39`.

The app serves only the small derived JSON audit. The source CSV and report remain in local application storage outside iCloud Documents; neither is committed or included in the public container. A new confirmatory claim would require an independently reserved later period with a predeclared protocol and audited source-availability assumptions.
