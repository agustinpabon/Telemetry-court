import { useId, useMemo, type CSSProperties, type KeyboardEvent } from "react";

import {
  getEvidenceStrengthTaxonomyClassName,
  getEvidenceStrengthTaxonomyLabel,
  landscapeStatusMeta,
} from "@/components/arena/arenaMeta";
import {
  ClusterNode,
  type ClusterNodeStatusPresentation,
} from "@/components/arena/ClusterNode";
import { formatSupportScore } from "@/lib/caseMetrics";
import type {
  CaseFile,
  LandscapeContextNode,
  LandscapeNode,
} from "@/lib/types";

type EvidenceGalaxyAtlasProps = {
  cases: CaseFile[];
  landscapeContextNodes?: LandscapeContextNode[];
  selectedCase: CaseFile;
  previewCaseId?: string;
  ariaLabel?: string;
  keyNote?: string;
  statusLegend?: Array<{
    id: string;
    label: string;
    accent: string;
  }>;
  selectedRegionLabel?: string;
  statusMetricLabel?: string;
  getNodePresentation?: (node: LandscapeNode) => ClusterNodeStatusPresentation;
  onSelectCase: (caseId: string) => void;
  onPreviewCase: (caseId: string) => void;
  onClearPreview: () => void;
};

type AtlasMapStyle = CSSProperties & {
  "--focus-x": string;
  "--focus-y": string;
  "--camera-x": string;
  "--camera-y": string;
  "--selected-accent": string;
};

type RegionFieldStyle = CSSProperties & {
  "--region-x": string;
  "--region-y": string;
  "--region-width": string;
  "--region-height": string;
  "--region-accent": string;
  "--region-opacity": string;
  "--region-support": string;
  "--region-pressure": string;
  "--region-delay": string;
};

type LinkStyle = CSSProperties & {
  "--link-accent": string;
  "--link-dash": string;
  "--link-strength": string;
  "--link-opacity": string;
  "--link-glow-opacity": string;
  "--link-width": string;
  "--link-glow-width": string;
};

type ContextNodeStyle = CSSProperties & {
  "--context-node-x": string;
  "--context-node-y": string;
  "--context-node-accent": string;
  "--context-node-evidence": string;
  "--context-node-uncertainty": string;
};

