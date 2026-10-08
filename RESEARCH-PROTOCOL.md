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

### Fixed synthetic reliability extension

`synthetic-reliability-v1` uses seed 314159 for five cases on the saved model's mature evaluation cohort. Control is an exact copy. Category composition samples whole records with replacement at weight 3 for the original authentication-bypass/remote-command categories and 1 otherwise. Severity composition uses weight 3 for severity ≥7, 1 otherwise. Each sample retains the original cohort size. Severity measurement corruption adds Normal(0,1) noise clipped to [1,10]; boolean measurement corruption independently flips remote/authentication inputs with probability .10. Outcomes are always retained. There is no concept-shift/relabeling experiment, retraining or recalibration. Reused-record counts, prevalence, input fingerprints, raw/calibrated metrics and calibrated bin support are recorded. Budget 50 applies once to the whole scenario, with duplicate draws treated as distinct slots. Deltas between changed composition and control are not paired causal effects or confidence intervals. One seeded realization does not establish robustness to all shifts.

Global importance separately permutes description, severity, remote and authentication-required raw inputs, with 20 repetitions and seeds 314159 plus column index. Full description categories are shuffled, not individual token columns. Outputs are mean baseline-minus-permuted AP and permuted-minus-baseline Brier, with sample shuffle SD (ddof=1). Negative values remain visible. SD describes shuffle randomness conditional on this fixed model/cohort, not sampling uncertainty. Correlation and unrealistic permuted feature combinations can distort importance. No feature removal/selection is performed.

Learning curves refit earliest 25/50/75/100% of complete training days in each existing walk-forward fold, rounding down to a complete day count. Later calibration/evaluation cohorts are fixed within the fold. Preprocessing/classifier fit only the prefix; sigmoid calibration fits only the later calibration partition. In-sample training metrics use this later calibrator retrospectively and are not unbiased validation estimates. Class-deficient points are unavailable without resampling. Adding historical days changes both sample size and recency, so no causal data-volume conclusion is justified. No hyperparameter tuning, model selection, final holdout or new source acquisition is introduced.

### Frozen-model delayed-label replay

`frozen-delayed-replay-v1` starts after the original generated observation interval. Three seeds (2718, 3141, 1618) produce 182 days with 12 input-only records per day. Stable control, input shift and outcome-relationship shift are fixed scenarios. On day 91, input shift maps severity to rounded `7 + severity / 10 * 3` and remote to 1, retaining the original outcome formula. Concept shift retains identical control inputs and uses logit `-2 - .18 * severity - .7 * remote + .9 * auth + 1.4 * category_in_0_or_2` from day 91. Separate input/outcome random streams keep concept/control predictions identical for the frozen model.

All outcomes, including positives, become available only after the full 30-day horizon. Weekly checkpoints expose only records observed by that date and matured outcomes. Cumulative AP/Brier require at least 60 matured records and both classes. At each week close, model and severity rankings each review at most 15 records, once, without outcomes. Policy metrics aggregate only wholly matured weekly cohorts; pending cohorts are excluded for both. Random expected captures are analytical within the same cohorts, not a fitted model or Monte Carlo trial.

Drift compares each complete weekly window to fixed original training inputs. Severity uses nine equal bins over [1,10], predictions ten bins over [0,1], and original categories/booleans their fixed supports. Base-2 Jensen–Shannon distance uses no smoothing; the illustrative warning threshold is .20 with minimum support 60. Input warnings exclude prediction-distribution warnings from aggregate alert accounting. This threshold has no calibrated false-alarm or detection guarantee. Whole-run prechange/control warning counts and first fully postchange input-warning delay are retrospective evidence, not as-of predictions. Concept changes may not trigger input drift. No model refit or recalibration occurs.

### Prespecified synthetic challenge suite

`prespecified-synthetic-challenge-v1` uses seeds 101, 202, 303 and 3,600 original records per case, six per simulated day starting 2030-01-01. All candidates share severity, remote, authentication, numeric category code and an irrelevant independent Gaussian feature. Cases are the original linear relationship; nonlinear logit `-4.5 + 2.8 * remote_auth_XOR + 2 * severity_at_least_7_and_category_1_or_3`; control outcomes with independently corrupted severity Normal(0,2), clipped to [1,10]; and a new logit `-2.2 - .2 * severity - .7 * remote + 1.1 * auth + 1.5 * category_in_0_or_2` after day 480. Dates are fictional, not a live forecast.

The existing purged chronological split and 30-day maturity rules apply. Candidates are standardized logistic regression (C=1, max_iter=1000), histogram gradient boosting (60 iterations, learning rate .05, 15 leaves, minimum leaf 20, L2=1, no early stopping), and training prevalence. Each fitted candidate receives separate sigmoid calibration (C=1, max_iter=1000) on the later calibration partition. Report all raw/calibrated metrics and calibrated AP, Brier and recall@50 across seeds, with sample SD (ddof=1). Both classes are required in every partition; no resampling repair. Seeds, cases and parameters are fixed without evaluation-driven tuning. These are explored synthetic development challenges, not a final holdout, general NLP comparison, confidence intervals or winner-selection procedure. No serving-model replacement occurs.

## Stop conditions (unchanged gates)

Remain synthetic-only if permission scope, historical availability, labels, or sample size are inadequate. Any target/window/cohort change requires a new protocol version with its motivation recorded before evaluation. Do not switch to exploitation claims, enrich positives silently, or interpret non-inclusion as no exploitation.
