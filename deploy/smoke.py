"""Bounded public-profile release checks using only Python's standard library."""
import argparse
from concurrent.futures import ThreadPoolExecutor
import json
from time import monotonic, sleep
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", default="http://127.0.0.1:8030")
    parser.add_argument("--wait", type=int, default=120)
    args = parser.parse_args()
    base = args.url.rstrip("/")
    address = urlsplit(base)
    if address.scheme not in ("http", "https") or not address.hostname or address.path or address.query or address.fragment:
        raise ValueError("Supply an HTTP(S) origin, without credentials or a path")
    if address.username or address.password:
        raise ValueError("URL credentials are not supported")
    local = address.hostname in ("127.0.0.1", "localhost", "::1")
    if not local and address.scheme != "https":
        raise ValueError("Remote checks require HTTPS")

    def request(path, method="GET", headers=None):
        try:
            with urlopen(Request(base + path, method=method, headers=headers or {}), timeout=30) as response:
                return response.status, response.headers, response.read()
        except HTTPError as error:
            return error.code, error.headers, error.read()

    deadline = monotonic() + args.wait
    while True:
        try:
            status, _, body = request("/api/health")
            if status == 200:
                health = json.loads(body)
                break
        except (URLError, TimeoutError, ConnectionError):
            pass
        if monotonic() >= deadline:
            raise AssertionError("Public release did not become ready within the readiness window")
        sleep(1)
    assert health["profile"] == "public" and health["mode"] == "synthetic"
    assert health["visitor_storage"] is False
    status, headers, _ = request("/")
    assert status == 200 and "script-src 'self'" in headers["Content-Security-Policy"]
    assert headers["X-Content-Type-Options"] == "nosniff"
    for asset in ("/static/theme.js", "/static/react/experiments.js", "/static/react/experiments.css"):
        assert request(asset)[0] == 200, asset
    status, _, body = request("/api/studio/predict?category=1&severity=7&remote=true&authentication_required=false")
    prediction = json.loads(body)
    assert status == 200 and len(prediction["model"]["artifact_id"]) == 64
    assert abs(prediction["intercept"] + sum(row["value"] for row in prediction["contributions"]) - prediction["logit"]) < 1e-10
    assert prediction["reconstruction_error"] < 1e-10
    status, _, body = request("/api/recovery")
    recovery = json.loads(body)
    assert status == 200 and len(recovery["runs"]) == 9
    assert all(len(run["updates"]) == 4 and "ledger" not in run for run in recovery["runs"])
    status, _, body = request("/api/decision")
    decision = json.loads(body)
    assert status == 200 and decision["status"] == "available" and len(decision["profiles"]) == 54
    status, _, body = request("/api/experiments/" + health["experiment_id"])
    snapshot = json.loads(body)
    assert status == 200 and snapshot["provenance"]["release_profile"] == "public_synthetic"
    assert all("ledger" not in run for key in ("replay", "recovery") for run in snapshot["report"][key]["runs"])
    assert request("/docs")[0] == 404 and request("/openapi.json")[0] == 404
    assert json.loads(request("/api/inference/models")[2])["items"] == []
    assert json.loads(request("/api/dataset/records")[2])["items"] == []
    assert request("/api/dataset/records/anything")[0] == 404
    for path in ("/api/bikes", "/api/bikes/audit", "/api/bikes/external"):
        status, _, body = request(path)
        value = json.loads(body)
        assert status == 200 and set(value) == {"status", "reason"} and value["status"] == "unavailable", path
    for path in ("/api/bikes/export", "/api/bikes/external/export"):
        status, _, body = request(path)
        assert status == 409 and "detail" in json.loads(body), path
    if local:
        # Only loopback/container verification may send a rejected mutation or invalid Host.
        assert request("/api/batches", method="POST")[0] == 403
        assert request("/api/health", headers={"Host": "untrusted.invalid"})[0] == 400
        with ThreadPoolExecutor(max_workers=4) as pool:
            results = list(pool.map(lambda i: request("/api/studio/predict?severity=" + str(1 + i % 10))[0], range(12)))
        assert all(code == 200 for code in results), results
    print(json.dumps({"profile": health["profile"], "snapshot_id": health["experiment_id"],
                      "recovery_runs": len(recovery["runs"]), "decision_profiles": len(decision["profiles"]),
                      "bounded_local_concurrency": local, "status": "passed"}, sort_keys=True))


if __name__ == "__main__":
    main()
