import type {
  CaseFile,
  DuelReason,
  EvidenceRating,
  FinalVerdict,
} from "@/lib/types";
import type { EvidenceArenaReview } from "@/lib/exportReview";

export const arenaStages = [
  { id: "landscape", label: "Landscape" },
  { id: "case_file", label: "Case File" },
  { id: "blind_read", label: "Blind Read" },
  { id: "ai_reveal", label: "AI Reveal" },
  { id: "evidence_board", label: "Evidence Board" },
  { id: "label_duel", label: "Label Duel" },
  { id: "impostor", label: "Impostor" },
  { id: "verdict", label: "Verdict" },
] as const;

export type ArenaStage = (typeof arenaStages)[number]["id"];

export type CaseReviewState = {
  blindChoiceId?: string;
  aiLabelRevealed?: boolean;
  evidenceRatings?: Record<string, EvidenceRating>;
  labelDuelWinnerId?: string;
  duelReasons?: DuelReason[];
  duelNote?: string;
  impostorSessionId?: string;
  failureModes?: DuelReason[];
  finalVerdict?: FinalVerdict;
};

export type ArenaUiState = {
  selectedCaseId: string;
  activeStage: ArenaStage;
  reviewsByCase: Partial<Record<string, CaseReviewState>>;
  reviewDrawerOpen: boolean;
};

export type ArenaAction =
  | { type: "selectCase"; caseId: string }
  | { type: "startImportedCaseReview"; caseId: string }
  | {
      type: "hydrateSession";
      selectedCaseId?: string;
      reviewsByCase?: Partial<Record<string, CaseReviewState>>;
    }
  | { type: "openCaseFile" }
  | { type: "startInvestigation" }
  | { type: "goToStage"; stage: ArenaStage }
  | { type: "goToNextStage" }
  | { type: "goToPreviousStage" }
  | { type: "chooseBlindInterpretation"; optionId: string }
  | { type: "revealAiLabel" }
  | {
      type: "classifyEvidence";
      evidenceId: string;
      rating: EvidenceRating;
    }
  | { type: "selectLabelDuelWinner"; candidateId: string }
  | { type: "toggleDuelReason"; reason: DuelReason }
  | { type: "setDuelNote"; note: string }
  | { type: "selectImpostorSession"; sessionId: string }
  | { type: "selectVerdict"; verdict: FinalVerdict }
  | { type: "toggleFailureMode"; reason: DuelReason }
  | { type: "setReviewDrawerOpen"; open: boolean };

export type EvidenceBalance = {
  total: number;
  supporting: number;
  weak: number;
  contradictory: number;
  contextGaps: number;
  noise: number;
  counts: Record<EvidenceRating, number>;
};

export function createInitialArenaState(
  cases: CaseFile[],
  initialStage: ArenaStage = "landscape",
): ArenaUiState {
  const selectedCaseId = cases[0]?.id ?? "";

  return {
    selectedCaseId,
    activeStage: initialStage,
    reviewsByCase: getInitialReviewsByCase(cases, selectedCaseId, initialStage),
    reviewDrawerOpen: false,
  };
}

export function arenaReducer(
  state: ArenaUiState,
  action: ArenaAction,
  cases: CaseFile[],
): ArenaUiState {
  switch (action.type) {
    case "hydrateSession": {
      const hydratedSelectedCaseId =
        action.selectedCaseId && caseIdExists(cases, action.selectedCaseId)
          ? action.selectedCaseId
          : state.selectedCaseId;

      return {
        ...state,
        selectedCaseId: hydratedSelectedCaseId,
        reviewsByCase: mergeHydratedReviewsForVerdictDemo(
          state,
          hydratedSelectedCaseId,
          action.reviewsByCase,
        ),
      };
    }
    case "selectCase":
      return {
        ...state,
        selectedCaseId: caseIdExists(cases, action.caseId)
          ? action.caseId
          : state.selectedCaseId,
        activeStage: "landscape",
      };
    case "startImportedCaseReview":
      return {
        ...state,
        selectedCaseId: action.caseId,
        activeStage: "case_file",
        reviewDrawerOpen: false,
        reviewsByCase: {
          ...state.reviewsByCase,
          [action.caseId]: {},
        },
      };
    case "openCaseFile":
      return { ...state, activeStage: "case_file" };
    case "startInvestigation":
      return { ...state, activeStage: "blind_read" };
    case "goToStage":
      return { ...state, activeStage: action.stage };
    case "goToNextStage":
      return { ...state, activeStage: getAdjacentStage(state.activeStage, 1) };
    case "goToPreviousStage":
      return { ...state, activeStage: getAdjacentStage(state.activeStage, -1) };
    case "chooseBlindInterpretation":
      return updateSelectedReview(state, {
        blindChoiceId: action.optionId,
        aiLabelRevealed: false,
      });
    case "revealAiLabel":
      return updateSelectedReview(
        { ...state, activeStage: "ai_reveal" },
        { aiLabelRevealed: true },
      );
    case "classifyEvidence":
      return updateSelectedReview(state, {
        evidenceRatings: {
          ...(getCurrentReviewState(state).evidenceRatings ?? {}),
          [action.evidenceId]: action.rating,
        },
      });
    case "selectLabelDuelWinner":
      return updateSelectedReview(state, {
        labelDuelWinnerId: action.candidateId,
      });
    case "toggleDuelReason":
      return updateSelectedReview(state, {
        duelReasons: toggleArrayValue(
          getCurrentReviewState(state).duelReasons ?? [],
          action.reason,
        ),
      });
    case "setDuelNote":
      return updateSelectedReview(state, {
        duelNote: action.note.trim() ? action.note : undefined,
      });
    case "selectImpostorSession":
      return updateSelectedReview(state, {
        impostorSessionId: action.sessionId,
      });
    case "selectVerdict":
      return updateSelectedReview(state, {
        finalVerdict: action.verdict,
        failureModes:
          action.verdict === "supported"
            ? []
            : getCurrentReviewState(state).failureModes,
      });
    case "toggleFailureMode":
      return updateSelectedReview(state, {
        failureModes: toggleArrayValue(
          getCurrentReviewState(state).failureModes ?? [],
          action.reason,
        ),
      });
    case "setReviewDrawerOpen":
      return { ...state, reviewDrawerOpen: action.open };
    default:
      return state;
  }
}

