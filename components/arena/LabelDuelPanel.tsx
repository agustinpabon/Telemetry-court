import {
  candidateSourceLabel,
  duelReasonLabel,
} from "@/components/arena/arenaMeta";
import { SemanticMiniMap } from "@/components/arena/SemanticMiniMap";
import { formatSupportScore } from "@/lib/caseMetrics";
import type { CaseReviewState } from "@/lib/arenaReviewState";
import type { CaseFile, DuelReason } from "@/lib/types";

type LabelDuelPanelProps = {
  caseFile: CaseFile;
  reviewState: CaseReviewState;
  onSelectWinner: (candidateId: string) => void;
  onToggleReason: (reason: DuelReason) => void;
  onContinue: () => void;
};

export function LabelDuelPanel({
  caseFile,
  reviewState,
  onSelectWinner,
  onToggleReason,
  onContinue,
}: LabelDuelPanelProps) {
  return (
    <section className="label-duel-stage stage-surface" aria-label="Label Duel">
      <div className="stage-heading">
        <div>
          <p className="eyebrow">Label Duel</p>
          <h2>Judge competing interpretations</h2>
        </div>
        <span className="count-pill">{caseFile.candidateLabels.length} candidate labels</span>
      </div>

      <SemanticMiniMap caseFile={caseFile} label="Duel context" />

      <div className="duel-grid">
        {caseFile.candidateLabels.map((candidate) => {
          const isSelected = reviewState.labelDuelWinnerId === candidate.id;

          return (
            <button
              key={candidate.id}
              type="button"
              className={`duel-card ${isSelected ? "is-selected" : ""}`}
              onClick={() => onSelectWinner(candidate.id)}
              aria-pressed={isSelected}
            >
              <span>{candidateSourceLabel[candidate.source]}</span>
              <strong>{candidate.label}</strong>
              <p>{candidate.rationale}</p>
              <em>Support {formatSupportScore(candidate.supportEstimate)}</em>
            </button>
          );
        })}
      </div>

      <div className="reason-panel">
        <h3>Reason chips</h3>
        <div className="chip-row">
          {caseFile.failureModes.map((reason) => {
            const isSelected = (reviewState.duelReasons ?? []).includes(reason);

            return (
              <button
                key={`duel-${reason}`}
                type="button"
                className={`chip-button ${isSelected ? "is-selected" : ""}`}
                onClick={() => onToggleReason(reason)}
                aria-pressed={isSelected}
              >
                {duelReasonLabel[reason]}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        className="primary-action"
        onClick={onContinue}
        disabled={!reviewState.labelDuelWinnerId}
      >
        Continue to impostor review
      </button>
    </section>
  );
}
