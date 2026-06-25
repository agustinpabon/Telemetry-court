import assert from "node:assert/strict";
import test from "node:test";

import { sampleCases } from "@/data/sampleCases";
import { buildQuickDispositionExportV01 } from "@/lib/quickDispositionV01";
import { importReviewArtifactV01Json } from "@/lib/reviewArtifactImportV01";
import type { ReviewResultV01 } from "@/lib/reviewResultV01";

test("review artifact import accepts quick disposition artifacts explicitly", () => {
  const quickDisposition = buildQuickDispositionExportV01({
    caseFile: sampleCases[0],
    exportTimestamp: "2026-06-24T12:00:00.000Z",
    sourceStage: "case_file",
    disposition: "dismiss_not_interesting",
    reasonCodes: ["low_validation_value"],
  });
  const result = importReviewArtifactV01Json(JSON.stringify(quickDisposition));

  assert.equal(result.ok, true);
  if (!result.ok) {
    return;
  }

  assert.equal(result.artifactType, "QuickDisposition");
  assert.deepEqual(result.quickDisposition, quickDisposition);
  assert.equal(result.inspectionSummary.artifactType, "QuickDisposition");
  assert.equal(result.inspectionSummary.resultCount, 1);
  assert.deepEqual(result.inspectionSummary.referencedPackageIds, [
    "pkg-synthetic-arena-001",
  ]);
  assert.deepEqual(result.inspectionSummary.dispositionDistribution, [
    { value: "dismiss_not_interesting", count: 1 },
  ]);
});

test("review artifact import keeps full ReviewResult imports as ReviewResult artifacts", () => {
  const review = buildReviewResult();
  const result = importReviewArtifactV01Json(JSON.stringify(review));

  assert.equal(result.ok, true);
  if (!result.ok) {
    return;
  }

  assert.equal(result.artifactType, "ReviewResult");
  assert.equal(result.bundle.review_results.length, 1);
  assert.deepEqual(result.bundle.review_results, [review]);
  assert.equal(result.inspectionSummary.artifactType, "ReviewResult");
});

test("review artifact import rejects invalid quick disposition artifacts loudly", () => {
  const quickDisposition = buildQuickDispositionExportV01({
    caseFile: sampleCases[0],
    exportTimestamp: "2026-06-24T12:00:00.000Z",
    sourceStage: "case_file",
    disposition: "save_for_later",
    reasonCodes: ["needs_later_review"],
  });
  const result = importReviewArtifactV01Json(
    JSON.stringify({
      ...quickDisposition,
      reason_codes: ["not-a-supported-reason"],
    }),
  );

  assert.equal(result.ok, false);
  if (result.ok) {
    return;
  }

  assert.equal(result.reason, "invalid_quick_disposition");
  assert.match(result.message, /Invalid QuickDisposition/);
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
