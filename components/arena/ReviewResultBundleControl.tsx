import { useId, useRef, type ChangeEvent } from "react";

export type ReviewResultBundleControlStatus =
  | { state: "idle" }
  | { state: "reading" }
  | { state: "success"; message: string }
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
      onImportReadError("Could not read the selected ReviewResult bundle.");
    } finally {
      input.value = "";
    }
  }

  return (
    <div className="review-result-bundle-control">
      <span className="review-result-bundle-label">ReviewResult bundle</span>
      <input
        ref={fileInputRef}
        id={inputId}
        className="case-package-import-input"
        type="file"
        accept="application/json,.json"
        onChange={handleFileChange}
        aria-describedby={statusId}
      />
      <div className="review-result-bundle-actions">
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
        className={`review-result-bundle-status is-${status.state}`}
        role="status"
      >
        {getStatusCopy(status)}
      </p>
    </div>
  );
}

function getStatusCopy(status: ReviewResultBundleControlStatus): string {
  switch (status.state) {
    case "reading":
      return "Validating local ReviewResult bundle JSON.";
    case "success":
    case "error":
      return status.message;
    case "idle":
    default:
      return "Local JSON for portable review outputs.";
  }
}
