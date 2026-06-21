import assert from "node:assert/strict";
import test from "node:test";

import { aggregateReviewResultsV01 } from "@/lib/evaluationReportV01";
import type { ReviewResultV01 } from "@/lib/reviewResultV01";

function createReviewResult({
  reviewId = "review-a",
  reviewerId = "reviewer-a",
  selectedLabelId = "label-a",
  evidenceTwoRating = "supports",
  failureModes = [],
  finalVerdict = "supported",
  recommendedAction = "accept_label",
}: {
  reviewId?: string;
  reviewerId?: string;
  selectedLabelId?: string;
  evidenceTwoRating?: ReviewResultV01["decisions"]["evidence_ratings"][number]["rating"];
  failureModes?: ReviewResultV01["decisions"]["failure_modes"];
  finalVerdict?: ReviewResultV01["decisions"]["final_verdict"];
  recommendedAction?: ReviewResultV01["decisions"]["recommended_action"];
} = {}): ReviewResultV01 {
  return {
    schema_version: "review_result.v0.1",
    review_id: reviewId,
    created_at: "2026-06-21T12:00:00.000Z",
    case_package: {
      schema_version: "case_package.v0.1",
      package_id: "pkg-synthetic-evaluation-001",
      package_revision: "r1",
      case_id: "case-synthetic-evaluation-001",
      cluster_id: "cluster-synthetic-evaluation-001",
      pipeline: {
        pipeline_id: "pipeline-synthetic-evaluation",
        run_id: "run-synthetic-evaluation-001",
        upstream_tool: "synthetic-evaluation-fixture",
        generated_at: "2026-06-21T11:00:00.000Z",
      },
    },
    reviewer: {
      reviewer_id: reviewerId,
      review_session_id: `session-${reviewerId}`,
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
        agrees_with_ai: false,
      },
      label_comparison: {
        selected_label_id: selectedLabelId,
        reason_codes: ["better_supported"],
      },
      evidence_ratings: [
        { evidence_id: "evidence-1", rating: "supports" },
        { evidence_id: "evidence-2", rating: evidenceTwoRating },
      ],
      outlier_impostor: {
        selected_session_id: "session-outlier-1",
      },
      failure_modes: failureModes,
      final_verdict: finalVerdict,
      recommended_action: recommendedAction,
    },
  };
}

test("compatible reviews aggregate deterministic counts and disagreement", () => {
  const reviewA = createReviewResult({
    evidenceTwoRating: "contradicts",
    failureModes: ["missing_evidence"],
    finalVerdict: "unsupported_or_overclaimed",
    recommendedAction: "rename_label",
  });
  const reviewB = createReviewResult({
    reviewId: "review-b",
    reviewerId: "reviewer-b",
    selectedLabelId: "label-b",
    evidenceTwoRating: "insufficient",
    failureModes: ["missing_evidence", "too_broad"],
    finalVerdict: "supported",
    recommendedAction: "accept_label",
  });

  const report = aggregateReviewResultsV01([reviewA, reviewB]);

  assert.deepEqual(report, {
    schema_version: "evaluation_report.v0.1",
    calculation_version: "review_result_aggregation.v0.1",
    case_package: reviewA.case_package,
    source_review_ids: ["review-a", "review-b"],
    reviewer_count: 2,
    verdict_distribution: {
      supported: 1,
      partially_supported: 0,
      unsupported_or_overclaimed: 1,
      uncertain: 0,
      cluster_impure: 0,
      needs_split: 0,
      needs_merge: 0,
      needs_better_evidence: 0,
    },
    recommended_action_distribution: {
      accept_label: 1,
      rename_label: 1,
      broaden_label: 0,
      narrow_label: 0,
      split_cluster: 0,
      merge_cluster: 0,
      collect_more_evidence: 0,
      rerun_prompt: 0,
      rerun_embedding: 0,
      mark_uncertain: 0,
    },
    label_winner_distribution: [
      { label_id: "label-a", count: 1 },
      { label_id: "label-b", count: 1 },
    ],
    evidence_rating_distribution: {
      supports: 2,
      weak_support: 0,
      irrelevant: 0,
      contradicts: 1,
      insufficient: 1,
      needs_more_context: 0,
    },
    failure_mode_counts: [
      { failure_mode: "missing_evidence", count: 2 },
      { failure_mode: "too_broad", count: 1 },
    ],
    disagreement: {
      has_any_disagreement: true,
      verdict: true,
      recommended_action: true,
      label_winner: true,
      evidence_ratings: true,
      evidence_ids: ["evidence-2"],
    },
  });
  assert.deepEqual(aggregateReviewResultsV01([reviewB, reviewA]), report);
});

test("aggregation rejects an empty ReviewResult list", () => {
  assert.throws(
    () => aggregateReviewResultsV01([]),
    /without ReviewResult inputs/,
  );
});

test("a single compatible review reports no disagreement", () => {
  const review = createReviewResult();

  assert.deepEqual(aggregateReviewResultsV01([review]).disagreement, {
    has_any_disagreement: false,
    verdict: false,
    recommended_action: false,
    label_winner: false,
    evidence_ratings: false,
    evidence_ids: [],
  });
});

test("aggregation rejects mixed CasePackage IDs", () => {
  const reviewA = createReviewResult();
  const reviewB: ReviewResultV01 = {
    ...createReviewResult({
      reviewId: "review-b",
      reviewerId: "reviewer-b",
    }),
    case_package: {
      ...reviewA.case_package,
      package_id: "pkg-synthetic-evaluation-002",
    },
  };

  assert.throws(
    () => aggregateReviewResultsV01([reviewA, reviewB]),
    /mixed CasePackage IDs/,
  );
});

test("aggregation rejects mixed CasePackage schema versions", () => {
  const reviewA = createReviewResult();
  const reviewB = {
    ...createReviewResult({
      reviewId: "review-b",
      reviewerId: "reviewer-b",
    }),
    case_package: {
      ...reviewA.case_package,
      schema_version: "case_package.v0.2",
    },
  } as unknown as ReviewResultV01;

  assert.throws(
    () => aggregateReviewResultsV01([reviewA, reviewB]),
    /mixed CasePackage schema versions/,
  );
});

test("aggregation rejects unsupported ReviewResult schema versions", () => {
  const review = {
    ...createReviewResult(),
    schema_version: "review_result.v0.2",
  } as unknown as ReviewResultV01;

  assert.throws(
    () => aggregateReviewResultsV01([review]),
    /unsupported ReviewResult schema version "review_result.v0.2"/,
  );
});

test("aggregation rejects missing required reviewer metadata", () => {
  const review = createReviewResult({
    reviewerId: "",
  });

  assert.throws(
    () => aggregateReviewResultsV01([review]),
    /without reviewer ID/,
  );
});

test("aggregation rejects mixed revisions of the same CasePackage", () => {
  const reviewA = createReviewResult();
  const reviewB: ReviewResultV01 = {
    ...createReviewResult({
      reviewId: "review-b",
      reviewerId: "reviewer-b",
    }),
    case_package: {
      ...reviewA.case_package,
      package_revision: "r2",
    },
  };

  assert.throws(
    () => aggregateReviewResultsV01([reviewA, reviewB]),
    /mixed CasePackage revisions/,
  );
});
