import { JudgmentReceipt } from "@/components/arena/JudgmentReceipt";
import { ReviewTerminologyHelp } from "@/components/arena/ReviewTerminologyHelp";
import {
  ArenaActionFooter,
  ArenaStatusBadge,
  ArenaWorkflowShell,
  SectionHeader,
} from "@/components/arena/WorkflowPrimitives";
import {
  duelReasonLabel,
  finalVerdictLabel,
  mergeRecommendationReasonLabel,
  splitRecommendationReasonLabel,
  verdictFailureReasonLabel,
} from "@/components/arena/arenaMeta";
import { getCompatibleFailureModes } from "@/lib/arenaReviewState";
import { getCaseFileMergeCandidates } from "@/lib/reviewRefinement";
import type { InsufficientContextGuidance } from "@/lib/reviewReadiness";
import type { CaseReviewState, EvidenceBalance } from "@/lib/arenaReviewState";
import {
  MERGE_RECOMMENDATION_REASONS,
  SPLIT_RECOMMENDATION_REASONS,
  type CaseFile,
  type DuelReason,
  type FinalVerdict,
  type MergeRecommendationReason,
  type SplitRecommendationReason,
} from "@/lib/types";

const verdictGroups: {
  title: string;
  options: FinalVerdict[];
}[] = [
  {
    title: "Claim support",
    options: [
      "supported",
      "partially_supported",
      "unsupported_overclaimed",
      "uncertain",
    ],
  },
  {
    title: "Cluster quality",
    options: ["cluster_impure", "needs_split", "needs_merge"],
  },
  {
    title: "Evidence quality",
    options: ["needs_better_evidence"],
  },
];

type VerdictPanelProps = {
  caseFile: CaseFile;
  reviewState: CaseReviewState;
  balance: EvidenceBalance;
  insufficientContextGuidance?: InsufficientContextGuidance;
  onSelectVerdict: (verdict: FinalVerdict) => void;
  onToggleFailureMode: (reason: DuelReason) => void;
  onSelectSplitRecommendationReason?: (reason: SplitRecommendationReason) => void;
  onClearSplitRecommendation?: () => void;
  onToggleSplitRecommendationSession?: (sessionId: string) => void;
  onToggleSplitRecommendationEvidence?: (evidenceId: string) => void;
  onSelectMergeRecommendationTarget?: (neighborClusterId: string) => void;
  onSelectMergeRecommendationReason?: (reason: MergeRecommendationReason) => void;
  onClearMergeRecommendation?: () => void;
  onBackToImpostor?: () => void;
  onOpenReviewDrawer: () => void;
  onCopyJson: () => void;
  onDownloadJson: () => void;
};

