"""Bounded fictional input contracts and local version comparison. No training or network."""
import argparse
from collections import defaultdict
from hashlib import sha256
import json
import math
from pathlib import Path
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, ValidationError, model_validator

SCHEMA = "fictional-input-v1"
DESCRIPTIONS = (
    "memory corruption in document parser", "authentication bypass in gateway",
    "information disclosure in local utility", "remote command handling flaw", "denial of service in image decoder",
)


class FictionalRecord(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    id: str = Field(pattern=r"^SYN-BATCH-[A-Za-z0-9_-]{1,40}$")
    description: Literal[DESCRIPTIONS]
    severity: float = Field(ge=1, le=10, allow_inf_nan=False)
    remote: bool
    authentication_required: bool


class DatasetEnvelope(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    source: Literal["synthetic"]
    schema_version: Literal["fictional-input-v1"] = SCHEMA
    dataset_version: str | None = Field(default=None, min_length=1, max_length=64, pattern=r"^[A-Za-z0-9][A-Za-z0-9._-]*$")
    records: list[FictionalRecord] = Field(min_length=1, max_length=500)

    @model_validator(mode="after")
    def unique_ids(self):
        if len({r.id for r in self.records}) != len(self.records):
            raise ValueError("Batch identifiers must be unique")
        return self


def digest(value):
    return sha256(json.dumps(value, sort_keys=True, separators=(",", ":"), allow_nan=False).encode()).hexdigest()


def summary(envelope):
    records = [r.model_dump() for r in envelope.records]
    groups = defaultdict(list)
    for record in records:
        groups[digest({k: v for k, v in record.items() if k != "id"})].append(record["id"])
    repeated = [ids for ids in groups.values() if len(ids) > 1]
    return {"status": "valid", "schema_version": envelope.schema_version,
            "dataset_version": envelope.dataset_version, "count": len(records),
            "input_sha256": digest({"schema_version": envelope.schema_version, "source": envelope.source, "records": records}),
            "versioning": "immutable on successful local batch save" if envelope.dataset_version else "unversioned legacy input; no version-identity guarantee",
            "repeated_feature_groups": repeated,
            "warnings": ["Identical feature values under different IDs are reported, not rejected: distinct observations may legitimately match."] if repeated else []}


def inspect(payload):
    try:
        return summary(DatasetEnvelope.model_validate(payload))
    except ValidationError as error:
        return {"status": "invalid", "issues": [{"path": list(item["loc"]), "code": item["type"], "message": item["msg"]}
                for item in error.errors(include_input=False, include_context=False, include_url=False)]}


def compare(previous, current):
    old_report, new_report = inspect(previous), inspect(current)
    if old_report["status"] != "valid" or new_report["status"] != "valid":
        return {"status": "blocked", "reason": "Both versions must pass the input contract", "previous": old_report, "current": new_report}
    old = DatasetEnvelope.model_validate(previous)
    new = DatasetEnvelope.model_validate(current)
    left = {r.id: r.model_dump() for r in old.records}
    right = {r.id: r.model_dump() for r in new.records}
    changed = [{"id": identifier, "fields": sorted(k for k in left[identifier] if left[identifier][k] != right[identifier][k])}
               for identifier in sorted(left.keys() & right.keys()) if left[identifier] != right[identifier]]
    same_bytes = old_report["input_sha256"] == new_report["input_sha256"]
    versioned = old.dataset_version is not None and new.dataset_version is not None
    conflict = versioned and old.dataset_version == new.dataset_version and not same_bytes
    return {"status": "blocked" if conflict or not versioned else "compatible",
            "reason": "Dataset version reused with different inputs" if conflict else "Explicit dataset versions required for comparison" if not versioned else "Same supported schema; inspect changes before choosing the next version",
            "previous": old_report, "current": new_report, "added": sorted(right.keys() - left.keys()),
            "removed": sorted(left.keys() - right.keys()), "changed": changed,
            "order_changed": [r.id for r in old.records] != [r.id for r in new.records],
            "note": "Compatible describes schema only, not model accuracy, drift significance or automatic promotion."}


def fixture_report():
    row = {"id": "SYN-BATCH-contract-1", "description": DESCRIPTIONS[0], "severity": 5., "remote": True, "authentication_required": False}
    baseline = {"source": "synthetic", "schema_version": SCHEMA, "dataset_version": "demo-v1", "records": [row]}
    missing = {**row}; missing.pop("severity")
    cases = [("Valid fictional input", baseline), ("Missing severity", {**baseline, "records": [missing]}),
             ("Unexpected outcome field", {**baseline, "records": [{**row, "event_date": None}]}),
             ("Duplicate identifier", {**baseline, "records": [row, row]}),
             ("Unsupported schema version", {**baseline, "schema_version": "fictional-input-v2"}),
             ("Invalid boolean", {**baseline, "records": [{**row, "remote": "yes"}]}),
             ("Out-of-range severity", {**baseline, "records": [{**row, "severity": 11.}]})]
    rewritten = {**baseline, "records": [{**row, "severity": 8.}]}
    return {"protocol": SCHEMA, "schema": DatasetEnvelope.model_json_schema(),
            "checks": [{"name": name, **inspect(payload)} for name, payload in cases],
            "version_conflict": compare(baseline, rewritten),
            "version_change": compare(baseline, {**rewritten, "dataset_version": "demo-v2"}),
            "warning": "Original fictional fixtures only. No real-data permissions, fitting, uploads or performance claims."}


def decode_json(body):
    def unique_object(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                raise ValueError("Duplicate JSON object field")
            result[key] = value
        return result
    def finite_float(value):
        result = float(value)
        if not math.isfinite(result):
            raise ValueError("Non-finite JSON number")
        return result
    def reject_constant(value):
        raise ValueError("Non-finite JSON constant")
    return json.loads(body, object_pairs_hook=unique_object, parse_float=finite_float, parse_constant=reject_constant)


def read_bounded(path):
    with Path(path).open("rb") as stream:
        body = stream.read(256 * 1024 + 1)
    if len(body) > 256 * 1024:
        raise ValueError("Dataset file exceeds 256 KiB")
    return decode_json(body)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("dataset", type=Path, nargs="?", help="Local fictional DatasetEnvelope JSON; omit for built-in fixture evidence")
    parser.add_argument("--previous", type=Path, help="Compare with an earlier version; both must have explicit dataset_version")
    args = parser.parse_args()
    if args.previous and not args.dataset:
        parser.error("--previous requires a dataset")
    try:
        result = compare(read_bounded(args.previous), read_bounded(args.dataset)) if args.previous else inspect(read_bounded(args.dataset)) if args.dataset else fixture_report()
    except (OSError, ValueError, RecursionError) as error:
        result = {"status": "invalid", "reason": type(error).__name__ + ": " + str(error)}
    print(json.dumps(result, indent=2, allow_nan=False))
    return 1 if result.get("status") in ("invalid", "blocked") else 0


if __name__ == "__main__":
    raise SystemExit(main())
