import assert from "node:assert/strict";
import test from "node:test";

import { aggregateReviewResultsV01 } from "@/lib/evaluationReportV01";
import type { EvaluationReportV01 } from "@/lib/evaluationReportV01";
import type { ReviewResultV01 } from "@/lib/reviewResultV01";
import {
  buildClusterRefinementV01,
  getClusterRefinementJsonExportFilenameV01,
  serializeClusterRefinementJsonV01,
  validateClusterRefinementV01,
} from "@/lib/clusterRefinementV01";

test("cluster refinement export preserves approved versions and stable metadata", () => {
  const reviews = [
    createReviewResult({
      reviewId: "review-b",
      reviewerId: "reviewer-b",
      selectedSessionId: "session-zulu",
      finalVerdict: "needs_split",
    }),
    createReviewResult({
      reviewId: "review-a",
      reviewerId: "reviewer-a",
      selectedSessionId: "session-alpha",
      finalVerdict: "supported",
    }),
  ];
  const report = aggregateReviewResultsV01(reviews);

  const artifact = buildClusterRefinementV01({
    report,
    sourceReviewResults: reviews,
    generatedAt: "2026-06-23T12:00:00.000Z",
    refinementId: "refinement-test-001",
  });

  assert.equal(artifact.schema_version, "cluster_refinement.v0.1");
  assert.equal(
    artifact.calculation_version,
    "cluster_refinement_calculation.v0.1",
  );
  assert.equal(artifact.refinement_id, "refinement-test-001");
  assert.equal(artifact.generated_at, "2026-06-23T12:00:00.000Z");
  assert.equal(artifact.source_application, "telemetry_court");
  assert.equal(artifact.format, "local_json");
  assert.deepEqual(artifact.case_package, {
    schema_version: "case_package.v0.1",
    package_id: "pkg-cluster-refinement-001",
    package_revision: "r1",
    case_id: "case-cluster-refinement-001",
    cluster_id: "cluster-refinement-001",
    pipeline: {
      pipeline_id: "pipeline-refinement",
      run_id: "run-refinement-001",
      upstream_tool: "synthetic-refinement-fixture",
      pipeline_version: "pipeline-v1",
      embedding_model: "synthetic-embedding-a",
      clustering_method: "synthetic-hdbscan-style",
      dimensionality_reduction_method: "synthetic-umap-style",
      naming_model: "synthetic-naming-model-a",
      prompt_id: "prompt-refinement",
      prompt_version: "1",
      prompt_digest: "sha256:refinement",
      generated_at: "2026-06-23T11:00:00.000Z",
    },
  });
  assert.deepEqual(artifact.compatibility, {
    review_result_schema_version: "review_result.v0.1",
    review_protocol_version: "telemetry_court_review.v0.1",
    evaluation_report_schema_version: "evaluation_report.v0.1",
    evaluation_report_calculation_version: "review_result_aggregation.v0.3",
  });
  assert.deepEqual(artifact.source_review_ids, ["review-a", "review-b"]);
  assert.deepEqual(artifact.source_reviews, [
    {
      review_id: "review-a",
      review_session_id: "session-reviewer-a",
      created_at: "2026-06-23T12:00:00.000Z",
    },
    {
      review_id: "review-b",
      review_session_id: "session-reviewer-b",
      created_at: "2026-06-23T12:00:00.000Z",
    },
  ]);
  assert.equal(artifact.reviewer_count, 2);
  assert.equal(JSON.stringify(artifact).includes("reviewer_id"), false);
});

