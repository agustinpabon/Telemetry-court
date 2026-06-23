import {
  EVALUATION_REPORT_V01_CALCULATION_VERSION,
  EVALUATION_REPORT_V01_SCHEMA_VERSION,
  type EvaluationReportV01,
} from "@/lib/evaluationReportV01";
import {
  CLUSTER_REFINEMENT_MERGE_FINAL_VERDICTS as MERGE_FINAL_VERDICTS,
  CLUSTER_REFINEMENT_MERGE_RECOMMENDED_ACTIONS as MERGE_RECOMMENDED_ACTIONS,
  CLUSTER_REFINEMENT_SPLIT_FAILURE_MODES as SPLIT_FAILURE_MODES,
  CLUSTER_REFINEMENT_SPLIT_FINAL_VERDICTS as SPLIT_FINAL_VERDICTS,
  CLUSTER_REFINEMENT_SPLIT_RECOMMENDED_ACTIONS as SPLIT_RECOMMENDED_ACTIONS,
  CLUSTER_REFINEMENT_V01_CALCULATION_VERSION,
  CLUSTER_REFINEMENT_V01_SCHEMA_VERSION,
  type ClusterRefinementDisagreementV01,
  type ClusterRefinementExportAvailabilityV01,
  type ClusterRefinementMergeRecommendationV01,
  type ClusterRefinementSessionExclusionRecommendationV01,
  type ClusterRefinementSignalSetV01,
  type ClusterRefinementSourceReviewV01,
  type ClusterRefinementSplitRecommendationV01,
  type ClusterRefinementUncertaintyV01,
  type ClusterRefinementV01,
  type MergeFinalVerdictV01,
  type MergeRecommendedActionV01,
  type RecommendationDisagreementV01,
  type SplitFailureModeV01,
  type SplitFinalVerdictV01,
  type SplitRecommendedActionV01,
} from "@/lib/clusterRefinementTypesV01";
export {
  CLUSTER_REFINEMENT_MERGE_FINAL_VERDICTS,
  CLUSTER_REFINEMENT_MERGE_RECOMMENDED_ACTIONS,
  CLUSTER_REFINEMENT_SPLIT_FAILURE_MODES,
  CLUSTER_REFINEMENT_SPLIT_FINAL_VERDICTS,
  CLUSTER_REFINEMENT_SPLIT_RECOMMENDED_ACTIONS,
  CLUSTER_REFINEMENT_V01_CALCULATION_VERSION,
  CLUSTER_REFINEMENT_V01_SCHEMA_VERSION,
} from "@/lib/clusterRefinementTypesV01";
export type {
  ClusterRefinementDisagreementV01,
  ClusterRefinementExportAvailabilityV01,
  ClusterRefinementMergeRecommendationV01,
  ClusterRefinementSessionExclusionRecommendationV01,
  ClusterRefinementSignalSetV01,
  ClusterRefinementSourceReviewV01,
  ClusterRefinementSplitRecommendationV01,
  ClusterRefinementUncertaintyV01,
  ClusterRefinementV01,
  ClusterRefinementValidationErrorV01,
  ClusterRefinementValidationResultV01,
  MergeFinalVerdictV01,
  MergeRecommendedActionV01,
  RecommendationDisagreementV01,
  SplitFailureModeV01,
  SplitFinalVerdictV01,
  SplitRecommendedActionV01,
} from "@/lib/clusterRefinementTypesV01";
import { validateClusterRefinementV01 } from "@/lib/clusterRefinementValidationV01";
export { validateClusterRefinementV01 } from "@/lib/clusterRefinementValidationV01";
import {
  REVIEW_PROTOCOL_V01_VERSION,
  REVIEW_RESULT_V01_SCHEMA_VERSION,
  type ReviewResultV01,
} from "@/lib/reviewResultV01";
import { CASE_PACKAGE_V01_SCHEMA_VERSION } from "@/lib/types";

