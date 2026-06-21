import assert from "node:assert/strict";
import test from "node:test";

import { casePackageFixtures } from "@/data/casePackageFixtures";
import { sampleCases } from "@/data/sampleCases";
import { sampleCaseSeedData } from "@/data/sampleCaseSeedData";
import { validateCasePackageV01 } from "@/lib/casePackageValidation";
import {
  CASE_PACKAGE_V01_EVIDENCE_RATINGS,
  CASE_PACKAGE_V01_RECOMMENDED_ACTIONS,
  CASE_PACKAGE_V01_REQUIRED_REVIEWER_ACTIONS,
  CASE_PACKAGE_V01_REQUIRED_REVIEW_STAGES,
  CASE_PACKAGE_V01_SCHEMA_VERSION,
  CASE_PACKAGE_V01_VERDICTS,
} from "@/lib/types";

test("current synthetic sample cases have package-shaped CasePackage v0.1 fixtures", () => {
  assert.equal(casePackageFixtures.length, sampleCaseSeedData.length);

  const packageIds = new Set<string>();

  for (const [index, packageFixture] of casePackageFixtures.entries()) {
    const seedCase = sampleCaseSeedData[index];
    const result = validateCasePackageV01(packageFixture);

    assert.equal(result.ok, true);
    assert.equal(packageFixture.schema_version, CASE_PACKAGE_V01_SCHEMA_VERSION);
    assert.equal(packageFixture.case.case_id, seedCase.id);
    assert.equal(packageFixture.cluster.cluster_id, seedCase.cluster.id);
    assert.equal(
      packageFixture.candidate_labels.length,
      seedCase.candidateLabels.length,
    );
    assert.equal(packageFixture.claims.length, seedCase.claims.length);
    assert.equal(
      packageFixture.evidence_items.length,
      seedCase.evidenceItems.length,
    );
    assert.equal(
      packageFixture.evidence_to_claim_mappings.length,
      seedCase.evidenceRelations.length,
    );
    assert.equal(
      packageFixture.representative_sessions.length,
      seedCase.representativeSessions.length,
    );
    assert.equal(packageFixture.provenance.provenance_id, `prov-${seedCase.id}`);
    assert.equal(packageFixture.sanitization.status, "synthetic");
    assert.equal(packageFixture.sanitization.raw_drilldown_allowed, false);
    assert.equal(packageIds.has(packageFixture.package_id), false);
    packageIds.add(packageFixture.package_id);
  }
});

test("package fixtures use canonical CasePackage v0.1 review configuration values", () => {
  for (const packageFixture of casePackageFixtures) {
    assert.deepEqual(packageFixture.review_configuration, {
      blind_review_enabled: true,
      initially_hidden_label_ids: packageFixture.candidate_labels
        .filter((label) => label.source === "ai_generated")
        .map((label) => label.label_id),
      initially_revealed_label_ids: packageFixture.candidate_labels
        .filter((label) => label.source !== "ai_generated")
        .map((label) => label.label_id),
      required_review_stages: [...CASE_PACKAGE_V01_REQUIRED_REVIEW_STAGES],
      allowed_evidence_ratings: [...CASE_PACKAGE_V01_EVIDENCE_RATINGS],
      allowed_verdicts: [...CASE_PACKAGE_V01_VERDICTS],
      allowed_recommended_actions: [...CASE_PACKAGE_V01_RECOMMENDED_ACTIONS],
      required_reviewer_actions: [
        ...CASE_PACKAGE_V01_REQUIRED_REVIEWER_ACTIONS,
      ],
    });
  }
});

test("CasePackage compatibility adapter preserves the current UI sample case shape", () => {
  assert.deepEqual(
    sampleCases.map((caseFile) => {
      const compatibleCase = { ...caseFile };
      delete compatibleCase.casePackageReference;
      return compatibleCase;
    }),
    sampleCaseSeedData,
  );
});
