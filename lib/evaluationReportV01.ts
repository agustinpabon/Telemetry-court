import {
  REVIEW_RESULT_V01_EVIDENCE_RATINGS,
  REVIEW_RESULT_V01_RECOMMENDED_ACTIONS,
  REVIEW_RESULT_V01_SCHEMA_VERSION,
  REVIEW_RESULT_V01_VERDICTS,
  REVIEW_PROTOCOL_V01_VERSION,
  type ReviewResultV01,
} from "@/lib/reviewResultV01";
import {
  CASE_PACKAGE_V01_SCHEMA_VERSION,
  type CasePackageEvidenceRatingV01,
  type CasePackageRecommendedActionV01,
  type CasePackageVerdictV01,
} from "@/lib/types";
import { assertSupportedReviewerContextV01 } from "@/lib/reviewerIdentityV01";

export const EVALUATION_REPORT_V01_SCHEMA_VERSION =
  "evaluation_report.v0.1" as const;
export const EVALUATION_REPORT_V01_CALCULATION_VERSION =
  "review_result_aggregation.v0.3" as const;

export const EVALUATION_REPORT_V01_COMPARISON_DIMENSIONS = [
  "selected_label_id",
  "package_id",
  "package_revision",
  "pipeline_id",
  "pipeline_run_id",
  "upstream_tool",
  "pipeline_version",
  "embedding_model",
  "clustering_method",
  "dimensionality_reduction_method",
  "naming_model",
  "prompt_id",
  "prompt_version",
  "prompt_digest",
] as const;

type CountDistribution<Value extends string> = Record<Value, number>;
type FailureModeV01 = ReviewResultV01["decisions"]["failure_modes"][number];
type ReviewedCasePackageReferenceV01 = ReviewResultV01["case_package"];
export type ReviewerAgreementSignalV01 = {
  status: "available" | "incomplete" | "unavailable";
  compared_review_count: number;
  unavailable_review_count: number;
  distinct_value_count: number;
  unanimous: boolean | null;
  values: Array<{
    value: string;
    review_count: number;
  }>;
  reason?: string;
};
export type EvidenceRatingAgreementV01 = ReviewerAgreementSignalV01 & {
  evidence_id: string;
  disputed: boolean;
};
export type ComparisonDimensionV01 =
  (typeof EVALUATION_REPORT_V01_COMPARISON_DIMENSIONS)[number];
export type ComparisonRollupGroupV01 = {
  value: string;
  review_count: number;
  evidence_decision_count: number;
  verdict_distribution: CountDistribution<CasePackageVerdictV01>;
  evidence_rating_distribution: CountDistribution<CasePackageEvidenceRatingV01>;
};
export type ComparisonRollupV01 =
  | {
      dimension: ComparisonDimensionV01;
      status: "available";
      missing_review_count: number;
      groups: ComparisonRollupGroupV01[];
    }
  | {
      dimension: ComparisonDimensionV01;
      status: "unavailable";
      reason: string;
      missing_review_count: number;
      groups: [];
    };
type CasePackageReferenceFieldV01 = Exclude<
  keyof ReviewedCasePackageReferenceV01,
  "pipeline"
>;

const CASE_PACKAGE_REFERENCE_FIELDS = {
  schema_version: true,
  package_id: true,
  package_revision: true,
  case_id: true,
  cluster_id: true,
} satisfies Record<CasePackageReferenceFieldV01, true>;

const PIPELINE_REFERENCE_FIELDS = {
  pipeline_id: true,
  run_id: true,
  upstream_tool: true,
  pipeline_version: true,
  embedding_model: true,
  clustering_method: true,
  dimensionality_reduction_method: true,
  naming_model: true,
  prompt_id: true,
  prompt_version: true,
  prompt_digest: true,
  generated_at: true,
} satisfies Record<keyof ReviewedCasePackageReferenceV01["pipeline"], true>;

