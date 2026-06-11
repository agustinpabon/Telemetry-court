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
    className: "text-[var(--color-supported)]",
    note: "Evidence consistently reinforces the generated interpretation.",
    plainLanguage:
      "Plain-language readout: the generated meaning holds up because the strongest evidence supports the reviewable claims.",
  },
  weakly_supported: {
    label: "Weakly supported",
    className: "text-[var(--color-uncertain)]",
    note: "Some evidence supports the interpretation, but confidence remains limited.",
    plainLanguage:
      "Plain-language readout: the generated meaning is plausible, but the record needs clearer support before it should be accepted as stated.",
  },
  contradicted: {
    label: "Contradicted",
    className: "text-[var(--color-unsupported)]",
    note: "At least one evidence item directly contradicts a generated claim.",
    plainLanguage:
      "Plain-language readout: the generated meaning conflicts with part of the record and should not be accepted without revision.",
  },
  unsupported: {
    label: "Unsupported",
    className: "text-[var(--color-unsupported)]",
    note: "The evidence does not adequately support the interpretation.",
    plainLanguage:
      "Plain-language readout: the generated meaning does not stand because the evidence does not support the story the label is telling.",
  },
  insufficient_evidence: {
    label: "Insufficient evidence",
    className: "text-[var(--color-uncertain)]",
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
  const caseStatus = getCaseStatus(caseFile);
  const currentStatus = statusMeta[caseStatus];
  const averageScore = getAverageSupportScore(caseFile);

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
            {statusStates.map((state) => {
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
                  {statusMeta[state].label}
                </div>
              );
            })}
          </div>

          <p className={`mt-5 text-5xl font-semibold tracking-[-0.06em] ${currentStatus.className}`}>
            {currentStatus.label}
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
            {currentStatus.plainLanguage}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <MetricTile label="Average support" value={`${averageScore}%`} />
          <MetricTile label="Evidence items" value={`${caseFile.evidenceItems.length}`} />
          <MetricTile
            label="Supported claims"
            value={`${countClaims(caseFile, "supported")}`}
          />
          <MetricTile
            label="Weak claims"
            value={`${countClaims(caseFile, "weakly_supported")}`}
          />
          <MetricTile
            label="Contradicted claims"
            value={`${countClaims(caseFile, "contradicted")}`}
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

function getCaseStatus(caseFile: CaseFile): SupportStatus {
  if (caseFile.claims.some((claim) => claim.status === "contradicted")) {
    return "contradicted";
  }

  if (caseFile.claims.some((claim) => claim.status === "unsupported")) {
    return "unsupported";
  }

  if (caseFile.claims.some((claim) => claim.status === "insufficient_evidence")) {
    return "insufficient_evidence";
  }

  if (caseFile.claims.some((claim) => claim.status === "weakly_supported")) {
    return "weakly_supported";
  }

  return "supported";
}

function getAverageSupportScore(caseFile: CaseFile): number {
  if (caseFile.supportScores.length === 0) {
    return 0;
  }

  const total = caseFile.supportScores.reduce(
    (sum, score) => sum + score.value,
    0,
  );

  return Math.round((total / caseFile.supportScores.length) * 100);
}

function countClaims(caseFile: CaseFile, status: SupportStatus): number {
  return caseFile.claims.filter((claim) => claim.status === status).length;
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