export function EvidenceGalaxyAtlas({
  cases,
  landscapeContextNodes = [],
  selectedCase,
  previewCaseId,
  ariaLabel = "Evidence landscape. Select a behavioural region to open its case preview. Use arrow keys to move between regions.",
  keyNote = "Proximity groups related behaviour; size, ring, and tint encode review signals.",
  statusLegend,
  selectedRegionLabel = "Selected region",
  statusMetricLabel = "Verdict",
  getNodePresentation = getDefaultNodePresentation,
  onSelectCase,
  onPreviewCase,
  onClearPreview,
}: EvidenceGalaxyAtlasProps) {
  const atlasDescriptionId = useId();
  const atlasKeyTitleId = useId();
  const selectedIndex = Math.max(
    cases.findIndex((caseFile) => caseFile.id === selectedCase.id),
    0,
  );
  const landscapeNodes = useMemo(
    () => [...cases, ...landscapeContextNodes],
    [cases, landscapeContextNodes],
  );
  const galaxyConnections = useMemo(
    () => buildGalaxyConnections(landscapeNodes),
    [landscapeNodes],
  );
  const previewCase =
    cases.find((caseFile) => caseFile.id === previewCaseId) ?? selectedCase;
  const focusCaseId = previewCase.id;
  const linkedCaseIds = useMemo(
    () => buildLinkedCaseIds(galaxyConnections, focusCaseId),
    [galaxyConnections, focusCaseId],
  );
  const focusPosition = getLandscapeAtlasPosition(previewCase);
  const selectedPosition = getLandscapeAtlasPosition(selectedCase);
  const selectedPresentation = getNodePresentation(selectedCase);
  const selectedAccent = selectedPresentation.accent;
  const selectedStatus = selectedPresentation;
  const selectedEvidenceStrength = getEvidenceStrengthTaxonomyLabel(
    selectedCase.evidenceStrength,
    selectedCase.landscapeStatus,
  );
  const selectedEvidenceStrengthClassName = getEvidenceStrengthTaxonomyClassName(
    selectedEvidenceStrength,
  );
  const sessionRange = useMemo(
    () => getSessionRange(landscapeNodes),
    [landscapeNodes],
  );
  const cameraOffsetX = (52 - selectedPosition.x) * 0.08;
  const cameraOffsetY = (48 - selectedPosition.y) * 0.08;
  const mapStyle: AtlasMapStyle = {
    "--focus-x": `${focusPosition.x}%`,
    "--focus-y": `${focusPosition.y}%`,
    "--camera-x": `${cameraOffsetX.toFixed(2)}%`,
    "--camera-y": `${cameraOffsetY.toFixed(2)}%`,
    "--selected-accent": selectedAccent,
  };

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    const direction =
      event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
    const nextIndex = (selectedIndex + direction + cases.length) % cases.length;
    const nextCase = cases[nextIndex];

    if (nextCase) {
      onSelectCase(nextCase.id);
      onPreviewCase(nextCase.id);
      requestAnimationFrame(() => {
        document.getElementById(getAtlasNodeId(nextCase.id))?.focus({
          preventScroll: true,
        });
      });
    }
  }

  return (
    <div
      className="evidence-galaxy-atlas"
      role="group"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={mapStyle}
      aria-describedby={atlasDescriptionId}
      aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight"
      aria-label={ariaLabel}
    >
      <div className="atlas-space-surface" aria-hidden="true">
        <span className="galaxy-depth-haze galaxy-depth-haze-a" />
        <span className="galaxy-depth-haze galaxy-depth-haze-b" />
        <span className="galaxy-core" />
        <span className="galaxy-core-ring" />
        <span className="galaxy-nebula galaxy-nebula-primary" />
        <span className="galaxy-nebula galaxy-nebula-secondary" />
        <span className="galaxy-nebula galaxy-nebula-tertiary" />
        <span className="galaxy-nebula galaxy-nebula-quaternary" />
        <span className="galaxy-starfield" />
        <span className="galaxy-starfield galaxy-starfield-far" />
        <span className="galaxy-vignette" />
      </div>

      <div className="galaxy-orbits" aria-hidden="true">
        <span className="galaxy-orbit galaxy-orbit-one" />
        <span className="galaxy-orbit galaxy-orbit-two" />
        <span className="galaxy-orbit galaxy-orbit-three" />
        <span className="galaxy-orbit galaxy-orbit-four" />
      </div>

      <aside className="atlas-key" aria-labelledby={atlasKeyTitleId}>
        <div className="atlas-key-header">
          <span id={atlasKeyTitleId}>Key</span>
          <span>{landscapeNodes.length} nodes</span>
        </div>
        <p className="atlas-key-note" id={atlasDescriptionId}>
          {keyNote}
        </p>
        <dl className="atlas-key-encodings">
          <div className="atlas-key-row atlas-key-row-size">
            <span className="atlas-key-sample" aria-hidden="true" />
            <dt>Region size</dt>
            <dd>Session count</dd>
          </div>
          <div className="atlas-key-row atlas-key-row-density">
            <span className="atlas-key-sample" aria-hidden="true" />
            <dt>Particles</dt>
            <dd>Representative sessions</dd>
          </div>
          <div className="atlas-key-row atlas-key-row-brightness">
            <span className="atlas-key-sample" aria-hidden="true" />
            <dt>Brightness</dt>
            <dd>Evidence support</dd>
          </div>
          <div className="atlas-key-row atlas-key-row-ring">
            <span className="atlas-key-sample" aria-hidden="true" />
            <dt>Ring</dt>
            <dd>Uncertainty pressure</dd>
          </div>
          <div className="atlas-key-row atlas-key-row-tint">
            <span className="atlas-key-sample" aria-hidden="true" />
            <dt>Tint</dt>
            <dd>Verdict</dd>
          </div>
          <div className="atlas-key-row atlas-key-row-path">
            <span className="atlas-key-sample" aria-hidden="true" />
            <dt>Dashed line</dt>
            <dd>Semantic adjacency</dd>
          </div>
        </dl>
        <div className="atlas-status-legend" aria-label="Verdict taxonomy">
          {(statusLegend ?? getDefaultStatusLegend()).map((status) => {

            return (
              <span
                key={status.id}
                style={
                  { "--legend-accent": status.accent } as CSSProperties
                }
              >
                {status.label}
              </span>
            );
          })}
        </div>
      </aside>

      <aside
        key={selectedCase.id}
        className="atlas-evidence-summary"
        aria-label={`Selected evidence summary for ${selectedCase.cluster.name}`}
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="atlas-selection-copy">
          <span className="atlas-summary-kicker">{selectedRegionLabel}</span>
          <strong>{getShortAtlasName(selectedCase)}</strong>
        </div>
        <dl className="atlas-selection-metrics">
          <div>
            <dt>Sessions</dt>
            <dd>{selectedCase.cluster.size ?? "—"}</dd>
          </div>
          <div>
            <dt>{statusMetricLabel}</dt>
            <dd>
              <span className={selectedStatus.className}>{selectedStatus.label}</span>
            </dd>
          </div>
          <div>
            <dt>Evidence</dt>
            <dd>
              <span className={selectedEvidenceStrengthClassName}>
                {selectedEvidenceStrength}
              </span>
            </dd>
          </div>
          <div>
            <dt>Uncertainty</dt>
            <dd>{formatSupportScore(selectedCase.uncertainty)}</dd>
          </div>
        </dl>
      </aside>

      <div className="galaxy-camera">
        <div className="galaxy-ambient" aria-hidden="true">
          {landscapeNodes.map((node, index) => {
            const presentation = getNodePresentation(node);
            const accent = presentation.accent;
            const focusDistance = getMapDistance(node, previewCase);
            const position = getLandscapeAtlasPosition(node);
            const isLinked = linkedCaseIds.has(node.id);
            const sessionWeight = getSessionWeight(node, sessionRange);
            const statusClassName = getRegionStatusClassName(node);
            const regionClassName = [
              "galaxy-region-boundary",
              statusClassName,
              node.id === selectedCase.id ? "is-selected" : "",
              isLandscapeContextNode(node) ? "is-context-node" : "",
              isLinked ? "is-linked" : "",
              isLinked || focusDistance <= 34 ? "is-nearby" : "is-distant",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <span
                className={regionClassName}
                key={`region-${node.id}`}
                style={
                  {
                    "--region-x": `${position.x}%`,
                    "--region-y": `${position.y}%`,
                    "--region-width": `${16 + sessionWeight * 18}%`,
                    "--region-height": `${
                      12 + sessionWeight * 13 + node.uncertainty * 4
                    }%`,
                    "--region-accent": accent,
                    "--region-opacity": `${0.18 + node.modelAgreement * 0.2}`,
                    "--region-support": `${(0.07 + node.evidenceStrength * 0.2).toFixed(2)}`,
                    "--region-pressure": `${(0.1 + node.uncertainty * 0.32).toFixed(2)}`,
                    "--region-delay": `${140 + index * 42}ms`,
                    transform: `translate(-50%, -50%) rotate(${
                      index % 2 === 0 ? -8 : 6
                    }deg)`,
                  } as RegionFieldStyle
                }
              />
            );
          })}
        </div>

        <div className="galaxy-grid" aria-hidden="true" />

        <svg className="galaxy-connections" aria-hidden="true" viewBox="0 0 100 100">
          {galaxyConnections.map((connection, index) => {
            const isActive =
              connection.from.id === focusCaseId || connection.to.id === focusCaseId;
            const linkStyle: LinkStyle = {
              "--link-strength": connection.strength.toFixed(2),
              "--link-accent": connection.accent,
              "--link-dash": connection.dashArray,
              "--link-opacity": isActive
                ? "0.68"
                : `${(0.055 + connection.strength * 0.09).toFixed(2)}`,
              "--link-glow-opacity": isActive ? "0.15" : "0.012",
              "--link-width": `${(0.18 + connection.strength * 0.28).toFixed(2)}`,
              "--link-glow-width": `${(0.62 + connection.strength * 0.9).toFixed(
                2,
              )}`,
            };
            const path = buildConnectionPath(connection.from, connection.to, index);

            return (
              <g key={connection.id} style={linkStyle}>
                <path className="galaxy-link-shadow" d={path} />
                <path
                  className={`galaxy-link galaxy-link-${connection.type} ${
                    isActive ? "is-active" : ""
                  }`}
                  d={path}
                />
              </g>
            );
          })}
        </svg>

        {cases.map((caseFile) => (
          <ClusterNode
            key={caseFile.id}
            caseFile={caseFile}
            selected={caseFile.id === selectedCase.id}
            previewed={caseFile.id === previewCaseId}
            nearby={
              linkedCaseIds.has(caseFile.id) ||
              getMapDistance(caseFile, previewCase) <= 34
            }
            connected={linkedCaseIds.has(caseFile.id)}
            displayPosition={getLandscapeAtlasPosition(caseFile)}
            accent={getNodePresentation(caseFile).accent}
            statusPresentation={getNodePresentation(caseFile)}
            nodeId={getAtlasNodeId(caseFile.id)}
            onSelect={onSelectCase}
            onPreview={onPreviewCase}
            onClearPreview={onClearPreview}
          />
        ))}

        {landscapeContextNodes.map((node) => (
          <LandscapeContextPoint
            key={node.id}
            node={node}
            nearby={
              linkedCaseIds.has(node.id) ||
              getMapDistance(node, previewCase) <= 34
            }
          />
        ))}
      </div>
    </div>
  );
}

