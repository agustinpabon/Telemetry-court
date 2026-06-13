import {
  finalVerdictLabel,
  formatReasonList,
} from "@/components/arena/arenaMeta";
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

  return (
    <article className={`judgment-receipt ${verdictLabel ? "is-visible" : ""}`}>
      <div className="receipt-header">
        <div>
          <p className="eyebrow">Judgment Receipt</p>
          <h3>{verdictLabel ?? "Verdict pending"}</h3>
        </div>
        <span className="mono-value">{caseFile.id}</span>
      </div>

      <dl className="receipt-grid">
        <ReceiptLine label="Blind choice" value={blindChoice?.label} />
        <ReceiptLine label="AI claim" value={caseFile.topicLabel.name} />
        <ReceiptLine label="Label duel winner" value={duelWinner?.label} />
        <ReceiptLine label="Impostor choice" value={impostor?.title} />
        <ReceiptLine
          label="Failure modes"
          value={formatReasonList(reviewState.failureModes)}
        />
        <ReceiptLine label="Final verdict" value={verdictLabel} />
      </dl>

      <div className="receipt-balance">
        <span>
          <strong>{balance.supporting}</strong> support
        </span>
        <span>
          <strong>{balance.weak}</strong> weak
        </span>
        <span>
          <strong>{balance.contradictory}</strong> contradict
        </span>
        <span>
          <strong>{balance.contextGaps}</strong> context
        </span>
      </div>

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

function ReceiptLine({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value ?? "Awaiting review choice."}</dd>
    </div>
  );
}
