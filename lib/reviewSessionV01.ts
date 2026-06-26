import type { CaseReviewState } from "@/lib/arenaReviewState";
import {
  REVIEW_PROTOCOL_V01_VERSION,
  REVIEW_RESULT_V01_SCHEMA_VERSION,
  type ReviewResultV01,
} from "@/lib/reviewResultV01";
import { assertSupportedReviewerContextV01 } from "@/lib/reviewerIdentityV01";
import { CASE_PACKAGE_V01_SCHEMA_VERSION } from "@/lib/types";

type ReviewedCasePackageReferenceV01 = ReviewResultV01["case_package"];
type ReviewResultReviewerV01 = ReviewResultV01["reviewer"];
type CasePackageReferenceFieldV01 = Exclude<
  keyof ReviewedCasePackageReferenceV01,
  "pipeline"
>;

const CASE_PACKAGE_REFERENCE_FIELDS = [
  "schema_version",
  "package_id",
  "package_revision",
  "case_id",
  "cluster_id",
] satisfies CasePackageReferenceFieldV01[];

const PIPELINE_REFERENCE_FIELDS = [
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
] satisfies Array<keyof ReviewedCasePackageReferenceV01["pipeline"]>;

export type LocalReviewSessionV01 = {
  case_package: ReviewedCasePackageReferenceV01;
  reviewer_sessions: ReviewResultReviewerV01[];
  review_states_by_session_id: Record<string, CaseReviewState>;
  review_results: ReviewResultV01[];
};

export function createLocalReviewSessionV01(
  casePackage: ReviewedCasePackageReferenceV01,
): LocalReviewSessionV01 {
  assertSupportedCasePackageReference(
    casePackage,
    "create a local ReviewSession v0.1",
  );

  return {
    case_package: casePackage,
    reviewer_sessions: [],
    review_states_by_session_id: {},
    review_results: [],
  };
}

export function addReviewerToLocalReviewSessionV01(
  session: LocalReviewSessionV01,
  reviewer: ReviewResultReviewerV01,
): LocalReviewSessionV01 {
  assertSupportedReviewer(reviewer, "associate a reviewer/session");

  const existingSessionReviewer = session.reviewer_sessions.find(
    (currentReviewer) =>
      currentReviewer.review_session_id === reviewer.review_session_id,
  );

  if (existingSessionReviewer) {
    throw new Error(
      `Cannot associate duplicate review session ID "${reviewer.review_session_id}" with local ReviewSession v0.1.`,
    );
  }

  return {
    ...session,
    reviewer_sessions: [...session.reviewer_sessions, reviewer],
    review_states_by_session_id: {
      ...session.review_states_by_session_id,
      [reviewer.review_session_id]:
        session.review_states_by_session_id[reviewer.review_session_id] ?? {},
    },
  };
}

export function updateReviewStateForLocalReviewSessionV01(
  session: LocalReviewSessionV01,
  reviewer: ReviewResultReviewerV01,
  reviewState: CaseReviewState,
): LocalReviewSessionV01 {
  assertReviewerSessionIsRegistered(session, reviewer, "update review state for");

  return {
    ...session,
    review_states_by_session_id: {
      ...session.review_states_by_session_id,
      [reviewer.review_session_id]: { ...reviewState },
    },
  };
}

export function getReviewStateForLocalReviewSessionV01(
  session: LocalReviewSessionV01,
  reviewer: ReviewResultReviewerV01,
): CaseReviewState {
  assertReviewerSessionIsRegistered(session, reviewer, "read review state for");

  return {
    ...(session.review_states_by_session_id[reviewer.review_session_id] ?? {}),
  };
}

export function submitReviewResultToLocalReviewSessionV01(
  session: LocalReviewSessionV01,
  reviewResult: ReviewResultV01,
): LocalReviewSessionV01 {
  assertReviewResultCanJoinSession(session, reviewResult);

  if (
    session.review_results.some(
      (submittedReview) => submittedReview.review_id === reviewResult.review_id,
    )
  ) {
    throw new Error(
      `Cannot submit duplicate ReviewResult ID "${reviewResult.review_id}" to local ReviewSession v0.1.`,
    );
  }

  if (
    session.review_results.some((submittedReview) =>
      hasSameReviewerSession(submittedReview.reviewer, reviewResult.reviewer),
    )
  ) {
    throw new Error(
      `Cannot submit duplicate reviewer/session submission "${reviewResult.reviewer.reviewer_id}" / "${reviewResult.reviewer.review_session_id}" to local ReviewSession v0.1.`,
    );
  }

  const sessionWithReviewer = ensureReviewerSessionAssociated(
    session,
    reviewResult.reviewer,
  );

  return {
    ...sessionWithReviewer,
    review_results: [...sessionWithReviewer.review_results, reviewResult],
  };
}

function ensureReviewerSessionAssociated(
  session: LocalReviewSessionV01,
  reviewer: ReviewResultReviewerV01,
): LocalReviewSessionV01 {
  if (
    session.reviewer_sessions.some((registeredReviewer) =>
      hasSameReviewerSession(registeredReviewer, reviewer),
    )
  ) {
    return session;
  }

  return addReviewerToLocalReviewSessionV01(session, reviewer);
}

