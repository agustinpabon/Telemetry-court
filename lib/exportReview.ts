import {
  REVIEW_PROTOCOL_V01_VERSION,
  REVIEW_RESULT_V01_SCHEMA_VERSION,
  type ReviewResultV01,
} from "@/lib/reviewResultV01";
import type {
  CaseFile,
  CasePackageEvidenceRatingV01,
  CasePackageRecommendedActionV01,
  CasePackageReferenceV01,
  CasePackageVerdictV01,
  DuelReason,
  EvidenceRating,
  FinalVerdict,
} from "@/lib/types";

export type EvidenceArenaReview = {
  blindChoiceId?: string;
  blindChoiceLabel?: string;
  aiLabel: string;
  aiLabelRevealed: boolean;
  blindChoiceAgreesWithAi?: boolean;
  labelDuelWinnerId?: string;
  labelDuelWinnerLabel?: string;
  duelReasons: DuelReason[];
  duelNote?: string;
  evidenceRatings: Record<string, EvidenceRating>;
  impostorSessionId?: string;
  impostorSessionTitle?: string;
  impostorExplanation?: string;
  failureModes: DuelReason[];
  finalVerdict?: FinalVerdict;
};

export type ReviewResultExport = ReviewResultV01;

type ReviewResultReviewer = ReviewResultV01["reviewer"];

const evidenceRatingMap: Record<
  EvidenceRating,
  CasePackageEvidenceRatingV01
> = {
  supports_label: "supports",
  weak_support: "weak_support",
  irrelevant_noise: "irrelevant",
  contradicts_label: "contradicts",
  needs_context: "needs_more_context",
};

const verdictMap: Record<FinalVerdict, CasePackageVerdictV01> = {
  supported: "supported",
  partially_supported: "partially_supported",
  unsupported_overclaimed: "unsupported_or_overclaimed",
  uncertain: "uncertain",
  cluster_impure: "cluster_impure",
  needs_split: "needs_split",
  needs_merge: "needs_merge",
  needs_better_evidence: "needs_better_evidence",
};

const recommendedActionMap: Record<
  CasePackageVerdictV01,
  CasePackageRecommendedActionV01
> = {
  supported: "accept_label",
  partially_supported: "narrow_label",
  unsupported_or_overclaimed: "rename_label",
  uncertain: "collect_more_evidence",
  cluster_impure: "split_cluster",
  needs_split: "split_cluster",
  needs_merge: "merge_cluster",
  needs_better_evidence: "collect_more_evidence",
};

export function buildReviewResultExport({
  caseFile,
  exportTimestamp,
  arenaReview,
  reviewer,
}: {
  caseFile: CaseFile;
  exportTimestamp: string;
  arenaReview?: EvidenceArenaReview;
  reviewer?: ReviewResultReviewer;
}): ReviewResultV01 {
  const packageReference = caseFile.casePackageReference;
  const createdAt = requireValue(exportTimestamp, "export timestamp");

  if (!packageReference) {
    throw new Error(
      "Cannot export ReviewResult v0.1 without CasePackage reference metadata.",
    );
  }

  assertCompletePackageReference(packageReference);

  if (
    packageReference.case_id !== caseFile.id ||
    packageReference.cluster_id !== caseFile.cluster.id
  ) {
    throw new Error(
      "Cannot export ReviewResult v0.1 with mismatched CasePackage references.",
    );
  }

  if (!arenaReview) {
    throw new Error("Cannot export ReviewResult v0.1 without review decisions.");
  }

  const blindInterpretation = requireBlindInterpretation(arenaReview);
  const selectedLabelId = requireValue(
    arenaReview.labelDuelWinnerId,
    "label comparison winner",
  );
  const selectedSessionId = requireValue(
    arenaReview.impostorSessionId,
    "outlier or impostor selection",
  );
  assertKnownReviewReferences(
    caseFile,
    blindInterpretation.option_id,
    selectedLabelId,
    selectedSessionId,
  );
  const uiFinalVerdict = requireValue(arenaReview.finalVerdict, "final verdict");
  const finalVerdict = verdictMap[uiFinalVerdict];

  if (!finalVerdict) {
    throw new Error(
      `Cannot export ReviewResult v0.1 with unsupported final verdict "${uiFinalVerdict}".`,
    );
  }
  const evidenceRatings = buildEvidenceRatings(caseFile, arenaReview);
  const reviewResultReviewer =
    reviewer ?? createLocalDemoReviewer(packageReference.package_id, caseFile.id);
  assertCompleteReviewer(reviewResultReviewer);
  const { blind_review_enabled: blindReviewEnabled, ...casePackage } =
    packageReference;

  if (blindReviewEnabled && arenaReview.aiLabelRevealed !== true) {
    throw new Error(
      "Cannot export ReviewResult v0.1 before the AI label is revealed.",
    );
  }

  return {
    schema_version: REVIEW_RESULT_V01_SCHEMA_VERSION,
    review_id: `review:${packageReference.package_id}:${createdAt}`,
    created_at: createdAt,
    case_package: casePackage,
    reviewer: reviewResultReviewer,
    protocol: {
      protocol_version: REVIEW_PROTOCOL_V01_VERSION,
      blind_review_enabled: blindReviewEnabled,
      ai_label_revealed: arenaReview.aiLabelRevealed,
    },
    decisions: {
      blind_interpretation: blindInterpretation,
      label_comparison: {
        selected_label_id: selectedLabelId,
        reason_codes: arenaReview.duelReasons,
        ...(arenaReview.duelNote ? { rationale: arenaReview.duelNote } : {}),
      },
      evidence_ratings: evidenceRatings,
      outlier_impostor: {
        selected_session_id: selectedSessionId,
      },
      failure_modes: arenaReview.failureModes,
      final_verdict: finalVerdict,
      recommended_action: recommendedActionMap[finalVerdict],
    },
  };
}

