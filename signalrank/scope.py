"""Read-only engineering scope review, not legal clearance or a training approval API."""
import json
from importlib.resources import files

OPERATIONS = ("local_audit", "train", "display", "redistribute", "release_model")
RELEASE_GATES = (
    "Review code ownership and select a code license before source redistribution.",
    "Review pinned direct/transitive software and bundled asset notices for the exact release.",
    "Review current hosting terms and obtain owner approval before public exposure.",
    "For external data, verify current terms, retained notices and each intended use separately.",
)


def require_use(name, operation, sources):
    if not isinstance(name, str) or not isinstance(sources, dict) or operation not in OPERATIONS:
        raise ValueError("Unknown source operation; access denied")
    source = sources.get(name)
    permissions = source.get("permissions") if isinstance(source, dict) else None
    if not isinstance(permissions, dict) or source.get("status") != "approved" or permissions.get(operation) != "allowed":
        raise ValueError(f"Source {name!r} is not approved for {operation}")
    # A register edit alone can never activate a real-data trainer or model release.
    if name != "synthetic" and operation in ("train", "release_model"):
        raise ValueError("Real-data training/model release remains disabled; permission and scientific gates are separate")


def review(*, public=False, sources=None, readiness=None):
    sources = sources if sources is not None else json.loads(files("signalrank").joinpath("sources.json").read_text())
    if public:
        sources = {"synthetic": sources["synthetic"]}
        readiness = None
    elif readiness is None:
        path = files("signalrank").joinpath("readiness.json")
        readiness = json.loads(path.read_text()) if path.is_file() else None
    matrix = []
    for name, source in sources.items():
        permissions = {}
        for operation in OPERATIONS:
            try:
                require_use(name, operation, sources)
                permissions[operation] = "allowed"
            except ValueError:
                permissions[operation] = "blocked"
        matrix.append({"source": name, "operations": permissions,
                       "scope": source.get("scope", source.get("purpose", source.get("reason", "No scope recorded")))})
    science = ["Historical first-availability and catalog changes require audit.",
               "Mature outcome classes and adequate support are required in independent chronological partitions.",
               "Freeze configurations on past-only development data; keep a separate final interval untouched."]
    if readiness:
        permission_blocker = "The current source approval covers local feasibility auditing, not real-data model training."
        science = list(dict.fromkeys([*(b for b in readiness.get("blockers", []) if b != permission_blocker), *science]))
    return {"protocol": "use-specific-scope-v1", "profile": "public" if public else "local",
            "intended_use": "Explainable temporal rare-event ML research; synthetic engineering demo plus a separately gated local feasibility study.",
            "proposed_real_target": "First KEV catalog inclusion within 30 days of a validated forecast cutoff, not exploitation or breach probability.",
            "real_training_enabled": False, "legal_certification": False, "source_permissions": matrix,
            "permission_note": "Blocked means not enabled by this project's scope. It is not a finding that the use is illegal. Allowed is an engineering decision, not legal clearance.",
            "scientific_gates": science if not public else ["This public profile contains synthetic evidence only; it cannot establish real-world performance."],
            "release_gates": [{"status": "review_required", "requirement": gate} for gate in RELEASE_GATES],
            "roadmap": ["Scope and source-use review", "Input contracts and real-data feasibility", "Real-data evaluation if all gates pass", "Deeper error analysis", "Optional bounded local scheduler"],
            "budget": "Local CPU work; no paid API/GPU, hosted scheduler or automatic paid fallback.",
            "warning": "This report neither grants rights nor guarantees compliance. Passing tests cannot approve a dataset or deployment."}


if __name__ == "__main__":
    print(json.dumps(review(), indent=2, allow_nan=False))
