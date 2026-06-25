import assert from "node:assert/strict";
import test from "node:test";

import {
  importLocalEvaluationResultsBundleV01,
  loadLocalEvaluationResultsV01,
} from "@/lib/localEvaluationResultsV01";
import {
  loadQuickDispositionsForCasePackageV01,
  saveQuickDispositionToLocalStoreV01,
} from "@/lib/quickDispositionStorageV01";
import type {
  QuickDispositionReasonCodeV01,
  QuickDispositionSourceStageV01,
  QuickDispositionV01,
  QuickDispositionValueV01,
} from "@/lib/quickDispositionV01";
import {
  createReviewResultBundleV01,
  serializeReviewResultBundleV01,
} from "@/lib/reviewResultBundleV01";
import { saveReviewResultToLocalStoreV01 } from "@/lib/reviewResultStorageV01";
import type { ReviewResultV01 } from "@/lib/reviewResultV01";

test("local evaluation results are empty when no ReviewResults exist", () => {
  const snapshot = loadLocalEvaluationResultsV01(createMemoryStorage());

  assert.deepEqual(snapshot, {
    totalReviewResultCount: 0,
    totalQuickDispositionCount: 0,
    packageGroups: [],
    quickDispositionGroups: [],
  });
});

test("local ReviewResults are aggregated with EvaluationReportV01 logic", () => {
  const storage = createMemoryStorage();
  saveReviewResultToLocalStoreV01(storage, createReviewResult());

  const snapshot = loadLocalEvaluationResultsV01(storage);

  assert.equal(snapshot.totalReviewResultCount, 1);
  assert.equal(snapshot.packageGroups.length, 1);
  const group = snapshot.packageGroups[0];
  assert.ok(group);
  assert.equal(group.casePackageId, "pkg-results-001");
  assert.equal(group.report.schema_version, "evaluation_report.v0.1");
  assert.equal(
    group.report.calculation_version,
    "review_result_aggregation.v0.3",
  );
  assert.equal(group.report.verdict_distribution.supported, 1);
  assert.equal(group.report.evidence_rating_distribution.supports, 1);
  assert.deepEqual(
    group.sourceReviewResults.map((reviewResult) => reviewResult.review_id),
    [
      "review:pkg-results-001:reviewer-a:session-reviewer-a:2026-06-21T12:00:00.000Z",
    ],
  );
});

test("imported ReviewResult bundles are included in local evaluation results", () => {
  const storage = createMemoryStorage();
  const bundle = createReviewResultBundleV01({
    reviewResults: [createReviewResult({ reviewerId: "reviewer-imported" })],
    bundleId: "bundle-results-imported",
    createdAt: "2026-06-21T13:00:00.000Z",
  });

  const result = importLocalEvaluationResultsBundleV01(
    storage,
    serializeReviewResultBundleV01(bundle),
  );

  assert.equal(result.ok, true);
  if (!result.ok) {
    return;
  }
  assert.equal(result.importedReviewResultCount, 1);
  assert.equal(result.snapshot.totalReviewResultCount, 1);
  assert.equal(result.snapshot.packageGroups[0]?.report.reviewer_count, 1);
});

test("single imported ReviewResult JSON is included through the same local results boundary", () => {
  const storage = createMemoryStorage();
  const reviewResult = createReviewResult({ reviewerId: "reviewer-single" });

  const result = importLocalEvaluationResultsBundleV01(
    storage,
    JSON.stringify(reviewResult),
  );

  assert.equal(result.ok, true);
  if (!result.ok) {
    return;
  }
  assert.equal(result.importedReviewResultCount, 1);
  assert.equal(result.inspectionSummary.artifactType, "ReviewResult");
  assert.deepEqual(result.inspectionSummary.referencedPackageIds, [
    "pkg-results-001",
  ]);
  assert.equal(result.snapshot.totalReviewResultCount, 1);
  assert.equal(result.snapshot.packageGroups[0]?.report.reviewer_count, 1);
});

