"""Explicit public synthetic-demo boundary; not a multi-user production service."""
from dataclasses import dataclass
from datetime import datetime, timezone
import os
from time import monotonic

from starlette.middleware.trustedhost import TrustedHostMiddleware
from starlette.responses import JSONResponse

from signalrank.replay import digest


@dataclass(frozen=True)
class Settings:
    public: bool
    hosts: tuple

    @classmethod
    def load(cls):
        profile = os.environ.get("SIGNALRANK_PROFILE", "local")
        if profile not in ("local", "public"):
            raise ValueError("SIGNALRANK_PROFILE must be local or public")
        names = os.environ.get("SIGNALRANK_ALLOWED_HOSTS", "")
        render_host = os.environ.get("RENDER_EXTERNAL_HOSTNAME", "")
        hosts = tuple(dict.fromkeys(h.strip() for h in (names + "," + render_host).split(",") if h.strip()))
        if any(not h or any(c in h for c in "*/:@ ") for h in hosts):
            raise ValueError("Allowed hosts must be exact hostnames without schemes, ports or wildcards")
        if profile == "public" and not hosts:
            raise ValueError("Public profile requires explicit allowed hosts")
        return cls(profile == "public", hosts or ("127.0.0.1", "localhost", "[::1]", "testserver"))


class MemorySnapshotStore:
    """One immutable seeded snapshot; no visitor writes or filesystem dependency."""
    def __init__(self, payload):
        self.identifier = digest(payload)
        self.value = {"id": self.identifier, "created_at": datetime.now(timezone.utc).isoformat(), **payload}

    def get(self, identifier):
        return self.value if identifier == self.identifier else None

    def list(self, limit=50, offset=0, search=""):
        value, report = self.value, self.value["report"]
        text = " ".join(str(v) for v in (self.identifier, report["dataset_sha256"], report["seed"], value["created_at"]))
        if search.lower() not in text.lower():
            return {"total": 0, "items": []}
        item = {"id": self.identifier, "created_at": value["created_at"], "mode": "synthetic",
                "dataset_sha256": report["dataset_sha256"], "core_sha256": value["provenance"]["core_sha256"],
                "model": report["model"], "seed": report["seed"], "configuration": report.get("configuration"),
                "temporal_windows": len(report.get("temporal_evaluation", {}).get("folds", []))}
        return {"total": 1, "items": [item] if not offset and limit else []}


def lightweight_report(report):
    # Keep all aggregate evidence, omit duplicated complete ledgers from public snapshots.
    result = dict(report)
    for name in ("replay", "recovery"):
        if name in result:
            result[name] = {**result[name], "runs": [{k: v for k, v in run.items() if k != "ledger"} for run in result[name]["runs"]]}
    return result


class ConfiguredHost:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        settings = getattr(scope.get("app").state, "settings", Settings(False, ("localhost", "127.0.0.1", "[::1]", "testserver")))
        await TrustedHostMiddleware(self.app, allowed_hosts=list(settings.hosts), www_redirect=False)(scope, receive, send)


class PublicBoundary:
    """Single-process service-wide limits; intentionally no visitor/IP tracking."""
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http" or not getattr(scope["app"].state, "settings", Settings(False, ())).public:
            return await self.app(scope, receive, send)
        async def secure_send(message):
            if message["type"] == "http.response.start":
                headers = list(message.get("headers", []))
                headers.extend([(b"x-content-type-options", b"nosniff"), (b"x-frame-options", b"DENY"),
                                (b"referrer-policy", b"no-referrer"),
                                (b"permissions-policy", b"camera=(), microphone=(), geolocation=()"),
                                (b"content-security-policy", b"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'")])
                message = {**message, "headers": headers}
            await send(message)
        path = scope["path"]
        if path in ("/docs", "/redoc", "/openapi.json"):
            return await JSONResponse({"detail": "API documentation is local-only in this demo"}, status_code=404)(scope, receive, secure_send)
        if scope["method"] not in ("GET", "HEAD"):
            return await JSONResponse({"detail": "Public demo does not store visitor batches. Use the interactive Prediction Studio or run the local workbench."}, status_code=403)(scope, receive, secure_send)
        if len(scope.get("query_string", b"")) > 8192:
            return await JSONResponse({"detail": "Query too large"}, status_code=414)(scope, receive, secure_send)
        if path.startswith("/api/") and path != "/api/health":
            budget = scope["app"].state.public_budget
            now = monotonic()
            budget["tokens"] = min(120., budget["tokens"] + max(0, now - budget["last"]) * 2)
            budget["last"] = now
            weight = 8 if path.startswith(("/api/experiments/", "/api/export/", "/api/replay/export", "/api/comparison")) else 1
            if budget["tokens"] < weight or budget["active"] >= 4:
                return await JSONResponse({"detail": "Demo request budget reached. Please retry shortly."}, status_code=429, headers={"Retry-After": "5"})(scope, receive, secure_send)
            budget["tokens"] -= weight
            budget["active"] += 1
            try:
                return await self.app(scope, receive, secure_send)
            finally:
                budget["active"] -= 1
        return await self.app(scope, receive, secure_send)
