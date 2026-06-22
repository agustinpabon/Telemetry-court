import assert from "node:assert/strict";
import test from "node:test";

import { sampleCases } from "@/data/sampleCases";
import {
  buildReviewResultExport,
  type EvidenceArenaReview,
} from "@/lib/exportReview";
import {
  createReviewResultBundleV01,
  getReviewResultBundleFilename,
  importReviewResultBundleV01Json,
  importReviewResultBundleToLocalStoreV01,
  REVIEW_RESULT_BUNDLE_V01_SCHEMA_VERSION,
  serializeReviewResultBundleV01,
  type ReviewResultBundleV01,
} from "@/lib/reviewResultBundleV01";
import {
  loadReviewResultsForCasePackageV01,
  saveReviewResultToLocalStoreV01,
} from "@/lib/reviewResultStorageV01";
import type { ReviewResultV01 } from "@/lib/reviewResultV01";
import type { CaseFile } from "@/lib/types";

test("ReviewResult bundle v0.1 exports a versioned portable envelope", () => {
  const review = buildReviewResult(sampleCases[0], {
    reviewer_id: "reviewer-a",
    review_session_id: "session-a",
    context: "local_review",
  });

  const bundle = createReviewResultBundleV01({
    reviewResults: [review],
    bundleId: "bundle-local-001",
    createdAt: "2026-06-21T16:00:00.000Z",
  });

  assert.deepEqual(bundle, {
    schema_version: REVIEW_RESULT_BUNDLE_V01_SCHEMA_VERSION,
    metadata: {
      bundle_id: "bundle-local-001",
      created_at: "2026-06-21T16:00:00.000Z",
      source_application: "telemetry_court",
      format: "local_json",
      review_result_count: 1,
    },
    compatibility: {
      review_result_schema_version: "review_result.v0.1",
      review_protocol_version: "telemetry_court_review.v0.1",
      case_package_schema_version: "case_package.v0.1",
    },
    review_results: [review],
  });
  assert.equal(
    serializeReviewResultBundleV01(bundle),
    `${JSON.stringify(bundle, null, 2)}\n`,
  );
  assert.equal(
    getReviewResultBundleFilename(bundle),
    "telemetry-court-review-results-2026-06-21.json",
  );
});

test("ReviewResult bundle v0.1 imports valid local JSON", () => {
  const review = buildReviewResult(sampleCases[0], {
    reviewer_id: "reviewer-a",
    review_session_id: "session-a",
    context: "local_review",
  });
  const bundle = createReviewResultBundleV01({
    reviewResults: [review],
    bundleId: "bundle-local-001",
    createdAt: "2026-06-21T16:00:00.000Z",
  });

  const result = importReviewResultBundleV01Json(
    serializeReviewResultBundleV01(bundle),
  );

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.bundle, bundle);
  }
});

test("ReviewResult bundle v0.1 rejects malformed JSON", () => {
  assert.deepEqual(importReviewResultBundleV01Json('{"schema_version":'), {
    ok: false,
    reason: "malformed_json",
    message: "ReviewResult bundle JSON is malformed and could not be parsed.",
  });
});

test("ReviewResult bundle v0.1 rejects unsupported bundle schemas", () => {
  const result = importReviewResultBundleV01Json(
    JSON.stringify({
      schema_version: "review_result_bundle.v9",
      metadata: {},
      compatibility: {},
      review_results: [],
    }),
  );

  assert.deepEqual(result, {
    ok: false,
    reason: "unsupported_schema",
    message:
      'Unsupported ReviewResult bundle schema version "review_result_bundle.v9".',
  });
});

test("ReviewResult bundle v0.1 rejects out-of-contract bundle fields", () => {
  const review = buildReviewResult(sampleCases[0], {
    reviewer_id: "reviewer-a",
    review_session_id: "session-a",
    context: "local_review",
  });
  const bundle = createReviewResultBundleV01({
    reviewResults: [review],
    bundleId: "bundle-local-001",
    createdAt: "2026-06-21T16:00:00.000Z",
  });

  const result = importReviewResultBundleV01Json(
    JSON.stringify({ ...bundle, raw_evidence: ["must-not-be-imported"] }),
  );

  assert.deepEqual(result, {
    ok: false,
    reason: "invalid_bundle",
    message: 'ReviewResult bundle contains unsupported field "raw_evidence" at $.raw_evidence.',
  });
});

