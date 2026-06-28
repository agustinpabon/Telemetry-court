import type {
  AiAssistanceFindingSupportV01,
  AiAssistanceOutputWarningCodeV01,
  AiAssistanceResponseV01,
  AiAssistanceUncertaintyLevelV01,
} from "@/lib/aiAssistanceResponseV01";
import {
  validateAiAssistanceResponseV01,
  type AiAssistanceResponseValidationErrorV01,
  type AiAssistanceResponseValidationWarningV01,
} from "@/lib/aiAssistanceResponseValidationV01";
import type {
  CasePackageClaimId,
  CasePackageEvidenceId,
  CasePackageV01,
} from "@/lib/types";

export const AI_ASSISTANCE_CLAIM_CRITIC_V01_SCHEMA_VERSION =
  "ai_assistance_claim_critic.v0.1" as const;

export const AI_ASSISTANCE_CLAIM_CRITIC_V01_CALCULATION_VERSION =
  "ai_assistance_claim_critic_calculation.v0.1" as const;

const SUPPORT_ORDER = [
  "supports",
  "weak_support",
  "contradicts",
  "insufficient",
  "needs_more_context",
] as const satisfies readonly AiAssistanceFindingSupportV01[];

export type AiAssistanceClaimCriticSupportCountsV01 = Record<
  AiAssistanceFindingSupportV01,
  number
>;

export type AiAssistanceClaimCriticAnswerAssessmentV01 =
  | "grounded_answer"
  | "valid_insufficient_evidence"
  | "valid_refusal"
  | "invalid_answer_grounding";

export type AiAssistanceClaimCriticClaimCoverageV01 =
  | AiAssistanceFindingSupportV01
  | "mixed"
  | "missing";

export type AiAssistanceClaimCriticItemKindV01 =
  | "finding_support"
  | "missing_claim_coverage"
  | "insufficient_evidence"
  | "refusal"
  | "output_warning"
  | "validation_error"
  | "validator_warning";

export type AiAssistanceClaimCriticValidationSummaryV01 = {
  ok: boolean;
  errors: AiAssistanceResponseValidationErrorV01[];
  warnings: AiAssistanceResponseValidationWarningV01[];
};

export type AiAssistanceClaimCriticAnswerSummaryV01 = {
  status: AiAssistanceResponseV01["answer"]["status"];
  assessment: AiAssistanceClaimCriticAnswerAssessmentV01;
  evidence_ids: CasePackageEvidenceId[];
  insufficiency_reason?: string;
  refusal_reason?: AiAssistanceResponseV01["answer"]["refusal_reason"];
  issue_codes: string[];
};

export type AiAssistanceClaimCriticClaimSummaryV01 = {
  claim_id: CasePackageClaimId;
  coverage: AiAssistanceClaimCriticClaimCoverageV01;
  finding_ids: string[];
  evidence_ids: CasePackageEvidenceId[];
  support_counts: AiAssistanceClaimCriticSupportCountsV01;
  uncertainty_levels: AiAssistanceUncertaintyLevelV01[];
};

export type AiAssistanceClaimCriticEvidenceSummaryV01 = {
  evidence_id: CasePackageEvidenceId;
  cited_by_answer: boolean;
  finding_ids: string[];
  claim_ids: CasePackageClaimId[];
  support_categories: AiAssistanceFindingSupportV01[];
};

export type AiAssistanceClaimCriticItemV01 = {
  item_id: string;
  kind: AiAssistanceClaimCriticItemKindV01;
  support: AiAssistanceFindingSupportV01 | undefined;
  claim_ids: CasePackageClaimId[];
  evidence_ids: CasePackageEvidenceId[];
  finding_id: string | undefined;
  warning_code:
    | AiAssistanceOutputWarningCodeV01
    | AiAssistanceResponseValidationWarningV01["code"]
    | undefined;
  validation_code: string | undefined;
  uncertainty_level: AiAssistanceUncertaintyLevelV01 | undefined;
  message: string;
};

