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
  arenaState = arenaReducer(
    arenaState,
    { type: "setDuelNote", note: "Best supported by observed behavior." },
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
  assert.equal(reviewState.duelNote, "Best supported by observed behavior.");
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
  assert.equal(arenaReview.duelNote, "Best supported by observed behavior.");
  assert.equal(arenaReview.impostorSessionId, impostor.id);
  assert.equal(arenaReview.finalVerdict, "partially_supported");
  assert.equal(balance.total, targetCase.evidenceItems.length);
  assert.match(exportJson, /"schema_version": "review_result\.v0\.1"/);
  assert.match(exportJson, /"decisions"/);
  assert.match(exportJson, /"rationale": "Best supported by observed behavior\."/);
  assert.match(exportJson, /"partially_supported"/);
});

test("cannot-judge checkpoint records insufficient context and exports existing v0.1 values", () => {
  const targetCase = sampleCases[0];
  assert.ok(targetCase);

  let arenaState = createInitialArenaState(sampleCases);
  arenaState = arenaReducer(
    arenaState,
    { type: "chooseReviewReadiness", choice: "need_context" },
    sampleCases,
  );

  let reviewState = getCurrentReviewState(arenaState);
  assert.equal(reviewState.reviewReadiness, "need_context");
  assert.equal(reviewState.blindChoiceId, "not-enough-evidence");
  assert.deepEqual(
    reviewState.evidenceRatings,
    Object.fromEntries(
      targetCase.evidenceItems.map((evidence) => [
        evidence.id,
        "needs_context",
      ]),
    ),
  );

  arenaState = arenaReducer(arenaState, { type: "revealAiLabel" }, sampleCases);
  assert.equal(arenaState.activeStage, "ai_reveal");

  const uncertainLabel = targetCase.candidateLabels.find(
    (candidate) => candidate.source === "uncertain_label",
  );
  const impostor = targetCase.representativeSessions[0];
  assert.ok(uncertainLabel);
  assert.ok(impostor);

  arenaState = arenaReducer(
    arenaState,
    { type: "selectLabelDuelWinner", candidateId: uncertainLabel.id },
    sampleCases,
  );
  arenaState = arenaReducer(
    arenaState,
    { type: "toggleDuelReason", reason: "preserves_uncertainty" },
    sampleCases,
  );
  arenaState = arenaReducer(
    arenaState,
    { type: "selectImpostorSession", sessionId: impostor.id },
    sampleCases,
  );
  arenaState = arenaReducer(
    arenaState,
    { type: "selectVerdict", verdict: "needs_better_evidence" },
    sampleCases,
  );

  reviewState = getCurrentReviewState(arenaState);
  const arenaReview = buildArenaReview(
    targetCase,
    reviewState,
    getEvidenceRatings(targetCase, reviewState),
  );
  const exportResult = buildReviewResultExport({
    caseFile: targetCase,
    exportTimestamp: "2026-06-24T12:00:00.000Z",
    arenaReview,
  });

  assert.equal(
    exportResult.decisions.blind_interpretation.option_id,
    "not-enough-evidence",
  );
  assert.deepEqual(
    exportResult.decisions.evidence_ratings.map((rating) => rating.rating),
    targetCase.evidenceItems.map(() => "needs_more_context"),
  );
  assert.equal(exportResult.decisions.final_verdict, "needs_better_evidence");
  assert.equal(
    exportResult.decisions.recommended_action,
    "collect_more_evidence",
  );
  assert.equal("review_readiness" in exportResult.decisions, false);
});

test("ready checkpoint preserves the normal blind-review path", () => {
  const targetCase = sampleCases[0];
  const normalChoice = targetCase.blindInterpretationOptions[0];
  assert.ok(targetCase);
  assert.ok(normalChoice);

  let arenaState = createInitialArenaState(sampleCases);
  arenaState = arenaReducer(
    arenaState,
    { type: "chooseReviewReadiness", choice: "ready" },
    sampleCases,
  );

  let reviewState = getCurrentReviewState(arenaState);
  assert.equal(reviewState.reviewReadiness, "ready");
  assert.equal(reviewState.blindChoiceId, undefined);
  assert.equal(reviewState.evidenceRatings, undefined);

  arenaState = arenaReducer(
    arenaState,
    { type: "chooseBlindInterpretation", optionId: normalChoice.id },
    sampleCases,
  );
  reviewState = getCurrentReviewState(arenaState);

  assert.equal(reviewState.reviewReadiness, "ready");
  assert.equal(reviewState.blindChoiceId, normalChoice.id);
});

test("switching from cannot judge to ready clears auto-filled context decisions", () => {
  const targetCase = sampleCases[0];
  assert.ok(targetCase);

  let arenaState = createInitialArenaState(sampleCases);
  arenaState = arenaReducer(
    arenaState,
    { type: "chooseReviewReadiness", choice: "domain_terms" },
    sampleCases,
  );
  arenaState = arenaReducer(
    arenaState,
    { type: "chooseReviewReadiness", choice: "ready" },
    sampleCases,
  );

  const reviewState = getCurrentReviewState(arenaState);
  assert.equal(reviewState.reviewReadiness, "ready");
  assert.equal(reviewState.blindChoiceId, undefined);
  assert.equal(reviewState.evidenceRatings, undefined);
  assert.equal(reviewState.aiLabelRevealed, false);
});

