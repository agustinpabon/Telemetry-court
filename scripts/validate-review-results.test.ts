import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

import { sampleCases } from "@/data/sampleCases";
import { buildReviewResultExport, type EvidenceArenaReview } from "@/lib/exportReview";
import { buildQuickDispositionExportV01 } from "@/lib/quickDispositionV01";
import {
  createReviewResultBundleV01,
  serializeReviewResultBundleV01,
} from "@/lib/reviewResultBundleV01";
import type { ReviewResultV01 } from "@/lib/reviewResultV01";
import type { CaseFile } from "@/lib/types";
import { runValidateReviewResultsCli } from "@/scripts/validate-review-results";

type CliResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

async function withTempJsonFile(
  contents: string,
  callback: (filePath: string) => Promise<CliResult>,
): Promise<CliResult> {
  const directory = await mkdtemp(join(tmpdir(), "tc-review-results-cli-"));
  const filePath = join(directory, "review-results.json");

  try {
    await writeFile(filePath, contents, "utf8");
    return await callback(filePath);
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
}

async function runCli(argv: string[]): Promise<CliResult> {
  let stdout = "";
  let stderr = "";
  const exitCode = await runValidateReviewResultsCli({
    argv,
    cwd: process.cwd(),
    writeStdout: (value) => {
      stdout += value;
    },
    writeStderr: (value) => {
      stderr += value;
    },
  });

  return { exitCode, stdout, stderr };
}

function buildReviewResult(
  caseFile: CaseFile,
  reviewerId: string,
  sessionId: string,
  overrides: Partial<EvidenceArenaReview> = {},
): ReviewResultV01 {
  return buildReviewResultExport({
    caseFile,
    exportTimestamp: "2026-06-21T15:00:00.000Z",
    arenaReview: {
      blindChoiceId: caseFile.blindInterpretationOptions[0].id,
      blindChoiceLabel: caseFile.blindInterpretationOptions[0].label,
      aiLabel: caseFile.topicLabel.name,
      aiLabelRevealed: true,
      blindChoiceAgreesWithAi: false,
      labelDuelWinnerId: caseFile.candidateLabels[0].id,
      labelDuelWinnerLabel: caseFile.candidateLabels[0].label,
      duelReasons: [],
      evidenceRatings: { ...caseFile.defaultEvidenceRatings },
      impostorSessionId: caseFile.representativeSessions[0].id,
      impostorSessionTitle: caseFile.representativeSessions[0].title,
      failureModes: [],
      finalVerdict: "supported",
      ...overrides,
    },
    reviewer: {
      reviewer_id: reviewerId,
      review_session_id: sessionId,
      context: "local_review",
    },
  });
}

test("valid single ReviewResult JSON passes and prints inspection summary", async () => {
  const review = buildReviewResult(sampleCases[0], "reviewer-1", "session-1");
  const result = await withTempJsonFile(JSON.stringify(review), (filePath) =>
    runCli([filePath]),
  );

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /Validation: PASS/);
  assert.match(result.stdout, /Schema version: review_result\.v0\.1/);
  assert.match(result.stdout, /Review result count: 1/);
  assert.match(result.stdout, /Reviewers: revi\.\.\.er-1 \(sess\.\.\.on-1\)/);
  assert.match(result.stdout, /Verdict distribution: supported: 1/);
  assert.match(result.stdout, /Compatibility status: compatible \(single result\)/);
  assert.match(result.stdout, /Missing required metadata count: 0/);
  assert.equal(result.stderr, "");
});

test("semantic warnings keep ReviewResult preflight validation passing", async () => {
  const review = buildReviewResult(sampleCases[0], "reviewer-1", "session-1", {
    finalVerdict: "needs_better_evidence",
    failureModes: [],
  });
  const result = await withTempJsonFile(JSON.stringify(review), (filePath) =>
    runCli([filePath]),
  );

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /Validation: PASS/);
  assert.match(result.stdout, /Warnings: 1/);
  assert.match(
    result.stdout,
    /semantic\.needs_better_evidence_without_failure_modes/,
  );
  assert.equal(result.stderr, "");
});

