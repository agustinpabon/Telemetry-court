import type { GeneratedInterpretation, ReviewDecision, Validation, Verdict } from "@/lib/types";

type CourtRecordProps = {
  generatedInterpretation: GeneratedInterpretation;
  reviewDecision?: ReviewDecision;
  reviewTimestamp?: string;
  validation: Validation;
};

const verdictMeta: Record<
  Verdict,
  { label: string; className: string; description: string }
> = {
  supported: {
    label: "Supported",
    className: "text-[var(--color-supported)]",
    description: "The record presently supports the model-generated interpretation.",
  },
  uncertain: {
    label: "Uncertain",
    className: "text-[var(--color-uncertain)]",
    description: "The record is directionally supportive, but material ambiguity remains.",
  },
  unsupported: {
    label: "Unsupported",
    className: "text-[var(--color-unsupported)]",
    description: "The record does not support the model-generated interpretation.",
  },
};

const decisionLabel: Record<ReviewDecision, string> = {
  accept: "Accept interpretation",
  revise: "Request revision",
  reject: "Reject interpretation",
};

export function CourtRecord({
  generatedInterpretation,
  reviewDecision,
  reviewTimestamp,
  validation,
}: CourtRecordProps) {
  const verdict = verdictMeta[validation.verdict];

  return (
    <section className="rounded-[30px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.07)] sm:p-7">
      <p className="text-sm font-medium text-[var(--color-muted)]">Court record</p>
      <div className="mt-4 rounded-[28px] border border-[var(--color-border-strong)] bg-[var(--color-panel)]/65 p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Verdict
        </p>
        <p className={`mt-2 text-4xl font-semibold tracking-[-0.05em] ${verdict.className}`}>
          {verdict.label}
        </p>
        <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
          {verdict.description}
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <RecordField label="Confidence" value={`${validation.confidenceScore}%`} />
        <RecordField
          label="Review decision"
          value={reviewDecision ? decisionLabel[reviewDecision] : undefined}
          empty="No review decision has been recorded."
        />
        <RecordField label="Generated model" value={generatedInterpretation.modelName} />
        <RecordField label="Prompt version" value={generatedInterpretation.promptVersion} />
        <RecordField
          label="Review timestamp"
          value={reviewTimestamp}
          empty="Awaiting local review action."
        />
        <RecordField label="Generated time" value={generatedInterpretation.generatedAt} />
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
    <div className="rounded-[24px] border border-[var(--color-border)] bg-white/78 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-7 text-[var(--color-ink)]">
        {value ?? empty ?? "Not available."}
      </p>
    </div>
  );
}
