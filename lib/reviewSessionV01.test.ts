import assert from "node:assert/strict";
import test from "node:test";

import { sampleCases } from "@/data/sampleCases";
import { aggregateReviewResultsV01 } from "@/lib/evaluationReportV01";
import {
  buildReviewResultExport,
  type EvidenceArenaReview,
} from "@/lib/exportReview";
import {
  addReviewerToLocalReviewSessionV01,
  createLocalReviewSessionV01,
  getReviewStateForLocalReviewSessionV01,
  submitReviewResultToLocalReviewSessionV01,
  updateReviewStateForLocalReviewSessionV01,
} from "@/lib/reviewSessionV01";
import type { ReviewResultV01 } from "@/lib/reviewResultV01";
import type { CaseFile } from "@/lib/types";

const reviewerA = {
  reviewer_id: "reviewer-a",
  review_session_id: "session-a",
  context: "local_review",
} satisfies ReviewResultV01["reviewer"];

const reviewerB = {
  reviewer_id: "reviewer-b",
  review_session_id: "session-b",
  context: "local_review",
} satisfies ReviewResultV01["reviewer"];

test("local review sessions collect two independent reviews for one CasePackage", () => {
  const caseFile = sampleCases[0];
  assert.ok(caseFile);

  const firstEvidenceId = caseFile.evidenceItems[0]?.id;
  const secondLabelId = caseFile.candidateLabels[1]?.id;
  const secondBlindChoiceId = caseFile.blindInterpretationOptions[1]?.id;
  assert.ok(firstEvidenceId);
  assert.ok(secondLabelId);
  assert.ok(secondBlindChoiceId);

  const reviewA = buildReviewResult(caseFile, reviewerA, {
    finalVerdict: "supported",
    evidenceRatings: {
      ...caseFile.defaultEvidenceRatings,
      [firstEvidenceId]: "supports_label",
    },
  });
  const reviewB = buildReviewResult(caseFile, reviewerB, {
    blindChoiceId: secondBlindChoiceId,
    finalVerdict: "unsupported_overclaimed",
    labelDuelWinnerId: secondLabelId,
    evidenceRatings: {
      ...caseFile.defaultEvidenceRatings,
      [firstEvidenceId]: "contradicts_label",
    },
  });

  assert.notEqual(reviewA.review_id, reviewB.review_id);

  let session = createLocalReviewSessionV01(reviewA.case_package);
  session = addReviewerToLocalReviewSessionV01(session, reviewerA);
  session = addReviewerToLocalReviewSessionV01(session, reviewerB);
  session = updateReviewStateForLocalReviewSessionV01(session, reviewerA, {
    blindChoiceId: reviewA.decisions.blind_interpretation.option_id,
    aiLabelRevealed: false,
  });
  session = updateReviewStateForLocalReviewSessionV01(session, reviewerB, {
    blindChoiceId: reviewB.decisions.blind_interpretation.option_id,
    aiLabelRevealed: true,
  });

  assert.deepEqual(getReviewStateForLocalReviewSessionV01(session, reviewerA), {
    blindChoiceId: reviewA.decisions.blind_interpretation.option_id,
    aiLabelRevealed: false,
  });
  assert.deepEqual(getReviewStateForLocalReviewSessionV01(session, reviewerB), {
    blindChoiceId: reviewB.decisions.blind_interpretation.option_id,
    aiLabelRevealed: true,
  });

  session = submitReviewResultToLocalReviewSessionV01(session, reviewA);
  session = submitReviewResultToLocalReviewSessionV01(session, reviewB);

  assert.deepEqual(
    session.reviewer_sessions.map((reviewer) => reviewer.review_session_id),
    ["session-a", "session-b"],
  );
  assert.deepEqual(
    session.review_results.map((review) => review.decisions.final_verdict),
    ["supported", "unsupported_or_overclaimed"],
  );
  assert.deepEqual(
    session.review_results.map(
      (review) => review.decisions.label_comparison.selected_label_id,
    ),
    [
      reviewA.decisions.label_comparison.selected_label_id,
      reviewB.decisions.label_comparison.selected_label_id,
    ],
  );

  const report = aggregateReviewResultsV01(session.review_results);

  assert.equal(report.reviewer_count, 2);
  assert.equal(report.disagreement.has_any_disagreement, true);
  assert.equal(report.disagreement.verdict, true);
  assert.equal(report.disagreement.label_winner, true);
  assert.deepEqual(
    report.source_review_ids,
    [reviewA.review_id, reviewB.review_id].sort(),
  );
});

