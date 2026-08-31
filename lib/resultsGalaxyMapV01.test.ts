import assert from "node:assert/strict";
import test from "node:test";

import { minimalSyntheticCasePackageV01 } from "@/lib/casePackageV01Fixture";
import { importResultsMapCasePackageV01Json } from "@/lib/resultsGalaxyMapV01";

test("Results CasePackage validation errors do not echo supplied values", () => {
  const suppliedPrivateValue = "private-customer-package-secret";
  const result = importResultsMapCasePackageV01Json(
    JSON.stringify({
      ...minimalSyntheticCasePackageV01,
      schema_version: suppliedPrivateValue,
    }),
  );

  assert.equal(result.ok, false);
  if (result.ok) {
    assert.fail("Expected the invalid CasePackage to be rejected.");
  }

  assert.match(result.message, /CasePackage map JSON failed validation/);
  assert.match(result.message, /supplied values are not shown/i);
  assert.doesNotMatch(result.message, new RegExp(suppliedPrivateValue));
});
