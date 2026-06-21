# Toponymy / ACME4 Adapter Boundary

## Purpose

This note defines the adapter boundary before any real adapter exists.
Telemetry Court ingests approved, versioned `CasePackage` JSON. It does not
ingest raw restricted telemetry, execute upstream clustering systems, or claim
real Toponymy or ACME4 support until an adapter is implemented, validated, and
documented against the contract.

```text
upstream pipeline or notebook
-> precomputed cluster output
-> CasePackage JSON
-> Telemetry Court review
-> ReviewResult
-> EvaluationReport
```

The upstream side owns telemetry collection, sessionization, embedding,
projection, clustering, evidence extraction, and initial label generation.
Telemetry Court owns package validation, evidence-grounded review, structured
human judgments, and evaluation output.

## Possible Upstream Producers

An adapter may eventually be written for any approved upstream producer that can
emit the `CasePackage v0.1` contract. Possible producer categories include:

- Toponymy or Toponymy-style cluster naming workflows, with factual Toponymy
  claims grounded only in the official
  [TutteInstitute/toponymy](https://github.com/TutteInstitute/toponymy)
  repository.
- DataMapPlot or DataMapPlot-adjacent projection artifacts that provide
  cluster-map coordinates or neighborhood context.
- ACME4-style experiments processed inside an authorized environment.
- CloudTrail-style experiments processed as approved, sanitized summaries or
  synthetic fixtures.
- Synthetic or sanitized package generators used for local testing and demos.

These producer categories do not mean the repository currently supports real
Toponymy execution, real ACME4 ingestion, DataMapPlot execution, raw telemetry
loading, or live telemetry workflows.

## Adapter Responsibilities

A future adapter should:

1. Run upstream processing inside the approved environment for the source data.
2. Select a precomputed cluster and generated interpretation to review.
3. Convert only approved output into `CasePackage v0.1` JSON.
4. Preserve stable package, cluster, label, claim, evidence, and session IDs.
5. Preserve evidence-to-claim mappings as explicit contract data.
6. Include dataset, pipeline, provenance, and sanitization metadata.
7. Include safe summaries, derived features, aggregate statistics, or permitted
   drill-down references instead of raw restricted telemetry.
8. Mark missing or unavailable metrics explicitly instead of inventing values.
9. Run package validation before review.

The adapter output is the product boundary. Reviewers should be able to audit
what package was reviewed without needing Telemetry Court to resolve raw source
data.

## Explicit Non-Claims

The repository must not claim any of the following until implemented and
validated:

- real Toponymy integration or execution;
- real ACME4 support or ingestion;
- DataMapPlot execution;
- raw restricted telemetry import;
- live telemetry ingestion, SIEM, SOC, EDR, alert triage, or incident response;
- backend persistence, upload flows, auth, scoring, adjudication, consensus, or
  chatbot behavior as part of this adapter boundary.

Use wording such as "future adapter source", "adapter-produced
`CasePackage`", "approved upstream output", and "synthetic or sanitized
package" until real support exists.

## Minimal Adapter-Produced Package Example

The following JSON is intentionally synthetic and sanitized. It shows the shape
an adapter would emit after upstream processing has already happened. It is not
real ACME4 output, not real Toponymy output, and not evidence that either
integration exists.

```json
{
  "schema_version": "case_package.v0.1",
  "package_id": "pkg-synthetic-adapter-boundary-001",
  "created_at": "2026-06-21T12:00:00.000Z",
  "package_revision": "r1",
  "case": {
    "case_id": "case-synthetic-adapter-boundary-001",
    "title": "Synthetic sanitized cluster-label review",
    "summary": "A synthetic upstream notebook has produced a cluster label that needs evidence review.",
    "reviewable_status": "synthetic_demo",
    "review_intent": "validate_label",
    "limitations": [
      "Synthetic example only.",
      "Not real Toponymy, ACME4, DataMapPlot, or CloudTrail output."
    ]
  },
  "dataset": {
    "dataset_id": "dataset-synthetic-sanitized-adapter",
    "dataset_name": "Synthetic Sanitized Adapter Fixture",
    "dataset_type": "cloudtrail",
    "data_classification": "synthetic",
    "source_environment": "local-fixture",
    "approved_use": "Documentation example for the CasePackage adapter boundary.",
    "approval_notes": "No real telemetry, accounts, principals, hosts, or events are included.",
    "limitations": [
      "No raw restricted telemetry is included.",
      "Safe references identify synthetic source artifacts only."
    ]
  },
  "cluster": {
    "cluster_id": "cluster-synthetic-042",
    "cluster_name": "Synthetic access-change activity",
    "upstream_cluster_label": "Possible risky access change",
    "cluster_size": 42,
    "embedding_map": {
      "map_id": "map-synthetic-adapter-001",
      "map_tool": "datamapplot-style-synthetic-projection",
      "coordinate_space": "synthetic-2d",
      "coordinates": {
        "x": 0.42,
        "y": 0.31
      }
    },
    "cluster_method": {
      "method": "precomputed-synthetic-clustering-export",
      "parameters": {
        "source": "synthetic-doc-example"
      }
    }
  },
  "pipeline": {
    "pipeline_id": "pipeline-synthetic-adapter-boundary",
    "run_id": "run-synthetic-adapter-boundary-2026-06-21",
    "upstream_tool": "synthetic-upstream-notebook",
    "pipeline_version": "0.1.0",
    "embedding_model": "synthetic-embedding-summary",
    "clustering_method": "precomputed-synthetic-clustering-export",
    "dimensionality_reduction_method": "datamapplot-style-synthetic-projection",
    "naming_model": "synthetic-labeler",
    "prompt": {
      "prompt_id": "prompt-synthetic-labeler-v1",
      "prompt_summary": "Generate a concise label from sanitized cluster summaries."
    },
    "generated_at": "2026-06-21T11:58:00.000Z",
    "config_summary": "Synthetic adapter-boundary example with no raw restricted telemetry."
  },
  "candidate_labels": [
    {
      "label_id": "label-synthetic-risky-access-change",
      "label": "Possible risky access change",
      "source": "ai_generated",
      "model_reference": "synthetic-labeler",
      "prompt_reference": "prompt-synthetic-labeler-v1",
      "run_id": "run-synthetic-adapter-boundary-2026-06-21",
      "linked_claim_ids": [
        "claim-access-change"
      ]
    }
  ],
  "claims": [
    {
      "claim_id": "claim-access-change",
      "text": "The cluster contains access-change activity that may require review.",
      "claim_type": "behavioral_summary",
      "linked_evidence_ids": [
        "evidence-access-change-summary"
      ],
      "linked_label_ids": [
        "label-synthetic-risky-access-change"
      ],
      "evidence_status": "linked"
    }
  ],
  "evidence_items": [
    {
      "evidence_id": "evidence-access-change-summary",
      "title": "Synthetic access-change feature summary",
      "summary": "Derived feature counts show synthetic access-change events grouped in the cluster.",
      "evidence_type": "derived_table",
      "content": {
        "content_type": "structured_summary",
        "fields": {
          "synthetic_feature_count": 17,
          "synthetic_session_count": 42,
          "raw_events_included": false
        }
      },
      "source_reference": {
        "source_id": "source-synthetic-derived-table",
        "source_type": "derived_feature_summary",
        "safe_reference": {
          "reference_id": "ref-synthetic-derived-table",
          "reference_type": "source_artifact_id",
          "artifact_id": "synthetic-adapter-output/table-001",
          "notes": "Synthetic source artifact only; not raw telemetry."
        }
      },
      "provenance_reference": "prov-synthetic-adapter-boundary",
      "sanitization_status": "synthetic",
      "linked_session_ids": [
        "session-synthetic-representative-001"
      ],
      "linked_claim_ids": [
        "claim-access-change"
      ]
    }
  ],
  "evidence_to_claim_mappings": [
    {
      "claim_id": "claim-access-change",
      "evidence_id": "evidence-access-change-summary",
      "relationship": "weak_support",
      "expected_support": "weak_support",
      "rationale": "The derived summary shows activity type, but does not prove intent."
    }
  ],
  "representative_sessions": [
    {
      "session_id": "session-synthetic-representative-001",
      "title": "Synthetic representative access-change session",
      "summary": "A safe summary of a synthetic session near the cluster center.",
      "feature_highlights": [
        "access-change",
        "review-context"
      ],
      "safe_reference": {
        "reference_id": "ref-session-synthetic-representative-001",
        "reference_type": "source_artifact_id",
        "artifact_id": "synthetic-adapter-output/session-001",
        "notes": "Synthetic source artifact only; no raw event payload."
      },
      "cluster_membership": {
        "cluster_id": "cluster-synthetic-042",
        "membership_score": {
          "status": "available",
          "value": 0.76,
          "min": 0,
          "max": 1,
          "interpretation": "higher_is_better"
        }
      },
      "flags": [
        "representative"
      ],
      "linked_evidence_ids": [
        "evidence-access-change-summary"
      ]
    }
  ],
  "outlier_impostor_candidates": [],
  "neighbor_clusters": [],
  "metrics": {
    "evidence_coverage": {
      "status": "available",
      "value": 0.58,
      "min": 0,
      "max": 1,
      "interpretation": "higher_is_better",
      "notes": "Synthetic example metric for documentation only."
    },
    "temporal_stability": {
      "status": "unavailable",
      "reason": "The synthetic example does not include repeated upstream runs."
    }
  },
  "provenance": {
    "provenance_id": "prov-synthetic-adapter-boundary",
    "source_system": "synthetic-upstream-notebook",
    "source_artifact": "synthetic-adapter-output/package-source",
    "generating_tool": "synthetic-case-package-adapter",
    "generated_at": "2026-06-21T11:58:00.000Z",
    "upstream_run_id": "run-synthetic-adapter-boundary-2026-06-21",
    "adapter_name": "synthetic-case-package-adapter",
    "adapter_version": "0.1.0",
    "references": [
      {
        "reference_id": "ref-synthetic-upstream-run",
        "reference_type": "source_artifact_id",
        "artifact_id": "synthetic-adapter-output/run-001",
        "notes": "Synthetic adapter example; not an ACME4 or Toponymy artifact."
      }
    ],
    "owner": {
      "team": "Telemetry Court"
    }
  },
  "sanitization": {
    "status": "synthetic",
    "method": "Generated safe fixture summaries with no raw restricted telemetry.",
    "redaction_notes": [
      "No real account, principal, host, network, or event identifiers are present."
    ],
    "allowed_display_level": "summary_only",
    "raw_drilldown_allowed": false,
    "safe_reference_type": "source_artifact_id",
    "notes": "Use sanitized or approved-internal metadata for realistic packages."
  },
  "review_configuration": {
    "blind_review_enabled": true,
    "initially_hidden_label_ids": [
      "label-synthetic-risky-access-change"
    ],
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

## Handoff To Telemetry Court

Once an adapter emits a package, Telemetry Court should treat the package as an
unknown input and run the runtime validator before review. Invalid schema
versions, broken IDs, missing provenance, missing sanitization metadata, invalid
safe references, or broken claim-to-evidence links should block review rather
than appear as optional UI warnings.

The review result should reference the exact package identity and pipeline
metadata that were reviewed. Aggregation should use compatible `ReviewResult`
objects to produce an `EvaluationReport`; it should not reach back into raw
telemetry or rewrite the package after review.
