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
    className: "bg-[var(--tc-supported-surface)] text-[var(--tc-supported)]",
  },
  weakly_supported: {
    label: "Weakly supported",
    className: "bg-[var(--tc-weak-surface)] text-[var(--tc-weak)]",
  },
  contradicted: {
    label: "Contradicted",
    className:
      "bg-[var(--tc-contradicted-surface)] text-[var(--tc-contradicted)]",
  },
  unsupported: {
    label: "Unsupported",
    className: "bg-[var(--tc-unsupported-surface)] text-[var(--tc-unsupported)]",
  },
  insufficient_evidence: {
    label: "Insufficient evidence",
    className: "bg-[var(--tc-insufficient-surface)] text-[var(--tc-insufficient)]",
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
    <section className="tc-panel p-6 sm:p-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--tc-muted)]">Claim ledger</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
            Reviewable statements
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--tc-muted)]">
            Each statement below is a discrete claim extracted from the generated
            interpretation and tested against the record.
          </p>
        </div>
        {selectedClaimId ? (
          <button
            type="button"
            onClick={onClearClaim}
            className="tc-pill px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--tc-surface)]"
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
                className={`tc-panel-hover w-full rounded-[var(--tc-radius-lg)] border px-5 py-5 text-left ${
                  isSelected
                    ? "tc-panel-selected"
                    : "border-[var(--tc-border)] bg-[var(--tc-surface-muted)]"
                }`}
              >
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_220px]">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-[var(--tc-muted)]">
                        {claim.id}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-[120px_minmax(0,1fr)]">
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--tc-muted)]">
                        Claim
                      </p>
                      <p className="text-base font-semibold leading-8 text-[var(--tc-ink)]">
                        {claim.text}
                      </p>

                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--tc-muted)]">
                        Rationale
                      </p>
                      <p className="text-sm leading-7 text-[var(--tc-muted)]">
                        {claim.rationale}
                      </p>
                    </div>
                  </div>

                  <div className="tc-panel-inset px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--tc-muted)]">
                      Evidence
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {evidenceIds.length > 0 ? (
                        evidenceIds.map((evidenceId) => (
                          <span
                            key={`${claim.id}-${evidenceId}`}
                            className="rounded-full border border-[var(--tc-border)] bg-[var(--tc-surface)] px-3 py-1.5 font-mono text-xs text-[var(--tc-muted)]"
                          >
                            {evidenceId}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-full border border-dashed border-[var(--tc-border)] bg-[var(--tc-surface)] px-3 py-1.5 text-xs text-[var(--tc-muted)]">
                          Evidence missing
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-xs text-[var(--tc-muted)]">
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
        <div className="mt-5 rounded-[var(--tc-radius-lg)] border border-dashed border-[var(--tc-border)] bg-[var(--tc-surface-muted)] px-5 py-8 text-center">
          <p className="text-sm font-semibold tracking-[-0.01em] text-[var(--tc-ink)]">
            No claims are available
          </p>
          <p className="mt-2 text-sm leading-7 text-[var(--tc-muted)]">
            Add validation claims to populate the ledger for this case.
          </p>
        </div>
      )}
    </section>
  );
}
