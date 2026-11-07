# Seoul 2019 external-source gate — 7 November 2026

The [predeclared evaluation protocol](seoul-2019-external-protocol-2026-11-07.md) was committed in `4174d2e` before acquiring the 2019 archive. A second pre-scoring commit, `be6cba9`, required independent published daily-total reconciliation. This audit contains **no 2019 model fit, score, or external-validation claim**. The 2018 result and its later exploratory subgroup audit remain unchanged.

## Sources and use boundary

- [Seoul Open Data Plaza hourly public bicycle usage, OA-15245](https://data.seoul.go.kr/dataList/OA-15245/F/1/datasetView.do): 2019 archive, 12 monthly CSV members, publisher Seoul Metropolitan Government. Pinned archive SHA-256: `21ca63ef13fb52a9537b70c20d74f0607c15de39eb4170aee05e8d4d4d2d7c31`; 341,210,886 compressed bytes. The catalog lists KOGL Type 1 attribution and no third-party copyright holder.
- [Seoul Open Data Plaza daily rental counts, OA-14994](https://data.seoul.go.kr/dataList/OA-14994/F/1/datasetView.do): four small files cover the 2019 calendar. Their exact source hashes and actual formats are pinned in [`bike-external-source.json`](../signalrank/bike-external-source.json). The file cataloged as a December–May CSV is an XLSX container; the auditor verifies and parses the actual bytes.
- The [official KOGL Type 1 guide](https://www.kogl.or.kr/recommend/recommendList.do) requires attribution and permits adaptation and commercial use. SignalRank aggregates the published hourly `이용건수` values citywide and compares them with the separately published daily `대여건수` values. No station, gender, age, or rider attributes enter an ML feature or the saved report. No government endorsement is implied. This is a scoped use assessment, not a zero-risk legal guarantee.

## Source contract outcome

The auditor parsed 14,291,359 hourly source rows across all 12 members. It found 8,691 of 8,760 expected 2019 local hours. The 69 hours with no source rows are:

| First missing hour | Last missing hour | Hours |
| --- | --- | ---: |
| 2019-08-28 00:00 +09:00 | 2019-08-28 23:00 +09:00 | 24 |
| 2019-09-06 13:00 +09:00 | 2019-09-08 09:00 +09:00 | 45 |

The daily release publishes 364 of 365 2019 dates, omitting 7 September. Of 361 dates with both a published daily total and all 24 hourly observations, **0 match exactly**; 361 differ. For example, 1 January has an hourly `이용건수` sum of 5,428 versus the daily `대여건수` value of 8,601. The source names suggest related measures, but their discrepancy is not explained by the catalog. We cannot assume a conversion factor, fill absent hours from daily totals, or silently redefine the task.

Final saved source-gate report SHA-256: `58759b6b9e9599e451763397f44efcd715785807d5d512f0fd2602e6bed5f536`.

**Gate decision: blocked.** The original fixed external evaluation required complete hourly coverage and daily-total reconciliation. Neither condition is met. No 2019 AP, Brier, captured-positive count, or model comparison exists. The local API exposes only this read-only source-quality report; the public profile exposes none of it.

To reproduce the local gate after separately obtaining the pinned official files, name the four daily files `signalrank-seoul-daily-2019-seq8.csv`, `seq9.xlsx`, `seq10.xlsx`, and `seq19.xlsx` with the same prefix, and run `python -m signalrank.bike_external --run --archive /path/to/official-2019.zip --daily-dir /path/to/daily-files`. The command verifies all pinned hashes, schemas, coverage and published daily totals before saving a report. `python -m signalrank.bike_external --inspect` reads that report without source files or model fitting.

The downloaded raw archive and daily files were staged under `/private/tmp`, outside iCloud Documents, and are removed after the audit. Only the small derived source-quality report persists in local SignalRank storage. The raw files and row-level hourly counts are not committed or included in the public container. A future validation attempt needs a different, independently reviewed source and a new protocol before outcome scoring.
