import type { ReviewResultBundleV01 } from "@/lib/reviewResultBundleV01";
import type { ReviewResultV01 } from "@/lib/reviewResultV01";
import {
  getReviewResultSemanticWarningsV01,
  type ReviewResultSemanticCaseContextV01,
  type ReviewResultSemanticWarningV01,
} from "@/lib/reviewResultSemanticWarningsV01";

export type ReviewResultInspectionCount = {
  value: string;
  count: number;
};

export type ReviewResultCasePackageInspectionReference = {
  packageId: string;
  packageRevision?: string;
  caseId: string;
  clusterId: string;
  pipelineRunId: string;
  upstreamTool: string;
};

export type ReviewResultReviewerInspectionReference = {
  reviewerId: string;
  reviewSessionId: string;
};

export type ReviewResultImportInspectionSummaryV01 = {
  artifactType: "ReviewResult" | "ReviewResultBundle";
  artifactSchemaVersion: string;
  bundleId?: string;
  resultCount: number;
  uniqueReviewerSessionCount: number;
  reviewerSessions: ReviewResultReviewerInspectionReference[];
  referencedPackageIds: string[];
  referencedCaseIds: string[];
  reviewResultSchemaVersions: string[];
  casePackageSchemaVersions: string[];
  reviewProtocolVersions: string[];
  casePackageReferences: ReviewResultCasePackageInspectionReference[];
  verdictDistribution: ReviewResultInspectionCount[];
  confidenceSummary: {
    capturedCount: number;
    missingCount: number;
    distribution: ReviewResultInspectionCount[];
  };
  failureModeCounts: ReviewResultInspectionCount[];
  compatibilitySummary: {
    status: "compatible";
    message: string;
  };
  warnings: ReviewResultSemanticWarningV01[];
};

export function inspectReviewResultV01(
  reviewResult: ReviewResultV01,
  options: ReviewResultInspectionOptionsV01 = {},
): ReviewResultImportInspectionSummaryV01 {
  return inspectReviewResults({
    artifactType: "ReviewResult",
    artifactSchemaVersion: reviewResult.schema_version,
    reviewResults: [reviewResult],
    caseContext: options.caseContext,
    compatibilityMessage:
      "Strict validation confirmed one single validated ReviewResult: a full evidence ReviewResult artifact. It can be stored locally and aggregated as a single-review report until compatible peer results are added.",
  });
}

export function inspectReviewResultBundleV01(
  bundle: ReviewResultBundleV01,
  options: ReviewResultInspectionOptionsV01 = {},
): ReviewResultImportInspectionSummaryV01 {
  return inspectReviewResults({
    artifactType: "ReviewResultBundle",
    artifactSchemaVersion: bundle.schema_version,
    bundleId: bundle.metadata.bundle_id,
    reviewResults: bundle.review_results,
    caseContext: options.caseContext,
    compatibilityMessage:
      "Strict validation confirmed full evidence ReviewResult artifacts with one compatible CasePackage/protocol/evidence set for local aggregation.",
  });
}

export type ReviewResultInspectionOptionsV01 = {
  caseContext?: ReviewResultSemanticCaseContextV01;
};

