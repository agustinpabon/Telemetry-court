"use client";

import { useEffect, useReducer, useRef, useState } from "react";

import { AiRevealPanel } from "@/components/arena/AiRevealPanel";
import { BlindReadPanel } from "@/components/arena/BlindReadPanel";
import { CaseFilePanel } from "@/components/arena/CaseFilePanel";
import { EvidenceBoard } from "@/components/arena/EvidenceBoard";
import { ImpostorPanel } from "@/components/arena/ImpostorPanel";
import { LabelDuelPanel } from "@/components/arena/LabelDuelPanel";
import { ReviewSummaryDrawer } from "@/components/arena/ReviewSummaryDrawer";
import { TelemetryGalaxy } from "@/components/arena/TelemetryGalaxy";
import { VerdictPanel } from "@/components/arena/VerdictPanel";
import { ArenaHeader } from "@/components/arena/WorkflowPrimitives";
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
import type { CaseFile, LandscapeContextNode } from "@/lib/types";

type AppShellProps = {
  cases: CaseFile[];
  landscapeContextNodes?: LandscapeContextNode[];
  initialStage: ReturnType<typeof createInitialArenaState>["activeStage"];
  pathname: string;
  onNavigatePath: (path: string) => void;
};

const arenaSessionStateKey = "telemetry-court-arena-state-v1";

export function AppShell({
  cases,
  landscapeContextNodes = [],
  initialStage,
  pathname,
  onNavigatePath,
}: AppShellProps) {
  const [arenaState, rawDispatch] = useReducer(
    (state: ReturnType<typeof createInitialArenaState>, action: ArenaAction) =>
      arenaReducer(state, action, cases),
    { cases, initialStage },
    ({ cases: initialCases, initialStage: nextInitialStage }) =>
      createInitialArenaState(initialCases, nextInitialStage),
  );
  const sessionHydrationCheckedRef = useRef(false);
  const sessionHydrationPendingRef = useRef(false);
  const [previewCaseId, setPreviewCaseId] = useState<string>();
  const [exportMessage, setExportMessage] = useState<string>();

  const selectedCase = getSelectedCase(cases, arenaState);
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

    persistArenaSessionState(arenaState);
  }, [arenaState]);

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
      onNavigatePath(protectedPath);
    }

    if (protectedRouteStage !== arenaState.activeStage) {
      rawDispatch({ type: "goToStage", stage: protectedRouteStage });
    }
  }, [
    aiLabelRevealed,
    arenaState.activeStage,
    blindChoiceId,
    onNavigatePath,
    pathname,
  ]);

  if (!selectedCase) {
    return (
      <main className="arena-empty">
        <section>
          <p className="eyebrow">Telemetry Court</p>
          <h1>No evidence arena cases are available</h1>
        </section>
      </main>
    );
  }

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
  const exportJson = serializeReviewResultExport(
    buildReviewResultExport({
      caseFile: selectedCase,
      exportTimestamp: new Date().toISOString(),
      arenaReview,
    }),
  );

  function dispatchArena(action: ArenaAction) {
    persistArenaSessionState(arenaReducer(arenaState, action, cases));
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
      onNavigatePath(nextPath);
    }

    dispatchArena({ type: "goToStage", stage: protectedStage });
  }

  function openCaseFile() {
    navigateToStage("case_file");
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
      onNavigatePath(nextPath);
    }
  }

  async function handleCopyReviewJson() {
    if (!navigator.clipboard?.writeText) {
      setExportMessage("Clipboard is unavailable. Use Download JSON.");
      return;
    }

    try {
      await navigator.clipboard.writeText(exportJson);
      setExportMessage("Copied structured review JSON.");
    } catch {
      setExportMessage("Clipboard copy failed. Use Download JSON.");
    }
  }

  function handleDownloadReviewJson() {
    if (!selectedCase) {
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
    setExportMessage("Downloaded structured review JSON.");
  }

  function openReviewDrawer() {
    dispatchArena({ type: "setReviewDrawerOpen", open: true });
  }

  function closeReviewDrawer() {
    dispatchArena({ type: "setReviewDrawerOpen", open: false });
  }

  const isExploreMode = activeStage === "landscape";
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
        actions={
          activeStage === "verdict" ? (
            <details className="arena-utility-menu">
              <summary>Review data</summary>
              <div className="arena-utility-menu-panel">
                <button type="button" onClick={openReviewDrawer}>
                  Review JSON
                </button>
              </div>
            </details>
          ) : null
        }
      />

      <div className="arena-layout">
        <section className="arena-workspace" aria-live="polite">
          <div
            key={stageTransitionKey}
            className="stage-transition"
          >
            {renderStage({
              cases,
              landscapeContextNodes,
              selectedCase,
              previewCaseId,
              activeStage,
              reviewState,
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
          exportJson={exportJson}
          exportMessage={exportMessage}
          onClose={closeReviewDrawer}
          onCopyJson={handleCopyReviewJson}
          onDownloadJson={handleDownloadReviewJson}
        />
      ) : null}
    </main>
  );
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

function persistArenaSessionState(state: ArenaUiState) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    arenaSessionStateKey,
    JSON.stringify({
      selectedCaseId: state.selectedCaseId,
      reviewsByCase: state.reviewsByCase,
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
          onSelectStage={navigateToStage}
        />
      );
    case "blind_read":
      return (
        <BlindReadPanel
          caseFile={selectedCase}
          reviewState={reviewState}
          onChooseBlindInterpretation={(optionId) =>
            dispatchArena({ type: "chooseBlindInterpretation", optionId })
          }
          onRevealAiLabel={revealAiLabel}
          onSelectStage={navigateToStage}
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
          onSelectStage={navigateToStage}
        />
      );
    case "evidence_board":
      return (
        <EvidenceBoard
          caseFile={selectedCase}
          reviewState={reviewState}
          evidenceRatings={evidenceRatings}
          balance={evidenceBalance}
          onRateEvidence={(evidenceId, rating) =>
            dispatchArena({ type: "classifyEvidence", evidenceId, rating })
          }
          onBackToAiReveal={() => navigateToStage("ai_reveal")}
          onContinue={() => navigateToStage("label_duel")}
          onSelectStage={navigateToStage}
        />
      );
    case "label_duel":
      return (
        <LabelDuelPanel
          caseFile={selectedCase}
          reviewState={reviewState}
          onSelectWinner={(candidateId) =>
            dispatchArena({ type: "selectLabelDuelWinner", candidateId })
          }
          onToggleReason={(reason) =>
            dispatchArena({ type: "toggleDuelReason", reason })
          }
          onBackToEvidenceBoard={() => navigateToStage("evidence_board")}
          onContinue={() => navigateToStage("impostor")}
          onSelectStage={navigateToStage}
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
          onSelectStage={navigateToStage}
        />
      );
    case "verdict":
      return (
        <VerdictPanel
          caseFile={selectedCase}
          reviewState={reviewState}
          balance={evidenceBalance}
          onSelectVerdict={(verdict) =>
            dispatchArena({ type: "selectVerdict", verdict })
          }
          onToggleFailureMode={(reason) =>
            dispatchArena({ type: "toggleFailureMode", reason })
          }
          onBackToImpostor={() => navigateToStage("impostor")}
          onOpenReviewDrawer={openReviewDrawer}
          onCopyJson={handleCopyReviewJson}
          onDownloadJson={handleDownloadReviewJson}
          onSelectStage={navigateToStage}
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
          onSelectStage={navigateToStage}
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
