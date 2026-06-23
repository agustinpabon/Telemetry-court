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

## Reference External Consumer Pattern

This pattern is for upstream notebook or pipeline authors. It is documentation
guidance only; it is not a Telemetry Court script, notebook, fixture, or data
artifact.

### Expected Input

- A Telemetry Court `cluster_refinement.v0.1` export already loaded into the
  upstream environment.
- An upstream-owned sanitized session table, working set, or draft object held
  outside Telemetry Court.

### Expected Output

- A pruned or refined upstream draft, or the next `CasePackageV01` candidate,
  generated outside Telemetry Court.
- Refinement provenance that preserves the Telemetry Court source references
  and records what the upstream consumer did with the recommendation.

### Minimal Validation Behavior

The consumer should reject or explicitly stop before pruning when:

- `schema_version` is missing or is not exactly `cluster_refinement.v0.1`;
- required fields such as `refinement_id`, `source_review_ids`,
  `prune_session_ids`, `split_recommendations`, `merge_recommendations`,
  `uncertainty`, or `disagreement` are missing;
- `prune_session_ids` contains duplicate IDs;
- the upstream session table or draft object does not expose a stable
  `session_id` field;
- every refinement signal is empty and the export is effectively a no-op.

The consumer should report, without failing the whole handoff by default, when
one or more `prune_session_ids` are not found in the upstream table or draft.
Those IDs should be preserved in the consumer output provenance so the mismatch
can be audited.

`split_recommendations` and `merge_recommendations` must be copied forward as
analyst hints. They are not executable actions, and this handoff must not
automatically split, merge, recluster, rename, or rerun anything inside
Telemetry Court.

### Provenance Behavior

The consumer output or run notes should preserve:

- `refinement_id`;
- `source_review_ids`;
- `source_reviews` when useful for downstream audit;
- source package, case, and cluster references from `case_package` when
  present;
- the sorted list of rows pruned by `session_id`;
- the sorted list of requested prune IDs that were not found upstream;
- the split and merge recommendations as hints, including their source review
  IDs and disagreement status.

### Python-Style Notebook Cell

The following cell assumes both `refinement_export` and `upstream_rows` already
exist in memory inside an approved upstream notebook or private pipeline. It
does not read files, write files, commit data, or execute upstream clustering
or telemetry processing.

```python
required_fields = {
    "schema_version",
    "refinement_id",
    "source_review_ids",
    "prune_session_ids",
    "split_recommendations",
    "merge_recommendations",
    "uncertainty",
    "disagreement",
}

missing_fields = sorted(required_fields - refinement_export.keys())
if missing_fields:
    raise ValueError(f"Missing cluster refinement fields: {missing_fields}")

if refinement_export["schema_version"] != "cluster_refinement.v0.1":
    raise ValueError(
        f"Unsupported refinement schema: {refinement_export['schema_version']}"
    )

prune_session_ids = list(refinement_export["prune_session_ids"])
seen_prune_ids = set()
duplicate_prune_ids = set()
for session_id in prune_session_ids:
    if session_id in seen_prune_ids:
        duplicate_prune_ids.add(session_id)
    seen_prune_ids.add(session_id)

if duplicate_prune_ids:
    raise ValueError(
        f"Duplicate prune_session_ids: {sorted(duplicate_prune_ids)}"
    )

if upstream_rows and any("session_id" not in row for row in upstream_rows):
    raise ValueError("Every upstream row must expose a stable session_id")

has_noop_pruning = len(prune_session_ids) == 0
has_noop_hints = (
    len(refinement_export["split_recommendations"]) == 0
    and len(refinement_export["merge_recommendations"]) == 0
)
source_package = refinement_export.get("case_package", {})
if has_noop_pruning and has_noop_hints:
    refinement_provenance = {
        "refinement_id": refinement_export["refinement_id"],
        "source_review_ids": list(refinement_export["source_review_ids"]),
        "source_reviews": list(refinement_export.get("source_reviews", [])),
        "source_package_id": source_package.get("package_id"),
        "source_case_id": source_package.get("case_id"),
        "source_cluster_id": source_package.get("cluster_id"),
        "status": "no_op",
        "reason": "No prune IDs, split hints, or merge hints were present.",
    }
    refined_rows = list(upstream_rows)
else:
    prune_id_set = set(prune_session_ids)
    upstream_session_ids = {row["session_id"] for row in upstream_rows}
    pruned_rows = [
        row for row in upstream_rows if row["session_id"] in prune_id_set
    ]
    refined_rows = [
        row for row in upstream_rows if row["session_id"] not in prune_id_set
    ]
    prune_ids_not_found = sorted(prune_id_set - upstream_session_ids)

    refinement_provenance = {
        "refinement_id": refinement_export["refinement_id"],
        "source_review_ids": list(refinement_export["source_review_ids"]),
        "source_reviews": list(refinement_export.get("source_reviews", [])),
        "source_package_id": source_package.get("package_id"),
        "source_case_id": source_package.get("case_id"),
        "source_cluster_id": source_package.get("cluster_id"),
        "pruned_session_ids": sorted(row["session_id"] for row in pruned_rows),
        "prune_session_ids_not_found": prune_ids_not_found,
        "split_recommendations": list(
            refinement_export["split_recommendations"]
        ),
        "merge_recommendations": list(
            refinement_export["merge_recommendations"]
        ),
    }

# Use refined_rows to prepare the next approved sanitized draft externally.
# Treat split and merge recommendation arrays as analyst notes only.
```

### Private Run Verification Checklist

Before handing a refined draft back through the sanitized adapter path, confirm
the private upstream run has verified:

- [ ] Unsupported `schema_version` is rejected.
- [ ] Missing required fields are rejected.
- [ ] Duplicate `prune_session_ids` are rejected.
- [ ] Prune IDs absent from the upstream table or draft are reported and
      preserved in provenance.
- [ ] Empty or no-op refinement exports produce an explicit no-op record.
- [ ] Valid prune IDs remove only matching upstream rows.
- [ ] `split_recommendations` and `merge_recommendations` remain analyst hints
      and are not executed automatically.
- [ ] `refinement_id`, `source_review_ids`, source package or cluster
      references, pruned row IDs, and not-found IDs are preserved.
- [ ] No raw telemetry, generated packages, review artifacts, public fixtures,
      or notebook outputs are committed to this repository.
- [ ] Any upstream rerun, clustering, projection, naming, embedding, or
      telemetry processing happens only outside Telemetry Court.

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
