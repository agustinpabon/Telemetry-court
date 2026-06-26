import { readFile as readTextFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  type ReviewResultValidationErrorV01,
  validateReviewResultV01,
} from "@/lib/reviewResultValidationV01";
import {
  type QuickDispositionValidationErrorV01,
  validateQuickDispositionV01,
} from "@/lib/quickDispositionV01";
import {
  importReviewResultBundleV01Json,
} from "@/lib/reviewResultBundleV01";
import {
  inspectQuickDispositionV01,
  type QuickDispositionImportInspectionSummaryV01,
} from "@/lib/quickDispositionInspectionV01";
import {
  inspectReviewResultBundleV01,
  inspectReviewResultV01,
  type ReviewResultImportInspectionSummaryV01,
  type ReviewResultInspectionCount,
  type ReviewResultReviewerInspectionReference,
} from "@/lib/reviewResultInspectionV01";

type WriteOutput = (value: string) => void;
type ReadFile = (filePath: string) => Promise<string>;

export type ValidateReviewResultsCliOptions = {
  argv?: string[];
  cwd?: string;
  readFile?: ReadFile;
  writeStdout?: WriteOutput;
  writeStderr?: WriteOutput;
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

    const summary = inspectReviewResultV01(validationResult.reviewResult);
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

    const summary = inspectReviewResultBundleV01(importResult.bundle);
    writeStdout(formatValidationSuccess(filePath, summary));
    return 0;
  } else if (schemaVersion === "quick_disposition.v0.1") {
    const validationResult = validateQuickDispositionV01(parsedValue);
    if (!validationResult.ok) {
      writeStderr(
        formatQuickDispositionValidationFailure(
          filePath,
          validationResult.errors,
        ),
      );
      return 1;
    }

    const summary = inspectQuickDispositionV01(
      validationResult.quickDisposition,
    );
    writeStdout(formatQuickDispositionValidationSuccess(filePath, summary));
    return 0;
  } else {
    writeStderr(
      formatInvalidFormatFailure(
        filePath,
        `Unsupported or missing schema_version "${schemaVersion}". Expected "review_result.v0.1", "review_result_bundle.v0.1", or "quick_disposition.v0.1".`,
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

function formatUsageError(argumentCount: number): string {
  return [
    "Validation: FAIL",
    "Reason: CLI usage error",
    `Received ${argumentCount} path argument${
      argumentCount === 1 ? "" : "s"
    }; expected exactly one ReviewResult, ReviewResultBundle, or QuickDisposition JSON path.`,
    "Usage: npm run validate-review-results -- path/to/review-results.json",
    "This utility validates ReviewResult JSON, ReviewResultBundle JSON, or QuickDisposition JSON only. It does not create reports or read raw telemetry.",
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

function formatQuickDispositionValidationFailure(
  filePath: string,
  errors: QuickDispositionValidationErrorV01[],
): string {
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

function formatValidationSuccess(
  filePath: string,
  summary: ReviewResultImportInspectionSummaryV01,
): string {
  const lines = [
    "Validation: PASS",
    `Path: ${filePath}`,
    `Schema version: ${summary.artifactSchemaVersion}`,
    `Protocol version: ${summary.reviewProtocolVersions.join(", ")}`,
    `Review result count: ${summary.resultCount}`,
    `Reviewers: ${formatReviewers(summary.reviewerSessions)}`,
    `Case package IDs referenced: ${summary.referencedPackageIds.join(", ")}`,
    `Package schema versions referenced: ${summary.casePackageSchemaVersions.join(", ")}`,
    `Verdict distribution: ${formatDistribution(summary.verdictDistribution)}`,
  ];

  if (summary.confidenceSummary.distribution.length > 0) {
    lines.push(
      `Confidence distribution: ${formatDistribution(summary.confidenceSummary.distribution)}`,
    );
  }

  if (summary.failureModeCounts.length > 0) {
    lines.push(`Failure mode counts: ${formatDistribution(summary.failureModeCounts)}`);
  }

  if (summary.warnings.length > 0) {
    lines.push(`Warnings: ${summary.warnings.length}`);
    lines.push(
      ...summary.warnings.map(
        (warning) =>
          `- ${warning.path} [${warning.code}] ${warning.message}`,
      ),
    );
  }

  lines.push(`Compatibility status: ${formatCompatibilityStatus(summary)}`);
  lines.push("Missing required metadata count: 0");
  lines.push("");

  return lines.join("\n");
}

function formatQuickDispositionValidationSuccess(
  filePath: string,
  summary: QuickDispositionImportInspectionSummaryV01,
): string {
  return [
    "Validation: PASS",
    `Path: ${filePath}`,
    `Artifact type: ${summary.artifactType}`,
    `Schema version: ${summary.artifactSchemaVersion}`,
    "Review result count: 0",
    `Quick disposition count: ${summary.resultCount}`,
    `Reviewers: ${formatReviewers(summary.reviewerSessions)}`,
    `Case package IDs referenced: ${summary.referencedPackageIds.join(", ")}`,
    `Package schema versions referenced: ${summary.casePackageSchemaVersions.join(", ")}`,
    `Source stages: ${summary.sourceStages.join(", ")}`,
    `Disposition distribution: ${formatDistribution(summary.dispositionDistribution)}`,
    `Reason code counts: ${formatDistribution(summary.reasonCodeCounts)}`,
    `Compatibility status: ${formatCompatibilityStatus(summary)}`,
    "Missing required metadata count: 0",
    "",
  ].join("\n");
}

function formatReviewers(
  reviewers: readonly ReviewResultReviewerInspectionReference[],
): string {
  return reviewers
    .map(
      (reviewer) =>
        `${truncateId(reviewer.reviewerId)} (${truncateId(reviewer.reviewSessionId)})`,
    )
    .join(", ");
}

function truncateId(id: string): string {
  if (id.length <= 8) return id;
  return `${id.slice(0, 4)}...${id.slice(-4)}`;
}

function formatDistribution(dist: readonly ReviewResultInspectionCount[]): string {
  return dist
    .map(({ value, count }) => `${value}: ${count}`)
    .join(", ");
}

function formatCompatibilityStatus(
  summary:
    | ReviewResultImportInspectionSummaryV01
    | QuickDispositionImportInspectionSummaryV01,
): string {
  return summary.artifactType === "ReviewResult"
    ? "compatible (single result)"
    : "compatible";
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
