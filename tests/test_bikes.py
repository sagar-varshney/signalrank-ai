import csv
from datetime import datetime, timedelta
import io
import json
import math
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import numpy as np
from signalrank import bikes


def fixture_rows():
    start = datetime(2017,12,1,tzinfo=bikes.TZ)
    return [{"at":start+timedelta(hours=i),"count":int(200+200*(1+math.sin(2*math.pi*(i%24)/24))+100*((i//24)%7))} for i in range(8760)]


def csv_payload(rows):
    output=io.StringIO()
    fields=sorted(bikes.SOURCE_FIELDS)
    writer=csv.DictWriter(output,fieldnames=fields)
    writer.writeheader()
    for row in rows:
        value={name:"unused" for name in fields}
        value.update(Date=row["at"].strftime("%d/%m/%Y"),Hour=row["at"].hour,**{"Rented Bike Count":row["count"]})
        writer.writerow(value)
    return output.getvalue().encode("utf-8")


class BikeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.rows=fixture_rows()
        cls.report=bikes.evaluate(cls.rows,fixture=True)

    def test_contract_rejects_schema_duplicates_gaps_missing_values_and_bad_counts(self):
        self.assertEqual(len(bikes.parse_csv(csv_payload(self.rows))),8760)
        for rows in [self.rows[:10]+self.rows[11:], self.rows[:10]+[self.rows[9]]+self.rows[10:],
                     [{**self.rows[0],"count":-1},*self.rows[1:]]]:
            with self.assertRaises(ValueError): bikes.parse_csv(csv_payload(rows))
        value=csv_payload(self.rows[:2]).decode().replace("Date,","Date,Date,",1)
        with self.assertRaises(ValueError): bikes.parse_csv(value.encode(),complete=False)
        with self.assertRaises(ValueError): bikes.parse_csv(b"Date,Hour\n01/12/2017,0\n")

    def test_features_use_only_history_and_known_calendar(self):
        before=bikes.examples(self.rows)[0]
        changed=[dict(r) for r in self.rows]
        changed[192]["count"]+=9000
        after=bikes.examples(changed)[0]
        np.testing.assert_array_equal(before["x"],after["x"])
        self.assertNotEqual(before["count"],after["count"])
        self.assertEqual(before["target_at"]-before["at"],timedelta(hours=24))
        self.assertEqual(before["x"][0],self.rows[168]["count"])
        self.assertEqual(before["x"][3],self.rows[24]["count"])

    def test_purge_and_target_threshold_are_past_only(self):
        groups,purged=bikes.partitions(bikes.examples(self.rows))
        self.assertGreater(purged,0)
        for earlier,later in zip(list(groups),list(groups)[1:]):
            self.assertLess(groups[earlier][-1]["target_at"],groups[later][0]["at"])
        threshold=int(np.quantile([r["count"] for r in groups["train"]],.8,method="higher"))
        self.assertEqual(self.report["threshold"],threshold)
        changed=[dict(r) for r in self.rows]
        changed[-1]["count"]+=5000
        result=bikes.evaluate(changed,fixture=True)
        self.assertEqual(result["threshold"],threshold)
        np.testing.assert_array_equal([r["logistic"] for r in self.report["timeline"]],[r["logistic"] for r in result["timeline"]])

    def test_budget_probability_calibration_and_explanation_accounting(self):
        for rows in self.report["comparisons"].values():
            self.assertEqual(len(rows),5)
            for row in rows:
                self.assertEqual(row["captured"]+row["missed"],row["positives"])
                self.assertEqual(row["captured"]+row["selected_negatives"],row["budget"])
                self.assertTrue(0<=row["average_precision"]<=1)
            self.assertIsNone(next(r for r in rows if r["id"]=="weekly")["brier_score"])
        self.assertEqual(sum(r["count"] for r in self.report["calibration"]["logistic"]),self.report["partitions"]["final"]["count"])
        for error in self.report["errors"]:
            self.assertAlmostEqual(error["intercept"]+sum(r["value"] for r in error["factors"]),error["logit"],places=10)
            self.assertEqual(len(error["factors"]),len(bikes.FEATURES))

    def test_class_deficient_partition_is_not_repaired(self):
        with self.assertRaisesRegex(ValueError,"Class-deficient"):
            bikes.evaluate([{**r,"count":1} for r in self.rows],fixture=True)

    def test_saved_report_reuses_without_fitting_and_corruption_fails_closed(self):
        payload=csv_payload(self.rows)
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            spec={**bikes.source(),"csv_sha256":bikes.digest(payload)}
            (root/spec["csv_name"]).write_bytes(payload)
            with patch("signalrank.bikes.source",return_value=spec):
                path=bikes.run(root)
                saved=bikes.load_report(root)
                self.assertEqual(saved["status"],"available")
                with patch("signalrank.bikes.evaluate",side_effect=AssertionError("must not fit")):
                    self.assertEqual(bikes.run(root),path)
                    self.assertEqual(bikes.load_report(root)["status"],"available")
                value=json.loads(path.read_text())
                value["report"]["threshold"]+=1
                path.write_text(json.dumps(value))
                self.assertEqual(bikes.load_report(root)["status"],"unavailable")

    def test_public_mode_never_reads_local_source_or_protocol(self):
        with patch("signalrank.bikes.resource",side_effect=AssertionError("no source reads")):
            result=bikes.load_report(public=True)
        self.assertEqual(result["status"],"unavailable")

    def test_wrong_checksum_blocks_before_fitting_or_network(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            (root/bikes.source()["csv_name"]).write_bytes(b"changed")
            with patch("signalrank.bikes.evaluate",side_effect=AssertionError("must not fit")),patch("signalrank.bikes.build_opener",side_effect=AssertionError("no download")),self.assertRaises(ValueError):
                bikes.run(root)


    def test_explicit_fetch_rejects_oversized_response_before_body_read(self):
        from unittest.mock import MagicMock
        response=MagicMock()
        response.headers={"Content-Length":str(bikes.MAX_BYTES+1)}
        opener=MagicMock()
        opener.open.return_value.__enter__.return_value=response
        with tempfile.TemporaryDirectory() as directory, patch("signalrank.bikes.build_opener",return_value=opener), self.assertRaises(ValueError):
            bikes.acquire(directory)
        response.read.assert_not_called()

    def test_storage_cap_prevents_new_fitting(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            payload=csv_payload(self.rows)
            (root/bikes.source()["csv_name"]).write_bytes(payload)
            spec={**bikes.source(),"csv_sha256":bikes.digest(payload)}
            with patch("signalrank.bikes.source",return_value=spec),patch("signalrank.bikes.storage_bytes",return_value=bikes.MAX_STORAGE),patch("signalrank.bikes.evaluate",side_effect=AssertionError("must not fit")),self.assertRaises(ValueError):
                bikes.run(root)


    def test_web_requests_only_read_saved_evidence_and_public_short_circuits(self):
        from fastapi.testclient import TestClient
        from signalrank.api import app
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder)
            env={"SIGNALRANK_PROFILE":"local","SIGNALRANK_TRUSTED_MODEL_DIR":"","SIGNALRANK_TRUSTED_MODEL_DIRS":"","SIGNALRANK_HISTORY_PATH":str(root/"history.sqlite3"),"SIGNALRANK_BATCH_PATH":str(root/"batches.sqlite3"),"SIGNALRANK_BIKE_ROOT":str(root/"bikes")}
            with patch.dict("os.environ",env),TestClient(app) as client,patch("signalrank.bikes.evaluate",side_effect=AssertionError("no fitting")),patch("signalrank.bikes.acquire",side_effect=AssertionError("no download")):
                self.assertEqual(client.get("/api/bikes").json()["status"],"unavailable")
                self.assertEqual(client.get("/api/bikes/audit").json()["status"],"unavailable")
                self.assertEqual(client.get("/api/bikes/external").json()["status"],"unavailable")
                self.assertEqual(client.get("/api/bikes/export").status_code,409)
                self.assertEqual(client.post("/api/bikes").status_code,405)
                self.assertFalse((root/"bikes").exists())
