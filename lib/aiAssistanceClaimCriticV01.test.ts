import assert from "node:assert/strict";
import test from "node:test";

import type { AiAssistanceResponseV01 } from "@/lib/aiAssistanceResponseV01";
import {
  createAiAssistanceClaimCriticReportV01,
  AI_ASSISTANCE_CLAIM_CRITIC_V01_SCHEMA_VERSION,
} from "@/lib/aiAssistanceClaimCriticV01";
import {
  invalidGenericChatbotLikeAiAssistanceResponseV01ForValidatorTest,
  mockAiAssistanceResponseV01Fixtures,
  mockGroundedAiAssistanceResponseV01,
  mockInsufficientEvidenceAiAssistanceResponseV01,
  mockOutOfScopeRefusalAiAssistanceResponseV01,
} from "@/lib/aiAssistanceResponseV01Fixtures";
import { minimalSyntheticCasePackageV01 } from "@/lib/casePackageV01Fixture";

test("grounded answered response reports cited evidence and claim links", () => {
  const report = createAiAssistanceClaimCriticReportV01(
    mockGroundedAiAssistanceResponseV01,
    { casePackage: minimalSyntheticCasePackageV01 },
  );

  assert.equal(
    report.schema_version,
    AI_ASSISTANCE_CLAIM_CRITIC_V01_SCHEMA_VERSION,
  );
  assert.equal(report.validation.ok, true);
  assert.equal(report.answer.assessment, "grounded_answer");
  assert.deepEqual(report.answer.evidence_ids, [
    "evidence-no-downstream-abuse",
    "evidence-role-lifecycle",
    "evidence-rollout-metadata",
  ]);
  assert.deepEqual(report.referenced_claim_ids, [
    "claim-planned-rollout",
    "claim-role-changes",
    "claim-suspicious-intent",
  ]);
  assert.deepEqual(report.missing_claim_ids, []);
  assert.deepEqual(report.unknown_claim_ids, []);
  assert.deepEqual(report.unknown_evidence_ids, []);
  assert.deepEqual(report.support_counts, {
    supports: 1,
    weak_support: 1,
    contradicts: 1,
    insufficient: 0,
    needs_more_context: 0,
  });
  assert.deepEqual(
    report.critique_items.map((item) => item.item_id),
    [
      "finding:finding-mock-role-lifecycle-supported",
      "finding:finding-mock-rollout-context-weak-support",
      "finding:finding-mock-intent-overclaim-contradicted",
    ],
  );
});

test("weak support remains distinct from stronger support", () => {
  const report = createAiAssistanceClaimCriticReportV01(
    mockGroundedAiAssistanceResponseV01,
    { casePackage: minimalSyntheticCasePackageV01 },
  );

  const plannedRollout = report.claims.find(
    (claim) => claim.claim_id === "claim-planned-rollout",
  );

  assert.deepEqual(plannedRollout, {
    claim_id: "claim-planned-rollout",
    coverage: "weak_support",
    finding_ids: ["finding-mock-rollout-context-weak-support"],
    evidence_ids: ["evidence-rollout-metadata"],
    support_counts: {
      supports: 0,
      weak_support: 1,
      contradicts: 0,
      insufficient: 0,
      needs_more_context: 0,
    },
    uncertainty_levels: ["medium"],
  });
});

test("contradiction remains distinct from weak support and uncertainty", () => {
  const report = createAiAssistanceClaimCriticReportV01(
    mockGroundedAiAssistanceResponseV01,
    { casePackage: minimalSyntheticCasePackageV01 },
  );

  const suspiciousIntent = report.claims.find(
    (claim) => claim.claim_id === "claim-suspicious-intent",
  );

  assert.equal(suspiciousIntent?.coverage, "contradicts");
  assert.deepEqual(suspiciousIntent?.evidence_ids, ["evidence-no-downstream-abuse"]);
  assert.deepEqual(suspiciousIntent?.uncertainty_levels, ["medium"]);
  assert.deepEqual(report.unsupported_claim_ids, ["claim-suspicious-intent"]);
});

test("insufficient evidence without evidence IDs is valid when explicit reason is present", () => {
  const report = createAiAssistanceClaimCriticReportV01(
    mockInsufficientEvidenceAiAssistanceResponseV01,
    { casePackage: minimalSyntheticCasePackageV01 },
  );

  assert.equal(report.validation.ok, true);
  assert.equal(report.answer.assessment, "valid_insufficient_evidence");
  assert.deepEqual(report.answer.issue_codes, []);
  assert.equal(
    report.answer.insufficiency_reason,
    "The evidence describes role lifecycle behavior and rollout context, but it does not include direct intent evidence.",
  );
  assert.deepEqual(report.support_counts, {
    supports: 0,
    weak_support: 0,
    contradicts: 0,
    insufficient: 1,
    needs_more_context: 0,
  });
  assert.deepEqual(report.unsupported_claim_ids, ["claim-suspicious-intent"]);
});

