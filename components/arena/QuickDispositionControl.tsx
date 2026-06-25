import type {
  QuickDispositionReasonCodeV01,
  QuickDispositionSourceStageV01,
  QuickDispositionValueV01,
} from "@/lib/quickDispositionV01";

export type QuickDispositionControlEvent = {
  sourceStage: QuickDispositionSourceStageV01;
  disposition: QuickDispositionValueV01;
  reasonCodes: QuickDispositionReasonCodeV01[];
};

type QuickDispositionControlProps = {
  sourceStage: QuickDispositionSourceStageV01;
  statusMessage?: string;
  onRecordDisposition: (event: QuickDispositionControlEvent) => void;
  onContinueFullReview: () => void;
};

type QuickDispositionOption = {
  label: string;
  disposition: QuickDispositionValueV01;
  reasonCodes: QuickDispositionReasonCodeV01[];
  continuesFullReview?: boolean;
};

const quickDispositionOptions: QuickDispositionOption[] = [
  {
    label: "Not interesting / skip",
    disposition: "dismiss_not_interesting",
    reasonCodes: ["low_validation_value"],
  },
  {
    label: "Save for later",
    disposition: "save_for_later",
    reasonCodes: ["needs_later_review"],
  },
  {
    label: "Continue full review",
    disposition: "escalate_to_full_review",
    reasonCodes: ["full_review_requested"],
    continuesFullReview: true,
  },
  {
    label: "Cannot judge from this package",
    disposition: "cannot_judge_from_package",
    reasonCodes: ["insufficient_package_context"],
  },
];

export function QuickDispositionControl({
  sourceStage,
  statusMessage,
  onRecordDisposition,
  onContinueFullReview,
}: QuickDispositionControlProps) {
  function recordOption(option: QuickDispositionOption) {
    if (option.continuesFullReview) {
      onContinueFullReview();
      return;
    }

    onRecordDisposition({
      sourceStage,
      disposition: option.disposition,
      reasonCodes: option.reasonCodes,
    });
  }

  return (
    <article className="quick-disposition-card">
      <div className="quick-disposition-copy">
        <span>Quick disposition</span>
        <strong>Record an early outcome</strong>
        <p>
          Save a structured quick disposition without creating a completed
          ReviewResult.
        </p>
      </div>
      <div className="quick-disposition-actions">
        {quickDispositionOptions.map((option) => (
          <button
            key={option.disposition}
            type="button"
            data-disposition={option.disposition}
            onClick={() => recordOption(option)}
          >
            {option.label}
          </button>
        ))}
      </div>
      {statusMessage ? (
        <p className="quick-disposition-status" role="status">
          {statusMessage}
        </p>
      ) : null}
    </article>
  );
}
