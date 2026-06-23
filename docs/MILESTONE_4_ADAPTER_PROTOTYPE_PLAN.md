# Milestone 4 - Sanitized Adapter Prototype Plan

This plan defines the docs-first prototype workflow for producing sanitized
`CasePackageV01` files from an upstream clustering or naming environment and
for consuming Telemetry Court refinement exports back upstream. It is a planning
document only. It does not add adapter scripts, fixtures, runtime behavior, UI,
public packages, pilot data, or raw telemetry access.

The contract source of truth remains `CasePackageV01` in
[`lib/types.ts`](../lib/types.ts), the package guidance in
[`CASE_PACKAGE_CONTRACT.md`](./CASE_PACKAGE_CONTRACT.md), and the refinement
artifact shape in
[`lib/clusterRefinementTypesV01.ts`](../lib/clusterRefinementTypesV01.ts).

## 1. Sanitized Prototype Flow

```text
1. Upstream notebook or pipeline output
   -> 2. Sanitization and provenance gate
   -> 3. CasePackageV01 mapping
   -> 4. Telemetry Court import and review
   -> 5. ReviewResult, EvaluationReport, and cluster_refinement.v0.1 export
   -> 6. Upstream notebook consumes refinement externally
   -> 7. Next approved CasePackage iteration
```

1. The upstream environment runs the clustering, projection, naming, and
   evidence summarization workflow. It may use Toponymy-style naming,
   DataMapPlot-style maps, UMAP, HDBSCAN, ACME4-derived experiments, or another
   approved local pipeline, but those tools stay outside Telemetry Court.
2. A sanitization and provenance gate verifies that only approved summaries,
   derived features, aggregate metrics, opaque IDs, safe references, and scoped
   approval metadata can leave the upstream environment.
3. The producer maps the approved output into `case_package.v0.1` JSON with
   stable IDs, explicit claim-to-evidence links, provenance, sanitization, and
   review configuration.
4. Telemetry Court imports and validates the package, runs the blind structured
   review, records human evidence ratings, compares candidate labels, captures
   outlier or impostor selections, and produces `ReviewResultV01` artifacts.
5. Compatible review results can be aggregated into `EvaluationReportV01`, and
   Telemetry Court can export a `cluster_refinement.v0.1` recipe from compatible
   human review signals.
6. The upstream notebook reads the refinement JSON and applies pruning, split,
   or merge decisions only inside the upstream environment.
7. The upstream team reruns embedding, clustering, naming, and evidence
   extraction externally, then produces a new approved and sanitized
   `CasePackageV01` iteration if the revised cluster should be reviewed.

## 2. Producer Checklist

Before producing a `CasePackageV01`, the upstream notebook or pipeline must
already have:

- Stable package, case, and cluster IDs.
- The target cluster ID and cluster size.
- A generated label and any optional alternative labels.
- A label description that can be decomposed into reviewable claims.
- Claims with stable claim IDs.
- Evidence summaries with stable evidence IDs.
- Explicit claim-to-evidence links.
- Representative session IDs using stable, opaque identifiers.
- Outlier or impostor candidate IDs.
- Neighbor cluster IDs for likely confusion, split, or merge context.
- Embedding map metadata and coordinates.
- Pipeline, model, prompt, and run metadata.
- Provenance metadata that points to approved upstream artifacts.
- Sanitization metadata describing what was removed, transformed, retained, and
  approved for display.

The producer must not invent any of these fields during export. Missing values
should block the handoff or be represented with the schema's explicit
unavailable/missing-evidence concepts where the contract allows that.

## 3. CasePackageV01 Mapping Checklist

Use `CasePackageV01` and `CASE_PACKAGE_CONTRACT.md` as the mapping authority.
The prototype producer should map upstream fields as follows:

- `schema_version`: set exactly to `case_package.v0.1`.
- `package_id`, `case.case_id`, and `cluster.cluster_id`: stable opaque IDs,
  typically using `pkg-`, `case-`, and `cluster-` prefixes.
- `case`: review unit metadata, including `reviewable_status`,
  `review_intent`, title, summary, and known limitations.
