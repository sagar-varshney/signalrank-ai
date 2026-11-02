# Archived-evidence review — 2 November 2026

This review used the existing local archive only. It made no network requests, fitted no model and changed no archived source files. Counts describe an exploratory cohort and do not establish real-world predictive performance or legal clearance.

## What the audit reproduced

| Check | Finding |
| --- | --- |
| Selection accounting | 500 processed; 428 candidates; 72 exclusions; no replacements |
| Candidate labels | 0 positive; 428 **provisional** negative |
| Snapshot payload checksums | 1,373 / 1,373 unique files match recorded hashes |
| Cache metadata | 1,476 / 1,476 entries agree with references and retrieval timestamps |
| Archived notices | Both recorded license/terms snapshots match their registered hashes |
| Pinned catalog | Local bytes match the recorded catalog checksum |
| Candidate date checks | 428 / 428 reproduce recorded cutoff and label-maturity consistency |
| Candidate replay | 428 / 428 reproduce cached snapshot, feature and provisional-label checks |
| Local read cost | 10,188,060 bytes; below the 32 MiB read budget |

Pinned cohort revision: `e4db98609301a28dd64345710feb78d6d5b8f95e`.

Checksums establish consistency with recorded local hashes, not source authenticity. Timestamp and snapshot consistency do not establish when the information first became public. The current catalog alone cannot validate historical negatives or account for later corrections/removals.

## Additional findings

- **74 of 428 candidates were published after 2024:** 354 in 2024, 71 in 2025 and 3 in 2026. A CVE-2024 identifier frame is not a cohort of records published in 2024. This matters when defining future chronological partitions and observation windows.
- **98 of 428 candidates lack historical metrics** under the saved feature-availability flag; zero candidate flags are unknown. This is a feature-availability finding, not a missing-value imputation study or proof of bias.
- All 428 candidate outcomes remain provisional negatives. There is no usable binary evaluation set here, even though archive checks pass.

## Decision

**Do not fit a real-data model or claim validated performance from this cohort.** First public availability, historical catalog labels, a frozen study frame/time window, independent partitions and an uncertainty/sample-size justification remain unresolved. Training/display/distribution permissions remain separate from the existing local-audit scope.

No cohort was expanded, positive examples added, exclusions replaced, source permissions changed or final interval evaluated. The next acquisition phase still requires the complete manifest and bounds in [REAL-DATA-FEASIBILITY.md](../REAL-DATA-FEASIBILITY.md). A failed feasibility decision is retained as evidence rather than concealed by tuning or resampling.

Reproduce with `python -m signalrank.study` from a checkout containing the same ignored local archive. The JSON export contains input fingerprints. A fresh clone without those archived files will correctly report unavailable archive checks; public mode exposes none of this local evidence.
