"use client";

import { useState } from "react";

import { CaseSwitcher } from "@/components/CaseSwitcher";
import { ClaimLedger } from "@/components/ClaimLedger";
import { ClaimPanel } from "@/components/ClaimPanel";
import { ClusterPanel } from "@/components/ClusterPanel";
import { CourtRecord } from "@/components/CourtRecord";
import { EvidenceCard } from "@/components/EvidenceCard";
import {
  EvidenceFilters,
  type EvidenceFilterValue,
} from "@/components/EvidenceFilters";
import { InterpretationRisks } from "@/components/InterpretationRisks";
import { ReviewActions } from "@/components/ReviewActions";
import { ScorePanel } from "@/components/ScorePanel";
import { sampleCases } from "@/data/sampleCases";
import {
  getClaimsForCluster,
  getEvidenceForClaim,
  getRelationsForEvidence,
  getPrimaryEvidencePolarity,
} from "@/lib/caseMetrics";
import type { AnalystDecision } from "@/lib/types";

export default function Home() {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    sampleCases[0]?.id ?? "",
  );
  const [selectedFilter, setSelectedFilter] =
    useState<EvidenceFilterValue>("all");
  const [selectedClaimId, setSelectedClaimId] = useState<string | undefined>(
    undefined,
  );
  const [decisionsByCase, setDecisionsByCase] = useState<
    Partial<Record<string, { decision: AnalystDecision; timestamp: string }>>
  >({});

  const selectedCase =
    sampleCases.find((currentCase) => currentCase.id === selectedCaseId) ??
    sampleCases[0];

  if (!selectedCase) {
    return (
      <main className="tc-app-canvas">
        <div className="mx-auto flex min-h-screen w-full max-w-[980px] items-center justify-center px-5 py-10 sm:px-8">
          <section className="tc-panel w-full p-8 text-center">
            <p className="text-sm font-medium text-[var(--tc-muted)]">Telemetry Court</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
              No review cases are available
            </h1>
            <p className="mt-3 text-sm leading-7 text-[var(--tc-muted)]">
              Add synthetic sample cases to begin reviewing Toponymy-style interpretations.
            </p>
          </section>
        </div>
      </main>
    );
  }

  const allClaims = getClaimsForCluster(selectedCase, selectedCase.cluster.id);
  const selectedClaim = allClaims.find((claim) => claim.id === selectedClaimId);
  const effectiveSelectedClaim =
    selectedClaim && allClaims.some((claim) => claim.id === selectedClaim.id)
      ? selectedClaim
      : undefined;
  const selectedClaimEvidenceIds = new Set(
    effectiveSelectedClaim
      ? getEvidenceForClaim(selectedCase, effectiveSelectedClaim.id).map(
          (evidence) => evidence.id,
        )
      : [],
  );

  const evidenceCounts: Record<EvidenceFilterValue, number> = {
    all: selectedCase.evidenceItems.length,
    supports: selectedCase.evidenceItems.filter(
      (item) =>
        getPrimaryEvidencePolarity(getRelationsForEvidence(selectedCase, item.id)) ===
        "supports",
    ).length,
    neutral: selectedCase.evidenceItems.filter(
      (item) =>
        getPrimaryEvidencePolarity(getRelationsForEvidence(selectedCase, item.id)) ===
        "neutral",
    ).length,
    contradicts: selectedCase.evidenceItems.filter(
      (item) =>
        getPrimaryEvidencePolarity(getRelationsForEvidence(selectedCase, item.id)) ===
        "contradicts",
    ).length,
  };

  const polarityFilteredEvidence =
    selectedFilter === "all"
      ? selectedCase.evidenceItems
      : selectedCase.evidenceItems.filter(
          (item) =>
            getPrimaryEvidencePolarity(getRelationsForEvidence(selectedCase, item.id)) ===
            selectedFilter,
        );

  const filteredEvidence = effectiveSelectedClaim
    ? polarityFilteredEvidence.filter((item) => selectedClaimEvidenceIds.has(item.id))
    : polarityFilteredEvidence;

  const currentReviewRecord = decisionsByCase[selectedCase.id];
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
    setSelectedCaseId(caseId);
    setSelectedClaimId(undefined);
  }

  function handleSelectClaim(claimId: string) {
    setSelectedClaimId((currentClaimId) =>
      currentClaimId === claimId ? undefined : claimId,
    );
  }

  return (
    <main className="tc-app-canvas">
      <div className="tc-page-shell">
        <header className="tc-panel px-6 py-7 sm:px-8 lg:px-10">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-[var(--tc-muted)]">
            Telemetry Court
          </p>
          <div className="mt-4 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <h1 className="max-w-4xl text-3xl font-semibold tracking-[-0.04em] text-balance sm:text-4xl lg:text-5xl">
                A trust layer for AI-generated telemetry interpretations.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--tc-muted)]">
                Review the generated name and description, test each claim against the
                record, and issue a verdict that makes the interpretation legible to a
                human reviewer.
              </p>
            </div>

            <div className="tc-panel-subtle px-5 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--tc-focus)]">
                Workflow
              </p>
              <p className="mt-2 max-w-md text-sm leading-7 text-[var(--tc-ink)]">
                Cluster to AI label to claims to evidence to support score to analyst
                verdict.
              </p>
            </div>
          </div>
        </header>

        <CaseSwitcher
          cases={sampleCases}
          selectedCaseId={selectedCase.id}
          onSelect={handleSelectCase}
        />

        <section
          aria-label="Primary review workspace"
          className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_380px]"
        >
          <ClaimPanel topicLabel={selectedCase.topicLabel} />
          <div className="flex flex-col gap-6">
            <ScorePanel caseFile={selectedCase} />
            <CourtRecord
              topicLabel={selectedCase.topicLabel}
              reviewDecision={currentReviewRecord?.decision}
              reviewTimestamp={currentReviewRecord?.timestamp}
              analystVerdict={selectedCase.analystVerdict}
              caseFile={selectedCase}
            />
            <InterpretationRisks claims={selectedCase.claims} />
            <ReviewActions
              decision={currentReviewRecord?.decision}
              onDecision={handleDecision}
            />
          </div>
        </section>

        <ClaimLedger
          caseFile={selectedCase}
          claims={allClaims}
          selectedClaimId={effectiveSelectedClaim?.id}
          onSelectClaim={handleSelectClaim}
          onClearClaim={() => setSelectedClaimId(undefined)}
        />

        <section className="tc-panel p-6 sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--tc-muted)]">Evidence workspace</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                Source-of-truth record
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--tc-muted)]">
                Evidence should carry the page visually. This is the material the claims and
                verdict are actually built from.
              </p>
            </div>
            <div className="tc-pill px-3 py-1 text-xs font-medium">
              {filteredEvidence.length} shown
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <EvidenceFilters
              counts={evidenceCounts}
              selectedFilter={selectedFilter}
              onSelect={setSelectedFilter}
            />

            {effectiveSelectedClaim ? (
              <div className="rounded-[var(--tc-radius-md)] border border-[var(--tc-border)] bg-[var(--tc-focus-surface)] px-4 py-3 text-sm leading-7 text-[var(--tc-focus)]">
                Evidence is currently filtered to claim{" "}
                <span className="font-mono">{effectiveSelectedClaim.id}</span>. Only linked
                evidence is shown.
              </div>
            ) : null}
          </div>

          <div className="mt-6">
            {filteredEvidence.length > 0 ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {filteredEvidence.map((item) => (
                  <EvidenceCard
                    key={item.id}
                    evidence={item}
                    relations={getRelationsForEvidence(selectedCase, item.id)}
                    highlighted={
                      effectiveSelectedClaim
                        ? selectedClaimEvidenceIds.has(item.id)
                        : false
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-[var(--tc-radius-lg)] border border-dashed border-[var(--tc-border)] bg-[var(--tc-surface-muted)] px-5 py-10 text-center">
                <p className="text-base font-semibold tracking-[-0.02em] text-[var(--tc-ink)]">
                  No evidence matches the current view.
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--tc-muted)]">
                  {effectiveSelectedClaim
                    ? "No evidence matches this claim under the current polarity filter. Clear the claim focus or adjust the evidence filter to broaden the record."
                    : "No evidence matches this filter. Try another polarity view to inspect the rest of the record."}
                </p>
              </div>
            )}
          </div>
        </section>

        <ClusterPanel cluster={selectedCase.cluster} />
      </div>
    </main>
  );
}