- `dataset`: safe source context, including `dataset_id`, `dataset_name`,
  `dataset_type`, `data_classification`, `source_environment`, `approved_use`,
  and limitations.
- `cluster.cluster_size`: the upstream cluster member count.
- `cluster.cluster_name` or `cluster.upstream_cluster_label`: the upstream
  cluster name when one exists.
- `cluster.cluster_method`: the upstream clustering method metadata. This is
  metadata only, not an executable dependency.
- `cluster.embedding_map`: topology metadata from the upstream map. For this
  prototype, topology-bearing packages should include `map_id`, `map_tool`,
  `coordinate_space`, and `coordinates.x` plus `coordinates.y`; `coordinates.z`
  is optional when the upstream projection is three-dimensional.
- `pipeline`: upstream run metadata, including `run_id`, `upstream_tool`,
  `generated_at`, and any available `pipeline_id`, `pipeline_version`,
  `embedding_model`, `clustering_method`, `dimensionality_reduction_method`,
  `naming_model`, `parameters`, or `config_summary`.
- `pipeline.prompt`: prompt metadata such as `prompt_id`, `prompt_name`,
  `prompt_version`, `prompt_digest`, or `prompt_summary` when label generation
  used a prompt.
- `candidate_labels`: generated and alternative labels with stable `label_id`,
  `label`, `source`, optional model or prompt references, optional confidence
  or rank, and `linked_claim_ids`.
- `claims`: stable `claim_id`, claim text, `claim_type`,
  `linked_label_ids`, and `linked_evidence_ids`. Use
  `evidence_status: "linked"` when evidence is linked and
  `evidence_status: "missing_evidence_declared"` only when the package
  explicitly declares that evidence is absent.
- `evidence_items`: safe evidence summaries with stable `evidence_id`,
  `title`, `summary`, `evidence_type`, `content`, `source_reference`,
  `provenance_reference`, `sanitization_status`, and optional linked session or
  claim IDs.
- `evidence_to_claim_mappings`: the canonical relationship records from each
  `claim_id` to each `evidence_id`, with `relationship`, optional
  `expected_support`, and optional rationale.
- `representative_sessions`: stable opaque `session_id`, title, summary,
  feature highlights, safe reference when allowed, cluster membership metadata,
  flags, and optional linked evidence IDs. Valid flags may include
  `representative`, `borderline`, `outlier_candidate`, `impostor_candidate`,
  `neighbor_like`, and `needs_context`.
- `outlier_impostor_candidates`: keep these in the separate top-level array.
  Each candidate has a `candidate_id`, optional `session_id`, optional
  `evidence_id`, reason, optional score, and `expected_review_use`.
- `neighbor_clusters`: adjacent or confusing clusters using
  `neighbor_cluster_id`, optional label/name, optional distance/similarity, and
  `reason_this_neighbor_matters`.
- `metrics`: bounded metric envelopes when available, or explicit unavailable
  reasons when the producer cannot calculate a metric.
- `provenance`: source system, source artifact, generating tool,
  `generated_at`, upstream run ID, adapter name/version for non-synthetic
  output, safe references, and optional owner contact.
- `sanitization`: a valid `CasePackageSanitizationStatusV01` such as
  `synthetic`, `sanitized`, `deidentified`, `redacted`, `aggregate_only`, or
  `approved_internal`; the method, redaction notes, allowed display level,
  raw-drilldown flag, and safe reference type. Although `unknown` is a schema
  value, it is not acceptable for a non-synthetic prototype handoff.
- `sanitization.review_approval`: required for non-synthetic packages, with
  `status: "approved"`, approver, timestamp, scope, and an auditable safe
  reference.
- `review_configuration`: blind review state, hidden labels, required stages,
  allowed ratings, allowed verdicts, allowed recommended actions, and required
  reviewer actions.

## 4. Rejection And Failure Cases

The prototype workflow should reject a package before handoff or during
Telemetry Court import when it has any of these conditions:

- Raw logs, unrestricted event payloads, credentials, secrets, personal data,
  or sensitive payloads are present.
- Required provenance metadata is missing, vague, or disconnected from the
  `pipeline.run_id`.