export function buildClusterRefinementV01({
  report,
  sourceReviewResults,
  generatedAt,
  refinementId,
}: {
  report: EvaluationReportV01;
  sourceReviewResults: readonly ReviewResultV01[];
  generatedAt?: string;
  refinementId?: string;
}): ClusterRefinementV01 {
  assertCompatibleInputs(report, sourceReviewResults);

  const sortedReviews = sortReviews(sourceReviewResults);
  const generatedTimestamp = generatedAt ?? new Date().toISOString();
  const artifact: ClusterRefinementV01 = {
    schema_version: CLUSTER_REFINEMENT_V01_SCHEMA_VERSION,
    calculation_version: CLUSTER_REFINEMENT_V01_CALCULATION_VERSION,
    refinement_id:
      refinementId ?? buildDefaultRefinementId(report, generatedTimestamp),
    generated_at: generatedTimestamp,
    source_application: "telemetry_court",
    format: "local_json",
    case_package: copyCasePackageReference(report.case_package),
    compatibility: {
      review_result_schema_version: REVIEW_RESULT_V01_SCHEMA_VERSION,
      review_protocol_version: REVIEW_PROTOCOL_V01_VERSION,
      evaluation_report_schema_version: EVALUATION_REPORT_V01_SCHEMA_VERSION,
      evaluation_report_calculation_version:
        EVALUATION_REPORT_V01_CALCULATION_VERSION,
    },
    source_review_ids: sortedReviews.map((review) => review.review_id),
    source_reviews: sortedReviews.map(toSourceReviewMetadata),
    reviewer_count: sortedReviews.length,
    prune_session_ids: [],
    session_exclusion_recommendations:
      buildSessionExclusionRecommendations(sortedReviews),
    split_recommendations: buildSplitRecommendations(report, sortedReviews),
    merge_recommendations: buildMergeRecommendations(report, sortedReviews),
    uncertainty: buildUncertainty(sortedReviews),
    disagreement: buildDisagreement(report, sortedReviews),
  };

  artifact.prune_session_ids = artifact.session_exclusion_recommendations
    .filter((recommendation) => recommendation.status === "recommended")
    .map((recommendation) => recommendation.session_id)
    .sort(compareStrings);

  const validation = validateClusterRefinementV01(artifact);

  if (!validation.ok) {
    throw new Error(
      `Built invalid cluster_refinement.v0.1 artifact: ${validation.errors
        .map((error) => `${error.path} ${error.message}`)
        .join("; ")}`,
    );
  }

  return validation.artifact;
}

export function getClusterRefinementExportAvailabilityV01(
  report: EvaluationReportV01,
  sourceReviewResults?: readonly ReviewResultV01[],
): ClusterRefinementExportAvailabilityV01 {
  if (!sourceReviewResults || sourceReviewResults.length === 0) {
    return {
      available: false,
      reason:
        "Compatible source ReviewResults are required to derive an upstream refinement recipe.",
    };
  }

  try {
    assertCompatibleInputs(report, sourceReviewResults);

    return { available: true };
  } catch (error) {
    return {
      available: false,
      reason:
        error instanceof Error
          ? error.message
          : "Cluster refinement export is unavailable for these results.",
    };
  }
}

export function serializeClusterRefinementJsonV01(
  artifact: ClusterRefinementV01,
): string {
  const validation = validateClusterRefinementV01(artifact);

  if (!validation.ok) {
    throw new Error(
      `Cannot serialize cluster_refinement.v0.1 JSON: ${validation.errors[0]?.message ?? "artifact validation failed"}`,
    );
  }

  return `${JSON.stringify(validation.artifact, null, 2)}\n`;
}

export function getClusterRefinementJsonExportFilenameV01(
  artifact: ClusterRefinementV01,
): string {
  return `${artifact.case_package.case_id}-cluster-refinement.json`;
}

