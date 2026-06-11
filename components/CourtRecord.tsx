import { formatSupportScore, getAverageSupportScore } from "@/lib/caseMetrics";
import type {
  AnalystDecision,
  AnalystVerdict,
  CaseFile,
  TopicLabel,
} from "@/lib/types";

type CourtRecordProps = {
  topicLabel: TopicLabel;
  reviewDecision?: AnalystDecision;
  reviewTimestamp?: string;
  analystVerdict?: AnalystVerdict;
  caseFile: CaseFile;
};

const decisionLabel: Record<AnalystDecision, string> = {
  accept: "Accept interpretation",
  revise: "Request revision",
  reject: "Reject interpretation",
  needs_more_review: "Needs more review",
};

export function CourtRecord({
  topicLabel,
  reviewDecision,
  reviewTimestamp,
  analystVerdict,
  caseFile,
}: CourtRecordProps) {
  const displayedDecision = reviewDecision ?? analystVerdict?.decision;
  const displayedTimestamp = reviewTimestamp ?? analystVerdict?.reviewedAt;

  return (
    <section className="tc-panel p-6 sm:p-7">
      <p className="text-sm font-medium text-[var(--tc-muted)]">Court record</p>
      <div className="tc-panel-subtle mt-4 p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--tc-muted)]">
          Analyst verdict
        </p>
        <p className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-[var(--tc-ink)]">
          {displayedDecision ? decisionLabel[displayedDecision] : "Awaiting review"}
        </p>
        <p className="mt-3 text-sm leading-7 text-[var(--tc-muted)]">
          {analystVerdict?.summary ??
            "No analyst verdict has been recorded for this synthetic case."}
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <RecordField
          label="Average support"
          value={formatSupportScore(getAverageSupportScore(caseFile))}
        />
        <RecordField
          label="Review decision"
          value={displayedDecision ? decisionLabel[displayedDecision] : undefined}
          empty="No review decision has been recorded."
        />
        <RecordField label="Generated model" value={topicLabel.generatedBy} />
        <RecordField label="Topic label ID" value={topicLabel.id} />
        <RecordField
          label="Review timestamp"
          value={displayedTimestamp}
          empty="Awaiting local review action."
        />
        <RecordField label="Generated time" value={topicLabel.generatedAt} />
      </div>
    </section>
  );
}

function RecordField({
  label,
  value,
  empty,
}: {
  label: string;
  value?: string;
  empty?: string;
}) {
  return (
    <div className="tc-panel-inset px-4 py-4">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--tc-muted)]">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-7 text-[var(--tc-ink)]">
        {value ?? empty ?? "Not available."}
      </p>
    </div>
  );
}
