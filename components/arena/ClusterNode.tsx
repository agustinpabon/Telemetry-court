import type { CSSProperties } from "react";

import { landscapeStatusMeta } from "@/components/arena/arenaMeta";
import { formatSupportScore } from "@/lib/caseMetrics";
import type { CaseFile } from "@/lib/types";

type ClusterNodeProps = {
  caseFile: CaseFile;
  selected: boolean;
  previewed: boolean;
  nearby: boolean;
  connected?: boolean;
  displayPosition?: CaseFile["mapPosition"];
  accent?: string;
  nodeId?: string;
  onSelect: (caseId: string) => void;
  onPreview: (caseId: string) => void;
  onClearPreview: () => void;
};

type ClusterNodeStyle = CSSProperties & {
  "--node-x": string;
  "--node-y": string;
  "--node-accent": string;
  "--node-size": string;
  "--node-ring-size": string;
  "--node-tilt": string;
  "--node-pressure-opacity": string;
  "--node-cloud-scale": string;
  "--node-density-opacity": string;
  "--node-inner-opacity": string;
  "--node-evidence-core": string;
  "--node-uncertainty": string;
};

type DensityPointStyle = CSSProperties & {
  "--session-x": string;
  "--session-y": string;
  "--session-size": string;
  "--session-delay": string;
  "--session-drift-x": string;
  "--session-drift-y": string;
};

export function ClusterNode({
  caseFile,
  selected,
  previewed,
  nearby,
  connected = false,
  displayPosition,
  accent,
  nodeId,
  onSelect,
  onPreview,
  onClearPreview,
}: ClusterNodeProps) {
  const status = landscapeStatusMeta[caseFile.landscapeStatus];
  const shortName = getShortClusterName(caseFile.id, caseFile.cluster.name);
  const position = displayPosition ?? caseFile.mapPosition;
  const nodeAccent = accent ?? status.accent;
  const densityPoints = getDensityPoints(caseFile);
  const evidenceLabel = formatSupportScore(caseFile.evidenceStrength);
  const uncertaintyLabel = formatSupportScore(caseFile.uncertainty);
  const style: ClusterNodeStyle = {
    "--node-x": `${position.x}%`,
    "--node-y": `${position.y}%`,
    "--node-accent": nodeAccent,
    "--node-size": `${82 + Math.min(caseFile.cluster.size ?? 80, 160) * 0.26}px`,
    "--node-ring-size": `${92 + caseFile.uncertainty * 42}px`,
    "--node-tilt": `${caseFile.mapPosition.x % 2 === 0 ? -2 : 2}deg`,
    "--node-pressure-opacity": `${(0.18 + caseFile.uncertainty * 0.38).toFixed(2)}`,
    "--node-cloud-scale": `${(0.98 + Math.min(caseFile.cluster.size ?? 80, 180) / 900).toFixed(3)}`,
    "--node-density-opacity": `${(0.58 + Math.min(caseFile.cluster.size ?? 64, 180) / 420).toFixed(2)}`,
    "--node-inner-opacity": `${(0.26 + caseFile.evidenceStrength * 0.54).toFixed(2)}`,
    "--node-evidence-core": `${(8 + caseFile.evidenceStrength * 17).toFixed(1)}%`,
    "--node-uncertainty": caseFile.uncertainty.toFixed(2),
  };

  return (
    <button
      id={nodeId}
      type="button"
      className={`cluster-node ${status.nodeClassName} ${
        selected ? "is-selected" : ""
      } ${previewed ? "is-previewed" : ""} ${
        connected ? "is-linked" : ""
      } ${nearby ? "is-nearby" : "is-distant"}`}
      style={style}
      onClick={() => onSelect(caseFile.id)}
      onPointerEnter={() => onPreview(caseFile.id)}
      onPointerLeave={onClearPreview}
      onFocus={() => onPreview(caseFile.id)}
      onBlur={onClearPreview}
      aria-pressed={selected}
      aria-current={selected ? "true" : undefined}
      title={`${caseFile.cluster.name} — ${status.label}`}
      aria-label={`Open case: ${
        caseFile.cluster.name
      }, status ${status.label.toLowerCase()}, ${
        caseFile.cluster.size ?? "unknown"
      } sessions, evidence ${evidenceLabel}. Uncertainty ${uncertaintyLabel}.`}
    >
      <span className="cluster-node-halo" aria-hidden="true" />
      <span className="cluster-node-density" aria-hidden="true">
        {densityPoints.map((point) => (
          <span
            key={point.id}
            style={
              {
                "--session-x": `${point.x}%`,
                "--session-y": `${point.y}%`,
                "--session-size": `${point.size}px`,
                "--session-delay": `${point.delay}ms`,
                "--session-drift-x": `${point.driftX}px`,
                "--session-drift-y": `${point.driftY}px`,
              } as DensityPointStyle
            }
          />
        ))}
      </span>
      <span className="cluster-node-orbit" aria-hidden="true" />
      <span className="cluster-node-body">
        <span className="cluster-node-title">{shortName}</span>
        <span className={status.className}>{status.label}</span>
        {selected ? (
          <span className="cluster-node-selected-label">Current</span>
        ) : null}
      </span>
    </button>
  );
}

const densityPointLayouts = [
  { x: 31, y: 34, size: 4.4, delay: 0, driftX: 1.8, driftY: -1.4 },
  { x: 54, y: 28, size: 3.8, delay: 320, driftX: -1.2, driftY: 1.2 },
  { x: 68, y: 47, size: 4.8, delay: 640, driftX: 1.4, driftY: 1.7 },
  { x: 43, y: 55, size: 3.6, delay: 180, driftX: -1.6, driftY: -1.1 },
  { x: 57, y: 68, size: 4.2, delay: 760, driftX: 1.2, driftY: -1.6 },
  { x: 26, y: 60, size: 3.5, delay: 480, driftX: -1.1, driftY: 1.6 },
  { x: 74, y: 34, size: 3.2, delay: 920, driftX: 1.6, driftY: -1.2 },
  { x: 38, y: 44, size: 2.9, delay: 1120, driftX: 1.1, driftY: 1.4 },
  { x: 63, y: 58, size: 3.1, delay: 1280, driftX: -1.4, driftY: -1.2 },
  { x: 47, y: 72, size: 2.8, delay: 1460, driftX: 1.4, driftY: 1.1 },
  { x: 78, y: 61, size: 2.7, delay: 1640, driftX: -1.2, driftY: 1.3 },
  { x: 34, y: 23, size: 2.6, delay: 1820, driftX: 1.2, driftY: -1 },
  { x: 51, y: 42, size: 2.5, delay: 2040, driftX: -1.4, driftY: 1 },
  { x: 22, y: 47, size: 2.4, delay: 2260, driftX: 1.3, driftY: -1.2 },
];

function getDensityPoints(caseFile: CaseFile) {
  const sessionCount = caseFile.cluster.size ?? 64;
  const pointCount = Math.min(Math.max(Math.round(sessionCount / 13), 6), 14);

  return densityPointLayouts.slice(0, pointCount).map((point, index) => ({
    ...point,
    id: `${caseFile.id}-session-${index}`,
  }));
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
