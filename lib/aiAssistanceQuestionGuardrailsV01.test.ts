import assert from "node:assert/strict";
import test from "node:test";

import {
  guardAiAssistanceQuestionRequestV01,
  type AiAssistanceQuestionGuardrailBlockedResultV01,
} from "@/lib/aiAssistanceQuestionGuardrailsV01";
import { minimalSyntheticCasePackageV01 } from "@/lib/casePackageV01Fixture";

function assertBlocked(
  result: ReturnType<typeof guardAiAssistanceQuestionRequestV01>,
): asserts result is AiAssistanceQuestionGuardrailBlockedResultV01 {
  assert.notEqual(result.status, "allowed");
}

test("allows a predefined evidence question with valid required references", () => {
  const result = guardAiAssistanceQuestionRequestV01(
    {
      question_id: "question-claim-supporting-evidence-v01",
      references: {
        claim_id: "claim-role-changes",
      },
    },
    { casePackage: minimalSyntheticCasePackageV01 },
  );

  assert.deepEqual(result, {
    status: "allowed",
    question_id: "question-claim-supporting-evidence-v01",
    question: {
      question_id: "question-claim-supporting-evidence-v01",
      question_type: "assess_claim_support",
      text: "Which evidence items support this claim?",
    },
    references: {
      claim_id: "claim-role-changes",
    },
    required_references: ["case_package", "claim_id"],
    expected_answer_statuses: ["answered", "insufficient_evidence"],
  });
});

test("returns a bounded unavailable result for unsupported question IDs", () => {
  const result = guardAiAssistanceQuestionRequestV01(
    {
      question_id: "question-generic-cyber-advice-v01",
      references: {
        claim_id: "claim-role-changes",
      },
    },
    { casePackage: minimalSyntheticCasePackageV01 },
  );

  assert.deepEqual(result, {
    status: "unavailable",
    reason_code: "unsupported_question_id",
    question_id: "question-generic-cyber-advice-v01",
    response_answer_status: "refused",
    response_refusal_reason: "unsupported_request",
  });
});

test("rejects arbitrary free-form prompt text before package review", () => {
  const result = guardAiAssistanceQuestionRequestV01(
    "Which IAM best practices should I follow?",
    { casePackage: minimalSyntheticCasePackageV01 },
  );

  assert.deepEqual(result, {
    status: "refused",
    reason_code: "freeform_prompt_disallowed",
    response_answer_status: "refused",
    response_refusal_reason: "unsupported_request",
  });
});

test("returns unavailable when a valid CasePackage is missing", () => {
  const request = {
    question_id: "question-claim-supporting-evidence-v01",
    references: {
      claim_id: "claim-role-changes",
    },
  };
  const missingPackageResult = guardAiAssistanceQuestionRequestV01(request);
  const invalidPackageResult = guardAiAssistanceQuestionRequestV01(request, {
    casePackage: { schema_version: "case_package.v0.1" },
  });

  const expectedResult = {
    status: "unavailable",
    reason_code: "missing_valid_case_package",
    question_id: "question-claim-supporting-evidence-v01",
    required_reference: "case_package",
    response_answer_status: "refused",
    response_refusal_reason: "missing_context",
  } as const;

  assert.deepEqual(missingPackageResult, expectedResult);
  assert.deepEqual(invalidPackageResult, expectedResult);
});

test("returns unavailable when required references are missing", () => {
  const scenarios = [
    {
      question_id: "question-claim-supporting-evidence-v01",
      required_reference: "claim_id",
    },
    {
      question_id: "question-evidence-supported-claim-v01",
      required_reference: "evidence_id",
    },
    {
      question_id: "question-label-overclaim-v01",
      required_reference: "label_id",
    },
  ] as const;

  for (const scenario of scenarios) {
    const result = guardAiAssistanceQuestionRequestV01(
      {
        question_id: scenario.question_id,
        references: {},
      },
      { casePackage: minimalSyntheticCasePackageV01 },
    );

    assert.deepEqual(result, {
      status: "unavailable",
      reason_code: "missing_required_reference",
      question_id: scenario.question_id,
      required_reference: scenario.required_reference,
      response_answer_status: "refused",
      response_refusal_reason: "missing_context",
    });
  }
});

