import {
  casePackageV01ToCaseFile,
  createCaseFileCompatibilitySeedFromCasePackageV01,
} from "@/lib/casePackageV01ToCaseFile";
import {
  validateCasePackageV01,
  type CasePackageValidationError,
} from "@/lib/casePackageValidation";
import {
  CASE_PACKAGE_V01_SCHEMA_VERSION,
  type CaseFile,
  type CasePackageV01,
} from "@/lib/types";

export type CasePackageImportFailureReason =
  | "malformed_json"
  | "schema_version"
  | "validation"
  | "adapter_readiness";

export type CasePackageImportResult =
  | {
      ok: true;
      caseFile: CaseFile;
      package: CasePackageV01;
    }
  | {
      ok: false;
      reason: CasePackageImportFailureReason;
      title: string;
      summary: string;
      suggestedFix: string;
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
    return buildValidationFailure(validation.errors);
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
      reason: "adapter_readiness",
      title: "Review cannot start from this CasePackage yet",
      summary: formatErrorCountSummary(
        adapterResult.errors.length,
        "CasePackage validation passed, but the current review workflow found readiness gaps",
      ),
      suggestedFix:
        "Add the review-ready fields required by the current local workflow, such as an AI-generated candidate label, evidence, representative sessions, neighbor context, embedding coordinates, and available metrics.",
      message:
        "CasePackage validation passed, but review cannot start from this package yet.",
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
      reason: "malformed_json",
      title: "Malformed JSON",
      summary:
        "The selected file could not be parsed as JSON. Package validation did not run and review cannot start.",
      suggestedFix:
        "Fix the JSON syntax, then retry the import with a complete CasePackage JSON file.",
      message: "Malformed JSON. Review cannot start.",
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

function buildValidationFailure(
  errors: CasePackageValidationError[],
): Extract<CasePackageImportResult, { ok: false }> {
  if (hasSchemaVersionError(errors)) {
    return {
      ok: false,
      reason: "schema_version",
      title: "Missing or unsupported schema version",
      summary: formatErrorCountSummary(
        errors.length,
        "Package validation could not confirm a supported CasePackage schema version",
      ),
      suggestedFix: `Set schema_version to "${CASE_PACKAGE_V01_SCHEMA_VERSION}" and keep the v0.1 package contract intact.`,
      message:
        "Missing or unsupported CasePackage schema version. Review cannot start.",
      errors,
    };
  }

  return {
    ok: false,
    reason: "validation",
    title: "CasePackage v0.1 validation failed",
    summary: formatErrorCountSummary(
      errors.length,
      "Package validation found blocking CasePackage v0.1 issues",
    ),
    suggestedFix:
      "Fix the package contract, required metadata, provenance, sanitization, canonical values, or broken references before retrying the import.",
    message: "CasePackage v0.1 validation failed. Review cannot start.",
    errors,
  };
}

function hasSchemaVersionError(errors: CasePackageValidationError[]): boolean {
  return errors.some(
    (error) =>
      error.path === "$.schema_version" &&
      [
        "missing_required_field",
        "invalid_type",
        "unsupported_schema_version",
      ].includes(error.code),
  );
}

function formatErrorCountSummary(errorCount: number, prefix: string): string {
  const errorNoun = errorCount === 1 ? "error" : "errors";

  return `${prefix}: ${errorCount} ${errorNoun}. Review cannot start.`;
}
