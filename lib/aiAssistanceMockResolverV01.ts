import { createAiAssistanceClaimCriticReportV01 } from "@/lib/aiAssistanceClaimCriticV01";
import {
  guardAiAssistanceQuestionRequestV01,
  type AiAssistanceQuestionGuardrailAllowedResultV01,
  type AiAssistanceQuestionGuardrailBlockedResultV01,
  type AiAssistanceQuestionGuardrailRequestV01,
} from "@/lib/aiAssistanceQuestionGuardrailsV01";
import {
  AI_ASSISTANCE_RESPONSE_V01_SCHEMA_VERSION,
  type AiAssistanceFindingSupportV01,
  type AiAssistanceResponseV01,
} from "@/lib/aiAssistanceResponseV01";
import { createMockAiAssistanceCasePackageReferenceV01 } from "@/lib/aiAssistanceResponseV01Fixtures";
import {
  AI_ASSISTANCE_UNAVAILABLE_REASONS_V01,
  getAiAssistanceQuestionDefinitionV01,
} from "@/lib/aiAssistanceQuestionSetV01";
import {
  validateAiAssistanceResponseV01,
  type AiAssistanceResponseValidationErrorV01,
  type AiAssistanceResponseValidationWarningV01,
} from "@/lib/aiAssistanceResponseValidationV01";
import { validateCasePackageV01 } from "@/lib/casePackageValidation";
import type {
  CasePackageEvidenceToClaimMappingV01,
  CasePackageV01,
} from "@/lib/types";

const MOCK_CREATED_AT = "2026-06-28T12:00:00.000Z";

const mockGeneration = {
  mode: "local_dry_run",
  model: {
    provider: "telemetry-court-local",
    model_id: "deterministic-evidence-mock-resolver",
    model_version: "0.1",
  },
  prompt: {
    prompt_id: "deterministic-evidence-mock-template-v01",
    prompt_version: "0.1",
    prompt_digest: "sha256:deterministic-local-mock-template-v01",
  },
} as const satisfies AiAssistanceResponseV01["generation"];

export type MockAiAssistanceResolutionV01 =
  | {
      status: "answered" | "insufficient_evidence" | "refused";
      guardrail: AiAssistanceQuestionGuardrailAllowedResultV01;
      response: AiAssistanceResponseV01;
      critic: ReturnType<typeof createAiAssistanceClaimCriticReportV01>;
      validationWarnings: AiAssistanceResponseValidationWarningV01[];
    }
  | {
      status: "unavailable" | "guardrail_refused";
      guardrail: AiAssistanceQuestionGuardrailBlockedResultV01;
    }
  | {
      status: "invalid_response";
      guardrail: AiAssistanceQuestionGuardrailAllowedResultV01;
      errors: AiAssistanceResponseValidationErrorV01[];
      validationWarnings: AiAssistanceResponseValidationWarningV01[];
    };

export type MockAiAssistanceResolverDependenciesV01 = {
  buildResponse?: (input: {
    guardrail: AiAssistanceQuestionGuardrailAllowedResultV01;
    casePackage: CasePackageV01;
  }) => unknown;
};

export function resolveMockAiAssistanceQuestionV01(
  request: unknown,
  context: { casePackage?: unknown } = {},
  dependencies: MockAiAssistanceResolverDependenciesV01 = {},
): MockAiAssistanceResolutionV01 {
  const guardrail = guardAiAssistanceQuestionRequestV01(request, context);

  if (guardrail.status !== "allowed") {
    return {
      status:
        guardrail.status === "refused" ? "guardrail_refused" : "unavailable",
      guardrail,
    };
  }

  const packageValidation = validateCasePackageV01(context.casePackage);
  if (!packageValidation.ok) {
    return missingValidatedPackageResolution(guardrail);
  }

  const candidate = (dependencies.buildResponse ?? buildMockResponse)({
    guardrail,
    casePackage: packageValidation.package,
  });
  const validation = validateAiAssistanceResponseV01(candidate, {
    casePackage: packageValidation.package,
  });

  if (!validation.ok) {
    return {
      status: "invalid_response",
      guardrail,
      errors: validation.errors,
      validationWarnings: validation.warnings,
    };
  }

  const consistencyErrors = getRequestResponseConsistencyErrors(
    guardrail,
    validation.response,
  );
  if (consistencyErrors.length > 0) {
    return {
      status: "invalid_response",
      guardrail,
      errors: consistencyErrors,
      validationWarnings: validation.warnings,
    };
  }

  const critic = createAiAssistanceClaimCriticReportV01(validation.response, {
    casePackage: packageValidation.package,
  });
  if (!critic.validation.ok) {
    return {
      status: "invalid_response",
      guardrail,
      errors: critic.validation.errors,
      validationWarnings: critic.validation.warnings,
    };
  }

  return {
    status: validation.response.answer.status,
    guardrail,
    response: validation.response,
    critic,
    validationWarnings: validation.warnings,
  };
}

