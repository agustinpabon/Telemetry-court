import {
  labelsMatch,
  type CaseReviewState,
} from "@/lib/arenaReviewState";
import { formatSupportScore, getAverageSupportScore } from "@/lib/caseMetrics";
import {
  ArenaActionFooter,
  ArenaStatusBadge,
  ArenaStepHero,
  ArenaStepProgress,
  ArenaWorkflowShell,
} from "@/components/arena/WorkflowPrimitives";
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
    <ArenaWorkflowShell className="ai-reveal-stage" ariaLabel="AI Reveal">
      <ArenaStepProgress currentStage="ai_reveal" />

      <ArenaStepHero
        eyebrow="AI Reveal"
        status={
          <ArenaStatusBadge
            tone={assessment.tone}
            ariaLabel={`${assessment.label}: ${assessment.body}`}
          >
            {assessment.label}
          </ArenaStatusBadge>
        }
        title={
          revealed
            ? agrees
              ? "Your read and the AI label align."
              : "Your read and the AI label diverge."
            : "Reveal the AI label."
        }
        summary={
          revealed
            ? `You selected ${blindChoice?.label ?? "a blind read"}. The model suggested ${caseFile.topicLabel.name}.`
            : "Your blind read is saved. Reveal the model claim before reviewing the evidence board."
        }
        context="This is not a verdict. It highlights a conflict that needs evidence review."
      />

      <div
        className={`arena-comparison-block reveal-comparison ${
          revealed ? "is-revealed" : ""
        }`}
      >
        <article className="arena-comparison-card reveal-card blind-card">
          <span>Your blind read</span>
          <strong>{blindChoice?.label ?? "Awaiting blind choice"}</strong>
          <p>{comparisonCopy.blind}</p>
        </article>

        <article className="arena-comparison-card reveal-card ai-card">
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

      <section
        className="arena-soft-section reveal-evidence-alignment"
        aria-labelledby="overclaim-reason"
      >
        <div className="arena-section-heading reveal-section-heading">
          <h3 id="overclaim-reason">Why this may be an overclaim</h3>
          <p>
            The evidence confirms IAM activity, but the strongest claim needs more
            support.
          </p>
        </div>

        <div className="arena-evidence-rows reveal-evidence-list">
          {evidenceRows.map((row) => (
            <div className="arena-evidence-row reveal-evidence-row" key={row.label}>
              <span>{row.label}</span>
              <p>{row.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="reveal-bottom-controls">
        <details className="reveal-scoring-details">
          <summary>
            <span>View scoring details</span>
          </summary>
          <div className="reveal-score-grid" aria-label="Technical scoring">
            {scoringDetails.map((detail) => (
              <div key={detail.label}>
                <span>{detail.label}</span>
                <strong>{detail.value}</strong>
              </div>
            ))}
          </div>
        </details>

        <ArenaActionFooter
          className="reveal-actions"
          ariaLabel="AI Reveal actions"
          microcopy="Inspect the signals before deciding whether the AI label is supported."
          secondaryAction={{
            label: "Back to blind read",
            onClick: onBackToBlindRead,
          }}
          primaryAction={
            revealed
              ? {
                  label: "Review evidence board",
                  onClick: onContinue,
                }
              : {
                  label: "Reveal AI label",
                  disabled: !reviewState.blindChoiceId,
                  onClick: onRevealAiLabel,
                }
          }
        />
      </div>
    </ArenaWorkflowShell>
  );
}

function getAssessmentCopy(caseFile: CaseFile, revealed: boolean) {
  if (!revealed) {
    return {
      label: "Sealed",
      body: "The model claim is still hidden until the reviewer triggers the reveal.",
      tone: "sealed" as const,
    };
  }

  if (caseFile.landscapeStatus === "overclaimed") {
    return {
      label: "Likely overclaim",
      body:
        "The evidence confirms IAM activity, but does not yet show malicious intent, privilege abuse, or sensitive data access.",
      tone: "overclaim" as const,
    };
  }

  return {
    label: "Needs evidence review",
    body: "Use the evidence board to judge whether the model label is grounded.",
    tone: "neutral" as const,
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
