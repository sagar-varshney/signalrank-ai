# SignalRank scope review — implementation boundary

This is an engineering decision record, not a legal opinion, permission grant or guarantee of zero uncertainty. The existing ML and UI work is retained. No real-data training, new dataset acquisition, account creation, paid service, public exposure or domain change is authorized by this implementation.

## Intended use and accurate claims

SignalRank is an explainable temporal rare-event ML research workbench. Original synthetic data demonstrates preprocessing, calibrated prediction, past-only evaluation and lifecycle behavior. The separately gated real-data study proposes **first KEV catalog inclusion within 30 days after a validated forecast cutoff**. It does not forecast every exploitation event or organizational breach, deliver operational patching advice, certify compliance or establish business benefit. Synthetic performance must never be presented as real-world accuracy.

## Use-specific source decisions

`signalrank/sources.json` records `local_audit`, `train`, `display`, `redistribute` and `release_model` independently. `display` means public display of source records, not viewing aggregate audit metadata in the local workbench. `redistribute` refers to datasets, not a blanket software/source release approval. Original synthetic data is within scope for those operations; CVE/KEV are within scope for bounded local auditing only. Other operations remain pending/blocked. Missing operations, unknown sources and unknown operations fail closed. The source register is an internal conservative decision: **blocked is not a finding that a use is unlawful, and allowed is not legal clearance**.

The CVE website repository's terms component permits copying and derivative works subject to retained copyright designation/license. It is not proof of the currently deployed page version. Before expanding use, verify the deployed terms, exact notices, provenance, applicable jurisdiction and intended training/display/data/model distribution. KEV's CC0 license excludes linked third-party material, trademarks/logos and endorsement. Do not fetch linked articles or exploits. Retain the existing full evidence snapshots and notices; do not substitute a summary for the terms.

Changing permission flags cannot activate real-data training/model release. `TrainingConfig` remains synthetic-only. Public scope reports omit official audit counts/records and the public image still contains only the synthetic source register. No browser approval button or upload/training endpoint is introduced.

## Scientific feasibility: separate from permissions

The immutable exploratory selection has 428 candidates, 72 exclusions and zero positive candidate outcomes. It is not an evaluation dataset. Historical first-availability, catalog additions/corrections/removals, boundary resolution, mature outcomes and outcome support remain unresolved. These are scientific issues, not license findings.

Before any larger acquisition, agree on and freeze the cohort/time window, source revisions, selection rules, exclusions, outcome observation end, uncertainty requirements and CPU/download/storage budget. Keep existing 30-day maturity purges, earlier training/later calibration, chronological development evaluation and an untouched final interval. Do not select records from known outcomes to make the benchmark work. If the target or dataset changes, record a new protocol and obtain agreement first.

## Release checklist — all require review

- Code ownership and code-license selection before source redistribution (no license silently chosen).
- Pinned direct/transitive software, browser redistribution if applicable, bundled asset licenses and complete notices for the exact release.
- Current provider terms, repository access and owner approval before public exposure.
- Exact dataset/model/display uses separately; no official-data material added to the public image without review.

`python -m signalrank.scope` and `/api/scope` report these outstanding requirements. They do not automate legal judgment or assert that a release is approved. Existing archived local evidence verifies recorded bytes only; it does not monitor upstream terms.

## Input contracts implemented now

`fictional-input-v1` validates the original five categories, finite severity 1–10, strict booleans, required fields, supported schema and unique fictional IDs; labels/external descriptions/unknown fields are rejected. Files/HTTP batch bodies are capped at 256 KiB; batches at 500 records. Duplicate JSON keys and non-finite constants are rejected. Equal features under distinct IDs are reported, not deduplicated without justification.

Optional `dataset_version` keeps old clients compatible. Named versions become immutable on successful local batch save, scoped to that batch database. Changing input values, membership or order under a saved version causes HTTP 409 **before prediction**. A failed prediction reserves no version. Unversioned legacy batches carry an explicit warning and no version-identity guarantee. Local receipts store contract and code fingerprints; existing receipts remain readable. Hashes are not signatures or tamper-proof audits.

Local version comparison lists added/removed/changed records and order changes. Unsupported schema or version reuse with different inputs blocks comparison. A new compatible schema instance is not a model promotion or performance claim. This contract covers fictional inference inputs, not a validated real-data training schema.

```sh
.venv/bin/python -m signalrank.scope
.venv/bin/python -m signalrank.contracts
.venv/bin/python -m signalrank.contracts examples/fictional-v1.json
.venv/bin/python -m signalrank.contracts examples/fictional-v2.json --previous examples/fictional-v1.json
```

Use your installed project Python environment. Commands print JSON without modifying files, downloading data or fitting models. Invalid/blocked file checks exit nonzero.

## Sequence and free-only boundary

1. Use-specific scope review and fictional input contracts (implemented).
2. Bounded real-data feasibility and permission review (still gated; no new acquisition in this change).
3. Credible real-data evaluation only if permission/scientific checks pass, then deeper supported error slices.
4. Optional sequential local experiment scheduler last, with fixed limits, recorded failures and separate tuning/final evaluation.

Local CPU and local durable history remain the default. No GPU/paid inference API, hosted scheduler or automatic paid fallback. The free public demo serves saved synthetic evidence, not background training or durable multi-user experiment history. Provider free quotas and account terms still apply.
