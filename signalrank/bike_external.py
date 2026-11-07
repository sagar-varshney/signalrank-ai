"""Local-only official-source compatibility gate; it never fits or scores a model."""
import argparse
import csv
from datetime import date, datetime, timedelta
from functools import lru_cache
from hashlib import sha256
from importlib.resources import files
import io
import json
from pathlib import Path
import re
import stat
from xml.etree import ElementTree as ET
from zipfile import ZipFile

from signalrank import bikes

YEAR_START = date(2019, 1, 1)
HOURS = 365 * 24
HOURLY_FIELDS = ("대여일자", "대여시간", "대여소번호", "대여소명", "대여구분코드", "성별", "연령대코드", "이용건수", "운동량", "탄소량", "이동거리", "사용시간")
XML_NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def source():
    value = json.loads(files("signalrank").joinpath("bike-external-source.json").read_text())
    if value["id"] != "seoul-open-data-oa-15245-2019" or value["archive_bytes"] > 400000000:
        raise ValueError("Unsupported external source")
    return value


def fingerprints():
    return {name: bikes.digest(bikes.resource(name)) for name in ("bike_external.py", "bike-external-protocol.json", "bike-external-source.json")}


def file_hash(path, limit):
    if path.is_symlink() or not path.is_file() or path.stat().st_size > limit:
        raise ValueError("Source file missing, linked or above byte limit")
    h = sha256()
    with path.open("rb") as stream:
        while chunk := stream.read(1024 * 1024):
            h.update(chunk)
    return h.hexdigest()


@lru_cache(maxsize=400)
def day_offset(value):
    if not re.fullmatch(r"2019-\d\d-\d\d", value):
        raise ValueError("Unexpected hourly date format")
    offset = (date.fromisoformat(value) - YEAR_START).days
    if not 0 <= offset < 365:
        raise ValueError("Hourly source outside 2019")
    return offset


def member_encoding(zipped, info):
    with zipped.open(info) as stream:
        first = stream.read(4096).split(b"\n", 1)[0]
    try:
        return "utf-8-sig" if "대여일자" in first.decode("utf-8-sig") else "cp949"
    except UnicodeDecodeError:
        return "cp949"


def hourly_summary(archive, spec):
    archive = Path(archive)
    if archive.stat().st_size != spec["archive_bytes"] or file_hash(archive, 400000000) != spec["archive_sha256"]:
        raise ValueError("Hourly archive differs from the pinned official source")
    counts, present = [0] * HOURS, [False] * HOURS
    total_rows = blank_lines = 0
    months = {}
    with ZipFile(archive) as zipped:
        infos = zipped.infolist()
        if len(infos) != 12 or sum(info.file_size for info in infos) > 4000000000:
            raise ValueError("Unexpected hourly archive layout or decompressed size")
        for info in infos:
            match = re.search(r"_19\.(\d\d)\.csv$", info.filename)
            if (not match or "/" in info.filename or "\\" in info.filename or
                    info.is_dir() or stat.S_ISLNK(info.external_attr >> 16) or info.flag_bits & 1 or
                    info.file_size > 250000000):
                raise ValueError("Unsafe or unexpected hourly member")
            month = int(match.group(1))
            if not 1 <= month <= 12 or str(month) in months:
                raise ValueError("Duplicate or invalid monthly member")
            encoding = member_encoding(zipped, info)
            with zipped.open(info) as raw, io.TextIOWrapper(raw, encoding=encoding, newline="") as stream:
                reader = csv.reader(stream)
                if tuple(next(reader, ())) != HOURLY_FIELDS:
                    raise ValueError("Hourly source columns changed")
                month_rows = 0
                for row in reader:
                    if not row:
                        blank_lines += 1
                        continue
                    if len(row) != len(HOURLY_FIELDS) or not row[1].isdigit() or len(row[1]) > 2 or not row[7].isdigit():
                        raise ValueError("Invalid hourly source row")
                    day, hour, count = day_offset(row[0]), int(row[1]), int(row[7])
                    if not 0 <= hour < 24 or not 0 <= count <= 1000000 or (YEAR_START + timedelta(days=day)).month != month:
                        raise ValueError("Hourly value or member month outside contract")
                    index = day * 24 + hour
                    counts[index] += count
                    present[index] = True
                    month_rows += 1
                    total_rows += 1
                    if total_rows > 30000000:
                        raise ValueError("Hourly row cap exceeded")
            months[str(month)] = {"rows": month_rows, "encoding": encoding}
    if set(months) != {str(month) for month in range(1, 13)}:
        raise ValueError("Missing monthly source member")
    return counts, present, {"archive_sha256": spec["archive_sha256"], "raw_rows": total_rows,
                             "blank_lines": blank_lines, "observed_hours": sum(present), "monthly_inputs": months}