test("cluster refinement ordering is deterministic", () => {
  const reviewA = createReviewResult({
    reviewId: "review-a",
    reviewerId: "reviewer-a",
    selectedSessionId: "session-c",
    finalVerdict: "cluster_impure",
    failureModes: ["cluster_seems_mixed"],
  });
  const reviewB = createReviewResult({
    reviewId: "review-b",
    reviewerId: "reviewer-b",
    selectedSessionId: "session-a",
    recommendedAction: "split_cluster",
  });
  const reviewC = createReviewResult({
    reviewId: "review-c",
    reviewerId: "reviewer-c",
    selectedSessionId: "session-b",
    finalVerdict: "needs_merge",
    recommendedAction: "merge_cluster",
  });
  const options = {
    generatedAt: "2026-06-23T12:00:00.000Z",
    refinementId: "refinement-ordering",
  };

  const first = buildClusterRefinementV01({
    report: aggregateReviewResultsV01([reviewC, reviewA, reviewB]),
    sourceReviewResults: [reviewC, reviewA, reviewB],
    ...options,
  });
  const second = buildClusterRefinementV01({
    report: aggregateReviewResultsV01([reviewB, reviewC, reviewA]),
    sourceReviewResults: [reviewB, reviewC, reviewA],
    ...options,
  });

  assert.deepEqual(first, second);
  assert.deepEqual(first.prune_session_ids, ["session-a", "session-c"]);
  assert.deepEqual(
    first.session_exclusion_recommendations.map(
      (recommendation) => recommendation.session_id,
    ),
    ["session-a", "session-b", "session-c"],
  );
  assert.deepEqual(first.split_recommendations[0]?.source_review_ids, [
    "review-a",
    "review-b",
  ]);
  assert.deepEqual(first.merge_recommendations[0]?.source_review_ids, [
    "review-c",
  ]);
});

test("cluster refinement export does not copy claims, evidence contents, or raw telemetry", () => {
  const review = createReviewResult({
    finalVerdict: "cluster_impure",
    notes: [
      "claim text that should never export",
      "raw telemetry that should never export",
    ],
  });
  const artifact = buildClusterRefinementV01({
    report: aggregateReviewResultsV01([review]),
    sourceReviewResults: [review],
    generatedAt: "2026-06-23T12:00:00.000Z",
    refinementId: "refinement-no-raw",
  });
  const serialized = serializeClusterRefinementJsonV01(artifact);

  for (const forbiddenText of [
    "claim text that should never export",
    "raw telemetry that should never export",
    "evidence_items",
    "claims",
    "claim_text",
    "evidence_content",
    "raw_telemetry",
    "safe_reference",
    "source_reference",
  ]) {
    assert.equal(serialized.includes(forbiddenText), false, forbiddenText);
  }
});

test("prune session IDs derive only from qualifying human review signals", () => {
  const reviews = [
    createReviewResult({
      reviewId: "review-cluster-impure",
      reviewerId: "reviewer-cluster-impure",
      selectedSessionId: "session-z",
      finalVerdict: "cluster_impure",
    }),
    createReviewResult({
      reviewId: "review-split-action",
      reviewerId: "reviewer-split-action",
      selectedSessionId: "session-a",
      recommendedAction: "split_cluster",
    }),
    createReviewResult({
      reviewId: "review-mixed-mode",
      reviewerId: "reviewer-mixed-mode",
      selectedSessionId: "session-m",
      failureModes: ["cluster_seems_mixed"],
    }),
    createReviewResult({
      reviewId: "review-model-only",
      reviewerId: "reviewer-model-only",
      selectedSessionId: "session-model-only",
      finalVerdict: "supported",
      recommendedAction: "accept_label",
      failureModes: [],
    }),
  ];

  const artifact = buildClusterRefinementV01({
    report: aggregateReviewResultsV01(reviews),
    sourceReviewResults: reviews,
    generatedAt: "2026-06-23T12:00:00.000Z",
    refinementId: "refinement-prune",
  });

  assert.deepEqual(artifact.prune_session_ids, [
    "session-a",
    "session-m",
    "session-z",
  ]);
  assert.equal(
    artifact.session_exclusion_recommendations.find(
      (recommendation) => recommendation.session_id === "session-model-only",
    )?.status,
    "not_recommended",
  );
  assert.equal(
    artifact.session_exclusion_recommendations.find(
      (recommendation) => recommendation.session_id === "session-z",
    )?.selected_count,
    1,
  );
});

