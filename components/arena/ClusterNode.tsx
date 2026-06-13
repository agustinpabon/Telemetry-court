import type { CSSProperties } from "react";

import { landscapeStatusMeta } from "@/components/arena/arenaMeta";
import { formatSupportScore } from "@/lib/caseMetrics";
import type { CaseFile } from "@/lib/types";

type ClusterNodeProps = {
  caseFile: CaseFile;
  selected: boolean;
  previewed: boolean;
  nearby: boolean;
  onSelect: (caseId: string) => void;
  onPreview: (caseId: string) => void;
  onClearPreview: () => void;
};

type ClusterNodeStyle = CSSProperties & {
  "--node-x": string;
  "--node-y": string;
  "--node-accent": string;
  "--node-strength": string;
  "--node-agreement": string;
  "--node-uncertainty": string;
  "--node-strength-angle": string;
  "--node-agreement-angle": string;
  "--node-uncertainty-angle": string;
  "--node-size": string;
  "--node-tilt": string;
};

export function ClusterNode({
  caseFile,
  selected,
  previewed,
  nearby,
  onSelect,
  onPreview,
  onClearPreview,
}: ClusterNodeProps) {
  const status = landscapeStatusMeta[caseFile.landscapeStatus];
  const shortName = getShortClusterName(caseFile.id, caseFile.cluster.name);
  const style: ClusterNodeStyle = {
    "--node-x": `${caseFile.mapPosition.x}%`,
    "--node-y": `${caseFile.mapPosition.y}%`,
    "--node-accent": status.accent,
    "--node-strength": `${Math.max(caseFile.evidenceStrength * 100, 8)}%`,
    "--node-agreement": `${Math.max(caseFile.modelAgreement * 100, 8)}%`,
    "--node-uncertainty": `${Math.max(caseFile.uncertainty * 100, 8)}%`,
    "--node-strength-angle": `${Math.max(caseFile.evidenceStrength * 360, 18)}deg`,
    "--node-agreement-angle": `${Math.max(caseFile.modelAgreement * 360, 18)}deg`,
    "--node-uncertainty-angle": `${Math.max(caseFile.uncertainty * 360, 18)}deg`,
    "--node-size": `${108 + Math.min(caseFile.cluster.size ?? 80, 150) * 0.16}px`,
    "--node-tilt": `${caseFile.mapPosition.x % 2 === 0 ? -2 : 2}deg`,
  };

  return (
    <button
      type="button"
      className={`cluster-node ${status.nodeClassName} ${
        selected ? "is-selected" : ""
      } ${previewed ? "is-previewed" : ""} ${nearby ? "is-nearby" : "is-distant"}`}
      style={style}
      onClick={() => onSelect(caseFile.id)}
      onMouseEnter={() => onPreview(caseFile.id)}
      onMouseLeave={onClearPreview}
      onPointerEnter={() => onPreview(caseFile.id)}
      onPointerLeave={onClearPreview}
      onFocus={() => onPreview(caseFile.id)}
      onBlur={onClearPreview}
      aria-pressed={selected}
      aria-label={`${caseFile.cluster.name}. ${status.label}. Agreement ${formatSupportScore(
        caseFile.modelAgreement,
      )}. Evidence ${formatSupportScore(
        caseFile.evidenceStrength,
      )}. Uncertainty ${formatSupportScore(caseFile.uncertainty)}.`}
    >
      <span className="cluster-node-halo" aria-hidden="true" />
      <span className="cluster-node-orbit" aria-hidden="true" />
      <span className="cluster-node-body">
        <span className="cluster-node-signal-ring" aria-hidden="true" />
        <span className="cluster-node-title">{shortName}</span>
        <span className={status.className}>{status.label}</span>
        <span className="cluster-node-metrics" aria-hidden="true">
          <span className="cluster-node-meter cluster-node-meter-agreement">
            <span />
          </span>
          <span className="cluster-node-meter cluster-node-meter-strength">
            <span />
          </span>
          <span className="cluster-node-meter cluster-node-meter-uncertainty">
            <span />
          </span>
        </span>
        <span className="cluster-node-detail" aria-hidden="true">
          {caseFile.cluster.size ?? "?"} sessions
        </span>
      </span>
    </button>
  );
}

function getShortClusterName(caseId: string, fallback: string): string {
  const shortNames: Record<string, string> = {
    "case-arena-001": "IAM roles",
    "case-arena-002": "PowerShell",
    "case-arena-003": "Service maint.",
    "case-arena-004": "S3 enum.",
    "case-arena-005": "Cred prep",
  };

  return shortNames[caseId] ?? fallback.replace(/\s+region$/i, "");
}
