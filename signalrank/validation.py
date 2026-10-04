"""Replay the historical pilot offline; never promote it to training data."""
from collections import Counter
from datetime import datetime, timedelta, timezone
from hashlib import sha256
import json
from urllib.parse import parse_qs, urlparse

from signalrank.audit import ROOT, RAW, cve_path, verify_evidence


def timestamp(value):
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        raise ValueError("Timestamp is missing timezone")
    return parsed.astimezone(timezone.utc)


def label_window(cutoff, released, event_date=None):
    """Date-only events touching either hourly boundary are ambiguous."""
    end = cutoff + timedelta(days=30)
    if released < end:
        return "immature"
    if event_date is None:
        return "provisional negative"
    day = datetime.fromisoformat(event_date).date()
    if day < cutoff.date():
        return "already listed"
    if day in (cutoff.date(), end.date()):
        return "ambiguous boundary"
    return "positive" if cutoff.date() < day < end.date() else "provisional negative"


def check_snapshot(record, latest, commit, cutoff):
    reasons = []
    metadata = record["cveMetadata"]
    if metadata["state"] != "PUBLISHED":
        reasons.append("historical record not published")
    if metadata.get("cveId") != latest["cveMetadata"].get("cveId"):
        reasons.append("identifier mismatch")
    published = timestamp(metadata["datePublished"])
    if published != timestamp(latest["cveMetadata"]["datePublished"]):
        reasons.append("publication timestamp revised")
    if published > cutoff or timestamp(commit["commit"]["committer"]["date"]) > cutoff:
        reasons.append("snapshot after cutoff")
    # Audit all timestamped containers, even though future features will use CNA only.
    containers = record.get("containers", {})
    for container in [containers.get("cna", {}), *containers.get("adp", [])]:
        updated = container.get("providerMetadata", {}).get("dateUpdated")
        if updated and timestamp(updated) > cutoff:
            reasons.append("container updated after cutoff")
    updated = metadata.get("dateUpdated")
    if updated and timestamp(updated) > cutoff:
        reasons.append("metadata updated after cutoff")
    if not any(x.get("value", "").strip() for x in containers.get("cna", {}).get("descriptions", [])):
        reasons.append("missing historical text")
    return sorted(set(reasons))


def select_cohort(identifiers, size=500, seed="signalrank-cohort-v1"):
    """Outcome-blind deterministic sampling from a caller-supplied full frame.

    Frame completeness must be verified separately; do not pass only KEV IDs.
    """
    if size < 1:
        raise ValueError("Cohort size must be positive")
    frame = sorted(set(identifiers))
    return sorted(frame, key=lambda key: (sha256(f"{seed}:{key}".encode()).hexdigest(), key))[:size]


def run():
    verify_evidence()
    manifest = json.loads((ROOT / "evidence/download-manifest.json").read_text())
    cache = {}
    for entry in manifest:
        payload = (RAW / (entry["sha256"] + ".json")).read_bytes()
        if sha256(payload).hexdigest() != entry["sha256"]:
            raise ValueError("Corrupted cached evidence")
        cache[entry["url"]] = json.loads(payload)
    report = json.loads((ROOT / "signalrank/feasibility.json").read_text())
    kev_bytes = (RAW / "kev.json").read_bytes()
    if sha256(kev_bytes).hexdigest() != report["catalog_sha256"]:
        raise ValueError("Catalog differs from audited snapshot")
    catalog = json.loads(kev_bytes)
    events = {x["cveID"]: x["dateAdded"] for x in catalog["vulnerabilities"]}
    release = timestamp(catalog["dateReleased"])
    rows = []
    for item in report["sample"]:
        row = {"id": item["id"], "issues": [], "timestamp_checks_passed": False}
        try:
            if not item.get("revision"):
                raise ValueError("No historical snapshot available")
            path = cve_path(item["id"])
            latest = cache[f"https://raw.githubusercontent.com/CVEProject/cvelistV5/main/{path}"]
            historical = cache[f"https://raw.githubusercontent.com/CVEProject/cvelistV5/{item['revision']}/{path}"]
            histories = [value for url, value in cache.items() if url.startswith("https://api.github.com/") and parse_qs(urlparse(url).query).get("path") == [path]]
            commits = [c for history in histories for c in history if c["sha"] == item["revision"]]
            if len(commits) != 1:
                raise ValueError("Missing or ambiguous commit evidence")
            cutoff = timestamp(item["forecast_at"])
            row["issues"] = check_snapshot(historical, latest, commits[0], cutoff)
            row["timestamp_checks_passed"] = not row["issues"]
            row["label_status"] = label_window(cutoff, release, events.get(item["id"]))
        except (KeyError, ValueError, TypeError) as exc:
            row["issues"] = [str(exc)]
            row["label_status"] = "excluded"
        rows.append(row)
    result = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "training_enabled": False,
        "checked": len(rows),
        "timestamp_checks_passed": sum(x["timestamp_checks_passed"] for x in rows),
        "label_counts": dict(Counter(x["label_status"] for x in rows)),
        "rows": rows,
        "limitations": ["Git timestamps are not proof of first public availability.",
                        "Pilot is selection-biased; a full outcome-blind sampling frame is still required.",
                        "Negatives remain provisional until historical catalog membership is audited."],
    }
    (ROOT / "signalrank/validation.json").write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps({k: v for k, v in result.items() if k != "rows"}, indent=2))


if __name__ == "__main__":
    run()
