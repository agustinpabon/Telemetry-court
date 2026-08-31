export const CASE_PACKAGE_JSON_MAX_BYTES = 2 * 1024 * 1024;

/**
 * ReviewResult bundles may contain many independently produced results. An
 * 8 MiB ceiling keeps that portable exchange practical while still bounding
 * browser memory use to a modest multiple of the CasePackage limit.
 */
export const REVIEW_ARTIFACT_JSON_MAX_BYTES = 8 * 1024 * 1024;

export type LocalJsonFileReadErrorCode =
  | "file_too_large"
  | "invalid_file_metadata"
  | "read_failed";

export class LocalJsonFileReadError extends Error {
  readonly code: LocalJsonFileReadErrorCode;

  constructor(code: LocalJsonFileReadErrorCode) {
    super(getGenericReadErrorMessage(code));
    this.name = "LocalJsonFileReadError";
    this.code = code;
  }
}

type ReadableLocalFile = {
  size: number;
  arrayBuffer?: () => Promise<ArrayBuffer>;
  text?: () => Promise<string>;
};

/**
 * Read a user-selected JSON file without trusting its declared size alone.
 * Browser File/Blob inputs use their exact bytes so malformed UTF-8 fails
 * closed. Text-only File-like test adapters remain supported and are measured
 * again after reading.
 */
export async function readBoundedLocalJsonFile(
  file: ReadableLocalFile,
  maxBytes: number,
): Promise<string> {
  if (!Number.isSafeInteger(maxBytes) || maxBytes <= 0) {
    throw new RangeError("Local JSON size limit must be a positive safe integer.");
  }

  if (!Number.isSafeInteger(file.size) || file.size < 0) {
    throw new LocalJsonFileReadError("invalid_file_metadata");
  }

  if (file.size > maxBytes) {
    throw new LocalJsonFileReadError("file_too_large");
  }

  if (typeof file.arrayBuffer === "function") {
    let fileBytes: ArrayBuffer;

    try {
      fileBytes = await file.arrayBuffer();
    } catch {
      throw new LocalJsonFileReadError("read_failed");
    }

    if (!(fileBytes instanceof ArrayBuffer)) {
      throw new LocalJsonFileReadError("read_failed");
    }

    if (fileBytes.byteLength > maxBytes) {
      throw new LocalJsonFileReadError("file_too_large");
    }

    try {
      return new TextDecoder("utf-8", { fatal: true }).decode(fileBytes);
    } catch {
      throw new LocalJsonFileReadError("read_failed");
    }
  }

  if (typeof file.text !== "function") {
    throw new LocalJsonFileReadError("read_failed");
  }

  let jsonText: string;

  try {
    jsonText = await file.text();
  } catch {
    throw new LocalJsonFileReadError("read_failed");
  }

  if (typeof jsonText !== "string") {
    throw new LocalJsonFileReadError("read_failed");
  }

  if (new TextEncoder().encode(jsonText).byteLength > maxBytes) {
    throw new LocalJsonFileReadError("file_too_large");
  }

  return jsonText;
}

export function formatLocalJsonByteLimit(byteCount: number): string {
  if (!Number.isSafeInteger(byteCount) || byteCount <= 0) {
    throw new RangeError("Byte limit must be a positive safe integer.");
  }

  if (byteCount % (1024 * 1024) === 0) {
    return `${byteCount / (1024 * 1024)} MiB`;
  }

  if (byteCount % 1024 === 0) {
    return `${byteCount / 1024} KiB`;
  }

  return `${byteCount} B`;
}

function getGenericReadErrorMessage(code: LocalJsonFileReadErrorCode): string {
  switch (code) {
    case "file_too_large":
      return "The selected local JSON file exceeds the configured size limit.";
    case "invalid_file_metadata":
      return "The selected local JSON file has invalid size metadata.";
    case "read_failed":
    default:
      return "The selected local JSON file could not be read safely.";
  }
}
