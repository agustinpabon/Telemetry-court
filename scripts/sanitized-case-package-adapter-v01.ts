import { readFile as readTextFile, writeFile as writeTextFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { validateCasePackageV01 } from "@/lib/casePackageValidation";
import {
  buildCasePackageV01FromSanitizedAdapterDraft,
  SanitizedCasePackageAdapterV01Error,
  type SanitizedAdapterDraftInput,
} from "@/lib/sanitizedCasePackageAdapterV01";

type WriteOutput = (value: string) => void;
type ReadFile = (filePath: string) => Promise<string>;
type WriteFile = (filePath: string, content: string) => Promise<void>;

export type SanitizedCasePackageAdapterCliOptions = {
  argv?: string[];
  cwd?: string;
  readFile?: ReadFile;
  writeFile?: WriteFile;
  writeStdout?: WriteOutput;
  writeStderr?: WriteOutput;
};

export async function runSanitizedCasePackageAdapterCli(
  options: SanitizedCasePackageAdapterCliOptions = {},
): Promise<number> {
  const argv = options.argv ?? process.argv.slice(2);
  const cwd = options.cwd ?? process.cwd();
  const readFile = options.readFile ?? readDefaultFile;
  const writeFile = options.writeFile ?? writeDefaultFile;
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

  // Extract --out argument if present
  const args = [...argv];
  let outPath: string | undefined;
  const outIndex = args.indexOf("--out");
  if (outIndex !== -1) {
    if (outIndex + 1 >= args.length) {
      writeStderr("Error: --out option requires a file path.\n");
      return 2;
    }
    outPath = args[outIndex + 1];
    args.splice(outIndex, 2);
  }

  if (args.length !== 1) {
    writeStderr(formatUsageError(argv.length));
    return 2;
  }

  const suppliedInputPath = args[0];
  const inputPath = resolve(cwd, suppliedInputPath);

  const readResult = await readJsonFile(inputPath, readFile);
  if (!readResult.ok) {
    writeStderr(formatReadFailure(inputPath, readResult));
    return 1;
  }

  const parseResult = parseJson(readResult.contents);
  if (!parseResult.ok) {
    writeStderr(formatJsonFailure(inputPath, parseResult.message));
    return 1;
  }

  // Map the draft to CasePackageV01
  let mappedPackage;
  try {
    mappedPackage = buildCasePackageV01FromSanitizedAdapterDraft(parseResult.value as SanitizedAdapterDraftInput);
  } catch (error) {
    if (error instanceof SanitizedCasePackageAdapterV01Error) {
      writeStderr("Adapter mapping: FAIL\n");
      writeStderr("Reason: Invalid sanitized CasePackage adapter draft\n");
      writeStderr(`Issues: ${error.issues.length}\n`);
      for (const issue of error.issues) {
        writeStderr(`- ${issue.path}: ${issue.message}\n`);
      }
      return 1;
    }
    const message = error instanceof Error ? error.message : String(error);
    writeStderr(`Adapter mapping: FAIL\nReason: Mapping error\nDetail: ${message}\n`);
    return 1;
  }

  // Validate the mapped package
  const validationResult = validateCasePackageV01(mappedPackage);
  if (!validationResult.ok) {
    writeStderr("Validation: FAIL\n");
    writeStderr("Package posture: invalid/unknown\n");
    writeStderr(`Errors: ${validationResult.errors.length}\n`);
    for (const validationError of validationResult.errors) {
      writeStderr(`- ${validationError.path} [${validationError.code}] ${validationError.message}\n`);
    }
    return 1;
  }

  // Format the output JSON
  const outputJson = JSON.stringify(validationResult.package, null, 2) + "\n";

  if (outPath) {
    const resolvedOutPath = resolve(cwd, outPath);
    try {
      await writeFile(resolvedOutPath, outputJson);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      writeStderr(`Error: Failed to write output file at ${resolvedOutPath}\nDetail: ${message}\n`);
      return 1;
    }
  } else {
    writeStdout(outputJson);
  }

  return 0;
}

async function readDefaultFile(filePath: string): Promise<string> {
  return readTextFile(filePath, "utf8");
}

async function writeDefaultFile(filePath: string, content: string): Promise<void> {
  await writeTextFile(filePath, content, "utf8");
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

function formatUsageError(argumentCount: number): string {
  return [
    "Adapter CLI: FAIL",
    "Reason: CLI usage error",
    `Received ${argumentCount} positional argument${
      argumentCount === 1 ? "" : "s"
    }; expected exactly one input draft JSON path.`,
    "Usage: npm run sanitized-case-package-adapter-v01 -- path/to/draft.json [--out path/to/output.json]",
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
    "Adapter CLI: FAIL",
    `Reason: ${title}`,
    `Path: ${filePath}`,
    `Detail: ${failure.message}`,
    "",
  ].join("\n");
}

function formatJsonFailure(filePath: string, message: string): string {
  return [
    "Adapter CLI: FAIL",
    "Reason: Invalid JSON",
    `Path: ${filePath}`,
    `Detail: ${message}`,
    "",
  ].join("\n");
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
    process.argv[1] &&
      resolve(process.argv[1]) === fileURLToPath(import.meta.url),
  );
}

if (isDirectRun()) {
  void runSanitizedCasePackageAdapterCli().then((exitCode) => {
    process.exitCode = exitCode;
  });
}
