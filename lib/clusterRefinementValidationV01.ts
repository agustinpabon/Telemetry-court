import { EVALUATION_REPORT_V01_CALCULATION_VERSION, EVALUATION_REPORT_V01_SCHEMA_VERSION } from "@/lib/evaluationReportV01";
import {
  arraysEqual,
  compareStrings,
  isRecord,
  rejectUnexpectedKeys,
  requireBoolean,
  requireExactString,
  requireNonEmptyString,
  requireNonNegativeInteger,
  requireNull,
  requireOneOf,
  requireOptionalString,
  pushInvalidArray,
  pushInvalidObject,
  pushUnstableOrder,
  requireSortedEnumArray,
  requireSortedStringArray,
} from "@/lib/clusterRefinementValidationHelpersV01";
import {
  CLUSTER_REFINEMENT_MERGE_FINAL_VERDICTS,
  CLUSTER_REFINEMENT_MERGE_RECOMMENDED_ACTIONS,
  CLUSTER_REFINEMENT_SPLIT_FAILURE_MODES,
  CLUSTER_REFINEMENT_SPLIT_FINAL_VERDICTS,
  CLUSTER_REFINEMENT_SPLIT_RECOMMENDED_ACTIONS,
  CLUSTER_REFINEMENT_V01_CALCULATION_VERSION,
  CLUSTER_REFINEMENT_V01_SCHEMA_VERSION,
  type ClusterRefinementValidationErrorV01,
  type ClusterRefinementValidationResultV01,
  type ClusterRefinementV01,
} from "@/lib/clusterRefinementTypesV01";
import { REVIEW_PROTOCOL_V01_VERSION, REVIEW_RESULT_V01_SCHEMA_VERSION } from "@/lib/reviewResultV01";
import {
  CASE_PACKAGE_V01_SCHEMA_VERSION,
  MERGE_RECOMMENDATION_REASONS,
  SPLIT_RECOMMENDATION_REASONS,
} from "@/lib/types";

const TOP_LEVEL_FIELDS = [
  "schema_version", "calculation_version", "refinement_id", "generated_at",
  "source_application", "format", "case_package", "compatibility", "source_review_ids",
  "source_reviews", "reviewer_count", "prune_session_ids",
  "session_exclusion_recommendations", "split_recommendations", "merge_recommendations",
  "uncertainty", "disagreement",
] as const;
const CASE_PACKAGE_FIELDS = [
  "schema_version", "package_id", "package_revision", "case_id", "cluster_id", "pipeline",
] as const;
const PIPELINE_FIELDS = [
  "pipeline_id", "run_id", "upstream_tool", "pipeline_version",
  "embedding_model", "clustering_method", "dimensionality_reduction_method",
  "naming_model", "prompt_id", "prompt_version", "prompt_digest", "generated_at",
] as const;
const COMPATIBILITY_FIELDS = [
  "review_result_schema_version", "review_protocol_version",
  "evaluation_report_schema_version", "evaluation_report_calculation_version",
] as const;
const SESSION_RECOMMENDATION_FIELDS = [
  "session_id", "status", "selected_count", "qualifying_review_count",
  "reviewer_count", "source_review_ids", "qualifying_source_review_ids",
  "signals", "disagreement",
] as const;
const RECOMMENDATION_FIELDS = [
  "cluster_id", "status", "supporting_review_count", "reviewer_count",
  "source_review_ids", "signals", "disagreement",
] as const;
const SPLIT_DETAILS_FIELDS = [
  "reason_codes", "affected_session_ids", "evidence_ids",
] as const;

