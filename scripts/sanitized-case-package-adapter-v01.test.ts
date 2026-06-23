import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { runSanitizedCasePackageAdapterCli } from "@/scripts/sanitized-case-package-adapter-v01";
import type { SanitizedCasePackageAdapterDraftV01 } from "@/lib/sanitizedCasePackageAdapterV01";

function createValidSanitizedDraft(): SanitizedCasePackageAdapterDraftV01 {
  return {
    package_id: "pkg-sanitized-adapter-test",
    created_at: "2026-06-23T12:00:00.000Z",
    package_revision: "r1",
    case: {
      case_id: "case-sanitized-adapter-test",
      title: "Test sanitized setup review",
      summary: "Approved sanitized cluster draft test.",
      reviewable_status: "reviewable",
      review_intent: "validate_label",
      limitations: ["Sanitized summaries only."],
    },
    dataset: {
      dataset_id: "dataset-sanitized-test",
      dataset_name: "Sanitized Test Slice",
      dataset_type: "cloudtrail",
      data_classification: "sanitized",
      source_environment: "authorized-research-environment",
      approved_use: "Approved Telemetry Court review test.",
      limitations: ["No raw restricted telemetry is included."],
    },
    cluster: {
      cluster_id: "cluster-sanitized-test",
      cluster_name: "Test setup region",
      upstream_cluster_label: "Test setup",
      cluster_size: 10,
      embedding_map: {
        map_id: "map-sanitized-test",
        map_tool: "approved-upstream-projection",
        coordinate_space: "upstream-2d-v1",
        coordinates: { x: 0.1, y: 0.2 },
      },
      cluster_method: {
        method: "approved-upstream-density-clustering",
      },
    },
    pipeline: {
      pipeline_id: "pipeline-sanitized-test",
      run_id: "run-sanitized-test",
      upstream_tool: "approved-upstream-notebook",
      pipeline_version: "0.1.0",
      embedding_model: "approved-summary-embedding-v1",
      clustering_method: "approved-upstream-density-clustering",
      dimensionality_reduction_method: "approved-upstream-projection",
      naming_model: "approved-label-summarizer-v1",
      generated_at: "2026-06-23T11:58:00.000Z",
    },
    candidate_labels: [
      {
        label_id: "label-test-setup",
        label: "Test setup",
        source: "ai_generated",
        rank: 1,
        linked_claim_ids: ["claim-test-pattern"],
      },
    ],
    claims: [
      {
        claim_id: "claim-test-pattern",
        text: "The cluster contains test setup behavior.",
        claim_type: "behavioral_summary",
        linked_label_ids: ["label-test-setup"],
        evidence_status: "linked",
      },
    ],
    evidence_summaries: [
      {
        evidence_id: "evidence-test-summary",
        title: "Test summary",
        summary: "Approved test summary features.",
        evidence_type: "salient_feature",
        content: {
          content_type: "structured_summary",
          fields: {},
        },
        source_reference: {
          source_id: "source-test-features",
          source_type: "derived_feature_summary",
          safe_reference: {
            reference_id: "ref-test-features",
            reference_type: "source_artifact_id",
            artifact_id: "artifact-test-cluster/features",
          },
        },
      },
    ],
    claim_evidence_links: [
      {
        claim_id: "claim-test-pattern",
        evidence_id: "evidence-test-summary",
        relationship: "supports",
        expected_support: "supports",
      },
    ],
    representative_sessions: [],
    outlier_impostor_candidates: [],
    neighbor_clusters: [],
    provenance: {
      provenance_id: "prov-sanitized-test",
      source_system: "approved-upstream-notebook",
      source_artifact: "artifact-test-cluster",
      generating_tool: "sanitized-case-package-adapter-v01-test",
      generated_at: "2026-06-23T11:58:00.000Z",
      upstream_run_id: "run-sanitized-test",
      adapter_name: "sanitized-case-package-adapter-v01",
      adapter_version: "0.1.0",
      references: [
        {
          reference_id: "ref-sanitized-upstream-run",
          reference_type: "source_artifact_id",
          artifact_id: "artifact-test-cluster",
        },
      ],
      owner: {
        team: "Telemetry Court",
      },
    },
    sanitization: {
      status: "sanitized",
      method: "Approved derived summaries.",
      redaction_notes: [
        "Identifiers were replaced with opaque IDs before this draft was produced.",
      ],
      allowed_display_level: "summary_only",
      raw_drilldown_allowed: false,
      safe_reference_type: "source_artifact_id",
      review_approval: {
        status: "approved",
        approved_by: "data-governance-team",
        approved_at: "2026-06-23T11:59:00.000Z",
        scope: "Telemetry Court review test scope.",
        reference: {
          reference_id: "ref-test-approval",
          reference_type: "source_artifact_id",
          artifact_id: "approval-test-cluster",
        },
      },
    },
  };
}

type CliResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

