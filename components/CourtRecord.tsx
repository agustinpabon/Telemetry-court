import type {
  AnalystDecision,
  AnalystVerdict,
  SupportScore,
  TopicLabel,
} from "@/lib/types";

type CourtRecordProps = {
  topicLabel: TopicLabel;
  reviewDecision?: AnalystDecision;
  reviewTimestamp?: string;
  analystVerdict?: AnalystVerdict;
  supportScores: SupportScore[];
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
  supportScores,
}: CourtRecordProps) {
  const displayedDecision = reviewDecision ?? analystVerdict?.decision;
  const displayedTimestamp = reviewTimestamp ?? analystVerdict?.reviewedAt;
  const averageScore = getAverageSupportScore(supportScores);

  return (
    <section className="rounded-[30px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.07)] sm:p-7">
      <p className="text-sm font-medium text-[var(--color-muted)]">Court record</p>
      <div className="mt-4 rounded-[28px] border border-[var(--color-border-strong)] bg-[var(--color-panel)]/65 p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Analyst verdict
        </p>
        <p className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-[var(--color-ink)]">
          {displayedDecision ? decisionLabel[displayedDecision] : "Awaiting review"}
        </p>
        <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
          {analystVerdict?.summary ??
            "No analyst verdict has been recorded for this synthetic case."}
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <RecordField label="Average support" value={`${averageScore}%`} />
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

function getAverageSupportScore(supportScores: SupportScore[]): number {
  if (supportScores.length === 0) {
    return 0;
  }

  const total = supportScores.reduce((sum, score) => sum + score.value, 0);

  return Math.round((total / supportScores.length) * 100);
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
    <div className="rounded-[24px] border border-[var(--color-border)] bg-white/78 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-7 text-[var(--color-ink)]">
        {value ?? empty ?? "Not available."}
      </p>
    </div>
  );
}
