import {
  REVIEW_PROTOCOL_V01_VERSION,
  REVIEW_RESULT_V01_DUEL_REASONS,
  REVIEW_RESULT_V01_EVIDENCE_RATINGS,
  REVIEW_RESULT_V01_RECOMMENDED_ACTIONS,
  REVIEW_RESULT_V01_SCHEMA_VERSION,
  REVIEW_RESULT_V01_VERDICTS,
  type ReviewResultV01,
} from "@/lib/reviewResultV01";
import { CASE_PACKAGE_V01_SCHEMA_VERSION } from "@/lib/types";

export type ReviewResultValidationErrorV01 = {
  path: string;
  code: string;
  message: string;
};

export type ReviewResultValidationResultV01 =
  | { ok: true; reviewResult: ReviewResultV01 }
  | { ok: false; errors: ReviewResultValidationErrorV01[] };

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

export function validateReviewResultV01(
  input: unknown,
  rootPath = "$",
): ReviewResultValidationResultV01 {
  const errors: ReviewResultValidationErrorV01[] = [];
  const reviewResult = requireObject(input, rootPath, errors);

  if (!reviewResult) {
    return { ok: false, errors };
  }

  requireExactValue(
    reviewResult.schema_version,
    REVIEW_RESULT_V01_SCHEMA_VERSION,
    `${rootPath}.schema_version`,
    "unsupported_schema_version",
    errors,
  );
  requireNonEmptyString(reviewResult.review_id, `${rootPath}.review_id`, errors);
  requireNonEmptyString(reviewResult.created_at, `${rootPath}.created_at`, errors);

  validateCasePackageReference(reviewResult.case_package, `${rootPath}.case_package`, errors);
  validateReviewer(reviewResult.reviewer, `${rootPath}.reviewer`, errors);
  validateProtocol(reviewResult.protocol, `${rootPath}.protocol`, errors);
  validateDecisions(reviewResult.decisions, `${rootPath}.decisions`, errors);

  return errors.length === 0
    ? { ok: true, reviewResult: reviewResult as ReviewResultV01 }
    : { ok: false, errors };
}

export function assertValidReviewResultV01(input: unknown): ReviewResultV01 {
  const result = validateReviewResultV01(input);

  if (!result.ok) {
    const firstError = result.errors[0];
    throw new Error(
      firstError
        ? `Invalid ReviewResult v0.1 at ${firstError.path}: ${firstError.message}`
        : "Invalid ReviewResult v0.1 artifact.",
    );
  }

  return result.reviewResult;
}

function validateCasePackageReference(
  input: unknown,
  path: string,
  errors: ReviewResultValidationErrorV01[],
) {
  const reference = requireObject(input, path, errors);
  if (!reference) return;

  requireExactValue(
    reference.schema_version,
    CASE_PACKAGE_V01_SCHEMA_VERSION,
    `${path}.schema_version`,
    "unsupported_schema_version",
    errors,
  );
  requireNonEmptyString(reference.package_id, `${path}.package_id`, errors);
  validateOptionalString(reference.package_revision, `${path}.package_revision`, errors);
  requireNonEmptyString(reference.case_id, `${path}.case_id`, errors);
  requireNonEmptyString(reference.cluster_id, `${path}.cluster_id`, errors);

  const pipeline = requireObject(reference.pipeline, `${path}.pipeline`, errors);
  if (!pipeline) return;

  for (const field of pipelineStringFields) {
    const fieldPath = `${path}.pipeline.${field}`;
    if (field === "run_id" || field === "upstream_tool" || field === "generated_at") {
      requireNonEmptyString(pipeline[field], fieldPath, errors);
    } else {
      validateOptionalString(pipeline[field], fieldPath, errors);
    }
  }
}

