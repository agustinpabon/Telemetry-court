import { validateCasePackageV01 } from "@/lib/casePackageValidation";
import {
  RESULTS_CASE_PACKAGE_METADATA_V01_SCHEMA_VERSION,
  toResultsCasePackageMetadataV01,
  type ResultsCasePackageMetadataV01,
} from "@/lib/resultsGalaxyMapV01";
import {
  CASE_PACKAGE_V01_SCHEMA_VERSION,
  type CasePackageDataClassificationV01,
  type CasePackageV01,
} from "@/lib/types";

export const CASE_PACKAGE_SESSION_STORE_V01_SCHEMA_VERSION =
  "case_package_session_store.v0.1" as const;
export const CASE_PACKAGE_SESSION_STORE_V01_KEY =
  "telemetry-court-case-packages-session-v1" as const;

export type CasePackageSessionStorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

type CasePackageSessionStoreV01 = {
  schema_version: typeof CASE_PACKAGE_SESSION_STORE_V01_SCHEMA_VERSION;
  case_package_metadata: ResultsCasePackageMetadataV01[];
};

const dataClassifications = new Set<CasePackageDataClassificationV01>([
  "public",
  "synthetic",
  "sanitized",
  "restricted_derived",
  "internal",
  "confidential",
]);

export function saveCasePackageToSessionStoreV01(
  storage: CasePackageSessionStorageLike,
  casePackage: CasePackageV01,
): CasePackageSessionStoreV01 {
  const validation = validateCasePackageV01(casePackage);

  if (!validation.ok) {
    throw new Error(
      "Cannot cache CasePackage metadata because the package failed validation.",
    );
  }

  const nextMetadata = toResultsCasePackageMetadataV01(validation.package);
  let currentMetadata: ResultsCasePackageMetadataV01[] = [];

  try {
    currentMetadata = loadCasePackagesFromSessionStoreV01(storage);
  } catch {
    currentMetadata = [];
  }

  const nextPackageKey = getCasePackageSessionReferenceKeyV01(nextMetadata);
  const nextStore = {
    schema_version: CASE_PACKAGE_SESSION_STORE_V01_SCHEMA_VERSION,
    case_package_metadata: [
      nextMetadata,
      ...currentMetadata.filter(
        (currentPackage) =>
          getCasePackageSessionReferenceKeyV01(currentPackage) !==
          nextPackageKey,
      ),
    ].sort(compareCasePackageReferences),
  } satisfies CasePackageSessionStoreV01;

  storage.setItem(
    CASE_PACKAGE_SESSION_STORE_V01_KEY,
    JSON.stringify(nextStore),
  );

  return nextStore;
}

export function loadCasePackagesFromSessionStoreV01(
  storage: CasePackageSessionStorageLike,
): ResultsCasePackageMetadataV01[] {
  const serializedStore = storage.getItem(CASE_PACKAGE_SESSION_STORE_V01_KEY);

  if (!serializedStore) {
    return [];
  }

  let parsedStore: unknown;
  try {
    parsedStore = JSON.parse(serializedStore);
  } catch {
    throw new Error("Cannot load cached CasePackage metadata: JSON is invalid.");
  }

  if (!isObjectRecord(parsedStore)) {
    throw new Error(
      "Cannot load cached CasePackage metadata: store must be an object.",
    );
  }

  assertOnlyKeys(parsedStore, [
    "schema_version",
    "case_package_metadata",
  ]);

  if (
    parsedStore.schema_version !== CASE_PACKAGE_SESSION_STORE_V01_SCHEMA_VERSION
  ) {
    throw new Error(
      `Cannot load unsupported CasePackage session-store schema version "${String(parsedStore.schema_version)}".`,
    );
  }

  if (!Array.isArray(parsedStore.case_package_metadata)) {
    throw new Error(
      "Cannot load cached CasePackage metadata: case_package_metadata must be an array.",
    );
  }

  const loadedMetadata = parsedStore.case_package_metadata.map(
    (storedMetadata, index) =>
      assertResultsCasePackageMetadataV01(storedMetadata, index),
  );
  const seenReferences = new Set<string>();

  for (const casePackage of loadedMetadata) {
    const referenceKey = getCasePackageSessionReferenceKeyV01(casePackage);

    if (seenReferences.has(referenceKey)) {
      throw new Error(
        "Cannot load cached CasePackage metadata: duplicate exact package references are not allowed.",
      );
    }

    seenReferences.add(referenceKey);
  }

  return [...loadedMetadata].sort(compareCasePackageReferences);
}

