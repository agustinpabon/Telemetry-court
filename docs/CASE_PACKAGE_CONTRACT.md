# Case Package Contract

## Purpose

Telemetry Court starts at a versioned package boundary. Upstream systems embed, cluster, summarize, and name telemetry; Telemetry Court reviews whether the generated interpretation is supported by package-shaped evidence.

```text
upstream pipeline or notebook
-> precomputed cluster output
-> CasePackage JSON
-> Telemetry Court review
-> ReviewResult
-> EvaluationReport
```

`CasePackage v0.1` is defined in `lib/types.ts` as `CasePackageV01`.

This document explains the field intent for that TypeScript contract. It does not implement runtime validation, package import, UI adapters, persistence, Toponymy integration, ACME4 ingestion, or evaluation aggregation.

## What A CasePackage Is

A `CasePackage` is a versioned, provenance-bearing object under review. It contains a precomputed cluster, candidate labels, generated claims, reviewable evidence, explicit evidence-to-claim mappings, representative sessions, comparison context, metrics, provenance, sanitization metadata, and review configuration.

It is designed for packages produced by Toponymy-style workflows, DataMapPlot-adjacent workflows, notebooks, embedding and clustering experiments, ACME4-style sanitized experiments, CloudTrail-style sanitized experiments, and synthetic package generators.

## What A CasePackage Is Not

A `CasePackage` is not:

- raw telemetry;
- a live ingestion stream;
- a SIEM, SOC, EDR, alert-triage, or incident-response record;
- a generic case-management object;
- a database row that also stores reviewer decisions;
- a `ReviewResult` or `EvaluationReport`;
- proof that Telemetry Court currently runs Toponymy or ingests ACME4.

The app must not require raw restricted telemetry. Real or restricted data should be transformed inside the authorized environment into minimal, approved, auditable package evidence.

## v0.1 Schema Identity

The canonical TypeScript type is:

```ts
import type { CasePackageV01 } from "@/lib/types";
```

The schema version value is:

```ts
case_package.v0.1
```

Top-level required fields:

- `schema_version`
- `package_id`
- `created_at`
- `case`
- `dataset`
- `cluster`
- `pipeline`
- `candidate_labels`
- `claims`
- `evidence_items`
- `evidence_to_claim_mappings`
- `representative_sessions`
- `outlier_impostor_candidates`
- `neighbor_clusters`
- `metrics`
- `provenance`
- `sanitization`
- `review_configuration`

`package_revision` is optional and should be used when the same package is corrected or regenerated without changing the schema version.

## ID And Reference Conventions

IDs are stable strings, not array indexes. Use deterministic, readable IDs where possible:

- package IDs: `pkg-...`
- case IDs: `case-...`
- dataset IDs: `dataset-...`
- cluster IDs: `cluster-...`
- label IDs: `label-...`
- claim IDs: `claim-...`
- evidence IDs: `evidence-...`
- session IDs: `session-...`

Future runtime validation will check ID uniqueness and references. For v0.1 contract authoring, adapters should already preserve those references explicitly:

- candidate labels link to claims through `linked_claim_ids`;
- claims link to evidence through `linked_evidence_ids`;
- evidence items may link back to claims and sessions;
- `evidence_to_claim_mappings` are the canonical relationship records;
- representative sessions may link to evidence through `linked_evidence_ids`;
- outlier or impostor candidates reference a `session_id` or `evidence_id`.

Do not encode raw data in IDs or safe references.

## Core Field Groups

### Case Metadata

`case` describes the review unit:

- `case_id`
- `title`
- `summary`
- optional `description`
- `reviewable_status`
- `review_intent`
- optional limitations

Use `synthetic_demo` for local examples. Use `reviewable` only when the package is actually suitable for review.

### Dataset Metadata

`dataset` describes the approved source context without requiring raw data:

- `dataset_id`
- `dataset_name`
- `dataset_type`
- `data_classification`
- `source_environment`
- `approved_use`
- optional approval notes
- limitations

`data_classification` should be honest. Synthetic and sanitized packages are preferred for portable fixtures.

### Cluster Metadata

`cluster` describes the precomputed cluster under review:

