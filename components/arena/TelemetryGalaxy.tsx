import type { CSSProperties } from "react";

import {
  getEvidenceStrengthTaxonomyLabel,
  landscapeStatusMeta,
  reviewStateTaxonomyLabel,
} from "@/components/arena/arenaMeta";
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
    <section className="galaxy-stage stage-surface" aria-label="Evidence landscape">
      <div className="stage-heading">
        <div>
          <h2>Evidence landscape</h2>
          <p className="stage-heading-copy">
            Open a region to test whether the model&apos;s label is supported by
            evidence.
          </p>
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
  const evidenceStrength = getEvidenceStrengthTaxonomyLabel(
    caseFile.evidenceStrength,
    caseFile.landscapeStatus,
  );
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
          <span className="selected-region-eyebrow">Review state</span>
          <span className="review-taxonomy-label">
            {reviewStateTaxonomyLabel[caseFile.reviewStatus]}
          </span>
        </div>
      </div>

      <div className="selected-region-section">
        <span className="selected-region-eyebrow">Claim under test</span>
        <p className="selected-region-claim">{caseFile.topicLabel.name}</p>
      </div>

      <div className="selected-region-section">
        <span className="selected-region-eyebrow">Why investigate</span>
        <p className="selected-region-copy">{caseFile.topicLabel.explanation}</p>
      </div>

      <div className="selected-region-section" aria-label="Core signals">
        <span className="selected-region-eyebrow">Review metadata</span>
        <dl className="selected-region-metrics">
          <div>
            <dt>Verdict</dt>
            <dd>
              <span className={status.className}>{status.label}</span>
            </dd>
          </div>
          <div>
            <dt>Evidence</dt>
            <dd>{evidenceStrength}</dd>
          </div>
          <div>
            <dt>Uncertainty</dt>
            <dd>{formatSupportScore(caseFile.uncertainty)}</dd>
          </div>
        </dl>
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
