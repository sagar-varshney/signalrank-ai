"""Resumable, pinned historical reconstruction. Never trains a model.

GitHub API requests use the signed-in gh CLI; raw downloads are anonymous.
Run: python -m signalrank.reconstruct [--limit 500] [--workers 4]
"""
import argparse
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta, timezone
from hashlib import sha256
import json
from pathlib import Path
import re
import shutil
import subprocess
import time
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError

from signalrank.audit import ROOT, RAW, cve_path, verify_evidence
from signalrank.validation import timestamp, check_snapshot, label_window

POLICY = "publication-plus-24h-v1"
API = "https://api.github.com/repos/CVEProject/cvelistV5/"
RAW_URL = "https://raw.githubusercontent.com/CVEProject/cvelistV5/"


def atomic_json(path, data):
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(data, indent=2) + "\n")
    temporary.replace(path)


class EvidenceClient:
    def __init__(self, directory=RAW / "reconstruction"):
        self.directory = directory
        directory.mkdir(parents=True, exist_ok=True)

    def get(self, url):
        if not url.startswith((API, RAW_URL)):
            raise ValueError("Unapproved source URL")
        index = self.directory / (sha256(url.encode()).hexdigest() + ".meta.json")
        if index.exists():
            meta = json.loads(index.read_text())
            payload = (self.directory / (meta["sha256"] + ".json")).read_bytes()
            if meta["url"] != url or sha256(payload).hexdigest() != meta["sha256"]:
                raise ValueError("Evidence cache integrity failure")
            return json.loads(payload), meta
        for attempt in range(3):
            try:
                if url.startswith(API):
                    result = subprocess.run(["gh", "api", url.removeprefix("https://api.github.com/")], capture_output=True, timeout=45)
                    if result.returncode:
                        raise OSError("GitHub API request failed; check authentication, network or rate limits")
                    payload = result.stdout
                else:
                    with urlopen(Request(url, headers={"User-Agent": "SignalRank-local-reconstruction"}), timeout=30) as response:
                        payload = response.read(5_000_001)
                if len(payload) > 5_000_000:
                    raise ValueError("Response exceeds size limit")
                data = json.loads(payload)
                digest = sha256(payload).hexdigest()
                target = self.directory / (digest + ".json")
                if not target.exists():
                    target.write_bytes(payload)
                meta = {"url": url, "sha256": digest, "retrieved_at": datetime.now(timezone.utc).isoformat()}
                atomic_json(index, meta)
                return data, meta
            except HTTPError as exc:
                if exc.code not in (500, 502, 503, 504) or attempt == 2:
                    raise
            except (OSError, subprocess.TimeoutExpired):
                if attempt == 2:
                    raise
            time.sleep(attempt + 1)


def reconstruct(identifier, revision, catalog, client):
    row = {"id": identifier, "state": "excluded", "issues": [], "evidence": [], "label_status": "excluded", "timestamp_checks_passed": False}
    def read(url):
        data, meta = client.get(url)
        row["evidence"].append(meta)
        return data
    try:
        path = cve_path(identifier)
        latest = read(RAW_URL + revision + "/" + path)
        metadata = latest["cveMetadata"]
        if metadata["cveId"] != identifier:
            raise ValueError("Identifier mismatch")
        row["record_state"] = metadata["state"]
        if metadata["state"] != "PUBLISHED":
            row["issues"] = ["Record is not published in pinned inventory"]
            return row
        published = timestamp(metadata["datePublished"])
        cutoff = published + timedelta(days=1)
        row.update(published_at=published.isoformat(), forecast_at=cutoff.isoformat(), maturity_at=(cutoff + timedelta(days=30)).isoformat())
        query = urlencode({"path": path, "sha": revision, "until": cutoff.isoformat(), "per_page": 1})
        commits = read(API + "commits?" + query)
        if not commits:
            row["issues"] = ["No repository snapshot before forecast cutoff"]
            return row
        commit = commits[0]
        historical_revision = commit["sha"]
        if not re.fullmatch(r"[0-9a-f]{40}", historical_revision):
            raise ValueError("Invalid historical revision")
        historical = read(RAW_URL + historical_revision + "/" + path)
        row["historical_revision"] = historical_revision
        row["commit_at"] = commit["commit"]["committer"]["date"]
        row["issues"] = check_snapshot(historical, latest, commit, cutoff)
        row["timestamp_checks_passed"] = not row["issues"]
        cna = historical.get("containers", {}).get("cna", {})
        descriptions = cna.get("descriptions", [])
        english = [d.get("value", "") for d in descriptions if d.get("lang", "").lower().startswith("en")]
        row["features"] = {"english_text_characters": sum(len(x) for x in english), "has_metrics": bool(cna.get("metrics")), "has_weaknesses": bool(cna.get("problemTypes")), "container": "historical CNA only"}
        if not english:
            row["issues"].append("No English historical description")
        event = catalog["events"].get(identifier)
        row["catalog_date_added"] = event
        row["label_status"] = label_window(cutoff, timestamp(catalog["released"]), event)
        row["state"] = "candidate" if not row["issues"] and row["label_status"] in ("positive", "provisional negative") else "excluded"
    except HTTPError as exc:
        row.update(state="retryable error", issues=["Source request failed: HTTP " + str(exc.code)])
    except (OSError, subprocess.TimeoutExpired) as exc:
        row.update(state="retryable error", issues=[type(exc).__name__ + ": source unavailable; retry with the same manifest"])
    except (ValueError, KeyError, TypeError) as exc:
        row["issues"] = [str(exc)]
    return row


