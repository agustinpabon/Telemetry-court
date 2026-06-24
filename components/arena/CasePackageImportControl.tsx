import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";

import type { CasePackageInspectionSummary } from "@/lib/casePackageInspection";
import type { CasePackageImportResult } from "@/lib/importCasePackageV01";

export type CasePackageImportFailureDetails =
  | Omit<Extract<CasePackageImportResult, { ok: false }>, "ok">
  | {
      reason: "read_error";
      title: string;
      summary: string;
      suggestedFix: string;
      message: string;
      errors: Array<{ path: string; code: string; message: string }>;
    };

export type CasePackageImportStatus =
  | { state: "idle" }
  | { state: "reading" }
  | {
      state: "success";
      packageId: string;
      caseId: string;
      title: string;
      inspectionSummary: CasePackageInspectionSummary;
      source?: "manual" | "hot_folder";
      sourceLabel?: string;
      resultsCacheAvailable?: boolean;
    }
  | { state: "error"; failure: CasePackageImportFailureDetails };

type CasePackageImportControlProps = {
  status: CasePackageImportStatus;
  onImportStart: () => void;
  onImportText: (jsonText: string, fileName: string) => void;
  onImportReadError: (message: string) => void;
  onClearImport: () => void;
  initialDismissedForTesting?: boolean;
};

const maxImportErrorsShown = 6;
const maxImportErrorsCopied = 20;

export function CasePackageImportControl({
  status,
  onImportStart,
  onImportText,
  onImportReadError,
  onClearImport,
  initialDismissedForTesting,
}: CasePackageImportControlProps) {
  const inputId = useId();
  const statusId = useId();
  const inspectionPanelTitleId = useId();
  const failurePanelTitleId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copyMessage, setCopyMessage] = useState<string>();

  const statusKey = status.state === "success"
    ? `success-${status.packageId}`
    : status.state === "error"
    ? `error-${status.failure.reason}-${status.failure.errors.length}`
    : status.state;

  const [lastStatusKey, setLastStatusKey] = useState(statusKey);
  const [isDismissed, setIsDismissed] = useState(initialDismissedForTesting ?? false);

  if (statusKey !== lastStatusKey) {
    setLastStatusKey(statusKey);
    setIsDismissed(initialDismissedForTesting ?? false);
  }

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
      onImportReadError("Could not read the selected CasePackage file.");
    } finally {
      input.value = "";
    }
  }

  async function handleCopyDiagnostics() {
    if (status.state !== "error") {
      return;
    }

    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      setCopyMessage("Clipboard is unavailable.");
      return;
    }

    try {
      await navigator.clipboard.writeText(
        formatDiagnosticsForClipboard(status.failure),
      );
      setCopyMessage("Diagnostics copied.");
    } catch {
      setCopyMessage("Clipboard copy failed.");
    }
  }

  return (
    <div className="case-package-import-control tc-masthead__action-group">
      <input
        ref={fileInputRef}
        id={inputId}
        className="case-package-import-input"
        type="file"
        accept="application/json,.json"
        onChange={handleFileChange}
        aria-describedby={statusId}
      />
      <span className="tc-masthead__group-label tc-masthead__action-label tc-masthead__action-label--empty" aria-hidden="true" />
      <div className="tc-masthead__action-row tc-masthead__button-row">
        <button
          type="button"
          className="case-package-import-button"
          onClick={() => fileInputRef.current?.click()}
          aria-describedby={statusId}
        >
          {status.state === "error" ? "Choose Another File" : "Import CasePackage"}
        </button>
        {status.state === "success" && isDismissed ? (
          <button
            type="button"
            className="case-package-import-details-button"
            onClick={() => setIsDismissed(false)}
            aria-label="View imported package details"
          >
            Package details
          </button>
        ) : null}
      </div>
      <div
        id={statusId}
        className={`case-package-import-status tc-masthead__helper tc-masthead__action-helper is-${status.state}`}
        role="status"
      >
        <span>{getStatusCopy(status)}</span>
      </div>
      {status.state === "error" && !isDismissed ? (
        <ImportFailurePanel
          failure={status.failure}
          titleId={failurePanelTitleId}
          copyMessage={copyMessage}
          onChooseAnotherFile={() => fileInputRef.current?.click()}
          onClearImport={onClearImport}
          onCopyDiagnostics={handleCopyDiagnostics}
          onClose={() => setIsDismissed(true)}
        />
      ) : null}
      {status.state === "success" && !isDismissed ? (
        <ImportInspectionSummaryPanel
          summary={status.inspectionSummary}
          titleId={inspectionPanelTitleId}
          onClose={() => setIsDismissed(true)}
        />
      ) : null}
    </div>
  );
}

