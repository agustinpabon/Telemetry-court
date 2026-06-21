import {
  EVALUATION_REPORT_V01_COMPARISON_DIMENSIONS,
  type ComparisonRollupV01,
  type EvaluationReportV01,
  type ReviewerAgreementSignalV01,
} from "@/lib/evaluationReportV01";
import {
  REVIEW_RESULT_V01_EVIDENCE_RATINGS,
  REVIEW_RESULT_V01_RECOMMENDED_ACTIONS,
  REVIEW_RESULT_V01_VERDICTS,
} from "@/lib/reviewResultV01";

const evaluationReportCsvHeadersV01 = [
  "schema_version",
  "calculation_version",
  "case_package_schema_version",
  "package_id",
  "package_revision",
  "case_id",
  "cluster_id",
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
  "pipeline_generated_at",
  "source_review_ids",
  "reviewer_count",
  "section",
  "key",
  "value",
  "count",
  "status",
] as const;

type CsvStatus = "available" | "incomplete" | "unavailable";

type EvaluationReportCsvRowV01 = Record<
  (typeof evaluationReportCsvHeadersV01)[number],
  string | number
>;

export function serializeEvaluationReportJsonV01(
  report: EvaluationReportV01,
): string {
  return `${JSON.stringify(buildEvaluationReportJsonExportV01(report), null, 2)}\n`;
}

export function getEvaluationReportJsonExportFilenameV01(
  report: EvaluationReportV01,
): string {
  return `${report.case_package.case_id}-evaluation-report.json`;
}

export function getEvaluationReportCsvExportFilenameV01(
  report: EvaluationReportV01,
): string {
  return `${report.case_package.case_id}-evaluation-report.csv`;
}

export function serializeEvaluationReportCsvV01(
  report: EvaluationReportV01,
): string {
  const exportReport = buildEvaluationReportJsonExportV01(report);
  const rows = buildEvaluationReportCsvRowsV01(exportReport);

  return `${[
    evaluationReportCsvHeadersV01.join(","),
    ...rows.map((row) =>
      evaluationReportCsvHeadersV01
        .map((header) => formatCsvCell(row[header]))
        .join(","),
    ),
  ].join("\n")}\n`;
}

function buildEvaluationReportJsonExportV01(
  report: EvaluationReportV01,
): EvaluationReportV01 {
  return {
    schema_version: report.schema_version,
    calculation_version: report.calculation_version,
    case_package: {
      ...report.case_package,
      pipeline: {
        ...report.case_package.pipeline,
      },
    },
    source_review_ids: [...report.source_review_ids].sort(),
    reviewer_count: report.reviewer_count,
    verdict_distribution: Object.fromEntries(
      REVIEW_RESULT_V01_VERDICTS.map((verdict) => [
        verdict,
        report.verdict_distribution[verdict],
      ]),
    ) as EvaluationReportV01["verdict_distribution"],
    recommended_action_distribution: {
      ...Object.fromEntries(
        REVIEW_RESULT_V01_RECOMMENDED_ACTIONS.map((action) => [
          action,
          report.recommended_action_distribution[action],
        ]),
      ),
    } as EvaluationReportV01["recommended_action_distribution"],
    label_winner_distribution: [...report.label_winner_distribution].sort(
      (left, right) => compareStrings(left.label_id, right.label_id),
    ),
    evidence_rating_distribution: Object.fromEntries(
      REVIEW_RESULT_V01_EVIDENCE_RATINGS.map((rating) => [
        rating,
        report.evidence_rating_distribution[rating],
      ]),
    ) as EvaluationReportV01["evidence_rating_distribution"],
    failure_mode_counts: [...report.failure_mode_counts].sort((left, right) =>
      compareStrings(left.failure_mode, right.failure_mode),
    ),
    reviewer_agreement: {
      verdict: normalizeReviewerAgreementSignal(
        report.reviewer_agreement.verdict,
      ),
      label_winner: normalizeReviewerAgreementSignal(
        report.reviewer_agreement.label_winner,
      ),
      evidence_ratings: [...report.reviewer_agreement.evidence_ratings]
        .sort((left, right) =>
          compareStrings(left.evidence_id, right.evidence_id),
        )
        .map(normalizeReviewerAgreementSignal),
      major_failure_mode: normalizeReviewerAgreementSignal(
        report.reviewer_agreement.major_failure_mode,
      ),
    },
    comparison_rollups: [...report.comparison_rollups]
      .sort(
        (left, right) =>
          EVALUATION_REPORT_V01_COMPARISON_DIMENSIONS.indexOf(left.dimension) -
          EVALUATION_REPORT_V01_COMPARISON_DIMENSIONS.indexOf(right.dimension),
      )
      .map(normalizeComparisonRollup),
    disagreement: {
      ...report.disagreement,
      evidence_ids: [...report.disagreement.evidence_ids].sort(),
    },
  };
}

