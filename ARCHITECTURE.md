# SignalRank AI architecture

## Purpose and boundary

A Python ML research workbench for rare-event forecasting: a local single-user profile and a separate restricted synthetic public-demo profile. Original fictional observations support fitting and demonstrations. The local historical official-data feasibility/reconstruction track cannot enter training until its permission, time-availability and label-quality gates are met; its evidence is excluded from the public image.

## Offline ML lifecycle

`core.py` generates observations, enforces synthetic configuration, constructs purged chronological partitions and fits TF-IDF/numeric logistic regression with later sigmoid calibration. Targets and event dates never enter the feature matrix.

`temporal.py` defines three expanding past-only folds with disjoint later evaluation windows and mature outcomes. `diagnostics.py` analyzes the full evaluation cohort and ranking-budget errors. `benchmark.py` uses a fixed same-input logistic/tree contrast, with different-input text/numeric reference explicitly distinguished.

`reliability.py` runs fixed seeded composition/measurement scenarios against the saved combined model, raw-column permutation importance and refitted earliest-history learning curves. Scenario and importance probes do not retrain. Learning curves refit on each earlier training prefix, reusing that fold's later calibration and evaluation cohorts. All outputs are development evidence, not confirmatory tests.

`replay.py` scores input-only simulated streams with the frozen saved model, withholds every outcome for 30 days and evaluates weekly review policies only on wholly matured cohorts. Checkpoint reads/exports omit future records and mask immature labels. Fixed-reference input/prediction distribution distances are distinct from cumulative mature-label performance. `challenge.py` fits fixed candidates on four original synthetic cases across three seeds, with chronological maturity gaps and separate calibration. Neither module selects a winner or replaces the serving model.

`recovery.py` compares the frozen model to refits on fixed simulated days 84/112/140/168. Both receive the same arriving inputs; training labels mature before the later calibration interval and calibration labels before the update. No drift-triggered scheduling, tuning or serving-model promotion occurs. `decision.py` separates earlier development decision validation from later evaluation by a maturity gap, chooses cost-minimizing count budgets only on validation and transfers them unchanged. Neither partition is an untouched holdout.

`training.py` explicitly creates new local run directories, records success/failure, serializes models, exports reports and saves snapshots. Manifests fingerprint thirteen ML/report modules and saved model/report/card files. The strict loader verifies runtime, code, checksums and completed run state before trusted-local deserialization. Pickle remains unsafe for untrusted artifacts; hashing is not an authenticity signature.

## Persistence and serving

`history.py` stores content-addressed SQLite report snapshots, full synthetic evaluation records and top-100 forecasts, not model weights. `inference.py` validates a bounded fictional batch against startup-allowlisted model versions and saves append-only receipts in a separate SQLite database. Local owners can modify either database; these are not tamper-proof audit systems.

`api.py` serves static assets, saved evidence and bounded fictional inference. `studio.py` computes every linear contribution and asserts reconstruction of the saved raw logit; sigmoid calibration is displayed separately. Model paths cannot be supplied by the browser. No evidence probe is fitted on a request. Local mode permits the original small startup-trained fallback and SQLite history/receipts; public mode requires a complete build-time artifact and prohibits both fallback fitting and visitor batch writes.

`deployment.py` provides exact host checks, same-origin CSP/security headers, bounded queries and a shared single-process API budget. Public snapshots contain one seeded in-memory report, omitting full replay/recovery ledgers with explicit provenance. Official-study routes return empty evidence. `release.py` builds and selects a synthetic artifact inside the Docker image, then serves one non-root worker. Startup validates the selected path, code/runtime integrity and required offline evidence. Provider TLS and policy review are external deployment steps; this is not authenticated multi-user production hosting.

`demo.py` orchestrates a new offline synthetic run followed by trusted-model serving, isolates its history/receipt paths and removes inherited extra model selections. `reporting.py` builds a portable Markdown convenience report. Manifest-backed JSON remains authoritative; Markdown is not signed or independently verified.

## Frontend

FastAPI is the sole server. Legacy HTML/JavaScript handles five views; React/TypeScript handles ten views: experiments, diagnostics, reliability, batch inference, replay, challenges, Prediction Studio, recovery, decisions and showcase. The guide links five explanatory steps without fitting anything. TanStack Query supports cancelled reads, explicit errors and no implicit mutation retries. Vite emits committed local bundles with runtime license notices. Node is a build tool only; no CDN fonts, third-party visual assets or external analytics are used.

## Verification and limitations

Python tests cover purging, maturity, feature/label separation, seed reproducibility, scenario accounting, input validation, trusted reload, persistence and fail-closed gates. React tests cover routing, scenario/metric/fold selection, negative importance, missing evidence, checkpoint masking and explicit retry. `uv.lock` pins Python dependency resolution and artifact hashes; CI uses locked installation. `verify.py` checks a fresh offline run, exact reloaded predictions and saved report consistency. Playwright launches `e2e_server.py` in an isolated temporary directory and tests actual FastAPI routes, exports, all views, responsive navigation and persisted Light/Dark/System preferences. CI also rebuilds frontend assets and checks package contents. These checks do not promise byte-identical models across operating systems.

All models currently use synthetic data. Feature importance is model dependence, not causation; shuffle variability is not sampling uncertainty. Composition stress changes prevalence and reuses records; measurement corruption preserves original outcomes. Learning curves conflate history length with recency. No feature/model selection or final-holdout claim is justified by these results. Software license review, real-data usage approval and public deployment readiness are separate gates.


## Evidence and storage update

Overview remains the entry point. The main workflow ends at `#evidence`, a derived summary of saved results with a concise Markdown export. Advanced tools live under Research tools and keep their direct routes. New demo output uses local application storage and reuses compatible completed runs; `--retrain` creates a fresh execution. See [STORAGE.md](STORAGE.md) for retained legacy databases and reviewed CLI cleanup. No data download or cleanup runs automatically. See [REAL-DATA-FEASIBILITY.md](REAL-DATA-FEASIBILITY.md) before any external-data expansion.
