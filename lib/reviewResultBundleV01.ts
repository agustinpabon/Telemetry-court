import {
  REVIEW_PROTOCOL_V01_VERSION,
  REVIEW_RESULT_V01_SCHEMA_VERSION,
  type ReviewResultV01,
} from "@/lib/reviewResultV01";
import {
  createLocalReviewSessionV01,
  submitReviewResultToLocalReviewSessionV01,
} from "@/lib/reviewSessionV01";
import {
  readReviewResultLocalStoreV01,
  REVIEW_RESULT_LOCAL_STORE_V01_KEY,
  saveReviewResultToLocalStoreV01,
  type ReviewResultStorageLike,
} from "@/lib/reviewResultStorageV01";
import {
  assertValidReviewResultV01,
  validateReviewResultV01,
} from "@/lib/reviewResultValidationV01";
import { CASE_PACKAGE_V01_SCHEMA_VERSION } from "@/lib/types";

export const REVIEW_RESULT_BUNDLE_V01_SCHEMA_VERSION =
  "review_result_bundle.v0.1" as const;

const bundleFields = [
  "schema_version",
  "metadata",
  "compatibility",
  "review_results",
] as const;
const bundleMetadataFields = [
  "bundle_id",
  "created_at",
  "source_application",
  "format",
  "review_result_count",
] as const;
const bundleCompatibilityFields = [
  "review_result_schema_version",
  "review_protocol_version",
  "case_package_schema_version",
] as const;

export type ReviewResultBundleV01 = {
  schema_version: typeof REVIEW_RESULT_BUNDLE_V01_SCHEMA_VERSION;
  metadata: {
    bundle_id: string;
    created_at: string;
    source_application: "telemetry_court";
    format: "local_json";
    review_result_count: number;
  };
  compatibility: {
    review_result_schema_version: typeof REVIEW_RESULT_V01_SCHEMA_VERSION;
    review_protocol_version: typeof REVIEW_PROTOCOL_V01_VERSION;
    case_package_schema_version: typeof CASE_PACKAGE_V01_SCHEMA_VERSION;
  };
  review_results: ReviewResultV01[];
};

export type ReviewResultBundleImportResult =
  | { ok: true; bundle: ReviewResultBundleV01 }
  | {
      ok: false;
      reason:
        | "malformed_json"
        | "unsupported_schema"
        | "invalid_bundle"
        | "invalid_review_result"
        | "duplicate_review_result_id";
      message: string;
    };

export type ReviewResultBundleLocalImportSummaryV01 = {
  bundleId: string;
  importedReviewCount: number;
  totalLocalReviewCount: number;
  casePackageIds: string[];
};

export function createReviewResultBundleV01({
  reviewResults,
  bundleId,
  createdAt,
}: {
  reviewResults: readonly ReviewResultV01[];
  bundleId: string;
  createdAt: string;
}): ReviewResultBundleV01 {
  if (reviewResults.length === 0) {
    throw new Error(
      "Cannot export ReviewResult bundle v0.1 without ReviewResult artifacts.",
    );
  }

  const validatedReviewResults = reviewResults.map(assertValidReviewResultV01);
  const duplicateReviewId = findDuplicateReviewId(validatedReviewResults);

  if (duplicateReviewId) {
    throw new Error(
      `Cannot export ReviewResult bundle v0.1 with duplicate ReviewResult ID "${duplicateReviewId}".`,
    );
  }

  const compatibilityError = getReviewSetCompatibilityError(
    validatedReviewResults,
  );
  if (compatibilityError) {
    throw new Error(
      `Cannot export ReviewResult bundle v0.1: ${compatibilityError}`,
    );
  }

  const sortedReviewResults = [...validatedReviewResults].sort((left, right) =>
    left.review_id < right.review_id
      ? -1
      : left.review_id > right.review_id
        ? 1
        : 0,
  );

  return {
    schema_version: REVIEW_RESULT_BUNDLE_V01_SCHEMA_VERSION,
    metadata: {
      bundle_id: requireMetadataString(bundleId, "bundle ID"),
      created_at: requireIsoTimestamp(createdAt, "creation timestamp"),
      source_application: "telemetry_court",
      format: "local_json",
      review_result_count: sortedReviewResults.length,
    },
    compatibility: {
      review_result_schema_version: REVIEW_RESULT_V01_SCHEMA_VERSION,
      review_protocol_version: REVIEW_PROTOCOL_V01_VERSION,
      case_package_schema_version: CASE_PACKAGE_V01_SCHEMA_VERSION,
    },
    review_results: sortedReviewResults,
  };
}

