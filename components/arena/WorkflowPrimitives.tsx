import type { ReactNode } from "react";

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
