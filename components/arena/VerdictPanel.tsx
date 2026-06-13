import { JudgmentReceipt } from "@/components/arena/JudgmentReceipt";
import { SemanticMiniMap } from "@/components/arena/SemanticMiniMap";
import {
  duelReasonLabel,
  finalVerdictLabel,
  finalVerdicts,
} from "@/components/arena/arenaMeta";
import type { CaseReviewState, EvidenceBalance } from "@/lib/arenaReviewState";
import type { CaseFile, DuelReason, FinalVerdict } from "@/lib/types";

type VerdictPanelProps = {
  caseFile: CaseFile;
  reviewState: CaseReviewState;
  balance: EvidenceBalance;
  onSelectVerdict: (verdict: FinalVerdict) => void;
  onToggleFailureMode: (reason: DuelReason) => void;
  onOpenReviewDrawer: () => void;
  onCopyJson: () => void;
  onDownloadJson: () => void;
};

export function VerdictPanel({
  caseFile,
  reviewState,
  balance,
  onSelectVerdict,
  onToggleFailureMode,
  onOpenReviewDrawer,
  onCopyJson,
  onDownloadJson,
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

  return (
    <section className="verdict-stage stage-surface" aria-label="Structured Verdict">
      <div className="stage-heading">
        <div>
          <p className="eyebrow">Structured Verdict</p>
          <h2>Issue a defensible judgment</h2>
        </div>
        <span className="count-pill">8 verdict paths</span>
      </div>

      <SemanticMiniMap caseFile={caseFile} label="Verdict context" />

      <div className="verdict-layout">
        <article className="verdict-choice-panel">
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
                  {finalVerdictLabel[verdict]}
                </button>
              );
            })}
          </div>

          <div className="reason-panel">
            <h3>Failure-mode chips</h3>
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
    </section>
  );
}
