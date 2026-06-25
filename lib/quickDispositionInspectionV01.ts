import type {
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

export function inspectQuickDispositionV01(
  quickDisposition: QuickDispositionV01,
): QuickDispositionImportInspectionSummaryV01 {
  return {
    artifactType: "QuickDisposition",
    artifactSchemaVersion: quickDisposition.schema_version,
    resultCount: 1,
    uniqueReviewerSessionCount: 1,
    reviewerSessions: [
      {
        reviewerId: quickDisposition.reviewer.reviewer_id,
        reviewSessionId: quickDisposition.reviewer.review_session_id,
      },
    ],
    referencedPackageIds: [quickDisposition.case_package.package_id],
    referencedCaseIds: [quickDisposition.case_package.case_id],
    casePackageSchemaVersions: [quickDisposition.case_package.schema_version],
    sourceStages: [quickDisposition.source_stage],
    dispositionDistribution: toCountDistribution([
      quickDisposition.disposition,
    ]),
    reasonCodeCounts: toCountDistribution(quickDisposition.reason_codes),
    compatibilitySummary: {
      status: "compatible",
      message:
        "Strict validation confirmed one quick disposition. It can be stored locally but is not aggregated as a full ReviewResult.",
    },
    warnings: [],
  };
}

function toCountDistribution(
  values: readonly (string | QuickDispositionValueV01)[],
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
