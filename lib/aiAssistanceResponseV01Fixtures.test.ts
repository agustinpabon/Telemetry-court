import assert from "node:assert/strict";
import test from "node:test";

import type { AiAssistanceResponseV01 } from "@/lib/aiAssistanceResponseV01";
import {
  invalidGenericChatbotLikeAiAssistanceResponseV01ForValidatorTest,
  mockAiAssistanceResponseV01Fixtures,
  mockGroundedAiAssistanceResponseV01,
  mockInsufficientEvidenceAiAssistanceResponseV01,
  mockOutOfScopeRefusalAiAssistanceResponseV01,
} from "@/lib/aiAssistanceResponseV01Fixtures";
import { validateAiAssistanceResponseV01 } from "@/lib/aiAssistanceResponseValidationV01";
import { minimalSyntheticCasePackageV01 } from "@/lib/casePackageV01Fixture";

test("valid mocked AI assistance responses validate against the synthetic CasePackage context", () => {
  for (const response of mockAiAssistanceResponseV01Fixtures) {
    const validation = validateAiAssistanceResponseV01(response, {
      casePackage: minimalSyntheticCasePackageV01,
    });

    assert.equal(validation.ok, true, response.response_id);
    assert.deepEqual(validation.warnings, [], response.response_id);
  }
});

test("grounded mock cites existing evidence IDs when context validation is supplied", () => {
  const knownEvidenceIds = new Set(
    minimalSyntheticCasePackageV01.evidence_items.map((item) => item.evidence_id),
  );
  const citedEvidenceIds = [
    ...mockGroundedAiAssistanceResponseV01.answer.evidence_ids,
    ...mockGroundedAiAssistanceResponseV01.findings.flatMap(
      (finding) => finding.evidence_ids,
    ),
  ];

  for (const evidenceId of citedEvidenceIds) {
    assert.equal(knownEvidenceIds.has(evidenceId), true, evidenceId);
  }

  const validation = validateAiAssistanceResponseV01(
    mockGroundedAiAssistanceResponseV01,
    { casePackage: minimalSyntheticCasePackageV01 },
  );

  assert.equal(validation.ok, true);
});

test("insufficient evidence mock is valid without evidence IDs only because it is explicitly insufficient", () => {
  const validation = validateAiAssistanceResponseV01(
    mockInsufficientEvidenceAiAssistanceResponseV01,
    { casePackage: minimalSyntheticCasePackageV01 },
  );

  assert.equal(validation.ok, true);
  assert.equal(
    mockInsufficientEvidenceAiAssistanceResponseV01.answer.status,
    "insufficient_evidence",
  );
  assert.deepEqual(
    mockInsufficientEvidenceAiAssistanceResponseV01.answer.evidence_ids,
    [],
  );

  const answeredWithoutEvidence: AiAssistanceResponseV01 = {
    ...mockInsufficientEvidenceAiAssistanceResponseV01,
    answer: {
      ...mockInsufficientEvidenceAiAssistanceResponseV01.answer,
      status: "answered",
    },
  };
  const invalidValidation = validateAiAssistanceResponseV01(
    answeredWithoutEvidence,
    { casePackage: minimalSyntheticCasePackageV01 },
  );

  assert.equal(invalidValidation.ok, false);
  assert.deepEqual(errorCodes(invalidValidation), [
    "missing_answer_evidence",
    "missing_grounded_findings",
  ]);
});

test("refused out-of-scope mock is valid only with a refusal reason", () => {
  const validation = validateAiAssistanceResponseV01(
    mockOutOfScopeRefusalAiAssistanceResponseV01,
    { casePackage: minimalSyntheticCasePackageV01 },
  );

  assert.equal(validation.ok, true);
  assert.equal(
    mockOutOfScopeRefusalAiAssistanceResponseV01.answer.status,
    "refused",
  );
  assert.equal(
    mockOutOfScopeRefusalAiAssistanceResponseV01.answer.refusal_reason,
    "outside_case_scope",
  );

  const missingRefusalReason: AiAssistanceResponseV01 = {
    ...mockOutOfScopeRefusalAiAssistanceResponseV01,
    answer: {
      ...mockOutOfScopeRefusalAiAssistanceResponseV01.answer,
      refusal_reason: undefined,
    },
  };
  const invalidValidation = validateAiAssistanceResponseV01(
    missingRefusalReason,
    { casePackage: minimalSyntheticCasePackageV01 },
  );

  assert.equal(invalidValidation.ok, false);
  assert.deepEqual(errorCodes(invalidValidation), ["missing_refusal_reason"]);
});

test("invalid generic chatbot-like mock fails validation and emits the expected warning", () => {
  const validation = validateAiAssistanceResponseV01(
    invalidGenericChatbotLikeAiAssistanceResponseV01ForValidatorTest,
    { casePackage: minimalSyntheticCasePackageV01 },
  );

  assert.equal(validation.ok, false);
  assert.deepEqual(errorCodes(validation), [
    "missing_answer_evidence",
    "missing_grounded_findings",
  ]);
  assert.deepEqual(
    validation.warnings.map((warning) => warning.code),
    ["ai_assistance.generic_chatbot_answer"],
  );
});

test("no mock response can pass as answered without answer evidence IDs", () => {
  for (const response of mockAiAssistanceResponseV01Fixtures) {
    const answeredWithoutEvidence: AiAssistanceResponseV01 = {
      ...response,
      answer: {
        ...response.answer,
        status: "answered",
        evidence_ids: [],
      },
    };

    const validation = validateAiAssistanceResponseV01(answeredWithoutEvidence, {
      casePackage: minimalSyntheticCasePackageV01,
    });

    assert.equal(validation.ok, false, response.response_id);
    assert.equal(
      errorCodes(validation).includes("missing_answer_evidence"),
      true,
      response.response_id,
    );
  }
});

test("unknown evidence ID fails context validation", () => {
  const responseWithUnknownEvidence: AiAssistanceResponseV01 = {
    ...mockGroundedAiAssistanceResponseV01,
    answer: {
      ...mockGroundedAiAssistanceResponseV01.answer,
      evidence_ids: ["evidence-unknown-mock-reference"],
    },
    findings: mockGroundedAiAssistanceResponseV01.findings.map((finding, index) =>
      index === 0
        ? {
            ...finding,
            evidence_ids: ["evidence-unknown-mock-reference"],
          }
        : finding,
    ),
  };

  const validation = validateAiAssistanceResponseV01(responseWithUnknownEvidence, {
    casePackage: minimalSyntheticCasePackageV01,
  });

  assert.equal(validation.ok, false);
  assert.deepEqual(errorCodes(validation), [
    "unknown_evidence_reference",
    "unknown_evidence_reference",
  ]);
});

function errorCodes(
  validation: ReturnType<typeof validateAiAssistanceResponseV01>,
): string[] {
  return validation.ok ? [] : validation.errors.map((error) => error.code);
}
