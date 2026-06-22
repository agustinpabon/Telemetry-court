import assert from "node:assert/strict";
import test from "node:test";

import { syntheticToponymyStyleCasePackageV01 } from "@/data/syntheticToponymyStyleCasePackageFixture";
import {
  arenaReducer,
  buildArenaReview,
  createInitialArenaState,
  getCurrentReviewState,
  getEvidenceRatings,
  getReviewCompletion,
  getStageCompletionMap,
} from "@/lib/arenaReviewState";
import {
  EVALUATION_REPORT_V01_CALCULATION_VERSION,
  EVALUATION_REPORT_V01_SCHEMA_VERSION,
  aggregateReviewResultsV01,
} from "@/lib/evaluationReportV01";
import {
  getEvaluationReportCsvExportFilenameV01,
  getEvaluationReportJsonExportFilenameV01,
  serializeEvaluationReportCsvV01,
  serializeEvaluationReportJsonV01,
} from "@/lib/evaluationReportExportV01";
import { buildReviewResultExport } from "@/lib/exportReview";
import { importCasePackageV01Json } from "@/lib/importCasePackageV01";
import { importLocalEvaluationResultsBundleV01 } from "@/lib/localEvaluationResultsV01";
import {
  createReviewResultBundleV01,
  importReviewResultBundleV01Json,
  serializeReviewResultBundleV01,
} from "@/lib/reviewResultBundleV01";
import type { ReviewResultV01 } from "@/lib/reviewResultV01";
import type {
  CaseFile,
  CasePackageMetricV01,
  CasePackageV01,
  EvidenceRating,
} from "@/lib/types";

const REVIEW_TIMESTAMP = "2026-06-21T18:10:00.000Z";
const BUNDLE_TIMESTAMP = "2026-06-21T18:12:00.000Z";

