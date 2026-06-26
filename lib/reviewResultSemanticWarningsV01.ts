import type { ReviewResultV01 } from "@/lib/reviewResultV01";
import type { CaseFile, CasePackageV01, DuelReason } from "@/lib/types";

export type ReviewResultSemanticWarningCodeV01 =
  | "semantic.insufficient_blind_interpretation_selected_overclaim_label"
  | "semantic.needs_better_evidence_without_failure_modes"
  | "semantic.core_session_selected_as_outlier"
  | "semantic.negative_reason_on_selected_label";

export type ReviewResultSemanticWarningV01 = {
  path: string;
  code: ReviewResultSemanticWarningCodeV01;
  message: string;
  reviewId: string;
};

export type ReviewResultSemanticCandidateLabelContextV01 = {
  labelId: string;
  source:
    | "ai_generated"
    | "human_baseline"
    | "alternative_model"
    | "prompt_variant"
    | "synthetic_fixture";
  overclaimSignals: string[];
};

export type ReviewResultSemanticSessionContextV01 = {
  sessionId: string;
  flags: string[];
  membershipScore?: number;
  distanceToCentroid?: number;
};

export type ReviewResultSemanticCaseContextV01 = {
  casePackageReference?: {
    packageId: string;
    packageRevision?: string;
    caseId: string;
    clusterId: string;
    pipelineRunId: string;
  };
  candidateLabels: ReviewResultSemanticCandidateLabelContextV01[];
  representativeSessions: ReviewResultSemanticSessionContextV01[];
  outlierImpostorCandidateSessionIds: string[];
};

export type ReviewResultSemanticWarningOptionsV01 = {
  caseContext?: ReviewResultSemanticCaseContextV01;
};

const insufficientBlindPattern =
  /\b(insufficient|not enough|too little|missing|needs? (more|better) evidence|cannot judge)\b/i;
const overclaimSignalPattern =
  /\b(overclaim|unsupported|unsubstantiated|insufficient|missing evidence|missing malicious intent|missing downstream abuse|too broad|contradict)\b/i;
const highMembershipThreshold = 0.72;
const negativeSelectedLabelReasonCodes = [
  "too_broad",
  "missing_evidence",
  "missing_malicious_intent",
  "missing_downstream_abuse",
  "cluster_seems_mixed",
] as const satisfies readonly DuelReason[];

export function getReviewResultSemanticWarningsV01(
  reviewResult: ReviewResultV01,
  options: ReviewResultSemanticWarningOptionsV01 = {},
): ReviewResultSemanticWarningV01[] {
  const warnings: ReviewResultSemanticWarningV01[] = [];
  const caseContext = getMatchingCaseContext(reviewResult, options.caseContext);

  addInsufficientBlindOverclaimWarning(warnings, reviewResult, caseContext);
  addNeedsBetterEvidenceWarning(warnings, reviewResult);
  addCoreSessionOutlierWarning(warnings, reviewResult, caseContext);
  addNegativeSelectedLabelReasonWarning(warnings, reviewResult);

  return warnings;
}

export function buildReviewResultSemanticContextFromCasePackageV01(
  casePackage: CasePackageV01,
): ReviewResultSemanticCaseContextV01 {
  return {
    casePackageReference: {
      packageId: casePackage.package_id,
      packageRevision: casePackage.package_revision,
      caseId: casePackage.case.case_id,
      clusterId: casePackage.cluster.cluster_id,
      pipelineRunId: casePackage.pipeline.run_id,
    },
    candidateLabels: casePackage.candidate_labels.map((label) => ({
      labelId: label.label_id,
      source: label.source,
      overclaimSignals: getCasePackageLabelOverclaimSignals(casePackage, label),
    })),
    representativeSessions: casePackage.representative_sessions.map((session) => ({
      sessionId: session.session_id,
      flags: [...session.flags],
      membershipScore: readAvailableMetric(
        session.cluster_membership.membership_score,
      ),
      distanceToCentroid: readAvailableMetric(
        session.cluster_membership.distance_to_centroid,
      ),
    })),
    outlierImpostorCandidateSessionIds: uniqueSorted(
      casePackage.outlier_impostor_candidates
        .map((candidate) => candidate.session_id)
        .filter((sessionId): sessionId is string => Boolean(sessionId)),
    ),
  };
}

