"use client";

import { useState, type ReactNode } from "react";

import { sampleCases } from "@/data/sampleCases";
import { formatSupportScore, getAverageSupportScore } from "@/lib/caseMetrics";
import {
  buildReviewResultExport,
  getReviewResultExportFilename,
  serializeReviewResultExport,
  type EvidenceArenaReview,
} from "@/lib/exportReview";
import type {
  CandidateLabelSource,
  CaseFile,
  DuelReason,
  EvidenceRating,
  FinalVerdict,
  LandscapeStatus,
  RepresentativeSession,
  ReviewStatus,
} from "@/lib/types";

type CaseReviewState = {
  blindChoiceId?: string;
  aiLabelRevealed?: boolean;
  evidenceRatings?: Record<string, EvidenceRating>;
  labelDuelWinnerId?: string;
  duelReasons?: DuelReason[];
  impostorSessionId?: string;
  failureModes?: DuelReason[];
  finalVerdict?: FinalVerdict;
  showJson?: boolean;
};

const workflowSteps = [
  "Landscape",
  "Case file",
  "Blind read",
  "AI reveal",
  "Evidence board",
  "Label duel",
  "Impostor",
  "Verdict",
];

const landscapeStatusMeta: Record<
  LandscapeStatus,
  { label: string; className: string; dotClassName: string }
> = {
  supported: {
    label: "Supported",
    className:
      "border-[color:rgba(63,125,85,0.22)] bg-[var(--color-supported-soft)] text-[var(--color-supported)]",
    dotClassName: "bg-[var(--color-supported)]",
  },
  overclaimed: {
    label: "Overclaimed",
    className:
      "border-[color:rgba(155,61,53,0.2)] bg-[var(--color-contradicted-soft)] text-[var(--color-contradicted)]",
    dotClassName: "bg-[var(--color-contradicted)]",
  },
  impure: {
    label: "Impure",
    className:
      "border-[color:rgba(154,106,47,0.22)] bg-[var(--color-uncertain-soft)] text-[var(--color-uncertain)]",
    dotClassName: "bg-[var(--color-uncertain)]",
  },
  too_broad: {
    label: "Too broad",
    className:
      "border-[color:rgba(95,111,82,0.18)] bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]",
    dotClassName: "bg-[var(--color-accent)]",
  },
  uncertain: {
    label: "Uncertain",
    className:
      "border-[color:rgba(107,111,122,0.2)] bg-[var(--color-unsupported-soft)] text-[var(--color-unsupported)]",
    dotClassName: "bg-[var(--color-unsupported)]",
  },
};

const reviewStatusLabel: Record<ReviewStatus, string> = {
  unreviewed: "Unreviewed",
  in_review: "In review",
  needs_split: "Needs split",
  needs_evidence: "Needs evidence",
  reviewed: "Reviewed",
};

const candidateSourceLabel: Record<CandidateLabelSource, string> = {
  baseline_ai: "Baseline AI",
  evidence_constrained_ai: "Evidence-constrained AI",
  human_style: "Human-style label",
  uncertain_label: "Uncertain label",
};

const evidenceRatingMeta: Record<
  EvidenceRating,
  { label: string; shortLabel: string; className: string }
> = {
  supports_label: {
    label: "Supports label",
    shortLabel: "Supports",
    className:
      "border-[color:rgba(63,125,85,0.2)] bg-[var(--color-supported-soft)] text-[var(--color-supported)]",
  },
  weak_support: {
    label: "Weak support",
    shortLabel: "Weak",
    className:
      "border-[color:rgba(154,106,47,0.22)] bg-[var(--color-uncertain-soft)] text-[var(--color-uncertain)]",
  },
  irrelevant_noise: {
    label: "Irrelevant / noise",
    shortLabel: "Noise",
    className:
      "border-[color:rgba(111,98,92,0.18)] bg-[var(--color-unsupported-soft)] text-[var(--color-unsupported)]",
  },
  contradicts_label: {
    label: "Contradicts label",
    shortLabel: "Contradicts",
    className:
      "border-[color:rgba(155,61,53,0.22)] bg-[var(--color-contradicted-soft)] text-[var(--color-contradicted)]",
  },
  needs_context: {
    label: "Need more context",
    shortLabel: "Context",
    className:
      "border-[color:rgba(107,111,122,0.2)] bg-white text-[var(--color-muted)]",
  },
};