const COMPARISON_DIMENSION_DEFINITIONS: ReadonlyArray<{
  dimension: ComparisonDimensionV01;
  getValue: (reviewResult: ReviewResultV01) => string | undefined;
}> = [
  {
    dimension: "selected_label_id",
    getValue: (reviewResult) =>
      reviewResult.decisions.label_comparison.selected_label_id,
  },
  {
    dimension: "package_id",
    getValue: (reviewResult) => reviewResult.case_package.package_id,
  },
  {
    dimension: "package_revision",
    getValue: (reviewResult) => reviewResult.case_package.package_revision,
  },
  {
    dimension: "pipeline_id",
    getValue: (reviewResult) => reviewResult.case_package.pipeline.pipeline_id,
  },
  {
    dimension: "pipeline_run_id",
    getValue: (reviewResult) => reviewResult.case_package.pipeline.run_id,
  },
  {
    dimension: "upstream_tool",
    getValue: (reviewResult) => reviewResult.case_package.pipeline.upstream_tool,
  },
  {
    dimension: "pipeline_version",
    getValue: (reviewResult) =>
      reviewResult.case_package.pipeline.pipeline_version,
  },
  {
    dimension: "embedding_model",
    getValue: (reviewResult) =>
      reviewResult.case_package.pipeline.embedding_model,
  },
  {
    dimension: "clustering_method",
    getValue: (reviewResult) =>
      reviewResult.case_package.pipeline.clustering_method,
  },
  {
    dimension: "dimensionality_reduction_method",
    getValue: (reviewResult) =>
      reviewResult.case_package.pipeline.dimensionality_reduction_method,
  },
  {
    dimension: "naming_model",
    getValue: (reviewResult) => reviewResult.case_package.pipeline.naming_model,
  },
  {
    dimension: "prompt_id",
    getValue: (reviewResult) => reviewResult.case_package.pipeline.prompt_id,
  },
  {
    dimension: "prompt_version",
    getValue: (reviewResult) =>
      reviewResult.case_package.pipeline.prompt_version,
  },
  {
    dimension: "prompt_digest",
    getValue: (reviewResult) => reviewResult.case_package.pipeline.prompt_digest,
  },
];

export type EvaluationReportV01 = {
  schema_version: typeof EVALUATION_REPORT_V01_SCHEMA_VERSION;
  calculation_version: typeof EVALUATION_REPORT_V01_CALCULATION_VERSION;
  case_package: ReviewResultV01["case_package"];
  source_review_ids: string[];
  reviewer_count: number;
  verdict_distribution: CountDistribution<CasePackageVerdictV01>;
  recommended_action_distribution: CountDistribution<CasePackageRecommendedActionV01>;
  label_winner_distribution: Array<{
    label_id: string;
    count: number;
  }>;
  evidence_rating_distribution: CountDistribution<CasePackageEvidenceRatingV01>;
  failure_mode_counts: Array<{
    failure_mode: FailureModeV01;
    count: number;
  }>;
  reviewer_agreement: {
    verdict: ReviewerAgreementSignalV01;
    label_winner: ReviewerAgreementSignalV01;
    evidence_ratings: EvidenceRatingAgreementV01[];
    major_failure_mode: ReviewerAgreementSignalV01;
  };
  comparison_rollups: ComparisonRollupV01[];
  disagreement: {
    has_any_disagreement: boolean;
    verdict: boolean;
    recommended_action: boolean;
    label_winner: boolean;
    evidence_ratings: boolean;
    evidence_ids: string[];
  };
};

