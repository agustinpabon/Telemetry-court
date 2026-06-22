import {
  duelReasonLabel,
} from "@/components/arena/arenaMeta";
import { Fragment } from "react";
import {
  ArenaActionFooter,
  ArenaStatusBadge,
  ArenaStepHero,
  ArenaStepProgress,
  ArenaWorkflowShell,
} from "@/components/arena/WorkflowPrimitives";
import {
  getEvidenceBalance,
  getEvidenceRatings,
  type ArenaStage,
  type CaseReviewState,
} from "@/lib/arenaReviewState";
import type { CandidateLabel, CaseFile, DuelReason } from "@/lib/types";

const labelDuelReasonOptions: DuelReason[] = [
  "less_overclaimed",
  "missing_malicious_intent",
  "missing_downstream_abuse",
  "better_supported",
  "preserves_uncertainty",
  "cluster_seems_mixed",
];

type LabelDuelPanelProps = {
  caseFile: CaseFile;
  reviewState: CaseReviewState;
  onSelectWinner: (candidateId: string) => void;
  onToggleReason: (reason: DuelReason) => void;
  onSetDuelNote: (note: string) => void;
  onBackToEvidenceBoard?: () => void;
  onContinue: () => void;
  onSelectStage?: (stage: ArenaStage) => void;
};

export function LabelDuelPanel({
  caseFile,
  reviewState,
  onSelectWinner,
  onToggleReason,
  onSetDuelNote,
  onBackToEvidenceBoard,
  onContinue,
  onSelectStage,
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
      <ArenaStepProgress currentStage="label_duel" onSelectStage={onSelectStage} />

      <ArenaStepHero
        status={
          <ArenaStatusBadge tone="uncertain">
            Label Selection · {caseFile.candidateLabels.length} candidate labels
          </ArenaStatusBadge>
        }
        title="Which interpretation is most strictly supported by the observed evidence?"
        summary="Pick the interpretation that best matches what was actually observed."
      />

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

      <section className="duel-candidate-section" aria-labelledby="duel-candidates-title">
        <div className="duel-section-heading">
          <h3 id="duel-candidates-title">Candidate labels</h3>
          <p>Select the label that is best supported by the evidence.</p>
        </div>

        {recommendedCandidate ? (
          <CandidateLabelCard
            candidate={recommendedCandidate}
            isRecommended
            isSelected={reviewState.labelDuelWinnerId === recommendedCandidate.id}
            onSelectWinner={onSelectWinner}
          />
        ) : null}

        {selectedCandidate?.id === recommendedCandidate?.id ? (
          <DuelReasonPanel
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
                  isSelected={reviewState.labelDuelWinnerId === candidate.id}
                  onSelectWinner={onSelectWinner}
                />
                {selectedCandidate?.id === candidate.id ? (
                  <DuelReasonPanel
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
            ? `Selected: ${selectedCandidate.label}. Its cluster fit will be checked next.`
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
  reviewState,
  onToggleReason,
  onSetDuelNote,
}: {
  reviewState: CaseReviewState;
  onToggleReason: (reason: DuelReason) => void;
  onSetDuelNote: (note: string) => void;
}) {
  return (
    <section className="reason-panel" aria-labelledby="duel-reason-title">
      <div className="duel-section-heading">
        <h3 id="duel-reason-title">Why this label?</h3>
        <p>Select one or more reasons, or add a short note.</p>
      </div>
      <div className="chip-row">
        {labelDuelReasonOptions.map((reason) => {
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
          placeholder="Optional note for the final review..."
        />
      </label>
    </section>
  );
}

function CandidateLabelCard({
  candidate,
  isRecommended = false,
  isSelected,
  onSelectWinner,
}: {
  candidate: CandidateLabel;
  isRecommended?: boolean;
  isSelected: boolean;
  onSelectWinner: (candidateId: string) => void;
}) {
  const decisionMeta = getCandidateDecisionMeta(candidate, isRecommended);

  return (
    <button
      type="button"
      className={`duel-card ${isRecommended ? "duel-card-primary" : ""} ${
        isSelected ? "is-selected" : ""
      }`}
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
          {isSelected ? "Selected" : isRecommended ? "Select label" : "Select"}
        </span>
      </div>
      <strong>{candidate.label}</strong>
      <p>{decisionMeta.description}</p>
      {decisionMeta.evidenceNote ? <small>{decisionMeta.evidenceNote}</small> : null}
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
      badge: "Original AI claim",
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