function getStatusCopy(status: CasePackageImportStatus): string {
  switch (status.state) {
    case "reading":
      return "Validating CasePackage JSON.";
    case "success":
      if (status.source === "hot_folder") {
        return status.resultsCacheAvailable === false
          ? `Imported from ${status.sourceLabel ?? "Hot-Folder"}. Matching CasePackage metadata must be reloaded for Results.`
          : `Imported from ${status.sourceLabel ?? "Hot-Folder"}`;
      }

      return status.resultsCacheAvailable === false
        ? "Imported package. Matching CasePackage metadata must be reloaded for Results."
        : "Imported package";
    case "error":
      return status.failure.message;
    case "idle":
    default:
      return "Import a local CasePackage JSON.";
  }
}

function ImportFailurePanel({
  failure,
  titleId,
  copyMessage,
  onChooseAnotherFile,
  onClearImport,
  onCopyDiagnostics,
  onClose,
}: {
  failure: CasePackageImportFailureDetails;
  titleId: string;
  copyMessage?: string;
  onChooseAnotherFile: () => void;
  onClearImport: () => void;
  onCopyDiagnostics: () => void;
  onClose: () => void;
}) {
  const visibleErrors = failure.errors.slice(0, maxImportErrorsShown);
  const hiddenErrorCount = Math.max(0, failure.errors.length - visibleErrors.length);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <section
      className="case-package-import-failure-panel"
      aria-labelledby={titleId}
      role="alert"
    >
      <button
        type="button"
        className="case-package-import-close-button"
        onClick={onClose}
        aria-label="Close error diagnostics"
      >
        ×
      </button>
      <div className="case-package-import-failure-header">
        <p className="case-package-import-failure-kicker">
          {getFailureCategoryLabel(failure.reason)}
        </p>
        <h2 id={titleId}>{failure.title}</h2>
        <p>{failure.summary}</p>
      </div>

      <dl className="case-package-import-failure-facts">
        <div>
          <dt>Import state</dt>
          <dd>Review not started</dd>
        </div>
        <div>
          <dt>Error count</dt>
          <dd>{failure.errors.length}</dd>
        </div>
      </dl>

      <p className="case-package-import-suggested-fix">
        <strong>Suggested fix</strong>
        <span>{failure.suggestedFix}</span>
      </p>

      <div className="case-package-import-errors">
        <h3>First validation errors</h3>
        <ol>
          {visibleErrors.map((error, index) => (
            <li key={`${error.path}-${error.code}-${index}`}>
              <dl>
                <div>
                  <dt>Path</dt>
                  <dd>
                    <code>{error.path}</code>
                  </dd>
                </div>
                <div>
                  <dt>Code</dt>
                  <dd>
                    <code>{error.code}</code>
                  </dd>
                </div>
                <div>
                  <dt>Message</dt>
                  <dd>{sanitizeDiagnosticMessage(error.message)}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ol>
        {hiddenErrorCount > 0 ? (
          <p>
            {hiddenErrorCount} additional validation errors are hidden from this
            panel.
          </p>
        ) : null}
      </div>

      <div className="case-package-import-failure-actions">
        <button type="button" onClick={onChooseAnotherFile}>
          Choose Another File
        </button>
        <button type="button" onClick={onClearImport}>
          Clear failed import / return to demo
        </button>
        <button type="button" onClick={onCopyDiagnostics}>
          Copy diagnostics
        </button>
      </div>

      {copyMessage ? (
        <p className="case-package-import-copy-status">{copyMessage}</p>
      ) : null}
    </section>
  );
}

function ImportInspectionSummaryPanel({
  summary,
  titleId,
  onClose,
}: {
  summary: CasePackageInspectionSummary;
  titleId: string;
  onClose: () => void;
}) {
  const facts = getInspectionSummaryFacts(summary);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <section
      className="case-package-import-summary-panel"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="case-package-import-close-button"
        onClick={onClose}
        aria-label="Close summary"
      >
        ×
      </button>
      <div className="case-package-import-summary-header">
        <p className="case-package-import-summary-kicker">
          {summary.packagePosture}
        </p>
        <h2 id={titleId}>Imported package summary</h2>
      </div>

      <dl className="case-package-import-summary-facts">
        {facts.map((fact) => (
          <div key={fact.label}>
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function getInspectionSummaryFacts(
  summary: CasePackageInspectionSummary,
): Array<{ label: string; value: string }> {
  return [
    { label: "Schema version", value: summary.schemaVersion },
    {
      label: "Package ID",
      value: formatMaybeRevision(summary.packageId, summary.packageRevision),
    },
    { label: "Case ID", value: summary.caseId },
    { label: "Reviewable status", value: summary.reviewableStatus },
    { label: "Package posture", value: summary.packagePosture },
    {
      label: "Dataset classification",
      value: summary.datasetClassification,
    },
    { label: "Sanitization status", value: summary.sanitizationStatus },
    { label: "Approval status", value: summary.approvalStatus },
    summary.approvalScope
      ? { label: "Approval scope", value: summary.approvalScope }
      : null,
    {
      label: "Pipeline",
      value: formatNameAndVersion(summary.pipelineName, summary.pipelineVersion),
    },
    summary.adapterName
      ? {
          label: "Adapter",
          value: formatNameAndVersion(
            summary.adapterName,
            summary.adapterVersion,
          ),
        }
      : null,
    { label: "Evidence count", value: String(summary.evidenceCount) },
    { label: "Claim count", value: String(summary.claimCount) },
    {
      label: "Candidate label count",
      value: String(summary.candidateLabelCount),
    },
    {
      label: "Representative session count",
      value: String(summary.representativeSessionCount),
    },
  ].filter((fact): fact is { label: string; value: string } => fact !== null);
}

function formatMaybeRevision(packageId: string, revision: string | undefined) {
  return revision ? `${packageId} (${revision})` : packageId;
}

function formatNameAndVersion(name: string, version: string | undefined) {
  return version ? `${name} ${version}` : name;
}

function getFailureCategoryLabel(
  reason: CasePackageImportFailureDetails["reason"],
): string {
  switch (reason) {
    case "malformed_json":
      return "Parse failure";
    case "schema_version":
      return "Package validation";
    case "validation":
      return "Package validation";
    case "adapter_readiness":
      return "Review readiness";
    case "read_error":
      return "File read failure";
  }
}

function formatDiagnosticsForClipboard(
  failure: CasePackageImportFailureDetails,
): string {
  const copiedErrors = failure.errors.slice(0, maxImportErrorsCopied);
  const hiddenErrorCount = Math.max(0, failure.errors.length - copiedErrors.length);
  const errorLines = copiedErrors.map((error, index) => {
    return [
      `${index + 1}. ${error.code}`,
      `Path: ${error.path}`,
      `Message: ${sanitizeDiagnosticMessage(error.message)}`,
    ].join("\n");
  });

  return [
    "Telemetry Court CasePackage import diagnostics",
    `Category: ${getFailureCategoryLabel(failure.reason)}`,
    `Summary: ${failure.summary}`,
    `Import state: Review not started`,
    `Error count: ${failure.errors.length}`,
    `Suggested fix: ${failure.suggestedFix}`,
    "",
    "Validation errors:",
    ...errorLines,
    hiddenErrorCount > 0
      ? `${hiddenErrorCount} additional validation errors omitted.`
      : undefined,
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n");
}

function sanitizeDiagnosticMessage(message: string): string {
  const redacted = message.replace(/"[^"]*"/g, '"[redacted]"');

  if (redacted.length <= 220) {
    return redacted;
  }

  return `${redacted.slice(0, 217).trimEnd()}...`;
}