test("valid ReviewResult bundle passes and prints inspection summary", async () => {
  const caseFile = sampleCases[0];
  const r1 = buildReviewResult(caseFile, "reviewer-1", "session-1", { finalVerdict: "supported" });
  const r2 = buildReviewResult(caseFile, "reviewer-2", "session-2", { finalVerdict: "uncertain" });
  const bundle = createReviewResultBundleV01({
    reviewResults: [r1, r2],
    bundleId: "bundle-1",
    createdAt: "2026-06-21T16:00:00.000Z",
  });

  const result = await withTempJsonFile(serializeReviewResultBundleV01(bundle), (filePath) =>
    runCli([filePath]),
  );

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /Validation: PASS/);
  assert.match(result.stdout, /Schema version: review_result_bundle\.v0\.1/);
  assert.match(result.stdout, /Review result count: 2/);
  assert.match(result.stdout, /Verdict distribution: supported: 1, uncertain: 1/);
  assert.match(result.stdout, /Compatibility status: compatible/);
  assert.match(result.stdout, /Missing required metadata count: 0/);
  assert.equal(result.stderr, "");
});

test("valid quick disposition JSON passes and prints inspection summary", async () => {
  const quickDisposition = buildQuickDispositionExportV01({
    caseFile: sampleCases[0],
    exportTimestamp: "2026-06-24T12:00:00.000Z",
    sourceStage: "case_file",
    disposition: "save_for_later",
    reasonCodes: ["needs_later_review"],
  });

  const result = await withTempJsonFile(
    JSON.stringify(quickDisposition),
    (filePath) => runCli([filePath]),
  );

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /Validation: PASS/);
  assert.match(result.stdout, /Schema version: quick_disposition\.v0\.1/);
  assert.match(result.stdout, /Artifact type: QuickDisposition/);
  assert.match(result.stdout, /Quick disposition count: 1/);
  assert.match(result.stdout, /Disposition distribution: save_for_later: 1/);
  assert.match(result.stdout, /Review result count: 0/);
  assert.equal(result.stderr, "");
});

test("invalid ReviewResult JSON fails validation and exits nonzero", async () => {
  const review = buildReviewResult(sampleCases[0], "reviewer-1", "session-1");
  // Mutate decisions.final_verdict to be invalid
  const invalidReview = {
    ...review,
    decisions: {
      ...review.decisions,
      final_verdict: "totally-invented-verdict",
    },
  };

  const result = await withTempJsonFile(JSON.stringify(invalidReview), (filePath) =>
    runCli([filePath]),
  );

  assert.notEqual(result.exitCode, 0);
  assert.match(result.stderr, /Validation: FAIL/);
  assert.match(result.stderr, /\$\.decisions\.final_verdict/);
  assert.match(result.stderr, /unsupported_value/);
});

test("invalid ReviewResult bundle JSON fails validation and exits nonzero", async () => {
  const caseFile = sampleCases[0];
  const r1 = buildReviewResult(caseFile, "reviewer-1", "session-1");
  const bundle = createReviewResultBundleV01({
    reviewResults: [r1],
    bundleId: "bundle-1",
    createdAt: "2026-06-21T16:00:00.000Z",
  });

  // Mutate bundle to have invalid format
  const invalidBundle = {
    ...bundle,
    review_results: [
      {
        ...r1,
        decisions: {
          ...r1.decisions,
          final_verdict: "invalid-verdict",
        },
      },
    ],
  };

  const result = await withTempJsonFile(JSON.stringify(invalidBundle), (filePath) =>
    runCli([filePath]),
  );

  assert.notEqual(result.exitCode, 0);
  assert.match(result.stderr, /Validation: FAIL/);
  assert.match(result.stderr, /invalid_review_result/);
  assert.match(result.stderr, /final_verdict/);
});

