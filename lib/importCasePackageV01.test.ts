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

test("invalid JSON is rejected before entering review", () => {
  const importResult = importCasePackageV01Json("{not-json");

  assert.equal(importResult.ok, false);
  if (importResult.ok) {
    return;
  }

  assert.equal(importResult.reason, "invalid_json");
  assert.equal(importResult.errors[0]?.code, "invalid_json");
  assert.match(importResult.message, /Invalid JSON/);
});

test("structurally invalid CasePackage JSON is rejected", () => {
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

  assert.equal(importResult.reason, "invalid_case_package");
  assert.equal(
    importResult.errors.some(
      (error) =>
        error.code === "missing_required_field" &&
        error.path.includes("provenance"),
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

test("import does not bypass CasePackage schema version validation", () => {
  const unsupportedPackage = structuredClone(casePackageFixtures[0]) as Record<
    string,
    unknown
  >;
  unsupportedPackage.schema_version = "case_package.v9";

  const importResult = importCasePackageV01Json(
    JSON.stringify(unsupportedPackage),
  );

  assert.equal(importResult.ok, false);
  if (importResult.ok) {
    return;
  }

  assert.equal(importResult.reason, "invalid_case_package");
  assert.equal(
    importResult.errors.some(
      (error) => error.code === "unsupported_schema_version",
    ),
    true,
  );
});
