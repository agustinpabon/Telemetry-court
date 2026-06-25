"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";

import { MetricCard } from "@/components/arena/WorkflowPrimitives";
import { ReviewResultImportSummaryPanel } from "@/components/arena/ReviewResultImportSummaryPanel";
import { EvaluationReportResults } from "@/components/evaluation/EvaluationReportResults";
import { ReviewResultProgression } from "@/components/evaluation/ReviewResultProgression";
import { ResultsGalaxyMap } from "@/components/evaluation/ResultsGalaxyMap";
import { casePackageFixtures } from "@/data/casePackageFixtures";
import {
  getCasePackageSessionReferenceKeyV01,
  loadCasePackagesFromSessionStoreV01,
  saveCasePackageToSessionStoreV01,
} from "@/lib/casePackageSessionStorageV01";
import {
  importLocalEvaluationResultsBundleV01,
  loadLocalEvaluationResultsV01,
  type LocalEvaluationReportGroupV01,
  type LocalEvaluationResultsSnapshotV01,
  type LocalQuickDispositionGroupV01,
} from "@/lib/localEvaluationResultsV01";
import type {
  QuickDispositionImportInspectionSummaryV01,
  QuickDispositionInspectionCount,
} from "@/lib/quickDispositionInspectionV01";
import type {
  QuickDispositionReasonCodeV01,
  QuickDispositionSourceStageV01,
  QuickDispositionValueV01,
} from "@/lib/quickDispositionV01";
import type { ReviewResultImportInspectionSummaryV01 } from "@/lib/reviewResultInspectionV01";
import {
  importResultsMapCasePackageV01Json,
  toResultsCasePackageMetadataV01,
  type ResultsCasePackageMetadataV01,
  type ResultsMapCasePackageImportV01,
} from "@/lib/resultsGalaxyMapV01";
import type { CasePackageV01 } from "@/lib/types";

type ResultsImportStatus =
  | { state: "idle" }
  | { state: "reading" }
  | {
      state: "success";
      message: string;
      inspectionSummary?:
        | ReviewResultImportInspectionSummaryV01
        | QuickDispositionImportInspectionSummaryV01;
    }
  | { state: "error"; message: string };

type ResultsMapPackageImportStatus =
  | { state: "idle" }
  | { state: "reading" }
  | { state: "success"; message: string }
  | { state: "error"; message: string };