test("selected outlier sessions alone do not become pruning recommendations", () => {
  const review = createReviewResult({
    selectedSessionId: "session-selected-without-quality-signal",
    finalVerdict: "supported",
    recommendedAction: "accept_label",
    failureModes: [],
  });

  const artifact = buildClusterRefinementV01({
    report: aggregateReviewResultsV01([review]),
    sourceReviewResults: [review],
    generatedAt: "2026-06-23T12:00:00.000Z",
    refinementId: "refinement-no-model-pruning",
  });

  assert.deepEqual(artifact.prune_session_ids, []);
  assert.deepEqual(artifact.session_exclusion_recommendations, [
    {
      session_id: "session-selected-without-quality-signal",
      status: "not_recommended",
      selected_count: 1,
      qualifying_review_count: 0,
      reviewer_count: 1,
      source_review_ids: ["review-a"],
      qualifying_source_review_ids: [],
      signals: {
        final_verdicts: [],
        recommended_actions: [],
        failure_modes: [],
      },
      disagreement: {
        status: "unavailable",
        has_disagreement: null,
        selected_by_all_reviewers: null,
        competing_session_ids: [],
        reason:
          "At least two compatible source reviews are required to compare session-exclusion disagreement.",
      },
    },
  ]);
});

test("split recommendations preserve reviewer counts and disagreement", () => {
  const reviews = [
    createReviewResult({
      reviewId: "review-a",
      reviewerId: "reviewer-a",
      finalVerdict: "needs_split",
      selectedSessionId: "session-a",
    }),
    createReviewResult({
      reviewId: "review-b",
      reviewerId: "reviewer-b",
      finalVerdict: "supported",
      selectedSessionId: "session-a",
    }),
    createReviewResult({
      reviewId: "review-c",
      reviewerId: "reviewer-c",
      finalVerdict: "cluster_impure",
      failureModes: ["cluster_seems_mixed"],
      selectedSessionId: "session-c",
    }),
  ];

  const artifact = buildClusterRefinementV01({
    report: aggregateReviewResultsV01(reviews),
    sourceReviewResults: reviews,
    generatedAt: "2026-06-23T12:00:00.000Z",
    refinementId: "refinement-split",
  });

  assert.deepEqual(artifact.split_recommendations, [
    {
      cluster_id: "cluster-refinement-001",
      status: "recommended",
      supporting_review_count: 2,
      reviewer_count: 3,
      source_review_ids: ["review-a", "review-c"],
      signals: {
        final_verdicts: ["cluster_impure", "needs_split"],
        recommended_actions: [],
        failure_modes: ["cluster_seems_mixed"],
      },
      disagreement: {
        status: "available",
        has_disagreement: true,
        reason:
          "Some compatible reviewers did not select a split or impurity signal.",
      },
    },
  ]);
});

test("merge recommendations preserve unavailable target state when no target is captured", () => {
  const reviews = [
    createReviewResult({
      reviewId: "review-merge-a",
      reviewerId: "reviewer-merge-a",
      finalVerdict: "needs_merge",
      recommendedAction: "merge_cluster",
    }),
    createReviewResult({
      reviewId: "review-merge-b",
      reviewerId: "reviewer-merge-b",
      finalVerdict: "supported",
    }),
  ];

  const artifact = buildClusterRefinementV01({
    report: aggregateReviewResultsV01(reviews),
    sourceReviewResults: reviews,
    generatedAt: "2026-06-23T12:00:00.000Z",
    refinementId: "refinement-merge",
  });

  assert.deepEqual(artifact.merge_recommendations, [
    {
      cluster_id: "cluster-refinement-001",
      status: "recommended",
      supporting_review_count: 1,
      reviewer_count: 2,
      source_review_ids: ["review-merge-a"],
      signals: {
        final_verdicts: ["needs_merge"],
        recommended_actions: ["merge_cluster"],
      },
      target: {
        status: "unavailable",
        neighbor_cluster_ids: [],
        reason:
          "ReviewResult v0.1 does not capture a reviewer-selected neighbor merge target.",
      },
      disagreement: {
        status: "available",
        has_disagreement: true,
        reason:
          "Some compatible reviewers did not select a merge signal.",
      },
    },
  ]);
});

