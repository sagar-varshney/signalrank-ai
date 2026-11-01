# Local storage and retention

New demo output defaults to `~/.local/share/signalrank/demo`, outside Documents and Desktop. `SIGNALRANK_DATA_HOME` can select another absolute local path; otherwise an absolute `XDG_DATA_HOME` is respected. An explicit `--output` still overrides the default. No cloud-sync setting is changed, and custom paths may be synced by your own configuration.

New default history/receipt databases use the same application data home. If `artifacts/experiments.sqlite3` or `artifacts/batches.sqlite3` already exists in the current working directory, that existing database remains the default. Explicit `SIGNALRANK_HISTORY_PATH` and `SIGNALRANK_BATCH_PATH` take precedence. Existing files are never relocated, merged or deleted automatically. Keep using your established environment; create future Python environments and dependency caches outside synced folders too.

The demo reuses the newest compatible completed run in its output root. Reuse checks configuration, current code hashes, runtime, file checksums and completed status through the existing trusted-local loader. The output root is an explicit trust boundary: use only your own locally generated artifacts, because joblib can execute code. `--retrain` explicitly starts a new execution. The offline training CLI continues to record every requested training execution separately.

```sh
python -m signalrank.demo --no-serve
# Repeat: reuse the same compatible run without another training execution.
python -m signalrank.demo --no-serve
# Explicitly request a fresh execution:
python -m signalrank.demo --retrain --no-serve
```

The new default is a different location from historical checkout-local demo output. To inspect/reuse an old root, pass its exact path with `--output`. Changes to fingerprinted training code require one new compatible run; old artifacts remain intact and can be opened using their original checkout/environment.

## Inspect and preview first

```sh
python -m signalrank.storage
python -m signalrank.storage --root /absolute/local/artifact-root --keep 3 --write-plan /absolute/local/retention-plan.json
```

The command scans only that root, reports logical file bytes and lists retention decisions. It does not inspect iCloud quota, scan home, load model pickle, download data or delete anything. Environment/dependency sizes, other artifact roots and symlink targets are outside this measurement. A new plan file is created exclusively and cannot overwrite an existing file.

Only recognized completed UUID run directories containing exactly the six expected files are eligible. The newest `--keep` completed runs (at least one), `selection.json`'s run and artifacts named in the current shell's trusted-model variables are retained. Incomplete/failed runs, unknown files, symlinks, databases and environments are retained. An active server in another process is not discoverable through the shell's environment; stop **all** servers/writers using the root before applying cleanup. The demo writes a selected-run pointer to protect its most recently prepared model.

## Apply an explicitly reviewed plan

After reviewing the JSON's root and exact candidate list, a local operator can run:

```sh
python -m signalrank.storage --apply-plan /absolute/local/retention-plan.json
```

This **permanently removes only the listed run directories**. It recomputes retention and checks the complete plan before deletion; changed run membership, retention or file size/mtime/inode metadata blocks a stale plan. It does not provide adversarial tamper protection or a transaction against concurrent filesystem writers. An I/O failure may leave partial cleanup; inspect again rather than retrying the old plan blindly.

SQLite snapshots and batch receipts remain readable, but a removed model run cannot be reloaded. Back up any model needed for reproducing an archived receipt. Deleting selected models in other processes is prevented operationally by stopping writers and reviewing the plan, not by a global process registry. No scheduled cleanup or browser deletion endpoint exists. Logical bytes removed are not a guarantee of reclaimed physical disk or iCloud quota.

The local Evidence page shows the current artifact root's inventory, retaining three newest and selected/trusted runs. Public mode returns no paths, run inventory or cleanup data. No cleanup was applied as part of introducing this feature.
