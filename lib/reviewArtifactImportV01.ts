import {
  inspectQuickDispositionV01,
  type QuickDispositionImportInspectionSummaryV01,
} from "@/lib/quickDispositionInspectionV01";
import type { QuickDispositionV01 } from "@/lib/quickDispositionV01";
import { validateQuickDispositionV01 } from "@/lib/quickDispositionV01";
import {
  importReviewResultArtifactV01Json,
  type ReviewResultArtifactImportResultV01,
} from "@/lib/reviewResultImportV01";
import type { ReviewResultInspectionOptionsV01 } from "@/lib/reviewResultInspectionV01";

export type ReviewArtifactImportResultV01 =
  | ReviewResultArtifactImportResultV01
  | {
      ok: true;
      artifactType: "QuickDisposition";
      quickDisposition: QuickDispositionV01;
      inspectionSummary: QuickDispositionImportInspectionSummaryV01;
    }
  | {
      ok: false;
      reason:
        | "malformed_json"
        | "unsupported_schema"
        | "invalid_bundle"
        | "invalid_review_result"
        | "invalid_quick_disposition"
        | "duplicate_review_result_id";
      message: string;
    };

export function importReviewArtifactV01Json(
  jsonText: string,
  options: ReviewResultInspectionOptionsV01 = {},
): ReviewArtifactImportResultV01 {
  let parsed: unknown;

  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return {
      ok: false,
      reason: "malformed_json",
      message: "Review artifact JSON is malformed and could not be parsed.",
    };
  }

  if (!isObjectRecord(parsed)) {
    return {
      ok: false,
      reason: "invalid_bundle",
      message: "Review artifact must be a JSON object.",
    };
  }

  const schemaVersion = String(parsed.schema_version);

  if (schemaVersion === "quick_disposition.v0.1") {
    const validation = validateQuickDispositionV01(parsed);

    if (!validation.ok) {
      const firstError = validation.errors[0];

      return {
        ok: false,
        reason: "invalid_quick_disposition",
        message: firstError
          ? `Invalid QuickDisposition at ${firstError.path}: ${firstError.message}`
          : "Invalid QuickDisposition artifact.",
      };
    }

    return {
      ok: true,
      artifactType: "QuickDisposition",
      quickDisposition: validation.quickDisposition,
      inspectionSummary: inspectQuickDispositionV01(
        validation.quickDisposition,
      ),
    };
  }

  return importReviewResultArtifactV01Json(jsonText, options);
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
