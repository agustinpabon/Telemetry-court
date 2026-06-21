import {
  ArenaStatusBadge,
  ArenaWorkflowShell,
  MetricCard,
  SectionHeader,
} from "@/components/arena/WorkflowPrimitives";
import type { EvaluationReportV01 } from "@/lib/evaluationReportV01";
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

export function EvaluationReportResults({ report }: EvaluationReportResultsProps) {
  const hasReviewerOutput = report.reviewer_count > 0;
  const verdictTotal = sumCounts(report.verdict_distribution);
  const evidenceRatingTotal = sumCounts(report.evidence_rating_distribution);
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
        <ArenaStatusBadge tone={reportStatus.tone}>
          {reportStatus.label}
        </ArenaStatusBadge>
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

      <section
        className="evaluation-report-section evaluation-report-disagreement"
        aria-label="Disagreement indicators"
      >
        <SectionHeader
          title="Disagreement indicators"
          description="Flags show where reviewers selected different values. They do not choose a winner."
        />
        {hasReviewerOutput ? (
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
          <UnavailableState label="Disagreement indicators unavailable" />
        )}
      </section>
    </ArenaWorkflowShell>
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

  if (report.disagreement.has_any_disagreement) {
    return { label: "Disagreement detected", tone: "overclaim" };
  }

  return { label: "No disagreement detected", tone: "supported" };
}

function formatCount(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}
