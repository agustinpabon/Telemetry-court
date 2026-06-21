import assert from "node:assert/strict";
import test from "node:test";

import { casePackageFixtures } from "@/data/casePackageFixtures";
import { sampleCaseSeedData } from "@/data/sampleCaseSeedData";
import { casePackageV01ToCaseFile } from "@/lib/casePackageV01ToCaseFile";
import { validateCasePackageV01 } from "@/lib/casePackageValidation";

test("adapts a complete CasePackage v0.1 into the existing UI case shape", () => {
  const result = casePackageV01ToCaseFile(
    casePackageFixtures[0],
    sampleCaseSeedData[0],
  );

  assert.equal(result.ok, true);
  if (!result.ok) {
    return;
  }

  assert.deepEqual(result.caseFile, sampleCaseSeedData[0]);
});

test("maps package representative-session content instead of copying the compatibility seed", () => {
  const packageWithUpdatedSession = structuredClone(casePackageFixtures[0]);
  packageWithUpdatedSession.representative_sessions[0].title =
    "Package-provided review session";

  const result = casePackageV01ToCaseFile(
    packageWithUpdatedSession,
    sampleCaseSeedData[0],
  );

  assert.equal(result.ok, true);
  if (!result.ok) {
    return;
  }

  assert.equal(
    result.caseFile.representativeSessions[0].title,
    "Package-provided review session",
  );
  assert.equal(
    result.caseFile.representativeSessions[0].principal,
    sampleCaseSeedData[0].representativeSessions[0].principal,
  );
});

test("rejects invalid CasePackage input with runtime validation errors", () => {
  const invalidPackage = structuredClone(casePackageFixtures[0]) as Record<
    string,
    unknown
  >;
  invalidPackage.schema_version = "case_package.v9";

  const result = casePackageV01ToCaseFile(
    invalidPackage,
    sampleCaseSeedData[0],
  );

  assert.equal(result.ok, false);
  if (result.ok) {
    return;
  }

  assert.equal(
    result.errors.some((error) => error.code === "unsupported_schema_version"),
    true,
  );
});

test("rejects a contract-valid package missing data required by the current UI", () => {
  const incompletePackage = structuredClone(casePackageFixtures[0]);
  incompletePackage.neighbor_clusters = [];
  incompletePackage.cluster.embedding_map = undefined;
  incompletePackage.representative_sessions = [];
  incompletePackage.outlier_impostor_candidates = [];
  incompletePackage.metrics.model_agreement = {
    status: "unavailable",
    reason: "Not included in this otherwise valid package.",
  };
  incompletePackage.candidate_labels = incompletePackage.candidate_labels.map(
    (label) => ({ ...label, source: "human_baseline" as const }),
  );

  assert.equal(validateCasePackageV01(incompletePackage).ok, true);

  const result = casePackageV01ToCaseFile(
    incompletePackage,
    sampleCaseSeedData[0],
  );

  assert.equal(result.ok, false);
  if (result.ok) {
    return;
  }

  assert.deepEqual(
    result.errors.map((error) => error.code),
    [
      "ui_missing_ai_label",
      "ui_missing_representative_session",
      "ui_missing_neighbor_cluster",
      "ui_missing_embedding_coordinates",
      "ui_missing_metric",
    ],
  );
});
