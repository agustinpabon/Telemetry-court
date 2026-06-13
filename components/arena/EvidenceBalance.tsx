import type { EvidenceBalance as EvidenceBalanceValue } from "@/lib/arenaReviewState";

type EvidenceBalanceProps = {
  balance: EvidenceBalanceValue;
};

export function EvidenceBalance({ balance }: EvidenceBalanceProps) {
  const total = Math.max(balance.total, 1);
  const segments = [
    {
      key: "supporting",
      label: "Supporting evidence",
      value: balance.supporting,
      className: "balance-supporting",
    },
    {
      key: "weak",
      label: "Weak evidence",
      value: balance.weak,
      className: "balance-weak",
    },
    {
      key: "contradictory",
      label: "Contradictory evidence",
      value: balance.contradictory,
      className: "balance-contradictory",
    },
    {
      key: "context",
      label: "Context gaps",
      value: balance.contextGaps,
      className: "balance-context",
    },
  ];

  return (
    <section className="evidence-balance" aria-label="Evidence balance">
      <div className="balance-meter" aria-hidden="true">
        {segments.map((segment) => (
          <span
            key={segment.key}
            className={segment.className}
            style={{ width: `${(segment.value / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="balance-legend">
        {segments.map((segment) => (
          <span key={segment.key}>
            <strong>{segment.value}</strong> {segment.label}
          </span>
        ))}
      </div>
      {balance.noise > 0 ? (
        <p className="balance-note">{balance.noise} item(s) marked noise / irrelevant.</p>
      ) : null}
    </section>
  );
}
