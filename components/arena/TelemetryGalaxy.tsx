import type { CSSProperties, KeyboardEvent } from "react";

import { landscapeStatusMeta } from "@/components/arena/arenaMeta";
import { ClusterNode } from "@/components/arena/ClusterNode";
import type { CaseFile } from "@/lib/types";

type TelemetryGalaxyProps = {
  cases: CaseFile[];
  selectedCase: CaseFile;
  previewCaseId?: string;
  onSelectCase: (caseId: string) => void;
  onPreviewCase: (caseId: string) => void;
  onClearPreview: () => void;
};

type ParticleStyle = CSSProperties & {
  "--particle-x": string;
  "--particle-y": string;
  "--particle-size": string;
  "--particle-opacity": string;
  "--particle-delay": string;
  "--particle-tone": string;
};

type RegionStyle = CSSProperties & {
  "--region-x": string;
  "--region-y": string;
  "--region-width": string;
  "--region-height": string;
  "--region-accent": string;
  "--region-opacity": string;
};

type LinkStyle = CSSProperties & {
  "--link-strength": string;
  "--link-opacity": string;
  "--link-glow-opacity": string;
  "--link-width": string;
  "--link-glow-width": string;
};

export function TelemetryGalaxy({
  cases,
  selectedCase,
  previewCaseId,
  onSelectCase,
  onPreviewCase,
  onClearPreview,
}: TelemetryGalaxyProps) {
  const selectedIndex = Math.max(
    cases.findIndex((caseFile) => caseFile.id === selectedCase.id),
    0,
  );
  const ambientParticles = buildAmbientParticles(cases);
  const galaxyConnections = buildGalaxyConnections(cases);
  const focusCase =
    cases.find((caseFile) => caseFile.id === previewCaseId) ?? selectedCase;

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
    <section className="galaxy-stage stage-surface" aria-label="Telemetry Galaxy">
      <div className="stage-heading">
        <div>
          <p className="eyebrow">Telemetry Galaxy</p>
          <h2>Behavioural regions in semantic space</h2>
        </div>
        <span className="count-pill">{cases.length} synthetic regions</span>
      </div>

      <div
        className="galaxy-map"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        style={
          {
            "--focus-x": `${focusCase.mapPosition.x}%`,
            "--focus-y": `${focusCase.mapPosition.y}%`,
          } as CSSProperties
        }
      >
        <div className="galaxy-ambient" aria-hidden="true">
          {cases.map((caseFile, index) => {
            const status = landscapeStatusMeta[caseFile.landscapeStatus];
            const focusDistance = getMapDistance(caseFile, focusCase);
            const regionClassName = [
              "galaxy-region-boundary",
              caseFile.id === selectedCase.id ? "is-selected" : "",
              focusDistance <= 34 ? "is-nearby" : "is-distant",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <span
                className={regionClassName}
                key={`region-${caseFile.id}`}
                style={
                  {
                    "--region-x": `${caseFile.mapPosition.x}%`,
                    "--region-y": `${caseFile.mapPosition.y}%`,
                    "--region-width": `${22 + caseFile.evidenceStrength * 22}%`,
                    "--region-height": `${18 + caseFile.uncertainty * 22}%`,
                    "--region-accent": status.accent,
                    "--region-opacity": `${0.22 + caseFile.modelAgreement * 0.28}`,
                    transform: `translate(-50%, -50%) rotate(${index % 2 === 0 ? -8 : 11}deg)`,
                  } as RegionStyle
                }
              />
            );
          })}
          <span
            className="galaxy-region-focus"
            style={
              {
                "--region-x": `${selectedCase.mapPosition.x}%`,
                "--region-y": `${selectedCase.mapPosition.y}%`,
                "--region-width": `${28 + selectedCase.evidenceStrength * 24}%`,
                "--region-height": `${24 + selectedCase.uncertainty * 24}%`,
                "--region-accent":
                  landscapeStatusMeta[selectedCase.landscapeStatus].accent,
                "--region-opacity": "0.52",
              } as RegionStyle
            }
          />
          {ambientParticles.map((particle) => (
            <span
              className={particle.className}
              key={particle.id}
              style={particle.style}
            />
          ))}
        </div>

        <div className="galaxy-grid" aria-hidden="true" />

        <svg className="galaxy-connections" aria-hidden="true" viewBox="0 0 100 100">
          {galaxyConnections.map((connection, index) => {
            const isActive =
              connection.from.id === selectedCase.id ||
              connection.to.id === selectedCase.id ||
              connection.from.id === previewCaseId ||
              connection.to.id === previewCaseId;
            const linkStyle: LinkStyle = {
              "--link-strength": connection.strength.toFixed(2),
              "--link-opacity": isActive ? "1" : `${0.26 + connection.strength * 0.24}`,
              "--link-glow-opacity": isActive
                ? "0.34"
                : `${(0.1 + connection.strength * 0.1).toFixed(2)}`,
              "--link-width": `${(0.18 + connection.strength * 0.46).toFixed(2)}`,
              "--link-glow-width": `${(0.72 + connection.strength * 1.24).toFixed(2)}`,
            };
            const path = buildConnectionPath(connection.from, connection.to, index);

            return (
              <g key={connection.id} style={linkStyle}>
                <path className="galaxy-link-shadow" d={path} />
                <path
                  className={`galaxy-link ${isActive ? "is-active" : ""}`}
                  d={path}
                />
              </g>
            );
          })}
        </svg>

        <div className="galaxy-axis galaxy-axis-agreement" aria-hidden="true">
          lower agreement
        </div>
        <div className="galaxy-axis galaxy-axis-evidence" aria-hidden="true">
          stronger evidence
        </div>

        {cases.map((caseFile) => (
          <ClusterNode
            key={caseFile.id}
            caseFile={caseFile}
            selected={caseFile.id === selectedCase.id}
            previewed={caseFile.id === previewCaseId}
            nearby={getMapDistance(caseFile, focusCase) <= 34}
            onSelect={onSelectCase}
            onPreview={onPreviewCase}
            onClearPreview={onClearPreview}
          />
        ))}
      </div>
    </section>
  );
}