def worksheet_rows(path):
    with ZipFile(path) as zipped:
        if any(i.file_size > 2000000 for i in zipped.infolist()) or len(zipped.infolist()) > 30:
            raise ValueError("Unsafe daily workbook layout")
        strings = []
        if "xl/sharedStrings.xml" in zipped.namelist():
            root = ET.fromstring(zipped.read("xl/sharedStrings.xml"))
            strings = ["".join(t.text or "" for t in si.findall(".//m:t", XML_NS)) for si in root.findall("m:si", XML_NS)]
        root = ET.fromstring(zipped.read("xl/worksheets/sheet1.xml"))
        result = []
        for row in root.findall(".//m:sheetData/m:row", XML_NS):
            values = {}
            for cell in row.findall("m:c", XML_NS):
                if cell.find("m:f", XML_NS) is not None:
                    raise ValueError("Daily workbook formula is unsupported")
                value = cell.find("m:v", XML_NS)
                text = value.text if value is not None else ""
                if cell.get("t") == "s" and text:
                    text = strings[int(text)]
                column = "".join(ch for ch in cell.get("r", "") if ch.isalpha())
                values[column] = text
            if any(values.values()):
                result.append(values)
        return result


def daily_summary(directory, spec):
    directory = Path(directory)
    values, hashes, counts = {}, {}, {}
    for seq, meta in spec["daily_files"].items():
        path = directory / f"signalrank-seoul-daily-2019-seq{seq}.{meta['kind']}"
        if path.stat().st_size != meta["bytes"] or file_hash(path, 2097152) != meta["sha256"]:
            raise ValueError("Daily file differs from pinned official source")
        hashes[seq] = meta["sha256"]
        if meta["kind"] == "csv":
            with path.open(encoding="cp949", newline="") as stream:
                reader = csv.reader(stream)
                if next(reader, None) != ["대여일자", "대여건수"]:
                    raise ValueError("Daily CSV schema changed")
                rows = [(date.fromisoformat(row[0]), row[1]) for row in reader if row]
        else:
            sheet = worksheet_rows(path)
            if sheet[0] not in ({"A": "대여일자", "B": "대여건수"}, {"A": "대여일시", "B": "대여건수"}):
                raise ValueError("Daily workbook schema changed")
            rows = []
            for row in sheet[1:]:
                if set(row) != {"A", "B"} or not row["A"].isdigit():
                    raise ValueError("Invalid daily workbook row")
                rows.append(((datetime(1899, 12, 30) + timedelta(days=int(row["A"]))).date(), row["B"]))
        counts[seq] = 0
        for day, raw_count in rows:
            if not raw_count.isdigit() or int(raw_count) > 10000000:
                raise ValueError("Invalid daily rental count")
            if day.year != 2019:
                continue
            if day in values:
                raise ValueError("Duplicate 2019 daily count")
            values[day] = int(raw_count)
            counts[seq] += 1
    return values, {"daily_sha256": hashes, "daily_file_dates": counts}


def summarize(counts, present, published, hourly_meta, daily_meta, spec):
    if len(counts) != HOURS or len(present) != HOURS:
        raise ValueError("Expected exactly 2019 hourly slots")
    absent = [i for i, exists in enumerate(present) if not exists]
    spans = []
    for index in absent:
        if not spans or index > spans[-1][1] + 1:
            spans.append([index, index])
        else:
            spans[-1][1] = index
    origin = datetime(2019, 1, 1, tzinfo=bikes.TZ)
    missing_hours = [{"first": (origin + timedelta(hours=a)).isoformat(),
                      "last": (origin + timedelta(hours=b)).isoformat(), "hours": b-a+1} for a, b in spans]
    missing_daily = []
    comparable = matched = 0
    mismatches = []
    unchecked = []
    for i in range(365):
        day = YEAR_START + timedelta(days=i)
        block = slice(i * 24, (i + 1) * 24)
        if day not in published:
            missing_daily.append(day.isoformat())
        if day not in published or not all(present[block]):
            unchecked.append(day.isoformat())
            continue
        comparable += 1
        hourly = sum(counts[block])
        if hourly == published[day]:
            matched += 1
        elif len(mismatches) < 6:
            mismatches.append({"day": day.isoformat(), "hourly_use_total": hourly,
                               "daily_rental_total": published[day]})
    reasons = []
    if absent:
        reasons.append(f"{len(absent)} hourly slots have no source rows; complete-year coverage gate failed.")
    if missing_daily:
        reasons.append(f"{len(missing_daily)} official daily date{'s are' if len(missing_daily) != 1 else ' is'} absent; independent full-year check failed.")
    if comparable != matched:
        reasons.append(f"{comparable-matched} of {comparable} comparable daily totals differ; hourly and daily measures do not reconcile.")
    return {"gate": "blocked" if reasons else "ready_for_fixed_evaluation", "reasons": reasons,
            "source": {k: spec[k] for k in ("id", "catalog_url", "publisher", "license", "license_url", "daily_catalog_url", "modifications")},
            "hourly": {**hourly_meta, "expected_hours": HOURS, "missing_hour_spans": missing_hours},
            "daily": {**daily_meta, "published_dates": len(published), "missing_dates": missing_daily,
                      "comparable_dates": comparable, "matched_dates": matched, "mismatched_dates": comparable-matched,
                      "mismatch_examples": mismatches, "unchecked_dates": unchecked},
            "model_evaluation": None,
            "warning": "Source compatibility failed before model scoring. No 2019 performance estimate is available. Different measures must not be presented as validation of the original hourly model."}


