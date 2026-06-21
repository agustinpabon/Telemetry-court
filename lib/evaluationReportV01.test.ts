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
  const {
    comparison_rollups: comparisonRollups,
    reviewer_agreement: _reviewerAgreement,
    ...baseReport
  } = report;

  assert.deepEqual(baseReport, {
    schema_version: "evaluation_report.v0.1",
    calculation_version: "review_result_aggregation.v0.3",
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
  assert.equal(comparisonRollups.length > 0, true);
  assert.deepEqual(aggregateReviewResultsV01([reviewB, reviewA]), report);

  assert.equal(report.verdict_distribution.cluster_impure, 0);
  assert.equal(report.verdict_distribution.needs_split, 0);
  assert.equal(report.verdict_distribution.needs_merge, 0);
  assert.equal(report.recommended_action_distribution.split_cluster, 0);
  assert.equal(report.recommended_action_distribution.merge_cluster, 0);
  assert.equal(report.recommended_action_distribution.collect_more_evidence, 0);
  assert.equal(_reviewerAgreement.verdict.unanimous, false);
  assert.deepEqual(_reviewerAgreement.verdict.values, [
    { value: "supported", review_count: 1 },
    { value: "unsupported_or_overclaimed", review_count: 1 },
  ]);
  assert.equal(_reviewerAgreement.label_winner.unanimous, false);
});

test("comparison rollups group reviewer signals by selected label ID", () => {
  const report = aggregateReviewResultsV01([
    createReviewResult({
      reviewId: "review-z",
      reviewerId: "reviewer-z",
      selectedLabelId: "label-z",
      evidenceTwoRating: "contradicts",
      finalVerdict: "unsupported_or_overclaimed",
      recommendedAction: "rename_label",
    }),
    createReviewResult(),
  ]);

  assert.deepEqual(report.comparison_rollups[0], {
    dimension: "selected_label_id",
    status: "available",
    missing_review_count: 0,
    groups: [
      {
        value: "label-a",
        review_count: 1,
        evidence_decision_count: 2,
        verdict_distribution: {
          supported: 1,
          partially_supported: 0,
          unsupported_or_overclaimed: 0,
          uncertain: 0,
          cluster_impure: 0,
          needs_split: 0,
          needs_merge: 0,
          needs_better_evidence: 0,
        },
        evidence_rating_distribution: {
          supports: 2,
          weak_support: 0,
          irrelevant: 0,
          contradicts: 0,
          insufficient: 0,
          needs_more_context: 0,
        },
      },
      {
        value: "label-z",
        review_count: 1,
        evidence_decision_count: 2,
        verdict_distribution: {
          supported: 0,
          partially_supported: 0,
          unsupported_or_overclaimed: 1,
          uncertain: 0,
          cluster_impure: 0,
          needs_split: 0,
          needs_merge: 0,
          needs_better_evidence: 0,
        },
        evidence_rating_distribution: {
          supports: 1,
          weak_support: 0,
          irrelevant: 0,
          contradicts: 1,
          insufficient: 0,
          needs_more_context: 0,
        },
      },
    ],
  });
});

test("comparison rollups preserve available compact package metadata in stable order", () => {
  const review = createReviewResult();
  const reviewWithMetadata: ReviewResultV01 = {
    ...review,
    case_package: {
      ...review.case_package,
      pipeline: {
        ...review.case_package.pipeline,
        pipeline_version: "pipeline-v2",
        embedding_model: "synthetic-embedding-b",
        clustering_method: "synthetic-clustering-a",
        dimensionality_reduction_method: "synthetic-projection-a",
        naming_model: "synthetic-naming-model-b",
        prompt_id: "prompt-b",
        prompt_version: "2",
        prompt_digest: "sha256:synthetic-b",
      },
    },
  };

  const report = aggregateReviewResultsV01([reviewWithMetadata]);

  assert.deepEqual(
    report.comparison_rollups.map((rollup) => rollup.dimension),
    [
      "selected_label_id",
      "package_id",
      "package_revision",
      "pipeline_id",
      "pipeline_run_id",
      "upstream_tool",
      "pipeline_version",
      "embedding_model",
      "clustering_method",
      "dimensionality_reduction_method",
      "naming_model",
      "prompt_id",
      "prompt_version",
      "prompt_digest",
    ],
  );
  assert.deepEqual(
    report.comparison_rollups.find(
      (rollup) => rollup.dimension === "embedding_model",
    ),
    {
      dimension: "embedding_model",
      status: "available",
      missing_review_count: 0,
      groups: [
        {
          value: "synthetic-embedding-b",
          review_count: 1,
          evidence_decision_count: 2,
          verdict_distribution: {
            supported: 1,
            partially_supported: 0,
            unsupported_or_overclaimed: 0,
            uncertain: 0,
            cluster_impure: 0,
            needs_split: 0,
            needs_merge: 0,
            needs_better_evidence: 0,
          },
          evidence_rating_distribution: {
            supports: 2,
            weak_support: 0,
            irrelevant: 0,
            contradicts: 0,
            insufficient: 0,
            needs_more_context: 0,
          },
        },
      ],
    },
  );
});