export function getSelectedCase(
  cases: CaseFile[],
  state: ArenaUiState,
): CaseFile | undefined {
  return cases.find((currentCase) => currentCase.id === state.selectedCaseId) ?? cases[0];
}

export function getCurrentReviewState(state: ArenaUiState): CaseReviewState {
  return state.reviewsByCase[state.selectedCaseId] ?? {};
}

export function getEvidenceRatings(
  caseFile: CaseFile,
  reviewState: CaseReviewState,
): Record<string, EvidenceRating> {
  return {
    ...caseFile.defaultEvidenceRatings,
    ...(reviewState.evidenceRatings ?? {}),
  };
}

export function getEvidenceBalance(
  caseFile: CaseFile,
  evidenceRatings: Record<string, EvidenceRating>,
): EvidenceBalance {
  const counts: Record<EvidenceRating, number> = {
    supports_label: 0,
    weak_support: 0,
    irrelevant_noise: 0,
    contradicts_label: 0,
    needs_context: 0,
  };

  for (const evidence of caseFile.evidenceItems) {
    const rating = evidenceRatings[evidence.id] ?? "needs_context";
    counts[rating] += 1;
  }

  return {
    total: caseFile.evidenceItems.length,
    supporting: counts.supports_label,
    weak: counts.weak_support,
    contradictory: counts.contradicts_label,
    contextGaps: counts.needs_context,
    noise: counts.irrelevant_noise,
    counts,
  };
}

export function getReviewCompletion(
  reviewState: CaseReviewState,
  evidenceRatings: Record<string, EvidenceRating>,
  caseFile: CaseFile,
): number {
  const classifiedEvidenceCount = caseFile.evidenceItems.filter(
    (evidence) => evidenceRatings[evidence.id],
  ).length;

  return [
    reviewState.blindChoiceId,
    reviewState.aiLabelRevealed,
    classifiedEvidenceCount >= caseFile.evidenceItems.length,
    reviewState.labelDuelWinnerId,
    reviewState.impostorSessionId,
    reviewState.finalVerdict,
  ].filter(Boolean).length;
}

export function getStageCompletionMap(
  caseFile: CaseFile,
  reviewState: CaseReviewState,
  evidenceRatings: Record<string, EvidenceRating>,
): Record<ArenaStage, boolean> {
  const classifiedEvidenceCount = caseFile.evidenceItems.filter(
    (evidence) => evidenceRatings[evidence.id],
  ).length;

  return {
    landscape: true,
    case_file: true,
    blind_read: Boolean(reviewState.blindChoiceId),
    ai_reveal: Boolean(reviewState.aiLabelRevealed),
    evidence_board: classifiedEvidenceCount >= caseFile.evidenceItems.length,
    label_duel: Boolean(reviewState.labelDuelWinnerId),
    impostor: Boolean(reviewState.impostorSessionId),
    verdict: Boolean(reviewState.finalVerdict),
  };
}