function assertCompletePackageReference(
  packageReference: CasePackageReferenceV01,
) {
  if (packageReference.schema_version !== "case_package.v0.1") {
    throw new Error(
      "Cannot export ReviewResult v0.1 for an unsupported CasePackage schema version.",
    );
  }

  requireValue(packageReference.package_id, "CasePackage ID");
  requireValue(packageReference.case_id, "CasePackage case ID");
  requireValue(packageReference.cluster_id, "CasePackage cluster ID");
  requireValue(packageReference.pipeline.run_id, "pipeline run ID");
  requireValue(packageReference.pipeline.upstream_tool, "upstream pipeline tool");
  requireValue(packageReference.pipeline.generated_at, "pipeline generation timestamp");
}

function assertKnownReviewReferences(
  caseFile: CaseFile,
  blindChoiceId: string,
  labelId: string,
  sessionId: string,
) {
  if (
    !caseFile.blindInterpretationOptions.some(
      (option) => option.id === blindChoiceId,
    )
  ) {
    throw new Error(
      `Cannot export ReviewResult v0.1 with unknown blind interpretation ID "${blindChoiceId}".`,
    );
  }

  if (!caseFile.candidateLabels.some((label) => label.id === labelId)) {
    throw new Error(
      `Cannot export ReviewResult v0.1 with unknown candidate label ID "${labelId}".`,
    );
  }

  if (!caseFile.representativeSessions.some((session) => session.id === sessionId)) {
    throw new Error(
      `Cannot export ReviewResult v0.1 with unknown session ID "${sessionId}".`,
    );
  }
}

function assertCompleteReviewer(reviewer: ReviewResultReviewer) {
  requireValue(reviewer.reviewer_id, "reviewer ID");
  requireValue(reviewer.review_session_id, "review session ID");

  if (reviewer.context !== "synthetic_demo" && reviewer.context !== "local_review") {
    throw new Error(
      `Cannot export ReviewResult v0.1 with unsupported reviewer context "${reviewer.context}".`,
    );
  }
}

export function serializeReviewResultExport(exportResult: ReviewResultV01): string {
  return `${JSON.stringify(exportResult, null, 2)}\n`;
}

export function getReviewResultExportFilename(caseFile: CaseFile): string {
  return `${caseFile.id}-review-result.json`;
}

function requireBlindInterpretation(
  arenaReview: EvidenceArenaReview,
): ReviewResultV01["decisions"]["blind_interpretation"] {
  return {
    option_id: requireValue(arenaReview.blindChoiceId, "blind interpretation"),
    label: requireValue(arenaReview.blindChoiceLabel, "blind interpretation label"),
    agrees_with_ai: arenaReview.blindChoiceAgreesWithAi ?? false,
  };
}

function buildEvidenceRatings(
  caseFile: CaseFile,
  arenaReview: EvidenceArenaReview,
): ReviewResultV01["decisions"]["evidence_ratings"] {
  const evidenceIds = new Set(caseFile.evidenceItems.map((evidence) => evidence.id));

  for (const evidenceId of Object.keys(arenaReview.evidenceRatings)) {
    if (!evidenceIds.has(evidenceId)) {
      throw new Error(
        `Cannot export ReviewResult v0.1 with unknown evidence ID "${evidenceId}".`,
      );
    }
  }

  return caseFile.evidenceItems.map((evidence) => {
    const uiRating = requireValue(
      arenaReview.evidenceRatings[evidence.id],
      `rating for evidence "${evidence.id}"`,
    );
    const canonicalRating = evidenceRatingMap[uiRating];

    if (!canonicalRating) {
      throw new Error(
        `Cannot export ReviewResult v0.1 with unsupported evidence rating "${uiRating}".`,
      );
    }

    return {
      evidence_id: evidence.id,
      rating: canonicalRating,
    };
  });
}

function createLocalDemoReviewer(
  packageId: string,
  caseId: string,
): ReviewResultReviewer {
  return {
    reviewer_id: "local-demo-reviewer",
    review_session_id: `${packageId}:${caseId}:local-session`,
    context: "synthetic_demo",
  };
}

function requireValue<T>(value: T | undefined, label: string): T {
  if (value === undefined || value === "") {
    throw new Error(`Cannot export ReviewResult v0.1 without ${label}.`);
  }

  return value;
}
