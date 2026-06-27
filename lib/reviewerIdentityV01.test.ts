import assert from "node:assert/strict";
import test from "node:test";

import {
  createLocalDemoReviewerV01,
  createLocalReviewerIdentityV01,
  DEFAULT_LOCAL_REVIEWER_METADATA_V01,
  LOCAL_REVIEWER_METADATA_V01_STORAGE_KEY,
  readLocalReviewerMetadataV01,
  saveLocalReviewerMetadataV01,
} from "@/lib/reviewerIdentityV01";

test("local reviewer metadata defaults remain synthetic and browser-local", () => {
  const storage = createMemoryStorage();

  assert.deepEqual(
    readLocalReviewerMetadataV01(storage),
    DEFAULT_LOCAL_REVIEWER_METADATA_V01,
  );
  assert.deepEqual(
    createLocalDemoReviewerV01("pkg-001", "case-001"),
    {
      reviewer_id: "local-demo-reviewer",
      review_session_id: "pkg-001:case-001:local-session",
      context: "synthetic_demo",
    },
  );
});

test("local reviewer metadata saves non-sensitive reviewer ID and review context", () => {
  const storage = createMemoryStorage();

  const savedMetadata = saveLocalReviewerMetadataV01(storage, {
    reviewerId: "pilot-reviewer-a",
    context: "pilot_reviewer",
  });
  const reviewer = createLocalReviewerIdentityV01({
    packageId: "pkg-001",
    caseId: "case-001",
    reviewerId: savedMetadata.reviewerId,
    context: savedMetadata.context,
  });

  assert.deepEqual(readLocalReviewerMetadataV01(storage), {
    reviewerId: "pilot-reviewer-a",
    context: "pilot_reviewer",
  });
  assert.deepEqual(reviewer, {
    reviewer_id: "pilot-reviewer-a",
    review_session_id: "pkg-001:case-001:pilot-reviewer-a:local-session",
    context: "pilot_reviewer",
  });
  assert.equal(
    storage.getItem(LOCAL_REVIEWER_METADATA_V01_STORAGE_KEY),
    '{"reviewerId":"pilot-reviewer-a","context":"pilot_reviewer"}',
  );
});

test("local reviewer metadata rejects unsafe local reviewer IDs", () => {
  const storage = createMemoryStorage();

  assert.throws(
    () =>
      saveLocalReviewerMetadataV01(storage, {
        reviewerId: "person@example.com",
        context: "expert_walkthrough",
      }),
    /Local reviewer ID must use/,
  );
  assert.deepEqual(
    readLocalReviewerMetadataV01(storage),
    DEFAULT_LOCAL_REVIEWER_METADATA_V01,
  );
});

function createMemoryStorage() {
  const values = new Map<string, string>();

  return {
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
  };
}
