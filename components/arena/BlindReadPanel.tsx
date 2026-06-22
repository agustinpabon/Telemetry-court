import { SemanticMiniMap } from "@/components/arena/SemanticMiniMap";
import {
  ArenaActionFooter,
  ArenaStatusBadge,
  ArenaStepHero,
  ArenaWorkflowShell,
  SectionHeader,
} from "@/components/arena/WorkflowPrimitives";
import type { CaseReviewState } from "@/lib/arenaReviewState";
import {
  getContextLimitedBlindOptionId,
  getInsufficientContextGuidance,
  getVisibleDomainContextTerms,
  reviewReadinessOptions,
  type ReviewReadinessChoice,
} from "@/lib/reviewReadiness";
import type { CaseFile } from "@/lib/types";

type BlindReadPanelProps = {
  caseFile: CaseFile;
  reviewState: CaseReviewState;
  reviewReadinessChoice?: ReviewReadinessChoice;
  onChooseReviewReadiness: (choice: ReviewReadinessChoice) => void;
  onChooseBlindInterpretation: (optionId: string) => void;
  onRevealAiLabel: () => void;
};

export function BlindReadPanel({
  caseFile,
  reviewState,
  reviewReadinessChoice,
  onChooseReviewReadiness,
  onChooseBlindInterpretation,
  onRevealAiLabel,
}: BlindReadPanelProps) {
  const evidenceSummary = buildEvidenceSummary(caseFile);
  const domainContextTerms = getVisibleDomainContextTerms(caseFile);
  const insufficientContextGuidance =
    getInsufficientContextGuidance(reviewReadinessChoice);
  const contextLimitedBlindOptionId = getContextLimitedBlindOptionId(caseFile);
  const hasReadinessChoice = Boolean(reviewReadinessChoice);
  const hasBlindChoice = Boolean(reviewState.blindChoiceId);
  const actionLabel = !hasReadinessChoice
    ? "Choose context checkpoint to continue"
    : hasBlindChoice
      ? reviewState.aiLabelRevealed
        ? "Continue to AI Claim Check"
        : "Reveal AI claim"
      : "Choose an interpretation to continue";

  return (
    <ArenaWorkflowShell className="blind-stage" ariaLabel="Initial Assessment">
      <ArenaStepHero
        eyebrow="Initial Assessment"
        status={
          <ArenaStatusBadge tone="sealed">
            AI claim hidden
          </ArenaStatusBadge>
        }
        title="Start with what you can judge."
        summary="Use only the visible evidence. The AI label stays hidden."
      />

      <div className="blind-decision-layout">
        <section
          className="review-readiness-checkpoint"
          aria-labelledby="review-readiness-title"
        >
          <div className="review-readiness-copy">
            <span>Checkpoint</span>
            <h3 id="review-readiness-title">Can you judge this case?</h3>
            <p>
              You are not deciding whether the cluster is dangerous; you are
              deciding whether the AI label is supported by the evidence.
            </p>
            {domainContextTerms.length > 0 ? (
              <p className="domain-context-signal">
                Domain context may be needed: {domainContextTerms.join(" / ")}.
              </p>
            ) : null}
          </div>
          <fieldset className="review-readiness-options">
            <legend className="sr-only">Review context checkpoint</legend>
            {reviewReadinessOptions.map((option) => {
              const isSelected = reviewReadinessChoice === option.id;
              const selectedStateId = `review-readiness-${option.id}-state`;

              return (
                <label
                  key={option.id}
                  className={[
                    "readiness-option",
                    isSelected ? "is-selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <input
                    aria-describedby={isSelected ? selectedStateId : undefined}
                    checked={isSelected}
                    name="review-readiness"
                    onChange={() => onChooseReviewReadiness(option.id)}
                    type="radio"
                    value={option.id}
                  />
                  <span className="readiness-option-mark" aria-hidden="true" />
                  <span className="readiness-option-copy">
                    <strong>{option.label}</strong>
                  </span>
                  {isSelected ? (
                    <span
                      className="readiness-option-state"
                      id={selectedStateId}
                    >
                      Selected
                    </span>
                  ) : null}
                </label>
              );
            })}
          </fieldset>
        </section>

        <article className="blind-evidence-panel">
          <SectionHeader
            title="Evidence summary"
            description="Visible packet only. The AI claim is still hidden."
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
                Selected region and nearby sessions.
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
            description="Choose the strongest conclusion the visible evidence supports."
          />
          {insufficientContextGuidance ? (
            <aside className="insufficient-context-guidance">
              <strong>Context-limited review</strong>
              <p>
                Use Not enough evidence when missing context blocks judgment.
              </p>
            </aside>
          ) : null}
          <fieldset className="blind-choice-fieldset">
            <legend className="blind-choice-legend">Choose one interpretation</legend>
            <div className="blind-choice-grid">
              {caseFile.blindInterpretationOptions.map((option) => {
                const isSelected = reviewState.blindChoiceId === option.id;
                const isContextSafeOption =
                  insufficientContextGuidance &&
                  option.id === contextLimitedBlindOptionId;

                return (
                  <label
                    key={option.id}
                    className={[
                      "choice-card",
                      isSelected ? "is-selected" : "",
                      option.id === "none-of-these" ? "is-secondary-option" : "",
                      isContextSafeOption ? "is-guided-option" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
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
                      {isContextSafeOption ? <small>Context-safe choice</small> : null}
                    </span>
                    {isSelected ? <em>Selected</em> : null}
                  </label>
                );
              })}
            </div>
          </fieldset>
          <ArenaActionFooter
            className="blind-decision-footer"
            ariaLabel="Initial Assessment actions"
            microcopy={
              reviewState.aiLabelRevealed
                ? "Your initial assessment is already saved."
                : hasReadinessChoice
                  ? "Your choice will be saved before the AI label is shown."
                  : "Answer the checkpoint, then choose an interpretation before reveal."
            }
            primaryAction={{
              label: actionLabel,
              disabled: !hasReadinessChoice || !hasBlindChoice,
              onClick: onRevealAiLabel,
            }}
          />
        </article>
      </div>
    </ArenaWorkflowShell>
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
