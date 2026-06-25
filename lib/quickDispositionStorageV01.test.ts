import assert from "node:assert/strict";
import test from "node:test";

import { sampleCases } from "@/data/sampleCases";
import { buildQuickDispositionExportV01 } from "@/lib/quickDispositionV01";
import {
  loadQuickDispositionsForCasePackageV01,
  QUICK_DISPOSITION_LOCAL_STORE_V01_KEY,
  readQuickDispositionLocalStoreV01,
  saveQuickDispositionToLocalStoreV01,
} from "@/lib/quickDispositionStorageV01";
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

test("quick disposition storage keeps artifacts separate from full ReviewResults", () => {
  const storage = createMemoryStorage();
  const caseFile = sampleCases[0];
  const reviewResult = buildReviewResult(caseFile);
  const quickDisposition = buildQuickDispositionExportV01({
    caseFile,
    exportTimestamp: "2026-06-24T12:00:00.000Z",
    sourceStage: "case_file",
    disposition: "cannot_judge_from_package",
    reasonCodes: ["insufficient_package_context"],
  });

  saveReviewResultToLocalStoreV01(storage, reviewResult);
  saveQuickDispositionToLocalStoreV01(storage, quickDisposition);

  const loadedReviews = loadReviewResultsForCasePackageV01(
    storage,
    reviewResult.case_package.package_id,
  );
  const loadedDispositions = loadQuickDispositionsForCasePackageV01(
    storage,
    quickDisposition.case_package.package_id,
  );
  const reviewStoreJson = storage.getItem(REVIEW_RESULT_LOCAL_STORE_V01_KEY) ?? "";
  const quickStoreJson =
    storage.getItem(QUICK_DISPOSITION_LOCAL_STORE_V01_KEY) ?? "";

  assert.deepEqual(loadedReviews, [reviewResult]);
  assert.deepEqual(loadedDispositions, [quickDisposition]);
  assert.equal(reviewStoreJson.includes("quick_disposition.v0.1"), false);
  assert.equal(quickStoreJson.includes("review_result.v0.1"), false);
  assert.match(quickStoreJson, /quick_disposition\.v0\.1/);
  assert.doesNotMatch(
    quickStoreJson,
    /evidence_ratings|label_comparison|outlier_impostor|final_verdict|recommended_action/,
  );
});

test("quick disposition storage validates package IDs on load", () => {
  const storage = createMemoryStorage();
  const caseFile = sampleCases[0];
  const quickDisposition = buildQuickDispositionExportV01({
    caseFile,
    exportTimestamp: "2026-06-24T12:00:00.000Z",
    sourceStage: "case_file",
    disposition: "save_for_later",
    reasonCodes: ["needs_later_review"],
  });

  storage.setItem(
    QUICK_DISPOSITION_LOCAL_STORE_V01_KEY,
    JSON.stringify({
      schema_version: "quick_disposition_local_store.v0.1",
      quick_dispositions_by_case_package_id: {
        "pkg-mismatch": [quickDisposition],
      },
    }),
  );

  assert.throws(
    () => readQuickDispositionLocalStoreV01(storage),
    /belongs to a different CasePackage ID/,
  );
});

function buildReviewResult(caseFile: CaseFile): ReviewResultV01 {
  return buildReviewResultExport({
    caseFile,
    exportTimestamp: "2026-06-21T15:00:00.000Z",
    arenaReview: completeArenaReview(caseFile),
    reviewer: {
      reviewer_id: "reviewer-a",
      review_session_id: "session-a",
      context: "local_review",
    },
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
