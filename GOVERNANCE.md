# Data and model governance

Review date: 2026-10-04. This engineering review is not a legal opinion or assurance of zero risk.

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

## Release gates

The identifier inventory is pinned to an official repository commit and sampled without consulting KEV outcomes. Frame completeness means all matching paths in the selected identifier-year Git tree, not completeness of published vulnerabilities. The inventory includes rejected records and publication years outside the identifier year. Selection does not override source-scope or training gates. Cohort API responses and committed artifacts contain identifiers and provenance, not copied CVE descriptions. Full Git/API downloads remain local under data/raw/ with evidence/cohort-download-manifest.json.

Pretrained models, NVD and EPSS are not approved dependencies. Before public release: verify the exact copyright designation and deployed CVE terms, retain notices, review pinned direct/transitive software and asset licenses, choose a code license, and separately review actual training/display/redistribution and deployment uses. Dependency ranges are not a lockfile.

The incremental React experiment workspace uses a committed pnpm lockfile and locally served compiled assets. Its build retains the full MIT license notices for the bundled React, React DOM, Scheduler, TanStack React Query and Query Core packages in `signalrank/static/react/THIRD-PARTY-NOTICES.txt`. Build/test dependencies are pinned separately in the lockfile; this notice inventory is not a blanket public-release clearance. The migration adds no external data source, browser telemetry, hosted AI service or real-data training permission.

Model diagnostics, paired-block interval displays and the fixed boosted-tree benchmark use the existing original fictional generator and installed scikit-learn dependency, not third-party weights or new data. Batch inference accepts only the five original category descriptions and a bounded fictional schema; model selection is limited to locally trained artifacts explicitly trusted by startup environment variables. These variables authorize pickle loading, not source licensing or public deployment. Complete synthetic evaluation labels are saved for paired analysis; batch inputs have no outcomes, so no performance claims are generated. Local receipts and checksums are engineering provenance, not tamper-proof audit or legal certification. Real-data training/display/redistribution gates remain unchanged.

No synthetic score may be represented as real-world accuracy. No endorsement, breach-prevention guarantee or compliance certification is implied. Public deployment and commercial use require review of the actual use and jurisdiction; disclaimers alone do not discharge obligations.
