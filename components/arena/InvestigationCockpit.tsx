import {
  landscapeStatusMeta,
  reviewStatusLabel,
} from "@/components/arena/arenaMeta";
import { arenaStages } from "@/lib/arenaReviewState";
import { formatSupportScore, getAverageSupportScore } from "@/lib/caseMetrics";
import type { ArenaStage, CaseReviewState } from "@/lib/arenaReviewState";
import type { CaseFile } from "@/lib/types";

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
  const primaryAction = getPrimaryAction({
    activeStage,
    reviewState,
    onOpenCaseFile,
    onStartInvestigation,
    onRevealAiLabel,
    onOpenReviewDrawer,
  });

  return (
    <aside className="investigation-cockpit" aria-label="Investigation cockpit">
      <div className="cockpit-header">
        <div>
          <p className="eyebrow">Investigation Cockpit</p>
          <h2>{caseFile.cluster.name}</h2>
        </div>
        <span className={status.className}>{status.label}</span>
      </div>

      <div className="cockpit-stage-summary">
        <span>Current station</span>
        <strong>{activeStageLabel}</strong>
      </div>

      <div className="cockpit-claim">
        <span className="cockpit-claim-label">AI claim under test</span>
        {reviewState.aiLabelRevealed ? (
          <strong>{caseFile.topicLabel.name}</strong>
        ) : (
          <strong className="redacted-claim">Hidden until blind read</strong>
        )}
      </div>

      <dl className="cockpit-metrics">
        <Metric label="Agreement" value={formatSupportScore(caseFile.modelAgreement)} />
        <Metric label="Evidence" value={formatSupportScore(caseFile.evidenceStrength)} />
        <Metric label="Uncertainty" value={formatSupportScore(caseFile.uncertainty)} />
        <Metric
          label="Avg. support"
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

      <button
        type="button"
        className="primary-action"
        onClick={primaryAction.onClick}
        disabled={primaryAction.disabled}
      >
        {primaryAction.label}
      </button>
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
