# Toponymy / DataMapPlot / ACME4 Adapter Boundary

## Purpose

This note defines the adapter boundary before any real adapter exists.
Telemetry Court ingests approved, versioned `CasePackage` JSON. It does not
ingest raw restricted telemetry, execute upstream clustering systems, or claim
real Toponymy or ACME4 support until an adapter is implemented, validated, and
documented against the contract.

```text
upstream pipeline or notebook
-> precomputed cluster output
-> sanitized adapter input shape
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

## Toponymy/DataMapPlot-Style Adapter Input Shape

This section defines a Telemetry Court-owned intermediate input shape for a
future adapter. It is not an official Toponymy schema, not an official
DataMapPlot schema, not an ACME4 schema, and not an implemented import format.
It describes the precomputed, sanitized artifact an upstream pipeline or
notebook could hand to a future adapter before conversion into `CasePackage`
JSON.

```text
upstream pipeline or notebook
-> precomputed cluster output
-> sanitized adapter input shape
-> CasePackage JSON
-> Telemetry Court review
-> ReviewResult
-> EvaluationReport
```

The phrase "Toponymy/DataMapPlot-style" means shape-compatible inspiration:
named clusters or topics plus data-map positions and labels from an approved
upstream artifact. The official Toponymy README describes Toponymy as naming
places in information spaces and shows examples involving document vectors,
low-dimensional document maps, generated topic names, topic labels per
document, and DataMapPlot visualization. See
[TutteInstitute/toponymy `README.rst` Basic Usage](https://github.com/TutteInstitute/toponymy/blob/main/README.rst#basic-usage)
and
[Interactive Topic Visualization](https://github.com/TutteInstitute/toponymy/blob/main/README.rst#interactive-topic-visualization).
The official DataMapPlot README describes plots built from data-map
coordinates and point labels. See
[TutteInstitute/datamapplot `README.rst` Basic Usage](https://github.com/TutteInstitute/datamapplot/blob/main/README.rst#basic-usage).
Telemetry Court does not adopt those README examples as required APIs or
function signatures.

### Artifact Identity

A future adapter input artifact should include:

- `input_schema_version`: a Telemetry Court-owned version such as
  `adapter_input.toponymy_datamapplot_style.v0.1`.
- `artifact_id`: stable ID for the sanitized precomputed artifact.
- `created_at`: timestamp for the adapter input artifact, not review time.
- `source_kind`: one of `toponymy_style`, `datamapplot_style`,
  `combined_toponymy_datamapplot_style`, `synthetic`, or `other`.
- `conversion_target`: the intended CasePackage schema, currently
  `case_package.v0.1`.
- `limitations`: explicit notes about missing fields, synthetic data, or
  restricted source constraints.

The adapter input artifact is not itself a `CasePackage`, `ReviewResult`, or
`EvaluationReport`. It should be disposable after conversion because the
reviewable boundary remains the validated `CasePackage` JSON.

### Required Field Groups

A future converter needs the following groups to build a trustworthy
`CasePackage v0.1`:

- `dataset_context`: dataset ID or approved alias, dataset name, dataset type,
  data classification, source environment, approved use, approval notes when
  relevant, and limitations. This must say whether the artifact is synthetic,
  sanitized, restricted-derived, internal, or confidential.
- `pipeline_context`: upstream tool category, run ID when available,
  generated timestamp, pipeline version when available, embedding model,
  clustering method, dimensionality-reduction or map method, naming model,
  prompt reference or digest when available, and compact configuration summary.
- `clusters`: stable cluster IDs, cluster labels or names when available,
  cluster size, hierarchy references when available, membership references,
  cluster method metadata, and optional time range.
- `map_positions`: map ID, map tool label, coordinate space, coordinate units
  or normalization notes, and point positions linked to stable subject IDs.
  Points may reference sessions, evidence summaries, source objects, clusters,
  or centroids. If positions are unavailable, the artifact must say why.
- `labels`: stable label IDs, label text, label source, model/prompt/run
  references when available, rank or confidence when available, and linked
  claim IDs.
- `claims`: stable claim IDs, generated claim text, claim type, linked label
  IDs, linked evidence IDs, caveats or assumptions, and an explicit
  `evidence_status` of linked or missing.
- `evidence_references`: stable evidence IDs, safe title and summary,
  evidence type, safe or derived content, source reference, provenance
  reference, sanitization status, linked claim IDs, and linked session or point
  IDs when available.
- `evidence_to_claim_mappings`: explicit relationship records between claim
  IDs and evidence IDs. These producer expectations are not reviewer ratings.
- `representative_items`: stable session or object IDs, safe summaries,
  feature highlights, cluster membership metadata, flags such as
  representative, borderline, outlier candidate, impostor candidate, or needs
  context, and linked evidence IDs when available.
- `neighbor_clusters`: neighboring cluster IDs, labels or names when
  available, distance or similarity when available, and a reason the neighbor
  matters for label review.
- `outlier_impostor_candidates`: stable candidate IDs, session/evidence
  references, safe reason, score when available, and expected review use.
- `metrics`: available bounded metrics or explicit unavailable reasons for
  coherence, feature distinctiveness, evidence coverage, model agreement,
  uncertainty, outlier score, and temporal stability when those concepts exist
  in the upstream artifact.
- `provenance`: source system, source artifact, generating tool, generated
  timestamp, upstream run ID when available, adapter-input generation notes,
  safe artifact references, and owner or contact metadata when allowed.
- `sanitization`: sanitization status, method, redaction notes, allowed display
  level, raw drill-down permission, safe reference type, and notes on what has
  been removed or transformed.

IDs must be stable strings, not array indexes or raw restricted identifiers.
References must be resolvable within the artifact or explicitly marked as
unavailable. Broken IDs or links should block future conversion instead of
becoming warnings inside the review UI.

### Unknown And Unavailable Fields

Unknown and unavailable values must remain honest. A future adapter should not
invent cluster sizes, coordinates, model names, prompt identifiers, evidence
links, confidence scores, provenance, or sanitization details to make a package
look complete.

Use an explicit unavailable envelope for optional metrics or metadata:

```json
{
  "status": "unavailable",
  "reason": "The approved upstream artifact did not preserve repeated-run stability metadata."
}
```

Use an explicit unknown envelope when the value may exist upstream but cannot be
confirmed from the approved artifact:

```json
{
  "status": "unknown",
  "reason": "The sanitized export did not include a naming-model identifier."
}
```

If a value is required for `CasePackage` conversion and is unavailable, the
converter should fail loudly with an actionable error. It should not use
placeholder strings such as `unknown-model`, `cluster-0`, `label`, or fake
coordinates merely to pass validation.

### Minimal Synthetic Adapter Input Sketch

The following JSON is intentionally synthetic, sanitized, and non-authoritative.
It illustrates the intermediate shape only; it is not real Toponymy output, not
real DataMapPlot output, not real ACME4 output, and not a fixture for issue
#63 or #64.

```json
{
  "input_schema_version": "adapter_input.toponymy_datamapplot_style.v0.1",
  "artifact_id": "adapter-input-synthetic-cluster-001",
  "created_at": "2026-06-21T12:00:00.000Z",
  "source_kind": "combined_toponymy_datamapplot_style",
  "conversion_target": "case_package.v0.1",
  "limitations": [
    "Synthetic documentation sketch only.",
    "No raw telemetry, real Toponymy output, real DataMapPlot output, or ACME4-derived data is included."
  ],
  "dataset_context": {
    "dataset_id": "dataset-synthetic-sanitized-adapter-input",
    "dataset_name": "Synthetic Sanitized Adapter Input",
    "dataset_type": "synthetic",
    "data_classification": "synthetic",
    "source_environment": "local-documentation",
    "approved_use": "Documentation sketch for future adapter-input conversion.",
    "limitations": [
      "Safe summaries only.",
      "No raw source events are present."
    ]
  },
  "pipeline_context": {
    "upstream_tool_category": "toponymy_datamapplot_style_notebook",
    "run_id": "run-synthetic-adapter-input-2026-06-21",
    "generated_at": "2026-06-21T11:58:00.000Z",
    "embedding_model": {
      "status": "unavailable",
      "reason": "Synthetic sketch does not represent a real embedding run."
    },
    "clustering_method": "synthetic-precomputed-clustering",
    "dimensionality_reduction_method": "synthetic-2d-map",
    "naming_model": {
      "status": "unknown",
      "reason": "The sketch avoids claiming a real upstream naming model."
    },
    "config_summary": "Synthetic precomputed cluster and map-position summary."
  },
  "clusters": [
    {
      "cluster_id": "cluster-synthetic-042",
      "cluster_label": "Synthetic access-change activity",
      "cluster_size": 42,
      "member_subject_ids": [
        "subject-synthetic-001",
        "subject-synthetic-002"
      ],
      "cluster_method": {
        "method": "synthetic-precomputed-clustering"
      }
    }
  ],
  "map_positions": {
    "map_id": "map-synthetic-001",
    "map_tool": "datamapplot-style-synthetic-map",
    "coordinate_space": "synthetic-normalized-2d",
    "points": [
      {
        "point_id": "point-synthetic-001",
        "subject_id": "subject-synthetic-001",
        "cluster_id": "cluster-synthetic-042",
        "x": 0.42,
        "y": 0.31
      }
    ]
  },
  "labels": [
    {
      "label_id": "label-synthetic-access-change",
      "label": "Possible risky access change",
      "source": "ai_generated",
      "run_id": "run-synthetic-adapter-input-2026-06-21",
      "linked_claim_ids": [
        "claim-synthetic-access-change"
      ]
    }
  ],
  "claims": [
    {
      "claim_id": "claim-synthetic-access-change",
      "text": "The cluster contains access-change activity that may require review.",
      "claim_type": "behavioral_summary",
      "linked_label_ids": [
        "label-synthetic-access-change"
      ],
      "linked_evidence_ids": [
        "evidence-synthetic-feature-summary"
      ],
      "evidence_status": "linked"
    }
  ],
  "evidence_references": [
    {
      "evidence_id": "evidence-synthetic-feature-summary",
      "title": "Synthetic feature summary",
      "summary": "Derived feature counts summarize synthetic access-change activity.",
      "evidence_type": "derived_table",
      "content": {
        "content_type": "structured_summary",
        "fields": {
          "synthetic_feature_count": 17,
          "raw_events_included": false
        }
      },
      "source_reference": {
        "source_id": "source-synthetic-derived-table",
        "source_type": "derived_feature_summary",
        "safe_reference": {
          "reference_id": "ref-synthetic-derived-table",
          "reference_type": "source_artifact_id",
          "artifact_id": "synthetic-adapter-input/table-001"
        }
      },
      "provenance_reference": "prov-synthetic-adapter-input",
      "sanitization_status": "synthetic",
      "linked_claim_ids": [
        "claim-synthetic-access-change"
      ],
      "linked_subject_ids": [
        "subject-synthetic-001"
      ]
    }
  ],
  "evidence_to_claim_mappings": [
    {
      "claim_id": "claim-synthetic-access-change",
      "evidence_id": "evidence-synthetic-feature-summary",
      "relationship": "weak_support",
      "rationale": "The derived summary shows activity type, but does not prove intent."
    }
  ],
  "representative_items": [
    {
      "subject_id": "subject-synthetic-001",
      "title": "Synthetic representative subject",
      "summary": "A safe summary of one synthetic item near the cluster center.",
      "feature_highlights": [
        "access-change",
        "review-context"
      ],
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
        "evidence-synthetic-feature-summary"
      ]
    }
  ],
  "neighbor_clusters": [],
  "outlier_impostor_candidates": [],
  "metrics": {
    "evidence_coverage": {
      "status": "available",
      "value": 0.58,
      "min": 0,
      "max": 1,
      "interpretation": "higher_is_better",
      "notes": "Synthetic documentation value only."
    },
    "temporal_stability": {
      "status": "unavailable",
      "reason": "The synthetic sketch does not include repeated upstream runs."
    }
  },
  "provenance": {
    "provenance_id": "prov-synthetic-adapter-input",
    "source_system": "synthetic-upstream-notebook",
    "source_artifact": "synthetic-adapter-input/artifact-001",
    "generating_tool": "manual-documentation-sketch",
    "generated_at": "2026-06-21T11:58:00.000Z",
    "references": [
      {
        "reference_id": "ref-synthetic-adapter-input",
        "reference_type": "source_artifact_id",
        "artifact_id": "synthetic-adapter-input/artifact-001",
        "notes": "Synthetic source artifact only."
      }
    ]
  },
  "sanitization": {
    "status": "synthetic",
    "method": "Generated safe documentation sketch.",
    "redaction_notes": [
      "No real account, principal, host, network, or event identifiers are present."
    ],
    "allowed_display_level": "summary_only",
    "raw_drilldown_allowed": false,
    "safe_reference_type": "source_artifact_id"
  }
}
```

## Adapter Responsibilities

A future adapter should:

1. Run upstream processing inside the approved environment for the source data.
2. Export or receive a sanitized adapter input artifact with the field groups
   above.
3. Select a precomputed cluster and generated interpretation to review.
4. Convert only approved output into `CasePackage v0.1` JSON.
5. Preserve stable package, cluster, label, claim, evidence, and session IDs.
6. Preserve evidence-to-claim mappings as explicit contract data.
7. Include dataset, pipeline, provenance, and sanitization metadata.
8. Include safe summaries, derived features, aggregate statistics, or permitted
   drill-down references instead of raw restricted telemetry.
9. Mark missing or unavailable metrics explicitly instead of inventing values.
10. Run package validation before review.

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

## Local Synthetic Toponymy-Style Fixture

Issue #63 adds one local fixture at
`data/syntheticToponymyStyleCasePackageFixture.ts` that exercises this boundary
without implementing a real adapter. It contains a Telemetry Court-owned,
synthetic Toponymy/DataMapPlot-style input artifact and a fixture-only helper
that emits one `CasePackage v0.1` object.

The fixture is intentionally non-authoritative:

- it does not execute Toponymy or DataMapPlot;
- it is not official Toponymy output, official DataMapPlot output, ACME4
  output, or a supported import format;
- it does not define or imply upstream APIs, function signatures, models,
  workflows, or output schemas;
- it includes only synthetic summaries, synthetic map positions, synthetic
  labels, safe source-artifact references, provenance metadata, and
  sanitization metadata;
- it validates through `validateCasePackageV01` before tests use it.

This fixture is useful for proving that a Toponymy/DataMapPlot-style precomputed
artifact can be represented at the `CasePackage` boundary. It is not a general
adapter framework, upload flow, backend import service, raw telemetry ingestion
path, or claim of current Toponymy support.

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
