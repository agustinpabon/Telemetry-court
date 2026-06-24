import assert from "node:assert/strict";
import test from "node:test";

import { casePackageFixtures } from "@/data/casePackageFixtures";
import { aggregateReviewResultsV01 } from "@/lib/evaluationReportV01";
import {
  CASE_PACKAGE_SESSION_STORE_V01_KEY,
  loadCasePackagesFromSessionStoreV01,
  saveCasePackageToSessionStoreV01,
} from "@/lib/casePackageSessionStorageV01";
import { buildResultsGalaxyMapV01 } from "@/lib/resultsGalaxyMapV01";
import type { ReviewResultV01 } from "@/lib/reviewResultV01";
import type { CasePackageV01 } from "@/lib/types";

test("browser-session cache keeps only compact results-map metadata", () => {
  const storage = createMemoryStorage();
  const casePackage = requireCasePackageFixture();

  saveCasePackageToSessionStoreV01(storage, casePackage);

  const loadedPackages = loadCasePackagesFromSessionStoreV01(storage);
  const storedJson = storage.getItem(CASE_PACKAGE_SESSION_STORE_V01_KEY) ?? "";

  assert.equal(loadedPackages.length, 1);
  assert.equal(
    loadedPackages[0]?.case_package.package_id,
    casePackage.package_id,
  );
  assert.equal(
    loadedPackages[0]?.cluster.coordinates?.x,
    casePackage.cluster.embedding_map?.coordinates?.x,
  );
  assert.doesNotMatch(storedJson, /evidence_items/);
  assert.doesNotMatch(storedJson, /claims/);
  assert.doesNotMatch(storedJson, /representative_sessions/);
  assert.doesNotMatch(storedJson, /provenance/);
  assert.doesNotMatch(storedJson, /sanitization/);
});

test("saving the same exact CasePackage reference replaces its cached metadata", () => {
  const storage = createMemoryStorage();
  const casePackage = requireCasePackageFixture();
  const updatedPackage = {
    ...casePackage,
    case: {
      ...casePackage.case,
      title: "Updated local package title",
    },
  };

  saveCasePackageToSessionStoreV01(storage, casePackage);
  saveCasePackageToSessionStoreV01(storage, updatedPackage);

  const loadedPackages = loadCasePackagesFromSessionStoreV01(storage);
  assert.equal(loadedPackages.length, 1);
  assert.equal(loadedPackages[0]?.case.title, "Updated local package title");
});

test("results mapping reuses compatible cached CasePackage coordinates after reload", () => {
  const storage = createMemoryStorage();
  const casePackage = requireCasePackageFixture();
  const reviewResult = createReviewResultFromPackage(casePackage);
  const report = aggregateReviewResultsV01([reviewResult]);

  saveCasePackageToSessionStoreV01(storage, casePackage);
  const reloadedPackages = loadCasePackagesFromSessionStoreV01(storage);
  const map = buildResultsGalaxyMapV01({
    packageGroups: [
      {
        casePackageId: casePackage.package_id,
        reviewResultCount: 1,
        report,
        sourceReviewResults: [reviewResult],
      },
    ],
    casePackages: reloadedPackages,
  });

  assert.equal(map.nodes.length, 1);
  assert.equal(map.unavailable.length, 0);
  assert.equal(
    map.nodes[0]?.casePackage.case_package.package_id,
    casePackage.package_id,
  );
});

test("results mapping rejects cached metadata with different blind-review configuration", () => {
  const storage = createMemoryStorage();
  const casePackage = requireCasePackageFixture();
  const reviewResult = createReviewResultFromPackage(casePackage);
  const report = aggregateReviewResultsV01([reviewResult]);

  saveCasePackageToSessionStoreV01(storage, {
    ...casePackage,
    review_configuration: {
      ...casePackage.review_configuration,
      blind_review_enabled: false,
    },
  });
  const map = buildResultsGalaxyMapV01({
    packageGroups: [
      {
        casePackageId: casePackage.package_id,
        reviewResultCount: 1,
        report,
        sourceReviewResults: [reviewResult],
      },
    ],
    casePackages: loadCasePackagesFromSessionStoreV01(storage),
  });

  assert.equal(map.nodes.length, 0);
  assert.equal(
    map.unavailable[0]?.reason,
    "incompatible_case_package_reference",
  );
});