export function validateClusterRefinementV01(
  input: unknown,
): ClusterRefinementValidationResultV01 {
  const errors: ClusterRefinementValidationErrorV01[] = [];

  if (!isRecord(input)) {
    return {
      ok: false,
      errors: [
        {
          path: "$",
          code: "invalid_type",
          message: "Cluster refinement artifact must be an object.",
        },
      ],
    };
  }

  rejectUnexpectedKeys("$", input, TOP_LEVEL_FIELDS, errors);
  requireExactString(
    "$.schema_version",
    input.schema_version,
    CLUSTER_REFINEMENT_V01_SCHEMA_VERSION,
    "unsupported_schema_version",
    errors,
  );
  requireExactString(
    "$.calculation_version",
    input.calculation_version,
    CLUSTER_REFINEMENT_V01_CALCULATION_VERSION,
    "unsupported_calculation_version",
    errors,
  );
  requireNonEmptyString("$.refinement_id", input.refinement_id, errors);
  requireNonEmptyString("$.generated_at", input.generated_at, errors);
  requireExactString(
    "$.source_application",
    input.source_application,
    "telemetry_court",
    "unsupported_source_application",
    errors,
  );
  requireExactString(
    "$.format",
    input.format,
    "local_json",
    "unsupported_format",
    errors,
  );
  validateCasePackageReference("$.case_package", input.case_package, errors);
  validateCompatibility("$.compatibility", input.compatibility, errors);
  requireSortedStringArray(
    "$.source_review_ids",
    input.source_review_ids,
    errors,
  );
  validateSourceReviews("$.source_reviews", input.source_reviews, errors);
  requireNonNegativeInteger("$.reviewer_count", input.reviewer_count, errors);
  requireSortedStringArray("$.prune_session_ids", input.prune_session_ids, errors);
  validateSessionRecommendations(
    "$.session_exclusion_recommendations",
    input.session_exclusion_recommendations,
    errors,
  );
  validateSplitRecommendations(
    "$.split_recommendations",
    input.split_recommendations,
    errors,
  );
  validateMergeRecommendations(
    "$.merge_recommendations",
    input.merge_recommendations,
    errors,
  );
  validateUncertainty("$.uncertainty", input.uncertainty, errors);
  validateDisagreement("$.disagreement", input.disagreement, errors);
  validatePruneIds(input, errors);

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, artifact: input as ClusterRefinementV01 };
}

function validateCasePackageReference(
  path: string,
  value: unknown,
  errors: ClusterRefinementValidationErrorV01[],
) {
  if (!isRecord(value)) {
    pushInvalidObject(path, "CasePackage reference", errors);
    return;
  }

  rejectUnexpectedKeys(path, value, CASE_PACKAGE_FIELDS, errors);
  requireExactString(
    `${path}.schema_version`,
    value.schema_version,
    CASE_PACKAGE_V01_SCHEMA_VERSION,
    "unsupported_case_package_schema_version",
    errors,
  );
  requireNonEmptyString(`${path}.package_id`, value.package_id, errors);
  requireOptionalString(`${path}.package_revision`, value.package_revision, errors);
  requireNonEmptyString(`${path}.case_id`, value.case_id, errors);
  requireNonEmptyString(`${path}.cluster_id`, value.cluster_id, errors);
  validatePipelineReference(`${path}.pipeline`, value.pipeline, errors);
}

function validatePipelineReference(
  path: string,
  value: unknown,
  errors: ClusterRefinementValidationErrorV01[],
) {
  if (!isRecord(value)) {
    pushInvalidObject(path, "Pipeline reference", errors);
    return;
  }

  rejectUnexpectedKeys(path, value, PIPELINE_FIELDS, errors);
  requireOptionalString(`${path}.pipeline_id`, value.pipeline_id, errors);
  requireNonEmptyString(`${path}.run_id`, value.run_id, errors);
  requireNonEmptyString(`${path}.upstream_tool`, value.upstream_tool, errors);
  requireOptionalString(`${path}.pipeline_version`, value.pipeline_version, errors);
  requireOptionalString(`${path}.embedding_model`, value.embedding_model, errors);
  requireOptionalString(`${path}.clustering_method`, value.clustering_method, errors);
  requireOptionalString(
    `${path}.dimensionality_reduction_method`,
    value.dimensionality_reduction_method,
    errors,
  );
  requireOptionalString(`${path}.naming_model`, value.naming_model, errors);
  requireOptionalString(`${path}.prompt_id`, value.prompt_id, errors);
  requireOptionalString(`${path}.prompt_version`, value.prompt_version, errors);
  requireOptionalString(`${path}.prompt_digest`, value.prompt_digest, errors);
  requireNonEmptyString(`${path}.generated_at`, value.generated_at, errors);
}

function validateCompatibility(
  path: string,
  value: unknown,
  errors: ClusterRefinementValidationErrorV01[],
) {
  if (!isRecord(value)) {
    pushInvalidObject(path, "Compatibility metadata", errors);
    return;
  }

  rejectUnexpectedKeys(path, value, COMPATIBILITY_FIELDS, errors);
  requireExactString(
    `${path}.review_result_schema_version`,
    value.review_result_schema_version,
    REVIEW_RESULT_V01_SCHEMA_VERSION,
    "unsupported_review_result_schema_version",
    errors,
  );
  requireExactString(
    `${path}.review_protocol_version`,
    value.review_protocol_version,
    REVIEW_PROTOCOL_V01_VERSION,
    "unsupported_review_protocol_version",
    errors,
  );
  requireExactString(
    `${path}.evaluation_report_schema_version`,
    value.evaluation_report_schema_version,
    EVALUATION_REPORT_V01_SCHEMA_VERSION,
    "unsupported_evaluation_report_schema_version",
    errors,
  );
  requireExactString(
    `${path}.evaluation_report_calculation_version`,
    value.evaluation_report_calculation_version,
    EVALUATION_REPORT_V01_CALCULATION_VERSION,
    "unsupported_evaluation_report_calculation_version",
    errors,
  );
}