function assertCompatibleInputs(
  report: EvaluationReportV01,
  sourceReviewResults: readonly ReviewResultV01[],
) {
  if (report.schema_version !== EVALUATION_REPORT_V01_SCHEMA_VERSION) {
    throw new Error(
      `Cannot build cluster_refinement.v0.1 with unsupported EvaluationReport schema version "${report.schema_version}".`,
    );
  }

  if (report.calculation_version !== EVALUATION_REPORT_V01_CALCULATION_VERSION) {
    throw new Error(
      `Cannot build cluster_refinement.v0.1 with unsupported EvaluationReport calculation version "${report.calculation_version}".`,
    );
  }

  if (sourceReviewResults.length === 0) {
    throw new Error(
      "Cannot build cluster_refinement.v0.1 without compatible source ReviewResult inputs.",
    );
  }

  const sortedSourceReviewIds = sourceReviewResults
    .map((review) => review.review_id)
    .sort(compareStrings);
  const reportSourceReviewIds = [...report.source_review_ids].sort(compareStrings);

  if (!arraysEqual(sortedSourceReviewIds, reportSourceReviewIds)) {
    throw new Error(
      "Cannot build cluster_refinement.v0.1 when source ReviewResult IDs do not match the EvaluationReport source_review_ids.",
    );
  }

  if (report.reviewer_count !== sourceReviewResults.length) {
    throw new Error(
      "Cannot build cluster_refinement.v0.1 when source ReviewResult count does not match EvaluationReport reviewer_count.",
    );
  }

  for (const reviewResult of sourceReviewResults) {
    if (reviewResult.schema_version !== REVIEW_RESULT_V01_SCHEMA_VERSION) {
      throw new Error(
        `Cannot build cluster_refinement.v0.1 with unsupported ReviewResult schema version "${reviewResult.schema_version}".`,
      );
    }

    if (
      reviewResult.protocol.protocol_version !== REVIEW_PROTOCOL_V01_VERSION
    ) {
      throw new Error(
        `Cannot build cluster_refinement.v0.1 with unsupported review protocol version "${reviewResult.protocol.protocol_version}".`,
      );
    }

    if (
      reviewResult.case_package.schema_version !== CASE_PACKAGE_V01_SCHEMA_VERSION
    ) {
      throw new Error(
        `Cannot build cluster_refinement.v0.1 with unsupported CasePackage schema version "${reviewResult.case_package.schema_version}".`,
      );
    }

    if (
      !hasMatchingCasePackageReference(
        report.case_package,
        reviewResult.case_package,
      )
    ) {
      throw new Error(
        "Cannot build cluster_refinement.v0.1 from ReviewResults that do not match the EvaluationReport CasePackage reference.",
      );
    }

    requireBuildString(reviewResult.review_id, "review ID");
    requireBuildString(reviewResult.created_at, "review creation timestamp");
    requireBuildString(
      reviewResult.reviewer.review_session_id,
      "review session ID",
    );
    requireBuildString(
      reviewResult.decisions.outlier_impostor.selected_session_id,
      "selected outlier or impostor session ID",
    );
  }
}

