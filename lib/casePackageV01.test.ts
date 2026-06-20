import assert from "node:assert/strict";
import test from "node:test";

import { minimalSyntheticCasePackageV01 } from "@/lib/casePackageV01Fixture";
import {
  CASE_PACKAGE_V01_EVIDENCE_RATINGS,
  CASE_PACKAGE_V01_SCHEMA_VERSION,
} from "@/lib/types";

test("CasePackage v0.1 represents a synthetic reviewable package boundary", () => {
  assert.equal(
    minimalSyntheticCasePackageV01.schema_version,
    CASE_PACKAGE_V01_SCHEMA_VERSION,
  );
  assert.equal(minimalSyntheticCasePackageV01.candidate_labels.length, 2);
  assert.equal(minimalSyntheticCasePackageV01.claims.length, 3);
  assert.equal(minimalSyntheticCasePackageV01.evidence_items.length, 3);
  assert.equal(minimalSyntheticCasePackageV01.representative_sessions.length, 2);
  assert.equal(
    minimalSyntheticCasePackageV01.sanitization.raw_drilldown_allowed,
    false,
  );
  assert.deepEqual(
    minimalSyntheticCasePackageV01.review_configuration.allowed_evidence_ratings,
    [...CASE_PACKAGE_V01_EVIDENCE_RATINGS],
  );
});
