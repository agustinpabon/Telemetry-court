import assert from "node:assert/strict";
import test from "node:test";

import {
  importLocalEvaluationResultsBundleV01,
  loadLocalEvaluationResultsV01,
} from "@/lib/localEvaluationResultsV01";
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
    packageGroups: [],
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

test("duplicate imported ReviewResults are rejected instead of double counted", () => {
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

  assert.equal(result.ok, false);
  if (result.ok) {
    return;
  }
  assert.equal(result.excludedReviewResultCount, 1);
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
