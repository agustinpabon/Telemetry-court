import {
  aggregateReviewResultsV01,
  type EvaluationReportV01,
} from "@/lib/evaluationReportV01";
import { minimalSyntheticCasePackageV01 } from "@/lib/casePackageV01Fixture";
import {
  REVIEW_PROTOCOL_V01_VERSION,
  REVIEW_RESULT_V01_SCHEMA_VERSION,
  type ReviewResultV01,
} from "@/lib/reviewResultV01";
import type { CasePackageV01 } from "@/lib/types";

export type EvaluationReportV01ExampleArtifact = {
  example_id: string;
  example_kind: "synthetic_sanitized_demo";
  title: string;
  summary: string;
  intended_uses: readonly string[];
  limitations: readonly string[];
  casePackage: CasePackageV01;
  sourceReviewResults: readonly ReviewResultV01[];
  evaluationReport: EvaluationReportV01;
};

export const EVALUATION_REPORT_V01_EXAMPLE_LIMITATIONS = [
  "Synthetic demo artifact generated from deterministic fixture data.",
  "No live reviewer pilot is claimed.",
  "No real analyst agreement is claimed.",
  "No restricted telemetry is included.",
  "No operational performance claim is made.",
  "For demo, development, and presentation use only.",
] as const;

const syntheticCasePackageReference = {
  schema_version: minimalSyntheticCasePackageV01.schema_version,
  package_id: minimalSyntheticCasePackageV01.package_id,
  package_revision: minimalSyntheticCasePackageV01.package_revision,
  case_id: minimalSyntheticCasePackageV01.case.case_id,
  cluster_id: minimalSyntheticCasePackageV01.cluster.cluster_id,
  pipeline: {
    pipeline_id: minimalSyntheticCasePackageV01.pipeline.pipeline_id,
    run_id: minimalSyntheticCasePackageV01.pipeline.run_id,
    upstream_tool: minimalSyntheticCasePackageV01.pipeline.upstream_tool,
    pipeline_version: minimalSyntheticCasePackageV01.pipeline.pipeline_version,
    embedding_model: minimalSyntheticCasePackageV01.pipeline.embedding_model,
    clustering_method: minimalSyntheticCasePackageV01.pipeline.clustering_method,
    dimensionality_reduction_method:
      minimalSyntheticCasePackageV01.pipeline.dimensionality_reduction_method,
    naming_model: minimalSyntheticCasePackageV01.pipeline.naming_model,
    prompt_id: minimalSyntheticCasePackageV01.pipeline.prompt?.prompt_id,
    generated_at: minimalSyntheticCasePackageV01.pipeline.generated_at,
  },
} satisfies ReviewResultV01["case_package"];

const syntheticOverclaimSourceReviewResultsV01 = [
  createSyntheticEvaluationReviewResult({
    reviewerId: "synthetic-demo-reviewer-a",
    createdAt: "2026-06-28T12:00:00.000Z",
    blindInterpretationLabel: "Routine IAM role provisioning",
    selectedLabelId: "label-human-routine-provisioning",
    labelReasonCodes: ["less_overclaimed", "missing_malicious_intent"],
    evidenceRatings: [
      { evidence_id: "evidence-role-lifecycle", rating: "supports" },
      { evidence_id: "evidence-rollout-metadata", rating: "supports" },
      { evidence_id: "evidence-no-downstream-abuse", rating: "contradicts" },
    ],
    failureModes: ["missing_malicious_intent"],
    finalVerdict: "unsupported_or_overclaimed",
    recommendedAction: "rename_label",
  }),
  createSyntheticEvaluationReviewResult({
    reviewerId: "synthetic-demo-reviewer-b",
    createdAt: "2026-06-28T12:05:00.000Z",
    blindInterpretationLabel: "Mixed IAM provisioning and access probe",
    selectedLabelId: "label-ai-suspicious-iam",
    labelReasonCodes: ["cluster_seems_mixed"],
    evidenceRatings: [
      { evidence_id: "evidence-role-lifecycle", rating: "supports" },
      { evidence_id: "evidence-rollout-metadata", rating: "insufficient" },
      { evidence_id: "evidence-no-downstream-abuse", rating: "insufficient" },
    ],
    failureModes: ["cluster_seems_mixed"],
    finalVerdict: "needs_split",
    recommendedAction: "split_cluster",
    clusterRefinement: {
      split_recommendation: {
        status: "recommended",
        reason: "boundary_sessions",
        affected_session_ids: ["session-passrole-probe"],
        evidence_ids: ["evidence-rollout-metadata", "evidence-no-downstream-abuse"],
      },
    },
  }),
] as const satisfies readonly ReviewResultV01[];

