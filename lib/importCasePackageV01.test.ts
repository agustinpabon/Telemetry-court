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
  buildArenaReview,
  createInitialArenaState,
  getCurrentReviewState,
  getEvidenceRatings,
  getSelectedCase,
} from "@/lib/arenaReviewState";
import { buildReviewResultExport } from "@/lib/exportReview";
import { importCasePackageV01Json } from "@/lib/importCasePackageV01";

test("valid CasePackage JSON imports and opens as review state", () => {
  const packageFixture = casePackageFixtures[0];
  const importResult = importCasePackageV01Json(JSON.stringify(packageFixture));

  assert.equal(importResult.ok, true);
  if (!importResult.ok) {
    return;
  }

  assert.equal(
    importResult.caseFile.id,
    "imported:pkg-synthetic-arena-001:r1:case-arena-001",
  );
  assert.equal(
    importResult.caseFile.casePackageReference?.case_id,
    packageFixture.case.case_id,
  );
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

test("importing a package with a demo case ID does not inherit seeded verdict state", () => {
  const packageFixture = casePackageFixtures[0];
  const importResult = importCasePackageV01Json(JSON.stringify(packageFixture));

  assert.equal(importResult.ok, true);
  if (!importResult.ok) {
    return;
  }

  const cases = [importResult.caseFile, ...sampleCases];
  const arenaState = arenaReducer(
    createInitialArenaState(cases, "verdict"),
    {
      type: "startImportedCaseReview",
      caseId: importResult.caseFile.id,
    },
    cases,
  );

  assert.equal(packageFixture.case.case_id, "case-arena-001");
  assert.notEqual(importResult.caseFile.id, packageFixture.case.case_id);
  assert.equal(arenaState.selectedCaseId, importResult.caseFile.id);
  assert.deepEqual(getCurrentReviewState(arenaState), {});
});

test("imported review starts empty when session state exists for the same demo case ID", () => {
  const packageFixture = casePackageFixtures[0];
  const importResult = importCasePackageV01Json(JSON.stringify(packageFixture));

  assert.equal(importResult.ok, true);
  if (!importResult.ok) {
    return;
  }

  let arenaState = arenaReducer(
    createInitialArenaState(sampleCases),
    {
      type: "hydrateSession",
      selectedCaseId: "case-arena-001",
      reviewsByCase: {
        "case-arena-001": {
          blindChoiceId: "cloud-resource-discovery",
          aiLabelRevealed: true,
          evidenceRatings: { "iam-e-01": "supports_label" },
          labelDuelWinnerId: "label-iam-baseline",
          impostorSessionId: "iam-s-01",
          failureModes: ["missing_evidence"],
          finalVerdict: "unsupported_overclaimed",
        },
      },
    },
    sampleCases,
  );

  const cases = [importResult.caseFile, ...sampleCases];
  arenaState = arenaReducer(
    arenaState,
    {
      type: "startImportedCaseReview",
      caseId: importResult.caseFile.id,
    },
    cases,
  );

  assert.equal(importResult.package.case.case_id, "case-arena-001");
  assert.deepEqual(getCurrentReviewState(arenaState), {});
  assert.deepEqual(arenaState.reviewsByCase["case-arena-001"], {
    blindChoiceId: "cloud-resource-discovery",
    aiLabelRevealed: true,
    evidenceRatings: { "iam-e-01": "supports_label" },
    labelDuelWinnerId: "label-iam-baseline",
    impostorSessionId: "iam-s-01",
    failureModes: ["missing_evidence"],
    finalVerdict: "unsupported_overclaimed",
  });
});

test("selecting a blind interpretation on an imported package enables AI Reveal progression", () => {
  const importResult = importCasePackageV01Json(
    JSON.stringify(casePackageFixtures[0]),
  );

  assert.equal(importResult.ok, true);
  if (!importResult.ok) {
    return;
  }

  const cases = [importResult.caseFile, ...sampleCases];
  const blindChoice = importResult.caseFile.blindInterpretationOptions[0];
  assert.ok(blindChoice);

  let arenaState = arenaReducer(
    createInitialArenaState(cases),
    {
      type: "startImportedCaseReview",
      caseId: importResult.caseFile.id,
    },
    cases,
  );
  arenaState = arenaReducer(
    arenaState,
    { type: "chooseBlindInterpretation", optionId: blindChoice.id },
    cases,
  );
  arenaState = arenaReducer(arenaState, { type: "revealAiLabel" }, cases);

  assert.equal(arenaState.activeStage, "ai_reveal");
  assert.equal(getCurrentReviewState(arenaState).blindChoiceId, blindChoice.id);
  assert.equal(getCurrentReviewState(arenaState).aiLabelRevealed, true);
});

test("ReviewResult export preserves imported CasePackage identity", () => {
  const importResult = importCasePackageV01Json(
    JSON.stringify(casePackageFixtures[0]),
  );

  assert.equal(importResult.ok, true);
  if (!importResult.ok) {
    return;
  }

  const caseFile = importResult.caseFile;
  const blindChoice = caseFile.blindInterpretationOptions[0];
  const labelWinner = caseFile.candidateLabels[0];
  const impostor = caseFile.representativeSessions[0];

  assert.ok(blindChoice);
  assert.ok(labelWinner);
  assert.ok(impostor);

  const arenaReview = buildArenaReview(
    caseFile,
    {
      blindChoiceId: blindChoice.id,
      aiLabelRevealed: true,
      labelDuelWinnerId: labelWinner.id,
      impostorSessionId: impostor.id,
      finalVerdict: "partially_supported",
    },
    getEvidenceRatings(caseFile, {}),
  );
  const reviewResult = buildReviewResultExport({
    caseFile,
    exportTimestamp: "2026-06-21T23:00:00.000Z",
    arenaReview,
  });

  assert.notEqual(caseFile.id, importResult.package.case.case_id);
  assert.equal(reviewResult.case_package.package_id, importResult.package.package_id);
  assert.equal(reviewResult.case_package.case_id, importResult.package.case.case_id);
  assert.equal(reviewResult.case_package.cluster_id, importResult.package.cluster.cluster_id);
  assert.equal(
    reviewResult.reviewer.review_session_id,
    `${importResult.package.package_id}:${importResult.package.case.case_id}:local-session`,
  );
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
