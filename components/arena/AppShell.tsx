"use client";

import { useEffect, useReducer, useState } from "react";

import { AiRevealPanel } from "@/components/arena/AiRevealPanel";
import { BlindReadPanel } from "@/components/arena/BlindReadPanel";
import { CaseFilePanel } from "@/components/arena/CaseFilePanel";
import { EvidenceBoard } from "@/components/arena/EvidenceBoard";
import { ImpostorPanel } from "@/components/arena/ImpostorPanel";
import { InvestigationCockpit } from "@/components/arena/InvestigationCockpit";
import { LabelDuelPanel } from "@/components/arena/LabelDuelPanel";
import { ReviewSummaryDrawer } from "@/components/arena/ReviewSummaryDrawer";
import { StageRail } from "@/components/arena/StageRail";
import { TelemetryGalaxy } from "@/components/arena/TelemetryGalaxy";
import { VerdictPanel } from "@/components/arena/VerdictPanel";
import {
  getArenaStageForPathname,
  getPathForArenaStage,
} from "@/lib/arenaRoutes";
import {
  arenaReducer,
  buildArenaReview,
  createInitialArenaState,
  getAdjacentStage,
  getCurrentReviewState,
  getEvidenceBalance,
  getEvidenceRatings,
  getReviewCompletion,
  getSelectedCase,
  getStageCompletionMap,
  type ArenaAction,
  type ArenaUiState,
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
      createInitialStateWithSession(initialCases, nextInitialStage),
  );
  const [previewCaseId, setPreviewCaseId] = useState<string>();
  const [exportMessage, setExportMessage] = useState<string>();

  const selectedCase = getSelectedCase(cases, arenaState);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [arenaState.activeStage, selectedCase?.id]);

  useEffect(() => {
    persistArenaSessionState(arenaState);
  }, [arenaState]);

  useEffect(() => {
    const routeStage = getArenaStageForPathname(pathname);

    if (routeStage && routeStage !== arenaState.activeStage) {
      rawDispatch({ type: "goToStage", stage: routeStage });
    }
  }, [arenaState.activeStage, pathname]);

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

  const reviewState = getCurrentReviewState(arenaState);
  const evidenceRatings = getEvidenceRatings(selectedCase, reviewState);
  const evidenceBalance = getEvidenceBalance(selectedCase, evidenceRatings);
  const reviewCompletion = getReviewCompletion(
    reviewState,
    evidenceRatings,
    selectedCase,
  );
  const completedStages = getStageCompletionMap(
    selectedCase,
    reviewState,
    evidenceRatings,
  );
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
    const nextPath = getPathForArenaStage(stage);

    if (nextPath !== pathname) {
      onNavigatePath(nextPath);
    }

    dispatchArena({ type: "goToStage", stage });
  }

  function goToAdjacentStage(direction: 1 | -1) {
    navigateToStage(getAdjacentStage(arenaState.activeStage, direction));
  }

  function openCaseFile() {
    navigateToStage("case_file");
  }

  function startInvestigation() {
    navigateToStage("blind_read");
  }

  function revealAiLabel() {
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

  const isExploreMode = arenaState.activeStage === "landscape";
  const stageTransitionKey = isExploreMode
    ? arenaState.activeStage
    : `${selectedCase.id}-${arenaState.activeStage}`;
  const shellClassName = [
    "arena-shell",
    isExploreMode ? "arena-shell-explore" : "arena-shell-investigate",
    `arena-stage-${arenaState.activeStage}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <main className={shellClassName}>
      <header className="arena-topbar">
        <div className="arena-brand">
          <div>
            <h1>Telemetry Court</h1>
            <p>Evidence review for AI-named telemetry clusters.</p>
          </div>
        </div>
        <div className="arena-topbar-actions">
          <details className="arena-utility-menu">
            <summary>Export</summary>
            <div className="arena-utility-menu-panel">
              <button type="button" onClick={openReviewDrawer}>
                Review JSON
              </button>
            </div>
          </details>
        </div>
      </header>

      <div className="arena-layout">
        <StageRail
          activeStage={arenaState.activeStage}
          completedStages={completedStages}
          onSelectStage={navigateToStage}
        />

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
              activeStage: arenaState.activeStage,
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

          {isExploreMode ? null : (
            <div className="stage-controls">
              <button
                type="button"
                onClick={() => goToAdjacentStage(-1)}
                disabled={arenaState.activeStage === "landscape"}
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => goToAdjacentStage(1)}
                disabled={arenaState.activeStage === "verdict"}
              >
                Next
              </button>
            </div>
          )}
        </section>

        {!isExploreMode && arenaState.activeStage !== "case_file" ? (
          <InvestigationCockpit
            key={selectedCase.id}
            caseFile={selectedCase}
            activeStage={arenaState.activeStage}
            reviewState={reviewState}
            reviewCompletion={reviewCompletion}
            onOpenCaseFile={openCaseFile}
            onStartInvestigation={startInvestigation}
            onRevealAiLabel={revealAiLabel}
            onOpenReviewDrawer={openReviewDrawer}
          />
        ) : null}
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

function createInitialStateWithSession(
  cases: CaseFile[],
  initialStage: ReturnType<typeof createInitialArenaState>["activeStage"],
): ArenaUiState {
  const fallbackState = createInitialArenaState(cases, initialStage);

  if (typeof window === "undefined") {
    return fallbackState;
  }

  try {
    const storedState = window.sessionStorage.getItem(arenaSessionStateKey);

    if (!storedState) {
      return fallbackState;
    }

    const parsedState = JSON.parse(storedState) as Partial<
      Pick<ArenaUiState, "reviewsByCase" | "selectedCaseId">
    >;
    const persistedSelectedCaseId = parsedState.selectedCaseId;
    const selectedCaseId =
      typeof persistedSelectedCaseId === "string" &&
      cases.some((caseFile) => caseFile.id === persistedSelectedCaseId)
        ? persistedSelectedCaseId
        : fallbackState.selectedCaseId;

    return {
      ...fallbackState,
      selectedCaseId,
      reviewsByCase: parsedState.reviewsByCase ?? fallbackState.reviewsByCase,
    };
  } catch {
    return fallbackState;
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
          onStartInvestigation={startInvestigation}
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
        />
      );
    case "ai_reveal":
      return (
        <AiRevealPanel
          caseFile={selectedCase}
          reviewState={reviewState}
          onRevealAiLabel={revealAiLabel}
          onContinue={() => navigateToStage("evidence_board")}
        />
      );
    case "evidence_board":
      return (
        <EvidenceBoard
          caseFile={selectedCase}
          evidenceRatings={evidenceRatings}
          balance={evidenceBalance}
          onRateEvidence={(evidenceId, rating) =>
            dispatchArena({ type: "classifyEvidence", evidenceId, rating })
          }
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
          onContinue={() => navigateToStage("verdict")}
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
