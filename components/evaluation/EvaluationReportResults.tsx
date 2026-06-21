import {
  ArenaStatusBadge,
  ArenaWorkflowShell,
  MetricCard,
  SectionHeader,
} from "@/components/arena/WorkflowPrimitives";
import { EvaluationReportExportActions } from "@/components/evaluation/EvaluationReportExportActions";
import type {
  ComparisonDimensionV01,
  EvaluationReportV01,
  ReviewerAgreementSignalV01,
} from "@/lib/evaluationReportV01";
import type {
  CasePackageEvidenceRatingV01,
  CasePackageVerdictV01,
} from "@/lib/types";

type EvaluationReportResultsProps = {
  report: EvaluationReportV01;
};

const verdictLabels: Record<CasePackageVerdictV01, string> = {
  supported: "Supported",
  partially_supported: "Partially supported",
  unsupported_or_overclaimed: "Unsupported or overclaimed",
  uncertain: "Uncertain",
  cluster_impure: "Cluster impure",
  needs_split: "Needs split",
  needs_merge: "Needs merge",
  needs_better_evidence: "Needs better evidence",
};

const evidenceRatingLabels: Record<CasePackageEvidenceRatingV01, string> = {
  supports: "Supports",
  weak_support: "Weak support",
  irrelevant: "Irrelevant",
  contradicts: "Contradicts",
  insufficient: "Insufficient",
  needs_more_context: "Needs more context",
};

const comparisonDimensionLabels: Record<ComparisonDimensionV01, string> = {
  selected_label_id: "Selected label",
  package_id: "Evidence package",
  package_revision: "Evidence package revision",
  pipeline_id: "Pipeline",
  pipeline_run_id: "Pipeline run",
  upstream_tool: "Upstream tool",
  pipeline_version: "Pipeline version",
  embedding_model: "Embedding model",
  clustering_method: "Clustering method",
  dimensionality_reduction_method: "Dimensionality reduction",
  naming_model: "Naming model",
  prompt_id: "Prompt",
  prompt_version: "Prompt version",
  prompt_digest: "Prompt digest",
};