test("ReviewResult bundle v0.1 rejects invalid bundle timestamps", () => {
  const review = buildReviewResult(sampleCases[0], {
    reviewer_id: "reviewer-a",
    review_session_id: "session-a",
    context: "local_review",
  });
  const bundle = createReviewResultBundleV01({
    reviewResults: [review],
    bundleId: "bundle-local-001",
    createdAt: "2026-06-21T16:00:00.000Z",
  });

  const result = importReviewResultBundleV01Json(
    JSON.stringify({
      ...bundle,
      metadata: { ...bundle.metadata, created_at: "not-a-timestamp" },
    }),
  );

  assert.deepEqual(result, {
    ok: false,
    reason: "invalid_bundle",
    message: "ReviewResult bundle creation timestamp must be a valid ISO timestamp.",
  });
});

test("ReviewResult bundle v0.1 rejects structurally invalid ReviewResults", () => {
  const review = buildReviewResult(sampleCases[0], {
    reviewer_id: "reviewer-a",
    review_session_id: "session-a",
    context: "local_review",
  });
  const bundle = createReviewResultBundleV01({
    reviewResults: [review],
    bundleId: "bundle-local-001",
    createdAt: "2026-06-21T16:00:00.000Z",
  });
  const invalidBundle = {
    ...bundle,
    review_results: [
      {
        ...review,
        decisions: {
          ...review.decisions,
          final_verdict: "invented_verdict",
        },
      },
    ],
  };

  const result = importReviewResultBundleV01Json(JSON.stringify(invalidBundle));

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.reason, "invalid_review_result");
    assert.match(result.message, /review_results\[0\]\.decisions\.final_verdict/);
    assert.match(result.message, /unsupported value/);
  }
});

test("ReviewResult bundle v0.1 rejects out-of-contract ReviewResult fields", () => {
  const review = buildReviewResult(sampleCases[0], {
    reviewer_id: "reviewer-a",
    review_session_id: "session-a",
    context: "local_review",
  });
  const bundle = createReviewResultBundleV01({
    reviewResults: [review],
    bundleId: "bundle-local-001",
    createdAt: "2026-06-21T16:00:00.000Z",
  });
  const invalidBundle = {
    ...bundle,
    review_results: [
      {
        ...review,
        raw_telemetry: [{ event: "must-not-be-imported" }],
      },
    ],
  };

  const result = importReviewResultBundleV01Json(JSON.stringify(invalidBundle));

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.reason, "invalid_review_result");
    assert.match(result.message, /review_results\[0\]\.raw_telemetry/);
    assert.match(result.message, /unsupported field/);
  }
});

test("ReviewResult bundle v0.1 rejects incomplete blind-review protocol state", () => {
  const review = buildReviewResult(sampleCases[0], {
    reviewer_id: "reviewer-a",
    review_session_id: "session-a",
    context: "local_review",
  });
  const bundle = createReviewResultBundleV01({
    reviewResults: [review],
    bundleId: "bundle-local-001",
    createdAt: "2026-06-21T16:00:00.000Z",
  });
  const invalidBundle = {
    ...bundle,
    review_results: [
      {
        ...review,
        protocol: { ...review.protocol, ai_label_revealed: false },
      },
    ],
  };

  const result = importReviewResultBundleV01Json(JSON.stringify(invalidBundle));

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.reason, "invalid_review_result");
    assert.match(result.message, /review_results\[0\]\.protocol\.ai_label_revealed/);
    assert.match(result.message, /must be true for a completed blind review/);
  }
});

test("ReviewResult bundle v0.1 rejects results without evidence decisions", () => {
  const review = buildReviewResult(sampleCases[0], {
    reviewer_id: "reviewer-a",
    review_session_id: "session-a",
    context: "local_review",
  });
  const bundle = createReviewResultBundleV01({
    reviewResults: [review],
    bundleId: "bundle-local-001",
    createdAt: "2026-06-21T16:00:00.000Z",
  });
  const invalidBundle = {
    ...bundle,
    review_results: [
      {
        ...review,
        decisions: { ...review.decisions, evidence_ratings: [] },
      },
    ],
  };

  const result = importReviewResultBundleV01Json(JSON.stringify(invalidBundle));

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.reason, "invalid_review_result");
    assert.match(result.message, /review_results\[0\]\.decisions\.evidence_ratings/);
    assert.match(result.message, /at least one evidence rating/);
  }
});