export function serializeReviewResultBundleV01(
  bundle: ReviewResultBundleV01,
): string {
  return `${JSON.stringify(bundle, null, 2)}\n`;
}

export function getReviewResultBundleFilename(
  bundle: ReviewResultBundleV01,
): string {
  const date = /^\d{4}-\d{2}-\d{2}/.exec(bundle.metadata.created_at)?.[0] ??
    "local";

  return `telemetry-court-review-results-${date}.json`;
}

export function importReviewResultBundleV01Json(
  jsonText: string,
): ReviewResultBundleImportResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return {
      ok: false,
      reason: "malformed_json",
      message: "ReviewResult bundle JSON is malformed and could not be parsed.",
    };
  }

  if (!isObjectRecord(parsed)) {
    return invalidBundle("ReviewResult bundle must be a JSON object.");
  }

  if (parsed.schema_version !== REVIEW_RESULT_BUNDLE_V01_SCHEMA_VERSION) {
    return {
      ok: false,
      reason: "unsupported_schema",
      message: `Unsupported ReviewResult bundle schema version "${String(parsed.schema_version)}".`,
    };
  }

  const unsupportedBundleField = findUnsupportedField(parsed, bundleFields, "$");
  if (unsupportedBundleField) {
    return invalidBundle(unsupportedBundleField);
  }

  if (!isObjectRecord(parsed.metadata)) {
    return invalidBundle("ReviewResult bundle metadata must be an object.");
  }

  const unsupportedMetadataField = findUnsupportedField(
    parsed.metadata,
    bundleMetadataFields,
    "$.metadata",
  );
  if (unsupportedMetadataField) {
    return invalidBundle(unsupportedMetadataField);
  }

  if (!isObjectRecord(parsed.compatibility)) {
    return invalidBundle(
      "ReviewResult bundle compatibility metadata must be an object.",
    );
  }

  const unsupportedCompatibilityField = findUnsupportedField(
    parsed.compatibility,
    bundleCompatibilityFields,
    "$.compatibility",
  );
  if (unsupportedCompatibilityField) {
    return invalidBundle(unsupportedCompatibilityField);
  }

  if (!Array.isArray(parsed.review_results) || parsed.review_results.length === 0) {
    return invalidBundle(
      "ReviewResult bundle must contain at least one ReviewResult artifact.",
    );
  }

  const bundle = parsed as ReviewResultBundleV01;

  if (
    typeof bundle.metadata.bundle_id !== "string" ||
    bundle.metadata.bundle_id.trim() === "" ||
    typeof bundle.metadata.created_at !== "string" ||
    bundle.metadata.created_at.trim() === ""
  ) {
    return invalidBundle(
      "ReviewResult bundle metadata requires a bundle ID and creation timestamp.",
    );
  }

  if (!isIsoTimestamp(bundle.metadata.created_at)) {
    return invalidBundle(
      "ReviewResult bundle creation timestamp must be a valid ISO timestamp.",
    );
  }

  if (
    bundle.metadata.source_application !== "telemetry_court" ||
    bundle.metadata.format !== "local_json" ||
    bundle.metadata.review_result_count !== bundle.review_results.length
  ) {
    return invalidBundle(
      "ReviewResult bundle metadata does not match the supported local JSON format or result count.",
    );
  }

  if (
    bundle.compatibility.review_result_schema_version !==
      REVIEW_RESULT_V01_SCHEMA_VERSION ||
    bundle.compatibility.review_protocol_version !== REVIEW_PROTOCOL_V01_VERSION ||
    bundle.compatibility.case_package_schema_version !==
      CASE_PACKAGE_V01_SCHEMA_VERSION
  ) {
    return invalidBundle(
      "ReviewResult bundle compatibility metadata contains unsupported contract versions.",
    );
  }

  for (const [index, reviewResult] of bundle.review_results.entries()) {
    const validation = validateReviewResultV01(
      reviewResult,
      `$.review_results[${index}]`,
    );

    if (!validation.ok) {
      const firstError = validation.errors[0];
      return {
        ok: false,
        reason: "invalid_review_result",
        message: firstError
          ? `Invalid ReviewResult at ${firstError.path}: ${firstError.message}`
          : `Invalid ReviewResult at $.review_results[${index}].`,
      };
    }
  }

  const duplicateReviewId = findDuplicateReviewId(bundle.review_results);
  if (duplicateReviewId) {
    return {
      ok: false,
      reason: "duplicate_review_result_id",
      message: `ReviewResult bundle contains duplicate ReviewResult ID "${duplicateReviewId}".`,
    };
  }

  const compatibilityError = getReviewSetCompatibilityError(
    bundle.review_results,
  );
  if (compatibilityError) {
    return invalidBundle(compatibilityError);
  }

  return { ok: true, bundle };
}

