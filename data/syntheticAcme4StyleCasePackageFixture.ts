import { validateCasePackageV01 } from "@/lib/casePackageValidation";
import {
  CASE_PACKAGE_V01_EVIDENCE_RATINGS,
  CASE_PACKAGE_V01_RECOMMENDED_ACTIONS,
  CASE_PACKAGE_V01_REQUIRED_REVIEWER_ACTIONS,
  CASE_PACKAGE_V01_REQUIRED_REVIEW_STAGES,
  CASE_PACKAGE_V01_SCHEMA_VERSION,
  CASE_PACKAGE_V01_VERDICTS,
  type CasePackageMetricV01,
  type CasePackageV01,
} from "@/lib/types";

const FIXTURE_CREATED_AT = "2026-06-21T13:00:00.000Z";
const FIXTURE_GENERATED_AT = "2026-06-21T12:54:00.000Z";
const FIXTURE_RUN_ID = "run-synthetic-acme4-style-2026-06-21";
const FIXTURE_PROVENANCE_ID = "prov-synthetic-acme4-style-fixture";

export const syntheticAcme4StyleAdapterInputFixture = {
  input_schema_version: "adapter_input.acme4_style_sanitized.v0.1",
  artifact_id: "adapter-input-synthetic-acme4-style-access-review-001",
  created_at: FIXTURE_CREATED_AT,
  source_kind: "acme4_style_synthetic_sanitized",
  conversion_target: CASE_PACKAGE_V01_SCHEMA_VERSION,
  limitations: [
    "Synthetic ACME4-style fixture only; sanitized, non-authoritative adapter-boundary test data.",
    "This is not real ACME4 output, real Toponymy output, real DataMapPlot output, or raw telemetry.",
    "No ACME4 schema, API, ingestion workflow, execution output, or restricted source format is represented.",
  ],
  dataset_context: {
    dataset_id: "dataset-synthetic-acme4-style-access-summaries",
    dataset_name: "Synthetic ACME4-Style Sanitized Fixture",
    dataset_type: "synthetic",
    data_classification: "synthetic",
    source_environment: "local-fixture",
    approved_use:
      "Contract testing for a synthetic, sanitized ACME4-style CasePackage boundary.",
    limitations: [
      "No raw restricted telemetry is included.",
      "Safe references identify synthetic source artifacts only.",
      "Feature families and counts are synthetic placeholders.",
    ],
  },
  pipeline_context: {
    upstream_tool_category: "synthetic-acme4-style-precomputed-artifact",
    run_id: FIXTURE_RUN_ID,
    generated_at: FIXTURE_GENERATED_AT,
    embedding_model: {
      status: "unavailable",
      reason: "The fixture is synthetic and does not represent a real embedding run.",
    },
    clustering_method: "synthetic-precomputed-acme4-style-clustering",
    dimensionality_reduction_method: "synthetic-review-plane",
    naming_model: {
      status: "unknown",
      reason:
        "The fixture intentionally avoids claiming a real ACME4 naming model.",
    },
    config_summary:
      "Synthetic ACME4-style precomputed cluster, labels, and sanitized evidence summaries.",
  },
  clusters: [
    {
      cluster_id: "cluster-synthetic-acme4-access-023",
      cluster_label: "Synthetic ACME4-style access update cluster",
      cluster_size: 5,
      member_subject_ids: [
        "subject-synthetic-acme4-001",
        "subject-synthetic-acme4-002",
        "subject-synthetic-acme4-003",
        "subject-synthetic-acme4-004",
        "subject-synthetic-acme4-005",
      ],
      cluster_method: {
        method: "synthetic-precomputed-acme4-style-clustering",
        parameters: {
          synthetic_fixture: true,
          restricted_values_removed: true,
        },
      },
    },
  ],
  map_positions: {
    map_id: "map-synthetic-acme4-style-001",
    map_tool: "synthetic-review-plane",
    coordinate_space: "synthetic-normalized-2d",
    points: [
      {
        point_id: "point-synthetic-acme4-001",
        subject_id: "subject-synthetic-acme4-001",
        cluster_id: "cluster-synthetic-acme4-access-023",
        x: 0.22,
        y: 0.64,
      },
      {
        point_id: "point-synthetic-acme4-002",
        subject_id: "subject-synthetic-acme4-002",
        cluster_id: "cluster-synthetic-acme4-access-023",
        x: 0.27,
        y: 0.61,
      },
      {
        point_id: "point-synthetic-acme4-003",
        subject_id: "subject-synthetic-acme4-003",
        cluster_id: "cluster-synthetic-acme4-access-023",
        x: 0.25,
        y: 0.68,
      },
      {
        point_id: "point-synthetic-acme4-004",
        subject_id: "subject-synthetic-acme4-004",
        cluster_id: "cluster-synthetic-acme4-access-023",
        x: 0.32,
        y: 0.58,
      },
      {
        point_id: "point-synthetic-acme4-005",
        subject_id: "subject-synthetic-acme4-005",
        cluster_id: "cluster-synthetic-acme4-access-023",
        x: 0.41,
        y: 0.53,
      },
    ],
  },
  labels: [
    {
      label_id: "label-synthetic-acme4-access-change",
      label: "Coordinated access change",
      source: "ai_generated",
      run_id: FIXTURE_RUN_ID,
      linked_claim_ids: [
        "claim-synthetic-acme4-access-update",
        "claim-synthetic-acme4-approval-context",
        "claim-synthetic-acme4-intent-caveat",
      ],
    },
    {
      label_id: "label-synthetic-acme4-planned-change",
      label: "Planned service access update",
      source: "human_baseline",
      linked_claim_ids: [
        "claim-synthetic-acme4-access-update",
        "claim-synthetic-acme4-approval-context",
      ],
    },
  ],
  claims: [
    {
      claim_id: "claim-synthetic-acme4-access-update",
      text:
        "The synthetic cluster groups subjects with access-update feature summaries.",
      claim_type: "behavioral_summary",
      linked_label_ids: [
        "label-synthetic-acme4-access-change",
        "label-synthetic-acme4-planned-change",
      ],
      linked_evidence_ids: ["evidence-synthetic-acme4-aggregate-summary"],
      evidence_status: "linked",
    },
    {
      claim_id: "claim-synthetic-acme4-approval-context",
      text:
        "The synthetic evidence includes approval-context summaries for most subjects.",
      claim_type: "cluster_quality",
      linked_label_ids: [
        "label-synthetic-acme4-access-change",
        "label-synthetic-acme4-planned-change",
      ],
      linked_evidence_ids: [
        "evidence-synthetic-acme4-approval-summary",
        "evidence-synthetic-acme4-neighbor-context",
      ],
      evidence_status: "linked",
    },
    {
      claim_id: "claim-synthetic-acme4-intent-caveat",
      text:
        "The synthetic package does not prove risky intent from the sanitized summaries.",
      claim_type: "negative_evidence",
      linked_label_ids: ["label-synthetic-acme4-access-change"],
      linked_evidence_ids: ["evidence-synthetic-acme4-intent-gap"],
      evidence_status: "linked",
    },
  ],
  evidence_references: [
    {
      evidence_id: "evidence-synthetic-acme4-aggregate-summary",
      title: "Synthetic ACME4-style aggregate feature summary",
      summary:
        "Sanitized aggregate counts summarize synthetic access-update feature families across five subjects.",
      evidence_type: "aggregate_statistic",
      linked_claim_ids: ["claim-synthetic-acme4-access-update"],
      linked_subject_ids: ["subject-synthetic-acme4-001"],
    },
    {
      evidence_id: "evidence-synthetic-acme4-approval-summary",
      title: "Synthetic approval-context summary",
      summary:
        "Safe summaries indicate that four synthetic subjects carry planned-change context.",
      evidence_type: "event_summary",
      linked_claim_ids: ["claim-synthetic-acme4-approval-context"],
      linked_subject_ids: ["subject-synthetic-acme4-001"],
    },
    {
      evidence_id: "evidence-synthetic-acme4-intent-gap",
      title: "Synthetic intent evidence gap",
      summary:
        "The sanitized fixture includes no evidence that would prove risky intent.",
      evidence_type: "analyst_note",
      linked_claim_ids: ["claim-synthetic-acme4-intent-caveat"],
      linked_subject_ids: ["subject-synthetic-acme4-005"],
    },
    {
      evidence_id: "evidence-synthetic-acme4-neighbor-context",
      title: "Synthetic neighbor context",
      summary:
        "A nearby synthetic service-change cluster overlaps on approval context but not on access-update features.",
      evidence_type: "neighbor_comparison",
      linked_claim_ids: ["claim-synthetic-acme4-approval-context"],
      linked_subject_ids: ["subject-synthetic-acme4-005"],
    },
  ],
  evidence_to_claim_mappings: [
    {
      claim_id: "claim-synthetic-acme4-access-update",
      evidence_id: "evidence-synthetic-acme4-aggregate-summary",
      relationship: "supports",
      rationale:
        "The aggregate summary directly matches the narrow access-update claim.",
    },
    {
      claim_id: "claim-synthetic-acme4-approval-context",
      evidence_id: "evidence-synthetic-acme4-approval-summary",
      relationship: "supports",
      rationale:
        "The approval-context summary supports a planned-change interpretation.",
    },
    {
      claim_id: "claim-synthetic-acme4-intent-caveat",
      evidence_id: "evidence-synthetic-acme4-intent-gap",
      relationship: "contradicts",
      rationale:
        "The absence of intent evidence contradicts a confident risky-intent reading.",
    },
    {
      claim_id: "claim-synthetic-acme4-approval-context",
      evidence_id: "evidence-synthetic-acme4-neighbor-context",
      relationship: "context",
      rationale:
        "The neighbor comparison helps reviewers judge whether the label is too broad.",
    },
  ],
  representative_items: [
    {
      subject_id: "subject-synthetic-acme4-001",
      title: "Synthetic representative access-update subject",
      summary:
        "A safe summary of one synthetic subject near the cluster center.",
      feature_highlights: [
        "access-update",
        "approval-context",
        "service-change",
      ],
      membership_score: 0.81,
      flags: ["representative"],
      linked_evidence_ids: [
        "evidence-synthetic-acme4-aggregate-summary",
        "evidence-synthetic-acme4-approval-summary",
      ],
    },
    {
      subject_id: "subject-synthetic-acme4-005",
      title: "Synthetic borderline service-change subject",
      summary:
        "A safe summary of a synthetic subject closer to the neighboring service-change cluster.",
      feature_highlights: ["approval-context", "neighbor-like"],
      membership_score: 0.43,
      flags: ["borderline", "needs_context"],
      linked_evidence_ids: [
        "evidence-synthetic-acme4-intent-gap",
        "evidence-synthetic-acme4-neighbor-context",
      ],
    },
  ],
  neighbor_clusters: [
    {
      neighbor_cluster_id: "cluster-synthetic-acme4-service-neighbor",
      label: "Synthetic planned service change",
      distance: 0.31,
      reason_this_neighbor_matters:
        "It shares approval context and may make the access-change label over-specific.",
    },
  ],
  outlier_impostor_candidates: [
    {
      candidate_id: "candidate-synthetic-acme4-borderline-005",
      subject_id: "subject-synthetic-acme4-005",
      reason:
        "Borderline position and neighbor-like features make this useful for cluster-purity review.",
      score: 0.57,
    },
  ],
  metrics: {
    cluster_coherence: 0.68,
    evidence_coverage: 0.64,
    uncertainty: 0.44,
    temporal_stability: {
      status: "unavailable",
      reason: "The synthetic fixture does not include repeated upstream runs.",
    },
  },
  provenance: {
    provenance_id: FIXTURE_PROVENANCE_ID,
    source_system: "telemetry-court-synthetic-acme4-style-fixtures",
    source_artifact: "data/syntheticAcme4StyleCasePackageFixture.ts",
    generating_tool: "synthetic-acme4-style-fixture-converter",
    generated_at: FIXTURE_GENERATED_AT,
    upstream_run_id: FIXTURE_RUN_ID,
  },
  sanitization: {
    status: "synthetic",
    method:
      "Generated synthetic sanitized summaries with no raw restricted telemetry.",
    redaction_notes: [
      "No real account, principal, network, environment, or event identifiers are present.",
      "Feature families, counts, labels, and source references are synthetic.",
    ],
    allowed_display_level: "summary_only",
    raw_drilldown_allowed: false,
    safe_reference_type: "source_artifact_id",
    notes:
      "Fixture is non-authoritative and suitable only for local contract testing.",
  },
} as const;