test("ReviewResult bundle v0.1 rejects inconsistent ReviewResult identity", () => {
  const review = buildReviewResult(sampleCases[0], {
    reviewer_id: "reviewer-a",
    review_session_id: "session-a",
    context: "local_review",
  });
  const bundle = createReviewResultBundleV01({
    reviewResults: [review],
    bundleId: "bundle-local-001",
    createdAt: "2026-06-21T16:00:00.000Z",
  });
  const invalidBundle = {
    ...bundle,
    review_results: [{ ...review, review_id: "review:arbitrary" }],
  };

  const result = importReviewResultBundleV01Json(JSON.stringify(invalidBundle));

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.reason, "invalid_review_result");
    assert.match(result.message, /review_results\[0\]\.review_id/);
    assert.match(result.message, /package, reviewer, session, and timestamp/);
  }
});

test("ReviewResult bundle v0.1 rejects invalid ReviewResult timestamps", () => {
  const review = buildReviewResult(sampleCases[0], {
    reviewer_id: "reviewer-a",
    review_session_id: "session-a",
    context: "local_review",
  });
  const bundle = createReviewResultBundleV01({
    reviewResults: [review],
    bundleId: "bundle-local-001",
    createdAt: "2026-06-21T16:00:00.000Z",
  });
  const createdAt = "not-a-timestamp";
  const invalidReview = {
    ...review,
    created_at: createdAt,
    review_id: [
      "review",
      review.case_package.package_id,
      review.reviewer.reviewer_id,
      review.reviewer.review_session_id,
      createdAt,
    ].join(":"),
  };

  const result = importReviewResultBundleV01Json(
    JSON.stringify({ ...bundle, review_results: [invalidReview] }),
  );

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.reason, "invalid_review_result");
    assert.match(result.message, /review_results\[0\]\.created_at/);
    assert.match(result.message, /valid ISO timestamp/);
  }
});

test("ReviewResult bundle v0.1 rejects duplicate review_result_id values", () => {
  const reviewA = buildReviewResult(sampleCases[0], {
    reviewer_id: "reviewer-a",
    review_session_id: "session-a",
    context: "local_review",
  });

  assert.throws(
    () =>
      createReviewResultBundleV01({
        reviewResults: [reviewA, reviewA],
        bundleId: "bundle-local-duplicates",
        createdAt: "2026-06-21T16:00:00.000Z",
      }),
    /duplicate ReviewResult ID/,
  );
});

test("ReviewResult bundle v0.1 rejects mixed CasePackage IDs", () => {
  const reviewA = buildReviewResult(sampleCases[0], {
    reviewer_id: "reviewer-a",
    review_session_id: "session-a",
    context: "local_review",
  });
  const reviewB = buildReviewResult(sampleCases[1], {
    reviewer_id: "reviewer-b",
    review_session_id: "session-b",
    context: "local_review",
  });

  assert.throws(
    () =>
      createReviewResultBundleV01({
        reviewResults: [reviewA, reviewB],
        bundleId: "bundle-mixed-packages",
        createdAt: "2026-06-21T16:00:00.000Z",
      }),
    /one compatible CasePackage ID/,
  );
});

test("ReviewResult bundle v0.1 rejects incompatible evidence ID sets", () => {
  const reviewA = buildReviewResult(sampleCases[0], {
    reviewer_id: "reviewer-a",
    review_session_id: "session-a",
    context: "local_review",
  });
  const completeReviewB = buildReviewResult(sampleCases[0], {
    reviewer_id: "reviewer-b",
    review_session_id: "session-b",
    context: "local_review",
  });
  const reviewB = {
    ...completeReviewB,
    decisions: {
      ...completeReviewB.decisions,
      evidence_ratings: completeReviewB.decisions.evidence_ratings.slice(1),
    },
  };

  assert.throws(
    () =>
      createReviewResultBundleV01({
        reviewResults: [reviewA, reviewB],
        bundleId: "bundle-incompatible-evidence",
        createdAt: "2026-06-21T16:00:00.000Z",
      }),
    /stable evidence ID set differs/,
  );
});