export function VerdictPanel({
  caseFile,
  reviewState,
  balance,
  insufficientContextGuidance,
  onSelectVerdict,
  onToggleFailureMode,
  onSelectSplitRecommendationReason = () => undefined,
  onClearSplitRecommendation,
  onToggleSplitRecommendationSession = () => undefined,
  onToggleSplitRecommendationEvidence = () => undefined,
  onSelectMergeRecommendationTarget = () => undefined,
  onSelectMergeRecommendationReason = () => undefined,
  onClearMergeRecommendation = () => undefined,
  onBackToImpostor,
  onOpenReviewDrawer,
  onCopyJson,
  onDownloadJson,
}: VerdictPanelProps) {
  const blindChoice = caseFile.blindInterpretationOptions.find(
    (option) => option.id === reviewState.blindChoiceId,
  );
  const duelWinner = caseFile.candidateLabels.find(
    (candidate) => candidate.id === reviewState.labelDuelWinnerId,
  );
  const impostor = caseFile.representativeSessions.find(
    (session) => session.id === reviewState.impostorSessionId,
  );
  const finalVerdict = reviewState.finalVerdict;
  const hasFinalVerdict = Boolean(finalVerdict);
  const selectedVerdictLabel = finalVerdict
    ? finalVerdictLabel[finalVerdict]
    : undefined;
  const selectedFailureModes = getCompatibleFailureModes(reviewState);
  const mergeCandidates = getCaseFileMergeCandidates(caseFile);
  const heroTitle = selectedVerdictLabel ?? "Make the final call";
  const heroEyebrow = hasFinalVerdict
    ? "Final Evaluation · Review complete"
    : "Final Evaluation · Awaiting evaluation";
  const heroLead = getVerdictLead(finalVerdict);
  const heroExplanation = getVerdictExplanation({
    verdict: finalVerdict,
    caseFile,
    blindChoiceLabel: blindChoice?.label,
  });

  return (
    <ArenaWorkflowShell className="verdict-stage" ariaLabel="Final Evaluation">
      <section className="verdict-hero" aria-labelledby="verdict-hero-title">
        <div className="verdict-hero-copy">
          <div className="arena-step-hero-meta">
            <p className="eyebrow">{heroEyebrow}</p>
            <ArenaStatusBadge tone={hasFinalVerdict ? "supported" : "neutral"}>
              {hasFinalVerdict ? "Ready to export" : "Evaluation pending"}
            </ArenaStatusBadge>
          </div>
          <h2 id="verdict-hero-title">{heroTitle}</h2>
          <p className="verdict-decision-prompt">
            Choose the outcome that best fits the evidence and cluster.
          </p>
          <p>{heroLead}</p>
          {hasFinalVerdict ? <p>{heroExplanation}</p> : null}
        </div>

        <aside className="verdict-balance-card" aria-label="Evidence balance">
          <div className="verdict-balance-card-header">
            <span>Evidence balance</span>
            <strong>{hasFinalVerdict ? "Ready to export" : "Evaluation pending"}</strong>
          </div>
          <dl className="verdict-balance-list">
            <BalanceLine label="Strong support" value={balance.supporting} />
            <BalanceLine label="Weak support" value={balance.weak} />
            <BalanceLine label="Contradict" value={balance.contradictory} />
            <BalanceLine label="Needs context" value={balance.contextGaps} />
          </dl>
          <p>Conclusion: {getEvidenceBalanceConclusion(balance)}</p>
        </aside>
      </section>
      <ReviewTerminologyHelp terms={["verdict", "split", "merge"]} />

      <div className="verdict-layout">
        <article className="verdict-choice-panel">
          <SectionHeader
            title="Final evaluation"
            description="Choose the outcome that best fits the evidence."
          />
          {insufficientContextGuidance ? (
            <aside className="insufficient-context-guidance">
              <strong>Context-limited review</strong>
              <p>
                Prefer Uncertain or Needs better evidence when context is
                missing. Collect more evidence is the exported action for these
                outcomes.
              </p>
            </aside>
          ) : null}
          <details
            className="final-evaluation-checklist"
            aria-labelledby="final-evaluation-checklist-title"
          >
            <summary id="final-evaluation-checklist-title">Decision checks</summary>
            <ul>
              <li>Is the AI label supported by the evidence?</li>
              <li>Is the label too broad, too specific, or overclaimed?</li>
              <li>Is uncertainty high enough to avoid a strong conclusion?</li>
              <li>Does the cluster appear mixed or impure?</li>
              <li>Is the recommended action aligned with the evidence?</li>
            </ul>
          </details>
          <div className="verdict-sections">
            {verdictGroups.map((group) => (
              <section key={group.title} className="verdict-option-section">
                <h4>{group.title}</h4>
                <div className="verdict-grid">
                  {group.options.map((verdict) => {
                    const isSelected = finalVerdict === verdict;
                    const isContextGuided =
                      Boolean(insufficientContextGuidance) &&
                      (verdict === "uncertain" ||
                        verdict === "needs_better_evidence");

                    return (
                      <button
                        key={verdict}
                        type="button"
                        className={[
                          "verdict-button",
                          isSelected ? "is-selected" : "",
                          isContextGuided ? "is-guided-option" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() => onSelectVerdict(verdict)}
                        aria-pressed={isSelected}
                      >
                        <span className="verdict-button-label">
                          {finalVerdictLabel[verdict]}
                        </span>
                        {isContextGuided ? (
                          <small>Context path</small>
                        ) : null}
                        <span
                          className="verdict-button-indicator"
                          aria-hidden="true"
                        />
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          <div className="reason-panel">
            <SectionHeader
              title="Why this evaluation?"
              description={
                finalVerdict === "supported"
                  ? "A supported evaluation does not use failure-mode reasons."
                  : "Select the clearest reasons the claim or cluster did not fully hold up."
              }
            />
            <div className="chip-row">
              {caseFile.failureModes.map((reason) => {
                const isSelected = selectedFailureModes.includes(reason);

                return (
                  <button
                    key={`failure-${reason}`}
                    type="button"
                    className={`chip-button ${isSelected ? "is-selected" : ""}`}
                    onClick={() => onToggleFailureMode(reason)}
                    aria-pressed={isSelected}
                  >
                    {verdictFailureReasonLabel[reason] ?? duelReasonLabel[reason]}
                  </button>
                );
              })}
            </div>
            <p className="reason-panel-note">
              {selectedFailureModes.length > 0
              ? `Selected: ${selectedFailureModes
                    .map(
                      (reason) =>
                        verdictFailureReasonLabel[reason] ?? duelReasonLabel[reason],
                    )
                    .join(", ")}.`
                : hasFinalVerdict
                  ? "No failure reason selected."
                  : "Choose an evaluation outcome first, then add reasons if they clarify the decision."}
            </p>
          </div>

          <ClusterRefinementControls
            caseFile={caseFile}
            reviewState={reviewState}
            mergeCandidates={mergeCandidates}
            onSelectSplitRecommendationReason={onSelectSplitRecommendationReason}
            onClearSplitRecommendation={onClearSplitRecommendation}
            onToggleSplitRecommendationSession={onToggleSplitRecommendationSession}
            onToggleSplitRecommendationEvidence={onToggleSplitRecommendationEvidence}
            onSelectMergeRecommendationTarget={onSelectMergeRecommendationTarget}
            onSelectMergeRecommendationReason={onSelectMergeRecommendationReason}
            onClearMergeRecommendation={onClearMergeRecommendation}
          />
        </article>

        <JudgmentReceipt
          caseFile={caseFile}
          reviewState={reviewState}
          blindChoice={blindChoice}
          duelWinner={duelWinner}
          impostor={impostor}
          balance={balance}
          onOpenReviewDrawer={onOpenReviewDrawer}
          onCopyJson={onCopyJson}
          onDownloadJson={onDownloadJson}
          showJsonAction={false}
        />
      </div>

      <ArenaActionFooter
        className="verdict-actions"
        ariaLabel="Final Evaluation actions"
        microcopy={
          hasFinalVerdict
            ? "Review complete. Export the structured result or go back to adjust earlier choices."
            : "Choose a verdict to finish the review before exporting."
        }
        secondaryAction={
          onBackToImpostor
            ? {
                label: "Return to cluster fit check",
                onClick: onBackToImpostor,
              }
            : undefined
        }
        auxiliaryActions={[
          {
            label: "View JSON",
            disabled: !hasFinalVerdict,
            onClick: onOpenReviewDrawer,
          },
        ]}
        primaryAction={{
          label: "Export review result",
          disabled: !hasFinalVerdict,
          onClick: onDownloadJson,
        }}
      />
    </ArenaWorkflowShell>
  );
}

function ClusterRefinementControls({
  caseFile,
  reviewState,
  mergeCandidates,
  onSelectSplitRecommendationReason,
  onClearSplitRecommendation,
  onToggleSplitRecommendationSession,
  onToggleSplitRecommendationEvidence,
  onSelectMergeRecommendationTarget,
  onSelectMergeRecommendationReason,
  onClearMergeRecommendation,
}: {
  caseFile: CaseFile;
  reviewState: CaseReviewState;
  mergeCandidates: ReturnType<typeof getCaseFileMergeCandidates>;
  onSelectSplitRecommendationReason: (reason: SplitRecommendationReason) => void;
  onClearSplitRecommendation?: () => void;
  onToggleSplitRecommendationSession: (sessionId: string) => void;
  onToggleSplitRecommendationEvidence: (evidenceId: string) => void;
  onSelectMergeRecommendationTarget: (neighborClusterId: string) => void;
  onSelectMergeRecommendationReason: (reason: MergeRecommendationReason) => void;
  onClearMergeRecommendation: () => void;
}) {
  const splitRecommendation =
    reviewState.clusterRefinement?.splitRecommendation;
  const mergeRecommendation =
    reviewState.clusterRefinement?.mergeRecommendation;
  const affectedSessionIds = splitRecommendation?.affectedSessionIds ?? [];
  const splitEvidenceIds = splitRecommendation?.evidenceIds ?? [];

  return (
    <details
      className="reason-panel refinement-panel"
      open={
        reviewState.finalVerdict === "cluster_impure" ||
        reviewState.finalVerdict === "needs_split" ||
        reviewState.finalVerdict === "needs_merge"
      }
    >
      <summary>Optional split / merge guidance</summary>
      <p className="reason-panel-note">
        Record structured guidance only when the cluster needs refinement.
      </p>

      <section className="verdict-option-section">
        <h4>Split recommendation</h4>
        <div className="chip-row" aria-label="Split recommendation reasons">
          {SPLIT_RECOMMENDATION_REASONS.map((reason) => {
            const isSelected = splitRecommendation?.reason === reason;

            return (
              <button
                key={reason}
                type="button"
                className={`chip-button ${isSelected ? "is-selected" : ""}`}
                onClick={() => onSelectSplitRecommendationReason(reason)}
                aria-pressed={isSelected}
              >
                {splitRecommendationReasonLabel[reason]}
              </button>
            );
          })}
          {splitRecommendation && onClearSplitRecommendation ? (
            <button
              type="button"
              className="chip-button"
              onClick={onClearSplitRecommendation}
            >
              Clear split
            </button>
          ) : null}
        </div>

        <div className="chip-row" aria-label="Affected split sessions">
          {caseFile.representativeSessions.slice(0, 5).map((session) => {
            const isSelected = affectedSessionIds.includes(session.id);

            return (
              <button
                key={`split-session-${session.id}`}
                type="button"
                className={`chip-button ${isSelected ? "is-selected" : ""}`}
                onClick={() => onToggleSplitRecommendationSession(session.id)}
                aria-pressed={isSelected}
              >
                {session.id}
              </button>
            );
          })}
        </div>

        <div className="chip-row" aria-label="Affected split evidence">
          {caseFile.evidenceItems.slice(0, 5).map((evidence) => {
            const isSelected = splitEvidenceIds.includes(evidence.id);

            return (
              <button
                key={`split-evidence-${evidence.id}`}
                type="button"
                className={`chip-button ${isSelected ? "is-selected" : ""}`}
                onClick={() => onToggleSplitRecommendationEvidence(evidence.id)}
                aria-pressed={isSelected}
              >
                {evidence.id}
              </button>
            );
          })}
        </div>
      </section>

      <section className="verdict-option-section">
        <h4>Merge target</h4>
        {mergeCandidates.length > 0 ? (
          <>
            <div className="verdict-grid" aria-label="Merge target candidates">
              {mergeCandidates.map((candidate) => {
                const isSelected =
                  mergeRecommendation?.targetNeighborClusterId === candidate.clusterId;

                return (
                  <button
                    key={candidate.clusterId}
                    type="button"
                    className={`verdict-button ${isSelected ? "is-selected" : ""}`}
                    onClick={() =>
                      onSelectMergeRecommendationTarget(candidate.clusterId)
                    }
                    aria-pressed={isSelected}
                  >
                    <span className="verdict-button-label">{candidate.label}</span>
                    <small>{candidate.clusterId}</small>
                    <span
                      className="verdict-button-indicator"
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
            <div className="chip-row" aria-label="Merge recommendation reasons">
              {MERGE_RECOMMENDATION_REASONS.map((reason) => {
                const isSelected = mergeRecommendation?.reason === reason;

                return (
                  <button
                    key={reason}
                    type="button"
                    className={`chip-button ${isSelected ? "is-selected" : ""}`}
                    onClick={() => onSelectMergeRecommendationReason(reason)}
                    aria-pressed={isSelected}
                    disabled={!mergeRecommendation}
                  >
                    {mergeRecommendationReasonLabel[reason]}
                  </button>
                );
              })}
              {mergeRecommendation ? (
                <button
                  type="button"
                  className="chip-button"
                  onClick={onClearMergeRecommendation}
                >
                  Clear merge
                </button>
              ) : null}
            </div>
          </>
        ) : (
          <p className="reason-panel-note">
            No compatible merge candidates supplied by this CasePackage/UI state.
          </p>
        )}
      </section>
    </details>
  );
}

function BalanceLine({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function sentenceCase(label: string) {
  const firstWord = label.split(/\s+/, 1)[0] ?? "";

  if (/^[A-Z0-9]{2,}$/.test(firstWord)) {
    return label;
  }

  return label.charAt(0).toLowerCase() + label.slice(1);
}

function getVerdictLead(verdict?: FinalVerdict) {
  switch (verdict) {
    case "supported":
      return "The AI claim is supported by the reviewed evidence.";
    case "partially_supported":
      return "The AI claim is directionally right, but stronger than the evidence supports.";
    case "unsupported_overclaimed":
      return "The AI claim overstates what the evidence supports.";
    case "uncertain":
      return "The evidence does not support a confident decision either way.";
    case "cluster_impure":
      return "The label may describe part of the cluster, but not the full region.";
    case "needs_split":
      return "The cluster needs separation before a single label can be trusted.";
    case "needs_merge":
      return "The region needs neighbouring context before a final label is defensible.";
    case "needs_better_evidence":
      return "The current evidence packet is too thin for a defensible label.";
    default:
      return "Choose a verdict to finish the review.";
  }
}

function getVerdictExplanation({
  verdict,
  caseFile,
  blindChoiceLabel,
}: {
  verdict?: FinalVerdict;
  caseFile: CaseFile;
  blindChoiceLabel?: string;
}) {
  const aiClaim = sentenceCase(caseFile.topicLabel.name);
  const reviewedInterpretation = sentenceCase(
    blindChoiceLabel ?? "a weaker interpretation",
  );

  switch (verdict) {
    case "supported":
      return "The structured result can be exported with the supporting evidence packet attached.";
    case "partially_supported":
      return "Keep the evidence-grounded part of the claim and make the unsupported certainty explicit.";
    case "unsupported_overclaimed":
      return `The reviewed evidence points to ${reviewedInterpretation}, but does not establish ${aiClaim}.`;
    case "uncertain":
      return "Preserve the uncertainty instead of converting an incomplete evidence packet into certainty.";
    case "cluster_impure":
      return "Review the mixed sessions before accepting one label for the whole cluster.";
    case "needs_split":
      return "Separate the behaviours and review each resulting cluster on its own evidence.";
    case "needs_merge":
      return "Compare the nearby behavioural region before exporting a stable label decision.";
    case "needs_better_evidence":
      return "Request stronger evidence before treating the AI claim as accepted review data.";
    default:
      return "Decide whether the AI's label is supported by the evidence. Your verdict becomes structured review data.";
  }
}

function getEvidenceBalanceConclusion(balance: EvidenceBalance) {
  if (balance.total === 0) {
    return "Classify evidence before relying on this verdict.";
  }

  if (balance.supporting > balance.contradictory && balance.supporting > 0) {
    return "Evidence supports the claim.";
  }

  if (balance.contradictory > balance.supporting) {
    return "Claim is not sufficiently supported.";
  }

  if (balance.supporting === 0 && balance.weak > 0) {
    return "Evidence is weak or incomplete.";
  }

  if (balance.supporting === 0 && balance.contextGaps > 0) {
    return "More context is needed before accepting the claim.";
  }

  return "Choose a verdict to complete the review.";
}
