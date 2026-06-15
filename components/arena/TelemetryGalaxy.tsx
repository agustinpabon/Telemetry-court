import type { CSSProperties } from "react";

import { landscapeStatusMeta } from "@/components/arena/arenaMeta";
import {
  EvidenceGalaxyAtlas,
  getGalaxyStatusAccent,
} from "@/components/arena/EvidenceGalaxyAtlas";
import { formatSupportScore } from "@/lib/caseMetrics";
import type { CaseFile } from "@/lib/types";

type TelemetryGalaxyProps = {
  cases: CaseFile[];
  selectedCase: CaseFile;
  previewCaseId?: string;
  onSelectCase: (caseId: string) => void;
  onPreviewCase: (caseId: string) => void;
  onClearPreview: () => void;
  onOpenCaseFile: () => void;
};

type SelectedRegionStyle = CSSProperties & {
  "--selected-accent": string;
};

export function TelemetryGalaxy({
  cases,
  selectedCase,
  previewCaseId,
  onSelectCase,
  onPreviewCase,
  onClearPreview,
  onOpenCaseFile,
}: TelemetryGalaxyProps) {
  return (
    <section className="galaxy-stage stage-surface" aria-label="Telemetry Galaxy">
      <div className="stage-heading">
        <div>
          <p className="eyebrow">Telemetry Galaxy</p>
          <h2>Semantic evidence atlas</h2>
        </div>
      </div>

      <div
        className="galaxy-map"
        style={
          { "--selected-accent": getGalaxyStatusAccent(selectedCase) } as SelectedRegionStyle
        }
      >
        <EvidenceGalaxyAtlas
          cases={cases}
          selectedCase={selectedCase}
          previewCaseId={previewCaseId}
          onSelectCase={onSelectCase}
          onPreviewCase={onPreviewCase}
          onClearPreview={onClearPreview}
        />
        <SelectedRegionPanel
          key={selectedCase.id}
          caseFile={selectedCase}
          onOpenCaseFile={onOpenCaseFile}
        />
      </div>
    </section>
  );
}

function SelectedRegionPanel({
  caseFile,
  onOpenCaseFile,
}: {
  caseFile: CaseFile;
  onOpenCaseFile: () => void;
}) {
  const status = landscapeStatusMeta[caseFile.landscapeStatus];
  const regionName = getDisplayRegionName(caseFile.cluster.name);

  return (
    <aside
      className="selected-region-card"
      aria-label="Selected behavioural region"
      style={{ "--selected-accent": getGalaxyStatusAccent(caseFile) } as SelectedRegionStyle}
    >
      <div className="selected-region-header">
        <div>
          <span className="selected-region-eyebrow">Selected region</span>
          <h3>{regionName}</h3>
        </div>
        <div className="selected-region-status">
          <span className="selected-region-eyebrow">Status</span>
          <span className={status.className}>{status.label}</span>
        </div>
      </div>

      <div className="selected-region-section">
        <span className="selected-region-eyebrow">AI claim under test</span>
        <p className="selected-region-claim">{caseFile.topicLabel.name}</p>
      </div>

      <div className="selected-region-section">
        <span className="selected-region-eyebrow">Why investigate</span>
        <p className="selected-region-copy">{caseFile.topicLabel.explanation}</p>
      </div>

      <div className="selected-region-section" aria-label="Core signals">
        <span className="selected-region-eyebrow">Signals</span>
        <div className="selected-region-metrics">
          <span>
            <strong>{`${caseFile.cluster.size ?? "—"} sessions`}</strong>
          </span>
          <span>
            <strong>{`${formatSupportScore(caseFile.evidenceStrength)} evidence support`}</strong>
          </span>
          <span>
            <strong>{`${formatSupportScore(caseFile.uncertainty)} uncertainty`}</strong>
          </span>
        </div>
      </div>

      <button
        type="button"
        className="primary-action selected-region-cta"
        onClick={onOpenCaseFile}
      >
        Open case file
      </button>
    </aside>
  );
}

function getDisplayRegionName(name: string): string {
  return name.replace(/\s+region$/i, "");
}
