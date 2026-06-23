# Pruning recipe export

Status: planned

## Validation outcome

The results view can export a separate `cluster_refinement.json` artifact that
turns human review aggregation into actionable upstream pruning, split, merge,
and rerun recommendations.

## Why this matters

The value of a Topological Cluster Refiner is not only proving whether a label
was supported. It must close the loop with data-science pipelines by producing a
small, auditable configuration that notebooks or Python scripts can load before
the next Toponymy/HDBSCAN iteration.

## Contract impact

- CasePackage: provides stable package, cluster, session, neighbor-cluster, and
  pipeline references used by the refinement export.
- ReviewResult: contributes selected outlier/impostor session IDs, verdicts,
  recommended actions, failure modes, and reviewer/session provenance.
- EvaluationReport: contributes compatible aggregation context, denominators,
  and disagreement signals; remains the metrics export rather than the action
  recipe itself.

## Scope

### In scope

- Define the first documented `cluster_refinement.json` schema and calculation
  version.
- Include package, cluster, pipeline, source review, and generated-at metadata.
- Include session exclusion IDs for human-approved outliers or impostors.
- Include split recommendations, merge recommendations, uncertainty markers,
  reviewer counts, and disagreement/unavailable reasons where applicable.
- Add an export button on the results view alongside existing JSON/CSV report
  exports.
- Add tests for deterministic export ordering, incomplete or disputed reviews,
  and unsupported/missing action signals.

### Out of scope

- SIEM/SOC/dashboard behavior.
- Raw telemetry ingestion or search.
- Generic CRUD, auth, or speculative database work.
- Running or tuning HDBSCAN/UMAP/Toponymy inside the app.
- Replacing `ReviewResult` or `EvaluationReport`.
- Claiming automated consensus or correctness from human disagreement.

## Evidence and provenance impact

The export must include enough stable IDs and calculation metadata for an
upstream notebook to apply changes and for reviewers to audit why a session,
split, or merge recommendation was included. It must not copy raw telemetry or
resolve safe references.

## Acceptance criteria

- [ ] The change advances evidence-based validation of AI-generated cluster interpretations.
- [ ] `cluster_refinement.json` has a documented schema version and calculation version.
- [ ] The export includes stable package, cluster, pipeline, source review, session, and neighbor-cluster references where available.
- [ ] Session exclusions are derived only from human review decisions, not inferred from UI position or model scores alone.
- [ ] Split and merge recommendations preserve reviewer counts, disagreement, uncertainty, and unavailable states.
- [ ] The results view exposes the export without removing existing EvaluationReport JSON/CSV downloads.
- [ ] Current and target capabilities are not conflated; the export is a local artifact for upstream consumers, not an in-app clustering engine.
- [ ] `npm test`, `npm run lint`, and `npm run build` pass.

## Required checks

- [ ] `npm test`
- [ ] `npm run lint`
- [ ] `npm run build`

## Work type

- [ ] `AFK`
- [x] `human-in-the-loop`

## Blocked by

Milestone 3 local/imported ReviewResult aggregation foundations and product approval of the first `cluster_refinement.json` schema.
