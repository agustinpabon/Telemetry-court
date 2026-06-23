# Cluster Refinement Handoff

## Purpose

`cluster_refinement.v0.1` is a Telemetry Court export for upstream consumers.
Telemetry Court derives it from compatible human `ReviewResultV01` artifacts
and the matching `EvaluationReportV01` context, then the upstream notebook or
pipeline consumes it outside Telemetry Court.

The artifact is a reviewer-derived refinement recipe. It is not a new producer
schema, not a CasePackage, and not an executable clustering command. The
producer draft shape remains defined by
[`SANITIZED_ADAPTER_INPUT_CONTRACT.md`](./SANITIZED_ADAPTER_INPUT_CONTRACT.md).

## Boundary

Telemetry Court exports the recipe and preserves review evidence about why the
recipe exists. It does not rerun clustering, embeddings, UMAP, HDBSCAN,
Toponymy, DataMapPlot, ACME4, notebooks, or any telemetry-processing pipeline.

The upstream environment owns:

- reading the exported refinement artifact;
- deciding whether the review signals justify pruning, split analysis, merge
  comparison, or a rerun;
- applying `prune_session_ids` to the upstream working set;
- rerunning embedding, clustering, naming, projection, evidence extraction, and
  package production outside Telemetry Court;
- producing the next approved sanitized draft or `CasePackageV01` iteration
  through the existing adapter path.

## Operator Steps

Before using a refinement export upstream:

1. Verify `schema_version` is exactly `cluster_refinement.v0.1`.
2. Verify `calculation_version` is compatible with the intended consumer.
3. Preserve `refinement_id`, `source_review_ids`, and `source_reviews` in
   downstream notes or provenance.
4. Inspect `session_exclusion_recommendations` before pruning. Check
   `selected_count`, `qualifying_review_count`, `reviewer_count`,
   `source_review_ids`, `qualifying_source_review_ids`, signals, and
   disagreement state.
5. Inspect `uncertainty` and top-level `disagreement` before treating any
   pruning, split, or merge hint as strong evidence.
6. Apply `prune_session_ids` only in the upstream notebook or pipeline. These
   IDs are the sorted session exclusions that Telemetry Court marked
   `recommended`.
7. Treat `split_recommendations` as hints that the upstream pipeline may need
   sub-clustering, parameter adjustment, or evidence-package revision. They are
   not executable split commands.
8. Treat `merge_recommendations` as hints that the upstream pipeline may need
   comparison with neighboring clusters. In v0.1, merge targets may be
   explicitly unavailable and must not be inferred from map proximity alone.
9. Preserve uncertainty and reviewer disagreement in downstream notes. A valid
   single-review artifact can be useful, but it cannot establish reviewer
   agreement.
10. Rerun upstream processing outside Telemetry Court if the operator decides a
    rerun is warranted.
11. Produce the next approved sanitized draft and mapped `CasePackageV01`
    iteration through the existing sanitized adapter mapper and CLI when the
    revised cluster should return for review.

## Safety Posture

No raw telemetry belongs in this repository. Do not commit generated
CasePackages, ReviewResults, EvaluationReports, cluster refinement artifacts,
sanitized drafts, or upstream notebook outputs publicly unless the exact
artifact and target environment have explicit approval.

Generated artifacts may be safe for one intended review environment without
being safe for public release. Treat approval scope, data classification, safe
references, and storage location as part of the handoff, not as incidental
metadata.

Use placeholder filenames such as `<cluster-refinement-export.json>`,
`<approved-sanitized-draft.json>`, and `<case-package-v0.1.json>` in public
documentation. Keep real artifact names and locations inside the approved
environment.

## Return Path

After upstream refinement, the next reviewable artifact should follow the
existing producer path:

```text
upstream rerun outside Telemetry Court
-> approved sanitized draft
-> sanitized adapter mapper or CLI
-> validated CasePackageV01
-> Telemetry Court review
-> ReviewResult / EvaluationReport / cluster_refinement.v0.1 export
```

Do not duplicate or redefine the sanitized adapter input schema in this handoff.
Use [`SANITIZED_ADAPTER_INPUT_CONTRACT.md`](./SANITIZED_ADAPTER_INPUT_CONTRACT.md)
for producer draft shape and
[`NOTEBOOK_HANDOFF_CHECKLIST.md`](./NOTEBOOK_HANDOFF_CHECKLIST.md) for the
producer-side notebook or script checklist.

## Non-Goals

This handoff does not add or authorize:

- new notebooks;
- new fixtures or public generated packages;
- fake CasePackages, ReviewResults, EvaluationReports, reviewers, or pilot
  results;
- fake topology coordinates or public dataset artifacts;
- raw telemetry examples or restricted records;
- in-app Toponymy, DataMapPlot, UMAP, HDBSCAN, ACME4, clustering, embedding,
  dimensionality-reduction, naming, or telemetry-processing execution;
- app, UI, runtime, package, dependency, configuration, or build-setting
  changes.
