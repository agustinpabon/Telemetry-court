import assert from "node:assert/strict";
import test from "node:test";

import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ReviewTerminologyHelp } from "@/components/arena/ReviewTerminologyHelp";

function renderStaticMarkup(element: React.ReactElement): string {
  return renderToStaticMarkup(element).replace(/\s+/g, " ");
}

test("terminology help uses a keyboard-accessible disclosure with concise definitions", () => {
  const markup = renderStaticMarkup(
    React.createElement(ReviewTerminologyHelp, {
      terms: ["case_package", "cluster", "evidence"],
    }),
  );

  assert.match(markup, /<details class="review-terminology-help">/);
  assert.match(markup, /<summary>Terms in this step<\/summary>/);
  assert.match(
    markup,
    /CasePackage<\/dt><dd>The versioned cluster, AI interpretation, and evidence under review\./,
  );
  assert.match(
    markup,
    /Cluster<\/dt><dd>A group of similar telemetry sessions produced upstream\./,
  );
  assert.match(
    markup,
    /Evidence<\/dt><dd>A reviewable item used to support, weaken, or contextualize a claim\./,
  );
});

test("terminology help removes duplicate terms without changing their order", () => {
  const markup = renderStaticMarkup(
    React.createElement(ReviewTerminologyHelp, {
      terms: ["cluster", "evidence", "cluster"],
    }),
  );

  assert.equal(markup.match(/<dt>Cluster<\/dt>/g)?.length, 1);
  assert.equal(markup.match(/<dt>Evidence<\/dt>/g)?.length, 1);
  assert.ok(markup.indexOf("<dt>Cluster</dt>") < markup.indexOf("<dt>Evidence</dt>"));
});

test("terminology help can include visible case-specific terms", () => {
  const markup = renderStaticMarkup(
    React.createElement(ReviewTerminologyHelp, {
      terms: ["blind_assessment"],
      additionalDefinitions: [
        {
          label: "IAM",
          definition:
            "Identity and access management activity involving roles, policies, or permissions.",
        },
      ],
    }),
  );

  assert.match(
    markup,
    /IAM<\/dt><dd>Identity and access management activity involving roles, policies, or permissions\./,
  );
});
