import { readFile as readTextFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  type CasePackageValidationError,
  validateCasePackageV01,
} from "@/lib/casePackageValidation";
import {
  inspectCasePackageV01,
  type CasePackageInspectionSummary,
} from "@/lib/casePackageInspection";

type WriteOutput = (value: string) => void;
type ReadFile = (filePath: string) => Promise<string>;

export type ValidatePackageCliOptions = {
  argv?: string[];
  cwd?: string;
  readFile?: ReadFile;
  writeStdout?: WriteOutput;
  writeStderr?: WriteOutput;
};

export async function runValidatePackageCli(
  options: ValidatePackageCliOptions = {},
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
  const packagePath = resolve(cwd, suppliedPath);
  const readResult = await readPackageJson(packagePath, readFile);

  if (!readResult.ok) {
    writeStderr(formatReadFailure(packagePath, readResult));
    return 1;
  }

  const parseResult = parsePackageJson(readResult.contents);

  if (!parseResult.ok) {
    writeStderr(formatJsonFailure(packagePath, parseResult.message));
    return 1;
  }

  const validationResult = validateCasePackageV01(parseResult.value);

  if (!validationResult.ok) {
    writeStderr(formatValidationFailure(packagePath, validationResult.errors));
    return 1;
  }

  writeStdout(
    formatValidationSuccess(
      packagePath,
      inspectCasePackageV01(validationResult.package),
    ),
  );
  return 0;
}

async function readDefaultFile(filePath: string): Promise<string> {
  return readTextFile(filePath, "utf8");
}

async function readPackageJson(
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

function parsePackageJson(
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

function formatUsageError(argumentCount: number): string {
  return [
    "Validation: FAIL",
    "Reason: CLI usage error",
    `Received ${argumentCount} path argument${
      argumentCount === 1 ? "" : "s"
    }; expected exactly one CasePackage JSON path.`,
    "Usage: npm run validate-package -- path/to/case-package.json",
    "This utility validates CasePackage JSON only. It does not read raw telemetry or follow safe references.",
    "",
  ].join("\n");
}

function formatReadFailure(
  filePath: string,
  failure: { reason: "missing_file" | "unreadable_file"; message: string },
): string {
  const title =
    failure.reason === "missing_file" ? "File not found" : "File unreadable";

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

function formatValidationFailure(
  filePath: string,
  errors: CasePackageValidationError[],
): string {
  return [
    "Validation: FAIL",
    `Path: ${filePath}`,
    "Package posture: invalid/unknown",
    `Errors: ${errors.length}`,
    ...errors.map(formatValidationError),
    "",
  ].join("\n");
}

function formatValidationError(error: CasePackageValidationError): string {
  return `- ${error.path} [${error.code}] ${error.message}`;
}

function formatValidationSuccess(
  filePath: string,
  summary: CasePackageInspectionSummary,
): string {
  return [
    "Validation: PASS",
    `Path: ${filePath}`,
    `Schema version: ${summary.schemaVersion}`,
    `Package ID: ${formatMaybeRevision(
      summary.packageId,
      summary.packageRevision,
    )}`,
    `Case ID: ${summary.caseId}`,
    `Reviewable status: ${summary.reviewableStatus}`,
    `Package posture: ${summary.packagePosture}`,
    `Dataset classification: ${summary.datasetClassification}`,
    `Sanitization status: ${summary.sanitizationStatus}`,
    `Approval status: ${summary.approvalStatus}`,
    summary.approvalScope ? `Approval scope: ${summary.approvalScope}` : null,
    `Pipeline: ${formatNameAndVersion(
      summary.pipelineName,
      summary.pipelineVersion,
    )}`,
    summary.adapterName
      ? `Adapter: ${formatNameAndVersion(
          summary.adapterName,
          summary.adapterVersion,
        )}`
      : "Adapter: not provided",
    `Evidence items: ${summary.evidenceCount}`,
    `Claims: ${summary.claimCount}`,
    `Candidate labels: ${summary.candidateLabelCount}`,
    `Representative sessions: ${summary.representativeSessionCount}`,
    "",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

function formatMaybeRevision(packageId: string, revision: string | undefined) {
  return revision ? `${packageId} (${revision})` : packageId;
}

function formatNameAndVersion(name: string, version: string | undefined) {
  return version ? `${name} ${version}` : name;
}

function hasNodeErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === code
  );
}

function isDirectRun(): boolean {
  return Boolean(
    process.argv[1] &&
      resolve(process.argv[1]) === fileURLToPath(import.meta.url),
  );
}

if (isDirectRun()) {
  void runValidatePackageCli().then((exitCode) => {
    process.exitCode = exitCode;
  });
}