function validateSourceReviews(
  path: string,
  value: unknown,
  errors: ClusterRefinementValidationErrorV01[],
) {
  if (!Array.isArray(value)) {
    pushInvalidArray(path, "Source reviews", errors);
    return;
  }

  const reviewIds = value
    .map((sourceReview) =>
      isRecord(sourceReview) && typeof sourceReview.review_id === "string"
        ? sourceReview.review_id
        : undefined,
    )
    .filter((reviewId): reviewId is string => typeof reviewId === "string");

  if (!arraysEqual(reviewIds, [...reviewIds].sort(compareStrings))) {
    pushUnstableOrder(path, "Source reviews must be sorted by review_id.", errors);
  }

  for (const [index, sourceReview] of value.entries()) {
    const itemPath = `${path}[${index}]`;

    if (!isRecord(sourceReview)) {
      pushInvalidObject(itemPath, "Source review metadata", errors);
      continue;
    }

    rejectUnexpectedKeys(
      itemPath,
      sourceReview,
      ["review_id", "review_session_id", "created_at"],
      errors,
    );
    requireNonEmptyString(`${itemPath}.review_id`, sourceReview.review_id, errors);
    requireOptionalString(
      `${itemPath}.review_session_id`,
      sourceReview.review_session_id,
      errors,
    );
    requireOptionalString(`${itemPath}.created_at`, sourceReview.created_at, errors);
  }
}

function validateSessionRecommendations(
  path: string,
  value: unknown,
  errors: ClusterRefinementValidationErrorV01[],
) {
  if (!Array.isArray(value)) {
    pushInvalidArray(path, "Session exclusion recommendations", errors);
    return;
  }

  const sessionIds: string[] = [];

  for (const [index, recommendation] of value.entries()) {
    const itemPath = `${path}[${index}]`;

    if (!isRecord(recommendation)) {
      pushInvalidObject(itemPath, "Session exclusion recommendation", errors);
      continue;
    }

    rejectUnexpectedKeys(itemPath, recommendation, SESSION_RECOMMENDATION_FIELDS, errors);
    requireNonEmptyString(`${itemPath}.session_id`, recommendation.session_id, errors);
    if (typeof recommendation.session_id === "string") {
      sessionIds.push(recommendation.session_id);
    }
    requireOneOf(
      `${itemPath}.status`,
      recommendation.status,
      ["recommended", "not_recommended"],
      errors,
    );
    requireNonNegativeInteger(
      `${itemPath}.selected_count`,
      recommendation.selected_count,
      errors,
    );
    requireNonNegativeInteger(
      `${itemPath}.qualifying_review_count`,
      recommendation.qualifying_review_count,
      errors,
    );
    requireNonNegativeInteger(
      `${itemPath}.reviewer_count`,
      recommendation.reviewer_count,
      errors,
    );
    requireSortedStringArray(
      `${itemPath}.source_review_ids`,
      recommendation.source_review_ids,
      errors,
    );
    requireSortedStringArray(
      `${itemPath}.qualifying_source_review_ids`,
      recommendation.qualifying_source_review_ids,
      errors,
    );
    validateSplitSignals(`${itemPath}.signals`, recommendation.signals, errors);
    validateSessionDisagreement(
      `${itemPath}.disagreement`,
      recommendation.disagreement,
      errors,
    );
  }

  if (!arraysEqual(sessionIds, [...sessionIds].sort(compareStrings))) {
    pushUnstableOrder(
      path,
      "Session exclusion recommendations must be sorted by session_id.",
      errors,
    );
  }
}

function validateSplitRecommendations(
  path: string,
  value: unknown,
  errors: ClusterRefinementValidationErrorV01[],
) {
  validateClusterRecommendations({
    path,
    value,
    label: "Split",
    extraFields: ["details"],
    validateSignals: validateSplitSignals,
    validateExtra: (itemPath, recommendation) => {
      if (recommendation.details !== undefined) {
        validateSplitDetails(`${itemPath}.details`, recommendation.details, errors);
      }
    },
    errors,
  });
}

