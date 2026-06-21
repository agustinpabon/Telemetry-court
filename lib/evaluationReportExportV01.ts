import type { EvaluationReportV01 } from "@/lib/evaluationReportV01";
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

type CsvStatus = "available" | "unavailable";

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
    disagreement: {
      ...report.disagreement,
      evidence_ids: [...report.disagreement.evidence_ids].sort(),
    },
  };
}

function buildEvaluationReportCsvRowsV01(
  report: EvaluationReportV01,
): EvaluationReportCsvRowV01[] {
  const rows: EvaluationReportCsvRowV01[] = [];
  const reviewerOutputStatus = getReviewerOutputStatus(report);

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

  rows.push(
    createCsvRow(report, {
      section: "disagreement",
      key: "has_any_disagreement",
      value: formatAvailableBoolean(
        report.disagreement.has_any_disagreement,
        reviewerOutputStatus,
      ),
      status: reviewerOutputStatus,
    }),
    createCsvRow(report, {
      section: "disagreement",
      key: "verdict",
      value: formatAvailableBoolean(report.disagreement.verdict, reviewerOutputStatus),
      status: reviewerOutputStatus,
    }),
    createCsvRow(report, {
      section: "disagreement",
      key: "recommended_action",
      value: formatAvailableBoolean(
        report.disagreement.recommended_action,
        reviewerOutputStatus,
      ),
      status: reviewerOutputStatus,
    }),
    createCsvRow(report, {
      section: "disagreement",
      key: "label_winner",
      value: formatAvailableBoolean(
        report.disagreement.label_winner,
        reviewerOutputStatus,
      ),
      status: reviewerOutputStatus,
    }),
    createCsvRow(report, {
      section: "disagreement",
      key: "evidence_ratings",
      value: formatAvailableBoolean(
        report.disagreement.evidence_ratings,
        reviewerOutputStatus,
      ),
      status: reviewerOutputStatus,
    }),
  );

  if (report.disagreement.evidence_ids.length > 0) {
    for (const evidenceId of report.disagreement.evidence_ids) {
      rows.push(
        createCsvRow(report, {
          section: "disagreement_evidence_ids",
          key: evidenceId,
          count: formatAvailableCount(1, reviewerOutputStatus),
          status: reviewerOutputStatus,
        }),
      );
    }
  } else {
    rows.push(
      createCsvRow(report, {
        section: "disagreement_evidence_ids",
        key: reviewerOutputStatus === "available" ? "none_reported" : "unavailable",
        count: reviewerOutputStatus === "available" ? 0 : "",
        status: reviewerOutputStatus,
      }),
    );
  }

  return rows;
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
