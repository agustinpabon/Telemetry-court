import {
  casePackageV01ToCaseFile,
  createCaseFileCompatibilitySeedFromCasePackageV01,
} from "@/lib/casePackageV01ToCaseFile";
import {
  validateCasePackageV01,
  type CasePackageValidationError,
} from "@/lib/casePackageValidation";
import type { CaseFile, CasePackageV01 } from "@/lib/types";

export type CasePackageImportFailureReason =
  | "invalid_json"
  | "invalid_case_package";

export type CasePackageImportResult =
  | {
      ok: true;
      caseFile: CaseFile;
      package: CasePackageV01;
    }
  | {
      ok: false;
      reason: CasePackageImportFailureReason;
      message: string;
      errors: CasePackageValidationError[];
    };

export function importCasePackageV01Json(
  jsonText: string,
): CasePackageImportResult {
  const parseResult = parseCasePackageJson(jsonText);

  if (!parseResult.ok) {
    return parseResult;
  }

  const validation = validateCasePackageV01(parseResult.value);

  if (!validation.ok) {
    return {
      ok: false,
      reason: "invalid_case_package",
      message: "Invalid case package. Review was not opened.",
      errors: validation.errors,
    };
  }

  const compatibilitySeed = createCaseFileCompatibilitySeedFromCasePackageV01(
    validation.package,
  );
  const adapterResult = casePackageV01ToCaseFile(
    validation.package,
    compatibilitySeed,
  );

  if (!adapterResult.ok) {
    return {
      ok: false,
      reason: "invalid_case_package",
      message: "Invalid case package. Review was not opened.",
      errors: adapterResult.errors,
    };
  }

  return {
    ok: true,
    package: validation.package,
    caseFile: adapterResult.caseFile,
  };
}

function parseCasePackageJson(
  jsonText: string,
):
  | { ok: true; value: unknown }
  | Extract<CasePackageImportResult, { ok: false }> {
  try {
    return { ok: true, value: JSON.parse(jsonText) as unknown };
  } catch {
    return {
      ok: false,
      reason: "invalid_json",
      message: "Invalid JSON. Review was not opened.",
      errors: [
        {
          path: "$",
          code: "invalid_json",
          message: "The selected file could not be parsed as JSON.",
        },
      ],
    };
  }
}