export const landscapeStatusOrder = [
  "supported",
  "overclaimed",
  "uncertain",
  "impure",
  "too_broad",
] as const;

const galaxyStatusAccents: Record<LandscapeNode["landscapeStatus"], string> = {
  supported: "#8fb6a0",
  overclaimed: "#c9958d",
  impure: "#c6ad78",
  too_broad: "#91abc3",
  uncertain: "#afa0bf",
};

const atlasDisplayPositions: Record<string, CaseFile["mapPosition"]> = {
  "case-arena-001": { x: 48, y: 61 },
  "case-arena-002": { x: 71, y: 32 },
  "case-arena-003": { x: 65, y: 71 },
  "case-arena-004": { x: 43, y: 37 },
  "case-arena-005": { x: 82, y: 55 },
};

type SessionRange = {
  min: number;
  max: number;
};

type GalaxyConnectionType = "similarity" | "uncertain" | "overclaim";

export function getGalaxyStatusAccent(node: LandscapeNode): string {
  return galaxyStatusAccents[node.landscapeStatus];
}

function getDefaultNodePresentation(node: LandscapeNode): ClusterNodeStatusPresentation {
  const status = landscapeStatusMeta[node.landscapeStatus];

  return {
    label: status.label,
    className: status.className,
    nodeClassName: status.nodeClassName,
    accent: galaxyStatusAccents[node.landscapeStatus],
  };
}

