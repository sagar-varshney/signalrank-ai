"""Read-only review of archived cohort evidence. No network, fitting or writes."""
import argparse
from collections import Counter
from datetime import datetime, timedelta
from hashlib import sha256
import json
import os
from pathlib import Path
import re
from urllib.parse import urlsplit, urlencode

from signalrank.scope import require_use
from signalrank.validation import check_snapshot, label_window

ROOT = Path(__file__).resolve().parents[1]
MAX_BYTES = 32 * 1024 * 1024
MAX_FILE_BYTES = 2 * 1024 * 1024
HEX = re.compile(r"^[a-f0-9]{64}$")
CVE = re.compile(r"^CVE-\d{4}-\d{4,}$")
REVISION = re.compile(r"^[a-f0-9]{40}$")
WARNING = "Archive checks describe recorded local bytes, not authenticity, current terms, first public availability or validated outcomes. No training or acquisition is enabled."


def timestamp(value):
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        raise ValueError("Timezone required")
    return parsed


class Reader:
    def __init__(self, root, max_bytes):
        self.root = Path(root).resolve()
        self.remaining = max_bytes
        self.bytes_read = 0
        self.inputs = {}
        self.issues = []
        self.limited = False

    def read(self, relative, expected=None):
        if relative in self.inputs:
            item = self.inputs[relative]
            if expected and item["sha256"] != expected:
                self.issues.append({"file": relative, "status": "hash_mismatch", "reason": "Cached bytes disagree with the expected checksum"})
                return None
            return item["payload"]
        path = self.root / relative
        status = "unavailable"
        try:
            if Path(relative).is_absolute() or ".." in Path(relative).parts:
                raise ValueError("Unsafe path")
            if any(p.is_symlink() for p in (path, *list(path.parents)[:len(Path(relative).parts) - 1])):
                raise ValueError("Symlink evidence is not followed")
            info = path.stat()
            size = info.st_size
            if not path.is_file() or size > MAX_FILE_BYTES:
                status = "file_limit"
                raise ValueError("Evidence file exceeds the per-file limit or is not regular")
            if size > self.remaining:
                self.limited = True
                status = "budget_limit"
                raise ValueError("Local read budget exhausted")
            with path.open("rb") as stream:
                payload = stream.read(size)
                self.bytes_read += len(payload)
                self.remaining -= len(payload)
                after = os.fstat(stream.fileno())
                if len(payload) != size or (after.st_size, after.st_mtime_ns, after.st_ino) != (size, info.st_mtime_ns, info.st_ino):
                    status = "changed"
                    raise ValueError("Evidence changed while reading")
            digest = sha256(payload).hexdigest()
            if expected and digest != expected:
                status = "hash_mismatch"
                raise ValueError("Recorded checksum does not match local bytes")
            self.inputs[relative] = {"sha256": digest, "bytes": size, "payload": payload}
            return payload
        except (OSError, ValueError) as error:
            self.issues.append({"file": relative, "status": status, "reason": str(error) if isinstance(error, ValueError) else "Local evidence is missing or unreadable"})
            return None

    def json(self, relative):
        raw = self.read(relative)
        try:
            return json.loads(raw) if raw is not None else None
        except (ValueError, TypeError):
            self.issues.append({"file": relative, "status": "invalid_json", "reason": "Local JSON cannot be parsed"})
            return None


def allowed_url(value):
    if not isinstance(value, str) or len(value) > 4096:
        return False
    try:
        parsed = urlsplit(value)
    except ValueError:
        return False
    return parsed.scheme == "https" and ((parsed.netloc == "api.github.com" and parsed.path.startswith("/repos/CVEProject/cvelistV5/")) or
                                           (parsed.netloc == "raw.githubusercontent.com" and parsed.path.startswith("/CVEProject/cvelistV5/")))


