import assert from "node:assert/strict";
import test from "node:test";

import { casePackageFixtures } from "@/data/casePackageFixtures";
import { resolveMockAiAssistanceQuestionV01 } from "@/lib/aiAssistanceMockResolverV01";
import { AI_ASSISTANCE_QUESTION_SET_V01 } from "@/lib/aiAssistanceQuestionSetV01";
import { minimalSyntheticCasePackageV01 } from "@/lib/casePackageV01Fixture";

test("resolves a fixed claim-support question through guardrails, validation, and the critic", () => {
  const resolution = resolveMockAiAssistanceQuestionV01(
    {
      question_id: "question-claim-supporting-evidence-v01",
      references: { claim_id: "claim-role-changes" },
    },
    { casePackage: minimalSyntheticCasePackageV01 },
  );

  assert.equal(resolution.status, "answered");
  if (resolution.status !== "answered") return;

  assert.equal(resolution.guardrail.status, "allowed");
  assert.equal(resolution.response.schema_version, "ai_assistance_response.v0.1");
  assert.equal(resolution.response.question.question_id, resolution.guardrail.question_id);
  assert.equal(resolution.critic.validation.ok, true);
  assert.deepEqual(resolution.response.answer.evidence_ids, [
    "evidence-role-lifecycle",
  ]);
  assert.deepEqual(resolution.critic.referenced_claim_ids, ["claim-role-changes"]);
});

test("returns identical deterministic output for identical approved inputs", () => {
  const request = {
    question_id: "question-claim-contradiction-v01",
    references: { claim_id: "claim-suspicious-intent" },
  };
  const context = { casePackage: minimalSyntheticCasePackageV01 };

  assert.deepEqual(
    resolveMockAiAssistanceQuestionV01(request, context),
    resolveMockAiAssistanceQuestionV01(request, context),
  );
});

test("withholds an invalid mocked response instead of rendering it", () => {
  const resolution = resolveMockAiAssistanceQuestionV01(
    {
      question_id: "question-claim-supporting-evidence-v01",
      references: { claim_id: "claim-role-changes" },
    },
    { casePackage: minimalSyntheticCasePackageV01 },
    {
      buildResponse: () => ({
        schema_version: "ai_assistance_response.v0.1",
      }),
    },
  );

  assert.equal(resolution.status, "invalid_response");
  if (resolution.status !== "invalid_response") return;

  assert.equal(resolution.guardrail.status, "allowed");
  assert.equal(resolution.errors.length > 0, true);
});

test("resolves every canonical fixed question without a provider or arbitrary prompt", () => {
  for (const question of AI_ASSISTANCE_QUESTION_SET_V01) {
    const requiredReferences = question.required_references as readonly string[];
    const references = {
      ...(requiredReferences.includes("claim_id")
        ? { claim_id: "claim-suspicious-intent" }
        : {}),
      ...(requiredReferences.includes("evidence_id")
        ? { evidence_id: "evidence-role-lifecycle" }
        : {}),
      ...(requiredReferences.includes("label_id")
        ? { label_id: "label-ai-suspicious-iam" }
        : {}),
    };
    const resolution = resolveMockAiAssistanceQuestionV01(
      { question_id: question.question_id, references },
      { casePackage: minimalSyntheticCasePackageV01 },
    );

    assert.equal(
      ["answered", "insufficient_evidence", "refused"].includes(
        resolution.status,
      ),
      true,
      question.question_id,
    );
    if (
      resolution.status === "answered" ||
      resolution.status === "insufficient_evidence" ||
      resolution.status === "refused"
    ) {
      assert.equal(
        (question.expected_answer_statuses as readonly string[]).includes(
          resolution.status,
        ),
        true,
        question.question_id,
      );
      assert.equal(resolution.critic.validation.ok, true, question.question_id);
    }
  }
});

test("preserves unavailable and guardrail-refused outcomes before mock resolution", () => {
  const missingPackage = resolveMockAiAssistanceQuestionV01({
    question_id: "question-cluster-impurity-v01",
    references: {},
  });
  const missingReference = resolveMockAiAssistanceQuestionV01(
    {
      question_id: "question-claim-supporting-evidence-v01",
      references: {},
    },
    { casePackage: minimalSyntheticCasePackageV01 },
  );
  const unknownReference = resolveMockAiAssistanceQuestionV01(
    {
      question_id: "question-evidence-supported-claim-v01",
      references: { evidence_id: "evidence-not-in-package" },
    },
    { casePackage: minimalSyntheticCasePackageV01 },
  );
  const freeform = resolveMockAiAssistanceQuestionV01(
    { prompt: "Ask anything about this case" },
    { casePackage: minimalSyntheticCasePackageV01 },
  );

  assert.equal(missingPackage.status, "unavailable");
  assert.equal(missingPackage.guardrail.reason_code, "missing_valid_case_package");
  assert.equal(missingReference.status, "unavailable");
  assert.equal(missingReference.guardrail.reason_code, "missing_required_reference");
  assert.equal(unknownReference.status, "unavailable");
  assert.equal(unknownReference.guardrail.reason_code, "unknown_evidence_id");
  assert.equal(unknownReference.guardrail.reference_id, "evidence-not-in-package");
  assert.equal(freeform.status, "guardrail_refused");
  assert.equal(freeform.guardrail.reason_code, "generic_chatbot_request_disallowed");
});

