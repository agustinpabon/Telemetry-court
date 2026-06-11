import type {
  EvidenceItem,
  EvidencePolarity,
  EvidenceRelation,
  EvidenceSourceType,
  EvidenceStrength,
} from "@/lib/types";

type EvidenceCardProps = {
  evidence: EvidenceItem;
  relations: EvidenceRelation[];
  highlighted?: boolean;
};

const polarityTone: Record<
  EvidencePolarity,
  { label: string; className: string }
> = {
  supports: {
    label: "Supports",
    className:
      "border-[color:rgba(47,107,84,0.16)] bg-[var(--color-supported-soft)] text-[var(--color-supported)]",
  },
  neutral: {
    label: "Neutral",
    className:
      "border-[color:rgba(138,104,53,0.16)] bg-[var(--color-uncertain-soft)] text-[var(--color-uncertain)]",
  },
  contradicts: {
    label: "Contradicts",
    className:
      "border-[color:rgba(134,82,91,0.16)] bg-[var(--color-unsupported-soft)] text-[var(--color-unsupported)]",
  },
};

const sourceTypeLabel: Record<EvidenceSourceType, string> = {
  telemetry_event: "Telemetry event",
  session_feature: "Session feature",
  exemplar: "Exemplar",
  keyphrase: "Keyphrase",
  metadata: "Metadata",
  analyst_note: "Analyst note",
};

const strengthLabel: Record<EvidenceStrength, string> = {
  strong: "Strong",
  moderate: "Moderate",
  weak: "Weak",
};

const strengthRank: Record<EvidenceStrength, number> = {
  strong: 3,
  moderate: 2,
  weak: 1,
};

export function EvidenceCard({
  evidence,
  relations,
  highlighted = false,
}: EvidenceCardProps) {
  const polarity = getPrimaryPolarity(relations);
  const tone = polarityTone[polarity];
  const strongestRelation = [...relations].sort(
    (left, right) => strengthRank[right.strength] - strengthRank[left.strength],
  )[0];
  const linkedClaimIds = relations.map((relation) => relation.claimId);

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
              <span>{sourceTypeLabel[evidence.sourceType]}</span>
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
          <MetaChip
            label={`Strength ${
              strongestRelation ? strengthLabel[strongestRelation.strength] : "Not linked"
            }`}
          />
          <MetaChip label={sourceTypeLabel[evidence.sourceType]} />
        </div>
      </div>

      {highlighted ? (
        <div className="mt-4 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-accent-soft)] px-3 py-1 text-xs font-medium text-[var(--color-accent-strong)]">
          Linked to selected claim
        </div>
      ) : null}

      <p className="mt-5 text-base leading-8 text-[var(--color-muted)]">{evidence.summary}</p>

      <div className="mt-5 rounded-[22px] border border-[var(--color-border)] bg-[var(--color-panel)]/68 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Relation note
          </p>
          <span className="text-xs font-medium text-[var(--color-muted)]">
            {relations.length} linked
          </span>
        </div>
        <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
          {strongestRelation?.explanation ?? "No claim relation is recorded for this item."}
        </p>
      </div>

      <div className="mt-5 rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Linked validation claims
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {linkedClaimIds.length > 0 ? (
            linkedClaimIds.map((claimId) => (
              <span
                key={`${evidence.id}-${claimId}`}
                className="rounded-full border border-[var(--color-border-strong)] bg-white/85 px-3 py-1.5 font-mono text-xs text-[var(--color-muted)]"
              >
                {claimId}
              </span>
            ))
          ) : (
            <span className="rounded-full border border-dashed border-[var(--color-border-strong)] bg-white/85 px-3 py-1.5 text-xs text-[var(--color-muted)]">
              No linked claim
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function getPrimaryPolarity(relations: EvidenceRelation[]): EvidencePolarity {
  if (relations.some((relation) => relation.polarity === "contradicts")) {
    return "contradicts";
  }

  if (relations.some((relation) => relation.polarity === "supports")) {
    return "supports";
  }

  return "neutral";
}

function MetaChip({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-panel)]/55 px-3 py-1.5 text-xs font-medium text-[var(--color-muted)]">
      {label}
    </span>
  );
}
