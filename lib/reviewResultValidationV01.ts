import {
  REVIEW_PROTOCOL_V01_VERSION,
  REVIEW_RESULT_V01_DUEL_REASONS,
  REVIEW_RESULT_V01_EVIDENCE_RATINGS,
  REVIEW_RESULT_V01_RECOMMENDED_ACTIONS,
  REVIEW_RESULT_V01_SCHEMA_VERSION,
  REVIEW_RESULT_V01_VERDICTS,
  type ReviewResultV01,
} from "@/lib/reviewResultV01";
import {
  CASE_PACKAGE_V01_SCHEMA_VERSION,
  MERGE_RECOMMENDATION_REASONS,
  SPLIT_RECOMMENDATION_REASONS,
} from "@/lib/types";
import { REVIEWER_CONTEXTS_V01 } from "@/lib/reviewerIdentityV01";

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

const topLevelFields = [
  "schema_version",
  "review_id",
  "created_at",
  "case_package",
  "reviewer",
  "protocol",
  "decisions",
] as const;
const casePackageFields = [
  "schema_version",
  "package_id",
  "package_revision",
  "case_id",
  "cluster_id",
  "pipeline",
] as const;
const reviewerFields = ["reviewer_id", "review_session_id", "context"] as const;
const protocolFields = [
  "protocol_version",
  "blind_review_enabled",
  "ai_label_revealed",
] as const;
const decisionFields = [
  "blind_interpretation",
  "label_comparison",
  "evidence_ratings",
  "outlier_impostor",
  "confidence",
  "failure_modes",
  "final_verdict",
  "recommended_action",
  "cluster_refinement",
  "notes",
] as const;
const blindInterpretationFields = ["option_id", "label", "agrees_with_ai"] as const;
const labelComparisonFields = [
  "selected_label_id",
  "reason_codes",
  "rationale",
] as const;
const evidenceRatingFields = ["evidence_id", "rating"] as const;
const outlierImpostorFields = ["selected_session_id"] as const;
const confidenceFields = ["level", "rationale"] as const;
const clusterRefinementFields = [
  "split_recommendation",
  "merge_recommendation",
] as const;
const splitRecommendationFields = [
  "status",
  "reason",
  "affected_session_ids",
  "evidence_ids",
] as const;
const mergeRecommendationFields = [
  "status",
  "target_neighbor_cluster_id",
  "reason",
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

  rejectUnknownFields(reviewResult, topLevelFields, rootPath, errors);

  requireExactValue(
    reviewResult.schema_version,
    REVIEW_RESULT_V01_SCHEMA_VERSION,
    `${rootPath}.schema_version`,
    "unsupported_schema_version",
    errors,
  );
  requireNonEmptyString(reviewResult.review_id, `${rootPath}.review_id`, errors);
  requireIsoTimestamp(reviewResult.created_at, `${rootPath}.created_at`, errors);

  validateCasePackageReference(reviewResult.case_package, `${rootPath}.case_package`, errors);
  validateReviewer(reviewResult.reviewer, `${rootPath}.reviewer`, errors);
  validateProtocol(reviewResult.protocol, `${rootPath}.protocol`, errors);
  validateDecisions(reviewResult.decisions, `${rootPath}.decisions`, errors);
  validateReviewIdentity(reviewResult, rootPath, errors);

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

function validateReviewIdentity(
  reviewResult: Record<string, unknown>,
  path: string,
  errors: ReviewResultValidationErrorV01[],
) {
  const casePackage = isObjectRecord(reviewResult.case_package)
    ? reviewResult.case_package
    : undefined;
  const reviewer = isObjectRecord(reviewResult.reviewer)
    ? reviewResult.reviewer
    : undefined;
  const identityParts = [
    casePackage?.package_id,
    reviewer?.reviewer_id,
    reviewer?.review_session_id,
    reviewResult.created_at,
  ];

  if (
    identityParts.every(
      (value): value is string =>
        typeof value === "string" && value.trim() !== "",
    ) &&
    reviewResult.review_id !== ["review", ...identityParts].join(":")
  ) {
    addError(
      errors,
      `${path}.review_id`,
      "inconsistent_review_identity",
      "must match the package, reviewer, session, and timestamp metadata.",
    );
  }
}

function validateCasePackageReference(
  input: unknown,
  path: string,
  errors: ReviewResultValidationErrorV01[],
) {
  const reference = requireObject(input, path, errors);
  if (!reference) return;

  rejectUnknownFields(reference, casePackageFields, path, errors);

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

function validateReviewer(
  input: unknown,
  path: string,
  errors: ReviewResultValidationErrorV01[],
) {
  const reviewer = requireObject(input, path, errors);
  if (!reviewer) return;

  rejectUnknownFields(reviewer, reviewerFields, path, errors);

  requireNonEmptyString(reviewer.reviewer_id, `${path}.reviewer_id`, errors);
  requireNonEmptyString(
    reviewer.review_session_id,
    `${path}.review_session_id`,
    errors,
  );
  if (reviewer.context !== undefined) {
    requireEnum(
      reviewer.context,
      REVIEWER_CONTEXTS_V01,
      `${path}.context`,
      errors,
    );
  }
}

function validateProtocol(
  input: unknown,
  path: string,
  errors: ReviewResultValidationErrorV01[],
) {
  const protocol = requireObject(input, path, errors);
  if (!protocol) return;

  rejectUnknownFields(protocol, protocolFields, path, errors);

  requireExactValue(
    protocol.protocol_version,
    REVIEW_PROTOCOL_V01_VERSION,
    `${path}.protocol_version`,
    "unsupported_protocol_version",
    errors,
  );
  requireBoolean(protocol.blind_review_enabled, `${path}.blind_review_enabled`, errors);
  requireBoolean(protocol.ai_label_revealed, `${path}.ai_label_revealed`, errors);
  if (
    protocol.blind_review_enabled === true &&
    protocol.ai_label_revealed === false
  ) {
    addError(
      errors,
      `${path}.ai_label_revealed`,
      "incomplete_review",
      "must be true for a completed blind review.",
    );
  }
}

function validateDecisions(
  input: unknown,
  path: string,
  errors: ReviewResultValidationErrorV01[],
) {
  const decisions = requireObject(input, path, errors);
  if (!decisions) return;

  rejectUnknownFields(decisions, decisionFields, path, errors);

  const blindInterpretation = requireObject(
    decisions.blind_interpretation,
    `${path}.blind_interpretation`,
    errors,
  );
  if (blindInterpretation) {
    rejectUnknownFields(
      blindInterpretation,
      blindInterpretationFields,
      `${path}.blind_interpretation`,
      errors,
    );
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
    rejectUnknownFields(
      labelComparison,
      labelComparisonFields,
      `${path}.label_comparison`,
      errors,
    );
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
    rejectUnknownFields(
      outlierImpostor,
      outlierImpostorFields,
      `${path}.outlier_impostor`,
      errors,
    );
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
      rejectUnknownFields(confidence, confidenceFields, `${path}.confidence`, errors);
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
  validateClusterRefinement(
    decisions.cluster_refinement,
    `${path}.cluster_refinement`,
    errors,
  );
  validateOptionalStringArray(decisions.notes, `${path}.notes`, errors);
}

function validateClusterRefinement(
  input: unknown,
  path: string,
  errors: ReviewResultValidationErrorV01[],
) {
  if (input === undefined) return;

  const clusterRefinement = requireObject(input, path, errors);
  if (!clusterRefinement) return;

  rejectUnknownFields(clusterRefinement, clusterRefinementFields, path, errors);

  if (clusterRefinement.split_recommendation !== undefined) {
    validateSplitRecommendation(
      clusterRefinement.split_recommendation,
      `${path}.split_recommendation`,
      errors,
    );
  }

  if (clusterRefinement.merge_recommendation !== undefined) {
    validateMergeRecommendation(
      clusterRefinement.merge_recommendation,
      `${path}.merge_recommendation`,
      errors,
    );
  }
}

function validateSplitRecommendation(
  input: unknown,
  path: string,
  errors: ReviewResultValidationErrorV01[],
) {
  const splitRecommendation = requireObject(input, path, errors);
  if (!splitRecommendation) return;

  rejectUnknownFields(splitRecommendation, splitRecommendationFields, path, errors);
  requireExactValue(
    splitRecommendation.status,
    "recommended",
    `${path}.status`,
    "unsupported_value",
    errors,
  );
  requireEnum(
    splitRecommendation.reason,
    SPLIT_RECOMMENDATION_REASONS,
    `${path}.reason`,
    errors,
  );
  validateOptionalNonEmptyStringArray(
    splitRecommendation.affected_session_ids,
    `${path}.affected_session_ids`,
    errors,
  );
  validateOptionalNonEmptyStringArray(
    splitRecommendation.evidence_ids,
    `${path}.evidence_ids`,
    errors,
  );
}

function validateMergeRecommendation(
  input: unknown,
  path: string,
  errors: ReviewResultValidationErrorV01[],
) {
  const mergeRecommendation = requireObject(input, path, errors);
  if (!mergeRecommendation) return;

  rejectUnknownFields(mergeRecommendation, mergeRecommendationFields, path, errors);
  requireExactValue(
    mergeRecommendation.status,
    "recommended",
    `${path}.status`,
    "unsupported_value",
    errors,
  );
  requireNonEmptyString(
    mergeRecommendation.target_neighbor_cluster_id,
    `${path}.target_neighbor_cluster_id`,
    errors,
  );
  requireEnum(
    mergeRecommendation.reason,
    MERGE_RECOMMENDATION_REASONS,
    `${path}.reason`,
    errors,
  );
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

  if (input.length === 0) {
    addError(
      errors,
      path,
      "empty_required_array",
      "must contain at least one evidence rating.",
    );
    return;
  }

  const seenEvidenceIds = new Set<string>();
  input.forEach((item, index) => {
    const itemPath = `${path}[${index}]`;
    const rating = requireObject(item, itemPath, errors);
    if (!rating) return;

    rejectUnknownFields(rating, evidenceRatingFields, itemPath, errors);

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

function validateOptionalNonEmptyStringArray(
  input: unknown,
  path: string,
  errors: ReviewResultValidationErrorV01[],
) {
  if (input === undefined) return;
  if (!Array.isArray(input)) {
    addError(errors, path, "invalid_type", "must be an array when provided.");
    return;
  }

  const seen = new Set<string>();
  input.forEach((value, index) => {
    const itemPath = `${path}[${index}]`;

    if (typeof value !== "string" || value.trim() === "") {
      addError(errors, itemPath, "required_string", "must be a non-empty string.");
      return;
    }

    if (seen.has(value)) {
      addError(errors, itemPath, "duplicate_value", `duplicates value "${value}".`);
    }

    seen.add(value);
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

function isObjectRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function rejectUnknownFields(
  input: Record<string, unknown>,
  allowedFields: readonly string[],
  path: string,
  errors: ReviewResultValidationErrorV01[],
) {
  for (const field of Object.keys(input)) {
    if (!allowedFields.includes(field)) {
      addError(
        errors,
        `${path}.${field}`,
        "unsupported_field",
        `contains unsupported field "${field}".`,
      );
    }
  }
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

function requireIsoTimestamp(
  input: unknown,
  path: string,
  errors: ReviewResultValidationErrorV01[],
): string | undefined {
  const value = requireNonEmptyString(input, path, errors);
  if (!value) return undefined;

  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(
      value,
    ) ||
    Number.isNaN(Date.parse(value))
  ) {
    addError(errors, path, "invalid_timestamp", "must be a valid ISO timestamp.");
    return undefined;
  }

  return value;
}

function validateOptionalString(
  input: unknown,
  path: string,
  errors: ReviewResultValidationErrorV01[],
) {
  if (
    input !== undefined &&
    (typeof input !== "string" || input.trim() === "")
  ) {
    addError(
      errors,
      path,
      "invalid_type",
      "must be a non-empty string when provided.",
    );
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
