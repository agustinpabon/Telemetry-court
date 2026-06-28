import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  evaluationReportV01Examples,
  syntheticOverclaimEvaluationReportExampleV01,
} from "@/lib/evaluationReportV01Examples";
import { aggregateReviewResultsV01 } from "@/lib/evaluationReportV01";
import { validateCasePackageV01 } from "@/lib/casePackageValidation";
import { assertValidReviewResultV01 } from "@/lib/reviewResultValidationV01";

test("EvaluationReport examples are schema-valid and generated from traceable ReviewResults", () => {
  assert.equal(evaluationReportV01Examples.length, 1);

  for (const example of evaluationReportV01Examples) {
    const packageValidation = validateCasePackageV01(example.casePackage);
    assert.equal(packageValidation.ok, true);

    for (const reviewResult of example.sourceReviewResults) {
      assert.doesNotThrow(() => assertValidReviewResultV01(reviewResult));
      assert.deepEqual(reviewResult.case_package, example.evaluationReport.case_package);
    }

    assert.deepEqual(
      aggregateReviewResultsV01(example.sourceReviewResults),
      example.evaluationReport,
    );
    assert.equal(example.evaluationReport.schema_version, "evaluation_report.v0.1");
    assert.equal(
      example.evaluationReport.calculation_version,
      "review_result_aggregation.v0.3",
    );
    assert.deepEqual(
      example.evaluationReport.source_review_ids,
      example.sourceReviewResults
        .map((reviewResult) => reviewResult.review_id)
        .sort(),
    );
    assert.equal(
      example.evaluationReport.case_package.package_id,
      example.casePackage.package_id,
    );
    assert.equal(
      example.evaluationReport.case_package.case_id,
      example.casePackage.case.case_id,
    );
    assert.equal(
      example.evaluationReport.case_package.cluster_id,
      example.casePackage.cluster.cluster_id,
    );
  }
});

test("EvaluationReport example references stay within the synthetic CasePackage", () => {
  const example = syntheticOverclaimEvaluationReportExampleV01;
  const labelIds = new Set(
    example.casePackage.candidate_labels.map((label) => label.label_id),
  );
  const evidenceIds = new Set(
    example.casePackage.evidence_items.map((evidence) => evidence.evidence_id),
  );
  const sessionIds = new Set(
    example.casePackage.representative_sessions.map(
      (session) => session.session_id,
    ),
  );

  for (const reviewResult of example.sourceReviewResults) {
    assert.equal(
      labelIds.has(reviewResult.decisions.label_comparison.selected_label_id),
      true,
    );
    assert.equal(
      sessionIds.has(reviewResult.decisions.outlier_impostor.selected_session_id),
      true,
    );

    for (const evidenceRating of reviewResult.decisions.evidence_ratings) {
      assert.equal(evidenceIds.has(evidenceRating.evidence_id), true);
    }
  }
});

test("EvaluationReport example demonstrates validation-bench signals without claiming pilots", () => {
  const { evaluationReport: report } = syntheticOverclaimEvaluationReportExampleV01;

  assert.equal(report.reviewer_count, 2);
  assert.equal(report.verdict_distribution.unsupported_or_overclaimed, 1);
  assert.equal(report.verdict_distribution.needs_split, 1);
  assert.equal(report.recommended_action_distribution.rename_label, 1);
  assert.equal(report.recommended_action_distribution.split_cluster, 1);
  assert.equal(report.evidence_rating_distribution.contradicts, 1);
  assert.equal(report.evidence_rating_distribution.insufficient, 2);
  assert.deepEqual(report.label_winner_distribution, [
    { label_id: "label-ai-suspicious-iam", count: 1 },
    { label_id: "label-human-routine-provisioning", count: 1 },
  ]);
  assert.equal(report.disagreement.has_any_disagreement, true);
  assert.equal(report.disagreement.label_winner, true);
  assert.deepEqual(report.disagreement.evidence_ids, [
    "evidence-no-downstream-abuse",
    "evidence-rollout-metadata",
  ]);
});

test("EvaluationReport examples are explicitly synthetic demo artifacts with honest limitations", () => {
  for (const example of evaluationReportV01Examples) {
    assert.equal(example.example_kind, "synthetic_sanitized_demo");
    assert.equal(example.casePackage.case.reviewable_status, "synthetic_demo");
    assert.equal(example.casePackage.dataset.data_classification, "synthetic");
    assert.equal(example.casePackage.sanitization.status, "synthetic");

    for (const reviewResult of example.sourceReviewResults) {
      assert.equal(reviewResult.reviewer.context, "synthetic_demo");
    }

    const limitationText = example.limitations.join("\n").toLowerCase();
    assert.match(limitationText, /synthetic/);
    assert.match(limitationText, /no live reviewer pilot is claimed/);
    assert.match(limitationText, /no real analyst agreement is claimed/);
    assert.match(limitationText, /no restricted telemetry is included/);
    assert.match(limitationText, /no operational performance claim is made/);
    assert.match(limitationText, /demo, development, and presentation/);
    assert.doesNotMatch(limitationText, /pilot validation achieved/);
    assert.doesNotMatch(limitationText, /real analyst agreement achieved/);
    assert.doesNotMatch(limitationText, /operational performance validated/);
  }
});

test("EvaluationReport example documentation states honest demo limits", () => {
  const docs = readFileSync("docs/EVALUATION_REPORT_EXAMPLES.md", "utf8")
    .toLowerCase();

  assert.match(docs, /synthetic\/sanitized demo artifacts/);
  assert.match(docs, /no live reviewer pilot is claimed/);
  assert.match(docs, /no real analyst agreement is claimed/);
  assert.match(docs, /no restricted telemetry is included/);
  assert.match(docs, /no operational performance claim is made/);
  assert.match(docs, /demo, development, and presentation/);
  assert.doesNotMatch(docs, /pilot validation achieved/);
  assert.doesNotMatch(docs, /validated by real analysts/);
  assert.doesNotMatch(docs, /operational performance validated/);
});
