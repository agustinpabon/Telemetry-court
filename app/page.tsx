"use client";

import { useState } from "react";

import { EvidenceCard } from "@/components/EvidenceCard";
import {
  EvidenceFilters,
  type EvidenceFilterValue,
} from "@/components/EvidenceFilters";
import { sampleCases } from "@/data/sampleCases";
import {
  deriveCaseSupportStatus,
  formatSupportScore,
  getAverageSupportScore,
  getClaimStatusCounts,
  getClaimSupportScore,
  getClaimsForCluster,
  getEvidenceForClaim,
  getEvidenceIdsForClaim,
  getEvidenceRelationsForClaim,
  getPrimaryEvidencePolarity,
  getRelationsForEvidence,
} from "@/lib/caseMetrics";
import type {
  AnalystDecision,
  CaseFile,
  Claim,
  EvidenceItem,
  EvidencePolarity,
  EvidenceRelation,
  EvidenceSourceType,
  EvidenceStrength,
  SupportStatus,
} from "@/lib/types";

const statusMeta: Record<
  SupportStatus,
  {
    label: string;
    shortLabel: string;
    chipClassName: string;
    textClassName: string;
    plainLanguage: string;
  }
> = {
  supported: {
    label: "Supported",
    shortLabel: "Supported",
    chipClassName:
      "bg-[var(--color-supported-soft)] text-[var(--color-supported)] border-[color:rgba(63,125,85,0.2)]",
    textClassName: "text-[var(--color-supported)]",
    plainLanguage: "The record gives this claim direct support.",
  },
  weakly_supported: {
    label: "Weakly supported",
    shortLabel: "Weak",
    chipClassName:
      "bg-[var(--color-uncertain-soft)] text-[var(--color-uncertain)] border-[color:rgba(154,106,47,0.2)]",
    textClassName: "text-[var(--color-uncertain)]",
    plainLanguage: "The claim is plausible, but the evidence is not decisive.",
  },
  contradicted: {
    label: "Contradicted",
    shortLabel: "Contradicted",
    chipClassName:
      "bg-[var(--color-contradicted-soft)] text-[var(--color-contradicted)] border-[color:rgba(155,61,53,0.2)]",
    textClassName: "text-[var(--color-contradicted)]",
    plainLanguage: "The record contains evidence that conflicts with this claim.",
  },
  unsupported: {
    label: "Unsupported",
    shortLabel: "Unsupported",
    chipClassName:
      "bg-[var(--color-unsupported-soft)] text-[var(--color-unsupported)] border-[color:rgba(111,98,92,0.22)]",
    textClassName: "text-[var(--color-unsupported)]",
    plainLanguage: "The claim does not have enough supporting evidence.",
  },
  insufficient_evidence: {
    label: "Insufficient evidence",
    shortLabel: "Insufficient",
    chipClassName:
      "bg-[var(--color-uncertain-soft)] text-[var(--color-uncertain)] border-[color:rgba(154,106,47,0.2)]",
    textClassName: "text-[var(--color-uncertain)]",
    plainLanguage: "The record is too thin to treat this claim as proven.",
  },
};

const decisionLabel: Record<AnalystDecision, string> = {
  accept: "Accept interpretation",
  revise: "Request revision",
  reject: "Reject interpretation",
  needs_more_review: "Needs more review",
};

const decisionHelp: Record<AnalystDecision, string> = {
  accept: "The evidence is strong enough to keep the generated interpretation.",
  revise: "The label is plausible, but the explanation needs a narrower claim.",
  reject: "The evidence does not support the generated interpretation.",
  needs_more_review: "The record needs more inspection before disposition.",
};

const polarityMeta: Record<
  EvidencePolarity,
  { label: string; className: string }
> = {
  supports: {
    label: "Supports",
    className:
      "bg-[var(--color-supported-soft)] text-[var(--color-supported)] border-[color:rgba(63,125,85,0.2)]",
  },
  contradicts: {
    label: "Contradicts",
    className:
      "bg-[var(--color-contradicted-soft)] text-[var(--color-contradicted)] border-[color:rgba(155,61,53,0.2)]",
  },
  neutral: {
    label: "Neutral",
    className:
      "bg-[var(--color-uncertain-soft)] text-[var(--color-uncertain)] border-[color:rgba(154,106,47,0.2)]",
  },
};

const sourceTypeLabel: Record<EvidenceSourceType, string> = {
  telemetry_event: "Telemetry event",
  session_feature: "Session feature",
  exemplar: "Exemplar",
  keyphrase: "Keyphrase",
  metadata: "Metadata",
  analyst_note: "Analyst note",
};

