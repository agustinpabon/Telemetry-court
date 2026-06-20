import { JudgmentReceipt } from "@/components/arena/JudgmentReceipt";
import {
  ArenaActionFooter,
  ArenaStatusBadge,
  ArenaStepProgress,
  ArenaWorkflowShell,
  SectionHeader,
} from "@/components/arena/WorkflowPrimitives";
import {
  duelReasonLabel,
  finalVerdictLabel,
  verdictFailureReasonLabel,
} from "@/components/arena/arenaMeta";
import { getCompatibleFailureModes } from "@/lib/arenaReviewState";
import type {
  ArenaStage,
  CaseReviewState,
  EvidenceBalance,
} from "@/lib/arenaReviewState";
import type { CaseFile, DuelReason, FinalVerdict } from "@/lib/types";

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
  onSelectVerdict: (verdict: FinalVerdict) => void;
  onToggleFailureMode: (reason: DuelReason) => void;
  onBackToImpostor?: () => void;
  onOpenReviewDrawer: () => void;
  onCopyJson: () => void;
  onDownloadJson: () => void;
  onSelectStage?: (stage: ArenaStage) => void;
};

export function VerdictPanel({
  caseFile,
  reviewState,
  balance,
  onSelectVerdict,
  onToggleFailureMode,
  onBackToImpostor,
  onOpenReviewDrawer,
  onCopyJson,
  onDownloadJson,
  onSelectStage,
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
  const heroTitle = selectedVerdictLabel ?? "Make the final call";
  const heroEyebrow = hasFinalVerdict
    ? "Structured Verdict · Review complete"
    : "Structured Verdict · Awaiting verdict";
  const heroLead = getVerdictLead(finalVerdict);
  const heroExplanation = getVerdictExplanation({
    verdict: finalVerdict,
    caseFile,
    blindChoiceLabel: blindChoice?.label,
  });

  return (
    <ArenaWorkflowShell className="verdict-stage" ariaLabel="Structured Verdict">
      <ArenaStepProgress currentStage="verdict" onSelectStage={onSelectStage} />

      <section className="verdict-hero" aria-labelledby="verdict-hero-title">
        <div className="verdict-hero-copy">
          <div className="arena-step-hero-meta">
            <p className="eyebrow">{heroEyebrow}</p>
            <ArenaStatusBadge tone={hasFinalVerdict ? "supported" : "neutral"}>
              {hasFinalVerdict ? "Ready to export" : "Verdict pending"}
            </ArenaStatusBadge>
          </div>
          <h2 id="verdict-hero-title">{heroTitle}</h2>
          <p>{heroLead}</p>
          <p>{heroExplanation}</p>
          <p className="verdict-hero-balance">
            Evidence balance: {formatHeroBalance(balance)}
          </p>
          <p className="verdict-hero-status">
            Status:{" "}
            {hasFinalVerdict
              ? "Review complete · Ready to export"
              : "Choose a verdict to finish the review."}
          </p>
        </div>

        <aside className="verdict-balance-card" aria-label="Evidence balance">
          <div className="verdict-balance-card-header">
            <span>Evidence balance</span>
            <strong>{hasFinalVerdict ? "Ready to export" : "Verdict pending"}</strong>
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

      <div className="verdict-layout">
        <article className="verdict-choice-panel">
          <SectionHeader
            title="Final verdict"
            description="Choose the structured outcome that best matches the evidence and cluster quality."
          />
          <div className="verdict-sections">
            {verdictGroups.map((group) => (
              <section key={group.title} className="verdict-option-section">
                <h4>{group.title}</h4>
                <div className="verdict-grid">
                  {group.options.map((verdict) => {
                    const isSelected = finalVerdict === verdict;

                    return (
                      <button
                        key={verdict}
                        type="button"
                        className={`verdict-button ${isSelected ? "is-selected" : ""}`}
                        onClick={() => onSelectVerdict(verdict)}
                        aria-pressed={isSelected}
                      >
                        <span className="verdict-button-label">
                          {finalVerdictLabel[verdict]}
                        </span>
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
              title="Why this verdict?"
              description={
                finalVerdict === "supported"
                  ? "A supported verdict does not use failure-mode reasons."
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
                  : "Choose a verdict first, then add reasons if they clarify the decision."}
            </p>
          </div>
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
        ariaLabel="Verdict actions"
        microcopy={
          hasFinalVerdict
            ? "Review complete. Export the structured result or go back to adjust earlier choices."
            : "Choose a verdict to finish the review before exporting."
        }
        secondaryAction={
          onBackToImpostor
            ? {
                label: "Back",
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

function BalanceLine({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function formatHeroBalance(balance: EvidenceBalance) {
  return `${balance.supporting} support · ${balance.weak} weak · ${balance.contradictory} contradict · ${balance.contextGaps} context`;
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