async function withTempDir(
  callback: (tempDir: string) => Promise<CliResult>,
): Promise<CliResult> {
  const directory = await mkdtemp(join(tmpdir(), "tc-adapter-cli-test-"));
  try {
    return await callback(directory);
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
}

async function runCli(argv: string[], options: Partial<Parameters<typeof runSanitizedCasePackageAdapterCli>[0]> = {}): Promise<CliResult> {
  let stdout = "";
  let stderr = "";
  const exitCode = await runSanitizedCasePackageAdapterCli({
    argv,
    cwd: process.cwd(),
    writeStdout: (value) => {
      stdout += value;
    },
    writeStderr: (value) => {
      stderr += value;
    },
    ...options,
  });

  return { exitCode, stdout, stderr };
}

test("valid sanitized draft input produces valid CasePackageV01 output and prints to stdout by default", async () => {
  const draft = createValidSanitizedDraft();
  const draftStr = JSON.stringify(draft);

  const result = await withTempDir(async (tempDir) => {
    const inputPath = join(tempDir, "draft.json");
    await writeFile(inputPath, draftStr, "utf8");

    // Run CLI targeting stdout
    const res = await runCli([inputPath]);
    return res;
  });

  assert.equal(result.exitCode, 0);
  assert.equal(result.stderr, "");

  // Verify stdout is valid CasePackageV01
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.schema_version, "case_package.v0.1");
  assert.equal(parsed.package_id, "pkg-sanitized-adapter-test");
  assert.equal(parsed.cluster.cluster_id, "cluster-sanitized-test");
});

test("--out mode writes valid JSON and doesn't print package to stdout", async () => {
  const draft = createValidSanitizedDraft();
  const draftStr = JSON.stringify(draft);

  let writtenContent = "";
  const result = await withTempDir(async (tempDir) => {
    const inputPath = join(tempDir, "draft.json");
    const outputPath = join(tempDir, "output.json");
    await writeFile(inputPath, draftStr, "utf8");

    // Run CLI targeting output path
    const res = await runCli([inputPath, "--out", outputPath]);

    // Read the written file
    writtenContent = await readFile(outputPath, "utf8");
    return res;
  });

  assert.equal(result.exitCode, 0);
  assert.equal(result.stdout, "");
  assert.equal(result.stderr, "");

  const parsed = JSON.parse(writtenContent);
  assert.equal(parsed.schema_version, "case_package.v0.1");
  assert.equal(parsed.package_id, "pkg-sanitized-adapter-test");
});

test("invalid JSON exits nonzero and fails cleanly", async () => {
  const invalidJson = "{invalid-json";

  const result = await withTempDir(async (tempDir) => {
    const inputPath = join(tempDir, "draft.json");
    await writeFile(inputPath, invalidJson, "utf8");

    return await runCli([inputPath]);
  });

  assert.notEqual(result.exitCode, 0);
  assert.match(result.stderr, /Reason: Invalid JSON/);
  assert.equal(result.stdout, "");
});

test("missing input file fails cleanly with non-zero exit code", async () => {
  const result = await runCli(["/tmp/tc-nonexistent-draft-file.json"]);

  assert.notEqual(result.exitCode, 0);
  assert.match(result.stderr, /Reason: File not found/);
  assert.equal(result.stdout, "");
});

test("invalid draft fails preflight mapping validation cleanly and does not write output", async () => {
  const draft = createValidSanitizedDraft();
  // Remove required review approval to make mapping fail preflight check
  delete draft.sanitization.review_approval;
  const draftStr = JSON.stringify(draft);

  let outputWritten = false;
  const result = await withTempDir(async (tempDir) => {
    const inputPath = join(tempDir, "draft.json");
    const outputPath = join(tempDir, "output.json");
    await writeFile(inputPath, draftStr, "utf8");

    const res = await runCli([inputPath, "--out", outputPath]);

    try {
      await readFile(outputPath, "utf8");
      outputWritten = true;
    } catch {
      outputWritten = false;
    }

    return res;
  });

  assert.notEqual(result.exitCode, 0);
  assert.match(result.stderr, /Adapter mapping: FAIL/);
  assert.match(result.stderr, /\$\.sanitization\.review_approval: Non-synthetic sanitized/);
  assert.equal(result.stdout, "");
  assert.equal(outputWritten, false);
});

test("mapped package failing CasePackage validation fails cleanly and does not write output", async () => {
  const draft = createValidSanitizedDraft();
  // Use a draft value that maps successfully, then fails strict CasePackage validation.
  draft.dataset.dataset_type = "invalid_type" as unknown as "cloudtrail";
  const draftStr = JSON.stringify(draft);

  let outputWritten = false;
  const result = await withTempDir(async (tempDir) => {
    const inputPath = join(tempDir, "draft.json");
    const outputPath = join(tempDir, "output.json");
    await writeFile(inputPath, draftStr, "utf8");

    const res = await runCli([inputPath, "--out", outputPath]);

    try {
      await readFile(outputPath, "utf8");
      outputWritten = true;
    } catch {
      outputWritten = false;
    }

    return res;
  });

  assert.notEqual(result.exitCode, 0);
  assert.match(result.stderr, /Validation: FAIL/);
  assert.match(result.stderr, /\$\.dataset\.dataset_type/);
  assert.equal(result.stdout, "");
  assert.equal(outputWritten, false);
});

test("input file is never mutated", async () => {
  const draft = createValidSanitizedDraft();
  const draftStr = JSON.stringify(draft);

  let postRunInputStr = "";
  await withTempDir(async (tempDir) => {
    const inputPath = join(tempDir, "draft.json");
    await writeFile(inputPath, draftStr, "utf8");

    await runCli([inputPath]);

    postRunInputStr = await readFile(inputPath, "utf8");
    return { exitCode: 0, stdout: "", stderr: "" };
  });

  assert.equal(postRunInputStr, draftStr);
});

test("incorrect CLI usage fails with usage message", async () => {
  const resultNoArgs = await runCli([]);
  assert.notEqual(resultNoArgs.exitCode, 0);
  assert.match(resultNoArgs.stderr, /Reason: CLI usage error/);

  const resultTooManyArgs = await runCli(["one.json", "two.json"]);
  assert.notEqual(resultTooManyArgs.exitCode, 0);
  assert.match(resultTooManyArgs.stderr, /expected exactly one input draft JSON path/);
});
