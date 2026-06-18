import {
  landscapeStatusMeta,
  reviewStatusLabel,
} from "@/components/arena/arenaMeta";
import { arenaStages, labelsMatch } from "@/lib/arenaReviewState";
import { formatSupportScore, getAverageSupportScore } from "@/lib/caseMetrics";
import type { ArenaStage, CaseReviewState } from "@/lib/arenaReviewState";
import type { CaseFile, LandscapeStatus } from "@/lib/types";

type InvestigationCockpitProps = {
  caseFile: CaseFile;
  activeStage: ArenaStage;
  reviewState: CaseReviewState;
  reviewCompletion: number;
  onOpenCaseFile: () => void;
  onStartInvestigation: () => void;
  onRevealAiLabel: () => void;
  onOpenReviewDrawer: () => void;
};

const cockpitReviewStatusLabel: Record<LandscapeStatus, string> = {
  supported: "Supported",
  overclaimed: "Overclaim",
  impure: "Mixed cluster",
  too_broad: "Too broad",
  uncertain: "Uncertain",
};

export function InvestigationCockpit({
  caseFile,
  activeStage,
  reviewState,
  reviewCompletion,
  onOpenCaseFile,
  onStartInvestigation,
  onRevealAiLabel,
  onOpenReviewDrawer,
}: InvestigationCockpitProps) {
  const status = landscapeStatusMeta[caseFile.landscapeStatus];
  const activeStageLabel =
    arenaStages.find((stage) => stage.id === activeStage)?.label ?? "Investigation";
  const primaryAction =
    activeStage === "blind_read"
      ? null
      : getPrimaryAction({
          activeStage,
          reviewState,
          onOpenCaseFile,
          onStartInvestigation,
          onRevealAiLabel,
          onOpenReviewDrawer,
        });
  const isCaseFileStage = activeStage === "case_file";
  const isBlindReadBeforeReveal =
    activeStage === "blind_read" && !reviewState.aiLabelRevealed;
  const blindChoice = caseFile.blindInterpretationOptions.find(
    (option) => option.id === reviewState.blindChoiceId,
  );
  const aiClaimState = reviewState.aiLabelRevealed
    ? "Revealed after blind read"
    : "Hidden until you choose";
  const resultLabel = getResultLabel({
    blindChoiceLabel: blindChoice?.label,
    caseFile,
    revealed: reviewState.aiLabelRevealed,
  });

  return (
    <aside
      className={`investigation-cockpit ${isCaseFileStage ? "cockpit-case-file" : ""}`}
      aria-label="Case status"
    >
      <div className="cockpit-header">
        <div>
          <p className="eyebrow">Case status</p>
          <h2>{caseFile.cluster.name}</h2>
        </div>
        {isBlindReadBeforeReveal ? (
          <span className="status-chip status-chip-neutral">Blind read</span>
        ) : (
          <span className={status.className}>{status.label}</span>
        )}
      </div>

      {isCaseFileStage ? (
        <>
          <dl className="case-cockpit-list">
            <SummaryLine label="Stage" value={activeStageLabel} />
            <SummaryLine label="AI claim" value={aiClaimState} />
            <SummaryLine
              label="Review status"
              value={cockpitReviewStatusLabel[caseFile.landscapeStatus]}
            />
            <SummaryLine
              label="Progress"
              value={
                reviewState.blindChoiceId
                  ? "Blind read already started"
                  : "Case opened / blind read not started"
              }
            />
          </dl>

          <button
            type="button"
            className="primary-action"
            onClick={primaryAction?.onClick}
            disabled={primaryAction?.disabled}
          >
            {primaryAction?.label}
          </button>
        </>
      ) : isBlindReadBeforeReveal ? (
        <dl className="case-status-list">
          <SummaryLine label="Stage" value={activeStageLabel} />
          <SummaryLine label="AI claim" value="Hidden" />
          <SummaryLine
            label="Your choice"
            value={blindChoice?.label ?? "Not selected yet"}
          />
          <SummaryLine
            label="Next step"
            value={
              blindChoice
                ? "Reveal the AI label"
                : "Choose an interpretation to reveal AI label"
            }
          />
        </dl>
      ) : (
        <>
          <div className="cockpit-stage-summary">
            <span>Stage</span>
            <strong>{activeStageLabel}</strong>
          </div>

          <div className="cockpit-claim">
            <span className="cockpit-claim-label">AI claim</span>
            {reviewState.aiLabelRevealed ? (
              <strong>{caseFile.topicLabel.name}</strong>
            ) : (
              <strong className="redacted-claim">Hidden until you choose</strong>
            )}
          </div>

          <dl className="case-status-list">
            <SummaryLine
              label="User interpretation"
              value={blindChoice?.label ?? "Not recorded"}
            />
            <SummaryLine label="Result" value={resultLabel} />
          </dl>

          <dl className="cockpit-metrics">
            <Metric label="Agreement" value={formatSupportScore(caseFile.modelAgreement)} />
            <Metric
              label="Evidence support"
              value={formatSupportScore(caseFile.evidenceStrength)}
            />
            <Metric label="Uncertainty" value={formatSupportScore(caseFile.uncertainty)} />
            <Metric
              label="Average support"
              value={formatSupportScore(getAverageSupportScore(caseFile))}
            />
          </dl>

          <div className="cockpit-metadata">
            <SummaryLine label="Dataset" value={caseFile.dataset} />
            <SummaryLine label="Cluster" value={caseFile.cluster.id} mono />
            <SummaryLine
              label="Sessions"
              value={caseFile.cluster.size?.toString() ?? "Unknown"}
            />
            <SummaryLine label="Review" value={reviewStatusLabel[caseFile.reviewStatus]} />
          </div>

          <div className="cockpit-section">
            <h3>Top features</h3>
            <div className="chip-row">
              {caseFile.topFeatures.slice(0, 4).map((feature) => (
                <span className="soft-chip" key={feature}>
                  {feature}
                </span>
              ))}
            </div>
          </div>

          <div className="cockpit-section">
            <h3>Risk flags</h3>
            <div className="chip-row">
              {caseFile.riskFlags.slice(0, 3).map((flag) => (
                <span className="risk-chip" key={flag}>
                  {flag}
                </span>
              ))}
            </div>
          </div>

          <div className="cockpit-progress">
            <span>{reviewCompletion}/6 review steps complete</span>
            <div className="cockpit-progress-track" aria-hidden="true">
              <span style={{ width: `${(reviewCompletion / 6) * 100}%` }} />
            </div>
          </div>

          {primaryAction ? (
            <button
              type="button"
              className="primary-action"
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled}
            >
              {primaryAction.label}
            </button>
          ) : null}
        </>
      )}
    </aside>
  );
}

