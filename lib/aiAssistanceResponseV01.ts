import {
  REVIEW_RESULT_V01_SCHEMA_VERSION,
  type ReviewResultV01,
} from "@/lib/reviewResultV01";
import type {
  CasePackageClaimId,
  CasePackageEvidenceId,
  CasePackageLabelId,
  CasePackageReferenceV01,
} from "@/lib/types";

export const AI_ASSISTANCE_RESPONSE_V01_SCHEMA_VERSION =
  "ai_assistance_response.v0.1" as const;

export const AI_ASSISTANCE_RESPONSE_V01_QUESTION_TYPES = [
  "summarize_evidence",
  "assess_claim_support",
  "compare_labels",
  "explain_uncertainty",
  "identify_missing_evidence",
  "other",
] as const;

export const AI_ASSISTANCE_RESPONSE_V01_GENERATION_MODES = [
  "contract_fixture",
  "local_dry_run",
  "future_ai_assistance",
] as const;

export const AI_ASSISTANCE_RESPONSE_V01_ANSWER_STATUSES = [
  "answered",
  "insufficient_evidence",
  "refused",
] as const;

export const AI_ASSISTANCE_RESPONSE_V01_FINDING_SUPPORT = [
  "supports",
  "weak_support",
  "contradicts",
  "insufficient",
  "needs_more_context",
] as const;

export const AI_ASSISTANCE_RESPONSE_V01_UNCERTAINTY_LEVELS = [
  "low",
  "medium",
  "high",
] as const;

export const AI_ASSISTANCE_RESPONSE_V01_REFUSAL_REASONS = [
  "insufficient_evidence",
  "outside_case_scope",
  "unsupported_request",
  "missing_context",
] as const;

export const AI_ASSISTANCE_RESPONSE_V01_OUTPUT_WARNING_CODES = [
  "insufficient_context",
  "ungrounded_request",
  "outside_case_scope",
] as const;

export type AiAssistanceResponseV01SchemaVersion =
  typeof AI_ASSISTANCE_RESPONSE_V01_SCHEMA_VERSION;
export type AiAssistanceQuestionTypeV01 =
  (typeof AI_ASSISTANCE_RESPONSE_V01_QUESTION_TYPES)[number];
export type AiAssistanceGenerationModeV01 =
  (typeof AI_ASSISTANCE_RESPONSE_V01_GENERATION_MODES)[number];
export type AiAssistanceAnswerStatusV01 =
  (typeof AI_ASSISTANCE_RESPONSE_V01_ANSWER_STATUSES)[number];
export type AiAssistanceFindingSupportV01 =
  (typeof AI_ASSISTANCE_RESPONSE_V01_FINDING_SUPPORT)[number];
export type AiAssistanceUncertaintyLevelV01 =
  (typeof AI_ASSISTANCE_RESPONSE_V01_UNCERTAINTY_LEVELS)[number];
export type AiAssistanceRefusalReasonV01 =
  (typeof AI_ASSISTANCE_RESPONSE_V01_REFUSAL_REASONS)[number];
export type AiAssistanceOutputWarningCodeV01 =
  (typeof AI_ASSISTANCE_RESPONSE_V01_OUTPUT_WARNING_CODES)[number];

export type AiAssistanceReviewResultReferenceV01 = {
  schema_version: typeof REVIEW_RESULT_V01_SCHEMA_VERSION;
  review_id: ReviewResultV01["review_id"];
  reviewer_id?: ReviewResultV01["reviewer"]["reviewer_id"];
  review_session_id?: ReviewResultV01["reviewer"]["review_session_id"];
};

export type AiAssistanceQuestionV01 = {
  question_id: string;
  question_type: AiAssistanceQuestionTypeV01;
  text: string;
};

export type AiAssistanceGenerationMetadataV01 = {
  mode: AiAssistanceGenerationModeV01;
  model: {
    provider?: string;
    model_id: string;
    model_version?: string;
  };
  prompt: {
    prompt_id: string;
    prompt_version?: string;
    prompt_digest?: string;
  };
};

export type AiAssistanceAnswerV01 = {
  status: AiAssistanceAnswerStatusV01;
  summary: string;
  evidence_ids: CasePackageEvidenceId[];
  insufficiency_reason?: string;
  refusal_reason?: AiAssistanceRefusalReasonV01;
};

export type AiAssistanceFindingV01 = {
  finding_id: string;
  text: string;
  support: AiAssistanceFindingSupportV01;
  evidence_ids: CasePackageEvidenceId[];
  related_claim_ids?: CasePackageClaimId[];
  related_label_ids?: CasePackageLabelId[];
  uncertainty?: {
    level: AiAssistanceUncertaintyLevelV01;
    explanation: string;
  };
  insufficiency_reason?: string;
};

export type AiAssistanceOutputWarningV01 = {
  warning_id: string;
  code: AiAssistanceOutputWarningCodeV01;
  message: string;
  evidence_ids?: CasePackageEvidenceId[];
};

export type AiAssistanceResponseV01 = {
  schema_version: AiAssistanceResponseV01SchemaVersion;
  response_id: string;
  created_at: string;
  case_package: Omit<CasePackageReferenceV01, "blind_review_enabled">;
  review_result?: AiAssistanceReviewResultReferenceV01;
  question: AiAssistanceQuestionV01;
  generation: AiAssistanceGenerationMetadataV01;
  answer: AiAssistanceAnswerV01;
  findings: AiAssistanceFindingV01[];
  warnings?: AiAssistanceOutputWarningV01[];
};
