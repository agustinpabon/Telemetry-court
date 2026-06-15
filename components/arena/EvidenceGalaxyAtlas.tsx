import { useMemo, type CSSProperties, type KeyboardEvent } from "react";

import { landscapeStatusMeta } from "@/components/arena/arenaMeta";
import { ClusterNode } from "@/components/arena/ClusterNode";
import { formatSupportScore } from "@/lib/caseMetrics";
import type { CaseFile } from "@/lib/types";

type EvidenceGalaxyAtlasProps = {
  cases: CaseFile[];
  selectedCase: CaseFile;
  previewCaseId?: string;
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
  "--summary-x": string;
  "--summary-y": string;
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

export function EvidenceGalaxyAtlas({
  cases,
  selectedCase,
  previewCaseId,
  onSelectCase,
  onPreviewCase,
  onClearPreview,
}: EvidenceGalaxyAtlasProps) {
  const selectedIndex = Math.max(
    cases.findIndex((caseFile) => caseFile.id === selectedCase.id),
    0,
  );
  const galaxyConnections = useMemo(() => buildGalaxyConnections(cases), [cases]);
  const previewCase =
    cases.find((caseFile) => caseFile.id === previewCaseId) ?? selectedCase;
  const focusCaseId = previewCase.id;
  const linkedCaseIds = useMemo(
    () => buildLinkedCaseIds(galaxyConnections, focusCaseId),
    [galaxyConnections, focusCaseId],
  );
  const focusPosition = getAtlasPosition(previewCase);
  const selectedPosition = getAtlasPosition(selectedCase);
  const selectedAccent = getGalaxyStatusAccent(selectedCase);
  const selectedStatus = landscapeStatusMeta[selectedCase.landscapeStatus];
  const sessionRange = useMemo(() => getSessionRange(cases), [cases]);
  const summaryPosition = getSummaryPosition(selectedPosition);
  const cameraOffsetX = (52 - selectedPosition.x) * 0.08;
  const cameraOffsetY = (48 - selectedPosition.y) * 0.08;
  const mapStyle: AtlasMapStyle = {
    "--focus-x": `${focusPosition.x}%`,
    "--focus-y": `${focusPosition.y}%`,
    "--camera-x": `${cameraOffsetX.toFixed(2)}%`,
    "--camera-y": `${cameraOffsetY.toFixed(2)}%`,
    "--selected-accent": selectedAccent,
    "--summary-x": `${summaryPosition.x}%`,
    "--summary-y": `${summaryPosition.y}%`,
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
    }
  }

  return (
    <div
      className="evidence-galaxy-atlas"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={mapStyle}
      aria-label="Semantic evidence galaxy. Select a behavioural region to open its case preview."
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

      <aside className="atlas-key" aria-label="Map key">
        <p className="atlas-key-note">
          Proximity shows neighbourhoods. Brightness reflects evidence support.
          Ring instability reflects uncertainty.
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
            <dd>Review state</dd>
          </div>
          <div className="atlas-key-row atlas-key-row-path">
            <span className="atlas-key-sample" aria-hidden="true" />
            <dt>Dashed line</dt>
            <dd>Semantic adjacency</dd>
          </div>
        </dl>
        <div className="atlas-status-legend" aria-label="Status tint legend">
          {landscapeStatusOrder.map((statusKey) => {
            const status = landscapeStatusMeta[statusKey];

            return (
              <span
                key={statusKey}
                style={
                  { "--legend-accent": galaxyStatusAccents[statusKey] } as CSSProperties
                }
              >
                {status.label}
              </span>
            );
          })}
        </div>
      </aside>

      <aside
        className="atlas-evidence-summary"
        aria-label={`Selected evidence summary for ${selectedCase.cluster.name}`}
      >
        <span className="atlas-summary-kicker">Selected evidence</span>
        <strong>{getShortAtlasName(selectedCase)}</strong>
        <dl>
          <div>
            <dt>Sessions</dt>
            <dd>{selectedCase.cluster.size ?? "—"}</dd>
          </div>
          <div>
            <dt>Support</dt>
            <dd>{formatSupportScore(selectedCase.evidenceStrength)}</dd>
          </div>
          <div>
            <dt>Uncertainty</dt>
            <dd>{formatSupportScore(selectedCase.uncertainty)}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>
              <span className={selectedStatus.className}>{selectedStatus.label}</span>
            </dd>
          </div>
        </dl>
      </aside>

      <div className="galaxy-camera">
        <div className="galaxy-ambient" aria-hidden="true">
          {cases.map((caseFile, index) => {
            const accent = getGalaxyStatusAccent(caseFile);
            const focusDistance = getMapDistance(caseFile, previewCase);
            const position = getAtlasPosition(caseFile);
            const isLinked = linkedCaseIds.has(caseFile.id);
            const sessionWeight = getSessionWeight(caseFile, sessionRange);
            const statusClassName = getRegionStatusClassName(caseFile);
            const regionClassName = [
              "galaxy-region-boundary",
              statusClassName,
              caseFile.id === selectedCase.id ? "is-selected" : "",
              isLinked ? "is-linked" : "",
              isLinked || focusDistance <= 34 ? "is-nearby" : "is-distant",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <span
                className={regionClassName}
                key={`region-${caseFile.id}`}
                style={
                  {
                    "--region-x": `${position.x}%`,
                    "--region-y": `${position.y}%`,
                    "--region-width": `${16 + sessionWeight * 18}%`,
                    "--region-height": `${
                      12 + sessionWeight * 13 + caseFile.uncertainty * 4
                    }%`,
                    "--region-accent": accent,
                    "--region-opacity": `${0.18 + caseFile.modelAgreement * 0.2}`,
                    "--region-support": `${(0.07 + caseFile.evidenceStrength * 0.2).toFixed(2)}`,
                    "--region-pressure": `${(0.1 + caseFile.uncertainty * 0.32).toFixed(2)}`,
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
            displayPosition={getAtlasPosition(caseFile)}
            accent={getGalaxyStatusAccent(caseFile)}
            onSelect={onSelectCase}
            onPreview={onPreviewCase}
            onClearPreview={onClearPreview}
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

const galaxyStatusAccents: Record<CaseFile["landscapeStatus"], string> = {
  supported: "#73e0d2",
  overclaimed: "#d77f76",
  impure: "#f2c879",
  too_broad: "#8ee8ff",
  uncertain: "#9b8cff",
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

export function getGalaxyStatusAccent(caseFile: CaseFile): string {
  return galaxyStatusAccents[caseFile.landscapeStatus];
}

function buildConnectionPath(from: CaseFile, to: CaseFile, index: number): string {
  const fromPosition = getAtlasPosition(from);
  const toPosition = getAtlasPosition(to);
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

function getAtlasPosition(caseFile: CaseFile): CaseFile["mapPosition"] {
  return atlasDisplayPositions[caseFile.id] ?? {
    x: 28 + caseFile.mapPosition.x * 0.64,
    y: 12 + caseFile.mapPosition.y * 0.74,
  };
}

function buildGalaxyConnections(cases: CaseFile[]) {
  return cases
    .flatMap((from, fromIndex) =>
      cases.slice(fromIndex + 1).map((to) => {
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
    .slice(0, Math.min(6, cases.length + 1));
}

function getMapDistance(from: CaseFile, to: CaseFile): number {
  return Math.hypot(
    from.mapPosition.x - to.mapPosition.x,
    (from.mapPosition.y - to.mapPosition.y) * 1.08,
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getConnectionType(
  from: CaseFile,
  to: CaseFile,
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
  similarity: "rgba(142, 232, 255, 0.72)",
  uncertain: "rgba(155, 140, 255, 0.64)",
  overclaim: "rgba(215, 127, 118, 0.66)",
};

const galaxyConnectionDashArrays: Record<GalaxyConnectionType, string> = {
  similarity: "0.28 4.6",
  uncertain: "0.8 5.8",
  overclaim: "1.4 5.2",
};

function getSessionRange(cases: CaseFile[]): SessionRange {
  const sessionCounts = cases.map((caseFile) => caseFile.cluster.size ?? 0);

  return {
    min: Math.min(...sessionCounts),
    max: Math.max(...sessionCounts),
  };
}

function getSessionWeight(caseFile: CaseFile, range: SessionRange): number {
  const size = caseFile.cluster.size ?? range.min;
  const spread = Math.max(range.max - range.min, 1);

  return clamp((size - range.min) / spread, 0, 1);
}

function getSummaryPosition(position: CaseFile["mapPosition"]): CaseFile["mapPosition"] {
  return {
    x: clamp(position.x > 68 ? position.x - 14 : position.x + 14, 17, 82),
    y: clamp(position.y > 58 ? position.y - 17 : position.y + 17, 24, 80),
  };
}

function getRegionStatusClassName(caseFile: CaseFile): string {
  return `is-${caseFile.landscapeStatus.replace("_", "-")}`;
}

function getShortAtlasName(caseFile: CaseFile): string {
  return caseFile.cluster.name.replace(/\s+region$/i, "");
}
