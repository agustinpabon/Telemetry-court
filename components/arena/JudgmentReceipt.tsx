import {
  finalVerdictLabel,
  formatVerdictReasonList,
  mergeRecommendationReasonLabel,
  splitRecommendationReasonLabel,
} from "@/components/arena/arenaMeta";
import { ReviewTerminologyHelp } from "@/components/arena/ReviewTerminologyHelp";
import { ReviewResultProgression } from "@/components/evaluation/ReviewResultProgression";
import { getCompatibleFailureModes } from "@/lib/arenaReviewState";
import type { CaseReviewState, EvidenceBalance } from "@/lib/arenaReviewState";
import type {
  BlindInterpretationOption,
  CandidateLabel,
  CaseFile,
  RepresentativeSession,
} from "@/lib/types";

type JudgmentReceiptProps = {
  caseFile: CaseFile;
  reviewState: CaseReviewState;
  blindChoice?: BlindInterpretationOption;
  duelWinner?: CandidateLabel;
  impostor?: RepresentativeSession;
  balance: EvidenceBalance;
  onOpenReviewDrawer: () => void;
  onCopyJson: () => void;
  onDownloadJson: () => void;
  showJsonAction?: boolean;
};

export function JudgmentReceipt({
  caseFile,
  reviewState,
  blindChoice,
  duelWinner,
  impostor,
  balance,
  onOpenReviewDrawer,
  onCopyJson,
  onDownloadJson,
  showJsonAction = true,
}: JudgmentReceiptProps) {
  const verdictLabel = reviewState.finalVerdict
    ? finalVerdictLabel[reviewState.finalVerdict]
    : undefined;
  const failureModeSummary = formatVerdictReasonList(
    getCompatibleFailureModes(reviewState),
  );
  const evidenceBalanceSummary = `${balance.supporting} support · ${balance.weak} weak · ${balance.contradictory} contradict · ${balance.contextGaps} context`;
  const recommendedAction = getRecommendedAction(reviewState.finalVerdict, balance);
  const refinementSummary = getRefinementSummary(reviewState);

  return (
    <article className={`judgment-receipt ${verdictLabel ? "is-visible" : ""}`}>
      <div className="receipt-header">
        <div>
          <p className="eyebrow">Review result</p>
          <h3>Final evaluation</h3>
        </div>
        <span className="mono-value">{caseFile.id}</span>
      </div>

      <dl className="receipt-grid">
        <ReceiptLine
          label="Initial assessment"
          value={blindChoice?.label}
          fallback="No initial assessment recorded."
        />
        <ReceiptLine label="AI claim" value={caseFile.topicLabel.name} />
        <ReceiptLine
          label="Selected label"
          value={duelWinner?.label}
          fallback="No selected label recorded."
        />
        <ReceiptLine
          label="Weakest-fit session"
          value={impostor?.title}
          fallback="No weakest-fit session selected."
        />
        <ReceiptLine label="Evidence balance" value={evidenceBalanceSummary} />
        <ReceiptLine
          label="Reasons selected"
          value={failureModeSummary}
          fallback={
            reviewState.finalVerdict
              ? "No failure reason selected."
              : "Select reasons after choosing an evaluation outcome."
          }
        />
        <ReceiptLine
          label="Evaluation outcome"
          value={verdictLabel}
          fallback="Evaluation not selected."
          emphasis
        />
        <ReceiptLine
          label="Recommended action"
          value={recommendedAction}
          emphasis
        />
        <ReceiptLine
          label="Split / merge guidance"
          value={refinementSummary}
          fallback="No split or merge recommendation recorded."
        />
      </dl>

      <ReviewTerminologyHelp
        terms={["review_result", "case_package"]}
        summary="Export terms"
      />

      <ReviewResultProgression variant="receipt" />

      <div className="receipt-actions">
        {showJsonAction ? (
          <button type="button" onClick={onOpenReviewDrawer}>
            View JSON
          </button>
        ) : null}
        <button type="button" onClick={onCopyJson}>
          Copy JSON
        </button>
        <button type="button" onClick={onDownloadJson}>
          Download JSON
        </button>
      </div>
    </article>
  );
}

function getRefinementSummary(reviewState: CaseReviewState): string | undefined {
  const splitRecommendation =
    reviewState.clusterRefinement?.splitRecommendation;
  const mergeRecommendation =
    reviewState.clusterRefinement?.mergeRecommendation;
  const summaries: string[] = [];

  if (splitRecommendation) {
    summaries.push(
      `Split: ${splitRecommendationReasonLabel[splitRecommendation.reason]}`,
    );
  }

  if (mergeRecommendation) {
    summaries.push(
      `Merge with ${mergeRecommendation.targetNeighborClusterId}: ${mergeRecommendationReasonLabel[mergeRecommendation.reason]}`,
    );
  }

  return summaries.length > 0 ? summaries.join(" · ") : undefined;
}

function ReceiptLine({
  label,
  value,
  fallback = "Not recorded.",
  emphasis = false,
}: {
  label: string;
  value?: string;
  fallback?: string;
  emphasis?: boolean;
}) {
  return (
    <div className={emphasis ? "is-emphasis" : undefined}>
      <dt>{label}</dt>
      <dd>{value ?? fallback}</dd>
    </div>
  );
}

function getRecommendedAction(
  finalVerdict: CaseReviewState["finalVerdict"],
  balance: EvidenceBalance,
) {
  switch (finalVerdict) {
    case "supported":
      return balance.supporting > balance.contradictory && balance.supporting > 0
        ? "Accept the label and keep the evidence packet attached for audit."
        : "Review evidence conflicts before accepting this label.";
    case "partially_supported":
      return "Keep the label only with caveats, or revise it to a weaker evidence-supported interpretation.";
    case "unsupported_overclaimed":
      return "Rename the label or request stronger evidence before accepting the AI claim.";
    case "uncertain":
      return "Collect more context before accepting or rejecting the AI claim.";
    case "cluster_impure":
      return "Inspect outliers and consider splitting the cluster.";
    case "needs_split":
      return "Split the cluster before accepting a label.";
    case "needs_merge":
      return "Compare neighbouring clusters before finalizing the label.";
    case "needs_better_evidence":
      return "Add stronger representative evidence before judging the label.";
    default:
      return "Choose a verdict to produce a recommended review action.";
  }
}
