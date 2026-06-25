import type {
  QuickDispositionReasonCodeV01,
  QuickDispositionSourceStageV01,
  QuickDispositionV01,
  QuickDispositionValueV01,
} from "@/lib/quickDispositionV01";

export type QuickDispositionInspectionCount = {
  value: string;
  count: number;
};

export type QuickDispositionImportInspectionSummaryV01 = {
  artifactType: "QuickDisposition";
  artifactSchemaVersion: string;
  resultCount: number;
  uniqueReviewerSessionCount: number;
  reviewerSessions: Array<{
    reviewerId: string;
    reviewSessionId: string;
  }>;
  referencedPackageIds: string[];
  referencedCaseIds: string[];
  casePackageSchemaVersions: string[];
  sourceStages: string[];
  dispositionDistribution: QuickDispositionInspectionCount[];
  reasonCodeCounts: QuickDispositionInspectionCount[];
  compatibilitySummary: {
    status: "compatible";
    message: string;
  };
  warnings: string[];
};

export type QuickDispositionReviewerSessionV01 = {
  reviewerId: string;
  reviewSessionId: string;
};

export type QuickDispositionSummaryV01 = {
  dispositionCounts: QuickDispositionInspectionCount[];
  sourceStageCounts: QuickDispositionInspectionCount[];
  reasonCodeCounts: QuickDispositionInspectionCount[];
  uniqueReviewerSessionCount: number;
  reviewerSessions: QuickDispositionReviewerSessionV01[];
  escalationCount: number;
  escalationRate: number;
};

export function inspectQuickDispositionV01(
  quickDisposition: QuickDispositionV01,
): QuickDispositionImportInspectionSummaryV01 {
  const summary = summarizeQuickDispositionsV01([quickDisposition]);

  return {
    artifactType: "QuickDisposition",
    artifactSchemaVersion: quickDisposition.schema_version,
    resultCount: 1,
    uniqueReviewerSessionCount: summary.uniqueReviewerSessionCount,
    reviewerSessions: summary.reviewerSessions,
    referencedPackageIds: [quickDisposition.case_package.package_id],
    referencedCaseIds: [quickDisposition.case_package.case_id],
    casePackageSchemaVersions: [quickDisposition.case_package.schema_version],
    sourceStages: [quickDisposition.source_stage],
    dispositionDistribution: summary.dispositionCounts,
    reasonCodeCounts: summary.reasonCodeCounts,
    compatibilitySummary: {
      status: "compatible",
      message:
        "Strict validation confirmed one quick disposition artifact. It is stored separately and excluded from full evidence ReviewResult aggregation.",
    },
    warnings: [],
  };
}

export function summarizeQuickDispositionsV01(
  quickDispositions: readonly QuickDispositionV01[],
): QuickDispositionSummaryV01 {
  const escalationCount = quickDispositions.filter(
    ({ disposition }) => disposition === "escalate_to_full_review",
  ).length;
  const reviewerSessions = getReviewerSessions(quickDispositions);

  return {
    dispositionCounts: toCountDistribution(
      quickDispositions.map(({ disposition }) => disposition),
    ),
    sourceStageCounts: toCountDistribution(
      quickDispositions.map(({ source_stage: sourceStage }) => sourceStage),
    ),
    reasonCodeCounts: toCountDistribution(
      quickDispositions.flatMap(({ reason_codes: reasonCodes }) => reasonCodes),
    ),
    uniqueReviewerSessionCount: reviewerSessions.length,
    reviewerSessions,
    escalationCount,
    escalationRate:
      quickDispositions.length > 0
        ? escalationCount / quickDispositions.length
        : 0,
  };
}

function getReviewerSessions(
  quickDispositions: readonly QuickDispositionV01[],
): QuickDispositionReviewerSessionV01[] {
  const reviewerSessions = new Map<
    string,
    QuickDispositionReviewerSessionV01
  >();

  for (const quickDisposition of quickDispositions) {
    const reviewerSession = {
      reviewerId: quickDisposition.reviewer.reviewer_id,
      reviewSessionId: quickDisposition.reviewer.review_session_id,
    };
    reviewerSessions.set(
      `${reviewerSession.reviewerId}\u0000${reviewerSession.reviewSessionId}`,
      reviewerSession,
    );
  }

  return [...reviewerSessions.values()].sort(
    (left, right) =>
      left.reviewerId.localeCompare(right.reviewerId) ||
      left.reviewSessionId.localeCompare(right.reviewSessionId),
  );
}

function toCountDistribution(
  values: readonly (
    | string
    | QuickDispositionValueV01
    | QuickDispositionSourceStageV01
    | QuickDispositionReasonCodeV01
  )[],
): QuickDispositionInspectionCount[] {
  const counts = new Map<string, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort(
      (left, right) =>
        right.count - left.count || left.value.localeCompare(right.value),
    );
}
