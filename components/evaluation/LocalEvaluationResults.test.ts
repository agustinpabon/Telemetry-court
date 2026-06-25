import assert from "node:assert/strict";
import test from "node:test";

import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { LocalEvaluationResultsView } from "@/components/evaluation/LocalEvaluationResults";
import { casePackageFixtures } from "@/data/casePackageFixtures";
import { sampleEvaluationReportV01 } from "@/data/evaluationReportFixtures";
import { aggregateReviewResultsV01 } from "@/lib/evaluationReportV01";
import type { LocalEvaluationResultsSnapshotV01 } from "@/lib/localEvaluationResultsV01";
import type { QuickDispositionV01 } from "@/lib/quickDispositionV01";
import type { ReviewResultImportInspectionSummaryV01 } from "@/lib/reviewResultInspectionV01";
import type { ReviewResultV01 } from "@/lib/reviewResultV01";
import type { CasePackageV01 } from "@/lib/types";

const populatedSnapshot: LocalEvaluationResultsSnapshotV01 = {
  totalReviewResultCount: sampleEvaluationReportV01.reviewer_count,
  totalQuickDispositionCount: 0,
  packageGroups: [
    {
      casePackageId: sampleEvaluationReportV01.case_package.package_id,
      reviewResultCount: sampleEvaluationReportV01.reviewer_count,
      report: sampleEvaluationReportV01,
      sourceReviewResults: createSampleSourceReviewResults(),
    },
  ],
  quickDispositionGroups: [],
};

test("results view renders locally stored ReviewResults by compatible package", () => {
  const markup = renderResults(populatedSnapshot);

  assert.match(markup, /2 results/);
  assert.match(markup, /1 CasePackage/);
  assert.match(markup, /Compatible package groups only/);
  assert.match(
    markup,
    /A ReviewResult is one reviewer&#x27;s structured judgment for one CasePackage\./,
  );
  assert.match(markup, /ReviewResult to EvaluationReport/);
  assert.match(
    markup,
    /Individual reviews roll up into multi-reviewer EvaluationReport-style metrics/,
  );
  assert.match(markup, /Import on \/results/);
  assert.match(markup, /Group compatible reviews/);
  assert.match(
    markup,
    /matching package \/ case \/ cluster references and protocol/,
  );
  assert.match(markup, /Generate EvaluationReport metrics/);
  assert.match(
    markup,
    /Local-file workflow only: no backend, auth, database, server-side persistence, or cloud sync\./,
  );
  assert.match(
    markup,
    /compatible CasePackage reference and ReviewResult protocol/,
  );
  assert.match(
    markup,
    /Multiple compatible ReviewResults means multiple reviewers reviewed the same compatible CasePackage\/protocol\./,
  );
  assert.match(markup, /pkg-synthetic-evaluation-001/);
  assert.match(markup, /case-synthetic-evaluation-001/);
  assert.match(markup, /run-synthetic-evaluation-001/);
  assert.match(markup, /Verdict distribution/);
  assert.match(markup, /Supported.*1 reviewer selection/);
  assert.match(markup, /Unsupported or overclaimed.*1 reviewer selection/);
  assert.match(markup, /Uncertain.*0 reviewer selections/);
  assert.match(markup, /Insufficient.*1 decision/);
  assert.match(markup, /Reviewer agreement/);
  assert.match(markup, /Disagreement detected/);
  assert.match(markup, /Download JSON/);
  assert.match(markup, /Download CSV/);
  assert.match(markup, /Download refinement JSON/);
  assert.match(
    markup,
    /upstream refinement recipe derived from human review aggregation/i,
  );
});