test("comparison rollups report missing compact package metadata explicitly", () => {
  const report = aggregateReviewResultsV01([
    createReviewResult(),
    createReviewResult({ reviewId: "review-b", reviewerId: "reviewer-b" }),
  ]);

  for (const dimension of [
    "pipeline_version",
    "embedding_model",
    "clustering_method",
    "dimensionality_reduction_method",
    "naming_model",
    "prompt_id",
    "prompt_version",
    "prompt_digest",
  ]) {
    assert.deepEqual(
      report.comparison_rollups.find(
        (rollup) => rollup.dimension === dimension,
      ),
      {
        dimension,
        status: "unavailable",
        reason: `Metadata "${dimension}" is missing from all compact CasePackage references.`,
        missing_review_count: 2,
        groups: [],
      },
    );
  }
});

test("aggregation rejects an empty ReviewResult list", () => {
  assert.throws(
    () => aggregateReviewResultsV01([]),
    /without ReviewResult inputs/,
  );
});

test("a single compatible review reports no disagreement", () => {
  const review = createReviewResult();
  const report = aggregateReviewResultsV01([review]);

  assert.deepEqual(report.disagreement, {
    has_any_disagreement: false,
    verdict: false,
    recommended_action: false,
    label_winner: false,
    evidence_ratings: false,
    evidence_ids: [],
  });
  assert.deepEqual(report.reviewer_agreement.verdict, {
    status: "unavailable",
    compared_review_count: 1,
    unavailable_review_count: 0,
    distinct_value_count: 1,
    unanimous: null,
    values: [{ value: "supported", review_count: 1 }],
    reason:
      "At least two reviewer verdicts are required to describe agreement.",
  });
});

test("matching reviewer verdicts and label winners report available agreement", () => {
  const report = aggregateReviewResultsV01([
    createReviewResult(),
    createReviewResult({ reviewId: "review-b", reviewerId: "reviewer-b" }),
  ]);

  assert.deepEqual(report.reviewer_agreement.verdict, {
    status: "available",
    compared_review_count: 2,
    unavailable_review_count: 0,
    distinct_value_count: 1,
    unanimous: true,
    values: [{ value: "supported", review_count: 2 }],
  });
  assert.deepEqual(report.reviewer_agreement.label_winner, {
    status: "available",
    compared_review_count: 2,
    unavailable_review_count: 0,
    distinct_value_count: 1,
    unanimous: true,
    values: [{ value: "label-a", review_count: 2 }],
  });
});

test("evidence agreement identifies aligned and disputed evidence by stable ID", () => {
  const report = aggregateReviewResultsV01([
    createReviewResult({ evidenceTwoRating: "contradicts" }),
    createReviewResult({
      reviewId: "review-b",
      reviewerId: "reviewer-b",
      evidenceTwoRating: "insufficient",
    }),
  ]);

  assert.deepEqual(report.reviewer_agreement.evidence_ratings, [
    {
      evidence_id: "evidence-1",
      status: "available",
      compared_review_count: 2,
      unavailable_review_count: 0,
      distinct_value_count: 1,
      unanimous: true,
      disputed: false,
      values: [{ value: "supports", review_count: 2 }],
    },
    {
      evidence_id: "evidence-2",
      status: "available",
      compared_review_count: 2,
      unavailable_review_count: 0,
      distinct_value_count: 2,
      unanimous: false,
      disputed: true,
      values: [
        { value: "contradicts", review_count: 1 },
        { value: "insufficient", review_count: 1 },
      ],
    },
  ]);
  assert.deepEqual(report.disagreement.evidence_ids, ["evidence-2"]);
});