- `cluster_id`
- optional `cluster_name` or `upstream_cluster_label`
- `cluster_size`
- optional embedding or map coordinates
- optional parent and child cluster references
- optional time range
- cluster method metadata

Map coordinates may come from DataMapPlot-adjacent or other projection workflows, but Telemetry Court does not own those algorithms.

### Pipeline Metadata

`pipeline` describes the upstream process that produced the package:

- `pipeline_id` or `run_id`
- `upstream_tool`
- optional pipeline version
- optional embedding model
- optional clustering method
- optional dimensionality reduction method
- optional naming model and prompt metadata
- `generated_at`
- optional parameters or compact config summary

Use factual names only. Do not invent Toponymy APIs, ACME4 loaders, or unsupported integration behavior.

### Candidate Labels

`candidate_labels` are the labels the reviewer may compare. Each label includes:

- `label_id`
- `label`
- `source`, such as `ai_generated`, `human_baseline`, `alternative_model`, `prompt_variant`, or `synthetic_fixture`
- optional model, prompt, and run references
- optional confidence and rank
- `linked_claim_ids`

Candidate labels are not reviewer choices. Reviewer choices belong in `ReviewResult`.

### AI Claims

`claims` decompose generated interpretations into stable assertions:

- `claim_id`
- `text`
- `claim_type`
- `linked_evidence_ids`
- optional linked label IDs
- optional strength or confidence
- optional caveats and assumptions
- optional missing-evidence declaration

Every generated claim should either link to evidence or explicitly declare missing evidence.

### Evidence Items

`evidence_items` are stable review objects. They include:

- `evidence_id`
- `title`
- `summary`
- `evidence_type`
- `content`
- `source_reference`
- `provenance_reference`
- `sanitization_status`
- optional linked session IDs
- optional linked claim IDs
- optional weight or salience

Supported evidence types include salient features, representative sessions, event summaries, sequence summaries, metric cards, neighbor comparisons, outlier or impostor evidence, analyst notes, safe drill-down references, derived tables, and aggregate statistics.

Evidence content should be safe, summarized, or derived. Safe drill-down references may point back to approved source artifacts when allowed, but they must not copy raw restricted telemetry into the app.

### Evidence-To-Claim Mappings

`evidence_to_claim_mappings` are the canonical claim-evidence relationship records. They include:

- `claim_id`
- `evidence_id`
- `relationship`
- optional `expected_support`
- optional rationale

These mappings describe what the package producer expects the evidence to show. They are not reviewer ratings. Reviewer ratings use the future `ReviewResult` contract.

### Representative Sessions

`representative_sessions` describe approved exemplars or comparison sessions:

- `session_id`
- `title`
- `summary`
- feature highlights
- optional safe reference
- cluster membership metadata
- flags such as representative, borderline, outlier candidate, impostor candidate, neighbor-like, or needs context
- optional linked evidence IDs

Session objects should remain safe summaries or approved references, not raw events.

### Outlier And Impostor Candidates

`outlier_impostor_candidates` identify sessions or evidence that reviewers may inspect later:

- `candidate_id`
- optional `session_id`
- optional `evidence_id`
- reason
- optional score
- expected review use

Use these candidates to support cluster purity review, not operational alert triage.

### Neighbor Clusters

`neighbor_clusters` provide comparison context:

- `neighbor_cluster_id`
- optional label or name
- optional distance or similarity
- reason this neighbor matters
- optional confusion risk

Neighbors help reviewers distinguish weak labels, ambiguous clusters, and split or merge candidates.

### Metrics

`metrics` are optional per metric but explicit in shape. Available metrics use:

```ts
{ status: "available", value: number, min: 0, max: 1 }
```

Unavailable metrics use:

```ts
{ status: "unavailable", reason: string }
```

The v0.1 metrics object supports cluster coherence, feature distinctiveness, evidence coverage, model agreement, uncertainty, outlier score, and temporal stability. Runtime validation in a later issue will check bounds; this issue only defines the shape.

### Provenance Metadata

`provenance` tracks where the package came from:

- `source_system`
- `source_artifact`
- `generating_tool`
- `generated_at`
- optional upstream run ID
- optional adapter name and version
- references to notebooks, scripts, files, dashboards, or artifacts
- optional owner/contact metadata

