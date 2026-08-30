# Hot-Folder Python Client

## Purpose

`python/telemetry_court_client.py` is a small standard-library helper for
notebook or script workflows that exchange files with the local Telemetry Court
Hot-Folder.

It supports two file-contract actions:

- write an already-approved, sanitized `CasePackage`-shaped object into the
  configured Hot-Folder;
- locate and read Telemetry Court `cluster_refinement.v0.1` JSON exports from
  that same local folder.

This helper does not generate embeddings, cluster data, run Toponymy,
DataMapPlot, UMAP, HDBSCAN, ACME4, naming, dimensionality reduction, or ingest
raw telemetry. It is not a full Python SDK and does not replace the TypeScript
`CasePackage` validator in the app.

## Configure The Hot-Folder

Use the same local directory configured for the app:

```bash
export TELEMETRY_COURT_HOT_FOLDER="/path/to/approved/local/hot-folder"
```

The path should point to a local handoff folder containing approved or
sanitized JSON artifacts only. Do not put raw telemetry, notebooks, parquet,
CSV, logs, or private working directories in the Hot-Folder.

The app's CasePackage scanner ignores supported
`cluster_refinement.v0.1` handoffs (and canonical
`*-cluster-refinement.json` export names), so placing a completed refinement
back into this shared folder does not create a false invalid-CasePackage
warning. The Python consumer remains responsible for validating that
refinement before upstream use.

## Write A CasePackage

In an approved upstream notebook or script, build or load a complete
`case_package.v0.1` object through the existing sanitized adapter path. Then
write it to the Hot-Folder:

```python
# Run with the repository's python/ directory on PYTHONPATH, or add that
# directory to sys.path in the approved notebook environment.
from telemetry_court_client import TelemetryCourtHotFolder

client = TelemetryCourtHotFolder.from_env()

case_package = {
    "schema_version": "case_package.v0.1",
    "package_id": approved_package_id,
    "case": {"case_id": approved_case_id},
    "cluster": {"cluster_id": approved_cluster_id},
    # Include the rest of the required CasePackage v0.1 fields from the
    # approved sanitized adapter output before writing.
}

plan = client.write_case_package(case_package, dry_run=True)
print(plan["path"])

result = client.write_case_package(case_package)
print(result["filename"])
```

The helper derives a deterministic visible `.json` filename from
`package_id` and `case.case_id`, writes UTF-8 JSON with stable formatting, and
uses a temporary file plus rename for the final write. Use `filename=...` only
for a visible top-level `.json` filename; path traversal and hidden filenames
are rejected.

The helper performs lightweight shape checks for `schema_version`,
`package_id`, `case.case_id`, and `cluster.cluster_id`. Telemetry Court still
performs the full runtime import validation when the app scans the Hot-Folder.

## Read Refinement Exports

After reviewers complete the Telemetry Court workflow and export a
`cluster_refinement.v0.1` JSON artifact back into the Hot-Folder, the upstream
notebook or script can locate and read it:

```python
from telemetry_court_client import TelemetryCourtHotFolder

client = TelemetryCourtHotFolder.from_env()

refinements = client.find_refinements(
    package_id=approved_package_id,
    case_id=approved_case_id,
    cluster_id=approved_cluster_id,
)

if refinements:
    refinement = client.read_refinement(refinements[0])
    prune_session_ids = refinement["prune_session_ids"]
```

`find_refinements` scans only top-level, non-hidden `.json` files and ignores
non-JSON files. It does not recurse. Results are newest-first by default with a
filename tiebreak for deterministic ordering.

`read_refinement` only accepts visible, regular, non-symlinked top-level JSON
files in the configured Hot-Folder. Reads are capped at 8 MiB, use a no-follow
file descriptor where the platform supports it, and verify that the opened
descriptor is still a regular file. Device, inode, size, modification time, and
change time must remain stable through the read, and the byte count must match
the final file size. Consumer-facing validation and folder errors omit supplied
unknown field names and configured absolute folder paths.

Before returning parsed Python data, the reader enforces the v0.1 consumer
boundary:

- exact schema, calculation, source-application, local format, CasePackage,
  review protocol, ReviewResult, and EvaluationReport compatibility versions;
- complete source review ID metadata with a matching positive `reviewer_count`;
- sorted, unique source, recommendation, and prune IDs;
- well-formed session exclusion, split, and merge recommendations that only
  reference the artifact's source reviews and cluster;
- `prune_session_ids` exactly derived from recommendations whose status is
  `recommended`.

A valid artifact may have empty `prune_session_ids`, `split_recommendations`,
and `merge_recommendations`. The reader accepts that exact no-action handoff;
the upstream consumer must preserve its provenance and make no dataset,
clustering, naming, or topology mutation. The TypeScript validator remains
canonical for non-actionable presentation metadata such as detailed
uncertainty and disagreement signals. `find_refinements` skips files that fail
the Python consumer checks. Upstream code remains responsible for deciding
whether and how to apply accepted pruning, split hints, or merge hints outside
Telemetry Court.

## Tests

Run the focused Python tests with:

```bash
python3 -m unittest discover -s python/tests -p "*_test.py"
```

When the repository's `tsx` dependency is installed, the suite also builds
artifacts through the canonical TypeScript exporter. It verifies both an
accepted actionable export and exact acceptance of a canonical no-action
export without adding or changing payload fields.
