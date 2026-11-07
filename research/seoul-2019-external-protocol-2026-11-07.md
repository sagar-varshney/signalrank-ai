# Predeclared external validation gate — 7 November 2026

This protocol was written before acquiring or inspecting the 2019 source archive and before evaluating any 2019 outcome. The executable declaration is [`signalrank/bike-external-protocol.json`](../signalrank/bike-external-protocol.json). The original 2018 fixed result and later exploratory subgroup audit remain separate.

## Source review

The [Seoul Open Data Plaza hourly public bicycle usage catalog](https://data.seoul.go.kr/dataList/OA-15245/F/1/datasetView.do) lists a 2019 ZIP (file 57, about 333.21 MB) and describes rental date/time, duration, station and demographic fields. The catalog identifies Seoul Metropolitan Government as copyright holder, no third-party copyright holder, and KOGL Type 1 attribution. The [KOGL official type guide](https://www.kogl.or.kr/recommend/recommendList.do) says Type 1 permits commercial use and adaptation with source attribution and no false implication of government endorsement. We will retain source, license, modification and no-endorsement notices. This is a scoped source-use assessment, not a guarantee of zero legal risk.

A 16-byte request to the official download endpoint confirmed a ZIP and a `Content-Length` of 341,210,886 bytes. No archive contents or 2019 outcomes have yet been read. The server did not honor a small HTTP range request, so schema and coverage inspection requires a bounded full download. The archive will be temporary on local non-iCloud storage; only a small aggregate and integrity receipt may persist. No paid service, API key, customer identifier, demographic feature, raw-file commit or public release is planned.

The catalog also has tiny **daily** rental-count files. They cannot directly validate an **hourly** next-day model; presenting their results as the same task would change the target. The 2019 hourly archive remains subject to a semantic gate: we must show how each row maps to rental events or counts, check all 8,760 local hours and reject ambiguous or incomplete data before reporting performance. The source describes rental activity, but the schema has not yet been inspected.

## Fixed evaluation

Use the existing UCI 2017–2018 training and July calibration partitions, original features, logistic settings and training-derived threshold. Refit those fixed components only; 2019 is never used for fitting or recalibration. Build 2019 features from 168 completed hours and target-hour calendar. Evaluate every eligible 2019 forecast whose target hour is complete in 2019. Report average precision, Brier and one retrospective 10% budget with class support and historical baselines. Cross-source and scale differences must be disclosed. This is one external-source evaluation, not a deployment backtest: the source archive was published later, and original hour-completion availability is unverified.

If the source cannot pass the contract, the deliverable is a documented blocked validation gate, not fabricated metrics or a substituted daily-data study.
