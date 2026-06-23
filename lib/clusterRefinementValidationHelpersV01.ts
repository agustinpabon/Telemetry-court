import type { ClusterRefinementValidationErrorV01 } from "@/lib/clusterRefinementTypesV01";

export function rejectUnexpectedKeys(
  path: string,
  value: Record<string, unknown>,
  allowedKeys: readonly string[],
  errors: ClusterRefinementValidationErrorV01[],
) {
  const allowed = new Set(allowedKeys);

  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      errors.push({
        path: `${path}.${key}`,
        code: "unknown_field",
        message: `Field "${key}" is not allowed in cluster_refinement.v0.1.`,
      });
    }
  }
}

export function requireExactString(
  path: string,
  value: unknown,
  expected: string,
  code: string,
  errors: ClusterRefinementValidationErrorV01[],
) {
  if (value !== expected) {
    errors.push({
      path,
      code,
      message: `Unsupported schema version or value "${String(value)}"; expected "${expected}".`,
    });
  }
}

export function requireNonEmptyString(
  path: string,
  value: unknown,
  errors: ClusterRefinementValidationErrorV01[],
) {
  if (typeof value !== "string" || value.trim() === "") {
    errors.push({
      path,
      code: "invalid_string",
      message: "Expected a non-empty string.",
    });
  }
}

export function requireOptionalString(
  path: string,
  value: unknown,
  errors: ClusterRefinementValidationErrorV01[],
) {
  if (value === undefined) {
    return;
  }

  requireNonEmptyString(path, value, errors);
}

export function requireNonNegativeInteger(
  path: string,
  value: unknown,
  errors: ClusterRefinementValidationErrorV01[],
) {
  if (!Number.isInteger(value) || Number(value) < 0) {
    errors.push({
      path,
      code: "invalid_number",
      message: "Expected a non-negative integer.",
    });
  }
}

export function requireBoolean(
  path: string,
  value: unknown,
  errors: ClusterRefinementValidationErrorV01[],
) {
  if (typeof value !== "boolean") {
    errors.push({
      path,
      code: "invalid_boolean",
      message: "Expected a boolean.",
    });
  }
}

export function requireNull(
  path: string,
  value: unknown,
  errors: ClusterRefinementValidationErrorV01[],
) {
  if (value !== null) {
    errors.push({
      path,
      code: "invalid_null",
      message: "Expected null.",
    });
  }
}

export function requireOneOf(
  path: string,
  value: unknown,
  expected: readonly string[],
  errors: ClusterRefinementValidationErrorV01[],
) {
  if (typeof value !== "string" || !expected.includes(value)) {
    errors.push({
      path,
      code: "unsupported_value",
      message: `Expected one of: ${expected.join(", ")}.`,
    });
  }
}

export function requireSortedStringArray(
  path: string,
  value: unknown,
  errors: ClusterRefinementValidationErrorV01[],
) {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    errors.push({
      path,
      code: "invalid_array",
      message: "Expected an array of strings.",
    });
    return;
  }

  if (!arraysEqual(value, [...value].sort(compareStrings))) {
    errors.push({
      path,
      code: "unstable_order",
      message: "Expected values to be sorted lexicographically.",
    });
  }
}

export function requireSortedEnumArray<const Value extends string>(
  path: string,
  value: unknown,
  expected: readonly Value[],
  errors: ClusterRefinementValidationErrorV01[],
) {
  const isValidArray =
    Array.isArray(value) &&
    value.every(
      (item) => typeof item === "string" && expected.includes(item as Value),
    );

  if (!isValidArray) {
    errors.push({
      path,
      code: "unsupported_value",
      message: `Expected a sorted array using only: ${expected.join(", ")}.`,
    });
    return;
  }

  if (!arraysEqual(value, [...value].sort(compareStrings))) {
    errors.push({
      path,
      code: "unstable_order",
      message: "Expected values to be sorted lexicographically.",
    });
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function arraysEqual(left: readonly unknown[], right: readonly unknown[]) {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

export function compareStrings(left: string, right: string) {
  if (left < right) {
    return -1;
  }

  if (left > right) {
    return 1;
  }

  return 0;
}

export function pushInvalidObject(
  path: string,
  label: string,
  errors: ClusterRefinementValidationErrorV01[],
) {
  errors.push({
    path,
    code: "invalid_type",
    message: `${label} must be an object.`,
  });
}

export function pushInvalidArray(
  path: string,
  label: string,
  errors: ClusterRefinementValidationErrorV01[],
) {
  errors.push({
    path,
    code: "invalid_type",
    message: `${label} must be an array.`,
  });
}

export function pushUnstableOrder(
  path: string,
  message: string,
  errors: ClusterRefinementValidationErrorV01[],
) {
  errors.push({
    path,
    code: "unstable_order",
    message,
  });
}
