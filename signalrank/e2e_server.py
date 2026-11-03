"""Isolated loopback server for real-browser integration tests, not deployment."""
from pathlib import Path
import os
import tempfile

import uvicorn

from signalrank.core import TrainingConfig
from signalrank.demo import prepare


def main():
    from signalrank import api, bikes
    import math
    from datetime import datetime, timedelta
    start = datetime(2017,12,1,tzinfo=bikes.TZ)
    rows = [{"at": start+timedelta(hours=i), "count": int(200+200*(1+math.sin(2*math.pi*(i%24)/24))+100*((i//24)%7))} for i in range(8760)]
    fixture = bikes.evaluate(rows, fixture=True)
    fixture.update(status="available", source={"title":"Original fictional bike fixture","dataset_url":"#bikes","doi":"#bikes","license_url":"#bikes","license":"Original fixture"},
                   attribution="Original fictional test fixture. No real-data metrics or third-party dataset.", warning="Original fictional fixture for browser integration; not measured real-data performance.",
                   dataset_sha256="0"*64, report_sha256="1"*64, runtime={"scope":"test fixture"})
    original = api.load_bike_report
    api.load_bike_report = lambda root=None, public=False: original(root,public=True) if public else fixture
    with tempfile.TemporaryDirectory(prefix="signalrank-browser-") as folder:
        prepare(TrainingConfig(count=1800), Path(folder))
        if os.environ.get("SIGNALRANK_E2E_PUBLIC") == "1":
            os.environ["SIGNALRANK_PROFILE"] = "public"
            os.environ["SIGNALRANK_ALLOWED_HOSTS"] = "127.0.0.1,localhost"
        uvicorn.run("signalrank.api:app", host="127.0.0.1", port=8026, log_level="warning")


if __name__ == "__main__":
    main()