test("local review sessions reject duplicate reviewer-session submissions", () => {
  const caseFile = sampleCases[0];
  assert.ok(caseFile);

  const review = buildReviewResult(caseFile, reviewerA);
  const duplicateReviewerSessionReview = {
    ...buildReviewResult(caseFile, reviewerA, {
      finalVerdict: "unsupported_overclaimed",
    }),
    review_id: "review:different-id",
  };

  const session = submitReviewResultToLocalReviewSessionV01(
    createLocalReviewSessionV01(review.case_package),
    review,
  );

  assert.throws(
    () => submitReviewResultToLocalReviewSessionV01(session, review),
    /duplicate ReviewResult ID/,
  );
  assert.throws(
    () =>
      submitReviewResultToLocalReviewSessionV01(
        session,
        duplicateReviewerSessionReview,
      ),
    /duplicate reviewer\/session submission/,
  );
});

test("local review sessions reject incompatible review submissions", () => {
  const caseFile = sampleCases[0];
  assert.ok(caseFile);

  const review = buildReviewResult(caseFile, reviewerA);
  const incompatibleReview: ReviewResultV01 = {
    ...buildReviewResult(caseFile, reviewerB),
    case_package: {
      ...review.case_package,
      package_id: "pkg-incompatible",
    },
  };

  const session = createLocalReviewSessionV01(review.case_package);

  assert.throws(
    () => submitReviewResultToLocalReviewSessionV01(session, incompatibleReview),
    /incompatible CasePackage/,
  );
});

test("local review sessions reject incompatible schema, revision, pipeline, and protocol metadata", () => {
  const caseFile = sampleCases[0];
  assert.ok(caseFile);

  const review = buildReviewResult(caseFile, reviewerA);
  const session = createLocalReviewSessionV01(review.case_package);
  const incompatibleSubmissions: Array<{
    name: string;
    reviewResult: ReviewResultV01;
    expectedError: RegExp;
  }> = [
    {
      name: "review schema",
      reviewResult: {
        ...review,
        schema_version: "review_result.v9",
      } as unknown as ReviewResultV01,
      expectedError: /unsupported ReviewResult schema version/,
    },
    {
      name: "package schema",
      reviewResult: {
        ...review,
        case_package: {
          ...review.case_package,
          schema_version: "case_package.v9",
        },
      } as unknown as ReviewResultV01,
      expectedError: /unsupported CasePackage schema version/,
    },
    {
      name: "package revision",
      reviewResult: {
        ...review,
        case_package: {
          ...review.case_package,
          package_revision: "r-incompatible",
        },
      },
      expectedError: /field "package_revision" differs/,
    },
    {
      name: "pipeline reference",
      reviewResult: {
        ...review,
        case_package: {
          ...review.case_package,
          pipeline: {
            ...review.case_package.pipeline,
            run_id: "run-incompatible",
          },
        },
      },
      expectedError: /pipeline field "run_id" differs/,
    },
    {
      name: "review protocol",
      reviewResult: {
        ...review,
        protocol: {
          ...review.protocol,
          protocol_version: "telemetry_court_review.v9",
        },
      } as unknown as ReviewResultV01,
      expectedError: /unsupported review protocol version/,
    },
  ];

  for (const { name, reviewResult, expectedError } of incompatibleSubmissions) {
    assert.throws(
      () => submitReviewResultToLocalReviewSessionV01(session, reviewResult),
      expectedError,
      name,
    );
  }
});

function buildReviewResult(
  caseFile: CaseFile,
  reviewer: ReviewResultV01["reviewer"],
  overrides: Partial<EvidenceArenaReview> = {},
): ReviewResultV01 {
  return buildReviewResultExport({
    caseFile,
    exportTimestamp: "2026-06-21T15:00:00.000Z",
    arenaReview: completeArenaReview(caseFile, overrides),
    reviewer,
  });
}

function completeArenaReview(
  caseFile: CaseFile,
  overrides: Partial<EvidenceArenaReview> = {},
): EvidenceArenaReview {
  const blindChoice = caseFile.blindInterpretationOptions[0];
  const labelWinner = caseFile.candidateLabels[0];
  const impostor = caseFile.representativeSessions[0];
  assert.ok(blindChoice);
  assert.ok(labelWinner);
  assert.ok(impostor);

  return {
    blindChoiceId: blindChoice.id,
    blindChoiceLabel: blindChoice.label,
    aiLabel: caseFile.topicLabel.name,
    aiLabelRevealed: true,
    blindChoiceAgreesWithAi: false,
    labelDuelWinnerId: labelWinner.id,
    labelDuelWinnerLabel: labelWinner.label,
    duelReasons: [],
    evidenceRatings: { ...caseFile.defaultEvidenceRatings },
    impostorSessionId: impostor.id,
    impostorSessionTitle: impostor.title,
    failureModes: [],
    finalVerdict: "supported",
    ...overrides,
  };
}
