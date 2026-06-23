import type { SanitizedCasePackageAdapterIssueV01 } from "@/lib/sanitizedCasePackageAdapterV01";

export type ObjectRecord = Record<string, unknown>;

export function forEachDraftObject(
  items: unknown[],
  path: string,
  issues: SanitizedCasePackageAdapterIssueV01[],
  callback: (item: ObjectRecord, path: string) => void,
) {
  items.forEach((item, index) => {
    const itemPath = `${path}[${index}]`;
    if (!isObjectRecord(item)) {
      issues.push({
        path: itemPath,
        message: `${itemPath} must be an object.`,
      });
      return;
    }

    callback(item, itemPath);
  });
}

export function requireObjectValue(
  value: unknown,
  path: string,
  issues: SanitizedCasePackageAdapterIssueV01[],
): ObjectRecord | undefined {
  if (value === undefined) {
    issues.push({ path, message: `${path} is required.` });
    return undefined;
  }

  if (!isObjectRecord(value)) {
    issues.push({ path, message: `${path} must be an object.` });
    return undefined;
  }

  return value;
}

export function requireArrayValue(
  value: unknown,
  path: string,
  issues: SanitizedCasePackageAdapterIssueV01[],
): unknown[] | undefined {
  if (value === undefined) {
    issues.push({ path, message: `${path} is required.` });
    return undefined;
  }

  if (!Array.isArray(value)) {
    issues.push({ path, message: `${path} must be an array.` });
    return undefined;
  }

  return value;
}

export function requireStringValue(
  value: unknown,
  path: string,
  issues: SanitizedCasePackageAdapterIssueV01[],
): string | undefined {
  if (value === undefined) {
    issues.push({ path, message: `${path} is required.` });
    return undefined;
  }

  if (typeof value !== "string" || value.trim() === "") {
    issues.push({ path, message: `${path} must be a non-empty string.` });
    return undefined;
  }

  return value;
}

export function requireFiniteNumberValue(
  value: unknown,
  path: string,
  issues: SanitizedCasePackageAdapterIssueV01[],
): number | undefined {
  if (value === undefined) {
    issues.push({ path, message: `${path} is required.` });
    return undefined;
  }

  if (typeof value !== "number" || !Number.isFinite(value)) {
    issues.push({ path, message: `${path} must be a finite number.` });
    return undefined;
  }

  return value;
}

export function requireBooleanValue(
  value: unknown,
  path: string,
  issues: SanitizedCasePackageAdapterIssueV01[],
): boolean | undefined {
  if (value === undefined) {
    issues.push({ path, message: `${path} is required.` });
    return undefined;
  }

  if (typeof value !== "boolean") {
    issues.push({ path, message: `${path} must be a boolean.` });
    return undefined;
  }

  return value;
}

export function requireStringArrayValue(
  value: unknown,
  path: string,
  issues: SanitizedCasePackageAdapterIssueV01[],
): string[] | undefined {
  const values = requireArrayValue(value, path, issues);
  validateStringArrayValues(values, path, issues);
  return values?.filter((item): item is string => typeof item === "string");
}

export function validateOptionalStringArrayValue(
  value: unknown,
  path: string,
  issues: SanitizedCasePackageAdapterIssueV01[],
) {
  if (value === undefined) {
    return;
  }

  const values = requireArrayValue(value, path, issues);
  validateStringArrayValues(values, path, issues);
}

export function collectDraftIds(items: unknown[], idField: string): Set<string> {
  const ids = new Set<string>();

  for (const item of items) {
    if (!isObjectRecord(item)) {
      continue;
    }

    const id = item[idField];
    if (typeof id === "string" && id.trim() !== "") {
      ids.add(id);
    }
  }

  return ids;
}

export function validateReferenceArrayValues(
  value: unknown,
  path: string,
  allowedIds: Set<string>,
  messagePrefix: string,
  issues: SanitizedCasePackageAdapterIssueV01[],
) {
  if (!Array.isArray(value)) {
    return;
  }

  value.forEach((item, index) => {
    validateReferenceValue(
      item,
      allowedIds,
      `${path}[${index}]`,
      messagePrefix,
      issues,
    );
  });
}

export function validateOptionalReferenceArrayValues(
  value: unknown,
  path: string,
  allowedIds: Set<string>,
  messagePrefix: string,
  issues: SanitizedCasePackageAdapterIssueV01[],
) {
  if (value === undefined) {
    return;
  }

  validateReferenceArrayValues(value, path, allowedIds, messagePrefix, issues);
}

export function validateOptionalReferenceValue(
  value: unknown,
  allowedIds: Set<string>,
  path: string,
  messagePrefix: string,
  issues: SanitizedCasePackageAdapterIssueV01[],
) {
  if (value === undefined) {
    return;
  }

  validateReferenceValue(value, allowedIds, path, messagePrefix, issues);
}

export function isObjectRecord(value: unknown): value is ObjectRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateStringArrayValues(
  values: unknown[] | undefined,
  path: string,
  issues: SanitizedCasePackageAdapterIssueV01[],
) {
  if (!values) {
    return;
  }

  values.forEach((value, index) => {
    if (typeof value !== "string" || value.trim() === "") {
      issues.push({
        path: `${path}[${index}]`,
        message: `${path}[${index}] must be a non-empty string.`,
      });
    }
  });
}

export function validateReferenceValue(
  value: unknown,
  allowedIds: Set<string>,
  path: string,
  messagePrefix: string,
  issues: SanitizedCasePackageAdapterIssueV01[],
) {
  if (typeof value !== "string" || value.trim() === "") {
    return;
  }

  if (!allowedIds.has(value)) {
    issues.push({
      path,
      message: `${messagePrefix}: "${value}".`,
    });
  }
}
