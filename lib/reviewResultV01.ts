import {
  CASE_PACKAGE_V01_EVIDENCE_RATINGS,
  CASE_PACKAGE_V01_RECOMMENDED_ACTIONS,
  CASE_PACKAGE_V01_VERDICTS,
  type CasePackageEvidenceRatingV01,
  type CasePackageRecommendedActionV01,
  type CasePackageReferenceV01,
  type CasePackageVerdictV01,
  type DuelReason,
  type MergeRecommendationReason,
  type SplitRecommendationReason,
} from "@/lib/types";
import type { ReviewerIdentityV01 } from "@/lib/reviewerIdentityV01";

export const REVIEW_RESULT_V01_SCHEMA_VERSION = "review_result.v0.1" as const;
export const REVIEW_PROTOCOL_V01_VERSION = "telemetry_court_review.v0.1" as const;

export const REVIEW_RESULT_V01_EVIDENCE_RATINGS =
  CASE_PACKAGE_V01_EVIDENCE_RATINGS;
export const REVIEW_RESULT_V01_VERDICTS = CASE_PACKAGE_V01_VERDICTS;
export const REVIEW_RESULT_V01_RECOMMENDED_ACTIONS =
  CASE_PACKAGE_V01_RECOMMENDED_ACTIONS;
export const REVIEW_RESULT_V01_DUEL_REASONS = [
  "better_supported",
  "less_overclaimed",
  "more_specific",
  "too_broad",
  "missing_evidence",
  "missing_malicious_intent",
  "missing_downstream_abuse",
  "preserves_uncertainty",
  "cluster_seems_mixed",
] as const satisfies readonly DuelReason[];

export type ReviewResultSplitRecommendationV01 = {
  status: "recommended";
  reason: SplitRecommendationReason;
  affected_session_ids?: string[];
  evidence_ids?: string[];
};

export type ReviewResultMergeRecommendationV01 = {
  status: "recommended";
  target_neighbor_cluster_id: string;
  reason: MergeRecommendationReason;
};

export type ReviewResultClusterRefinementV01 = {
  split_recommendation?: ReviewResultSplitRecommendationV01;
  merge_recommendation?: ReviewResultMergeRecommendationV01;
};

export type ReviewResultV01 = {
  schema_version: typeof REVIEW_RESULT_V01_SCHEMA_VERSION;
  review_id: string;
  created_at: string;
  case_package: Omit<CasePackageReferenceV01, "blind_review_enabled">;
  reviewer: ReviewerIdentityV01;
  protocol: {
    protocol_version: typeof REVIEW_PROTOCOL_V01_VERSION;
    blind_review_enabled: boolean;
    ai_label_revealed: boolean;
  };
  decisions: {
    blind_interpretation: {
      option_id: string;
      label: string;
      agrees_with_ai: boolean;
    };
    label_comparison: {
      selected_label_id: string;
      reason_codes: DuelReason[];
      rationale?: string;
    };
    evidence_ratings: Array<{
      evidence_id: string;
      rating: CasePackageEvidenceRatingV01;
    }>;
    outlier_impostor: {
      selected_session_id: string;
    };
    confidence?: {
      level: "low" | "medium" | "high";
      rationale?: string;
    };
    failure_modes: DuelReason[];
    final_verdict: CasePackageVerdictV01;
    recommended_action: CasePackageRecommendedActionV01;
    cluster_refinement?: ReviewResultClusterRefinementV01;
    notes?: string[];
  };
};