def summarize(rows, cohort, catalog_hash, build_id):
    candidates = [r for r in rows if r["state"] == "candidate"]
    label_counts = Counter(r["label_status"] for r in candidates)
    blockers = []
    if label_counts["positive"] == 0:
        blockers.append("No positive candidate outcomes: a binary classifier cannot be trained or evaluated on this candidate set.")
    if len(rows) < len(cohort["selected_ids"]):
        blockers.append("Selected records are still pending reconstruction.")
    if any(r["state"] == "retryable error" for r in rows):
        blockers.append("Source requests failed for some records; resume the same build before evaluating coverage.")
    blockers.extend(["Current catalog membership is provisional; historical additions, corrections and removals have not been audited.",
                     "Repository and publication timestamps do not establish first public availability.",
                     "Confirm sufficient positive outcomes in independent chronological partitions before selecting models.",
                     "The current source approval covers local feasibility auditing, not real-data model training."])
    return {
        "build_id": build_id, "policy": POLICY, "generated_at": datetime.now(timezone.utc).isoformat(),
        "cohort_revision": cohort["revision"], "catalog_sha256": catalog_hash,
        "selected": len(cohort["selected_ids"]), "processed": len(rows),
        "pending": len(cohort["selected_ids"]) - len(rows),
        "states": dict(Counter(r["state"] for r in rows)),
        "candidate_labels": dict(label_counts),
        "missing_metrics": sum(not r.get("features", {}).get("has_metrics", False) for r in candidates),
        "training_enabled": False,
        "blockers": blockers,
        "rows": sorted(rows, key=lambda r: r["id"]),
    }


def run(limit=500, workers=4):
    verify_evidence()
    cohort = json.loads((ROOT / "signalrank/cohort.json").read_text())
    if len(set(cohort["selected_ids"])) != len(cohort["selected_ids"]) or not re.fullmatch(r"[0-9a-f]{40}", cohort["revision"]):
        raise ValueError("Invalid cohort manifest")
    for identifier in cohort["selected_ids"]:
        if not re.fullmatch(r"CVE-\d{4}-\d{4,}", identifier):
            raise ValueError("Invalid cohort identifier")
    catalog_bytes = (RAW / "kev.json").read_bytes()
    catalog_hash = sha256(catalog_bytes).hexdigest()
    expected = json.loads((ROOT / "signalrank/feasibility.json").read_text())["catalog_sha256"]
    if catalog_hash != expected:
        raise ValueError("Catalog snapshot changed")
    catalog_data = json.loads(catalog_bytes)
    entries = catalog_data["vulnerabilities"]
    if len({x["cveID"] for x in entries}) != len(entries):
        raise ValueError("Duplicate catalog entries")
    catalog = {"released": catalog_data["dateReleased"], "events": {x["cveID"]: x["dateAdded"] for x in entries}}
    build_id = sha256((json.dumps(cohort, sort_keys=True) + catalog_hash + POLICY).encode()).hexdigest()
    client = EvidenceClient()
    for original, name in [(ROOT / "evidence/cve-terms.vue", "CVE-TERMS.vue"), (ROOT / "evidence/kev-license.txt", "KEV-LICENSE.txt"), (ROOT / "DATA-NOTICES.txt", "NOTICE.txt")]:
        shutil.copyfile(original, client.directory / name)
    checkpoints = client.directory / build_id
    checkpoints.mkdir(exist_ok=True)
    rows, pending = {}, []
    for identifier in cohort["selected_ids"]:
        path = checkpoints / (identifier + ".json")
        if path.exists():
            row = json.loads(path.read_text())
            # Recheck cached evidence on every resume, including completed records.
            for evidence in row["evidence"]:
                _, cached = client.get(evidence["url"])
                if cached["sha256"] != evidence["sha256"]:
                    raise ValueError("Checkpoint evidence changed")
            if row["state"] != "retryable error":
                rows[identifier] = row
                continue
        pending.append(identifier)
    output = ROOT / "signalrank/readiness.json"
    atomic_json(output, summarize(list(rows.values()), cohort, catalog_hash, build_id))
    with ThreadPoolExecutor(max_workers=workers) as pool:
        tasks = {pool.submit(reconstruct, identifier, cohort["revision"], catalog, client): identifier for identifier in pending[:limit]}
        for task in as_completed(tasks):
            identifier = tasks[task]
            row = task.result()
            atomic_json(checkpoints / (identifier + ".json"), row)
            rows[identifier] = row
            atomic_json(output, summarize(list(rows.values()), cohort, catalog_hash, build_id))
            if len(rows) % 25 == 0:
                print(f"Processed {len(rows)}/{len(cohort['selected_ids'])}", flush=True)
    report = summarize(list(rows.values()), cohort, catalog_hash, build_id)
    atomic_json(output, report)
    print(json.dumps({k: v for k, v in report.items() if k != "rows"}, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--limit", type=int, choices=range(1, 501), default=500, metavar="1..500")
    parser.add_argument("--workers", type=int, choices=range(1, 5), default=4)
    args = parser.parse_args()
    run(args.limit, args.workers)
