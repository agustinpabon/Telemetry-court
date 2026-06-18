import { JudgmentReceipt } from "@/components/arena/JudgmentReceipt";
import { SemanticMiniMap } from "@/components/arena/SemanticMiniMap";
import {
  ArenaActionFooter,
  ArenaStatusBadge,
  ArenaStepHero,
  ArenaStepProgress,
  ArenaWorkflowShell,
  SectionHeader,
} from "@/components/arena/WorkflowPrimitives";
import {
  duelReasonLabel,
  finalVerdictLabel,
  finalVerdicts,
} from "@/components/arena/arenaMeta";
import type {
  ArenaStage,
  CaseReviewState,
  EvidenceBalance,
} from "@/lib/arenaReviewState";
import type { CaseFile, DuelReason, FinalVerdict } from "@/lib/types";

type VerdictPanelProps = {
  caseFile: CaseFile;
  reviewState: CaseReviewState;
  balance: EvidenceBalance;
  onSelectVerdict: (verdict: FinalVerdict) => void;
  onToggleFailureMode: (reason: DuelReason) => void;
  onBackToImpostor?: () => void;
  onOpenReviewDrawer: () => void;
  onCopyJson: () => void;
  onDownloadJson: () => void;
  onSelectStage?: (stage: ArenaStage) => void;
};

export function VerdictPanel({
  caseFile,
  reviewState,
  balance,
  onSelectVerdict,
  onToggleFailureMode,
  onBackToImpostor,
  onOpenReviewDrawer,
  onCopyJson,
  onDownloadJson,
  onSelectStage,
}: VerdictPanelProps) {
  const blindChoice = caseFile.blindInterpretationOptions.find(
    (option) => option.id === reviewState.blindChoiceId,
  );
  const duelWinner = caseFile.candidateLabels.find(
    (candidate) => candidate.id === reviewState.labelDuelWinnerId,
  );
  const impostor = caseFile.representativeSessions.find(
    (session) => session.id === reviewState.impostorSessionId,
  );
  const selectedVerdictLabel = reviewState.finalVerdict
    ? finalVerdictLabel[reviewState.finalVerdict]
    : undefined;

  return (
    <ArenaWorkflowShell className="verdict-stage" ariaLabel="Structured Verdict">
      <ArenaStepProgress currentStage="verdict" onSelectStage={onSelectStage} />

      <ArenaStepHero
        eyebrow="Structured Verdict"
        status={
          <ArenaStatusBadge tone={reviewState.finalVerdict ? "supported" : "neutral"}>
            {reviewState.finalVerdict ? "Verdict selected" : "Awaiting verdict"}
          </ArenaStatusBadge>
        }
        title="Issue a defensible judgment"
        summary="Resolve the investigation into a structured outcome that can be exported as review data."
      />

      <div className="verdict-context-row">
        <SemanticMiniMap caseFile={caseFile} label="Verdict context" />
        <div className="verdict-judgment-banner">
          <span>Final judgment</span>
          <strong>{selectedVerdictLabel ?? "Awaiting verdict"}</strong>
          <p>
            {selectedVerdictLabel
              ? "The receipt now reflects the selected verdict, evidence balance, and structured review choices."
              : "Choose the outcome that best matches the evidence classification and cluster purity review."}
          </p>
        </div>
      </div>

      <div className="verdict-layout">
        <article className="verdict-choice-panel">
          <SectionHeader
            title="Verdict options"
            description="Pick one final review path. Failure modes can add detail without replacing the verdict."
          />
          <div className="verdict-grid">
            {finalVerdicts.map((verdict) => {
              const isSelected = reviewState.finalVerdict === verdict;

              return (
                <button
                  key={verdict}
                  type="button"
                  className={`verdict-button ${isSelected ? "is-selected" : ""}`}
                  onClick={() => onSelectVerdict(verdict)}
                  aria-pressed={isSelected}
                >
                  <span>{finalVerdictLabel[verdict]}</span>
                </button>
              );
            })}
          </div>

          <div className="reason-panel">
            <SectionHeader
              title="Failure-mode chips"
              description="Add the main reasons the label or cluster did not fully hold up."
            />
            <div className="chip-row">
              {caseFile.failureModes.map((reason) => {
                const isSelected = (reviewState.failureModes ?? []).includes(reason);

                return (
                  <button
                    key={`failure-${reason}`}
                    type="button"
                    className={`chip-button ${isSelected ? "is-selected" : ""}`}
                    onClick={() => onToggleFailureMode(reason)}
                    aria-pressed={isSelected}
                  >
                    {duelReasonLabel[reason]}
                  </button>
                );
              })}
            </div>
          </div>
        </article>

        <JudgmentReceipt
          caseFile={caseFile}
          reviewState={reviewState}
          blindChoice={blindChoice}
          duelWinner={duelWinner}
          impostor={impostor}
          balance={balance}
          onOpenReviewDrawer={onOpenReviewDrawer}
          onCopyJson={onCopyJson}
          onDownloadJson={onDownloadJson}
        />
      </div>

      <ArenaActionFooter
        className="verdict-actions"
        ariaLabel="Verdict actions"
        microcopy={
          reviewState.finalVerdict
            ? "Open the structured review data when the verdict is ready."
            : "Choose a verdict before opening the structured review JSON."
        }
        secondaryAction={
          onBackToImpostor
            ? {
                label: "Back to impostor review",
                onClick: onBackToImpostor,
              }
            : undefined
        }
        primaryAction={{
          label: "Open review JSON",
          disabled: !reviewState.finalVerdict,
          onClick: onOpenReviewDrawer,
        }}
      />
    </ArenaWorkflowShell>
  );
}