test("quick disposition JSON imports without being aggregated as a ReviewResult", () => {
  const storage = createMemoryStorage();
  const quickDisposition = createQuickDisposition();

  const result = importLocalEvaluationResultsBundleV01(
    storage,
    JSON.stringify(quickDisposition),
  );
  const snapshot = loadLocalEvaluationResultsV01(storage);
  const storedQuickDispositions = loadQuickDispositionsForCasePackageV01(
    storage,
    quickDisposition.case_package.package_id,
  );

  assert.equal(result.ok, true);
  if (!result.ok) {
    return;
  }
  assert.equal(result.outcome, "imported");
  assert.equal(result.importedReviewResultCount, 0);
  assert.equal(result.importedQuickDispositionCount, 1);
  assert.equal(result.inspectionSummary.artifactType, "QuickDisposition");
  assert.equal(snapshot.totalReviewResultCount, 0);
  assert.equal(snapshot.totalQuickDispositionCount, 1);
  assert.deepEqual(storedQuickDispositions, [quickDisposition]);
  assert.deepEqual(snapshot.packageGroups, []);
  assert.deepEqual(snapshot.quickDispositionGroups, [
    {
      casePackageId: quickDisposition.case_package.package_id,
      dispositionCount: 1,
      summary: {
        dispositionCounts: [
          { value: "dismiss_not_interesting", count: 1 },
        ],
        sourceStageCounts: [{ value: "case_file", count: 1 }],
        reasonCodeCounts: [{ value: "low_validation_value", count: 1 }],
        uniqueReviewerSessionCount: 1,
        reviewerSessions: [
          {
            reviewerId: "reviewer-quick",
            reviewSessionId: "session-reviewer-quick",
          },
        ],
        escalationCount: 0,
        escalationRate: 0,
      },
      quickDispositions: [quickDisposition],
    },
  ]);
});

test("quick dispositions do not change full EvaluationReport aggregation", () => {
  const storage = createMemoryStorage();
  const reviewResult = createReviewResult();
  saveReviewResultToLocalStoreV01(storage, reviewResult);
  const fullReviewOnly = loadLocalEvaluationResultsV01(storage);

  saveQuickDispositionToLocalStoreV01(storage, createQuickDisposition());
  const mixedDepth = loadLocalEvaluationResultsV01(storage);

  assert.equal(mixedDepth.totalReviewResultCount, 1);
  assert.equal(mixedDepth.totalQuickDispositionCount, 1);
  assert.deepEqual(mixedDepth.packageGroups, fullReviewOnly.packageGroups);
  assert.deepEqual(
    mixedDepth.packageGroups[0]?.report.verdict_distribution,
    fullReviewOnly.packageGroups[0]?.report.verdict_distribution,
  );
  assert.deepEqual(
    mixedDepth.packageGroups[0]?.report.evidence_rating_distribution,
    fullReviewOnly.packageGroups[0]?.report.evidence_rating_distribution,
  );
  assert.deepEqual(
    mixedDepth.packageGroups[0]?.report.label_winner_distribution,
    fullReviewOnly.packageGroups[0]?.report.label_winner_distribution,
  );
});

test("quick disposition groups summarize disposition, stage, reason, reviewer sessions, and escalation rate", () => {
  const storage = createMemoryStorage();
  const quickDispositions = [
    createQuickDisposition(),
    createQuickDisposition({
      reviewerId: "reviewer-later",
      sourceStage: "blind_review",
      disposition: "save_for_later",
      reasonCodes: ["needs_later_review"],
      createdAt: "2026-06-24T12:10:00.000Z",
    }),
    createQuickDisposition({
      reviewerId: "reviewer-escalated",
      sourceStage: "evidence_board",
      disposition: "escalate_to_full_review",
      reasonCodes: ["full_review_requested"],
      createdAt: "2026-06-24T12:20:00.000Z",
    }),
    createQuickDisposition({
      reviewerId: "reviewer-context",
      sourceStage: "blind_review",
      disposition: "cannot_judge_from_package",
      reasonCodes: [
        "insufficient_package_context",
        "needs_later_review",
      ],
      createdAt: "2026-06-24T12:30:00.000Z",
    }),
  ];

  for (const quickDisposition of quickDispositions) {
    saveQuickDispositionToLocalStoreV01(storage, quickDisposition);
  }

  const snapshot = loadLocalEvaluationResultsV01(storage);
  const group = snapshot.quickDispositionGroups[0];

  assert.ok(group);
  assert.deepEqual(group.summary.dispositionCounts, [
    { value: "cannot_judge_from_package", count: 1 },
    { value: "dismiss_not_interesting", count: 1 },
    { value: "escalate_to_full_review", count: 1 },
    { value: "save_for_later", count: 1 },
  ]);
  assert.deepEqual(group.summary.sourceStageCounts, [
    { value: "blind_review", count: 2 },
    { value: "case_file", count: 1 },
    { value: "evidence_board", count: 1 },
  ]);
  assert.deepEqual(group.summary.reasonCodeCounts, [
    { value: "needs_later_review", count: 2 },
    { value: "full_review_requested", count: 1 },
    { value: "insufficient_package_context", count: 1 },
    { value: "low_validation_value", count: 1 },
  ]);
  assert.equal(group.summary.uniqueReviewerSessionCount, 4);
  assert.equal(group.summary.reviewerSessions.length, 4);
  assert.equal(group.summary.escalationCount, 1);
  assert.equal(group.summary.escalationRate, 0.25);
});

