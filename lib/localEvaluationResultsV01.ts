import {
  aggregateReviewResultsV01,
  type EvaluationReportV01,
} from "@/lib/evaluationReportV01";
import {
  areReviewResultBundleResultsAlreadyLocalV01,
  importReviewResultBundleToLocalStoreV01,
} from "@/lib/reviewResultBundleV01";
import { importReviewResultArtifactV01Json } from "@/lib/reviewResultImportV01";
import type { ReviewResultImportInspectionSummaryV01 } from "@/lib/reviewResultInspectionV01";
import type { ReviewResultV01 } from "@/lib/reviewResultV01";
import {
  readReviewResultLocalStoreV01,
  type ReviewResultStorageLike,
} from "@/lib/reviewResultStorageV01";

export type LocalEvaluationReportGroupV01 = {
  casePackageId: string;
  reviewResultCount: number;
  report: EvaluationReportV01;
  sourceReviewResults: ReviewResultV01[];
};

export type LocalEvaluationResultsSnapshotV01 = {
  totalReviewResultCount: number;
  packageGroups: LocalEvaluationReportGroupV01[];
};

export type LocalEvaluationResultsBundleImportV01 =
  | {
      ok: true;
      outcome: "imported" | "already_imported";
      message: string;
      importedReviewResultCount: number;
      inspectionSummary: ReviewResultImportInspectionSummaryV01;
      snapshot: LocalEvaluationResultsSnapshotV01;
    }
  | {
      ok: false;
      message: string;
      excludedReviewResultCount: number;
      snapshot: LocalEvaluationResultsSnapshotV01;
    };

export function loadLocalEvaluationResultsV01(
  storage: ReviewResultStorageLike,
): LocalEvaluationResultsSnapshotV01 {
  const store = readReviewResultLocalStoreV01(storage);
  const packageGroups = Object.entries(
    store.review_results_by_case_package_id,
  )
    .filter(([, reviewResults]) => reviewResults.length > 0)
    .sort(([leftPackageId], [rightPackageId]) =>
      leftPackageId < rightPackageId ? -1 : leftPackageId > rightPackageId ? 1 : 0,
    )
    .map(([casePackageId, reviewResults]) => {
      const sourceReviewResults = [...reviewResults].sort((left, right) =>
        left.review_id < right.review_id
          ? -1
          : left.review_id > right.review_id
            ? 1
            : 0,
      );

      return {
        casePackageId,
        reviewResultCount: sourceReviewResults.length,
        report: aggregateReviewResultsV01(sourceReviewResults),
        sourceReviewResults,
      };
    });

  return {
    totalReviewResultCount: packageGroups.reduce(
      (total, group) => total + group.reviewResultCount,
      0,
    ),
    packageGroups,
  };
}

export function importLocalEvaluationResultsBundleV01(
  storage: ReviewResultStorageLike,
  jsonText: string,
): LocalEvaluationResultsBundleImportV01 {
  const validation = importReviewResultArtifactV01Json(jsonText);

  if (!validation.ok) {
    return {
      ok: false,
      message: validation.message,
      excludedReviewResultCount: 0,
      snapshot: loadLocalEvaluationResultsV01(storage),
    };
  }

  if (
    areReviewResultBundleResultsAlreadyLocalV01(storage, validation.bundle)
  ) {
    return {
      ok: true,
      outcome: "already_imported",
      message:
        "This ReviewResult already exists locally. No action is needed; the local summary is unchanged.",
      importedReviewResultCount: 0,
      inspectionSummary: validation.inspectionSummary,
      snapshot: loadLocalEvaluationResultsV01(storage),
    };
  }

  try {
    const summary = importReviewResultBundleToLocalStoreV01(
      storage,
      validation.bundle,
    );

    return {
      ok: true,
      outcome: "imported",
      message: "ReviewResult import completed.",
      importedReviewResultCount: summary.importedReviewCount,
      inspectionSummary: validation.inspectionSummary,
      snapshot: loadLocalEvaluationResultsV01(storage),
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "ReviewResult bundle import failed.",
      excludedReviewResultCount: validation.bundle.review_results.length,
      snapshot: loadLocalEvaluationResultsV01(storage),
    };
  }
}