References should identify approved artifacts without exposing raw restricted data.

### Sanitization Metadata

`sanitization` states what may be displayed:

- sanitization status
- method
- redaction notes
- allowed display level
- whether raw drill-down is allowed
- safe reference type
- optional notes

If raw drill-down is not allowed, references must remain summary-only, synthetic, or otherwise safe.

### Review Configuration

`review_configuration` tells Telemetry Court how to run the structured review:

- whether blind review is enabled
- which candidate labels are initially hidden or revealed
- required review stages
- allowed evidence ratings
- allowed verdicts
- allowed recommended actions
- required reviewer actions

Canonical evidence ratings for future `ReviewResult` compatibility:

- `supports`
- `weak_support`
- `irrelevant`
- `contradicts`
- `insufficient`
- `needs_more_context`

Canonical verdicts for future `ReviewResult` compatibility:

- `supported`
- `partially_supported`
- `unsupported_or_overclaimed`
- `uncertain`
- `cluster_impure`
- `needs_split`
- `needs_merge`
- `needs_better_evidence`

Canonical recommended actions for future `ReviewResult` compatibility:

- `accept_label`
- `rename_label`
- `broaden_label`
- `narrow_label`
- `split_cluster`
- `merge_cluster`
- `collect_more_evidence`
- `rerun_prompt`
- `rerun_embedding`
- `mark_uncertain`

## Minimal Valid Example

This example is intentionally small. The richer TypeScript fixture in `lib/casePackageV01.test.ts` includes two labels, three claims, three evidence items, provenance, sanitization, and review configuration.

