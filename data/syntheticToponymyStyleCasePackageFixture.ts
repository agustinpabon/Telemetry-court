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

const FIXTURE_CREATED_AT = "2026-06-21T12:00:00.000Z";
const FIXTURE_GENERATED_AT = "2026-06-21T11:58:00.000Z";
const FIXTURE_RUN_ID = "run-synthetic-toponymy-style-2026-06-21";
const FIXTURE_PROVENANCE_ID = "prov-synthetic-toponymy-style-fixture";

export const syntheticToponymyStyleAdapterInputFixture = {
  input_schema_version: "adapter_input.toponymy_datamapplot_style.v0.1",
  artifact_id: "adapter-input-synthetic-toponymy-style-access-review-001",
  created_at: FIXTURE_CREATED_AT,
  source_kind: "combined_toponymy_datamapplot_style",
  conversion_target: CASE_PACKAGE_V01_SCHEMA_VERSION,
  limitations: [
    "Synthetic fixture only; non-authoritative adapter-boundary test data.",
    "This is not real Toponymy output, real DataMapPlot output, ACME4-derived data, or raw telemetry.",
    "No Toponymy or DataMapPlot API, function signature, execution, model, or output contract is represented.",
  ],
  dataset_context: {
    dataset_id: "dataset-synthetic-toponymy-style-map",
    dataset_name: "Synthetic Toponymy-Style Map Fixture",
    dataset_type: "synthetic",
    data_classification: "synthetic",
    source_environment: "local-fixture",
    approved_use:
      "Contract testing for a synthetic Toponymy/DataMapPlot-style CasePackage boundary.",
    limitations: [
      "No raw restricted telemetry is included.",
      "Safe references identify synthetic source artifacts only.",
    ],
  },
  pipeline_context: {
    upstream_tool_category: "synthetic-toponymy-datamapplot-style-fixture",
    run_id: FIXTURE_RUN_ID,
    generated_at: FIXTURE_GENERATED_AT,
    embedding_model: {
      status: "unavailable",
      reason: "The fixture is synthetic and does not represent a real embedding run.",
    },
    clustering_method: "synthetic-precomputed-cluster-map",
    dimensionality_reduction_method: "synthetic-2d-map",
    naming_model: {
      status: "unknown",
      reason:
        "The fixture intentionally avoids claiming a real upstream naming model.",
    },
    config_summary:
      "Synthetic precomputed cluster, map positions, labels, and evidence summaries.",
  },
  clusters: [
    {
      cluster_id: "cluster-synthetic-access-map-017",
      cluster_label: "Synthetic access maintenance cluster",
      cluster_size: 42,
      member_subject_ids: [
        "subject-synthetic-access-001",
        "subject-synthetic-access-002",
        "subject-synthetic-access-003",
        "subject-synthetic-access-004",
      ],
      cluster_method: {
        method: "synthetic-precomputed-cluster-map",
        parameters: {
          synthetic_fixture: true,
          cluster_index_preserved: false,
        },
      },
    },
  ],
  map_positions: {
    map_id: "map-synthetic-toponymy-style-001",
    map_tool: "datamapplot-style-synthetic-map",
    coordinate_space: "synthetic-normalized-2d",
    points: [
      {
        point_id: "point-synthetic-access-001",
        subject_id: "subject-synthetic-access-001",
        cluster_id: "cluster-synthetic-access-map-017",
        x: 0.42,
        y: 0.31,
      },
      {
        point_id: "point-synthetic-access-002",
        subject_id: "subject-synthetic-access-002",
        cluster_id: "cluster-synthetic-access-map-017",
        x: 0.47,
        y: 0.35,
      },
      {
        point_id: "point-synthetic-access-003",
        subject_id: "subject-synthetic-access-003",
        cluster_id: "cluster-synthetic-access-map-017",
        x: 0.39,
        y: 0.29,
      },
      {
        point_id: "point-synthetic-access-004",
        subject_id: "subject-synthetic-access-004",
        cluster_id: "cluster-synthetic-access-map-017",
        x: 0.58,
        y: 0.44,
      },
    ],
  },
  labels: [
    {
      label_id: "label-synthetic-access-maintenance",
      label: "Coordinated access maintenance",
      source: "ai_generated",
      run_id: FIXTURE_RUN_ID,
      linked_claim_ids: [
        "claim-synthetic-access-change",
        "claim-synthetic-maintenance-context",
      ],
    },
    {
      label_id: "label-synthetic-routine-maintenance",
      label: "Routine scheduled access update",
      source: "human_baseline",
      linked_claim_ids: [
        "claim-synthetic-access-change",
        "claim-synthetic-maintenance-context",
      ],
    },
  ],
  claims: [
    {
      claim_id: "claim-synthetic-access-change",
      text:
        "The synthetic cluster groups subjects with access-change feature summaries.",
      claim_type: "behavioral_summary",
      linked_label_ids: [
        "label-synthetic-access-maintenance",
        "label-synthetic-routine-maintenance",
      ],
      linked_evidence_ids: ["evidence-synthetic-access-map-summary"],
      evidence_status: "linked",
    },
    {
      claim_id: "claim-synthetic-maintenance-context",
      text:
        "The cluster context is consistent with scheduled maintenance, but intent remains unproven.",
      claim_type: "cluster_quality",
      linked_label_ids: [
        "label-synthetic-access-maintenance",
        "label-synthetic-routine-maintenance",
      ],
      linked_evidence_ids: [
        "evidence-synthetic-maintenance-window",
        "evidence-synthetic-neighbor-comparison",
      ],
      evidence_status: "linked",
    },
  ],
  evidence_references: [
    {
      evidence_id: "evidence-synthetic-access-map-summary",
      title: "Synthetic access map feature summary",
      summary:
        "Derived feature families summarize four synthetic map points in the cluster.",
      evidence_type: "derived_table",
      linked_claim_ids: ["claim-synthetic-access-change"],
      linked_subject_ids: ["subject-synthetic-access-001"],
    },
    {
      evidence_id: "evidence-synthetic-maintenance-window",
      title: "Synthetic maintenance window summary",
      summary:
        "Safe synthetic summaries place most points inside an approved maintenance window.",
      evidence_type: "event_summary",
      linked_claim_ids: ["claim-synthetic-maintenance-context"],
      linked_subject_ids: ["subject-synthetic-access-001"],
    },
    {
      evidence_id: "evidence-synthetic-neighbor-comparison",
      title: "Synthetic neighbor cluster comparison",
      summary:
        "A nearby synthetic operations cluster shares maintenance features but lacks access-change emphasis.",
      evidence_type: "neighbor_comparison",
      linked_claim_ids: ["claim-synthetic-maintenance-context"],
      linked_subject_ids: ["subject-synthetic-access-004"],
    },
  ],
  evidence_to_claim_mappings: [
    {
      claim_id: "claim-synthetic-access-change",
      evidence_id: "evidence-synthetic-access-map-summary",
      relationship: "supports",
      rationale:
        "The derived feature summary directly matches the narrow access-change claim.",
    },
    {
      claim_id: "claim-synthetic-maintenance-context",
      evidence_id: "evidence-synthetic-maintenance-window",
      relationship: "weak_support",
      rationale:
        "The maintenance window supports routine context but does not prove intent.",
    },
    {
      claim_id: "claim-synthetic-maintenance-context",
      evidence_id: "evidence-synthetic-neighbor-comparison",
      relationship: "context",
      rationale:
        "The neighbor comparison helps reviewers judge whether the label is too broad.",
    },
  ],
  representative_items: [
    {
      subject_id: "subject-synthetic-access-001",
      title: "Synthetic representative access-change subject",
      summary:
        "A safe summary of a synthetic map point near the cluster center.",
      feature_highlights: [
        "access-change",
        "scheduled-maintenance",
        "review-context",
      ],
      membership_score: 0.82,
      flags: ["representative"],
      linked_evidence_ids: [
        "evidence-synthetic-access-map-summary",
        "evidence-synthetic-maintenance-window",
      ],
    },
    {
      subject_id: "subject-synthetic-access-004",
      title: "Synthetic borderline access-change subject",
      summary:
        "A safe summary of a synthetic point closer to the neighboring operations cluster.",
      feature_highlights: ["access-change", "neighbor-like"],
      membership_score: 0.46,
      flags: ["borderline", "needs_context"],
      linked_evidence_ids: ["evidence-synthetic-neighbor-comparison"],
    },
  ],
  neighbor_clusters: [
    {
      neighbor_cluster_id: "cluster-synthetic-operations-neighbor",
      label: "Synthetic operations maintenance",
      distance: 0.27,
      reason_this_neighbor_matters:
        "It may make the access-maintenance label look over-specific or too broad.",
    },
  ],
  outlier_impostor_candidates: [
    {
      candidate_id: "candidate-synthetic-borderline-002",
      subject_id: "subject-synthetic-access-004",
      reason:
        "Borderline map position and neighbor-like features make this useful for cluster-purity review.",
      score: 0.54,
    },
  ],
  metrics: {
    cluster_coherence: 0.71,
    evidence_coverage: 0.62,
    temporal_stability: {
      status: "unavailable",
      reason: "The synthetic fixture does not include repeated upstream runs.",
    },
  },
  provenance: {
    provenance_id: FIXTURE_PROVENANCE_ID,
    source_system: "telemetry-court-synthetic-toponymy-style-fixtures",
    source_artifact: "data/syntheticToponymyStyleCasePackageFixture.ts",
    generating_tool: "synthetic-toponymy-style-fixture-converter",
    generated_at: FIXTURE_GENERATED_AT,
    upstream_run_id: FIXTURE_RUN_ID,
  },
  sanitization: {
    status: "synthetic",
    method:
      "Generated safe fixture summaries with no raw restricted telemetry.",
    redaction_notes: [
      "No real account, principal, host, network, event, or document identifiers are present.",
      "Map points, labels, feature families, and evidence summaries are synthetic.",
    ],
    allowed_display_level: "summary_only",
    raw_drilldown_allowed: false,
    safe_reference_type: "source_artifact_id",
    notes:
      "Fixture is non-authoritative and suitable only for local contract testing.",
  },
} as const;