function buildSessionExclusionRecommendations(
  reviews: readonly ReviewResultV01[],
): ClusterRefinementSessionExclusionRecommendationV01[] {
  const recommendations = new Map<
    string,
    {
      selectedCount: number;
      sourceReviewIds: Set<string>;
      qualifyingReviewIds: Set<string>;
      finalVerdicts: Set<SplitFinalVerdictV01>;
      recommendedActions: Set<SplitRecommendedActionV01>;
      failureModes: Set<SplitFailureModeV01>;
    }
  >();

  for (const review of reviews) {
    const sessionId = review.decisions.outlier_impostor.selected_session_id;
    const recommendation = recommendations.get(sessionId) ?? {
      selectedCount: 0,
      sourceReviewIds: new Set<string>(),
      qualifyingReviewIds: new Set<string>(),
      finalVerdicts: new Set<SplitFinalVerdictV01>(),
      recommendedActions: new Set<SplitRecommendedActionV01>(),
      failureModes: new Set<SplitFailureModeV01>(),
    };
    const signals = getSplitSignals(review);

    recommendation.selectedCount += 1;
    recommendation.sourceReviewIds.add(review.review_id);

    if (hasAnySplitSignal(signals)) {
      recommendation.qualifyingReviewIds.add(review.review_id);
      addSetValues(recommendation.finalVerdicts, signals.final_verdicts);
      addSetValues(
        recommendation.recommendedActions,
        signals.recommended_actions,
      );
      addSetValues(recommendation.failureModes, signals.failure_modes);
    }

    recommendations.set(sessionId, recommendation);
  }

  const selectedSessionIds = [...recommendations.keys()].sort(compareStrings);

  return selectedSessionIds.map((sessionId) => {
    const recommendation = recommendations.get(sessionId);

    if (!recommendation) {
      throw new Error(`Missing session recommendation for ${sessionId}.`);
    }

    const qualifyingSourceReviewIds = [...recommendation.qualifyingReviewIds].sort(
      compareStrings,
    );

    return {
      session_id: sessionId,
      status:
        qualifyingSourceReviewIds.length > 0 ? "recommended" : "not_recommended",
      selected_count: recommendation.selectedCount,
      qualifying_review_count: qualifyingSourceReviewIds.length,
      reviewer_count: reviews.length,
      source_review_ids: [...recommendation.sourceReviewIds].sort(compareStrings),
      qualifying_source_review_ids: qualifyingSourceReviewIds,
      signals: {
        final_verdicts: [...recommendation.finalVerdicts].sort(compareStrings),
        recommended_actions: [...recommendation.recommendedActions].sort(
          compareStrings,
        ),
        failure_modes: [...recommendation.failureModes].sort(compareStrings),
      },
      disagreement: buildSessionSelectionDisagreement({
        reviewerCount: reviews.length,
        selectedCount: recommendation.selectedCount,
        sessionId,
        selectedSessionIds,
      }),
    };
  });
}

function buildSplitRecommendations(
  report: EvaluationReportV01,
  reviews: readonly ReviewResultV01[],
): ClusterRefinementSplitRecommendationV01[] {
  const sourceReviewIds = new Set<string>();
  const finalVerdicts = new Set<SplitFinalVerdictV01>();
  const recommendedActions = new Set<SplitRecommendedActionV01>();
  const failureModes = new Set<SplitFailureModeV01>();

  for (const review of reviews) {
    const signals = getSplitSignals(review);

    if (!hasAnySplitSignal(signals)) {
      continue;
    }

    sourceReviewIds.add(review.review_id);
    addSetValues(finalVerdicts, signals.final_verdicts);
    addSetValues(recommendedActions, signals.recommended_actions);
    addSetValues(failureModes, signals.failure_modes);
  }

  if (sourceReviewIds.size === 0) {
    return [];
  }

  return [
    {
      cluster_id: report.case_package.cluster_id,
      status: "recommended",
      supporting_review_count: sourceReviewIds.size,
      reviewer_count: reviews.length,
      source_review_ids: [...sourceReviewIds].sort(compareStrings),
      signals: {
        final_verdicts: [...finalVerdicts].sort(compareStrings),
        recommended_actions: [...recommendedActions].sort(compareStrings),
        failure_modes: [...failureModes].sort(compareStrings),
      },
      disagreement: buildRecommendationDisagreement({
        reviewerCount: reviews.length,
        supportingReviewCount: sourceReviewIds.size,
        partialReason:
          "Some compatible reviewers did not select a split or impurity signal.",
        unavailableReason:
          "At least two compatible source reviews are required to compare split recommendation disagreement.",
      }),
    },
  ];
}