const evidenceRatingOptions: EvidenceRating[] = [
  "supports_label",
  "weak_support",
  "irrelevant_noise",
  "contradicts_label",
  "needs_context",
];

const duelReasonLabel: Record<DuelReason, string> = {
  better_supported: "Better supported",
  less_overclaimed: "Less overclaimed",
  more_specific: "More specific",
  too_broad: "Too broad",
  missing_evidence: "Missing evidence",
  cluster_seems_mixed: "Cluster seems mixed",
};

const finalVerdictLabel: Record<FinalVerdict, string> = {
  supported: "Supported",
  partially_supported: "Partially supported",
  unsupported_overclaimed: "Unsupported / overclaimed",
  uncertain: "Uncertain",
  cluster_impure: "Cluster is impure",
  needs_split: "Needs split",
  needs_merge: "Needs merge",
  needs_better_evidence: "Needs better evidence",
};

const finalVerdicts: FinalVerdict[] = [
  "supported",
  "partially_supported",
  "unsupported_overclaimed",
  "uncertain",
  "cluster_impure",
  "needs_split",
  "needs_merge",
  "needs_better_evidence",
];

export default function Home() {
  const firstCase = sampleCases[0];
  const [selectedCaseId, setSelectedCaseId] = useState(firstCase?.id ?? "");
  const [reviewsByCase, setReviewsByCase] = useState<
    Partial<Record<string, CaseReviewState>>
  >({});
  const [exportMessage, setExportMessage] = useState<string>();

  const selectedCase =
    sampleCases.find((currentCase) => currentCase.id === selectedCaseId) ??
    firstCase;

  const reviewState = selectedCase ? reviewsByCase[selectedCase.id] ?? {} : {};
  const selectedBlindChoice = selectedCase?.blindInterpretationOptions.find(
    (option) => option.id === reviewState.blindChoiceId,
  );
  const selectedDuelWinner = selectedCase?.candidateLabels.find(
    (label) => label.id === reviewState.labelDuelWinnerId,
  );
  const selectedImpostor = selectedCase?.representativeSessions.find(
    (session) => session.id === reviewState.impostorSessionId,
  );
  const evidenceRatings = {
    ...(selectedCase?.defaultEvidenceRatings ?? {}),
    ...(reviewState.evidenceRatings ?? {}),
  };

  if (!selectedCase) {
    return (
      <main className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)]">
        <div className="mx-auto flex min-h-screen max-w-[900px] items-center px-5">
          <section className="w-full rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
            <p className="text-sm font-medium text-[var(--color-muted)]">
              Telemetry Court
            </p>
            <h1 className="mt-2 text-2xl font-semibold">
              No evidence arena cases are available
            </h1>
          </section>
        </div>
      </main>
    );
  }

  const arenaReview = buildArenaReview(selectedCase, reviewState, evidenceRatings);
  const exportJson = serializeReviewResultExport(
    buildReviewResultExport({
      caseFile: selectedCase,
      exportTimestamp: new Date().toISOString(),
      arenaReview,
    }),
  );
  const reviewCompletion = getReviewCompletion(reviewState, evidenceRatings, selectedCase);

  function updateCurrentReview(nextState: Partial<CaseReviewState>) {
    setReviewsByCase((currentState) => ({
      ...currentState,
      [selectedCase.id]: {
        ...currentState[selectedCase.id],
        ...nextState,
      },
    }));
    setExportMessage(undefined);
  }

  function toggleDuelReason(reason: DuelReason) {
    const currentReasons = reviewState.duelReasons ?? [];
    updateCurrentReview({
      duelReasons: toggleArrayValue(currentReasons, reason),
    });
  }

  function toggleFailureMode(reason: DuelReason) {
    const currentModes = reviewState.failureModes ?? [];
    updateCurrentReview({
      failureModes: toggleArrayValue(currentModes, reason),
    });
  }

  function rateEvidence(evidenceId: string, rating: EvidenceRating) {
    updateCurrentReview({
      evidenceRatings: {
        ...(reviewState.evidenceRatings ?? {}),
        [evidenceId]: rating,
      },
    });
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

  function handleSelectCase(caseId: string) {
    setSelectedCaseId(caseId);
    setExportMessage(undefined);
  }

  return (
    <main className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10 lg:py-9">
        <header className="grid gap-7 py-4 lg:grid-cols-[minmax(0,1fr)_minmax(360px,460px)] lg:items-end">
          <div>
            <p className="text-sm font-semibold text-[var(--color-muted)]">
              Telemetry Court
            </p>
            <h1 className="mt-3 max-w-5xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-[4.25rem] lg:leading-[1.02]">
              AI names the pattern. Humans test the evidence.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--color-muted)]">
              An interactive evidence arena for judging whether AI-generated
              telemetry interpretations are grounded, overclaimed, mixed, or uncertain.
            </p>
          </div>

          <ol className="grid gap-2 rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)]/82 p-3 shadow-[0_18px_45px_rgba(50,48,47,0.05)] sm:grid-cols-2">
            {workflowSteps.map((step, index) => (
              <li
                key={step}
                className="flex items-center gap-3 rounded-[20px] bg-white/62 px-3 py-2 text-sm font-medium text-[var(--color-muted)]"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] font-mono text-xs text-[var(--color-ink)]">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </header>

        <section
          aria-label="Telemetry landscape"
          className="grid gap-6 rounded-[34px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_24px_70px_rgba(50,48,47,0.07)] sm:p-7 lg:grid-cols-[minmax(0,1fr)_390px]"
        >
          <div>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-muted)]">
                  Telemetry Landscape
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                  Behavioural regions awaiting judgment
                </h2>
              </div>
              <span className="w-fit rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-1 text-xs font-medium text-[var(--color-muted)]">
                {sampleCases.length} synthetic cases
              </span>
            </div>

            <div className="relative mt-6 h-[420px] overflow-hidden rounded-[30px] border border-[var(--color-border)] bg-[linear-gradient(145deg,#fbfaf7_0%,#efede7_52%,#e7ece9_100%)]">
              <div className="absolute inset-x-8 top-1/2 h-px bg-[rgba(50,48,47,0.08)]" />
              <div className="absolute inset-y-8 left-1/2 w-px bg-[rgba(50,48,47,0.08)]" />
              <span className="absolute left-6 top-5 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                lower agreement
              </span>
              <span className="absolute bottom-5 right-6 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                stronger evidence
              </span>

              {sampleCases.map((currentCase) => {
                const isSelected = currentCase.id === selectedCase.id;
                const status = landscapeStatusMeta[currentCase.landscapeStatus];

                return (
                  <button
                    key={currentCase.id}
                    type="button"
                    onClick={() => handleSelectCase(currentCase.id)}
                    aria-pressed={isSelected}
                    className={`absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-start gap-2 rounded-[24px] border p-4 text-left transition ${
                      isSelected
                        ? "z-10 w-[230px] border-[var(--color-border-strong)] bg-white shadow-[0_18px_42px_rgba(50,48,47,0.12)]"
                        : "w-[190px] border-[var(--color-border)] bg-white/70 hover:bg-white"
                    }`}
                    style={{
                      left: `${currentCase.mapPosition.x}%`,
                      top: `${currentCase.mapPosition.y}%`,
                    }}
                  >
                    <span className="flex items-center gap-2 text-xs font-medium text-[var(--color-muted)]">
                      <span
                        className={`size-2 rounded-full ${status.dotClassName}`}
                        aria-hidden="true"
                      />
                      {currentCase.cluster.id}
                    </span>
                    <span className="text-sm font-semibold leading-5">
                      {currentCase.cluster.name}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="rounded-[30px] border border-[var(--color-border)] bg-white/62 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono text-xs text-[var(--color-muted)]">
                {selectedCase.cluster.id}
              </span>
              <StatusBadge status={selectedCase.landscapeStatus} />
            </div>
            <h3 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-balance">
              {selectedCase.cluster.name}
            </h3>
            <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
              {selectedCase.cluster.description}
            </p>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <MetricTile
                label="Agreement"
                value={formatSupportScore(selectedCase.modelAgreement)}
              />
              <MetricTile
                label="Evidence"
                value={formatSupportScore(selectedCase.evidenceStrength)}
              />
              <MetricTile
                label="Uncertainty"
                value={formatSupportScore(selectedCase.uncertainty)}
              />
            </div>
            <button
              type="button"
              onClick={() =>
                document.getElementById("case-file")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
              }
              className="mt-5 w-full rounded-[18px] border border-[var(--color-border-strong)] bg-[var(--color-ink)] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#45413f]"
            >
              Open case file
            </button>
          </aside>
        </section>

        <section
          id="case-file"
          aria-label="Case file"
          className="grid gap-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(360px,0.88fr)]"
        >
          <article className="rounded-[34px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_22px_60px_rgba(50,48,47,0.06)] sm:p-7">
            <p className="text-sm font-medium text-[var(--color-muted)]">Case File</p>
            <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-4xl font-semibold tracking-[-0.05em] text-balance">
                  {selectedCase.topicLabel.name}
                </h2>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
                  {selectedCase.topicLabel.explanation}
                </p>
              </div>
              <span className="w-fit rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-1 text-xs font-medium text-[var(--color-muted)]">
                {reviewStatusLabel[selectedCase.reviewStatus]}
              </span>
            </div>

            <dl className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryField label="Cluster ID" value={selectedCase.cluster.id} mono />
              <SummaryField label="Dataset" value={selectedCase.dataset} />
              <SummaryField
                label="Sessions"
                value={selectedCase.cluster.size?.toString() ?? "Unknown"}
              />
              <SummaryField
                label="Average support"
                value={formatSupportScore(getAverageSupportScore(selectedCase))}
              />
            </dl>

            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <InfoPanel title="Top features" items={selectedCase.topFeatures} />
              <InfoPanel title="Risk flags" items={selectedCase.riskFlags} />
            </div>

            <div className="mt-6 rounded-[26px] border border-[var(--color-border)] bg-white/62 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Nearest neighbour
              </p>
              <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em]">
                {selectedCase.nearestNeighbor.label}
              </h3>
              <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
                {selectedCase.nearestNeighbor.clusterId} · distance{" "}
                {selectedCase.nearestNeighbor.distance.toFixed(2)}.{" "}
                {selectedCase.nearestNeighbor.note}
              </p>
            </div>

            <div className="mt-6 rounded-[26px] border border-[var(--color-border)] bg-white/62 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Claims under test
              </p>
              <div className="mt-4 grid gap-3">
                {selectedCase.claims.map((claim) => (
                  <div
                    key={claim.id}
                    className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-panel)]/46 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-xs text-[var(--color-muted)]">
                        {claim.id}
                      </span>
                      <span className="text-xs font-medium text-[var(--color-muted)]">
                        support {formatSupportScore(claim.supportScore)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold leading-6">
                      {claim.text}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-[var(--color-muted)]">
                      {claim.rationale}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <aside className="rounded-[34px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_22px_60px_rgba(50,48,47,0.06)] sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[var(--color-muted)]">
                  Representative sessions
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
                  Cluster samples
                </h2>
              </div>
              <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-1 text-xs font-medium text-[var(--color-muted)]">
                {selectedCase.representativeSessions.length}
              </span>
            </div>
            <div className="mt-5 grid gap-3">
              {selectedCase.representativeSessions.slice(0, 4).map((session) => (
                <SessionMiniCard key={session.id} session={session} />
              ))}
            </div>
          </aside>
        </section>

        <section
          aria-label="Blind investigation and AI reveal"
          className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]"
        >
          <article className="rounded-[34px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_22px_60px_rgba(50,48,47,0.06)] sm:p-7">
            <p className="text-sm font-medium text-[var(--color-muted)]">
              Blind Investigation
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-balance">
              Before seeing the AI label, what does the evidence suggest?
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
              Choose from structured interpretations. No typed label is required.
            </p>

            <div className="mt-6 grid gap-3 lg:grid-cols-2">
              {selectedCase.blindInterpretationOptions.map((option) => {
                const isSelected = option.id === reviewState.blindChoiceId;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      updateCurrentReview({
                        blindChoiceId: option.id,
                        aiLabelRevealed: false,
                      })
                    }
                    aria-pressed={isSelected}
                    className={`rounded-[24px] border p-4 text-left transition-colors ${
                      isSelected
                        ? "border-[var(--color-border-strong)] bg-[var(--color-accent-soft)] shadow-[0_14px_34px_rgba(50,48,47,0.07)]"
                        : "border-[var(--color-border)] bg-white/64 hover:bg-white"
                    }`}
                  >
                    <span className="text-base font-semibold">{option.label}</span>
                    <span className="mt-2 block text-sm leading-6 text-[var(--color-muted)]">
                      {option.helper}
                    </span>
                  </button>
                );
              })}
            </div>
          </article>

          <aside className="rounded-[34px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_22px_60px_rgba(50,48,47,0.06)] sm:p-7">
            <p className="text-sm font-medium text-[var(--color-muted)]">
              AI Label Reveal
            </p>
            {reviewState.aiLabelRevealed ? (
              <>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-balance">
                  {selectedCase.topicLabel.name}
                </h2>
                <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
                  {getBlindAgreementCopy(selectedBlindChoice?.label, selectedCase)}
                </p>
                <div className="mt-5 rounded-[24px] border border-[var(--color-border)] bg-white/62 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                    Blind choice
                  </p>
                  <p className="mt-2 text-sm font-semibold">
                    {selectedBlindChoice?.label ?? "No blind choice selected"}
                  </p>
                </div>
              </>
            ) : (
              <>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                  Label hidden
                </h2>
                <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
                  Make a blind interpretation first, then reveal the model claim.
                </p>
                <button
                  type="button"
                  disabled={!reviewState.blindChoiceId}
                  onClick={() => updateCurrentReview({ aiLabelRevealed: true })}
                  className="mt-5 w-full rounded-[18px] border border-[var(--color-border-strong)] bg-[var(--color-ink)] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#45413f] disabled:cursor-not-allowed disabled:border-[var(--color-border)] disabled:bg-[var(--color-panel)] disabled:text-[var(--color-muted)]"
                >
                  Reveal AI label
                </button>
              </>
            )}
          </aside>
        </section>

        <section
          aria-label="Evidence board"
          className="rounded-[34px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_22px_60px_rgba(50,48,47,0.06)] sm:p-7"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-muted)]">
                Evidence Board
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                Classify each evidence card
              </h2>
            </div>
            <span className="w-fit rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-1 text-xs font-medium text-[var(--color-muted)]">
              {selectedCase.evidenceItems.length} cards
            </span>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {selectedCase.evidenceItems.map((evidence) => {
              const rating = evidenceRatings[evidence.id] ?? "needs_context";

              return (
                <article
                  key={evidence.id}
                  className="rounded-[28px] border border-[var(--color-border)] bg-white/72 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="font-mono text-xs text-[var(--color-muted)]">
                      {evidence.id}
                    </span>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${evidenceRatingMeta[rating].className}`}
                    >
                      {evidenceRatingMeta[rating].label}
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold tracking-[-0.03em] text-balance">
                    {evidence.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
                    {evidence.summary}
                  </p>
                  <div className="mt-5 grid gap-2 sm:grid-cols-5">
                    {evidenceRatingOptions.map((option) => (
                      <button
                        key={`${evidence.id}-${option}`}
                        type="button"
                        onClick={() => rateEvidence(evidence.id, option)}
                        aria-pressed={rating === option}
                        aria-label={`Classify ${evidence.id} as ${evidenceRatingMeta[option].label}`}
                        className={`min-h-12 rounded-[16px] border px-2 py-2 text-xs font-semibold transition-colors ${
                          rating === option
                            ? evidenceRatingMeta[option].className
                            : "border-[var(--color-border)] bg-[var(--color-panel)]/46 text-[var(--color-muted)] hover:bg-white"
                        }`}
                      >
                        {evidenceRatingMeta[option].shortLabel}
                      </button>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section
          aria-label="Label duel and impostor selection"
          className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]"
        >
          <article className="rounded-[34px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_22px_60px_rgba(50,48,47,0.06)] sm:p-7">
            <p className="text-sm font-medium text-[var(--color-muted)]">
              Label Duel
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
              Which label is best supported?
            </h2>
            <div className="mt-6 grid gap-3 lg:grid-cols-2">
              {selectedCase.candidateLabels.map((candidate) => {
                const isSelected = candidate.id === reviewState.labelDuelWinnerId;

                return (
                  <button
                    key={candidate.id}
                    type="button"
                    onClick={() => updateCurrentReview({ labelDuelWinnerId: candidate.id })}
                    aria-pressed={isSelected}
                    className={`rounded-[26px] border p-5 text-left transition-colors ${
                      isSelected
                        ? "border-[var(--color-border-strong)] bg-white shadow-[0_14px_34px_rgba(50,48,47,0.08)]"
                        : "border-[var(--color-border)] bg-white/58 hover:bg-white"
                    }`}
                  >
                    <span className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-muted)]">
                      {candidateSourceLabel[candidate.source]}
                    </span>
                    <span className="mt-3 block text-xl font-semibold tracking-[-0.03em]">
                      {candidate.label}
                    </span>
                    <span className="mt-3 block text-sm leading-7 text-[var(--color-muted)]">
                      {candidate.rationale}
                    </span>
                    <span className="mt-4 inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-1 text-xs font-medium text-[var(--color-muted)]">
                      Support {formatSupportScore(candidate.supportEstimate)}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold">Reason chips</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedCase.failureModes.map((reason) => {
                  const isSelected = (reviewState.duelReasons ?? []).includes(reason);

                  return (
                    <ChipButton
                      key={`duel-${reason}`}
                      selected={isSelected}
                      onClick={() => toggleDuelReason(reason)}
                    >
                      {duelReasonLabel[reason]}
                    </ChipButton>
                  );
                })}
              </div>
            </div>
          </article>

          <aside className="rounded-[34px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_22px_60px_rgba(50,48,47,0.06)] sm:p-7">
            <p className="text-sm font-medium text-[var(--color-muted)]">
              Find the Impostor
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
              Which session least belongs?
            </h2>
            <div className="mt-5 grid gap-3">
              {selectedCase.representativeSessions.map((session) => {
                const isSelected = session.id === reviewState.impostorSessionId;

                return (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => updateCurrentReview({ impostorSessionId: session.id })}
                    aria-pressed={isSelected}
                    className={`rounded-[24px] border p-4 text-left transition-colors ${
                      isSelected
                        ? "border-[var(--color-border-strong)] bg-[var(--color-accent-soft)]"
                        : "border-[var(--color-border)] bg-white/62 hover:bg-white"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-mono text-xs text-[var(--color-muted)]">
                        {session.id}
                      </span>
                      <span className="text-xs text-[var(--color-muted)]">
                        outlier {formatSupportScore(session.outlierScore)}
                      </span>
                    </span>
                    <span className="mt-2 block text-sm font-semibold">
                      {session.title}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-[var(--color-muted)]">
                      overlap {formatSupportScore(session.featureOverlap)} ·{" "}
                      {session.summary}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedImpostor ? (
              <div className="mt-5 rounded-[24px] border border-[var(--color-border)] bg-white/62 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Seeded explanation
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
                  {selectedImpostor.outlierReason ??
                    "This session is not the seeded outlier, but your choice is recorded in the review JSON."}
                </p>
              </div>
            ) : null}
          </aside>
        </section>

        <section
          aria-label="Structured verdict"
          className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]"
        >
          <article className="rounded-[34px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_22px_60px_rgba(50,48,47,0.06)] sm:p-7">
            <p className="text-sm font-medium text-[var(--color-muted)]">
              Structured Verdict
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
              Issue a defensible judgment
            </h2>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {finalVerdicts.map((verdict) => {
                const isSelected = reviewState.finalVerdict === verdict;

                return (
                  <button
                    key={verdict}
                    type="button"
                    onClick={() => updateCurrentReview({ finalVerdict: verdict })}
                    aria-pressed={isSelected}
                    className={`rounded-[20px] border px-4 py-3 text-left text-sm font-semibold transition-colors ${
                      isSelected
                        ? "border-[var(--color-border-strong)] bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]"
                        : "border-[var(--color-border)] bg-white/62 hover:bg-white"
                    }`}
                  >
                    {finalVerdictLabel[verdict]}
                  </button>
                );
              })}
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold">Failure-mode chips</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedCase.failureModes.map((reason) => {
                  const isSelected = (reviewState.failureModes ?? []).includes(reason);

                  return (
                    <ChipButton
                      key={`failure-${reason}`}
                      selected={isSelected}
                      onClick={() => toggleFailureMode(reason)}
                    >
                      {duelReasonLabel[reason]}
                    </ChipButton>
                  );
                })}
              </div>
            </div>
          </article>

          <aside className="rounded-[34px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_22px_60px_rgba(50,48,47,0.06)] sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-muted)]">
                  Review Summary
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                  Structured review JSON
                </h2>
              </div>
              <span className="w-fit rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-1 text-xs font-medium text-[var(--color-muted)]">
                {reviewCompletion}/6 complete
              </span>
            </div>

            <dl className="mt-6 grid gap-3">
              <SummaryField
                label="Blind choice"
                value={selectedBlindChoice?.label}
                empty="Awaiting choice."
              />
              <SummaryField label="AI label" value={selectedCase.topicLabel.name} />
              <SummaryField
                label="Label duel winner"
                value={selectedDuelWinner?.label}
                empty="Awaiting duel selection."
              />
              <SummaryField
                label="Impostor choice"
                value={selectedImpostor?.title}
                empty="Awaiting impostor selection."
              />
              <SummaryField
                label="Failure modes"
                value={formatReasonList(reviewState.failureModes)}
                empty="No failure modes selected."
              />
              <SummaryField
                label="Final verdict"
                value={
                  reviewState.finalVerdict
                    ? finalVerdictLabel[reviewState.finalVerdict]
                    : undefined
                }
                empty="Awaiting verdict."
              />
            </dl>

            <div className="mt-5 rounded-[24px] border border-[var(--color-border)] bg-white/62 p-4">
              <p className="text-sm font-semibold">Evidence ratings</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedCase.evidenceItems.map((evidence) => (
                  <span
                    key={`summary-${evidence.id}`}
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${evidenceRatingMeta[evidenceRatings[evidence.id] ?? "needs_context"].className}`}
                  >
                    {evidence.id}:{" "}
                    {
                      evidenceRatingMeta[evidenceRatings[evidence.id] ?? "needs_context"]
                        .shortLabel
                    }
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => updateCurrentReview({ showJson: !reviewState.showJson })}
                className="rounded-[16px] border border-[var(--color-border-strong)] bg-white px-4 py-3 text-sm font-semibold transition-colors hover:bg-[var(--color-panel)]/70"
              >
                {reviewState.showJson ? "Hide JSON" : "View JSON"}
              </button>
              <button
                type="button"
                onClick={handleCopyReviewJson}
                className="rounded-[16px] border border-[var(--color-border-strong)] bg-white px-4 py-3 text-sm font-semibold transition-colors hover:bg-[var(--color-panel)]/70"
              >
                Copy JSON
              </button>
              <button
                type="button"
                onClick={handleDownloadReviewJson}
                className="rounded-[16px] border border-[var(--color-border-strong)] bg-white px-4 py-3 text-sm font-semibold transition-colors hover:bg-[var(--color-panel)]/70"
              >
                Download JSON
              </button>
            </div>
            {exportMessage ? (
              <p aria-live="polite" className="mt-3 text-xs text-[var(--color-muted)]">
                {exportMessage}
              </p>
            ) : null}
            {reviewState.showJson ? (
              <pre className="mt-5 max-h-[420px] overflow-auto rounded-[22px] border border-[var(--color-border)] bg-[var(--color-panel)]/72 p-4 text-xs leading-6 text-[var(--color-ink)]">
                {exportJson}
              </pre>
            ) : null}
          </aside>
        </section>
      </div>
    </main>
  );
}

function buildArenaReview(
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
          blindChoiceAgreesWithAi: labelsMatch(blindChoice.label, caseFile.topicLabel.name),
        }
      : {}),
    aiLabel: caseFile.topicLabel.name,
    ...(duelWinner
      ? {
          labelDuelWinnerId: duelWinner.id,
          labelDuelWinnerLabel: duelWinner.label,
        }
      : {}),
    duelReasons: reviewState.duelReasons ?? [],
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
    failureModes: reviewState.failureModes ?? [],
    ...(reviewState.finalVerdict ? { finalVerdict: reviewState.finalVerdict } : {}),
  };
}

function getReviewCompletion(
  reviewState: CaseReviewState,
  evidenceRatings: Record<string, EvidenceRating>,
  caseFile: CaseFile,
) {
  return [
    reviewState.blindChoiceId,
    reviewState.aiLabelRevealed,
    reviewState.labelDuelWinnerId,
    Object.keys(evidenceRatings).length >= caseFile.evidenceItems.length,
    reviewState.impostorSessionId,
    reviewState.finalVerdict,
  ].filter(Boolean).length;
}

function StatusBadge({ status }: { status: LandscapeStatus }) {
  const meta = landscapeStatusMeta[status];

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${meta.className}`}>
      {meta.label}
    </span>
  );
}

