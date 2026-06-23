import assert from "node:assert/strict";
import test from "node:test";

import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import EvaluationResultsPage from "@/app/results/page";

test("results page renders an empty local ReviewResult state outside the review workflow", () => {
  const markup = renderToStaticMarkup(
    React.createElement(EvaluationResultsPage),
  ).replace(/\s+/g, " ");

  assert.match(markup, /Telemetry Court/);
  assert.match(markup, /Local evaluation results/);
  assert.match(markup, /No ReviewResults available/);
  assert.match(markup, /Import ReviewResult JSON/);
  assert.match(markup, /Review cases/);
  assert.doesNotMatch(markup, /Verdict distribution/);
  assert.doesNotMatch(markup, /Step 1 of 8/);
  assert.doesNotMatch(markup, /Open case file/);
});
