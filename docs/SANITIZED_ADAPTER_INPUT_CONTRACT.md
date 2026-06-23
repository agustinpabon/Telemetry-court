# Sanitized Adapter Input Contract

## Purpose

This page documents the implemented sanitized upstream adapter input consumed
by:

- [`lib/sanitizedCasePackageAdapterV01.ts`](../lib/sanitizedCasePackageAdapterV01.ts)
- [`scripts/sanitized-case-package-adapter-v01.ts`](../scripts/sanitized-case-package-adapter-v01.ts)

The TypeScript input type is `SanitizedAdapterDraftInput`, an alias for
`SanitizedCasePackageAdapterDraftV01`.

## Identity And Boundary

The sanitized upstream adapter input is not `CasePackageV01`.

It is a pre-CasePackage draft object produced outside Telemetry Court by an
approved notebook, script, or upstream experiment. It must already be approved,
sanitized, and safe to commit or import in the target environment before the
Telemetry Court mapper or CLI sees it.

Telemetry Court maps this draft into `CasePackageV01` with
`buildCasePackageV01FromSanitizedAdapterDraft`. The CLI reads the same draft
shape, maps it, validates the mapped package with `validateCasePackageV01`, and
writes `CasePackageV01` JSON.

Telemetry Court does not run upstream clustering, embedding, dimensionality
reduction, naming, or telemetry processing. Toponymy, DataMapPlot, UMAP,
HDBSCAN, ACME4, and any other clustering or telemetry experiment stay outside
Telemetry Court.

## Notebook And Script Boundary

The intended loop is:

```text
upstream notebook or script
-> Toponymy/DataMapPlot/UMAP/HDBSCAN/ACME4 or other experiment runs outside Telemetry Court
-> approved/sanitized draft object
-> existing sanitized adapter CLI
-> CasePackageV01 JSON
-> Telemetry Court review
-> ReviewResult
-> EvaluationReport
-> cluster_refinement.json
-> upstream rerun/refinement outside Telemetry Court
```

The draft object is a handoff artifact, not a durable product artifact. The
durable review boundary remains the validated `CasePackageV01` JSON.

## Contract Shape

The draft intentionally omits `schema_version`. The mapper sets the final
`CasePackageV01.schema_version` to `case_package.v0.1`.

Top-level draft fields:

| Field | Required | Type source | Notes |
| --- | --- | --- | --- |
| `package_id` | Yes | `CasePackageV01["package_id"]` | Stable package ID for the mapped package. |
| `created_at` | Yes | `CasePackageV01["created_at"]` | Timestamp for package creation. |
| `package_revision` | No | `CasePackageV01["package_revision"]` | Revision for corrected or regenerated packages. |
| `case` | Yes | `CasePackageV01["case"]` | Review unit metadata. |
| `dataset` | Yes | `CasePackageDatasetMetadataV01` | Approved source context. |
| `cluster` | Yes | `SanitizedCasePackageAdapterClusterDraftV01` | Cluster metadata plus required adapter `embedding_map`. |
| `pipeline` | Yes | `CasePackagePipelineMetadataV01` | Upstream run metadata. |
| `candidate_labels` | Yes | `CasePackageCandidateLabelV01[]` | Generated and alternative labels. |
| `claims` | Yes | `SanitizedCasePackageAdapterClaimDraftV01[]` | Claims without `linked_evidence_ids`; links are derived. |
| `evidence_summaries` | Yes | `SanitizedCasePackageAdapterEvidenceSummaryV01[]` | Evidence summaries without final provenance or claim back-links. |
| `claim_evidence_links` | Yes | `CasePackageEvidenceToClaimMappingV01[]` | Canonical claim-to-evidence relationships. |
| `representative_sessions` | Yes | `SanitizedCasePackageAdapterRepresentativeSessionDraftV01[]` | Session summaries; cluster ID can be injected by the mapper. |
| `outlier_impostor_candidates` | Yes | `CasePackageOutlierImpostorCandidateV01[]` | Separate review candidates for cluster purity checks. |
| `neighbor_clusters` | Yes | `CasePackageV01["neighbor_clusters"]` | Nearby or confusing cluster context. |
| `metrics` | No | `CasePackageMetricsV01` | Defaults to `{}` when omitted. |
| `provenance` | Yes | `CasePackageProvenanceMetadataV01` | Source and adapter provenance. |
| `sanitization` | Yes | `CasePackageSanitizationMetadataV01` | Sanitization status, method, approval, and safe-reference posture. |
| `review_configuration` | No | `Partial<CasePackageReviewConfigurationV01>` | Missing values use canonical defaults. |

