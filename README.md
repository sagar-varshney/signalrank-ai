# SignalRank AI

A Python rare-event forecasting application. Version 0.1 is a working, entirely synthetic experiment with a FastAPI dashboard, a text-plus-tabular baseline, separate probability calibration, and a held-out chronological benchmark.

## Run locally

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -e '.[test]'
.venv/bin/python -m unittest discover -s tests -v
.venv/bin/python -m uvicorn signalrank.api:app --host 127.0.0.1 --port 8010
```

Open http://127.0.0.1:8010. API documentation is at `/docs`.
Run `.venv/bin/python -m signalrank.core` for the reproducible JSON benchmark without the web app. Startup trains the small deterministic experiment once per process. This is development behavior; production training will be a separate job with versioned artifacts.

## What is implemented

- 3,600 fictional records from a seeded local generator, with no external data or model calls.
- TF-IDF text and standardized numeric features, logistic regression, and a later calibration partition.
- Thirty-day label maturity gaps between training, calibration, and test, with immature observations excluded.
- Average precision, Brier score, precision/recall at 50, and a severity-ranking baseline.
- Exact base-model linear contributions, clearly distinguished from causation and calibrated-probability explanations.
- Forecast explorer, evaluation view, source status, and dataset fingerprint.
- Five prespecified model comparisons: calibrated/raw combined, text-only, structured-only, and training-prevalence baseline.
- Fixed-width calibration bins with counts, including empty groups.
- Investigation-budget simulator comparing captured positives against severity ranking and the analytical expectation for random selection. This ranks the full historical test cohort; it is not an operational weekly backtest.
- Downloadable JSON experiment report from the dashboard.
- Scoped source approval, official license evidence and a real-data feasibility API.
- Official KEV catalog audit (1,733 records) and 16-record historical CVE pilot, separate from training.
- Redesigned responsive dashboard with evidence timeline, audit detail, navigation and downloadable findings.

## Local feasibility audit

The pilot found 14/16 candidate historical snapshots, one unavailable record and one unpublished record. This selection-biased sample cannot establish prevalence or predictive performance. Timestamp corrections and historical catalog membership remain unvalidated. Real training remains disabled.

Run `.venv/bin/python -m signalrank.audit` after restoring local `evidence/` license files and `data/raw/kev.json` from the official sources in GOVERNANCE.md. It requires GitHub network access, verifies archived terms and records content-addressed downloads with provenance. Missing evidence fails closed. These local raw/evidence directories are intentionally excluded from Git.

## Scientific boundary

The intended real-data target is **future KEV catalog inclusion**, not probability of all exploitation or probability of a breach in a particular company. A negative label means no catalog entry observed within the window; it does not establish absence of exploitation. Catalog coverage and reporting delays affect the target.

Synthetic outcomes are generated from a known mathematical process. Performance only verifies the engineering workflow and must never appear on a resume as a real-world ML result. The text features are TF-IDF, not transformer embeddings. No LLM, SHAP, pretrained model, real SBOM matching, deployment, or production monitoring is implemented yet.

## Next build stages

### Reconstruction and evidence milestone

Run `.venv/bin/python -m signalrank.reconstruct --limit 500 --workers 4` with the local source evidence, pinned catalog and cohort manifest available. Requires the GitHub CLI authenticated for read-only API requests; raw official CVE snapshots are retrieved anonymously. Four bounded workers download up to three source documents per record. Transient requests have bounded retries. URL-indexed, hash-verified evidence and per-record checkpoints live in ignored `data/raw/reconstruction/`. Successful checkpoints are reused on restart; source errors are retried. A build identity binds the cohort manifest, catalog hash and cutoff policy. Do not run two copies of the same build concurrently.

The command atomically updates `signalrank/readiness.json`. The Dataset build view shows progress, candidates, exclusions and provisional labels; each record opens its timestamps, feature availability, source URLs and SHA-256 evidence. Search, status filtering and pagination run through read-only API endpoints. The browser never launches downloads or training.

Current result: 500/500 processed, 428 candidates and 72 exclusions, with zero positive candidate labels and 98 candidates missing historical metrics. Exclusions include missing timezone information, unpublished records, missing publication fields, already-listed records and boundary ambiguity. Resuming from the cached evidence was verified offline. The 428 remaining labels are provisional negatives, not evidence of no exploitation.

Training is still disabled. This pilot cannot support binary-model training/evaluation. Next: predeclare a larger outcome-blind frame, audit historical catalog changes and extend the source approval before real-data training. Do not enrich the sample by silently substituting KEV positives. Historical record reconstruction is implemented; complete historical label verification is not.

### Identifier-frame milestone

`.venv/bin/python -m signalrank.cohort` pins the official CVE repository commit, traverses its Git trees and refuses truncated, empty, duplicate or unexpected identifier inventories. It records source URLs, hashes and the deterministic seed before selecting 500 identifiers without looking at KEV outcomes. The current frame contains 39,256 CVE-2024 paths. Identifier year is not publication year; rejected records remain in the frame until explicitly audited. The resulting manifest is available at `/api/cohort`.

This command needs the same local license evidence as the audit and GitHub network access. Running it again resolves a new upstream commit and may change the frame; preserve the existing manifest when comparing runs. Historical reconstruction of the selected 500 records is not implemented yet. No model is trained from this inventory.

### Interface

Appearance can be set to Light, Dark or System from the header. It defaults to the operating-system preference and remembers an explicit choice locally; storage failures do not block the app. Both themes use shared semantic colors. Readability improvements include larger secondary text, 44px controls, visible focus indicators, a skip-to-content link, focus transfer to the active view heading, keyboard-scrollable table regions and a two-column mobile navigation. These are targeted accessibility improvements, not a full accessibility certification.

The research workbench has four views: Overview, Data & validation, Model evaluation and Forecast explorer. Validation supports identifier/status filters; forecasts support search within the top 100 records, score ordering and 15-row pagination. Empty results are explicit. Styling uses local assets only, system fonts, keyboard focus states and a narrow-screen layout. Synthetic results remain visibly separated from official-data evidence.

### Historical validation milestone

Run `.venv/bin/python -m signalrank.validation` to replay the local pilot offline. It verifies cached file hashes, compares historical/current publication timestamps, checks commit and container times against the cutoff, and excludes day-resolution boundary ambiguity at either end of the forecast window. The report is served at `/api/validation` and visualized in the dashboard. All 14 available snapshots pass these checks; this does not prove first-publication availability or make the biased pilot a training cohort.

An outcome-blind, seeded hash-ranking sampler is implemented as `select_cohort`. It still needs a complete, pinned CVE sampling frame. Next: acquire and audit that frame, select the cohort without looking at KEV outcomes, reconstruct historical features, and audit catalog-history changes before generating final labels. No real-data model is trained yet.

### Repository boundary

This project is a standalone Git repository within the larger local workspace. Raw downloaded data, local license evidence, virtual environments and secrets are excluded. Aggregate reports and source code are included. A fresh clone can run the synthetic app and view stored reports, but rerunning the official-data audit requires the local evidence described above. No public data redistribution approval is implied by a private code backup.

1. Extend the completed local source review to training/display/redistribution uses and complete release notice checks. No blanket legal guarantee is possible.
2. Audit historical record availability and timestamp corrections; reconstruct features as known at each forecast time. Current record text must not be used to simulate past predictions.
3. Build a real-data baseline and evaluate label prevalence, cohort bias, temporal generalization, and useful ranking lift. Stop and reassess if the target lacks enough positives or historical evidence.
4. Compare boosted trees and licensed text encoders using ablations; keep a final untouched test interval.
5. Add experiment tracking, versioned inference artifacts, and monitored batch forecasts.
6. Consider grounded summaries only after model/weight/tokenizer licensing and factual-evaluation review.

See [GOVERNANCE.md](GOVERNANCE.md) for current evidence and release restrictions. Existing scouting files are outside this project's implementation.
