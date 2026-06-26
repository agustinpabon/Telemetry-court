import type { ReviewerIdentityV01 } from "@/lib/reviewerIdentityV01";
import {
  assertCompleteReviewerIdentityV01,
  createLocalDemoReviewerV01,
  REVIEWER_CONTEXTS_V01,
} from "@/lib/reviewerIdentityV01";
import {
  CASE_PACKAGE_V01_SCHEMA_VERSION,
  type CaseFile,
  type CasePackageReferenceV01,
} from "@/lib/types";

export const QUICK_DISPOSITION_V01_SCHEMA_VERSION =
  "quick_disposition.v0.1" as const;

export const QUICK_DISPOSITION_V01_SOURCE_STAGES = [
  "landscape",
  "case_file",
  "blind_review",
  "evidence_board",
] as const;

export const QUICK_DISPOSITION_V01_DISPOSITIONS = [
  "dismiss_not_interesting",
  "save_for_later",
  "escalate_to_full_review",
  "cannot_judge_from_package",
] as const;

export const QUICK_DISPOSITION_V01_REASON_CODES = [
  "low_validation_value",
  "needs_later_review",
  "full_review_requested",
  "insufficient_package_context",
] as const;

export type QuickDispositionSourceStageV01 =
  (typeof QUICK_DISPOSITION_V01_SOURCE_STAGES)[number];
export type QuickDispositionValueV01 =
  (typeof QUICK_DISPOSITION_V01_DISPOSITIONS)[number];
export type QuickDispositionReasonCodeV01 =
  (typeof QUICK_DISPOSITION_V01_REASON_CODES)[number];

export type QuickDispositionV01 = {
  schema_version: typeof QUICK_DISPOSITION_V01_SCHEMA_VERSION;
  disposition_id: string;
  created_at: string;
  case_package: Omit<CasePackageReferenceV01, "blind_review_enabled">;
  reviewer: ReviewerIdentityV01;
  source_stage: QuickDispositionSourceStageV01;
  disposition: QuickDispositionValueV01;
  reason_codes: QuickDispositionReasonCodeV01[];
};

export type QuickDispositionValidationErrorV01 = {
  path: string;
  code: string;
  message: string;
};

export type QuickDispositionValidationResultV01 =
  | { ok: true; quickDisposition: QuickDispositionV01 }
  | { ok: false; errors: QuickDispositionValidationErrorV01[] };

