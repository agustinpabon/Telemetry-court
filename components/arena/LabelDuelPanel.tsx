import { duelReasonLabel } from "@/components/arena/arenaMeta";
import { Fragment } from "react";
import {
  ArenaActionFooter,
  ArenaStatusBadge,
  ArenaStepHero,
  ArenaWorkflowShell,
} from "@/components/arena/WorkflowPrimitives";
import { ReviewTerminologyHelp } from "@/components/arena/ReviewTerminologyHelp";
import {
  getEvidenceBalance,
  getEvidenceRatings,
  type CaseReviewState,
} from "@/lib/arenaReviewState";
import type { InsufficientContextGuidance } from "@/lib/reviewReadiness";
import type { CandidateLabel, CaseFile, DuelReason } from "@/lib/types";

const alternativeLabelReasonOptions: DuelReason[] = [
  "less_overclaimed",
  "missing_malicious_intent",
  "missing_downstream_abuse",
  "better_supported",
  "preserves_uncertainty",
  "cluster_seems_mixed",
];

const aiLabelReasonOptions: DuelReason[] = [
  "more_specific",
  "preserves_uncertainty",
];

type LabelDuelPanelProps = {
  caseFile: CaseFile;
  reviewState: CaseReviewState;
  insufficientContextGuidance?: InsufficientContextGuidance;
  onSelectWinner: (candidateId: string) => void;
  onToggleReason: (reason: DuelReason) => void;
  onSetDuelNote: (note: string) => void;
  onBackToEvidenceBoard?: () => void;
  onContinue: () => void;
};