test("ReviewResult bundle v0.1 rejects incompatible blind-review settings", () => {
  const reviewA = buildReviewResult(sampleCases[0], {
    reviewer_id: "reviewer-a",
    review_session_id: "session-a",
    context: "local_review",
  });
  const completeReviewB = buildReviewResult(sampleCases[0], {
    reviewer_id: "reviewer-b",
    review_session_id: "session-b",
    context: "local_review",
  });
  const reviewB = {
    ...completeReviewB,
    protocol: {
      ...completeReviewB.protocol,
      blind_review_enabled: false,
      ai_label_revealed: false,
    },
  };

  assert.throws(
    () =>
      createReviewResultBundleV01({
        reviewResults: [reviewA, reviewB],
        bundleId: "bundle-incompatible-protocol",
        createdAt: "2026-06-21T16:00:00.000Z",
      }),
    /blind-review setting differs/,
  );
});

test("ReviewResult bundle v0.1 import reports duplicate review_result_id values", () => {
  const review = buildReviewResult(sampleCases[0], {
    reviewer_id: "reviewer-a",
    review_session_id: "session-a",
    context: "local_review",
  });
  const bundle = createReviewResultBundleV01({
    reviewResults: [review],
    bundleId: "bundle-local-duplicates",
    createdAt: "2026-06-21T16:00:00.000Z",
  });
  const duplicateBundle = {
    ...bundle,
    metadata: { ...bundle.metadata, review_result_count: 2 },
    review_results: [review, review],
  };

  const result = importReviewResultBundleV01Json(JSON.stringify(duplicateBundle));

  assert.deepEqual(result, {
    ok: false,
    reason: "duplicate_review_result_id",
    message: `ReviewResult bundle contains duplicate ReviewResult ID "${review.review_id}".`,
  });
});

test("ReviewResult bundle v0.1 import reports mixed CasePackage IDs", () => {
  const reviewA = buildReviewResult(sampleCases[0], {
    reviewer_id: "reviewer-a",
    review_session_id: "session-a",
    context: "local_review",
  });
  const reviewB = buildReviewResult(sampleCases[1], {
    reviewer_id: "reviewer-b",
    review_session_id: "session-b",
    context: "local_review",
  });
  const bundle = createReviewResultBundleV01({
    reviewResults: [reviewA],
    bundleId: "bundle-mixed-packages",
    createdAt: "2026-06-21T16:00:00.000Z",
  });
  const mixedBundle = {
    ...bundle,
    metadata: { ...bundle.metadata, review_result_count: 2 },
    review_results: [reviewA, reviewB],
  };

  const result = importReviewResultBundleV01Json(JSON.stringify(mixedBundle));

  assert.deepEqual(result, {
    ok: false,
    reason: "invalid_bundle",
    message:
      "ReviewResult bundle must contain results for one compatible CasePackage ID.",
  });
});

test("ReviewResult bundle v0.1 appends valid imported results to local storage", () => {
  const storage = createMemoryStorage();
  const reviewA = buildReviewResult(sampleCases[0], {
    reviewer_id: "reviewer-a",
    review_session_id: "session-a",
    context: "local_review",
  });
  const reviewB = buildReviewResult(sampleCases[0], {
    reviewer_id: "reviewer-b",
    review_session_id: "session-b",
    context: "local_review",
  });
  const bundle = createReviewResultBundleV01({
    reviewResults: [reviewB, reviewA],
    bundleId: "bundle-local-two-reviews",
    createdAt: "2026-06-21T16:00:00.000Z",
  });

  const summary = importReviewResultBundleToLocalStoreV01(storage, bundle);

  assert.deepEqual(summary, {
    bundleId: "bundle-local-two-reviews",
    importedReviewCount: 2,
    totalLocalReviewCount: 2,
    casePackageIds: [reviewA.case_package.package_id],
  });
  assert.deepEqual(
    loadReviewResultsForCasePackageV01(
      storage,
      reviewA.case_package.package_id,
    ),
    [reviewA, reviewB],
  );
});

test("ReviewResult bundle local import revalidates its runtime input", () => {
  const storage = createMemoryStorage();
  const review = buildReviewResult(sampleCases[0], {
    reviewer_id: "reviewer-a",
    review_session_id: "session-a",
    context: "local_review",
  });
  const bundle = createReviewResultBundleV01({
    reviewResults: [review],
    bundleId: "bundle-forged-runtime-input",
    createdAt: "2026-06-21T16:00:00.000Z",
  });
  const forgedBundle = {
    ...bundle,
    review_results: [
      {
        ...review,
        decisions: {
          ...review.decisions,
          final_verdict: "invented_verdict",
        },
      },
    ],
  } as unknown as ReviewResultBundleV01;

  assert.throws(
    () => importReviewResultBundleToLocalStoreV01(storage, forgedBundle),
    /Invalid ReviewResult.*final_verdict.*No results were imported/,
  );
  assert.deepEqual(
    loadReviewResultsForCasePackageV01(
      storage,
      review.case_package.package_id,
    ),
    [],
  );
});

