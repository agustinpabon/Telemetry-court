import assert from "node:assert/strict";
import test from "node:test";

import { sampleEvaluationReportV01 } from "@/data/evaluationReportFixtures";
import {
  getEvaluationReportCsvExportFilenameV01,
  getEvaluationReportJsonExportFilenameV01,
  serializeEvaluationReportCsvV01,
  serializeEvaluationReportJsonV01,
} from "@/lib/evaluationReportExportV01";
import type { EvaluationReportV01 } from "@/lib/evaluationReportV01";

test("evaluation report JSON export preserves versioned report metadata", () => {
  const serializedExport = serializeEvaluationReportJsonV01(
    sampleEvaluationReportV01,
  );
  const parsedExport = JSON.parse(serializedExport);

  assert.equal(serializedExport.endsWith("\n"), true);
  assert.equal(
    getEvaluationReportJsonExportFilenameV01(sampleEvaluationReportV01),
    "case-synthetic-evaluation-001-evaluation-report.json",
  );
  assert.equal(parsedExport.schema_version, "evaluation_report.v0.1");
  assert.equal(
    parsedExport.calculation_version,
    "review_result_aggregation.v0.2",
  );
  assert.deepEqual(parsedExport.case_package, sampleEvaluationReportV01.case_package);
  assert.deepEqual(parsedExport.source_review_ids, ["review-a", "review-b"]);
  assert.equal(parsedExport.reviewer_count, 2);
  assert.deepEqual(
    parsedExport.verdict_distribution,
    sampleEvaluationReportV01.verdict_distribution,
  );
  assert.deepEqual(
    parsedExport.comparison_rollups,
    sampleEvaluationReportV01.comparison_rollups,
  );
  assert.equal("claims" in parsedExport, false);
  assert.equal("evidence_items" in parsedExport, false);
  assert.equal("raw_telemetry" in parsedExport, false);
});

test("evaluation report CSV export includes deterministic audit rows", () => {
  const csvExport = serializeEvaluationReportCsvV01(sampleEvaluationReportV01);
  const rows = csvExport.trimEnd().split("\n");
  const headers = rows[0].split(",");
  const reviewerCountRow = rows[1].split(",");

  assert.deepEqual(headers, [
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
  ]);
  assert.equal(
    reviewerCountRow[headers.indexOf("case_package_schema_version")],
    "case_package.v0.1",
  );
  assert.equal(
    reviewerCountRow[headers.indexOf("package_id")],
    "pkg-synthetic-evaluation-001",
  );
  assert.equal(
    reviewerCountRow[headers.indexOf("pipeline_run_id")],
    "run-synthetic-evaluation-001",
  );
  assert.equal(
    reviewerCountRow[headers.indexOf("source_review_ids")],
    "review-a;review-b",
  );
  assert.deepEqual(reviewerCountRow.slice(-5), [
    "report_metadata",
    "reviewer_count",
    "",
    "2",
    "available",
  ]);
  assert.ok(
    rows.some((row) =>
      row.endsWith(",label_winner_distribution,label-b,,1,available"),
    ),
  );
  assert.ok(
    rows.some((row) =>
      row.endsWith(",evidence_rating_distribution,contradicts,,1,available"),
    ),
  );
  assert.ok(
    rows.some((row) =>
      row.endsWith(",disagreement_evidence_ids,evidence-2,,1,available"),
    ),
  );
  assert.ok(
    rows.some((row) =>
      row.endsWith(",comparison_review_count,embedding_model,synthetic-embedding-a,2,available"),
    ),
  );
  assert.ok(
    rows.some((row) =>
      row.endsWith(
        ",comparison_metadata,clustering_method,\"Metadata \"\"clustering_method\"\" is missing from all compact CasePackage references.\",2,unavailable",
      ),
    ),
  );
  assert.equal(csvExport.endsWith("\n"), true);
  assert.equal(csvExport.includes("evidence_items"), false);
  assert.equal(csvExport.includes("raw_telemetry"), false);
});

test("evaluation report CSV export escapes cells and uses a stable filename", () => {
  const reportWithCsvSensitiveMetadata: EvaluationReportV01 = {
    ...sampleEvaluationReportV01,
    case_package: {
      ...sampleEvaluationReportV01.case_package,
      pipeline: {
        ...sampleEvaluationReportV01.case_package.pipeline,
        upstream_tool: "synthetic, tool \"quoted\"",
        pipeline_version: "v1\nline two",
        embedding_model: "embedding-v1",
        clustering_method: "cluster-v1",
        dimensionality_reduction_method: "projection-v1",
        naming_model: "naming-v1",
        prompt_id: "prompt-v1",
        prompt_version: "1",
        prompt_digest: "sha256:fixture",
      },
    },
  };
  const csvExport = serializeEvaluationReportCsvV01(
    reportWithCsvSensitiveMetadata,
  );

  assert.equal(
    getEvaluationReportCsvExportFilenameV01(reportWithCsvSensitiveMetadata),
    "case-synthetic-evaluation-001-evaluation-report.csv",
  );
  assert.match(csvExport, /"synthetic, tool ""quoted"""/);
  assert.match(csvExport, /"v1\nline two"/);
  for (const provenanceValue of [
    "embedding-v1",
    "cluster-v1",
    "projection-v1",
    "naming-v1",
    "prompt-v1",
    "sha256:fixture",
  ]) {
    assert.equal(csvExport.includes(provenanceValue), true);
  }
});

