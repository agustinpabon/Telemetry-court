import assert from "node:assert/strict";
import test from "node:test";

import { sanitizeArtifactFilenameSegmentV01 } from "@/lib/artifactFilenameV01";

test("artifact filename segments preserve already-safe contract IDs", () => {
  assert.equal(
    sanitizeArtifactFilenameSegmentV01("case-synthetic_001"),
    "case-synthetic_001",
  );
});

test("artifact filename segments cannot introduce paths or control characters", () => {
  const segment = sanitizeArtifactFilenameSegmentV01(
    " ../../private\\case:\u0000report\n ",
  );

  assert.equal(segment, "private-case-report");
  assert.doesNotMatch(segment, /[./\\:\u0000-\u001f\u007f]/);
});

test("artifact filename segments normalize compatibility Unicode before filtering", () => {
  assert.equal(
    sanitizeArtifactFilenameSegmentV01("Ｃａｓｅ／review"),
    "Case-review",
  );
});

test("artifact filename segments use a deterministic safe fallback", () => {
  assert.equal(sanitizeArtifactFilenameSegmentV01("../../"), "artifact");
  assert.equal(sanitizeArtifactFilenameSegmentV01(undefined), "artifact");
  assert.equal(
    sanitizeArtifactFilenameSegmentV01("../../", "case"),
    "case",
  );
});

test("artifact filename segments are capped without ending in separators", () => {
  const cappedSegment = sanitizeArtifactFilenameSegmentV01("a".repeat(200));
  const trimmedSegment = sanitizeArtifactFilenameSegmentV01(
    `${"a".repeat(95)}--tail`,
  );

  assert.equal(cappedSegment.length, 96);
  assert.doesNotMatch(trimmedSegment, /[-_]$/);
});