function validateMergeRecommendations(
  path: string,
  value: unknown,
  errors: ClusterRefinementValidationErrorV01[],
) {
  validateClusterRecommendations({
    path,
    value,
    label: "Merge",
    extraFields: ["target"],
    validateSignals: validateMergeSignals,
    validateExtra: (itemPath, recommendation) =>
      validateMergeTarget(`${itemPath}.target`, recommendation.target, errors),
    errors,
  });
}

function validateClusterRecommendations({
  path,
  value,
  label,
  extraFields = [],
  validateSignals,
  validateExtra = () => undefined,
  errors,
}: {
  path: string;
  value: unknown;
  label: "Split" | "Merge";
  extraFields?: readonly string[];
  validateSignals: (
    path: string,
    value: unknown,
    errors: ClusterRefinementValidationErrorV01[],
  ) => void;
  validateExtra?: (itemPath: string, recommendation: Record<string, unknown>) => void;
  errors: ClusterRefinementValidationErrorV01[];
}) {
  if (!Array.isArray(value)) {
    pushInvalidArray(path, `${label} recommendations`, errors);
    return;
  }

  for (const [index, recommendation] of value.entries()) {
    const itemPath = `${path}[${index}]`;

    if (!isRecord(recommendation)) {
      pushInvalidObject(itemPath, `${label} recommendation`, errors);
      continue;
    }

    rejectUnexpectedKeys(
      itemPath,
      recommendation,
      [...RECOMMENDATION_FIELDS, ...extraFields],
      errors,
    );
    requireNonEmptyString(`${itemPath}.cluster_id`, recommendation.cluster_id, errors);
    requireExactString(
      `${itemPath}.status`,
      recommendation.status,
      "recommended",
      "unsupported_recommendation_status",
      errors,
    );
    requireNonNegativeInteger(
      `${itemPath}.supporting_review_count`,
      recommendation.supporting_review_count,
      errors,
    );
    requireNonNegativeInteger(
      `${itemPath}.reviewer_count`,
      recommendation.reviewer_count,
      errors,
    );
    requireSortedStringArray(
      `${itemPath}.source_review_ids`,
      recommendation.source_review_ids,
      errors,
    );
    validateSignals(`${itemPath}.signals`, recommendation.signals, errors);
    validateRecommendationDisagreement(
      `${itemPath}.disagreement`,
      recommendation.disagreement,
      errors,
    );
    validateExtra(itemPath, recommendation);
  }
}

function validateSplitSignals(
  path: string,
  value: unknown,
  errors: ClusterRefinementValidationErrorV01[],
) {
  validateSignalsObject(path, value, errors, {
    fields: ["final_verdicts", "recommended_actions", "failure_modes"],
    finalVerdicts: CLUSTER_REFINEMENT_SPLIT_FINAL_VERDICTS,
    recommendedActions: CLUSTER_REFINEMENT_SPLIT_RECOMMENDED_ACTIONS,
    failureModes: CLUSTER_REFINEMENT_SPLIT_FAILURE_MODES,
  });
}

function validateMergeSignals(
  path: string,
  value: unknown,
  errors: ClusterRefinementValidationErrorV01[],
) {
  validateSignalsObject(path, value, errors, {
    fields: ["final_verdicts", "recommended_actions"],
    finalVerdicts: CLUSTER_REFINEMENT_MERGE_FINAL_VERDICTS,
    recommendedActions: CLUSTER_REFINEMENT_MERGE_RECOMMENDED_ACTIONS,
  });
}

function validateSignalsObject(
  path: string,
  value: unknown,
  errors: ClusterRefinementValidationErrorV01[],
  config: {
    fields: readonly string[];
    finalVerdicts: readonly string[];
    recommendedActions: readonly string[];
    failureModes?: readonly string[];
  },
) {
  if (!isRecord(value)) {
    pushInvalidObject(path, "Signal set", errors);
    return;
  }

  rejectUnexpectedKeys(path, value, config.fields, errors);
  requireSortedEnumArray(
    `${path}.final_verdicts`,
    value.final_verdicts,
    config.finalVerdicts,
    errors,
  );
  requireSortedEnumArray(
    `${path}.recommended_actions`,
    value.recommended_actions,
    config.recommendedActions,
    errors,
  );

  if (config.failureModes) {
    requireSortedEnumArray(
      `${path}.failure_modes`,
      value.failure_modes,
      config.failureModes,
      errors,
    );
  }
}