test("local Utility Gate smoke: imported CasePackage review exports and aggregates to EvaluationReportV01", () => {
  const externalPackage = createReviewReadyExternalCasePackage();
  const serializedExternalPackage = `${JSON.stringify(externalPackage, null, 2)}\n`;

  assert.equal(serializedExternalPackage.includes("raw_telemetry"), false);
  assert.equal(serializedExternalPackage.includes("restricted_payload"), false);

  const importResult = importCasePackageV01Json(serializedExternalPackage);

  assert.equal(importResult.ok, true);
  if (!importResult.ok) {
    return;
  }

  assert.equal(
    importResult.package.package_id,
    "pkg-synthetic-toponymy-style-access-review-001",
  );
  assert.equal(importResult.package.schema_version, "case_package.v0.1");
  assert.equal(importResult.package.package_revision, "r1");
  assert.equal(
    importResult.package.provenance.source_system,
    "telemetry-court-synthetic-toponymy-style-fixtures",
  );
  assert.equal(
    importResult.package.provenance.source_artifact,
    "data/syntheticToponymyStyleCasePackageFixture.ts",
  );
  assert.equal(importResult.package.sanitization.status, "synthetic");
  assert.equal(importResult.package.sanitization.raw_drilldown_allowed, false);
  assert.equal(
    importResult.caseFile.casePackageReference?.package_id,
    importResult.package.package_id,
  );

  const arenaReview = completeStructuredReviewThroughState(importResult.caseFile);
  const reviewResult = buildReviewResultExport({
    caseFile: importResult.caseFile,
    exportTimestamp: REVIEW_TIMESTAMP,
    arenaReview,
    reviewer: {
      reviewer_id: "reviewer-issue-101-a",
      review_session_id: "session-issue-101-imported-package",
      context: "local_review",
    },
  });

  assert.equal(reviewResult.schema_version, "review_result.v0.1");
  assert.equal(
    reviewResult.protocol.protocol_version,
    "telemetry_court_review.v0.1",
  );
  assert.equal(reviewResult.protocol.blind_review_enabled, true);
  assert.equal(reviewResult.protocol.ai_label_revealed, true);
  assert.deepEqual(reviewResult.case_package, {
    schema_version: "case_package.v0.1",
    package_id: importResult.package.package_id,
    package_revision: "r1",
    case_id: importResult.package.case.case_id,
    cluster_id: importResult.package.cluster.cluster_id,
    pipeline: {
      pipeline_id: "pipeline-synthetic-toponymy-style-fixture",
      run_id: "run-synthetic-toponymy-style-2026-06-21",
      upstream_tool: "synthetic-toponymy-style-fixture",
      pipeline_version: "0.1.0",
      clustering_method: "synthetic-precomputed-cluster-map",
      dimensionality_reduction_method: "synthetic-2d-map",
      prompt_id: "prompt-synthetic-toponymy-style-fixture-v1",
      generated_at: "2026-06-21T11:58:00.000Z",
    },
  });
  assert.deepEqual(
    reviewResult.decisions.evidence_ratings.map((rating) => rating.evidence_id),
    importResult.package.evidence_items.map((evidence) => evidence.evidence_id),
  );

  const bundle = createReviewResultBundleV01({
    reviewResults: [reviewResult],
    bundleId: "bundle-issue-101-imported-package-smoke",
    createdAt: BUNDLE_TIMESTAMP,
  });
  const serializedBundle = serializeReviewResultBundleV01(bundle);
  const bundleImport = importReviewResultBundleV01Json(serializedBundle);

  assert.equal(bundleImport.ok, true);
  if (!bundleImport.ok) {
    return;
  }
  assert.deepEqual(bundleImport.bundle.review_results, [reviewResult]);

  const storage = createMemoryStorage();
  const localImport = importLocalEvaluationResultsBundleV01(
    storage,
    serializedBundle,
  );

  assert.equal(localImport.ok, true);
  if (!localImport.ok) {
    return;
  }
  assert.equal(localImport.importedReviewResultCount, 1);
  assert.equal(localImport.snapshot.totalReviewResultCount, 1);
  assert.equal(localImport.snapshot.packageGroups.length, 1);
  assert.equal(
    localImport.snapshot.packageGroups[0]?.casePackageId,
    importResult.package.package_id,
  );

  const report = localImport.snapshot.packageGroups[0]?.report;
  assert.ok(report);
  assert.deepEqual(
    report,
    aggregateReviewResultsV01(bundleImport.bundle.review_results),
  );
  assert.equal(report.schema_version, EVALUATION_REPORT_V01_SCHEMA_VERSION);
  assert.equal(
    report.calculation_version,
    EVALUATION_REPORT_V01_CALCULATION_VERSION,
  );
  assert.deepEqual(report.case_package, reviewResult.case_package);
  assert.deepEqual(report.source_review_ids, [reviewResult.review_id]);
  assert.equal(report.reviewer_count, 1);
  assert.equal(report.verdict_distribution.partially_supported, 1);
  assert.equal(report.recommended_action_distribution.narrow_label, 1);
  assert.deepEqual(report.label_winner_distribution, [
    { label_id: "label-synthetic-routine-maintenance", count: 1 },
  ]);
  assert.equal(report.evidence_rating_distribution.supports, 1);
  assert.equal(report.evidence_rating_distribution.weak_support, 1);
  assert.equal(report.evidence_rating_distribution.needs_more_context, 1);
  assert.deepEqual(report.failure_mode_counts, [
    { failure_mode: "missing_evidence", count: 1 },
    { failure_mode: "preserves_uncertainty", count: 1 },
  ]);
  assert.deepEqual(
    report.reviewer_agreement.evidence_ratings.map(
      (evidence) => evidence.evidence_id,
    ),
    [
      "evidence-synthetic-access-map-summary",
      "evidence-synthetic-maintenance-window",
      "evidence-synthetic-neighbor-comparison",
    ],
  );
  assert.deepEqual(
    findComparisonRollupValue(report, "package_id"),
    importResult.package.package_id,
  );
  assert.deepEqual(
    findComparisonRollupValue(report, "pipeline_run_id"),
    importResult.package.pipeline.run_id,
  );

  const serializedReportJson = serializeEvaluationReportJsonV01(report);
  const serializedReportCsv = serializeEvaluationReportCsvV01(report);
  const exportedReport = JSON.parse(serializedReportJson) as typeof report;

  assert.equal(
    getEvaluationReportJsonExportFilenameV01(report),
    "case-synthetic-toponymy-style-access-review-001-evaluation-report.json",
  );
  assert.equal(
    getEvaluationReportCsvExportFilenameV01(report),
    "case-synthetic-toponymy-style-access-review-001-evaluation-report.csv",
  );
  assert.deepEqual(exportedReport.source_review_ids, [reviewResult.review_id]);
  assert.equal(exportedReport.case_package.package_id, externalPackage.package_id);
  assert.match(serializedReportCsv, /source_review_ids/);
  assert.match(serializedReportCsv, /reviewer_count/);
  assert.match(
    serializedReportCsv,
    /pkg-synthetic-toponymy-style-access-review-001/,
  );
  assert.equal(serializedReportJson.includes("raw_telemetry"), false);
  assert.equal(serializedReportCsv.includes("raw_telemetry"), false);
});

