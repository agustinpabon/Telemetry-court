"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";

import { MetricCard } from "@/components/arena/WorkflowPrimitives";
import { EvaluationReportResults } from "@/components/evaluation/EvaluationReportResults";
import {
  importLocalEvaluationResultsBundleV01,
  loadLocalEvaluationResultsV01,
  type LocalEvaluationResultsSnapshotV01,
} from "@/lib/localEvaluationResultsV01";

type ResultsImportStatus =
  | { state: "idle" }
  | { state: "reading" }
  | { state: "success"; message: string }
  | { state: "error"; message: string };

const emptySnapshot: LocalEvaluationResultsSnapshotV01 = {
  totalReviewResultCount: 0,
  packageGroups: [],
};

export function LocalEvaluationResults() {
  const [snapshot, setSnapshot] = useState(emptySnapshot);
  const [loadError, setLoadError] = useState<string>();
  const [importStatus, setImportStatus] = useState<ResultsImportStatus>({
    state: "idle",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      if (!window.localStorage) {
        setLoadError("Browser-local ReviewResult storage is unavailable.");
        return;
      }

      try {
        setSnapshot(loadLocalEvaluationResultsV01(window.localStorage));
      } catch (error) {
        setLoadError(
          error instanceof Error
            ? error.message
            : "Local ReviewResults could not be validated.",
        );
      }
    }, 0);

    return () => window.clearTimeout(hydrationTimer);
  }, []);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    setImportStatus({ state: "reading" });

    try {
      const result = importLocalEvaluationResultsBundleV01(
        window.localStorage,
        await file.text(),
      );
      setSnapshot(result.snapshot);
      setLoadError(undefined);

      if (result.ok) {
        setImportStatus({
          state: "success",
          message: `Imported ${formatCount(result.importedReviewResultCount, "ReviewResult", "ReviewResults")}. The local summary now includes ${formatCount(result.snapshot.totalReviewResultCount, "result", "results")}.`,
        });
      } else {
        setImportStatus({
          state: "error",
          message: formatRejectedImportMessage(result),
        });
      }
    } catch {
      setImportStatus({
        state: "error",
        message:
          "The selected ReviewResult bundle could not be read. No results were imported or included in aggregation.",
      });
    } finally {
      input.value = "";
    }
  }

  return (
    <LocalEvaluationResultsView
      snapshot={snapshot}
      loadError={loadError}
      importStatus={importStatus}
      fileInputRef={fileInputRef}
      onChooseFile={() => fileInputRef.current?.click()}
      onFileChange={handleFileChange}
    />
  );
}

export function LocalEvaluationResultsView({
  snapshot,
  loadError,
  importStatus = { state: "idle" },
  fileInputRef,
  onChooseFile = () => undefined,
  onFileChange = () => undefined,
}: {
  snapshot: LocalEvaluationResultsSnapshotV01;
  loadError?: string;
  importStatus?: ResultsImportStatus;
  fileInputRef?: React.RefObject<HTMLInputElement | null>;
  onChooseFile?: () => void;
  onFileChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const hasResults = snapshot.totalReviewResultCount > 0;

  return (
    <div className="local-evaluation-results">
      <header className="local-results-hero">
        <div>
          <p className="eyebrow">Local evaluation results</p>
          <h2>ReviewResult summary</h2>
          <p>
            Aggregate validated browser-local and imported ReviewResults into
            one EvaluationReport per compatible CasePackage reference.
          </p>
        </div>
        <div className="local-results-import">
          <input
            ref={fileInputRef}
            className="case-package-import-input"
            type="file"
            accept="application/json,.json"
            onChange={onFileChange}
          />
          <button type="button" onClick={onChooseFile}>
            Import ReviewResult bundle
          </button>
          <p
            className={`local-results-import-status is-${importStatus.state}`}
            role="status"
          >
            {getImportStatusCopy(importStatus)}
          </p>
        </div>
      </header>

      {loadError ? (
        <section className="local-results-error" role="alert">
          <strong>Local ReviewResults were not aggregated</strong>
          <p>{loadError}</p>
          <p>
            The stored artifacts failed validation. No incompatible result was
            included in an EvaluationReport.
          </p>
        </section>
      ) : null}

      {!loadError && !hasResults ? (
        <section className="local-results-empty">
          <strong>No ReviewResults available</strong>
          <p>
            Complete and export a review to save it locally, or import a
            compatible ReviewResult bundle. No report is calculated from an
            empty result set.
          </p>
        </section>
      ) : null}

      {!loadError && hasResults ? (
        <>
          <section className="evaluation-report-metrics local-results-metrics">
            <MetricCard
              label="ReviewResults"
              value={formatCount(
                snapshot.totalReviewResultCount,
                "result",
                "results",
              )}
              detail="Validated artifacts available for local aggregation."
            />
            <MetricCard
              label="Package coverage"
              value={formatCount(
                snapshot.packageGroups.length,
                "CasePackage",
                "CasePackages",
              )}
              detail="Different package references remain separate."
            />
            <MetricCard
              label="Compatibility"
              value="Strict"
              detail="Rejected and duplicate imports are excluded atomically."
            />
          </section>

          <section className="evaluation-report-boundary local-results-boundary">
            <strong>Compatible package groups only</strong>
            <p>
              Each section uses the existing EvaluationReportV01 aggregation
              logic. Results from different CasePackages are never combined.
            </p>
          </section>

          <div className="local-results-groups">
            {snapshot.packageGroups.map((group) => {
              const { case_package: casePackage } = group.report;

              return (
                <article
                  className="local-results-group"
                  key={group.casePackageId}
                >
                  <header className="local-results-provenance">
                    <div>
                      <span className="local-results-provenance-label">
                        CasePackage coverage
                      </span>
                      <h3>{group.casePackageId}</h3>
                      <p>
                        {formatCount(
                          group.reviewResultCount,
                          "compatible ReviewResult",
                          "compatible ReviewResults",
                        )}
                      </p>
                    </div>
                    <dl>
                      <div>
                        <dt>Case</dt>
                        <dd>{casePackage.case_id}</dd>
                      </div>
                      <div>
                        <dt>Revision</dt>
                        <dd>{casePackage.package_revision ?? "Not provided"}</dd>
                      </div>
                      <div>
                        <dt>Cluster</dt>
                        <dd>{casePackage.cluster_id}</dd>
                      </div>
                      <div>
                        <dt>Pipeline run</dt>
                        <dd>{casePackage.pipeline.run_id}</dd>
                      </div>
                      <div>
                        <dt>Upstream tool</dt>
                        <dd>{casePackage.pipeline.upstream_tool}</dd>
                      </div>
                    </dl>
                  </header>
                  <EvaluationReportResults report={group.report} />
                </article>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}

function getImportStatusCopy(status: ResultsImportStatus): string {
  switch (status.state) {
    case "reading":
      return "Validating ReviewResult bundle and compatibility.";
    case "success":
    case "error":
      return status.message;
    case "idle":
    default:
      return "Local JSON only. Validation runs before any result is stored.";
  }
}

function formatRejectedImportMessage(
  result: Extract<
    ReturnType<typeof importLocalEvaluationResultsBundleV01>,
    { ok: false }
  >,
) {
  const exclusion =
    result.excludedReviewResultCount > 0
      ? `${formatCount(result.excludedReviewResultCount, "ReviewResult", "ReviewResults")} rejected and excluded from aggregation.`
      : "Bundle rejected. No results were imported or included in aggregation.";

  return `${exclusion} ${result.message}`;
}

function formatCount(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}
