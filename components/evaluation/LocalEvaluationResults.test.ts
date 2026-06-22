import assert from "node:assert/strict";
import test from "node:test";

import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { LocalEvaluationResultsView } from "@/components/evaluation/LocalEvaluationResults";
import { sampleEvaluationReportV01 } from "@/data/evaluationReportFixtures";
import type { LocalEvaluationResultsSnapshotV01 } from "@/lib/localEvaluationResultsV01";

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
  });

  assert.match(markup, /Imported 2 ReviewResults/);
  assert.match(markup, /The local summary now includes 2 results/);
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
