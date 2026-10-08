# SignalRank AI architecture

## Purpose and boundary

A local single-user Python ML research workbench for rare-event forecasting. Original synthetic observations support model fitting and demonstrations. A separate historical official-data feasibility/reconstruction track cannot enter training until its permission, time-availability and label-quality gates are met.

## Offline ML lifecycle

`core.py` generates observations, enforces synthetic configuration, constructs purged chronological partitions and fits TF-IDF/numeric logistic regression with later sigmoid calibration. Targets and event dates never enter the feature matrix.

`temporal.py` defines three expanding past-only folds with disjoint later evaluation windows and mature outcomes. `diagnostics.py` analyzes the full evaluation cohort and ranking-budget errors. `benchmark.py` uses a fixed same-input logistic/tree contrast, with different-input text/numeric reference explicitly distinguished.

`reliability.py` runs fixed seeded composition/measurement scenarios against the saved combined model, raw-column permutation importance and refitted earliest-history learning curves. Scenario and importance probes do not retrain. Learning curves refit on each earlier training prefix, reusing that fold's later calibration and evaluation cohorts. All outputs are development evidence, not confirmatory tests.

`replay.py` scores input-only simulated streams with the frozen saved model, withholds every outcome for 30 days and evaluates weekly review policies only on wholly matured cohorts. Checkpoint reads/exports omit future records and mask immature labels. Fixed-reference input/prediction distribution distances are distinct from cumulative mature-label performance. `challenge.py` fits fixed candidates on four original synthetic cases across three seeds, with chronological maturity gaps and separate calibration. Neither module selects a winner or replaces the serving model.

`training.py` explicitly creates new local run directories, records success/failure, serializes models, exports reports and saves snapshots. Manifests fingerprint ten ML/report modules and saved model/report/card files. The strict loader verifies runtime, code, checksums and completed run state before trusted-local deserialization. Pickle remains unsafe for untrusted artifacts; hashing is not an authenticity signature.

## Persistence and serving

`history.py` stores content-addressed SQLite report snapshots, full synthetic evaluation records and top-100 forecasts, not model weights. `inference.py` validates a bounded fictional batch against startup-allowlisted model versions and saves append-only receipts in a separate SQLite database. Local owners can modify either database; these are not tamper-proof audit systems.

`api.py` serves static assets, saved evidence and bounded fictional batch inference. It never trains reliability probes on requests. A trusted-model startup deserializes only explicitly supplied local model paths; the fallback startup trains the original small synthetic baseline and exposes missing offline evidence as unavailable. The service is loopback-only in the supported commands and has no public multi-user authentication claim.

`demo.py` orchestrates a new offline synthetic run followed by trusted-model serving, isolates its history/receipt paths and removes inherited extra model selections. `reporting.py` builds a portable Markdown convenience report. Manifest-backed JSON remains authoritative; Markdown is not signed or independently verified.

## Frontend

FastAPI is the sole server. Legacy HTML/JavaScript handles five views; React/TypeScript handles experiments, diagnostics, reliability, batch inference, time replay and synthetic challenges. TanStack Query supports cancelled reads, explicit errors and no implicit mutation retries. Vite emits committed local bundles with runtime license notices. Node is a build tool only; no CDN fonts, third-party visual assets or external analytics are used.

## Verification and limitations

Python tests cover purging, maturity, feature/label separation, seed reproducibility, scenario accounting, input validation, trusted reload, persistence and fail-closed gates. React tests cover routing, scenario/metric/fold selection, negative importance, missing evidence, checkpoint masking and explicit retry. `uv.lock` pins Python dependency resolution and artifact hashes; CI uses locked installation. `verify.py` checks a fresh offline run, exact reloaded predictions and saved report consistency. Playwright launches `e2e_server.py` in an isolated temporary directory and tests actual FastAPI routes, exports, all views, responsive navigation and persisted Light/Dark/System preferences. CI also rebuilds frontend assets and checks package contents. These checks do not promise byte-identical models across operating systems.

All models currently use synthetic data. Feature importance is model dependence, not causation; shuffle variability is not sampling uncertainty. Composition stress changes prevalence and reuses records; measurement corruption preserves original outcomes. Learning curves conflate history length with recency. No feature/model selection or final-holdout claim is justified by these results. Software license review, real-data usage approval and public deployment readiness are separate gates.
