import { SemanticMiniMap } from "@/components/arena/SemanticMiniMap";
import {
  SealedClaimBlock,
  SectionHeader,
  StageHeader,
} from "@/components/arena/WorkflowPrimitives";
import { arenaStages } from "@/lib/arenaReviewState";
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
  const evidenceSummary = buildEvidenceSummary(caseFile);
  const hasBlindChoice = Boolean(reviewState.blindChoiceId);
  const actionLabel = hasBlindChoice
    ? reviewState.aiLabelRevealed
      ? "Next: AI Reveal"
      : "Reveal AI label"
    : "Choose an interpretation to continue";

  return (
    <section className="blind-stage stage-surface" aria-label="Blind Read">
      <StageHeader
        kicker="Blind Read"
        title="Judge the evidence first."
        description="Choose an independent interpretation before seeing the AI label."
      />

      <BlindReadProgress />

      <div className="blind-context-row">
        <SealedClaimBlock
          title="AI claim hidden"
          description="The AI label remains sealed until you choose one interpretation below."
        />
      </div>

      <div className="blind-decision-layout">
        <article className="blind-evidence-panel">
          <SectionHeader
            title="Evidence summary"
            description="A short read of the visible packet before any AI claim is shown."
          />
          <div className="blind-evidence-content">
            <div className="evidence-summary-grid">
              {evidenceSummary.map((group) => (
                <section className="evidence-summary-group" key={group.title}>
                  <h4>{group.title}</h4>
                  <p>{group.body}</p>
                </section>
              ))}
            </div>

            <aside className="blind-region-preview">
              <div>
                <span>Context preview</span>
                <strong>Selected region</strong>
              </div>
              <SemanticMiniMap
                caseFile={caseFile}
                detail="Nearby sessions"
                label="Selected behaviour region"
                neutral
                showEvidenceMetric={false}
              />
              <p>
                A small locator for the selected behaviour region and nearby
                sessions.
              </p>
            </aside>
          </div>

          <details className="technical-evidence-disclosure">
            <summary>
              <span>View technical evidence</span>
            </summary>
            <div className="evidence-preview-list">
              {caseFile.evidenceItems.map((evidence) => (
                <div key={evidence.id} className="evidence-preview-item">
                  <span>{evidence.id}</span>
                  <strong>{evidence.title}</strong>
                  <p>{evidence.summary}</p>
                </div>
              ))}
            </div>
          </details>
        </article>

        <article className="blind-choice-panel">
          <SectionHeader
            title="Your interpretation"
            description="What is the strongest conclusion supported by the evidence?"
          />
          <fieldset className="blind-choice-fieldset">
            <legend className="blind-choice-legend">Choose one interpretation</legend>
            <div className="blind-choice-grid">
              {caseFile.blindInterpretationOptions.map((option) => {
                const isSelected = reviewState.blindChoiceId === option.id;

                return (
                  <label
                    key={option.id}
                    className={`choice-card ${
                      isSelected ? "is-selected" : ""
                    } ${option.id === "none-of-these" ? "is-secondary-option" : ""}`}
                  >
                    <input
                      checked={isSelected}
                      name="blind-interpretation"
                      onChange={() => onChooseBlindInterpretation(option.id)}
                      type="radio"
                      value={option.id}
                    />
                    <span className="choice-radio" aria-hidden="true" />
                    <span className="choice-copy">
                      <strong>{option.label}</strong>
                      <span>{option.helper}</span>
                    </span>
                    {isSelected ? <em>Selected</em> : null}
                  </label>
                );
              })}
            </div>
          </fieldset>
          <div className="blind-decision-footer">
            {!reviewState.aiLabelRevealed ? (
              <p className="blind-cta-note">
                Your choice will be saved before the AI label is shown.
              </p>
            ) : null}
            <button
              type="button"
              className="primary-action"
              disabled={!hasBlindChoice}
              onClick={onRevealAiLabel}
            >
              {actionLabel}
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}

type EvidenceSummaryGroup = {
  title: string;
  body: string;
};

function buildEvidenceSummary(caseFile: CaseFile): EvidenceSummaryGroup[] {
  if (caseFile.id === "case-arena-001") {
    return [
      {
        title: "Observed",
        body: "IAM role creation and policy attachment were observed.",
      },
      {
        title: "Context",
        body: "Activity occurred during a daytime rollout window.",
      },
      {
        title: "Limitations",
        body: "No confirmed downstream abuse or sensitive data access was observed.",
      },
      {
        title: "Ambiguous signal",
        body: "One off-hours PassRole-like probe appears outside the rollout window.",
      },
    ];
  }

  const relationsByEvidenceId = new Map(
    caseFile.evidenceItems.map((item) => [
      item.id,
      caseFile.evidenceRelations.filter((relation) => relation.evidenceId === item.id),
    ]),
  );
  const happened = caseFile.evidenceItems
    .slice(0, 2)
    .map((evidence) => evidence.summary);
  const limiting = caseFile.evidenceItems
    .filter((evidence) =>
      relationsByEvidenceId
        .get(evidence.id)
        ?.some((relation) => relation.polarity === "contradicts"),
    )
    .slice(0, 2)
    .map((evidence) => evidence.summary);
  const ambiguous = caseFile.evidenceItems
    .filter((evidence) =>
      relationsByEvidenceId
        .get(evidence.id)
        ?.some((relation) => relation.polarity === "neutral"),
    )
    .slice(0, 2)
    .map((evidence) => evidence.summary);

  return [
    {
      title: "Observed",
      body:
        happened.length > 0
          ? happened[0] ?? ""
          : caseFile.cluster.description ?? "Visible evidence describes the selected region.",
    },
    {
      title: "Context",
      body:
        happened.length > 1
          ? happened[1] ?? ""
          : "Use the visible packet only; the AI label is not part of this step.",
    },
    {
      title: "Limitations",
      body:
        limiting.length > 0
          ? limiting[0] ?? ""
          : "No additional limiting evidence is attached to this sample packet.",
    },
    {
      title: "Ambiguous signal",
      body:
        ambiguous.length > 0
          ? ambiguous[0] ?? ""
          : "The packet still requires a reviewer choice before the AI label is shown.",
    },
  ];
}

function BlindReadProgress() {
  const currentStageIndex = arenaStages.findIndex(
    (stage) => stage.id === "blind_read",
  );

  return (
    <nav className="blind-progress" aria-label="Blind Read progress">
      <div className="blind-progress-summary">
        <strong>Step 3 of 8 · Blind Read</strong>
      </div>
      <ol>
        {arenaStages.map((stage, index) => {
          const isCurrent = stage.id === "blind_read";
          const isComplete = index < currentStageIndex;

          return (
            <li
              key={stage.id}
              className={`${isComplete ? "is-complete" : ""} ${
                isCurrent ? "is-current" : ""
              }`}
              aria-current={isCurrent ? "step" : undefined}
              aria-label={`${index + 1}. ${stage.label}${
                isCurrent ? ", current step" : ""
              }`}
            >
              <span aria-hidden="true" />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