export function buildReviewResultSemanticContextFromCaseFileV01(
  caseFile: CaseFile,
): ReviewResultSemanticCaseContextV01 | undefined {
  if (!caseFile.casePackageReference) {
    return undefined;
  }

  return {
    casePackageReference: {
      packageId: caseFile.casePackageReference.package_id,
      packageRevision: caseFile.casePackageReference.package_revision,
      caseId: caseFile.casePackageReference.case_id,
      clusterId: caseFile.casePackageReference.cluster_id,
      pipelineRunId: caseFile.casePackageReference.pipeline.run_id,
    },
    candidateLabels: caseFile.candidateLabels.map((label) => ({
      labelId: label.id,
      source: mapCaseFileCandidateSource(label.source),
      overclaimSignals:
        label.source === "baseline_ai" && caseFile.landscapeStatus === "overclaimed"
          ? ["case_file.landscape_status.overclaimed"]
          : getTextOverclaimSignals([label.label, label.rationale]),
    })),
    representativeSessions: caseFile.representativeSessions.map((session) => ({
      sessionId: session.id,
      flags: session.isOutlierImpostorCandidate
        ? ["outlier_candidate"]
        : ["representative"],
      membershipScore: session.featureOverlap,
      distanceToCentroid: session.outlierScore,
    })),
    outlierImpostorCandidateSessionIds: uniqueSorted(
      caseFile.representativeSessions
        .filter((session) => session.isOutlierImpostorCandidate)
        .map((session) => session.id),
    ),
  };
}

function addInsufficientBlindOverclaimWarning(
  warnings: ReviewResultSemanticWarningV01[],
  reviewResult: ReviewResultV01,
  caseContext: ReviewResultSemanticCaseContextV01 | undefined,
) {
  if (!caseContext) return;

  const blindInterpretation = reviewResult.decisions.blind_interpretation;
  const selectedLabel = caseContext.candidateLabels.find(
    (label) =>
      label.labelId === reviewResult.decisions.label_comparison.selected_label_id,
  );

  if (
    !selectedLabel ||
    selectedLabel.source !== "ai_generated" ||
    selectedLabel.overclaimSignals.length === 0 ||
    !insufficientBlindPattern.test(
      `${blindInterpretation.option_id} ${blindInterpretation.label}`,
    )
  ) {
    return;
  }

  warnings.push({
    path: "$.decisions.label_comparison.selected_label_id",
    code: "semantic.insufficient_blind_interpretation_selected_overclaim_label",
    reviewId: reviewResult.review_id,
    message: `Blind interpretation records insufficient evidence, but selected_label_id "${selectedLabel.labelId}" accepts an AI-generated label with overclaim or evidence-gap signals as best-supported. The ReviewResult remains valid; confirm this selection is intentional.`,
  });
}

function addNeedsBetterEvidenceWarning(
  warnings: ReviewResultSemanticWarningV01[],
  reviewResult: ReviewResultV01,
) {
  const decisions = reviewResult.decisions;
  const requestsBetterEvidence =
    decisions.final_verdict === "needs_better_evidence" ||
    decisions.recommended_action === "collect_more_evidence";

  if (!requestsBetterEvidence || decisions.failure_modes.length > 0) {
    return;
  }

  warnings.push({
    path: "$.decisions.failure_modes",
    code: "semantic.needs_better_evidence_without_failure_modes",
    reviewId: reviewResult.review_id,
    message:
      "ReviewResult requests better evidence but has no failure_mode reason codes explaining the evidence gap. The artifact remains valid; preserve the reviewer choice and add reasons only when available.",
  });
}

function addCoreSessionOutlierWarning(
  warnings: ReviewResultSemanticWarningV01[],
  reviewResult: ReviewResultV01,
  caseContext: ReviewResultSemanticCaseContextV01 | undefined,
) {
  if (!caseContext) return;

  const selectedSessionId =
    reviewResult.decisions.outlier_impostor.selected_session_id;
  const selectedSession = caseContext.representativeSessions.find(
    (session) => session.sessionId === selectedSessionId,
  );

  if (!selectedSession) return;

  const flags = new Set(selectedSession.flags);
  const hasCandidateSignal =
    caseContext.outlierImpostorCandidateSessionIds.includes(selectedSessionId) ||
    flags.has("outlier_candidate") ||
    flags.has("impostor_candidate");
  const hasCoreSignal =
    flags.has("representative") ||
    (selectedSession.membershipScore ?? 0) >= highMembershipThreshold;

  if (hasCandidateSignal || !hasCoreSignal) {
    return;
  }

  warnings.push({
    path: "$.decisions.outlier_impostor.selected_session_id",
    code: "semantic.core_session_selected_as_outlier",
    reviewId: reviewResult.review_id,
    message: `selected_session_id "${selectedSessionId}" points to a representative or high-membership session that is not identified as an outlier/impostor candidate in the CasePackage context. The ReviewResult remains valid; confirm the cluster-fit selection is intentional.`,
  });
}

