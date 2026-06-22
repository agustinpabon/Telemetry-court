import {
  createLocalReviewSessionV01,
  submitReviewResultToLocalReviewSessionV01,
} from "@/lib/reviewSessionV01";
import type { ReviewResultV01 } from "@/lib/reviewResultV01";
import { assertValidReviewResultV01 } from "@/lib/reviewResultValidationV01";

export const REVIEW_RESULT_LOCAL_STORE_V01_SCHEMA_VERSION =
  "review_result_local_store.v0.1" as const;
export const REVIEW_RESULT_LOCAL_STORE_V01_KEY =
  "telemetry-court-review-results-v1" as const;

export type ReviewResultStorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

export type ReviewResultLocalStoreV01 = {
  schema_version: typeof REVIEW_RESULT_LOCAL_STORE_V01_SCHEMA_VERSION;
  review_results_by_case_package_id: Record<string, ReviewResultV01[]>;
};

export function saveReviewResultToLocalStoreV01(
  storage: ReviewResultStorageLike,
  reviewResult: ReviewResultV01,
): ReviewResultLocalStoreV01 {
  const supportedReviewResult = assertSupportedReviewResultV01(reviewResult);
  const currentStore = readReviewResultLocalStoreV01(storage);
  const packageId = supportedReviewResult.case_package.package_id;
  const currentPackageReviews =
    currentStore.review_results_by_case_package_id[packageId] ?? [];
  const sessionPackageReference =
    currentPackageReviews[0]?.case_package ?? supportedReviewResult.case_package;
  let compatibilitySession = createLocalReviewSessionV01(sessionPackageReference);
  const retainedPackageReviews = currentPackageReviews.filter(
    (storedReview) =>
      storedReview.review_id !== supportedReviewResult.review_id &&
      !hasSameReviewerSession(storedReview, supportedReviewResult),
  );

  for (const storedReview of retainedPackageReviews) {
    compatibilitySession = submitReviewResultToLocalReviewSessionV01(
      compatibilitySession,
      storedReview,
    );
  }

  submitReviewResultToLocalReviewSessionV01(
    compatibilitySession,
    supportedReviewResult,
  );

  const nextStore = {
    schema_version: REVIEW_RESULT_LOCAL_STORE_V01_SCHEMA_VERSION,
    review_results_by_case_package_id: {
      ...currentStore.review_results_by_case_package_id,
      [packageId]: [...retainedPackageReviews, supportedReviewResult],
    },
  } satisfies ReviewResultLocalStoreV01;

  storage.setItem(
    REVIEW_RESULT_LOCAL_STORE_V01_KEY,
    JSON.stringify(nextStore),
  );

  return nextStore;
}

export function loadReviewResultsForCasePackageV01(
  storage: ReviewResultStorageLike,
  casePackageId: string,
): ReviewResultV01[] {
  if (typeof casePackageId !== "string" || casePackageId.trim() === "") {
    throw new Error(
      "Cannot load local ReviewResult v0.1 artifacts without a CasePackage ID.",
    );
  }

  return readReviewResultLocalStoreV01(storage)
    .review_results_by_case_package_id[casePackageId] ?? [];
}

export function readReviewResultLocalStoreV01(
  storage: ReviewResultStorageLike,
): ReviewResultLocalStoreV01 {
  const serializedStore = storage.getItem(REVIEW_RESULT_LOCAL_STORE_V01_KEY);

  if (!serializedStore) {
    return createEmptyReviewResultLocalStoreV01();
  }

  let parsedStore: unknown;
  try {
    parsedStore = JSON.parse(serializedStore);
  } catch {
    throw new Error("Cannot load local ReviewResult store: JSON is invalid.");
  }

  if (!isObjectRecord(parsedStore)) {
    throw new Error(
      "Cannot load local ReviewResult store: store must be an object.",
    );
  }

  if (
    parsedStore.schema_version !== REVIEW_RESULT_LOCAL_STORE_V01_SCHEMA_VERSION
  ) {
    throw new Error(
      `Cannot load unsupported local ReviewResult store schema version "${String(parsedStore.schema_version)}".`,
    );
  }

  const reviewResultsByPackage =
    parsedStore.review_results_by_case_package_id;

  if (!isObjectRecord(reviewResultsByPackage)) {
    throw new Error(
      "Cannot load local ReviewResult store without review results by CasePackage ID.",
    );
  }

  const loadedStore = createEmptyReviewResultLocalStoreV01();

  for (const [packageId, storedReviews] of Object.entries(reviewResultsByPackage)) {
    if (!Array.isArray(storedReviews)) {
      throw new Error(
        `Cannot load local ReviewResult store entry for "${packageId}": expected an array.`,
      );
    }

    loadedStore.review_results_by_case_package_id[packageId] =
      validateStoredReviewsForCasePackage(packageId, storedReviews);
  }

  return loadedStore;
}

function validateStoredReviewsForCasePackage(
  packageId: string,
  storedReviews: unknown[],
): ReviewResultV01[] {
  const loadedReviews = storedReviews.map(assertSupportedReviewResultV01);

  for (const reviewResult of loadedReviews) {
    if (reviewResult.case_package.package_id !== packageId) {
      throw new Error(
        `Cannot load local ReviewResult store entry for "${packageId}": ReviewResult belongs to a different CasePackage ID.`,
      );
    }
  }

  if (loadedReviews.length === 0) {
    return [];
  }

  let compatibilitySession = createLocalReviewSessionV01(
    loadedReviews[0].case_package,
  );

  for (const reviewResult of loadedReviews) {
    compatibilitySession = submitReviewResultToLocalReviewSessionV01(
      compatibilitySession,
      reviewResult,
    );
  }

  return loadedReviews;
}

function assertSupportedReviewResultV01(
  reviewResult: unknown,
): ReviewResultV01 {
  if (!isObjectRecord(reviewResult)) {
    throw new Error("Cannot store ReviewResult v0.1: artifact must be an object.");
  }

  const typedReviewResult = reviewResult as ReviewResultV01;
  const compatibilitySession = createLocalReviewSessionV01(
    typedReviewResult.case_package,
  );

  submitReviewResultToLocalReviewSessionV01(
    compatibilitySession,
    typedReviewResult,
  );

  return assertValidReviewResultV01(typedReviewResult);
}

function createEmptyReviewResultLocalStoreV01(): ReviewResultLocalStoreV01 {
  return {
    schema_version: REVIEW_RESULT_LOCAL_STORE_V01_SCHEMA_VERSION,
    review_results_by_case_package_id: {},
  };
}

function hasSameReviewerSession(
  left: ReviewResultV01,
  right: ReviewResultV01,
) {
  return (
    left.reviewer.reviewer_id === right.reviewer.reviewer_id &&
    left.reviewer.review_session_id === right.reviewer.review_session_id
  );
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
