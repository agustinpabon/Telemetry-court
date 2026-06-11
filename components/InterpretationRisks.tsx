import type { InterpretationRisk } from "@/lib/types";

type InterpretationRisksProps = {
  risks: InterpretationRisk[];
};

export function InterpretationRisks({ risks }: InterpretationRisksProps) {
  return (
    <section className="rounded-[30px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] sm:p-7">
      <p className="text-sm font-medium text-[var(--color-muted)]">Interpretation risks</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Why confidence may move</h2>

      {risks.length > 0 ? (
        <div className="mt-5 space-y-3">
          {risks.map((risk) => (
            <div
              key={risk.id}
              className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-panel)]/55 px-5 py-4"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-[var(--color-muted)]">{risk.id}</span>
                <p className="text-sm font-semibold tracking-[-0.01em] text-[var(--color-ink)]">
                  {risk.title}
                </p>
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">{risk.detail}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-[24px] border border-dashed border-[var(--color-border)] bg-white/60 px-5 py-6">
          <p className="text-sm font-semibold text-[var(--color-ink)]">
            No interpretation risks were identified.
          </p>
          <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
            This synthetic record does not currently expose any notable confidence reducers.
          </p>
        </div>
      )}
    </section>
  );
}
