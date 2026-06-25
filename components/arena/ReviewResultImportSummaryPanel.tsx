import type { ReviewResultImportInspectionSummaryV01 } from "@/lib/reviewResultInspectionV01";

type ReviewResultImportSummaryPanelProps = {
  summary: ReviewResultImportInspectionSummaryV01;
  titleId: string;
  variant?: "popover" | "inline";
};

export function ReviewResultImportSummaryPanel({
  summary,
  titleId,
  variant = "popover",
}: ReviewResultImportSummaryPanelProps) {
  const facts = getReviewResultImportSummaryFacts(summary);

  return (
    <section
      className={`review-result-import-summary-panel is-${variant}`}
      aria-labelledby={titleId}
    >
      <div className="review-result-import-summary-header">
        <p className="review-result-import-summary-kicker">
          {summary.compatibilitySummary.status}
        </p>
        <h2 id={titleId}>Imported ReviewResult summary</h2>
        <p>{summary.compatibilitySummary.message}</p>
      </div>

      <dl className="review-result-import-summary-facts">
        {facts.map((fact) => (
          <div key={fact.label}>
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>

      {summary.warnings.length > 0 ? (
        <div className="review-result-import-summary-warnings">
          <strong>Validation warnings</strong>
          <ul>
            {summary.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function getReviewResultImportSummaryFacts(
  summary: ReviewResultImportInspectionSummaryV01,
): Array<{ label: string; value: string }> {
  return [
    { label: "Import artifact", value: summary.artifactType },
    { label: "Artifact depth", value: "Full evidence ReviewResult" },
    { label: "Artifact schema", value: summary.artifactSchemaVersion },
    summary.bundleId ? { label: "Bundle ID", value: summary.bundleId } : null,
    { label: "Result count", value: String(summary.resultCount) },
    {
      label: "Reviewer sessions",
      value: String(summary.uniqueReviewerSessionCount),
    },
    {
      label: "CasePackage IDs",
      value: formatList(summary.referencedPackageIds),
    },
    { label: "Case IDs", value: formatList(summary.referencedCaseIds) },
    {
      label: "Package schema versions",
      value: formatList(summary.casePackageSchemaVersions),
    },
    {
      label: "ReviewResult schema versions",
      value: formatList(summary.reviewResultSchemaVersions),
    },
    {
      label: "Review protocol versions",
      value: formatList(summary.reviewProtocolVersions),
    },
    {
      label: "Package references",
      value: formatPackageReferences(summary),
    },
    {
      label: "Verdict distribution",
      value: formatCounts(summary.verdictDistribution),
    },
    {
      label: "Confidence summary",
      value: formatConfidenceSummary(summary),
    },
    {
      label: "Failure modes",
      value: summary.failureModeCounts.length > 0
        ? formatCounts(summary.failureModeCounts)
        : "None selected",
    },
  ].filter((fact): fact is { label: string; value: string } => fact !== null);
}

function formatPackageReferences(
  summary: ReviewResultImportInspectionSummaryV01,
): string {
  return summary.casePackageReferences
    .map((reference) => {
      const revision = reference.packageRevision
        ? ` (${reference.packageRevision})`
        : "";

      return [
        `${reference.packageId}${revision}`,
        reference.caseId,
        reference.pipelineRunId,
      ].join(" / ");
    })
    .join("; ");
}

function formatConfidenceSummary(
  summary: ReviewResultImportInspectionSummaryV01,
): string {
  const { capturedCount, missingCount, distribution } = summary.confidenceSummary;
  const distributionText =
    distribution.length > 0 ? formatCounts(distribution) : "none captured";

  return `${capturedCount} captured, ${missingCount} missing (${distributionText})`;
}

function formatCounts(
  counts: ReviewResultImportInspectionSummaryV01["verdictDistribution"],
): string {
  return counts.map(({ value, count }) => `${value}: ${count}`).join(", ");
}

function formatList(values: readonly string[]): string {
  return values.length > 0 ? values.join(", ") : "None";
}