test("results view renders a topology map when compatible package coordinates exist", () => {
  const mapPackage = requireCasePackageFixture();
  const snapshot = createSnapshotFromPackage(mapPackage, [
    createReviewResultFromPackage(mapPackage, {
      finalVerdict: "needs_split",
      recommendedAction: "split_cluster",
    }),
  ]);

  const markup = renderResults(snapshot, undefined, [mapPackage]);

  assert.match(markup, /Results topology map/);
  assert.match(markup, /imported or local CasePackage coordinates/);
  assert.match(markup, /data-result-status="needs_split"/);
  assert.match(markup, /Needs split/);
  assert.match(markup, /Download JSON/);
  assert.match(markup, /Download CSV/);
  assert.doesNotMatch(markup, /Results map unavailable/);
});

test("results view makes missing package coordinates a loud unavailable map state", () => {
  const packageWithoutCoordinates = createPackageWithoutCoordinates(
    requireCasePackageFixture(),
  );
  const snapshot = createSnapshotFromPackage(packageWithoutCoordinates, [
    createReviewResultFromPackage(packageWithoutCoordinates),
  ]);

  const markup = renderResults(snapshot, undefined, [packageWithoutCoordinates]);

  assert.match(markup, /Results map unavailable/);
  assert.match(markup, /does not include cluster embedding_map coordinates/);
  assert.match(markup, /Import or reload the matching CasePackage/);
  assert.match(markup, new RegExp(packageWithoutCoordinates.package_id));
  assert.match(markup, new RegExp(packageWithoutCoordinates.case.case_id));
  assert.match(markup, new RegExp(packageWithoutCoordinates.cluster.cluster_id));
  assert.doesNotMatch(markup, /evidence-galaxy-atlas/);
});

test("results view makes missing or incompatible package references unavailable", () => {
  const mapPackage = requireCasePackageFixture();
  const snapshot = createSnapshotFromPackage(mapPackage, [
    createReviewResultFromPackage(mapPackage),
  ]);
  const missingPackageMarkup = renderResults(snapshot, undefined, []);
  const incompatiblePackageMarkup = renderResults(snapshot, undefined, [
    createPackageWithPipelineRun(mapPackage, "run-results-map-incompatible"),
  ]);

  assert.match(missingPackageMarkup, /Results map unavailable/);
  assert.match(
    missingPackageMarkup,
    /No local or imported CasePackage metadata is available/,
  );
  assert.match(
    missingPackageMarkup,
    /Import or reload the matching CasePackage/,
  );
  assert.match(missingPackageMarkup, new RegExp(mapPackage.case.case_id));
  assert.match(missingPackageMarkup, new RegExp(mapPackage.cluster.cluster_id));
  assert.match(incompatiblePackageMarkup, /Results map unavailable/);
  assert.match(
    incompatiblePackageMarkup,
    /compact package or pipeline reference does not match/,
  );
});

test("results map status encoding is derived from aggregated ReviewResults", () => {
  const mapPackage = createPackageWithId(
    requireCasePackageFixture(),
    "pkg-results-map-derived-status",
  );
  const snapshot = createSnapshotFromPackage(mapPackage, [
    createReviewResultFromPackage(mapPackage, {
      finalVerdict: "unsupported_or_overclaimed",
      recommendedAction: "rename_label",
    }),
  ]);

  const markup = renderResults(snapshot, undefined, [mapPackage]);

  assert.match(markup, /data-result-status="unsupported_or_overclaimed"/);
  assert.match(markup, /Unsupported or overclaimed/);
  assert.doesNotMatch(markup, /data-result-status="supported"/);
});

test("results view renders imported ReviewResult bundle status with its report", () => {
  const markup = renderResults(populatedSnapshot, {
    state: "success",
    message:
      "Imported 2 ReviewResults. The local summary now includes 2 results.",
    inspectionSummary: inlineInspectionSummary,
  });

  assert.match(markup, /Imported 2 ReviewResults/);
  assert.match(markup, /The local summary now includes 2 results/);
  assert.match(markup, /Imported ReviewResult summary/);
  assert.match(markup, /bundle-inline-001/);
  assert.match(markup, /pkg-inline-001/);
  assert.match(markup, /Review protocol versions/);
  assert.match(markup, /supported: 1, uncertain: 1/);
  assert.match(markup, /Aggregated reviewer results/);
});

