"use client";

import { useId } from "react";

import type {
  LocalReviewerMetadataV01,
  ReviewerContextV01,
} from "@/lib/reviewerIdentityV01";

type LocalReviewExportMetadataControlProps = {
  value: LocalReviewerMetadataV01;
  statusMessage?: string;
  defaultOpen?: boolean;
  onChange: (value: LocalReviewerMetadataV01) => void;
  onReset: () => void;
};

type ReviewContextOption = {
  value: ReviewerContextV01;
  label: string;
};

const reviewContextOptions: ReviewContextOption[] = [
  { value: "synthetic_demo", label: "Demo / local test" },
  { value: "local_review", label: "Local review" },
  { value: "pilot_reviewer", label: "Pilot reviewer" },
  { value: "expert_walkthrough", label: "Expert walkthrough" },
];

export function LocalReviewExportMetadataControl({
  value,
  statusMessage,
  defaultOpen = false,
  onChange,
  onReset,
}: LocalReviewExportMetadataControlProps) {
  const panelId = useId();
  const titleId = useId();
  const noteId = useId();
  const statusId = useId();
  const contextLabel = getReviewContextLabel(value.context);
  const describedBy = statusMessage ? `${noteId} ${statusId}` : noteId;

  return (
    <details
      className="local-reviewer-metadata-control tc-masthead__secondary-menu"
      open={defaultOpen ? true : undefined}
    >
      <summary
        aria-controls={panelId}
        aria-label={`Edit export metadata: ${value.reviewerId}, ${contextLabel}`}
      >
        <span className="local-reviewer-metadata-summary">
          <span className="local-reviewer-metadata-summary-label">
            Export metadata:
          </span>
          <span className="local-reviewer-metadata-summary-values">
            {value.reviewerId}
            <span aria-hidden="true"> · </span>
            {contextLabel}
          </span>
          <span className="local-reviewer-metadata-summary-edit">Edit</span>
        </span>
      </summary>
      <section
        id={panelId}
        className="local-reviewer-metadata-panel"
        aria-labelledby={titleId}
      >
        <div className="tc-masthead__action-label">
          <span id={titleId}>Local export metadata</span>
        </div>
        <div className="local-reviewer-metadata-fields">
          <label>
            <span>Local reviewer ID</span>
            <input
              type="text"
              value={value.reviewerId}
              spellCheck={false}
              autoComplete="off"
              inputMode="text"
              aria-describedby={describedBy}
              onChange={(event) =>
                onChange({
                  ...value,
                  reviewerId: event.currentTarget.value,
                })
              }
            />
          </label>
          <label>
            <span>Review context</span>
            <select
              value={value.context}
              aria-describedby={describedBy}
              onChange={(event) =>
                onChange({
                  ...value,
                  context: event.currentTarget.value as ReviewerContextV01,
                })
              }
            >
              {reviewContextOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p id={noteId} className="tc-masthead__helper">
          Stored in this browser and written into local JSON exports only. It
          does not create a login or profile.
        </p>
        <div className="tc-masthead__action-row">
          <button type="button" onClick={onReset}>
            Reset
          </button>
        </div>
        {statusMessage ? (
          <p id={statusId} className="tc-masthead__helper" role="status">
            {statusMessage}
          </p>
        ) : null}
      </section>
    </details>
  );
}

function getReviewContextLabel(context: ReviewerContextV01): string {
  return (
    reviewContextOptions.find((option) => option.value === context)?.label ??
    context
  );
}
