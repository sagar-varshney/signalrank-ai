# SignalRank AI: local demonstration

This is an ML engineering demonstration using original fictional data. It forecasts simulated 30-day catalog inclusion, not real-world exploitation or business risk. No performance number here should be presented as validated real-world accuracy.

## Fresh-clone setup

Inside this repository, with Python 3.11 or later:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -e '.[test]'
.venv/bin/python -m signalrank.demo
```

Installation downloads dependencies from your configured Python package index. The demo itself uses no external data source, weights, telemetry or hosted AI service. It prints the new run directory and opens a loopback server, not a browser. Visit `http://127.0.0.1:8015/#reliability`. Stop with Ctrl+C. If that port is occupied, use `--port 8016`. The default command performs bounded offline training before startup; readiness begins when Uvicorn reports startup complete.

Node is unnecessary for this demo: compiled React assets are included. To edit the frontend, follow the pnpm instructions in README. Python versions/dependencies are recorded in each artifact; unpinned Python dependency ranges mean a different installation can produce different numerical results.

## Five-minute walkthrough

1. **Model evaluation:** explain the text-plus-tabular logistic baseline, maturity gaps and separate calibration window. Distinguish AP (ranking) from Brier (probabilistic prediction). Inspect the three walk-forward windows.
2. **Model diagnostics:** inspect selected negatives/missed positives and subgroup support. Explain why exact linear log-odds contributions are neither causal nor calibrated-probability contributions.
3. **Model reliability:** compare the control with composition and measurement probes. Show unique-record counts, retained labels and calibration-bin support. A composition AP difference can partly reflect changed prevalence; it is not a paired treatment effect.
4. **Global importance and learning curves:** change the importance measure, temporal fold and curve metric. Explain shuffle SD versus sampling uncertainty, and how increasing history also changes recency. Unsupported data must remain unavailable.
5. **Batch inference:** run the built-in fictional example against the saved trusted model. Inspect its model version, normalized-input hash and saved receipt. This unlabelled batch cannot establish accuracy.
6. **Export:** download the research report and reliability JSON. Follow snapshot provenance back to configuration, dataset fingerprint and runtime. Saved checksums are not proof against malicious replacement.

## Offline export and verification

```sh
.venv/bin/python -m signalrank.demo --no-serve
.venv/bin/python -m unittest discover -s tests -v
```

Every demo execution gets a new `artifacts/demo/runs/RUN_ID` directory. It contains model weights, machine-readable report, model card, manifest, run status and derived `experiment-report.md`. History and prediction receipts live separately under `artifacts/demo/`. Everything under `artifacts/` is local and ignored by Git; never upload someone else's pickle model and load it. The demo clears inherited extra-model allowlists and does not affect unrelated servers or old runs.

## Honest portfolio framing

Describe implemented engineering: FastAPI, React/TypeScript, scikit-learn pipelines, chronological validation, calibrated rare-event ranking, model artifacts, feature ablations, permutation importance, reproducible synthetic stress tests and automated tests. Do not claim production deployment, real-world accuracy, legal certification, an LLM/transformer, or a guaranteed ATS improvement. Real-data training and publication remain gated separately.