function getPrimaryAction({
  activeStage,
  reviewState,
  onOpenCaseFile,
  onStartInvestigation,
  onRevealAiLabel,
  onOpenReviewDrawer,
}: {
  activeStage: ArenaStage;
  reviewState: CaseReviewState;
  onOpenCaseFile: () => void;
  onStartInvestigation: () => void;
  onRevealAiLabel: () => void;
  onOpenReviewDrawer: () => void;
}) {
  if (activeStage === "landscape") {
    return { label: "Open case file", onClick: onOpenCaseFile, disabled: false };
  }

  if (activeStage === "case_file") {
    return {
      label: "Start blind investigation",
      onClick: onStartInvestigation,
      disabled: false,
    };
  }

  if (activeStage === "blind_read") {
    return {
      label: "Reveal AI label",
      onClick: onRevealAiLabel,
      disabled: !reviewState.blindChoiceId,
    };
  }

  if (activeStage === "verdict" && reviewState.finalVerdict) {
    return {
      label: "Open review JSON",
      onClick: onOpenReviewDrawer,
      disabled: false,
    };
  }

  return {
    label: "Open review summary",
    onClick: onOpenReviewDrawer,
    disabled: false,
  };
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function getResultLabel({
  blindChoiceLabel,
  caseFile,
  revealed,
}: {
  blindChoiceLabel?: string;
  caseFile: CaseFile;
  revealed?: boolean;
}): string {
  if (!revealed) {
    return "Pending";
  }

  if (labelsMatch(blindChoiceLabel, caseFile.topicLabel.name)) {
    return "Match";
  }

  return cockpitReviewStatusLabel[caseFile.landscapeStatus];
}

function SummaryLine({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt>{label}</dt>
      <dd className={mono ? "mono-value" : undefined}>{value}</dd>
    </div>
  );
}