export function LabelDuelPanel({
  caseFile,
  reviewState,
  insufficientContextGuidance,
  onSelectWinner,
  onToggleReason,
  onSetDuelNote,
  onBackToEvidenceBoard,
  onContinue,
}: LabelDuelPanelProps) {
  const selectedCandidate = caseFile.candidateLabels.find(
    (candidate) => candidate.id === reviewState.labelDuelWinnerId,
  );
  const recommendedCandidate =
    caseFile.candidateLabels.find(
      (candidate) => candidate.id === caseFile.seededBestLabelId,
    ) ??
    [...caseFile.candidateLabels].sort(
      (left, right) => right.supportEstimate - left.supportEstimate,
    )[0];
  const alternativeCandidates = caseFile.candidateLabels.filter(
    (candidate) => candidate.id !== recommendedCandidate?.id,
  );
  const evidenceRatings = getEvidenceRatings(caseFile, reviewState);
  const balance = getEvidenceBalance(caseFile, evidenceRatings);
  const signalLabel =
    caseFile.landscapeStatus === "overclaimed"
      ? "Likely overclaim"
      : "Needs label review";

  return (
    <ArenaWorkflowShell className="label-duel-stage" ariaLabel="Label Selection">
      <ArenaStepHero
        status={
          <ArenaStatusBadge tone="uncertain">
            Label Selection · {caseFile.candidateLabels.length} candidate labels
          </ArenaStatusBadge>
        }
        title="Which label is best supported?"
        summary="Select the candidate you judge best-supported and most defensible."
      />
      <ReviewTerminologyHelp terms={["ai_label", "claim", "evidence"]} />
      <p className="duel-contract-note">
        ReviewResult meaning: selected_label_id records the candidate you accept
        as best-supported and most defensible.
      </p>

      <section className="duel-evidence-summary" aria-label="Evidence summary">
        <div>
          <span>AI claim</span>
          <strong>{caseFile.topicLabel.name}</strong>
        </div>
        <div>
          <span>Your evidence read</span>
          <strong>{formatEvidenceBalance(balance)}</strong>
        </div>
        <div>
          <span>Current signal</span>
          <strong className="duel-signal-pill">{signalLabel}</strong>
        </div>
      </section>

      {insufficientContextGuidance ? (
        <aside className="insufficient-context-guidance">
          <strong>Context-limited review</strong>
          <p>
            Choose the uncertainty-preserving label when no label is defensible.
          </p>
        </aside>
      ) : null}

      <section className="duel-candidate-section" aria-labelledby="duel-candidates-title">
        <div className="duel-section-heading">
          <h3 id="duel-candidates-title">Candidate labels</h3>
        </div>

        {recommendedCandidate ? (
          <CandidateLabelCard
            candidate={recommendedCandidate}
            isRecommended
            isContextGuided={
              Boolean(insufficientContextGuidance) &&
              recommendedCandidate.source === "uncertain_label"
            }
            isSelected={reviewState.labelDuelWinnerId === recommendedCandidate.id}
            onSelectWinner={onSelectWinner}
          />
        ) : null}

        {selectedCandidate?.id === recommendedCandidate?.id ? (
          <DuelReasonPanel
            selectedCandidate={selectedCandidate}
            reviewState={reviewState}
            onToggleReason={onToggleReason}
            onSetDuelNote={onSetDuelNote}
          />
        ) : null}

        <div className="duel-alternatives" aria-labelledby="duel-alternatives-title">
          <div className="duel-alternatives-heading">
            <h4 id="duel-alternatives-title">Other possible labels</h4>
          </div>
          <div className="duel-alternative-grid">
            {alternativeCandidates.map((candidate) => (
              <Fragment key={candidate.id}>
                <CandidateLabelCard
                  candidate={candidate}
                  isContextGuided={
                    Boolean(insufficientContextGuidance) &&
                    candidate.source === "uncertain_label"
                  }
                  isSelected={reviewState.labelDuelWinnerId === candidate.id}
                  onSelectWinner={onSelectWinner}
                />
                {selectedCandidate?.id === candidate.id ? (
                  <DuelReasonPanel
                    selectedCandidate={selectedCandidate}
                    reviewState={reviewState}
                    onToggleReason={onToggleReason}
                    onSetDuelNote={onSetDuelNote}
                  />
                ) : null}
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      <ArenaActionFooter
        className="label-duel-actions"
        ariaLabel="Label Selection actions"
        microcopy={
          selectedCandidate
            ? selectedCandidate.source === "baseline_ai"
              ? `AI label accepted as best-supported: ${selectedCandidate.label}. Its cluster fit will be checked next.`
              : `Chosen as more defensible than the AI label: ${selectedCandidate.label}. Its cluster fit will be checked next.`
            : "Select one label to continue."
        }
        secondaryAction={
          onBackToEvidenceBoard
            ? {
                label: "Return to evidence verification",
                onClick: onBackToEvidenceBoard,
              }
            : undefined
        }
        primaryAction={{
          label: "Proceed to cluster fit check",
          disabled: !reviewState.labelDuelWinnerId,
          onClick: onContinue,
        }}
      />
    </ArenaWorkflowShell>
  );
}

function DuelReasonPanel({
  selectedCandidate,
  reviewState,
  onToggleReason,
  onSetDuelNote,
}: {
  selectedCandidate: CandidateLabel;
  reviewState: CaseReviewState;
  onToggleReason: (reason: DuelReason) => void;
  onSetDuelNote: (note: string) => void;
}) {
  const isAiLabel = selectedCandidate.source === "baseline_ai";
  const reasonOptions = isAiLabel
    ? aiLabelReasonOptions
    : alternativeLabelReasonOptions;

  return (
    <section className="reason-panel" aria-labelledby="duel-reason-title">
      <div className="duel-section-heading">
        <h3 id="duel-reason-title">
          {isAiLabel ? "Why accept the AI label?" : "Why this label?"}
        </h3>
        <p>
          {isAiLabel
            ? "Choosing the AI label accepts it as the best-supported candidate; these reasons should support that choice, not describe it as flawed."
            : "These reasons compare the selected label with the AI label and explain why it is more defensible."}
        </p>
      </div>
      <div className="chip-row">
        {reasonOptions.map((reason) => {
          const isSelected = (reviewState.duelReasons ?? []).includes(reason);

          return (
            <button
              key={`duel-${reason}`}
              type="button"
              className={`chip-button ${isSelected ? "is-selected" : ""}`}
              onClick={() => onToggleReason(reason)}
              aria-pressed={isSelected}
            >
              {duelReasonLabel[reason]}
            </button>
          );
        })}
      </div>
      <label className="duel-note-field">
        <span>Add a short note, optional</span>
        <textarea
          value={reviewState.duelNote ?? ""}
          onChange={(event) => onSetDuelNote(event.currentTarget.value)}
          rows={3}
          placeholder="Optional rationale for why this candidate is best-supported..."
        />
      </label>
    </section>
  );
}

function CandidateLabelCard({
  candidate,
  isRecommended = false,
  isContextGuided = false,
  isSelected,
  onSelectWinner,
}: {
  candidate: CandidateLabel;
  isRecommended?: boolean;
  isContextGuided?: boolean;
  isSelected: boolean;
  onSelectWinner: (candidateId: string) => void;
}) {
  const decisionMeta = getCandidateDecisionMeta(candidate, isRecommended);
  const isAiLabel = candidate.source === "baseline_ai";
  const selectionLabel = isSelected
    ? isAiLabel
      ? "Accepted as best supported"
      : "Chosen as best supported"
    : isAiLabel
      ? "Accept as best supported"
      : "Choose as best supported";

  return (
    <button
      type="button"
      className={[
        "duel-card",
        isRecommended ? "duel-card-primary" : "",
        isSelected ? "is-selected" : "",
        isContextGuided ? "is-guided-option" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => onSelectWinner(candidate.id)}
      aria-pressed={isSelected}
    >
      <div className="duel-card-topline">
        <div className="duel-card-meta">
          <span>{decisionMeta.badge}</span>
          {decisionMeta.fitLabel ? <em>{decisionMeta.fitLabel}</em> : null}
        </div>
        <span
          className={`duel-card-affordance ${isSelected ? "is-selected" : ""}`}
          aria-hidden="true"
        >
          {selectionLabel}
        </span>
      </div>
      <strong>{candidate.label}</strong>
      <p>{decisionMeta.description}</p>
      {isContextGuided ? <small>Context-safe option</small> : null}
      {isSelected && decisionMeta.evidenceNote ? (
        <small>{decisionMeta.evidenceNote}</small>
      ) : null}
    </button>
  );
}

function getCandidateDecisionMeta(
  candidate: CandidateLabel,
  isRecommended: boolean,
) {
  const seededCopy: Record<
    string,
    {
      badge: string;
      fitLabel?: string;
      description: string;
      evidenceNote?: string;
    }
  > = {
    "label-iam-baseline": {
      badge: "AI-generated label",
      fitLabel: "Too strong",
      description:
        "Assumes suspicious escalation from IAM changes, but the evidence does not prove unauthorized use.",
    },
    "label-iam-constrained": {
      badge: "Best supported",
      description:
        "Best matches the observed IAM activity without assuming malicious escalation.",
      evidenceNote:
        "Role creation and policy attachment were observed, but downstream abuse, sensitive access, and malicious intent were not proven.",
    },
    "label-iam-human": {
      badge: "More specific label",
      fitLabel: "Plausible but narrow",
      description:
        "Names the rollout pattern, but may overfit one context when the broader evidence is routine administration.",
    },
    "label-iam-uncertain": {
      badge: "Uncertainty label",
      fitLabel: "Safer but vague",
      description:
        "Avoids guessing intent, but is less useful if the evidence already supports routine provisioning.",
    },
  };

  if (seededCopy[candidate.id]) {
    return seededCopy[candidate.id];
  }

  if (isRecommended) {
    return {
      badge: "Best supported",
      description: candidate.rationale,
      evidenceNote:
        "This label has the strongest support among the available candidates.",
    };
  }

  if (candidate.supportEstimate >= 0.72) {
    return {
      badge: "Strong match",
      fitLabel: "Plausible",
      description: candidate.rationale,
    };
  }

  if (candidate.supportEstimate <= 0.35) {
    return {
      badge: "Too strong",
      fitLabel: "Weak fit",
      description: candidate.rationale,
    };
  }

  return {
    badge: "Plausible",
    fitLabel: "Needs judgment",
    description: candidate.rationale,
  };
}

function formatEvidenceBalance(balance: ReturnType<typeof getEvidenceBalance>) {
  const parts = [
    {
      value: balance.supporting,
      singularLabel: "support",
      pluralLabel: "supports",
    },
    {
      value: balance.weak,
      singularLabel: "weak support",
      pluralLabel: "weak support",
    },
    {
      value: balance.contradictory,
      singularLabel: "contradiction",
      pluralLabel: "contradictions",
    },
    {
      value: balance.contextGaps,
      singularLabel: "needs context",
      pluralLabel: "need context",
    },
  ].filter((item) => item.value > 0);

  return parts
    .map(
      (part) =>
        `${part.value} ${
          part.value === 1 ? part.singularLabel : part.pluralLabel
        }`,
    )
    .join(" · ");
}
