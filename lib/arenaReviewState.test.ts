import assert from "node:assert/strict";
import test from "node:test";

import { sampleCases } from "@/data/sampleCases";
import {
  arenaReducer,
  buildArenaReview,
  createInitialArenaState,
  getCurrentReviewState,
  getEvidenceBalance,
  getEvidenceRatings,
  getReviewCompletion,
  getSelectedCase,
  getStageCompletionMap,
} from "@/lib/arenaReviewState";
import {
  buildReviewResultExport,
  serializeReviewResultExport,
} from "@/lib/exportReview";

test("arena reducer drives the staged structured-choice happy path", () => {
  const targetCase = sampleCases[1];
  assert.ok(targetCase);

  let arenaState = createInitialArenaState(sampleCases);

  arenaState = arenaReducer(
    arenaState,
    { type: "selectCase", caseId: targetCase.id },
    sampleCases,
  );

  assert.equal(getSelectedCase(sampleCases, arenaState)?.id, targetCase.id);
  assert.equal(arenaState.activeStage, "landscape");

  arenaState = arenaReducer(arenaState, { type: "startInvestigation" }, sampleCases);
  assert.equal(arenaState.activeStage, "blind_read");

  const blindChoice = targetCase.blindInterpretationOptions[0];
  assert.ok(blindChoice);

  arenaState = arenaReducer(
    arenaState,
    { type: "chooseBlindInterpretation", optionId: blindChoice.id },
    sampleCases,
  );
  assert.equal(getCurrentReviewState(arenaState).blindChoiceId, blindChoice.id);

  arenaState = arenaReducer(arenaState, { type: "revealAiLabel" }, sampleCases);
  assert.equal(arenaState.activeStage, "ai_reveal");
  assert.equal(getCurrentReviewState(arenaState).aiLabelRevealed, true);

  const evidence = targetCase.evidenceItems[0];
  assert.ok(evidence);

  arenaState = arenaReducer(
    arenaState,
    {
      type: "classifyEvidence",
      evidenceId: evidence.id,
      rating: "contradicts_label",
    },
    sampleCases,
  );

  let reviewState = getCurrentReviewState(arenaState);
  let evidenceRatings = getEvidenceRatings(targetCase, reviewState);
  let balance = getEvidenceBalance(targetCase, evidenceRatings);

  assert.equal(evidenceRatings[evidence.id], "contradicts_label");
  assert.equal(balance.contradictory, 1);

  for (const remainingEvidence of targetCase.evidenceItems.slice(1)) {
    arenaState = arenaReducer(
      arenaState,
      {
        type: "classifyEvidence",
        evidenceId: remainingEvidence.id,
        rating: "supports_label",
      },
      sampleCases,
    );
  }

  const candidate = targetCase.candidateLabels[0];
  assert.ok(candidate);

  arenaState = arenaReducer(
    arenaState,
    { type: "selectLabelDuelWinner", candidateId: candidate.id },
    sampleCases,
  );
  arenaState = arenaReducer(
    arenaState,
    { type: "toggleDuelReason", reason: "better_supported" },
    sampleCases,
  );

  const impostor = targetCase.representativeSessions[0];
  assert.ok(impostor);

  arenaState = arenaReducer(
    arenaState,
    { type: "selectImpostorSession", sessionId: impostor.id },
    sampleCases,
  );
  arenaState = arenaReducer(
    arenaState,
    { type: "selectVerdict", verdict: "partially_supported" },
    sampleCases,
  );
  arenaState = arenaReducer(
    arenaState,
    { type: "toggleFailureMode", reason: "less_overclaimed" },
    sampleCases,
  );
  arenaState = arenaReducer(
    arenaState,
    { type: "setReviewDrawerOpen", open: true },
    sampleCases,
  );

  reviewState = getCurrentReviewState(arenaState);
  evidenceRatings = getEvidenceRatings(targetCase, reviewState);
  balance = getEvidenceBalance(targetCase, evidenceRatings);

  assert.equal(reviewState.labelDuelWinnerId, candidate.id);
  assert.deepEqual(reviewState.duelReasons, ["better_supported"]);
  assert.equal(reviewState.impostorSessionId, impostor.id);
  assert.equal(reviewState.finalVerdict, "partially_supported");
  assert.deepEqual(reviewState.failureModes, ["less_overclaimed"]);
  assert.equal(arenaState.reviewDrawerOpen, true);
  assert.equal(getReviewCompletion(reviewState, evidenceRatings, targetCase), 6);

  const arenaReview = buildArenaReview(targetCase, reviewState, evidenceRatings);
  const exportJson = serializeReviewResultExport(
    buildReviewResultExport({
      caseFile: targetCase,
      exportTimestamp: "2026-06-13T00:00:00.000Z",
      arenaReview,
    }),
  );

  assert.equal(arenaReview.blindChoiceId, blindChoice.id);
  assert.equal(arenaReview.aiLabel, targetCase.topicLabel.name);
  assert.equal(arenaReview.labelDuelWinnerId, candidate.id);
  assert.equal(arenaReview.impostorSessionId, impostor.id);
  assert.equal(arenaReview.finalVerdict, "partially_supported");
  assert.equal(balance.total, targetCase.evidenceItems.length);
  assert.match(exportJson, /"arenaReview"/);
  assert.match(exportJson, /"partially_supported"/);
});

test("default evidence suggestions count as classified evidence", () => {
  const targetCase = sampleCases[0];
  assert.ok(targetCase);

  const reviewState = {
    blindChoiceId: "cloud-resource-discovery",
    aiLabelRevealed: true,
  };
  const evidenceRatings = getEvidenceRatings(targetCase, reviewState);
  const completionMap = getStageCompletionMap(
    targetCase,
    reviewState,
    evidenceRatings,
  );

  assert.equal(Object.hasOwn(reviewState, "evidenceRatings"), false);
  assert.equal(
    targetCase.evidenceItems.every((evidence) => evidenceRatings[evidence.id]),
    true,
  );
  assert.equal(getReviewCompletion(reviewState, evidenceRatings, targetCase), 3);
  assert.equal(completionMap.evidence_board, true);
});

test("arena reducer hydrates persisted review state without changing the requested stage", () => {
  const targetCase = sampleCases[0];
  assert.ok(targetCase);

  const reviewState = {
    blindChoiceId: "cloud-resource-discovery",
    aiLabelRevealed: true,
  };
  const arenaState = arenaReducer(
    createInitialArenaState(sampleCases, "evidence_board"),
    {
      type: "hydrateSession",
      selectedCaseId: targetCase.id,
      reviewsByCase: {
        [targetCase.id]: reviewState,
      },
    },
    sampleCases,
  );

  assert.equal(arenaState.activeStage, "evidence_board");
  assert.equal(arenaState.selectedCaseId, targetCase.id);
  assert.deepEqual(getCurrentReviewState(arenaState), reviewState);
});
