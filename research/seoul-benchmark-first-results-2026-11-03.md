# First Seoul bike-demand evaluation — 3 November 2026

Protocol and implementation were committed as `18557e1` before this real-data evaluation. The primary model, comparison family, dates, training-derived label rule and retrospective ranking budget were fixed in advance. No hyperparameters or features were changed after seeing these results.

Seoul Bike Sharing Demand [Dataset]. (2020). UCI Machine Learning Repository.
DOI: https://doi.org/10.24432/C5F62R
Source: https://archive.ics.uci.edu/dataset/560/seoul+bike+sharing+demand
License: Creative Commons Attribution 4.0 International (CC BY 4.0)
https://creativecommons.org/licenses/by/4.0/
Legal code: https://creativecommons.org/licenses/by/4.0/legalcode.en

SignalRank modifications: date/hour validation, past-only lag/rolling/calendar
features, training-derived high-demand labels, chronological maturity purges,
fitted models, separate probability calibration and aggregate evaluation.
No endorsement by the dataset contributors, UCI or Creative Commons is implied.
No source logos or linked third-party materials are included.


Dataset SHA-256: `373339b71a8935d69e9af0abf26a70744632119862eeb3919efb389a7b749c60`
Report SHA-256: `612e77f1665b74e26956ae73b70e3f862fccebcae3df1484489128b78a93d3e7`
Protocol: `seoul-next-day-demand-v1`. High-demand threshold: **1071 rentals/hour**, derived from the training target-count 80th percentile.

## Chronological support

| Partition | Hours | Positive outcomes | First forecast | Last forecast |
| --- | ---: | ---: | --- | --- |
| train | 4895 | 982 | 2017-12-08T01:00:00+09:00 | 2018-06-29T23:00:00+09:00 |
| calibration | 720 | 266 | 2018-07-01T00:00:00+09:00 | 2018-07-30T23:00:00+09:00 |
| development | 1440 | 511 | 2018-08-01T00:00:00+09:00 | 2018-09-29T23:00:00+09:00 |
| final | 1441 | 388 | 2018-10-01T00:00:00+09:00 | 2018-11-30T00:00:00+09:00 |

72 origins were purged at boundaries. Earlier labels mature strictly before the following partition begins. The final forecast date has one evaluable hour; the daily table retains its hour count.

## Final fixed comparison

| Candidate | AP | Brier | Captured / 388 | Precision | Recall |
| --- | ---: | ---: | ---: | ---: | ---: |
| Logistic regression · calibrated | 0.680077 | 0.137748 | 118 | 0.8138 | 0.3041 |
| Histogram boosting · calibrated | 0.721114 | 0.113138 | 100 | 0.6897 | 0.2577 |
| Latest-hour demand | 0.617482 | Unavailable (ranking score) | 106 | 0.7310 | 0.2732 |
| Same target hour last week | 0.645474 | Unavailable (ranking score) | 117 | 0.8069 | 0.3015 |
| Training prevalence | 0.269257 | 0.201470 | 34 | 0.2345 | 0.0876 |

All policies rank the same 1,441 final hours; the top-10% budget is 145 hours. It is a retrospective partition budget, not a live operational policy. Stable ties use chronological source order; the prevalence baseline is not a random-selection experiment.

## Interpretation

The prespecified logistic model improves AP over the weekly-demand baseline, but captures only one more positive at this budget (118 versus 117). Boosting has higher AP and lower Brier than logistic, but captures fewer positives at the same budget (100 versus 118). These are different aspects of ranking/probability quality; no blanket model winner or statistically significant improvement is claimed.

Local fitting/evaluation used 0.209 CPU seconds in the recorded runtime. Runtime is machine-dependent. The complete source/cache/report directory was about 1.2 MiB after the first run; no model weights, raw dataset or report artifact were added to Git.

## Limits

This is evidence for one historical city-year and this exact derived task. It does not validate the synthetic/KEV model, establish shortages/capacity needs, prove economic benefit or demonstrate generalization to later years/other cities. Availability after hour completion is an assumption; the source does not establish original reporting latency or revision vintages. The final interval is now evaluated and must be identified as explored in future changes.

The local app shows saved results through `#bikes` and `/api/bikes`, with full factor accounting for primary-model error examples. Web requests do not download data, fit models or load pickle. The public deployment profile remains synthetic-only.