test("refusal outside scope is reported without inventing evidence support", () => {
  const report = createAiAssistanceClaimCriticReportV01(
    mockOutOfScopeRefusalAiAssistanceResponseV01,
    { casePackage: minimalSyntheticCasePackageV01 },
  );

  assert.equal(report.validation.ok, true);
  assert.equal(report.answer.assessment, "valid_refusal");
  assert.equal(report.answer.refusal_reason, "outside_case_scope");
  assert.deepEqual(report.answer.evidence_ids, []);
  assert.deepEqual(report.critique_items, [
    {
      item_id: "answer:refused",
      kind: "refusal",
      support: undefined,
      claim_ids: [],
      evidence_ids: [],
      finding_id: undefined,
      warning_code: undefined,
      validation_code: undefined,
      uncertainty_level: undefined,
      message: "outside_case_scope",
    },
    {
      item_id: "output_warning:warning-mock-outside-case-scope",
      kind: "output_warning",
      support: undefined,
      claim_ids: [],
      evidence_ids: [],
      finding_id: undefined,
      warning_code: "outside_case_scope",
      validation_code: undefined,
      uncertainty_level: undefined,
      message:
        "The mock response refuses operational remediation because the CasePackage is for evidence review only.",
    },
  ]);
});

test("missing claim coverage is explicit and stable", () => {
  const partialResponse: AiAssistanceResponseV01 = {
    ...mockGroundedAiAssistanceResponseV01,
    findings: [mockGroundedAiAssistanceResponseV01.findings[0]],
  };

  const report = createAiAssistanceClaimCriticReportV01(partialResponse, {
    casePackage: minimalSyntheticCasePackageV01,
  });

  assert.deepEqual(report.missing_claim_ids, [
    "claim-planned-rollout",
    "claim-suspicious-intent",
  ]);
  assert.deepEqual(
    report.critique_items
      .filter((item) => item.kind === "missing_claim_coverage")
      .map((item) => item.item_id),
    [
      "claim:claim-planned-rollout:missing_coverage",
      "claim:claim-suspicious-intent:missing_coverage",
    ],
  );
});

test("unknown claim and evidence references surface through context validation", () => {
  const responseWithUnknownReferences: AiAssistanceResponseV01 = {
    ...mockGroundedAiAssistanceResponseV01,
    answer: {
      ...mockGroundedAiAssistanceResponseV01.answer,
      evidence_ids: ["evidence-unknown-critic-reference"],
    },
    findings: [
      {
        ...mockGroundedAiAssistanceResponseV01.findings[0],
        evidence_ids: ["evidence-unknown-critic-reference"],
        related_claim_ids: ["claim-unknown-critic-reference"],
      },
    ],
  };

  const report = createAiAssistanceClaimCriticReportV01(
    responseWithUnknownReferences,
    { casePackage: minimalSyntheticCasePackageV01 },
  );

  assert.equal(report.validation.ok, false);
  assert.deepEqual(
    report.validation.errors.map((error) => error.code),
    [
      "unknown_evidence_reference",
      "unknown_evidence_reference",
      "unknown_claim_reference",
    ],
  );
  assert.deepEqual(report.unknown_claim_ids, ["claim-unknown-critic-reference"]);
  assert.deepEqual(report.unknown_evidence_ids, [
    "evidence-unknown-critic-reference",
  ]);
});

test("generic chatbot-like answer remains rejected and warning is propagated", () => {
  const report = createAiAssistanceClaimCriticReportV01(
    invalidGenericChatbotLikeAiAssistanceResponseV01ForValidatorTest,
    { casePackage: minimalSyntheticCasePackageV01 },
  );

  assert.equal(report.validation.ok, false);
  assert.deepEqual(
    report.validation.errors.map((error) => error.code),
    ["missing_answer_evidence", "missing_grounded_findings"],
  );
  assert.deepEqual(
    report.validation.warnings.map((warning) => warning.code),
    ["ai_assistance.generic_chatbot_answer"],
  );
  assert.deepEqual(
    report.critique_items.map((item) => item.item_id),
    [
      "validation:$.answer.evidence_ids:missing_answer_evidence",
      "validation:$.findings:missing_grounded_findings",
      "validator_warning:$.answer.summary:ai_assistance.generic_chatbot_answer",
    ],
  );
});

test("validator-only invalid chatbot sample stays out of the normal fixture list", () => {
  assert.equal(
    mockAiAssistanceResponseV01Fixtures.includes(
      invalidGenericChatbotLikeAiAssistanceResponseV01ForValidatorTest,
    ),
    false,
  );
});