function validateReviewer(
  input: unknown,
  path: string,
  errors: ReviewResultValidationErrorV01[],
) {
  const reviewer = requireObject(input, path, errors);
  if (!reviewer) return;

  requireNonEmptyString(reviewer.reviewer_id, `${path}.reviewer_id`, errors);
  requireNonEmptyString(
    reviewer.review_session_id,
    `${path}.review_session_id`,
    errors,
  );
  requireEnum(
    reviewer.context,
    ["synthetic_demo", "local_review"] as const,
    `${path}.context`,
    errors,
  );
}

function validateProtocol(
  input: unknown,
  path: string,
  errors: ReviewResultValidationErrorV01[],
) {
  const protocol = requireObject(input, path, errors);
  if (!protocol) return;

  requireExactValue(
    protocol.protocol_version,
    REVIEW_PROTOCOL_V01_VERSION,
    `${path}.protocol_version`,
    "unsupported_protocol_version",
    errors,
  );
  requireBoolean(protocol.blind_review_enabled, `${path}.blind_review_enabled`, errors);
  requireBoolean(protocol.ai_label_revealed, `${path}.ai_label_revealed`, errors);
}

function validateDecisions(
  input: unknown,
  path: string,
  errors: ReviewResultValidationErrorV01[],
) {
  const decisions = requireObject(input, path, errors);
  if (!decisions) return;

  const blindInterpretation = requireObject(
    decisions.blind_interpretation,
    `${path}.blind_interpretation`,
    errors,
  );
  if (blindInterpretation) {
    requireNonEmptyString(
      blindInterpretation.option_id,
      `${path}.blind_interpretation.option_id`,
      errors,
    );
    requireNonEmptyString(
      blindInterpretation.label,
      `${path}.blind_interpretation.label`,
      errors,
    );
    requireBoolean(
      blindInterpretation.agrees_with_ai,
      `${path}.blind_interpretation.agrees_with_ai`,
      errors,
    );
  }

  const labelComparison = requireObject(
    decisions.label_comparison,
    `${path}.label_comparison`,
    errors,
  );
  if (labelComparison) {
    requireNonEmptyString(
      labelComparison.selected_label_id,
      `${path}.label_comparison.selected_label_id`,
      errors,
    );
    validateEnumArray(
      labelComparison.reason_codes,
      REVIEW_RESULT_V01_DUEL_REASONS,
      `${path}.label_comparison.reason_codes`,
      errors,
    );
    validateOptionalString(
      labelComparison.rationale,
      `${path}.label_comparison.rationale`,
      errors,
    );
  }

  validateEvidenceRatings(decisions.evidence_ratings, `${path}.evidence_ratings`, errors);

  const outlierImpostor = requireObject(
    decisions.outlier_impostor,
    `${path}.outlier_impostor`,
    errors,
  );
  if (outlierImpostor) {
    requireNonEmptyString(
      outlierImpostor.selected_session_id,
      `${path}.outlier_impostor.selected_session_id`,
      errors,
    );
  }

  if (decisions.confidence !== undefined) {
    const confidence = requireObject(
      decisions.confidence,
      `${path}.confidence`,
      errors,
    );
    if (confidence) {
      requireEnum(
        confidence.level,
        ["low", "medium", "high"] as const,
        `${path}.confidence.level`,
        errors,
      );
      validateOptionalString(confidence.rationale, `${path}.confidence.rationale`, errors);
    }
  }

  validateEnumArray(
    decisions.failure_modes,
    REVIEW_RESULT_V01_DUEL_REASONS,
    `${path}.failure_modes`,
    errors,
  );
  requireEnum(
    decisions.final_verdict,
    REVIEW_RESULT_V01_VERDICTS,
    `${path}.final_verdict`,
    errors,
  );
  requireEnum(
    decisions.recommended_action,
    REVIEW_RESULT_V01_RECOMMENDED_ACTIONS,
    `${path}.recommended_action`,
    errors,
  );
  validateOptionalStringArray(decisions.notes, `${path}.notes`, errors);
}

