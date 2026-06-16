import { SemanticMiniMap } from "@/components/arena/SemanticMiniMap";
import {
  SealedClaimBlock,
  SectionHeader,
  StageHeader,
} from "@/components/arena/WorkflowPrimitives";
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
      <StageHeader
        kicker="Blind Read"
        title="What does the behaviour suggest before the AI claim?"
        description="Classify the visible evidence first, then reveal whether the model made the same interpretation."
        meta={<span className="sealed-chip">AI label sealed</span>}
      />

      <div className="blind-context-row">
        <SealedClaimBlock description="The generated label is intentionally unavailable until a structured blind interpretation is recorded." />
        <SemanticMiniMap caseFile={caseFile} label="Blind context" />
      </div>

      <div className="blind-layout">
        <article className="evidence-preview-panel">
          <SectionHeader
            title="Evidence packet"
            description="Read the packet as behavioural evidence, not as confirmation of a known label."
          />
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
          <SectionHeader
            title="Structured interpretation"
            description="Choose the best evidence-first reading. No typed label is required."
          />
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
