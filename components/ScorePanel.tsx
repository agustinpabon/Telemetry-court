import {
  deriveCaseSupportStatus,
  formatSupportScore,
  getAverageSupportScore,
  getClaimStatusCounts,
} from "@/lib/caseMetrics";
import type { CaseFile, SupportStatus } from "@/lib/types";

type ScorePanelProps = {
  caseFile: CaseFile;
};

const statusMeta: Record<
  SupportStatus,
  { label: string; className: string; note: string; plainLanguage: string }
> = {
  supported: {
    label: "Supported",
    className: "text-[var(--tc-supported)]",
    note: "Evidence consistently reinforces the generated interpretation.",
    plainLanguage:
      "Plain-language readout: the generated meaning holds up because the strongest evidence supports the reviewable claims.",
  },
  weakly_supported: {
    label: "Weakly supported",
    className: "text-[var(--tc-weak)]",
    note: "Some evidence supports the interpretation, but confidence remains limited.",
    plainLanguage:
      "Plain-language readout: the generated meaning is plausible, but the record needs clearer support before it should be accepted as stated.",
  },
  contradicted: {
    label: "Contradicted",
    className: "text-[var(--tc-contradicted)]",
    note: "At least one evidence item directly contradicts a generated claim.",
    plainLanguage:
      "Plain-language readout: the generated meaning conflicts with part of the record and should not be accepted without revision.",
  },
  unsupported: {
    label: "Unsupported",
    className: "text-[var(--tc-unsupported)]",
    note: "The evidence does not adequately support the interpretation.",
    plainLanguage:
      "Plain-language readout: the generated meaning does not stand because the evidence does not support the story the label is telling.",
  },
  insufficient_evidence: {
    label: "Insufficient evidence",
    className: "text-[var(--tc-insufficient)]",
    note: "The record lacks enough evidence to judge the claim confidently.",
    plainLanguage:
      "Plain-language readout: the system should expose the gap instead of presenting the claim as proven.",
  },
};

const statusStates: SupportStatus[] = [
  "supported",
  "weakly_supported",
  "contradicted",
  "unsupported",
  "insufficient_evidence",
];

export function ScorePanel({ caseFile }: ScorePanelProps) {
  const caseStatus = deriveCaseSupportStatus(caseFile);
  const currentStatus = statusMeta[caseStatus];
  const claimStatusCounts = getClaimStatusCounts(caseFile);

  return (
    <section className="tc-panel p-6 sm:p-7">
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-sm font-medium text-[var(--tc-muted)]">Verdict summary</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
            Final judgment at a glance
          </h2>
        </div>

        <div className="tc-panel-subtle p-5">
          <div className="flex flex-wrap items-center gap-2">
            {statusStates.map((state) => {
              const isActive = state === caseStatus;
              return (
                <div
                  key={state}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                    isActive
                      ? "border-[var(--tc-border)] bg-[var(--tc-surface)] text-[var(--tc-ink)]"
                      : "border-[var(--tc-border)] bg-transparent text-[var(--tc-muted)]"
                  }`}
                >
                  {statusMeta[state].label}
                </div>
              );
            })}
          </div>

          <p className={`mt-5 text-5xl font-semibold tracking-[-0.06em] ${currentStatus.className}`}>
            {currentStatus.label}
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--tc-muted)]">
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

        <div className="tc-panel-inset p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--tc-muted)]">
            Summary
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--tc-muted)]">
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
    <div className="tc-panel-inset px-4 py-4">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--tc-muted)]">{label}</p>
      <p
        className={`mt-2 font-semibold text-[var(--tc-ink)] ${
          longValue ? "text-sm leading-7" : "text-xl"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
