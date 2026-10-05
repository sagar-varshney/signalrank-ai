# SignalRank research protocol — draft v1

## Decision and intended user

Study one-time early-warning ranking for ML researchers evaluating temporal generalization. The proposed real-data target is first KEV inclusion within 30 days after a forecast cutoff, not exploitation or organization-specific breach probability. No daily operational prioritization claim is made.

## Real-data study: blocked pending feasibility

The existing 500-record selection remains immutable and exploratory: 428 candidates, 72 exclusions, zero positive candidate labels. It cannot establish model performance. Training, display and redistribution permissions remain separate gates. No new source or permission is approved by this document.

Before acquiring a larger study cohort, freeze a manifest defining the publication-date interval, pinned identifier frame, source revisions, random seed or full enumeration, information cutoff, historical catalog observation end, exclusions and compute/download budget. This draft does not invent those choices or silently expand downloads. Identifier year is not publication year. Include rejected records in the accounting; do not replace excluded records or sample according to known outcomes.

Candidate cutoff: publication plus 24 hours, subject to historical first-availability audit. Timestamp consistency alone is insufficient. Use only features available at cutoff. Audit historical KEV membership, additions, corrections and removals; a current catalog's absence is not a verified historical negative. Exclude already-listed records, uncertain boundary cases and immature outcomes using declared rules.

Before fitting, publish counts by chronological partition, positives, exclusions, missingness and unresolved provenance. Both outcome classes are necessary but not sufficient. Define acceptable uncertainty for the chosen budget metrics before selecting cohort size; do not use an arbitrary positive-count threshold as proof of adequacy.

## Evaluation plan

Use expanding past-only training, later calibration and subsequent non-overlapping evaluation windows. Purge observations whose 30-day outcome windows overlap the next fitting/evaluation boundary. Keep a separately declared real-data final interval untouched until configurations and decision thresholds are frozen. Account for repeated entities and temporal dependence when estimating uncertainty.

Prespecified comparisons: text-plus-structured logistic regression, text-only, structured-only, severity and prevalence. Historical EPSS remains unapproved and absent. If approved later, align scores to cutoff and document version changes and its different target before treating it as an external ranking baseline.

Report average precision, prevalence, Brier score, calibration-bin counts, precision/recall at stated budgets and period-level results. Budget means records reviewed across the declared period, not time saved or breaches prevented. Do not compare probabilities for different targets as if calibrated alike. Missing outcome classes produce an explicit non-evaluable result.

## Implemented synthetic development protocol

`synthetic-walk-forward-v1` uses generated observations with seed/count in the run configuration. Evaluation starts at 50%, 65% and 80% of the ordered observations. Each fold calibrates on mature examples from the 120 days before its evaluation start; training labels must mature before that calibration interval. Final examples must mature by the synthetic observation end. Test windows do not overlap; later folds may train on earlier folds only after their labels mature. Review budgets are 10, 25, 50 and 100 per entire fold. Missing classes are not repaired through resampling.

These synthetic windows and the existing 60/20/20 benchmark are explored development results, not an untouched final test. They test implementation, not scientific validity. Statistical significance, real-data training, new cohort acquisition and historical KEV label audit remain unimplemented.

### Synthetic diagnostic and architecture extension

Diagnostics describe the complete mature synthetic evaluation cohort. A global budget of 50 is shared across overlapping slice dimensions; slice AP/Brier are computed within groups, but captured/missed counts and recall use the global ranking. Quarter, severity, original description and remote/local groups are fixed. The display gate (30 records, five positives, five negatives) suppresses unsupported metrics; it does not establish statistical adequacy. Original generated inputs have no missing values, so no missing-data subgroup is invented.

The fixed architecture contrast uses the same three unscaled numeric features for logistic regression and histogram gradient boosting (100 iterations, .05 learning rate, 15 leaves, min leaf 20, L2=1, early stopping disabled). Both fit on the same earlier training rows, then receive separate sigmoid calibration on the same subsequent calibration rows. A combined text/numeric logistic model is a reference with different inputs. No candidate is selected or tuned using evaluation results. Raw/calibrated AP, Brier, recall@50 and local fit/inference measurements are retained; benchmark candidates are not serving models.

### Conditional paired interval display

The exploratory `paired-moving-day-block-v1` protocol preserves paired IDs/dates/outcomes and each day's record grouping. It samples overlapping contiguous 30-day blocks from consecutive observed days, concatenates blocks and trims to the original number of days. Seed is 1729, replicates 250, interval percentiles 2.5 and 97.5. Deltas are B−A for AP, Brier and recall@50. At least 120 consecutive observed days and both outcome classes are required. One-class replicates are excluded and counted; more than 5% excluded makes the result unavailable. Mismatched or incomplete snapshots cannot produce intervals.

These are conditional resampling intervals, not confirmatory confidence coverage or significance tests. Approximately stationary short-range dependence and 30-day block adequacy are unvalidated assumptions. Retraining variance, repeated entities, regime shifts and exploratory configuration selection are not accounted for. The method does not justify real-data claims or override research gates.

## Stop conditions

Remain synthetic-only if permission scope, historical availability, labels, or sample size are inadequate. Any target/window/cohort change requires a new protocol version with its motivation recorded before evaluation. Do not switch to exploitation claims, enrich positives silently, or interpret non-inclusion as no exploitation.