export function EvaluationReportResults({ report }: EvaluationReportResultsProps) {
  const hasReviewerOutput = report.reviewer_count > 0;
  const verdictTotal = sumCounts(report.verdict_distribution);
  const evidenceRatingTotal = sumCounts(report.evidence_rating_distribution);
  const hasComparableReviews = report.reviewer_count >= 2;
  const reportStatus = getReportStatus(report, hasReviewerOutput);

  return (
    <ArenaWorkflowShell
      className="evaluation-report-stage"
      ariaLabel="Evaluation Report"
    >
      <header className="evaluation-report-hero">
        <div>
          <p className="eyebrow">Evaluation Report</p>
          <h2>Aggregated reviewer results</h2>
          <p>
            Review how compatible ReviewResult artifacts agree, diverge, and
            describe the same CasePackage reference.
          </p>
        </div>
        <div className="evaluation-report-hero-actions">
          <ArenaStatusBadge tone={reportStatus.tone}>
            {reportStatus.label}
          </ArenaStatusBadge>
          <EvaluationReportExportActions report={report} />
        </div>
      </header>

      <section
        className="evaluation-report-boundary"
        aria-label="EvaluationReport boundary"
      >
        <strong>Reviewer output, not upstream evidence</strong>
        <p>
          This view summarizes ReviewResult decisions and stable references only.
          It does not display claims, evidence content, raw telemetry, or upstream
          CasePackage evidence.
        </p>
      </section>

      <section className="evaluation-report-metrics" aria-label="Report metadata">
        <MetricCard
          label="Reviewer count"
          value={
            hasReviewerOutput
              ? formatCount(report.reviewer_count, "reviewer", "reviewers")
              : "Reviewer output unavailable"
          }
          detail="Compatible ReviewResult artifacts in this report."
        />
        <MetricCard
          label="Source reviews"
          value={
            report.source_review_ids.length > 0
              ? formatCount(report.source_review_ids.length, "review", "reviews")
              : "Unavailable"
          }
          detail="Count only; source IDs are retained in the artifact for audit."
        />
        <MetricCard
          label="Calculation"
          value={report.calculation_version}
          detail="Versioned aggregation, not consensus or scoring."
        />
      </section>

      <DistributionSection
        title="Verdict distribution"
        description="One structured final verdict per reviewer, preserved as counts."
        unavailableLabel="Verdict distribution unavailable"
        entries={Object.entries(report.verdict_distribution).map(
          ([value, count]) => ({
            label: verdictLabels[value as CasePackageVerdictV01],
            count,
            unitSingular: "reviewer selection",
            unitPlural: "reviewer selections",
          }),
        )}
        total={verdictTotal}
      />

      <section
        className="evaluation-report-section"
        aria-label="Label winner distribution"
      >
        <SectionHeader
          title="Label winner distribution"
          description="Reviewer-selected candidate labels by stable label reference."
        />
        {report.label_winner_distribution.length > 0 ? (
          <ol className="evaluation-report-list">
            {report.label_winner_distribution.map((entry) => (
              <li key={entry.label_id}>
                <span>{entry.label_id}</span>
                <strong>
                  {formatCount(entry.count, "reviewer selection", "reviewer selections")}
                </strong>
              </li>
            ))}
          </ol>
        ) : (
          <UnavailableState label="Label winner distribution unavailable" />
        )}
      </section>

      <DistributionSection
        title="Evidence rating distribution"
        description="Reviewer ratings over evidence references. This is not evidence content."
        unavailableLabel="Evidence rating distribution unavailable"
        entries={Object.entries(report.evidence_rating_distribution).map(
          ([value, count]) => ({
            label: evidenceRatingLabels[value as CasePackageEvidenceRatingV01],
            count,
            unitSingular: "decision",
            unitPlural: "decisions",
          }),
        )}
        total={evidenceRatingTotal}
      />

      <ReviewerAgreementSection
        report={report}
        hasReviewerOutput={hasReviewerOutput}
      />

      <ComparisonRollupsSection
        report={report}
        hasReviewerOutput={hasReviewerOutput}
      />

      <section
        className="evaluation-report-section evaluation-report-disagreement"
        aria-label="Disagreement indicators"
      >
        <SectionHeader
          title="Disagreement indicators"
          description="Flags show where reviewers selected different values. They do not choose a winner."
        />
        {hasComparableReviews ? (
          <>
            <div className="evaluation-disagreement-grid">
              <DisagreementFlag
                label="Verdict"
                active={report.disagreement.verdict}
              />
              <DisagreementFlag
                label="Recommended action"
                active={report.disagreement.recommended_action}
              />
              <DisagreementFlag
                label="Label winner"
                active={report.disagreement.label_winner}
              />
              <DisagreementFlag
                label="Evidence ratings"
                active={report.disagreement.evidence_ratings}
              />
            </div>
            {report.disagreement.evidence_ids.length > 0 ? (
              <p className="evaluation-reference-note">
                Evidence rating disagreement references:{" "}
                {report.disagreement.evidence_ids.join(", ")}. These are stable
                references only.
              </p>
            ) : (
              <p className="evaluation-reference-note">
                No evidence-rating disagreement references were reported.
              </p>
            )}
          </>
        ) : (
          <UnavailableState label="Disagreement comparison unavailable" />
        )}
      </section>
    </ArenaWorkflowShell>
  );
}