function validateMergeTarget(
  path: string,
  value: unknown,
  errors: ClusterRefinementValidationErrorV01[],
) {
  if (!isRecord(value)) {
    pushInvalidObject(path, "Merge target", errors);
    return;
  }

  if (value.status === "selected") {
    rejectUnexpectedKeys(
      path,
      value,
      ["status", "neighbor_cluster_ids", "reason_codes"],
      errors,
    );
    requireExactString(
      `${path}.status`,
      value.status,
      "selected",
      "unsupported_target_status",
      errors,
    );
    requireSortedStringArray(
      `${path}.neighbor_cluster_ids`,
      value.neighbor_cluster_ids,
      errors,
    );
    requireSortedEnumArray(
      `${path}.reason_codes`,
      value.reason_codes,
      MERGE_RECOMMENDATION_REASONS,
      errors,
    );
    return;
  }

  rejectUnexpectedKeys(path, value, ["status", "neighbor_cluster_ids", "reason"], errors);
  requireExactString(
    `${path}.status`,
    value.status,
    "unavailable",
    "unsupported_target_status",
    errors,
  );
  requireSortedStringArray(
    `${path}.neighbor_cluster_ids`,
    value.neighbor_cluster_ids,
    errors,
  );
  requireNonEmptyString(`${path}.reason`, value.reason, errors);
}

function validateSplitDetails(
  path: string,
  value: unknown,
  errors: ClusterRefinementValidationErrorV01[],
) {
  if (!isRecord(value)) {
    pushInvalidObject(path, "Split recommendation details", errors);
    return;
  }

  rejectUnexpectedKeys(path, value, SPLIT_DETAILS_FIELDS, errors);
  requireSortedEnumArray(
    `${path}.reason_codes`,
    value.reason_codes,
    SPLIT_RECOMMENDATION_REASONS,
    errors,
  );
  requireSortedStringArray(
    `${path}.affected_session_ids`,
    value.affected_session_ids,
    errors,
  );
  requireSortedStringArray(`${path}.evidence_ids`, value.evidence_ids, errors);
}

function validateSessionDisagreement(
  path: string,
  value: unknown,
  errors: ClusterRefinementValidationErrorV01[],
) {
  if (!isRecord(value)) {
    pushInvalidObject(path, "Session disagreement", errors);
    return;
  }

  if (value.status === "available") {
    rejectUnexpectedKeys(path, value, [
      "status",
      "has_disagreement",
      "selected_by_all_reviewers",
      "competing_session_ids",
    ], errors);
    requireBoolean(`${path}.has_disagreement`, value.has_disagreement, errors);
    requireBoolean(
      `${path}.selected_by_all_reviewers`,
      value.selected_by_all_reviewers,
      errors,
    );
    requireSortedStringArray(
      `${path}.competing_session_ids`,
      value.competing_session_ids,
      errors,
    );
    return;
  }

  rejectUnexpectedKeys(path, value, [
    "status",
    "has_disagreement",
    "selected_by_all_reviewers",
    "competing_session_ids",
    "reason",
  ], errors);
  requireExactString(
    `${path}.status`,
    value.status,
    "unavailable",
    "unsupported_disagreement_status",
    errors,
  );
  requireNull(`${path}.has_disagreement`, value.has_disagreement, errors);
  requireNull(
    `${path}.selected_by_all_reviewers`,
    value.selected_by_all_reviewers,
    errors,
  );
  requireSortedStringArray(
    `${path}.competing_session_ids`,
    value.competing_session_ids,
    errors,
  );
  requireNonEmptyString(`${path}.reason`, value.reason, errors);
}

function validateRecommendationDisagreement(
  path: string,
  value: unknown,
  errors: ClusterRefinementValidationErrorV01[],
) {
  if (!isRecord(value)) {
    pushInvalidObject(path, "Recommendation disagreement", errors);
    return;
  }

  if (value.status === "available") {
    rejectUnexpectedKeys(path, value, ["status", "has_disagreement", "reason"], errors);
    requireBoolean(`${path}.has_disagreement`, value.has_disagreement, errors);
    requireOptionalString(`${path}.reason`, value.reason, errors);
    return;
  }

  rejectUnexpectedKeys(path, value, ["status", "has_disagreement", "reason"], errors);
  requireExactString(
    `${path}.status`,
    value.status,
    "unavailable",
    "unsupported_disagreement_status",
    errors,
  );
  requireNull(`${path}.has_disagreement`, value.has_disagreement, errors);
  requireNonEmptyString(`${path}.reason`, value.reason, errors);
}

