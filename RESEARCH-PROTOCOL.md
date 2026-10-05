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

These synthetic windows and the existing 60/20/20 benchmark are explored development results, not an untouched final test. They test implementation, not scientific validity. Confidence intervals, statistical significance, real-data training, new cohort acquisition and historical KEV label audit are not implemented in this milestone.

## Stop conditions

Remain synthetic-only if permission scope, historical availability, labels, or sample size are inadequate. Any target/window/cohort change requires a new protocol version with its motivation recorded before evaluation. Do not switch to exploitation claims, enrich positives silently, or interpret non-inclusion as no exploitation.
