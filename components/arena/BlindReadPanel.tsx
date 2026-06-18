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
  const evidenceSummary = buildEvidenceSummary(caseFile);
  const hasBlindChoice = Boolean(reviewState.blindChoiceId);
  const actionLabel = hasBlindChoice
    ? reviewState.aiLabelRevealed
      ? "Next: AI Reveal"
      : "Reveal AI label"
    : "Choose an interpretation to reveal AI label";

  return (
    <section className="blind-stage stage-surface" aria-label="Blind Read">
      <StageHeader
        kicker="Blind Read"
        title="Read the evidence first."
        description="Choose what the behaviour supports before seeing the AI’s label."
        meta={<span className="sealed-chip">AI claim hidden</span>}
      />

      <nav className="blind-progress" aria-label="Case review progress">
        <span>Case File</span>
        <strong>Blind Read</strong>
        <span>AI Reveal</span>
        <span>Verdict</span>
      </nav>

      <div className="blind-context-row">
        <SealedClaimBlock
          title="AI claim hidden"
          description="The model’s label is hidden until you submit your own interpretation."
        />
        <SemanticMiniMap
          caseFile={caseFile}
          detail="Related sessions"
          label="Observed behaviour cluster"
          neutral
          showEvidenceMetric={false}
        />
      </div>

      <div className="blind-decision-layout">
        <article className="blind-evidence-panel">
          <SectionHeader
            title="Evidence summary"
            description="A short read of the visible packet before any AI claim is shown."
          />
          <div className="evidence-summary-grid">
            {evidenceSummary.map((group) => (
              <section className="evidence-summary-group" key={group.title}>
                <h4>{group.title}</h4>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <details className="technical-evidence-disclosure">
            <summary>View technical evidence</summary>
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
                    className={`choice-card ${isSelected ? "is-selected" : ""}`}
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
  items: string[];
};

function buildEvidenceSummary(caseFile: CaseFile): EvidenceSummaryGroup[] {
  if (caseFile.id === "case-arena-001") {
    return [
      {
        title: "What happened",
        items: [
          "IAM role creation and policy attachment were observed.",
          "Activity occurred during a daytime rollout window.",
        ],
      },
      {
        title: "What limits a stronger conclusion",
        items: [
          "No confirmed downstream abuse was observed.",
          "No sensitive data access was confirmed after the change.",
        ],
      },
      {
        title: "What remains ambiguous",
        items: [
          "One off-hours PassRole-like probe appears outside the rollout window.",
        ],
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
      title: "What happened",
      items:
        happened.length > 0
          ? happened
          : [caseFile.cluster.description ?? caseFile.cluster.name],
    },
    {
      title: "What limits a stronger conclusion",
      items:
        limiting.length > 0
          ? limiting
          : ["No additional limiting evidence is attached to this sample packet."],
    },
    {
      title: "What remains ambiguous",
      items:
        ambiguous.length > 0
          ? ambiguous
          : ["The packet still requires a reviewer choice before the AI label is shown."],
    },
  ];
}
