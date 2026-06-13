import { EvidenceBalance } from "@/components/arena/EvidenceBalance";
import { SemanticMiniMap } from "@/components/arena/SemanticMiniMap";
import { evidenceRatingMeta, evidenceRatingOptions } from "@/components/arena/arenaMeta";
import { getRelationsForEvidence } from "@/lib/caseMetrics";
import type { EvidenceBalance as EvidenceBalanceValue } from "@/lib/arenaReviewState";
import type { CaseFile, EvidenceRating } from "@/lib/types";

type EvidenceBoardProps = {
  caseFile: CaseFile;
  evidenceRatings: Record<string, EvidenceRating>;
  balance: EvidenceBalanceValue;
  onRateEvidence: (evidenceId: string, rating: EvidenceRating) => void;
};

export function EvidenceBoard({
  caseFile,
  evidenceRatings,
  balance,
  onRateEvidence,
}: EvidenceBoardProps) {
  return (
    <section className="evidence-board-stage stage-surface" aria-label="Evidence Board">
      <div className="stage-heading">
        <div>
          <p className="eyebrow">Evidence Board</p>
          <h2>Classify the evidence against the claim</h2>
        </div>
        <span className="count-pill">{caseFile.evidenceItems.length} evidence cards</span>
      </div>

      <SemanticMiniMap caseFile={caseFile} label="Evidence context" />

      <EvidenceBalance balance={balance} />

      <div className="evidence-board-grid">
        {caseFile.evidenceItems.map((evidence) => {
          const rating = evidenceRatings[evidence.id] ?? "needs_context";
          const relations = getRelationsForEvidence(caseFile, evidence.id);

          return (
            <article
              key={evidence.id}
              className={`evidence-board-card evidence-board-card-${rating}`}
            >
              <div className="evidence-card-header">
                <span className="mono-value">{evidence.id}</span>
                <span className={evidenceRatingMeta[rating].className}>
                  {evidenceRatingMeta[rating].label}
                </span>
              </div>
              <h3>{evidence.title}</h3>
              <p>{evidence.summary}</p>
              <div className="relation-list">
                {relations.map((relation) => (
                  <span key={`${relation.claimId}-${relation.evidenceId}`}>
                    {relation.polarity} - {relation.strength} - {relation.claimId}
                  </span>
                ))}
              </div>
              <div className="rating-control" role="group" aria-label={`${evidence.id} classification`}>
                {evidenceRatingOptions.map((option) => (
                  <button
                    key={`${evidence.id}-${option}`}
                    type="button"
                    className={`rating-button ${
                      rating === option ? "is-selected" : ""
                    }`}
                    onClick={() => onRateEvidence(evidence.id, option)}
                    aria-pressed={rating === option}
                  >
                    {evidenceRatingMeta[option].shortLabel}
                  </button>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
