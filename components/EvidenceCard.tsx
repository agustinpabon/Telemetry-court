import type { EvidenceItem, EvidenceStrength } from "@/lib/types";

type EvidenceCardProps = {
  evidence: EvidenceItem;
  highlighted?: boolean;
};

const stanceTone = {
  supports: {
    label: "Supports",
    className:
      "border-[color:rgba(47,107,84,0.16)] bg-[var(--color-supported-soft)] text-[var(--color-supported)]",
  },
  partial: {
    label: "Partial",
    className:
      "border-[color:rgba(138,104,53,0.16)] bg-[var(--color-uncertain-soft)] text-[var(--color-uncertain)]",
  },
  contradicts: {
    label: "Contradicts",
    className:
      "border-[color:rgba(134,82,91,0.16)] bg-[var(--color-unsupported-soft)] text-[var(--color-unsupported)]",
  },
} as const;

const kindLabel = {
  feature: "Feature",
  exemplar: "Exemplar",
  metadata: "Metadata",
  contradiction: "Contradiction",
} as const;

const strengthLabel: Record<EvidenceStrength, string> = {
  strong: "Strong",
  moderate: "Moderate",
  weak: "Weak",
};

const relevanceWidth = {
  high: "100%",
  medium: "68%",
  low: "40%",
} as const;

export function EvidenceCard({ evidence, highlighted = false }: EvidenceCardProps) {
  const tone = stanceTone[evidence.stance];

  return (
    <article
      className={`rounded-[24px] border bg-white/80 p-5 ${
        highlighted
          ? "border-[var(--color-border-strong)] shadow-[0_12px_30px_rgba(15,23,42,0.07)]"
          : "border-[var(--color-border)]"
      }`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-muted)]">
            <span>{evidence.id}</span>
            <span>{kindLabel[evidence.kind]}</span>
          </div>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[var(--color-ink)]">
            {evidence.title}
          </h3>
        </div>
        <span
          className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-medium ${tone.className}`}
        >
          {tone.label}
        </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <MetaChip label={`Strength ${strengthLabel[evidence.strength]}`} />
          <MetaChip label={`Relevance ${evidence.relevance}`} />
          <MetaChip label={kindLabel[evidence.kind]} />
        </div>
      </div>

      {highlighted ? (
        <div className="mt-4 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-accent-soft)] px-3 py-1 text-xs font-medium text-[var(--color-accent-strong)]">
          Linked to selected claim
        </div>
      ) : null}

      <p className="mt-5 text-base leading-8 text-[var(--color-muted)]">{evidence.summary}</p>

      <div className="mt-5 flex items-center justify-between gap-3 rounded-[22px] border border-[var(--color-border)] bg-[var(--color-panel)]/68 px-4 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Relevance
          </p>
          <p className="mt-1 text-sm font-semibold capitalize">{evidence.relevance}</p>
        </div>
        <div className="h-2 w-24 rounded-full bg-white/80">
          <div
            className="h-2 rounded-full bg-[var(--color-accent-strong)]"
            style={{ width: relevanceWidth[evidence.relevance] }}
          />
        </div>
      </div>

      <div className="mt-5 rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Linked validation claims
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {evidence.linkedClaimIds.map((claimId) => (
            <span
              key={`${evidence.id}-${claimId}`}
              className="rounded-full border border-[var(--color-border-strong)] bg-white/85 px-3 py-1.5 font-mono text-xs text-[var(--color-muted)]"
            >
              {claimId}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function MetaChip({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-panel)]/55 px-3 py-1.5 text-xs font-medium text-[var(--color-muted)]">
      {label}
    </span>
  );
}