function SummaryField({
  label,
  value,
  empty = "Not available.",
  mono = false,
}: {
  label: string;
  value?: string;
  empty?: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-[20px] border border-[var(--color-border)] bg-white/58 px-4 py-3">
      <dt className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
        {label}
      </dt>
      <dd
        className={`mt-2 text-sm font-semibold leading-6 text-[var(--color-ink)] ${
          mono ? "font-mono" : ""
        }`}
      >
        {value ?? empty}
      </dd>
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[var(--color-border)] bg-white/58 px-3 py-3">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold tracking-[-0.02em]">{value}</p>
    </div>
  );
}

function InfoPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[26px] border border-[var(--color-border)] bg-white/62 p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
        {title}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full border border-[var(--color-border)] bg-[var(--color-panel)]/62 px-3 py-1.5 text-xs font-medium text-[var(--color-muted)]"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function SessionMiniCard({ session }: { session: RepresentativeSession }) {
  return (
    <article className="rounded-[22px] border border-[var(--color-border)] bg-white/62 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs text-[var(--color-muted)]">{session.id}</span>
        <span className="text-xs text-[var(--color-muted)]">
          overlap {formatSupportScore(session.featureOverlap)}
        </span>
      </div>
      <h3 className="mt-2 text-sm font-semibold">{session.title}</h3>
      <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">{session.summary}</p>
    </article>
  );
}

function ChipButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
        selected
          ? "border-[var(--color-border-strong)] bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]"
          : "border-[var(--color-border)] bg-white/62 text-[var(--color-muted)] hover:bg-white"
      }`}
    >
      {children}
    </button>
  );
}

function toggleArrayValue<T>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((currentValue) => currentValue !== value)
    : [...values, value];
}

function labelsMatch(left?: string, right?: string) {
  if (!left || !right) {
    return false;
  }

  return normalizeLabel(left) === normalizeLabel(right);
}

function normalizeLabel(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function getBlindAgreementCopy(blindChoiceLabel: string | undefined, caseFile: CaseFile) {
  if (!blindChoiceLabel) {
    return "No blind choice was recorded before reveal.";
  }

  if (labelsMatch(blindChoiceLabel, caseFile.topicLabel.name)) {
    return "Your blind interpretation agrees with the AI label. The next question is whether the evidence is strong enough.";
  }

  return "Your blind interpretation differs from the AI label. Use the evidence board and label duel to judge which interpretation is better grounded.";
}

function formatReasonList(reasons?: DuelReason[]) {
  if (!reasons || reasons.length === 0) {
    return undefined;
  }

  return reasons.map((reason) => duelReasonLabel[reason]).join(", ");
}