function normalizeReviewerAgreementSignal<
  Signal extends ReviewerAgreementSignalV01,
>(signal: Signal): Signal {
  return {
    ...signal,
    values: [...signal.values].sort((left, right) =>
      compareStrings(left.value, right.value),
    ),
  };
}

function normalizeComparisonRollup(
  rollup: ComparisonRollupV01,
): ComparisonRollupV01 {
  if (rollup.status === "unavailable") {
    return {
      ...rollup,
      groups: [],
    };
  }

  return {
    ...rollup,
    groups: [...rollup.groups]
      .sort((left, right) => compareStrings(left.value, right.value))
      .map((group) => ({
        ...group,
        verdict_distribution: Object.fromEntries(
          REVIEW_RESULT_V01_VERDICTS.map((verdict) => [
            verdict,
            group.verdict_distribution[verdict],
          ]),
        ) as EvaluationReportV01["verdict_distribution"],
        evidence_rating_distribution: Object.fromEntries(
          REVIEW_RESULT_V01_EVIDENCE_RATINGS.map((rating) => [
            rating,
            group.evidence_rating_distribution[rating],
          ]),
        ) as EvaluationReportV01["evidence_rating_distribution"],
      })),
  };
}

function buildEvaluationReportCsvRowsV01(
  report: EvaluationReportV01,
): EvaluationReportCsvRowV01[] {
  const rows: EvaluationReportCsvRowV01[] = [];
  const reviewerOutputStatus = getReviewerOutputStatus(report);
  const reviewerComparisonStatus: CsvStatus =
    report.reviewer_count >= 2 ? "available" : "unavailable";

  rows.push(
    createCsvRow(report, {
      section: "report_metadata",
      key: "reviewer_count",
      count: formatAvailableCount(report.reviewer_count, reviewerOutputStatus),
      status: reviewerOutputStatus,
    }),
    createCsvRow(report, {
      section: "report_metadata",
      key: "source_review_ids",
      value: report.source_review_ids.length > 0 ? report.source_review_ids.join(";") : "",
      count: formatAvailableCount(
        report.source_review_ids.length,
        report.source_review_ids.length > 0 ? "available" : "unavailable",
      ),
      status: report.source_review_ids.length > 0 ? "available" : "unavailable",
    }),
  );

  for (const verdict of REVIEW_RESULT_V01_VERDICTS) {
    rows.push(
      createCsvRow(report, {
        section: "verdict_distribution",
        key: verdict,
        count: formatAvailableCount(
          report.verdict_distribution[verdict],
          reviewerOutputStatus,
        ),
        status: reviewerOutputStatus,
      }),
    );
  }

  for (const action of REVIEW_RESULT_V01_RECOMMENDED_ACTIONS) {
    rows.push(
      createCsvRow(report, {
        section: "recommended_action_distribution",
        key: action,
        count: formatAvailableCount(
          report.recommended_action_distribution[action],
          reviewerOutputStatus,
        ),
        status: reviewerOutputStatus,
      }),
    );
  }

  if (report.label_winner_distribution.length > 0) {
    for (const entry of report.label_winner_distribution) {
      rows.push(
        createCsvRow(report, {
          section: "label_winner_distribution",
          key: entry.label_id,
          count: formatAvailableCount(entry.count, reviewerOutputStatus),
          status: reviewerOutputStatus,
        }),
      );
    }
  } else {
    rows.push(
      createCsvRow(report, {
        section: "label_winner_distribution",
        key: "unavailable",
        status: "unavailable",
      }),
    );
  }

  for (const rating of REVIEW_RESULT_V01_EVIDENCE_RATINGS) {
    rows.push(
      createCsvRow(report, {
        section: "evidence_rating_distribution",
        key: rating,
        count: formatAvailableCount(
          report.evidence_rating_distribution[rating],
          reviewerOutputStatus,
        ),
        status: reviewerOutputStatus,
      }),
    );
  }

  if (report.failure_mode_counts.length > 0) {
    for (const entry of report.failure_mode_counts) {
      rows.push(
        createCsvRow(report, {
          section: "failure_mode_counts",
          key: entry.failure_mode,
          count: formatAvailableCount(entry.count, reviewerOutputStatus),
          status: reviewerOutputStatus,
        }),
      );
    }
  } else {
    rows.push(
      createCsvRow(report, {
        section: "failure_mode_counts",
        key: reviewerOutputStatus === "available" ? "none_reported" : "unavailable",
        count: reviewerOutputStatus === "available" ? 0 : "",
        status: reviewerOutputStatus,
      }),
    );
  }

  for (const [dimension, signal] of [
    ["verdict", report.reviewer_agreement.verdict],
    ["label_winner", report.reviewer_agreement.label_winner],
    ["major_failure_mode", report.reviewer_agreement.major_failure_mode],
  ] as const) {
    appendAgreementSignalRows(
      rows,
      report,
      "reviewer_agreement",
      dimension,
      signal,
    );
  }

  for (const evidenceAgreement of report.reviewer_agreement.evidence_ratings) {
    appendAgreementSignalRows(
      rows,
      report,
      "evidence_rating_agreement",
      evidenceAgreement.evidence_id,
      evidenceAgreement,
    );
    rows.push(
      createCsvRow(report, {
        section: "disputed_evidence",
        key: evidenceAgreement.evidence_id,
        value:
          evidenceAgreement.unanimous === null
            ? ""
            : evidenceAgreement.disputed
              ? "true"
              : "false",
        count: evidenceAgreement.compared_review_count,
        status: evidenceAgreement.status,
      }),
    );
  }

  for (const rollup of report.comparison_rollups) {
    if (rollup.status === "unavailable") {
      rows.push(
        createCsvRow(report, {
          section: "comparison_metadata",
          key: rollup.dimension,
          value: rollup.reason,
          count: rollup.missing_review_count,
          status: "unavailable",
        }),
      );
      continue;
    }

    rows.push(
      createCsvRow(report, {
        section: "comparison_missing_review_count",
        key: rollup.dimension,
        count: rollup.missing_review_count,
        status: "available",
      }),
    );

    for (const group of rollup.groups) {
      rows.push(
        createCsvRow(report, {
          section: "comparison_review_count",
          key: rollup.dimension,
          value: group.value,
          count: group.review_count,
          status: "available",
        }),
        createCsvRow(report, {
          section: "comparison_evidence_decision_count",
          key: rollup.dimension,
          value: group.value,
          count: group.evidence_decision_count,
          status: "available",
        }),
      );

      for (const verdict of REVIEW_RESULT_V01_VERDICTS) {
        rows.push(
          createCsvRow(report, {
            section: `comparison_verdict_distribution:${verdict}`,
            key: rollup.dimension,
            value: group.value,
            count: group.verdict_distribution[verdict],
            status: "available",
          }),
        );
      }

      for (const rating of REVIEW_RESULT_V01_EVIDENCE_RATINGS) {
        rows.push(
          createCsvRow(report, {
            section: `comparison_evidence_rating_distribution:${rating}`,
            key: rollup.dimension,
            value: group.value,
            count: group.evidence_rating_distribution[rating],
            status: "available",
          }),
        );
      }
    }
  }

  rows.push(
    createCsvRow(report, {
      section: "disagreement",
      key: "has_any_disagreement",
      value: formatAvailableBoolean(
        report.disagreement.has_any_disagreement,
        reviewerComparisonStatus,
      ),
      status: reviewerComparisonStatus,
    }),
    createCsvRow(report, {
      section: "disagreement",
      key: "verdict",
      value: formatAvailableBoolean(
        report.disagreement.verdict,
        reviewerComparisonStatus,
      ),
      status: reviewerComparisonStatus,
    }),
    createCsvRow(report, {
      section: "disagreement",
      key: "recommended_action",
      value: formatAvailableBoolean(
        report.disagreement.recommended_action,
        reviewerComparisonStatus,
      ),
      status: reviewerComparisonStatus,
    }),
    createCsvRow(report, {
      section: "disagreement",
      key: "label_winner",
      value: formatAvailableBoolean(
        report.disagreement.label_winner,
        reviewerComparisonStatus,
      ),
      status: reviewerComparisonStatus,
    }),
    createCsvRow(report, {
      section: "disagreement",
      key: "evidence_ratings",
      value: formatAvailableBoolean(
        report.disagreement.evidence_ratings,
        reviewerComparisonStatus,
      ),
      status: reviewerComparisonStatus,
    }),
  );

  if (report.disagreement.evidence_ids.length > 0) {
    for (const evidenceId of report.disagreement.evidence_ids) {
      rows.push(
        createCsvRow(report, {
          section: "disagreement_evidence_ids",
          key: evidenceId,
          count: formatAvailableCount(1, reviewerComparisonStatus),
          status: reviewerComparisonStatus,
        }),
      );
    }
  } else {
    rows.push(
      createCsvRow(report, {
        section: "disagreement_evidence_ids",
        key:
          reviewerComparisonStatus === "available"
            ? "none_reported"
            : "unavailable",
        count: reviewerComparisonStatus === "available" ? 0 : "",
        status: reviewerComparisonStatus,
      }),
    );
  }

  return rows;
}