test("arena reducer captures optional split and merge recommendations without changing completion", () => {
  const targetCase = sampleCases[0];
  assert.ok(targetCase);
  const affectedSession = targetCase.representativeSessions[3];
  const affectedEvidence = targetCase.evidenceItems[3];
  const mergeCandidate = targetCase.neighborClusters?.[0];
  assert.ok(affectedSession);
  assert.ok(affectedEvidence);
  assert.ok(mergeCandidate);

  let arenaState = createInitialArenaState(sampleCases, "verdict");
  arenaState = arenaReducer(
    arenaState,
    { type: "selectVerdict", verdict: "needs_split" },
    sampleCases,
  );
  arenaState = arenaReducer(
    arenaState,
    { type: "selectSplitRecommendationReason", reason: "mixed_behaviors" },
    sampleCases,
  );
  arenaState = arenaReducer(
    arenaState,
    {
      type: "toggleSplitRecommendationSession",
      sessionId: affectedSession.id,
    },
    sampleCases,
  );
  arenaState = arenaReducer(
    arenaState,
    {
      type: "toggleSplitRecommendationEvidence",
      evidenceId: affectedEvidence.id,
    },
    sampleCases,
  );
  arenaState = arenaReducer(
    arenaState,
    {
      type: "selectMergeRecommendationTarget",
      neighborClusterId: mergeCandidate.clusterId,
    },
    sampleCases,
  );
  arenaState = arenaReducer(
    arenaState,
    { type: "selectMergeRecommendationReason", reason: "shared_behavior" },
    sampleCases,
  );

  const reviewState = getCurrentReviewState(arenaState);
  const evidenceRatings = getEvidenceRatings(targetCase, reviewState);
  const arenaReview = buildArenaReview(targetCase, reviewState, evidenceRatings);

  assert.deepEqual(reviewState.clusterRefinement, {
    splitRecommendation: {
      status: "recommended",
      reason: "mixed_behaviors",
      affectedSessionIds: [affectedSession.id],
      evidenceIds: [affectedEvidence.id],
    },
    mergeRecommendation: {
      status: "recommended",
      targetNeighborClusterId: mergeCandidate.clusterId,
      reason: "shared_behavior",
    },
  });
  assert.equal(getReviewCompletion(reviewState, evidenceRatings, targetCase), 6);
  assert.deepEqual(arenaReview.clusterRefinement, {
    split_recommendation: {
      status: "recommended",
      reason: "mixed_behaviors",
      affected_session_ids: [affectedSession.id],
      evidence_ids: [affectedEvidence.id],
    },
    merge_recommendation: {
      status: "recommended",
      target_neighbor_cluster_id: mergeCandidate.clusterId,
      reason: "shared_behavior",
    },
  });
});

test("selecting supported clears negative failure modes from state and export", () => {
  const targetCase = sampleCases[0];
  assert.ok(targetCase);

  let arenaState = createInitialArenaState(sampleCases, "verdict");
  arenaState = arenaReducer(
    arenaState,
    { type: "toggleFailureMode", reason: "less_overclaimed" },
    sampleCases,
  );
  arenaState = arenaReducer(
    arenaState,
    { type: "toggleFailureMode", reason: "missing_evidence" },
    sampleCases,
  );
  arenaState = arenaReducer(
    arenaState,
    { type: "selectVerdict", verdict: "supported" },
    sampleCases,
  );

  const reviewState = getCurrentReviewState(arenaState);
  const evidenceRatings = getEvidenceRatings(targetCase, reviewState);
  const arenaReview = buildArenaReview(targetCase, reviewState, evidenceRatings);

  assert.equal(reviewState.finalVerdict, "supported");
  assert.deepEqual(reviewState.failureModes, []);
  assert.deepEqual(arenaReview.failureModes, []);
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

test("direct verdict hydration keeps the seeded demo final verdict when persisted state is partial", () => {
  const targetCase = sampleCases[0];
  assert.ok(targetCase);

  const partialReviewState = {
    blindChoiceId: "cloud-resource-discovery",
    aiLabelRevealed: true,
    labelDuelWinnerId: "label-iam-baseline",
    impostorSessionId: "iam-s-01",
  };
  const arenaState = arenaReducer(
    createInitialArenaState(sampleCases, "verdict"),
    {
      type: "hydrateSession",
      selectedCaseId: targetCase.id,
      reviewsByCase: {
        [targetCase.id]: partialReviewState,
      },
    },
    sampleCases,
  );
  const hydratedReview = getCurrentReviewState(arenaState);

  assert.equal(arenaState.activeStage, "verdict");
  assert.equal(hydratedReview.finalVerdict, "unsupported_overclaimed");
  assert.deepEqual(hydratedReview.failureModes, [
    "less_overclaimed",
    "missing_evidence",
  ]);
  assert.equal(hydratedReview.blindChoiceId, "cloud-resource-discovery");
});

test("direct verdict hydration preserves an explicitly persisted final verdict", () => {
  const targetCase = sampleCases[0];
  assert.ok(targetCase);

  const persistedReviewState = {
    blindChoiceId: "cloud-resource-discovery",
    aiLabelRevealed: true,
    finalVerdict: "supported" as const,
    failureModes: [],
  };
  const arenaState = arenaReducer(
    createInitialArenaState(sampleCases, "verdict"),
    {
      type: "hydrateSession",
      selectedCaseId: targetCase.id,
      reviewsByCase: {
        [targetCase.id]: persistedReviewState,
      },
    },
    sampleCases,
  );

  assert.equal(getCurrentReviewState(arenaState).finalVerdict, "supported");
  assert.deepEqual(getCurrentReviewState(arenaState).failureModes, []);
});
