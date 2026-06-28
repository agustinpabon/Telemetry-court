import {
  getAiAssistanceQuestionDefinitionV01,
  toAiAssistanceResponseQuestionV01,
  type AiAssistanceQuestionDefinitionV01,
  type AiAssistanceQuestionIdV01,
  type AiAssistanceQuestionReferenceTypeV01,
} from "@/lib/aiAssistanceQuestionSetV01";
import type {
  AiAssistanceAnswerStatusV01,
  AiAssistanceQuestionV01,
  AiAssistanceRefusalReasonV01,
} from "@/lib/aiAssistanceResponseV01";
import { validateCasePackageV01 } from "@/lib/casePackageValidation";
import type {
  CasePackageClaimId,
  CasePackageEvidenceId,
  CasePackageLabelId,
  CasePackageV01,
} from "@/lib/types";

export const AI_ASSISTANCE_QUESTION_GUARDRAIL_STATUSES_V01 = [
  "allowed",
  "unavailable",
  "refused",
] as const;

export const AI_ASSISTANCE_QUESTION_GUARDRAIL_REASON_CODES_V01 = [
  "unsupported_question_id",
  "missing_valid_case_package",
  "missing_required_reference",
  "unknown_claim_id",
  "unknown_evidence_id",
  "unknown_label_id",
  "outside_case_scope",
  "freeform_prompt_disallowed",
  "generic_chatbot_request_disallowed",
  "operational_action_disallowed",
  "external_lookup_disallowed",
] as const;

export type AiAssistanceQuestionGuardrailStatusV01 =
  (typeof AI_ASSISTANCE_QUESTION_GUARDRAIL_STATUSES_V01)[number];

export type AiAssistanceQuestionGuardrailReasonCodeV01 =
  (typeof AI_ASSISTANCE_QUESTION_GUARDRAIL_REASON_CODES_V01)[number];

export type AiAssistanceQuestionGuardrailReferencesV01 = {
  claim_id?: CasePackageClaimId;
  evidence_id?: CasePackageEvidenceId;
  label_id?: CasePackageLabelId;
  target_question_id?: string;
  unavailable_reason?: string;
};

export type AiAssistanceQuestionGuardrailRequestV01 = {
  question_id: string;
  references?: AiAssistanceQuestionGuardrailReferencesV01;
};

export type AiAssistanceQuestionGuardrailContextV01 = {
  casePackage?: unknown;
};

export type AiAssistanceQuestionGuardrailAllowedResultV01 = {
  status: Extract<AiAssistanceQuestionGuardrailStatusV01, "allowed">;
  question_id: AiAssistanceQuestionIdV01;
  question: AiAssistanceQuestionV01;
  references: AiAssistanceQuestionGuardrailReferencesV01;
  required_references: readonly AiAssistanceQuestionReferenceTypeV01[];
  expected_answer_statuses: readonly AiAssistanceAnswerStatusV01[];
};

export type AiAssistanceQuestionGuardrailBlockedResultV01 = {
  status: Extract<
    AiAssistanceQuestionGuardrailStatusV01,
    "unavailable" | "refused"
  >;
  reason_code: AiAssistanceQuestionGuardrailReasonCodeV01;
  question_id?: string;
  required_reference?: AiAssistanceQuestionReferenceTypeV01;
  reference_id?: string;
  response_answer_status: Extract<AiAssistanceAnswerStatusV01, "refused">;
  response_refusal_reason: AiAssistanceRefusalReasonV01;
};

export type AiAssistanceQuestionGuardrailResultV01 =
  | AiAssistanceQuestionGuardrailAllowedResultV01
  | AiAssistanceQuestionGuardrailBlockedResultV01;

type ObjectRecord = Record<string, unknown>;