const emptySnapshot: LocalEvaluationResultsSnapshotV01 = {
  totalReviewResultCount: 0,
  totalQuickDispositionCount: 0,
  packageGroups: [],
  quickDispositionGroups: [],
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
    useState<ResultsCasePackageMetadataV01[]>(
      casePackageFixtures.map(toResultsCasePackageMetadataV01),
    );
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

      try {
        setAvailableCasePackages(
          mergeCasePackages(
            casePackageFixtures.map(toResultsCasePackageMetadataV01),
            loadCasePackagesFromSessionStoreV01(window.sessionStorage),
          ),
        );
      } catch (error) {
        setMapPackageImportStatus({
          state: "error",
          message:
            error instanceof Error
              ? error.message
              : "Cached CasePackage metadata could not be loaded.",
        });
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
          message:
            result.outcome === "already_imported"
              ? result.message
              : result.importedQuickDispositionCount > 0
                ? `Imported ${formatCount(result.importedQuickDispositionCount, "quick disposition artifact", "quick disposition artifacts")}. It remains separate from full evidence ReviewResults.`
                : `Imported ${formatCount(result.importedReviewResultCount, "full evidence ReviewResult", "full evidence ReviewResults")}. The local summary now includes ${formatCount(result.snapshot.totalReviewResultCount, "full evidence result", "full evidence results")}.`,
          inspectionSummary:
            result.outcome === "imported"
              ? result.inspectionSummary
              : undefined,
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
          "The selected review artifact JSON could not be read. No full evidence ReviewResults or quick disposition artifacts were imported.",
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

      saveCasePackageToSessionStoreV01(
        window.sessionStorage,
        result.package,
      );
      setAvailableCasePackages((currentPackages) =>
        replaceCasePackage(
          currentPackages,
          toResultsCasePackageMetadataV01(result.package),
        ),
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
  availableCasePackages?: Array<
    CasePackageV01 | ResultsCasePackageMetadataV01
  >;
  fileInputRef?: React.RefObject<HTMLInputElement | null>;
  mapPackageInputRef?: React.RefObject<HTMLInputElement | null>;
  onChooseFile?: () => void;
  onChooseMapPackageFile?: () => void;
  onFileChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onMapPackageFileChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const hasResults = snapshot.totalReviewResultCount > 0;
  const hasQuickDispositions = snapshot.totalQuickDispositionCount > 0;
  const importSummaryTitleId = useId();
  const quickDispositionImportSummaryTitleId = useId();
  const reviewResultInspectionSummary =
    importStatus.state === "success" &&
    importStatus.inspectionSummary?.artifactType !== "QuickDisposition"
      ? importStatus.inspectionSummary
      : undefined;
  const quickDispositionInspectionSummary =
    importStatus.state === "success" &&
    importStatus.inspectionSummary?.artifactType === "QuickDisposition"
      ? importStatus.inspectionSummary
      : undefined;
  const packageResultGroups = mergePackageResultGroups(snapshot);

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
            reference and ReviewResult protocol. Quick dispositions are early
            structured outcomes stored separately from full evidence reviews.
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
            Import review artifact JSON
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

      <ReviewResultProgression variant="results" />

      {reviewResultInspectionSummary ? (
        <ReviewResultImportSummaryPanel
          summary={reviewResultInspectionSummary}
          titleId={importSummaryTitleId}
          variant="inline"
        />
      ) : null}

      {quickDispositionInspectionSummary ? (
        <QuickDispositionImportSummaryPanel
          summary={quickDispositionInspectionSummary}
          titleId={quickDispositionImportSummaryTitleId}
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

      {!loadError && !hasResults && !hasQuickDispositions ? (
        <section className="local-results-empty">
          <strong>No completed ReviewResults available</strong>
          <p>
            Complete and export a review to save it locally, or import a
            compatible full evidence ReviewResult or quick disposition artifact.
            No EvaluationReport is calculated from quick dispositions.
          </p>
        </section>
      ) : null}

      {!loadError && (hasResults || hasQuickDispositions) ? (
        <>
          <section className="evaluation-report-metrics local-results-metrics">
            <MetricCard
              label="Full evidence ReviewResults"
              value={formatCount(
                snapshot.totalReviewResultCount,
                "result",
                "results",
              )}
              detail="Validated full evidence artifacts available for EvaluationReport aggregation."
            />
            {hasQuickDispositions ? (
              <MetricCard
                label="Quick dispositions"
                value={formatCount(
                  snapshot.totalQuickDispositionCount,
                  "artifact",
                  "artifacts",
                )}
                detail="Early outcomes excluded from full verdict and EvaluationReport metrics."
              />
            ) : null}
            <MetricCard
              label="Package coverage"
              value={formatCount(
                packageResultGroups.length,
                "CasePackage",
                "CasePackages",
              )}
              detail="Different package references remain separate."
            />
            <MetricCard
              label="Compatibility"
              value="Strict"
              detail="Incompatible imports are rejected atomically; duplicate re-imports are harmless no-ops."
            />
          </section>

          {hasResults ? (
            <>
              <section className="evaluation-report-boundary local-results-boundary">
                <strong>Compatible package groups only</strong>
                <p>
                  Multiple compatible ReviewResults means multiple reviewers
                  reviewed the same compatible CasePackage/protocol. These are
                  full evidence ReviewResults; quick dispositions remain
                  separate and never enter the EvaluationReport.
                </p>
              </section>

              <ResultsGalaxyMap
                packageGroups={snapshot.packageGroups}
                availableCasePackages={availableCasePackages}
              />
            </>
          ) : null}

          <div className="local-results-groups">
            {packageResultGroups.map((group) => {
              const casePackage =
                group.fullEvidenceGroup?.report.case_package ??
                group.quickDispositionGroup?.quickDispositions[0]?.case_package;

              if (!casePackage) {
                return null;
              }

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
                        {formatPackageArtifactCoverage(group)}
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
                  {group.fullEvidenceGroup ? (
                    <section className="local-results-full-evidence">
                      <div className="local-results-depth-heading">
                        <p className="eyebrow">Full evidence review</p>
                        <h3>Full evidence verdicts</h3>
                        <p>
                          Only completed full evidence ReviewResults contribute
                          to verdict, evidence-rating, label-winner,
                          EvaluationReport, and refinement outputs.
                        </p>
                      </div>
                      <EvaluationReportResults
                        report={group.fullEvidenceGroup.report}
                        sourceReviewResults={
                          group.fullEvidenceGroup.sourceReviewResults
                        }
                      />
                    </section>
                  ) : (
                    <section className="local-results-no-full">
                      <strong>No full evidence verdicts yet</strong>
                      <p>
                        This package has quick disposition artifacts only. They
                        remain visible below but do not produce an
                        EvaluationReport or refinement output.
                      </p>
                    </section>
                  )}
                  {group.quickDispositionGroup ? (
                    <QuickDispositionResults
                      group={group.quickDispositionGroup}
                    />
                  ) : null}
                </article>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}

function QuickDispositionResults({
  group,
}: {
  group: LocalQuickDispositionGroupV01;
}) {
  const { quickDispositions, summary } = group;

  return (
    <section
      className="local-results-quick-dispositions"
      aria-label="Quick dispositions"
    >
      <div className="local-results-quick-header">
        <div>
          <p className="eyebrow">Quick dispositions</p>
          <h3>
            {formatCount(
              group.dispositionCount,
              "quick disposition artifact",
              "quick disposition artifacts",
            )}
          </h3>
          <p>
            A quick disposition artifact is an early structured outcome. It
            preserves package and reviewer references without evidence ratings,
            label winners, outlier selections, final verdicts, or recommended
            actions.
          </p>
        </div>
      </div>
      <div className="local-results-quick-summary">
        <QuickDispositionCountList
          title="Disposition counts"
          counts={summary.dispositionCounts}
          formatValue={formatDisposition}
        />
        <QuickDispositionCountList
          title="Source stage counts"
          counts={summary.sourceStageCounts}
          formatValue={formatSourceStage}
        />
        <QuickDispositionCountList
          title="Reason code counts"
          counts={summary.reasonCodeCounts}
          formatValue={formatReasonCode}
        />
        <section>
          <h4>Reviewer sessions</h4>
          <strong>
            {formatCount(
              summary.uniqueReviewerSessionCount,
              "reviewer/session",
              "reviewer/sessions",
            )}
          </strong>
          <ul>
            {summary.reviewerSessions.map((reviewerSession) => (
              <li
                key={`${reviewerSession.reviewerId}:${reviewerSession.reviewSessionId}`}
              >
                <span>{reviewerSession.reviewerId}</span>
                <span>{reviewerSession.reviewSessionId}</span>
              </li>
            ))}
          </ul>
        </section>
        {summary.escalationCount > 0 ? (
          <section>
            <h4>Escalation rate</h4>
            <strong>
              {summary.escalationCount} of {group.dispositionCount} (
              {formatPercentage(summary.escalationRate)})
            </strong>
            <p>
              Quick dispositions that requested continuation into a full
              evidence review.
            </p>
          </section>
        ) : null}
      </div>
      <ol className="local-results-quick-list">
        {quickDispositions.map((quickDisposition) => (
          <li key={quickDisposition.disposition_id}>
            <div>
              <span>{formatSourceStage(quickDisposition.source_stage)}</span>
              <strong>{formatDisposition(quickDisposition.disposition)}</strong>
              <p>{quickDisposition.reason_codes.map(formatReasonCode).join(", ")}</p>
            </div>
            <dl>
              <div>
                <dt>Reviewer</dt>
                <dd>{quickDisposition.reviewer.reviewer_id}</dd>
              </div>
              <div>
                <dt>Session</dt>
                <dd>{quickDisposition.reviewer.review_session_id}</dd>
              </div>
              <div>
                <dt>Artifact depth</dt>
                <dd>Quick disposition</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{quickDisposition.created_at}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ol>
    </section>
  );
}

function QuickDispositionCountList<T extends string>({
  title,
  counts,
  formatValue,
}: {
  title: string;
  counts: QuickDispositionInspectionCount[];
  formatValue: (value: T) => string;
}) {
  return (
    <section>
      <h4>{title}</h4>
      <ul>
        {counts.map(({ value, count }) => (
          <li key={value}>
            <span>{formatValue(value as T)}</span>
            <strong>{count}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}

function QuickDispositionImportSummaryPanel({
  summary,
  titleId,
}: {
  summary: QuickDispositionImportInspectionSummaryV01;
  titleId: string;
}) {
  return (
    <section
      className="review-result-import-summary-panel is-inline"
      aria-labelledby={titleId}
    >
      <div className="review-result-import-summary-header">
        <p className="review-result-import-summary-kicker">
          {summary.compatibilitySummary.status}
        </p>
        <h2 id={titleId}>Imported quick disposition artifact</h2>
        <p>{summary.compatibilitySummary.message}</p>
      </div>
      <dl className="review-result-import-summary-facts">
        <div>
          <dt>Artifact depth</dt>
          <dd>Quick disposition artifact</dd>
        </div>
        <div>
          <dt>Artifact schema</dt>
          <dd>{summary.artifactSchemaVersion}</dd>
        </div>
        <div>
          <dt>Reviewer sessions</dt>
          <dd>{summary.uniqueReviewerSessionCount}</dd>
        </div>
        <div>
          <dt>CasePackage IDs</dt>
          <dd>{summary.referencedPackageIds.join(", ")}</dd>
        </div>
        <div>
          <dt>Source stage</dt>
          <dd>
            {summary.sourceStages
              .map((sourceStage) =>
                formatSourceStage(
                  sourceStage as QuickDispositionSourceStageV01,
                ),
              )
              .join(", ")}
          </dd>
        </div>
        <div>
          <dt>Disposition</dt>
          <dd>
            {formatInspectionCounts(
              summary.dispositionDistribution,
              formatDisposition,
            )}
          </dd>
        </div>
        <div>
          <dt>Reason codes</dt>
          <dd>
            {formatInspectionCounts(
              summary.reasonCodeCounts,
              formatReasonCode,
            )}
          </dd>
        </div>
      </dl>
    </section>
  );
}

function getImportStatusCopy(status: ResultsImportStatus): string {
  switch (status.state) {
    case "reading":
      return "Validating a full evidence ReviewResult or quick disposition artifact.";
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
      : result.excludedQuickDispositionCount > 0
        ? `${formatCount(result.excludedQuickDispositionCount, "quick disposition", "quick dispositions")} rejected and excluded from local quick dispositions.`
      : "Bundle rejected. No results were imported or included in aggregation.";

  return `${exclusion} ${result.message}`;
}

function formatDisposition(disposition: QuickDispositionValueV01): string {
  switch (disposition) {
    case "dismiss_not_interesting":
      return "Not interesting / skipped";
    case "save_for_later":
      return "Saved for later";
    case "escalate_to_full_review":
      return "Continue full evidence review";
    case "cannot_judge_from_package":
      return "Cannot judge from this package";
  }
}

function formatSourceStage(sourceStage: QuickDispositionSourceStageV01): string {
  switch (sourceStage) {
    case "landscape":
      return "landscape";
    case "case_file":
      return "case file";
    case "blind_review":
      return "blind review";
    case "evidence_board":
      return "evidence board";
  }
}

function formatReasonCode(reasonCode: QuickDispositionReasonCodeV01): string {
  switch (reasonCode) {
    case "low_validation_value":
      return "low validation value";
    case "needs_later_review":
      return "needs later review";
    case "full_review_requested":
      return "full review requested";
    case "insufficient_package_context":
      return "insufficient package context";
  }
}

function formatCount(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

type LocalResultsPackageGroup = {
  casePackageId: string;
  fullEvidenceGroup?: LocalEvaluationReportGroupV01;
  quickDispositionGroup?: LocalQuickDispositionGroupV01;
};

function mergePackageResultGroups(
  snapshot: LocalEvaluationResultsSnapshotV01,
): LocalResultsPackageGroup[] {
  const groups = new Map<string, LocalResultsPackageGroup>();

  for (const fullEvidenceGroup of snapshot.packageGroups) {
    groups.set(fullEvidenceGroup.casePackageId, {
      casePackageId: fullEvidenceGroup.casePackageId,
      fullEvidenceGroup,
    });
  }

  for (const quickDispositionGroup of snapshot.quickDispositionGroups) {
    const currentGroup = groups.get(quickDispositionGroup.casePackageId);
    groups.set(quickDispositionGroup.casePackageId, {
      ...currentGroup,
      casePackageId: quickDispositionGroup.casePackageId,
      quickDispositionGroup,
    });
  }

  return [...groups.values()].sort((left, right) =>
    left.casePackageId.localeCompare(right.casePackageId),
  );
}

function formatPackageArtifactCoverage(group: LocalResultsPackageGroup) {
  const counts = [];

  if (group.fullEvidenceGroup) {
    counts.push(
      formatCount(
        group.fullEvidenceGroup.reviewResultCount,
        "full evidence ReviewResult",
        "full evidence ReviewResults",
      ),
    );
  }

  if (group.quickDispositionGroup) {
    counts.push(
      formatCount(
        group.quickDispositionGroup.dispositionCount,
        "quick disposition artifact",
        "quick disposition artifacts",
      ),
    );
  }

  return counts.join(" · ");
}

function formatInspectionCounts<T extends string>(
  counts: QuickDispositionInspectionCount[],
  formatValue: (value: T) => string,
) {
  return counts
    .map(({ value, count }) => `${formatValue(value as T)}: ${count}`)
    .join(", ");
}

function formatPercentage(value: number) {
  return `${Number((value * 100).toFixed(1))}%`;
}

function replaceCasePackage(
  currentPackages: ResultsCasePackageMetadataV01[],
  nextPackage: ResultsCasePackageMetadataV01,
): ResultsCasePackageMetadataV01[] {
  const nextPackageKey = getCasePackageListKey(nextPackage);

  return [
    nextPackage,
    ...currentPackages.filter(
      (currentPackage) => getCasePackageListKey(currentPackage) !== nextPackageKey,
    ),
  ];
}

function getCasePackageListKey(
  casePackage: ResultsCasePackageMetadataV01,
): string {
  return getCasePackageSessionReferenceKeyV01(casePackage);
}

function mergeCasePackages(
  basePackages: readonly ResultsCasePackageMetadataV01[],
  cachedPackages: readonly ResultsCasePackageMetadataV01[],
): ResultsCasePackageMetadataV01[] {
  return cachedPackages.reduce(
    (currentPackages, casePackage) =>
      replaceCasePackage(currentPackages, casePackage),
    [...basePackages],
  );
}

function formatMapPackageImportSuccess(
  result: Extract<ResultsMapCasePackageImportV01, { ok: true }>,
): string {
  const coordinates = result.package.cluster.embedding_map?.coordinates;
  const coordinateState = coordinates ? "with coordinates" : "without coordinates";

  return `Imported CasePackage ${result.package.package_id} ${coordinateState} for results mapping.`;
}
