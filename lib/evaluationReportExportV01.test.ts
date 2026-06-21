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
    "review_result_aggregation.v0.1",
  );
  assert.deepEqual(parsedExport.case_package, sampleEvaluationReportV01.case_package);
  assert.deepEqual(parsedExport.source_review_ids, ["review-a", "review-b"]);
  assert.equal(parsedExport.reviewer_count, 2);
  assert.deepEqual(
    parsedExport.verdict_distribution,
    sampleEvaluationReportV01.verdict_distribution,
  );
  assert.equal("claims" in parsedExport, false);
  assert.equal("evidence_items" in parsedExport, false);
  assert.equal("raw_telemetry" in parsedExport, false);
});

test("evaluation report CSV export includes deterministic audit rows", () => {
  const csvExport = serializeEvaluationReportCsvV01(sampleEvaluationReportV01);
  const rows = csvExport.trimEnd().split("\n");

  assert.deepEqual(rows.slice(0, 4), [
    "schema_version,calculation_version,package_id,package_revision,case_id,cluster_id,pipeline_id,pipeline_run_id,upstream_tool,pipeline_generated_at,source_review_ids,reviewer_count,section,key,value,count,status",
    "evaluation_report.v0.1,review_result_aggregation.v0.1,pkg-synthetic-evaluation-001,r1,case-synthetic-evaluation-001,cluster-synthetic-evaluation-001,pipeline-synthetic-evaluation,run-synthetic-evaluation-001,synthetic-evaluation-fixture,2026-06-21T11:00:00.000Z,review-a;review-b,2,report_metadata,reviewer_count,,2,available",
    "evaluation_report.v0.1,review_result_aggregation.v0.1,pkg-synthetic-evaluation-001,r1,case-synthetic-evaluation-001,cluster-synthetic-evaluation-001,pipeline-synthetic-evaluation,run-synthetic-evaluation-001,synthetic-evaluation-fixture,2026-06-21T11:00:00.000Z,review-a;review-b,2,report_metadata,source_review_ids,review-a;review-b,2,available",
    "evaluation_report.v0.1,review_result_aggregation.v0.1,pkg-synthetic-evaluation-001,r1,case-synthetic-evaluation-001,cluster-synthetic-evaluation-001,pipeline-synthetic-evaluation,run-synthetic-evaluation-001,synthetic-evaluation-fixture,2026-06-21T11:00:00.000Z,review-a;review-b,2,verdict_distribution,supported,,1,available",
  ]);
  assert.ok(
    rows.includes(
      "evaluation_report.v0.1,review_result_aggregation.v0.1,pkg-synthetic-evaluation-001,r1,case-synthetic-evaluation-001,cluster-synthetic-evaluation-001,pipeline-synthetic-evaluation,run-synthetic-evaluation-001,synthetic-evaluation-fixture,2026-06-21T11:00:00.000Z,review-a;review-b,2,label_winner_distribution,label-b,,1,available",
    ),
  );
  assert.ok(
    rows.includes(
      "evaluation_report.v0.1,review_result_aggregation.v0.1,pkg-synthetic-evaluation-001,r1,case-synthetic-evaluation-001,cluster-synthetic-evaluation-001,pipeline-synthetic-evaluation,run-synthetic-evaluation-001,synthetic-evaluation-fixture,2026-06-21T11:00:00.000Z,review-a;review-b,2,evidence_rating_distribution,contradicts,,1,available",
    ),
  );
  assert.ok(
    rows.includes(
      "evaluation_report.v0.1,review_result_aggregation.v0.1,pkg-synthetic-evaluation-001,r1,case-synthetic-evaluation-001,cluster-synthetic-evaluation-001,pipeline-synthetic-evaluation,run-synthetic-evaluation-001,synthetic-evaluation-fixture,2026-06-21T11:00:00.000Z,review-a;review-b,2,disagreement_evidence_ids,evidence-2,,1,available",
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
  assert.deepEqual(unsortedReport.source_review_ids, ["review-b", "review-a"]);
});

test("evaluation report CSV export marks unavailable aggregate rows explicitly", () => {
  const unavailableReport = createUnavailableReport();
  const csvExport = serializeEvaluationReportCsvV01(unavailableReport);
  const rows = csvExport.trimEnd().split("\n");

  assert.ok(
    rows.includes(
      "evaluation_report.v0.1,review_result_aggregation.v0.1,pkg-synthetic-evaluation-001,r1,case-synthetic-evaluation-001,cluster-synthetic-evaluation-001,pipeline-synthetic-evaluation,run-synthetic-evaluation-001,synthetic-evaluation-fixture,2026-06-21T11:00:00.000Z,,0,report_metadata,reviewer_count,,,unavailable",
    ),
  );
  assert.ok(
    rows.includes(
      "evaluation_report.v0.1,review_result_aggregation.v0.1,pkg-synthetic-evaluation-001,r1,case-synthetic-evaluation-001,cluster-synthetic-evaluation-001,pipeline-synthetic-evaluation,run-synthetic-evaluation-001,synthetic-evaluation-fixture,2026-06-21T11:00:00.000Z,,0,verdict_distribution,supported,,,unavailable",
    ),
  );
  assert.ok(
    rows.includes(
      "evaluation_report.v0.1,review_result_aggregation.v0.1,pkg-synthetic-evaluation-001,r1,case-synthetic-evaluation-001,cluster-synthetic-evaluation-001,pipeline-synthetic-evaluation,run-synthetic-evaluation-001,synthetic-evaluation-fixture,2026-06-21T11:00:00.000Z,,0,label_winner_distribution,unavailable,,,unavailable",
    ),
  );
  assert.ok(
    rows.includes(
      "evaluation_report.v0.1,review_result_aggregation.v0.1,pkg-synthetic-evaluation-001,r1,case-synthetic-evaluation-001,cluster-synthetic-evaluation-001,pipeline-synthetic-evaluation,run-synthetic-evaluation-001,synthetic-evaluation-fixture,2026-06-21T11:00:00.000Z,,0,disagreement,has_any_disagreement,,,unavailable",
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
