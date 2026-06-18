import type {
  AnalystVerdict,
  CaseFile,
  DuelReason,
  EvidenceRating,
  FinalVerdict,
} from "@/lib/types";

export type EvidenceArenaReview = {
  blindChoiceId?: string;
  blindChoiceLabel?: string;
  aiLabel: string;
  blindChoiceAgreesWithAi?: boolean;
  labelDuelWinnerId?: string;
  labelDuelWinnerLabel?: string;
  duelReasons: DuelReason[];
  evidenceRatings: Record<string, EvidenceRating>;
  impostorSessionId?: string;
  impostorSessionTitle?: string;
  impostorExplanation?: string;
  failureModes: DuelReason[];
  finalVerdict?: FinalVerdict;
};

export type ReviewResultExport = {
  exportTimestamp: string;
  caseId: string;
  cluster: CaseFile["cluster"];
  topicLabel: CaseFile["topicLabel"];
  claims: CaseFile["claims"];
  evidenceItems: CaseFile["evidenceItems"];
  evidenceRelations: CaseFile["evidenceRelations"];
  supportScores: CaseFile["supportScores"];
  arenaReview?: EvidenceArenaReview;
  analystVerdict?: AnalystVerdict;
};

export type LocalAnalystVerdict = Pick<
  AnalystVerdict,
  "decision" | "reviewedAt"
> &
  Partial<Pick<AnalystVerdict, "summary" | "reviewer">>;

const localVerdictSummary =
  "Local static review decision recorded in the frontend demo.";

export function buildAnalystVerdictForExport(
  caseFile: CaseFile,
  localVerdict?: LocalAnalystVerdict,
): AnalystVerdict | undefined {
  if (!localVerdict) {
    return caseFile.analystVerdict;
  }

  return {
    decision: localVerdict.decision,
    summary: localVerdict.summary ?? localVerdictSummary,
    ...(localVerdict.reviewedAt ? { reviewedAt: localVerdict.reviewedAt } : {}),
    ...(localVerdict.reviewer ? { reviewer: localVerdict.reviewer } : {}),
  };
}

export function buildReviewResultExport({
  caseFile,
  exportTimestamp,
  arenaReview,
  localVerdict,
}: {
  caseFile: CaseFile;
  exportTimestamp: string;
  arenaReview?: EvidenceArenaReview;
  localVerdict?: LocalAnalystVerdict;
}): ReviewResultExport {
  const analystVerdict = buildAnalystVerdictForExport(caseFile, localVerdict);

  return {
    exportTimestamp,
    caseId: caseFile.id,
    cluster: caseFile.cluster,
    topicLabel: caseFile.topicLabel,
    claims: caseFile.claims,
    evidenceItems: caseFile.evidenceItems,
    evidenceRelations: caseFile.evidenceRelations,
    supportScores: caseFile.supportScores,
    ...(arenaReview ? { arenaReview } : {}),
    ...(analystVerdict ? { analystVerdict } : {}),
  };
}

export function serializeReviewResultExport(exportResult: ReviewResultExport): string {
  return `${JSON.stringify(exportResult, null, 2)}\n`;
}

export function getReviewResultExportFilename(caseFile: CaseFile): string {
  return `${caseFile.id}-review-result.json`;
}