export function buildArenaReview(
  caseFile: CaseFile,
  reviewState: CaseReviewState,
  evidenceRatings: Record<string, EvidenceRating>,
): EvidenceArenaReview {
  const blindChoice = caseFile.blindInterpretationOptions.find(
    (option) => option.id === reviewState.blindChoiceId,
  );
  const duelWinner = caseFile.candidateLabels.find(
    (label) => label.id === reviewState.labelDuelWinnerId,
  );
  const impostor = caseFile.representativeSessions.find(
    (session) => session.id === reviewState.impostorSessionId,
  );

  return {
    ...(blindChoice
      ? {
          blindChoiceId: blindChoice.id,
          blindChoiceLabel: blindChoice.label,
          blindChoiceAgreesWithAi: labelsMatch(
            blindChoice.label,
            caseFile.topicLabel.name,
          ),
        }
      : {}),
    aiLabel: caseFile.topicLabel.name,
    aiLabelRevealed: Boolean(reviewState.aiLabelRevealed),
    ...(duelWinner
      ? {
          labelDuelWinnerId: duelWinner.id,
          labelDuelWinnerLabel: duelWinner.label,
        }
      : {}),
    duelReasons: reviewState.duelReasons ?? [],
    ...(reviewState.duelNote ? { duelNote: reviewState.duelNote } : {}),
    evidenceRatings,
    ...(impostor
      ? {
          impostorSessionId: impostor.id,
          impostorSessionTitle: impostor.title,
          impostorExplanation:
            impostor.outlierReason ??
            "Reviewer-selected session recorded; no seeded outlier explanation is attached.",
        }
      : {}),
    failureModes: getCompatibleFailureModes(reviewState),
    ...(reviewState.finalVerdict ? { finalVerdict: reviewState.finalVerdict } : {}),
  };
}

export function getBlindAgreementCopy(
  blindChoiceLabel: string | undefined,
  caseFile: CaseFile,
): string {
  if (!blindChoiceLabel) {
    return "No blind choice was recorded before reveal.";
  }

  if (labelsMatch(blindChoiceLabel, caseFile.topicLabel.name)) {
    return "Your blind interpretation agrees with the AI label. The next question is whether the evidence is strong enough.";
  }

  return "Your blind interpretation differs from the AI label. Use the evidence board and label duel to judge which interpretation is better grounded.";
}

export function labelsMatch(left?: string, right?: string): boolean {
  if (!left || !right) {
    return false;
  }

  return normalizeLabel(left) === normalizeLabel(right);
}

export function getAdjacentStage(stage: ArenaStage, direction: 1 | -1): ArenaStage {
  const currentIndex = arenaStages.findIndex((currentStage) => currentStage.id === stage);
  const nextIndex = Math.min(
    Math.max(currentIndex + direction, 0),
    arenaStages.length - 1,
  );

  return arenaStages[nextIndex]?.id ?? stage;
}

function updateSelectedReview(
  state: ArenaUiState,
  nextReviewState: Partial<CaseReviewState>,
): ArenaUiState {
  return {
    ...state,
    reviewsByCase: {
      ...state.reviewsByCase,
      [state.selectedCaseId]: {
        ...state.reviewsByCase[state.selectedCaseId],
        ...nextReviewState,
      },
    },
  };
}

function getInitialReviewsByCase(
  cases: CaseFile[],
  selectedCaseId: string,
  initialStage: ArenaStage,
): ArenaUiState["reviewsByCase"] {
  if (initialStage !== "verdict") {
    return {};
  }

  const selectedCase = cases.find((caseFile) => caseFile.id === selectedCaseId);
  const seededReview = getSeededVerdictDemoReview(selectedCase);

  return seededReview && selectedCase ? { [selectedCase.id]: seededReview } : {};
}

function getSeededVerdictDemoReview(
  caseFile: CaseFile | undefined,
): CaseReviewState | undefined {
  if (caseFile?.id !== "case-arena-001") {
    return undefined;
  }

  return {
    blindChoiceId: "cloud-resource-discovery",
    aiLabelRevealed: true,
    labelDuelWinnerId: "label-iam-baseline",
    impostorSessionId: "iam-s-01",
    failureModes: ["less_overclaimed", "missing_evidence"],
    finalVerdict: "unsupported_overclaimed",
  };
}

export function getCompatibleFailureModes(
  reviewState: CaseReviewState,
): DuelReason[] {
  if (reviewState.finalVerdict === "supported") {
    return [];
  }

  return reviewState.failureModes ?? [];
}

function mergeHydratedReviewsForVerdictDemo(
  state: ArenaUiState,
  selectedCaseId: string,
  hydratedReviews?: ArenaUiState["reviewsByCase"],
): ArenaUiState["reviewsByCase"] {
  const reviewsByCase = hydratedReviews ?? state.reviewsByCase;
  const seededReview = state.reviewsByCase[selectedCaseId];
  const hydratedReview = reviewsByCase[selectedCaseId];

  if (
    state.activeStage !== "verdict" ||
    !seededReview?.finalVerdict ||
    hydratedReview?.finalVerdict
  ) {
    return reviewsByCase;
  }

  return {
    ...reviewsByCase,
    [selectedCaseId]: {
      ...hydratedReview,
      ...seededReview,
    },
  };
}

function caseIdExists(cases: CaseFile[], caseId: string): boolean {
  return cases.some((currentCase) => currentCase.id === caseId);
}

function normalizeLabel(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function toggleArrayValue<T>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((currentValue) => currentValue !== value)
    : [...values, value];
}