type ReferenceExistenceCheck = {
  referenceType: Extract<
    AiAssistanceQuestionReferenceTypeV01,
    "claim_id" | "evidence_id" | "label_id"
  >;
  value: string | undefined;
  knownIds: ReadonlySet<string>;
  reasonCode: Extract<
    AiAssistanceQuestionGuardrailReasonCodeV01,
    "unknown_claim_id" | "unknown_evidence_id" | "unknown_label_id"
  >;
};

const allowedRequestFields = ["question_id", "references"] as const;
const allowedReferenceFields = [
  "claim_id",
  "evidence_id",
  "label_id",
  "target_question_id",
  "unavailable_reason",
] as const;
const promptTextFields = [
  "prompt",
  "prompt_text",
  "freeform_prompt",
  "message",
  "text",
  "question",
  "query",
  "content",
] as const;
const requestedCapabilityFields = [
  "requested_action",
  "requested_capability",
  "intent",
  "scope",
  "task",
  "action",
] as const;

const genericChatbotRequestPattern =
  /\b(ask anything|ask me anything|chatbot|chat with|best practices|in general|general advice|explain\s+\w+|teach me|how do i|what should i do|recommend)\b/i;
const operationalActionRequestPattern =
  /\b(soc|remediat|response action|incident|alert triage|triage|respond|contain|block|isolate|ticket|escalat|investigat|live alert|live investigation|raw telemetry|raw logs|search logs|log search|query logs|operational)\b/i;
const externalLookupRequestPattern =
  /\b(external|internet|web search|search online|threat intelligence|threat intel|osint|look up|lookup|provider lookup|vendor lookup)\b/i;

export function guardAiAssistanceQuestionRequestV01(
  request: unknown,
  context: AiAssistanceQuestionGuardrailContextV01 = {},
): AiAssistanceQuestionGuardrailResultV01 {
  if (typeof request === "string") {
    return blockedResult({
      status: "refused",
      reasonCode: "freeform_prompt_disallowed",
    });
  }

  if (!isObjectRecord(request)) {
    return blockedResult({
      status: "refused",
      reasonCode: "freeform_prompt_disallowed",
    });
  }

  const disallowedEnvelopeReason = detectDisallowedRequestEnvelope(request);
  const questionId = readOptionalString(request.question_id);

  if (disallowedEnvelopeReason) {
    return blockedResult({
      status: "refused",
      reasonCode: disallowedEnvelopeReason,
      questionId,
    });
  }

  const definition = questionId
    ? getAiAssistanceQuestionDefinitionV01(questionId)
    : undefined;

  if (!definition) {
    return blockedResult({
      status: "unavailable",
      reasonCode: "unsupported_question_id",
      questionId,
    });
  }

  const casePackageResult = validateRequiredCasePackage(
    context.casePackage,
    definition,
  );

  if (!casePackageResult.ok) {
    return blockedResult({
      status: "unavailable",
      reasonCode: "missing_valid_case_package",
      questionId: definition.question_id,
      requiredReference: "case_package",
    });
  }

  const references = readReferences(request.references);
  const missingReference = findMissingRequiredReference(definition, references);

  if (missingReference) {
    return blockedResult({
      status: "unavailable",
      reasonCode: "missing_required_reference",
      questionId: definition.question_id,
      requiredReference: missingReference,
    });
  }

  const unknownReference = findUnknownReference(
    references,
    casePackageResult.casePackage,
  );

  if (unknownReference) {
    return blockedResult({
      status: "unavailable",
      reasonCode: unknownReference.reasonCode,
      questionId: definition.question_id,
      referenceId: unknownReference.referenceId,
    });
  }

  return {
    status: "allowed",
    question_id: definition.question_id as AiAssistanceQuestionIdV01,
    question: toAiAssistanceResponseQuestionV01(definition),
    references,
    required_references: definition.required_references,
    expected_answer_statuses: definition.expected_answer_statuses,
  };
}

