import assert from "node:assert/strict";
import test from "node:test";

import {
  AI_ASSISTANCE_DISALLOWED_QUESTION_EXAMPLES_V01,
  AI_ASSISTANCE_QUESTION_SET_V01,
  AI_ASSISTANCE_QUESTION_SET_V01_VERSION,
  getAiAssistanceQuestionDefinitionV01,
  isAllowedAiAssistanceQuestionIdV01,
  toAiAssistanceResponseQuestionV01,
} from "@/lib/aiAssistanceQuestionSetV01";

test("allowed AI assistance questions are predefined and stable", () => {
  assert.equal(
    AI_ASSISTANCE_QUESTION_SET_V01_VERSION,
    "ai_assistance_question_set.v0.1",
  );
  assert.deepEqual(
    AI_ASSISTANCE_QUESTION_SET_V01.map((question) => [
      question.question_id,
      question.question_type,
      question.text,
    ]),
    [
      [
        "question-claim-supporting-evidence-v01",
        "assess_claim_support",
        "Which evidence items support this claim?",
      ],
      [
        "question-evidence-supported-claim-v01",
        "summarize_evidence",
        "Which claim is best supported by this evidence?",
      ],
      [
        "question-claim-weak-evidence-v01",
        "assess_claim_support",
        "What evidence is weak, indirect, or insufficient for this claim?",
      ],
      [
        "question-claim-missing-context-v01",
        "identify_missing_evidence",
        "What missing context would be needed to judge this claim?",
      ],
      [
        "question-claim-contradiction-v01",
        "assess_claim_support",
        "Does any evidence contradict this claim?",
      ],
      [
        "question-label-overclaim-v01",
        "compare_labels",
        "Does the label or explanation claim more than the evidence supports?",
      ],
      [
        "question-cluster-impurity-v01",
        "summarize_evidence",
        "Which evidence suggests the cluster may be mixed or impure?",
      ],
      [
        "question-assistance-unavailable-v01",
        "explain_uncertainty",
        "Why is AI assistance unavailable for this question or case?",
      ],
    ],
  );
});

test("question definitions cover evidence-review purposes without free-form chat", () => {
  assert.deepEqual(
    [
      ...new Set(
        AI_ASSISTANCE_QUESTION_SET_V01.flatMap((question) => question.inspects),
      ),
    ].sort(),
    [
      "claim_support",
      "cluster_boundary_impurity",
      "contradiction",
      "evidence_sufficiency",
      "missing_evidence",
      "overclaim_detection",
      "refusal_unavailable_behavior",
      "uncertainty",
    ],
  );

  for (const question of AI_ASSISTANCE_QUESTION_SET_V01) {
    assert.notEqual(question.question_type, "other", question.question_id);
    assert.equal(
      question.required_references.includes("case_package"),
      true,
      question.question_id,
    );
    assert.equal(
      /chat|ask me anything|soc|alert|incident|remediation|raw telemetry|investigation/i.test(
        question.text,
      ),
      false,
      question.question_id,
    );
  }
});

test("question definitions declare required references and answer paths", () => {
  const byId = new Map(
    AI_ASSISTANCE_QUESTION_SET_V01.map((question) => [
      question.question_id,
      question,
    ]),
  );

  assert.deepEqual(
    byId.get("question-claim-supporting-evidence-v01")?.required_references,
    ["case_package", "claim_id"],
  );
  assert.deepEqual(
    byId.get("question-evidence-supported-claim-v01")?.required_references,
    ["case_package", "evidence_id"],
  );
  assert.deepEqual(
    byId.get("question-label-overclaim-v01")?.required_references,
    ["case_package", "label_id"],
  );
  assert.deepEqual(
    byId.get("question-cluster-impurity-v01")?.required_references,
    ["case_package"],
  );

  for (const question of AI_ASSISTANCE_QUESTION_SET_V01.filter(
    (item) => item.question_id !== "question-assistance-unavailable-v01",
  )) {
    assert.deepEqual(
      question.expected_answer_statuses,
      ["answered", "insufficient_evidence"],
      question.question_id,
    );
  }

  assert.deepEqual(
    byId.get("question-assistance-unavailable-v01")?.expected_answer_statuses,
    ["refused"],
  );
});

test("question definitions can be used as AI assistance response question metadata", () => {
  const definition = getAiAssistanceQuestionDefinitionV01(
    "question-claim-contradiction-v01",
  );

  assert.ok(definition);
  assert.equal(isAllowedAiAssistanceQuestionIdV01(definition.question_id), true);
  assert.deepEqual(toAiAssistanceResponseQuestionV01(definition), {
    question_id: "question-claim-contradiction-v01",
    question_type: "assess_claim_support",
    text: "Does any evidence contradict this claim?",
  });
  assert.equal(
    isAllowedAiAssistanceQuestionIdV01("Can you investigate this live alert?"),
    false,
  );
});

test("disallowed examples name generic chatbot and operational requests", () => {
  assert.deepEqual(
    AI_ASSISTANCE_DISALLOWED_QUESTION_EXAMPLES_V01.map(
      (example) => example.reason,
    ),
    [
      "free_form_chatbot",
      "generic_cybersecurity_question",
      "operational_remediation",
      "raw_telemetry_or_live_investigation",
      "external_lookup",
    ],
  );

  for (const example of AI_ASSISTANCE_DISALLOWED_QUESTION_EXAMPLES_V01) {
    assert.equal(isAllowedAiAssistanceQuestionIdV01(example.text), false);
    assert.equal(example.expected_status, "refused");
  }
});
