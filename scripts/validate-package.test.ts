import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

import { minimalSyntheticCasePackageV01 } from "@/lib/casePackageV01Fixture";
import type { CasePackageV01 } from "@/lib/types";
import { runValidatePackageCli } from "@/scripts/validate-package";

type CliResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

async function withTempJsonFile(
  contents: string,
  callback: (filePath: string) => Promise<CliResult>,
): Promise<CliResult> {
  const directory = await mkdtemp(join(tmpdir(), "tc-case-package-cli-"));
  const filePath = join(directory, "case-package.json");

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
  const exitCode = await runValidatePackageCli({
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

function createSanitizedControlledPackage(): CasePackageV01 {
  const fixture = structuredClone(minimalSyntheticCasePackageV01);

  return {
    ...fixture,
    case: {
      ...fixture.case,
      reviewable_status: "reviewable",
      limitations: [
        "Sanitized summaries only; raw restricted telemetry remains upstream.",
      ],
    },
    dataset: {
      ...fixture.dataset,
      data_classification: "sanitized",
      source_environment: "authorized-research-environment",
      approved_use: "Approved evidence review using sanitized summaries.",
      approval_notes: "Approval is recorded in sanitization.review_approval.",
      limitations: ["No raw restricted telemetry is included."],
    },
    provenance: {
      ...fixture.provenance,
      source_system: "approved-upstream-notebook",
      source_artifact: "artifact-sanitized-cluster-001",
      generating_tool: "case-package-export-notebook",
      adapter_name: "sanitized-case-package-adapter",
      adapter_version: "0.1.0",
      references: [
        {
          reference_id: "ref-sanitized-upstream-run",
          reference_type: "source_artifact_id",
          artifact_id: "artifact-sanitized-cluster-001",
        },
      ],
    },
    sanitization: {
      status: "sanitized",
      method:
        "Derived feature summaries with direct identifiers removed upstream.",
      redaction_notes: [
        "Account, principal, host, network, and event identifiers were removed.",
      ],
      allowed_display_level: "summary_only",
      raw_drilldown_allowed: false,
      safe_reference_type: "source_artifact_id",
      review_approval: {
        status: "approved",
        approved_by: "data-governance-team",
        approved_at: "2026-06-20T11:59:00.000Z",
        scope: "Telemetry Court review of this sanitized package revision.",
        reference: {
          reference_id: "ref-sanitized-review-approval",
          reference_type: "source_artifact_id",
          artifact_id: "approval-sanitized-cluster-001",
        },
      },
    },
    evidence_items: fixture.evidence_items.map((evidenceItem) => ({
      ...evidenceItem,
      sanitization_status: "sanitized",
      source_reference: {
        ...evidenceItem.source_reference,
        safe_reference: {
          reference_id: `ref-${evidenceItem.evidence_id}`,
          reference_type: "source_artifact_id",
          artifact_id: `artifact-sanitized-cluster-001/${evidenceItem.evidence_id}`,
        },
      },
    })),
  };
}

test("valid synthetic package JSON passes and prints synthetic posture", async () => {
  const result = await withTempJsonFile(
    JSON.stringify(minimalSyntheticCasePackageV01),
    (filePath) => runCli([filePath]),
  );

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /Validation: PASS/);
  assert.match(result.stdout, /Package posture: synthetic demo/);
  assert.match(result.stdout, /Schema version: case_package\.v0\.1/);
  assert.match(result.stdout, /Package ID: pkg-synthetic-cloudtrail-iam-001/);
  assert.match(result.stdout, /Evidence items: 3/);
  assert.equal(result.stderr, "");
});

test("valid controlled sanitized package passes with required approval metadata", async () => {
  const result = await withTempJsonFile(
    JSON.stringify(createSanitizedControlledPackage()),
    (filePath) => runCli([filePath]),
  );

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /Validation: PASS/);
  assert.match(result.stdout, /Package posture: sanitized\/controlled/);
  assert.match(result.stdout, /Approval status: approved/);
  assert.match(
    result.stdout,
    /Approval scope: Telemetry Court review of this sanitized package revision\./,
  );
  assert.match(result.stdout, /Adapter: sanitized-case-package-adapter 0\.1\.0/);
});

test("missing controlled approval metadata fails with validation path and code", async () => {
  const input = createSanitizedControlledPackage();
  delete input.sanitization.review_approval;

  const result = await withTempJsonFile(JSON.stringify(input), (filePath) =>
    runCli([filePath]),
  );

  assert.notEqual(result.exitCode, 0);
  assert.match(result.stderr, /Validation: FAIL/);
  assert.match(result.stderr, /Package posture: invalid\/unknown/);
  assert.match(result.stderr, /\$\.sanitization\.review_approval/);
  assert.match(result.stderr, /missing_required_field/);
});

test("invalid JSON exits nonzero before package validation", async () => {
  const result = await withTempJsonFile("{not-json", (filePath) =>
    runCli([filePath]),
  );

  assert.notEqual(result.exitCode, 0);
  assert.match(result.stderr, /Invalid JSON/);
  assert.match(result.stderr, /Validation: FAIL/);
});

test("missing package file exits nonzero with a readable error", async () => {
  const result = await runCli(["/tmp/telemetry-court-missing-package.json"]);

  assert.notEqual(result.exitCode, 0);
  assert.match(result.stderr, /File not found/);
  assert.match(result.stderr, /telemetry-court-missing-package\.json/);
});

test("usage requires exactly one CasePackage JSON path", async () => {
  const missingArgument = await runCli([]);
  const extraArgument = await runCli(["one.json", "two.json"]);

  assert.notEqual(missingArgument.exitCode, 0);
  assert.notEqual(extraArgument.exitCode, 0);
  assert.match(missingArgument.stderr, /Usage:/);
  assert.match(extraArgument.stderr, /exactly one CasePackage JSON path/);
});

test("validation reads only the supplied package file and never follows safe references", async () => {
  const input = createSanitizedControlledPackage();
  input.provenance.references = [
    {
      reference_id: "ref-safe-audit-pointer",
      reference_type: "source_artifact_id",
      artifact_id: "approved-upstream-artifact-not-read-by-cli",
      uri: "safe-audit://approved-upstream-artifact-not-read-by-cli",
    },
  ];

  let stdout = "";
  let stderr = "";
  const readPaths: string[] = [];
  const exitCode = await runValidatePackageCli({
    argv: ["case-package.json"],
    cwd: "/approved/review-workspace",
    readFile: async (filePath) => {
      readPaths.push(filePath);
      return JSON.stringify(input);
    },
    writeStdout: (value) => {
      stdout += value;
    },
    writeStderr: (value) => {
      stderr += value;
    },
  });

  assert.equal(exitCode, 0);
  assert.deepEqual(readPaths, [
    resolve("/approved/review-workspace", "case-package.json"),
  ]);
  assert.match(stdout, /Validation: PASS/);
  assert.equal(stderr, "");
});