function appendAgreementSignalRows(
  rows: EvaluationReportCsvRowV01[],
  report: EvaluationReportV01,
  sectionPrefix: "reviewer_agreement" | "evidence_rating_agreement",
  key: string,
  signal: ReviewerAgreementSignalV01,
) {
  rows.push(
    createCsvRow(report, {
      section: sectionPrefix,
      key,
      value:
        signal.unanimous === null
          ? ""
          : signal.unanimous
            ? "unanimous"
            : "disagreement",
      count: signal.compared_review_count,
      status: signal.status,
    }),
    createCsvRow(report, {
      section: `${sectionPrefix}_unavailable_review_count`,
      key,
      count: signal.unavailable_review_count,
      status: signal.status,
    }),
    createCsvRow(report, {
      section: `${sectionPrefix}_distinct_value_count`,
      key,
      count: signal.distinct_value_count,
      status: signal.status,
    }),
  );

  for (const value of signal.values) {
    rows.push(
      createCsvRow(report, {
        section: `${sectionPrefix}_value`,
        key,
        value: value.value,
        count: value.review_count,
        status: signal.status,
      }),
    );
  }

  if (signal.reason) {
    rows.push(
      createCsvRow(report, {
        section: `${sectionPrefix}_reason`,
        key,
        value: signal.reason,
        status: signal.status,
      }),
    );
  }
}