def report_path(root):
    return root / ("external-gate-" + bikes.digest(json.dumps(fingerprints(), sort_keys=True).encode())[:20] + ".json")


def run(archive, daily_dir, root=None):
    root = bikes.root_path(root)
    spec = source()
    destination = report_path(root)
    if destination.exists():
        if load(root)["status"] != "available":
            raise ValueError("Existing external gate report failed validation")
        return destination
    counts, present, hourly_meta = hourly_summary(archive, spec)
    published, daily_meta = daily_summary(daily_dir, spec)
    result = summarize(counts, present, published, hourly_meta, daily_meta, spec)
    result.update(schema_version=1, source_sha256=bikes.digest(bikes.resource("bike-external-source.json")),
                  code_sha256=fingerprints(), protocol=json.loads(bikes.resource("bike-external-protocol.json"))["id"])
    content = json.dumps(result, indent=2, sort_keys=True, allow_nan=False).encode()
    envelope = json.dumps({"sha256": bikes.digest(content), "report": result}, indent=2, sort_keys=True, allow_nan=False).encode()
    root.mkdir(parents=True, exist_ok=True)
    if bikes.storage_bytes(root) + len(envelope) > bikes.MAX_STORAGE:
        raise ValueError("Local bike storage budget reached")
    bikes.save_exclusive(destination, envelope)
    return destination


def load(root=None, *, public=False):
    if public:
        return {"status": "unavailable", "reason": "External bike-source audit is local-only."}
    path = report_path(bikes.root_path(root))
    if not path.exists():
        return {"status": "unavailable", "reason": "Run the explicit local external-source audit; no 2019 model score is claimed."}
    try:
        if path.is_symlink() or path.stat().st_size > bikes.MAX_BYTES:
            raise ValueError("Unsafe gate report")
        with path.open("rb") as stream:
            payload = stream.read(bikes.MAX_BYTES + 1)
        envelope = bikes.strict_json(payload)
        value = envelope["report"]
        content = json.dumps(value, indent=2, sort_keys=True, allow_nan=False).encode()
        if (bikes.digest(content) != envelope["sha256"] or value["schema_version"] != 1 or
                value["code_sha256"] != fingerprints() or value["source_sha256"] != bikes.digest(bikes.resource("bike-external-source.json")) or
                value["protocol"] != json.loads(bikes.resource("bike-external-protocol.json"))["id"] or
                value["model_evaluation"] is not None):
            raise ValueError("Gate provenance differs")
        return {**value, "status": "available", "report_sha256": envelope["sha256"]}
    except (ValueError, TypeError, KeyError, OSError):
        return {"status": "unavailable", "reason": "Saved external-source audit failed integrity/provenance checks."}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    action = parser.add_mutually_exclusive_group(required=True)
    action.add_argument("--run", action="store_true")
    action.add_argument("--inspect", action="store_true")
    parser.add_argument("--archive", type=Path)
    parser.add_argument("--daily-dir", type=Path)
    parser.add_argument("--root", type=Path)
    args = parser.parse_args()
    if args.run:
        if args.archive is None or args.daily_dir is None:
            parser.error("--run requires --archive and --daily-dir")
        print(run(args.archive, args.daily_dir, args.root))
    else:
        print(json.dumps(load(args.root), indent=2, allow_nan=False))


if __name__ == "__main__":
    main()
