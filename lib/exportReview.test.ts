import assert from "node:assert/strict";
import test from "node:test";

import { sampleCases } from "@/data/sampleCases";
import {
  buildReviewResultExport,
  getReviewResultExportFilename,
  serializeReviewResultExport,
  type EvidenceArenaReview,
} from "@/lib/exportReview";
import {
  REVIEW_RESULT_V01_EVIDENCE_RATINGS,
  REVIEW_RESULT_V01_RECOMMENDED_ACTIONS,
  REVIEW_RESULT_V01_VERDICTS,
} from "@/lib/reviewResultV01";
import type { CaseFile, FinalVerdict } from "@/lib/types";

test("review result export emits a versioned decision artifact with package references", () => {
  const caseFile = sampleCases[0];
  const exportResult = buildReviewResultExport({
    caseFile,
    exportTimestamp: "2026-06-12T12:00:00.000Z",
    arenaReview: {
      blindChoiceId: "routine-iam-provisioning",
      blindChoiceLabel: "Routine IAM role provisioning",
      aiLabel: caseFile.topicLabel.name,
      aiLabelRevealed: true,
      blindChoiceAgreesWithAi: false,
      labelDuelWinnerId: "label-iam-constrained",
      labelDuelWinnerLabel: "Routine IAM role provisioning",
      duelReasons: ["less_overclaimed"],
      evidenceRatings: {
        "iam-e-01": "weak_support",
        "iam-e-02": "contradicts_label",
        "iam-e-03": "contradicts_label",
        "iam-e-04": "needs_context",
      },
      impostorSessionId: "iam-s-04",
      impostorSessionTitle: "Cross-account PassRole probe",
      failureModes: ["missing_evidence"],
      finalVerdict: "unsupported_overclaimed",
    },
  });

  assert.equal(exportResult.schema_version, "review_result.v0.1");
  assert.equal(exportResult.created_at, "2026-06-12T12:00:00.000Z");
  assert.equal(
    exportResult.review_id,
    "review:pkg-synthetic-arena-001:local-demo-reviewer:pkg-synthetic-arena-001:case-arena-001:local-session:2026-06-12T12:00:00.000Z",
  );
  assert.deepEqual(exportResult.reviewer, {
    reviewer_id: "local-demo-reviewer",
    review_session_id:
      "pkg-synthetic-arena-001:case-arena-001:local-session",
    context: "synthetic_demo",
  });
  assert.deepEqual(exportResult.protocol, {
    protocol_version: "telemetry_court_review.v0.1",
    blind_review_enabled: true,
    ai_label_revealed: true,
  });
  assert.deepEqual(exportResult.case_package, {
    schema_version: "case_package.v0.1",
    package_id: "pkg-synthetic-arena-001",
    package_revision: "r1",
    case_id: caseFile.id,
    cluster_id: caseFile.cluster.id,
    pipeline: {
      pipeline_id: "pipeline-synthetic-sample-fixtures",
      run_id: "run-case-arena-001-synthetic-fixture",
      upstream_tool: "synthetic-demo-fixture",
      pipeline_version: "0.1.0",
      embedding_model: "synthetic-embedding-fixture",
      clustering_method: "synthetic-static-clustering",
      dimensionality_reduction_method: "synthetic-static-review-map",
      naming_model: "Baseline AI labeler v0.7",
      prompt_id: "prompt-synthetic-baseline-labeler-v0.7",
      generated_at: "2026-06-13T13:10:00Z",
    },
  });
  assert.deepEqual(exportResult.decisions.evidence_ratings, [
    { evidence_id: "iam-e-01", rating: "weak_support" },
    { evidence_id: "iam-e-02", rating: "contradicts" },
    { evidence_id: "iam-e-03", rating: "contradicts" },
    { evidence_id: "iam-e-04", rating: "needs_more_context" },
  ]);
  assert.equal(
    exportResult.decisions.final_verdict,
    "unsupported_or_overclaimed",
  );
  assert.equal(exportResult.decisions.recommended_action, "rename_label");
  assert.equal("claims" in exportResult, false);
  assert.equal("evidenceItems" in exportResult, false);
});

test("review result export fails loudly for missing package metadata or decisions", () => {
  const caseFile = sampleCases[0];
  const caseWithoutPackageReference = {
    ...caseFile,
    casePackageReference: undefined,
  };

  assert.throws(
    () =>
      buildReviewResultExport({
        caseFile: caseWithoutPackageReference,
        exportTimestamp: "2026-06-12T12:00:00.000Z",
        arenaReview: completeArenaReview(caseFile),
      }),
    /without CasePackage reference metadata/,
  );
  assert.throws(
    () =>
      buildReviewResultExport({
        caseFile,
        exportTimestamp: "2026-06-12T12:00:00.000Z",
      }),
    /without review decisions/,
  );
  assert.throws(
    () =>
      buildReviewResultExport({
        caseFile,
        exportTimestamp: "2026-06-12T12:00:00.000Z",
        arenaReview: completeArenaReview(caseFile, {
          labelDuelWinnerId: "label-does-not-exist",
        }),
      }),
    /unknown candidate label ID/,
  );
  assert.throws(
    () =>
      buildReviewResultExport({
        caseFile: {
          ...caseFile,
          casePackageReference: {
            ...caseFile.casePackageReference!,
            pipeline: {
              ...caseFile.casePackageReference!.pipeline,
              run_id: "",
            },
          },
        },
        exportTimestamp: "2026-06-12T12:00:00.000Z",
        arenaReview: completeArenaReview(caseFile),
      }),
    /without pipeline run ID/,
  );
  assert.throws(
    () =>
      buildReviewResultExport({
        caseFile,
        exportTimestamp: "2026-06-12T12:00:00.000Z",
        arenaReview: completeArenaReview(caseFile, {
          finalVerdict: "not_a_verdict" as FinalVerdict,
        }),
      }),
    /unsupported final verdict/,
  );
});

