import {
  assertValidQuickDispositionV01,
  type QuickDispositionV01,
} from "@/lib/quickDispositionV01";

export const QUICK_DISPOSITION_LOCAL_STORE_V01_SCHEMA_VERSION =
  "quick_disposition_local_store.v0.1" as const;
export const QUICK_DISPOSITION_LOCAL_STORE_V01_KEY =
  "telemetry-court-quick-dispositions-v1" as const;

export type QuickDispositionStorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

export type QuickDispositionLocalStoreV01 = {
  schema_version: typeof QUICK_DISPOSITION_LOCAL_STORE_V01_SCHEMA_VERSION;
  quick_dispositions_by_case_package_id: Record<string, QuickDispositionV01[]>;
};

export function saveQuickDispositionToLocalStoreV01(
  storage: QuickDispositionStorageLike,
  quickDisposition: QuickDispositionV01,
): QuickDispositionLocalStoreV01 {
  const supportedQuickDisposition =
    assertSupportedQuickDispositionV01(quickDisposition);
  const currentStore = readQuickDispositionLocalStoreV01(storage);
  const packageId = supportedQuickDisposition.case_package.package_id;
  const currentPackageDispositions =
    currentStore.quick_dispositions_by_case_package_id[packageId] ?? [];
  const retainedPackageDispositions = currentPackageDispositions.filter(
    (storedDisposition) =>
      storedDisposition.disposition_id !==
        supportedQuickDisposition.disposition_id &&
      !hasSameReviewerSessionAndStage(
        storedDisposition,
        supportedQuickDisposition,
      ),
  );
  const nextStore = {
    schema_version: QUICK_DISPOSITION_LOCAL_STORE_V01_SCHEMA_VERSION,
    quick_dispositions_by_case_package_id: {
      ...currentStore.quick_dispositions_by_case_package_id,
      [packageId]: [
        ...retainedPackageDispositions,
        supportedQuickDisposition,
      ].sort((left, right) =>
        left.disposition_id < right.disposition_id
          ? -1
          : left.disposition_id > right.disposition_id
            ? 1
            : 0,
      ),
    },
  } satisfies QuickDispositionLocalStoreV01;

  storage.setItem(
    QUICK_DISPOSITION_LOCAL_STORE_V01_KEY,
    JSON.stringify(nextStore),
  );

  return nextStore;
}

export function loadQuickDispositionsForCasePackageV01(
  storage: QuickDispositionStorageLike,
  casePackageId: string,
): QuickDispositionV01[] {
  if (typeof casePackageId !== "string" || casePackageId.trim() === "") {
    throw new Error(
      "Cannot load local QuickDisposition v0.1 artifacts without a CasePackage ID.",
    );
  }

  return readQuickDispositionLocalStoreV01(storage)
    .quick_dispositions_by_case_package_id[casePackageId] ?? [];
}

export function readQuickDispositionLocalStoreV01(
  storage: QuickDispositionStorageLike,
): QuickDispositionLocalStoreV01 {
  const serializedStore = storage.getItem(QUICK_DISPOSITION_LOCAL_STORE_V01_KEY);

  if (!serializedStore) {
    return createEmptyQuickDispositionLocalStoreV01();
  }

  let parsedStore: unknown;
  try {
    parsedStore = JSON.parse(serializedStore);
  } catch {
    throw new Error("Cannot load local QuickDisposition store: JSON is invalid.");
  }

  if (!isObjectRecord(parsedStore)) {
    throw new Error(
      "Cannot load local QuickDisposition store: store must be an object.",
    );
  }

  if (
    parsedStore.schema_version !==
    QUICK_DISPOSITION_LOCAL_STORE_V01_SCHEMA_VERSION
  ) {
    throw new Error(
      `Cannot load unsupported local QuickDisposition store schema version "${String(parsedStore.schema_version)}".`,
    );
  }

  const quickDispositionsByPackage =
    parsedStore.quick_dispositions_by_case_package_id;

  if (!isObjectRecord(quickDispositionsByPackage)) {
    throw new Error(
      "Cannot load local QuickDisposition store without quick dispositions by CasePackage ID.",
    );
  }

  const loadedStore = createEmptyQuickDispositionLocalStoreV01();

  for (const [packageId, storedDispositions] of Object.entries(
    quickDispositionsByPackage,
  )) {
    if (!Array.isArray(storedDispositions)) {
      throw new Error(
        `Cannot load local QuickDisposition store entry for "${packageId}": expected an array.`,
      );
    }

    loadedStore.quick_dispositions_by_case_package_id[packageId] =
      validateStoredDispositionsForCasePackage(packageId, storedDispositions);
  }

  return loadedStore;
}

export function areQuickDispositionsAlreadyLocalV01(
  storage: QuickDispositionStorageLike,
  quickDispositions: readonly QuickDispositionV01[],
): boolean {
  const currentDispositions = Object.values(
    readQuickDispositionLocalStoreV01(storage)
      .quick_dispositions_by_case_package_id,
  ).flat();

  return quickDispositions.every((quickDisposition) =>
    currentDispositions.some(
      (storedDisposition) =>
        storedDisposition.disposition_id ===
          quickDisposition.disposition_id &&
        serializeCanonicalJson(storedDisposition) ===
          serializeCanonicalJson(quickDisposition),
    ),
  );
}

function validateStoredDispositionsForCasePackage(
  packageId: string,
  storedDispositions: unknown[],
): QuickDispositionV01[] {
  const loadedDispositions = storedDispositions.map(
    assertSupportedQuickDispositionV01,
  );

  for (const quickDisposition of loadedDispositions) {
    if (quickDisposition.case_package.package_id !== packageId) {
      throw new Error(
        `Cannot load local QuickDisposition store entry for "${packageId}": QuickDisposition belongs to a different CasePackage ID.`,
      );
    }
  }

  return loadedDispositions;
}

function assertSupportedQuickDispositionV01(
  quickDisposition: unknown,
): QuickDispositionV01 {
  if (!isObjectRecord(quickDisposition)) {
    throw new Error(
      "Cannot store QuickDisposition v0.1: artifact must be an object.",
    );
  }

  return assertValidQuickDispositionV01(quickDisposition);
}

function createEmptyQuickDispositionLocalStoreV01(): QuickDispositionLocalStoreV01 {
  return {
    schema_version: QUICK_DISPOSITION_LOCAL_STORE_V01_SCHEMA_VERSION,
    quick_dispositions_by_case_package_id: {},
  };
}

function hasSameReviewerSessionAndStage(
  left: QuickDispositionV01,
  right: QuickDispositionV01,
) {
  return (
    left.case_package.package_id === right.case_package.package_id &&
    left.reviewer.reviewer_id === right.reviewer.reviewer_id &&
    left.reviewer.review_session_id === right.reviewer.review_session_id &&
    left.source_stage === right.source_stage
  );
}

function serializeCanonicalJson(value: unknown): string {
  return JSON.stringify(sortJsonValue(value));
}

function sortJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortJsonValue);
  }

  if (isObjectRecord(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
        .map(([key, nestedValue]) => [key, sortJsonValue(nestedValue)]),
    );
  }

  return value;
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
