import {
  createReviewResultBundleV01,
  importReviewResultBundleV01Json,
  type ReviewResultBundleImportResult,
  type ReviewResultBundleV01,
} from "@/lib/reviewResultBundleV01";
import {
  inspectReviewResultBundleV01,
  inspectReviewResultV01,
  type ReviewResultImportInspectionSummaryV01,
} from "@/lib/reviewResultInspectionV01";
import { validateReviewResultV01 } from "@/lib/reviewResultValidationV01";

export type ReviewResultArtifactImportResultV01 =
  | {
      ok: true;
      artifactType: "ReviewResult" | "ReviewResultBundle";
      bundle: ReviewResultBundleV01;
      inspectionSummary: ReviewResultImportInspectionSummaryV01;
    }
  | Extract<ReviewResultBundleImportResult, { ok: false }>;

export function importReviewResultArtifactV01Json(
  jsonText: string,
): ReviewResultArtifactImportResultV01 {
  let parsed: unknown;

  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return {
      ok: false,
      reason: "malformed_json",
      message: "ReviewResult bundle JSON is malformed and could not be parsed.",
    };
  }

  if (!isObjectRecord(parsed)) {
    return {
      ok: false,
      reason: "invalid_bundle",
      message: "ReviewResult bundle must be a JSON object.",
    };
  }

  const schemaVersion = String(parsed.schema_version);

  if (schemaVersion.startsWith("review_result_bundle.")) {
    const bundleImport = importReviewResultBundleV01Json(jsonText);

    if (!bundleImport.ok) {
      return bundleImport;
    }

    return {
      ok: true,
      artifactType: "ReviewResultBundle",
      bundle: bundleImport.bundle,
      inspectionSummary: inspectReviewResultBundleV01(bundleImport.bundle),
    };
  }

  if (schemaVersion === "review_result.v0.1") {
    const validation = validateReviewResultV01(parsed);

    if (!validation.ok) {
      const firstError = validation.errors[0];

      return {
        ok: false,
        reason: "invalid_review_result",
        message: firstError
          ? `Invalid ReviewResult at ${firstError.path}: ${firstError.message}`
          : "Invalid ReviewResult artifact.",
      };
    }

    return {
      ok: true,
      artifactType: "ReviewResult",
      bundle: createReviewResultBundleV01({
        reviewResults: [validation.reviewResult],
        bundleId: `review-result-import:${validation.reviewResult.review_id}`,
        createdAt: validation.reviewResult.created_at,
      }),
      inspectionSummary: inspectReviewResultV01(validation.reviewResult),
    };
  }

  return {
    ok: false,
    reason: "unsupported_schema",
    message: schemaVersion.startsWith("review_result.")
      ? `Unsupported ReviewResult schema version "${schemaVersion}".`
      : `Unsupported ReviewResult import schema version "${schemaVersion}".`,
  };
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