```json
{
  "schema_version": "case_package.v0.1",
  "package_id": "pkg-synthetic-iam-001",
  "created_at": "2026-06-20T12:00:00.000Z",
  "case": {
    "case_id": "case-synthetic-iam-001",
    "title": "Synthetic IAM role provisioning review",
    "summary": "A generated label may overclaim suspicious intent.",
    "reviewable_status": "synthetic_demo",
    "review_intent": "validate_label"
  },
  "dataset": {
    "dataset_id": "dataset-synthetic-cloudtrail",
    "dataset_name": "Synthetic CloudTrail Workshop Pack",
    "dataset_type": "cloudtrail",
    "data_classification": "synthetic",
    "source_environment": "local-fixture",
    "approved_use": "Contract testing with safe synthetic data.",
    "limitations": ["No raw restricted telemetry is included."]
  },
  "cluster": {
    "cluster_id": "cluster-iam-029",
    "cluster_name": "IAM role provisioning region",
    "upstream_cluster_label": "Suspicious IAM privilege escalation",
    "cluster_size": 126,
    "cluster_method": {
      "method": "synthetic-hdbscan-style-clustering"
    }
  },
  "pipeline": {
    "run_id": "run-synthetic-2026-06-20",
    "upstream_tool": "synthetic-demo-package-generator",
    "generated_at": "2026-06-20T11:58:00.000Z"
  },
  "candidate_labels": [
    {
      "label_id": "label-ai-suspicious-iam",
      "label": "Suspicious IAM privilege escalation",
      "source": "ai_generated",
      "linked_claim_ids": ["claim-role-changes"]
    }
  ],
  "claims": [
    {
      "claim_id": "claim-role-changes",
      "text": "The cluster contains role creation and policy attachment activity.",
      "claim_type": "behavioral_summary",
      "linked_evidence_ids": ["evidence-role-lifecycle"],
      "linked_label_ids": ["label-ai-suspicious-iam"]
    }
  ],
  "evidence_items": [
    {
      "evidence_id": "evidence-role-lifecycle",
      "title": "Role lifecycle feature stack",
      "summary": "Sanitized feature summaries include CreateRole and AttachRolePolicy.",
      "evidence_type": "salient_feature",
      "content": {
        "content_type": "text",
        "text": "Synthetic derived features only."
      },
      "source_reference": {
        "source_id": "source-synthetic-features",
        "source_type": "derived_feature_summary"
      },
      "provenance_reference": "prov-synthetic-package",
      "sanitization_status": "synthetic",
      "linked_claim_ids": ["claim-role-changes"]
    }
  ],
  "evidence_to_claim_mappings": [
    {
      "claim_id": "claim-role-changes",
      "evidence_id": "evidence-role-lifecycle",
      "relationship": "supports",
      "expected_support": "supports"
    }
  ],
  "representative_sessions": [
    {
      "session_id": "session-role-created",
      "title": "Role created for analytics connector",
      "summary": "CreateRole and AttachRolePolicy appear with owner metadata.",
      "feature_highlights": ["CreateRole", "AttachRolePolicy"],
      "cluster_membership": {
        "cluster_id": "cluster-iam-029"
      },
      "flags": ["representative"],
      "linked_evidence_ids": ["evidence-role-lifecycle"]
    }
  ],
  "outlier_impostor_candidates": [],
  "neighbor_clusters": [],
  "metrics": {
    "temporal_stability": {
      "status": "unavailable",
      "reason": "The synthetic example covers one short review window."
    }
  },
  "provenance": {
    "provenance_id": "prov-synthetic-package",
    "source_system": "synthetic-fixture-generator",
    "source_artifact": "local synthetic package fixture",
    "generating_tool": "Telemetry Court test fixture",
    "generated_at": "2026-06-20T11:58:00.000Z",
    "references": [
      {
        "reference_id": "ref-synthetic-source",
        "reference_type": "synthetic_fixture_path",
        "uri": "lib/casePackageV01.test.ts"
      }
    ]
  },
  "sanitization": {
    "status": "synthetic",
    "method": "Generated safe fixture summaries with no raw restricted telemetry.",
    "redaction_notes": ["No real principals, accounts, or events are present."],
    "allowed_display_level": "summary_only",
    "raw_drilldown_allowed": false,
    "safe_reference_type": "synthetic_fixture_path"
  },
  "review_configuration": {
    "blind_review_enabled": true,
    "initially_hidden_label_ids": ["label-ai-suspicious-iam"],
    "required_review_stages": [
      "landscape",
      "case_file",
      "blind_review",
      "ai_reveal",
      "evidence_classification",
      "label_comparison",
      "outlier_impostor_review",
      "structured_verdict"
    ],
    "allowed_evidence_ratings": [
      "supports",
      "weak_support",
      "irrelevant",
      "contradicts",
      "insufficient",
      "needs_more_context"
    ],
    "allowed_verdicts": [
      "supported",
      "partially_supported",
      "unsupported_or_overclaimed",
      "uncertain",
      "cluster_impure",
      "needs_split",
      "needs_merge",
      "needs_better_evidence"
    ],
    "allowed_recommended_actions": [
      "accept_label",
      "rename_label",
      "broaden_label",
      "narrow_label",
      "split_cluster",
      "merge_cluster",
      "collect_more_evidence",
      "rerun_prompt",
      "rerun_embedding",
      "mark_uncertain"
    ],
    "required_reviewer_actions": [
      "choose_blind_interpretation",
      "reveal_ai_label",
      "rate_linked_evidence",
      "choose_label_winner",
      "choose_outlier_or_impostor",
      "choose_final_verdict",
      "choose_recommended_action"
    ]
  }
}
```

## Synthetic Versus Realistic Packages

Synthetic or demo packages may use:

- `reviewable_status: "synthetic_demo"`;
- `data_classification: "synthetic"`;
- unavailable metrics with explicit reasons;
- synthetic safe references;
- compact pipeline metadata.

Realistic or adapter-produced packages are expected to provide:

- honest dataset classification and approved-use notes;
- source environment and upstream run metadata;
- enough provenance to reconstruct the package-generation path;
- sanitization method, redaction notes, and allowed display level;
- stable claim, evidence, session, label, and cluster IDs;
- safe references instead of embedded raw restricted telemetry;
- explicit unavailable metrics rather than invented values.

## Runtime Validation Is Later

Runtime validation belongs to issue #48. Validation should later reject unsupported schema versions, broken IDs, missing provenance, invalid metric bounds, broken evidence links, unsafe drill-down references, and incomplete review configuration.

Issue #47 only defines the TypeScript contract, documentation, and minimal type/test coverage.