function missingValidatedPackageResolution(
  guardrail: AiAssistanceQuestionGuardrailAllowedResultV01,
): MockAiAssistanceResolutionV01 {
  return {
    status: "invalid_response",
    guardrail,
    validationWarnings: [],
    errors: [
      {
        path: "$.case_package",
        code: "missing_valid_case_package",
        message:
          "A validated CasePackage is required before mocked assistance can run.",
      },
    ],
  };
}

function buildMockResponse({
  guardrail,
  casePackage,
}: {
  guardrail: AiAssistanceQuestionGuardrailAllowedResultV01;
  casePackage: CasePackageV01;
}): AiAssistanceResponseV01 {
  if (guardrail.question_id === "question-assistance-unavailable-v01") {
    return buildRefusedResponse(guardrail, casePackage);
  }

  if (guardrail.question_id === "question-cluster-impurity-v01") {
    return buildClusterImpurityResponse(guardrail, casePackage);
  }

  const mappings = selectQuestionMappings(guardrail, casePackage);
  return mappings.length > 0
    ? buildMappedResponse(guardrail, casePackage, mappings)
    : buildInsufficientResponse(guardrail, casePackage);
}

function selectQuestionMappings(
  guardrail: AiAssistanceQuestionGuardrailAllowedResultV01,
  casePackage: CasePackageV01,
): CasePackageEvidenceToClaimMappingV01[] {
  const { claim_id: claimId, evidence_id: evidenceId, label_id: labelId } =
    guardrail.references;
  const labelClaimIds = new Set(
    casePackage.candidate_labels.find((label) => label.label_id === labelId)
      ?.linked_claim_ids ?? [],
  );

  const matches = casePackage.evidence_to_claim_mappings.filter((mapping) => {
    if (claimId && mapping.claim_id !== claimId) return false;
    if (evidenceId && mapping.evidence_id !== evidenceId) return false;
    if (labelId && !labelClaimIds.has(mapping.claim_id)) return false;
    return relationshipAnswersQuestion(
      guardrail.question_id,
      mapping.relationship,
    );
  });

  if (guardrail.question_id === "question-evidence-supported-claim-v01") {
    const bestRank = Math.min(
      ...matches.map((mapping) => relationshipRank(mapping.relationship)),
    );
    return sortMappings(
      matches.filter(
        (mapping) => relationshipRank(mapping.relationship) === bestRank,
      ),
    );
  }

  return sortMappings(matches);
}

function relationshipAnswersQuestion(
  questionId: AiAssistanceQuestionGuardrailAllowedResultV01["question_id"],
  relationship: CasePackageEvidenceToClaimMappingV01["relationship"],
): boolean {
  if (
    questionId === "question-claim-supporting-evidence-v01" ||
    questionId === "question-evidence-supported-claim-v01"
  ) {
    return relationship === "supports" || relationship === "weak_support";
  }

  if (questionId === "question-claim-contradiction-v01") {
    return relationship === "contradicts";
  }

  if (questionId === "question-claim-weak-evidence-v01") {
    return [
      "weak_support",
      "context",
      "irrelevant",
      "insufficient",
      "missing_evidence",
    ].includes(relationship);
  }

  if (questionId === "question-claim-missing-context-v01") {
    return ["context", "insufficient", "missing_evidence"].includes(
      relationship,
    );
  }

  if (questionId === "question-label-overclaim-v01") {
    return [
      "weak_support",
      "contradicts",
      "insufficient",
      "missing_evidence",
    ].includes(relationship);
  }

  return false;
}

