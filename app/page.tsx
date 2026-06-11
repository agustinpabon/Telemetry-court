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
  getPrimaryEvidencePolarity,
} from "@/lib/caseMetrics";
import type { AnalystDecision, EvidenceRelation } from "@/lib/types";

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
      <main className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)]">
        <div className="mx-auto flex min-h-screen w-full max-w-[980px] items-center justify-center px-5 py-10 sm:px-8">
          <section className="w-full rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-medium text-[var(--color-muted)]">Telemetry Court</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
              No review cases are available
            </h1>
            <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
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
      (item) => getPrimaryEvidencePolarity(relationsForEvidence(item.id)) === "supports",
    ).length,
    neutral: selectedCase.evidenceItems.filter(
      (item) => getPrimaryEvidencePolarity(relationsForEvidence(item.id)) === "neutral",
    ).length,
    contradicts: selectedCase.evidenceItems.filter(
      (item) => getPrimaryEvidencePolarity(relationsForEvidence(item.id)) === "contradicts",
    ).length,
  };

  const polarityFilteredEvidence =
    selectedFilter === "all"
      ? selectedCase.evidenceItems
      : selectedCase.evidenceItems.filter(
          (item) =>
            getPrimaryEvidencePolarity(relationsForEvidence(item.id)) ===
            selectedFilter,
        );

  const filteredEvidence = effectiveSelectedClaim
    ? polarityFilteredEvidence.filter((item) => selectedClaimEvidenceIds.has(item.id))
    : polarityFilteredEvidence;

  const currentReviewRecord = decisionsByCase[selectedCase.id];

  function relationsForEvidence(evidenceId: string): EvidenceRelation[] {
    return selectedCase.evidenceRelations.filter(
      (relation) => relation.evidenceId === evidenceId,
    );
  }

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
    <main className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
        <header className="rounded-[34px] border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-7 shadow-[0_24px_60px_rgba(15,23,42,0.07)] sm:px-8 lg:px-10">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-[var(--color-muted)]">
            Telemetry Court
          </p>
          <div className="mt-4 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.06em] text-balance sm:text-5xl lg:text-[3.5rem]">
                A trust layer for AI-generated telemetry interpretations.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--color-muted)]">
                Review the generated name and description, test each claim against the
                record, and issue a verdict that makes the interpretation legible to a
                human reviewer.
              </p>
            </div>

            <div className="rounded-[24px] border border-[var(--color-border-strong)] bg-[var(--color-accent-soft)] px-5 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
                Workflow
              </p>
              <p className="mt-2 max-w-md text-sm leading-7 text-[var(--color-accent-strong)]">
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
          supportScores={selectedCase.supportScores}
          selectedClaimId={effectiveSelectedClaim?.id}
          onSelectClaim={handleSelectClaim}
          onClearClaim={() => setSelectedClaimId(undefined)}
        />

        <section className="rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_22px_55px_rgba(15,23,42,0.06)] sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-muted)]">Evidence workspace</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                Source-of-truth record
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
                Evidence should carry the page visually. This is the material the claims and
                verdict are actually built from.
              </p>
            </div>
            <div className="rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-1 text-xs font-medium text-[var(--color-muted)]">
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
              <div className="rounded-[22px] border border-[var(--color-border-strong)] bg-[var(--color-accent-soft)] px-4 py-3 text-sm leading-7 text-[var(--color-accent-strong)]">
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
                    relations={relationsForEvidence(item.id)}
                    highlighted={
                      effectiveSelectedClaim
                        ? selectedClaimEvidenceIds.has(item.id)
                        : false
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-[var(--color-border)] bg-white/65 px-5 py-10 text-center">
                <p className="text-base font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
                  No evidence matches the current view.
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
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