export function importReviewResultBundleToLocalStoreV01(
  storage: ReviewResultStorageLike,
  inputBundle: ReviewResultBundleV01,
): ReviewResultBundleLocalImportSummaryV01 {
  let serializedBundle: string | undefined;
  try {
    serializedBundle = JSON.stringify(inputBundle);
  } catch {
    throw new Error(
      "Cannot import ReviewResult bundle: runtime input is not serializable JSON. No results were imported.",
    );
  }

  const validation = importReviewResultBundleV01Json(serializedBundle ?? "");
  if (!validation.ok) {
    throw new Error(
      `Cannot import ReviewResult bundle: ${validation.message} No results were imported.`,
    );
  }
  const bundle = validation.bundle;
  const currentStore = readReviewResultLocalStoreV01(storage);
  const currentReviews = Object.values(
    currentStore.review_results_by_case_package_id,
  ).flat();
  const currentReviewIds = new Set(
    currentReviews.map((reviewResult) => reviewResult.review_id),
  );

  for (const reviewResult of bundle.review_results) {
    if (currentReviewIds.has(reviewResult.review_id)) {
      throw new Error(
        `Cannot import ReviewResult bundle: ReviewResult ID "${reviewResult.review_id}" already exists locally. No results were imported.`,
      );
    }

    const sameReviewerSession = currentReviews.find(
      (storedReview) =>
        storedReview.case_package.package_id ===
          reviewResult.case_package.package_id &&
        storedReview.reviewer.reviewer_id === reviewResult.reviewer.reviewer_id &&
        storedReview.reviewer.review_session_id ===
          reviewResult.reviewer.review_session_id,
    );
    if (sameReviewerSession) {
      throw new Error(
        `Cannot import ReviewResult bundle: reviewer/session "${reviewResult.reviewer.reviewer_id}" / "${reviewResult.reviewer.review_session_id}" already has a local result for CasePackage "${reviewResult.case_package.package_id}". No results were imported.`,
      );
    }
  }

  const bundlePackageId = bundle.review_results[0].case_package.package_id;
  const existingPackageReviews = currentReviews.filter(
    (reviewResult) =>
      reviewResult.case_package.package_id === bundlePackageId,
  );
  const localCompatibilityError = getReviewSetCompatibilityError([
    ...existingPackageReviews,
    ...bundle.review_results,
  ]);
  if (localCompatibilityError) {
    throw new Error(
      `Cannot import ReviewResult bundle: ${localCompatibilityError} No results were imported.`,
    );
  }

  let stagedSerializedStore = storage.getItem(REVIEW_RESULT_LOCAL_STORE_V01_KEY);
  const stagedStorage: ReviewResultStorageLike = {
    getItem(key) {
      return key === REVIEW_RESULT_LOCAL_STORE_V01_KEY
        ? stagedSerializedStore
        : null;
    },
    setItem(key, value) {
      if (key === REVIEW_RESULT_LOCAL_STORE_V01_KEY) {
        stagedSerializedStore = value;
      }
    },
  };

  for (const reviewResult of bundle.review_results) {
    saveReviewResultToLocalStoreV01(stagedStorage, reviewResult);
  }

  if (!stagedSerializedStore) {
    throw new Error(
      "Cannot import ReviewResult bundle because the local store could not be staged.",
    );
  }

  storage.setItem(REVIEW_RESULT_LOCAL_STORE_V01_KEY, stagedSerializedStore);
  const nextStore = readReviewResultLocalStoreV01(stagedStorage);
  const nextReviews = Object.values(
    nextStore.review_results_by_case_package_id,
  ).flat();

  return {
    bundleId: bundle.metadata.bundle_id,
    importedReviewCount: bundle.review_results.length,
    totalLocalReviewCount: nextReviews.length,
    casePackageIds: [
      ...new Set(
        bundle.review_results.map(
          (reviewResult) => reviewResult.case_package.package_id,
        ),
      ),
    ].sort(),
  };
}