function validateUncertainty(
  path: string,
  value: unknown,
  errors: ClusterRefinementValidationErrorV01[],
) {
  if (!isRecord(value)) {
    pushInvalidObject(path, "Uncertainty metadata", errors);
    return;
  }

  rejectUnexpectedKeys(path, value, [
    "status",
    "reviewer_count",
    "uncertain_review_count",
    "low_confidence_review_count",
    "source_review_ids",
    "signals",
  ], errors);
  requireOneOf(`${path}.status`, value.status, ["present", "not_reported"], errors);
  requireNonNegativeInteger(`${path}.reviewer_count`, value.reviewer_count, errors);
  requireNonNegativeInteger(
    `${path}.uncertain_review_count`,
    value.uncertain_review_count,
    errors,
  );
  requireNonNegativeInteger(
    `${path}.low_confidence_review_count`,
    value.low_confidence_review_count,
    errors,
  );
  requireSortedStringArray(
    `${path}.source_review_ids`,
    value.source_review_ids,
    errors,
  );
  validateUncertaintySignals(`${path}.signals`, value.signals, errors);
}

function validateUncertaintySignals(
  path: string,
  value: unknown,
  errors: ClusterRefinementValidationErrorV01[],
) {
  if (!isRecord(value)) {
    pushInvalidObject(path, "Uncertainty signals", errors);
    return;
  }

  rejectUnexpectedKeys(path, value, [
    "final_verdicts",
    "recommended_actions",
    "confidence_levels",
  ], errors);
  requireSortedEnumArray(`${path}.final_verdicts`, value.final_verdicts, [
    "uncertain",
  ], errors);
  requireSortedEnumArray(
    `${path}.recommended_actions`,
    value.recommended_actions,
    ["mark_uncertain"],
    errors,
  );
  requireSortedEnumArray(
    `${path}.confidence_levels`,
    value.confidence_levels,
    ["high", "low", "medium"],
    errors,
  );
}

function validateDisagreement(
  path: string,
  value: unknown,
  errors: ClusterRefinementValidationErrorV01[],
) {
  if (!isRecord(value)) {
    pushInvalidObject(path, "Disagreement metadata", errors);
    return;
  }

  const fields = [
    "status",
    "reason",
    "has_any_disagreement",
    "verdict",
    "recommended_action",
    "label_winner",
    "evidence_ratings",
    "evidence_ids",
    "session_exclusion",
    "split_recommendation",
    "merge_recommendation",
  ];

  if (value.status === "available") {
    rejectUnexpectedKeys(path, value, fields, errors);
    for (const field of fields.filter(isBooleanDisagreementField)) {
      requireBoolean(`${path}.${field}`, value[field], errors);
    }
    requireSortedStringArray(`${path}.evidence_ids`, value.evidence_ids, errors);
    requireOptionalString(`${path}.reason`, value.reason, errors);
    return;
  }

  rejectUnexpectedKeys(path, value, fields, errors);
  requireExactString(
    `${path}.status`,
    value.status,
    "unavailable",
    "unsupported_disagreement_status",
    errors,
  );
  requireNonEmptyString(`${path}.reason`, value.reason, errors);
  for (const field of fields.filter(isBooleanDisagreementField)) {
    requireNull(`${path}.${field}`, value[field], errors);
  }
  requireSortedStringArray(`${path}.evidence_ids`, value.evidence_ids, errors);
}

function validatePruneIds(
  input: Record<string, unknown>,
  errors: ClusterRefinementValidationErrorV01[],
) {
  if (
    !Array.isArray(input.prune_session_ids) ||
    !Array.isArray(input.session_exclusion_recommendations)
  ) {
    return;
  }

  const expectedPruneIds = input.session_exclusion_recommendations
    .filter(
      (recommendation) =>
        isRecord(recommendation) && recommendation.status === "recommended",
    )
    .map((recommendation) => recommendation.session_id)
    .filter((sessionId): sessionId is string => typeof sessionId === "string")
    .sort(compareStrings);

  if (!arraysEqual(input.prune_session_ids, expectedPruneIds)) {
    errors.push({
      path: "$.prune_session_ids",
      code: "derived_field_mismatch",
      message:
        "prune_session_ids must equal the sorted recommended session exclusion IDs.",
    });
  }
}

function isBooleanDisagreementField(field: string) {
  return !["status", "reason", "evidence_ids"].includes(field);
}