### Mapper-Derived Fields

The mapper derives final `CasePackageV01` fields instead of requiring the
upstream draft to duplicate them.

| Draft source | Mapped output |
| --- | --- |
| `claim_evidence_links` grouped by `claim_id` | `claims[].linked_evidence_ids` |
| `claims[].evidence_status` or linked evidence count | `claims[].evidence_status` |
| `claim_evidence_links` grouped by `evidence_id` | `evidence_items[].linked_claim_ids` |
| `provenance.provenance_id` | `evidence_items[].provenance_reference` |
| `evidence_summaries[].sanitization_status` or `sanitization.status` | `evidence_items[].sanitization_status` |
| `cluster.cluster_id` | missing `representative_sessions[].cluster_membership.cluster_id` |
| omitted `metrics` | `metrics: {}` |
| partial or omitted `review_configuration` | canonical blind-review defaults |

### Cluster Identity And Topology

`cluster` follows `CasePackageClusterMetadataV01` except that
`embedding_map` is required for adapter drafts.

Required cluster identity fields include:

- `cluster.cluster_id`
- `cluster.cluster_size`
- `cluster.cluster_method.method`

Optional cluster fields still follow `CasePackageClusterMetadataV01`, including
`cluster_name`, `upstream_cluster_label`, parent or child cluster IDs, and time
range metadata.

Adapter preflight requires:

- `cluster.embedding_map.map_id`
- `cluster.embedding_map.map_tool`
- `cluster.embedding_map.coordinate_space`
- numeric `cluster.embedding_map.coordinates.x`
- numeric `cluster.embedding_map.coordinates.y`
- optional numeric `cluster.embedding_map.coordinates.z`

These coordinates are metadata from the upstream approved map. Telemetry Court
does not calculate them.

### AI Labels And Claims

`candidate_labels` use `CasePackageCandidateLabelV01`. Each label carries a
stable `label_id`, label text, source such as `ai_generated`,
`human_baseline`, `alternative_model`, `prompt_variant`, or
`synthetic_fixture`, optional model/prompt/run metadata, optional confidence or
rank, and `linked_claim_ids`.

`claims` use `SanitizedCasePackageAdapterClaimDraftV01`, which is
`CasePackageAiClaimV01` without `linked_evidence_ids`. The mapper fills
`linked_evidence_ids` from `claim_evidence_links`. A claim with
`evidence_status: "linked"` must have at least one matching
`claim_evidence_links` entry. A claim with
`evidence_status: "missing_evidence_declared"` must not have claim-evidence
links.

### Evidence Summaries

`evidence_summaries` use `SanitizedCasePackageAdapterEvidenceSummaryV01`, which
is `CasePackageEvidenceItemV01` without:

- `linked_claim_ids`
- `provenance_reference`
- required `sanitization_status`

Each evidence summary still needs stable evidence identity, title, summary,
evidence type, safe content, and a `source_reference`. The mapper fills
`linked_claim_ids` from `claim_evidence_links`, sets
`provenance_reference` to `provenance.provenance_id`, and uses either the
evidence-level `sanitization_status` or the draft-level `sanitization.status`.

Evidence content must be safe, summarized, derived, or aggregate. It must not
embed raw telemetry or restricted records.

### Representative Sessions

`representative_sessions` use
`SanitizedCasePackageAdapterRepresentativeSessionDraftV01`, which matches
`CasePackageRepresentativeSessionV01` except that
`cluster_membership.cluster_id` may be omitted. When omitted, the mapper sets
it to `cluster.cluster_id`.

Sessions are approved summaries or safe references. They can carry flags such
as `representative`, `borderline`, `outlier_candidate`, `impostor_candidate`,
`neighbor_like`, or `needs_context`. They must not contain raw session records.

### Outlier, Impostor, And Neighbor Context

`outlier_impostor_candidates` use
`CasePackageOutlierImpostorCandidateV01`. Keep these candidates in their own
top-level array. They may reference a representative `session_id`, an
`evidence_id`, or both, and they require `candidate_id`, `reason`, and
`expected_review_use`.

`neighbor_clusters` use `CasePackageNeighborClusterV01`. A neighbor references
another `neighbor_cluster_id`, optional label or name, optional distance or
similarity metrics, `reason_this_neighbor_matters`, and optional
`confusion_risk`.

### Dataset, Pipeline, Provenance, And Sanitization

`dataset` follows `CasePackageDatasetMetadataV01` and records approved source
context, not raw source records.

