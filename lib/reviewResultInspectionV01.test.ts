import assert from "node:assert/strict";
import test from "node:test";

import {
  inspectReviewResultBundleV01,
  inspectReviewResultV01,
} from "@/lib/reviewResultInspectionV01";
import type { ReviewResultBundleV01 } from "@/lib/reviewResultBundleV01";
import type { ReviewResultV01 } from "@/lib/reviewResultV01";

test("ReviewResult inspection summarizes a validated single result", () => {
  const review = buildReviewResult({
    reviewId: "review:pkg-inline-001:reviewer-a:session-a:2026-06-23T12:00:00.000Z",
    reviewerId: "reviewer-a",
    sessionId: "session-a",
    verdict: "supported",
    confidence: "high",
    failureModes: ["missing_evidence"],
  });

  const summary = inspectReviewResultV01(review);

  assert.equal(summary.artifactType, "ReviewResult");
  assert.equal(summary.artifactSchemaVersion, "review_result.v0.1");
  assert.equal(summary.resultCount, 1);
  assert.deepEqual(summary.reviewResultSchemaVersions, ["review_result.v0.1"]);
  assert.deepEqual(summary.reviewProtocolVersions, [
    "telemetry_court_review.v0.1",
  ]);
  assert.deepEqual(summary.casePackageSchemaVersions, ["case_package.v0.1"]);
  assert.deepEqual(summary.casePackageReferences, [
    {
      packageId: "pkg-inline-001",
      packageRevision: "rev-a",
      caseId: "case-inline-001",
      clusterId: "cluster-inline-001",
      pipelineRunId: "run-inline-001",
      upstreamTool: "inline-test-generator",
    },
  ]);
  assert.deepEqual(summary.verdictDistribution, [
    { value: "supported", count: 1 },
  ]);
  assert.deepEqual(summary.confidenceSummary, {
    capturedCount: 1,
    missingCount: 0,
    distribution: [{ value: "high", count: 1 }],
  });
  assert.deepEqual(summary.failureModeCounts, [
    { value: "missing_evidence", count: 1 },
  ]);
  assert.equal(summary.compatibilitySummary.status, "compatible");
  assert.match(summary.compatibilitySummary.message, /single validated ReviewResult/);
  assert.deepEqual(summary.warnings, []);
});

test("ReviewResult bundle inspection summarizes validated compatible results", () => {
  const reviewA = buildReviewResult({
    reviewId: "review:pkg-inline-001:reviewer-a:session-a:2026-06-23T12:00:00.000Z",
    reviewerId: "reviewer-a",
    sessionId: "session-a",
    verdict: "supported",
    confidence: "high",
    failureModes: ["missing_evidence", "cluster_seems_mixed"],
  });
  const reviewB = buildReviewResult({
    reviewId: "review:pkg-inline-001:reviewer-b:session-b:2026-06-23T12:05:00.000Z",
    reviewerId: "reviewer-b",
    sessionId: "session-b",
    verdict: "uncertain",
    failureModes: ["missing_evidence"],
  });
  const bundle: ReviewResultBundleV01 = {
    schema_version: "review_result_bundle.v0.1",
    metadata: {
      bundle_id: "bundle-inline-001",
      created_at: "2026-06-23T12:10:00.000Z",
      source_application: "telemetry_court",
      format: "local_json",
      review_result_count: 2,
    },
    compatibility: {
      review_result_schema_version: "review_result.v0.1",
      review_protocol_version: "telemetry_court_review.v0.1",
      case_package_schema_version: "case_package.v0.1",
    },
    review_results: [reviewA, reviewB],
  };

  const summary = inspectReviewResultBundleV01(bundle);

  assert.equal(summary.artifactType, "ReviewResultBundle");
  assert.equal(summary.artifactSchemaVersion, "review_result_bundle.v0.1");
  assert.equal(summary.bundleId, "bundle-inline-001");
  assert.equal(summary.resultCount, 2);
  assert.equal(summary.uniqueReviewerSessionCount, 2);
  assert.deepEqual(summary.referencedPackageIds, ["pkg-inline-001"]);
  assert.deepEqual(summary.referencedCaseIds, ["case-inline-001"]);
  assert.deepEqual(summary.verdictDistribution, [
    { value: "supported", count: 1 },
    { value: "uncertain", count: 1 },
  ]);
  assert.deepEqual(summary.confidenceSummary, {
    capturedCount: 1,
    missingCount: 1,
    distribution: [{ value: "high", count: 1 }],
  });
  assert.deepEqual(summary.failureModeCounts, [
    { value: "missing_evidence", count: 2 },
    { value: "cluster_seems_mixed", count: 1 },
  ]);
  assert.equal(summary.compatibilitySummary.status, "compatible");
  assert.match(
    summary.compatibilitySummary.message,
    /one compatible CasePackage\/protocol\/evidence set/,
  );
  assert.deepEqual(summary.warnings, []);
});

type BuildReviewResultInput = {
  reviewId: string;
  reviewerId: string;
  sessionId: string;
  verdict: ReviewResultV01["decisions"]["final_verdict"];
  confidence?: NonNullable<ReviewResultV01["decisions"]["confidence"]>["level"];
  failureModes: ReviewResultV01["decisions"]["failure_modes"];
};

function buildReviewResult({
  reviewId,
  reviewerId,
  sessionId,
  verdict,
  confidence,
  failureModes,
}: BuildReviewResultInput): ReviewResultV01 {
  return {
    schema_version: "review_result.v0.1",
    review_id: reviewId,
    created_at: "2026-06-23T12:00:00.000Z",
    case_package: {
      schema_version: "case_package.v0.1",
      package_id: "pkg-inline-001",
      package_revision: "rev-a",
      case_id: "case-inline-001",
      cluster_id: "cluster-inline-001",
      pipeline: {
        run_id: "run-inline-001",
        upstream_tool: "inline-test-generator",
        generated_at: "2026-06-23T11:55:00.000Z",
      },
    },
    reviewer: {
      reviewer_id: reviewerId,
      review_session_id: sessionId,
      context: "local_review",
    },
    protocol: {
      protocol_version: "telemetry_court_review.v0.1",
      blind_review_enabled: true,
      ai_label_revealed: true,
    },
    decisions: {
      blind_interpretation: {
        option_id: "blind-inline-001",
        label: "Insufficient evidence",
        agrees_with_ai: false,
      },
      label_comparison: {
        selected_label_id: "label-inline-001",
        reason_codes: ["better_supported"],
      },
      evidence_ratings: [
        { evidence_id: "evidence-inline-001", rating: "supports" },
      ],
      outlier_impostor: {
        selected_session_id: "session-inline-001",
      },
      ...(confidence ? { confidence: { level: confidence } } : {}),
      failure_modes: failureModes,
      final_verdict: verdict,
      recommended_action: verdict === "supported" ? "accept_label" : "mark_uncertain",
    },
  };
}
