"""Pin a complete identifier-year tree before outcome-blind sampling.

This is an identifier inventory, not a publication-year or training cohort.
"""
from datetime import datetime, timezone
from hashlib import sha256
import json
import re

from signalrank.audit import ROOT, RAW, fetch, verify_evidence
from signalrank.validation import select_cohort

API = "https://api.github.com/repos/CVEProject/cvelistV5"
SEED = "signalrank-2024-frame-v1"


def inventory(tree, year):
    if tree.get("truncated") is not False:
        raise ValueError("Incomplete Git tree: refusing to sample")
    ids = []
    for entry in tree["tree"]:
        if entry["type"] == "blob" and entry["path"].endswith(".json"):
            name = entry["path"].rsplit("/", 1)[-1][:-5]
            if not re.fullmatch(rf"CVE-{year}-\d{{4,}}", name):
                raise ValueError("Unexpected record in identifier frame")
            ids.append(name)
    if not ids or len(set(ids)) != len(ids):
        raise ValueError("Empty or duplicate identifier frame")
    return sorted(ids)


def child(tree, name):
    if tree.get("truncated") is not False:
        raise ValueError("Incomplete parent tree")
    matches = [x for x in tree["tree"] if x["path"] == name and x["type"] == "tree"]
    if len(matches) != 1:
        raise ValueError("Missing or ambiguous tree")
    return matches[0]["sha"]


def run():
    verify_evidence()
    RAW.mkdir(parents=True, exist_ok=True)
    log = []
    commit = fetch(API + "/commits/main", log)
    revision = commit["sha"]
    root = fetch(API + "/git/trees/" + commit["commit"]["tree"]["sha"], log)
    cves = fetch(API + "/git/trees/" + child(root, "cves"), log)
    year_sha = child(cves, "2024")
    tree = fetch(API + "/git/trees/" + year_sha + "?recursive=1", log, max_bytes=25_000_000)
    ids = inventory(tree, 2024)
    selected = select_cohort(ids, 500, SEED)
    result = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "revision": revision, "tree_sha": year_sha, "identifier_year": 2024,
        "frame_count": len(ids), "frame_sha256": sha256("\n".join(ids).encode()).hexdigest(),
        "sample_count": len(selected), "seed": SEED, "selected_ids": selected,
        "frame_complete": True, "training_enabled": False,
        "scope": "All CVE-2024 record paths in this pinned repository tree, including rejected records. Not all vulnerabilities published in 2024.",
        "next_gate": "Audit selected record states, historical availability and catalog history. Do not replace excluded selections with KEV-positive examples.",
    }
    (ROOT / "evidence/cohort-download-manifest.json").write_text(json.dumps(log, indent=2) + "\n")
    (ROOT / "signalrank/cohort.json").write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps({k: v for k, v in result.items() if k != "selected_ids"}, indent=2))


if __name__ == "__main__":
    run()
