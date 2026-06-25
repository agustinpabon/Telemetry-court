import {
  REVIEW_PROTOCOL_V01_VERSION,
  REVIEW_RESULT_V01_SCHEMA_VERSION,
  type ReviewResultV01,
} from "@/lib/reviewResultV01";
import {
  assertCompleteReviewerIdentityV01,
  createLocalDemoReviewerV01,
} from "@/lib/reviewerIdentityV01";
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
import { getCaseFileMergeCandidates } from "@/lib/reviewRefinement";

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
  clusterRefinement?: ReviewResultV01["decisions"]["cluster_refinement"];
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
    !caseFileMatchesPackageReference(caseFile, packageReference) ||
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
  const clusterRefinement = buildClusterRefinementDecisions(
    caseFile,
    arenaReview.clusterRefinement,
  );
  const reviewResultReviewer =
    reviewer ??
    createLocalDemoReviewerV01(packageReference.package_id, packageReference.case_id);
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
    review_id: createReviewResultId(
      packageReference.package_id,
      reviewResultReviewer,
      createdAt,
    ),
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
      ...(clusterRefinement ? { cluster_refinement: clusterRefinement } : {}),
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

function caseFileMatchesPackageReference(
  caseFile: CaseFile,
  packageReference: CasePackageReferenceV01,
): boolean {
  return (
    caseFile.id === packageReference.case_id ||
    caseFile.id === createImportedCaseReviewId(packageReference)
  );
}

function createImportedCaseReviewId(
  packageReference: CasePackageReferenceV01,
): string {
  return [
    "imported",
    packageReference.package_id,
    packageReference.package_revision ?? "unrevisioned",
    packageReference.case_id,
  ].join(":");
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
  assertCompleteReviewerIdentityV01(reviewer, "ReviewResult v0.1");
}

export function serializeReviewResultExport(exportResult: ReviewResultV01): string {
  return `${JSON.stringify(exportResult, null, 2)}\n`;
}

export function getReviewResultExportFilename(caseFile: CaseFile): string {
  return `${caseFile.casePackageReference?.case_id ?? caseFile.id}-review-result.json`;
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

function buildClusterRefinementDecisions(
  caseFile: CaseFile,
  clusterRefinement: EvidenceArenaReview["clusterRefinement"],
): ReviewResultV01["decisions"]["cluster_refinement"] | undefined {
  if (!clusterRefinement) {
    return undefined;
  }

  const splitRecommendation = clusterRefinement.split_recommendation
    ? buildSplitRecommendation(caseFile, clusterRefinement.split_recommendation)
    : undefined;
  const mergeRecommendation = clusterRefinement.merge_recommendation
    ? buildMergeRecommendation(caseFile, clusterRefinement.merge_recommendation)
    : undefined;

  if (!splitRecommendation && !mergeRecommendation) {
    return undefined;
  }

  return {
    ...(splitRecommendation
      ? { split_recommendation: splitRecommendation }
      : {}),
    ...(mergeRecommendation
      ? { merge_recommendation: mergeRecommendation }
      : {}),
  };
}

function buildSplitRecommendation(
  caseFile: CaseFile,
  splitRecommendation: NonNullable<
    EvidenceArenaReview["clusterRefinement"]
  >["split_recommendation"],
): NonNullable<
  ReviewResultV01["decisions"]["cluster_refinement"]
>["split_recommendation"] {
  if (!splitRecommendation || splitRecommendation.status !== "recommended") {
    throw new Error(
      "Cannot export ReviewResult v0.1 with unsupported split recommendation status.",
    );
  }

  return {
    status: "recommended",
    reason: splitRecommendation.reason,
    ...buildOptionalReferenceArray({
      label: "split affected session",
      sourceIds: splitRecommendation.affected_session_ids,
      knownIds: caseFile.representativeSessions.map((session) => session.id),
      outputKey: "affected_session_ids",
    }),
    ...buildOptionalReferenceArray({
      label: "split evidence",
      sourceIds: splitRecommendation.evidence_ids,
      knownIds: caseFile.evidenceItems.map((evidence) => evidence.id),
      outputKey: "evidence_ids",
    }),
  };
}

function buildMergeRecommendation(
  caseFile: CaseFile,
  mergeRecommendation: NonNullable<
    EvidenceArenaReview["clusterRefinement"]
  >["merge_recommendation"],
): NonNullable<
  ReviewResultV01["decisions"]["cluster_refinement"]
>["merge_recommendation"] {
  if (!mergeRecommendation || mergeRecommendation.status !== "recommended") {
    throw new Error(
      "Cannot export ReviewResult v0.1 with unsupported merge recommendation status.",
    );
  }

  const knownMergeCandidateIds = new Set(
    getCaseFileMergeCandidates(caseFile).map((candidate) => candidate.clusterId),
  );

  if (!knownMergeCandidateIds.has(mergeRecommendation.target_neighbor_cluster_id)) {
    throw new Error(
      `Cannot export ReviewResult v0.1 with unknown merge candidate cluster ID "${mergeRecommendation.target_neighbor_cluster_id}".`,
    );
  }

  return {
    status: "recommended",
    target_neighbor_cluster_id: mergeRecommendation.target_neighbor_cluster_id,
    reason: mergeRecommendation.reason,
  };
}

function buildOptionalReferenceArray<Key extends "affected_session_ids" | "evidence_ids">({
  label,
  sourceIds,
  knownIds,
  outputKey,
}: {
  label: string;
  sourceIds: readonly string[] | undefined;
  knownIds: readonly string[];
  outputKey: Key;
}): Partial<Record<Key, string[]>> {
  if (!sourceIds || sourceIds.length === 0) {
    return {};
  }

  const knownIdSet = new Set(knownIds);
  const uniqueIds = [...new Set(sourceIds)].sort();

  for (const sourceId of uniqueIds) {
    if (!knownIdSet.has(sourceId)) {
      throw new Error(
        `Cannot export ReviewResult v0.1 with unknown ${label} ID "${sourceId}".`,
      );
    }
  }

  return { [outputKey]: uniqueIds } as Partial<Record<Key, string[]>>;
}

function createReviewResultId(
  packageId: string,
  reviewer: ReviewResultReviewer,
  createdAt: string,
): string {
  return [
    "review",
    packageId,
    reviewer.reviewer_id,
    reviewer.review_session_id,
    createdAt,
  ].join(":");
}

function requireValue<T>(value: T | undefined, label: string): T {
  if (value === undefined || value === "") {
    throw new Error(`Cannot export ReviewResult v0.1 without ${label}.`);
  }

  return value;
}
