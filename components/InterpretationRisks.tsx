import type { Claim } from "@/lib/types";

type InterpretationRisksProps = {
  claims: Claim[];
};

const riskStatuses = new Set([
  "contradicted",
  "unsupported",
  "insufficient_evidence",
]);

export function InterpretationRisks({ claims }: InterpretationRisksProps) {
  const risks = claims.filter((claim) => riskStatuses.has(claim.status));

  return (
    <section className="tc-panel p-6 sm:p-7">
      <p className="text-sm font-medium text-[var(--tc-muted)]">Interpretation risks</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Why confidence may move</h2>

      {risks.length > 0 ? (
        <div className="mt-5 space-y-3">
          {risks.map((claim) => (
            <div
              key={claim.id}
              className="tc-panel-subtle px-5 py-4"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-[var(--tc-muted)]">{claim.id}</span>
                <p className="text-sm font-semibold tracking-[-0.01em] text-[var(--tc-ink)]">
                  {claim.status.replaceAll("_", " ")}
                </p>
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--tc-muted)]">
                {claim.rationale}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-[var(--tc-radius-lg)] border border-dashed border-[var(--tc-border)] bg-[var(--tc-surface-muted)] px-5 py-6">
          <p className="text-sm font-semibold text-[var(--tc-ink)]">
            No interpretation risks were identified.
          </p>
          <p className="mt-2 text-sm leading-7 text-[var(--tc-muted)]">
            This synthetic record does not currently expose any notable confidence reducers.
          </p>
        </div>
      )}
    </section>
  );
}
