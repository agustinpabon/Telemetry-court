import assert from "node:assert/strict";
import test from "node:test";

import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { VerdictPanel } from "@/components/arena/VerdictPanel";
import { sampleCases } from "@/data/sampleCases";
import { getEvidenceBalance, getEvidenceRatings } from "@/lib/arenaReviewState";
import type { CaseFile } from "@/lib/types";

function renderStaticMarkup(element: React.ReactElement): string {
  return renderToStaticMarkup(element).replace(/\s+/g, " ");
}

test("verdict panel shows merge controls only for existing neighbor candidates", () => {
  const caseFile = sampleCases[0];
  assert.ok(caseFile);
  const mergeCandidate = caseFile.neighborClusters?.[0];
  assert.ok(mergeCandidate);
  const reviewState = {
    blindChoiceId: caseFile.blindInterpretationOptions[0].id,
    aiLabelRevealed: true,
    labelDuelWinnerId: caseFile.candidateLabels[0].id,
    impostorSessionId: caseFile.representativeSessions[0].id,
    finalVerdict: "needs_merge" as const,
  };

  const markup = renderStaticMarkup(
    React.createElement(VerdictPanel, {
      caseFile,
      reviewState,
      balance: getEvidenceBalance(caseFile, getEvidenceRatings(caseFile, reviewState)),
      onSelectVerdict: () => undefined,
      onToggleFailureMode: () => undefined,
      onSelectSplitRecommendationReason: () => undefined,
      onToggleSplitRecommendationSession: () => undefined,
      onToggleSplitRecommendationEvidence: () => undefined,
      onSelectMergeRecommendationTarget: () => undefined,
      onSelectMergeRecommendationReason: () => undefined,
      onClearMergeRecommendation: () => undefined,
      onBackToImpostor: () => undefined,
      onOpenReviewDrawer: () => undefined,
      onCopyJson: () => undefined,
      onDownloadJson: () => undefined,
    }),
  );

  assert.match(markup, /Split and merge recommendations/);
  assert.match(markup, /Merge target/);
  assert.match(markup, new RegExp(mergeCandidate.clusterId));
  assert.match(markup, new RegExp(mergeCandidate.label));
});

test("verdict panel does not invent merge candidates when none exist", () => {
  const caseFile = sampleCases[0];
  assert.ok(caseFile);
  const caseWithoutCandidates: CaseFile = {
    ...caseFile,
    nearestNeighbor: {
      clusterId: "",
      label: "",
      distance: 0,
      note: "",
    },
    neighborClusters: [],
  };
  const reviewState = {
    blindChoiceId: caseWithoutCandidates.blindInterpretationOptions[0].id,
    aiLabelRevealed: true,
    labelDuelWinnerId: caseWithoutCandidates.candidateLabels[0].id,
    impostorSessionId: caseWithoutCandidates.representativeSessions[0].id,
    finalVerdict: "needs_merge" as const,
  };

  const markup = renderStaticMarkup(
    React.createElement(VerdictPanel, {
      caseFile: caseWithoutCandidates,
      reviewState,
      balance: getEvidenceBalance(
        caseWithoutCandidates,
        getEvidenceRatings(caseWithoutCandidates, reviewState),
      ),
      onSelectVerdict: () => undefined,
      onToggleFailureMode: () => undefined,
      onSelectSplitRecommendationReason: () => undefined,
      onToggleSplitRecommendationSession: () => undefined,
      onToggleSplitRecommendationEvidence: () => undefined,
      onSelectMergeRecommendationTarget: () => undefined,
      onSelectMergeRecommendationReason: () => undefined,
      onClearMergeRecommendation: () => undefined,
      onBackToImpostor: () => undefined,
      onOpenReviewDrawer: () => undefined,
      onCopyJson: () => undefined,
      onDownloadJson: () => undefined,
    }),
  );

  assert.match(markup, /No compatible merge candidates supplied/);
  assert.doesNotMatch(markup, /cluster-iam-041/);
});
