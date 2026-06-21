import { useId, useRef, type ChangeEvent } from "react";

export type CasePackageImportStatus =
  | { state: "idle" }
  | { state: "reading" }
  | {
      state: "success";
      packageId: string;
      caseId: string;
      title: string;
    }
  | { state: "error"; message: string };

type CasePackageImportControlProps = {
  status: CasePackageImportStatus;
  onImportStart: () => void;
  onImportText: (jsonText: string, fileName: string) => void;
  onImportReadError: (message: string) => void;
};

export function CasePackageImportControl({
  status,
  onImportStart,
  onImportText,
  onImportReadError,
}: CasePackageImportControlProps) {
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
      const jsonText = await file.text();
      onImportText(jsonText, file.name);
    } catch {
      onImportReadError("Could not read the selected case package file.");
    } finally {
      input.value = "";
    }
  }

  return (
    <div className="case-package-import-control">
      <input
        ref={fileInputRef}
        id={inputId}
        className="case-package-import-input"
        type="file"
        accept="application/json,.json"
        onChange={handleFileChange}
        aria-describedby={statusId}
      />
      <button
        type="button"
        className="case-package-import-button"
        onClick={() => fileInputRef.current?.click()}
        aria-describedby={statusId}
      >
        Import CasePackage
      </button>
      <p
        id={statusId}
        className={`case-package-import-status is-${status.state}`}
        role={status.state === "error" ? "alert" : "status"}
      >
        {getStatusCopy(status)}
      </p>
    </div>
  );
}

function getStatusCopy(status: CasePackageImportStatus): string {
  switch (status.state) {
    case "reading":
      return "Validating case package JSON.";
    case "success":
      return `Imported case package ${status.packageId} - ${status.caseId} - ${status.title}`;
    case "error":
      return status.message;
    case "idle":
    default:
      return "Import a local case package JSON.";
  }
}
