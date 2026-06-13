import { SemanticMiniMap } from "@/components/arena/SemanticMiniMap";
import {
  getBlindAgreementCopy,
  labelsMatch,
  type CaseReviewState,
} from "@/lib/arenaReviewState";
import type { CaseFile } from "@/lib/types";

type AiRevealPanelProps = {
  caseFile: CaseFile;
  reviewState: CaseReviewState;
  onRevealAiLabel: () => void;
  onContinue: () => void;
};

export function AiRevealPanel({
  caseFile,
  reviewState,
  onRevealAiLabel,
  onContinue,
}: AiRevealPanelProps) {
  const blindChoice = caseFile.blindInterpretationOptions.find(
    (option) => option.id === reviewState.blindChoiceId,
  );
  const revealed = Boolean(reviewState.aiLabelRevealed);
  const agrees = labelsMatch(blindChoice?.label, caseFile.topicLabel.name);

  return (
    <section className="ai-reveal-stage stage-surface" aria-label="AI Reveal">
      <div className="stage-heading">
        <div>
          <p className="eyebrow">AI Reveal</p>
          <h2>Compare blind interpretation with the model claim</h2>
        </div>
        <span className={`agreement-chip ${revealed && agrees ? "is-agree" : ""}`}>
          {revealed ? (agrees ? "Agreement" : "Disagreement") : "Sealed"}
        </span>
      </div>

      <SemanticMiniMap caseFile={caseFile} label="Reveal context" />

      <div className={`reveal-vault ${revealed ? "is-revealed" : ""}`}>
        <article className="reveal-card blind-card">
          <span>Blind interpretation</span>
          <strong>{blindChoice?.label ?? "Awaiting blind choice"}</strong>
          <p>{blindChoice?.helper ?? "Record a structured choice before reveal."}</p>
        </article>

        <div className={`reveal-comparison-node ${revealed ? "is-live" : ""}`}>
          <span>{revealed ? (agrees ? "matches" : "tests") : "sealed"}</span>
        </div>

        <article className="reveal-card ai-card">
          <span>AI claim</span>
          {revealed ? (
            <>
              <strong>{caseFile.topicLabel.name}</strong>
              <p>{caseFile.topicLabel.explanation}</p>
            </>
          ) : (
            <>
              <strong className="redacted-claim">Hidden claim</strong>
              <p>The claim remains unavailable until the blind read is recorded.</p>
            </>
          )}
        </article>
      </div>

      {revealed ? (
        <div className="reveal-result">
          <h3>{agrees ? "The interpretations align." : "The interpretations diverge."}</h3>
          <p>{getBlindAgreementCopy(blindChoice?.label, caseFile)}</p>
          <button type="button" className="primary-action" onClick={onContinue}>
            Open evidence board
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="primary-action"
          disabled={!reviewState.blindChoiceId}
          onClick={onRevealAiLabel}
        >
          Reveal AI label
        </button>
      )}
    </section>
  );
}
