# Seoul bike-demand benchmark — protocol v1

This is a separate real-data benchmark inside SignalRank. It does not change the KEV target, its blocked training scope, or the original fictional model. It studies ranking hours with high citywide bicycle rental demand one day ahead; it cannot allocate bikes to stations because the source has citywide hourly counts.

## Source and permitted use

[UCI Seoul Bike Sharing Demand](https://archive.ics.uci.edu/dataset/560/seoul+bike+sharing+demand), DOI [10.24432/C5F62R](https://doi.org/10.24432/C5F62R), donated 2020, provides 8,760 hourly observations and lists CC BY 4.0. The reviewed [legal code](https://creativecommons.org/licenses/by/4.0/legalcode.en) permits reuse/adaptation subject to its conditions. Retain attribution, source/license links, supplied notices and identification of modifications. No endorsement is implied. This is a scoped engineering use decision, not a guarantee about all legal rights.

The implementation uses aggregate rental counts and date/hour fields. It does not use customer identifiers, original weather fields, trademarks, logos, linked third-party content, pretrained models or paid APIs. Derived features/labels, scaling, calibration and evaluation are modifications and are identified in every exported report. Raw data and local artifacts are not added to Git. Public deployment remains synthetic-only; the new route returns an unavailable state in public mode.

## Fixed design, declared before acquisition/evaluation

The executable design is `signalrank/bike-protocol.json`. Dates use the Seoul local clock represented as UTC+09. At the end of source hour t, the forecast ranks the count in source hour t+24. That target hour finishes 24 hours after forecast cutoff. This is a historical replay assuming hour-completion availability, not an audit of original data-publication latency.

High demand means target count at or above the **80th percentile of training targets**, using NumPy's `higher` quantile method. Labels for every later partition use that exact frozen threshold. Preprocessing fits only on training inputs. Features use completed current/past counts, trailing means, differences and target-hour/weekday calendar cycles. Future weather, future rental counts and future functioning status cannot enter the feature vector. Non-functioning hours remain in the population; no outcome-based exclusion or replacement occurs.

Chronological boundaries: calibration begins 1 July 2018, development 1 August 2018, final evaluation 1 October 2018. For each earlier partition, the target must finish **strictly before** the next partition begins. The final observations require complete target hours in the source. One week of history is required for inputs. Whole-hour duplicates, gaps, invalid values or a changed schema fail the input contract instead of being silently repaired.

Primary model: standardized logistic regression, C=1, max_iter=1000. Fixed comparison: histogram gradient boosting, 100 iterations, learning rate .05, 15 leaves, minimum leaf 20, L2=1, no early stopping. Both use seed 42 and receive separate sigmoid calibration on the later calibration partition. No candidate is selected using development/final scores. Baselines are current-hour demand, target-hour demand from the previous week and training prevalence. Raw count baselines are rankings, so no Brier score is invented for them.

Report AP, Brier for probabilities, precision/recall and captures under the top 10% retrospective partition budget; show class support, dates, calibration-bin counts, monthly slices and primary-model error examples. Do not interpret the global ranking budget as a deployable real-time policy. No statistical significance or confidence-coverage claim is made. The final interval is reserved until this fixed implementation and its fixture tests are complete; after first evaluation it is a recorded evaluated interval, not an untouched resource for future tuning.

## Resource and storage boundaries

The explicit CLI acquires the official dataset only, with a 2 MiB download limit, safe single-file ZIP handling and a 2 MiB uncompressed CSV limit. A source checksum is pinned before fitting. The standard library parses CSV; the existing NumPy/scikit-learn environment trains the small models with one numerical worker. CPU use is checked against a 120-second budget. Local storage is capped at 20 MiB; generated output lives under `~/.local/share/signalrank/bikes`, outside Documents. No downloads, fitting or deserialization occur on web requests.

Dataset publication counts, archive/schema validation and source pinning may be inspected before fitting. Model metrics and final outcome support must not drive changes to this protocol. Any later experiment must retain this first report and disclose that the final interval has already been evaluated.

Stable ties follow chronological source order. For the constant-prevalence baseline, review-budget captures therefore select the earliest hours and are not a random-selection estimate. CPU limits are checked between bounded fits; they are not operating-system preemption.

The [first fixed evaluation](research/seoul-benchmark-first-results-2026-11-03.md) records all candidates, support, provenance and limitations. The dashboard and Markdown export show absolute captures at the fixed review budget beside average precision, so ranking differences are not mistaken for proportional decision gains. No model winner was selected after evaluation.

## Exploratory subgroup audit after the first evaluation

`python -m signalrank.bike_audit --run` uses the already pinned local CSV and valid first report. It repeats only the original fixed logistic fit and July sigmoid calibration, checks that its full-final AP, Brier, weekly baseline AP and global captured count exactly reproduce the saved report, and writes a separate small report. `#bikes` and `/api/bikes/audit` read that report without fitting. The public profile returns unavailable before reading local data. The audit is local and free; it does not acquire another source.

The [audit protocol](signalrank/bike-audit-protocol.json) defines time-of-day, weekday/weekend and training-derived low recent demand cohorts. Each dimension partitions the same final hours. Captures are intersections with the **one original global** top-10% budget. Within-group AP/Brier have a support display gate; a group with no positives has no AP shown. Groups overlap between dimensions, and within-group AP depends partly on group prevalence. This analysis was designed **after** the final interval was examined, so every subgroup finding is exploratory. It must not be presented as a new validation set, an operational policy, or a basis for claiming statistical significance.

## Independent 2019 source gate

A [predeclared 2019 external-source protocol](research/seoul-2019-external-protocol-2026-11-07.md) proposed testing the frozen 2018 logistic model on the official Seoul 2019 hourly release. The [source audit](research/seoul-2019-source-gate-2026-11-07.md) found 69 missing hours and disagreement on all 361 comparable daily totals against a separately published official daily release. **External model evaluation was blocked before scoring.** This is a meaningful data-contract result, not a 2019 performance result. `python -m signalrank.bike_external --inspect` reads the saved local gate report; `/api/bikes/external` and the bike page display it without fitting or downloading. Public mode returns unavailable before reading local source artifacts.