test("blocks every unknown package reference before deterministic resolution", () => {
  const blockedRequests = [
    {
      request: {
        question_id: "question-claim-supporting-evidence-v01",
        references: { claim_id: "claim-not-in-package" },
      },
      reasonCode: "unknown_claim_id",
    },
    {
      request: {
        question_id: "question-evidence-supported-claim-v01",
        references: { evidence_id: "evidence-not-in-package" },
      },
      reasonCode: "unknown_evidence_id",
    },
    {
      request: {
        question_id: "question-label-overclaim-v01",
        references: { label_id: "label-not-in-package" },
      },
      reasonCode: "unknown_label_id",
    },
  ] as const;

  for (const { request, reasonCode } of blockedRequests) {
    const resolution = resolveMockAiAssistanceQuestionV01(
      request,
      { casePackage: minimalSyntheticCasePackageV01 },
      {
        buildResponse: () => {
          throw new Error("Resolver must not run before guardrails allow a request.");
        },
      },
    );

    assert.equal(resolution.status, "unavailable");
    if (resolution.status !== "unavailable") return;
    assert.equal(resolution.guardrail.reason_code, reasonCode);
  }
});

test("accepts exact legacy-style IDs from a validated current CasePackage", () => {
  const resolution = resolveMockAiAssistanceQuestionV01(
    {
      question_id: "question-claim-supporting-evidence-v01",
      references: { claim_id: "iam-c-01" },
    },
    { casePackage: casePackageFixtures[0] },
  );

  assert.equal(resolution.status, "answered");
  if (resolution.status !== "answered") return;
  assert.deepEqual(resolution.response.answer.evidence_ids, ["iam-e-01"]);
  assert.deepEqual(resolution.critic.unknown_evidence_ids, []);
  assert.deepEqual(resolution.critic.unknown_claim_ids, []);
});

test("honors claim and label filters for cluster impurity questions", () => {
  const matchingClaim = resolveMockAiAssistanceQuestionV01(
    {
      question_id: "question-cluster-impurity-v01",
      references: { claim_id: "claim-planned-rollout" },
    },
    { casePackage: minimalSyntheticCasePackageV01 },
  );
  const nonMatchingClaim = resolveMockAiAssistanceQuestionV01(
    {
      question_id: "question-cluster-impurity-v01",
      references: { claim_id: "claim-suspicious-intent" },
    },
    { casePackage: minimalSyntheticCasePackageV01 },
  );
  const packageWithNarrowAiLabel = {
    ...minimalSyntheticCasePackageV01,
    candidate_labels: minimalSyntheticCasePackageV01.candidate_labels.map(
      (label) =>
        label.label_id === "label-ai-suspicious-iam"
          ? { ...label, linked_claim_ids: ["claim-suspicious-intent"] }
          : label,
    ),
  };
  const nonMatchingLabel = resolveMockAiAssistanceQuestionV01(
    {
      question_id: "question-cluster-impurity-v01",
      references: { label_id: "label-ai-suspicious-iam" },
    },
    { casePackage: packageWithNarrowAiLabel },
  );

  assert.equal(matchingClaim.status, "answered");
  if (matchingClaim.status === "answered") {
    assert.deepEqual(matchingClaim.response.answer.evidence_ids, [
      "evidence-rollout-metadata",
    ]);
    assert.deepEqual(matchingClaim.response.findings[0]?.related_claim_ids, [
      "claim-planned-rollout",
      "claim-role-changes",
    ]);
  }
  assert.equal(nonMatchingClaim.status, "insufficient_evidence");
  assert.equal(nonMatchingLabel.status, "insufficient_evidence");
});

test("explains a selected fixed-question availability boundary deterministically", () => {
  const resolution = resolveMockAiAssistanceQuestionV01(
    {
      question_id: "question-assistance-unavailable-v01",
      references: {
        target_question_id: "question-label-overclaim-v01",
        unavailable_reason: "external_lookup_or_provider_unavailable",
      },
    },
    { casePackage: minimalSyntheticCasePackageV01 },
  );

  assert.equal(resolution.status, "refused");
  if (resolution.status !== "refused") return;

  assert.match(
    resolution.response.answer.summary,
    /question-label-overclaim-v01/,
  );
  assert.match(
    resolution.response.answer.summary,
    /external lookup or provider unavailable/,
  );
});
