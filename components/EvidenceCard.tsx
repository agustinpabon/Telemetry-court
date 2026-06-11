import { getPrimaryEvidencePolarity } from "@/lib/caseMetrics";
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
      "border-[var(--tc-border)] bg-[var(--tc-supported-surface)] text-[var(--tc-supported)]",
  },
  neutral: {
    label: "Neutral",
    className:
      "border-[var(--tc-border)] bg-[var(--tc-insufficient-surface)] text-[var(--tc-insufficient)]",
  },
  contradicts: {
    label: "Contradicts",
    className:
      "border-[var(--tc-border)] bg-[var(--tc-contradicted-surface)] text-[var(--tc-contradicted)]",
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
  const polarity = getPrimaryEvidencePolarity(relations);
  const tone = polarityTone[polarity];
  const strongestRelation = [...relations].sort(
    (left, right) => strengthRank[right.strength] - strengthRank[left.strength],
  )[0];
  const linkedClaimIds = relations.map((relation) => relation.claimId);

  return (
    <article
      className={`rounded-[var(--tc-radius-lg)] border bg-[var(--tc-surface)] p-5 ${
        highlighted
          ? "tc-panel-selected"
          : "border-[var(--tc-border)]"
      }`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--tc-muted)]">
              <span>{evidence.id}</span>
              <span>{sourceTypeLabel[evidence.sourceType]}</span>
            </div>
            <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[var(--tc-ink)]">
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
        <div className="mt-4 rounded-full border border-[var(--tc-border)] bg-[var(--tc-focus-surface)] px-3 py-1 text-xs font-medium text-[var(--tc-focus)]">
          Linked to selected claim
        </div>
      ) : null}

      <p className="mt-5 text-base leading-8 text-[var(--tc-muted)]">{evidence.summary}</p>

      <div className="tc-panel-subtle mt-5 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--tc-muted)]">
            Relation note
          </p>
          <span className="text-xs font-medium text-[var(--tc-muted)]">
            {relations.length} linked
          </span>
        </div>
        <p className="mt-2 text-sm leading-7 text-[var(--tc-muted)]">
          {strongestRelation?.explanation ?? "No claim relation is recorded for this item."}
        </p>
      </div>

      <div className="tc-panel-inset mt-5 px-4 py-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--tc-muted)]">
          Linked validation claims
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {linkedClaimIds.length > 0 ? (
            linkedClaimIds.map((claimId) => (
              <span
                key={`${evidence.id}-${claimId}`}
                className="rounded-full border border-[var(--tc-border)] bg-[var(--tc-surface)] px-3 py-1.5 font-mono text-xs text-[var(--tc-muted)]"
              >
                {claimId}
              </span>
            ))
          ) : (
            <span className="rounded-full border border-dashed border-[var(--tc-border)] bg-[var(--tc-surface)] px-3 py-1.5 text-xs text-[var(--tc-muted)]">
              No linked claim
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function MetaChip({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-[var(--tc-border)] bg-[var(--tc-surface-muted)] px-3 py-1.5 text-xs font-medium text-[var(--tc-muted)]">
      {label}
    </span>
  );
}