test("results view makes rejected imported results and exclusions explicit", () => {
  const markup = renderResults(populatedSnapshot, {
    state: "error",
    message:
      "1 ReviewResult rejected and excluded from aggregation. The CasePackage reference is incompatible.",
  });

  assert.match(markup, /rejected and excluded from aggregation/);
  assert.match(markup, /CasePackage reference is incompatible/);
  assert.match(markup, /2 results/);
});

test("results view presents an already imported ReviewResult as a harmless no-op", () => {
  const markup = renderResults(populatedSnapshot, {
    state: "success",
    message:
      "This ReviewResult already exists locally. No action is needed; the local summary is unchanged.",
  });

  assert.match(markup, /already exists locally/);
  assert.match(markup, /No action is needed/);
  assert.match(markup, /local summary is unchanged/);
  assert.match(markup, /2 results/);
});

test("results view renders quick dispositions separately from EvaluationReports", () => {
  const quickDisposition = createQuickDisposition();
  const snapshot: LocalEvaluationResultsSnapshotV01 = {
    totalReviewResultCount: 0,
    totalQuickDispositionCount: 1,
    packageGroups: [],
    quickDispositionGroups: [
      {
        casePackageId: quickDisposition.case_package.package_id,
        dispositionCount: 1,
        quickDispositions: [quickDisposition],
      },
    ],
  };

  const markup = renderResults(snapshot, {
    state: "success",
    message:
      "Imported 1 quick disposition. It is stored separately from completed ReviewResults.",
  });

  assert.match(markup, /Quick dispositions/);
  assert.match(markup, /1 disposition/);
  assert.match(markup, /quick disposition is an early structured outcome/i);
  assert.match(markup, /Cannot judge from this package/);
  assert.match(markup, /blind review/);
  assert.match(markup, /insufficient package context/);
  assert.match(markup, /pkg-quick-results-001/);
  assert.match(markup, /case-quick-results-001/);
  assert.match(markup, /cluster-quick-results-001/);
  assert.match(
    markup,
    /No completed ReviewResults available/,
  );
  assert.doesNotMatch(markup, /Aggregated reviewer results/);
  assert.doesNotMatch(markup, /Verdict distribution/);
});

function renderResults(
  snapshot: LocalEvaluationResultsSnapshotV01,
  importStatus?: React.ComponentProps<
    typeof LocalEvaluationResultsView
  >["importStatus"],
  availableCasePackages?: CasePackageV01[],
) {
  return renderToStaticMarkup(
    React.createElement(LocalEvaluationResultsView, {
      snapshot,
      importStatus,
      availableCasePackages,
    }),
  ).replace(/\s+/g, " ");
}

function createSnapshotFromPackage(
  casePackage: CasePackageV01,
  reviewResults: ReviewResultV01[],
): LocalEvaluationResultsSnapshotV01 {
  const report = aggregateReviewResultsV01(reviewResults);

  return {
    totalReviewResultCount: reviewResults.length,
    totalQuickDispositionCount: 0,
    packageGroups: [
      {
        casePackageId: casePackage.package_id,
        reviewResultCount: reviewResults.length,
        report,
        sourceReviewResults: reviewResults,
      },
    ],
    quickDispositionGroups: [],
  };
}