function validateEvidenceRatings(
  input: unknown,
  path: string,
  errors: ReviewResultValidationErrorV01[],
) {
  if (!Array.isArray(input)) {
    addError(errors, path, "invalid_type", "must be an array.");
    return;
  }

  const seenEvidenceIds = new Set<string>();
  input.forEach((item, index) => {
    const itemPath = `${path}[${index}]`;
    const rating = requireObject(item, itemPath, errors);
    if (!rating) return;

    const evidenceId = requireNonEmptyString(
      rating.evidence_id,
      `${itemPath}.evidence_id`,
      errors,
    );
    if (evidenceId) {
      if (seenEvidenceIds.has(evidenceId)) {
        addError(
          errors,
          `${itemPath}.evidence_id`,
          "duplicate_evidence_id",
          `duplicates evidence ID "${evidenceId}".`,
        );
      }
      seenEvidenceIds.add(evidenceId);
    }
    requireEnum(
      rating.rating,
      REVIEW_RESULT_V01_EVIDENCE_RATINGS,
      `${itemPath}.rating`,
      errors,
    );
  });
}

function validateEnumArray(
  input: unknown,
  allowed: readonly string[],
  path: string,
  errors: ReviewResultValidationErrorV01[],
) {
  if (!Array.isArray(input)) {
    addError(errors, path, "invalid_type", "must be an array.");
    return;
  }

  const seen = new Set<string>();
  input.forEach((value, index) => {
    const itemPath = `${path}[${index}]`;
    if (typeof value !== "string" || !allowed.includes(value)) {
      addError(errors, itemPath, "unsupported_value", "contains an unsupported value.");
      return;
    }
    if (seen.has(value)) {
      addError(errors, itemPath, "duplicate_value", `duplicates value "${value}".`);
    }
    seen.add(value);
  });
}

function validateOptionalStringArray(
  input: unknown,
  path: string,
  errors: ReviewResultValidationErrorV01[],
) {
  if (input === undefined) return;
  if (!Array.isArray(input)) {
    addError(errors, path, "invalid_type", "must be an array when provided.");
    return;
  }
  input.forEach((value, index) => {
    if (typeof value !== "string") {
      addError(errors, `${path}[${index}]`, "invalid_type", "must be a string.");
    }
  });
}

function requireObject(
  input: unknown,
  path: string,
  errors: ReviewResultValidationErrorV01[],
): Record<string, unknown> | undefined {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    addError(errors, path, "invalid_type", "must be an object.");
    return undefined;
  }
  return input as Record<string, unknown>;
}

function requireNonEmptyString(
  input: unknown,
  path: string,
  errors: ReviewResultValidationErrorV01[],
): string | undefined {
  if (typeof input !== "string" || input.trim() === "") {
    addError(errors, path, "required_string", "must be a non-empty string.");
    return undefined;
  }
  return input;
}

function validateOptionalString(
  input: unknown,
  path: string,
  errors: ReviewResultValidationErrorV01[],
) {
  if (input !== undefined && typeof input !== "string") {
    addError(errors, path, "invalid_type", "must be a string when provided.");
  }
}

function requireBoolean(
  input: unknown,
  path: string,
  errors: ReviewResultValidationErrorV01[],
) {
  if (typeof input !== "boolean") {
    addError(errors, path, "invalid_type", "must be a boolean.");
  }
}

function requireExactValue(
  input: unknown,
  expected: string,
  path: string,
  code: string,
  errors: ReviewResultValidationErrorV01[],
) {
  if (input !== expected) {
    addError(errors, path, code, `must equal "${expected}".`);
  }
}

function requireEnum(
  input: unknown,
  allowed: readonly string[],
  path: string,
  errors: ReviewResultValidationErrorV01[],
) {
  if (typeof input !== "string" || !allowed.includes(input)) {
    addError(errors, path, "unsupported_value", "contains an unsupported value.");
  }
}

function addError(
  errors: ReviewResultValidationErrorV01[],
  path: string,
  code: string,
  message: string,
) {
  errors.push({ path, code, message });
}
