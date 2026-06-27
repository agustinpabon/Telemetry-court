"use client";

import type {
  LocalReviewerMetadataV01,
  ReviewerContextV01,
} from "@/lib/reviewerIdentityV01";

type LocalReviewExportMetadataControlProps = {
  value: LocalReviewerMetadataV01;
  statusMessage?: string;
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
  onChange,
  onReset,
}: LocalReviewExportMetadataControlProps) {
  return (
    <section
      className="local-reviewer-metadata-control tc-masthead__action-group"
      aria-labelledby="local-reviewer-metadata-title"
    >
      <div className="tc-masthead__action-label">
        <span id="local-reviewer-metadata-title">Local export metadata</span>
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
            aria-describedby="local-reviewer-metadata-note"
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
      <p id="local-reviewer-metadata-note" className="tc-masthead__helper">
        Stored in this browser and written into local JSON exports only. It does
        not create a login or profile.
      </p>
      <div className="tc-masthead__action-row">
        <button type="button" onClick={onReset}>
          Reset
        </button>
      </div>
      {statusMessage ? (
        <p className="tc-masthead__helper" role="status">
          {statusMessage}
        </p>
      ) : null}
    </section>
  );
}
