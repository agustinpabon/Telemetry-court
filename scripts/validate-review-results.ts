import { readFile as readTextFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  type ReviewResultValidationErrorV01,
  validateReviewResultV01,
} from "@/lib/reviewResultValidationV01";
import {
  importReviewResultBundleV01Json,
  type ReviewResultBundleV01,
} from "@/lib/reviewResultBundleV01";
import type { ReviewResultV01 } from "@/lib/reviewResultV01";

type WriteOutput = (value: string) => void;
type ReadFile = (filePath: string) => Promise<string>;

export type ValidateReviewResultsCliOptions = {
  argv?: string[];
  cwd?: string;
  readFile?: ReadFile;
  writeStdout?: WriteOutput;
  writeStderr?: WriteOutput;
};

type ReviewInspectionSummary = {
  schemaVersion: string;
  protocolVersion: string;
  resultCount: number;
  reviewers: string[];
  casePackageIds: string[];
  casePackageSchemaVersions: string[];
  verdictDistribution: Record<string, number>;
  confidenceDistribution: Record<string, number>;
  failureModeCounts: Record<string, number>;
  compatibilityStatus: string;
  missingRequiredMetadataCount: number;
};

export async function runValidateReviewResultsCli(
  options: ValidateReviewResultsCliOptions = {},
): Promise<number> {
  const argv = options.argv ?? process.argv.slice(2);
  const cwd = options.cwd ?? process.cwd();
  const readFile = options.readFile ?? readDefaultFile;
  const writeStdout =
    options.writeStdout ??
    ((value) => {
      process.stdout.write(value);
    });
  const writeStderr =
    options.writeStderr ??
    ((value) => {
      process.stderr.write(value);
    });

  if (argv.length !== 1) {
    writeStderr(formatUsageError(argv.length));
    return 2;
  }

  const suppliedPath = argv[0];
  const filePath = resolve(cwd, suppliedPath);
  const readResult = await readJsonFile(filePath, readFile);

  if (!readResult.ok) {
    writeStderr(formatReadFailure(filePath, readResult));
    return 1;
  }

  const parseResult = parseJson(readResult.contents);
  if (!parseResult.ok) {
    writeStderr(formatJsonFailure(filePath, parseResult.message));
    return 1;
  }

  const parsedValue = parseResult.value;
  if (!isObjectRecord(parsedValue)) {
    writeStderr(formatInvalidFormatFailure(filePath, "JSON root must be an object."));
    return 1;
  }

  const schemaVersion = String(parsedValue.schema_version);

  if (schemaVersion === "review_result.v0.1") {
    const validationResult = validateReviewResultV01(parsedValue);
    if (!validationResult.ok) {
      writeStderr(formatValidationFailure(filePath, validationResult.errors));
      return 1;
    }

    const summary = generateSingleResultSummary(validationResult.reviewResult);
    writeStdout(formatValidationSuccess(filePath, summary));
    return 0;
  } else if (schemaVersion === "review_result_bundle.v0.1") {
    const importResult = importReviewResultBundleV01Json(readResult.contents);
    if (!importResult.ok) {
      writeStderr(
        formatBundleValidationFailure(filePath, importResult.reason, importResult.message),
      );
      return 1;
    }

    const summary = generateBundleSummary(importResult.bundle);
    writeStdout(formatValidationSuccess(filePath, summary));
    return 0;
  } else {
    writeStderr(
      formatInvalidFormatFailure(
        filePath,
        `Unsupported or missing schema_version "${schemaVersion}". Expected "review_result.v0.1" or "review_result_bundle.v0.1".`,
      ),
    );
    return 1;
  }
}

async function readDefaultFile(filePath: string): Promise<string> {
  return readTextFile(filePath, "utf8");
}

async function readJsonFile(
  filePath: string,
  readFile: ReadFile,
): Promise<
  | { ok: true; contents: string }
  | { ok: false; reason: "missing_file" | "unreadable_file"; message: string }
> {
  try {
    return { ok: true, contents: await readFile(filePath) };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (hasNodeErrorCode(error, "ENOENT")) {
      return { ok: false, reason: "missing_file", message };
    }

    return { ok: false, reason: "unreadable_file", message };
  }
}

