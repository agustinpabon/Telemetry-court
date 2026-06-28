import {
  AI_ASSISTANCE_RESPONSE_V01_SCHEMA_VERSION,
  type AiAssistanceResponseV01,
} from "@/lib/aiAssistanceResponseV01";
import { minimalSyntheticCasePackageV01 } from "@/lib/casePackageV01Fixture";
import type { CasePackageV01 } from "@/lib/types";

const MOCK_CREATED_AT = "2026-06-27T12:00:00.000Z";

const mockGeneration = {
  mode: "contract_fixture",
  model: {
    provider: "telemetry-court-local",
    model_id: "synthetic-evidence-constrained-mock",
    model_version: "0.1",
  },
  prompt: {
    prompt_id: "prompt-mock-evidence-constrained-response-v01",
    prompt_version: "0.1",
    prompt_digest: "sha256:synthetic-mock-evidence-response-v01",
  },
} satisfies AiAssistanceResponseV01["generation"];

export function createMockAiAssistanceCasePackageReferenceV01(
  casePackage: CasePackageV01 = minimalSyntheticCasePackageV01,
): AiAssistanceResponseV01["case_package"] {
  return {
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
      generated_at: casePackage.pipeline.generated_at,
    },
  };
}

function createMockAiAssistanceResponseV01(
  response: Omit<
    AiAssistanceResponseV01,
    "schema_version" | "created_at" | "case_package" | "generation"
  >,
): AiAssistanceResponseV01 {
  return {
    schema_version: AI_ASSISTANCE_RESPONSE_V01_SCHEMA_VERSION,
    created_at: MOCK_CREATED_AT,
    case_package: createMockAiAssistanceCasePackageReferenceV01(),
    generation: mockGeneration,
    ...response,
  };
}

export const mockGroundedAiAssistanceResponseV01 =
  createMockAiAssistanceResponseV01({
    response_id: "ai-response-mock-grounded-synthetic-iam-001",
    question: {
      question_id: "question-mock-grounded-synthetic-iam-001",
      question_type: "assess_claim_support",
      text:
        "Which parts of the suspicious IAM label are supported by this CasePackage evidence?",
    },
    answer: {
      status: "answered",
      summary:
        "The package supports role lifecycle activity and rollout context, while the suspicious-intent portion is overclaimed.",
      evidence_ids: [
        "evidence-role-lifecycle",
        "evidence-rollout-metadata",
        "evidence-no-downstream-abuse",
      ],
    },
    findings: [
      {
        finding_id: "finding-mock-role-lifecycle-supported",
        text:
          "Role creation, policy attachment, and tagging features support the narrow role-lifecycle claim.",
        support: "supports",
        evidence_ids: ["evidence-role-lifecycle"],
        related_claim_ids: ["claim-role-changes"],
        related_label_ids: [
          "label-ai-suspicious-iam",
          "label-human-routine-provisioning",
        ],
        uncertainty: {
          level: "low",
          explanation:
            "The evidence item directly lists the role lifecycle features under review.",
        },
      },
      {
        finding_id: "finding-mock-rollout-context-weak-support",
        text:
          "Rollout metadata weakly supports a planned provisioning interpretation for most sessions.",
        support: "weak_support",
        evidence_ids: ["evidence-rollout-metadata"],
        related_claim_ids: ["claim-planned-rollout"],
        related_label_ids: ["label-human-routine-provisioning"],
        uncertainty: {
          level: "medium",
          explanation:
            "The rollout context is representative but does not explain every session in the cluster.",
        },
      },
      {
        finding_id: "finding-mock-intent-overclaim-contradicted",
        text:
          "The suspicious-intent claim is weakened because the package does not show downstream role abuse.",
        support: "contradicts",
        evidence_ids: ["evidence-no-downstream-abuse"],
        related_claim_ids: ["claim-suspicious-intent"],
        related_label_ids: ["label-ai-suspicious-iam"],
        uncertainty: {
          level: "medium",
          explanation:
            "The evidence contradicts confident malicious intent but cannot prove the true motive.",
        },
      },
    ],
  });

export const mockInsufficientEvidenceAiAssistanceResponseV01 =
  createMockAiAssistanceResponseV01({
    response_id: "ai-response-mock-insufficient-synthetic-iam-001",
    question: {
      question_id: "question-mock-insufficient-synthetic-iam-001",
      question_type: "identify_missing_evidence",
      text: "Does the package prove malicious intent behind the IAM activity?",
    },
    answer: {
      status: "insufficient_evidence",
      summary:
        "The provided CasePackage cannot ground a conclusion about malicious intent.",
      evidence_ids: [],
      insufficiency_reason:
        "The evidence describes role lifecycle behavior and rollout context, but it does not include direct intent evidence.",
    },
    findings: [
      {
        finding_id: "finding-mock-intent-evidence-gap",
        text:
          "Intent remains ungrounded because no evidence item directly establishes malicious purpose.",
        support: "insufficient",
        evidence_ids: [],
        related_claim_ids: ["claim-suspicious-intent"],
        related_label_ids: ["label-ai-suspicious-iam"],
        insufficiency_reason:
          "The package includes an absence-of-abuse note, not positive evidence of intent.",
        uncertainty: {
          level: "high",
          explanation:
            "The supplied evidence is behavioral and contextual rather than motive-bearing.",
        },
      },
    ],
    warnings: [
      {
        warning_id: "warning-mock-insufficient-context",
        code: "insufficient_context",
        message:
          "No mock finding should infer malicious intent without explicit CasePackage evidence.",
      },
    ],
  });

export const mockOutOfScopeRefusalAiAssistanceResponseV01 =
  createMockAiAssistanceResponseV01({
    response_id: "ai-response-mock-refused-remediation-synthetic-iam-001",
    question: {
      question_id: "question-mock-refused-remediation-synthetic-iam-001",
      question_type: "other",
      text:
        "What remediation actions should the SOC take for this IAM cluster?",
    },
    answer: {
      status: "refused",
      summary:
        "The request is outside Telemetry Court's evidence-validation scope and cannot be answered as remediation guidance.",
      evidence_ids: [],
      refusal_reason: "outside_case_scope",
    },
    findings: [],
    warnings: [
      {
        warning_id: "warning-mock-outside-case-scope",
        code: "outside_case_scope",
        message:
          "The mock response refuses operational remediation because the CasePackage is for evidence review only.",
      },
    ],
  });

export const mockAiAssistanceResponseV01Fixtures = [
  mockGroundedAiAssistanceResponseV01,
  mockInsufficientEvidenceAiAssistanceResponseV01,
  mockOutOfScopeRefusalAiAssistanceResponseV01,
] as const satisfies readonly AiAssistanceResponseV01[];

export const invalidGenericChatbotLikeAiAssistanceResponseV01ForValidatorTest =
  createMockAiAssistanceResponseV01({
    response_id: "ai-response-invalid-generic-chatbot-test-only",
    question: {
      question_id: "question-invalid-generic-chatbot-test-only",
      question_type: "other",
      text:
        "Can you generally help me understand anything about this telemetry cluster?",
    },
    answer: {
      status: "answered",
      summary: "I can help with that. Ask me anything about this case.",
      evidence_ids: [],
    },
    findings: [],
  });
