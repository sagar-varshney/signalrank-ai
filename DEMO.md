# SignalRank AI: local demonstration

This is an ML engineering demonstration using original fictional data. It forecasts simulated 30-day catalog inclusion, not real-world exploitation or business risk. No performance number here should be presented as validated real-world accuracy.

## Fresh-clone setup

Inside this repository, use Python 3.13 for the CI-verified setup:

```sh
python3 -m pip install 'uv==0.12.23'
uv sync --locked --extra test --python 3.13
.venv/bin/python -m signalrank.demo
```

Installation downloads dependencies from your configured Python package index. The demo itself uses no external data source, weights, telemetry or hosted AI service. It prints the new run directory and opens a loopback server, not a browser. Visit `http://127.0.0.1:8015/` for Overview. Stop with Ctrl+C. If that port is occupied, use `--port 8016`. The default command performs bounded offline training before startup; readiness begins when Uvicorn reports startup complete.

Node is unnecessary for this demo: compiled React assets are included. To edit the frontend, follow the pnpm instructions in README. The committed Python lock pins dependency resolution and hashes, but does not promise identical numerical results across platforms. `uv sync` manages `.venv`; use `UV_PROJECT_ENVIRONMENT` to choose a separate environment if preserving an existing one. The unpinned pip installation alternative is documented in README.

## Guided five-step showcase

Overview is the first page. For the optional tour, open `http://127.0.0.1:8015/#showcase` and choose **Start guided walkthrough**:

1. **Prediction Studio:** edit fictional inputs, compare probabilities, inspect all linear terms and the separate calibration bridge. Browser-local examples and JSON exports pin the model version.
2. **Diagnostics:** inspect selected negatives, missed positives and subgroup support. Scores are not causal explanations.
3. **Time replay:** rewind; labels remain pending for 30 days. Drift and mature-label metrics answer different questions.
4. **Recovery comparison:** compare frozen/scheduled models across seeds and inspect fitting/calibration cutoffs. Updates can help or hurt; the final update has no mature post-update outcome yet. Nothing replaces the serving model.
5. **Decision trade-offs:** vary hypothetical costs. Budgets are chosen on earlier validation and remain fixed when later evaluation is displayed. Neither interval is an untouched holdout.

Finish returns to showcase and report export. Light/Dark/System and the cold blue-violet design are preserved.

## Extended research walkthrough

1. **Model evaluation:** explain the text-plus-tabular logistic baseline, maturity gaps and separate calibration window. Distinguish AP (ranking) from Brier (probabilistic prediction). Inspect the three walk-forward windows.
2. **Model diagnostics:** inspect selected negatives/missed positives and subgroup support. Explain why exact linear log-odds contributions are neither causal nor calibrated-probability contributions.
3. **Model reliability:** compare the control with composition and measurement probes. Show unique-record counts, retained labels and calibration-bin support. A composition AP difference can partly reflect changed prevalence; it is not a paired treatment effect.
4. **Global importance and learning curves:** change the importance measure, temporal fold and curve metric. Explain shuffle SD versus sampling uncertainty, and how increasing history also changes recency. Unsupported data must remain unavailable.
5. **Batch inference:** run the built-in fictional example against the saved trusted model. Inspect its model version, normalized-input hash and saved receipt. This unlabelled batch cannot establish accuracy.
6. **Export:** download the research report and reliability JSON. Follow snapshot provenance back to configuration, dataset fingerprint and runtime. Saved checksums are not proof against malicious replacement.
7. **Time replay:** select a stable/input-shift/concept-shift scenario and rewind to the first checkpoint. Outcomes remain pending for 30 days. Compare weekly policy budgets only on closed, mature cohorts. Input drift and mature-label AP/Brier measure different things; concept changes can be invisible to input monitoring. Full-run alert accounting is explicitly retrospective.
8. **Synthetic challenges:** inspect all fixed candidates across four cases and three seeds, including nonlinear interactions and noisy measurements. Mean ± seed SD is descriptive, not a confidence interval. No candidate is automatically selected or deployed.

## Offline export and verification

```sh
.venv/bin/python -m signalrank.demo --no-serve
.venv/bin/python -m unittest discover -s tests -v
.venv/bin/python -m signalrank.verify
```

Every demo execution gets a new `artifacts/demo/runs/RUN_ID` directory. It contains model weights, machine-readable report, model card, manifest, run status and derived `experiment-report.md`. History and prediction receipts live separately under `artifacts/demo/`. Everything under `artifacts/` is local and ignored by Git; never upload someone else's pickle model and load it. The demo clears inherited extra-model allowlists and does not affect unrelated servers or old runs.

## Honest portfolio framing

Describe implemented engineering: FastAPI, React/TypeScript, scikit-learn pipelines, chronological validation, calibrated rare-event ranking, model artifacts, feature ablations, permutation importance, delayed-label replay, distribution monitoring, multi-seed synthetic challenges, locked dependencies and real-browser tests. Do not claim production deployment, real-world accuracy, legal certification, an LLM/transformer, or a guaranteed ATS improvement. Real-data training and publication remain gated separately.


## Evidence and storage update

Overview remains the entry point. The main workflow ends at `#evidence`, a derived summary of saved results with a concise Markdown export. Advanced tools live under Research tools and keep their direct routes. New demo output uses local application storage and reuses compatible completed runs; `--retrain` creates a fresh execution. See [STORAGE.md](STORAGE.md) for retained legacy databases and reviewed CLI cleanup. No data download or cleanup runs automatically. See [REAL-DATA-FEASIBILITY.md](REAL-DATA-FEASIBILITY.md) before any external-data expansion.
