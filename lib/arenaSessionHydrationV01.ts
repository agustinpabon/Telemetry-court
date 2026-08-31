import type { CaseReviewState } from "@/lib/arenaReviewState";
import { reviewReadinessOptions } from "@/lib/reviewReadiness";
import { getCaseFileMergeCandidates } from "@/lib/reviewRefinement";
import {
  MERGE_RECOMMENDATION_REASONS,
  SPLIT_RECOMMENDATION_REASONS,
  type CaseFile,
  type DuelReason,
  type EvidenceRating,
  type FinalVerdict,
} from "@/lib/types";

const evidenceRatingValues = [
  "supports_label",
  "weak_support",
  "irrelevant_noise",
  "contradicts_label",
  "needs_context",
] as const satisfies readonly EvidenceRating[];

const duelReasonValues = [
  "better_supported",
  "less_overclaimed",
  "more_specific",
  "too_broad",
  "missing_evidence",
  "missing_malicious_intent",
  "missing_downstream_abuse",
  "preserves_uncertainty",
  "cluster_seems_mixed",
] as const satisfies readonly DuelReason[];

const finalVerdictValues = [
  "supported",
  "partially_supported",
  "unsupported_overclaimed",
  "uncertain",
  "cluster_impure",
  "needs_split",
  "needs_merge",
  "needs_better_evidence",
] as const satisfies readonly FinalVerdict[];

export function sanitizeHydratedReviewsForCases(
  cases: CaseFile[],
  value: unknown,
): Partial<Record<string, CaseReviewState>> | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!isObjectRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    cases.flatMap((caseFile) => {
      const review = sanitizeHydratedReview(caseFile, value[caseFile.id]);
      return review ? [[caseFile.id, review] as const] : [];
    }),
  );
}

function sanitizeHydratedReview(
  caseFile: CaseFile,
  value: unknown,
): CaseReviewState | undefined {
  if (!isObjectRecord(value)) {
    return undefined;
  }

  const reviewReadiness = isOneOf(
    value.reviewReadiness,
    reviewReadinessOptions.map((option) => option.id),
  )
    ? value.reviewReadiness
    : undefined;
  const blindChoiceId = readKnownId(
    value.blindChoiceId,
    caseFile.blindInterpretationOptions.map((option) => option.id),
  );
  const labelDuelWinnerId = readKnownId(
    value.labelDuelWinnerId,
    caseFile.candidateLabels.map((candidate) => candidate.id),
  );
  const impostorSessionId = readKnownId(
    value.impostorSessionId,
    caseFile.representativeSessions.map((session) => session.id),
  );
  const evidenceRatings = sanitizeEvidenceRatings(
    caseFile,
    value.evidenceRatings,
  );
  const duelReasons = sanitizeEnumArray(value.duelReasons, duelReasonValues);
  const failureModes = sanitizeEnumArray(
    value.failureModes,
    caseFile.failureModes,
  );
  const finalVerdict = isOneOf(value.finalVerdict, finalVerdictValues)
    ? value.finalVerdict
    : undefined;
  const clusterRefinement = sanitizeClusterRefinement(
    caseFile,
    value.clusterRefinement,
  );

  return {
    ...(reviewReadiness ? { reviewReadiness } : {}),
    ...(blindChoiceId ? { blindChoiceId } : {}),
    ...(typeof value.aiLabelRevealed === "boolean"
      ? { aiLabelRevealed: value.aiLabelRevealed }
      : {}),
    ...(evidenceRatings ? { evidenceRatings } : {}),
    ...(labelDuelWinnerId ? { labelDuelWinnerId } : {}),
    ...(duelReasons ? { duelReasons } : {}),
    ...(typeof value.duelNote === "string" && value.duelNote.trim()
      ? { duelNote: value.duelNote }
      : {}),
    ...(impostorSessionId ? { impostorSessionId } : {}),
    ...(impostorSessionId &&
    typeof value.nonCandidateImpostorConfirmed === "boolean"
      ? { nonCandidateImpostorConfirmed: value.nonCandidateImpostorConfirmed }
      : {}),
    ...(failureModes ? { failureModes } : {}),
    ...(finalVerdict ? { finalVerdict } : {}),
    ...(clusterRefinement ? { clusterRefinement } : {}),
  };
}