test("cluster refinement export includes structured split details and selected merge targets", () => {
  const review = createReviewResult({
    reviewId: "review-structured-refinement",
    reviewerId: "reviewer-structured-refinement",
    finalVerdict: "needs_merge",
    recommendedAction: "merge_cluster",
    failureModes: ["cluster_seems_mixed"],
    clusterRefinement: {
      split_recommendation: {
        status: "recommended",
        reason: "boundary_sessions",
        affected_session_ids: ["session-alpha"],
        evidence_ids: ["evidence-2"],
      },
      merge_recommendation: {
        status: "recommended",
        target_neighbor_cluster_id: "cluster-neighbor-a",
        reason: "shared_behavior",
      },
    },
  });

  const artifact = buildClusterRefinementV01({
    report: aggregateReviewResultsV01([review]),
    sourceReviewResults: [review],
    generatedAt: "2026-06-23T12:00:00.000Z",
    refinementId: "refinement-structured",
  });

  assert.deepEqual(artifact.split_recommendations[0]?.details, {
    reason_codes: ["boundary_sessions"],
    affected_session_ids: ["session-alpha"],
    evidence_ids: ["evidence-2"],
  });
  assert.deepEqual(artifact.merge_recommendations[0]?.target, {
    status: "selected",
    neighbor_cluster_ids: ["cluster-neighbor-a"],
    reason_codes: ["shared_behavior"],
  });
});

test("uncertainty and single-review disagreement state are explicit", () => {
  const review = createReviewResult({
    finalVerdict: "uncertain",
    recommendedAction: "mark_uncertain",
    confidenceLevel: "low",
  });

  const artifact = buildClusterRefinementV01({
    report: aggregateReviewResultsV01([review]),
    sourceReviewResults: [review],
    generatedAt: "2026-06-23T12:00:00.000Z",
    refinementId: "refinement-uncertain",
  });

  assert.deepEqual(artifact.uncertainty, {
    status: "present",
    reviewer_count: 1,
    uncertain_review_count: 1,
    low_confidence_review_count: 1,
    source_review_ids: ["review-a"],
    signals: {
      final_verdicts: ["uncertain"],
      recommended_actions: ["mark_uncertain"],
      confidence_levels: ["low"],
    },
  });
  assert.deepEqual(artifact.disagreement, {
    status: "unavailable",
    reason:
      "At least two compatible source reviews are required to describe disagreement.",
    has_any_disagreement: null,
    verdict: null,
    recommended_action: null,
    label_winner: null,
    evidence_ratings: null,
    evidence_ids: [],
    session_exclusion: null,
    split_recommendation: null,
    merge_recommendation: null,
  });
});

test("cluster refinement validation rejects unsupported schemas and export validates before serialization", () => {
  const review = createReviewResult({ finalVerdict: "needs_split" });
  const artifact = buildClusterRefinementV01({
    report: aggregateReviewResultsV01([review]),
    sourceReviewResults: [review],
    generatedAt: "2026-06-23T12:00:00.000Z",
    refinementId: "refinement-validation",
  });

  assert.deepEqual(validateClusterRefinementV01(artifact), {
    ok: true,
    artifact,
  });
  assert.equal(
    getClusterRefinementJsonExportFilenameV01(artifact),
    "case-cluster-refinement-001-cluster-refinement.json",
  );
  assert.deepEqual(JSON.parse(serializeClusterRefinementJsonV01(artifact)), artifact);
  assert.equal(serializeClusterRefinementJsonV01(artifact).endsWith("\n"), true);

  const invalidArtifact = {
    ...artifact,
    schema_version: "cluster_refinement.v9",
  };
  const validation = validateClusterRefinementV01(invalidArtifact);

  assert.equal(validation.ok, false);
  assert.throws(
    () => serializeClusterRefinementJsonV01(invalidArtifact as never),
    /unsupported schema version/i,
  );
});

