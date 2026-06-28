import type {
  AiAssistanceAnswerStatusV01,
  AiAssistanceQuestionTypeV01,
  AiAssistanceQuestionV01,
} from "@/lib/aiAssistanceResponseV01";

export const AI_ASSISTANCE_QUESTION_SET_V01_VERSION =
  "ai_assistance_question_set.v0.1" as const;

export const AI_ASSISTANCE_QUESTION_PURPOSES_V01 = [
  "claim_support",
  "evidence_sufficiency",
  "contradiction",
  "uncertainty",
  "missing_evidence",
  "overclaim_detection",
  "cluster_boundary_impurity",
  "refusal_unavailable_behavior",
] as const;

export const AI_ASSISTANCE_QUESTION_REFERENCE_TYPES_V01 = [
  "case_package",
  "claim_id",
  "evidence_id",
  "label_id",
  "target_question_id",
  "unavailable_reason",
] as const;

export const AI_ASSISTANCE_UNAVAILABLE_REASONS_V01 = [
  "missing_valid_case_package",
  "unsupported_question_id",
  "missing_required_reference",
  "unknown_required_reference",
  "case_or_evidence_not_reviewable",
  "free_form_user_question",
  "operational_or_remediation_request",
  "raw_telemetry_or_live_investigation_request",
  "external_lookup_or_provider_unavailable",
] as const;

export const AI_ASSISTANCE_DISALLOWED_QUESTION_REASONS_V01 = [
  "free_form_chatbot",
  "generic_cybersecurity_question",
  "operational_remediation",
  "raw_telemetry_or_live_investigation",
  "external_lookup",
] as const;

export type AiAssistanceQuestionPurposeV01 =
  (typeof AI_ASSISTANCE_QUESTION_PURPOSES_V01)[number];
export type AiAssistanceQuestionReferenceTypeV01 =
  (typeof AI_ASSISTANCE_QUESTION_REFERENCE_TYPES_V01)[number];
export type AiAssistanceUnavailableReasonV01 =
  (typeof AI_ASSISTANCE_UNAVAILABLE_REASONS_V01)[number];
export type AiAssistanceDisallowedQuestionReasonV01 =
  (typeof AI_ASSISTANCE_DISALLOWED_QUESTION_REASONS_V01)[number];

export type AiAssistanceQuestionDefinitionV01 = {
  question_set_version: typeof AI_ASSISTANCE_QUESTION_SET_V01_VERSION;
  question_id: string;
  question_type: AiAssistanceQuestionTypeV01;
  text: string;
  inspects: readonly AiAssistanceQuestionPurposeV01[];
  required_references: readonly AiAssistanceQuestionReferenceTypeV01[];
  optional_references?: readonly AiAssistanceQuestionReferenceTypeV01[];
  expected_answer_statuses: readonly AiAssistanceAnswerStatusV01[];
  unavailable_when: readonly AiAssistanceUnavailableReasonV01[];
};

export type AiAssistanceDisallowedQuestionExampleV01 = {
  text: string;
  reason: AiAssistanceDisallowedQuestionReasonV01;
  expected_status: Extract<AiAssistanceAnswerStatusV01, "refused">;
  rationale: string;
};

const BASE_UNAVAILABLE_REASONS = [
  "missing_valid_case_package",
  "unsupported_question_id",
  "missing_required_reference",
  "unknown_required_reference",
  "case_or_evidence_not_reviewable",
  "free_form_user_question",
] as const satisfies readonly AiAssistanceUnavailableReasonV01[];

