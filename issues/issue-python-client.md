# Issue: Companion Python Client (Jupyter Integration)

Type: AFK
Status: active
Priority: p0
Milestone: Milestone 4

## Validation outcome
Delivers a lightweight Python module `telemetry_court_client.py` that can be imported inside Jupyter notebooks. It formats cluster/label outputs into the sanitized case package contract, writes them to the local hot-folder, and provides helper functions to await and load the exported refinement JSON files directly into Pandas DataFrames.

## Why this matters
To bridge the gap between Python (where Toponymy runs) and Next.js (where the review happens) without the analyst needing to manually handle files.

## Contract impact
- **CasePackage**: The Python client must construct CasePackages that strictly comply with `CasePackageV01`.
- **ReviewResult**: The Python client will read the exported `ReviewResult` / `cluster_refinement` JSON files.
- **EvaluationReport**: No impact.

## Scope

### In scope
- A standalone `telemetry_court_client.py` file placed in the repository (or local workspace) for easy copying.
- A Python class `TelemetryCourt` that takes cluster details, labels, and evidence, and formats them into a valid `CasePackage` dictionary.
- Methods:
  - `tc.review(package)`: writes package JSON to the hot-folder.
  - `tc.get_refinement(package_id)`: reads the generated refinement JSON file from the hot-folder.
  - `tc.get_pruned_sessions(package_id)`: returns a list of session IDs recommended for pruning.

### Out of scope
- Publishing a package on PyPI (for now, local module is enough).
- Running a separate Python server (it runs strictly client-side inside the user's Jupyter process).

## Evidence and provenance impact
Preserves the audit trail by carrying forward the `refinement_id` and `source_review_ids` into subsequent iterations.

## Acceptance criteria
- [ ] A Python user can run `import telemetry_court_client as tc` inside a notebook.
- [ ] Calling `tc.review(package)` generates a valid JSON file in the hot-folder directory.
- [ ] The generated package successfully passes Next.js package validation checks.
- [ ] Awaiting refinement results (e.g. `tc.wait_for_refinement(package_id)`) block the execution loop until the refinement JSON is detected on disk.
- [ ] The client successfully parses the refinement output and extracts lists of session IDs to prune or split.

## Required checks
- [ ] `npm test` (verify typescript validation rules are unaffected)
- [ ] Run basic Python linting/smoke test on the script

## Work type
- [x] `AFK`
- [ ] `human-in-the-loop`

## Blocked by
- `issues/issue-hot-reload-watcher.md`
