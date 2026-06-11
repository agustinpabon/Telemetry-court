import type { AnalystDecision } from "@/lib/types";

type ReviewActionsProps = {
  decision?: AnalystDecision;
  onDecision: (decision: AnalystDecision) => void;
};

const actionMeta: Record<
  AnalystDecision,
  { label: string; className: string }
> = {
  accept: {
    label: "Accept interpretation",
    className:
      "bg-[var(--tc-surface)] text-[var(--tc-ink)] border-[var(--tc-border)] hover:bg-[var(--tc-supported-surface)]",
  },
  revise: {
    label: "Request revision",
    className:
      "bg-[var(--tc-surface)] text-[var(--tc-ink)] border-[var(--tc-border)] hover:bg-[var(--tc-weak-surface)]",
  },
  reject: {
    label: "Reject interpretation",
    className:
      "bg-[var(--tc-surface)] text-[var(--tc-ink)] border-[var(--tc-border)] hover:bg-[var(--tc-contradicted-surface)]",
  },
  needs_more_review: {
    label: "Needs more review",
    className:
      "bg-[var(--tc-surface)] text-[var(--tc-ink)] border-[var(--tc-border)] hover:bg-[var(--tc-insufficient-surface)]",
  },
};

export function ReviewActions({ decision, onDecision }: ReviewActionsProps) {
  const actions: AnalystDecision[] = [
    "accept",
    "revise",
    "reject",
    "needs_more_review",
  ];

  return (
    <section className="tc-panel p-6 sm:p-7">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--tc-muted)]">Review decision</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
            Record the local outcome
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--tc-muted)]">
            These actions stay local to the demo and simply mark how a reviewer would
            disposition the interpretation.
          </p>
        </div>
        {decision ? (
          <div className="rounded-[var(--tc-radius-md)] border border-[var(--tc-border)] bg-[var(--tc-focus-surface)] px-4 py-3 text-sm font-medium text-[var(--tc-focus)]">
            Decision recorded locally for this demo.
          </div>
        ) : (
          <div className="rounded-[var(--tc-radius-md)] border border-dashed border-[var(--tc-border)] bg-[var(--tc-surface-muted)] px-4 py-3 text-sm leading-7 text-[var(--tc-muted)]">
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
                isActive ? "tc-panel-selected" : ""
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
