import assert from "node:assert/strict";
import test from "node:test";

import {
  AI_ASSISTANCE_RESPONSE_V01_SCHEMA_VERSION,
  type AiAssistanceResponseV01,
} from "@/lib/aiAssistanceResponseV01";
import { validateAiAssistanceResponseV01 } from "@/lib/aiAssistanceResponseValidationV01";
import { minimalSyntheticCasePackageV01 } from "@/lib/casePackageV01Fixture";

test("valid grounded AI assistance response cites evidence IDs", () => {
  const response = buildResponse();

  const validation = validateAiAssistanceResponseV01(response, {
    casePackage: minimalSyntheticCasePackageV01,
  });

  assert.equal(validation.ok, true);
  assert.deepEqual(validation.warnings, []);
});

test("invalid finding missing evidence IDs is rejected", () => {
  const response = buildResponse({
    findings: [
      {
        finding_id: "finding-ungrounded",
        text: "The generated label is supported.",
        support: "supports",
        evidence_ids: [],
      },
    ],
  });

  const validation = validateAiAssistanceResponseV01(response, {
    casePackage: minimalSyntheticCasePackageV01,
  });

  assert.equal(validation.ok, false);
  assert.deepEqual(
    validation.errors.map((error) => error.code),
    ["missing_finding_evidence"],
  );
});

test("insufficient evidence response can omit evidence IDs", () => {
  const response = buildResponse({
    answer: {
      status: "insufficient_evidence",
      summary:
        "The provided evidence is insufficient to determine whether the label is defensible.",
      evidence_ids: [],
      insufficiency_reason:
        "The package does not include evidence that directly establishes malicious intent.",
    },
    findings: [
      {
        finding_id: "finding-insufficient-intent",
        text: "The intent claim cannot be answered from the provided package.",
        support: "insufficient",
        evidence_ids: [],
        insufficiency_reason:
          "No evidence item directly establishes malicious or suspicious intent.",
        uncertainty: {
          level: "high",
          explanation: "The package contains behavioral evidence but not intent evidence.",
        },
      },
    ],
  });

  const validation = validateAiAssistanceResponseV01(response, {
    casePackage: minimalSyntheticCasePackageV01,
  });

  assert.equal(validation.ok, true);
  assert.deepEqual(validation.warnings, []);
});

test("unknown evidence ID is rejected when CasePackage context is available", () => {
  const response = buildResponse({
    answer: {
      status: "answered",
      summary: "The role lifecycle claim is supported by package evidence.",
      evidence_ids: ["evidence-does-not-exist"],
    },
  });

  const validation = validateAiAssistanceResponseV01(response, {
    casePackage: minimalSyntheticCasePackageV01,
  });

  assert.equal(validation.ok, false);
  assert.deepEqual(
    validation.errors.map((error) => error.code),
    ["unknown_evidence_reference"],
  );
});

test("malformed schema_version is rejected", () => {
  const response = {
    ...buildResponse(),
    schema_version: "ai_assistance_response.v9",
  };

  const validation = validateAiAssistanceResponseV01(response);

  assert.equal(validation.ok, false);
  assert.equal(validation.errors[0]?.code, "unsupported_schema_version");
});

test("generic chatbot-like answer emits a non-blocking warning", () => {
  const response = buildResponse({
    answer: {
      status: "answered",
      summary: "I can help with that.",
      evidence_ids: ["evidence-role-lifecycle"],
    },
  });

  const validation = validateAiAssistanceResponseV01(response, {
    casePackage: minimalSyntheticCasePackageV01,
  });

  assert.equal(validation.ok, true);
  assert.deepEqual(
    validation.warnings.map((warning) => warning.code),
    ["ai_assistance.generic_chatbot_answer"],
  );
});