- Required sanitization metadata is missing.
- `sanitization.status` is unsupported, or a non-synthetic package uses
  `synthetic` or `unknown` as its effective status.
- The schema version is unsupported or not exactly `case_package.v0.1`.
- Claim, evidence, session, label, cluster, review-configuration, or
  evidence-to-claim references are broken.
- A topology-bearing adapter package is missing `cluster.embedding_map`
  coordinates, or has only one of `coordinates.x` and `coordinates.y`.
- IDs expose usernames, account numbers, raw database primary keys, hostnames,
  source log IDs, or other non-opaque sensitive identifiers.
- Reviewer results, review counts, pilot outcomes, or analyst approvals are
  fabricated to make the package appear validated.
- Fake pilot data or public real-data fixtures are included instead of approved
  sanitized package output.
- Non-synthetic packages have ambiguous approval status, missing
  `sanitization.review_approval`, or approval metadata that lacks approver,
  timestamp, scope, or auditable reference.
- Evidence summaries claim a fact but the corresponding claim uses neither
  linked evidence nor `missing_evidence_declared`.

## 5. Consumer Checklist For cluster_refinement.v0.1

The upstream consumer should treat `cluster_refinement.v0.1` as an analyst
review recipe, not as an automatic clustering command. The schema concepts are
defined in `lib/clusterRefinementTypesV01.ts`.

- Read the refinement JSON and verify `schema_version` is
  `cluster_refinement.v0.1` and `calculation_version` is compatible.
- Preserve `refinement_id`, `source_review_ids`, and `source_reviews` when
  available so the next upstream run can be audited back to the human reviews.
- Use `prune_session_ids` to filter rows externally in the upstream notebook or
  pipeline. These IDs are derived from human outlier/impostor selections plus
  qualifying cluster-quality signals.
- Inspect `session_exclusion_recommendations` for supporting counts,
  reviewer counts, qualifying source reviews, signals, and disagreement before
  pruning.
- Treat `split_recommendations` as analyst-approved hints that a cluster may
  need sub-clustering, parameter changes, or evidence package revision. Do not
  apply an automatic split inside Telemetry Court.
- Treat `merge_recommendations` as analyst-approved hints that a cluster may
  need comparison or merging with neighbors. In v0.1, merge target details can
  be explicitly unavailable and must not be inferred from map proximity alone.
- Carry uncertainty and disagreement forward. A single-review artifact can be
  useful but cannot establish reviewer agreement.
- Rerun embedding, clustering, naming, evidence extraction, and map generation
  externally in the upstream environment.
- Generate a new approved and sanitized `CasePackageV01` iteration when the
  revised cluster should return to Telemetry Court.

Illustrative non-executable pseudocode:

```python
# Pseudocode only. Keep this logic in the upstream notebook or pipeline.
recipe = read_json("cluster_refinement_export.json")
assert recipe["schema_version"] == "cluster_refinement.v0.1"

rows = rows.exclude(session_id in recipe["prune_session_ids"])

for split_hint in recipe["split_recommendations"]:
    note_for_upstream_rerun(split_hint["cluster_id"], split_hint["signals"])

for merge_hint in recipe["merge_recommendations"]:
    note_for_upstream_comparison(
        merge_hint["cluster_id"],
        merge_hint["target"]["neighbor_cluster_ids"],
    )

rerun_embedding_and_clustering_externally(rows)
write_next_sanitized_case_package(
    source_refinement_id=recipe["refinement_id"],
    source_review_ids=recipe["source_review_ids"],
    source_reviews=recipe.get("source_reviews", []),
)
```

## 6. Non-Goals And Boundaries

- No raw telemetry import.
- No live dataset access.
- No public real-data fixtures.
- No fake pilot data.
- No Toponymy, DataMapPlot, UMAP, HDBSCAN, ACME4, or clustering-pipeline
  execution in Telemetry Court.
- No backend, auth, database, server persistence, or production API surface.
- No runtime UI changes.
- No scripts, notebooks, package fixtures, public CasePackages, or adapter
  implementation in this planning slice.
- No claim that current synthetic fixtures are real Toponymy, DataMapPlot,
  ACME4, or pilot compatibility evidence.
