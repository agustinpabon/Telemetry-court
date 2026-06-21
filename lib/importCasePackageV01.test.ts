import assert from "node:assert/strict";
import test from "node:test";

import { casePackageFixtures } from "@/data/casePackageFixtures";
import {
  buildPackageReviewRenderState,
  sampleCases,
} from "@/data/sampleCases";
import { sampleCaseSeedData } from "@/data/sampleCaseSeedData";
import {
  arenaReducer,
  createInitialArenaState,
  getSelectedCase,
} from "@/lib/arenaReviewState";
import { importCasePackageV01Json } from "@/lib/importCasePackageV01";

test("valid CasePackage JSON imports and opens as review state", () => {
  const packageFixture = casePackageFixtures[0];
  const importResult = importCasePackageV01Json(JSON.stringify(packageFixture));

  assert.equal(importResult.ok, true);
  if (!importResult.ok) {
    return;
  }

  assert.equal(importResult.caseFile.id, packageFixture.case.case_id);
  assert.equal(
    importResult.caseFile.casePackageReference?.package_id,
    packageFixture.package_id,
  );
  assert.equal(
    importResult.caseFile.candidateLabels.length,
    packageFixture.candidate_labels.length,
  );
  assert.equal(
    importResult.caseFile.evidenceItems.length,
    packageFixture.evidence_items.length,
  );

  const cases = [
    importResult.caseFile,
    ...sampleCases.filter((caseFile) => caseFile.id !== importResult.caseFile.id),
  ];
  const arenaState = arenaReducer(
    createInitialArenaState(sampleCases),
    {
      type: "startImportedCaseReview",
      caseId: importResult.caseFile.id,
    },
    cases,
  );

  assert.equal(arenaState.selectedCaseId, importResult.caseFile.id);
  assert.equal(arenaState.activeStage, "case_file");
  assert.deepEqual(arenaState.reviewsByCase[importResult.caseFile.id], {});
  assert.equal(getSelectedCase(cases, arenaState)?.id, importResult.caseFile.id);
});

test("malformed JSON shows parse diagnostics and cannot produce a review case", () => {
  const importResult = importCasePackageV01Json("{not-json");

  assert.equal(importResult.ok, false);
  if (importResult.ok) {
    return;
  }

  assert.equal(importResult.reason, "malformed_json");
  assert.equal(Object.hasOwn(importResult, "caseFile"), false);
  assert.equal(importResult.errors[0]?.code, "invalid_json");
  assert.match(importResult.title, /Malformed JSON/);
  assert.match(importResult.summary, /review cannot start/i);
  assert.match(importResult.suggestedFix, /JSON syntax/);
});

test("missing or unsupported schema version shows schema diagnostics", () => {
  const packageWithoutSchemaVersion = structuredClone(
    casePackageFixtures[0],
  ) as Record<string, unknown>;
  delete packageWithoutSchemaVersion.schema_version;

  const missingVersionResult = importCasePackageV01Json(
    JSON.stringify(packageWithoutSchemaVersion),
  );

  assert.equal(missingVersionResult.ok, false);
  if (missingVersionResult.ok) {
    return;
  }

  assert.equal(missingVersionResult.reason, "schema_version");
  assert.match(missingVersionResult.title, /schema version/i);
  assert.equal(
    missingVersionResult.errors.some(
      (error) =>
        error.path === "$.schema_version" &&
        error.code === "missing_required_field",
    ),
    true,
  );

  const unsupportedPackage = structuredClone(casePackageFixtures[0]) as Record<
    string,
    unknown
  >;
  unsupportedPackage.schema_version = "case_package.v9";

  const unsupportedVersionResult = importCasePackageV01Json(
    JSON.stringify(unsupportedPackage),
  );

  assert.equal(unsupportedVersionResult.ok, false);
  if (unsupportedVersionResult.ok) {
    return;
  }

  assert.equal(unsupportedVersionResult.reason, "schema_version");
  assert.equal(
    unsupportedVersionResult.errors.some(
      (error) => error.code === "unsupported_schema_version",
    ),
    true,
  );
});

test("structurally invalid CasePackage JSON shows validation diagnostics", () => {
  const invalidPackage = structuredClone(casePackageFixtures[0]) as Record<
    string,
    unknown
  >;
  delete invalidPackage.provenance;

  const importResult = importCasePackageV01Json(JSON.stringify(invalidPackage));

  assert.equal(importResult.ok, false);
  if (importResult.ok) {
    return;
  }

  assert.equal(importResult.reason, "validation");
  assert.match(importResult.title, /validation failed/i);
  assert.match(importResult.summary, /package validation/i);
  assert.equal(
    importResult.errors.some(
      (error) =>
        error.code === "missing_required_field" &&
        error.path.includes("provenance"),
    ),
    true,
  );
});

test("contract-valid packages that cannot enter review show readiness diagnostics", () => {
  const unreadablePackage = structuredClone(casePackageFixtures[0]);
  unreadablePackage.neighbor_clusters = [];
  unreadablePackage.cluster.embedding_map = undefined;
  unreadablePackage.representative_sessions = [];
  unreadablePackage.outlier_impostor_candidates = [];
  unreadablePackage.metrics.model_agreement = {
    status: "unavailable",
    reason: "Not included in this otherwise valid package.",
  };
  unreadablePackage.candidate_labels = unreadablePackage.candidate_labels.map(
    (label) => ({ ...label, source: "human_baseline" as const }),
  );

  const importResult = importCasePackageV01Json(
    JSON.stringify(unreadablePackage),
  );

  assert.equal(importResult.ok, false);
  if (importResult.ok) {
    return;
  }

  assert.equal(importResult.reason, "adapter_readiness");
  assert.match(importResult.title, /review cannot start/i);
  assert.equal(
    importResult.errors.some((error) => error.code === "ui_missing_ai_label"),
    true,
  );
  assert.equal(
    importResult.errors.some(
      (error) => error.code === "ui_missing_neighbor_cluster",
    ),
    true,
  );
});

test("existing demo fixture flow still renders from package fixtures", () => {
  const renderState = buildPackageReviewRenderState(
    casePackageFixtures,
    sampleCaseSeedData,
  );

  assert.equal(renderState.ok, true);
  if (!renderState.ok) {
    return;
  }

  assert.equal(renderState.cases.length, sampleCases.length);
  assert.deepEqual(
    renderState.cases.map((caseFile) => caseFile.id),
    sampleCases.map((caseFile) => caseFile.id),
  );
});

test("a valid package can replace a failed import attempt", () => {
  const failedResult = importCasePackageV01Json("{not-json");
  assert.equal(failedResult.ok, false);

  const recoveredResult = importCasePackageV01Json(
    JSON.stringify(casePackageFixtures[0]),
  );

  assert.equal(recoveredResult.ok, true);
  if (!recoveredResult.ok) {
    return;
  }

  assert.equal(
    recoveredResult.caseFile.casePackageReference?.package_id,
    casePackageFixtures[0].package_id,
  );
});
