import assert from "node:assert/strict";
import test from "node:test";

import { sampleCases } from "@/data/sampleCases";
import {
  buildQuickDispositionExportV01,
  QUICK_DISPOSITION_V01_DISPOSITIONS,
  QUICK_DISPOSITION_V01_REASON_CODES,
  QUICK_DISPOSITION_V01_SCHEMA_VERSION,
  QUICK_DISPOSITION_V01_SOURCE_STAGES,
  serializeQuickDispositionV01,
  validateQuickDispositionV01,
} from "@/lib/quickDispositionV01";

test("quick disposition export emits a versioned artifact without full-review decisions", () => {
  const caseFile = sampleCases[0];
  const disposition = buildQuickDispositionExportV01({
    caseFile,
    exportTimestamp: "2026-06-24T12:00:00.000Z",
    sourceStage: "case_file",
    disposition: "save_for_later",
    reasonCodes: ["needs_later_review"],
  });
  const serialized = serializeQuickDispositionV01(disposition);

  assert.equal(disposition.schema_version, "quick_disposition.v0.1");
  assert.equal(
    disposition.disposition_id,
    "quick-disposition:pkg-synthetic-arena-001:local-demo-reviewer:pkg-synthetic-arena-001:case-arena-001:local-session:case_file:2026-06-24T12:00:00.000Z",
  );
  assert.equal(disposition.created_at, "2026-06-24T12:00:00.000Z");
  assert.deepEqual(disposition.case_package, {
    schema_version: "case_package.v0.1",
    package_id: "pkg-synthetic-arena-001",
    package_revision: "r1",
    case_id: caseFile.id,
    cluster_id: caseFile.cluster.id,
    pipeline: {
      pipeline_id: "pipeline-synthetic-sample-fixtures",
      run_id: "run-case-arena-001-synthetic-fixture",
      upstream_tool: "synthetic-demo-fixture",
      pipeline_version: "0.1.0",
      embedding_model: "synthetic-embedding-fixture",
      clustering_method: "synthetic-static-clustering",
      dimensionality_reduction_method: "synthetic-static-review-map",
      naming_model: "Baseline AI labeler v0.7",
      prompt_id: "prompt-synthetic-baseline-labeler-v0.7",
      generated_at: "2026-06-13T13:10:00Z",
    },
  });
  assert.deepEqual(disposition.reviewer, {
    reviewer_id: "local-demo-reviewer",
    review_session_id:
      "pkg-synthetic-arena-001:case-arena-001:local-session",
    context: "synthetic_demo",
  });
  assert.equal(disposition.source_stage, "case_file");
  assert.equal(disposition.disposition, "save_for_later");
  assert.deepEqual(disposition.reason_codes, ["needs_later_review"]);
  assert.equal("decisions" in disposition, false);
  assert.equal(serialized.endsWith("\n"), true);
  assert.deepEqual(JSON.parse(serialized), disposition);
  assert.doesNotMatch(
    serialized,
    /evidence_ratings|label_comparison|outlier_impostor|final_verdict|recommended_action/,
  );
});

test("quick disposition validation accepts canonical values and rejects fabricated decisions", () => {
  const caseFile = sampleCases[0];
  const disposition = buildQuickDispositionExportV01({
    caseFile,
    exportTimestamp: "2026-06-24T12:00:00.000Z",
    sourceStage: "blind_review",
    disposition: "cannot_judge_from_package",
    reasonCodes: ["insufficient_package_context"],
  });
  const valid = validateQuickDispositionV01(disposition);
  const invalid = validateQuickDispositionV01({
    ...disposition,
    decisions: {
      final_verdict: "uncertain",
      recommended_action: "collect_more_evidence",
    },
  });

  assert.equal(valid.ok, true);
  assert.equal(invalid.ok, false);
  if (invalid.ok) {
    return;
  }
  assert.deepEqual(invalid.errors.map((error) => error.code), [
    "unsupported_field",
  ]);
  assert.match(invalid.errors[0].path, /\$\.decisions/);
});

test("quick disposition v0.1 exposes the canonical disposition vocabulary", () => {
  assert.equal(QUICK_DISPOSITION_V01_SCHEMA_VERSION, "quick_disposition.v0.1");
  assert.deepEqual(QUICK_DISPOSITION_V01_SOURCE_STAGES, [
    "landscape",
    "case_file",
    "blind_review",
    "evidence_board",
  ]);
  assert.deepEqual(QUICK_DISPOSITION_V01_DISPOSITIONS, [
    "dismiss_not_interesting",
    "save_for_later",
    "escalate_to_full_review",
    "cannot_judge_from_package",
  ]);
  assert.deepEqual(QUICK_DISPOSITION_V01_REASON_CODES, [
    "low_validation_value",
    "needs_later_review",
    "full_review_requested",
    "insufficient_package_context",
  ]);
});
