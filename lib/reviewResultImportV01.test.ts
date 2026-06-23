import assert from "node:assert/strict";
import test from "node:test";

import { importReviewResultArtifactV01Json } from "@/lib/reviewResultImportV01";
import type { ReviewResultBundleV01 } from "@/lib/reviewResultBundleV01";
import type { ReviewResultV01 } from "@/lib/reviewResultV01";

test("ReviewResult artifact import accepts a validated single ReviewResult", () => {
  const review = buildReviewResult();
  const result = importReviewResultArtifactV01Json(JSON.stringify(review));

  assert.equal(result.ok, true);
  if (!result.ok) {
    return;
  }

  assert.equal(result.artifactType, "ReviewResult");
  assert.equal(result.bundle.review_results.length, 1);
  assert.deepEqual(result.bundle.review_results, [review]);
  assert.equal(result.inspectionSummary.artifactType, "ReviewResult");
  assert.equal(result.inspectionSummary.resultCount, 1);
  assert.deepEqual(result.inspectionSummary.referencedPackageIds, [
    "pkg-inline-import-001",
  ]);
});

test("ReviewResult artifact import accepts an existing ReviewResult bundle", () => {
  const review = buildReviewResult();
  const bundle: ReviewResultBundleV01 = {
    schema_version: "review_result_bundle.v0.1",
    metadata: {
      bundle_id: "bundle-inline-import-001",
      created_at: "2026-06-23T12:10:00.000Z",
      source_application: "telemetry_court",
      format: "local_json",
      review_result_count: 1,
    },
    compatibility: {
      review_result_schema_version: "review_result.v0.1",
      review_protocol_version: "telemetry_court_review.v0.1",
      case_package_schema_version: "case_package.v0.1",
    },
    review_results: [review],
  };
  const result = importReviewResultArtifactV01Json(JSON.stringify(bundle));

  assert.equal(result.ok, true);
  if (!result.ok) {
    return;
  }

  assert.equal(result.artifactType, "ReviewResultBundle");
  assert.deepEqual(result.bundle, bundle);
  assert.equal(result.inspectionSummary.artifactType, "ReviewResultBundle");
  assert.equal(result.inspectionSummary.bundleId, "bundle-inline-import-001");
});

test("ReviewResult artifact import keeps invalid bundle failures loud", () => {
  const result = importReviewResultArtifactV01Json(
    JSON.stringify({
      schema_version: "review_result_bundle.v0.1",
      metadata: {},
      compatibility: {},
      review_results: [],
    }),
  );

  assert.deepEqual(result, {
    ok: false,
    reason: "invalid_bundle",
    message: "ReviewResult bundle must contain at least one ReviewResult artifact.",
  });
});

function buildReviewResult(): ReviewResultV01 {
  return {
    schema_version: "review_result.v0.1",
    review_id:
      "review:pkg-inline-import-001:reviewer-a:session-a:2026-06-23T12:00:00.000Z",
    created_at: "2026-06-23T12:00:00.000Z",
    case_package: {
      schema_version: "case_package.v0.1",
      package_id: "pkg-inline-import-001",
      case_id: "case-inline-import-001",
      cluster_id: "cluster-inline-import-001",
      pipeline: {
        run_id: "run-inline-import-001",
        upstream_tool: "inline-test-generator",
        generated_at: "2026-06-23T11:55:00.000Z",
      },
    },
    reviewer: {
      reviewer_id: "reviewer-a",
      review_session_id: "session-a",
      context: "local_review",
    },
    protocol: {
      protocol_version: "telemetry_court_review.v0.1",
      blind_review_enabled: true,
      ai_label_revealed: true,
    },
    decisions: {
      blind_interpretation: {
        option_id: "blind-inline-import-001",
        label: "Insufficient evidence",
        agrees_with_ai: false,
      },
      label_comparison: {
        selected_label_id: "label-inline-import-001",
        reason_codes: ["better_supported"],
      },
      evidence_ratings: [
        { evidence_id: "evidence-inline-import-001", rating: "supports" },
      ],
      outlier_impostor: {
        selected_session_id: "session-inline-import-001",
      },
      failure_modes: ["missing_evidence"],
      final_verdict: "supported",
      recommended_action: "accept_label",
    },
  };
}
