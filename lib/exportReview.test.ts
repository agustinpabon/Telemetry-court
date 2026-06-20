import assert from "node:assert/strict";
import test from "node:test";

import { sampleCases } from "@/data/sampleCases";
import {
  buildReviewResultExport,
  getReviewResultExportFilename,
  serializeReviewResultExport,
  type EvidenceArenaReview,
} from "@/lib/exportReview";

test("review result export preserves the selected case evidence trail", () => {
  const caseFile = sampleCases[0];
  const exportResult = buildReviewResultExport({
    caseFile,
    exportTimestamp: "2026-06-12T12:00:00.000Z",
  });

  assert.equal(exportResult.exportTimestamp, "2026-06-12T12:00:00.000Z");
  assert.equal(exportResult.caseId, caseFile.id);
  assert.deepEqual(exportResult.cluster, caseFile.cluster);
  assert.deepEqual(exportResult.topicLabel, caseFile.topicLabel);
  assert.deepEqual(exportResult.claims, caseFile.claims);
  assert.deepEqual(exportResult.evidenceItems, caseFile.evidenceItems);
  assert.deepEqual(exportResult.evidenceRelations, caseFile.evidenceRelations);
  assert.deepEqual(exportResult.supportScores, caseFile.supportScores);
  assert.deepEqual(exportResult.analystVerdict, caseFile.analystVerdict);
});

test("local analyst verdict overrides the static verdict without changing evidence", () => {
  const caseFile = sampleCases[0];
  const exportResult = buildReviewResultExport({
    caseFile,
    exportTimestamp: "2026-06-12T12:00:00.000Z",
    localVerdict: {
      decision: "reject",
      summary: "The local reviewer rejected the generated interpretation.",
      reviewedAt: "2026-06-12T12:01:00.000Z",
    },
  });

  assert.deepEqual(exportResult.analystVerdict, {
    decision: "reject",
    summary: "The local reviewer rejected the generated interpretation.",
    reviewedAt: "2026-06-12T12:01:00.000Z",
  });
  assert.deepEqual(exportResult.evidenceRelations, caseFile.evidenceRelations);
  assert.deepEqual(exportResult.evidenceItems, caseFile.evidenceItems);
});

test("serialized review export is readable JSON with a stable filename", () => {
  const caseFile = sampleCases[1];
  const exportResult = buildReviewResultExport({
    caseFile,
    exportTimestamp: "2026-06-12T12:00:00.000Z",
  });
  const serializedExport = serializeReviewResultExport(exportResult);

  assert.equal(getReviewResultExportFilename(caseFile), "case-arena-002-review-result.json");
  assert.equal(serializedExport.endsWith("\n"), true);
  assert.deepEqual(JSON.parse(serializedExport), exportResult);
});

test("arena review export preserves structured reviewer choices", () => {
  const caseFile = sampleCases[0];
  const arenaReview: EvidenceArenaReview = {
    blindChoiceId: "routine-iam-provisioning",
    blindChoiceLabel: "Routine IAM role provisioning",
    aiLabel: caseFile.topicLabel.name,
    blindChoiceAgreesWithAi: false,
    labelDuelWinnerId: "label-iam-constrained",
    labelDuelWinnerLabel: "Routine IAM role provisioning",
    duelReasons: ["less_overclaimed", "missing_evidence"],
    duelNote: "Routine provisioning best fits the evidence.",
    evidenceRatings: {
      "iam-e-01": "weak_support",
      "iam-e-02": "contradicts_label",
    },
    impostorSessionId: "iam-s-04",
    impostorSessionTitle: "Cross-account PassRole probe",
    impostorExplanation: "Lowest feature overlap and highest outlier score.",
    failureModes: ["missing_evidence"],
    finalVerdict: "unsupported_overclaimed",
  };
  const exportResult = buildReviewResultExport({
    caseFile,
    exportTimestamp: "2026-06-13T14:00:00.000Z",
    arenaReview,
  });

  assert.deepEqual(exportResult.arenaReview, arenaReview);
  assert.equal(exportResult.arenaReview?.aiLabel, "Suspicious IAM privilege escalation");
});
