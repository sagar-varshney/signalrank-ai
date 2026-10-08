# Free-tier synthetic demo deployment

## Recommendation and cost boundary

Use **one Render Free Docker web service** for FastAPI, the saved scikit-learn model and the compiled React UI. Same-origin serving needs neither a separate Node server nor cross-origin API configuration. Vercel and Cloudflare are not required together. Optional Cloudflare DNS/proxy can be considered later only if you already own a domain; buying a domain is outside the free-only plan.

The committed `render.yaml` explicitly selects `plan: free`, disables automatic deploys and creates no database, disk, worker, cron, paid subscription or custom domain. **Preparing these files does not create a service or publish anything.** The account owner must approve public exposure and review the provider's current terms and dashboard before deployment.

Do not add a payment method for this strictly free-only demo. If signup or deployment requires payment, stop and choose another free option instead of accepting a charge. Free compute does not mean unlimited usage: bandwidth/build overages can be billed when a payment method exists. Without one, Render documents suspension/build restrictions instead. Never approve a paid fallback or upgrade. Check workspace usage before builds; a private GitHub repository can also have limited included Actions minutes.

Render documents 512 MB / 0.1 CPU for its Free web-service plan, 750 instance hours per workspace per month, idle suspension after 15 minutes and roughly one-minute wakeup. Filesystem changes do not persist. A recruiter may see Render's wakeup page; manually open the demo before an interview. Do not add artificial keep-alive traffic, a paid database or an expiring free Postgres database to work around this.

Sources: [Free-plan behavior and overages](https://render.com/docs/free), [compute plan and Blueprint fields](https://render.com/docs/blueprint-spec), [default hostname and PORT variables](https://render.com/docs/environment-variables). Review these again at deployment time.

## Public profile versus local workbench

The public profile is an unauthenticated, intentionally synthetic portfolio demonstration, **not** a multi-user production risk service:

- Builds 3,600 original fictional observations and all evaluation evidence **inside the image at build time**. Startup loads that explicitly selected artifact; missing/incompatible evidence fails rather than fitting a fallback.
- Prediction Studio accepts only five original categories, finite severity 1–10, booleans and the saved allowlisted model ID. It predicts without retraining, accepting model uploads or storing visitor batches.
- Examples/preferences may be stored on the visitor's browser only. The server has one in-memory seeded report snapshot, no accounts or visitor databases. Its first-load timestamp resets on restart; it is not persistent experiment history.
- The runtime image excludes official-data audit JSON, downloaded data, local license evidence, local databases, secrets, source Git history, development dependencies and Node. Official-data endpoints return empty local-only evidence; official-study navigation is hidden.
- Full replay/recovery ledgers are omitted from seeded snapshot exports; replay's bounded checkpoint endpoint preserves as-of label masking. The snapshot records this reduced scope and has a separately computed ID. Aggregate development metrics remain available.
- Exact allowed hosts, local-only API documentation, a same-origin Content Security Policy, security headers, bounded queries, four active API reads and a shared request budget apply. The budget starts at 120 units, refills at two/second and weights large exports/comparisons by eight. 429 responses include retry guidance. This single-process budget is neither per-user isolation nor distributed DDoS protection.
- One non-root worker runs without access logging. The provider can still collect infrastructure logs/connection metadata. TLS terminates at Render; application settings do not certify legal, security or accessibility compliance.

Local mode retains full SQLite snapshots and versioned batch receipts on loopback. Do not expose that local profile publicly. Real-data training/display/redistribution gates are unchanged; this image is no authorization to deploy official-data studies.

## Verify before creating a service

From the repository root, using Docker if installed:

```sh
docker build -t signalrank-public .
docker run --name signalrank-public-check --read-only --memory=512m --memory-swap=512m --cpus=0.1 --cap-drop=ALL --security-opt=no-new-privileges -p 127.0.0.1:8030:10000 -e SIGNALRANK_ALLOWED_HOSTS=127.0.0.1 signalrank-public
# In another terminal:
python3 deploy/smoke.py --wait 180
docker stats --no-stream signalrank-public-check
# After inspection:
docker stop signalrank-public-check
```

The loopback mapping is deliberate. Open `http://127.0.0.1:8030/#showcase` and test Light/Dark/System, Studio, recovery/decision controls and the five-step tour. Local saved examples remain local to that browser origin. Never substitute a downloaded pickle artifact.

CI builds the actual Linux image, starts it with a read-only filesystem, no extra capabilities and the documented free-plan CPU/memory envelope, verifies non-root execution and excluded study/database files, runs bounded concurrent predictions and checks observed container peak memory. This is a bounded smoke test, not a capacity, availability or penetration-testing guarantee. Docker is not required for normal local development.

Python tests, frontend tests, both local/public Chromium suites, deterministic frontend rebuild and the container job must all be green for the chosen commit. A local browser passing is not evidence of Render deployment success.

## Account-owner deployment checklist

1. Confirm you want the **synthetic public profile** internet-accessible. Review current software notices, your code ownership and applicable hosting terms. No blanket zero-uncertainty legal guarantee is possible.
2. Use a free Render workspace without a payment method. Connect only the private `sagar-varshney/signalrank-ai` repository; do not make the repository public. Review GitHub OAuth/repository access yourself.
3. Create a Blueprint from the verified commit and root `render.yaml`, or a Docker web service with exactly the same fields. Confirm **Free**, one web service, no addons/databases/disks and automatic deploys off before creation. If the UI offers only a paid choice, stop.
4. Render supplies `RENDER_EXTERNAL_HOSTNAME`; the app automatically allowlists this exact host. Keep `SIGNALRANK_PROFILE=public` and `PORT=10000`. Do not override trusted model paths or enable extra model directories. Additional custom domains would need explicit `SIGNALRANK_ALLOWED_HOSTS` entries.
5. Manually deploy the verified commit. Watch image build/startup and `/api/health`. Required offline evidence is already in the image: no startup downloads, database migrations or runtime training.
6. Verify the HTTPS origin and headers. Run `python3 deploy/smoke.py --url https://YOUR-SERVICE.onrender.com --wait 180`; remote smoke uses reads only. Walk through every feature in a real browser, download the research report, and check that official-data records and batch mutations remain unavailable.
7. Record the live URL and deployed commit only after these checks. Do not put “production deployed” on a resume before successful provider checks. The accurate description is a deployed synthetic ML portfolio demo.

## Rollback and failure handling

Auto-deploy is off to avoid unexpected rebuilds or exposure. Keep the last working Git commit and manually deploy that commit through Render if needed; artifacts are rebuilt with the matching code/runtime, never migrated silently. Image rebuilds produce new run IDs/timings even when seeded predictions agree.

If startup fails, inspect the provider's service logs for missing artifact/evidence, host configuration, code/runtime mismatch or memory exhaustion. Do not disable integrity checks or enable fallback training. If free resources are insufficient, reduce the explicitly documented synthetic workload and reverify, or pause hosting—never upgrade without a separate paid authorization. Suspension from free limits is an expected service limitation, not a reason to add billing.
