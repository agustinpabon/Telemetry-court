import assert from "node:assert/strict";
import test from "node:test";

import { sampleCases } from "@/data/sampleCases";
import {
  buildReviewResultExport,
  type EvidenceArenaReview,
} from "@/lib/exportReview";
import {
  loadReviewResultsForCasePackageV01,
  REVIEW_RESULT_LOCAL_STORE_V01_KEY,
  saveReviewResultToLocalStoreV01,
} from "@/lib/reviewResultStorageV01";
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

test("local ReviewResult storage saves and loads results by CasePackage ID", () => {
  const storage = createMemoryStorage();
  const caseFile = sampleCases[0];
  const review = buildReviewResult(caseFile, reviewerA);

  saveReviewResultToLocalStoreV01(storage, review);

  const loadedReviews = loadReviewResultsForCasePackageV01(
    storage,
    review.case_package.package_id,
  );
  const serializedStore =
    storage.getItem(REVIEW_RESULT_LOCAL_STORE_V01_KEY) ?? "";

  assert.deepEqual(loadedReviews, [review]);
  assert.equal(loadedReviews[0].schema_version, "review_result.v0.1");
  assert.equal(
    loadedReviews[0].protocol.protocol_version,
    "telemetry_court_review.v0.1",
  );
  assert.equal(loadedReviews[0].created_at, "2026-06-21T15:00:00.000Z");
  assert.deepEqual(loadedReviews[0].reviewer, reviewerA);
  assert.deepEqual(loadedReviews[0].case_package, review.case_package);
  assert.equal(serializedStore.includes(caseFile.claims[0].text), false);
  assert.equal(
    serializedStore.includes(caseFile.evidenceItems[0].summary),
    false,
  );
  assert.doesNotMatch(serializedStore, /rawReference|evidenceItems|claims/);
});

test("saving a newer result for the same reviewer session replaces the local copy", () => {
  const storage = createMemoryStorage();
  const caseFile = sampleCases[0];
  const firstReview = buildReviewResult(caseFile, reviewerA, {
    exportTimestamp: "2026-06-21T15:00:00.000Z",
    finalVerdict: "supported",
  });
  const updatedReview = buildReviewResult(caseFile, reviewerA, {
    exportTimestamp: "2026-06-21T15:05:00.000Z",
    finalVerdict: "unsupported_overclaimed",
  });

  saveReviewResultToLocalStoreV01(storage, firstReview);
  saveReviewResultToLocalStoreV01(storage, updatedReview);

  const loadedReviews = loadReviewResultsForCasePackageV01(
    storage,
    firstReview.case_package.package_id,
  );

  assert.deepEqual(loadedReviews, [updatedReview]);
  assert.equal(
    loadedReviews[0].decisions.final_verdict,
    "unsupported_or_overclaimed",
  );
});

test("local ReviewResult storage rejects unsupported or incompatible artifacts", () => {
  const storage = createMemoryStorage();
  const caseFile = sampleCases[0];
  const review = buildReviewResult(caseFile, reviewerA);

  assert.throws(
    () =>
      saveReviewResultToLocalStoreV01(storage, {
        ...review,
        schema_version: "review_result.v9",
      } as unknown as ReviewResultV01),
    /unsupported ReviewResult schema version/,
  );
  assert.throws(
    () =>
      saveReviewResultToLocalStoreV01(storage, {
        ...review,
        protocol: {
          ...review.protocol,
          protocol_version: "telemetry_court_review.v9",
        },
      } as unknown as ReviewResultV01),
    /unsupported review protocol version/,
  );

  saveReviewResultToLocalStoreV01(storage, review);

  assert.throws(
    () =>
      saveReviewResultToLocalStoreV01(storage, {
        ...buildReviewResult(caseFile, reviewerB),
        case_package: {
          ...review.case_package,
          package_revision: "r-incompatible",
        },
      }),
    /incompatible CasePackage reference/,
  );
});

function buildReviewResult(
  caseFile: CaseFile,
  reviewer: ReviewResultV01["reviewer"],
  overrides: Partial<EvidenceArenaReview> & { exportTimestamp?: string } = {},
): ReviewResultV01 {
  const { exportTimestamp = "2026-06-21T15:00:00.000Z", ...reviewOverrides } =
    overrides;

  return buildReviewResultExport({
    caseFile,
    exportTimestamp,
    arenaReview: completeArenaReview(caseFile, reviewOverrides),
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

function createMemoryStorage() {
  const values = new Map<string, string>();

  return {
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
  };
}
