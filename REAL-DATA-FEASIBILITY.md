# Bounded real-data feasibility — next study gate

Status: **planning and existing-evidence review only; acquisition and fitting remain disabled**. This preserves the target in RESEARCH-PROTOCOL.md: first KEV catalog inclusion within 30 days of a historically validated forecast cutoff. It is not a study of every exploitation event or breach probability. This document grants no source rights and makes no legal certification.

## Existing evidence and the decision

The immutable exploratory selection has 500 records: 428 candidates, 72 exclusions and zero positive candidate labels. Those labels are provisional. Historical first availability and catalog additions, corrections and removals remain unresolved. This cohort cannot establish predictive performance. Do not turn absent outcomes into verified negatives or replace exclusions with known positives.

The next decision is whether a credible, modest-sized, outcome-blind cohort can be reconstructed under both the scientific protocol and permitted uses. Do not expand lifecycle automation while this remains unresolved.

## Work that needs no new acquisition

1. Inventory the already archived source revisions, notices and timestamp evidence.
2. Separate existing timestamp consistency checks from evidence that information was actually public at forecast time.
3. Identify which historical catalog observations would be needed to establish mature positive and negative labels, including corrections/removals.
4. Record missing evidence explicitly. Existing audit scope is distinct from permission to train, display records, redistribute data or release a model.

This implementation adds no downloader, new dataset or permission changes. The Evidence page summarizes existing **synthetic** results, not this exploratory real-data selection.

## Proposed limits for a separately approved metadata pilot

These are proposed maximums, not permission to start downloading:

| Resource | Proposed maximum |
| --- | ---: |
| New HTTP requests | 100 total; retries count |
| Downloaded response bodies | 20 MiB total, streamed hard limit |
| Local analysis | One CPU worker, 10 minutes |
| Additional persisted pilot files | 50 MiB total in local application storage |
| Paid services, GPUs or inference APIs | None; stop instead of paid fallback |

Use approved source endpoints only. No linked articles, exploit code, scraped personal data or pretrained models. Stop on a budget boundary or unresolved terms; do not continue a partial cohort as if complete. These limits may prove insufficient—that is a feasibility result, not grounds for silently increasing them.

Before any acquisition, freeze a versioned manifest containing **all** of:

- Publication-date interval, pinned identifier frame and source revisions; identifier year is not publication year.
- Full enumeration or seeded outcome-blind sample, with no positive enrichment or silent replacement.
- Forecast cutoff, historical first-availability evidence and label observation end.
- Rules for already-listed records, uncertain boundaries, corrections/removals and exclusions.
- Chronological training, later calibration, development and separately reserved final intervals with existing 30-day maturity purges.
- Desired precision of budget metrics and the sample-size justification, including dependence and expected outcome support.
- Exact endpoints, notices, intended uses, local output path and the fixed resource limits.

The interval, revisions, frame and uncertainty requirements are **not chosen here**. A placeholder manifest is not a frozen protocol. Cohort/target changes need a new protocol agreed before evaluation.

## Proceed / stop evidence

Proceed to a separately reviewed fitting phase only if source-use gates permit it, historical features and mature outcomes can be justified, partitions contain both classes with adequate support for the declared uncertainty requirements, and all exclusions/budget use are accounted for. Both classes alone are not proof of adequacy.

Report partition dates/counts/positives, missingness, exclusions, unresolved provenance and consumed requests/bytes even if the decision is to stop. Keep final outcomes out of tuning and do not inspect final-model metrics until configurations and thresholds are frozen. If the existing target is infeasible within the free/local budget, retain the honest synthetic engineering demonstration and record that finding. Any alternative target or dataset requires a fresh review before implementation.


## Implemented: read-only archived-evidence review

Run `python -m signalrank.study` in the existing environment, or open Data & validation. `/api/study-readiness` returns the local report and the browser can export it. The command prints JSON to stdout without creating files; redirect only to a chosen local path if you want a persistent report.

The review recomputes selection/row accounting; verifies the two archived notices, pinned catalog and content-addressed snapshot/meta hashes; checks row cutoff/maturity dates; and replays candidate snapshot, feature and provisional-label checks using verified cached bytes. It reports missing historical metrics and publication years separately from identifier-year selection. These checks do not prove archive authenticity, first public availability, historical outcome validity, legal clearance or adequate sample size.

The read budget is 32 MiB total and 2 MiB per file, with deduplicated reads. Symlinks are not followed, missing/changed/oversized files remain unresolved, and a budget limit never counts as a pass. The report includes input hashes and at most 20 file issues; no raw source records or text are exported by this endpoint. A missing cohort is explicitly unavailable, not an observed zero-positive dataset. Public mode short-circuits before any local archive read and returns no cohort, hashes or file inventory.

Real-data fitting and acquisition remain disabled in this review regardless of passing local checks or edited source flags. No downloader, automatic repair, relabelling, new model, paid service or final evaluation is introduced. Existing saved synthetic models remain compatible because the training pipeline and its fingerprinted code were not changed.

The first execution and its scientific stop decision are recorded in [the 2 November archived-evidence review](research/archived-evidence-review-2026-11-02.md). The input archive is retained locally and is not added to Git.