function sanitizeEvidenceRatings(
  caseFile: CaseFile,
  value: unknown,
): Record<string, EvidenceRating> | undefined {
  if (!isObjectRecord(value)) {
    return undefined;
  }

  const ratings = Object.fromEntries(
    caseFile.evidenceItems.flatMap((evidence) => {
      const rating = value[evidence.id];
      return isOneOf(rating, evidenceRatingValues)
        ? [[evidence.id, rating] as const]
        : [];
    }),
  );

  return Object.keys(ratings).length > 0 ? ratings : undefined;
}

function sanitizeClusterRefinement(
  caseFile: CaseFile,
  value: unknown,
): CaseReviewState["clusterRefinement"] {
  if (!isObjectRecord(value)) {
    return undefined;
  }

  const split = isObjectRecord(value.splitRecommendation)
    ? value.splitRecommendation
    : undefined;
  const merge = isObjectRecord(value.mergeRecommendation)
    ? value.mergeRecommendation
    : undefined;
  const splitReason =
    split?.status === "recommended" &&
    isOneOf(split.reason, SPLIT_RECOMMENDATION_REASONS)
      ? split.reason
      : undefined;
  const mergeTarget = readKnownId(
    merge?.targetNeighborClusterId,
    getCaseFileMergeCandidates(caseFile).map((candidate) => candidate.clusterId),
  );
  const mergeReason =
    merge?.status === "recommended" &&
    isOneOf(merge.reason, MERGE_RECOMMENDATION_REASONS)
      ? merge.reason
      : undefined;
  const splitRecommendation = splitReason
    ? {
        status: "recommended" as const,
        reason: splitReason,
        ...readOptionalKnownIdArray(
          "affectedSessionIds",
          split?.affectedSessionIds,
          caseFile.representativeSessions.map((session) => session.id),
        ),
        ...readOptionalKnownIdArray(
          "evidenceIds",
          split?.evidenceIds,
          caseFile.evidenceItems.map((evidence) => evidence.id),
        ),
      }
    : undefined;
  const mergeRecommendation =
    mergeTarget && mergeReason
      ? {
          status: "recommended" as const,
          targetNeighborClusterId: mergeTarget,
          reason: mergeReason,
        }
      : undefined;

  return splitRecommendation || mergeRecommendation
    ? {
        ...(splitRecommendation ? { splitRecommendation } : {}),
        ...(mergeRecommendation ? { mergeRecommendation } : {}),
      }
    : undefined;
}

function readOptionalKnownIdArray<Key extends string>(
  key: Key,
  value: unknown,
  allowedIds: readonly string[],
): Partial<Record<Key, string[]>> {
  if (!Array.isArray(value)) {
    return {};
  }

  const ids = [
    ...new Set(
      value.filter(
        (candidate): candidate is string =>
          typeof candidate === "string" && allowedIds.includes(candidate),
      ),
    ),
  ];

  return ids.length > 0 ? ({ [key]: ids } as Record<Key, string[]>) : {};
}

function sanitizeEnumArray<Value extends string>(
  value: unknown,
  allowedValues: readonly Value[],
): Value[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return [
    ...new Set(
      value.filter(
        (candidate): candidate is Value => isOneOf(candidate, allowedValues),
      ),
    ),
  ];
}

function readKnownId(
  value: unknown,
  allowedIds: readonly string[],
): string | undefined {
  return typeof value === "string" && allowedIds.includes(value)
    ? value
    : undefined;
}

function isOneOf<Value extends string>(
  value: unknown,
  allowedValues: readonly Value[],
): value is Value {
  return typeof value === "string" && allowedValues.includes(value as Value);
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
