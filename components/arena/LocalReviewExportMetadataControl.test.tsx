import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { LocalReviewExportMetadataControl } from "@/components/arena/LocalReviewExportMetadataControl";

test("local review export metadata control presents local-only reviewer context options", () => {
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

  assert.match(markup, /Local export metadata/);
  assert.match(markup, /Local reviewer ID/);
  assert.match(markup, /Review context/);
  assert.match(markup, /Pilot reviewer/);
  assert.match(markup, /Expert walkthrough/);
  assert.match(markup, /local JSON exports only/);
  assert.doesNotMatch(markup, /account/i);
});