export function getCasePackageSessionReferenceKeyV01(
  casePackage: ResultsCasePackageMetadataV01,
): string {
  const reference = casePackage.case_package;

  return JSON.stringify([
    reference.schema_version,
    reference.package_id,
    reference.package_revision,
    reference.case_id,
    reference.cluster_id,
    reference.pipeline.pipeline_id,
    reference.pipeline.run_id,
    reference.pipeline.upstream_tool,
    reference.pipeline.pipeline_version,
    reference.pipeline.embedding_model,
    reference.pipeline.clustering_method,
    reference.pipeline.dimensionality_reduction_method,
    reference.pipeline.naming_model,
    reference.pipeline.prompt_id,
    reference.pipeline.prompt_version,
    reference.pipeline.prompt_digest,
    reference.pipeline.generated_at,
    reference.blind_review_enabled,
  ]);
}

function assertResultsCasePackageMetadataV01(
  value: unknown,
  index: number,
): ResultsCasePackageMetadataV01 {
  const prefix = `Cannot load cached CasePackage metadata at index ${index}`;

  if (!isObjectRecord(value)) {
    throw new Error(`${prefix}: entry must be an object.`);
  }

  assertOnlyKeys(value, [
    "schema_version",
    "case_package",
    "case",
    "dataset",
    "cluster",
  ]);
  if (
    value.schema_version !==
    RESULTS_CASE_PACKAGE_METADATA_V01_SCHEMA_VERSION
  ) {
    throw new Error(`${prefix}: metadata schema version is unsupported.`);
  }

  const casePackage = requireObject(value.case_package, prefix, "case_package");
  assertOnlyKeys(casePackage, [
    "schema_version",
    "package_id",
    "package_revision",
    "case_id",
    "cluster_id",
    "pipeline",
    "blind_review_enabled",
  ]);
  if (casePackage.schema_version !== CASE_PACKAGE_V01_SCHEMA_VERSION) {
    throw new Error(`${prefix}: CasePackage schema version is unsupported.`);
  }
  requireString(casePackage.package_id, prefix, "package_id");
  requireOptionalString(
    casePackage.package_revision,
    prefix,
    "package_revision",
  );
  requireString(casePackage.case_id, prefix, "case_id");
  requireString(casePackage.cluster_id, prefix, "cluster_id");
  if (typeof casePackage.blind_review_enabled !== "boolean") {
    throw new Error(`${prefix}: blind_review_enabled must be boolean.`);
  }

  const pipeline = requireObject(casePackage.pipeline, prefix, "pipeline");
  assertOnlyKeys(pipeline, [
    "pipeline_id",
    "run_id",
    "upstream_tool",
    "pipeline_version",
    "embedding_model",
    "clustering_method",
    "dimensionality_reduction_method",
    "naming_model",
    "prompt_id",
    "prompt_version",
    "prompt_digest",
    "generated_at",
  ]);
  requireOptionalString(pipeline.pipeline_id, prefix, "pipeline_id");
  requireString(pipeline.run_id, prefix, "run_id");
  requireString(pipeline.upstream_tool, prefix, "upstream_tool");
  requireOptionalString(pipeline.pipeline_version, prefix, "pipeline_version");
  requireOptionalString(pipeline.embedding_model, prefix, "embedding_model");
  requireOptionalString(
    pipeline.clustering_method,
    prefix,
    "clustering_method",
  );
  requireOptionalString(
    pipeline.dimensionality_reduction_method,
    prefix,
    "dimensionality_reduction_method",
  );
  requireOptionalString(pipeline.naming_model, prefix, "naming_model");
  requireOptionalString(pipeline.prompt_id, prefix, "prompt_id");
  requireOptionalString(pipeline.prompt_version, prefix, "prompt_version");
  requireOptionalString(pipeline.prompt_digest, prefix, "prompt_digest");
  requireString(pipeline.generated_at, prefix, "generated_at");

  const caseMetadata = requireObject(value.case, prefix, "case");
  assertOnlyKeys(caseMetadata, ["title", "summary"]);
  requireString(caseMetadata.title, prefix, "case.title");
  requireString(caseMetadata.summary, prefix, "case.summary");

  const dataset = requireObject(value.dataset, prefix, "dataset");
  assertOnlyKeys(dataset, ["dataset_name", "data_classification"]);
  requireString(dataset.dataset_name, prefix, "dataset_name");
  if (
    typeof dataset.data_classification !== "string" ||
    !dataClassifications.has(
      dataset.data_classification as CasePackageDataClassificationV01,
    )
  ) {
    throw new Error(`${prefix}: data_classification is unsupported.`);
  }

  const cluster = requireObject(value.cluster, prefix, "cluster");
  assertOnlyKeys(cluster, [
    "cluster_name",
    "upstream_cluster_label",
    "cluster_size",
    "coordinates",
  ]);
  requireOptionalString(cluster.cluster_name, prefix, "cluster_name");
  requireOptionalString(
    cluster.upstream_cluster_label,
    prefix,
    "upstream_cluster_label",
  );
  if (
    typeof cluster.cluster_size !== "number" ||
    !Number.isFinite(cluster.cluster_size) ||
    cluster.cluster_size < 0
  ) {
    throw new Error(`${prefix}: cluster_size must be a non-negative number.`);
  }
  if (cluster.coordinates !== undefined) {
    const coordinates = requireObject(
      cluster.coordinates,
      prefix,
      "coordinates",
    );
    assertOnlyKeys(coordinates, ["x", "y"]);
    requireFiniteNumber(coordinates.x, prefix, "coordinates.x");
    requireFiniteNumber(coordinates.y, prefix, "coordinates.y");
  }

  return value as ResultsCasePackageMetadataV01;
}