test("returns unavailable for unknown claim references", () => {
  const result = guardAiAssistanceQuestionRequestV01(
    {
      question_id: "question-claim-supporting-evidence-v01",
      references: {
        claim_id: "claim-does-not-exist",
      },
    },
    { casePackage: minimalSyntheticCasePackageV01 },
  );

  assert.deepEqual(result, {
    status: "unavailable",
    reason_code: "unknown_claim_id",
    question_id: "question-claim-supporting-evidence-v01",
    reference_id: "claim-does-not-exist",
    response_answer_status: "refused",
    response_refusal_reason: "missing_context",
  });
});

test("returns unavailable for unknown evidence references", () => {
  const result = guardAiAssistanceQuestionRequestV01(
    {
      question_id: "question-evidence-supported-claim-v01",
      references: {
        evidence_id: "evidence-does-not-exist",
      },
    },
    { casePackage: minimalSyntheticCasePackageV01 },
  );

  assert.deepEqual(result, {
    status: "unavailable",
    reason_code: "unknown_evidence_id",
    question_id: "question-evidence-supported-claim-v01",
    reference_id: "evidence-does-not-exist",
    response_answer_status: "refused",
    response_refusal_reason: "missing_context",
  });
});

test("returns unavailable for unknown label references", () => {
  const result = guardAiAssistanceQuestionRequestV01(
    {
      question_id: "question-label-overclaim-v01",
      references: {
        label_id: "label-does-not-exist",
      },
    },
    { casePackage: minimalSyntheticCasePackageV01 },
  );

  assert.deepEqual(result, {
    status: "unavailable",
    reason_code: "unknown_label_id",
    question_id: "question-label-overclaim-v01",
    reference_id: "label-does-not-exist",
    response_answer_status: "refused",
    response_refusal_reason: "missing_context",
  });
});

test("rejects generic chatbot-style request envelopes", () => {
  const result = guardAiAssistanceQuestionRequestV01(
    {
      messages: [
        {
          role: "user",
          content: "Can I ask anything about this telemetry cluster?",
        },
      ],
    },
    { casePackage: minimalSyntheticCasePackageV01 },
  );

  assert.deepEqual(result, {
    status: "refused",
    reason_code: "generic_chatbot_request_disallowed",
    response_answer_status: "refused",
    response_refusal_reason: "outside_case_scope",
  });
});

test("rejects operational, raw telemetry, and external lookup requests", () => {
  const blockedRequests = [
    {
      request: {
        prompt: "What remediation actions should the SOC take next?",
      },
      reason_code: "operational_action_disallowed",
      response_refusal_reason: "outside_case_scope",
    },
    {
      request: {
        prompt: "Investigate the live alert and search the raw logs.",
      },
      reason_code: "operational_action_disallowed",
      response_refusal_reason: "outside_case_scope",
    },
    {
      request: {
        prompt: "Run a raw telemetry lookup for this cluster.",
      },
      reason_code: "operational_action_disallowed",
      response_refusal_reason: "outside_case_scope",
    },
    {
      request: {
        prompt: "Look up external threat intelligence for this principal.",
      },
      reason_code: "external_lookup_disallowed",
      response_refusal_reason: "outside_case_scope",
    },
  ] as const;

  for (const scenario of blockedRequests) {
    const result = guardAiAssistanceQuestionRequestV01(scenario.request, {
      casePackage: minimalSyntheticCasePackageV01,
    });

    assertBlocked(result);
    assert.equal(result.status, "refused");
    assert.equal(result.reason_code, scenario.reason_code);
    assert.equal(result.response_answer_status, "refused");
    assert.equal(
      result.response_refusal_reason,
      scenario.response_refusal_reason,
    );
  }
});

test("rejects structured request fields outside the evidence question boundary", () => {
  const result = guardAiAssistanceQuestionRequestV01(
    {
      question_id: "question-cluster-impurity-v01",
      references: {},
      requested_capability: "summarize all identities in the tenant",
    },
    { casePackage: minimalSyntheticCasePackageV01 },
  );

  assert.deepEqual(result, {
    status: "refused",
    reason_code: "outside_case_scope",
    question_id: "question-cluster-impurity-v01",
    response_answer_status: "refused",
    response_refusal_reason: "outside_case_scope",
  });
});
