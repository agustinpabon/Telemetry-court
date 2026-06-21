"use client";

import { useState } from "react";

import type { EvaluationReportV01 } from "@/lib/evaluationReportV01";
import {
  getEvaluationReportCsvExportFilenameV01,
  getEvaluationReportJsonExportFilenameV01,
  serializeEvaluationReportCsvV01,
  serializeEvaluationReportJsonV01,
} from "@/lib/evaluationReportExportV01";

type EvaluationReportExportActionsProps = {
  report: EvaluationReportV01;
};

export function EvaluationReportExportActions({
  report,
}: EvaluationReportExportActionsProps) {
  const [message, setMessage] = useState<string>();

  function downloadJson() {
    downloadReportArtifact({
      content: serializeEvaluationReportJsonV01(report),
      filename: getEvaluationReportJsonExportFilenameV01(report),
      mimeType: "application/json",
    });
    setMessage("Downloaded EvaluationReport JSON.");
  }

  function downloadCsv() {
    downloadReportArtifact({
      content: serializeEvaluationReportCsvV01(report),
      filename: getEvaluationReportCsvExportFilenameV01(report),
      mimeType: "text/csv;charset=utf-8",
    });
    setMessage("Downloaded EvaluationReport CSV.");
  }

  return (
    <div className="evaluation-report-export-actions">
      <div>
        <button type="button" className="secondary-action" onClick={downloadJson}>
          Download JSON
        </button>
        <button type="button" className="primary-action" onClick={downloadCsv}>
          Download CSV
        </button>
      </div>
      {message ? <p aria-live="polite">{message}</p> : null}
    </div>
  );
}

function downloadReportArtifact({
  content,
  filename,
  mimeType,
}: {
  content: string;
  filename: string;
  mimeType: string;
}) {
  const exportBlob = new Blob([content], { type: mimeType });
  const exportUrl = URL.createObjectURL(exportBlob);
  const downloadLink = document.createElement("a");

  downloadLink.href = exportUrl;
  downloadLink.download = filename;
  document.body.append(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  URL.revokeObjectURL(exportUrl);
}