function buildMappedResponse(
  guardrail: AiAssistanceQuestionGuardrailAllowedResultV01,
  casePackage: CasePackageV01,
  mappings: CasePackageEvidenceToClaimMappingV01[],
): AiAssistanceResponseV01 {
  const findings = mappings.map((mapping, index) =>
    buildMappingFinding(guardrail, casePackage, mapping, index),
  );
  const evidenceIds = sortUnique(mappings.map((mapping) => mapping.evidence_id));

  return buildResponseBase(guardrail, casePackage, {
    answer: {
      status: "answered",
      summary: `The deterministic mock found ${evidenceIds.length} cited evidence ${
        evidenceIds.length === 1 ? "item" : "items"
      } in producer-declared package mappings.`,
      evidence_ids: evidenceIds,
    },
    findings,
  });
}

function buildMappingFinding(
  guardrail: AiAssistanceQuestionGuardrailAllowedResultV01,
  casePackage: CasePackageV01,
  mapping: CasePackageEvidenceToClaimMappingV01,
  index: number,
): AiAssistanceResponseV01["findings"][number] {
  const relatedLabelIds = casePackage.claims.find(
    (claim) => claim.claim_id === mapping.claim_id,
  )?.linked_label_ids;
  const insufficiencyReason = ["insufficient", "missing_evidence"].includes(
    mapping.relationship,
  )
    ? "The package producer marked this relationship as insufficient or missing evidence."
    : undefined;

  return {
    finding_id: buildStableId("finding", [
      guardrail.question_id,
      mapping.claim_id,
      mapping.evidence_id,
      String(index),
    ]),
    text: `Package mapping ${mapping.evidence_id} to ${mapping.claim_id} is marked ${formatRelationship(
      mapping.relationship,
    )}.`,
    support: toFindingSupport(mapping.relationship),
    evidence_ids: [mapping.evidence_id],
    related_claim_ids: [mapping.claim_id],
    ...(relatedLabelIds?.length
      ? { related_label_ids: sortUnique(relatedLabelIds) }
      : {}),
    uncertainty: {
      level: mapping.relationship === "supports" ? "low" : "medium",
      explanation:
        "This deterministic mock restates package mapping metadata and does not replace reviewer judgment.",
    },
    ...(insufficiencyReason ? { insufficiency_reason: insufficiencyReason } : {}),
  };
}

function buildInsufficientResponse(
  guardrail: AiAssistanceQuestionGuardrailAllowedResultV01,
  casePackage: CasePackageV01,
): AiAssistanceResponseV01 {
  const reason =
    "The validated package has no producer-declared evidence mapping that can ground this fixed question.";

  return buildResponseBase(guardrail, casePackage, {
    answer: {
      status: "insufficient_evidence",
      summary:
        "The deterministic mock cannot ground an answer from this CasePackage.",
      evidence_ids: [],
      insufficiency_reason: reason,
    },
    findings: [
      {
        finding_id: buildStableId("finding", [
          guardrail.question_id,
          "insufficient",
        ]),
        text:
          "No grounded package mapping is available for this fixed question.",
        support: "insufficient",
        evidence_ids: [],
        ...(guardrail.references.claim_id
          ? { related_claim_ids: [guardrail.references.claim_id] }
          : {}),
        ...(guardrail.references.label_id
          ? { related_label_ids: [guardrail.references.label_id] }
          : {}),
        insufficiency_reason: reason,
        uncertainty: {
          level: "high",
          explanation:
            "Missing package evidence is preserved instead of inferred.",
        },
      },
    ],
  });
}

