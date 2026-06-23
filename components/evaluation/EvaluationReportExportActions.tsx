"use client";

import { useState } from "react";

import {
  buildClusterRefinementV01,
  getClusterRefinementExportAvailabilityV01,
  getClusterRefinementJsonExportFilenameV01,
  serializeClusterRefinementJsonV01,
} from "@/lib/clusterRefinementV01";
import type { EvaluationReportV01 } from "@/lib/evaluationReportV01";
import {
  getEvaluationReportCsvExportFilenameV01,
  getEvaluationReportJsonExportFilenameV01,
  serializeEvaluationReportCsvV01,
  serializeEvaluationReportJsonV01,
} from "@/lib/evaluationReportExportV01";
import type { ReviewResultV01 } from "@/lib/reviewResultV01";

type EvaluationReportExportActionsProps = {
  report: EvaluationReportV01;
  sourceReviewResults?: readonly ReviewResultV01[];
};

export function EvaluationReportExportActions({
  report,
  sourceReviewResults,
}: EvaluationReportExportActionsProps) {
  const [message, setMessage] = useState<string>();
  const refinementAvailability = getClusterRefinementExportAvailabilityV01(
    report,
    sourceReviewResults,
  );

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

  function downloadRefinementJson() {
    if (!refinementAvailability.available) {
      setMessage(`Refinement recipe unavailable: ${refinementAvailability.reason}`);
      return;
    }

    if (!sourceReviewResults) {
      setMessage(
        "Refinement recipe unavailable: compatible source ReviewResults are required.",
      );
      return;
    }

    const artifact = buildClusterRefinementV01({
      report,
      sourceReviewResults,
    });

    downloadReportArtifact({
      content: serializeClusterRefinementJsonV01(artifact),
      filename: getClusterRefinementJsonExportFilenameV01(artifact),
      mimeType: "application/json",
    });
    setMessage("Downloaded cluster refinement recipe JSON.");
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
        <button
          type="button"
          className="secondary-action"
          onClick={downloadRefinementJson}
          disabled={!refinementAvailability.available}
        >
          Download refinement JSON
        </button>
      </div>
      <p>
        {refinementAvailability.available
          ? "Exports an upstream refinement recipe derived from human review aggregation."
          : `Refinement recipe unavailable: ${refinementAvailability.reason}`}
      </p>
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
