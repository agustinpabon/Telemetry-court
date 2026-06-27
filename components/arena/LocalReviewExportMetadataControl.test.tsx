import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { LocalReviewExportMetadataControl } from "@/components/arena/LocalReviewExportMetadataControl";

test("local review export metadata control renders compact summary by default", () => {
  const markup = renderToStaticMarkup(
    <LocalReviewExportMetadataControl
      value={{
        reviewerId: "pilot-reviewer-a",
        context: "pilot_reviewer",
      }}
      onChange={() => undefined}
      onReset={() => undefined}
    />,
  );

  assert.match(markup, /Export metadata:/);
  assert.match(markup, /pilot-reviewer-a/);
  assert.match(markup, /Pilot reviewer/);
  assert.match(markup, /Edit/);
  assert.match(
    markup,
    /<details class="local-reviewer-metadata-control tc-masthead__secondary-menu"><summary/,
  );
  assert.doesNotMatch(markup, /<details[^>]*open/);
  assert.doesNotMatch(markup, /account/i);
});

test("expanded local review export metadata control presents editable export fields", () => {
  const markup = renderToStaticMarkup(
    <LocalReviewExportMetadataControl
      value={{
        reviewerId: "pilot-reviewer-a",
        context: "pilot_reviewer",
      }}
      statusMessage="Local export metadata saved in this browser."
      defaultOpen
      onChange={() => undefined}
      onReset={() => undefined}
    />,
  );

  assert.match(markup, /Local export metadata/);
  assert.match(markup, /<details[^>]*open/);
  assert.match(markup, /Local reviewer ID/);
  assert.match(markup, /value="pilot-reviewer-a"/);
  assert.match(markup, /Review context/);
  assert.match(markup, /Pilot reviewer/);
  assert.match(markup, /Expert walkthrough/);
  assert.match(markup, /local JSON exports only/);
  assert.match(markup, /Reset/);
  assert.match(markup, /Local export metadata saved in this browser\./);
  assert.doesNotMatch(markup, /account/i);
});
