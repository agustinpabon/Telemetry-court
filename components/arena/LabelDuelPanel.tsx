import {
  candidateSourceLabel,
  duelReasonLabel,
} from "@/components/arena/arenaMeta";
import { SemanticMiniMap } from "@/components/arena/SemanticMiniMap";
import {
  ArenaActionFooter,
  ArenaStatusBadge,
  ArenaStepHero,
  ArenaStepProgress,
  ArenaWorkflowShell,
  SectionHeader,
} from "@/components/arena/WorkflowPrimitives";
import { formatSupportScore } from "@/lib/caseMetrics";
import type { ArenaStage, CaseReviewState } from "@/lib/arenaReviewState";
import type { CaseFile, DuelReason } from "@/lib/types";

type LabelDuelPanelProps = {
  caseFile: CaseFile;
  reviewState: CaseReviewState;
  onSelectWinner: (candidateId: string) => void;
  onToggleReason: (reason: DuelReason) => void;
  onBackToEvidenceBoard?: () => void;
  onContinue: () => void;
  onSelectStage?: (stage: ArenaStage) => void;
};

export function LabelDuelPanel({
  caseFile,
  reviewState,
  onSelectWinner,
  onToggleReason,
  onBackToEvidenceBoard,
  onContinue,
  onSelectStage,
}: LabelDuelPanelProps) {
  const selectedCandidate = caseFile.candidateLabels.find(
    (candidate) => candidate.id === reviewState.labelDuelWinnerId,
  );

  return (
    <ArenaWorkflowShell className="label-duel-stage" ariaLabel="Label Duel">
      <ArenaStepProgress currentStage="label_duel" onSelectStage={onSelectStage} />

      <ArenaStepHero
        eyebrow="Label Duel"
        status={
          <ArenaStatusBadge tone="uncertain">
            {caseFile.candidateLabels.length} candidate labels
          </ArenaStatusBadge>
        }
        title="Judge competing interpretations"
        summary="Choose the label that is best supported by the evidence, not the one that sounds most confident."
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

      <ArenaActionFooter
        className="label-duel-actions"
        ariaLabel="Label Duel actions"
        microcopy={
          reviewState.labelDuelWinnerId
            ? "Carry the defensible label into the cluster-purity check."
            : "Select the most defensible label before continuing."
        }
        secondaryAction={
          onBackToEvidenceBoard
            ? {
                label: "Back to evidence board",
                onClick: onBackToEvidenceBoard,
              }
            : undefined
        }
        primaryAction={{
          label: "Continue to impostor review",
          disabled: !reviewState.labelDuelWinnerId,
          onClick: onContinue,
        }}
      />
    </ArenaWorkflowShell>
  );
}