`pipeline` follows `CasePackagePipelineMetadataV01` and records the upstream
run, tool category, generated timestamp, and optional model, prompt,
clustering, projection, parameters, or config summary.

`provenance` follows `CasePackageProvenanceMetadataV01`. For controlled
non-synthetic mapped packages, final validation requires:

- `provenance.upstream_run_id`
- `provenance.adapter_name`
- `provenance.adapter_version`
- `provenance.upstream_run_id` matching `pipeline.run_id`
- at least one safe provenance reference with a `uri` or `artifact_id`

`sanitization` follows `CasePackageSanitizationMetadataV01`. Adapter preflight
requires `sanitization.status` to be a valid
`CasePackageSanitizationStatusV01`. Non-synthetic drafts require a concrete
status and `sanitization.review_approval`. Final package validation also
requires controlled packages to avoid `synthetic` and `unknown`, describe
redaction notes, use an auditable safe reference type, and provide an approval
reference with a `uri` or `artifact_id`.

## Schematic Examples

These snippets are illustrative shape examples, not fixtures, not pilot data,
and not CLI-ready JSON. They intentionally use placeholder values and omit many
valid optional fields.

### Minimal Draft Skeleton

```jsonc
{
  "package_id": "pkg-cluster-example-001",
  "created_at": "2026-06-23T00:00:00.000Z",
  "case": {
    "case_id": "case-cluster-example-001",
    "title": "Sanitized example review",
    "summary": "Sanitized example summary.",
    "reviewable_status": "reviewable",
    "review_intent": "validate_label",
    "limitations": ["Sanitized placeholders only."]
  },
  "dataset": {
    "dataset_id": "dataset-placeholder-001",
    "dataset_name": "Sanitized placeholder dataset",
    "dataset_type": "other",
    "data_classification": "sanitized",
    "source_environment": "approved-placeholder-environment",
    "approved_use": "Approved placeholder review scope.",
    "limitations": ["No raw telemetry is included."]
  },
  "cluster": {
    "cluster_id": "cluster-example-001",
    "cluster_size": "<approved-cluster-size-number>",
    "embedding_map": {
      "map_id": "map-placeholder-001",
      "map_tool": "approved-upstream-map-tool",
      "coordinate_space": "approved-placeholder-space",
      "coordinates": {
        "x": "<numeric-x-from-approved-map>",
        "y": "<numeric-y-from-approved-map>"
      }
    },
    "cluster_method": {
      "method": "approved-upstream-cluster-method"
    }
  },
  "pipeline": {
    "run_id": "run-placeholder-001",
    "upstream_tool": "approved-upstream-script",
    "generated_at": "2026-06-23T00:00:00.000Z"
  },
  "candidate_labels": [
    {
      "label_id": "label-placeholder-001",
      "label": "Sanitized example label",
      "source": "ai_generated",
      "linked_claim_ids": ["claim-placeholder-001"]
    }
  ],
  "claims": [
    {
      "claim_id": "claim-placeholder-001",
      "text": "The cluster has a sanitized example pattern.",
      "claim_type": "behavioral_summary",
      "linked_label_ids": ["label-placeholder-001"],
      "evidence_status": "linked"
    }
  ],
  "evidence_summaries": [
    {
      "evidence_id": "evidence-placeholder-001",
      "title": "Sanitized example evidence",
      "summary": "Approved placeholder summary for review.",
      "evidence_type": "salient_feature",
      "content": {
        "content_type": "structured_summary",
        "fields": {
          "placeholder_feature": "Sanitized placeholder value"
        }
      },
      "source_reference": {
        "source_id": "source-placeholder-001",
        "source_type": "approved_sanitized_summary"
      },
      "linked_session_ids": ["session-placeholder-001"]
    }
  ],
  "claim_evidence_links": [
    {
      "claim_id": "claim-placeholder-001",
      "evidence_id": "evidence-placeholder-001",
      "relationship": "supports"
    }
  ],
  "representative_sessions": [
    {
      "session_id": "session-placeholder-001",
      "title": "Sanitized example session",
      "summary": "Approved placeholder session summary.",
      "feature_highlights": ["Sanitized placeholder feature"],
      "cluster_membership": {},
      "flags": ["representative"],
      "linked_evidence_ids": ["evidence-placeholder-001"]
    }
  ],
  "outlier_impostor_candidates": [],
  "neighbor_clusters": [],
  "provenance": {
    "provenance_id": "provenance-placeholder-001",
    "source_system": "approved-placeholder-source",
    "source_artifact": "artifact-placeholder-001",
    "generating_tool": "approved-upstream-script",
    "generated_at": "2026-06-23T00:00:00.000Z",
    "upstream_run_id": "run-placeholder-001",
    "adapter_name": "sanitized-case-package-adapter-v01",
    "adapter_version": "0.1.0",
    "references": [
      {
        "reference_id": "reference-placeholder-001",
        "reference_type": "source_artifact_id",
        "artifact_id": "artifact-placeholder-001"
      }
    ]
  },
  "sanitization": {
    "status": "sanitized",
    "method": "Approved placeholder sanitization method.",
    "redaction_notes": ["Placeholder note describing approved sanitization."],
    "allowed_display_level": "summary_only",
    "raw_drilldown_allowed": false,
    "safe_reference_type": "source_artifact_id",
    "review_approval": {
      "status": "approved",
      "approved_by": "approver-placeholder",
      "approved_at": "2026-06-23T00:00:00.000Z",
      "scope": "Approved placeholder review scope.",
      "reference": {
        "reference_id": "approval-reference-placeholder-001",
        "reference_type": "source_artifact_id",
        "artifact_id": "approval-artifact-placeholder-001"
      }
    }
  }
}
```

