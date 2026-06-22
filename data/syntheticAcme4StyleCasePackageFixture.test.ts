import assert from "node:assert/strict";
import test from "node:test";

import {
  createSyntheticAcme4StyleCasePackageV01,
  syntheticAcme4StyleAdapterInputFixture,
  syntheticAcme4StyleCasePackageV01,
} from "@/data/syntheticAcme4StyleCasePackageFixture";
import { validateCasePackageV01 } from "@/lib/casePackageValidation";
import {
  CASE_PACKAGE_V01_EVIDENCE_RATINGS,
  CASE_PACKAGE_V01_RECOMMENDED_ACTIONS,
  CASE_PACKAGE_V01_REQUIRED_REVIEWER_ACTIONS,
  CASE_PACKAGE_V01_REQUIRED_REVIEW_STAGES,
  CASE_PACKAGE_V01_SCHEMA_VERSION,
  CASE_PACKAGE_V01_VERDICTS,
} from "@/lib/types";

test("synthetic ACME4-style fixture output validates as CasePackage v0.1", () => {
  const result = validateCasePackageV01(syntheticAcme4StyleCasePackageV01);

  assert.equal(result.ok, true);
  if (!result.ok) {
    return;
  }

  assert.equal(result.package.schema_version, CASE_PACKAGE_V01_SCHEMA_VERSION);
  assert.equal(
    result.package.package_id,
    "pkg-synthetic-acme4-style-access-review-001",
  );
  assert.equal(result.package.case.reviewable_status, "synthetic_demo");
  assert.equal(result.package.dataset.data_classification, "synthetic");
  assert.equal(result.package.sanitization.status, "synthetic");
  assert.equal(result.package.sanitization.raw_drilldown_allowed, false);
  assert.equal(result.package.dataset.approval_notes, undefined);
  assert.equal(result.package.sanitization.review_approval, undefined);
});

test("synthetic ACME4-style fixture is explicitly synthetic and non-authoritative", () => {
  assert.equal(
    syntheticAcme4StyleAdapterInputFixture.input_schema_version,
    "adapter_input.acme4_style_sanitized.v0.1",
  );
  assert.equal(
    syntheticAcme4StyleAdapterInputFixture.source_kind,
    "acme4_style_synthetic_sanitized",
  );
  assert.ok(
    syntheticAcme4StyleAdapterInputFixture.limitations.some((limitation) =>
      limitation.includes("Synthetic ACME4-style fixture only"),
    ),
  );
  assert.ok(
    syntheticAcme4StyleAdapterInputFixture.limitations.some((limitation) =>
      limitation.includes("not real ACME4 output"),
    ),
  );
  assert.equal(
    syntheticAcme4StyleCasePackageV01.provenance.adapter_name,
    "synthetic-acme4-style-fixture-converter",
  );
  assert.ok(
    syntheticAcme4StyleCasePackageV01.case.limitations?.some((limitation) =>
      limitation.includes("non-authoritative"),
    ),
  );
});

test("synthetic ACME4-style fixture keeps evidence provenance and sanitization safe", () => {
  const packageFixture = createSyntheticAcme4StyleCasePackageV01(
    syntheticAcme4StyleAdapterInputFixture,
  );

  assert.equal(
    packageFixture.provenance.source_system,
    "telemetry-court-synthetic-acme4-style-fixtures",
  );
  assert.equal(packageFixture.sanitization.allowed_display_level, "summary_only");
  assert.equal(packageFixture.sanitization.safe_reference_type, "source_artifact_id");

  for (const evidenceItem of packageFixture.evidence_items) {
    assert.equal(
      evidenceItem.provenance_reference,
      packageFixture.provenance.provenance_id,
    );
    assert.equal(evidenceItem.sanitization_status, "synthetic");
    assert.equal(
      evidenceItem.source_reference.safe_reference?.reference_type,
      "source_artifact_id",
    );
    assert.ok(
      evidenceItem.source_reference.safe_reference?.artifact_id?.startsWith(
        syntheticAcme4StyleAdapterInputFixture.artifact_id,
      ),
    );
  }
});

test("synthetic ACME4-style fixture does not require restricted raw values", () => {
  const packageFixture = createSyntheticAcme4StyleCasePackageV01(
    syntheticAcme4StyleAdapterInputFixture,
  );
  const serializedFixture = JSON.stringify(packageFixture);

  assert.equal(packageFixture.sanitization.raw_drilldown_allowed, false);
  assert.equal(serializedFixture.includes("raw_telemetry"), false);
  assert.equal(serializedFixture.includes("restricted_payload"), false);
  assert.equal(serializedFixture.includes("sourceIPAddress"), false);
  assert.equal(serializedFixture.includes("userIdentity"), false);
  assert.equal(serializedFixture.includes("arn:"), false);
  assert.equal(serializedFixture.includes("AKIA"), false);

  const aggregateSummary = packageFixture.evidence_items.find(
    (evidenceItem) =>
      evidenceItem.evidence_id === "evidence-synthetic-acme4-aggregate-summary",
  );
  assert.ok(aggregateSummary);
  assert.deepEqual(aggregateSummary.content, {
    content_type: "structured_summary",
    fields: {
      synthetic_session_count: 5,
      sanitized_feature_families: [
        "access-update",
        "approval-context",
        "service-change",
      ],
      raw_events_included: false,
      restricted_values_required: false,
    },
  });
});

test("synthetic ACME4-style fixture uses canonical review configuration values", () => {
  assert.deepEqual(syntheticAcme4StyleCasePackageV01.review_configuration, {
    blind_review_enabled: true,
    initially_hidden_label_ids: ["label-synthetic-acme4-access-change"],
    initially_revealed_label_ids: ["label-synthetic-acme4-planned-change"],
    required_review_stages: [...CASE_PACKAGE_V01_REQUIRED_REVIEW_STAGES],
    allowed_evidence_ratings: [...CASE_PACKAGE_V01_EVIDENCE_RATINGS],
    allowed_verdicts: [...CASE_PACKAGE_V01_VERDICTS],
    allowed_recommended_actions: [...CASE_PACKAGE_V01_RECOMMENDED_ACTIONS],
    required_reviewer_actions: [...CASE_PACKAGE_V01_REQUIRED_REVIEWER_ACTIONS],
  });
});