function compareCasePackageReferences(
  left: ResultsCasePackageMetadataV01,
  right: ResultsCasePackageMetadataV01,
): number {
  return getCasePackageSessionReferenceKeyV01(left).localeCompare(
    getCasePackageSessionReferenceKeyV01(right),
  );
}

function requireObject(
  value: unknown,
  prefix: string,
  label: string,
): Record<string, unknown> {
  if (!isObjectRecord(value)) {
    throw new Error(`${prefix}: ${label} must be an object.`);
  }

  return value;
}

function requireString(value: unknown, prefix: string, label: string): void {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${prefix}: ${label} must be a non-empty string.`);
  }
}

function requireOptionalString(
  value: unknown,
  prefix: string,
  label: string,
): void {
  if (value !== undefined) {
    requireString(value, prefix, label);
  }
}

function requireFiniteNumber(
  value: unknown,
  prefix: string,
  label: string,
): void {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${prefix}: ${label} must be a finite number.`);
  }
}

function assertOnlyKeys(
  value: Record<string, unknown>,
  allowedKeys: readonly string[],
): void {
  const allowed = new Set(allowedKeys);
  const unknownKey = Object.keys(value).find((key) => !allowed.has(key));

  if (unknownKey) {
    throw new Error(
      `Cannot load cached CasePackage metadata: unexpected field "${unknownKey}".`,
    );
  }
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
