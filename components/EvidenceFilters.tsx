import type { EvidencePolarity } from "@/lib/types";

export type EvidenceFilterValue = "all" | EvidencePolarity;

type EvidenceFiltersProps = {
  counts: Record<EvidenceFilterValue, number>;
  selectedFilter: EvidenceFilterValue;
  onSelect: (filter: EvidenceFilterValue) => void;
};

const filterLabels: Record<EvidenceFilterValue, string> = {
  all: "All",
  supports: "Supports",
  neutral: "Neutral",
  contradicts: "Contradicts",
};

export function EvidenceFilters({
  counts,
  selectedFilter,
  onSelect,
}: EvidenceFiltersProps) {
  const filters: EvidenceFilterValue[] = ["all", "supports", "neutral", "contradicts"];

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const isActive = filter === selectedFilter;

        return (
          <button
            key={filter}
            type="button"
            onClick={() => onSelect(filter)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "border-[var(--tc-border)] bg-[var(--tc-surface)] text-[var(--tc-ink)]"
                : "border-[var(--tc-border)] bg-[var(--tc-surface-muted)] text-[var(--tc-muted)] hover:bg-[var(--tc-surface)]"
            }`}
          >
            {filterLabels[filter]} ({counts[filter]})
          </button>
        );
      })}
    </div>
  );
}
