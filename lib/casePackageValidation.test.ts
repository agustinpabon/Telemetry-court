import assert from "node:assert/strict";
import test from "node:test";

import { minimalSyntheticCasePackageV01 } from "@/lib/casePackageV01Fixture";
import {
  type CasePackageValidationResult,
  validateCasePackageV01,
} from "@/lib/casePackageValidation";

function clonePackage(): Record<string, unknown> {
  return structuredClone(minimalSyntheticCasePackageV01) as Record<string, unknown>;
}

function arrayField(
  record: Record<string, unknown>,
  key: string,
): Record<string, unknown>[] {
  const value = record[key];
  assert.ok(Array.isArray(value), `${key} should be an array in the fixture`);
  return value as Record<string, unknown>[];
}

function objectField(
  record: Record<string, unknown>,
  key: string,
): Record<string, unknown> {
  const value = record[key];
  assert.equal(typeof value, "object", `${key} should be an object in the fixture`);
  assert.notEqual(value, null, `${key} should be present in the fixture`);
  assert.equal(Array.isArray(value), false, `${key} should not be an array`);
  return value as Record<string, unknown>;
}

function assertValid(
  result: CasePackageValidationResult,
): asserts result is Extract<CasePackageValidationResult, { ok: true }> {
  if (!result.ok) {
    assert.fail(`Expected package to validate, got ${JSON.stringify(result.errors)}`);
  }
}

function assertInvalid(
  result: CasePackageValidationResult,
  expected: { code: string; pathIncludes?: string },
) {
  if (result.ok) {
    assert.fail("Expected package validation to fail.");
  }

  const matchingError = result.errors.find((error) => {
    return (
      error.code === expected.code &&
      (!expected.pathIncludes || error.path.includes(expected.pathIncludes))
    );
  });

  assert.ok(
    matchingError,
    `Expected ${expected.code} at ${expected.pathIncludes ?? "any path"}, got ${JSON.stringify(
      result.errors,
    )}`,
  );
}

test("valid minimal CasePackage v0.1 package passes runtime validation", () => {
  const result = validateCasePackageV01(minimalSyntheticCasePackageV01);

  assertValid(result);
  assert.equal(result.package.package_id, minimalSyntheticCasePackageV01.package_id);
});

test("unsupported schema version fails clearly", () => {
  const input = clonePackage();
  input.schema_version = "case_package.v9";

  assertInvalid(validateCasePackageV01(input), {
    code: "unsupported_schema_version",
    pathIncludes: "schema_version",
  });
});

test("missing required top-level section fails", () => {
  const input = clonePackage();
  delete input.dataset;

  assertInvalid(validateCasePackageV01(input), {
    code: "missing_required_field",
    pathIncludes: "dataset",
  });
});

test("packages without claims fail before review evidence can be trusted", () => {
  const input = clonePackage();
  delete input.claims;

  assertInvalid(validateCasePackageV01(input), {
    code: "missing_required_field",
    pathIncludes: "claims",
  });
});

test("claim evidence references must point at existing evidence IDs", () => {
  const input = clonePackage();
  const claims = arrayField(input, "claims");
  claims[0].linked_evidence_ids = ["evidence-does-not-exist"];

  assertInvalid(validateCasePackageV01(input), {
    code: "unknown_evidence_reference",
    pathIncludes: "claims[0].linked_evidence_ids[0]",
  });
});

test("evidence-to-claim mappings must point at existing claim and evidence IDs", () => {
  const input = clonePackage();
  const mappings = arrayField(input, "evidence_to_claim_mappings");
  mappings[0].claim_id = "claim-does-not-exist";
  mappings[0].evidence_id = "evidence-does-not-exist";
  const result = validateCasePackageV01(input);

  assertInvalid(result, {
    code: "unknown_claim_reference",
    pathIncludes: "evidence_to_claim_mappings[0].claim_id",
  });
  assertInvalid(result, {
    code: "unknown_evidence_reference",
    pathIncludes: "evidence_to_claim_mappings[0].evidence_id",
  });
});

test("candidate label claim references must point at existing claim IDs", () => {
  const input = clonePackage();
  const labels = arrayField(input, "candidate_labels");
  labels[0].linked_claim_ids = ["claim-does-not-exist"];

  assertInvalid(validateCasePackageV01(input), {
    code: "unknown_claim_reference",
    pathIncludes: "candidate_labels[0].linked_claim_ids[0]",
  });
});

test("duplicate IDs fail before packages are rendered", () => {
  const input = clonePackage();
  const evidenceItems = arrayField(input, "evidence_items");
  evidenceItems[1].evidence_id = evidenceItems[0].evidence_id;

  assertInvalid(validateCasePackageV01(input), {
    code: "duplicate_id",
    pathIncludes: "evidence_items[1].evidence_id",
  });
});

test("bounded metric values must stay between zero and one", () => {
  const tooHighInput = clonePackage();
  const tooHighMetrics = objectField(tooHighInput, "metrics");
  const tooHighClusterCoherence = objectField(tooHighMetrics, "cluster_coherence");
  tooHighClusterCoherence.value = 1.5;

  assertInvalid(validateCasePackageV01(tooHighInput), {
    code: "metric_value_out_of_bounds",
    pathIncludes: "metrics.cluster_coherence.value",
  });

  const tooLowInput = clonePackage();
  const tooLowMetrics = objectField(tooLowInput, "metrics");
  const tooLowClusterCoherence = objectField(tooLowMetrics, "cluster_coherence");
  tooLowClusterCoherence.value = -0.1;

  assertInvalid(validateCasePackageV01(tooLowInput), {
    code: "metric_value_out_of_bounds",
    pathIncludes: "metrics.cluster_coherence.value",
  });
});

test("outlier and impostor candidates must reference existing representative sessions", () => {
  const input = clonePackage();
  const candidates = arrayField(input, "outlier_impostor_candidates");
  candidates[0].session_id = "session-does-not-exist";

  assertInvalid(validateCasePackageV01(input), {
    code: "unknown_session_reference",
    pathIncludes: "outlier_impostor_candidates[0].session_id",
  });
});

test("missing provenance metadata fails", () => {
  const input = clonePackage();
  delete input.provenance;

  assertInvalid(validateCasePackageV01(input), {
    code: "missing_required_field",
    pathIncludes: "provenance",
  });
});

test("missing sanitization metadata fails", () => {
  const input = clonePackage();
  delete input.sanitization;

  assertInvalid(validateCasePackageV01(input), {
    code: "missing_required_field",
    pathIncludes: "sanitization",
  });
});

test("unsafe raw drill-down assumptions fail without explicit safe metadata", () => {
  const input = clonePackage();
  const sanitization = objectField(input, "sanitization");
  sanitization.raw_drilldown_allowed = true;
  sanitization.safe_reference_type = "none";

  assertInvalid(validateCasePackageV01(input), {
    code: "unsafe_drilldown_configuration",
    pathIncludes: "sanitization.safe_reference_type",
  });
});

test("review configuration only accepts canonical evidence ratings", () => {
  const input = clonePackage();
  const reviewConfiguration = objectField(input, "review_configuration");
  reviewConfiguration.allowed_evidence_ratings = ["supports", "maybe"];

  assertInvalid(validateCasePackageV01(input), {
    code: "invalid_enum_value",
    pathIncludes: "review_configuration.allowed_evidence_ratings[1]",
  });
});

test("runtime validation does not mutate the input object", () => {
  const input = clonePackage();
  const beforeValidation = JSON.stringify(input);

  assertValid(validateCasePackageV01(input));
  assert.equal(JSON.stringify(input), beforeValidation);
});
