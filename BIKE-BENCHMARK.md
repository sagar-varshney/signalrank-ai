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