function createReviewResultFromPackage(
  casePackage: CasePackageV01,
  {
    finalVerdict = "supported",
    recommendedAction = "accept_label",
    reviewId = "review-map-a",
    reviewerId = "reviewer-map-a",
  }: {
    finalVerdict?: ReviewResultV01["decisions"]["final_verdict"];
    recommendedAction?: ReviewResultV01["decisions"]["recommended_action"];
    reviewId?: string;
    reviewerId?: string;
  } = {},
): ReviewResultV01 {
  return {
    schema_version: "review_result.v0.1",
    review_id: reviewId,
    created_at: "2026-06-21T12:00:00.000Z",
    case_package: {
      schema_version: casePackage.schema_version,
      package_id: casePackage.package_id,
      package_revision: casePackage.package_revision,
      case_id: casePackage.case.case_id,
      cluster_id: casePackage.cluster.cluster_id,
      pipeline: {
        pipeline_id: casePackage.pipeline.pipeline_id,
        run_id: casePackage.pipeline.run_id,
        upstream_tool: casePackage.pipeline.upstream_tool,
        pipeline_version: casePackage.pipeline.pipeline_version,
        embedding_model: casePackage.pipeline.embedding_model,
        clustering_method: casePackage.pipeline.clustering_method,
        dimensionality_reduction_method:
          casePackage.pipeline.dimensionality_reduction_method,
        naming_model: casePackage.pipeline.naming_model,
        prompt_id: casePackage.pipeline.prompt?.prompt_id,
        prompt_version: casePackage.pipeline.prompt?.prompt_version,
        prompt_digest: casePackage.pipeline.prompt?.prompt_digest,
        generated_at: casePackage.pipeline.generated_at,
      },
    },
    reviewer: {
      reviewer_id: reviewerId,
      review_session_id: `session-${reviewerId}`,
      context: "synthetic_demo",
    },
    protocol: {
      protocol_version: "telemetry_court_review.v0.1",
      blind_review_enabled:
        casePackage.review_configuration.blind_review_enabled,
      ai_label_revealed: true,
    },
    decisions: {
      blind_interpretation: {
        option_id: "blind-option-1",
        label: "Synthetic interpretation",
        agrees_with_ai: true,
      },
      label_comparison: {
        selected_label_id: casePackage.candidate_labels[0]?.label_id ?? "label-a",
        reason_codes: ["better_supported"],
      },
      evidence_ratings: casePackage.evidence_items.map((evidence) => ({
        evidence_id: evidence.evidence_id,
        rating: "supports",
      })),
      outlier_impostor: {
        selected_session_id:
          casePackage.representative_sessions[0]?.session_id ?? "session-a",
      },
      failure_modes: finalVerdict === "needs_split" ? ["cluster_seems_mixed"] : [],
      final_verdict: finalVerdict,
      recommended_action: recommendedAction,
    },
  };
}

function createQuickDisposition(): QuickDispositionV01 {
  return {
    schema_version: "quick_disposition.v0.1",
    disposition_id:
      "quick-disposition:pkg-quick-results-001:reviewer-quick:session-quick:blind_review:2026-06-24T12:00:00.000Z",
    created_at: "2026-06-24T12:00:00.000Z",
    case_package: {
      schema_version: "case_package.v0.1",
      package_id: "pkg-quick-results-001",
      case_id: "case-quick-results-001",
      cluster_id: "cluster-quick-results-001",
      pipeline: {
        run_id: "run-quick-results-001",
        upstream_tool: "quick-results-test",
        generated_at: "2026-06-24T11:55:00.000Z",
      },
    },
    reviewer: {
      reviewer_id: "reviewer-quick",
      review_session_id: "session-quick",
      context: "local_review",
    },
    source_stage: "blind_review",
    disposition: "cannot_judge_from_package",
    reason_codes: ["insufficient_package_context"],
  };
}

function requireCasePackageFixture(): CasePackageV01 {
  const fixture = casePackageFixtures[0];

  if (!fixture) {
    throw new Error("Expected at least one CasePackage fixture.");
  }

  return fixture;
}

function createPackageWithoutCoordinates(
  casePackage: CasePackageV01,
): CasePackageV01 {
  return {
    ...casePackage,
    package_id: `${casePackage.package_id}-missing-coordinates`,
    cluster: {
      ...casePackage.cluster,
      embedding_map: {
        ...(casePackage.cluster.embedding_map ?? {}),
        coordinates: undefined,
      },
    },
  };
}

