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
type CliInputFlag = "--input";
type CliOutputFlag = "--out" | "--output";
type CliRecognizedFlag = CliInputFlag | CliOutputFlag;
type CliFlagValue<TFlag extends CliRecognizedFlag> = {
  flag: TFlag;
  value: string;
};

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

  const cliArguments = parseCliArguments(argv);
  if (!cliArguments.ok) {
    writeStderr(cliArguments.message);
    return 2;
  }

  const suppliedInputPath = cliArguments.inputPath;
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

  if (cliArguments.outPath) {
    const resolvedOutPath = resolve(cwd, cliArguments.outPath);
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

function parseCliArguments(
  argv: string[],
):
  | { ok: true; inputPath: string; outPath?: string }
  | { ok: false; message: string } {
  let state: {
    positionalInputPaths: string[];
    inputFlagValues: CliFlagValue<CliInputFlag>[];
    outputFlagValues: CliFlagValue<CliOutputFlag>[];
  } = {
    positionalInputPaths: [],
    inputFlagValues: [],
    outputFlagValues: [],
  };

  let index = 0;
  while (index < argv.length) {
    const arg = argv[index];

    if (arg === "--input") {
      const optionValue = readCliOptionValue(argv, index, arg);
      if (!optionValue.ok) {
        return optionValue;
      }
      state = {
        ...state,
        inputFlagValues: [
          ...state.inputFlagValues,
          { flag: arg, value: optionValue.value },
        ],
      };
      index = optionValue.nextIndex;
      continue;
    }

    if (arg === "--out" || arg === "--output") {
      const optionValue = readCliOptionValue(argv, index, arg);
      if (!optionValue.ok) {
        return optionValue;
      }
      state = {
        ...state,
        outputFlagValues: [
          ...state.outputFlagValues,
          { flag: arg, value: optionValue.value },
        ],
      };
      index = optionValue.nextIndex;
      continue;
    }

    state = {
      ...state,
      positionalInputPaths: [...state.positionalInputPaths, arg],
    };
    index += 1;
  }

  if (
    state.inputFlagValues.length === 0 &&
    state.positionalInputPaths.length !== 1
  ) {
    return {
      ok: false,
      message: formatUsageError(state.positionalInputPaths.length),
    };
  }

  const inputPathValues = [
    ...state.positionalInputPaths,
    ...state.inputFlagValues.map(({ value }) => value),
  ];
  if (inputPathValues.length === 0) {
    return { ok: false, message: formatUsageError(0) };
  }
  if (inputPathValues.length > 1) {
    return {
      ok: false,
      message: formatAmbiguousPathError("input", inputPathValues),
    };
  }

  const outputPathValues = state.outputFlagValues.map(({ value }) => value);
  if (outputPathValues.length > 1) {
    return {
      ok: false,
      message: formatAmbiguousPathError("output", outputPathValues),
    };
  }

  return {
    ok: true,
    inputPath: inputPathValues[0],
    outPath: outputPathValues[0],
  };
}

function readCliOptionValue(
  argv: string[],
  optionIndex: number,
  flag: CliRecognizedFlag,
):
  | { ok: true; value: string; nextIndex: number }
  | { ok: false; message: string } {
  const value = argv[optionIndex + 1];
  if (!value || isRecognizedCliFlag(value)) {
    return {
      ok: false,
      message: `Error: ${flag} option requires a file path.\n`,
    };
  }

  return { ok: true, value, nextIndex: optionIndex + 2 };
}

function isRecognizedCliFlag(value: string): value is CliRecognizedFlag {
  return value === "--input" || value === "--out" || value === "--output";
}

function formatUsageError(inputPathCount: number): string {
  return [
    "Adapter CLI: FAIL",
    "Reason: CLI usage error",
    `Received ${inputPathCount} input draft JSON path${
      inputPathCount === 1 ? "" : "s"
    }; expected exactly one input draft JSON path.`,
    ...formatUsageLines(),
    "",
  ].join("\n");
}

function formatAmbiguousPathError(
  pathKind: "input" | "output",
  pathValues: string[],
): string {
  const uniquePathCount = new Set(pathValues).size;
  const reason =
    uniquePathCount === 1
      ? `Duplicate ${pathKind} path`
      : `Conflicting ${pathKind} paths`;
  const inputGuidance =
    "Use either one positional input path or one --input path, not both.";
  const outputGuidance = "Use only one output flag: --out or --output.";

  return [
    "Adapter CLI: FAIL",
    `Reason: ${reason}`,
    `Received ${pathValues.length} ${pathKind} path${
      pathValues.length === 1 ? "" : "s"
    }.`,
    pathKind === "input" ? inputGuidance : outputGuidance,
    ...formatUsageLines(),
    "",
  ].join("\n");
}

function formatUsageLines(): string[] {
  return [
    "Usage:",
    "  npm run sanitized-case-package-adapter-v01 -- path/to/draft.json [--out path/to/output.json]",
    "  npm run sanitized-case-package-adapter-v01 -- --input path/to/draft.json [--output path/to/output.json]",
  ];
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
