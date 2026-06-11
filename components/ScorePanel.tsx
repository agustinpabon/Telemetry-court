import type { Validation, Verdict } from "@/lib/types";

type ScorePanelProps = {
  validation: Validation;
  evidenceCount: number;
};

const verdictMeta: Record<
  Verdict,
  { label: string; className: string; note: string; plainLanguage: string }
> = {
  supported: {
    label: "Supported",
    className: "text-[var(--color-supported)]",
    note: "Evidence consistently reinforces the cluster interpretation.",
    plainLanguage:
      "Plain-language readout: the generated meaning holds up because the strongest cluster features and examples tell the same story, with no material contradiction left unresolved.",
  },
  uncertain: {
    label: "Uncertain",
    className: "text-[var(--color-uncertain)]",
    note: "Signals lean toward the interpretation, but a conflicting detail remains open.",
    plainLanguage:
      "Plain-language readout: the generated meaning is plausible, but one contradictory signal is still strong enough that the interpretation should remain under review.",
  },
  unsupported: {
    label: "Unsupported",
    className: "text-[var(--color-unsupported)]",
    note: "The evidence does not adequately support the interpretation.",
    plainLanguage:
      "Plain-language readout: the generated meaning does not stand because the substrate and evidence do not support the story the title and description are telling.",
  },
};

const verdictStates: Verdict[] = ["supported", "uncertain", "unsupported"];

export function ScorePanel({ validation, evidenceCount }: ScorePanelProps) {
  const currentVerdict = verdictMeta[validation.verdict];

  return (
    <section className="rounded-[30px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.07)] sm:p-7">
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-sm font-medium text-[var(--color-muted)]">Verdict summary</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
            Final judgment at a glance
          </h2>
        </div>

        <div className="rounded-[28px] border border-[var(--color-border-strong)] bg-[var(--color-panel)]/72 p-5">
          <div className="flex flex-wrap items-center gap-2">
            {verdictStates.map((state) => {
              const isActive = state === validation.verdict;
              return (
                <div
                  key={state}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                    isActive
                      ? "border-[var(--color-border-strong)] bg-white text-[var(--color-ink)]"
                      : "border-[var(--color-border)] bg-transparent text-[var(--color-muted)]"
                  }`}
                >
                  {verdictMeta[state].label}
                </div>
              );
            })}
          </div>

          <p className={`mt-5 text-5xl font-semibold tracking-[-0.06em] ${currentVerdict.className}`}>
            {currentVerdict.label}
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
            {currentVerdict.plainLanguage}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <MetricTile label="Confidence" value={`${validation.confidenceScore}%`} />
          <MetricTile label="Evidence items" value={`${evidenceCount}`} />
          <MetricTile label="Supported claims" value={`${validation.supportedClaims.length}`} />
          <MetricTile label="Weak claims" value={`${validation.weakClaims.length}`} />
          <MetricTile
            label="Contradicted claims"
            value={`${validation.contradictedClaims.length}`}
          />
          <MetricTile label="Record note" value={currentVerdict.note} longValue />
        </div>

        <div className="rounded-[24px] border border-[var(--color-border)] bg-white/78 p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Summary
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
            {validation.summary}
          </p>
        </div>
      </div>
    </section>
  );
}

function MetricTile({
  label,
  value,
  longValue = false,
}: {
  label: string;
  value: string;
  longValue?: boolean;
}) {
  return (
    <div className="rounded-[22px] border border-[var(--color-border)] bg-white/78 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">{label}</p>
      <p
        className={`mt-2 font-semibold text-[var(--color-ink)] ${
          longValue ? "text-sm leading-7" : "text-xl"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
