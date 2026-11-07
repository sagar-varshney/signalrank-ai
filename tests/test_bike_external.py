from datetime import date, timedelta
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
from zipfile import ZipFile

from signalrank import bike_external as external, bikes


class ExternalSourceGateTests(unittest.TestCase):
    def test_hourly_contract_accepts_mixed_member_order_and_stable_month_keys(self):
        header = ','.join(external.HOURLY_FIELDS)
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'source.zip'
            with ZipFile(path, 'w') as zipped:
                for month in reversed(range(1, 13)):
                    row = f'2019-{month:02d}-01,0,1,Station,regular,,adult,2,0,0,0,0'
                    zipped.writestr(f'Seoul_19.{month:02d}.csv', header + '\n' + row + '\n')
            spec = {'archive_bytes': path.stat().st_size, 'archive_sha256': bikes.digest(path.read_bytes())}
            counts, present, metadata = external.hourly_summary(path, spec)
            self.assertEqual(sum(present), 12)
            self.assertEqual(sum(counts), 24)
            self.assertEqual(set(metadata['monthly_inputs']), {str(month) for month in range(1, 13)})

    def test_missing_hours_and_daily_disagreement_block_before_any_model_score(self):
        counts = [2] * external.HOURS
        present = [True] * external.HOURS
        absent = (date(2019, 8, 28) - external.YEAR_START).days * 24
        present[absent:absent + 24] = [False] * 24
        published = {external.YEAR_START + timedelta(days=i): 48 for i in range(365)}
        del published[date(2019, 9, 7)]
        published[date(2019, 1, 1)] = 49
        result = external.summarize(counts, present, published, {'raw_rows': 12}, {}, external.source())
        self.assertEqual(result['gate'], 'blocked')
        self.assertEqual(result['hourly']['missing_hour_spans'][0]['hours'], 24)
        self.assertEqual(result['daily']['missing_dates'], ['2019-09-07'])
        self.assertEqual(result['daily']['mismatched_dates'], 1)
        self.assertIsNone(result['model_evaluation'])

    def test_saved_gate_report_is_read_only_and_fails_closed_on_tamper(self):
        counts = [0] * external.HOURS
        present = [True] * external.HOURS
        published = {external.YEAR_START + timedelta(days=i): 0 for i in range(365)}
        result = external.summarize(counts, present, published, {'monthly_inputs': {'1': {'rows': 1}}}, {}, external.source())
        result.update(schema_version=1, source_sha256=bikes.digest(bikes.resource('bike-external-source.json')),
                      code_sha256=external.fingerprints(), protocol=json.loads(bikes.resource('bike-external-protocol.json'))['id'])
        content = json.dumps(result, indent=2, sort_keys=True, allow_nan=False).encode()
        with tempfile.TemporaryDirectory() as folder:
            path = external.report_path(Path(folder))
            path.write_text(json.dumps({'sha256': bikes.digest(content), 'report': result}, indent=2, sort_keys=True, allow_nan=False))
            self.assertEqual(external.load(folder)['status'], 'available')
            value = json.loads(path.read_text())
            value['report']['daily']['matched_dates'] = 1
            path.write_text(json.dumps(value))
            self.assertEqual(external.load(folder)['status'], 'unavailable')

    def test_daily_contract_reads_csv_and_xlsx_even_when_catalog_extension_differs(self):
        with tempfile.TemporaryDirectory() as folder:
            directory = Path(folder)
            daily_files = {}
            for seq, day in ((8, date(2019, 1, 1)), (9, date(2019, 4, 1)),
                             (10, date(2019, 6, 1)), (19, date(2019, 12, 1))):
                kind = 'csv' if seq == 8 else 'xlsx'
                path = directory / f'signalrank-seoul-daily-2019-seq{seq}.{kind}'
                if kind == 'csv':
                    path.write_bytes(('대여일자,대여건수\n' + day.isoformat() + ',12\n').encode('cp949'))
                else:
                    labels = ('대여일자', '대여건수') if seq == 9 else ('대여일시', '대여건수')
                    shared = '<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' + ''.join(f'<si><t>{label}</t></si>' for label in labels) + '</sst>'
                    serial = (day - date(1899, 12, 30)).days
                    sheet = '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c></row>' + f'<row r="2"><c r="A2"><v>{serial}</v></c><c r="B2"><v>12</v></c></row></sheetData></worksheet>'
                    with ZipFile(path, 'w') as zipped:
                        zipped.writestr('xl/sharedStrings.xml', shared)
                        zipped.writestr('xl/worksheets/sheet1.xml', sheet)
                daily_files[str(seq)] = {'kind': kind, 'bytes': path.stat().st_size, 'sha256': bikes.digest(path.read_bytes())}
            values, metadata = external.daily_summary(directory, {'daily_files': daily_files})
            self.assertEqual(len(values), 4)
            self.assertEqual(values[date(2019, 12, 1)], 12)
            self.assertEqual(metadata['daily_file_dates']['19'], 1)

    def test_public_boundary_precedes_any_resource_or_path_read(self):
        with patch('signalrank.bike_external.bikes.resource', side_effect=AssertionError('no local reads')):
            self.assertEqual(external.load(public=True)['status'], 'unavailable')
