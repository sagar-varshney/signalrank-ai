FROM python:3.13.7-slim AS build
ENV UV_PROJECT_ENVIRONMENT=/opt/venv PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 OMP_NUM_THREADS=1 OPENBLAS_NUM_THREADS=1 MKL_NUM_THREADS=1
WORKDIR /app
RUN pip install --no-cache-dir uv==0.12.23
COPY pyproject.toml uv.lock ./
COPY signalrank/*.py ./signalrank/
COPY deploy/synthetic-sources.json ./signalrank/sources.json
COPY signalrank/static/*.html signalrank/static/*.css signalrank/static/*.js ./signalrank/static/
COPY signalrank/static/react/experiments.js signalrank/static/react/experiments.css signalrank/static/react/THIRD-PARTY-NOTICES.txt ./signalrank/static/react/
RUN uv sync --locked --no-dev --python /usr/local/bin/python
RUN /opt/venv/bin/python -m signalrank.release build --output /app/demo-artifact

FROM python:3.13.7-slim AS runtime
ENV PATH=/opt/venv/bin:$PATH PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 SIGNALRANK_PROFILE=public PORT=10000 OMP_NUM_THREADS=1 OPENBLAS_NUM_THREADS=1 MKL_NUM_THREADS=1
WORKDIR /app
COPY --from=build /opt/venv /opt/venv
COPY --from=build /app/signalrank /app/signalrank
COPY --from=build /app/demo-artifact/runs /app/demo-artifact/runs
COPY --from=build /app/demo-artifact/selection.json /app/demo-artifact/selection.json
RUN useradd --uid 10001 --no-create-home --shell /usr/sbin/nologin signalrank
USER 10001
EXPOSE 10000
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 CMD python -c "import os, urllib.request; req=urllib.request.Request('http://127.0.0.1:'+os.environ.get('PORT','10000')+'/api/health',headers={'Host':os.environ.get('RENDER_EXTERNAL_HOSTNAME') or os.environ['SIGNALRANK_ALLOWED_HOSTS'].split(',')[0]}); urllib.request.urlopen(req,timeout=4).read()"
CMD ["python", "-m", "signalrank.release", "serve"]
