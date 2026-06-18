import {
  deriveCaseSupportStatus,
  formatSupportScore,
  getAverageSupportScore,
  getClaimStatusCounts,
} from "@/lib/caseMetrics";
import {
  supportStatusMeta,
  supportStatusStates,
} from "@/lib/supportStatusMeta";
import type { CaseFile } from "@/lib/types";

type ScorePanelProps = {
  caseFile: CaseFile;
};

export function ScorePanel({ caseFile }: ScorePanelProps) {
  const caseStatus = deriveCaseSupportStatus(caseFile);
  const currentStatus = supportStatusMeta[caseStatus];
  const claimStatusCounts = getClaimStatusCounts(caseFile);

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
            {supportStatusStates.map((state) => {
              const isActive = state === caseStatus;
              return (
                <div
                  key={state}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                    isActive
                      ? "border-[var(--color-border-strong)] bg-white text-[var(--color-ink)]"
                      : "border-[var(--color-border)] bg-transparent text-[var(--color-muted)]"
                  }`}
                >
                  {supportStatusMeta[state].label}
                </div>
              );
            })}
          </div>

          <p className={`mt-5 text-5xl font-semibold tracking-[-0.06em] ${currentStatus.textClassName}`}>
            {currentStatus.label}
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
            {currentStatus.plainLanguage}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <MetricTile
            label="Average support"
            value={formatSupportScore(getAverageSupportScore(caseFile))}
          />
          <MetricTile label="Evidence items" value={`${caseFile.evidenceItems.length}`} />
          <MetricTile
            label="Supported claims"
            value={`${claimStatusCounts.supported}`}
          />
          <MetricTile
            label="Weak claims"
            value={`${claimStatusCounts.weakly_supported}`}
          />
          <MetricTile
            label="Contradicted claims"
            value={`${claimStatusCounts.contradicted}`}
          />
          <MetricTile label="Record note" value={currentStatus.note} longValue />
        </div>

        <div className="rounded-[24px] border border-[var(--color-border)] bg-white/78 p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Summary
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
            {caseFile.analystVerdict?.summary ??
              "No analyst verdict has been recorded for this synthetic case."}
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