type SyntheticToponymyStyleAdapterInputFixture =
  typeof syntheticToponymyStyleAdapterInputFixture;

// Fixture-only conversion: this does not implement a real Toponymy or DataMapPlot adapter.
export function createSyntheticToponymyStyleCasePackageV01(
  input: SyntheticToponymyStyleAdapterInputFixture,
): CasePackageV01 {
  const cluster = input.clusters[0];
  const firstMapPoint = input.map_positions.points[0];

  return {
    schema_version: CASE_PACKAGE_V01_SCHEMA_VERSION,
    package_id: "pkg-synthetic-toponymy-style-access-review-001",
    created_at: input.created_at,
    package_revision: "r1",
    case: {
      case_id: "case-synthetic-toponymy-style-access-review-001",
      title: "Synthetic Toponymy-style access-maintenance review",
      summary:
        "A synthetic Toponymy/DataMapPlot-style artifact has been converted into a CasePackage-shaped fixture.",
      reviewable_status: "synthetic_demo",
      review_intent: "validate_label",
      limitations: [
        "Synthetic, non-authoritative fixture only.",
        "Not real Toponymy output, real DataMapPlot output, ACME4-derived data, or raw telemetry.",
        "Does not claim compatibility with official Toponymy APIs, outputs, function signatures, workflows, or models.",
      ],
    },
    dataset: {
      dataset_id: input.dataset_context.dataset_id,
      dataset_name: input.dataset_context.dataset_name,
      dataset_type: input.dataset_context.dataset_type,
      data_classification: input.dataset_context.data_classification,
      source_environment: input.dataset_context.source_environment,
      approved_use: input.dataset_context.approved_use,
      approval_notes:
        "This fixture is safe synthetic data for CasePackage validation only.",
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
      pipeline_id: "pipeline-synthetic-toponymy-style-fixture",
      run_id: input.pipeline_context.run_id,
      upstream_tool: "synthetic-toponymy-style-fixture",
      pipeline_version: "0.1.0",
      clustering_method: input.pipeline_context.clustering_method,
      dimensionality_reduction_method:
        input.pipeline_context.dimensionality_reduction_method,
      prompt: {
        prompt_id: "prompt-synthetic-toponymy-style-fixture-v1",
        prompt_summary:
          "Synthetic fixture prompt placeholder; not an upstream Toponymy prompt.",
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
          ? availableMetric(0.58, "higher_is_better")
          : {
              status: "unavailable",
              reason: "Synthetic human baseline label is not model-scored.",
            },
      rank: index + 1,
      linked_claim_ids: [...label.linked_claim_ids],
      rationale:
        label.source === "ai_generated"
          ? "Synthetic generated label for contract testing only."
          : "Synthetic baseline label for comparison in the review protocol.",
    })),
    claims: input.claims.map((claim, index) => ({
      claim_id: claim.claim_id,
      text: claim.text,
      claim_type: claim.claim_type,
      linked_evidence_ids: [...claim.linked_evidence_ids],
      linked_label_ids: [...claim.linked_label_ids],
      confidence: availableMetric(index === 0 ? 0.76 : 0.52, "higher_is_better"),
      caveats:
        claim.claim_id === "claim-synthetic-maintenance-context"
          ? ["Intent and operational meaning are not proven by the fixture."]
          : undefined,
      evidence_status: claim.evidence_status,
    })),
    evidence_items: input.evidence_references.map((evidence) => ({
      evidence_id: evidence.evidence_id,
      title: evidence.title,
      summary: evidence.summary,
      evidence_type: evidence.evidence_type,
      content:
        evidence.evidence_id === "evidence-synthetic-access-map-summary"
          ? {
              content_type: "structured_summary",
              fields: {
                synthetic_point_count: input.map_positions.points.length,
                synthetic_feature_families: [
                  "access-change",
                  "scheduled-maintenance",
                  "review-context",
                ],
                raw_events_included: false,
              },
            }
          : {
              content_type: "text",
              text: evidence.summary,
            },
      source_reference: {
        source_id: `source-${evidence.evidence_id}`,
        source_type: "synthetic_adapter_fixture_summary",
        safe_reference: {
          reference_id: `ref-${evidence.evidence_id}`,
          reference_type: "source_artifact_id",
          artifact_id: `${input.artifact_id}/${evidence.evidence_id}`,
          notes: "Synthetic source artifact only; no raw telemetry payload.",
        },
      },
      provenance_reference: input.provenance.provenance_id,
      sanitization_status: input.sanitization.status,
      linked_session_ids: evidence.linked_subject_ids.map(sessionIdFromSubjectId),
      linked_claim_ids: [...evidence.linked_claim_ids],
      weight: availableMetric(
        evidence.evidence_id === "evidence-synthetic-access-map-summary"
          ? 0.72
          : 0.48,
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
        notes: "Synthetic representative item only; not raw source telemetry.",
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
      confusion_risk: availableMetric(0.41, "higher_is_better"),
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
      adapter_name: "synthetic-toponymy-style-fixture-converter",
      adapter_version: "0.1.0",
      references: [
        {
          reference_id: "ref-synthetic-toponymy-style-fixture-source",
          reference_type: "source_artifact_id",
          artifact_id: input.provenance.source_artifact,
          notes:
            "Synthetic fixture source only; not real Toponymy, DataMapPlot, or ACME4 output.",
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
      initially_hidden_label_ids: ["label-synthetic-access-maintenance"],
      initially_revealed_label_ids: ["label-synthetic-routine-maintenance"],
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

export const syntheticToponymyStyleCasePackageV01 =
  validateSyntheticToponymyStyleCasePackage(
    createSyntheticToponymyStyleCasePackageV01(
      syntheticToponymyStyleAdapterInputFixture,
    ),
  );

function validateSyntheticToponymyStyleCasePackage(
  packageFixture: CasePackageV01,
): CasePackageV01 {
  const result = validateCasePackageV01(packageFixture);

  if (!result.ok) {
    throw new Error(
      `Invalid synthetic Toponymy-style CasePackage fixture: ${JSON.stringify(
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