function buildMergeRecommendations(
  report: EvaluationReportV01,
  reviews: readonly ReviewResultV01[],
): ClusterRefinementMergeRecommendationV01[] {
  const sourceReviewIds = new Set<string>();
  const finalVerdicts = new Set<MergeFinalVerdictV01>();
  const recommendedActions = new Set<MergeRecommendedActionV01>();

  for (const review of reviews) {
    const signals = getMergeSignals(review);
    const hasMergeSignal =
      signals.final_verdicts.length > 0 ||
      signals.recommended_actions.length > 0;

    if (!hasMergeSignal) {
      continue;
    }

    sourceReviewIds.add(review.review_id);
    addSetValues(finalVerdicts, signals.final_verdicts);
    addSetValues(recommendedActions, signals.recommended_actions);
  }

  if (sourceReviewIds.size === 0) {
    return [];
  }

  return [
    {
      cluster_id: report.case_package.cluster_id,
      status: "recommended",
      supporting_review_count: sourceReviewIds.size,
      reviewer_count: reviews.length,
      source_review_ids: [...sourceReviewIds].sort(compareStrings),
      signals: {
        final_verdicts: [...finalVerdicts].sort(compareStrings),
        recommended_actions: [...recommendedActions].sort(compareStrings),
      },
      target: {
        status: "unavailable",
        neighbor_cluster_ids: [],
        reason:
          "ReviewResult v0.1 does not capture a reviewer-selected neighbor merge target.",
      },
      disagreement: buildRecommendationDisagreement({
        reviewerCount: reviews.length,
        supportingReviewCount: sourceReviewIds.size,
        partialReason:
          "Some compatible reviewers did not select a merge signal.",
        unavailableReason:
          "At least two compatible source reviews are required to compare merge recommendation disagreement.",
      }),
    },
  ];
}

function buildUncertainty(
  reviews: readonly ReviewResultV01[],
): ClusterRefinementUncertaintyV01 {
  const sourceReviewIds = new Set<string>();
  const finalVerdicts = new Set<"uncertain">();
  const recommendedActions = new Set<"mark_uncertain">();
  const confidenceLevels = new Set<"low" | "medium" | "high">();
  let lowConfidenceReviewCount = 0;

  for (const review of reviews) {
    const confidenceLevel = review.decisions.confidence?.level;
    const hasUncertaintySignal =
      review.decisions.final_verdict === "uncertain" ||
      review.decisions.recommended_action === "mark_uncertain" ||
      confidenceLevel === "low";

    if (!hasUncertaintySignal) {
      continue;
    }

    sourceReviewIds.add(review.review_id);

    if (review.decisions.final_verdict === "uncertain") {
      finalVerdicts.add("uncertain");
    }

    if (review.decisions.recommended_action === "mark_uncertain") {
      recommendedActions.add("mark_uncertain");
    }

    if (confidenceLevel) {
      confidenceLevels.add(confidenceLevel);
    }

    if (confidenceLevel === "low") {
      lowConfidenceReviewCount += 1;
    }
  }

  return {
    status: sourceReviewIds.size > 0 ? "present" : "not_reported",
    reviewer_count: reviews.length,
    uncertain_review_count: sourceReviewIds.size,
    low_confidence_review_count: lowConfidenceReviewCount,
    source_review_ids: [...sourceReviewIds].sort(compareStrings),
    signals: {
      final_verdicts: [...finalVerdicts].sort(compareStrings),
      recommended_actions: [...recommendedActions].sort(compareStrings),
      confidence_levels: [...confidenceLevels].sort(compareStrings),
    },
  };
}

