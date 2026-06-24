import assert from "node:assert/strict";
import test from "node:test";

import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { JudgmentReceipt } from "@/components/arena/JudgmentReceipt";
import { sampleCases } from "@/data/sampleCases";
import { getEvidenceBalance, getEvidenceRatings } from "@/lib/arenaReviewState";

function renderStaticMarkup(element: React.ReactElement): string {
  return renderToStaticMarkup(element).replace(/\s+/g, " ");
}

test("judgment receipt explains the local ReviewResult to EvaluationReport next step", () => {
  const caseFile = sampleCases[0];
  assert.ok(caseFile);

  const reviewState = {
    blindChoiceId: caseFile.blindInterpretationOptions[0]?.id,
    aiLabelRevealed: true,
    labelDuelWinnerId: caseFile.candidateLabels[0]?.id,
    impostorSessionId: caseFile.representativeSessions[0]?.id,
    finalVerdict: "supported" as const,
  };

  const markup = renderStaticMarkup(
    React.createElement(JudgmentReceipt, {
      caseFile,
      reviewState,
      blindChoice: caseFile.blindInterpretationOptions[0],
      duelWinner: caseFile.candidateLabels[0],
      impostor: caseFile.representativeSessions[0],
      balance: getEvidenceBalance(caseFile, getEvidenceRatings(caseFile, reviewState)),
      onOpenReviewDrawer: () => undefined,
      onCopyJson: () => undefined,
      onDownloadJson: () => undefined,
    }),
  );

  assert.match(markup, /After export: import on \/results for aggregate metrics/);
  assert.match(
    markup,
    /A ReviewResult is one reviewer&#x27;s structured judgment, not the final aggregate report\./,
  );
  assert.match(markup, /Import on \/results/);
  assert.match(markup, /Group compatible reviews/);
  assert.match(markup, /Generate EvaluationReport metrics/);
  assert.match(
    markup,
    /Local-file workflow only: no backend, auth, database, server-side persistence, or cloud sync\./,
  );
  assert.match(markup, /Copy JSON/);
  assert.match(markup, /Download JSON/);
});