test("incompatible imported results are excluded without contaminating aggregation", () => {
  const storage = createMemoryStorage();
  saveReviewResultToLocalStoreV01(storage, createReviewResult());
  const bundle = createReviewResultBundleV01({
    reviewResults: [
      createReviewResult({
        reviewerId: "reviewer-incompatible",
        pipelineRunId: "run-results-incompatible",
      }),
    ],
    bundleId: "bundle-results-incompatible",
    createdAt: "2026-06-21T13:00:00.000Z",
  });

  const result = importLocalEvaluationResultsBundleV01(
    storage,
    serializeReviewResultBundleV01(bundle),
  );

  assert.equal(result.ok, false);
  if (result.ok) {
    return;
  }
  assert.equal(result.excludedReviewResultCount, 1);
  assert.match(
    result.message,
    /incompatible CasePackage reference.*run_id.*No results were imported/,
  );
  assert.equal(result.snapshot.totalReviewResultCount, 1);
  assert.equal(result.snapshot.packageGroups[0]?.report.reviewer_count, 1);
});

test("duplicate imported ReviewResults are harmless no-ops instead of double counted", () => {
  const storage = createMemoryStorage();
  const reviewResult = createReviewResult();
  saveReviewResultToLocalStoreV01(storage, reviewResult);
  const bundle = createReviewResultBundleV01({
    reviewResults: [reviewResult],
    bundleId: "bundle-results-duplicate",
    createdAt: "2026-06-21T13:00:00.000Z",
  });

  const result = importLocalEvaluationResultsBundleV01(
    storage,
    serializeReviewResultBundleV01(bundle),
  );

  assert.equal(result.ok, true);
  if (!result.ok) {
    return;
  }
  assert.equal(result.outcome, "already_imported");
  assert.equal(result.importedReviewResultCount, 0);
  assert.match(result.message, /already exists locally.*No action is needed/i);
  assert.equal(result.snapshot.totalReviewResultCount, 1);
  assert.equal(result.snapshot.packageGroups[0]?.report.reviewer_count, 1);
});

test("conflicting ReviewResult identity collisions remain rejected", () => {
  const storage = createMemoryStorage();
  const existingReview = createReviewResult();
  saveReviewResultToLocalStoreV01(storage, existingReview);
  const conflictingReview: ReviewResultV01 = {
    ...existingReview,
    decisions: {
      ...existingReview.decisions,
      final_verdict: "uncertain",
      recommended_action: "mark_uncertain",
    },
  };
  const bundle = createReviewResultBundleV01({
    reviewResults: [conflictingReview],
    bundleId: "bundle-results-conflicting-identity",
    createdAt: "2026-06-21T13:00:00.000Z",
  });

  const result = importLocalEvaluationResultsBundleV01(
    storage,
    serializeReviewResultBundleV01(bundle),
  );

  assert.equal(result.ok, false);
  if (result.ok) {
    return;
  }
  assert.match(result.message, /already exists locally.*No results were imported/);
  assert.equal(result.snapshot.packageGroups[0]?.report.verdict_distribution.supported, 1);
  assert.equal(result.snapshot.packageGroups[0]?.report.verdict_distribution.uncertain, 0);
});

test("same reviewer session with a new ReviewResult ID remains rejected", () => {
  const storage = createMemoryStorage();
  const existingReview = createReviewResult();
  saveReviewResultToLocalStoreV01(storage, existingReview);
  const conflictingReview: ReviewResultV01 = {
    ...existingReview,
    review_id: existingReview.review_id.replace(
      existingReview.created_at,
      "2026-06-21T12:30:00.000Z",
    ),
    created_at: "2026-06-21T12:30:00.000Z",
  };
  const bundle = createReviewResultBundleV01({
    reviewResults: [conflictingReview],
    bundleId: "bundle-results-conflicting-session",
    createdAt: "2026-06-21T13:00:00.000Z",
  });

  const result = importLocalEvaluationResultsBundleV01(
    storage,
    serializeReviewResultBundleV01(bundle),
  );

  assert.equal(result.ok, false);
  if (result.ok) {
    return;
  }
  assert.match(result.message, /reviewer\/session.*already has a local result/);
  assert.equal(result.snapshot.totalReviewResultCount, 1);
});

test("a bundle mixing duplicate and new ReviewResults remains an atomic rejection", () => {
  const storage = createMemoryStorage();
  const existingReview = createReviewResult();
  saveReviewResultToLocalStoreV01(storage, existingReview);
  const bundle = createReviewResultBundleV01({
    reviewResults: [
      existingReview,
      createReviewResult({ reviewerId: "reviewer-new" }),
    ],
    bundleId: "bundle-results-mixed-duplicate",
    createdAt: "2026-06-21T13:00:00.000Z",
  });

  const result = importLocalEvaluationResultsBundleV01(
    storage,
    serializeReviewResultBundleV01(bundle),
  );

  assert.equal(result.ok, false);
  if (result.ok) {
    return;
  }
  assert.equal(result.excludedReviewResultCount, 2);
  assert.match(result.message, /already exists locally.*No results were imported/);
  assert.equal(result.snapshot.totalReviewResultCount, 1);
  assert.equal(result.snapshot.packageGroups[0]?.report.reviewer_count, 1);
});

