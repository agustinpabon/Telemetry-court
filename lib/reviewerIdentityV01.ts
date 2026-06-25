export type ReviewerIdentityV01 = {
  reviewer_id: string;
  review_session_id: string;
  context: "synthetic_demo" | "local_review";
};

export function createLocalDemoReviewerV01(
  packageId: string,
  caseId: string,
): ReviewerIdentityV01 {
  return {
    reviewer_id: "local-demo-reviewer",
    review_session_id: `${packageId}:${caseId}:local-session`,
    context: "synthetic_demo",
  };
}

export function assertCompleteReviewerIdentityV01(
  reviewer: ReviewerIdentityV01,
  artifactLabel: string,
) {
  requireValue(reviewer.reviewer_id, "reviewer ID", artifactLabel);
  requireValue(reviewer.review_session_id, "review session ID", artifactLabel);

  if (reviewer.context !== "synthetic_demo" && reviewer.context !== "local_review") {
    throw new Error(
      `Cannot export ${artifactLabel} with unsupported reviewer context "${reviewer.context}".`,
    );
  }
}

function requireValue(value: string | undefined, label: string, artifactLabel: string) {
  if (value === undefined || value === "") {
    throw new Error(`Cannot export ${artifactLabel} without ${label}.`);
  }
}