function assertReviewResultCanJoinSession(
  session: LocalReviewSessionV01,
  reviewResult: ReviewResultV01,
) {
  requireMetadataString(reviewResult.review_id, "ReviewResult ID", "submit");
  requireMetadataString(
    reviewResult.created_at,
    "ReviewResult creation timestamp",
    "submit",
  );

  if (reviewResult.schema_version !== REVIEW_RESULT_V01_SCHEMA_VERSION) {
    throw new Error(
      `Cannot submit unsupported ReviewResult schema version "${reviewResult.schema_version}" to local ReviewSession v0.1.`,
    );
  }

  if (!reviewResult.reviewer) {
    throw new Error(
      "Cannot submit ReviewResult v0.1 to local ReviewSession v0.1 without reviewer metadata.",
    );
  }

  assertSupportedReviewer(reviewResult.reviewer, "submit");

  if (!reviewResult.protocol) {
    throw new Error(
      "Cannot submit ReviewResult v0.1 to local ReviewSession v0.1 without review protocol metadata.",
    );
  }

  if (reviewResult.protocol.protocol_version !== REVIEW_PROTOCOL_V01_VERSION) {
    throw new Error(
      `Cannot submit unsupported review protocol version "${reviewResult.protocol.protocol_version}" to local ReviewSession v0.1.`,
    );
  }

  assertSupportedCasePackageReference(
    reviewResult.case_package,
    "submit ReviewResult v0.1",
  );
  assertCompatibleCasePackageReference(session.case_package, reviewResult.case_package);
}

function assertSupportedCasePackageReference(
  casePackage: ReviewedCasePackageReferenceV01,
  action: string,
) {
  if (!casePackage) {
    throw new Error(
      `Cannot ${action} without CasePackage reference metadata.`,
    );
  }

  requireMetadataString(casePackage.schema_version, "CasePackage schema version", action);
  requireMetadataString(casePackage.package_id, "CasePackage ID", action);
  requireMetadataString(casePackage.case_id, "CasePackage case ID", action);
  requireMetadataString(casePackage.cluster_id, "CasePackage cluster ID", action);

  if (casePackage.schema_version !== CASE_PACKAGE_V01_SCHEMA_VERSION) {
    throw new Error(
      `Cannot ${action} with unsupported CasePackage schema version "${casePackage.schema_version}".`,
    );
  }

  if (!casePackage.pipeline) {
    throw new Error(
      `Cannot ${action} without pipeline reference metadata.`,
    );
  }

  requireMetadataString(casePackage.pipeline.run_id, "pipeline run ID", action);
  requireMetadataString(
    casePackage.pipeline.upstream_tool,
    "upstream pipeline tool",
    action,
  );
  requireMetadataString(
    casePackage.pipeline.generated_at,
    "pipeline generation timestamp",
    action,
  );
}

function assertSupportedReviewer(
  reviewer: ReviewResultReviewerV01,
  action: string,
) {
  requireMetadataString(reviewer.reviewer_id, "reviewer ID", action);
  requireMetadataString(reviewer.review_session_id, "review session ID", action);

  assertSupportedReviewerContextV01(reviewer.context, action);
}

function assertCompatibleCasePackageReference(
  expected: ReviewedCasePackageReferenceV01,
  received: ReviewedCasePackageReferenceV01,
) {
  const mismatchedField = CASE_PACKAGE_REFERENCE_FIELDS.find(
    (field) => expected[field] !== received[field],
  );

  if (mismatchedField) {
    throw new Error(
      `Cannot submit ReviewResult v0.1 for incompatible CasePackage reference: field "${mismatchedField}" differs.`,
    );
  }

  const mismatchedPipelineField = PIPELINE_REFERENCE_FIELDS.find(
    (field) => expected.pipeline[field] !== received.pipeline[field],
  );

  if (mismatchedPipelineField) {
    throw new Error(
      `Cannot submit ReviewResult v0.1 for incompatible CasePackage reference: pipeline field "${mismatchedPipelineField}" differs.`,
    );
  }
}

function assertReviewerSessionIsRegistered(
  session: LocalReviewSessionV01,
  reviewer: ReviewResultReviewerV01,
  action: string,
) {
  assertSupportedReviewer(reviewer, action);

  if (
    !session.reviewer_sessions.some((registeredReviewer) =>
      hasSameReviewerSession(registeredReviewer, reviewer),
    )
  ) {
    throw new Error(
      `Cannot ${action} unregistered reviewer/session "${reviewer.reviewer_id}" / "${reviewer.review_session_id}" in local ReviewSession v0.1.`,
    );
  }
}

function hasSameReviewerSession(
  left: ReviewResultReviewerV01,
  right: ReviewResultReviewerV01,
) {
  return (
    left.reviewer_id === right.reviewer_id &&
    left.review_session_id === right.review_session_id
  );
}

function requireMetadataString(
  value: string | undefined,
  label: string,
  action: string,
) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Cannot ${action} without ${label}.`);
  }
}