test("ReviewResults for different CasePackages remain separate report groups", () => {
  const storage = createMemoryStorage();
  saveReviewResultToLocalStoreV01(storage, createReviewResult());
  saveReviewResultToLocalStoreV01(
    storage,
    createReviewResult({
      packageId: "pkg-results-002",
      caseId: "case-results-002",
      clusterId: "cluster-results-002",
      reviewerId: "reviewer-package-b",
      pipelineRunId: "run-results-002",
    }),
  );

  const snapshot = loadLocalEvaluationResultsV01(storage);

  assert.equal(snapshot.totalReviewResultCount, 2);
  assert.deepEqual(
    snapshot.packageGroups.map((group) => group.casePackageId),
    ["pkg-results-001", "pkg-results-002"],
  );
  assert.deepEqual(
    snapshot.packageGroups.map((group) => group.report.reviewer_count),
    [1, 1],
  );
});

function createReviewResult({
  packageId = "pkg-results-001",
  caseId = "case-results-001",
  clusterId = "cluster-results-001",
  reviewerId = "reviewer-a",
  pipelineRunId = "run-results-001",
}: {
  packageId?: string;
  caseId?: string;
  clusterId?: string;
  reviewerId?: string;
  pipelineRunId?: string;
} = {}): ReviewResultV01 {
  const createdAt = "2026-06-21T12:00:00.000Z";
  const reviewSessionId = `session-${reviewerId}`;

  return {
    schema_version: "review_result.v0.1",
    review_id: [
      "review",
      packageId,
      reviewerId,
      reviewSessionId,
      createdAt,
    ].join(":"),
    created_at: createdAt,
    case_package: {
      schema_version: "case_package.v0.1",
      package_id: packageId,
      package_revision: "r1",
      case_id: caseId,
      cluster_id: clusterId,
      pipeline: {
        pipeline_id: "pipeline-results",
        run_id: pipelineRunId,
        upstream_tool: "synthetic-results-fixture",
        generated_at: "2026-06-21T11:00:00.000Z",
      },
    },
    reviewer: {
      reviewer_id: reviewerId,
      review_session_id: reviewSessionId,
      context: "synthetic_demo",
    },
    protocol: {
      protocol_version: "telemetry_court_review.v0.1",
      blind_review_enabled: true,
      ai_label_revealed: true,
    },
    decisions: {
      blind_interpretation: {
        option_id: "blind-option-1",
        label: "Synthetic interpretation",
        agrees_with_ai: true,
      },
      label_comparison: {
        selected_label_id: "label-results-a",
        reason_codes: ["better_supported"],
      },
      evidence_ratings: [
        { evidence_id: "evidence-results-1", rating: "supports" },
      ],
      outlier_impostor: {
        selected_session_id: "session-results-1",
      },
      failure_modes: [],
      final_verdict: "supported",
      recommended_action: "accept_label",
    },
  };
}

function createQuickDisposition({
  reviewerId = "reviewer-quick",
  sourceStage = "case_file",
  disposition = "dismiss_not_interesting",
  reasonCodes = ["low_validation_value"],
  createdAt = "2026-06-24T12:00:00.000Z",
}: {
  reviewerId?: string;
  sourceStage?: QuickDispositionSourceStageV01;
  disposition?: QuickDispositionValueV01;
  reasonCodes?: QuickDispositionReasonCodeV01[];
  createdAt?: string;
} = {}): QuickDispositionV01 {
  const reviewSessionId = `session-${reviewerId}`;

  return {
    schema_version: "quick_disposition.v0.1",
    disposition_id: [
      "quick-disposition",
      "pkg-results-001",
      reviewerId,
      reviewSessionId,
      sourceStage,
      createdAt,
    ].join(":"),
    created_at: createdAt,
    case_package: {
      schema_version: "case_package.v0.1",
      package_id: "pkg-results-001",
      package_revision: "r1",
      case_id: "case-results-001",
      cluster_id: "cluster-results-001",
      pipeline: {
        pipeline_id: "pipeline-results",
        run_id: "run-results-001",
        upstream_tool: "synthetic-results-fixture",
        generated_at: "2026-06-21T11:00:00.000Z",
      },
    },
    reviewer: {
      reviewer_id: reviewerId,
      review_session_id: reviewSessionId,
      context: "local_review",
    },
    source_stage: sourceStage,
    disposition,
    reason_codes: reasonCodes,
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
