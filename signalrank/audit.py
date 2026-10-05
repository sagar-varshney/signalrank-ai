"""Bounded official-data audit. Never trains on latest revised record text.

Run from the project root: python -m signalrank.audit
Outputs local immutable content-addressed evidence and an aggregate report.
"""
from collections import Counter
from datetime import datetime, timedelta, timezone
from hashlib import sha256
import json
from pathlib import Path
import shutil
from urllib.request import Request, urlopen
from urllib.parse import urlencode
from urllib.error import HTTPError
from signalrank.core import registry, require_source

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data/raw"


def verify_evidence():
    for name, filename in [("cve", "cve-terms.vue"), ("cisa_kev", "kev-license.txt")]:
        require_source(name)
        actual = sha256((ROOT / "evidence" / filename).read_bytes()).hexdigest()
        if actual != registry()[name]["license_snapshot_sha256"]:
            raise ValueError(f"Changed license evidence: {name}")


def fetch(url, log, max_bytes=5_000_000):
    if not 1 <= max_bytes <= 25_000_000:
        raise ValueError("Invalid download size limit")
    if not url.startswith(("https://api.github.com/repos/CVEProject/", "https://raw.githubusercontent.com/CVEProject/")):
        raise ValueError("Unapproved download location")
    with urlopen(Request(url, headers={"User-Agent": "SignalRank-local-feasibility", "Accept": "application/vnd.github+json"}), timeout=30) as response:
        body = response.read(max_bytes + 1)
    if len(body) > max_bytes:
        raise ValueError("Snapshot exceeds size limit")
    digest = sha256(body).hexdigest()
    target = RAW / f"{digest}.json"
    if not target.exists():
        target.write_bytes(body)
    log.append({"url": url, "sha256": digest, "retrieved_at": datetime.now(timezone.utc).isoformat()})
    return json.loads(body)


def cve_path(identifier):
    _, year, number = identifier.split("-")
    return f"cves/{year}/{number[:-3]}xxx/{identifier}.json"


def assess(record, catalog_date):
    metadata = record["cveMetadata"]
    if metadata["state"] != "PUBLISHED":
        raise ValueError("Record is not published")
    published = datetime.fromisoformat(metadata["datePublished"].replace("Z", "+00:00"))
    observed = published + timedelta(days=1)
    lag = (datetime.fromisoformat(catalog_date).date() - published.date()).days if catalog_date else None
    return published, observed, lag


def run():
    verify_evidence()
    RAW.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(ROOT / "evidence/cve-terms.vue", RAW / "CVE-TERMS.vue")
    shutil.copyfile(ROOT / "evidence/kev-license.txt", RAW / "KEV-LICENSE.txt")
    shutil.copyfile(ROOT / "DATA-NOTICES.txt", RAW / "NOTICE.txt")
    kev_bytes = (RAW / "kev.json").read_bytes()
    catalog = json.loads(kev_bytes)
    entries = catalog["vulnerabilities"]
    if len({r["cveID"] for r in entries}) != len(entries):
        raise ValueError("Duplicate catalog identifiers")
    by_id = {r["cveID"]: r for r in entries}
    selected = sorted((r for r in entries if r["dateAdded"].startswith("2024") and r["cveID"].startswith("CVE-2024-")), key=lambda r: r["cveID"])[:8]
    identifiers = [(r["cveID"], "KEV-selected") for r in selected]
    for r in selected:
        prefix, year, num = r["cveID"].split("-")
        candidate = f"{prefix}-{year}-{int(num)+1:0{len(num)}d}"
        if candidate not in {x[0] for x in identifiers}:
            identifiers.append((candidate, "Adjacent-ID probe"))
    log, sample = [], []
    for identifier, selection in identifiers:
        item = {"id": identifier, "selection": selection}
        try:
            path = cve_path(identifier)
            latest = fetch(f"https://raw.githubusercontent.com/CVEProject/cvelistV5/main/{path}", log)
            published, observed, lag = assess(latest, by_id.get(identifier, {}).get("dateAdded"))
            item.update(published=published.isoformat(), forecast_at=observed.isoformat(), publication_to_kev_days=lag)
            query = urlencode({"path": path, "until": observed.isoformat(), "per_page": 1})
            history = fetch(f"https://api.github.com/repos/CVEProject/cvelistV5/commits?{query}", log)
            if not history:
                item["historical_status"] = "missing snapshot before forecast"
            else:
                revision = history[0]["sha"]
                historical = fetch(f"https://raw.githubusercontent.com/CVEProject/cvelistV5/{revision}/{path}", log)
                item["revision"] = revision
                cna = historical.get("containers", {}).get("cna", {})
                item["has_text"] = bool(cna.get("descriptions"))
                item["has_metrics"] = bool(cna.get("metrics"))
                item["historical_status"] = "snapshot found; timestamp audit still required"
            # KEV date has day resolution: same-day cases are ambiguous at hourly cutoff.
            kev_date = by_id.get(identifier, {}).get("dateAdded")
            if kev_date:
                event_day = datetime.fromisoformat(kev_date).date()
                item["label_30d"] = ("already listed or same-day ambiguous" if event_day <= observed.date() else int(event_day <= (observed + timedelta(days=30)).date()))
            else:
                item["label_30d"] = 0 if datetime.fromisoformat(catalog["dateReleased"].replace("Z", "+00:00")).date() >= (observed + timedelta(days=30)).date() else "immature"
        except (HTTPError, ValueError, KeyError, TimeoutError, OSError) as exc:
            item["error"] = f"{type(exc).__name__}: {exc}"
        sample.append(item)
        print(identifier, item.get("historical_status", item.get("error")), flush=True)
    result = {"mode": "real-data feasibility audit", "training_enabled": False,
              "catalog_count": len(entries), "catalog_version": catalog["catalogVersion"],
              "catalog_sha256": sha256(kev_bytes).hexdigest(), "catalog_released": catalog["dateReleased"],
              "additions_by_year": dict(sorted(Counter(r["dateAdded"][:4] for r in entries).items())),
              "sample": sample, "snapshot_count": len(log),
              "sampling_warning": "Eight 2024 KEV-selected records plus adjacent-ID probes. Selection-biased diagnostic sample; no population prevalence or predictive metrics can be estimated.",
              "decision": "Conditional feasibility only. A representative CVE cohort, historical timestamp audit, and mature labels are required before training.",
              "generated_at": datetime.now(timezone.utc).isoformat()}
    (ROOT / "evidence/download-manifest.json").write_text(json.dumps(log, indent=2))
    (ROOT / "signalrank/feasibility.json").write_text(json.dumps(result, indent=2))
    print(json.dumps({k:v for k,v in result.items() if k != "sample"}, indent=2))


if __name__ == "__main__":
    run()