### Missing Evidence Declaration

Use `missing_evidence_declared` only when the package producer is explicitly
declaring that evidence is absent for the claim.

```jsonc
{
  "claims": [
    {
      "claim_id": "claim-placeholder-002",
      "text": "The cluster has a second sanitized example claim.",
      "claim_type": "other",
      "linked_label_ids": ["label-placeholder-001"],
      "evidence_status": "missing_evidence_declared"
    }
  ],
  "claim_evidence_links": []
}
```

## CLI Usage

A notebook or script author should write an approved sanitized draft JSON file
outside Telemetry Court, then call the existing CLI with placeholder paths:

```bash
npm run sanitized-case-package-adapter-v01 -- path/to/approved-sanitized-draft.json --out path/to/case-package-v01.json
```

Without `--out`, the CLI prints the mapped `CasePackageV01` JSON to standard
output:

```bash
npm run sanitized-case-package-adapter-v01 -- path/to/approved-sanitized-draft.json
```

The CLI does not mutate the input file. It reads exactly one draft JSON path,
maps the draft, validates the mapped package, and writes output only on
success. The output can be inspected with the existing package validator:

```bash
npm run validate-package -- path/to/case-package-v01.json
```

These commands do not execute upstream clustering, telemetry processing, or
notebook code.

## Validation Failure Expectations

Adapter preflight failures throw `SanitizedCasePackageAdapterV01Error`; the CLI
prints `Adapter mapping: FAIL` and exits nonzero. Current preflight checks
include:

- invalid `sanitization.status`;
- non-synthetic draft missing `sanitization.review_approval`;
- non-synthetic draft using `synthetic` or `unknown` as its sanitization
  status;
- missing `cluster.embedding_map`;
- blank `map_id`, `map_tool`, or `coordinate_space`;
- missing nonnumeric `coordinates.x` or `coordinates.y`;
- nonnumeric `coordinates.z` when present;
- linked claims without claim-evidence links;
- claims declaring missing evidence while still carrying claim-evidence links.

After mapping, `validateCasePackageV01` still validates the final package. It
fails loudly on unsupported schema versions, missing required sections, broken
IDs or references, invalid enum values, invalid metric envelopes, nonmatching
provenance references, controlled-package provenance gaps, missing approval
metadata, and unsafe controlled-package safe-reference posture.

CLI parsing and filesystem failures also exit nonzero:

- wrong argument count or missing `--out` path;
- missing or unreadable input file;
- invalid JSON;
- output write failure.

No output package should be treated as reviewable until the CLI succeeds and
the resulting `CasePackageV01` validates.

## Non-Goals And Prohibited Use

This contract does not permit or add:

- raw telemetry ingestion;
- unsanitized restricted records;
- in-app Toponymy, DataMapPlot, UMAP, HDBSCAN, ACME4, clustering, embedding,
  dimensionality-reduction, naming, or telemetry-processing execution;
- fake public CasePackages;
- fake ReviewResults;
- fake EvaluationReports;
- fake topology coordinates;
- fabricated reviewers, review counts, pilot outcomes, or validation results;
- public fixtures generated by this documentation slice;
- raw event names, hostnames, IP addresses, usernames, filesystem paths, cloud
  account IDs, process trees, ACME4-derived records, CloudTrail-derived
  records, or realistic-looking telemetry snippets.

If a draft includes restricted or realistic-looking content that is not already
approved for the target environment, it must not cross this boundary.