function addNegativeSelectedLabelReasonWarning(
  warnings: ReviewResultSemanticWarningV01[],
  reviewResult: ReviewResultV01,
) {
  const negativeReasons =
    reviewResult.decisions.label_comparison.reason_codes.filter(
      (reason) =>
        (negativeSelectedLabelReasonCodes as readonly string[]).includes(reason),
    );

  if (negativeReasons.length === 0) {
    return;
  }

  warnings.push({
    path: "$.decisions.label_comparison.reason_codes",
    code: "semantic.negative_reason_on_selected_label",
    reviewId: reviewResult.review_id,
    message: `label_comparison.reason_codes includes negative selected-label reason code(s) ${negativeReasons.join(", ")} even though selected_label_id records the selected best-supported label. The ReviewResult remains valid; use failure_modes for final verdict rationale when needed.`,
  });
}

function getMatchingCaseContext(
  reviewResult: ReviewResultV01,
  caseContext: ReviewResultSemanticCaseContextV01 | undefined,
): ReviewResultSemanticCaseContextV01 | undefined {
  if (!caseContext?.casePackageReference) {
    return caseContext;
  }

  const reference = caseContext.casePackageReference;
  const reviewReference = reviewResult.case_package;
  const revisionMatches =
    reference.packageRevision === undefined ||
    reviewReference.package_revision === undefined ||
    reference.packageRevision === reviewReference.package_revision;

  if (
    reference.packageId !== reviewReference.package_id ||
    reference.caseId !== reviewReference.case_id ||
    reference.clusterId !== reviewReference.cluster_id ||
    reference.pipelineRunId !== reviewReference.pipeline.run_id ||
    !revisionMatches
  ) {
    return undefined;
  }

  return caseContext;
}

function getCasePackageLabelOverclaimSignals(
  casePackage: CasePackageV01,
  label: CasePackageV01["candidate_labels"][number],
): string[] {
  const linkedClaimIds = new Set(label.linked_claim_ids);
  const linkedClaims = casePackage.claims.filter(
    (claim) =>
      linkedClaimIds.has(claim.claim_id) ||
      claim.linked_label_ids?.includes(label.label_id),
  );
  const linkedMappings = casePackage.evidence_to_claim_mappings.filter((mapping) =>
    linkedClaimIds.has(mapping.claim_id),
  );
  const explicitSignals = [
    ...linkedClaims
      .filter((claim) => claim.evidence_status === "missing_evidence_declared")
      .map((claim) => `claim:${claim.claim_id}:missing_evidence_declared`),
    ...linkedMappings
      .filter((mapping) =>
        ["insufficient", "missing_evidence"].includes(mapping.relationship),
      )
      .map((mapping) => `mapping:${mapping.claim_id}:${mapping.relationship}`),
  ];
  const textSignals = getTextOverclaimSignals([
    label.label,
    label.rationale,
    ...linkedClaims.flatMap((claim) => [
      claim.text,
      ...(claim.caveats ?? []),
      ...(claim.assumptions ?? []),
    ]),
    ...linkedMappings.map((mapping) => mapping.rationale),
  ]);

  return uniqueSorted([...explicitSignals, ...textSignals]);
}

function getTextOverclaimSignals(values: Array<string | undefined>): string[] {
  return values
    .filter((value): value is string => Boolean(value))
    .filter((value) => overclaimSignalPattern.test(value))
    .map((value) => `text:${value.slice(0, 80)}`);
}

function readAvailableMetric(
  metric: CasePackageV01["representative_sessions"][number]["cluster_membership"]["membership_score"],
): number | undefined {
  return metric?.status === "available" ? metric.value : undefined;
}

function mapCaseFileCandidateSource(
  source: CaseFile["candidateLabels"][number]["source"],
): ReviewResultSemanticCandidateLabelContextV01["source"] {
  const sourceMap: Record<
    CaseFile["candidateLabels"][number]["source"],
    ReviewResultSemanticCandidateLabelContextV01["source"]
  > = {
    baseline_ai: "ai_generated",
    evidence_constrained_ai: "prompt_variant",
    human_style: "human_baseline",
    uncertain_label: "synthetic_fixture",
  };

  return sourceMap[source];
}

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}
