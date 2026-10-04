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
