import type { CaseFile } from "@/lib/types";

export const reviewReadinessOptions = [
  {
    id: "ready",
    label: "Yes — I can judge from this evidence",
    helper: "Choose the best-supported interpretation below.",
    tone: "ready",
  },
  {
    id: "need_context",
    label: "No — I cannot judge from this evidence",
    helper: "Record insufficient context and continue without guessing.",
    tone: "cannot_judge",
  },
  {
    id: "domain_terms",
    label: "I do not understand enough domain terms to review this case.",
    helper: "Record a domain-context limitation instead of forcing a judgment.",
    tone: "domain_context",
  },
] as const;

export type ReviewReadinessChoice = (typeof reviewReadinessOptions)[number]["id"];

export type InsufficientContextGuidance = Exclude<
  ReviewReadinessChoice,
  "ready"
>;

export type VisibleDomainContextDefinition = {
  label: string;
  definition: string;
};

export function getInsufficientContextGuidance(
  choice?: ReviewReadinessChoice,
): InsufficientContextGuidance | undefined {
  return choice === "need_context" || choice === "domain_terms"
    ? choice
    : undefined;
}

export function resolveReviewReadinessChoice(
  caseFile: CaseFile,
  reviewState: {
    reviewReadiness?: ReviewReadinessChoice;
    blindChoiceId?: string;
  },
): ReviewReadinessChoice | undefined {
  if (
    reviewState.reviewReadiness &&
    reviewReadinessOptions.some(
      (option) => option.id === reviewState.reviewReadiness,
    )
  ) {
    return reviewState.reviewReadiness;
  }

  if (!reviewState.blindChoiceId) {
    return undefined;
  }

  return reviewState.blindChoiceId === getContextLimitedBlindOptionId(caseFile)
    ? "need_context"
    : "ready";
}

export function getContextLimitedBlindOptionId(
  caseFile: CaseFile,
): string | undefined {
  return (
    caseFile.blindInterpretationOptions.find((option) =>
      /not enough|insufficient|context/i.test(`${option.id} ${option.label}`),
    )?.id ??
    caseFile.blindInterpretationOptions.find((option) =>
      /none/i.test(`${option.id} ${option.label}`),
    )?.id
  );
}

export function getVisibleDomainContextTerms(caseFile: CaseFile): string[] {
  return getVisibleDomainContextDefinitions(caseFile).map(
    (definition) => definition.label,
  );
}

export function getVisibleDomainContextDefinitions(
  caseFile: CaseFile,
): VisibleDomainContextDefinition[] {
  const visibleText = [
    caseFile.dataset,
    caseFile.cluster.name,
    caseFile.cluster.description,
    ...caseFile.topFeatures,
    ...caseFile.riskFlags,
  ]
    .filter(Boolean)
    .join(" ");
  const candidates = [
    [
      /\biam\b|iam:/i,
      "IAM",
      "Identity and access management activity involving roles, policies, or permissions.",
    ],
    [
      /cloudtrail/i,
      "CloudTrail",
      "AWS event records that show actions taken in an account.",
    ],
    [
      /role provisioning/i,
      "Role provisioning",
      "Creating and configuring roles for a planned service or workflow.",
    ],
    [
      /powershell/i,
      "PowerShell",
      "A Windows command-line and scripting environment.",
    ],
    [/\bs3\b/i, "S3", "AWS object storage used for files and data."],
    [
      /credential/i,
      "Credential access",
      "Attempts to obtain or use authentication secrets.",
    ],
    [
      /encoded command/i,
      "Encoded command",
      "A command stored in encoded text that must be decoded to inspect.",
    ],
    [
      /service/i,
      "Service activity",
      "Actions performed by an application or automated service.",
    ],
  ] as const;
  const definitions = candidates
    .filter(([pattern]) => pattern.test(visibleText))
    .map(([, label, definition]) => ({ label, definition }));

  return definitions
    .filter(
      (definition, index) =>
        definitions.findIndex(
          (candidate) => candidate.label === definition.label,
        ) === index,
    )
    .slice(0, 3);
}
