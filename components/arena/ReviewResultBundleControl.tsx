import { useId, useRef, type ChangeEvent } from "react";

import { ReviewResultImportSummaryPanel } from "@/components/arena/ReviewResultImportSummaryPanel";
import type { ReviewResultImportInspectionSummaryV01 } from "@/lib/reviewResultInspectionV01";

export type ReviewResultBundleControlStatus =
  | { state: "idle" }
  | { state: "reading" }
  | {
      state: "success";
      message: string;
      inspectionSummary?: ReviewResultImportInspectionSummaryV01;
    }
  | { state: "error"; message: string };

type ReviewResultBundleControlProps = {
  status: ReviewResultBundleControlStatus;
  onExport: () => void;
  onImportStart: () => void;
  onImportText: (jsonText: string, fileName: string) => void;
  onImportReadError: (message: string) => void;
};

export function ReviewResultBundleControl({
  status,
  onExport,
  onImportStart,
  onImportText,
  onImportReadError,
}: ReviewResultBundleControlProps) {
  const inputId = useId();
  const statusId = useId();
  const summaryTitleId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    onImportStart();

    try {
      onImportText(await file.text(), file.name);
    } catch {
      onImportReadError("Could not read the selected ReviewResult JSON file.");
    } finally {
      input.value = "";
    }
  }

  return (
    <div className="review-result-bundle-control tc-masthead__action-group">
      <span className="review-result-bundle-label tc-masthead__group-label tc-masthead__action-label">
        ReviewResult import
      </span>
      <input
        ref={fileInputRef}
        id={inputId}
        className="case-package-import-input"
        type="file"
        accept="application/json,.json"
        onChange={handleFileChange}
        aria-describedby={statusId}
      />
      <div className="tc-masthead__action-row tc-masthead__button-row review-result-bundle-actions">
        <button type="button" onClick={onExport} aria-describedby={statusId}>
          Export reviews
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-describedby={statusId}
        >
          Import review results
        </button>
      </div>
      <p
        id={statusId}
        className={`review-result-bundle-status tc-masthead__helper tc-masthead__action-helper is-${status.state}`}
        role="status"
      >
        {getStatusCopy(status)}
      </p>
      {status.state === "success" && status.inspectionSummary ? (
        <ReviewResultImportSummaryPanel
          summary={status.inspectionSummary}
          titleId={summaryTitleId}
        />
      ) : null}
    </div>
  );
}

function getStatusCopy(status: ReviewResultBundleControlStatus): string {
  switch (status.state) {
    case "reading":
      return "Validating local ReviewResult JSON.";
    case "success":
    case "error":
      return status.message;
    case "idle":
    default:
      return "Local JSON for portable review outputs.";
  }
}