function inspectReviewResults({
  artifactType,
  artifactSchemaVersion,
  bundleId,
  reviewResults,
  caseContext,
  compatibilityMessage,
}: {
  artifactType: ReviewResultImportInspectionSummaryV01["artifactType"];
  artifactSchemaVersion: string;
  bundleId?: string;
  reviewResults: readonly ReviewResultV01[];
  caseContext?: ReviewResultSemanticCaseContextV01;
  compatibilityMessage: string;
}): ReviewResultImportInspectionSummaryV01 {
  return {
    artifactType,
    artifactSchemaVersion,
    bundleId,
    resultCount: reviewResults.length,
    uniqueReviewerSessionCount: countUniqueReviewerSessions(reviewResults),
    reviewerSessions: getReviewerSessions(reviewResults),
    referencedPackageIds: uniqueSorted(
      reviewResults.map((reviewResult) => reviewResult.case_package.package_id),
    ),
    referencedCaseIds: uniqueSorted(
      reviewResults.map((reviewResult) => reviewResult.case_package.case_id),
    ),
    reviewResultSchemaVersions: uniqueSorted(
      reviewResults.map((reviewResult) => reviewResult.schema_version),
    ),
    casePackageSchemaVersions: uniqueSorted(
      reviewResults.map((reviewResult) => reviewResult.case_package.schema_version),
    ),
    reviewProtocolVersions: uniqueSorted(
      reviewResults.map((reviewResult) => reviewResult.protocol.protocol_version),
    ),
    casePackageReferences: getCasePackageReferences(reviewResults),
    verdictDistribution: toCountDistribution(
      reviewResults.map((reviewResult) => reviewResult.decisions.final_verdict),
    ),
    confidenceSummary: getConfidenceSummary(reviewResults),
    failureModeCounts: toCountDistribution(
      reviewResults.flatMap(
        (reviewResult) => reviewResult.decisions.failure_modes,
      ),
    ),
    compatibilitySummary: {
      status: "compatible",
      message: compatibilityMessage,
    },
    warnings: reviewResults.flatMap((reviewResult) =>
      getReviewResultSemanticWarningsV01(reviewResult, { caseContext }),
    ),
  };
}

function getReviewerSessions(
  reviewResults: readonly ReviewResultV01[],
): ReviewResultReviewerInspectionReference[] {
  const reviewers = new Map<string, ReviewResultReviewerInspectionReference>();

  for (const reviewResult of reviewResults) {
    const reviewer = {
      reviewerId: reviewResult.reviewer.reviewer_id,
      reviewSessionId: reviewResult.reviewer.review_session_id,
    };
    reviewers.set(`${reviewer.reviewerId}\u0000${reviewer.reviewSessionId}`, reviewer);
  }

  return [...reviewers.values()].sort(
    (left, right) =>
      left.reviewerId.localeCompare(right.reviewerId) ||
      left.reviewSessionId.localeCompare(right.reviewSessionId),
  );
}

function countUniqueReviewerSessions(
  reviewResults: readonly ReviewResultV01[],
): number {
  return new Set(
    reviewResults.map(
      (reviewResult) =>
        `${reviewResult.reviewer.reviewer_id}:${reviewResult.reviewer.review_session_id}`,
    ),
  ).size;
}

function getCasePackageReferences(
  reviewResults: readonly ReviewResultV01[],
): ReviewResultCasePackageInspectionReference[] {
  const references = new Map<string, ReviewResultCasePackageInspectionReference>();

  for (const reviewResult of reviewResults) {
    const { case_package: casePackage } = reviewResult;
    const reference: ReviewResultCasePackageInspectionReference = {
      packageId: casePackage.package_id,
      packageRevision: casePackage.package_revision,
      caseId: casePackage.case_id,
      clusterId: casePackage.cluster_id,
      pipelineRunId: casePackage.pipeline.run_id,
      upstreamTool: casePackage.pipeline.upstream_tool,
    };
    const key = [
      reference.packageId,
      reference.packageRevision ?? "",
      reference.caseId,
      reference.clusterId,
      reference.pipelineRunId,
      reference.upstreamTool,
    ].join("\u0000");

    references.set(key, reference);
  }

  return [...references.values()].sort((left, right) =>
    left.packageId.localeCompare(right.packageId) ||
    (left.packageRevision ?? "").localeCompare(right.packageRevision ?? "") ||
    left.caseId.localeCompare(right.caseId) ||
    left.clusterId.localeCompare(right.clusterId) ||
    left.pipelineRunId.localeCompare(right.pipelineRunId) ||
    left.upstreamTool.localeCompare(right.upstreamTool),
  );
}

function getConfidenceSummary(reviewResults: readonly ReviewResultV01[]) {
  const capturedConfidence = reviewResults
    .map((reviewResult) => reviewResult.decisions.confidence?.level)
    .filter((level): level is NonNullable<typeof level> => Boolean(level));

  return {
    capturedCount: capturedConfidence.length,
    missingCount: reviewResults.length - capturedConfidence.length,
    distribution: toCountDistribution(capturedConfidence),
  };
}

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

function toCountDistribution(
  values: readonly string[],
): ReviewResultInspectionCount[] {
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