test("cluster refinement builder rejects incompatible source inputs", () => {
  const review = createReviewResult();
  const report = aggregateReviewResultsV01([review]);

  assert.throws(
    () =>
      buildClusterRefinementV01({
        report: {
          ...report,
          schema_version: "evaluation_report.v9",
        } as unknown as EvaluationReportV01,
        sourceReviewResults: [review],
      }),
    /unsupported EvaluationReport schema version/,
  );
  assert.throws(
    () =>
      buildClusterRefinementV01({
        report,
        sourceReviewResults: [
          {
            ...review,
            schema_version: "review_result.v9",
          } as unknown as ReviewResultV01,
        ],
      }),
    /unsupported ReviewResult schema version/,
  );
  assert.throws(
    () =>
      buildClusterRefinementV01({
        report,
        sourceReviewResults: [],
      }),
    /without compatible source ReviewResult inputs/,
  );
});

function createReviewResult({
  reviewId = "review-a",
  reviewerId = "reviewer-a",
  selectedLabelId = "label-a",
  selectedSessionId = "session-alpha",
  evidenceTwoRating = "supports",
  failureModes = [],
  finalVerdict = "supported",
  recommendedAction = "accept_label",
  confidenceLevel,
  notes,
  clusterRefinement,
}: {
  reviewId?: string;
  reviewerId?: string;
  selectedLabelId?: string;
  selectedSessionId?: string;
  evidenceTwoRating?: ReviewResultV01["decisions"]["evidence_ratings"][number]["rating"];
  failureModes?: ReviewResultV01["decisions"]["failure_modes"];
  finalVerdict?: ReviewResultV01["decisions"]["final_verdict"];
  recommendedAction?: ReviewResultV01["decisions"]["recommended_action"];
  confidenceLevel?: NonNullable<
    ReviewResultV01["decisions"]["confidence"]
  >["level"];
  notes?: string[];
  clusterRefinement?: ReviewResultV01["decisions"]["cluster_refinement"];
} = {}): ReviewResultV01 {
  return {
    schema_version: "review_result.v0.1",
    review_id: reviewId,
    created_at: "2026-06-23T12:00:00.000Z",
    case_package: {
      schema_version: "case_package.v0.1",
      package_id: "pkg-cluster-refinement-001",
      package_revision: "r1",
      case_id: "case-cluster-refinement-001",
      cluster_id: "cluster-refinement-001",
      pipeline: {
        pipeline_id: "pipeline-refinement",
        run_id: "run-refinement-001",
        upstream_tool: "synthetic-refinement-fixture",
        pipeline_version: "pipeline-v1",
        embedding_model: "synthetic-embedding-a",
        clustering_method: "synthetic-hdbscan-style",
        dimensionality_reduction_method: "synthetic-umap-style",
        naming_model: "synthetic-naming-model-a",
        prompt_id: "prompt-refinement",
        prompt_version: "1",
        prompt_digest: "sha256:refinement",
        generated_at: "2026-06-23T11:00:00.000Z",
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
        label: "Synthetic interpretation that should not export",
        agrees_with_ai: false,
      },
      label_comparison: {
        selected_label_id: selectedLabelId,
        reason_codes: ["better_supported"],
        rationale: "Reviewer rationale that should not export.",
      },
      evidence_ratings: [
        { evidence_id: "evidence-1", rating: "supports" },
        { evidence_id: "evidence-2", rating: evidenceTwoRating },
      ],
      outlier_impostor: {
        selected_session_id: selectedSessionId,
      },
      ...(confidenceLevel
        ? {
            confidence: {
              level: confidenceLevel,
              rationale: "Confidence rationale that should not export.",
            },
          }
        : {}),
      failure_modes: failureModes,
      final_verdict: finalVerdict,
      recommended_action: recommendedAction,
      ...(clusterRefinement ? { cluster_refinement: clusterRefinement } : {}),
      ...(notes ? { notes } : {}),
    },
  };
}