function buildDisagreement(
  report: EvaluationReportV01,
  reviews: readonly ReviewResultV01[],
): ClusterRefinementDisagreementV01 {
  if (reviews.length < 2) {
    return {
      status: "unavailable",
      reason:
        "At least two compatible source reviews are required to describe disagreement.",
      has_any_disagreement: null,
      verdict: null,
      recommended_action: null,
      label_winner: null,
      evidence_ratings: null,
      evidence_ids: [],
      session_exclusion: null,
      split_recommendation: null,
      merge_recommendation: null,
    };
  }

  const sessionExclusion =
    new Set(
      reviews.map(
        (review) => review.decisions.outlier_impostor.selected_session_id,
      ),
    ).size > 1;
  const splitSignals = reviews.map((review) =>
    hasAnySplitSignal(getSplitSignals(review)),
  );
  const mergeSignals = reviews.map((review) => {
    const signals = getMergeSignals(review);

    return (
      signals.final_verdicts.length > 0 ||
      signals.recommended_actions.length > 0
    );
  });
  const splitRecommendation = hasMixedBooleanValues(splitSignals);
  const mergeRecommendation = hasMixedBooleanValues(mergeSignals);

  return {
    status: "available",
    has_any_disagreement:
      report.disagreement.has_any_disagreement ||
      sessionExclusion ||
      splitRecommendation ||
      mergeRecommendation,
    verdict: report.disagreement.verdict,
    recommended_action: report.disagreement.recommended_action,
    label_winner: report.disagreement.label_winner,
    evidence_ratings: report.disagreement.evidence_ratings,
    evidence_ids: [...report.disagreement.evidence_ids].sort(compareStrings),
    session_exclusion: sessionExclusion,
    split_recommendation: splitRecommendation,
    merge_recommendation: mergeRecommendation,
  };
}

function getSplitSignals(review: ReviewResultV01): ClusterRefinementSignalSetV01 {
  return {
    final_verdicts: SPLIT_FINAL_VERDICTS.includes(
      review.decisions.final_verdict as SplitFinalVerdictV01,
    )
      ? [review.decisions.final_verdict as SplitFinalVerdictV01]
      : [],
    recommended_actions: SPLIT_RECOMMENDED_ACTIONS.includes(
      review.decisions.recommended_action as SplitRecommendedActionV01,
    )
      ? [review.decisions.recommended_action as SplitRecommendedActionV01]
      : [],
    failure_modes: review.decisions.failure_modes
      .filter((failureMode): failureMode is SplitFailureModeV01 =>
        SPLIT_FAILURE_MODES.includes(failureMode as SplitFailureModeV01),
      )
      .sort(compareStrings),
  };
}

function getMergeSignals(review: ReviewResultV01): {
  final_verdicts: MergeFinalVerdictV01[];
  recommended_actions: MergeRecommendedActionV01[];
} {
  return {
    final_verdicts: MERGE_FINAL_VERDICTS.includes(
      review.decisions.final_verdict as MergeFinalVerdictV01,
    )
      ? [review.decisions.final_verdict as MergeFinalVerdictV01]
      : [],
    recommended_actions: MERGE_RECOMMENDED_ACTIONS.includes(
      review.decisions.recommended_action as MergeRecommendedActionV01,
    )
      ? [review.decisions.recommended_action as MergeRecommendedActionV01]
      : [],
  };
}

function hasAnySplitSignal(signals: ClusterRefinementSignalSetV01): boolean {
  return (
    signals.final_verdicts.length > 0 ||
    signals.recommended_actions.length > 0 ||
    signals.failure_modes.length > 0
  );
}

function buildSessionSelectionDisagreement({
  reviewerCount,
  selectedCount,
  sessionId,
  selectedSessionIds,
}: {
  reviewerCount: number;
  selectedCount: number;
  sessionId: string;
  selectedSessionIds: string[];
}): ClusterRefinementSessionExclusionRecommendationV01["disagreement"] {
  const competingSessionIds = selectedSessionIds
    .filter((selectedSessionId) => selectedSessionId !== sessionId)
    .sort(compareStrings);

  if (reviewerCount < 2) {
    return {
      status: "unavailable",
      has_disagreement: null,
      selected_by_all_reviewers: null,
      competing_session_ids: competingSessionIds,
      reason:
        "At least two compatible source reviews are required to compare session-exclusion disagreement.",
    };
  }

  return {
    status: "available",
    has_disagreement:
      competingSessionIds.length > 0 || selectedCount !== reviewerCount,
    selected_by_all_reviewers: selectedCount === reviewerCount,
    competing_session_ids: competingSessionIds,
  };
}

