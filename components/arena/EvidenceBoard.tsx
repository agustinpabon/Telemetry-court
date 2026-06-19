import { evidenceRatingMeta, evidenceRatingOptions } from "@/components/arena/arenaMeta";
import {
  ArenaActionFooter,
  ArenaStatusBadge,
  ArenaStepHero,
  ArenaStepProgress,
  ArenaWorkflowShell,
} from "@/components/arena/WorkflowPrimitives";
import { getRelationsForEvidence } from "@/lib/caseMetrics";
import type {
  ArenaStage,
  CaseReviewState,
  EvidenceBalance as EvidenceBalanceValue,
} from "@/lib/arenaReviewState";
import type {
  CaseFile,
  EvidenceItem,
  EvidenceRating,
  EvidenceRelation,
} from "@/lib/types";

const mainEvidenceRatingOptions = evidenceRatingOptions.filter(
  (option) => option !== "irrelevant_noise",
);

type EvidenceBoardProps = {
  caseFile: CaseFile;
  reviewState?: CaseReviewState;
  evidenceRatings: Record<string, EvidenceRating>;
  balance: EvidenceBalanceValue;
  onRateEvidence: (evidenceId: string, rating: EvidenceRating) => void;
  onBackToAiReveal?: () => void;
  onContinue?: () => void;
  onSelectStage?: (stage: ArenaStage) => void;
};

