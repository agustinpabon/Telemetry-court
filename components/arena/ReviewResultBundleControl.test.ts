import assert from "node:assert/strict";
import test from "node:test";

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ReviewResultBundleControl } from "@/components/arena/ReviewResultBundleControl";

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

  assert.match(markup, /ReviewResult bundle/);
  assert.match(markup, /Export reviews/);
  assert.match(markup, /Import review results/);
  assert.match(markup, /Local JSON/);
  assert.match(markup, /accept="application\/json,\.json"/);
});
