"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import Link from "next/link";

import { AiRevealPanel } from "@/components/arena/AiRevealPanel";
import { BlindReadPanel } from "@/components/arena/BlindReadPanel";
import {
  CasePackageImportControl,
  type CasePackageImportFailureDetails,
  type CasePackageImportStatus,
} from "@/components/arena/CasePackageImportControl";
import { CaseFilePanel } from "@/components/arena/CaseFilePanel";
import { EvidenceBoard } from "@/components/arena/EvidenceBoard";
import {
  HotFolderCasePackageControl,
  type HotFolderCasePackageControlStatus,
} from "@/components/arena/HotFolderCasePackageControl";
import { ImpostorPanel } from "@/components/arena/ImpostorPanel";
import { LabelDuelPanel } from "@/components/arena/LabelDuelPanel";
import { ReviewSummaryDrawer } from "@/components/arena/ReviewSummaryDrawer";
import {
  ReviewResultBundleControl,
  type ReviewResultBundleControlStatus,
} from "@/components/arena/ReviewResultBundleControl";
import { TelemetryGalaxy } from "@/components/arena/TelemetryGalaxy";
import { VerdictPanel } from "@/components/arena/VerdictPanel";
import { ArenaHeader, ArenaReviewerGoal } from "@/components/arena/WorkflowPrimitives";
import {
  getArenaStageForPathname,
  getPathForArenaStage,
} from "@/lib/arenaRoutes";
import {
  arenaReducer,
  buildArenaReview,
  createInitialArenaState,
  getCurrentReviewState,
  getEvidenceBalance,
  getEvidenceRatings,
  getSelectedCase,
  type ArenaAction,
  type ArenaUiState,
  arenaStages,
} from "@/lib/arenaReviewState";
import {
  buildReviewResultExport,
  getReviewResultExportFilename,
  serializeReviewResultExport,
} from "@/lib/exportReview";
import { saveCasePackageToSessionStoreV01 } from "@/lib/casePackageSessionStorageV01";
import {
  importCasePackageV01Json,
  type CasePackageImportResult,
} from "@/lib/importCasePackageV01";
import {
  HOT_FOLDER_CASE_PACKAGE_API_PATH,
  type HotFolderCasePackageScanResponse,
  type HotFolderCasePackageValidCandidate,
} from "@/lib/hotFolderCasePackageTypes";
import {
  areReviewResultBundleResultsAlreadyLocalV01,
  createReviewResultBundleV01,
  getReviewResultBundleFilename,
  importReviewResultBundleToLocalStoreV01,
  serializeReviewResultBundleV01,
} from "@/lib/reviewResultBundleV01";
import { importReviewResultArtifactV01Json } from "@/lib/reviewResultImportV01";
import {
  loadReviewResultsForCasePackageV01,
  saveReviewResultToLocalStoreV01,
} from "@/lib/reviewResultStorageV01";
import {
  getInsufficientContextGuidance,
  resolveReviewReadinessChoice,
} from "@/lib/reviewReadiness";
import type {
  CaseFile,
  CasePackageV01,
  LandscapeContextNode,
} from "@/lib/types";

type AppShellProps = {
  cases: CaseFile[];
  landscapeContextNodes?: LandscapeContextNode[];
  initialStage: ReturnType<typeof createInitialArenaState>["activeStage"];
  pathname: string;
  onNavigatePath: (path: string) => void;
  onNavigatePathPreservingState?: (path: string) => void;
};

const arenaSessionStateKey = "telemetry-court-arena-state-v1";
const hotFolderPollingIntervalMs = 8000;

type CasePackageImportOptions = {
  source?: "manual" | "hot_folder";
  sourceLabel?: string;
};

