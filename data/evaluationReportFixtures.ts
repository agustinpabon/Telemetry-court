import { aggregateReviewResultsV01 } from "@/lib/evaluationReportV01";
import type { ReviewResultV01 } from "@/lib/reviewResultV01";

export const sampleEvaluationReportV01 = aggregateReviewResultsV01([
  createEvaluationReviewResult({
    evidenceTwoRating: "contradicts",
    failureModes: ["missing_evidence"],
    finalVerdict: "unsupported_or_overclaimed",
    recommendedAction: "rename_label",
  }),
  createEvaluationReviewResult({
    reviewId: "review-b",
    reviewerId: "reviewer-b",
    selectedLabelId: "label-b",
    evidenceTwoRating: "insufficient",
    failureModes: ["missing_evidence", "too_broad"],
    finalVerdict: "supported",
    recommendedAction: "accept_label",
  }),
]);

function createEvaluationReviewResult({
  reviewId = "review-a",
  reviewerId = "reviewer-a",
  selectedLabelId = "label-a",
  evidenceTwoRating = "supports",
  failureModes = [],
  finalVerdict = "supported",
  recommendedAction = "accept_label",
}: {
  reviewId?: string;
  reviewerId?: string;
  selectedLabelId?: string;
  evidenceTwoRating?: ReviewResultV01["decisions"]["evidence_ratings"][number]["rating"];
  failureModes?: ReviewResultV01["decisions"]["failure_modes"];
  finalVerdict?: ReviewResultV01["decisions"]["final_verdict"];
  recommendedAction?: ReviewResultV01["decisions"]["recommended_action"];
} = {}): ReviewResultV01 {
  return {
    schema_version: "review_result.v0.1",
    review_id: reviewId,
    created_at: "2026-06-21T12:00:00.000Z",
    case_package: {
      schema_version: "case_package.v0.1",
      package_id: "pkg-synthetic-evaluation-001",
      package_revision: "r1",
      case_id: "case-synthetic-evaluation-001",
      cluster_id: "cluster-synthetic-evaluation-001",
      pipeline: {
        pipeline_id: "pipeline-synthetic-evaluation",
        run_id: "run-synthetic-evaluation-001",
        upstream_tool: "synthetic-evaluation-fixture",
        pipeline_version: "pipeline-v1",
        embedding_model: "synthetic-embedding-a",
        naming_model: "synthetic-naming-model-a",
        prompt_id: "prompt-a",
        prompt_version: "1",
        prompt_digest: "sha256:synthetic-a",
        generated_at: "2026-06-21T11:00:00.000Z",
      },
    },
    reviewer: {
      reviewer_id: reviewerId,
      review_session_id: `session-${reviewerId}`,
      context: "synthetic_demo",
    },
    protocol: {
      protocol_version: "telemetry_court_review.v0.1",
      blind_review_enabled: true,
      ai_label_revealed: true,
    },
    decisions: {
      blind_interpretation: {
        option_id: "blind-option-1",
        label: "Synthetic interpretation",
        agrees_with_ai: false,
      },
      label_comparison: {
        selected_label_id: selectedLabelId,
        reason_codes: ["better_supported"],
      },
      evidence_ratings: [
        { evidence_id: "evidence-1", rating: "supports" },
        { evidence_id: "evidence-2", rating: evidenceTwoRating },
      ],
      outlier_impostor: {
        selected_session_id: "session-outlier-1",
      },
      failure_modes: failureModes,
      final_verdict: finalVerdict,
      recommended_action: recommendedAction,
    },
  };
}
