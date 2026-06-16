import { SemanticMiniMap } from "@/components/arena/SemanticMiniMap";
import { StageHeader } from "@/components/arena/WorkflowPrimitives";
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
      <StageHeader
        kicker="AI Reveal"
        title="Compare blind interpretation with the model claim"
        description="The reveal is not a verdict; it identifies where the model claim agrees with the evidence-first read."
        meta={
          <span
            className={`agreement-chip ${
              revealed && agrees ? "is-agree" : ""
            } ${revealed && !agrees ? "is-disagree" : ""}`}
          >
            {revealed ? (agrees ? "Agreement" : "Disagreement") : "Sealed"}
          </span>
        }
      />

      <div className="reveal-context-row">
        <SemanticMiniMap caseFile={caseFile} label="Reveal context" />
        <div className="reveal-context-note">
          <span>Reveal checkpoint</span>
          <strong>
            {revealed
              ? agrees
                ? "Blind read aligns with the model."
                : "Blind read and model claim diverge."
              : "AI claim remains sealed."}
          </strong>
          <p>{getBlindAgreementCopy(blindChoice?.label, caseFile)}</p>
          {revealed ? (
            <button
              type="button"
              className="primary-action reveal-context-action"
              onClick={onContinue}
            >
              Open evidence board
            </button>
          ) : null}
        </div>
      </div>

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

      {revealed ? null : (
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
