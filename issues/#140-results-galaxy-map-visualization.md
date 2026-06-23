# Results galaxy map visualization

Status: planned

## Validation outcome

Reviewers can inspect aggregated human verdicts over the same approved cluster
topology that came from an imported CasePackage, making support, uncertainty,
impurity, split, and merge signals spatially visible on `/results`.

## Why this matters

Telemetry Court should not be a text-only report viewer. Toponymy-style
workflows need to know where human judgments land in the UMAP/HDBSCAN/DataMapPlot
structure so upstream data scientists can identify coherent regions, boundary
failures, noisy sessions, and split or merge candidates.

## Contract impact

- CasePackage: uses package-provided `cluster.embedding_map` and related
  representative-session or neighbor metadata when available; must not invent
  projection coordinates.
- ReviewResult: reads existing verdict, selected label, failure-mode,
  recommended-action, and selected-session decisions without changing the
  review result schema.
- EvaluationReport: uses existing aggregation signals to derive visual status;
  does not replace JSON/CSV report export.

## Scope

### In scope

- Reuse or adapt `TelemetryGalaxy` / `EvidenceGalaxyAtlas` on the `/results`
  route.
- Render imported/local CasePackage coordinate metadata where it exists and show
  a loud unavailable state where required map metadata is absent.
- Color or otherwise encode nodes by aggregated verdict status, including
  supported, unsupported or overclaimed, uncertain, cluster impure, needs split,
  and needs merge.
- Use restrained semantic treatments such as supported green, unsupported red,
  uncertain neutral, and needs-split or impure orange/striped states without
  introducing cyber-dashboard styling.
- Preserve exact CasePackage-reference compatibility for result aggregation.
- Keep the visualization local and package-boundary based, without resolving
  raw telemetry references.
- Add tests for available coordinates, missing coordinates, and status encoding.

### Out of scope

- SIEM/SOC/dashboard behavior.
- Raw telemetry ingestion or search.
- Generic CRUD, auth, or speculative database work.
- Running Toponymy, HDBSCAN, UMAP, or DataMapPlot inside Telemetry Court.
- Creating new synthetic verdicts or fabricating projection data.

## Evidence and provenance impact

The map may display only approved package metadata and aggregate reviewer
signals. It must preserve stable package, cluster, session, evidence, and review
IDs so users can audit which human results produced each visual status.

## Acceptance criteria

- [ ] The change advances evidence-based validation of AI-generated cluster interpretations.
- [ ] The `/results` page renders a galaxy/topology map when compatible imported or local package coordinate metadata is available.
- [ ] Verdict aggregation status is visually encoded without hiding uncertainty or incomplete judgments.
- [ ] Missing coordinates, missing compatible results, or incompatible package references fail visibly instead of falling back to fake positions.
- [ ] Contract separation is preserved: CasePackage supplies topology, ReviewResult supplies human decisions, and EvaluationReport supplies aggregation.
- [ ] Current and target capabilities are not conflated; the UI does not claim real Toponymy/DataMapPlot execution.
- [ ] Desktop and mobile layouts remain usable without horizontal overflow.
- [ ] `npm test`, `npm run lint`, and `npm run build` pass.

## Required checks

- [ ] `npm test`
- [ ] `npm run lint`
- [ ] `npm run build`

## Work type

- [ ] `AFK`
- [x] `human-in-the-loop`

## Blocked by

Milestone 3 local import and local/imported ReviewResult aggregation foundations.
