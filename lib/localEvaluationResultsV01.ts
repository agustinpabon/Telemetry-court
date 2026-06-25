import {
  aggregateReviewResultsV01,
  type EvaluationReportV01,
} from "@/lib/evaluationReportV01";
import {
  areQuickDispositionsAlreadyLocalV01,
  readQuickDispositionLocalStoreV01,
  saveQuickDispositionToLocalStoreV01,
} from "@/lib/quickDispositionStorageV01";
import type { QuickDispositionV01 } from "@/lib/quickDispositionV01";
import {
  areReviewResultBundleResultsAlreadyLocalV01,
  importReviewResultBundleToLocalStoreV01,
} from "@/lib/reviewResultBundleV01";
import { importReviewArtifactV01Json } from "@/lib/reviewArtifactImportV01";
import type { QuickDispositionImportInspectionSummaryV01 } from "@/lib/quickDispositionInspectionV01";
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

export type LocalQuickDispositionGroupV01 = {
  casePackageId: string;
  dispositionCount: number;
  quickDispositions: QuickDispositionV01[];
};

export type LocalEvaluationResultsSnapshotV01 = {
  totalReviewResultCount: number;
  totalQuickDispositionCount: number;
  packageGroups: LocalEvaluationReportGroupV01[];
  quickDispositionGroups: LocalQuickDispositionGroupV01[];
};

export type LocalEvaluationResultsBundleImportV01 =
  | {
      ok: true;
      outcome: "imported" | "already_imported";
      message: string;
      importedReviewResultCount: number;
      importedQuickDispositionCount: number;
      inspectionSummary:
        | ReviewResultImportInspectionSummaryV01
        | QuickDispositionImportInspectionSummaryV01;
      snapshot: LocalEvaluationResultsSnapshotV01;
    }
  | {
      ok: false;
      message: string;
      excludedReviewResultCount: number;
      excludedQuickDispositionCount: number;
      snapshot: LocalEvaluationResultsSnapshotV01;
    };

export function loadLocalEvaluationResultsV01(
  storage: ReviewResultStorageLike,
): LocalEvaluationResultsSnapshotV01 {
  const store = readReviewResultLocalStoreV01(storage);
  const quickDispositionStore = readQuickDispositionLocalStoreV01(storage);
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
  const quickDispositionGroups = Object.entries(
    quickDispositionStore.quick_dispositions_by_case_package_id,
  )
    .filter(([, quickDispositions]) => quickDispositions.length > 0)
    .sort(([leftPackageId], [rightPackageId]) =>
      leftPackageId < rightPackageId ? -1 : leftPackageId > rightPackageId ? 1 : 0,
    )
    .map(([casePackageId, quickDispositions]) => {
      const sortedQuickDispositions = [...quickDispositions].sort(
        (left, right) =>
          left.disposition_id < right.disposition_id
            ? -1
            : left.disposition_id > right.disposition_id
              ? 1
              : 0,
      );

      return {
        casePackageId,
        dispositionCount: sortedQuickDispositions.length,
        quickDispositions: sortedQuickDispositions,
      };
    });

  return {
    totalReviewResultCount: packageGroups.reduce(
      (total, group) => total + group.reviewResultCount,
      0,
    ),
    totalQuickDispositionCount: quickDispositionGroups.reduce(
      (total, group) => total + group.dispositionCount,
      0,
    ),
    packageGroups,
    quickDispositionGroups,
  };
}

export function importLocalEvaluationResultsBundleV01(
  storage: ReviewResultStorageLike,
  jsonText: string,
): LocalEvaluationResultsBundleImportV01 {
  const validation = importReviewArtifactV01Json(jsonText);

  if (!validation.ok) {
    return {
      ok: false,
      message: validation.message,
      excludedReviewResultCount: 0,
      excludedQuickDispositionCount: 0,
      snapshot: loadLocalEvaluationResultsV01(storage),
    };
  }

  if (validation.artifactType === "QuickDisposition") {
    if (
      areQuickDispositionsAlreadyLocalV01(storage, [
        validation.quickDisposition,
      ])
    ) {
      return {
        ok: true,
        outcome: "already_imported",
        message:
          "This quick disposition already exists locally. No action is needed; the local summary is unchanged.",
        importedReviewResultCount: 0,
        importedQuickDispositionCount: 0,
        inspectionSummary: validation.inspectionSummary,
        snapshot: loadLocalEvaluationResultsV01(storage),
      };
    }

    try {
      saveQuickDispositionToLocalStoreV01(storage, validation.quickDisposition);

      return {
        ok: true,
        outcome: "imported",
        message: "Quick disposition import completed.",
        importedReviewResultCount: 0,
        importedQuickDispositionCount: 1,
        inspectionSummary: validation.inspectionSummary,
        snapshot: loadLocalEvaluationResultsV01(storage),
      };
    } catch (error) {
      return {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Quick disposition import failed.",
        excludedReviewResultCount: 0,
        excludedQuickDispositionCount: 1,
        snapshot: loadLocalEvaluationResultsV01(storage),
      };
    }
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
      importedQuickDispositionCount: 0,
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
      importedQuickDispositionCount: 0,
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
      excludedQuickDispositionCount: 0,
      snapshot: loadLocalEvaluationResultsV01(storage),
    };
  }
}
