# Data and model governance

Review date: 2026-10-04. This engineering review is not a legal opinion or assurance of zero risk.

## Use-specific scope and fictional input contracts

[SCOPE-REVIEW.md](SCOPE-REVIEW.md) records the focused boundary review and unresolved release requirements. Source decisions now name each operation independently: local audit, training, public record display, data redistribution and model release. Generic `status: approved` without an explicit allowed operation is insufficient. Unknown/missing/malformed permissions fail closed. Real-data training/model release remain hard-disabled even if a register flag is edited; the source register is an engineering safeguard, not a legal authority.

`/api/scope` and `python -m signalrank.scope` distinguish scientific gates from permission decisions and never certify legality. Public responses include no official-data audit rows/counts. Input contract checks use only original fictional fixtures and existing Pydantic; no new dependency, source, model or hosting service. Strict schema checks precede batch inference; a transaction protects named dataset identity before prediction and commits versions only with successful receipts. Unversioned legacy inputs are explicit. These checks do not validate a real-data training schema or enable public visitor storage. Code ownership/license selection, exact software/asset notices, deployed source terms and hosting/public-exposure review remain outstanding.

## Replay, challenge and verification extension (2026-10-08)

The replay and challenge generators are original fictional simulations, not new external sources. Concept-shift cases deliberately define new synthetic outcomes and are separate from the earlier label-preserving reliability probes. No real-data training/display/redistribution permission, pretrained weights, hosted service, telemetry or public deployment is introduced. Checkpoint exports hide future records and immature outcomes; full-run retrospective summaries are explicitly labeled. These are engineering safeguards, not legal or accuracy certification.

Python dependency resolution and package hashes are pinned in `uv.lock`, alongside the existing pnpm lock. Pinning is not a license audit or cross-platform numerical guarantee. Playwright is a test-only Apache-2.0 dependency, not a bundled browser runtime in the app. Installing its test browser downloads separately distributed browser components; their applicable notices/terms still need review for any redistribution. Tests launch an isolated loopback-only service with temporary original synthetic artifacts. Real-data and public-release gates below remain unchanged.

## Approved local scope

Training uses original synthetic records only. Official CVE and CISA KEV copies are scoped to a bounded local feasibility audit, not public deployment or release of datasets/models. No linked articles, exploits, logos, scanning, customer uploads, trackers or remote model services are used.

## Archived evidence

- CISA official repository: https://github.com/cisagov/kev-data . Its full develop/LICENSE including CC0 is retained in evidence/kev-license.txt, with SHA-256 in signalrank/sources.json. Linked third-party content and logo/endorsement rights are excluded.
- CVE terms: https://www.cve.org/legal/termsofuse . The official website component is archived from https://raw.githubusercontent.com/CVEProject/cve-website/dev/src/views/Legal/TermsOfUse.vue in evidence/cve-terms.vue. This proves the repository dev version, not the deployed page version. Copying and derivative-work rights require retaining MITRE's copyright designation and license. Terms accompany local data. The designation from the official FooterModule.vue (archived in evidence/cve-footer.vue) is retained in data/raw/NOTICE.txt with its current-year value resolved to 2026.
- Official CVE README retained in evidence/cve-readme.md documents publication-date corrections and normalization. These must be considered in historical evaluation.
- Catalog snapshot comes from https://raw.githubusercontent.com/cisagov/kev-data/develop/known_exploited_vulnerabilities.json, version 2026.10.02. SHA-256 is recorded in signalrank/feasibility.json.
- Successful CVE downloads have URLs, retrieval timestamps and hashes in evidence/download-manifest.json. Bytes are stored under their SHA-256 in data/raw/. Both directories are Git-ignored. Back them up together; do not distribute data without notices.

The audit checks archived license hashes, restricts download URL prefixes, caps response size and preserves content-addressed snapshots. It does not monitor upstream term changes. Registry scope is an engineering decision, not a general compliance guarantee; no real-data training path exists.

## Scientific gates

Reconstruction currently uses publication timestamp plus 24 hours from a pinned inventory revision as a candidate forecast cutoff. The history query is constrained to that revision's ancestry; historical publication, commit and container timestamps are checked. Naive timestamps are excluded rather than assumed UTC. All source artifacts stay local, with notices copied beside the reconstruction cache; committed/API evidence contains metadata and feature-availability counts, not raw descriptions or model-ready features. The source approval remains limited to feasibility auditing. Historical catalog changes and first-public availability remain unresolved.

The target is future KEV catalog inclusion, not all exploitation or breach probability. Absence from today's catalog is only a provisional historical negative: removed entries and historical revisions need review. Current publication dates locate candidate snapshots only; corrected dates and Git commit times do not prove first public availability. Historical state, timestamp consistency and date-resolution boundaries need validation before training.