export type AiAssistanceClaimCriticReportV01 = {
  schema_version: typeof AI_ASSISTANCE_CLAIM_CRITIC_V01_SCHEMA_VERSION;
  calculation_version: typeof AI_ASSISTANCE_CLAIM_CRITIC_V01_CALCULATION_VERSION;
  response_id: string;
  case_package: AiAssistanceResponseV01["case_package"];
  validation: AiAssistanceClaimCriticValidationSummaryV01;
  answer: AiAssistanceClaimCriticAnswerSummaryV01;
  support_counts: AiAssistanceClaimCriticSupportCountsV01;
  referenced_claim_ids: CasePackageClaimId[];
  cited_evidence_ids: CasePackageEvidenceId[];
  finding_evidence_ids: CasePackageEvidenceId[];
  missing_claim_ids: CasePackageClaimId[];
  unsupported_claim_ids: CasePackageClaimId[];
  unknown_claim_ids: CasePackageClaimId[];
  unknown_evidence_ids: CasePackageEvidenceId[];
  findings_without_claim_ids: string[];
  claims: AiAssistanceClaimCriticClaimSummaryV01[];
  evidence: AiAssistanceClaimCriticEvidenceSummaryV01[];
  critique_items: AiAssistanceClaimCriticItemV01[];
};

export type AiAssistanceClaimCriticContextV01 = {
  casePackage: CasePackageV01;
};

export function createAiAssistanceClaimCriticReportV01(
  response: AiAssistanceResponseV01,
  context: AiAssistanceClaimCriticContextV01,
): AiAssistanceClaimCriticReportV01 {
  const validationResult = validateAiAssistanceResponseV01(response, {
    casePackage: context.casePackage,
  });
  const validation = {
    ok: validationResult.ok,
    errors: validationResult.ok ? [] : validationResult.errors,
    warnings: validationResult.warnings,
  };

  const knownClaimIds = new Set(
    context.casePackage.claims.map((claim) => claim.claim_id),
  );
  const knownEvidenceIds = new Set(
    context.casePackage.evidence_items.map((item) => item.evidence_id),
  );
  const answerEvidenceIds = sortUnique(response.answer.evidence_ids);
  const findingEvidenceIds = sortUnique(
    response.findings.flatMap((finding) => finding.evidence_ids),
  );
  const outputWarningEvidenceIds = sortUnique(
    response.warnings?.flatMap((warning) => warning.evidence_ids ?? []) ?? [],
  );
  const citedEvidenceIds = sortUnique([
    ...answerEvidenceIds,
    ...findingEvidenceIds,
  ]);
  const allReferencedEvidenceIds = sortUnique([
    ...citedEvidenceIds,
    ...outputWarningEvidenceIds,
  ]);
  const referencedClaimIds = sortUnique(
    response.findings.flatMap((finding) => finding.related_claim_ids ?? []),
  );
  const supportCounts = countSupports(response.findings);
  const claims = buildClaimSummaries(response, context.casePackage);
  const missingClaimIds = claims
    .filter((claim) => claim.coverage === "missing")
    .map((claim) => claim.claim_id);
  const unsupportedClaimIds = claims
    .filter((claim) => hasUnsupportedCoverage(claim))
    .map((claim) => claim.claim_id);

  return {
    schema_version: AI_ASSISTANCE_CLAIM_CRITIC_V01_SCHEMA_VERSION,
    calculation_version: AI_ASSISTANCE_CLAIM_CRITIC_V01_CALCULATION_VERSION,
    response_id: response.response_id,
    case_package: response.case_package,
    validation,
    answer: buildAnswerSummary(response, validation.errors),
    support_counts: supportCounts,
    referenced_claim_ids: referencedClaimIds,
    cited_evidence_ids: citedEvidenceIds,
    finding_evidence_ids: findingEvidenceIds,
    missing_claim_ids: missingClaimIds,
    unsupported_claim_ids: unsupportedClaimIds,
    unknown_claim_ids: referencedClaimIds.filter((claimId) => !knownClaimIds.has(claimId)),
    unknown_evidence_ids: allReferencedEvidenceIds.filter(
      (evidenceId) => !knownEvidenceIds.has(evidenceId),
    ),
    findings_without_claim_ids: response.findings
      .filter((finding) => (finding.related_claim_ids ?? []).length === 0)
      .map((finding) => finding.finding_id)
      .sort(),
    claims,
    evidence: buildEvidenceSummaries(response, context.casePackage),
    critique_items: buildCritiqueItems(response, validation, missingClaimIds),
  };
}