const topLevelFields = [
  "schema_version",
  "disposition_id",
  "created_at",
  "case_package",
  "reviewer",
  "source_stage",
  "disposition",
  "reason_codes",
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
const reviewerFields = ["reviewer_id", "review_session_id", "context"] as const;

export function buildQuickDispositionExportV01({
  caseFile,
  exportTimestamp,
  sourceStage,
  disposition,
  reasonCodes,
  reviewer,
}: {
  caseFile: CaseFile;
  exportTimestamp: string;
  sourceStage: QuickDispositionSourceStageV01;
  disposition: QuickDispositionValueV01;
  reasonCodes: QuickDispositionReasonCodeV01[];
  reviewer?: ReviewerIdentityV01;
}): QuickDispositionV01 {
  const packageReference = caseFile.casePackageReference;
  const createdAt = requireValue(exportTimestamp, "export timestamp");

  if (!packageReference) {
    throw new Error(
      "Cannot export QuickDisposition v0.1 without CasePackage reference metadata.",
    );
  }

  assertCompletePackageReference(packageReference);

  if (
    !caseFileMatchesPackageReference(caseFile, packageReference) ||
    packageReference.cluster_id !== caseFile.cluster.id
  ) {
    throw new Error(
      "Cannot export QuickDisposition v0.1 with mismatched CasePackage references.",
    );
  }

  if (!QUICK_DISPOSITION_V01_SOURCE_STAGES.includes(sourceStage)) {
    throw new Error(
      `Cannot export QuickDisposition v0.1 with unsupported source stage "${sourceStage}".`,
    );
  }

  if (!QUICK_DISPOSITION_V01_DISPOSITIONS.includes(disposition)) {
    throw new Error(
      `Cannot export QuickDisposition v0.1 with unsupported disposition "${disposition}".`,
    );
  }

  const uniqueReasonCodes = normalizeReasonCodes(reasonCodes);
  const reviewResultReviewer =
    reviewer ??
    createLocalDemoReviewerV01(
      packageReference.package_id,
      packageReference.case_id,
    );
  assertCompleteReviewerIdentityV01(
    reviewResultReviewer,
    "QuickDisposition v0.1",
  );
  const casePackage = toQuickDispositionCasePackageReference(packageReference);

  return {
    schema_version: QUICK_DISPOSITION_V01_SCHEMA_VERSION,
    disposition_id: createQuickDispositionId(
      packageReference.package_id,
      reviewResultReviewer,
      sourceStage,
      createdAt,
    ),
    created_at: createdAt,
    case_package: casePackage,
    reviewer: reviewResultReviewer,
    source_stage: sourceStage,
    disposition,
    reason_codes: uniqueReasonCodes,
  };
}

export function serializeQuickDispositionV01(
  quickDisposition: QuickDispositionV01,
): string {
  return `${JSON.stringify(quickDisposition, null, 2)}\n`;
}

export function getQuickDispositionFilenameV01(caseFile: CaseFile): string {
  return `${caseFile.casePackageReference?.case_id ?? caseFile.id}-quick-disposition.json`;
}

export function validateQuickDispositionV01(
  input: unknown,
  rootPath = "$",
): QuickDispositionValidationResultV01 {
  const errors: QuickDispositionValidationErrorV01[] = [];
  const quickDisposition = requireObject(input, rootPath, errors);

  if (!quickDisposition) {
    return { ok: false, errors };
  }

  rejectUnknownFields(quickDisposition, topLevelFields, rootPath, errors);
  requireExactValue(
    quickDisposition.schema_version,
    QUICK_DISPOSITION_V01_SCHEMA_VERSION,
    `${rootPath}.schema_version`,
    "unsupported_schema_version",
    errors,
  );
  requireNonEmptyString(
    quickDisposition.disposition_id,
    `${rootPath}.disposition_id`,
    errors,
  );
  requireIsoTimestamp(quickDisposition.created_at, `${rootPath}.created_at`, errors);
  validateCasePackageReference(
    quickDisposition.case_package,
    `${rootPath}.case_package`,
    errors,
  );
  validateReviewer(quickDisposition.reviewer, `${rootPath}.reviewer`, errors);
  requireEnum(
    quickDisposition.source_stage,
    QUICK_DISPOSITION_V01_SOURCE_STAGES,
    `${rootPath}.source_stage`,
    errors,
  );
  requireEnum(
    quickDisposition.disposition,
    QUICK_DISPOSITION_V01_DISPOSITIONS,
    `${rootPath}.disposition`,
    errors,
  );
  validateReasonCodes(
    quickDisposition.reason_codes,
    `${rootPath}.reason_codes`,
    errors,
  );
  validateDispositionIdentity(quickDisposition, rootPath, errors);

  return errors.length === 0
    ? { ok: true, quickDisposition: quickDisposition as QuickDispositionV01 }
    : { ok: false, errors };
}

export function assertValidQuickDispositionV01(
  input: unknown,
): QuickDispositionV01 {
  const result = validateQuickDispositionV01(input);

  if (!result.ok) {
    const firstError = result.errors[0];
    throw new Error(
      firstError
        ? `Invalid QuickDisposition v0.1 at ${firstError.path}: ${firstError.message}`
        : "Invalid QuickDisposition v0.1 artifact.",
    );
  }

  return result.quickDisposition;
}

function normalizeReasonCodes(
  reasonCodes: readonly QuickDispositionReasonCodeV01[],
): QuickDispositionReasonCodeV01[] {
  if (!Array.isArray(reasonCodes) || reasonCodes.length === 0) {
    throw new Error(
      "Cannot export QuickDisposition v0.1 without at least one reason code.",
    );
  }

  const seen = new Set<QuickDispositionReasonCodeV01>();

  for (const reasonCode of reasonCodes) {
    if (!QUICK_DISPOSITION_V01_REASON_CODES.includes(reasonCode)) {
      throw new Error(
        `Cannot export QuickDisposition v0.1 with unsupported reason code "${reasonCode}".`,
      );
    }
    seen.add(reasonCode);
  }

  return [...seen].sort();
}

function validateDispositionIdentity(
  quickDisposition: Record<string, unknown>,
  path: string,
  errors: QuickDispositionValidationErrorV01[],
) {
  const casePackage = isObjectRecord(quickDisposition.case_package)
    ? quickDisposition.case_package
    : undefined;
  const reviewer = isObjectRecord(quickDisposition.reviewer)
    ? quickDisposition.reviewer
    : undefined;
  const identityParts = [
    casePackage?.package_id,
    reviewer?.reviewer_id,
    reviewer?.review_session_id,
    quickDisposition.source_stage,
    quickDisposition.created_at,
  ];

  if (
    identityParts.every(
      (value): value is string =>
        typeof value === "string" && value.trim() !== "",
    ) &&
    quickDisposition.disposition_id !==
      ["quick-disposition", ...identityParts].join(":")
  ) {
    addError(
      errors,
      `${path}.disposition_id`,
      "inconsistent_disposition_identity",
      "must match the package, reviewer, session, source stage, and timestamp metadata.",
    );
  }
}

function validateCasePackageReference(
  input: unknown,
  path: string,
  errors: QuickDispositionValidationErrorV01[],
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
  errors: QuickDispositionValidationErrorV01[],
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

function validateReasonCodes(
  input: unknown,
  path: string,
  errors: QuickDispositionValidationErrorV01[],
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
      "must contain at least one reason code.",
    );
    return;
  }

  const seen = new Set<string>();
  input.forEach((value, index) => {
    const itemPath = `${path}[${index}]`;
    if (
      typeof value !== "string" ||
      !QUICK_DISPOSITION_V01_REASON_CODES.includes(
        value as QuickDispositionReasonCodeV01,
      )
    ) {
      addError(errors, itemPath, "unsupported_value", "contains an unsupported value.");
      return;
    }

    if (seen.has(value)) {
      addError(errors, itemPath, "duplicate_value", `duplicates value "${value}".`);
    }
    seen.add(value);
  });
}

