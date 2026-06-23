import assert from "node:assert/strict";
import test from "node:test";

import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { LocalEvaluationResultsView } from "@/components/evaluation/LocalEvaluationResults";
import { sampleEvaluationReportV01 } from "@/data/evaluationReportFixtures";
import type { LocalEvaluationResultsSnapshotV01 } from "@/lib/localEvaluationResultsV01";
import type { ReviewResultImportInspectionSummaryV01 } from "@/lib/reviewResultInspectionV01";

const populatedSnapshot: LocalEvaluationResultsSnapshotV01 = {
  totalReviewResultCount: sampleEvaluationReportV01.reviewer_count,
  packageGroups: [
    {
      casePackageId: sampleEvaluationReportV01.case_package.package_id,
      reviewResultCount: sampleEvaluationReportV01.reviewer_count,
      report: sampleEvaluationReportV01,
    },
  ],
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

function renderResults(
  snapshot: LocalEvaluationResultsSnapshotV01,
  importStatus?: React.ComponentProps<
    typeof LocalEvaluationResultsView
  >["importStatus"],
) {
  return renderToStaticMarkup(
    React.createElement(LocalEvaluationResultsView, {
      snapshot,
      importStatus,
    }),
  ).replace(/\s+/g, " ");
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