export function EvidenceBoard({
  caseFile,
  reviewState = {},
  evidenceRatings,
  balance,
  onRateEvidence,
  onBackToAiReveal,
  onContinue,
  onSelectStage,
}: EvidenceBoardProps) {
  const blindChoice = caseFile.blindInterpretationOptions.find(
    (option) => option.id === reviewState.blindChoiceId,
  );
  const reviewerRatings = reviewState.evidenceRatings ?? {};
  const classifiedEvidenceCount = caseFile.evidenceItems.filter(
    (evidence) =>
      evidenceRatings[evidence.id] ?? caseFile.defaultEvidenceRatings[evidence.id],
  ).length;
  const allEvidenceClassified =
    classifiedEvidenceCount >= caseFile.evidenceItems.length;
  const claimChecklist = getClaimChecklist(caseFile);
  const signalLabel =
    caseFile.landscapeStatus === "overclaimed"
      ? "Likely overclaim"
      : "Needs evidence review";

  return (
    <ArenaWorkflowShell
      className="evidence-board-stage"
      ariaLabel="Evidence Board"
    >
      <ArenaStepProgress
        currentStage="evidence_board"
        onSelectStage={onSelectStage}
      />

      <ArenaStepHero
        status={
          <ArenaStatusBadge
            tone={
              caseFile.landscapeStatus === "overclaimed"
                ? "overclaim"
                : "evidence-gap"
            }
          >
            {signalLabel}
          </ArenaStatusBadge>
        }
        title="Does the evidence support the AI claim?"
        summary="IAM activity is present, but malicious escalation is not proven."
      />

      <section className="evidence-review-context" aria-label="Review context">
        <div>
          <span>AI claim</span>
          <strong>{caseFile.topicLabel.name}</strong>
        </div>
        <div>
          <span>Your read</span>
          <strong>{blindChoice?.label ?? "Saved blind interpretation"}</strong>
        </div>
        <div>
          <span>Current signal</span>
          <strong>{signalLabel}</strong>
        </div>
      </section>

      <section
        className="evidence-balance-summary"
        aria-labelledby="evidence-balance-title"
      >
        <div className="evidence-balance-copy">
          <div className="evidence-balance-line">
            <h3 id="evidence-balance-title">
              Evidence balance: <EvidenceBalanceCounts balance={balance} />
            </h3>
          </div>
          <p>
            IAM activity is present, but downstream abuse, sensitive access, and
            malicious intent are missing.
          </p>
        </div>
      </section>

      <div className="evidence-review-layout">
        <aside
          className="claim-checklist-sidebar"
          aria-labelledby="claim-checklist-title-desktop"
        >
          <div className="claim-checklist-card claim-checklist-card-desktop">
            <div className="claim-checklist-heading">
              <strong id="claim-checklist-title-desktop">Claim checklist</strong>
              <em>Observed, missing, and ambiguous signals</em>
            </div>

            <div className="claim-checklist-body">
              <ChecklistGroup title="Observed" items={claimChecklist.observed} />
              <ChecklistGroup title="Missing" items={claimChecklist.missing} />
              <ChecklistGroup title="Ambiguous" items={claimChecklist.ambiguous} />
            </div>
          </div>

          <details className="claim-checklist-card claim-checklist-card-mobile">
            <summary>
              <span>
                <strong>Claim checklist</strong>
                <em>Observed, missing, and ambiguous signals</em>
              </span>
            </summary>

            <div className="claim-checklist-body">
              <ChecklistGroup title="Observed" items={claimChecklist.observed} />
              <ChecklistGroup title="Missing" items={claimChecklist.missing} />
              <ChecklistGroup title="Ambiguous" items={claimChecklist.ambiguous} />
            </div>
          </details>
        </aside>

        <div className="evidence-review-main">
          <div className="evidence-list-header">
            <div>
              <span>{caseFile.evidenceItems.length} evidence items</span>
              <p>
                Suggested classifications are preselected. You can change them
                before continuing.
              </p>
            </div>
            <strong>
              {classifiedEvidenceCount} of {caseFile.evidenceItems.length} classified
            </strong>
          </div>

          <div className="evidence-review-list">
            {caseFile.evidenceItems.map((evidence) => {
              const suggestedRating =
                caseFile.defaultEvidenceRatings[evidence.id] ?? "needs_context";
              const reviewerRating = reviewerRatings[evidence.id];
              const rating =
                reviewerRating ?? evidenceRatings[evidence.id] ?? suggestedRating;
              const relations = getRelationsForEvidence(caseFile, evidence.id);
              const reviewCopy = getEvidenceReviewCopy(
                caseFile,
                evidence,
                relations,
                rating,
              );

              return (
                <article
                  key={evidence.id}
                  className={`evidence-review-card evidence-review-card-${rating}`}
                >
                  <div className="evidence-review-card-header">
                    <h3>{evidence.title}</h3>
                    <div className="evidence-classification-summary">
                      <strong className={evidenceRatingMeta[rating].className}>
                        {evidenceRatingMeta[rating].label}
                      </strong>
                    </div>
                  </div>

                  <p className="evidence-card-summary">
                    <span className="evidence-summary-desktop">
                      {reviewCopy.summary} {reviewCopy.claimMeaning}
                    </span>
                    <span className="evidence-summary-mobile">
                      {reviewCopy.mobileSummary}
                    </span>
                  </p>

                  <details className="evidence-details">
                    <summary>Show details →</summary>
                    <div className="evidence-details-body">
                      <p>{reviewCopy.whyItMatters}</p>
                      <div
                        className="evidence-signal-row"
                        aria-label={`${evidence.title} key signals`}
                      >
                        <span>Key signals</span>
                        <div>
                          {reviewCopy.signals.map((signal) => (
                            <em key={`${evidence.id}-${signal}`}>{signal}</em>
                          ))}
                        </div>
                      </div>
                      <div className="evidence-secondary-actions">
                        <button
                          type="button"
                          className={`noise-rating-button ${
                            rating === "irrelevant_noise" ? "is-selected" : ""
                          }`}
                          onClick={() =>
                            onRateEvidence(evidence.id, "irrelevant_noise")
                          }
                          aria-pressed={rating === "irrelevant_noise"}
                        >
                          Mark irrelevant / noise
                        </button>
                      </div>
                    </div>
                  </details>

                  <div className="evidence-rating-row">
                    <div
                      className="rating-control"
                      role="group"
                      aria-label={`${evidence.title} classification`}
                    >
                      {mainEvidenceRatingOptions.map((option) => (
                        <button
                          key={`${evidence.id}-${option}`}
                          type="button"
                          className={`rating-button ${
                            rating === option ? "is-selected" : ""
                          }`}
                          onClick={() => onRateEvidence(evidence.id, option)}
                          aria-pressed={rating === option}
                          aria-label={`${evidenceRatingMeta[option].label}${
                            !reviewerRating && suggestedRating === option
                              ? ", preselected suggestion"
                              : ""
                          }`}
                        >
                          {evidenceRatingMeta[option].shortLabel}
                        </button>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      {onContinue ? (
        <ArenaActionFooter
          className="evidence-board-actions"
          ariaLabel="Evidence Board actions"
          microcopy="Your classifications will be used to compare labels next."
          secondaryAction={
            onBackToAiReveal
              ? {
                  label: "Back to AI reveal",
                  onClick: onBackToAiReveal,
                }
              : undefined
          }
          primaryAction={{
            label: (
              <>
                <span className="action-label-desktop">
                  Continue with {caseFile.evidenceItems.length} classifications
                </span>
                <span className="action-label-mobile">Compare labels</span>
              </>
            ),
            onClick: onContinue,
            disabled: !allEvidenceClassified,
          }}
        />
      ) : null}
    </ArenaWorkflowShell>
  );
}

function EvidenceBalanceCounts({ balance }: { balance: EvidenceBalanceValue }) {
  const counts = [
    {
      key: "supporting",
      singularLabel: "support",
      pluralLabel: "supports",
      value: balance.supporting,
    },
    {
      key: "weak",
      singularLabel: "weak support",
      pluralLabel: "weak support",
      value: balance.weak,
    },
    {
      key: "contradictory",
      singularLabel: "contradiction",
      pluralLabel: "contradictions",
      value: balance.contradictory,
    },
    {
      key: "context",
      singularLabel: "needs context",
      pluralLabel: "need context",
      value: balance.contextGaps,
    },
    {
      key: "noise",
      singularLabel: "irrelevant / noise",
      pluralLabel: "irrelevant / noise",
      value: balance.noise,
    },
  ].filter((item) => item.value > 0);

  return (
    <span className="evidence-balance-counts">
      {counts
        .map(
          (item) =>
            `${item.value} ${
              item.value === 1 ? item.singularLabel : item.pluralLabel
            }`,
        )
        .join(" · ")}
    </span>
  );
}

function ChecklistGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="claim-checklist-group">
      <h4>{title}</h4>
      <ul>
        {items.map((item) => (
          <li key={`${title}-${item}`}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function getClaimChecklist(caseFile: CaseFile) {
  if (caseFile.id === "case-arena-001") {
    return {
      observed: ["IAM role creation", "Policy attachment"],
      missing: [
        "Downstream abuse",
        "Sensitive access",
        "Malicious intent",
      ],
      ambiguous: ["PassRole-like probe outside rollout window"],
    };
  }

  const observed = caseFile.claims
    .filter(
      (claim) =>
        claim.status === "supported" || claim.status === "weakly_supported",
    )
    .slice(0, 2)
    .map((claim) => claim.text);
  const missing = caseFile.claims
    .filter(
      (claim) =>
        claim.status === "unsupported" ||
        claim.status === "insufficient_evidence",
    )
    .slice(0, 3)
    .map((claim) => claim.rationale);
  const ambiguous = caseFile.evidenceRelations
    .filter((relation) => relation.polarity === "neutral")
    .slice(0, 2)
    .map((relation) => relation.explanation);

  return {
    observed: observed.length ? observed : ["Evidence packet reviewed"],
    missing: missing.length ? missing : ["No explicit missing evidence recorded"],
    ambiguous: ambiguous.length ? ambiguous : ["No ambiguous evidence recorded"],
  };
}

function getEvidenceReviewCopy(
  caseFile: CaseFile,
  evidence: EvidenceItem,
  relations: EvidenceRelation[],
  rating: EvidenceRating,
) {
  if (caseFile.id === "case-arena-001") {
    const copyById: Record<
      string,
      {
        summary: string;
        whyItMatters: string;
        claimMeaning: string;
        mobileSummary: string;
        signals: string[];
      }
    > = {
      "iam-e-01": {
        summary: "IAM role creation and policy attachment were observed.",
        whyItMatters:
          "This confirms the cluster contains IAM administration activity.",
        claimMeaning:
          "It supports IAM activity, but it does not prove malicious escalation, sensitive access, or downstream abuse.",
        mobileSummary:
          "IAM role and policy changes were observed, but there is no proof of malicious escalation or downstream abuse.",
        signals: ["CreateRole", "AttachRolePolicy", "PutRolePolicy", "TagRole"],
      },
      "iam-e-02": {
        summary:
          "Most sessions occur inside a daytime platform rollout window and include owner tags.",
        whyItMatters:
          "Planned timing and metadata point toward controlled provisioning rather than adversarial behavior.",
        claimMeaning:
          "This contradicts the stronger suspicious-escalation claim because the activity has routine rollout context.",
        mobileSummary:
          "Routine rollout timing and owner tags point away from a suspicious escalation claim.",
        signals: ["daytime window", "owner tags", "rollout metadata"],
      },
      "iam-e-03": {
        summary:
          "The evidence packet does not show newly created roles used for sensitive data access.",
        whyItMatters:
          "Escalation claims usually need follow-on misuse, persistence, or access to protected resources.",
        claimMeaning:
          "This contradicts a confident suspicious escalation label.",
        mobileSummary:
          "No sensitive access or downstream abuse is shown, which contradicts confident escalation.",
        signals: [
          "no downstream abuse",
          "no sensitive access",
          "no persistence signal",
        ],
      },
      "iam-e-04": {
        summary:
          "One low-overlap representative session includes a PassRole-like check outside the rollout window.",
        whyItMatters:
          "It may indicate a mixed cluster or a session that needs more context.",
        claimMeaning:
          "It is not enough to prove the AI claim across the cluster, but it should be reviewed before the final verdict.",
        mobileSummary:
          "One off-window PassRole-like check needs context before it can support the AI claim.",
        signals: ["PassRole-like check", "off-hours", "low feature overlap"],
      },
    };

    return (
      copyById[evidence.id] ??
      getFallbackEvidenceReviewCopy(evidence, relations, rating)
    );
  }

  return getFallbackEvidenceReviewCopy(evidence, relations, rating);
}

function getFallbackEvidenceReviewCopy(
  evidence: EvidenceItem,
  relations: EvidenceRelation[],
  rating: EvidenceRating,
) {
  const primaryRelation = relations[0];
  const relationExplanation =
    primaryRelation?.explanation ??
    "This evidence should be weighed against the AI claim before the label duel.";
  const claimMeaningByRating: Record<EvidenceRating, string> = {
    supports_label:
      "This supports the AI claim, but should still be checked against the full evidence packet.",
    weak_support:
      "This gives the AI claim limited support and should not be treated as conclusive on its own.",
    contradicts_label:
      "This weakens the AI claim and should be counted as contradictory if the context is reliable.",
    needs_context:
      "This needs more context before it can support or contradict the AI claim.",
    irrelevant_noise:
      "This appears weakly related or irrelevant to the AI claim under review.",
  };

  return {
    summary: evidence.summary,
    whyItMatters: relationExplanation,
    claimMeaning: claimMeaningByRating[rating],
    mobileSummary: `${evidence.summary} ${claimMeaningByRating[rating]}`,
    signals: [
      evidence.sourceType.replaceAll("_", " "),
      primaryRelation?.strength ? `${primaryRelation.strength} relation` : "evidence item",
      evidence.rawReference ? "sample reference" : "synthetic packet",
    ],
  };
}
