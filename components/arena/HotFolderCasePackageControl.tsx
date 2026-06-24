import { useId } from "react";

export type HotFolderCasePackageControlStatus =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "disabled"; message: string }
  | {
      state: "ready";
      message: string;
      unseenCount: number;
      validCount: number;
      invalidCount: number;
      invalidSummary?: string;
    }
  | { state: "loaded"; message: string }
  | { state: "error"; message: string };

type HotFolderCasePackageControlProps = {
  status: HotFolderCasePackageControlStatus;
  polling: boolean;
  onCheck: () => void;
  onTogglePolling: () => void;
  onLoadNext: () => void;
};

export function HotFolderCasePackageControl({
  status,
  polling,
  onCheck,
  onTogglePolling,
  onLoadNext,
}: HotFolderCasePackageControlProps) {
  const statusId = useId();
  const isDisabled = status.state === "disabled";
  const isChecking = status.state === "checking";
  const canLoadNext = status.state === "ready" && status.unseenCount > 0;

  return (
    <div className="hot-folder-case-package-control tc-masthead__action-group">
      <span className="hot-folder-case-package-label tc-masthead__group-label tc-masthead__action-label">
        Hot-Folder
      </span>
      <div className="tc-masthead__action-row tc-masthead__button-row hot-folder-case-package-actions">
        <button
          type="button"
          onClick={onCheck}
          disabled={isDisabled || isChecking}
          aria-describedby={statusId}
        >
          {isChecking ? "Checking..." : "Check Hot-Folder"}
        </button>
        {canLoadNext ? (
          <button type="button" onClick={onLoadNext} aria-describedby={statusId}>
            Load newest
          </button>
        ) : null}
        <button
          type="button"
          onClick={onTogglePolling}
          disabled={isDisabled || isChecking}
          aria-pressed={polling}
          aria-describedby={statusId}
        >
          {polling ? "Polling on" : "Polling off"}
        </button>
      </div>
      <p
        id={statusId}
        className={`hot-folder-case-package-status tc-masthead__helper tc-masthead__action-helper is-${status.state}`}
        role="status"
      >
        {getStatusCopy(status)}
      </p>
    </div>
  );
}

function getStatusCopy(status: HotFolderCasePackageControlStatus): string {
  switch (status.state) {
    case "checking":
      return "Scanning configured Hot-Folder.";
    case "disabled":
    case "error":
    case "loaded":
      return status.message;
    case "ready":
      return [
        status.message,
        status.invalidCount > 0
          ? `${status.invalidCount} invalid ignored${status.invalidSummary ? `: ${status.invalidSummary}` : "."}`
          : undefined,
      ]
        .filter((part): part is string => Boolean(part))
        .join(" ");
    case "idle":
    default:
      return "Check configured Hot-Folder for CasePackage JSON.";
  }
}
