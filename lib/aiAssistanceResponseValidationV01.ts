import {
  AI_ASSISTANCE_RESPONSE_V01_ANSWER_STATUSES,
  AI_ASSISTANCE_RESPONSE_V01_FINDING_SUPPORT,
  AI_ASSISTANCE_RESPONSE_V01_GENERATION_MODES,
  AI_ASSISTANCE_RESPONSE_V01_OUTPUT_WARNING_CODES,
  AI_ASSISTANCE_RESPONSE_V01_QUESTION_TYPES,
  AI_ASSISTANCE_RESPONSE_V01_REFUSAL_REASONS,
  AI_ASSISTANCE_RESPONSE_V01_SCHEMA_VERSION,
  AI_ASSISTANCE_RESPONSE_V01_UNCERTAINTY_LEVELS,
  type AiAssistanceResponseV01,
} from "@/lib/aiAssistanceResponseV01";
import {
  REVIEW_RESULT_V01_SCHEMA_VERSION,
  type ReviewResultV01,
} from "@/lib/reviewResultV01";
import {
  CASE_PACKAGE_V01_SCHEMA_VERSION,
  type CasePackageV01,
} from "@/lib/types";
import {
  addError,
  isNonEmptyString,
  isObjectRecord,
  rejectUnknownFields,
  requireEnum,
  requireExactValue,
  requireIsoTimestamp,
  requireNonEmptyString,
  requireObject,
  validateOptionalString,
  validateStableReferenceArray,
  validateStableReferenceArrayValues,
  type AiAssistanceResponseValidationErrorV01,
} from "@/lib/aiAssistanceResponseValidationHelpersV01";

export type { AiAssistanceResponseValidationErrorV01 };

export type AiAssistanceResponseValidationWarningCodeV01 =
  "ai_assistance.generic_chatbot_answer";

export type AiAssistanceResponseValidationWarningV01 = {
  path: string;
  code: AiAssistanceResponseValidationWarningCodeV01;
  message: string;
  responseId?: string;
};

export type AiAssistanceResponseValidationContextV01 = {
  casePackage?: CasePackageV01;
  reviewResult?: ReviewResultV01;
};

export type AiAssistanceResponseValidationResultV01 =
  | {
      ok: true;
      response: AiAssistanceResponseV01;
      warnings: AiAssistanceResponseValidationWarningV01[];
    }
  | {
      ok: false;
      errors: AiAssistanceResponseValidationErrorV01[];
      warnings: AiAssistanceResponseValidationWarningV01[];
    };

const topLevelFields = [
  "schema_version",
  "response_id",
  "created_at",
  "case_package",
  "review_result",
  "question",
  "generation",
  "answer",
  "findings",
  "warnings",
] as const;
const casePackageFields = [
  "schema_version",
  "package_id",
  "package_revision",
  "case_id",
  "cluster_id",
  "pipeline",
] as const;
const pipelineStringFields = [
  "pipeline_id",
  "run_id",
  "upstream_tool",
  "pipeline_version",
  "embedding_model",
  "clustering_method",
  "dimensionality_reduction_method",
  "naming_model",
  "prompt_id",
  "prompt_version",
  "prompt_digest",
  "generated_at",
] as const;
const reviewResultFields = [
  "schema_version",
  "review_id",
  "reviewer_id",
  "review_session_id",
] as const;
const questionFields = ["question_id", "question_type", "text"] as const;
const generationFields = ["mode", "model", "prompt"] as const;
const modelFields = ["provider", "model_id", "model_version"] as const;
const promptFields = ["prompt_id", "prompt_version", "prompt_digest"] as const;
const answerFields = [
  "status",
  "summary",
  "evidence_ids",
  "insufficiency_reason",
  "refusal_reason",
] as const;
const findingFields = [
  "finding_id",
  "text",
  "support",
  "evidence_ids",
  "related_claim_ids",
  "related_label_ids",
  "uncertainty",
  "insufficiency_reason",
] as const;
const uncertaintyFields = ["level", "explanation"] as const;
const outputWarningFields = [
  "warning_id",
  "code",
  "message",
  "evidence_ids",
] as const;