export const syntheticOverclaimEvaluationReportExampleV01 = {
  example_id: "example-evaluation-report-synthetic-overclaim-v01",
  example_kind: "synthetic_sanitized_demo",
  title: "Synthetic overclaim and split-signal EvaluationReport v0.1",
  summary:
    "A deterministic demo report showing unsupported-intent, evidence-insufficiency, disputed-evidence, and split-recommendation signals from synthetic ReviewResults.",
  intended_uses: [
    "EvaluationReport contract demos",
    "Local development and tests",
    "Presentation examples that need safe traceable artifacts",
  ],
  limitations: EVALUATION_REPORT_V01_EXAMPLE_LIMITATIONS,
  casePackage: minimalSyntheticCasePackageV01,
  sourceReviewResults: syntheticOverclaimSourceReviewResultsV01,
  evaluationReport: aggregateReviewResultsV01(
    syntheticOverclaimSourceReviewResultsV01,
  ),
} as const satisfies EvaluationReportV01ExampleArtifact;

export const evaluationReportV01Examples = [
  syntheticOverclaimEvaluationReportExampleV01,
] as const satisfies readonly EvaluationReportV01ExampleArtifact[];

function createSyntheticEvaluationReviewResult({
  reviewerId,
  createdAt,
  blindInterpretationLabel,
  selectedLabelId,
  labelReasonCodes,
  evidenceRatings,
  failureModes,
  finalVerdict,
  recommendedAction,
  clusterRefinement,
}: {
  reviewerId: string;
  createdAt: string;
  blindInterpretationLabel: string;
  selectedLabelId: ReviewResultV01["decisions"]["label_comparison"]["selected_label_id"];
  labelReasonCodes: ReviewResultV01["decisions"]["label_comparison"]["reason_codes"];
  evidenceRatings: ReviewResultV01["decisions"]["evidence_ratings"];
  failureModes: ReviewResultV01["decisions"]["failure_modes"];
  finalVerdict: ReviewResultV01["decisions"]["final_verdict"];
  recommendedAction: ReviewResultV01["decisions"]["recommended_action"];
  clusterRefinement?: ReviewResultV01["decisions"]["cluster_refinement"];
}): ReviewResultV01 {
  const reviewSessionId = `session-${reviewerId}`;

  return {
    schema_version: REVIEW_RESULT_V01_SCHEMA_VERSION,
    review_id: [
      "review",
      syntheticCasePackageReference.package_id,
      reviewerId,
      reviewSessionId,
      createdAt,
    ].join(":"),
    created_at: createdAt,
    case_package: syntheticCasePackageReference,
    reviewer: {
      reviewer_id: reviewerId,
      review_session_id: reviewSessionId,
      context: "synthetic_demo",
    },
    protocol: {
      protocol_version: REVIEW_PROTOCOL_V01_VERSION,
      blind_review_enabled: true,
      ai_label_revealed: true,
    },
    decisions: {
      blind_interpretation: {
        option_id: `blind-${reviewerId}`,
        label: blindInterpretationLabel,
        agrees_with_ai: selectedLabelId === "label-ai-suspicious-iam",
      },
      label_comparison: {
        selected_label_id: selectedLabelId,
        reason_codes: labelReasonCodes,
      },
      evidence_ratings: evidenceRatings,
      outlier_impostor: {
        selected_session_id: "session-passrole-probe",
      },
      failure_modes: failureModes,
      final_verdict: finalVerdict,
      recommended_action: recommendedAction,
      ...(clusterRefinement ? { cluster_refinement: clusterRefinement } : {}),
    },
  };
}
