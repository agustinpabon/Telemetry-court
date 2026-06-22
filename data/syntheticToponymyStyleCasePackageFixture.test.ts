import assert from "node:assert/strict";
import test from "node:test";

import {
  createSyntheticToponymyStyleCasePackageV01,
  syntheticToponymyStyleAdapterInputFixture,
  syntheticToponymyStyleCasePackageV01,
} from "@/data/syntheticToponymyStyleCasePackageFixture";
import { validateCasePackageV01 } from "@/lib/casePackageValidation";
import {
  CASE_PACKAGE_V01_SCHEMA_VERSION,
  CASE_PACKAGE_V01_EVIDENCE_RATINGS,
  CASE_PACKAGE_V01_RECOMMENDED_ACTIONS,
  CASE_PACKAGE_V01_REQUIRED_REVIEWER_ACTIONS,
  CASE_PACKAGE_V01_REQUIRED_REVIEW_STAGES,
  CASE_PACKAGE_V01_VERDICTS,
} from "@/lib/types";

test("synthetic Toponymy-style fixture output validates as CasePackage v0.1", () => {
  const result = validateCasePackageV01(syntheticToponymyStyleCasePackageV01);

  assert.equal(result.ok, true);
  if (!result.ok) {
    return;
  }

  assert.equal(result.package.schema_version, CASE_PACKAGE_V01_SCHEMA_VERSION);
  assert.equal(
    result.package.package_id,
    "pkg-synthetic-toponymy-style-access-review-001",
  );
  assert.equal(result.package.case.reviewable_status, "synthetic_demo");
  assert.equal(result.package.dataset.data_classification, "synthetic");
  assert.equal(result.package.sanitization.status, "synthetic");
  assert.equal(result.package.sanitization.raw_drilldown_allowed, false);
  assert.equal(result.package.dataset.approval_notes, undefined);
  assert.equal(result.package.sanitization.review_approval, undefined);
});

test("synthetic Toponymy-style fixture is labeled non-authoritative", () => {
  assert.equal(
    syntheticToponymyStyleAdapterInputFixture.input_schema_version,
    "adapter_input.toponymy_datamapplot_style.v0.1",
  );
  assert.equal(
    syntheticToponymyStyleAdapterInputFixture.source_kind,
    "combined_toponymy_datamapplot_style",
  );
  assert.ok(
    syntheticToponymyStyleAdapterInputFixture.limitations.some((limitation) =>
      limitation.includes("Synthetic fixture only"),
    ),
  );
  assert.ok(
    syntheticToponymyStyleAdapterInputFixture.limitations.some((limitation) =>
      limitation.includes("not real Toponymy output"),
    ),
  );
  assert.equal(
    syntheticToponymyStyleCasePackageV01.provenance.adapter_name,
    "synthetic-toponymy-style-fixture-converter",
  );
  assert.ok(
    syntheticToponymyStyleCasePackageV01.case.limitations?.some((limitation) =>
      limitation.includes("non-authoritative"),
    ),
  );
});

test("synthetic Toponymy-style fixture does not require raw restricted telemetry", () => {
  const packageFixture = createSyntheticToponymyStyleCasePackageV01(
    syntheticToponymyStyleAdapterInputFixture,
  );
  const serializedFixture = JSON.stringify(packageFixture);

  assert.equal(packageFixture.sanitization.raw_drilldown_allowed, false);
  assert.equal(packageFixture.sanitization.safe_reference_type, "source_artifact_id");
  assert.equal(serializedFixture.includes("raw_telemetry"), false);
  assert.equal(serializedFixture.includes("restricted_payload"), false);

  for (const evidenceItem of packageFixture.evidence_items) {
    assert.equal(evidenceItem.sanitization_status, "synthetic");
    assert.equal(
      evidenceItem.source_reference.safe_reference?.reference_type,
      "source_artifact_id",
    );
  }

  const featureSummary = packageFixture.evidence_items.find(
    (evidenceItem) => evidenceItem.evidence_id === "evidence-synthetic-access-map-summary",
  );
  assert.ok(featureSummary);
  assert.deepEqual(featureSummary.content, {
    content_type: "structured_summary",
    fields: {
      synthetic_point_count: 4,
      synthetic_feature_families: [
        "access-change",
        "scheduled-maintenance",
        "review-context",
      ],
      raw_events_included: false,
    },
  });
});

test("synthetic Toponymy-style fixture uses canonical review configuration values", () => {
  assert.deepEqual(syntheticToponymyStyleCasePackageV01.review_configuration, {
    blind_review_enabled: true,
    initially_hidden_label_ids: ["label-synthetic-access-maintenance"],
    initially_revealed_label_ids: ["label-synthetic-routine-maintenance"],
    required_review_stages: [...CASE_PACKAGE_V01_REQUIRED_REVIEW_STAGES],
    allowed_evidence_ratings: [...CASE_PACKAGE_V01_EVIDENCE_RATINGS],
    allowed_verdicts: [...CASE_PACKAGE_V01_VERDICTS],
    allowed_recommended_actions: [...CASE_PACKAGE_V01_RECOMMENDED_ACTIONS],
    required_reviewer_actions: [...CASE_PACKAGE_V01_REQUIRED_REVIEWER_ACTIONS],
  });
});