The pilot uses eight KEV-selected 2024 records and eight adjacent identifiers. It is selection-biased and unsuitable for prevalence or predictive metrics. Same-day/already-listed observations are flagged; preliminary labels are not a training dataset. A representative cohort, catalog-history audit, validated cutoff times, mature outcomes and untouched temporal test interval are mandatory next gates.

## Restricted synthetic public-demo scope

The prepared Docker profile uses only original fictional inputs/outcomes and pinned software. It excludes official-data audit JSON, downloaded records and local evidence/SQLite files. Public study endpoints return empty evidence, batch writes are disabled, and Studio creates no visitor receipts. This does not approve historical-data training, display or redistribution.

No new model weights, external visuals/fonts, dataset, telemetry or hosted AI service is introduced. `threadpoolctl`, already in the locked scikit-learn graph, is now a direct BSD-3-Clause dependency to bound offline numerical threads. Charts use original local SVG/CSS and preserve bundled notices. Software notices, code ownership and current hosting terms still require release review; no code license is silently invented. Engineering checks cannot certify zero legal uncertainty.

Preparation creates no provider account or public endpoint. [DEPLOYMENT.md](DEPLOYMENT.md) enforces free-only hosting: one explicitly free service, no paid addons/subscriptions and no payment method. Account connection, terms acceptance and actual public exposure require the account owner's action-time approval.

## Release gates

The identifier inventory is pinned to an official repository commit and sampled without consulting KEV outcomes. Frame completeness means all matching paths in the selected identifier-year Git tree, not completeness of published vulnerabilities. The inventory includes rejected records and publication years outside the identifier year. Selection does not override source-scope or training gates. Cohort API responses and committed artifacts contain identifiers and provenance, not copied CVE descriptions. Full Git/API downloads remain local under data/raw/ with evidence/cohort-download-manifest.json.

Pretrained models, NVD and EPSS are not approved dependencies. Before public release: verify the exact copyright designation and deployed CVE terms, retain notices, review pinned direct/transitive software and asset licenses, choose a code license, and separately review actual training/display/redistribution and deployment uses. Dependency ranges are not a lockfile.

The incremental React experiment workspace uses a committed pnpm lockfile and locally served compiled assets. Its build retains the full MIT license notices for the bundled React, React DOM, Scheduler, TanStack React Query and Query Core packages in `signalrank/static/react/THIRD-PARTY-NOTICES.txt`. Build/test dependencies are pinned separately in the lockfile; this notice inventory is not a blanket public-release clearance. The migration adds no external data source, browser telemetry, hosted AI service or real-data training permission.

Model diagnostics, paired-block interval displays and the fixed boosted-tree benchmark use the existing original fictional generator and installed scikit-learn dependency, not third-party weights or new data. Batch inference accepts only the five original category descriptions and a bounded fictional schema; model selection is limited to locally trained artifacts explicitly trusted by startup environment variables. These variables authorize pickle loading, not source licensing or public deployment. Complete synthetic evaluation labels are saved for paired analysis; batch inputs have no outcomes, so no performance claims are generated. Local receipts and checksums are engineering provenance, not tamper-proof audit or legal certification. Real-data training/display/redistribution gates remain unchanged.

No synthetic score may be represented as real-world accuracy. No endorsement, breach-prevention guarantee or compliance certification is implied. Public deployment and commercial use require review of the actual use and jurisdiction; disclaimers alone do not discharge obligations.

The Model Reliability extension uses only original fictional records and existing NumPy/scikit-learn code: no new source, pretrained weights, hosted service, external assets or real-data permission. Composition resampling retains entire existing labelled rows; measurement corruption retains labels and is not represented as counterfactual risk. Permutation importance and temporal learning curves are synthetic development diagnostics, not causal or confirmatory claims. The one-command demo trains offline, then binds a local server to 127.0.0.1. It neither uploads data nor changes permissions; installing software dependencies can require network access. JSON and Markdown exports contain synthetic results and local technical provenance only, not the separately scoped raw official-data audit files. These changes do not certify licenses, guarantee zero legal uncertainty or authorize public deployment.

The editorial UI redesign uses original HTML/CSS/SVG and system fonts. Penmanship's public landing page supplied broad design inspiration only; its repository states that no open-source license has been declared, so no source, images, brand assets or wording are imported from it. The ML workflow illustration is labeled as illustrative rather than live job telemetry. Light/Dark/System preferences remain local, including safe behavior if storage is unavailable. The only new dependency is test-only `@types/jsdom` (MIT, with its pinned dependency graph); no runtime component, hosted font, external data integration or real-data usage permission is added. Original styling and contrast checks do not constitute a blanket intellectual-property or accessibility certification.