test("missing evidence ratings remain visible as incomplete comparisons", () => {
  const reviewWithMissingEvidenceRating = createReviewResult({
    reviewId: "review-b",
    reviewerId: "reviewer-b",
  });
  reviewWithMissingEvidenceRating.decisions.evidence_ratings =
    reviewWithMissingEvidenceRating.decisions.evidence_ratings.filter(
      (evidenceRating) => evidenceRating.evidence_id !== "evidence-2",
    );

  const report = aggregateReviewResultsV01([
    createReviewResult(),
    reviewWithMissingEvidenceRating,
  ]);

  assert.deepEqual(report.reviewer_agreement.evidence_ratings[1], {
    evidence_id: "evidence-2",
    status: "incomplete",
    compared_review_count: 1,
    unavailable_review_count: 1,
    distinct_value_count: 1,
    unanimous: null,
    disputed: false,
    values: [{ value: "supports", review_count: 1 }],
    reason:
      'Evidence rating agreement for "evidence-2" cannot be fully compared because fewer than two comparable ratings are available or some reviews do not contain this evidence reference.',
  });
  assert.deepEqual(report.disagreement.evidence_ids, []);
});

test("single failure-mode selections support a descriptive major-mode comparison", () => {
  const report = aggregateReviewResultsV01([
    createReviewResult({ failureModes: ["missing_evidence"] }),
    createReviewResult({
      reviewId: "review-b",
      reviewerId: "reviewer-b",
      failureModes: ["too_broad"],
    }),
  ]);

  assert.deepEqual(report.reviewer_agreement.major_failure_mode, {
    status: "available",
    compared_review_count: 2,
    unavailable_review_count: 0,
    distinct_value_count: 2,
    unanimous: false,
    values: [
      { value: "missing_evidence", review_count: 1 },
      { value: "too_broad", review_count: 1 },
    ],
  });
});

test("multi-select failure modes keep major-mode agreement incomplete", () => {
  const report = aggregateReviewResultsV01([
    createReviewResult({ failureModes: ["missing_evidence"] }),
    createReviewResult({
      reviewId: "review-b",
      reviewerId: "reviewer-b",
      failureModes: ["missing_evidence", "too_broad"],
    }),
  ]);

  assert.deepEqual(report.reviewer_agreement.major_failure_mode, {
    status: "incomplete",
    compared_review_count: 1,
    unavailable_review_count: 1,
    distinct_value_count: 1,
    unanimous: null,
    values: [{ value: "missing_evidence", review_count: 1 }],
    reason:
      "Major failure-mode agreement is incomplete or unavailable because ReviewResult records zero or multiple failure-mode reason codes without designating one as primary.",
  });
});

test("uncertain verdicts and insufficient evidence remain visible agreement values", () => {
  const report = aggregateReviewResultsV01([
    createReviewResult({
      evidenceTwoRating: "insufficient",
      finalVerdict: "uncertain",
      recommendedAction: "mark_uncertain",
    }),
    createReviewResult({
      reviewId: "review-b",
      reviewerId: "reviewer-b",
      evidenceTwoRating: "insufficient",
      finalVerdict: "uncertain",
      recommendedAction: "mark_uncertain",
    }),
  ]);

  assert.equal(report.verdict_distribution.uncertain, 2);
  assert.deepEqual(report.reviewer_agreement.verdict.values, [
    { value: "uncertain", review_count: 2 },
  ]);
  assert.deepEqual(report.reviewer_agreement.evidence_ratings[1].values, [
    { value: "insufficient", review_count: 2 },
  ]);
  assert.equal(report.reviewer_agreement.verdict.unanimous, true);
  assert.equal(report.reviewer_agreement.evidence_ratings[1].unanimous, true);
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

test("aggregation rejects unsupported CasePackage schema versions", () => {
  const review = createReviewResult();
  const unsupportedReview = {
    ...review,
    case_package: {
      ...review.case_package,
      schema_version: "case_package.v0.2",
    },
  } as unknown as ReviewResultV01;

  assert.throws(
    () => aggregateReviewResultsV01([unsupportedReview]),
    /unsupported CasePackage schema version "case_package.v0.2"/,
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

test("aggregation rejects mismatched CasePackage reference metadata", () => {
  const reviewA = createReviewResult();
  const reviewB: ReviewResultV01 = {
    ...createReviewResult({
      reviewId: "review-b",
      reviewerId: "reviewer-b",
    }),
    case_package: {
      ...reviewA.case_package,
      case_id: "case-synthetic-evaluation-002",
    },
  };

  assert.throws(
    () => aggregateReviewResultsV01([reviewA, reviewB]),
    /mismatched CasePackage reference metadata/,
  );
});