function buildConnectionPath(from: CaseFile, to: CaseFile, index: number): string {
  const x1 = from.mapPosition.x;
  const y1 = from.mapPosition.y;
  const x2 = to.mapPosition.x;
  const y2 = to.mapPosition.y;
  const controlX = (x1 + x2) / 2;
  const controlDrift = (index % 2 === 0 ? -1 : 1) * Math.min(
    getMapDistance(from, to) * 0.16 + 3,
    12,
  );
  const controlY = (y1 + y2) / 2 + controlDrift;

  return `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;
}

function buildAmbientParticles(cases: CaseFile[]) {
  return cases.flatMap((caseFile, caseIndex) => {
    const status = landscapeStatusMeta[caseFile.landscapeStatus];
    const particleCount = Math.min(
      30,
      Math.max(12, Math.round((caseFile.cluster.size ?? 80) / 5.5)),
    );

    return Array.from({ length: particleCount }, (_, particleIndex) => {
      const session =
        caseFile.representativeSessions[
          particleIndex % caseFile.representativeSessions.length
        ];
      const seed = hashToUnit(`${caseFile.id}-${session?.id ?? "session"}-${particleIndex}`);
      const angle =
        seed * Math.PI * 2 + ((particleIndex * 47 + caseIndex * 19) * Math.PI) / 180;
      const featureOverlap = session?.featureOverlap ?? 0.62;
      const outlierScore = session?.outlierScore ?? caseFile.uncertainty;
      const radius =
        3.8 +
        (particleIndex % 7) * 1.35 +
        caseFile.uncertainty * 7.5 +
        outlierScore * 8 -
        featureOverlap * 2.8;
      const x = clamp(caseFile.mapPosition.x + Math.cos(angle) * radius, 4, 96);
      const y = clamp(
        caseFile.mapPosition.y + Math.sin(angle) * radius * 0.76,
        5,
        95,
      );
      const size =
        1.4 + featureOverlap * 2.2 + caseFile.evidenceStrength * 1.1 + (seed * 1.2);
      const opacity =
        0.08 + caseFile.modelAgreement * 0.1 + featureOverlap * 0.08 - outlierScore * 0.03;
      const isOutlier = outlierScore >= 0.7;

      return {
        id: `${caseFile.id}-particle-${particleIndex}`,
        className: `galaxy-particle ${isOutlier ? "is-outlier" : ""}`,
        style: {
          "--particle-x": `${x}%`,
          "--particle-y": `${y}%`,
          "--particle-size": `${size}px`,
          "--particle-opacity": `${clamp(opacity, 0.08, 0.34)}`,
          "--particle-delay": `${(caseIndex * 0.7 + particleIndex * 0.17).toFixed(
            2,
          )}s`,
          "--particle-tone": isOutlier ? "var(--arena-amber)" : status.accent,
        } as ParticleStyle,
      };
    });
  });
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

        return {
          id: `${from.id}-${to.id}`,
          from,
          to,
          distance,
          strength,
        };
      }),
    )
    .sort((a, b) => b.strength - a.strength || a.distance - b.distance)
    .slice(0, Math.min(7, cases.length + 2));
}

function getMapDistance(from: CaseFile, to: CaseFile): number {
  return Math.hypot(
    from.mapPosition.x - to.mapPosition.x,
    (from.mapPosition.y - to.mapPosition.y) * 1.08,
  );
}

function hashToUnit(input: string): number {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) % 1000003;
  }

  return hash / 1000003;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
