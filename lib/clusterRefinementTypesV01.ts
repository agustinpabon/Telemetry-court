import type {
  EVALUATION_REPORT_V01_CALCULATION_VERSION,
  EVALUATION_REPORT_V01_SCHEMA_VERSION,
} from "@/lib/evaluationReportV01";
import type {
  REVIEW_PROTOCOL_V01_VERSION,
  REVIEW_RESULT_V01_SCHEMA_VERSION,
  ReviewResultV01,
} from "@/lib/reviewResultV01";

export const CLUSTER_REFINEMENT_V01_SCHEMA_VERSION =
  "cluster_refinement.v0.1" as const;
export const CLUSTER_REFINEMENT_V01_CALCULATION_VERSION =
  "cluster_refinement_calculation.v0.1" as const;

export const CLUSTER_REFINEMENT_SPLIT_FINAL_VERDICTS = [
  "cluster_impure",
  "needs_split",
] as const;
export const CLUSTER_REFINEMENT_SPLIT_RECOMMENDED_ACTIONS = [
  "split_cluster",
] as const;
export const CLUSTER_REFINEMENT_SPLIT_FAILURE_MODES = [
  "cluster_seems_mixed",
] as const;
export const CLUSTER_REFINEMENT_MERGE_FINAL_VERDICTS = [
  "needs_merge",
] as const;
export const CLUSTER_REFINEMENT_MERGE_RECOMMENDED_ACTIONS = [
  "merge_cluster",
] as const;

export type SplitFinalVerdictV01 =
  (typeof CLUSTER_REFINEMENT_SPLIT_FINAL_VERDICTS)[number];
export type SplitRecommendedActionV01 =
  (typeof CLUSTER_REFINEMENT_SPLIT_RECOMMENDED_ACTIONS)[number];
export type SplitFailureModeV01 =
  (typeof CLUSTER_REFINEMENT_SPLIT_FAILURE_MODES)[number];
export type MergeFinalVerdictV01 =
  (typeof CLUSTER_REFINEMENT_MERGE_FINAL_VERDICTS)[number];
export type MergeRecommendedActionV01 =
  (typeof CLUSTER_REFINEMENT_MERGE_RECOMMENDED_ACTIONS)[number];

export type ClusterRefinementSourceReviewV01 = {
  review_id: string;
  review_session_id?: string;
  created_at?: string;
};

export type ClusterRefinementSignalSetV01 = {
  final_verdicts: SplitFinalVerdictV01[];
  recommended_actions: SplitRecommendedActionV01[];
  failure_modes: SplitFailureModeV01[];
};

export type RecommendationDisagreementV01 =
  | {
      status: "available";
      has_disagreement: boolean;
      reason?: string;
    }
  | {
      status: "unavailable";
      has_disagreement: null;
      reason: string;
    };

export type ClusterRefinementSessionExclusionRecommendationV01 = {
  session_id: string;
  status: "recommended" | "not_recommended";
  selected_count: number;
  qualifying_review_count: number;
  reviewer_count: number;
  source_review_ids: string[];
  qualifying_source_review_ids: string[];
  signals: ClusterRefinementSignalSetV01;
  disagreement:
    | {
        status: "available";
        has_disagreement: boolean;
        selected_by_all_reviewers: boolean;
        competing_session_ids: string[];
      }
    | {
        status: "unavailable";
        has_disagreement: null;
        selected_by_all_reviewers: null;
        competing_session_ids: string[];
        reason: string;
      };
};

export type ClusterRefinementSplitRecommendationV01 = {
  cluster_id: string;
  status: "recommended";
  supporting_review_count: number;
  reviewer_count: number;
  source_review_ids: string[];
  signals: ClusterRefinementSignalSetV01;
  disagreement: RecommendationDisagreementV01;
};

export type ClusterRefinementMergeRecommendationV01 = {
  cluster_id: string;
  status: "recommended";
  supporting_review_count: number;
  reviewer_count: number;
  source_review_ids: string[];
  signals: {
    final_verdicts: MergeFinalVerdictV01[];
    recommended_actions: MergeRecommendedActionV01[];
  };
  target: {
    status: "unavailable";
    neighbor_cluster_ids: string[];
    reason: string;
  };
  disagreement: RecommendationDisagreementV01;
};

export type ClusterRefinementUncertaintyV01 = {
  status: "present" | "not_reported";
  reviewer_count: number;
  uncertain_review_count: number;
  low_confidence_review_count: number;
  source_review_ids: string[];
  signals: {
    final_verdicts: Array<"uncertain">;
    recommended_actions: Array<"mark_uncertain">;
    confidence_levels: Array<"low" | "medium" | "high">;
  };
};

export type ClusterRefinementDisagreementV01 =
  | {
      status: "available";
      has_any_disagreement: boolean;
      verdict: boolean;
      recommended_action: boolean;
      label_winner: boolean;
      evidence_ratings: boolean;
      evidence_ids: string[];
      session_exclusion: boolean;
      split_recommendation: boolean;
      merge_recommendation: boolean;
    }
  | {
      status: "unavailable";
      reason: string;
      has_any_disagreement: null;
      verdict: null;
      recommended_action: null;
      label_winner: null;
      evidence_ratings: null;
      evidence_ids: string[];
      session_exclusion: null;
      split_recommendation: null;
      merge_recommendation: null;
    };

export type ClusterRefinementV01 = {
  schema_version: typeof CLUSTER_REFINEMENT_V01_SCHEMA_VERSION;
  calculation_version: typeof CLUSTER_REFINEMENT_V01_CALCULATION_VERSION;
  refinement_id: string;
  generated_at: string;
  source_application: "telemetry_court";
  format: "local_json";
  case_package: ReviewResultV01["case_package"];
  compatibility: {
    review_result_schema_version: typeof REVIEW_RESULT_V01_SCHEMA_VERSION;
    review_protocol_version: typeof REVIEW_PROTOCOL_V01_VERSION;
    evaluation_report_schema_version: typeof EVALUATION_REPORT_V01_SCHEMA_VERSION;
    evaluation_report_calculation_version: typeof EVALUATION_REPORT_V01_CALCULATION_VERSION;
  };
  source_review_ids: string[];
  source_reviews: ClusterRefinementSourceReviewV01[];
  reviewer_count: number;
  prune_session_ids: string[];
  session_exclusion_recommendations: ClusterRefinementSessionExclusionRecommendationV01[];
  split_recommendations: ClusterRefinementSplitRecommendationV01[];
  merge_recommendations: ClusterRefinementMergeRecommendationV01[];
  uncertainty: ClusterRefinementUncertaintyV01;
  disagreement: ClusterRefinementDisagreementV01;
};

export type ClusterRefinementValidationErrorV01 = {
  path: string;
  code: string;
  message: string;
};

export type ClusterRefinementValidationResultV01 =
  | { ok: true; artifact: ClusterRefinementV01 }
  | { ok: false; errors: ClusterRefinementValidationErrorV01[] };

export type ClusterRefinementExportAvailabilityV01 =
  | { available: true }
  | { available: false; reason: string };