function assertCompletePackageReference(
  packageReference: CasePackageReferenceV01,
) {
  if (packageReference.schema_version !== "case_package.v0.1") {
    throw new Error(
      "Cannot export QuickDisposition v0.1 for an unsupported CasePackage schema version.",
    );
  }

  requireValue(packageReference.package_id, "CasePackage ID");
  requireValue(packageReference.case_id, "CasePackage case ID");
  requireValue(packageReference.cluster_id, "CasePackage cluster ID");
  requireValue(packageReference.pipeline.run_id, "pipeline run ID");
  requireValue(packageReference.pipeline.upstream_tool, "upstream pipeline tool");
  requireValue(packageReference.pipeline.generated_at, "pipeline generation timestamp");
}

function toQuickDispositionCasePackageReference(
  packageReference: CasePackageReferenceV01,
): QuickDispositionV01["case_package"] {
  return {
    schema_version: packageReference.schema_version,
    package_id: packageReference.package_id,
    ...(packageReference.package_revision
      ? { package_revision: packageReference.package_revision }
      : {}),
    case_id: packageReference.case_id,
    cluster_id: packageReference.cluster_id,
    pipeline: packageReference.pipeline,
  };
}

function caseFileMatchesPackageReference(
  caseFile: CaseFile,
  packageReference: CasePackageReferenceV01,
): boolean {
  return (
    caseFile.id === packageReference.case_id ||
    caseFile.id === createImportedCaseReviewId(packageReference)
  );
}

function createImportedCaseReviewId(
  packageReference: CasePackageReferenceV01,
): string {
  return [
    "imported",
    packageReference.package_id,
    packageReference.package_revision ?? "unrevisioned",
    packageReference.case_id,
  ].join(":");
}

function createQuickDispositionId(
  packageId: string,
  reviewer: ReviewerIdentityV01,
  sourceStage: QuickDispositionSourceStageV01,
  createdAt: string,
): string {
  return [
    "quick-disposition",
    packageId,
    reviewer.reviewer_id,
    reviewer.review_session_id,
    sourceStage,
    createdAt,
  ].join(":");
}

function requireValue<T>(value: T | undefined, label: string): T {
  if (value === undefined || value === "") {
    throw new Error(`Cannot export QuickDisposition v0.1 without ${label}.`);
  }

  return value;
}

function rejectUnknownFields(
  input: Record<string, unknown>,
  allowedFields: readonly string[],
  path: string,
  errors: QuickDispositionValidationErrorV01[],
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

function requireObject(
  input: unknown,
  path: string,
  errors: QuickDispositionValidationErrorV01[],
): Record<string, unknown> | undefined {
  if (!isObjectRecord(input)) {
    addError(errors, path, "invalid_type", "must be an object.");
    return undefined;
  }

  return input;
}

function requireNonEmptyString(
  input: unknown,
  path: string,
  errors: QuickDispositionValidationErrorV01[],
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
  errors: QuickDispositionValidationErrorV01[],
) {
  if (input !== undefined && typeof input !== "string") {
    addError(errors, path, "invalid_type", "must be a string when provided.");
  }
}

function requireExactValue(
  input: unknown,
  expected: string,
  path: string,
  code: string,
  errors: QuickDispositionValidationErrorV01[],
) {
  if (input !== expected) {
    addError(errors, path, code, `must be "${expected}".`);
  }
}

function requireEnum<T extends string>(
  input: unknown,
  allowed: readonly T[],
  path: string,
  errors: QuickDispositionValidationErrorV01[],
): T | undefined {
  if (typeof input !== "string" || !allowed.includes(input as T)) {
    addError(errors, path, "unsupported_value", "contains an unsupported value.");
    return undefined;
  }

  return input as T;
}

function requireIsoTimestamp(
  input: unknown,
  path: string,
  errors: QuickDispositionValidationErrorV01[],
) {
  if (typeof input !== "string" || !isIsoTimestamp(input)) {
    addError(errors, path, "invalid_timestamp", "must be a valid ISO timestamp.");
  }
}

function isIsoTimestamp(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(
      value,
    ) && !Number.isNaN(Date.parse(value))
  );
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function addError(
  errors: QuickDispositionValidationErrorV01[],
  path: string,
  code: string,
  message: string,
) {
  errors.push({ path, code, message });
}