test("review result export rejects incomplete required decisions", () => {
  const caseFile = sampleCases[0];
  const evidenceRatings = { ...caseFile.defaultEvidenceRatings };
  delete evidenceRatings[caseFile.evidenceItems[0].id];

  assert.throws(
    () =>
      buildReviewResultExport({
        caseFile,
        exportTimestamp: "2026-06-12T12:00:00.000Z",
        arenaReview: completeArenaReview(caseFile, {
          finalVerdict: undefined,
        }),
      }),
    /without final verdict/,
  );
  assert.throws(
    () =>
      buildReviewResultExport({
        caseFile,
        exportTimestamp: "2026-06-12T12:00:00.000Z",
        arenaReview: completeArenaReview(caseFile, { evidenceRatings }),
      }),
    /without rating for evidence/,
  );
});

test("review result export rejects mismatched package IDs", () => {
  const caseFile = sampleCases[0];

  assert.throws(
    () =>
      buildReviewResultExport({
        caseFile: {
          ...caseFile,
          casePackageReference: {
            ...caseFile.casePackageReference!,
            case_id: "case-does-not-match",
          },
        },
        exportTimestamp: "2026-06-12T12:00:00.000Z",
        arenaReview: completeArenaReview(caseFile),
      }),
    /mismatched CasePackage references/,
  );
});

test("serialized review export is readable JSON with a stable filename", () => {
  const caseFile = sampleCases[1];
  const exportResult = buildReviewResultExport({
    caseFile,
    exportTimestamp: "2026-06-12T12:00:00.000Z",
    arenaReview: completeArenaReview(caseFile),
  });
  const serializedExport = serializeReviewResultExport(exportResult);

  assert.equal(getReviewResultExportFilename(caseFile), "case-arena-002-review-result.json");
  assert.equal(serializedExport.endsWith("\n"), true);
  assert.deepEqual(JSON.parse(serializedExport), exportResult);
});

test("ReviewResult v0.1 exposes the complete canonical decision vocabulary", () => {
  assert.deepEqual(REVIEW_RESULT_V01_EVIDENCE_RATINGS, [
    "supports",
    "weak_support",
    "irrelevant",
    "contradicts",
    "insufficient",
    "needs_more_context",
  ]);
  assert.deepEqual(REVIEW_RESULT_V01_VERDICTS, [
    "supported",
    "partially_supported",
    "unsupported_or_overclaimed",
    "uncertain",
    "cluster_impure",
    "needs_split",
    "needs_merge",
    "needs_better_evidence",
  ]);
  assert.deepEqual(REVIEW_RESULT_V01_RECOMMENDED_ACTIONS, [
    "accept_label",
    "rename_label",
    "broaden_label",
    "narrow_label",
    "split_cluster",
    "merge_cluster",
    "collect_more_evidence",
    "rerun_prompt",
    "rerun_embedding",
    "mark_uncertain",
  ]);
});

test("ReviewResult v0.1 can carry optional reviewer confidence and notes", () => {
  const caseFile = sampleCases[0];
  const exportResult = buildReviewResultExport({
    caseFile,
    exportTimestamp: "2026-06-12T12:00:00.000Z",
    arenaReview: completeArenaReview(caseFile),
  });
  const reviewWithOptionalContext = {
    ...exportResult,
    decisions: {
      ...exportResult.decisions,
      confidence: {
        level: "medium",
        rationale: "Synthetic reviewer confidence fixture.",
      },
      notes: ["Synthetic optional reviewer note."],
    },
  } satisfies typeof exportResult;

  assert.deepEqual(reviewWithOptionalContext.decisions.confidence, {
    level: "medium",
    rationale: "Synthetic reviewer confidence fixture.",
  });
  assert.deepEqual(reviewWithOptionalContext.decisions.notes, [
    "Synthetic optional reviewer note.",
  ]);
});

test("review result export maps every current final verdict to canonical values", () => {
  const caseFile = sampleCases[0];
  const expected: Array<
    [FinalVerdict, string, string]
  > = [
    ["supported", "supported", "accept_label"],
    ["partially_supported", "partially_supported", "narrow_label"],
    [
      "unsupported_overclaimed",
      "unsupported_or_overclaimed",
      "rename_label",
    ],
    ["uncertain", "uncertain", "collect_more_evidence"],
    ["cluster_impure", "cluster_impure", "split_cluster"],
    ["needs_split", "needs_split", "split_cluster"],
    ["needs_merge", "needs_merge", "merge_cluster"],
    ["needs_better_evidence", "needs_better_evidence", "collect_more_evidence"],
  ];

  for (const [uiVerdict, canonicalVerdict, recommendedAction] of expected) {
    const exportResult = buildReviewResultExport({
      caseFile,
      exportTimestamp: "2026-06-13T14:00:00.000Z",
      arenaReview: completeArenaReview(caseFile, { finalVerdict: uiVerdict }),
    });

    assert.equal(exportResult.decisions.final_verdict, canonicalVerdict);
    assert.equal(exportResult.decisions.recommended_action, recommendedAction);
  }
});

function completeArenaReview(
  caseFile: CaseFile,
  overrides: Partial<EvidenceArenaReview> = {},
): EvidenceArenaReview {
  const blindChoice = caseFile.blindInterpretationOptions[0];
  const labelWinner = caseFile.candidateLabels[0];
  const impostor = caseFile.representativeSessions[0];

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