function ReviewerAgreementSection({
  report,
  hasReviewerOutput,
}: {
  report: EvaluationReportV01;
  hasReviewerOutput: boolean;
}) {
  return (
    <section className="evaluation-report-section" aria-label="Reviewer agreement">
      <SectionHeader
        title="Reviewer agreement"
        description="Descriptive reviewer comparisons with observed values and coverage. Agreement does not establish a correct answer."
      />
      {hasReviewerOutput ? (
        <div className="evaluation-comparison-list">
          <AgreementSignalRow
            label="Final verdict"
            signal={report.reviewer_agreement.verdict}
            valueLabels={verdictLabels}
          />
          <AgreementSignalRow
            label="Label winner"
            signal={report.reviewer_agreement.label_winner}
          />
          <AgreementSignalRow
            label="Major failure mode"
            signal={report.reviewer_agreement.major_failure_mode}
            humanizeValues
          />
          {report.reviewer_agreement.evidence_ratings.map((evidence) => (
            <AgreementSignalRow
              key={evidence.evidence_id}
              label={`Evidence ${evidence.evidence_id}`}
              signal={evidence}
              valueLabels={evidenceRatingLabels}
              disputed={evidence.disputed}
            />
          ))}
        </div>
      ) : (
        <UnavailableState label="Reviewer agreement unavailable" />
      )}
    </section>
  );
}

function AgreementSignalRow({
  label,
  signal,
  valueLabels,
  disputed = false,
  humanizeValues = false,
}: {
  label: string;
  signal: ReviewerAgreementSignalV01;
  valueLabels?: Record<string, string>;
  disputed?: boolean;
  humanizeValues?: boolean;
}) {
  return (
    <article className="evaluation-comparison-row">
      <header>
        <strong>{label}</strong>
        <span>{formatAgreementState(signal, disputed)}</span>
      </header>
      <div className="evaluation-comparison-groups">
        <p>
          Compared: {formatCount(signal.compared_review_count, "review", "reviews")};
          unavailable: {formatCount(
            signal.unavailable_review_count,
            "review",
            "reviews",
          )}.
        </p>
        <p>
          Observed values: {formatAgreementValues(
            signal.values,
            valueLabels,
            humanizeValues,
          )}.
        </p>
        {signal.reason ? <p>{signal.reason}</p> : null}
      </div>
    </article>
  );
}

function formatAgreementState(
  signal: ReviewerAgreementSignalV01,
  disputed: boolean,
) {
  if (signal.status === "incomplete") {
    return disputed ? "Disputed, incomplete coverage" : "Incomplete comparison";
  }

  if (signal.status === "unavailable" || signal.unanimous === null) {
    return "Unavailable";
  }

  if (disputed || !signal.unanimous) {
    return "Disputed";
  }

  return "Unanimous";
}

function formatAgreementValues(
  values: ReviewerAgreementSignalV01["values"],
  labels?: Record<string, string>,
  humanizeValues = false,
) {
  if (values.length === 0) {
    return "none available";
  }

  return values
    .map(({ value, review_count: reviewCount }) =>
      `${labels?.[value] ?? (humanizeValues ? formatAgreementValue(value) : value)}: ${reviewCount}`,
    )
    .join(", ");
}