function detectDisallowedRequestEnvelope(
  request: ObjectRecord,
): AiAssistanceQuestionGuardrailReasonCodeV01 | undefined {
  const chatbotText = collectTextFromChatEnvelope(request);
  if (chatbotText.length > 0) {
    return classifyDisallowedRequestText(chatbotText.join(" ")) ??
      "generic_chatbot_request_disallowed";
  }

  const promptText = collectStringFields(request, promptTextFields);
  if (promptText.length > 0) {
    return classifyDisallowedRequestText(promptText.join(" ")) ??
      "freeform_prompt_disallowed";
  }

  const capabilityText = collectStringFields(request, requestedCapabilityFields);
  if (capabilityText.length > 0) {
    return classifyDisallowedRequestText(capabilityText.join(" ")) ??
      "outside_case_scope";
  }

  if (hasUnknownRequestFields(request)) return "outside_case_scope";
  if (hasUnknownReferenceFields(request.references)) return "outside_case_scope";

  return undefined;
}

function collectTextFromChatEnvelope(request: ObjectRecord): string[] {
  const messages = request.messages;
  if (!Array.isArray(messages)) return [];

  return messages.flatMap((message) => {
    if (typeof message === "string") return [message];
    if (!isObjectRecord(message)) return [];

    return collectStringFields(message, ["content", "text", "message"]);
  });
}

function classifyDisallowedRequestText(
  text: string,
): AiAssistanceQuestionGuardrailReasonCodeV01 | undefined {
  if (operationalActionRequestPattern.test(text)) {
    return "operational_action_disallowed";
  }

  if (externalLookupRequestPattern.test(text)) {
    return "external_lookup_disallowed";
  }

  if (genericChatbotRequestPattern.test(text)) {
    return "generic_chatbot_request_disallowed";
  }

  return undefined;
}

function validateRequiredCasePackage(
  casePackage: unknown,
  definition: AiAssistanceQuestionDefinitionV01,
):
  | { ok: true; casePackage: CasePackageV01 }
  | { ok: false } {
  if (!definition.required_references.includes("case_package")) {
    return { ok: true, casePackage: casePackage as CasePackageV01 };
  }

  const validation = validateCasePackageV01(casePackage);

  return validation.ok ? { ok: true, casePackage: validation.package } : { ok: false };
}

function findMissingRequiredReference(
  definition: AiAssistanceQuestionDefinitionV01,
  references: AiAssistanceQuestionGuardrailReferencesV01,
): AiAssistanceQuestionReferenceTypeV01 | undefined {
  return definition.required_references.find((referenceType) => {
    if (referenceType === "case_package") return false;

    return !isNonEmptyString(readReferenceValue(references, referenceType));
  });
}

function findUnknownReference(
  references: AiAssistanceQuestionGuardrailReferencesV01,
  casePackage: CasePackageV01,
):
  | {
      reasonCode: Extract<
        AiAssistanceQuestionGuardrailReasonCodeV01,
        "unknown_claim_id" | "unknown_evidence_id" | "unknown_label_id"
      >;
      referenceId: string;
    }
  | undefined {
  const checks: readonly ReferenceExistenceCheck[] = [
    {
      referenceType: "claim_id",
      value: references.claim_id,
      knownIds: new Set(casePackage.claims.map((claim) => claim.claim_id)),
      reasonCode: "unknown_claim_id",
    },
    {
      referenceType: "evidence_id",
      value: references.evidence_id,
      knownIds: new Set(
        casePackage.evidence_items.map((item) => item.evidence_id),
      ),
      reasonCode: "unknown_evidence_id",
    },
    {
      referenceType: "label_id",
      value: references.label_id,
      knownIds: new Set(
        casePackage.candidate_labels.map((label) => label.label_id),
      ),
      reasonCode: "unknown_label_id",
    },
  ];

  const failedCheck = checks.find(
    (check) => check.value !== undefined && !check.knownIds.has(check.value),
  );

  return failedCheck && failedCheck.value
    ? {
        reasonCode: failedCheck.reasonCode,
        referenceId: failedCheck.value,
      }
    : undefined;
}