def replay_candidate(row, revision, catalog, reader, payloads, references):
    """Recompute the old checks from verified cached bytes, without a client."""
    try:
        identifier = row["id"]
        if not isinstance(identifier, str) or not CVE.fullmatch(identifier):
            return False
        _, year, number = identifier.split("-")
        path = f"cves/{year}/{number[:-3]}xxx/{identifier}.json"
        cutoff = timestamp(row["forecast_at"])
        old_revision = row["historical_revision"]
        if not REVISION.fullmatch(old_revision):
            return False
        urls = ["https://raw.githubusercontent.com/CVEProject/cvelistV5/" + r + "/" + path for r in (revision, old_revision)]
        query = urlencode({"path": path, "sha": revision, "until": cutoff.isoformat(), "per_page": 1})
        urls.append("https://api.github.com/repos/CVEProject/cvelistV5/commits?" + query)
        lookup = {r["url"]: r["sha256"] for r in row["evidence"] if isinstance(r, dict) and isinstance(r.get("url"), str)}
        if any(not references.get((url, lookup.get(url))) or not payloads.get(lookup.get(url)) for url in urls):
            return False
        latest, historical, commits = [reader.json("data/raw/reconstruction/" + lookup[url] + ".json") for url in urls]
        if len(commits) != 1 or commits[0]["sha"] != old_revision or timestamp(commits[0]["commit"]["committer"]["date"]) != timestamp(row["commit_at"]):
            return False
        if latest["cveMetadata"]["cveId"] != identifier or check_snapshot(historical, latest, commits[0], cutoff):
            return False
        if timestamp(latest["cveMetadata"]["datePublished"]) != timestamp(row["published_at"]):
            return False
        label = label_window(cutoff, timestamp(catalog["dateReleased"]), catalog["events"].get(identifier))
        cna = historical.get("containers", {}).get("cna", {})
        text = [d.get("value", "") for d in cna.get("descriptions", []) if d.get("lang", "").lower().startswith("en")]
        expected = {"english_text_characters": sum(len(x) for x in text), "has_metrics": bool(cna.get("metrics")),
                    "has_weaknesses": bool(cna.get("problemTypes")), "container": "historical CNA only"}
        return label == row["label_status"] and row["features"] == expected
    except (KeyError, ValueError, TypeError, AttributeError):
        return False


