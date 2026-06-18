import type { CSSProperties } from "react";

import { landscapeStatusMeta } from "@/components/arena/arenaMeta";
import { formatSupportScore } from "@/lib/caseMetrics";
import type { CaseFile } from "@/lib/types";

type SemanticMiniMapProps = {
  detail?: string;
  caseFile: CaseFile;
  label?: string;
  neutral?: boolean;
  showEvidenceMetric?: boolean;
};

type MiniMapStyle = CSSProperties & {
  "--mini-x": string;
  "--mini-y": string;
  "--mini-accent": string;
  "--mini-evidence": string;
  "--mini-uncertainty": string;
};

const referencePoints = [
  { x: "18%", y: "62%" },
  { x: "34%", y: "26%" },
  { x: "48%", y: "34%" },
  { x: "68%", y: "66%" },
  { x: "78%", y: "42%" },
];

export function SemanticMiniMap({
  detail,
  caseFile,
  label = "Semantic position",
  neutral = false,
  showEvidenceMetric = true,
}: SemanticMiniMapProps) {
  const status = landscapeStatusMeta[caseFile.landscapeStatus];
  const style: MiniMapStyle = {
    "--mini-x": `${caseFile.mapPosition.x}%`,
    "--mini-y": `${caseFile.mapPosition.y}%`,
    "--mini-accent": neutral ? "#6f625c" : status.accent,
    "--mini-evidence": `${Math.max(caseFile.evidenceStrength * 100, 8)}%`,
    "--mini-uncertainty": `${Math.max(caseFile.uncertainty * 100, 8)}%`,
  };

  return (
    <aside
      className={`semantic-mini-map ${neutral ? "is-neutral" : ""}`}
      style={style}
      aria-label={label}
    >
      <div className="mini-map-field" aria-hidden="true">
        {referencePoints.map((point, index) => (
          <span
            className="mini-map-reference"
            key={`${point.x}-${point.y}`}
            style={{ left: point.x, top: point.y, opacity: index === 0 ? 0.28 : 0.18 }}
          />
        ))}
        <span className="mini-map-orbit mini-map-orbit-evidence" />
        <span className="mini-map-orbit mini-map-orbit-uncertainty" />
        <span className="mini-map-focus" />
      </div>
      <div className="mini-map-caption">
        <span>{label}</span>
        <strong>
          {showEvidenceMetric
            ? `${formatSupportScore(caseFile.evidenceStrength)} evidence`
            : detail ?? "Blind context"}
        </strong>
      </div>
    </aside>
  );
}
