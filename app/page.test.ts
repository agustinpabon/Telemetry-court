import assert from "node:assert/strict";
import test from "node:test";

import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import * as homePageModule from "@/app/page";

function getDefaultComponent(moduleValue: unknown): React.ComponentType {
  let currentValue = moduleValue;

  for (let depth = 0; depth < 3; depth += 1) {
    if (typeof currentValue === "function") {
      return currentValue as React.ComponentType;
    }

    if (
      currentValue &&
      typeof currentValue === "object" &&
      "default" in currentValue
    ) {
      currentValue = (currentValue as { default: unknown }).default;
      continue;
    }

    break;
  }

  throw new Error("Home page module did not expose a renderable component.");
}

function renderHomePageText(): string {
  const HomePage = getDefaultComponent(homePageModule);
  const html = renderToStaticMarkup(React.createElement(HomePage));

  return html.replace(/\s+/g, " ");
}

test("home page static review flow exposes the core Telemetry Court concepts", () => {
  const pageText = renderHomePageText();

  assert.match(pageText, /Telemetry Court/);
  assert.match(pageText, /Generated interpretation/);
  assert.match(pageText, /Claim ledger/);
  assert.match(pageText, /Evidence workspace/);
  assert.match(pageText, /Source-of-truth record/);
  assert.match(pageText, /Support score/);
  assert.match(pageText, /analyst verdict/i);
});

test("home page smoke render includes a sample claim and linked evidence relationship", () => {
  const pageText = renderHomePageText();

  assert.match(
    pageText,
    /The cluster is anchored by read-oriented IAM inspection rather than mutating access changes\./,
  );
  assert.match(pageText, /evidence-001/);
  assert.match(pageText, /Read-heavy IAM inspection features/);
  assert.match(
    pageText,
    /Read-oriented session features directly support the inspection-workflow claim\./,
  );
  assert.match(pageText, /claim-001/);
});
