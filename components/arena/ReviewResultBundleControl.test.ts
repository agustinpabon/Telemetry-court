import assert from "node:assert/strict";
import test from "node:test";

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ReviewResultBundleControl } from "@/components/arena/ReviewResultBundleControl";
import type { ReviewResultImportInspectionSummaryV01 } from "@/lib/reviewResultInspectionV01";

test("ReviewResult bundle control exposes local JSON import and export actions", () => {
  const markup = renderToStaticMarkup(
    React.createElement(ReviewResultBundleControl, {
      status: { state: "idle" },
      onExport: () => undefined,
      onImportStart: () => undefined,
      onImportText: () => undefined,
      onImportReadError: () => undefined,
    }),
  );

  assert.match(markup, /ReviewResult import/);
  assert.match(markup, /Export reviews/);
  assert.match(markup, /Import review results/);
  assert.match(markup, /Local JSON/);
  assert.match(markup, /accept="application\/json,\.json"/);
});

test("ReviewResult bundle control renders imported result inspection summary", () => {
  const markup = renderToStaticMarkup(
    React.createElement(ReviewResultBundleControl, {
      status: {
        state: "success",
        message: "Imported 2 ReviewResults from local JSON.",
        inspectionSummary: inlineInspectionSummary,
      },
      onExport: () => undefined,
      onImportStart: () => undefined,
      onImportText: () => undefined,
      onImportReadError: () => undefined,
    }),
  );

  assert.match(markup, /Imported ReviewResult summary/);
  assert.match(markup, /bundle-inline-001/);
  assert.match(markup, /Result count/);
  assert.match(markup, /pkg-inline-001/);
  assert.match(markup, /case-inline-001/);
  assert.match(markup, /ReviewResult schema versions/);
  assert.match(markup, /telemetry_court_review\.v0\.1/);
  assert.match(markup, /supported: 1, uncertain: 1/);
  assert.match(markup, /high: 1/);
  assert.match(markup, /missing_evidence: 2/);
  assert.doesNotMatch(markup, /Validation warnings/);
});

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