test("local Utility Gate guard rejects incompatible protocol before aggregation can be contaminated", () => {
  const { reviewResult } = createImportedPackageReviewResult();
  const storage = createMemoryStorage();
  const acceptedBundle = createReviewResultBundleV01({
    reviewResults: [reviewResult],
    bundleId: "bundle-issue-101-accepted",
    createdAt: BUNDLE_TIMESTAMP,
  });
  const acceptedImport = importLocalEvaluationResultsBundleV01(
    storage,
    serializeReviewResultBundleV01(acceptedBundle),
  );
  assert.equal(acceptedImport.ok, true);

  const incompatibleProtocolReview = withReviewer(
    reviewResult,
    "reviewer-issue-101-incompatible",
    "session-issue-101-incompatible-protocol",
    "2026-06-21T18:14:00.000Z",
  );
  incompatibleProtocolReview.protocol = {
    ...incompatibleProtocolReview.protocol,
    protocol_version:
      "telemetry_court_review.v9" as ReviewResultV01["protocol"]["protocol_version"],
  };
  const forgedBundle = {
    ...acceptedBundle,
    metadata: {
      ...acceptedBundle.metadata,
      bundle_id: "bundle-issue-101-incompatible-protocol",
      review_result_count: 1,
    },
    review_results: [incompatibleProtocolReview],
  };

  const rejectedImport = importLocalEvaluationResultsBundleV01(
    storage,
    `${JSON.stringify(forgedBundle, null, 2)}\n`,
  );

  assert.equal(rejectedImport.ok, false);
  if (rejectedImport.ok) {
    return;
  }
  assert.match(rejectedImport.message, /protocol\.protocol_version/);
  assert.match(
    rejectedImport.message,
    /must equal "telemetry_court_review\.v0\.1"/,
  );
  assert.equal(rejectedImport.snapshot.totalReviewResultCount, 1);
  assert.equal(
    rejectedImport.snapshot.packageGroups[0]?.report.reviewer_count,
    1,
  );
  assert.deepEqual(
    rejectedImport.snapshot.packageGroups[0]?.report.source_review_ids,
    [reviewResult.review_id],
  );
  assert.throws(
    () => aggregateReviewResultsV01([reviewResult, incompatibleProtocolReview]),
    /unsupported review protocol version/,
  );
});

function createImportedPackageReviewResult(): {
  caseFile: CaseFile;
  reviewResult: ReviewResultV01;
} {
  const importResult = importCasePackageV01Json(
    JSON.stringify(createReviewReadyExternalCasePackage()),
  );

  assert.equal(importResult.ok, true);
  if (!importResult.ok) {
    throw new Error("Expected review-ready external CasePackage fixture.");
  }

  return {
    caseFile: importResult.caseFile,
    reviewResult: buildReviewResultExport({
      caseFile: importResult.caseFile,
      exportTimestamp: REVIEW_TIMESTAMP,
      arenaReview: completeStructuredReviewThroughState(importResult.caseFile),
      reviewer: {
        reviewer_id: "reviewer-issue-101-a",
        review_session_id: "session-issue-101-imported-package",
        context: "local_review",
      },
    }),
  };
}

function createReviewReadyExternalCasePackage(): CasePackageV01 {
  const externalPackage = JSON.parse(
    JSON.stringify(syntheticToponymyStyleCasePackageV01),
  ) as CasePackageV01;

  externalPackage.candidate_labels = externalPackage.candidate_labels.map(
    (label) => ({
      ...label,
      confidence:
        label.confidence?.status === "available"
          ? label.confidence
          : availableMetric(0.47, "contextual"),
    }),
  );
  externalPackage.metrics = {
    ...externalPackage.metrics,
    model_agreement: availableMetric(0.44, "contextual"),
    uncertainty: availableMetric(0.38, "lower_is_better"),
  };

  return externalPackage;
}