export function AppShell({
  cases,
  landscapeContextNodes = [],
  initialStage,
  pathname,
  onNavigatePath,
  onNavigatePathPreservingState = onNavigatePath,
}: AppShellProps) {
  const [importedCases, setImportedCases] = useState<CaseFile[]>([]);
  const importedCaseIds = useMemo(
    () => new Set(importedCases.map((caseFile) => caseFile.id)),
    [importedCases],
  );
  const sessionPersistableCaseIds = useMemo(
    () =>
      new Set(
        cases
          .map((caseFile) => caseFile.id)
          .filter((caseId) => !importedCaseIds.has(caseId)),
      ),
    [cases, importedCaseIds],
  );
  const activeCases = useMemo(
    () => [
      ...importedCases,
      ...cases.filter((caseFile) => !importedCaseIds.has(caseFile.id)),
    ],
    [cases, importedCases, importedCaseIds],
  );
  const [arenaState, rawDispatch] = useReducer(
    (state: ReturnType<typeof createInitialArenaState>, action: ArenaAction) =>
      arenaReducer(state, action, activeCases),
    { cases: activeCases, initialStage },
    ({ cases: initialCases, initialStage: nextInitialStage }) =>
      createInitialArenaState(initialCases, nextInitialStage),
  );
  const sessionHydrationCheckedRef = useRef(false);
  const sessionHydrationPendingRef = useRef(false);
  const [previewCaseId, setPreviewCaseId] = useState<string>();
  const [exportMessage, setExportMessage] = useState<string>();
  const [importStatus, setImportStatus] = useState<CasePackageImportStatus>({
    state: "idle",
  });
  const [reviewBundleStatus, setReviewBundleStatus] =
    useState<ReviewResultBundleControlStatus>({ state: "idle" });
  const [hotFolderStatus, setHotFolderStatus] =
    useState<HotFolderCasePackageControlStatus>({ state: "idle" });
  const [hotFolderPolling, setHotFolderPolling] = useState(false);
  const seenHotFolderCandidateIdsRef = useRef(new Set<string>());
  const pendingHotFolderCandidatesRef = useRef<HotFolderCasePackageValidCandidate[]>([]);
  const hotFolderInitialScanRef = useRef(false);
  const selectedCase = getSelectedCase(activeCases, arenaState);
  const selectedCaseIsImported = selectedCase
    ? importedCaseIds.has(selectedCase.id)
    : false;
  const reviewState = getCurrentReviewState(arenaState);
  const blindChoiceId = reviewState.blindChoiceId;
  const aiLabelRevealed = reviewState.aiLabelRevealed;
  const activeStage = getProtectedArenaStage(
    arenaState.activeStage,
    blindChoiceId,
    aiLabelRevealed,
  );

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [activeStage, selectedCase?.id]);

  useEffect(() => {
    if (sessionHydrationCheckedRef.current) {
      return;
    }

    const storedState = readArenaSessionState(cases);

    if (storedState) {
      sessionHydrationPendingRef.current = true;
      rawDispatch({ type: "hydrateSession", ...storedState });
    }

    sessionHydrationCheckedRef.current = true;
  }, [cases]);

  useEffect(() => {
    if (
      !sessionHydrationCheckedRef.current ||
      sessionHydrationPendingRef.current
    ) {
      return;
    }

    persistArenaSessionState(arenaState, sessionPersistableCaseIds);
  }, [arenaState, sessionPersistableCaseIds]);

  useEffect(() => {
    if (!sessionHydrationCheckedRef.current) {
      return;
    }

    if (sessionHydrationPendingRef.current) {
      sessionHydrationPendingRef.current = false;
      return;
    }

    const routeStage = getArenaStageForPathname(pathname);
    const protectedRouteStage = routeStage
      ? getProtectedArenaStage(routeStage, blindChoiceId, aiLabelRevealed)
      : null;

    if (!protectedRouteStage) {
      return;
    }

    const protectedPath = getPathForArenaStage(protectedRouteStage);

    if (protectedPath !== pathname) {
      navigatePath({
        nextPath: protectedPath,
        preserveImportedState: selectedCaseIsImported,
        onNavigatePath,
        onNavigatePathPreservingState,
      });
    }

    if (protectedRouteStage !== arenaState.activeStage) {
      rawDispatch({ type: "goToStage", stage: protectedRouteStage });
    }
  }, [
    aiLabelRevealed,
    arenaState.activeStage,
    blindChoiceId,
    onNavigatePath,
    onNavigatePathPreservingState,
    pathname,
    selectedCaseIsImported,
  ]);

  const handleImportCasePackageJson = useCallback(
    (
      jsonText: string,
      _fileName?: string,
      options: CasePackageImportOptions = {},
    ) => {
      const importResult = importCasePackageV01Json(jsonText);

      if (!importResult.ok) {
        setImportStatus({
          state: "error",
          failure: toImportFailureDetails(importResult),
        });
        return false;
      }

      const importedCase = importResult.caseFile;
      const resultsCacheAvailable = cacheCasePackageForResults(
        importResult.package,
      );

      setImportedCases((currentCases) => [
        importedCase,
        ...currentCases.filter((caseFile) => caseFile.id !== importedCase.id),
      ]);
      setPreviewCaseId(undefined);
      setExportMessage(undefined);
      rawDispatch({
        type: "startImportedCaseReview",
        caseId: importedCase.id,
      });
      setImportStatus({
        state: "success",
        packageId: importResult.package.package_id,
        caseId: importResult.package.case.case_id,
        title: importResult.package.case.title,
        inspectionSummary: importResult.inspectionSummary,
        source: options.source ?? "manual",
        sourceLabel: options.sourceLabel,
        resultsCacheAvailable,
      });

      const caseFilePath = getPathForArenaStage("case_file");

      if (caseFilePath !== pathname) {
        onNavigatePathPreservingState(caseFilePath);
      }

      return true;
    },
    [onNavigatePathPreservingState, pathname],
  );

  const loadHotFolderCandidate = useCallback(
    (
      candidate: HotFolderCasePackageValidCandidate,
      scan?: HotFolderCasePackageScanResponse,
    ) => {
      seenHotFolderCandidateIdsRef.current.add(candidate.candidateId);
      pendingHotFolderCandidatesRef.current =
        pendingHotFolderCandidatesRef.current.filter(
          (pendingCandidate) =>
            pendingCandidate.importKey !== candidate.importKey,
        );

      const imported = handleImportCasePackageJson(
        candidate.jsonText,
        candidate.filename,
        {
          source: "hot_folder",
          sourceLabel: "configured Hot-Folder",
        },
      );

      if (!imported) {
        setHotFolderStatus({
          state: "error",
          message:
            "Hot-Folder candidate failed import revalidation. Review was not started.",
        });
        return;
      }

      setHotFolderStatus({
        state: "loaded",
        message: buildHotFolderLoadedMessage(candidate, scan),
      });
    },
    [handleImportCasePackageJson],
  );

  const applyHotFolderScan = useCallback(
    (
      scan: HotFolderCasePackageScanResponse,
      options: { autoLoad?: boolean } = {},
    ) => {
      if (!scan.enabled) {
        pendingHotFolderCandidatesRef.current = [];
        setHotFolderPolling(false);
        setHotFolderStatus({
          state: "disabled",
          message: "Hot-Folder is not configured.",
        });
        return;
      }

      if (scan.directoryError) {
        pendingHotFolderCandidatesRef.current = [];
        setHotFolderStatus({
          state: "error",
          message: scan.directoryError,
        });
        return;
      }

      const unseenCandidates = getUnseenHotFolderCandidates(
        scan.validCandidates,
        seenHotFolderCandidateIdsRef.current,
      );
      pendingHotFolderCandidatesRef.current = unseenCandidates;

      if (options.autoLoad && unseenCandidates.length === 1) {
        loadHotFolderCandidate(unseenCandidates[0], scan);
        return;
      }

      setHotFolderStatus({
        state: "ready",
        message: buildHotFolderReadyMessage(scan, unseenCandidates.length),
        unseenCount: unseenCandidates.length,
        validCount: scan.validCandidates.length,
        invalidCount: scan.invalidCandidates.length,
        invalidSummary: getHotFolderInvalidSummary(scan),
      });
    },
    [loadHotFolderCandidate],
  );

  const checkHotFolder = useCallback(
    async (options: { autoLoad?: boolean } = {}) => {
      setHotFolderStatus({ state: "checking" });

      try {
        const response = await fetch(HOT_FOLDER_CASE_PACKAGE_API_PATH, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Hot-Folder scan request failed.");
        }

        const scan = (await response.json()) as HotFolderCasePackageScanResponse;
        applyHotFolderScan(scan, options);
      } catch {
        pendingHotFolderCandidatesRef.current = [];
        setHotFolderStatus({
          state: "error",
          message:
            "Hot-Folder scan failed locally. Confirm the app is running and retry.",
        });
      }
    },
    [applyHotFolderScan],
  );

  const handleCheckHotFolder = useCallback(() => {
    void checkHotFolder();
  }, [checkHotFolder]);

  const handleToggleHotFolderPolling = useCallback(() => {
    setHotFolderPolling((currentPolling) => {
      const nextPolling = !currentPolling;

      if (nextPolling) {
        void checkHotFolder({ autoLoad: true });
      }

      return nextPolling;
    });
  }, [checkHotFolder]);

  const handleLoadNextHotFolderCandidate = useCallback(() => {
    const nextCandidate = pendingHotFolderCandidatesRef.current[0];

    if (!nextCandidate) {
      setHotFolderStatus({
        state: "ready",
        message: "No new valid CasePackages found in configured Hot-Folder.",
        unseenCount: 0,
        validCount: 0,
        invalidCount: 0,
      });
      return;
    }

    loadHotFolderCandidate(nextCandidate);
  }, [loadHotFolderCandidate]);

  useEffect(() => {
    if (hotFolderInitialScanRef.current) {
      return;
    }

    hotFolderInitialScanRef.current = true;
    void checkHotFolder({ autoLoad: true });
  }, [checkHotFolder]);

  useEffect(() => {
    if (!hotFolderPolling) {
      return;
    }

    const pollingId = window.setInterval(() => {
      void checkHotFolder({ autoLoad: true });
    }, hotFolderPollingIntervalMs);

    return () => {
      window.clearInterval(pollingId);
    };
  }, [checkHotFolder, hotFolderPolling]);

  if (!selectedCase) {
    return (
      <main className="arena-empty">
        <section>
          <p className="eyebrow">Telemetry Court</p>
          <h1>No validation cases are available</h1>
        </section>
      </main>
    );
  }

  const selectedCasePackageId = selectedCase.casePackageReference?.package_id;
  const reviewReadinessChoice = resolveReviewReadinessChoice(
    selectedCase,
    reviewState,
  );
  const insufficientContextGuidance =
    getInsufficientContextGuidance(reviewReadinessChoice);
  const evidenceRatings = getEvidenceRatings(selectedCase, reviewState);
  const evidenceBalance = getEvidenceBalance(selectedCase, evidenceRatings);
  const blindChoice = selectedCase.blindInterpretationOptions.find(
    (option) => option.id === reviewState.blindChoiceId,
  );
  const duelWinner = selectedCase.candidateLabels.find(
    (candidate) => candidate.id === reviewState.labelDuelWinnerId,
  );
  const impostor = selectedCase.representativeSessions.find(
    (session) => session.id === reviewState.impostorSessionId,
  );
  const arenaReview = buildArenaReview(selectedCase, reviewState, evidenceRatings);
  const exportTimestamp = new Date().toISOString();
  const exportResult = tryBuildReviewResultExport({
    caseFile: selectedCase,
    exportTimestamp,
    arenaReview,
  });
  const exportJson = exportResult.ok
    ? serializeReviewResultExport(exportResult.reviewResult)
    : undefined;
  const exportError = exportResult.ok ? undefined : exportResult.error;

  function dispatchArena(action: ArenaAction) {
    persistArenaSessionState(
      arenaReducer(arenaState, action, activeCases),
      sessionPersistableCaseIds,
    );
    rawDispatch(action);
    setExportMessage(undefined);
  }

  function navigateToStage(stage: ReturnType<typeof createInitialArenaState>["activeStage"]) {
    const protectedStage = getProtectedArenaStage(
      stage,
      blindChoiceId,
      aiLabelRevealed,
    );
    const nextPath = getPathForArenaStage(protectedStage);

    if (nextPath !== pathname) {
      navigatePath({
        nextPath,
        preserveImportedState: selectedCaseIsImported,
        onNavigatePath,
        onNavigatePathPreservingState,
      });
    }

    dispatchArena({ type: "goToStage", stage: protectedStage });
  }

  function openCaseFile() {
    navigateToStage("case_file");
  }

  function handleImportStart() {
    setImportStatus({ state: "reading" });
  }

  function handleImportReadError(message: string) {
    setImportStatus({
      state: "error",
      failure: {
        reason: "read_error",
        title: "CasePackage file could not be read",
        summary:
          "The selected file could not be read locally. Package validation did not run and review cannot start.",
        suggestedFix:
          "Choose another local JSON file or confirm the file is accessible before retrying.",
        message,
        errors: [
          {
            path: "$file",
            code: "file_read_failed",
            message,
          },
        ],
      },
    });
  }

  function handleClearImport() {
    const demoCaseId = cases[0]?.id;

    setImportedCases([]);
    setPreviewCaseId(undefined);
    setExportMessage(undefined);
    setImportStatus({ state: "idle" });

    if (demoCaseId) {
      dispatchArena({ type: "selectCase", caseId: demoCaseId });
    }

    const landscapePath = getPathForArenaStage("landscape");

    if (landscapePath !== pathname) {
      onNavigatePath(landscapePath);
    }
  }

  function handleExportReviewResultBundle() {
    if (typeof window === "undefined" || !window.localStorage) {
      setReviewBundleStatus({
        state: "error",
        message: "Local ReviewResult storage is unavailable.",
      });
      return;
    }

    try {
      const packageId = selectedCasePackageId;

      if (!packageId) {
        setReviewBundleStatus({
          state: "error",
          message:
            "The selected case has no CasePackage reference, so its ReviewResults cannot be exported.",
        });
        return;
      }

      const localReviews = loadReviewResultsForCasePackageV01(
        window.localStorage,
        packageId,
      );

      if (localReviews.length === 0) {
        setReviewBundleStatus({
          state: "error",
          message: `No local ReviewResults are available for CasePackage "${packageId}". Export a completed review for this case first.`,
        });
        return;
      }

      const createdAt = new Date().toISOString();
      const bundle = createReviewResultBundleV01({
        reviewResults: localReviews,
        bundleId: `review-result-bundle:${createdAt}`,
        createdAt,
      });
      downloadJsonFile(
        serializeReviewResultBundleV01(bundle),
        getReviewResultBundleFilename(bundle),
      );
      setReviewBundleStatus({
        state: "success",
        message: `Exported ${localReviews.length} local ReviewResult${localReviews.length === 1 ? "" : "s"} for CasePackage "${packageId}".`,
      });
    } catch (error) {
      setReviewBundleStatus({
        state: "error",
        message:
          error instanceof Error
            ? error.message
            : "ReviewResult bundle export failed.",
      });
    }
  }

  function handleReviewResultBundleImportStart() {
    setReviewBundleStatus({ state: "reading" });
  }

  function handleReviewResultBundleImportReadError(message: string) {
    setReviewBundleStatus({ state: "error", message });
  }

  function handleImportReviewResultBundleJson(jsonText: string) {
    const parseResult = importReviewResultArtifactV01Json(jsonText);

    if (!parseResult.ok) {
      setReviewBundleStatus({
        state: "error",
        message: parseResult.message,
      });
      return;
    }

    if (typeof window === "undefined" || !window.localStorage) {
      setReviewBundleStatus({
        state: "error",
        message: "Local ReviewResult storage is unavailable.",
      });
      return;
    }

    try {
      if (
        areReviewResultBundleResultsAlreadyLocalV01(
          window.localStorage,
          parseResult.bundle,
        )
      ) {
        setReviewBundleStatus({
          state: "success",
          message:
            "This ReviewResult already exists locally. No action is needed; the local results are unchanged.",
        });
        return;
      }

      const summary = importReviewResultBundleToLocalStoreV01(
        window.localStorage,
        parseResult.bundle,
      );
      setReviewBundleStatus({
        state: "success",
        message: `Imported ${summary.importedReviewCount} ReviewResult${summary.importedReviewCount === 1 ? "" : "s"} from local JSON. ${summary.totalLocalReviewCount} stored locally.`,
        inspectionSummary: parseResult.inspectionSummary,
      });
    } catch (error) {
      setReviewBundleStatus({
        state: "error",
        message:
          error instanceof Error
            ? error.message
            : "ReviewResult bundle import failed.",
      });
    }
  }

  function startInvestigation() {
    navigateToStage("blind_read");
  }

  function revealAiLabel() {
    if (!reviewState.blindChoiceId) {
      navigateToStage("blind_read");
      return;
    }

    dispatchArena({ type: "revealAiLabel" });

    const nextPath = getPathForArenaStage("ai_reveal");
    if (nextPath !== pathname) {
      navigatePath({
        nextPath,
        preserveImportedState: selectedCaseIsImported,
        onNavigatePath,
        onNavigatePathPreservingState,
      });
    }
  }

  async function handleCopyReviewJson() {
    if (!exportJson) {
      setExportMessage(exportError);
      return;
    }

    if (!navigator.clipboard?.writeText) {
      setExportMessage("Clipboard is unavailable. Use Download JSON.");
      return;
    }

    try {
      await navigator.clipboard.writeText(exportJson);
      setExportMessage(
        formatExportActionMessage(
          "Copied structured review JSON.",
          trySaveReviewResultLocally(),
        ),
      );
    } catch {
      setExportMessage("Clipboard copy failed. Use Download JSON.");
    }
  }

  function handleDownloadReviewJson() {
    if (!exportJson || !selectedCase) {
      setExportMessage(exportError);
      return;
    }

    const exportBlob = new Blob([exportJson], { type: "application/json" });
    const exportUrl = URL.createObjectURL(exportBlob);
    const downloadLink = document.createElement("a");

    downloadLink.href = exportUrl;
    downloadLink.download = getReviewResultExportFilename(selectedCase);
    document.body.append(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    URL.revokeObjectURL(exportUrl);
    setExportMessage(
      formatExportActionMessage(
        "Downloaded structured review JSON.",
        trySaveReviewResultLocally(),
      ),
    );
  }

  function trySaveReviewResultLocally(): string | undefined {
    if (!exportResult.ok) {
      return exportError;
    }

    if (typeof window === "undefined" || !window.localStorage) {
      return "Local ReviewResult storage is unavailable.";
    }

    try {
      saveReviewResultToLocalStoreV01(
        window.localStorage,
        exportResult.reviewResult,
      );
      return undefined;
    } catch (error) {
      return error instanceof Error
        ? `Local ReviewResult save failed: ${error.message}`
        : "Local ReviewResult save failed.";
    }
  }

  function openReviewDrawer() {
    dispatchArena({ type: "setReviewDrawerOpen", open: true });
  }

  function closeReviewDrawer() {
    dispatchArena({ type: "setReviewDrawerOpen", open: false });
  }

  const isExploreMode = activeStage === "landscape";
  const showReviewOrientation =
    activeStage === "case_file" || activeStage === "blind_read";
  const stageTransitionKey = isExploreMode
    ? activeStage
    : `${selectedCase.id}-${activeStage}`;
  const shellClassName = [
    "arena-shell",
    isExploreMode ? "arena-shell-explore" : "arena-shell-investigate",
    `arena-stage-${activeStage}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <main className={shellClassName}>
      <ArenaHeader
        currentStage={activeStage}
        onSelectStage={navigateToStage}
        actions={
          <div className="arena-local-file-actions tc-masthead__actions-grid">
            <div className="tc-masthead__action-group tc-masthead__action-group--results">
              <span className="tc-masthead__group-label tc-masthead__action-label tc-masthead__action-label--empty" aria-hidden="true" />
              <div className="tc-masthead__action-row tc-masthead__button-row">
                <Link className="arena-header-link" href="/results">
                  Results
                </Link>
              </div>
              <p className="tc-masthead__action-helper tc-masthead__action-helper--empty" aria-hidden="true" />
            </div>
            <CasePackageImportControl
              status={importStatus}
              onImportStart={handleImportStart}
              onImportText={handleImportCasePackageJson}
              onImportReadError={handleImportReadError}
              onClearImport={handleClearImport}
            />
            <HotFolderCasePackageControl
              status={hotFolderStatus}
              polling={hotFolderPolling}
              onCheck={handleCheckHotFolder}
              onTogglePolling={handleToggleHotFolderPolling}
              onLoadNext={handleLoadNextHotFolderCandidate}
            />
            <ReviewResultBundleControl
              status={reviewBundleStatus}
              onExport={handleExportReviewResultBundle}
              onImportStart={handleReviewResultBundleImportStart}
              onImportText={handleImportReviewResultBundleJson}
              onImportReadError={handleReviewResultBundleImportReadError}
            />
          </div>
        }
      />

      <div
        className={`arena-layout ${
          showReviewOrientation
            ? "arena-layout-with-orientation"
            : "arena-layout-review-only"
        }`}
      >
        {showReviewOrientation ? <ArenaReviewerGoal /> : null}
        <section className="arena-workspace" aria-live="polite">
          <div
            key={stageTransitionKey}
            className="stage-transition"
          >
            {renderStage({
              cases: activeCases,
              landscapeContextNodes,
              selectedCase,
              previewCaseId,
              activeStage,
              reviewState,
              insufficientContextGuidance,
              evidenceRatings,
              evidenceBalance,
              setPreviewCaseId,
              dispatchArena,
              navigateToStage,
              openCaseFile,
              startInvestigation,
              revealAiLabel,
              handleCopyReviewJson,
              handleDownloadReviewJson,
              openReviewDrawer,
            })}
          </div>
        </section>
      </div>

      {arenaState.reviewDrawerOpen ? (
        <ReviewSummaryDrawer
          open={arenaState.reviewDrawerOpen}
          caseFile={selectedCase}
          reviewState={reviewState}
          blindChoice={blindChoice}
          duelWinner={duelWinner}
          impostor={impostor}
          balance={evidenceBalance}
          exportJson={exportJson ?? exportError ?? "ReviewResult v0.1 is unavailable."}
          exportMessage={exportMessage}
          onClose={closeReviewDrawer}
          onCopyJson={handleCopyReviewJson}
          onDownloadJson={handleDownloadReviewJson}
        />
      ) : null}
    </main>
  );
}

function tryBuildReviewResultExport(
  input: Parameters<typeof buildReviewResultExport>[0],
):
  | { ok: true; reviewResult: ReturnType<typeof buildReviewResultExport> }
  | { ok: false; error: string } {
  try {
    return { ok: true, reviewResult: buildReviewResultExport(input) };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "ReviewResult v0.1 export is unavailable.",
    };
  }
}

function formatExportActionMessage(actionMessage: string, saveError?: string) {
  if (saveError) {
    return `${actionMessage} ${saveError}`;
  }

  return `${actionMessage} Saved ReviewResult locally.`;
}

function downloadJsonFile(json: string, filename: string) {
  const exportBlob = new Blob([json], { type: "application/json" });
  const exportUrl = URL.createObjectURL(exportBlob);
  const downloadLink = document.createElement("a");

  downloadLink.href = exportUrl;
  downloadLink.download = filename;
  document.body.append(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  URL.revokeObjectURL(exportUrl);
}

function cacheCasePackageForResults(casePackage: CasePackageV01): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const storage = window.sessionStorage;

    if (!storage) {
      return false;
    }

    saveCasePackageToSessionStoreV01(storage, casePackage);
    return true;
  } catch {
    return false;
  }
}

export function navigatePath({
  nextPath,
  preserveImportedState,
  onNavigatePath,
  onNavigatePathPreservingState,
}: {
  nextPath: string;
  preserveImportedState: boolean;
  onNavigatePath: (path: string) => void;
  onNavigatePathPreservingState: (path: string) => void;
}) {
  if (preserveImportedState) {
    onNavigatePathPreservingState(nextPath);
    return;
  }

  onNavigatePath(nextPath);
}

function toImportFailureDetails(
  importResult: Extract<CasePackageImportResult, { ok: false }>,
): CasePackageImportFailureDetails {
  return {
    reason: importResult.reason,
    title: importResult.title,
    summary: importResult.summary,
    suggestedFix: importResult.suggestedFix,
    message: importResult.message,
    errors: importResult.errors,
  };
}

function getUnseenHotFolderCandidates(
  candidates: HotFolderCasePackageValidCandidate[],
  seenCandidateIds: Set<string>,
): HotFolderCasePackageValidCandidate[] {
  const importKeysSeenInScan = new Set<string>();
  const unseenCandidates: HotFolderCasePackageValidCandidate[] = [];

  for (const candidate of candidates) {
    if (importKeysSeenInScan.has(candidate.importKey)) {
      continue;
    }

    importKeysSeenInScan.add(candidate.importKey);

    if (!seenCandidateIds.has(candidate.candidateId)) {
      unseenCandidates.push(candidate);
    }
  }

  return unseenCandidates;
}

function buildHotFolderReadyMessage(
  scan: HotFolderCasePackageScanResponse,
  unseenCount: number,
): string {
  if (unseenCount === 0) {
    return scan.validCandidates.length > 0
      ? "No new valid CasePackages found in configured Hot-Folder."
      : "No valid CasePackages found in configured Hot-Folder.";
  }

  if (unseenCount === 1) {
    return "1 new valid CasePackage found in configured Hot-Folder.";
  }

  return `${unseenCount} new valid CasePackages found in configured Hot-Folder.`;
}

function buildHotFolderLoadedMessage(
  candidate: HotFolderCasePackageValidCandidate,
  scan?: HotFolderCasePackageScanResponse,
): string {
  const duplicateNote =
    candidate.duplicateCount > 1
      ? ` Newest of ${candidate.duplicateCount} duplicate files was used.`
      : "";
  const invalidNote =
    scan && scan.invalidCandidates.length > 0
      ? ` ${scan.invalidCandidates.length} invalid candidate${scan.invalidCandidates.length === 1 ? "" : "s"} ignored.`
      : "";

  return `Loaded ${candidate.packageId} from configured Hot-Folder.${duplicateNote}${invalidNote}`;
}

function getHotFolderInvalidSummary(
  scan: HotFolderCasePackageScanResponse,
): string | undefined {
  const firstInvalidCandidate = scan.invalidCandidates[0];

  if (!firstInvalidCandidate) {
    return undefined;
  }

  return `${firstInvalidCandidate.filename}: ${firstInvalidCandidate.message}`;
}

function readArenaSessionState(cases: CaseFile[]) {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    const storedState = window.sessionStorage.getItem(arenaSessionStateKey);

    if (!storedState) {
      return undefined;
    }

    const parsedState = JSON.parse(storedState) as Partial<
      Pick<ArenaUiState, "reviewsByCase" | "selectedCaseId">
    >;
    const persistedSelectedCaseId = parsedState.selectedCaseId;
    const selectedCaseId =
      typeof persistedSelectedCaseId === "string" &&
      cases.some((caseFile) => caseFile.id === persistedSelectedCaseId)
        ? persistedSelectedCaseId
        : cases[0]?.id ?? "";

    return {
      selectedCaseId,
      reviewsByCase: parsedState.reviewsByCase,
    };
  } catch {
    return undefined;
  }
}

function persistArenaSessionState(
  state: ArenaUiState,
  persistableCaseIds: Set<string>,
) {
  if (typeof window === "undefined") {
    return;
  }

  const reviewsByCase = Object.fromEntries(
    Object.entries(state.reviewsByCase).filter(([caseId]) =>
      persistableCaseIds.has(caseId),
    ),
  );
  const selectedCaseId = persistableCaseIds.has(state.selectedCaseId)
    ? state.selectedCaseId
    : "";

  window.sessionStorage.setItem(
    arenaSessionStateKey,
    JSON.stringify({
      selectedCaseId,
      reviewsByCase,
    }),
  );
}

function renderStage({
  cases,
  landscapeContextNodes,
  selectedCase,
  previewCaseId,
  activeStage,
  reviewState,
  insufficientContextGuidance,
  evidenceRatings,
  evidenceBalance,
  setPreviewCaseId,
  dispatchArena,
  navigateToStage,
  openCaseFile,
  startInvestigation,
  revealAiLabel,
  handleCopyReviewJson,
  handleDownloadReviewJson,
  openReviewDrawer,
}: {
  cases: CaseFile[];
  landscapeContextNodes: LandscapeContextNode[];
  selectedCase: CaseFile;
  previewCaseId?: string;
  activeStage: ReturnType<typeof createInitialArenaState>["activeStage"];
  reviewState: ReturnType<typeof getCurrentReviewState>;
  insufficientContextGuidance?: ReturnType<typeof getInsufficientContextGuidance>;
  evidenceRatings: ReturnType<typeof getEvidenceRatings>;
  evidenceBalance: ReturnType<typeof getEvidenceBalance>;
  setPreviewCaseId: (caseId?: string) => void;
  dispatchArena: (action: ArenaAction) => void;
  navigateToStage: (stage: ReturnType<typeof createInitialArenaState>["activeStage"]) => void;
  openCaseFile: () => void;
  startInvestigation: () => void;
  revealAiLabel: () => void;
  handleCopyReviewJson: () => void;
  handleDownloadReviewJson: () => void;
  openReviewDrawer: () => void;
}) {
  switch (activeStage) {
    case "case_file":
      return (
        <CaseFilePanel
          caseFile={selectedCase}
          cases={cases}
          landscapeContextNodes={landscapeContextNodes}
          onBackToLandscape={() => navigateToStage("landscape")}
          onStartInvestigation={startInvestigation}
        />
      );
    case "blind_read":
      return (
        <BlindReadPanel
          caseFile={selectedCase}
          reviewState={reviewState}
          onChooseReviewReadiness={(choice) =>
            dispatchArena({ type: "chooseReviewReadiness", choice })
          }
          onChooseBlindInterpretation={(optionId) =>
            dispatchArena({ type: "chooseBlindInterpretation", optionId })
          }
          onRevealAiLabel={revealAiLabel}
        />
      );
    case "ai_reveal":
      return (
        <AiRevealPanel
          caseFile={selectedCase}
          reviewState={reviewState}
          onRevealAiLabel={revealAiLabel}
          onContinue={() => navigateToStage("evidence_board")}
          onBackToBlindRead={() => navigateToStage("blind_read")}
        />
      );
    case "evidence_board":
      return (
        <EvidenceBoard
          caseFile={selectedCase}
          reviewState={reviewState}
          evidenceRatings={evidenceRatings}
          balance={evidenceBalance}
          insufficientContextGuidance={insufficientContextGuidance}
          onRateEvidence={(evidenceId, rating) =>
            dispatchArena({ type: "classifyEvidence", evidenceId, rating })
          }
          onBackToAiReveal={() => navigateToStage("ai_reveal")}
          onContinue={() => navigateToStage("label_duel")}
        />
      );
    case "label_duel":
      return (
        <LabelDuelPanel
          caseFile={selectedCase}
          reviewState={reviewState}
          insufficientContextGuidance={insufficientContextGuidance}
          onSelectWinner={(candidateId) =>
            dispatchArena({ type: "selectLabelDuelWinner", candidateId })
          }
          onToggleReason={(reason) =>
            dispatchArena({ type: "toggleDuelReason", reason })
          }
          onSetDuelNote={(note) => dispatchArena({ type: "setDuelNote", note })}
          onBackToEvidenceBoard={() => navigateToStage("evidence_board")}
          onContinue={() => navigateToStage("impostor")}
        />
      );
    case "impostor":
      return (
        <ImpostorPanel
          caseFile={selectedCase}
          reviewState={reviewState}
          onSelectSession={(sessionId) =>
            dispatchArena({ type: "selectImpostorSession", sessionId })
          }
          onBackToLabelDuel={() => navigateToStage("label_duel")}
          onContinue={() => navigateToStage("verdict")}
        />
      );
    case "verdict":
      return (
        <VerdictPanel
          caseFile={selectedCase}
          reviewState={reviewState}
          balance={evidenceBalance}
          insufficientContextGuidance={insufficientContextGuidance}
          onSelectVerdict={(verdict) =>
            dispatchArena({ type: "selectVerdict", verdict })
          }
          onToggleFailureMode={(reason) =>
            dispatchArena({ type: "toggleFailureMode", reason })
          }
          onSelectSplitRecommendationReason={(reason) =>
            dispatchArena({ type: "selectSplitRecommendationReason", reason })
          }
          onClearSplitRecommendation={() =>
            dispatchArena({ type: "clearSplitRecommendation" })
          }
          onToggleSplitRecommendationSession={(sessionId) =>
            dispatchArena({ type: "toggleSplitRecommendationSession", sessionId })
          }
          onToggleSplitRecommendationEvidence={(evidenceId) =>
            dispatchArena({ type: "toggleSplitRecommendationEvidence", evidenceId })
          }
          onSelectMergeRecommendationTarget={(neighborClusterId) =>
            dispatchArena({
              type: "selectMergeRecommendationTarget",
              neighborClusterId,
            })
          }
          onSelectMergeRecommendationReason={(reason) =>
            dispatchArena({ type: "selectMergeRecommendationReason", reason })
          }
          onClearMergeRecommendation={() =>
            dispatchArena({ type: "clearMergeRecommendation" })
          }
          onBackToImpostor={() => navigateToStage("impostor")}
          onOpenReviewDrawer={openReviewDrawer}
          onCopyJson={handleCopyReviewJson}
          onDownloadJson={handleDownloadReviewJson}
        />
      );
    case "landscape":
    default:
      return (
        <TelemetryGalaxy
          cases={cases}
          landscapeContextNodes={landscapeContextNodes}
          selectedCase={selectedCase}
          previewCaseId={previewCaseId}
          onSelectCase={(caseId) => dispatchArena({ type: "selectCase", caseId })}
          onPreviewCase={setPreviewCaseId}
          onClearPreview={() => setPreviewCaseId(undefined)}
          onOpenCaseFile={openCaseFile}
        />
      );
  }
}

function getProtectedArenaStage(
  requestedStage: ReturnType<typeof createInitialArenaState>["activeStage"],
  blindChoiceId?: string,
  aiLabelRevealed?: boolean,
): ReturnType<typeof createInitialArenaState>["activeStage"] {
  const requestedStageIndex = arenaStageIndex(requestedStage);
  const blindReadIndex = arenaStageIndex("blind_read");
  const aiRevealIndex = arenaStageIndex("ai_reveal");

  if (requestedStageIndex > blindReadIndex && !blindChoiceId) {
    return "blind_read";
  }

  if (requestedStageIndex > aiRevealIndex && !aiLabelRevealed) {
    return "ai_reveal";
  }

  return requestedStage;
}

function arenaStageIndex(
  stage: ReturnType<typeof createInitialArenaState>["activeStage"],
): number {
  return arenaStages.findIndex((currentStage) => currentStage.id === stage);
}
