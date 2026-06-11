import {
  deriveCaseSupportStatus,
  formatSupportScore,
  getAverageSupportScore,
} from "@/lib/caseMetrics";
import type { CaseFile, SupportStatus } from "@/lib/types";

type CaseSwitcherProps = {
  cases: CaseFile[];
  selectedCaseId: string;
  onSelect: (caseId: string) => void;
};

const statusLabel: Record<SupportStatus, string> = {
  supported: "Supported",
  weakly_supported: "Weakly supported",
  contradicted: "Contradicted",
  unsupported: "Unsupported",
  insufficient_evidence: "Insufficient evidence",
};

const statusClassName: Record<SupportStatus, string> = {
  supported: "bg-[var(--tc-supported-surface)] text-[var(--tc-supported)]",
  weakly_supported: "bg-[var(--tc-weak-surface)] text-[var(--tc-weak)]",
  contradicted:
    "bg-[var(--tc-contradicted-surface)] text-[var(--tc-contradicted)]",
  unsupported: "bg-[var(--tc-unsupported-surface)] text-[var(--tc-unsupported)]",
  insufficient_evidence:
    "bg-[var(--tc-insufficient-surface)] text-[var(--tc-insufficient)]",
};

export function CaseSwitcher({
  cases,
  selectedCaseId,
  onSelect,
}: CaseSwitcherProps) {
  return (
    <section className="tc-panel p-6 sm:p-7">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--tc-muted)]">Case review queue</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
            Select a review record
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--tc-muted)]">
            Each case represents a synthetic Toponymy-style interpretation awaiting
            judgment.
          </p>
        </div>
        <div className="tc-pill px-3 py-1 text-xs font-medium">
          {cases.length} cases
        </div>
      </div>

      <div className="mt-6 grid gap-3 xl:grid-cols-3">
        {cases.map((currentCase) => {
          const isSelected = currentCase.id === selectedCaseId;
          const caseStatus = deriveCaseSupportStatus(currentCase);

          return (
            <button
              key={currentCase.id}
              type="button"
              onClick={() => onSelect(currentCase.id)}
              className={`tc-panel-hover rounded-[var(--tc-radius-lg)] border px-5 py-5 text-left ${
                isSelected
                  ? "tc-panel-selected"
                  : "border-[var(--tc-border)] bg-[var(--tc-surface-muted)]"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-xs text-[var(--tc-muted)]">
                  {currentCase.cluster.id}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClassName[caseStatus]}`}
                >
                  {statusLabel[caseStatus]}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold tracking-[-0.02em] text-[var(--tc-ink)]">
                {currentCase.topicLabel.name}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--tc-muted)]">
                {currentCase.topicLabel.explanation}
              </p>
              <div className="mt-4 flex items-center justify-between gap-3 text-sm text-[var(--tc-muted)]">
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