function requireMetadataString(value: string, label: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Cannot export ReviewResult bundle v0.1 without ${label}.`);
  }

  return value;
}

function requireIsoTimestamp(value: string, label: string): string {
  requireMetadataString(value, label);
  if (!isIsoTimestamp(value)) {
    throw new Error(
      `Cannot export ReviewResult bundle v0.1 without a valid ${label}.`,
    );
  }

  return value;
}

function isIsoTimestamp(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(
      value,
    ) && !Number.isNaN(Date.parse(value))
  );
}

function invalidBundle(message: string): ReviewResultBundleImportResult {
  return { ok: false, reason: "invalid_bundle", message };
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function findUnsupportedField(
  input: Record<string, unknown>,
  allowedFields: readonly string[],
  path: string,
): string | undefined {
  const unsupportedField = Object.keys(input).find(
    (field) => !allowedFields.includes(field),
  );

  return unsupportedField
    ? `ReviewResult bundle contains unsupported field "${unsupportedField}" at ${path}.${unsupportedField}.`
    : undefined;
}

function findDuplicateReviewId(
  reviewResults: readonly ReviewResultV01[],
): string | undefined {
  const seen = new Set<string>();

  for (const reviewResult of reviewResults) {
    if (seen.has(reviewResult.review_id)) {
      return reviewResult.review_id;
    }
    seen.add(reviewResult.review_id);
  }

  return undefined;
}

function getReviewSetCompatibilityError(
  reviewResults: readonly ReviewResultV01[],
): string | undefined {
  const reviewsByPackageId = new Map<string, ReviewResultV01[]>();

  for (const reviewResult of reviewResults) {
    const packageId = reviewResult.case_package.package_id;
    reviewsByPackageId.set(packageId, [
      ...(reviewsByPackageId.get(packageId) ?? []),
      reviewResult,
    ]);
  }

  if (reviewsByPackageId.size !== 1) {
    return "ReviewResult bundle must contain results for one compatible CasePackage ID.";
  }

  const expectedEvidenceIds = getSortedEvidenceIds(reviewResults[0]);
  const evidenceSetMismatch = reviewResults.find(
    (reviewResult) =>
      !arraysEqual(expectedEvidenceIds, getSortedEvidenceIds(reviewResult)),
  );
  if (evidenceSetMismatch) {
    return `ReviewResult "${evidenceSetMismatch.review_id}" is incompatible because its stable evidence ID set differs.`;
  }

  const expectedBlindReviewSetting =
    reviewResults[0].protocol.blind_review_enabled;
  const blindReviewMismatch = reviewResults.find(
    (reviewResult) =>
      reviewResult.protocol.blind_review_enabled !== expectedBlindReviewSetting,
  );
  if (blindReviewMismatch) {
    return `ReviewResult "${blindReviewMismatch.review_id}" is incompatible because its blind-review setting differs.`;
  }

  try {
    for (const packageReviews of reviewsByPackageId.values()) {
      let session = createLocalReviewSessionV01(
        packageReviews[0].case_package,
      );
      for (const reviewResult of packageReviews) {
        session = submitReviewResultToLocalReviewSessionV01(
          session,
          reviewResult,
        );
      }
    }
  } catch (error) {
    return error instanceof Error
      ? error.message
      : "ReviewResult bundle contains incompatible review artifacts.";
  }

  return undefined;
}

function getSortedEvidenceIds(reviewResult: ReviewResultV01): string[] {
  return reviewResult.decisions.evidence_ratings
    .map((rating) => rating.evidence_id)
    .sort();
}

function arraysEqual(left: readonly string[], right: readonly string[]): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}
