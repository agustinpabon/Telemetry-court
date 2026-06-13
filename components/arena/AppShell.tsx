"use client";

import { useReducer, useState } from "react";

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
  arenaReducer,
  buildArenaReview,
  createInitialArenaState,
  getCurrentReviewState,
  getEvidenceBalance,
  getEvidenceRatings,
  getReviewCompletion,
  getSelectedCase,
  getStageCompletionMap,
  type ArenaAction,
} from "@/lib/arenaReviewState";
import {
  buildReviewResultExport,
  getReviewResultExportFilename,
  serializeReviewResultExport,
} from "@/lib/exportReview";
import type { CaseFile } from "@/lib/types";

type AppShellProps = {
  cases: CaseFile[];
};

export function AppShell({ cases }: AppShellProps) {
  const [arenaState, rawDispatch] = useReducer(
    (state: ReturnType<typeof createInitialArenaState>, action: ArenaAction) =>
      arenaReducer(state, action, cases),
    cases,
    createInitialArenaState,
  );
  const [previewCaseId, setPreviewCaseId] = useState<string>();
  const [exportMessage, setExportMessage] = useState<string>();

  const selectedCase = getSelectedCase(cases, arenaState);

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
    rawDispatch(action);
    setExportMessage(undefined);
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

  return (
    <main
      className={`arena-shell ${
        isExploreMode ? "arena-shell-explore" : "arena-shell-investigate"
      } arena-stage-${arenaState.activeStage}`}
    >
      <header className="arena-topbar">
        <div className="arena-brand">
          <span className="brand-mark" aria-hidden="true">
            TC
          </span>
          <div>
            <p>Telemetry Court</p>
            <h1>AI names the pattern. Humans test the evidence.</h1>
          </div>
        </div>
        <div className="arena-topbar-actions">
          <span>{reviewCompletion}/6 review steps</span>
          <button type="button" onClick={openReviewDrawer}>
            Review JSON
          </button>
        </div>
      </header>

      <div className="arena-layout">
        <StageRail
          activeStage={arenaState.activeStage}
          completedStages={completedStages}
          onSelectStage={(stage) => dispatchArena({ type: "goToStage", stage })}
        />

        <section className="arena-workspace" aria-live="polite">
          <div
            key={`${selectedCase.id}-${arenaState.activeStage}`}
            className="stage-transition"
          >
            {renderStage({
              cases,
              selectedCase,
              previewCaseId,
              activeStage: arenaState.activeStage,
              reviewState,
              evidenceRatings,
              evidenceBalance,
              setPreviewCaseId,
              dispatchArena,
              handleCopyReviewJson,
              handleDownloadReviewJson,
              openReviewDrawer,
            })}
          </div>

          <div className="stage-controls">
            <button
              type="button"
              onClick={() => dispatchArena({ type: "goToPreviousStage" })}
              disabled={arenaState.activeStage === "landscape"}
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => dispatchArena({ type: "goToNextStage" })}
              disabled={arenaState.activeStage === "verdict"}
            >
              Next
            </button>
          </div>
        </section>

        <InvestigationCockpit
          key={selectedCase.id}
          caseFile={selectedCase}
          activeStage={arenaState.activeStage}
          reviewState={reviewState}
          reviewCompletion={reviewCompletion}
          onOpenCaseFile={() => dispatchArena({ type: "openCaseFile" })}
          onStartInvestigation={() => dispatchArena({ type: "startInvestigation" })}
          onRevealAiLabel={() => dispatchArena({ type: "revealAiLabel" })}
          onOpenReviewDrawer={openReviewDrawer}
        />
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

function renderStage({
  cases,
  selectedCase,
  previewCaseId,
  activeStage,
  reviewState,
  evidenceRatings,
  evidenceBalance,
  setPreviewCaseId,
  dispatchArena,
  handleCopyReviewJson,
  handleDownloadReviewJson,
  openReviewDrawer,
}: {
  cases: CaseFile[];
  selectedCase: CaseFile;
  previewCaseId?: string;
  activeStage: ReturnType<typeof createInitialArenaState>["activeStage"];
  reviewState: ReturnType<typeof getCurrentReviewState>;
  evidenceRatings: ReturnType<typeof getEvidenceRatings>;
  evidenceBalance: ReturnType<typeof getEvidenceBalance>;
  setPreviewCaseId: (caseId?: string) => void;
  dispatchArena: (action: ArenaAction) => void;
  handleCopyReviewJson: () => void;
  handleDownloadReviewJson: () => void;
  openReviewDrawer: () => void;
}) {
  switch (activeStage) {
    case "case_file":
      return (
        <CaseFilePanel
          caseFile={selectedCase}
          onStartInvestigation={() => dispatchArena({ type: "startInvestigation" })}
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
          onRevealAiLabel={() => dispatchArena({ type: "revealAiLabel" })}
        />
      );
    case "ai_reveal":
      return (
        <AiRevealPanel
          caseFile={selectedCase}
          reviewState={reviewState}
          onRevealAiLabel={() => dispatchArena({ type: "revealAiLabel" })}
          onContinue={() => dispatchArena({ type: "goToStage", stage: "evidence_board" })}
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
          onContinue={() => dispatchArena({ type: "goToStage", stage: "impostor" })}
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
          onContinue={() => dispatchArena({ type: "goToStage", stage: "verdict" })}
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
          selectedCase={selectedCase}
          previewCaseId={previewCaseId}
          onSelectCase={(caseId) => dispatchArena({ type: "selectCase", caseId })}
          onPreviewCase={setPreviewCaseId}
          onClearPreview={() => setPreviewCaseId(undefined)}
        />
      );
  }
}
