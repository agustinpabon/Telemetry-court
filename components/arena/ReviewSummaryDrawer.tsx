import { JudgmentReceipt } from "@/components/arena/JudgmentReceipt";
import type { CaseReviewState, EvidenceBalance } from "@/lib/arenaReviewState";
import type {
  BlindInterpretationOption,
  CandidateLabel,
  CaseFile,
  RepresentativeSession,
} from "@/lib/types";

type ReviewSummaryDrawerProps = {
  open: boolean;
  caseFile: CaseFile;
  reviewState: CaseReviewState;
  blindChoice?: BlindInterpretationOption;
  duelWinner?: CandidateLabel;
  impostor?: RepresentativeSession;
  balance: EvidenceBalance;
  exportJson: string;
  exportMessage?: string;
  onClose: () => void;
  onCopyJson: () => void;
  onDownloadJson: () => void;
};

export function ReviewSummaryDrawer({
  open,
  caseFile,
  reviewState,
  blindChoice,
  duelWinner,
  impostor,
  balance,
  exportJson,
  exportMessage,
  onClose,
  onCopyJson,
  onDownloadJson,
}: ReviewSummaryDrawerProps) {
  return (
    <div className={`review-drawer-layer ${open ? "is-open" : ""}`} aria-hidden={!open}>
      <button
        type="button"
        className="review-drawer-scrim"
        tabIndex={open ? 0 : -1}
        aria-label="Close review summary"
        onClick={onClose}
      />
      <aside
        className="review-drawer"
        role="dialog"
        aria-label="Review Summary"
        aria-modal={open}
      >
        <div className="review-drawer-header">
          <div>
            <p className="eyebrow">Review Summary</p>
            <h2>Structured review JSON</h2>
          </div>
          <button type="button" className="drawer-close" onClick={onClose}>
            Close
          </button>
        </div>

        <JudgmentReceipt
          caseFile={caseFile}
          reviewState={reviewState}
          blindChoice={blindChoice}
          duelWinner={duelWinner}
          impostor={impostor}
          balance={balance}
          onOpenReviewDrawer={() => undefined}
          onCopyJson={onCopyJson}
          onDownloadJson={onDownloadJson}
          showJsonAction={false}
        />

        {exportMessage ? (
          <p aria-live="polite" className="export-message">
            {exportMessage}
          </p>
        ) : null}

        <pre className="json-preview">{exportJson}</pre>
      </aside>
    </div>
  );
}
