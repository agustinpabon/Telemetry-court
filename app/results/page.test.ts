import assert from "node:assert/strict";
import test from "node:test";

import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import EvaluationResultsPage from "@/app/results/page";

test("results page renders a focused EvaluationReport view outside the review workflow", () => {
  const markup = renderToStaticMarkup(
    React.createElement(EvaluationResultsPage),
  ).replace(/\s+/g, " ");

  assert.match(markup, /Telemetry Court/);
  assert.match(markup, /Evaluation Report/);
  assert.match(markup, /Aggregated reviewer results/);
  assert.match(markup, /Reviewer output, not upstream evidence/);
  assert.match(markup, /Disagreement detected/);
  assert.match(markup, /Verdict distribution/);
  assert.match(markup, /Label winner distribution/);
  assert.match(markup, /Evidence rating distribution/);
  assert.doesNotMatch(markup, /Step 1 of 8/);
  assert.doesNotMatch(markup, /Open case file/);
});