test("ReviewResult bundle import rejects existing IDs without a partial write", () => {
  const storage = createMemoryStorage();
  const existingReview = buildReviewResult(sampleCases[0], {
    reviewer_id: "reviewer-a",
    review_session_id: "session-a",
    context: "local_review",
  });
  const newReview = buildReviewResult(sampleCases[0], {
    reviewer_id: "reviewer-b",
    review_session_id: "session-b",
    context: "local_review",
  });
  saveReviewResultToLocalStoreV01(storage, existingReview);
  const bundle = createReviewResultBundleV01({
    reviewResults: [newReview, existingReview],
    bundleId: "bundle-with-existing-review",
    createdAt: "2026-06-21T16:00:00.000Z",
  });

  assert.throws(
    () => importReviewResultBundleToLocalStoreV01(storage, bundle),
    /already exists locally.*No results were imported/,
  );
  assert.deepEqual(
    loadReviewResultsForCasePackageV01(
      storage,
      existingReview.case_package.package_id,
    ),
    [existingReview],
  );
});

test("ReviewResult bundle import preserves exact CasePackage compatibility", () => {
  const storage = createMemoryStorage();
  const existingReview = buildReviewResult(sampleCases[0], {
    reviewer_id: "reviewer-a",
    review_session_id: "session-a",
    context: "local_review",
  });
  const incompatibleReview = {
    ...buildReviewResult(sampleCases[0], {
      reviewer_id: "reviewer-b",
      review_session_id: "session-b",
      context: "local_review",
    }),
    case_package: {
      ...existingReview.case_package,
      package_revision: "incompatible-revision",
    },
  };
  saveReviewResultToLocalStoreV01(storage, existingReview);
  const bundle = createReviewResultBundleV01({
    reviewResults: [incompatibleReview],
    bundleId: "bundle-incompatible-package-reference",
    createdAt: "2026-06-21T16:00:00.000Z",
  });

  assert.throws(
    () => importReviewResultBundleToLocalStoreV01(storage, bundle),
    /incompatible CasePackage reference/,
  );
  assert.deepEqual(
    loadReviewResultsForCasePackageV01(
      storage,
      existingReview.case_package.package_id,
    ),
    [existingReview],
  );
});

test("ReviewResult bundle import rejects evidence-set incompatibility without a partial write", () => {
  const storage = createMemoryStorage();
  const existingReview = buildReviewResult(sampleCases[0], {
    reviewer_id: "reviewer-a",
    review_session_id: "session-a",
    context: "local_review",
  });
  const completeImportedReview = buildReviewResult(sampleCases[0], {
    reviewer_id: "reviewer-b",
    review_session_id: "session-b",
    context: "local_review",
  });
  const importedReview = {
    ...completeImportedReview,
    decisions: {
      ...completeImportedReview.decisions,
      evidence_ratings: completeImportedReview.decisions.evidence_ratings.slice(1),
    },
  };
  saveReviewResultToLocalStoreV01(storage, existingReview);
  const bundle = createReviewResultBundleV01({
    reviewResults: [importedReview],
    bundleId: "bundle-incompatible-evidence-set",
    createdAt: "2026-06-21T16:00:00.000Z",
  });

  assert.throws(
    () => importReviewResultBundleToLocalStoreV01(storage, bundle),
    /stable evidence ID set differs.*No results were imported/,
  );
  assert.deepEqual(
    loadReviewResultsForCasePackageV01(
      storage,
      existingReview.case_package.package_id,
    ),
    [existingReview],
  );
});

function buildReviewResult(
  caseFile: CaseFile,
  reviewer: ReviewResultV01["reviewer"],
): ReviewResultV01 {
  return buildReviewResultExport({
    caseFile,
    exportTimestamp: "2026-06-21T15:00:00.000Z",
    arenaReview: completeArenaReview(caseFile),
    reviewer,
  });
}

function completeArenaReview(caseFile: CaseFile): EvidenceArenaReview {
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
