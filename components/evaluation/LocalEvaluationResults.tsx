"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";

import { MetricCard } from "@/components/arena/WorkflowPrimitives";
import { ReviewResultImportSummaryPanel } from "@/components/arena/ReviewResultImportSummaryPanel";
import { EvaluationReportResults } from "@/components/evaluation/EvaluationReportResults";
import { ResultsGalaxyMap } from "@/components/evaluation/ResultsGalaxyMap";
import { casePackageFixtures } from "@/data/casePackageFixtures";
import {
  importLocalEvaluationResultsBundleV01,
  loadLocalEvaluationResultsV01,
  type LocalEvaluationResultsSnapshotV01,
} from "@/lib/localEvaluationResultsV01";
import type { ReviewResultImportInspectionSummaryV01 } from "@/lib/reviewResultInspectionV01";
import {
  importResultsMapCasePackageV01Json,
  type ResultsMapCasePackageImportV01,
} from "@/lib/resultsGalaxyMapV01";
import type { CasePackageV01 } from "@/lib/types";

type ResultsImportStatus =
  | { state: "idle" }
  | { state: "reading" }
  | {
      state: "success";
      message: string;
      inspectionSummary?: ReviewResultImportInspectionSummaryV01;
    }
  | { state: "error"; message: string };

type ResultsMapPackageImportStatus =
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
  const mapPackageInputRef = useRef<HTMLInputElement>(null);
  const [availableCasePackages, setAvailableCasePackages] =
    useState<CasePackageV01[]>(casePackageFixtures);
  const [mapPackageImportStatus, setMapPackageImportStatus] =
    useState<ResultsMapPackageImportStatus>({
      state: "idle",
    });

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
          inspectionSummary: result.inspectionSummary,
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

  async function handleMapPackageFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    setMapPackageImportStatus({ state: "reading" });

    try {
      const result = importResultsMapCasePackageV01Json(await file.text());

      if (!result.ok) {
        setMapPackageImportStatus({
          state: "error",
          message: result.message,
        });
        return;
      }

      setAvailableCasePackages((currentPackages) =>
        replaceCasePackage(currentPackages, result.package),
      );
      setMapPackageImportStatus({
        state: "success",
        message: formatMapPackageImportSuccess(result),
      });
    } catch {
      setMapPackageImportStatus({
        state: "error",
        message:
          "The selected CasePackage map JSON could not be read. No map coordinates were imported.",
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
      mapPackageImportStatus={mapPackageImportStatus}
      availableCasePackages={availableCasePackages}
      fileInputRef={fileInputRef}
      mapPackageInputRef={mapPackageInputRef}
      onChooseFile={() => fileInputRef.current?.click()}
      onChooseMapPackageFile={() => mapPackageInputRef.current?.click()}
      onFileChange={handleFileChange}
      onMapPackageFileChange={handleMapPackageFileChange}
    />
  );
}

export function LocalEvaluationResultsView({
  snapshot,
  loadError,
  importStatus = { state: "idle" },
  mapPackageImportStatus = { state: "idle" },
  availableCasePackages = [],
  fileInputRef,
  mapPackageInputRef,
  onChooseFile = () => undefined,
  onChooseMapPackageFile = () => undefined,
  onFileChange = () => undefined,
  onMapPackageFileChange = () => undefined,
}: {
  snapshot: LocalEvaluationResultsSnapshotV01;
  loadError?: string;
  importStatus?: ResultsImportStatus;
  mapPackageImportStatus?: ResultsMapPackageImportStatus;
  availableCasePackages?: CasePackageV01[];
  fileInputRef?: React.RefObject<HTMLInputElement | null>;
  mapPackageInputRef?: React.RefObject<HTMLInputElement | null>;
  onChooseFile?: () => void;
  onChooseMapPackageFile?: () => void;
  onFileChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onMapPackageFileChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const hasResults = snapshot.totalReviewResultCount > 0;
  const importSummaryTitleId = useId();

  return (
    <div className="local-evaluation-results">
      <header className="local-results-hero">
        <div>
          <p className="eyebrow">Local evaluation results</p>
          <h2>ReviewResult summary</h2>
          <p>
            A ReviewResult is one reviewer&apos;s structured judgment for one
            CasePackage. Browser-local and imported ReviewResults become one
            EvaluationReport only when they share a compatible CasePackage
            reference and ReviewResult protocol.
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
          <input
            ref={mapPackageInputRef}
            className="case-package-import-input"
            type="file"
            accept="application/json,.json"
            onChange={onMapPackageFileChange}
          />
          <button type="button" onClick={onChooseFile}>
            Import ReviewResult JSON
          </button>
          <button type="button" onClick={onChooseMapPackageFile}>
            Import CasePackage map JSON
          </button>
          <p
            className={`local-results-import-status is-${importStatus.state}`}
            role="status"
          >
            {getImportStatusCopy(importStatus)}
          </p>
          <p
            className={`local-results-import-status is-${mapPackageImportStatus.state}`}
            role="status"
          >
            {getMapPackageImportStatusCopy(mapPackageImportStatus)}
          </p>
        </div>
      </header>

      {importStatus.state === "success" && importStatus.inspectionSummary ? (
        <ReviewResultImportSummaryPanel
          summary={importStatus.inspectionSummary}
          titleId={importSummaryTitleId}
          variant="inline"
        />
      ) : null}

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
            compatible ReviewResult JSON file. No report is calculated from an
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
              Multiple compatible ReviewResults means multiple reviewers
              reviewed the same compatible CasePackage/protocol. Results from
              different CasePackages or incompatible protocols are never
              combined.
            </p>
          </section>

          <ResultsGalaxyMap
            packageGroups={snapshot.packageGroups}
            availableCasePackages={availableCasePackages}
          />

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
                  <EvaluationReportResults
                    report={group.report}
                    sourceReviewResults={group.sourceReviewResults}
                  />
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
      return "Validating ReviewResult JSON and compatibility.";
    case "success":
    case "error":
      return status.message;
    case "idle":
    default:
      return "Local JSON only. Validation runs before any result is stored.";
  }
}

function getMapPackageImportStatusCopy(
  status: ResultsMapPackageImportStatus,
): string {
  switch (status.state) {
    case "reading":
      return "Validating CasePackage coordinates for results mapping.";
    case "success":
    case "error":
      return status.message;
    case "idle":
    default:
      return "Optional: import matching CasePackage JSON to enable map coordinates.";
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

function replaceCasePackage(
  currentPackages: CasePackageV01[],
  nextPackage: CasePackageV01,
): CasePackageV01[] {
  const nextPackageKey = getCasePackageListKey(nextPackage);

  return [
    nextPackage,
    ...currentPackages.filter(
      (currentPackage) => getCasePackageListKey(currentPackage) !== nextPackageKey,
    ),
  ];
}

function getCasePackageListKey(casePackage: CasePackageV01): string {
  return [
    casePackage.package_id,
    casePackage.package_revision ?? "unrevisioned",
    casePackage.pipeline.run_id,
  ].join(":");
}

function formatMapPackageImportSuccess(
  result: Extract<ResultsMapCasePackageImportV01, { ok: true }>,
): string {
  const coordinates = result.package.cluster.embedding_map?.coordinates;
  const coordinateState = coordinates ? "with coordinates" : "without coordinates";

  return `Imported CasePackage ${result.package.package_id} ${coordinateState} for results mapping.`;
}