test("invalid cached CasePackage metadata fails loudly and a fresh import repairs it", () => {
  const storage = createMemoryStorage();
  const casePackage = requireCasePackageFixture();
  storage.setItem(
    CASE_PACKAGE_SESSION_STORE_V01_KEY,
    JSON.stringify({
      schema_version: "case_package_session_store.v0.1",
      case_package_metadata: [{ schema_version: "case_package.v0.1" }],
    }),
  );

  assert.throws(
    () => loadCasePackagesFromSessionStoreV01(storage),
    /Cannot load cached CasePackage metadata at index 0/,
  );

  saveCasePackageToSessionStoreV01(storage, casePackage);

  assert.equal(
    loadCasePackagesFromSessionStoreV01(storage)[0]?.case_package.package_id,
    casePackage.package_id,
  );
});

function requireCasePackageFixture(): CasePackageV01 {
  const fixture = casePackageFixtures[0];

  if (!fixture) {
    throw new Error("Expected at least one CasePackage fixture.");
  }

  return fixture;
}

function createReviewResultFromPackage(
  casePackage: CasePackageV01,
): ReviewResultV01 {
  return {
    schema_version: "review_result.v0.1",
    review_id: "review-session-cache-reload",
    created_at: "2026-06-24T12:00:00.000Z",
    case_package: {
      schema_version: casePackage.schema_version,
      package_id: casePackage.package_id,
      package_revision: casePackage.package_revision,
      case_id: casePackage.case.case_id,
      cluster_id: casePackage.cluster.cluster_id,
      pipeline: {
        pipeline_id: casePackage.pipeline.pipeline_id,
        run_id: casePackage.pipeline.run_id,
        upstream_tool: casePackage.pipeline.upstream_tool,
        pipeline_version: casePackage.pipeline.pipeline_version,
        embedding_model: casePackage.pipeline.embedding_model,
        clustering_method: casePackage.pipeline.clustering_method,
        dimensionality_reduction_method:
          casePackage.pipeline.dimensionality_reduction_method,
        naming_model: casePackage.pipeline.naming_model,
        prompt_id: casePackage.pipeline.prompt?.prompt_id,
        prompt_version: casePackage.pipeline.prompt?.prompt_version,
        prompt_digest: casePackage.pipeline.prompt?.prompt_digest,
        generated_at: casePackage.pipeline.generated_at,
      },
    },
    reviewer: {
      reviewer_id: "reviewer-session-cache",
      review_session_id: "session-cache",
      context: "local_review",
    },
    protocol: {
      protocol_version: "telemetry_court_review.v0.1",
      blind_review_enabled:
        casePackage.review_configuration.blind_review_enabled,
      ai_label_revealed: true,
    },
    decisions: {
      blind_interpretation: {
        option_id: "blind-option-1",
        label: "Synthetic interpretation",
        agrees_with_ai: true,
      },
      label_comparison: {
        selected_label_id:
          casePackage.candidate_labels[0]?.label_id ?? "label-unavailable",
        reason_codes: ["better_supported"],
      },
      evidence_ratings: casePackage.evidence_items.map((evidence) => ({
        evidence_id: evidence.evidence_id,
        rating: "supports",
      })),
      outlier_impostor: {
        selected_session_id:
          casePackage.representative_sessions[0]?.session_id ??
          "session-unavailable",
      },
      failure_modes: [],
      final_verdict: "supported",
      recommended_action: "accept_label",
    },
  };
}

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