function createCsvRow(
  report: EvaluationReportV01,
  row: {
    section: string;
    key: string;
    value?: string;
    count?: number | "";
    status: CsvStatus;
  },
): EvaluationReportCsvRowV01 {
  return {
    schema_version: report.schema_version,
    calculation_version: report.calculation_version,
    case_package_schema_version: report.case_package.schema_version,
    package_id: report.case_package.package_id,
    package_revision: report.case_package.package_revision ?? "",
    case_id: report.case_package.case_id,
    cluster_id: report.case_package.cluster_id,
    pipeline_id: report.case_package.pipeline.pipeline_id ?? "",
    pipeline_run_id: report.case_package.pipeline.run_id,
    upstream_tool: report.case_package.pipeline.upstream_tool,
    pipeline_version: report.case_package.pipeline.pipeline_version ?? "",
    embedding_model: report.case_package.pipeline.embedding_model ?? "",
    clustering_method: report.case_package.pipeline.clustering_method ?? "",
    dimensionality_reduction_method:
      report.case_package.pipeline.dimensionality_reduction_method ?? "",
    naming_model: report.case_package.pipeline.naming_model ?? "",
    prompt_id: report.case_package.pipeline.prompt_id ?? "",
    prompt_version: report.case_package.pipeline.prompt_version ?? "",
    prompt_digest: report.case_package.pipeline.prompt_digest ?? "",
    pipeline_generated_at: report.case_package.pipeline.generated_at,
    source_review_ids: report.source_review_ids.join(";"),
    reviewer_count: report.reviewer_count,
    section: row.section,
    key: row.key,
    value: row.value ?? "",
    count: row.count ?? "",
    status: row.status,
  };
}

function getReviewerOutputStatus(report: EvaluationReportV01): CsvStatus {
  return report.reviewer_count > 0 ? "available" : "unavailable";
}

function formatAvailableCount(count: number, status: CsvStatus): number | "" {
  return status === "available" ? count : "";
}

function formatAvailableBoolean(value: boolean, status: CsvStatus) {
  if (status === "unavailable") {
    return "";
  }

  return value ? "true" : "false";
}

function formatCsvCell(value: string | number) {
  const text = String(value);

  if (!/[",\n\r]/.test(text)) {
    return text;
  }

  return `"${text.replaceAll("\"", "\"\"")}"`;
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
