const ARTIFACT_FILENAME_SEGMENT_MAX_LENGTH = 96;

export function sanitizeArtifactFilenameSegmentV01(
  value: unknown,
  fallback = "artifact",
): string {
  const safeFallback = sanitizeSegment(fallback) || "artifact";

  if (typeof value !== "string") {
    return safeFallback;
  }

  return sanitizeSegment(value) || safeFallback;
}

function sanitizeSegment(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[^A-Za-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "")
    .slice(0, ARTIFACT_FILENAME_SEGMENT_MAX_LENGTH)
    .replace(/[-_]+$/g, "");
}
