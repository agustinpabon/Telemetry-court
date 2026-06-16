import {
  candidateSourceLabel,
  duelReasonLabel,
} from "@/components/arena/arenaMeta";
import { SemanticMiniMap } from "@/components/arena/SemanticMiniMap";
import { SectionHeader, StageHeader } from "@/components/arena/WorkflowPrimitives";
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
  const selectedCandidate = caseFile.candidateLabels.find(
    (candidate) => candidate.id === reviewState.labelDuelWinnerId,
  );

  return (
    <section className="label-duel-stage stage-surface" aria-label="Label Duel">
      <StageHeader
        kicker="Label Duel"
        title="Judge competing interpretations"
        description="Choose the label that is best supported by the evidence, not the one that sounds most confident."
        meta={
          <span className="count-pill">
            {caseFile.candidateLabels.length} candidate labels
          </span>
        }
      />

      <div className="duel-context-row">
        <SemanticMiniMap caseFile={caseFile} label="Duel context" />
        <SectionHeader
          title="Candidate labels"
          description="Support estimates are cues, not verdicts. Select the strongest interpretation and record why."
        />
      </div>

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
              <div className="duel-card-meta">
                <span>{candidateSourceLabel[candidate.source]}</span>
                <em>Support {formatSupportScore(candidate.supportEstimate)}</em>
              </div>
              <strong>{candidate.label}</strong>
              <p>{candidate.rationale}</p>
            </button>
          );
        })}
      </div>

      <div className="reason-panel">
        <SectionHeader
          title="Reason chips"
          description={
            selectedCandidate
              ? `Why "${selectedCandidate.label}" is the defensible choice.`
              : "Select a candidate label, then record the evidence reason."
          }
        />
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