const stableEvidenceIdPattern = /^evidence-[A-Za-z0-9][A-Za-z0-9._:-]*$/;
const stableClaimIdPattern = /^claim-[A-Za-z0-9][A-Za-z0-9._:-]*$/;
const stableLabelIdPattern = /^label-[A-Za-z0-9][A-Za-z0-9._:-]*$/;
const genericChatbotAnswerPattern =
  /\b(i can help|i'm here to help|happy to help|how can i help|ask me anything|as an ai language model)\b/i;

export function validateAiAssistanceResponseV01(
  input: unknown,
  context: AiAssistanceResponseValidationContextV01 = {},
): AiAssistanceResponseValidationResultV01 {
  const errors: AiAssistanceResponseValidationErrorV01[] = [];
  const warnings: AiAssistanceResponseValidationWarningV01[] = [];
  const response = requireObject(input, "$", errors);

  if (!response) {
    return { ok: false, errors, warnings };
  }

  rejectUnknownFields(response, topLevelFields, "$", errors);

  requireExactValue(
    response.schema_version,
    AI_ASSISTANCE_RESPONSE_V01_SCHEMA_VERSION,
    "$.schema_version",
    "unsupported_schema_version",
    errors,
  );
  const responseId = requireNonEmptyString(
    response.response_id,
    "$.response_id",
    errors,
  );
  requireIsoTimestamp(response.created_at, "$.created_at", errors);

  const contextIds = buildContextReferenceIds(context);

  validateCasePackageReference(
    response.case_package,
    "$.case_package",
    context.casePackage,
    errors,
  );
  validateReviewResultReference(
    response.review_result,
    "$.review_result",
    context.reviewResult,
    errors,
  );
  validateQuestion(response.question, "$.question", errors);
  validateGeneration(response.generation, "$.generation", errors);
  const answerState = validateAnswer(
    response.answer,
    "$.answer",
    contextIds.evidenceIds,
    responseId,
    errors,
    warnings,
  );
  const findingState = validateFindings(
    response.findings,
    "$.findings",
    contextIds,
    errors,
  );
  validateOutputWarnings(
    response.warnings,
    "$.warnings",
    contextIds.evidenceIds,
    errors,
  );

  validateGroundingRules(answerState, findingState, errors);

  return errors.length === 0
    ? {
        ok: true,
        response: response as AiAssistanceResponseV01,
        warnings,
      }
    : { ok: false, errors, warnings };
}

export function assertValidAiAssistanceResponseV01(
  input: unknown,
  context: AiAssistanceResponseValidationContextV01 = {},
): AiAssistanceResponseV01 {
  const result = validateAiAssistanceResponseV01(input, context);

  if (!result.ok) {
    const firstError = result.errors[0];
    throw new Error(
      firstError
        ? `Invalid AI assistance response v0.1 at ${firstError.path}: ${firstError.message}`
        : "Invalid AI assistance response v0.1 artifact.",
    );
  }

  return result.response;
}

function validateCasePackageReference(
  input: unknown,
  path: string,
  casePackage: CasePackageV01 | undefined,
  errors: AiAssistanceResponseValidationErrorV01[],
) {
  const reference = requireObject(input, path, errors);
  if (!reference) return;

  rejectUnknownFields(reference, casePackageFields, path, errors);

  requireExactValue(
    reference.schema_version,
    CASE_PACKAGE_V01_SCHEMA_VERSION,
    `${path}.schema_version`,
    "unsupported_case_package_schema_version",
    errors,
  );
  const packageId = requireNonEmptyString(
    reference.package_id,
    `${path}.package_id`,
    errors,
  );
  validateOptionalString(reference.package_revision, `${path}.package_revision`, errors);
  const caseId = requireNonEmptyString(reference.case_id, `${path}.case_id`, errors);
  const clusterId = requireNonEmptyString(
    reference.cluster_id,
    `${path}.cluster_id`,
    errors,
  );

  const pipeline = requireObject(reference.pipeline, `${path}.pipeline`, errors);
  if (pipeline) {
    rejectUnknownFields(pipeline, pipelineStringFields, `${path}.pipeline`, errors);

    for (const field of pipelineStringFields) {
      const fieldPath = `${path}.pipeline.${field}`;
      if (field === "generated_at") {
        requireIsoTimestamp(pipeline[field], fieldPath, errors);
      } else if (field === "run_id" || field === "upstream_tool") {
        requireNonEmptyString(pipeline[field], fieldPath, errors);
      } else {
        validateOptionalString(pipeline[field], fieldPath, errors);
      }
    }
  }

  if (!casePackage) return;

  const revisionMatches =
    reference.package_revision === undefined ||
    casePackage.package_revision === undefined ||
    reference.package_revision === casePackage.package_revision;
  const pipelineRunId = isObjectRecord(reference.pipeline)
    ? reference.pipeline.run_id
    : undefined;

  if (
    packageId &&
    caseId &&
    clusterId &&
    pipelineRunId &&
    (packageId !== casePackage.package_id ||
      caseId !== casePackage.case.case_id ||
      clusterId !== casePackage.cluster.cluster_id ||
      pipelineRunId !== casePackage.pipeline.run_id ||
      !revisionMatches)
  ) {
    addError(
      errors,
      path,
      "case_package_context_mismatch",
      "CasePackage reference must match the supplied CasePackage validation context.",
    );
  }
}

function validateReviewResultReference(
  input: unknown,
  path: string,
  reviewResult: ReviewResultV01 | undefined,
  errors: AiAssistanceResponseValidationErrorV01[],
) {
  if (input === undefined) return;

  const reference = requireObject(input, path, errors);
  if (!reference) return;

  rejectUnknownFields(reference, reviewResultFields, path, errors);

  requireExactValue(
    reference.schema_version,
    REVIEW_RESULT_V01_SCHEMA_VERSION,
    `${path}.schema_version`,
    "unsupported_review_result_schema_version",
    errors,
  );
  const reviewId = requireNonEmptyString(
    reference.review_id,
    `${path}.review_id`,
    errors,
  );
  validateOptionalString(reference.reviewer_id, `${path}.reviewer_id`, errors);
  validateOptionalString(
    reference.review_session_id,
    `${path}.review_session_id`,
    errors,
  );

  if (reviewResult && reviewId && reviewId !== reviewResult.review_id) {
    addError(
      errors,
      `${path}.review_id`,
      "review_result_context_mismatch",
      "ReviewResult reference must match the supplied ReviewResult validation context.",
    );
  }
}

function validateQuestion(
  input: unknown,
  path: string,
  errors: AiAssistanceResponseValidationErrorV01[],
) {
  const question = requireObject(input, path, errors);
  if (!question) return;

  rejectUnknownFields(question, questionFields, path, errors);
  requireNonEmptyString(question.question_id, `${path}.question_id`, errors);
  requireEnum(
    question.question_type,
    AI_ASSISTANCE_RESPONSE_V01_QUESTION_TYPES,
    `${path}.question_type`,
    errors,
  );
  requireNonEmptyString(question.text, `${path}.text`, errors);
}

function validateGeneration(
  input: unknown,
  path: string,
  errors: AiAssistanceResponseValidationErrorV01[],
) {
  const generation = requireObject(input, path, errors);
  if (!generation) return;

  rejectUnknownFields(generation, generationFields, path, errors);
  requireEnum(
    generation.mode,
    AI_ASSISTANCE_RESPONSE_V01_GENERATION_MODES,
    `${path}.mode`,
    errors,
  );

  const model = requireObject(generation.model, `${path}.model`, errors);
  if (model) {
    rejectUnknownFields(model, modelFields, `${path}.model`, errors);
    validateOptionalString(model.provider, `${path}.model.provider`, errors);
    requireNonEmptyString(model.model_id, `${path}.model.model_id`, errors);
    validateOptionalString(model.model_version, `${path}.model.model_version`, errors);
  }

  const prompt = requireObject(generation.prompt, `${path}.prompt`, errors);
  if (prompt) {
    rejectUnknownFields(prompt, promptFields, `${path}.prompt`, errors);
    requireNonEmptyString(prompt.prompt_id, `${path}.prompt.prompt_id`, errors);
    validateOptionalString(prompt.prompt_version, `${path}.prompt.prompt_version`, errors);
    validateOptionalString(prompt.prompt_digest, `${path}.prompt.prompt_digest`, errors);
  }
}

function validateAnswer(
  input: unknown,
  path: string,
  allowedEvidenceIds: Set<string> | undefined,
  responseId: string | undefined,
  errors: AiAssistanceResponseValidationErrorV01[],
  warnings: AiAssistanceResponseValidationWarningV01[],
) {
  const answer = requireObject(input, path, errors);
  if (!answer) {
    return { status: undefined, evidenceCount: 0 };
  }

  rejectUnknownFields(answer, answerFields, path, errors);
  const status = requireEnum(
    answer.status,
    AI_ASSISTANCE_RESPONSE_V01_ANSWER_STATUSES,
    `${path}.status`,
    errors,
  );
  const summary = requireNonEmptyString(answer.summary, `${path}.summary`, errors);
  const evidenceIds = validateEvidenceIdArray(
    answer.evidence_ids,
    `${path}.evidence_ids`,
    allowedEvidenceIds,
    errors,
  );
  validateOptionalString(
    answer.insufficiency_reason,
    `${path}.insufficiency_reason`,
    errors,
  );

  if (answer.refusal_reason !== undefined) {
    requireEnum(
      answer.refusal_reason,
      AI_ASSISTANCE_RESPONSE_V01_REFUSAL_REASONS,
      `${path}.refusal_reason`,
      errors,
    );
  }

  if (status === "answered" && evidenceIds.length === 0) {
    addError(
      errors,
      `${path}.evidence_ids`,
      "missing_answer_evidence",
      "Answered AI assistance responses must cite at least one evidence ID.",
    );
  }

  if (
    status === "insufficient_evidence" &&
    !isNonEmptyString(answer.insufficiency_reason)
  ) {
    addError(
      errors,
      `${path}.insufficiency_reason`,
      "missing_insufficiency_reason",
      "Insufficient-evidence responses must explain the evidence gap.",
    );
  }

  if (status === "refused" && !isNonEmptyString(answer.refusal_reason)) {
    addError(
      errors,
      `${path}.refusal_reason`,
      "missing_refusal_reason",
      "Refused AI assistance responses must include a refusal reason.",
    );
  }

  if (summary && genericChatbotAnswerPattern.test(summary)) {
    warnings.push({
      path: `${path}.summary`,
      code: "ai_assistance.generic_chatbot_answer",
      responseId,
      message:
        "Answer summary looks like generic chatbot copy. The response remains valid only if its substantive findings are evidence grounded.",
    });
  }

  return { status, evidenceCount: evidenceIds.length };
}

function validateFindings(
  input: unknown,
  path: string,
  contextIds: ContextReferenceIds,
  errors: AiAssistanceResponseValidationErrorV01[],
) {
  if (!Array.isArray(input)) {
    addError(errors, path, "invalid_type", "must be an array.");
    return {
      count: 0,
      groundedFindingCount: 0,
      ungroundedSubstantiveFindingCount: 0,
    };
  }

  const seenFindingIds = new Set<string>();
  let groundedFindingCount = 0;
  let ungroundedSubstantiveFindingCount = 0;

  input.forEach((item, index) => {
    const itemPath = `${path}[${index}]`;
    const finding = requireObject(item, itemPath, errors);
    if (!finding) return;

    rejectUnknownFields(finding, findingFields, itemPath, errors);
    const findingId = requireNonEmptyString(
      finding.finding_id,
      `${itemPath}.finding_id`,
      errors,
    );
    if (findingId) {
      if (seenFindingIds.has(findingId)) {
        addError(
          errors,
          `${itemPath}.finding_id`,
          "duplicate_finding_id",
          `duplicates finding ID "${findingId}".`,
        );
      }
      seenFindingIds.add(findingId);
    }

    requireNonEmptyString(finding.text, `${itemPath}.text`, errors);
    const support = requireEnum(
      finding.support,
      AI_ASSISTANCE_RESPONSE_V01_FINDING_SUPPORT,
      `${itemPath}.support`,
      errors,
    );
    const evidenceIds = validateEvidenceIdArray(
      finding.evidence_ids,
      `${itemPath}.evidence_ids`,
      contextIds.evidenceIds,
      errors,
    );

    if (evidenceIds.length > 0) {
      groundedFindingCount += 1;
    } else if (support !== "insufficient" && support !== "needs_more_context") {
      ungroundedSubstantiveFindingCount += 1;
      addError(
        errors,
        `${itemPath}.evidence_ids`,
        "missing_finding_evidence",
        "Supported, weakly supported, or contradicting findings must cite evidence IDs.",
      );
    }

    if (
      evidenceIds.length === 0 &&
      (support === "insufficient" || support === "needs_more_context") &&
      !isNonEmptyString(finding.insufficiency_reason)
    ) {
      addError(
        errors,
        `${itemPath}.insufficiency_reason`,
        "missing_insufficiency_reason",
        "Findings without evidence IDs must explicitly explain the evidence gap.",
      );
    }

    validateStableReferenceArray(
      finding.related_claim_ids,
      `${itemPath}.related_claim_ids`,
      stableClaimIdPattern,
      "malformed_claim_id",
      contextIds.claimIds,
      "unknown_claim_reference",
      errors,
    );
    validateStableReferenceArray(
      finding.related_label_ids,
      `${itemPath}.related_label_ids`,
      stableLabelIdPattern,
      "malformed_label_id",
      contextIds.labelIds,
      "unknown_label_reference",
      errors,
    );
    validateUncertainty(finding.uncertainty, `${itemPath}.uncertainty`, errors);
    validateOptionalString(
      finding.insufficiency_reason,
      `${itemPath}.insufficiency_reason`,
      errors,
    );
  });

  return {
    count: input.length,
    groundedFindingCount,
    ungroundedSubstantiveFindingCount,
  };
}

function validateOutputWarnings(
  input: unknown,
  path: string,
  allowedEvidenceIds: Set<string> | undefined,
  errors: AiAssistanceResponseValidationErrorV01[],
) {
  if (input === undefined) return;

  if (!Array.isArray(input)) {
    addError(errors, path, "invalid_type", "must be an array when provided.");
    return;
  }

  const seenWarningIds = new Set<string>();

  input.forEach((item, index) => {
    const itemPath = `${path}[${index}]`;
    const warning = requireObject(item, itemPath, errors);
    if (!warning) return;

    rejectUnknownFields(warning, outputWarningFields, itemPath, errors);
    const warningId = requireNonEmptyString(
      warning.warning_id,
      `${itemPath}.warning_id`,
      errors,
    );
    if (warningId) {
      if (seenWarningIds.has(warningId)) {
        addError(
          errors,
          `${itemPath}.warning_id`,
          "duplicate_warning_id",
          `duplicates warning ID "${warningId}".`,
        );
      }
      seenWarningIds.add(warningId);
    }
    requireEnum(
      warning.code,
      AI_ASSISTANCE_RESPONSE_V01_OUTPUT_WARNING_CODES,
      `${itemPath}.code`,
      errors,
    );
    requireNonEmptyString(warning.message, `${itemPath}.message`, errors);
    validateOptionalEvidenceIdArray(
      warning.evidence_ids,
      `${itemPath}.evidence_ids`,
      allowedEvidenceIds,
      errors,
    );
  });
}

function validateGroundingRules(
  answerState: { status: string | undefined; evidenceCount: number },
  findingState: {
    count: number;
    groundedFindingCount: number;
    ungroundedSubstantiveFindingCount: number;
  },
  errors: AiAssistanceResponseValidationErrorV01[],
) {
  if (answerState.status !== "answered") return;

  if (findingState.count === 0) {
    addError(
      errors,
      "$.findings",
      "missing_grounded_findings",
      "Answered AI assistance responses must include at least one finding.",
    );
    return;
  }

  if (
    findingState.groundedFindingCount === 0 &&
    findingState.ungroundedSubstantiveFindingCount === 0
  ) {
    addError(
      errors,
      "$.findings",
      "missing_grounded_findings",
      "Answered AI assistance responses must include at least one finding with evidence IDs.",
    );
  }
}

function validateUncertainty(
  input: unknown,
  path: string,
  errors: AiAssistanceResponseValidationErrorV01[],
) {
  if (input === undefined) return;

  const uncertainty = requireObject(input, path, errors);
  if (!uncertainty) return;

  rejectUnknownFields(uncertainty, uncertaintyFields, path, errors);
  requireEnum(
    uncertainty.level,
    AI_ASSISTANCE_RESPONSE_V01_UNCERTAINTY_LEVELS,
    `${path}.level`,
    errors,
  );
  requireNonEmptyString(uncertainty.explanation, `${path}.explanation`, errors);
}

function validateEvidenceIdArray(
  input: unknown,
  path: string,
  allowedEvidenceIds: Set<string> | undefined,
  errors: AiAssistanceResponseValidationErrorV01[],
): string[] {
  if (!Array.isArray(input)) {
    addError(errors, path, "invalid_type", "must be an array.");
    return [];
  }

  return validateStableReferenceArrayValues(
    input,
    path,
    stableEvidenceIdPattern,
    "malformed_evidence_id",
    allowedEvidenceIds,
    "unknown_evidence_reference",
    errors,
  );
}

function validateOptionalEvidenceIdArray(
  input: unknown,
  path: string,
  allowedEvidenceIds: Set<string> | undefined,
  errors: AiAssistanceResponseValidationErrorV01[],
): string[] {
  if (input === undefined) return [];

  if (!Array.isArray(input)) {
    addError(errors, path, "invalid_type", "must be an array when provided.");
    return [];
  }

  return validateStableReferenceArrayValues(
    input,
    path,
    stableEvidenceIdPattern,
    "malformed_evidence_id",
    allowedEvidenceIds,
    "unknown_evidence_reference",
    errors,
  );
}

function buildContextReferenceIds(
  context: AiAssistanceResponseValidationContextV01,
): ContextReferenceIds {
  if (context.casePackage) {
    return {
      evidenceIds: new Set(
        context.casePackage.evidence_items.map((item) => item.evidence_id),
      ),
      claimIds: new Set(context.casePackage.claims.map((claim) => claim.claim_id)),
      labelIds: new Set(
        context.casePackage.candidate_labels.map((label) => label.label_id),
      ),
    };
  }

  if (context.reviewResult) {
    return {
      evidenceIds: new Set(
        context.reviewResult.decisions.evidence_ratings.map(
          (rating) => rating.evidence_id,
        ),
      ),
      claimIds: undefined,
      labelIds: new Set([
        context.reviewResult.decisions.label_comparison.selected_label_id,
      ]),
    };
  }

  return {
    evidenceIds: undefined,
    claimIds: undefined,
    labelIds: undefined,
  };
}

type ContextReferenceIds = {
  evidenceIds: Set<string> | undefined;
  claimIds: Set<string> | undefined;
  labelIds: Set<string> | undefined;
};
