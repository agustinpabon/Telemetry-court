import {
  CASE_PACKAGE_V01_EVIDENCE_RATINGS,
  CASE_PACKAGE_V01_RECOMMENDED_ACTIONS,
  CASE_PACKAGE_V01_VERDICTS,
  type CasePackageEvidenceRatingV01,
  type CasePackageRecommendedActionV01,
  type CasePackageReferenceV01,
  type CasePackageVerdictV01,
  type DuelReason,
} from "@/lib/types";

export const REVIEW_RESULT_V01_SCHEMA_VERSION = "review_result.v0.1" as const;
export const REVIEW_PROTOCOL_V01_VERSION = "telemetry_court_review.v0.1" as const;

export const REVIEW_RESULT_V01_EVIDENCE_RATINGS =
  CASE_PACKAGE_V01_EVIDENCE_RATINGS;
export const REVIEW_RESULT_V01_VERDICTS = CASE_PACKAGE_V01_VERDICTS;
export const REVIEW_RESULT_V01_RECOMMENDED_ACTIONS =
  CASE_PACKAGE_V01_RECOMMENDED_ACTIONS;

export type ReviewResultV01 = {
  schema_version: typeof REVIEW_RESULT_V01_SCHEMA_VERSION;
  review_id: string;
  created_at: string;
  case_package: Omit<CasePackageReferenceV01, "blind_review_enabled">;
  reviewer: {
    reviewer_id: string;
    review_session_id: string;
    context: "synthetic_demo" | "local_review";
  };
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
    failure_modes: DuelReason[];
    final_verdict: CasePackageVerdictV01;
    recommended_action: CasePackageRecommendedActionV01;
  };
};