test("evaluation report export normalizes row ordering without mutating the report", () => {
  const unsortedReport: EvaluationReportV01 = {
    ...sampleEvaluationReportV01,
    source_review_ids: ["review-b", "review-a"],
    verdict_distribution: Object.fromEntries(
      Object.entries(sampleEvaluationReportV01.verdict_distribution).reverse(),
    ) as EvaluationReportV01["verdict_distribution"],
    evidence_rating_distribution: Object.fromEntries(
      Object.entries(
        sampleEvaluationReportV01.evidence_rating_distribution,
      ).reverse(),
    ) as EvaluationReportV01["evidence_rating_distribution"],
    label_winner_distribution: [
      { label_id: "label-z", count: 1 },
      { label_id: "label-a", count: 1 },
    ],
    failure_mode_counts: [
      { failure_mode: "too_broad", count: 1 },
      { failure_mode: "missing_evidence", count: 2 },
    ],
    disagreement: {
      ...sampleEvaluationReportV01.disagreement,
      evidence_ids: ["evidence-z", "evidence-a"],
    },
    comparison_rollups: [...sampleEvaluationReportV01.comparison_rollups]
      .reverse()
      .map((rollup) =>
        rollup.status === "available"
          ? { ...rollup, groups: [...rollup.groups].reverse() }
          : rollup,
      ),
  };

  const parsedExport = JSON.parse(
    serializeEvaluationReportJsonV01(unsortedReport),
  ) as EvaluationReportV01;
  const csvExport = serializeEvaluationReportCsvV01(unsortedReport);

  assert.deepEqual(parsedExport.source_review_ids, ["review-a", "review-b"]);
  assert.deepEqual(parsedExport.label_winner_distribution, [
    { label_id: "label-a", count: 1 },
    { label_id: "label-z", count: 1 },
  ]);
  assert.deepEqual(parsedExport.failure_mode_counts, [
    { failure_mode: "missing_evidence", count: 2 },
    { failure_mode: "too_broad", count: 1 },
  ]);
  assert.deepEqual(parsedExport.disagreement.evidence_ids, [
    "evidence-a",
    "evidence-z",
  ]);
  assert.deepEqual(
    parsedExport.comparison_rollups.slice(0, 2).map((rollup) => rollup.dimension),
    ["selected_label_id", "package_id"],
  );
  assert.deepEqual(
    parsedExport.comparison_rollups[0].status === "available"
      ? parsedExport.comparison_rollups[0].groups.map((group) => group.value)
      : [],
    ["label-a", "label-b"],
  );
  assert.deepEqual(Object.keys(parsedExport.verdict_distribution), [
    "supported",
    "partially_supported",
    "unsupported_or_overclaimed",
    "uncertain",
    "cluster_impure",
    "needs_split",
    "needs_merge",
    "needs_better_evidence",
  ]);
  assert.deepEqual(Object.keys(parsedExport.evidence_rating_distribution), [
    "supports",
    "weak_support",
    "irrelevant",
    "contradicts",
    "insufficient",
    "needs_more_context",
  ]);
  assert.ok(
    csvExport.indexOf("label_winner_distribution,label-a") <
      csvExport.indexOf("label_winner_distribution,label-z"),
  );
  assert.ok(
    csvExport.indexOf("disagreement_evidence_ids,evidence-a") <
      csvExport.indexOf("disagreement_evidence_ids,evidence-z"),
  );
  assert.ok(
    csvExport.indexOf("comparison_review_count,selected_label_id,label-a") <
      csvExport.indexOf("comparison_review_count,selected_label_id,label-b"),
  );
  assert.deepEqual(unsortedReport.source_review_ids, ["review-b", "review-a"]);
});

test("evaluation report CSV export marks unavailable aggregate rows explicitly", () => {
  const unavailableReport = createUnavailableReport();
  const csvExport = serializeEvaluationReportCsvV01(unavailableReport);
  const rows = csvExport.trimEnd().split("\n");

  assert.ok(
    rows.some((row) => row.endsWith(",report_metadata,reviewer_count,,,unavailable")),
  );
  assert.ok(
    rows.some((row) => row.endsWith(",verdict_distribution,supported,,,unavailable")),
  );
  assert.ok(
    rows.some((row) =>
      row.endsWith(",label_winner_distribution,unavailable,,,unavailable"),
    ),
  );
  assert.ok(
    rows.some((row) =>
      row.endsWith(",disagreement,has_any_disagreement,,,unavailable"),
    ),
  );
});

function createUnavailableReport(): EvaluationReportV01 {
  return {
    ...sampleEvaluationReportV01,
    source_review_ids: [],
    reviewer_count: 0,
    verdict_distribution: Object.fromEntries(
      Object.keys(sampleEvaluationReportV01.verdict_distribution).map((key) => [
        key,
        0,
      ]),
    ) as EvaluationReportV01["verdict_distribution"],
    recommended_action_distribution: Object.fromEntries(
      Object.keys(sampleEvaluationReportV01.recommended_action_distribution).map(
        (key) => [key, 0],
      ),
    ) as EvaluationReportV01["recommended_action_distribution"],
    label_winner_distribution: [],
    evidence_rating_distribution: Object.fromEntries(
      Object.keys(sampleEvaluationReportV01.evidence_rating_distribution).map(
        (key) => [key, 0],
      ),
    ) as EvaluationReportV01["evidence_rating_distribution"],
    failure_mode_counts: [],
    disagreement: {
      has_any_disagreement: false,
      verdict: false,
      recommended_action: false,
      label_winner: false,
      evidence_ratings: false,
      evidence_ids: [],
    },
  };
}
