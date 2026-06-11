import {
  formatSupportScore,
  getClaimSupportScore,
  getEvidenceIdsForClaim,
} from "@/lib/caseMetrics";
import type { CaseFile, Claim, SupportStatus } from "@/lib/types";

type ClaimLedgerProps = {
  caseFile: CaseFile;
  claims: Claim[];
  selectedClaimId?: string;
  onSelectClaim: (claimId: string) => void;
  onClearClaim: () => void;
};

const statusMeta: Record<
  SupportStatus,
  { label: string; className: string }
> = {
  supported: {
    label: "Supported",
    className: "bg-[var(--color-supported-soft)] text-[var(--color-supported)]",
  },
  weakly_supported: {
    label: "Weakly supported",
    className: "bg-[var(--color-uncertain-soft)] text-[var(--color-uncertain)]",
  },
  contradicted: {
    label: "Contradicted",
    className: "bg-[var(--color-unsupported-soft)] text-[var(--color-unsupported)]",
  },
  unsupported: {
    label: "Unsupported",
    className: "bg-[var(--color-unsupported-soft)] text-[var(--color-unsupported)]",
  },
  insufficient_evidence: {
    label: "Insufficient evidence",
    className: "bg-[var(--color-uncertain-soft)] text-[var(--color-uncertain)]",
  },
};

export function ClaimLedger({
  caseFile,
  claims,
  selectedClaimId,
  onSelectClaim,
  onClearClaim,
}: ClaimLedgerProps) {
  return (
    <section className="rounded-[30px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] sm:p-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--color-muted)]">Claim ledger</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
            Reviewable statements
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
            Each statement below is a discrete claim extracted from the generated
            interpretation and tested against the record.
          </p>
        </div>
        {selectedClaimId ? (
          <button
            type="button"
            onClick={onClearClaim}
            className="rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-2 text-sm font-medium text-[var(--color-muted)] transition-colors hover:bg-white/75"
          >
            Clear claim focus
          </button>
        ) : null}
      </div>

      {claims.length > 0 ? (
        <div className="mt-5 space-y-3">
          {claims.map((claim) => {
            const isSelected = claim.id === selectedClaimId;
            const status = statusMeta[claim.status];
            const evidenceIds = getEvidenceIdsForClaim(caseFile, claim.id);

            return (
              <button
                key={claim.id}
                type="button"
                onClick={() => onSelectClaim(claim.id)}
                className={`w-full rounded-[28px] border px-5 py-5 text-left transition-colors ${
                  isSelected
                    ? "border-[var(--color-border-strong)] bg-white shadow-[0_18px_36px_rgba(15,23,42,0.07)]"
                    : "border-[var(--color-border)] bg-[var(--color-panel)]/45 hover:bg-white/75"
                }`}
              >
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_220px]">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-[var(--color-muted)]">
                        {claim.id}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-[120px_minmax(0,1fr)]">
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                        Claim
                      </p>
                      <p className="text-base font-semibold leading-8 text-[var(--color-ink)]">
                        {claim.text}
                      </p>

                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                        Rationale
                      </p>
                      <p className="text-sm leading-7 text-[var(--color-muted)]">
                        {claim.rationale}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-[var(--color-border)] bg-white/78 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                      Evidence
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {evidenceIds.length > 0 ? (
                        evidenceIds.map((evidenceId) => (
                          <span
                            key={`${claim.id}-${evidenceId}`}
                            className="rounded-full border border-[var(--color-border-strong)] bg-white px-3 py-1.5 font-mono text-xs text-[var(--color-muted)]"
                          >
                            {evidenceId}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-full border border-dashed border-[var(--color-border-strong)] bg-white px-3 py-1.5 text-xs text-[var(--color-muted)]">
                          Evidence missing
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-xs text-[var(--color-muted)]">
                      Support score{" "}
                      {formatSupportScore(getClaimSupportScore(caseFile, claim.id))}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 rounded-[24px] border border-dashed border-[var(--color-border)] bg-white/65 px-5 py-8 text-center">
          <p className="text-sm font-semibold tracking-[-0.01em] text-[var(--color-ink)]">
            No claims are available
          </p>
          <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
            Add validation claims to populate the ledger for this case.
          </p>
        </div>
      )}
    </section>
  );
}