test("multiple findings maintain separate evidence IDs", () => {
  const response = buildResponse({
    findings: [
      {
        finding_id: "finding-role-lifecycle",
        text: "Role lifecycle activity is present.",
        support: "supports",
        evidence_ids: ["evidence-role-lifecycle"],
        related_claim_ids: ["claim-role-changes"],
      },
      {
        finding_id: "finding-intent-overclaim",
        text: "Suspicious intent is contradicted by missing downstream abuse evidence.",
        support: "contradicts",
        evidence_ids: ["evidence-no-downstream-abuse"],
        related_claim_ids: ["claim-suspicious-intent"],
        uncertainty: {
          level: "medium",
          explanation: "The package weakens intent but does not fully explain motive.",
        },
      },
    ],
  });

  const validation = validateAiAssistanceResponseV01(response, {
    casePackage: minimalSyntheticCasePackageV01,
  });

  assert.equal(validation.ok, true);
  assert.deepEqual(validation.warnings, []);
});

test("refusal path remains valid when grounded answer is impossible", () => {
  const response = buildResponse({
    answer: {
      status: "refused",
      summary:
        "I cannot answer because the request asks for operational remediation outside the case evidence.",
      evidence_ids: [],
      refusal_reason: "outside_case_scope",
      insufficiency_reason:
        "The CasePackage contains review evidence, not remediation instructions.",
    },
    findings: [],
  });

  const validation = validateAiAssistanceResponseV01(response, {
    casePackage: minimalSyntheticCasePackageV01,
  });

  assert.equal(validation.ok, true);
  assert.deepEqual(validation.warnings, []);
});

function buildResponse(
  overrides: Partial<AiAssistanceResponseV01> = {},
): AiAssistanceResponseV01 {
  const base: AiAssistanceResponseV01 = {
    schema_version: AI_ASSISTANCE_RESPONSE_V01_SCHEMA_VERSION,
    response_id: "ai-response-synthetic-001",
    created_at: "2026-06-24T12:00:00.000Z",
    case_package: {
      schema_version: "case_package.v0.1",
      package_id: minimalSyntheticCasePackageV01.package_id,
      package_revision: minimalSyntheticCasePackageV01.package_revision,
      case_id: minimalSyntheticCasePackageV01.case.case_id,
      cluster_id: minimalSyntheticCasePackageV01.cluster.cluster_id,
      pipeline: {
        pipeline_id: minimalSyntheticCasePackageV01.pipeline.pipeline_id,
        run_id: minimalSyntheticCasePackageV01.pipeline.run_id,
        upstream_tool: minimalSyntheticCasePackageV01.pipeline.upstream_tool,
        pipeline_version: minimalSyntheticCasePackageV01.pipeline.pipeline_version,
        embedding_model: minimalSyntheticCasePackageV01.pipeline.embedding_model,
        clustering_method: minimalSyntheticCasePackageV01.pipeline.clustering_method,
        dimensionality_reduction_method:
          minimalSyntheticCasePackageV01.pipeline.dimensionality_reduction_method,
        naming_model: minimalSyntheticCasePackageV01.pipeline.naming_model,
        prompt_id: minimalSyntheticCasePackageV01.pipeline.prompt?.prompt_id,
        generated_at: minimalSyntheticCasePackageV01.pipeline.generated_at,
      },
    },
    question: {
      question_id: "question-evidence-support-001",
      question_type: "assess_claim_support",
      text: "Is the suspicious IAM label supported by the evidence?",
    },
    generation: {
      mode: "contract_fixture",
      model: {
        model_id: "synthetic-contract-model",
      },
      prompt: {
        prompt_id: "prompt-evidence-assistance-v1",
        prompt_version: "0.1",
        prompt_digest: "sha256:synthetic-digest",
      },
    },
    answer: {
      status: "answered",
      summary:
        "The role lifecycle behavior is supported, but suspicious intent remains overclaimed.",
      evidence_ids: ["evidence-role-lifecycle", "evidence-no-downstream-abuse"],
    },
    findings: [
      {
        finding_id: "finding-role-lifecycle",
        text: "Role lifecycle activity is present in the package evidence.",
        support: "supports",
        evidence_ids: ["evidence-role-lifecycle"],
        related_claim_ids: ["claim-role-changes"],
      },
    ],
  };

  return {
    ...base,
    ...overrides,
  };
}