test("incompatible bundle elements fail validation and exit nonzero", async () => {
  const r1 = buildReviewResult(sampleCases[0], "reviewer-1", "session-1");
  // Build a review result for a different package ID (using a copy or mock package ID)
  const r2Base = buildReviewResult(sampleCases[0], "reviewer-2", "session-2");
  const r2 = {
    ...r2Base,
    review_id: "review:different-package-id:reviewer-2:session-2:2026-06-21T15:00:00.000Z",
    case_package: {
      ...r2Base.case_package,
      package_id: "different-package-id",
    },
  };

  // We manually construct a bundle that contains different package IDs
  const incompatibleBundle = {
    schema_version: "review_result_bundle.v0.1",
    metadata: {
      bundle_id: "bundle-incompatible",
      created_at: "2026-06-21T16:00:00.000Z",
      source_application: "telemetry_court",
      format: "local_json",
      review_result_count: 2,
    },
    compatibility: {
      review_result_schema_version: "review_result.v0.1",
      review_protocol_version: "telemetry_court_review.v0.1",
      case_package_schema_version: "case_package.v0.1",
    },
    review_results: [r1, r2],
  };

  const result = await withTempJsonFile(JSON.stringify(incompatibleBundle), (filePath) =>
    runCli([filePath]),
  );

  assert.notEqual(result.exitCode, 0);
  assert.match(result.stderr, /Validation: FAIL/);
  assert.match(result.stderr, /must contain results for one compatible CasePackage ID/);
});

test("invalid JSON exits nonzero before validation", async () => {
  const result = await withTempJsonFile("{invalid-json", (filePath) => runCli([filePath]));

  assert.notEqual(result.exitCode, 0);
  assert.match(result.stderr, /Reason: Invalid JSON/);
  assert.match(result.stderr, /Validation: FAIL/);
});

test("missing file exits nonzero with readable error", async () => {
  const result = await runCli(["/tmp/missing-review-results-file.json"]);

  assert.notEqual(result.exitCode, 0);
  assert.match(result.stderr, /Reason: File not found/);
  assert.match(result.stderr, /missing-review-results-file\.json/);
});

test("wrong argument count exits nonzero with usage error", async () => {
  const resultNoArgs = await runCli([]);
  const resultTooManyArgs = await runCli(["file1.json", "file2.json"]);

  assert.notEqual(resultNoArgs.exitCode, 0);
  assert.match(resultNoArgs.stderr, /Reason: CLI usage error/);
  assert.match(resultNoArgs.stderr, /Usage:/);

  assert.notEqual(resultTooManyArgs.exitCode, 0);
  assert.match(resultTooManyArgs.stderr, /Reason: CLI usage error/);
  assert.match(resultTooManyArgs.stderr, /Usage:/);
});

test("unsupported schema version exits nonzero", async () => {
  const badSchema = {
    schema_version: "review_result.v9.9",
  };

  const result = await withTempJsonFile(JSON.stringify(badSchema), (filePath) =>
    runCli([filePath]),
  );

  assert.notEqual(result.exitCode, 0);
  assert.match(result.stderr, /Reason: Invalid format/);
  assert.match(result.stderr, /Unsupported or missing schema_version/);
});

test("validation reads only the supplied file and does not require raw telemetry or CasePackage fixtures", async () => {
  const review = buildReviewResult(sampleCases[0], "reviewer-1", "session-1");
  const readPaths: string[] = [];
  const exitCode = await runValidateReviewResultsCli({
    argv: ["review-result.json"],
    cwd: "/approved/review-workspace",
    readFile: async (filePath) => {
      readPaths.push(filePath);
      return JSON.stringify(review);
    },
  });

  assert.equal(exitCode, 0);
  assert.deepEqual(readPaths, [resolve("/approved/review-workspace", "review-result.json")]);
});