function formatAgreementValue(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function ComparisonRollupsSection({
  report,
  hasReviewerOutput,
}: {
  report: EvaluationReportV01;
  hasReviewerOutput: boolean;
}) {
  return (
    <section
      className="evaluation-report-section"
      aria-label="Metadata comparison rollups"
    >
      <SectionHeader
        title="Metadata comparison rollups"
        description="Descriptive reviewer signals grouped by metadata already present in ReviewResults. Single-value groups provide context, not a cross-variant ranking."
      />
      {hasReviewerOutput && report.comparison_rollups.length > 0 ? (
        <div className="evaluation-comparison-list">
          {report.comparison_rollups.map((rollup) => (
            <article
              className="evaluation-comparison-row"
              key={rollup.dimension}
            >
              <header>
                <strong>{comparisonDimensionLabels[rollup.dimension]}</strong>
                <span>
                  {rollup.status === "unavailable"
                    ? "Unavailable"
                    : formatComparisonValueCount(rollup.groups.length)}
                </span>
              </header>
              {rollup.status === "unavailable" ? (
                <p>{rollup.reason}</p>
              ) : (
                <div className="evaluation-comparison-groups">
                  {rollup.groups.map((group) => (
                    <div key={group.value}>
                      <strong>{group.value}</strong>
                      <p>
                        {formatCount(group.review_count, "review", "reviews")};{" "}
                        {formatCount(
                          group.evidence_decision_count,
                          "evidence decision",
                          "evidence decisions",
                        )}
                      </p>
                      <p>
                        Verdicts: {formatNonzeroDistribution(
                          group.verdict_distribution,
                          verdictLabels,
                        )}
                      </p>
                      <p>
                        Evidence ratings: {formatNonzeroDistribution(
                          group.evidence_rating_distribution,
                          evidenceRatingLabels,
                        )}
                      </p>
                    </div>
                  ))}
                  {rollup.missing_review_count > 0 ? (
                    <p>
                      Missing metadata: {formatCount(
                        rollup.missing_review_count,
                        "review",
                        "reviews",
                      )}
                    </p>
                  ) : null}
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <UnavailableState label="Comparison rollups unavailable" />
      )}
    </section>
  );
}

type DistributionEntry = {
  label: string;
  count: number;
  unitSingular: string;
  unitPlural: string;
};

function DistributionSection({
  title,
  description,
  unavailableLabel,
  entries,
  total,
}: {
  title: string;
  description: string;
  unavailableLabel: string;
  entries: DistributionEntry[];
  total: number;
}) {
  return (
    <section className="evaluation-report-section" aria-label={title}>
      <SectionHeader title={title} description={description} />
      {total > 0 ? (
        <ol className="evaluation-report-list">
          {entries.map((entry) => (
            <li key={entry.label}>
              <span>{entry.label}</span>
              <strong>
                {formatCount(entry.count, entry.unitSingular, entry.unitPlural)}
              </strong>
            </li>
          ))}
        </ol>
      ) : (
        <UnavailableState label={unavailableLabel} />
      )}
    </section>
  );
}

function DisagreementFlag({
  label,
  active,
}: {
  label: string;
  active: boolean;
}) {
  return (
    <div
      className={`evaluation-disagreement-flag ${
        active ? "is-disagree" : "is-stable"
      }`}
    >
      <span>{label}</span>
      <strong>{active ? "Disagreement" : "Aligned"}</strong>
    </div>
  );
}

function UnavailableState({ label }: { label: string }) {
  return (
    <div className="evaluation-unavailable">
      <strong>{label}</strong>
      <p>Available reviewer outputs are required before this aggregate can be read.</p>
    </div>
  );
}

function sumCounts(distribution: Record<string, number>) {
  return Object.values(distribution).reduce((total, count) => total + count, 0);
}

function formatComparisonValueCount(count: number) {
  return count === 1 ? "Single value in this report" : `${count} values in this report`;
}

function formatNonzeroDistribution(
  distribution: Record<string, number>,
  labels: Record<string, string>,
) {
  const entries = Object.entries(distribution).filter(([, count]) => count > 0);

  if (entries.length === 0) {
    return "None reported";
  }

  return entries
    .map(([value, count]) => `${labels[value] ?? value}: ${count}`)
    .join(", ");
}

function getReportStatus(
  report: EvaluationReportV01,
  hasReviewerOutput: boolean,
): {
  label: string;
  tone: "neutral" | "overclaim" | "supported";
} {
  if (!hasReviewerOutput) {
    return { label: "Reviewer output unavailable", tone: "neutral" };
  }

  if (report.reviewer_count < 2) {
    return { label: "Agreement comparison unavailable", tone: "neutral" };
  }

  if (report.disagreement.has_any_disagreement) {
    return { label: "Disagreement detected", tone: "overclaim" };
  }

  return { label: "No disagreement detected", tone: "supported" };
}

function formatCount(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}
