import {
  arenaStages,
  labelsMatch,
  type CaseReviewState,
} from "@/lib/arenaReviewState";
import { formatSupportScore, getAverageSupportScore } from "@/lib/caseMetrics";
import type { CaseFile } from "@/lib/types";

type AiRevealPanelProps = {
  caseFile: CaseFile;
  reviewState: CaseReviewState;
  onRevealAiLabel: () => void;
  onContinue: () => void;
  onBackToBlindRead: () => void;
};

export function AiRevealPanel({
  caseFile,
  reviewState,
  onRevealAiLabel,
  onContinue,
  onBackToBlindRead,
}: AiRevealPanelProps) {
  const blindChoice = caseFile.blindInterpretationOptions.find(
    (option) => option.id === reviewState.blindChoiceId,
  );
  const revealed = Boolean(reviewState.aiLabelRevealed);
  const agrees = labelsMatch(blindChoice?.label, caseFile.topicLabel.name);
  const assessment = getAssessmentCopy(caseFile, revealed);
  const comparisonCopy = getComparisonCopy(caseFile, blindChoice?.label);
  const evidenceRows = getEvidenceAlignmentRows(caseFile);
  const scoringDetails = [
    {
      label: "Evidence support for AI claim",
      value: formatSupportScore(caseFile.evidenceStrength),
    },
    {
      label: "User/AI agreement",
      value: formatSupportScore(caseFile.modelAgreement),
    },
    {
      label: "Model uncertainty",
      value: formatSupportScore(caseFile.uncertainty),
    },
    {
      label: "Average signal support",
      value: formatSupportScore(getAverageSupportScore(caseFile)),
    },
  ];

  return (
    <section className="ai-reveal-stage stage-surface" aria-label="AI Reveal">
      <RevealProgress />

      <header className="reveal-hero">
        <div className="reveal-hero-copy">
          <p className="eyebrow">AI Reveal</p>
          <h2>
            {revealed
              ? agrees
                ? "Your read and the AI label align."
                : "Your read and the AI label diverge."
              : "Reveal the AI label."}
          </h2>
          <p className="reveal-hero-summary">
            {revealed
              ? `You selected ${blindChoice?.label ?? "a blind read"}. The model suggested ${caseFile.topicLabel.name}.`
              : "Your blind read is saved. Reveal the model claim before reviewing the evidence board."}
          </p>
          <p className="reveal-hero-context">
            This is not a verdict. It highlights a conflict that needs evidence
            review.
          </p>
        </div>
        <aside className="reveal-status" aria-label="Current assessment">
          <span className={assessment.className}>{assessment.label}</span>
          <p>{assessment.body}</p>
        </aside>
      </header>

      <div className={`reveal-comparison ${revealed ? "is-revealed" : ""}`}>
        <article className="reveal-card blind-card">
          <span>Your blind read</span>
          <strong>{blindChoice?.label ?? "Awaiting blind choice"}</strong>
          <p>{comparisonCopy.blind}</p>
        </article>

        <div className="reveal-comparison-divider" aria-hidden="true">
          <span>{revealed && agrees ? "matches" : "versus"}</span>
        </div>

        <article className="reveal-card ai-card">
          <span>AI label</span>
          {revealed ? (
            <>
              <strong>{caseFile.topicLabel.name}</strong>
              <p>{comparisonCopy.ai}</p>
            </>
          ) : (
            <>
              <strong className="redacted-claim">Hidden claim</strong>
              <p>The claim remains unavailable until the blind read is recorded.</p>
            </>
          )}
        </article>
      </div>

      <section className="reveal-evidence-alignment" aria-labelledby="overclaim-reason">
        <div className="reveal-section-heading">
          <h3 id="overclaim-reason">Why this may be an overclaim</h3>
          <p>
            The evidence confirms some IAM activity, but the strongest claim needs
            more support.
          </p>
        </div>

        <div className="reveal-evidence-list">
          {evidenceRows.map((row) => (
            <div className="reveal-evidence-row" key={row.label}>
              <span>{row.label}</span>
              <p>{row.body}</p>
            </div>
          ))}
        </div>
      </section>

      <details className="reveal-scoring-details">
        <summary>View scoring details</summary>
        <div className="reveal-score-grid" aria-label="Technical scoring">
          {scoringDetails.map((detail) => (
            <div key={detail.label}>
              <span>{detail.label}</span>
              <strong>{detail.value}</strong>
            </div>
          ))}
        </div>
      </details>

      <footer className="reveal-actions" aria-label="AI Reveal actions">
        <p>Inspect the signals before deciding whether the AI label is supported.</p>
        <div>
          <button
            type="button"
            className="secondary-action"
            onClick={onBackToBlindRead}
          >
            Back to blind read
          </button>
          {revealed ? (
            <button type="button" className="primary-action" onClick={onContinue}>
              Review evidence board
            </button>
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
        </div>
      </footer>
    </section>
  );
}

function RevealProgress() {
  const currentStageIndex = arenaStages.findIndex((stage) => stage.id === "ai_reveal");

  return (
    <nav className="reveal-progress" aria-label="AI Reveal progress">
      <div className="reveal-progress-summary">
        <strong>Step 4 of 8 · AI Reveal</strong>
      </div>
      <ol>
        {arenaStages.map((stage, index) => {
          const isCurrent = stage.id === "ai_reveal";
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

function getAssessmentCopy(caseFile: CaseFile, revealed: boolean) {
  if (!revealed) {
    return {
      label: "Sealed",
      body: "The model claim is still hidden until the reviewer triggers the reveal.",
      className: "reveal-status-badge is-sealed",
    };
  }

  if (caseFile.landscapeStatus === "overclaimed") {
    return {
      label: "Likely overclaim",
      body:
        "The evidence confirms IAM activity, but does not yet show malicious intent, privilege abuse, or sensitive data access.",
      className: "reveal-status-badge is-overclaim",
    };
  }

  return {
    label: "Needs evidence review",
    body: "Use the evidence board to judge whether the model label is grounded.",
    className: "reveal-status-badge is-neutral",
  };
}

function getComparisonCopy(caseFile: CaseFile, blindChoiceLabel?: string) {
  const blind =
    caseFile.id === "case-arena-001" &&
    blindChoiceLabel === "Cloud resource discovery"
      ? "Discovery-like activity is present, but it is not the dominant evidence in this case."
      : "This is the interpretation selected before the model label was shown.";

  const ai =
    caseFile.id === "case-arena-001"
      ? "The model raised the severity because IAM role creation and policy attachment were observed."
      : caseFile.topicLabel.explanation;

  return { blind, ai };
}

function getEvidenceAlignmentRows(caseFile: CaseFile) {
  if (caseFile.id === "case-arena-001") {
    return [
      {
        label: "Observed",
        body: "IAM role creation and policy attachment.",
      },
      {
        label: "Missing",
        body:
          "No confirmed downstream abuse, sensitive data access, or malicious intent.",
      },
      {
        label: "Ambiguous",
        body: "One PassRole-like probe appears outside the rollout window.",
      },
    ];
  }

  return [
    {
      label: "Observed",
      body: caseFile.evidenceItems[0]?.summary ?? caseFile.cluster.description,
    },
    {
      label: "Missing",
      body:
        caseFile.claims.find((claim) => claim.status === "unsupported")?.rationale ??
        "The evidence board should confirm whether any claim is unsupported.",
    },
    {
      label: "Ambiguous",
      body:
        caseFile.evidenceItems.find((item) =>
          caseFile.evidenceRelations.some(
            (relation) =>
              relation.evidenceId === item.id && relation.polarity === "neutral",
          ),
        )?.summary ?? "No seeded ambiguous evidence is attached to this case.",
    },
  ];
}
