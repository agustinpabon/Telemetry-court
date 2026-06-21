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

  const { casePackageReference, ...caseFile } = result.caseFile;

  assert.deepEqual(caseFile, sampleCaseSeedData[0]);
  assert.deepEqual(casePackageReference, {
    schema_version: "case_package.v0.1",
    package_id: "pkg-synthetic-arena-001",
    package_revision: "r1",
    case_id: "case-arena-001",
    cluster_id: "cluster-iam-029",
    pipeline: {
      pipeline_id: "pipeline-synthetic-sample-fixtures",
      run_id: "run-case-arena-001-synthetic-fixture",
      upstream_tool: "synthetic-demo-fixture",
      pipeline_version: "0.1.0",
      embedding_model: "synthetic-embedding-fixture",
      clustering_method: "synthetic-static-clustering",
      dimensionality_reduction_method: "synthetic-static-review-map",
      naming_model: "Baseline AI labeler v0.7",
      prompt_id: "prompt-synthetic-baseline-labeler-v0.7",
      generated_at: "2026-06-13T13:10:00Z",
    },
    blind_review_enabled: true,
  });
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
