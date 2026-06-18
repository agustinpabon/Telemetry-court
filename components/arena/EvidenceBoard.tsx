import { EvidenceBalance } from "@/components/arena/EvidenceBalance";
import { SemanticMiniMap } from "@/components/arena/SemanticMiniMap";
import { evidenceRatingMeta, evidenceRatingOptions } from "@/components/arena/arenaMeta";
import {
  ArenaActionFooter,
  ArenaStatusBadge,
  ArenaStepHero,
  ArenaStepProgress,
  ArenaWorkflowShell,
  SectionHeader,
} from "@/components/arena/WorkflowPrimitives";
import { getRelationsForEvidence } from "@/lib/caseMetrics";
import type {
  ArenaStage,
  EvidenceBalance as EvidenceBalanceValue,
} from "@/lib/arenaReviewState";
import type { CaseFile, EvidenceRating } from "@/lib/types";

type EvidenceBoardProps = {
  caseFile: CaseFile;
  evidenceRatings: Record<string, EvidenceRating>;
  balance: EvidenceBalanceValue;
  onRateEvidence: (evidenceId: string, rating: EvidenceRating) => void;
  onBackToAiReveal?: () => void;
  onContinue?: () => void;
  onSelectStage?: (stage: ArenaStage) => void;
};

export function EvidenceBoard({
  caseFile,
  evidenceRatings,
  balance,
  onRateEvidence,
  onBackToAiReveal,
  onContinue,
  onSelectStage,
}: EvidenceBoardProps) {
  return (
    <ArenaWorkflowShell
      className="evidence-board-stage"
      ariaLabel="Evidence Board"
    >
      <ArenaStepProgress
        currentStage="evidence_board"
        onSelectStage={onSelectStage}
      />

      <ArenaStepHero
        eyebrow="Evidence Board"
        status={
          <ArenaStatusBadge tone="evidence-gap">
            {caseFile.evidenceItems.length} evidence cards
          </ArenaStatusBadge>
        }
        title="Classify the evidence against the claim"
        summary="Each evidence card receives one structured classification so support, contradiction, and context gaps stay inspectable."
      />

      <div className="evidence-board-summary-row">
        <SemanticMiniMap caseFile={caseFile} label="Evidence context" />
        <EvidenceBalance balance={balance} />
      </div>

      <SectionHeader
        title="Evidence cards"
        description="Use one classification per item. Ratings can be changed before the final verdict."
      />

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
              <div className="evidence-card-title-row">
                <h3>{evidence.title}</h3>
                <span>{evidence.sourceType.replaceAll("_", " ")}</span>
              </div>
              <p>{evidence.summary}</p>
              <div className="relation-list">
                {relations.map((relation) => (
                  <span key={`${relation.claimId}-${relation.evidenceId}`}>
                    {relation.polarity} - {relation.strength} - {relation.claimId}
                  </span>
                ))}
              </div>
              <span className="rating-control-label">Classify this evidence</span>
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

      {onContinue ? (
        <ArenaActionFooter
          className="evidence-board-actions"
          ariaLabel="Evidence Board actions"
          microcopy="Use these classifications to choose the strongest competing label next."
          secondaryAction={
            onBackToAiReveal
              ? {
                  label: "Back to AI reveal",
                  onClick: onBackToAiReveal,
                }
              : undefined
          }
          primaryAction={{
            label: "Continue to label duel",
            onClick: onContinue,
          }}
        />
      ) : null}
    </ArenaWorkflowShell>
  );
}