function buildAnswerSummary(
  response: AiAssistanceResponseV01,
  validationErrors: AiAssistanceResponseValidationErrorV01[],
): AiAssistanceClaimCriticAnswerSummaryV01 {
  const issueCodes = validationErrors
    .filter(
      (error) =>
        error.path.startsWith("$.answer") ||
        error.code === "missing_grounded_findings",
    )
    .map((error) => error.code);

  return {
    status: response.answer.status,
    assessment: assessAnswer(response, issueCodes),
    evidence_ids: sortUnique(response.answer.evidence_ids),
    insufficiency_reason: response.answer.insufficiency_reason,
    refusal_reason: response.answer.refusal_reason,
    issue_codes: issueCodes,
  };
}

function assessAnswer(
  response: AiAssistanceResponseV01,
  issueCodes: string[],
): AiAssistanceClaimCriticAnswerAssessmentV01 {
  if (issueCodes.length > 0) return "invalid_answer_grounding";

  if (response.answer.status === "answered") {
    return response.answer.evidence_ids.length > 0
      ? "grounded_answer"
      : "invalid_answer_grounding";
  }

  if (response.answer.status === "insufficient_evidence") {
    return response.answer.insufficiency_reason
      ? "valid_insufficient_evidence"
      : "invalid_answer_grounding";
  }

  return response.answer.refusal_reason ? "valid_refusal" : "invalid_answer_grounding";
}

function buildClaimSummaries(
  response: AiAssistanceResponseV01,
  casePackage: CasePackageV01,
): AiAssistanceClaimCriticClaimSummaryV01[] {
  return [...casePackage.claims]
    .sort((left, right) => left.claim_id.localeCompare(right.claim_id))
    .map((claim) => {
      const findings = response.findings.filter((finding) =>
        (finding.related_claim_ids ?? []).includes(claim.claim_id),
      );
      const supportCounts = countSupports(findings);

      return {
        claim_id: claim.claim_id,
        coverage: determineClaimCoverage(supportCounts),
        finding_ids: findings.map((finding) => finding.finding_id).sort(),
        evidence_ids: sortUnique(
          findings.flatMap((finding) => finding.evidence_ids),
        ),
        support_counts: supportCounts,
        uncertainty_levels: sortUnique(
          findings.flatMap((finding) =>
            finding.uncertainty ? [finding.uncertainty.level] : [],
          ),
        ),
      };
    });
}

function buildEvidenceSummaries(
  response: AiAssistanceResponseV01,
  casePackage: CasePackageV01,
): AiAssistanceClaimCriticEvidenceSummaryV01[] {
  const answerEvidenceIds = new Set(response.answer.evidence_ids);

  return sortUnique([
    ...response.answer.evidence_ids,
    ...response.findings.flatMap((finding) => finding.evidence_ids),
  ]).map((evidenceId) => {
    const findings = response.findings.filter((finding) =>
      finding.evidence_ids.includes(evidenceId),
    );
    const packageEvidence = casePackage.evidence_items.find(
      (item) => item.evidence_id === evidenceId,
    );

    return {
      evidence_id: evidenceId,
      cited_by_answer: answerEvidenceIds.has(evidenceId),
      finding_ids: findings.map((finding) => finding.finding_id).sort(),
      claim_ids: sortUnique([
        ...(packageEvidence?.linked_claim_ids ?? []),
        ...findings.flatMap((finding) => finding.related_claim_ids ?? []),
      ]),
      support_categories: sortSupports(
        sortUnique(findings.map((finding) => finding.support)),
      ),
    };
  });
}