function buildRecommendationDisagreement({
  reviewerCount,
  supportingReviewCount,
  partialReason,
  unavailableReason,
}: {
  reviewerCount: number;
  supportingReviewCount: number;
  partialReason: string;
  unavailableReason: string;
}): RecommendationDisagreementV01 {
  if (reviewerCount < 2) {
    return {
      status: "unavailable",
      has_disagreement: null,
      reason: unavailableReason,
    };
  }

  if (supportingReviewCount === reviewerCount) {
    return {
      status: "available",
      has_disagreement: false,
    };
  }

  return {
    status: "available",
    has_disagreement: true,
    reason: partialReason,
  };
}

function toSourceReviewMetadata(
  review: ReviewResultV01,
): ClusterRefinementSourceReviewV01 {
  return omitUndefined({
    review_id: review.review_id,
    review_session_id: review.reviewer.review_session_id,
    created_at: review.created_at,
  });
}

function copyCasePackageReference(
  casePackage: ReviewResultV01["case_package"],
): ReviewResultV01["case_package"] {
  return omitUndefined({
    schema_version: casePackage.schema_version,
    package_id: casePackage.package_id,
    package_revision: casePackage.package_revision,
    case_id: casePackage.case_id,
    cluster_id: casePackage.cluster_id,
    pipeline: omitUndefined({
      pipeline_id: casePackage.pipeline.pipeline_id,
      run_id: casePackage.pipeline.run_id,
      upstream_tool: casePackage.pipeline.upstream_tool,
      pipeline_version: casePackage.pipeline.pipeline_version,
      embedding_model: casePackage.pipeline.embedding_model,
      clustering_method: casePackage.pipeline.clustering_method,
      dimensionality_reduction_method:
        casePackage.pipeline.dimensionality_reduction_method,
      naming_model: casePackage.pipeline.naming_model,
      prompt_id: casePackage.pipeline.prompt_id,
      prompt_version: casePackage.pipeline.prompt_version,
      prompt_digest: casePackage.pipeline.prompt_digest,
      generated_at: casePackage.pipeline.generated_at,
    }),
  });
}

function sortReviews(reviews: readonly ReviewResultV01[]): ReviewResultV01[] {
  return [...reviews].sort((left, right) =>
    compareStrings(left.review_id, right.review_id),
  );
}

function buildDefaultRefinementId(
  report: EvaluationReportV01,
  generatedAt: string,
) {
  return [
    "refinement",
    report.case_package.package_id,
    report.case_package.package_revision ?? "unrevisioned",
    report.case_package.cluster_id,
    generatedAt,
  ].join(":");
}

function hasMatchingCasePackageReference(
  left: ReviewResultV01["case_package"],
  right: ReviewResultV01["case_package"],
) {
  return (
    JSON.stringify(copyCasePackageReference(left)) ===
    JSON.stringify(copyCasePackageReference(right))
  );
}

function addSetValues<Value>(target: Set<Value>, values: readonly Value[]) {
  for (const value of values) {
    target.add(value);
  }
}

function hasMixedBooleanValues(values: boolean[]) {
  return values.includes(true) && values.includes(false);
}

function requireBuildString(value: string, label: string) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Cannot build cluster_refinement.v0.1 without ${label}.`);
  }
}

function omitUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined),
  ) as T;
}

function arraysEqual(left: readonly unknown[], right: readonly unknown[]) {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function compareStrings(left: string, right: string) {
  if (left < right) {
    return -1;
  }

  if (left > right) {
    return 1;
  }

  return 0;
}