const strengthLabel: Record<EvidenceStrength, string> = {
  strong: "Strong",
  moderate: "Moderate",
  weak: "Weak",
};

const workflowSteps = [
  "Cluster",
  "AI label",
  "Claims",
  "Evidence",
  "Support score",
  "Analyst verdict",
];

const decisionActions: AnalystDecision[] = [
  "accept",
  "revise",
  "reject",
  "needs_more_review",
];

export default function Home() {
  const firstCase = sampleCases[0];
  const [selectedCaseId, setSelectedCaseId] = useState<string>(firstCase?.id ?? "");
  const [selectedFilter, setSelectedFilter] =
    useState<EvidenceFilterValue>("all");
  const [selectedClaimId, setSelectedClaimId] = useState<string | undefined>(
    firstCase?.claims[0]?.id,
  );
  const [decisionsByCase, setDecisionsByCase] = useState<
    Partial<Record<string, { decision: AnalystDecision; timestamp: string }>>
  >({});

  const selectedCase =
    sampleCases.find((currentCase) => currentCase.id === selectedCaseId) ??
    firstCase;

  if (!selectedCase) {
    return (
      <main className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)]">
        <div className="mx-auto flex min-h-screen w-full max-w-[980px] items-center justify-center px-5 py-10 sm:px-8">
          <section className="w-full rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-[0_20px_50px_rgba(50,48,47,0.06)]">
            <p className="text-sm font-medium text-[var(--color-muted)]">
              Telemetry Court
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
              No review cases are available
            </h1>
            <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
              Add synthetic sample cases to begin reviewing AI-generated interpretations.
            </p>
          </section>
        </div>
      </main>
    );
  }

  const allClaims = getClaimsForCluster(selectedCase, selectedCase.cluster.id);
  const selectedClaim = selectedClaimId
    ? allClaims.find((claim) => claim.id === selectedClaimId)
    : undefined;
  const activeClaim = selectedClaim ?? allClaims[0];
  const activeClaimEvidenceIds = new Set(
    activeClaim ? getEvidenceIdsForClaim(selectedCase, activeClaim.id) : [],
  );
  const linkedEvidence = activeClaim
    ? getEvidenceForClaim(selectedCase, activeClaim.id)
    : [];
  const activeClaimRelations = activeClaim
    ? getEvidenceRelationsForClaim(selectedCase, activeClaim.id)
    : [];
  const activeClaimScore = activeClaim
    ? getClaimSupportScore(selectedCase, activeClaim.id)
    : null;
  const activeSupportScore = activeClaim
    ? selectedCase.supportScores.find((score) => score.claimId === activeClaim.id)
    : undefined;

  const evidenceCounts: Record<EvidenceFilterValue, number> = {
    all: selectedCase.evidenceItems.length,
    supports: selectedCase.evidenceItems.filter(
      (item) =>
        getPrimaryEvidencePolarity(
          getRelationsForEvidence(selectedCase, item.id),
        ) === "supports",
    ).length,
    neutral: selectedCase.evidenceItems.filter(
      (item) =>
        getPrimaryEvidencePolarity(
          getRelationsForEvidence(selectedCase, item.id),
        ) === "neutral",
    ).length,
    contradicts: selectedCase.evidenceItems.filter(
      (item) =>
        getPrimaryEvidencePolarity(
          getRelationsForEvidence(selectedCase, item.id),
        ) === "contradicts",
    ).length,
  };

  const filteredEvidence =
    selectedFilter === "all"
      ? selectedCase.evidenceItems
      : selectedCase.evidenceItems.filter(
          (item) =>
            getPrimaryEvidencePolarity(
              getRelationsForEvidence(selectedCase, item.id),
            ) === selectedFilter,
        );

  const currentReviewRecord = decisionsByCase[selectedCase.id];
  const displayedDecision =
    currentReviewRecord?.decision ?? selectedCase.analystVerdict?.decision;
  const displayedTimestamp =
    currentReviewRecord?.timestamp ?? selectedCase.analystVerdict?.reviewedAt;
  const caseStatus = deriveCaseSupportStatus(selectedCase);
  const claimStatusCounts = getClaimStatusCounts(selectedCase);

  function handleDecision(decision: AnalystDecision) {
    setDecisionsByCase((currentState) => ({
      ...currentState,
      [selectedCase.id]: {
        decision,
        timestamp: new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date()),
      },
    }));
  }

  function handleSelectCase(caseId: string) {
    const nextCase = sampleCases.find((currentCase) => currentCase.id === caseId);

    setSelectedCaseId(caseId);
    setSelectedClaimId(nextCase?.claims[0]?.id);
    setSelectedFilter("all");
  }

  return (
    <main className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)]">
      <div className="mx-auto flex w-full max-w-[1380px] flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10 lg:py-9">
        <header className="grid gap-7 py-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:items-end">
          <div>
            <p className="text-sm font-semibold tracking-[-0.01em] text-[var(--color-muted)]">
              Telemetry Court
            </p>
            <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.05em] text-balance sm:text-5xl lg:text-[4rem] lg:leading-[1.02]">
              Can AI prove what it claims?
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--color-muted)]">
              One cluster. One claim. One evidence check.
            </p>
          </div>

          <ol className="grid gap-2 rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)]/78 p-3 shadow-[0_18px_45px_rgba(50,48,47,0.05)] sm:grid-cols-2">
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
          aria-label="Ten second review read"
          className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
        >
          <QuickReadCard
            eyebrow="1. AI claim"
            title={activeClaim?.text ?? "No claim selected"}
            detail={
              activeClaim
                ? `${activeClaim.id} from the generated interpretation.`
                : "This case has no reviewable claims."
            }
          />
          <QuickReadCard
            eyebrow="2. Evidence"
            title={
              activeClaim
                ? linkedEvidence.length > 0
                  ? `${linkedEvidence.length} linked evidence item${
                      linkedEvidence.length === 1 ? "" : "s"
                    }`
                  : "Evidence missing"
                : "No claim selected"
            }
            detail={
              activeClaim
                ? linkedEvidence.length > 0
                  ? summarizePolarity(activeClaimRelations)
                  : "No evidence relation is recorded for this claim."
                : "Select a claim to inspect its linked evidence."
            }
          />
          <QuickReadCard
            eyebrow="3. Support score"
            title={formatSupportScore(activeClaimScore)}
            detail={
              activeClaim
                ? statusMeta[activeClaim.status].label
                : "No score can be calculated without a claim."
            }
          />
          <QuickReadCard
            eyebrow="4. Analyst verdict"
            title={displayedDecision ? decisionLabel[displayedDecision] : "Awaiting review"}
            detail={
              displayedDecision
                ? selectedCase.analystVerdict?.summary ??
                  "A local demo decision has been recorded."
                : "No analyst verdict has been recorded for this case."
            }
          />
        </section>

        <section aria-label="Case queue" className="grid gap-3 lg:grid-cols-2">
          {sampleCases.map((currentCase) => {
            const isSelected = currentCase.id === selectedCase.id;
            const currentStatus = deriveCaseSupportStatus(currentCase);

            return (
              <button
                key={currentCase.id}
                type="button"
                onClick={() => handleSelectCase(currentCase.id)}
                aria-pressed={isSelected}
                className={`rounded-[26px] border px-5 py-4 text-left transition-colors ${
                  isSelected
                    ? "border-[var(--color-border-strong)] bg-[var(--color-surface)] shadow-[0_18px_42px_rgba(50,48,47,0.07)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface)]/52 hover:bg-[var(--color-surface)]"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="font-mono text-xs text-[var(--color-muted)]">
                    {currentCase.cluster.id}
                  </span>
                  <StatusPill status={currentStatus} />
                </div>
                <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em]">
                  {currentCase.topicLabel.name}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--color-muted)]">
                  {currentCase.cluster.description}
                </p>
              </button>
            );
          })}
        </section>

        <section
          aria-label="Primary review summary"
          className="rounded-[34px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_24px_70px_rgba(50,48,47,0.07)] sm:p-7 lg:p-8"
        >
          <div className="grid gap-7 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)_280px]">
            <div>
              <p className="text-sm font-medium text-[var(--color-muted)]">
                Selected cluster
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-balance">
                {selectedCase.cluster.name}
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
                {selectedCase.cluster.description ??
                  "Supporting context for the interpretation under review."}
              </p>

              <dl className="mt-6 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <SummaryField label="Cluster ID" value={selectedCase.cluster.id} mono />
                <SummaryField
                  label="Source"
                  value={selectedCase.cluster.source}
                  capitalize
                />
                <SummaryField
                  label="Cluster size"
                  value={selectedCase.cluster.size?.toString() ?? "Unknown"}
                />
              </dl>
            </div>

            <div className="rounded-[28px] border border-[var(--color-border-strong)] bg-white/72 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-medium text-[var(--color-muted)]">
                  Generated interpretation
                </p>
                <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-1 text-xs font-medium text-[var(--color-muted)]">
                  Model output
                </span>
              </div>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-balance">
                {selectedCase.topicLabel.name}
              </h2>
              <p className="mt-5 text-base leading-8 text-[var(--color-muted)]">
                {selectedCase.topicLabel.explanation}
              </p>
              <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                <SummaryField
                  label="Generated by"
                  value={selectedCase.topicLabel.generatedBy}
                />
                <SummaryField
                  label="Generated at"
                  value={formatTimestamp(selectedCase.topicLabel.generatedAt)}
                />
              </dl>
            </div>

            <div className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-panel)]/58 p-5">
              <p className="text-sm font-medium text-[var(--color-muted)]">
                Review state
              </p>
              <p
                className={`mt-4 text-4xl font-semibold tracking-[-0.05em] ${statusMeta[caseStatus].textClassName}`}
              >
                {statusMeta[caseStatus].label}
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
                {statusMeta[caseStatus].plainLanguage}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <MiniMetric
                  label="Average support"
                  value={formatSupportScore(getAverageSupportScore(selectedCase))}
                />
                <MiniMetric label="Claims" value={`${allClaims.length}`} />
                <MiniMetric
                  label="Contradicted"
                  value={`${claimStatusCounts.contradicted}`}
                />
                <MiniMetric
                  label="Evidence"
                  value={`${selectedCase.evidenceItems.length}`}
                />
              </div>
            </div>
          </div>
        </section>

        <section
          aria-label="Evidence-first review workspace"
          className="grid gap-6 xl:grid-cols-[330px_minmax(0,1fr)_340px]"
        >
          <aside className="rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_20px_55px_rgba(50,48,47,0.06)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[var(--color-muted)]">
                  Claim ledger
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
                  Reviewable claims
                </h2>
              </div>
              <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-1 text-xs font-medium text-[var(--color-muted)]">
                {allClaims.length}
              </span>
            </div>

            <div className="mt-5 grid gap-3">
              {allClaims.length > 0 ? (
                allClaims.map((claim) => (
                  <ClaimButton
                    key={claim.id}
                    caseFile={selectedCase}
                    claim={claim}
                    isSelected={claim.id === activeClaim?.id}
                    onSelect={() => setSelectedClaimId(claim.id)}
                  />
                ))
              ) : (
                <EmptyState
                  title="No claims are available"
                  body="Add validation claims to populate the ledger for this case."
                />
              )}
            </div>
          </aside>

          <section className="flex min-w-0 flex-col gap-6">
            <section className="rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_22px_60px_rgba(50,48,47,0.06)] sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-muted)]">
                    Claim under review
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-balance">
                    {activeClaim?.text ?? "No claim selected"}
                  </h2>
                </div>
                {activeClaim ? <StatusPill status={activeClaim.status} /> : null}
              </div>

              {activeClaim ? (
                <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px]">
                  <p className="text-sm leading-7 text-[var(--color-muted)]">
                    {activeClaim.rationale}
                  </p>
                  <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-panel)]/62 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                      Support score
                    </p>
                    <p className="mt-2 text-4xl font-semibold tracking-[-0.05em]">
                      {formatSupportScore(activeClaimScore)}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-[var(--color-muted)]">
                      {activeSupportScore?.rationale ?? "No score rationale is recorded."}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-5 text-sm leading-7 text-[var(--color-muted)]">
                  Select a claim to inspect its evidence relation and score.
                </p>
              )}
            </section>

            <section className="rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_22px_60px_rgba(50,48,47,0.06)] sm:p-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-muted)]">
                    Linked evidence
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
                    What supports or contradicts this claim
                  </h2>
                </div>
                <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-1 text-xs font-medium text-[var(--color-muted)]">
                  {linkedEvidence.length} linked
                </span>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {linkedEvidence.length > 0 ? (
                  linkedEvidence.map((evidence) => (
                    <LinkedEvidenceCard
                      key={evidence.id}
                      evidence={evidence}
                      relations={getRelationsForEvidence(selectedCase, evidence.id).filter(
                        (relation) => relation.claimId === activeClaim?.id,
                      )}
                    />
                  ))
                ) : (
                  <div className="lg:col-span-2">
                    <EmptyState
                      title="Evidence is missing for this claim"
                      body="No evidence relation is recorded through evidenceRelations, so the claim should not be treated as proven."
                    />
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_22px_60px_rgba(50,48,47,0.06)] sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-muted)]">
                    Evidence workspace
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
                    Source-of-truth record
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
                    Linked evidence is highlighted, while unlinked evidence remains visible
                    for context.
                  </p>
                </div>
                <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-1 text-xs font-medium text-[var(--color-muted)]">
                  {filteredEvidence.length} shown
                </span>
              </div>

              <div className="mt-5">
                <EvidenceFilters
                  counts={evidenceCounts}
                  selectedFilter={selectedFilter}
                  onSelect={setSelectedFilter}
                />
              </div>

              <div className="mt-5">
                {filteredEvidence.length > 0 ? (
                  <div className="grid gap-4 2xl:grid-cols-2">
                    {filteredEvidence.map((item) => (
                      <EvidenceCard
                        key={item.id}
                        evidence={item}
                        relations={getRelationsForEvidence(selectedCase, item.id)}
                        highlighted={activeClaimEvidenceIds.has(item.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No evidence matches the current view"
                    body="Choose another polarity filter to inspect the rest of the record."
                  />
                )}
              </div>
            </section>
          </section>

          <aside className="flex flex-col gap-6">
            <section className="rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_20px_55px_rgba(50,48,47,0.06)] sm:p-6 xl:sticky xl:top-6">
              <p className="text-sm font-medium text-[var(--color-muted)]">
                Analyst verdict
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-balance">
                {displayedDecision
                  ? decisionLabel[displayedDecision]
                  : "Awaiting review"}
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
                {selectedCase.analystVerdict?.summary ??
                  "No analyst verdict has been recorded for this synthetic case."}
              </p>

              <div className="mt-6 rounded-[24px] border border-[var(--color-border)] bg-[var(--color-panel)]/62 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  Conclusion
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
                  {activeClaim
                    ? `${statusMeta[activeClaim.status].plainLanguage} The case verdict should account for this evidence state before accepting the generated label.`
                    : "No active claim is available to support a verdict."}
                </p>
              </div>

              <dl className="mt-5 grid gap-3">
                <SummaryField
                  label="Current decision"
                  value={
                    displayedDecision
                      ? decisionLabel[displayedDecision]
                      : "Awaiting review"
                  }
                />
                <SummaryField
                  label="Review timestamp"
                  value={displayedTimestamp ? formatTimestamp(displayedTimestamp) : undefined}
                  empty="Awaiting local review action."
                />
                <SummaryField
                  label="Selected claim score"
                  value={formatSupportScore(activeClaimScore)}
                />
              </dl>

              <div className="mt-6 grid gap-2">
                {decisionActions.map((decision) => {
                  const isActive = currentReviewRecord?.decision === decision;

                  return (
                    <button
                      key={decision}
                      type="button"
                      onClick={() => handleDecision(decision)}
                      aria-pressed={isActive}
                      className={`rounded-[18px] border px-4 py-3 text-left transition-colors ${
                        isActive
                          ? "border-[var(--color-border-strong)] bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]"
                          : "border-[var(--color-border)] bg-white/72 text-[var(--color-ink)] hover:bg-[var(--color-panel)]/70"
                      }`}
                    >
                      <span className="block text-sm font-semibold">
                        {decisionLabel[decision]}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-[var(--color-muted)]">
                        {decisionHelp[decision]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}

function StatusPill({ status }: { status: SupportStatus }) {
  const meta = statusMeta[status];

  return (
    <span
      className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${meta.chipClassName}`}
    >
      {meta.label}
    </span>
  );
}

function PolarityPill({ polarity }: { polarity: EvidencePolarity }) {
  const meta = polarityMeta[polarity];

  return (
    <span
      className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

function SummaryField({
  label,
  value,
  empty = "Not available.",
  mono = false,
  capitalize = false,
}: {
  label: string;
  value?: string;
  empty?: string;
  mono?: boolean;
  capitalize?: boolean;
}) {
  return (
    <div className="rounded-[20px] border border-[var(--color-border)] bg-white/58 px-4 py-3">
      <dt className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
        {label}
      </dt>
      <dd
        className={`mt-2 text-sm font-semibold leading-6 text-[var(--color-ink)] ${
          mono ? "font-mono" : ""
        } ${capitalize ? "capitalize" : ""}`}
      >
        {value ?? empty}
      </dd>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[var(--color-border)] bg-white/58 px-3 py-3">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold tracking-[-0.02em]">{value}</p>
    </div>
  );
}

function QuickReadCard({
  eyebrow,
  title,
  detail,
}: {
  eyebrow: string;
  title: string;
  detail: string;
}) {
  return (
    <article className="rounded-[26px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_16px_40px_rgba(50,48,47,0.05)]">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-balance">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">{detail}</p>
    </article>
  );
}

function ClaimButton({
  caseFile,
  claim,
  isSelected,
  onSelect,
}: {
  caseFile: CaseFile;
  claim: Claim;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const evidenceIds = getEvidenceIdsForClaim(caseFile, claim.id);
  const score = getClaimSupportScore(caseFile, claim.id);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`rounded-[24px] border p-4 text-left transition-colors ${
        isSelected
          ? "border-[var(--color-border-strong)] bg-white shadow-[0_14px_30px_rgba(50,48,47,0.07)]"
          : "border-[var(--color-border)] bg-[var(--color-panel)]/44 hover:bg-white/72"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-xs text-[var(--color-muted)]">{claim.id}</span>
        <StatusPill status={claim.status} />
      </div>
      <p className="mt-3 text-sm font-semibold leading-6 text-[var(--color-ink)]">
        {claim.text}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-[var(--color-muted)]">
        <span className="rounded-full border border-[var(--color-border)] bg-white/65 px-3 py-1">
          Score {formatSupportScore(score)}
        </span>
        <span className="rounded-full border border-[var(--color-border)] bg-white/65 px-3 py-1">
          {evidenceIds.length > 0
            ? `${evidenceIds.length} evidence link${
                evidenceIds.length === 1 ? "" : "s"
              }`
            : "Evidence missing"}
        </span>
      </div>
    </button>
  );
}

function LinkedEvidenceCard({
  evidence,
  relations,
}: {
  evidence: EvidenceItem;
  relations: EvidenceRelation[];
}) {
  const relation = pickStrongestRelation(relations);
  const polarity = relation?.polarity ?? "neutral";

  return (
    <article className="rounded-[24px] border border-[var(--color-border-strong)] bg-white/74 p-5 shadow-[0_14px_34px_rgba(50,48,47,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-muted)]">
          <span className="font-mono">{evidence.id}</span>
          <span>{sourceTypeLabel[evidence.sourceType]}</span>
        </div>
        <PolarityPill polarity={polarity} />
      </div>
      <h3 className="mt-4 text-xl font-semibold tracking-[-0.03em] text-balance">
        {evidence.title}
      </h3>
      <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
        {evidence.summary}
      </p>
      <div className="mt-4 rounded-[20px] border border-[var(--color-border)] bg-[var(--color-panel)]/62 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[var(--color-border)] bg-white/72 px-3 py-1 text-xs font-medium text-[var(--color-muted)]">
            Strength {relation ? strengthLabel[relation.strength] : "Not linked"}
          </span>
          <span className="rounded-full border border-[var(--color-border)] bg-white/72 px-3 py-1 text-xs font-medium text-[var(--color-muted)]">
            Linked through evidenceRelations
          </span>
        </div>
        <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
          {relation?.explanation ?? "No claim relation is recorded for this item."}
        </p>
      </div>
    </article>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[24px] border border-dashed border-[var(--color-border)] bg-white/58 px-5 py-8 text-center">
      <p className="text-sm font-semibold tracking-[-0.01em] text-[var(--color-ink)]">
        {title}
      </p>
      <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">{body}</p>
    </div>
  );
}

function pickStrongestRelation(relations: EvidenceRelation[]) {
  const strengthRank: Record<EvidenceStrength, number> = {
    strong: 3,
    moderate: 2,
    weak: 1,
  };

  return [...relations].sort(
    (left, right) => strengthRank[right.strength] - strengthRank[left.strength],
  )[0];
}

function summarizePolarity(relations: EvidenceRelation[]) {
  const counts = relations.reduce<Record<EvidencePolarity, number>>(
    (currentCounts, relation) => {
      currentCounts[relation.polarity] += 1;
      return currentCounts;
    },
    { supports: 0, contradicts: 0, neutral: 0 },
  );

  return [
    counts.supports > 0 ? `${counts.supports} supports` : undefined,
    counts.contradicts > 0 ? `${counts.contradicts} contradicts` : undefined,
    counts.neutral > 0 ? `${counts.neutral} neutral` : undefined,
  ]
    .filter(Boolean)
    .join(", ");
}

function formatTimestamp(value: string) {
  return value.replace("T", " ").replace("Z", " UTC");
}