function buildCritiqueItems(
  response: AiAssistanceResponseV01,
  validation: AiAssistanceClaimCriticValidationSummaryV01,
  missingClaimIds: CasePackageClaimId[],
): AiAssistanceClaimCriticItemV01[] {
  const validationItems = validation.errors.map((error) => ({
    item_id: `validation:${error.path}:${error.code}`,
    kind: "validation_error" as const,
    support: undefined,
    claim_ids: [],
    evidence_ids: [],
    finding_id: undefined,
    warning_code: undefined,
    validation_code: error.code,
    uncertainty_level: undefined,
    message: error.message,
  }));
  const findingItems = response.findings.map((finding) => ({
    item_id: `finding:${finding.finding_id}`,
    kind: "finding_support" as const,
    support: finding.support,
    claim_ids: sortUnique(finding.related_claim_ids ?? []),
    evidence_ids: sortUnique(finding.evidence_ids),
    finding_id: finding.finding_id,
    warning_code: undefined,
    validation_code: undefined,
    uncertainty_level: finding.uncertainty?.level,
    message: finding.text,
  }));
  const answerItems =
    response.answer.status === "insufficient_evidence"
      ? [
          {
            item_id: "answer:insufficient_evidence",
            kind: "insufficient_evidence" as const,
            support: "insufficient" as const,
            claim_ids: [],
            evidence_ids: sortUnique(response.answer.evidence_ids),
            finding_id: undefined,
            warning_code: undefined,
            validation_code: undefined,
            uncertainty_level: undefined,
            message: response.answer.insufficiency_reason ?? "",
          },
        ]
      : response.answer.status === "refused"
        ? [
            {
              item_id: "answer:refused",
              kind: "refusal" as const,
              support: undefined,
              claim_ids: [],
              evidence_ids: sortUnique(response.answer.evidence_ids),
              finding_id: undefined,
              warning_code: undefined,
              validation_code: undefined,
              uncertainty_level: undefined,
              message: response.answer.refusal_reason ?? "",
            },
          ]
        : [];
  const missingCoverageItems =
    validation.ok && response.answer.status !== "refused"
      ? missingClaimIds.map((claimId) => ({
          item_id: `claim:${claimId}:missing_coverage`,
          kind: "missing_claim_coverage" as const,
          support: undefined,
          claim_ids: [claimId],
          evidence_ids: [],
          finding_id: undefined,
          warning_code: undefined,
          validation_code: undefined,
          uncertainty_level: undefined,
          message: "No finding references this CasePackage claim.",
        }))
      : [];
  const outputWarningItems = (response.warnings ?? []).map((warning) => ({
    item_id: `output_warning:${warning.warning_id}`,
    kind: "output_warning" as const,
    support: undefined,
    claim_ids: [],
    evidence_ids: sortUnique(warning.evidence_ids ?? []),
    finding_id: undefined,
    warning_code: warning.code,
    validation_code: undefined,
    uncertainty_level: undefined,
    message: warning.message,
  }));
  const validatorWarningItems = validation.warnings.map((warning) => ({
    item_id: `validator_warning:${warning.path}:${warning.code}`,
    kind: "validator_warning" as const,
    support: undefined,
    claim_ids: [],
    evidence_ids: [],
    finding_id: undefined,
    warning_code: warning.code,
    validation_code: undefined,
    uncertainty_level: undefined,
    message: warning.message,
  }));

  return [
    ...validationItems,
    ...findingItems,
    ...answerItems,
    ...missingCoverageItems,
    ...outputWarningItems,
    ...validatorWarningItems,
  ];
}

function countSupports(
  findings: readonly AiAssistanceResponseV01["findings"][number][],
): AiAssistanceClaimCriticSupportCountsV01 {
  return SUPPORT_ORDER.reduce(
    (counts, support) => ({
      ...counts,
      [support]: findings.filter((finding) => finding.support === support).length,
    }),
    {} as AiAssistanceClaimCriticSupportCountsV01,
  );
}

function determineClaimCoverage(
  supportCounts: AiAssistanceClaimCriticSupportCountsV01,
): AiAssistanceClaimCriticClaimCoverageV01 {
  const presentSupports = SUPPORT_ORDER.filter(
    (support) => supportCounts[support] > 0,
  );

  if (presentSupports.length === 0) return "missing";
  if (presentSupports.length === 1) return presentSupports[0];
  return "mixed";
}

function hasUnsupportedCoverage(
  claim: AiAssistanceClaimCriticClaimSummaryV01,
): boolean {
  const supportCount =
    claim.support_counts.supports + claim.support_counts.weak_support;
  const unsupportedCount =
    claim.support_counts.contradicts +
    claim.support_counts.insufficient +
    claim.support_counts.needs_more_context;

  return supportCount === 0 && unsupportedCount > 0;
}

function sortSupports(
  supports: AiAssistanceFindingSupportV01[],
): AiAssistanceFindingSupportV01[] {
  return [...supports].sort(
    (left, right) => SUPPORT_ORDER.indexOf(left) - SUPPORT_ORDER.indexOf(right),
  );
}

function sortUnique<T extends string>(values: readonly T[]): T[] {
  return [...new Set(values)].sort();
}
