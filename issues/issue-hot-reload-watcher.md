# Issue: Local Directory Watcher (Hot-Folder Daemon)

Type: AFK
Status: active
Priority: p0
Milestone: Milestone 4

## Validation outcome
Provides a local directory-watcher daemon (via a Next.js dev API route or SSE watcher) that dynamically scans a configured local directory (`/tmp/telemetry-court-hotfolder/`), validates incoming packages, and pushes updates to the frontend in real-time via WebSockets or Server-Sent Events (SSE).

## Why this matters
To avoid the friction of drag-and-dropping files. When a python notebook produces a case package, writing it to this folder should instantly make it available for review in the web UI.

## Contract impact
- **CasePackage**: No schema change, but packages loaded from the hot-folder must pass strict validation.
- **ReviewResult**: Once the review is completed, the resulting JSON is written back to the same hot-folder with a suffix (e.g. `_review.json`).
- **EvaluationReport**: No impact.

## Scope

### In scope
- Configure a local folder path to watch (default: `/tmp/telemetry-court-hotfolder/`).
- Set up a directory watcher (using `chokidar` or Node's native `fs.watch`) running inside the Next.js local server context.
- Implement an SSE (Server-Sent Events) or WebSocket route (e.g. `/api/v1/watch`) to notify the React frontend when a new package is written, modified, or deleted.
- Auto-refresh the UI list or case switcher when a notification is received.

### Out of scope
- Running on a remote hosted server (this daemon is strictly for localhost/local development).
- Storing files in a central database (uses local file-system only).
- Raw log ingestion.

## Evidence and provenance impact
Preserves package provenance: cases loaded via the watcher contain exactly the same metadata.

## Acceptance criteria
- [ ] The watcher runs locally alongside the Next.js dev server (`npm run dev`).
- [ ] Copying a valid `CasePackage` JSON to `/tmp/telemetry-court-hotfolder/` triggers an immediate SSE/WebSocket push to the UI.
- [ ] The frontend dynamically adds the new package to the dropdown/case switcher without a hard page reload.
- [ ] Submitting a verdict in the UI writes the `ReviewResult` and `cluster_refinement` JSON files back to the same directory under matching names (e.g. `case-123_refinement.json`).
- [ ] Deleted packages from the folder are automatically removed from the dropdown list.

## Required checks
- [ ] `npm test`
- [ ] `npm run lint`
- [ ] `npm run build`

## Work type
- [x] `AFK`
- [ ] `human-in-the-loop`

## Blocked by
None.
