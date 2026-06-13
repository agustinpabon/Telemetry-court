import { SemanticMiniMap } from "@/components/arena/SemanticMiniMap";
import type { CaseReviewState } from "@/lib/arenaReviewState";
import type { CaseFile } from "@/lib/types";

type BlindReadPanelProps = {
  caseFile: CaseFile;
  reviewState: CaseReviewState;
  onChooseBlindInterpretation: (optionId: string) => void;
  onRevealAiLabel: () => void;
};

export function BlindReadPanel({
  caseFile,
  reviewState,
  onChooseBlindInterpretation,
  onRevealAiLabel,
}: BlindReadPanelProps) {
  return (
    <section className="blind-stage stage-surface" aria-label="Blind Read">
      <div className="stage-heading">
        <div>
          <p className="eyebrow">Blind Read</p>
          <h2>What does the behaviour suggest before the AI claim?</h2>
        </div>
        <span className="sealed-chip">AI label sealed</span>
      </div>

      <div className="sealed-vault" aria-hidden="true">
        <span />
        <strong>AI claim sealed</strong>
      </div>

      <SemanticMiniMap caseFile={caseFile} label="Blind context" />

      <div className="blind-layout">
        <article className="evidence-preview-panel">
          <h3>Evidence packet</h3>
          <div className="evidence-preview-list">
            {caseFile.evidenceItems.map((evidence) => (
              <div key={evidence.id} className="evidence-preview-item">
                <span>{evidence.id}</span>
                <strong>{evidence.title}</strong>
                <p>{evidence.summary}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="blind-choice-panel">
          <h3>Structured interpretation</h3>
          <div className="blind-choice-grid">
            {caseFile.blindInterpretationOptions.map((option) => {
              const isSelected = reviewState.blindChoiceId === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  className={`choice-card ${isSelected ? "is-selected" : ""}`}
                  onClick={() => onChooseBlindInterpretation(option.id)}
                  aria-pressed={isSelected}
                >
                  <strong>{option.label}</strong>
                  <span>{option.helper}</span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="primary-action"
            disabled={!reviewState.blindChoiceId}
            onClick={onRevealAiLabel}
          >
            Reveal AI label
          </button>
        </article>
      </div>
    </section>
  );
}
