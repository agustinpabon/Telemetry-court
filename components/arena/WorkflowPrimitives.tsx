import type { ReactNode } from "react";

import { arenaStages, type ArenaStage } from "@/lib/arenaReviewState";

type ArenaHeaderProps = {
  actions?: ReactNode;
};

export function ArenaHeader({ actions }: ArenaHeaderProps) {
  return (
    <header className="arena-topbar arena-header">
      <div className="arena-brand">
        <div>
          <h1>Telemetry Court</h1>
          <p>Evidence review for AI-named telemetry clusters.</p>
        </div>
      </div>
      {actions ? <div className="arena-topbar-actions">{actions}</div> : null}
    </header>
  );
}

type ArenaWorkflowShellProps = {
  ariaLabel: string;
  children?: ReactNode;
  className?: string;
};

export function ArenaWorkflowShell({
  ariaLabel,
  children,
  className,
}: ArenaWorkflowShellProps) {
  return (
    <section
      className={["arena-workflow-shell", "stage-surface", className]
        .filter(Boolean)
        .join(" ")}
      aria-label={ariaLabel}
    >
      {children}
    </section>
  );
}

type ArenaStepProgressProps = {
  currentStage: ArenaStage;
  className?: string;
  label?: string;
  onSelectStage?: (stage: ArenaStage) => void;
};

export function ArenaStepProgress({
  currentStage,
  className,
  label,
  onSelectStage,
}: ArenaStepProgressProps) {
  const currentStageIndex = arenaStages.findIndex(
    (stage) => stage.id === currentStage,
  );
  const currentStageLabel =
    label ??
    arenaStages.find((stage) => stage.id === currentStage)?.label ??
    "Workflow";
  const currentStep =
    currentStageIndex >= 0 ? currentStageIndex + 1 : arenaStages.length;

  return (
    <nav
      className={["arena-step-progress", className].filter(Boolean).join(" ")}
      aria-label={`${currentStageLabel} progress`}
    >
      <div className="arena-step-progress-summary">
        <strong>
          Step {currentStep} of {arenaStages.length} · {currentStageLabel}
        </strong>
      </div>
      <ol>
        {arenaStages.map((stage, index) => {
          const isCurrent = stage.id === currentStage;
          const isComplete = currentStageIndex >= 0 && index < currentStageIndex;
          const stageLabel = `${index + 1}. ${stage.label}${
            isCurrent ? ", current step" : ""
          }`;

          return (
            <li
              key={stage.id}
              className={`${isComplete ? "is-complete" : ""} ${
                isCurrent ? "is-current" : ""
              }`}
              aria-current={isCurrent ? "step" : undefined}
              aria-label={onSelectStage ? undefined : stageLabel}
            >
              {onSelectStage ? (
                <button
                  type="button"
                  onClick={() => onSelectStage(stage.id)}
                  aria-label={stageLabel}
                >
                  <span aria-hidden="true" />
                </button>
              ) : (
                <span aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

type ArenaStatusBadgeTone =
  | "neutral"
  | "sealed"
  | "blind-read"
  | "evidence-gap"
  | "overclaim"
  | "supported"
  | "uncertain"
  | "contradicted"
  | "unsupported"
  | "weak";

type ArenaStatusBadgeProps = {
  children?: ReactNode;
  tone?: ArenaStatusBadgeTone;
  ariaLabel?: string;
};

export function ArenaStatusBadge({
  children,
  tone = "neutral",
  ariaLabel,
}: ArenaStatusBadgeProps) {
  return (
    <span
      className={`arena-status-badge arena-status-badge-${tone}`}
      aria-label={ariaLabel}
    >
      {children}
    </span>
  );
}

type ArenaStepHeroProps = {
  eyebrow?: string;
  status?: ReactNode;
  title: string;
  summary: ReactNode;
  context?: ReactNode;
};

export function ArenaStepHero({
  eyebrow,
  status,
  title,
  summary,
  context,
}: ArenaStepHeroProps) {
  return (
    <header className="arena-step-hero">
      <div className="arena-step-hero-copy">
        <div className="arena-step-hero-meta">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          {status}
        </div>
        <h2>{title}</h2>
        <p className="arena-step-hero-summary">{summary}</p>
        {context ? <p className="arena-step-hero-context">{context}</p> : null}
      </div>
    </header>
  );
}

export function ArenaReviewerGoal() {
  return (
    <div className="arena-reviewer-goal">
      Your job: decide whether the AI label is supported by the evidence. Prefer
      narrow, evidence-grounded conclusions. Flag overclaiming, uncertainty, or
      cluster impurity.
    </div>
  );
}

type ArenaAction = {
  label: ReactNode;
  onClick: () => void;
  disabled?: boolean;
};

type ArenaActionFooterProps = {
  microcopy: ReactNode;
  primaryAction: ArenaAction;
  auxiliaryActions?: ArenaAction[];
  secondaryAction?: ArenaAction;
  ariaLabel?: string;
  className?: string;
};

export function ArenaActionFooter({
  microcopy,
  primaryAction,
  auxiliaryActions = [],
  secondaryAction,
  ariaLabel = "Workflow actions",
  className,
}: ArenaActionFooterProps) {
  return (
    <footer
      className={["arena-action-footer", className].filter(Boolean).join(" ")}
      aria-label={ariaLabel}
    >
      <p>{microcopy}</p>
      <div>
        {secondaryAction ? (
          <button
            type="button"
            className="secondary-action"
            disabled={secondaryAction.disabled}
            onClick={secondaryAction.onClick}
          >
            {secondaryAction.label}
          </button>
        ) : null}
        {auxiliaryActions.map((action, index) => (
          <button
            key={`auxiliary-action-${index}`}
            type="button"
            className="secondary-action"
            disabled={action.disabled}
            onClick={action.onClick}
          >
            {action.label}
          </button>
        ))}
        <button
          type="button"
          className="primary-action"
          disabled={primaryAction.disabled}
          onClick={primaryAction.onClick}
        >
          {primaryAction.label}
        </button>
      </div>
    </footer>
  );
}

type StageHeaderProps = {
  kicker: string;
  title: string;
  description: string;
  meta?: ReactNode;
};

export function StageHeader({
  kicker,
  title,
  description,
  meta,
}: StageHeaderProps) {
  return (
    <div className="stage-heading workflow-stage-heading">
      <div>
        <p className="eyebrow">{kicker}</p>
        <h2>{title}</h2>
        <p className="stage-heading-copy">{description}</p>
      </div>
      {meta}
    </div>
  );
}

type SectionHeaderProps = {
  title: string;
  description?: string;
  meta?: ReactNode;
};

export function SectionHeader({ title, description, meta }: SectionHeaderProps) {
  return (
    <div className="workflow-section-header">
      <div>
        <h3>{title}</h3>
        {description ? <p>{description}</p> : null}
      </div>
      {meta}
    </div>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
  detail?: string;
};

export function MetricCard({ label, value, detail }: MetricCardProps) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {detail ? <p>{detail}</p> : null}
    </div>
  );
}

type SealedClaimBlockProps = {
  title?: string;
  description: string;
  revealed?: boolean;
};

export function SealedClaimBlock({
  title = "AI claim hidden",
  description,
  revealed = false,
}: SealedClaimBlockProps) {
  return (
    <aside className={`sealed-claim-block ${revealed ? "is-revealed" : ""}`}>
      <span aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
    </aside>
  );
}
