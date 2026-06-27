export type AiAssistanceResponseValidationErrorV01 = {
  path: string;
  code: string;
  message: string;
};

export type ObjectRecord = Record<string, unknown>;

export function requireObject(
  input: unknown,
  path: string,
  errors: AiAssistanceResponseValidationErrorV01[],
): ObjectRecord | undefined {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    addError(errors, path, "invalid_type", "must be an object.");
    return undefined;
  }
  return input as ObjectRecord;
}

export function isObjectRecord(input: unknown): input is ObjectRecord {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

export function rejectUnknownFields(
  input: ObjectRecord,
  allowedFields: readonly string[],
  path: string,
  errors: AiAssistanceResponseValidationErrorV01[],
) {
  for (const field of Object.keys(input)) {
    if (!allowedFields.includes(field)) {
      addError(
        errors,
        `${path}.${field}`,
        "unsupported_field",
        `contains unsupported field "${field}".`,
      );
    }
  }
}

export function requireNonEmptyString(
  input: unknown,
  path: string,
  errors: AiAssistanceResponseValidationErrorV01[],
): string | undefined {
  if (!isNonEmptyString(input)) {
    addError(errors, path, "required_string", "must be a non-empty string.");
    return undefined;
  }

  return input;
}

export function validateOptionalString(
  input: unknown,
  path: string,
  errors: AiAssistanceResponseValidationErrorV01[],
) {
  if (input !== undefined && !isNonEmptyString(input)) {
    addError(
      errors,
      path,
      "invalid_type",
      "must be a non-empty string when provided.",
    );
  }
}

export function requireIsoTimestamp(
  input: unknown,
  path: string,
  errors: AiAssistanceResponseValidationErrorV01[],
): string | undefined {
  const value = requireNonEmptyString(input, path, errors);
  if (!value) return undefined;

  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(
      value,
    ) ||
    Number.isNaN(Date.parse(value))
  ) {
    addError(errors, path, "invalid_timestamp", "must be a valid ISO timestamp.");
    return undefined;
  }

  return value;
}

export function requireExactValue(
  input: unknown,
  expected: string,
  path: string,
  code: string,
  errors: AiAssistanceResponseValidationErrorV01[],
) {
  if (input !== expected) {
    addError(errors, path, code, `must equal "${expected}".`);
  }
}

export function requireEnum<T extends string>(
  input: unknown,
  allowed: readonly T[],
  path: string,
  errors: AiAssistanceResponseValidationErrorV01[],
): T | undefined {
  if (typeof input !== "string" || !allowed.includes(input as T)) {
    addError(errors, path, "unsupported_value", "contains an unsupported value.");
    return undefined;
  }

  return input as T;
}

export function validateStableReferenceArray(
  input: unknown,
  path: string,
  pattern: RegExp,
  malformedCode: string,
  allowedIds: Set<string> | undefined,
  unknownCode: string,
  errors: AiAssistanceResponseValidationErrorV01[],
): string[] {
  if (input === undefined) return [];

  if (!Array.isArray(input)) {
    addError(errors, path, "invalid_type", "must be an array when provided.");
    return [];
  }

  return validateStableReferenceArrayValues(
    input,
    path,
    pattern,
    malformedCode,
    allowedIds,
    unknownCode,
    errors,
  );
}

export function validateStableReferenceArrayValues(
  input: unknown[],
  path: string,
  pattern: RegExp,
  malformedCode: string,
  allowedIds: Set<string> | undefined,
  unknownCode: string,
  errors: AiAssistanceResponseValidationErrorV01[],
): string[] {
  const seen = new Set<string>();
  const values: string[] = [];

  input.forEach((value, index) => {
    const itemPath = `${path}[${index}]`;

    if (typeof value !== "string" || value.trim() === "") {
      addError(errors, itemPath, "required_string", "must be a non-empty string.");
      return;
    }

    if (!pattern.test(value)) {
      addError(
        errors,
        itemPath,
        malformedCode,
        "must be a stable contract ID, not a free-text citation.",
      );
      return;
    }

    if (seen.has(value)) {
      addError(errors, itemPath, "duplicate_reference", `duplicates ID "${value}".`);
      return;
    }

    seen.add(value);
    values.push(value);

    if (allowedIds && !allowedIds.has(value)) {
      addError(
        errors,
        itemPath,
        unknownCode,
        `references unknown ID "${value}" for the supplied context.`,
      );
    }
  });

  return values;
}

export function isNonEmptyString(input: unknown): input is string {
  return typeof input === "string" && input.trim() !== "";
}

export function addError(
  errors: AiAssistanceResponseValidationErrorV01[],
  path: string,
  code: string,
  message: string,
) {
  errors.push({ path, code, message });
}