export const AI_ASSISTANCE_QUESTION_SET_V01 = [
  {
    question_set_version: AI_ASSISTANCE_QUESTION_SET_V01_VERSION,
    question_id: "question-claim-supporting-evidence-v01",
    question_type: "assess_claim_support",
    text: "Which evidence items support this claim?",
    inspects: ["claim_support", "evidence_sufficiency"],
    required_references: ["case_package", "claim_id"],
    expected_answer_statuses: ["answered", "insufficient_evidence"],
    unavailable_when: BASE_UNAVAILABLE_REASONS,
  },
  {
    question_set_version: AI_ASSISTANCE_QUESTION_SET_V01_VERSION,
    question_id: "question-evidence-supported-claim-v01",
    question_type: "summarize_evidence",
    text: "Which claim is best supported by this evidence?",
    inspects: ["claim_support", "evidence_sufficiency", "uncertainty"],
    required_references: ["case_package", "evidence_id"],
    expected_answer_statuses: ["answered", "insufficient_evidence"],
    unavailable_when: BASE_UNAVAILABLE_REASONS,
  },
  {
    question_set_version: AI_ASSISTANCE_QUESTION_SET_V01_VERSION,
    question_id: "question-claim-weak-evidence-v01",
    question_type: "assess_claim_support",
    text: "What evidence is weak, indirect, or insufficient for this claim?",
    inspects: ["evidence_sufficiency", "uncertainty", "missing_evidence"],
    required_references: ["case_package", "claim_id"],
    expected_answer_statuses: ["answered", "insufficient_evidence"],
    unavailable_when: BASE_UNAVAILABLE_REASONS,
  },
  {
    question_set_version: AI_ASSISTANCE_QUESTION_SET_V01_VERSION,
    question_id: "question-claim-missing-context-v01",
    question_type: "identify_missing_evidence",
    text: "What missing context would be needed to judge this claim?",
    inspects: ["missing_evidence", "uncertainty", "evidence_sufficiency"],
    required_references: ["case_package", "claim_id"],
    expected_answer_statuses: ["answered", "insufficient_evidence"],
    unavailable_when: BASE_UNAVAILABLE_REASONS,
  },
  {
    question_set_version: AI_ASSISTANCE_QUESTION_SET_V01_VERSION,
    question_id: "question-claim-contradiction-v01",
    question_type: "assess_claim_support",
    text: "Does any evidence contradict this claim?",
    inspects: ["contradiction", "claim_support"],
    required_references: ["case_package", "claim_id"],
    expected_answer_statuses: ["answered", "insufficient_evidence"],
    unavailable_when: BASE_UNAVAILABLE_REASONS,
  },
  {
    question_set_version: AI_ASSISTANCE_QUESTION_SET_V01_VERSION,
    question_id: "question-label-overclaim-v01",
    question_type: "compare_labels",
    text: "Does the label or explanation claim more than the evidence supports?",
    inspects: [
      "overclaim_detection",
      "evidence_sufficiency",
      "missing_evidence",
    ],
    required_references: ["case_package", "label_id"],
    expected_answer_statuses: ["answered", "insufficient_evidence"],
    unavailable_when: BASE_UNAVAILABLE_REASONS,
  },
  {
    question_set_version: AI_ASSISTANCE_QUESTION_SET_V01_VERSION,
    question_id: "question-cluster-impurity-v01",
    question_type: "summarize_evidence",
    text: "Which evidence suggests the cluster may be mixed or impure?",
    inspects: ["cluster_boundary_impurity", "contradiction", "uncertainty"],
    required_references: ["case_package"],
    optional_references: ["evidence_id", "claim_id", "label_id"],
    expected_answer_statuses: ["answered", "insufficient_evidence"],
    unavailable_when: BASE_UNAVAILABLE_REASONS,
  },
  {
    question_set_version: AI_ASSISTANCE_QUESTION_SET_V01_VERSION,
    question_id: "question-assistance-unavailable-v01",
    question_type: "explain_uncertainty",
    text: "Why is AI assistance unavailable for this question or case?",
    inspects: ["refusal_unavailable_behavior", "uncertainty"],
    required_references: ["case_package"],
    optional_references: ["target_question_id", "unavailable_reason"],
    expected_answer_statuses: ["refused"],
    unavailable_when: [
      "missing_valid_case_package",
      "unsupported_question_id",
      "missing_required_reference",
      "unknown_required_reference",
      "case_or_evidence_not_reviewable",
      "free_form_user_question",
      "operational_or_remediation_request",
      "raw_telemetry_or_live_investigation_request",
      "external_lookup_or_provider_unavailable",
    ],
  },
] as const satisfies readonly AiAssistanceQuestionDefinitionV01[];

export type AiAssistanceQuestionIdV01 =
  (typeof AI_ASSISTANCE_QUESTION_SET_V01)[number]["question_id"];

export const AI_ASSISTANCE_ALLOWED_QUESTION_IDS_V01 =
  AI_ASSISTANCE_QUESTION_SET_V01.map((question) => question.question_id);

export const AI_ASSISTANCE_DISALLOWED_QUESTION_EXAMPLES_V01 = [
  {
    text: "Can I ask anything about this telemetry cluster?",
    reason: "free_form_chatbot",
    expected_status: "refused",
    rationale:
      "The assistance boundary is a fixed question set, not an arbitrary chat surface.",
  },
  {
    text: "Explain IAM security best practices in general.",
    reason: "generic_cybersecurity_question",
    expected_status: "refused",
    rationale:
      "Generic cybersecurity education is outside the CasePackage evidence review bench.",
  },
  {
    text: "What remediation actions should the SOC take next?",
    reason: "operational_remediation",
    expected_status: "refused",
    rationale:
      "Telemetry Court reviews evidence support; it does not generate operational response actions.",
  },
  {
    text: "Investigate the live alert and search the raw logs.",
    reason: "raw_telemetry_or_live_investigation",
    expected_status: "refused",
    rationale:
      "The app does not ingest raw telemetry or perform live investigation.",
  },
  {
    text: "Look up external threat intelligence for this principal.",
    reason: "external_lookup",
    expected_status: "refused",
    rationale:
      "Assistance must stay within the supplied CasePackage or ReviewResult context.",
  },
] as const satisfies readonly AiAssistanceDisallowedQuestionExampleV01[];

export function getAiAssistanceQuestionDefinitionV01(
  questionId: string,
): AiAssistanceQuestionDefinitionV01 | undefined {
  return AI_ASSISTANCE_QUESTION_SET_V01.find(
    (question) => question.question_id === questionId,
  );
}

export function isAllowedAiAssistanceQuestionIdV01(
  questionId: string,
): questionId is AiAssistanceQuestionIdV01 {
  return AI_ASSISTANCE_ALLOWED_QUESTION_IDS_V01.includes(
    questionId as AiAssistanceQuestionIdV01,
  );
}

export function toAiAssistanceResponseQuestionV01(
  definition: Pick<
    AiAssistanceQuestionDefinitionV01,
    "question_id" | "question_type" | "text"
  >,
): AiAssistanceQuestionV01 {
  return {
    question_id: definition.question_id,
    question_type: definition.question_type,
    text: definition.text,
  };
}
