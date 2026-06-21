import assert from "node:assert/strict";
import test from "node:test";

import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { EvaluationReportResults } from "@/components/evaluation/EvaluationReportResults";
import {
  aggregateReviewResultsV01,
  type EvaluationReportV01,
} from "@/lib/evaluationReportV01";
import type { ReviewResultV01 } from "@/lib/reviewResultV01";

test("evaluation report results view shows reviewer distributions and disagreement", () => {
  const report = aggregateReviewResultsV01([
    createReviewResult({
      evidenceTwoRating: "contradicts",
      finalVerdict: "unsupported_or_overclaimed",
      recommendedAction: "rename_label",
    }),
    createReviewResult({
      reviewId: "review-b",
      reviewerId: "reviewer-b",
      selectedLabelId: "label-b",
      evidenceTwoRating: "insufficient",
      finalVerdict: "supported",
      recommendedAction: "accept_label",
    }),
  ]);

  const markup = renderReportText(report);

  assert.match(markup, /Evaluation Report/);
  assert.match(markup, /Reviewer output, not upstream evidence/);
  assert.match(markup, /2 reviewers/);
  assert.match(markup, /Verdict distribution/);
  assert.match(markup, /Unsupported or overclaimed/);
  assert.match(markup, /Supported/);
  assert.match(markup, /Label winner distribution/);
  assert.match(markup, /label-a/);
  assert.match(markup, /label-b/);
  assert.match(markup, /Evidence rating distribution/);
  assert.match(markup, /Supports/);
  assert.match(markup, /Contradicts/);
  assert.match(markup, /Insufficient/);
  assert.match(markup, /Download JSON/);
  assert.match(markup, /Download CSV/);
  assert.match(markup, /Disagreement detected/);
  assert.match(markup, /Verdict/);
  assert.match(markup, /Label winner/);
  assert.match(markup, /Evidence ratings/);
  assert.match(markup, /evidence-2/);
  assert.match(markup, /stable references only/);
  assert.match(markup, /Metadata comparison rollups/);
  assert.match(markup, /Selected label/);
  assert.match(markup, /2 values in this report/);
  assert.match(markup, /Embedding model/);
  assert.match(markup, /synthetic-embedding-a/);
  assert.match(markup, /Single value in this report/);
  assert.match(markup, /Clustering method/);
  assert.match(markup, /Unavailable/);
  assert.match(markup, /clustering_method/);
  assert.doesNotMatch(markup, /best model/i);
  assert.doesNotMatch(markup, /score/i);
});

test("evaluation report results view marks unavailable aggregate data explicitly", () => {
  const unavailableReport: EvaluationReportV01 = {
    schema_version: "evaluation_report.v0.1",
    calculation_version: "review_result_aggregation.v0.2",
    case_package: createReviewResult().case_package,
    source_review_ids: [],
    reviewer_count: 0,
    verdict_distribution: {
      supported: 0,
      partially_supported: 0,
      unsupported_or_overclaimed: 0,
      uncertain: 0,
      cluster_impure: 0,
      needs_split: 0,
      needs_merge: 0,
      needs_better_evidence: 0,
    },
    recommended_action_distribution: {
      accept_label: 0,
      rename_label: 0,
      broaden_label: 0,
      narrow_label: 0,
      split_cluster: 0,
      merge_cluster: 0,
      collect_more_evidence: 0,
      rerun_prompt: 0,
      rerun_embedding: 0,
      mark_uncertain: 0,
    },
    label_winner_distribution: [],
    evidence_rating_distribution: {
      supports: 0,
      weak_support: 0,
      irrelevant: 0,
      contradicts: 0,
      insufficient: 0,
      needs_more_context: 0,
    },
    failure_mode_counts: [],
    comparison_rollups: [],
    disagreement: {
      has_any_disagreement: false,
      verdict: false,
      recommended_action: false,
      label_winner: false,
      evidence_ratings: false,
      evidence_ids: [],
    },
  };

  const markup = renderReportText(unavailableReport);

  assert.match(markup, /Reviewer output unavailable/);
  assert.match(markup, /Verdict distribution unavailable/);
  assert.match(markup, /Label winner distribution unavailable/);
  assert.match(markup, /Evidence rating distribution unavailable/);
  assert.match(markup, /Disagreement indicators unavailable/);
  assert.match(markup, /Comparison rollups unavailable/);
  assert.doesNotMatch(markup, /No disagreement detected/);
  assert.doesNotMatch(markup, /Aligned/);
  assert.doesNotMatch(markup, /0%/);
});

function renderReportText(report: EvaluationReportV01): string {
  return renderToStaticMarkup(
    React.createElement(EvaluationReportResults, { report }),
  ).replace(/\s+/g, " ");
}

function createReviewResult({
  reviewId = "review-a",
  reviewerId = "reviewer-a",
  selectedLabelId = "label-a",
  evidenceTwoRating = "supports",
  finalVerdict = "supported",
  recommendedAction = "accept_label",
}: {
  reviewId?: string;
  reviewerId?: string;
  selectedLabelId?: string;
  evidenceTwoRating?: ReviewResultV01["decisions"]["evidence_ratings"][number]["rating"];
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
        pipeline_version: "pipeline-v1",
        embedding_model: "synthetic-embedding-a",
        naming_model: "synthetic-naming-model-a",
        prompt_id: "prompt-a",
        prompt_version: "1",
        prompt_digest: "sha256:synthetic-a",
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
      failure_modes: [],
      final_verdict: finalVerdict,
      recommended_action: recommendedAction,
    },
  };
}
