import type { ReviewDecision } from "@/lib/types";

type ReviewActionsProps = {
  decision?: ReviewDecision;
  onDecision: (decision: ReviewDecision) => void;
};

const actionMeta: Record<
  ReviewDecision,
  { label: string; className: string }
> = {
  accept: {
    label: "Accept interpretation",
    className:
      "bg-white text-[var(--color-ink)] border-[var(--color-border-strong)] hover:bg-[var(--color-supported-soft)]",
  },
  revise: {
    label: "Request revision",
    className:
      "bg-white text-[var(--color-ink)] border-[var(--color-border-strong)] hover:bg-[var(--color-uncertain-soft)]",
  },
  reject: {
    label: "Reject interpretation",
    className:
      "bg-white text-[var(--color-ink)] border-[var(--color-border-strong)] hover:bg-[var(--color-unsupported-soft)]",
  },
};

export function ReviewActions({ decision, onDecision }: ReviewActionsProps) {
  const actions: ReviewDecision[] = ["accept", "revise", "reject"];

  return (
    <section className="rounded-[30px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] sm:p-7">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--color-muted)]">Review decision</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
            Record the local outcome
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
            These actions stay local to the demo and simply mark how a reviewer would
            disposition the interpretation.
          </p>
        </div>
        {decision ? (
          <div className="rounded-[20px] border border-[var(--color-border-strong)] bg-[var(--color-accent-soft)] px-4 py-3 text-sm font-medium text-[var(--color-accent-strong)]">
            Decision recorded locally for this demo.
          </div>
        ) : (
          <div className="rounded-[20px] border border-dashed border-[var(--color-border)] bg-white/60 px-4 py-3 text-sm leading-7 text-[var(--color-muted)]">
            No review decision has been recorded.
          </div>
        )}
      </div>

      <div className="mt-5 grid gap-3">
        {actions.map((action) => {
          const isActive = action === decision;

          return (
            <button
              key={action}
              type="button"
              onClick={() => onDecision(action)}
              className={`rounded-[18px] border px-4 py-3 text-left text-sm font-medium transition-colors ${actionMeta[action].className} ${
                isActive ? "shadow-[0_10px_24px_rgba(15,23,42,0.08)]" : ""
              }`}
            >
              {actionMeta[action].label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
