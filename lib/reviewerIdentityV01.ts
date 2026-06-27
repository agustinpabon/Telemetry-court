export type ReviewerIdentityV01 = {
  reviewer_id: string;
  review_session_id: string;
  context?: ReviewerContextV01;
};

export const REVIEWER_CONTEXTS_V01 = [
  "synthetic_demo",
  "local_review",
  "pilot_reviewer",
  "expert_walkthrough",
] as const;

export const LOCAL_REVIEWER_METADATA_V01_STORAGE_KEY =
  "telemetry-court-local-reviewer-metadata-v1" as const;

export const DEFAULT_LOCAL_REVIEWER_ID_V01 = "local-demo-reviewer" as const;
export const DEFAULT_REVIEWER_CONTEXT_V01 = "synthetic_demo" as const;

export type ReviewerContextV01 = (typeof REVIEWER_CONTEXTS_V01)[number];

export type LocalReviewerMetadataV01 = {
  reviewerId: string;
  context: ReviewerContextV01;
};

export type ReviewerMetadataStorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

export const DEFAULT_LOCAL_REVIEWER_METADATA_V01 = {
  reviewerId: DEFAULT_LOCAL_REVIEWER_ID_V01,
  context: DEFAULT_REVIEWER_CONTEXT_V01,
} as const satisfies LocalReviewerMetadataV01;

export function createLocalDemoReviewerV01(
  packageId: string,
  caseId: string,
): ReviewerIdentityV01 {
  return {
    reviewer_id: DEFAULT_LOCAL_REVIEWER_ID_V01,
    review_session_id: `${packageId}:${caseId}:local-session`,
    context: DEFAULT_REVIEWER_CONTEXT_V01,
  };
}

export function createLocalReviewerIdentityV01({
  packageId,
  caseId,
  reviewerId,
  context,
}: {
  packageId: string;
  caseId: string;
  reviewerId: string;
  context: ReviewerContextV01;
}): ReviewerIdentityV01 {
  const normalizedReviewerId = normalizeLocalReviewerIdV01(reviewerId);
  const reviewContext = normalizeReviewerContextV01(context);
  const isDefaultDemoReviewer =
    normalizedReviewerId === DEFAULT_LOCAL_REVIEWER_ID_V01 &&
    reviewContext === DEFAULT_REVIEWER_CONTEXT_V01;

  return {
    reviewer_id: normalizedReviewerId,
    review_session_id: isDefaultDemoReviewer
      ? `${packageId}:${caseId}:local-session`
      : `${packageId}:${caseId}:${normalizedReviewerId}:local-session`,
    context: reviewContext,
  };
}

export function readLocalReviewerMetadataV01(
  storage: ReviewerMetadataStorageLike,
): LocalReviewerMetadataV01 {
  const serializedMetadata = storage.getItem(
    LOCAL_REVIEWER_METADATA_V01_STORAGE_KEY,
  );

  if (!serializedMetadata) {
    return { ...DEFAULT_LOCAL_REVIEWER_METADATA_V01 };
  }

  try {
    return parseLocalReviewerMetadataV01(JSON.parse(serializedMetadata));
  } catch {
    return { ...DEFAULT_LOCAL_REVIEWER_METADATA_V01 };
  }
}

export function saveLocalReviewerMetadataV01(
  storage: ReviewerMetadataStorageLike,
  metadata: LocalReviewerMetadataV01,
): LocalReviewerMetadataV01 {
  const normalizedMetadata = parseLocalReviewerMetadataV01(metadata);

  storage.setItem(
    LOCAL_REVIEWER_METADATA_V01_STORAGE_KEY,
    JSON.stringify(normalizedMetadata),
  );

  return normalizedMetadata;
}

export function assertCompleteReviewerIdentityV01(
  reviewer: ReviewerIdentityV01,
  artifactLabel: string,
) {
  requireValue(reviewer.reviewer_id, "reviewer ID", artifactLabel);
  requireValue(reviewer.review_session_id, "review session ID", artifactLabel);
  requireValue(reviewer.context, "review context", artifactLabel);

  if (!isReviewerContextV01(reviewer.context)) {
    throw new Error(
      `Cannot export ${artifactLabel} with unsupported reviewer context "${reviewer.context}".`,
    );
  }
}

export function assertSupportedReviewerContextV01(
  context: ReviewerIdentityV01["context"],
  artifactLabel: string,
) {
  if (context !== undefined && !isReviewerContextV01(context)) {
    throw new Error(
      `Cannot ${artifactLabel} with unsupported reviewer context "${context}".`,
    );
  }
}

export function isReviewerContextV01(
  context: unknown,
): context is ReviewerContextV01 {
  return (
    typeof context === "string" &&
    REVIEWER_CONTEXTS_V01.includes(context as ReviewerContextV01)
  );
}

export function normalizeLocalReviewerIdV01(reviewerId: string): string {
  const normalizedReviewerId = reviewerId.trim();

  if (
    normalizedReviewerId === "" ||
    normalizedReviewerId.length > 64 ||
    !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(normalizedReviewerId)
  ) {
    throw new Error(
      "Local reviewer ID must use 1-64 letters, numbers, dots, underscores, or hyphens, and start with a letter or number.",
    );
  }

  return normalizedReviewerId;
}

function parseLocalReviewerMetadataV01(
  input: unknown,
): LocalReviewerMetadataV01 {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new Error("Local reviewer metadata must be an object.");
  }

  const metadata = input as Record<string, unknown>;

  if (typeof metadata.reviewerId !== "string") {
    throw new Error("Local reviewer metadata requires a reviewer ID.");
  }

  return {
    reviewerId: normalizeLocalReviewerIdV01(metadata.reviewerId),
    context: normalizeReviewerContextV01(metadata.context),
  };
}

function normalizeReviewerContextV01(context: unknown): ReviewerContextV01 {
  if (!isReviewerContextV01(context)) {
    throw new Error(
      `Unsupported local review context "${String(context)}".`,
    );
  }

  return context;
}

function requireValue(value: string | undefined, label: string, artifactLabel: string) {
  if (value === undefined || value === "") {
    throw new Error(`Cannot export ${artifactLabel} without ${label}.`);
  }
}
