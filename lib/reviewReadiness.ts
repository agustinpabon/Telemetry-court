import type { CaseFile } from "@/lib/types";

export const reviewReadinessOptions = [
  {
    id: "ready",
    label: "I have enough context to review this case.",
  },
  {
    id: "need_context",
    label: "I need more context before judging.",
  },
  {
    id: "domain_terms",
    label: "I do not understand enough domain terms to review this case.",
  },
] as const;

export type ReviewReadinessChoice = (typeof reviewReadinessOptions)[number]["id"];

export type InsufficientContextGuidance = Exclude<
  ReviewReadinessChoice,
  "ready"
>;

export function getInsufficientContextGuidance(
  choice?: ReviewReadinessChoice,
): InsufficientContextGuidance | undefined {
  return choice === "need_context" || choice === "domain_terms"
    ? choice
    : undefined;
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
    [/\biam\b|iam:/i, "IAM"],
    [/cloudtrail/i, "CloudTrail"],
    [/role provisioning/i, "role provisioning"],
    [/powershell/i, "PowerShell"],
    [/\bs3\b/i, "S3"],
    [/credential/i, "credential access"],
    [/encoded command/i, "encoded command"],
    [/service/i, "service activity"],
  ] as const;
  const terms = candidates
    .filter(([pattern]) => pattern.test(visibleText))
    .map(([, term]) => term);

  return [...new Set(terms)].slice(0, 3);
}