export function aggregateReviewResultsV01(
  reviewResults: readonly ReviewResultV01[],
): EvaluationReportV01 {
  if (reviewResults.length === 0) {
    throw new Error(
      "Cannot aggregate EvaluationReport v0.1 without ReviewResult inputs.",
    );
  }

  for (const reviewResult of reviewResults) {
    assertRequiredMetadata(reviewResult);

    if (reviewResult.schema_version !== REVIEW_RESULT_V01_SCHEMA_VERSION) {
      throw new Error(
        `Cannot aggregate EvaluationReport v0.1 with unsupported ReviewResult schema version "${reviewResult.schema_version}".`,
      );
    }
  }

  const firstReview = reviewResults[0];
  const packageId = firstReview.case_package.package_id;
  const packageSchemaVersion = firstReview.case_package.schema_version;
  const packageRevision = firstReview.case_package.package_revision;

  if (packageSchemaVersion !== CASE_PACKAGE_V01_SCHEMA_VERSION) {
    throw new Error(
      `Cannot aggregate EvaluationReport v0.1 with unsupported CasePackage schema version "${packageSchemaVersion}".`,
    );
  }

  for (const reviewResult of reviewResults) {
    if (reviewResult.case_package.package_id !== packageId) {
      throw new Error(
        "Cannot aggregate EvaluationReport v0.1 with mixed CasePackage IDs.",
      );
    }

    if (reviewResult.case_package.schema_version !== packageSchemaVersion) {
      throw new Error(
        "Cannot aggregate EvaluationReport v0.1 with mixed CasePackage schema versions.",
      );
    }

    if (reviewResult.case_package.package_revision !== packageRevision) {
      throw new Error(
        "Cannot aggregate EvaluationReport v0.1 with mixed CasePackage revisions.",
      );
    }

    if (
      !hasMatchingCasePackageReference(
        firstReview.case_package,
        reviewResult.case_package,
      )
    ) {
      throw new Error(
        "Cannot aggregate EvaluationReport v0.1 with mismatched CasePackage reference metadata.",
      );
    }
  }

  const verdictDistribution = createCountDistribution(
    REVIEW_RESULT_V01_VERDICTS,
  );
  const recommendedActionDistribution = createCountDistribution(
    REVIEW_RESULT_V01_RECOMMENDED_ACTIONS,
  );
  const evidenceRatingDistribution = createCountDistribution(
    REVIEW_RESULT_V01_EVIDENCE_RATINGS,
  );
  const labelWinnerCounts = new Map<string, number>();
  const failureModeCounts = new Map<FailureModeV01, number>();
  const verdicts = new Set<CasePackageVerdictV01>();
  const recommendedActions = new Set<CasePackageRecommendedActionV01>();
  const labelWinners = new Set<string>();

  for (const reviewResult of reviewResults) {
    const { decisions } = reviewResult;

    verdictDistribution[decisions.final_verdict] += 1;
    recommendedActionDistribution[decisions.recommended_action] += 1;
    incrementMap(labelWinnerCounts, decisions.label_comparison.selected_label_id);
    verdicts.add(decisions.final_verdict);
    recommendedActions.add(decisions.recommended_action);
    labelWinners.add(decisions.label_comparison.selected_label_id);

    for (const evidenceRating of decisions.evidence_ratings) {
      evidenceRatingDistribution[evidenceRating.rating] += 1;
    }

    for (const failureMode of decisions.failure_modes) {
      incrementMap(failureModeCounts, failureMode);
    }
  }

  const evidenceRatingAgreement = buildEvidenceRatingAgreement(reviewResults);
  const evidenceIdsWithDisagreement = evidenceRatingAgreement
    .filter((evidence) => evidence.disputed)
    .map((evidence) => evidence.evidence_id);
  const disagreement = {
    verdict: verdicts.size > 1,
    recommended_action: recommendedActions.size > 1,
    label_winner: labelWinners.size > 1,
    evidence_ratings: evidenceIdsWithDisagreement.length > 0,
  };

  return {
    schema_version: EVALUATION_REPORT_V01_SCHEMA_VERSION,
    calculation_version: EVALUATION_REPORT_V01_CALCULATION_VERSION,
    case_package: firstReview.case_package,
    source_review_ids: reviewResults
      .map((reviewResult) => reviewResult.review_id)
      .sort(),
    reviewer_count: reviewResults.length,
    verdict_distribution: verdictDistribution,
    recommended_action_distribution: recommendedActionDistribution,
    label_winner_distribution: sortedCounts(labelWinnerCounts, "label_id"),
    evidence_rating_distribution: evidenceRatingDistribution,
    failure_mode_counts: sortedCounts(failureModeCounts, "failure_mode"),
    reviewer_agreement: {
      verdict: buildReviewerAgreementSignal(
        reviewResults.map((reviewResult) => reviewResult.decisions.final_verdict),
        reviewResults.length,
        "At least two reviewer verdicts are required to describe agreement.",
      ),
      label_winner: buildReviewerAgreementSignal(
        reviewResults.map(
          (reviewResult) =>
            reviewResult.decisions.label_comparison.selected_label_id,
        ),
        reviewResults.length,
        "At least two reviewer label selections are required to describe agreement.",
      ),
      evidence_ratings: evidenceRatingAgreement,
      major_failure_mode: buildReviewerAgreementSignal(
        reviewResults.map((reviewResult) => {
          const { failure_modes: failureModes } = reviewResult.decisions;

          return failureModes.length === 1 ? failureModes[0] : undefined;
        }),
        reviewResults.length,
        "Major failure-mode agreement is incomplete or unavailable because ReviewResult records zero or multiple failure-mode reason codes without designating one as primary.",
      ),
    },
    comparison_rollups: COMPARISON_DIMENSION_DEFINITIONS.map(
      ({ dimension, getValue }) =>
        buildComparisonRollup(dimension, reviewResults, getValue),
    ),
    disagreement: {
      has_any_disagreement: Object.values(disagreement).some(Boolean),
      ...disagreement,
      evidence_ids: evidenceIdsWithDisagreement,
    },
  };
}