function readReferences(
  input: unknown,
): AiAssistanceQuestionGuardrailReferencesV01 {
  if (!isObjectRecord(input)) return {};

  return {
    ...(isNonEmptyString(input.claim_id)
      ? { claim_id: input.claim_id }
      : {}),
    ...(isNonEmptyString(input.evidence_id)
      ? { evidence_id: input.evidence_id }
      : {}),
    ...(isNonEmptyString(input.label_id)
      ? { label_id: input.label_id }
      : {}),
    ...(isNonEmptyString(input.target_question_id)
      ? { target_question_id: input.target_question_id }
      : {}),
    ...(isNonEmptyString(input.unavailable_reason)
      ? { unavailable_reason: input.unavailable_reason }
      : {}),
  };
}

function readReferenceValue(
  references: AiAssistanceQuestionGuardrailReferencesV01,
  referenceType: AiAssistanceQuestionReferenceTypeV01,
): string | undefined {
  if (referenceType === "claim_id") return references.claim_id;
  if (referenceType === "evidence_id") return references.evidence_id;
  if (referenceType === "label_id") return references.label_id;
  if (referenceType === "target_question_id") return references.target_question_id;
  if (referenceType === "unavailable_reason") return references.unavailable_reason;

  return undefined;
}

function blockedResult({
  status,
  reasonCode,
  questionId,
  requiredReference,
  referenceId,
}: {
  status: AiAssistanceQuestionGuardrailBlockedResultV01["status"];
  reasonCode: AiAssistanceQuestionGuardrailReasonCodeV01;
  questionId?: string;
  requiredReference?: AiAssistanceQuestionReferenceTypeV01;
  referenceId?: string;
}): AiAssistanceQuestionGuardrailBlockedResultV01 {
  return {
    status,
    reason_code: reasonCode,
    ...(questionId ? { question_id: questionId } : {}),
    ...(requiredReference ? { required_reference: requiredReference } : {}),
    ...(referenceId ? { reference_id: referenceId } : {}),
    response_answer_status: "refused",
    response_refusal_reason: mapReasonCodeToRefusalReason(reasonCode),
  };
}

function mapReasonCodeToRefusalReason(
  reasonCode: AiAssistanceQuestionGuardrailReasonCodeV01,
): AiAssistanceRefusalReasonV01 {
  if (
    reasonCode === "missing_valid_case_package" ||
    reasonCode === "missing_required_reference" ||
    reasonCode === "unknown_claim_id" ||
    reasonCode === "unknown_evidence_id" ||
    reasonCode === "unknown_label_id"
  ) {
    return "missing_context";
  }

  if (
    reasonCode === "outside_case_scope" ||
    reasonCode === "generic_chatbot_request_disallowed" ||
    reasonCode === "operational_action_disallowed" ||
    reasonCode === "external_lookup_disallowed"
  ) {
    return "outside_case_scope";
  }

  return "unsupported_request";
}

function collectStringFields(
  record: ObjectRecord,
  fields: readonly string[],
): string[] {
  return fields.flatMap((field) => {
    const value = record[field];

    return typeof value === "string" && value.trim().length > 0
      ? [value]
      : [];
  });
}

function hasUnknownRequestFields(request: ObjectRecord): boolean {
  return Object.keys(request).some(
    (field) => !allowedRequestFields.includes(field as (typeof allowedRequestFields)[number]),
  );
}

function hasUnknownReferenceFields(input: unknown): boolean {
  if (input === undefined) return false;
  if (!isObjectRecord(input)) return true;

  return Object.keys(input).some(
    (field) =>
      !allowedReferenceFields.includes(
        field as (typeof allowedReferenceFields)[number],
      ),
  );
}

function readOptionalString(input: unknown): string | undefined {
  return typeof input === "string" && input.trim().length > 0 ? input : undefined;
}

function isNonEmptyString(input: unknown): input is string {
  return typeof input === "string" && input.trim().length > 0;
}

function isObjectRecord(input: unknown): input is ObjectRecord {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}