type SyntheticAcme4StyleAdapterInputFixture =
  typeof syntheticAcme4StyleAdapterInputFixture;

// Fixture-only conversion: this does not implement real ACME4 support or ingestion.
export function createSyntheticAcme4StyleCasePackageV01(
  input: SyntheticAcme4StyleAdapterInputFixture,
): CasePackageV01 {
  const cluster = input.clusters[0];
  const firstMapPoint = input.map_positions.points[0];

  return {
    schema_version: CASE_PACKAGE_V01_SCHEMA_VERSION,
    package_id: "pkg-synthetic-acme4-style-access-review-001",
    created_at: input.created_at,
    package_revision: "r1",
    case: {
      case_id: "case-synthetic-acme4-style-access-review-001",
      title: "Synthetic ACME4-style access-change review",
      summary:
        "A synthetic, sanitized ACME4-style artifact has been converted into a CasePackage-shaped fixture.",
      reviewable_status: "synthetic_demo",
      review_intent: "validate_label",
      limitations: [
        "Synthetic, sanitized, non-authoritative fixture only.",
        "Not real ACME4 output, real Toponymy output, real DataMapPlot output, or raw telemetry.",
        "Does not claim compatibility with ACME4 schemas, APIs, restricted data, outputs, ingestion workflows, or support.",
      ],
    },
    dataset: {
      dataset_id: input.dataset_context.dataset_id,
      dataset_name: input.dataset_context.dataset_name,
      dataset_type: input.dataset_context.dataset_type,
      data_classification: input.dataset_context.data_classification,
      source_environment: input.dataset_context.source_environment,
      approved_use: input.dataset_context.approved_use,
      limitations: [...input.dataset_context.limitations],
    },
    cluster: {
      cluster_id: cluster.cluster_id,
      cluster_name: cluster.cluster_label,
      upstream_cluster_label: input.labels[0].label,
      cluster_size: cluster.cluster_size,
      embedding_map: {
        map_id: input.map_positions.map_id,
        map_tool: input.map_positions.map_tool,
        coordinate_space: input.map_positions.coordinate_space,
        coordinates: {
          x: firstMapPoint.x,
          y: firstMapPoint.y,
        },
      },
      cluster_method: {
        method: cluster.cluster_method.method,
        parameters: { ...cluster.cluster_method.parameters },
      },
    },
    pipeline: {
      pipeline_id: "pipeline-synthetic-acme4-style-fixture",
      run_id: input.pipeline_context.run_id,
      upstream_tool: "synthetic-acme4-style-fixture",
      pipeline_version: "0.1.0",
      clustering_method: input.pipeline_context.clustering_method,
      dimensionality_reduction_method:
        input.pipeline_context.dimensionality_reduction_method,
      prompt: {
        prompt_id: "prompt-synthetic-acme4-style-fixture-v1",
        prompt_summary:
          "Synthetic fixture prompt placeholder; not an upstream ACME4 prompt.",
      },
      generated_at: input.pipeline_context.generated_at,
      config_summary: input.pipeline_context.config_summary,
    },
    candidate_labels: input.labels.map((label, index) => ({
      label_id: label.label_id,
      label: label.label,
      source: label.source,
      run_id: "run_id" in label ? label.run_id : undefined,
      confidence:
        label.source === "ai_generated"
          ? availableMetric(0.56, "higher_is_better")
          : {
              status: "unavailable",
              reason: "Synthetic human baseline label is not model-scored.",
            },
      rank: index + 1,
      linked_claim_ids: [...label.linked_claim_ids],
      rationale:
        label.source === "ai_generated"
          ? "Synthetic generated label for ACME4-style contract testing only."
          : "Synthetic baseline label for comparison in the review protocol.",
    })),
    claims: input.claims.map((claim, index) => ({
      claim_id: claim.claim_id,
      text: claim.text,
      claim_type: claim.claim_type,
      linked_evidence_ids: [...claim.linked_evidence_ids],
      linked_label_ids: [...claim.linked_label_ids],
      confidence: availableMetric(
        index === 0 ? 0.74 : index === 1 ? 0.61 : 0.49,
        "higher_is_better",
      ),
      caveats:
        claim.claim_id === "claim-synthetic-acme4-intent-caveat"
          ? ["The fixture cannot prove intent from sanitized summaries."]
          : undefined,
      evidence_status: claim.evidence_status,
    })),
    evidence_items: input.evidence_references.map((evidence) => ({
      evidence_id: evidence.evidence_id,
      title: evidence.title,
      summary: evidence.summary,
      evidence_type: evidence.evidence_type,
      content:
        evidence.evidence_id === "evidence-synthetic-acme4-aggregate-summary"
          ? {
              content_type: "structured_summary",
              fields: {
                synthetic_session_count: input.map_positions.points.length,
                sanitized_feature_families: [
                  "access-update",
                  "approval-context",
                  "service-change",
                ],
                raw_events_included: false,
                restricted_values_required: false,
              },
            }
          : {
              content_type: "text",
              text: evidence.summary,
            },
      source_reference: {
        source_id: `source-${evidence.evidence_id}`,
        source_type: "synthetic_acme4_style_sanitized_summary",
        safe_reference: {
          reference_id: `ref-${evidence.evidence_id}`,
          reference_type: "source_artifact_id",
          artifact_id: `${input.artifact_id}/${evidence.evidence_id}`,
          notes: "Synthetic sanitized source artifact only; no raw payload.",
        },
      },
      provenance_reference: input.provenance.provenance_id,
      sanitization_status: input.sanitization.status,
      linked_session_ids: evidence.linked_subject_ids.map(sessionIdFromSubjectId),
      linked_claim_ids: [...evidence.linked_claim_ids],
      weight: availableMetric(
        evidence.evidence_id === "evidence-synthetic-acme4-aggregate-summary"
          ? 0.7
          : 0.5,
        "higher_is_better",
      ),
    })),
    evidence_to_claim_mappings: input.evidence_to_claim_mappings.map(
      (mapping) => ({
        claim_id: mapping.claim_id,
        evidence_id: mapping.evidence_id,
        relationship: mapping.relationship,
        expected_support: mapping.relationship,
        rationale: mapping.rationale,
      }),
    ),
    representative_sessions: input.representative_items.map((item) => ({
      session_id: sessionIdFromSubjectId(item.subject_id),
      title: item.title,
      summary: item.summary,
      feature_highlights: [...item.feature_highlights],
      safe_reference: {
        reference_id: `ref-${sessionIdFromSubjectId(item.subject_id)}`,
        reference_type: "source_artifact_id",
        artifact_id: `${input.artifact_id}/${item.subject_id}`,
        notes:
          "Synthetic sanitized representative item only; not raw source telemetry.",
      },
      cluster_membership: {
        cluster_id: cluster.cluster_id,
        membership_score: availableMetric(item.membership_score, "higher_is_better"),
        distance_to_centroid: availableMetric(
          1 - item.membership_score,
          "lower_is_better",
        ),
      },
      flags: [...item.flags],
      linked_evidence_ids: [...item.linked_evidence_ids],
    })),
    outlier_impostor_candidates: input.outlier_impostor_candidates.map(
      (candidate) => ({
        candidate_id: candidate.candidate_id,
        session_id: sessionIdFromSubjectId(candidate.subject_id),
        reason: candidate.reason,
        score: availableMetric(candidate.score, "higher_is_better"),
        expected_review_use: "cluster_purity_check",
      }),
    ),
    neighbor_clusters: input.neighbor_clusters.map((neighbor) => ({
      neighbor_cluster_id: neighbor.neighbor_cluster_id,
      label: neighbor.label,
      distance: availableMetric(neighbor.distance, "lower_is_better"),
      reason_this_neighbor_matters: neighbor.reason_this_neighbor_matters,
      confusion_risk: availableMetric(0.39, "higher_is_better"),
    })),
    metrics: {
      cluster_coherence: availableMetric(
        input.metrics.cluster_coherence,
        "higher_is_better",
      ),
      evidence_coverage: availableMetric(
        input.metrics.evidence_coverage,
        "higher_is_better",
      ),
      uncertainty: availableMetric(input.metrics.uncertainty, "higher_is_better"),
      temporal_stability: {
        status: "unavailable",
        reason: input.metrics.temporal_stability.reason,
      },
    },
    provenance: {
      provenance_id: input.provenance.provenance_id,
      source_system: input.provenance.source_system,
      source_artifact: input.provenance.source_artifact,
      generating_tool: input.provenance.generating_tool,
      generated_at: input.provenance.generated_at,
      upstream_run_id: input.provenance.upstream_run_id,
      adapter_name: "synthetic-acme4-style-fixture-converter",
      adapter_version: "0.1.0",
      references: [
        {
          reference_id: "ref-synthetic-acme4-style-fixture-source",
          reference_type: "source_artifact_id",
          artifact_id: input.provenance.source_artifact,
          notes:
            "Synthetic ACME4-style fixture source only; not real ACME4, Toponymy, or DataMapPlot output.",
        },
      ],
      owner: {
        team: "Telemetry Court",
      },
    },
    sanitization: {
      status: input.sanitization.status,
      method: input.sanitization.method,
      redaction_notes: [...input.sanitization.redaction_notes],
      allowed_display_level: input.sanitization.allowed_display_level,
      raw_drilldown_allowed: input.sanitization.raw_drilldown_allowed,
      safe_reference_type: input.sanitization.safe_reference_type,
      notes: input.sanitization.notes,
    },
    review_configuration: {
      blind_review_enabled: true,
      initially_hidden_label_ids: ["label-synthetic-acme4-access-change"],
      initially_revealed_label_ids: ["label-synthetic-acme4-planned-change"],
      required_review_stages: [...CASE_PACKAGE_V01_REQUIRED_REVIEW_STAGES],
      allowed_evidence_ratings: [...CASE_PACKAGE_V01_EVIDENCE_RATINGS],
      allowed_verdicts: [...CASE_PACKAGE_V01_VERDICTS],
      allowed_recommended_actions: [...CASE_PACKAGE_V01_RECOMMENDED_ACTIONS],
      required_reviewer_actions: [
        ...CASE_PACKAGE_V01_REQUIRED_REVIEWER_ACTIONS,
      ],
    },
  };
}

export const syntheticAcme4StyleCasePackageV01 =
  validateSyntheticAcme4StyleCasePackage(
    createSyntheticAcme4StyleCasePackageV01(
      syntheticAcme4StyleAdapterInputFixture,
    ),
  );

function validateSyntheticAcme4StyleCasePackage(
  packageFixture: CasePackageV01,
): CasePackageV01 {
  const result = validateCasePackageV01(packageFixture);

  if (!result.ok) {
    throw new Error(
      `Invalid synthetic ACME4-style CasePackage fixture: ${JSON.stringify(
        result.errors,
      )}`,
    );
  }

  return result.package;
}

function sessionIdFromSubjectId(subjectId: string): string {
  return subjectId.replace(/^subject-/, "session-");
}

function availableMetric(
  value: number,
  interpretation: "higher_is_better" | "lower_is_better" | "contextual",
): CasePackageMetricV01 {
  return {
    status: "available",
    value: Number(Math.max(0, Math.min(1, value)).toFixed(2)),
    min: 0,
    max: 1,
    interpretation,
  };
}