def audit(root=ROOT, *, public=False, max_bytes=MAX_BYTES):
    if public:
        return {"status": "unavailable", "reason": "Archived real-data feasibility is local-only", "training_enabled": False}
    if type(max_bytes) is not int or not 1 <= max_bytes <= MAX_BYTES:
        raise ValueError("Local read budget must be between 1 byte and 32 MiB")
    reader = Reader(root, max_bytes)
    documents = {name: reader.json("signalrank/" + name + ".json") for name in ("cohort", "readiness", "feasibility", "sources")}
    cohort, readiness, feasibility, sources = [documents[name] if isinstance(documents[name], dict) else {} for name in documents]
    selected = cohort.get("selected_ids", [])
    rows = readiness.get("rows", [])
    selected = selected if isinstance(selected, list) and all(isinstance(x, str) for x in selected) else []
    rows_valid = isinstance(rows, list) and len(rows) <= 5000 and all(isinstance(r, dict) for r in rows)
    cohort_available = bool(readiness) and "rows" in readiness and rows_valid
    rows = rows if rows_valid else []
    ids = [r.get("id") for r in rows]
    consistent_ids = all(isinstance(i, str) and CVE.fullmatch(i) for i in ids)
    candidates = [r for r in rows if r.get("state") == "candidate"]
    states = Counter(r.get("state", "unknown") if isinstance(r.get("state", "unknown"), str) else "invalid" for r in rows)
    labels = Counter(r.get("label_status", "unknown") if isinstance(r.get("label_status", "unknown"), str) else "invalid" for r in candidates)
    manifest_ok = bool(selected) and len(selected) == len(set(selected)) and all(CVE.fullmatch(i) for i in selected)
    manifest_ok = manifest_ok and rows_valid and consistent_ids and len(ids) == len(set(ids)) and set(ids) == set(selected)
    manifest_ok = manifest_ok and readiness.get("selected") == len(selected) and readiness.get("processed") == len(rows) and readiness.get("pending") == 0
    manifest_ok = manifest_ok and readiness.get("states") == dict(states) and readiness.get("candidate_labels") == dict(labels)
    revision = cohort.get("revision", "")
    manifest_ok = manifest_ok and isinstance(revision, str) and bool(REVISION.fullmatch(revision)) and revision == readiness.get("cohort_revision")

    permission = []
    notices = []
    for source, filename in (("cve", "cve-terms.vue"), ("cisa_kev", "kev-license.txt")):
        operations = {}
        for operation in ("local_audit", "train"):
            try:
                require_use(source, operation, sources)
                operations[operation] = "allowed"
            except ValueError:
                operations[operation] = "blocked"
        permission.append({"source": source, **operations})
        record = sources.get(source, {})
        expected = record.get("license_snapshot_sha256") if isinstance(record, dict) else None
        verified = isinstance(expected, str) and bool(HEX.fullmatch(expected)) and reader.read("evidence/" + filename, expected) is not None
        notices.append({"source": source, "status": "verified" if verified else "unresolved"})

    catalog_digest = readiness.get("catalog_sha256")
    catalog_ok = isinstance(catalog_digest, str) and bool(HEX.fullmatch(catalog_digest)) and catalog_digest == feasibility.get("catalog_sha256")
    catalog_ok = bool(catalog_ok and reader.read("data/raw/kev.json", catalog_digest) is not None)
    catalog = reader.json("data/raw/kev.json") if catalog_ok else None
    try:
        events = {r["cveID"]: r["dateAdded"] for r in catalog["vulnerabilities"]}
        catalog_ok = len(events) == len(catalog["vulnerabilities"]) and timestamp(catalog["dateReleased"]) == timestamp(feasibility["catalog_released"])
        catalog = {"dateReleased": catalog["dateReleased"], "events": events}
    except (KeyError, TypeError, ValueError, AttributeError):
        catalog_ok, catalog = False, {}
    references, unique_references, payloads = 0, {}, {}
    invalid_references = 0
    for row in rows:
        evidence = row.get("evidence", [])
        if not isinstance(evidence, list) or len(evidence) > 10:
            invalid_references += 1
            continue
        for reference in evidence:
            references += 1
            if not isinstance(reference, dict):
                invalid_references += 1
                continue
            url, digest = reference.get("url"), reference.get("sha256")
            if not allowed_url(url) or not isinstance(digest, str) or not HEX.fullmatch(digest):
                invalid_references += 1
                continue
            key = (url, digest)
            if key not in unique_references:
                meta = reader.json("data/raw/reconstruction/" + sha256(url.encode()).hexdigest() + ".meta.json")
                try:
                    unique_references[key] = isinstance(meta, dict) and meta.get("url") == url and meta.get("sha256") == digest and timestamp(meta["retrieved_at"]) == timestamp(reference["retrieved_at"])
                except (KeyError, ValueError, TypeError, AttributeError):
                    unique_references[key] = False
            if digest not in payloads:
                payloads[digest] = reader.read("data/raw/reconstruction/" + digest + ".json", digest) is not None
    archive_ok = bool(references and not invalid_references and unique_references and all(unique_references.values()) and all(payloads.values()) and
                      catalog_ok and all(n["status"] == "verified" for n in notices) and not reader.issues)

    years, timestamp_checks = Counter(), 0
    replayed = sum(replay_candidate(row, revision, catalog, reader, payloads, unique_references) for row in candidates) if catalog_ok else 0
    missing_metrics, unknown_metrics = 0, 0
    for row in candidates:
        feature = row.get("features")
        metrics = feature.get("has_metrics") if isinstance(feature, dict) else None
        missing_metrics += metrics is False
        unknown_metrics += type(metrics) is not bool
        try:
            published, cutoff, commit, mature, end = [timestamp(v) for v in (row["published_at"], row["forecast_at"], row["commit_at"], row["maturity_at"], feasibility["catalog_released"])]
            years[str(published.year)] += 1
            timestamp_checks += bool(row.get("timestamp_checks_passed") is True and published < cutoff and commit <= cutoff and
                                     cutoff == published + timedelta(days=1) and mature == cutoff + timedelta(days=30) and mature <= end)
        except (KeyError, TypeError, ValueError, AttributeError):
            pass
    gates = [
        {"id": "accounting", "name": "Selection and record accounting", "status": "verified" if manifest_ok else "unresolved", "finding": "Recomputed IDs, membership, states, labels and pinned revision agree." if manifest_ok else "Missing or inconsistent manifests/rows; do not infer complete coverage."},
        {"id": "archive", "name": "Archived byte integrity", "status": "verified" if archive_ok else "unresolved", "finding": "Notices, catalog, cache metadata and referenced payload hashes match." if archive_ok else "Some archived evidence is missing, changed, invalid or outside the read budget."},
        {"id": "timestamps", "name": "Recorded timestamp consistency", "status": "verified" if candidates and timestamp_checks == len(candidates) else "unresolved", "finding": f"{timestamp_checks} / {len(candidates)} candidate rows pass independent cutoff/maturity checks; this does not prove first availability."},
        {"id": "replay", "name": "Replayed snapshot checks", "status": "verified" if candidates and replayed == len(candidates) else "unresolved", "finding": f"{replayed} / {len(candidates)} candidate rows reproduce cached snapshot, feature and provisional-label checks. This does not validate historical outcomes."},
        {"id": "availability", "name": "First public availability", "status": "unresolved", "finding": "Repository/publication timestamps and later archive retrieval do not establish information available at forecast time."},
        {"id": "history", "name": "Historical outcome validity", "status": "unresolved", "finding": "Catalog additions, corrections and removals remain unaudited. Provisional negatives are not verified negatives."},
        {"id": "classes", "name": "Candidate outcome support", "status": "blocked" if cohort_available and (not labels.get("positive") or not labels.get("provisional negative")) else "unresolved", "finding": f"{labels.get('positive', 0)} positive and {labels.get('provisional negative', 0)} provisional-negative candidates. Both classes alone would not establish adequacy." if cohort_available else "Candidate evidence is unavailable; outcome support cannot be assessed."},
        {"id": "partitions", "name": "Study partitions and uncertainty", "status": "unresolved", "finding": "No frozen real-data partition dates, final interval or metric-precision/sample-size justification is established by these files."},
        {"id": "permission", "name": "Real-data fitting scope", "status": "blocked", "finding": "Local audit scope is separate from training, display and release. Real-data fitting remains disabled even if archive checks pass."},
    ]
    return {"protocol": "local-feasibility-audit-v1", "status": "blocked", "training_enabled": False, "acquisition_enabled": False,
            "warning": WARNING, "decision": "Do not fit or expand acquisition from this audit. Resolve the scientific and use-specific gates first.",
            "scope": "Existing exploratory cohort only; not a new frozen study or predictive evaluation.",
            "cohort": {"available": cohort_available, "selected": len(selected), "processed": len(rows), "candidates": len(candidates), "states": dict(states),
                       "candidate_labels": dict(labels), "missing_metrics": missing_metrics, "unknown_metrics": unknown_metrics,
                       "candidate_publication_years": dict(sorted(years.items())), "timestamp_checks": timestamp_checks, "replayed_candidates": replayed},
            "archive": {"references": references, "invalid_references": invalid_references, "unique_metadata": len(unique_references),
                        "verified_metadata": sum(unique_references.values()), "unique_payloads": len(payloads), "verified_payloads": sum(payloads.values()),
                        "catalog_verified": catalog_ok, "notices": notices},
            "source_permissions": permission, "gates": gates,
            "read_budget": {"limit_bytes": max_bytes, "bytes_read": reader.bytes_read, "exhausted": reader.limited,
                            "network_requests": 0, "bytes_written": 0},
            "inputs": [{"file": name, "sha256": item["sha256"], "bytes": item["bytes"]} for name, item in sorted(reader.inputs.items())],
            "issues": reader.issues[:20], "issue_count": len(reader.issues),
            "limitations": ["Checksums detect changed bytes, not authentic sources or malicious rewrites.",
                            "No current legal terms are fetched or certified; source flags cannot grant rights.",
                            "Missing files remain unresolved. No repair, download, relabelling or positive enrichment occurs.",
                            "Identifier-year sampling is not a publication-year cohort."]}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT, help="Existing local checkout containing the archived evidence")
    parser.add_argument("--max-read-mib", type=int, choices=range(1, 33), default=32)
    args = parser.parse_args()
    print(json.dumps(audit(args.root, max_bytes=args.max_read_mib * 1024 * 1024), indent=2, allow_nan=False))


if __name__ == "__main__":
    main()