function completeStructuredReviewThroughState(caseFile: CaseFile) {
  const cases = [caseFile];
  let state = arenaReducer(
    createInitialArenaState(cases),
    { type: "startImportedCaseReview", caseId: caseFile.id },
    cases,
  );
  const blindChoice = caseFile.blindInterpretationOptions.find(
    (option) => option.id === "blind-label-synthetic-routine-maintenance",
  );
  const labelWinner = caseFile.candidateLabels.find(
    (label) => label.id === "label-synthetic-routine-maintenance",
  );
  const selectedSession =
    caseFile.representativeSessions.find(
      (session) => session.id === "session-synthetic-access-004",
    ) ?? caseFile.representativeSessions[0];

  assert.ok(blindChoice);
  assert.ok(labelWinner);
  assert.ok(selectedSession);

  state = arenaReducer(
    state,
    { type: "chooseBlindInterpretation", optionId: blindChoice.id },
    cases,
  );
  state = arenaReducer(state, { type: "revealAiLabel" }, cases);

  for (const [evidenceId, rating] of Object.entries({
    "evidence-synthetic-access-map-summary": "supports_label",
    "evidence-synthetic-maintenance-window": "weak_support",
    "evidence-synthetic-neighbor-comparison": "needs_context",
  } satisfies Record<string, EvidenceRating>)) {
    state = arenaReducer(
      state,
      { type: "classifyEvidence", evidenceId, rating },
      cases,
    );
  }

  state = arenaReducer(
    state,
    { type: "selectLabelDuelWinner", candidateId: labelWinner.id },
    cases,
  );
  state = arenaReducer(
    state,
    { type: "toggleDuelReason", reason: "less_overclaimed" },
    cases,
  );
  state = arenaReducer(
    state,
    { type: "toggleDuelReason", reason: "preserves_uncertainty" },
    cases,
  );
  state = arenaReducer(
    state,
    { type: "selectImpostorSession", sessionId: selectedSession.id },
    cases,
  );
  state = arenaReducer(
    state,
    { type: "toggleFailureMode", reason: "missing_evidence" },
    cases,
  );
  state = arenaReducer(
    state,
    { type: "toggleFailureMode", reason: "preserves_uncertainty" },
    cases,
  );
  state = arenaReducer(
    state,
    { type: "selectVerdict", verdict: "partially_supported" },
    cases,
  );

  const reviewState = getCurrentReviewState(state);
  const evidenceRatings = getEvidenceRatings(caseFile, reviewState);

  assert.equal(getReviewCompletion(reviewState, evidenceRatings, caseFile), 6);
  assert.deepEqual(getStageCompletionMap(caseFile, reviewState, evidenceRatings), {
    landscape: true,
    case_file: true,
    blind_read: true,
    ai_reveal: true,
    evidence_board: true,
    label_duel: true,
    impostor: true,
    verdict: true,
  });

  return buildArenaReview(caseFile, reviewState, evidenceRatings);
}

function availableMetric(
  value: number,
  interpretation: Extract<
    CasePackageMetricV01,
    { status: "available" }
  >["interpretation"] = "higher_is_better",
): CasePackageMetricV01 {
  return {
    status: "available",
    value,
    min: 0,
    max: 1,
    interpretation,
    method: "synthetic issue #101 smoke-test readiness value",
  };
}

function findComparisonRollupValue(
  report: ReturnType<typeof aggregateReviewResultsV01>,
  dimension: "package_id" | "pipeline_run_id",
): string {
  const rollup = report.comparison_rollups.find(
    (candidate) => candidate.dimension === dimension,
  );

  assert.ok(rollup);
  assert.equal(rollup.status, "available");
  assert.equal(rollup.groups.length, 1);
  return rollup.groups[0]?.value ?? "";
}

function withReviewer(
  reviewResult: ReviewResultV01,
  reviewerId: string,
  reviewSessionId: string,
  createdAt: string,
): ReviewResultV01 {
  return {
    ...reviewResult,
    review_id: [
      "review",
      reviewResult.case_package.package_id,
      reviewerId,
      reviewSessionId,
      createdAt,
    ].join(":"),
    created_at: createdAt,
    reviewer: {
      reviewer_id: reviewerId,
      review_session_id: reviewSessionId,
      context: "local_review",
    },
  };
}

function createMemoryStorage() {
  const values = new Map<string, string>();

  return {
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
  };
}