function buildClusterImpurityResponse(
  guardrail: AiAssistanceQuestionGuardrailAllowedResultV01,
  casePackage: CasePackageV01,
): AiAssistanceResponseV01 {
  const {
    evidence_id: focusedEvidenceId,
    claim_id: focusedClaimId,
    label_id: focusedLabelId,
  } = guardrail.references;
  const focusedLabelClaimIds = new Set(
    casePackage.candidate_labels.find(
      (label) => label.label_id === focusedLabelId,
    )?.linked_claim_ids ?? [],
  );
  const candidateEvidenceIds = sortUnique(
    casePackage.outlier_impostor_candidates.flatMap((candidate) => {
      if (candidate.evidence_id) return [candidate.evidence_id];
      const session = casePackage.representative_sessions.find(
        (item) => item.session_id === candidate.session_id,
      );
      return session?.linked_evidence_ids ?? [];
    }),
  ).filter((evidenceId) => {
    if (focusedEvidenceId && evidenceId !== focusedEvidenceId) return false;

    const relatedClaimIds = getEvidenceClaimIds(casePackage, evidenceId);
    if (focusedClaimId && !relatedClaimIds.includes(focusedClaimId)) {
      return false;
    }
    if (
      focusedLabelId &&
      !relatedClaimIds.some((claimId) => focusedLabelClaimIds.has(claimId))
    ) {
      return false;
    }

    return true;
  });

  if (candidateEvidenceIds.length === 0) {
    return buildInsufficientResponse(guardrail, casePackage);
  }

  const findings = candidateEvidenceIds.map((evidenceId, index) => {
    const relatedClaimIds = getEvidenceClaimIds(casePackage, evidenceId);
    const relatedLabelIds = sortUnique(
      casePackage.candidate_labels
        .filter((label) =>
          label.linked_claim_ids.some((claimId) =>
            relatedClaimIds.includes(claimId),
          ),
        )
        .map((label) => label.label_id),
    );

    return {
      finding_id: buildStableId("finding", [
        guardrail.question_id,
        evidenceId,
        String(index),
      ]),
      text: `${evidenceId} is linked to a package-declared outlier or impostor candidate.`,
      support: "needs_more_context" as const,
      evidence_ids: [evidenceId],
      ...(relatedClaimIds.length
        ? { related_claim_ids: relatedClaimIds }
        : {}),
      ...(relatedLabelIds.length
        ? { related_label_ids: relatedLabelIds }
        : {}),
      uncertainty: {
        level: "high" as const,
        explanation:
          "A package candidate is a review prompt, not proof that the cluster is impure.",
      },
    };
  });

  return buildResponseBase(guardrail, casePackage, {
    answer: {
      status: "answered",
      summary: `The deterministic mock found ${candidateEvidenceIds.length} package-linked boundary ${
        candidateEvidenceIds.length === 1 ? "signal" : "signals"
      } for human review.`,
      evidence_ids: candidateEvidenceIds,
    },
    findings,
  });
}

function buildRefusedResponse(
  guardrail: AiAssistanceQuestionGuardrailAllowedResultV01,
  casePackage: CasePackageV01,
): AiAssistanceResponseV01 {
  const targetQuestionId = guardrail.references.target_question_id;
  const unavailableReason = guardrail.references.unavailable_reason;
  const knownTarget = targetQuestionId
    ? getAiAssistanceQuestionDefinitionV01(targetQuestionId)
    : undefined;
  const knownReason = AI_ASSISTANCE_UNAVAILABLE_REASONS_V01.find(
    (reason) => reason === unavailableReason,
  );
  const boundaryDetail = [
    knownTarget ? `fixed question ${knownTarget.question_id}` : undefined,
    knownReason ? formatReferenceCode(knownReason) : undefined,
  ]
    .filter(Boolean)
    .join(": ");

  return buildResponseBase(guardrail, casePackage, {
    answer: {
      status: "refused",
      summary: boundaryDetail
        ? `The deterministic mock is unavailable for ${boundaryDetail}.`
        : "The deterministic mock does not answer requests outside the fixed CasePackage evidence boundary.",
      evidence_ids: [],
      refusal_reason: "unsupported_request",
    },
    findings: [],
  });
}