function buildEvidenceRatingAgreement(
  reviewResults: readonly ReviewResultV01[],
): EvidenceRatingAgreementV01[] {
  const evidenceIds = new Set<string>();

  for (const reviewResult of reviewResults) {
    for (const evidenceRating of reviewResult.decisions.evidence_ratings) {
      evidenceIds.add(evidenceRating.evidence_id);
    }
  }

  return [...evidenceIds]
    .sort(compareStrings)
    .map((evidenceId) => {
      const signal = buildReviewerAgreementSignal(
        reviewResults.map(
          (reviewResult) =>
            reviewResult.decisions.evidence_ratings.find(
              (evidenceRating) => evidenceRating.evidence_id === evidenceId,
            )?.rating,
        ),
        reviewResults.length,
        `Evidence rating agreement for "${evidenceId}" cannot be fully compared because fewer than two comparable ratings are available or some reviews do not contain this evidence reference.`,
      );

      return {
        evidence_id: evidenceId,
        ...signal,
        disputed:
          signal.compared_review_count >= 2 && signal.distinct_value_count > 1,
      };
    });
}

function buildReviewerAgreementSignal(
  values: readonly (string | undefined)[],
  reviewerCount: number,
  unavailableReason: string,
): ReviewerAgreementSignalV01 {
  const counts = new Map<string, number>();

  for (const value of values) {
    if (typeof value === "string" && value.trim() !== "") {
      incrementMap(counts, value);
    }
  }

  const comparedReviewCount = [...counts.values()].reduce(
    (total, count) => total + count,
    0,
  );
  const unavailableReviewCount = reviewerCount - comparedReviewCount;
  const distinctValueCount = counts.size;
  const status =
    comparedReviewCount === 0
      ? "unavailable"
      : unavailableReviewCount > 0
      ? "incomplete"
      : comparedReviewCount < 2
        ? "unavailable"
        : "available";

  return {
    status,
    compared_review_count: comparedReviewCount,
    unavailable_review_count: unavailableReviewCount,
    distinct_value_count: distinctValueCount,
    unanimous: comparedReviewCount < 2 ? null : distinctValueCount === 1,
    values: [...counts.entries()]
      .sort(([left], [right]) => compareStrings(left, right))
      .map(([value, reviewCountForValue]) => ({
        value,
        review_count: reviewCountForValue,
      })),
    ...(status === "available" ? {} : { reason: unavailableReason }),
  };
}

function buildComparisonRollup(
  dimension: ComparisonDimensionV01,
  reviewResults: readonly ReviewResultV01[],
  getValue: (reviewResult: ReviewResultV01) => string | undefined,
): ComparisonRollupV01 {
  const groups = new Map<string, ComparisonRollupGroupV01>();
  let missingReviewCount = 0;

  for (const reviewResult of reviewResults) {
    const value = getValue(reviewResult);

    if (typeof value !== "string" || value.trim() === "") {
      missingReviewCount += 1;
      continue;
    }

    const group = groups.get(value) ?? {
      value,
      review_count: 0,
      evidence_decision_count: 0,
      verdict_distribution: createCountDistribution(REVIEW_RESULT_V01_VERDICTS),
      evidence_rating_distribution: createCountDistribution(
        REVIEW_RESULT_V01_EVIDENCE_RATINGS,
      ),
    };

    group.review_count += 1;
    group.verdict_distribution[reviewResult.decisions.final_verdict] += 1;

    for (const evidenceRating of reviewResult.decisions.evidence_ratings) {
      group.evidence_decision_count += 1;
      group.evidence_rating_distribution[evidenceRating.rating] += 1;
    }

    groups.set(value, group);
  }

  if (groups.size === 0) {
    return {
      dimension,
      status: "unavailable",
      reason: `Metadata "${dimension}" is missing from all compact CasePackage references.`,
      missing_review_count: missingReviewCount,
      groups: [],
    };
  }

  return {
    dimension,
    status: "available",
    missing_review_count: missingReviewCount,
    groups: [...groups.values()].sort((left, right) =>
      compareStrings(left.value, right.value),
    ),
  };
}