function getDefaultStatusLegend(): Array<{
  id: string;
  label: string;
  accent: string;
}> {
  return landscapeStatusOrder.map((statusKey) => {
    const status = landscapeStatusMeta[statusKey];

    return {
      id: statusKey,
      label: status.label,
      accent: galaxyStatusAccents[statusKey],
    };
  });
}

function LandscapeContextPoint({
  node,
  nearby,
}: {
  node: LandscapeContextNode;
  nearby: boolean;
}) {
  const position = getLandscapeAtlasPosition(node);
  const style: ContextNodeStyle = {
    "--context-node-x": `${position.x}%`,
    "--context-node-y": `${position.y}%`,
    "--context-node-accent": getGalaxyStatusAccent(node),
    "--context-node-evidence": node.evidenceStrength.toFixed(2),
    "--context-node-uncertainty": node.uncertainty.toFixed(2),
  };

  return (
    <span
      className={`landscape-context-node ${nearby ? "is-nearby" : "is-distant"}`}
      role="img"
      aria-label={`${node.cluster.id} context node: ${node.label}`}
      style={style}
    />
  );
}

function buildConnectionPath(from: LandscapeNode, to: LandscapeNode, index: number): string {
  const fromPosition = getLandscapeAtlasPosition(from);
  const toPosition = getLandscapeAtlasPosition(to);
  const x1 = fromPosition.x;
  const y1 = fromPosition.y;
  const x2 = toPosition.x;
  const y2 = toPosition.y;
  const controlX =
    (x1 + x2) / 2 +
    (index % 3 === 0 ? -1 : 1) * Math.min(Math.abs(y1 - y2) * 0.08, 4);
  const controlDrift = (index % 2 === 0 ? -1 : 1) * Math.min(
    getMapDistance(from, to) * 0.11 + 2,
    8,
  );
  const controlY = (y1 + y2) / 2 + controlDrift;

  return `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;
}

function buildLinkedCaseIds(
  connections: ReturnType<typeof buildGalaxyConnections>,
  focusCaseId: string,
) {
  const linkedCaseIds = new Set<string>();

  connections.forEach((connection) => {
    if (connection.from.id === focusCaseId) {
      linkedCaseIds.add(connection.to.id);
    }

    if (connection.to.id === focusCaseId) {
      linkedCaseIds.add(connection.from.id);
    }
  });

  return linkedCaseIds;
}

export function getLandscapeAtlasPosition(node: LandscapeNode): LandscapeNode["mapPosition"] {
  return atlasDisplayPositions[node.id] ?? {
    x: 28 + node.mapPosition.x * 0.64,
    y: 12 + node.mapPosition.y * 0.74,
  };
}

function buildGalaxyConnections(nodes: LandscapeNode[]) {
  return nodes
    .flatMap((from, fromIndex) =>
      nodes.slice(fromIndex + 1).map((to) => {
        const distance = getMapDistance(from, to);
        const evidenceDelta = Math.abs(from.evidenceStrength - to.evidenceStrength);
        const agreementDelta = Math.abs(from.modelAgreement - to.modelAgreement);
        const uncertaintyDelta = Math.abs(from.uncertainty - to.uncertainty);
        const strength = clamp(
          1 - distance / 86 - (evidenceDelta + agreementDelta + uncertaintyDelta) / 5,
          0.16,
          0.92,
        );
        const type = getConnectionType(from, to, {
          evidenceDelta,
          uncertaintyDelta,
        });

        return {
          id: `${from.id}-${to.id}`,
          from,
          to,
          distance,
          strength,
          type,
          accent: galaxyConnectionAccents[type],
          dashArray: galaxyConnectionDashArrays[type],
        };
      }),
    )
    .sort((a, b) => b.strength - a.strength || a.distance - b.distance)
    .slice(0, Math.min(7, nodes.length + 1));
}

function getMapDistance(from: LandscapeNode, to: LandscapeNode): number {
  return Math.hypot(
    from.mapPosition.x - to.mapPosition.x,
    (from.mapPosition.y - to.mapPosition.y) * 1.08,
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getConnectionType(
  from: LandscapeNode,
  to: LandscapeNode,
  deltas: {
    evidenceDelta: number;
    uncertaintyDelta: number;
  },
): GalaxyConnectionType {
  if (
    from.landscapeStatus === "overclaimed" ||
    to.landscapeStatus === "overclaimed" ||
    deltas.evidenceDelta > 0.36
  ) {
    return "overclaim";
  }

  if (
    from.landscapeStatus === "uncertain" ||
    to.landscapeStatus === "uncertain" ||
    (from.uncertainty + to.uncertainty) / 2 > 0.6 ||
    deltas.uncertaintyDelta > 0.26
  ) {
    return "uncertain";
  }

  return "similarity";
}

const galaxyConnectionAccents: Record<GalaxyConnectionType, string> = {
  similarity: "rgba(145, 171, 195, 0.56)",
  uncertain: "rgba(175, 160, 191, 0.52)",
  overclaim: "rgba(201, 149, 141, 0.54)",
};

const galaxyConnectionDashArrays: Record<GalaxyConnectionType, string> = {
  similarity: "0.28 4.6",
  uncertain: "0.8 5.8",
  overclaim: "1.4 5.2",
};

function getSessionRange(nodes: LandscapeNode[]): SessionRange {
  const sessionCounts = nodes.map((node) => node.cluster.size ?? 0);

  return {
    min: Math.min(...sessionCounts),
    max: Math.max(...sessionCounts),
  };
}

function getSessionWeight(node: LandscapeNode, range: SessionRange): number {
  const size = node.cluster.size ?? range.min;
  const spread = Math.max(range.max - range.min, 1);

  return clamp((size - range.min) / spread, 0, 1);
}

function getRegionStatusClassName(node: LandscapeNode): string {
  return `is-${node.landscapeStatus.replace("_", "-")}`;
}

function getAtlasNodeId(caseId: string): string {
  return `atlas-node-${caseId}`;
}

function getShortAtlasName(caseFile: CaseFile): string {
  return caseFile.cluster.name.replace(/\s+region$/i, "");
}

function isLandscapeContextNode(node: LandscapeNode): node is LandscapeContextNode {
  return "nodeType" in node && node.nodeType === "context";
}
