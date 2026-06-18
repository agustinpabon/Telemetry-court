import {
  deriveCaseSupportStatus,
  formatSupportScore,
  getAverageSupportScore,
} from "@/lib/caseMetrics";
import { supportStatusMeta } from "@/lib/supportStatusMeta";
import type { CaseFile } from "@/lib/types";

type CaseSwitcherProps = {
  cases: CaseFile[];
  selectedCaseId: string;
  onSelect: (caseId: string) => void;
};

export function CaseSwitcher({
  cases,
  selectedCaseId,
  onSelect,
}: CaseSwitcherProps) {
  return (
    <section className="rounded-[30px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] sm:p-7">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--color-muted)]">Case review queue</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
            Select a review record
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
            Each case represents a synthetic Toponymy-style interpretation awaiting
            judgment.
          </p>
        </div>
        <div className="rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-1 text-xs font-medium text-[var(--color-muted)]">
          {cases.length} cases
        </div>
      </div>

      <div className="mt-6 grid gap-3 xl:grid-cols-3">
        {cases.map((currentCase) => {
          const isSelected = currentCase.id === selectedCaseId;
          const caseStatus = deriveCaseSupportStatus(currentCase);
          const status = supportStatusMeta[caseStatus];

          return (
            <button
              key={currentCase.id}
              type="button"
              onClick={() => onSelect(currentCase.id)}
              className={`rounded-[26px] border px-5 py-5 text-left transition-colors ${
                isSelected
                  ? "border-[var(--color-border-strong)] bg-white shadow-[0_18px_36px_rgba(15,23,42,0.07)]"
                  : "border-[var(--color-border)] bg-[var(--color-panel)]/45 hover:bg-white/70"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-xs text-[var(--color-muted)]">
                  {currentCase.cluster.id}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${status.badgeClassName}`}
                >
                  {status.label}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
                {currentCase.topicLabel.name}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--color-muted-soft)]">
                {currentCase.topicLabel.explanation}
              </p>
              <div className="mt-4 flex items-center justify-between gap-3 text-sm text-[var(--color-muted)]">
                <span>Support {formatSupportScore(getAverageSupportScore(currentCase))}</span>
                <span>{currentCase.evidenceItems.length} evidence items</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