function createCountDistribution<const Values extends readonly string[]>(
  values: Values,
): CountDistribution<Values[number]> {
  return Object.fromEntries(values.map((value) => [value, 0])) as CountDistribution<
    Values[number]
  >;
}

function incrementMap<Key>(counts: Map<Key, number>, key: Key) {
  counts.set(key, (counts.get(key) ?? 0) + 1);
}

function sortedCounts<Key extends string, Name extends string>(
  counts: Map<Key, number>,
  name: Name,
): Array<Record<Name, Key> & { count: number }> {
  return [...counts.entries()]
    .sort(([left], [right]) => compareStrings(left, right))
    .map(([value, count]) => ({ [name]: value, count }) as Record<Name, Key> & {
      count: number;
    });
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

function hasMatchingCasePackageReference(
  left: ReviewedCasePackageReferenceV01,
  right: ReviewedCasePackageReferenceV01,
) {
  const casePackageFields = Object.keys(
    CASE_PACKAGE_REFERENCE_FIELDS,
  ) as CasePackageReferenceFieldV01[];
  const pipelineFields = Object.keys(PIPELINE_REFERENCE_FIELDS) as Array<
    keyof ReviewedCasePackageReferenceV01["pipeline"]
  >;

  return (
    casePackageFields.every((field) => left[field] === right[field]) &&
    pipelineFields.every(
      (field) => left.pipeline[field] === right.pipeline[field],
    )
  );
}

function assertRequiredMetadata(reviewResult: ReviewResultV01) {
  requireMetadataString(reviewResult.schema_version, "ReviewResult schema version");
  requireMetadataString(reviewResult.review_id, "review ID");
  requireMetadataString(reviewResult.created_at, "review creation timestamp");

  if (!reviewResult.case_package) {
    throw new Error(
      "Cannot aggregate EvaluationReport v0.1 without CasePackage reference metadata.",
    );
  }

  requireMetadataString(
    reviewResult.case_package.schema_version,
    "CasePackage schema version",
  );
  requireMetadataString(reviewResult.case_package.package_id, "CasePackage ID");
  requireMetadataString(reviewResult.case_package.case_id, "CasePackage case ID");
  requireMetadataString(
    reviewResult.case_package.cluster_id,
    "CasePackage cluster ID",
  );

  if (!reviewResult.case_package.pipeline) {
    throw new Error(
      "Cannot aggregate EvaluationReport v0.1 without pipeline reference metadata.",
    );
  }

  requireMetadataString(
    reviewResult.case_package.pipeline.run_id,
    "pipeline run ID",
  );
  requireMetadataString(
    reviewResult.case_package.pipeline.upstream_tool,
    "upstream pipeline tool",
  );
  requireMetadataString(
    reviewResult.case_package.pipeline.generated_at,
    "pipeline generation timestamp",
  );

  if (!reviewResult.reviewer) {
    throw new Error(
      "Cannot aggregate EvaluationReport v0.1 without reviewer metadata.",
    );
  }

  requireMetadataString(reviewResult.reviewer.reviewer_id, "reviewer ID");
  requireMetadataString(
    reviewResult.reviewer.review_session_id,
    "review session ID",
  );

  assertSupportedReviewerContextV01(
    reviewResult.reviewer.context,
    "aggregate EvaluationReport v0.1",
  );

  if (!reviewResult.protocol) {
    throw new Error(
      "Cannot aggregate EvaluationReport v0.1 without review protocol metadata.",
    );
  }

  requireMetadataString(
    reviewResult.protocol.protocol_version,
    "review protocol version",
  );

  if (reviewResult.protocol.protocol_version !== REVIEW_PROTOCOL_V01_VERSION) {
    throw new Error(
      `Cannot aggregate EvaluationReport v0.1 with unsupported review protocol version "${reviewResult.protocol.protocol_version}".`,
    );
  }
}

function requireMetadataString(value: string, label: string) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Cannot aggregate EvaluationReport v0.1 without ${label}.`);
  }
}