function parseJson(
  contents: string,
): { ok: true; value: unknown } | { ok: false; message: string } {
  try {
    return { ok: true, value: JSON.parse(contents) as unknown };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function truncateId(id: string): string {
  if (id.length <= 8) return id;
  return `${id.slice(0, 4)}...${id.slice(-4)}`;
}

function generateSingleResultSummary(result: ReviewResultV01): ReviewInspectionSummary {
  const reviewerSummary = `${truncateId(result.reviewer.reviewer_id)} (${truncateId(
    result.reviewer.review_session_id,
  )})`;

  const verdictDistribution: Record<string, number> = {
    [result.decisions.final_verdict]: 1,
  };

  const confidenceDistribution: Record<string, number> = {};
  if (result.decisions.confidence?.level) {
    confidenceDistribution[result.decisions.confidence.level] = 1;
  }

  const failureModeCounts: Record<string, number> = {};
  if (Array.isArray(result.decisions.failure_modes)) {
    for (const fm of result.decisions.failure_modes) {
      failureModeCounts[fm] = (failureModeCounts[fm] ?? 0) + 1;
    }
  }

  return {
    schemaVersion: result.schema_version,
    protocolVersion: result.protocol.protocol_version,
    resultCount: 1,
    reviewers: [reviewerSummary],
    casePackageIds: [result.case_package.package_id],
    casePackageSchemaVersions: [result.case_package.schema_version],
    verdictDistribution,
    confidenceDistribution,
    failureModeCounts,
    compatibilityStatus: "compatible (single result)",
    missingRequiredMetadataCount: 0,
  };
}

function generateBundleSummary(bundle: ReviewResultBundleV01): ReviewInspectionSummary {
  const uniqueReviewers = new Set<string>();
  const casePackageIds = new Set<string>();
  const casePackageSchemaVersions = new Set<string>();
  const verdictDistribution: Record<string, number> = {};
  const confidenceDistribution: Record<string, number> = {};
  const failureModeCounts: Record<string, number> = {};

  for (const r of bundle.review_results) {
    const pair = `${r.reviewer.reviewer_id}:${r.reviewer.review_session_id}`;
    uniqueReviewers.add(pair);

    casePackageIds.add(r.case_package.package_id);
    casePackageSchemaVersions.add(r.case_package.schema_version);

    const verdict = r.decisions.final_verdict;
    verdictDistribution[verdict] = (verdictDistribution[verdict] ?? 0) + 1;

    if (r.decisions.confidence?.level) {
      const conf = r.decisions.confidence.level;
      confidenceDistribution[conf] = (confidenceDistribution[conf] ?? 0) + 1;
    }

    if (Array.isArray(r.decisions.failure_modes)) {
      for (const fm of r.decisions.failure_modes) {
        failureModeCounts[fm] = (failureModeCounts[fm] ?? 0) + 1;
      }
    }
  }

  const reviewers = Array.from(uniqueReviewers).map((pair) => {
    const [revId, sesId] = pair.split(":");
    return `${truncateId(revId)} (${truncateId(sesId)})`;
  });

  return {
    schemaVersion: bundle.schema_version,
    protocolVersion: bundle.compatibility.review_protocol_version,
    resultCount: bundle.review_results.length,
    reviewers,
    casePackageIds: Array.from(casePackageIds).sort(),
    casePackageSchemaVersions: Array.from(casePackageSchemaVersions).sort(),
    verdictDistribution,
    confidenceDistribution,
    failureModeCounts,
    compatibilityStatus: "compatible",
    missingRequiredMetadataCount: 0,
  };
}

function formatUsageError(argumentCount: number): string {
  return [
    "Validation: FAIL",
    "Reason: CLI usage error",
    `Received ${argumentCount} path argument${
      argumentCount === 1 ? "" : "s"
    }; expected exactly one ReviewResult/Bundle JSON path.`,
    "Usage: npm run validate-review-results -- path/to/review-results.json",
    "This utility validates ReviewResult JSON or ReviewResultBundle JSON only. It does not create reports or read raw telemetry.",
    "",
  ].join("\n");
}

function formatReadFailure(
  filePath: string,
  failure: { reason: "missing_file" | "unreadable_file"; message: string },
): string {
  const title = failure.reason === "missing_file" ? "File not found" : "File unreadable";

  return [
    "Validation: FAIL",
    `Reason: ${title}`,
    `Path: ${filePath}`,
    `Detail: ${failure.message}`,
    "",
  ].join("\n");
}

function formatJsonFailure(filePath: string, message: string): string {
  return [
    "Validation: FAIL",
    "Reason: Invalid JSON",
    `Path: ${filePath}`,
    `Detail: ${message}`,
    "",
  ].join("\n");
}

function formatInvalidFormatFailure(filePath: string, message: string): string {
  return [
    "Validation: FAIL",
    "Reason: Invalid format",
    `Path: ${filePath}`,
    `Detail: ${message}`,
    "",
  ].join("\n");
}

function formatValidationFailure(filePath: string, errors: ReviewResultValidationErrorV01[]): string {
  return [
    "Validation: FAIL",
    `Path: ${filePath}`,
    `Errors: ${errors.length}`,
    ...errors.map((error) => `- ${error.path} [${error.code}] ${error.message}`),
    "",
  ].join("\n");
}

function formatBundleValidationFailure(filePath: string, reason: string, message: string): string {
  return [
    "Validation: FAIL",
    `Path: ${filePath}`,
    `Reason: ${reason}`,
    `Detail: ${message}`,
    "",
  ].join("\n");
}

function formatValidationSuccess(filePath: string, summary: ReviewInspectionSummary): string {
  const lines = [
    "Validation: PASS",
    `Path: ${filePath}`,
    `Schema version: ${summary.schemaVersion}`,
    `Protocol version: ${summary.protocolVersion}`,
    `Review result count: ${summary.resultCount}`,
    `Reviewers: ${summary.reviewers.join(", ")}`,
    `Case package IDs referenced: ${summary.casePackageIds.join(", ")}`,
    `Package schema versions referenced: ${summary.casePackageSchemaVersions.join(", ")}`,
    `Verdict distribution: ${formatDistribution(summary.verdictDistribution)}`,
  ];

  if (Object.keys(summary.confidenceDistribution).length > 0) {
    lines.push(`Confidence distribution: ${formatDistribution(summary.confidenceDistribution)}`);
  }

  if (Object.keys(summary.failureModeCounts).length > 0) {
    lines.push(`Failure mode counts: ${formatDistribution(summary.failureModeCounts)}`);
  }

  lines.push(`Compatibility status: ${summary.compatibilityStatus}`);
  lines.push(`Missing required metadata count: ${summary.missingRequiredMetadataCount}`);
  lines.push("");

  return lines.join("\n");
}

function formatDistribution(dist: Record<string, number>): string {
  return Object.entries(dist)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([key, count]) => `${key}: ${count}`)
    .join(", ");
}

function hasNodeErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as Record<string, unknown>).code === code
  );
}

function isDirectRun(): boolean {
  return Boolean(
    process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url),
  );
}

if (isDirectRun()) {
  void runValidateReviewResultsCli().then((exitCode) => {
    process.exitCode = exitCode;
  });
}