function getEvidenceClaimIds(
  casePackage: CasePackageV01,
  evidenceId: string,
): string[] {
  const evidenceLinkedClaimIds =
    casePackage.evidence_items.find((item) => item.evidence_id === evidenceId)
      ?.linked_claim_ids ?? [];
  const mappingClaimIds = casePackage.evidence_to_claim_mappings
    .filter((mapping) => mapping.evidence_id === evidenceId)
    .map((mapping) => mapping.claim_id);
  const claimLinkedIds = casePackage.claims
    .filter((claim) => claim.linked_evidence_ids.includes(evidenceId))
    .map((claim) => claim.claim_id);

  return sortUnique([
    ...evidenceLinkedClaimIds,
    ...mappingClaimIds,
    ...claimLinkedIds,
  ]);
}

function formatReferenceCode(value: string): string {
  return value.replaceAll("_", " ");
}

function buildResponseBase(
  guardrail: AiAssistanceQuestionGuardrailAllowedResultV01,
  casePackage: CasePackageV01,
  content: Pick<AiAssistanceResponseV01, "answer" | "findings">,
): AiAssistanceResponseV01 {
  return {
    schema_version: AI_ASSISTANCE_RESPONSE_V01_SCHEMA_VERSION,
    response_id: buildStableId("ai-response-mock", [
      casePackage.package_id,
      casePackage.package_revision ?? "unrevisioned",
      guardrail.question_id,
      JSON.stringify(guardrail.references),
    ]),
    created_at: MOCK_CREATED_AT,
    case_package: createMockAiAssistanceCasePackageReferenceV01(casePackage),
    question: guardrail.question,
    generation: mockGeneration,
    ...content,
  };
}

function getRequestResponseConsistencyErrors(
  guardrail: AiAssistanceQuestionGuardrailAllowedResultV01,
  response: AiAssistanceResponseV01,
): AiAssistanceResponseValidationErrorV01[] {
  const errors: AiAssistanceResponseValidationErrorV01[] = [];

  if (
    response.question.question_id !== guardrail.question.question_id ||
    response.question.question_type !== guardrail.question.question_type ||
    response.question.text !== guardrail.question.text
  ) {
    errors.push({
      path: "$.question",
      code: "question_request_mismatch",
      message:
        "Response question metadata must match the guarded fixed question.",
    });
  }

  if (!guardrail.expected_answer_statuses.includes(response.answer.status)) {
    errors.push({
      path: "$.answer.status",
      code: "unexpected_answer_status",
      message: "Response answer status is not allowed for the guarded question.",
    });
  }

  return errors;
}

function toFindingSupport(
  relationship: CasePackageEvidenceToClaimMappingV01["relationship"],
): AiAssistanceFindingSupportV01 {
  if (relationship === "supports") return "supports";
  if (relationship === "weak_support") return "weak_support";
  if (relationship === "contradicts") return "contradicts";
  if (relationship === "insufficient" || relationship === "missing_evidence") {
    return "insufficient";
  }
  return "needs_more_context";
}

function relationshipRank(
  relationship: CasePackageEvidenceToClaimMappingV01["relationship"],
): number {
  if (relationship === "supports") return 0;
  if (relationship === "weak_support") return 1;
  return 2;
}

function sortMappings(
  mappings: CasePackageEvidenceToClaimMappingV01[],
): CasePackageEvidenceToClaimMappingV01[] {
  return [...mappings].sort((left, right) =>
    `${left.evidence_id}:${left.claim_id}:${left.relationship}`.localeCompare(
      `${right.evidence_id}:${right.claim_id}:${right.relationship}`,
    ),
  );
}

function formatRelationship(
  relationship: CasePackageEvidenceToClaimMappingV01["relationship"],
): string {
  return relationship.replaceAll("_", " ");
}

function buildStableId(prefix: string, parts: string[]): string {
  const input = parts.join("\u001f");
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `${prefix}-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function sortUnique<T extends string>(values: readonly T[]): T[] {
  return [...new Set(values)].sort();
}

export function buildMockAiAssistanceRequestV01(
  questionId: string,
  references: AiAssistanceQuestionGuardrailRequestV01["references"],
): AiAssistanceQuestionGuardrailRequestV01 {
  return {
    question_id: questionId,
    references: references ?? {},
  };
}