function createPackageWithPipelineRun(
  casePackage: CasePackageV01,
  runId: string,
): CasePackageV01 {
  return {
    ...casePackage,
    pipeline: {
      ...casePackage.pipeline,
      run_id: runId,
    },
  };
}

function createPackageWithId(
  casePackage: CasePackageV01,
  packageId: string,
): CasePackageV01 {
  return {
    ...casePackage,
    package_id: packageId,
  };
}

const inlineInspectionSummary: ReviewResultImportInspectionSummaryV01 = {
  artifactType: "ReviewResultBundle",
  artifactSchemaVersion: "review_result_bundle.v0.1",
  bundleId: "bundle-inline-001",
  resultCount: 2,
  uniqueReviewerSessionCount: 2,
  reviewerSessions: [
    { reviewerId: "reviewer-a", reviewSessionId: "session-a" },
    { reviewerId: "reviewer-b", reviewSessionId: "session-b" },
  ],
  referencedPackageIds: ["pkg-inline-001"],
  referencedCaseIds: ["case-inline-001"],
  reviewResultSchemaVersions: ["review_result.v0.1"],
  casePackageSchemaVersions: ["case_package.v0.1"],
  reviewProtocolVersions: ["telemetry_court_review.v0.1"],
  casePackageReferences: [
    {
      packageId: "pkg-inline-001",
      caseId: "case-inline-001",
      clusterId: "cluster-inline-001",
      pipelineRunId: "run-inline-001",
      upstreamTool: "inline-test-generator",
    },
  ],
  verdictDistribution: [
    { value: "supported", count: 1 },
    { value: "uncertain", count: 1 },
  ],
  confidenceSummary: {
    capturedCount: 1,
    missingCount: 1,
    distribution: [{ value: "high", count: 1 }],
  },
  failureModeCounts: [{ value: "missing_evidence", count: 2 }],
  compatibilitySummary: {
    status: "compatible",
    message:
      "Strict validation confirmed one compatible CasePackage/protocol/evidence set for local aggregation.",
  },
  warnings: [],
};

function createSampleSourceReviewResults(): ReviewResultV01[] {
  return [
    createReviewResultFromPackageReference({
      reviewId: "review-a",
      reviewerId: "reviewer-a",
      selectedLabelId: "label-a",
      evidenceTwoRating: "contradicts",
      failureModes: ["missing_evidence"],
      finalVerdict: "unsupported_or_overclaimed",
      recommendedAction: "rename_label",
    }),
    createReviewResultFromPackageReference({
      reviewId: "review-b",
      reviewerId: "reviewer-b",
      selectedLabelId: "label-b",
      evidenceTwoRating: "insufficient",
      failureModes: ["missing_evidence", "too_broad"],
      finalVerdict: "supported",
      recommendedAction: "accept_label",
    }),
  ];
}

function createReviewResultFromPackageReference({
  reviewId,
  reviewerId,
  selectedLabelId,
  evidenceTwoRating,
  failureModes,
  finalVerdict,
  recommendedAction,
}: {
  reviewId: string;
  reviewerId: string;
  selectedLabelId: string;
  evidenceTwoRating: ReviewResultV01["decisions"]["evidence_ratings"][number]["rating"];
  failureModes: ReviewResultV01["decisions"]["failure_modes"];
  finalVerdict: ReviewResultV01["decisions"]["final_verdict"];
  recommendedAction: ReviewResultV01["decisions"]["recommended_action"];
}): ReviewResultV01 {
  return {
    schema_version: "review_result.v0.1",
    review_id: reviewId,
    created_at: "2026-06-21T12:00:00.000Z",
    case_package: sampleEvaluationReportV01.case_package,
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
