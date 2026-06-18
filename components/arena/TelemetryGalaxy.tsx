import type { CSSProperties } from "react";

import {
  getEvidenceStrengthTaxonomyClassName,
  getEvidenceStrengthTaxonomyLabel,
  landscapeStatusMeta,
  reviewStateTaxonomyLabel,
} from "@/components/arena/arenaMeta";
import {
  EvidenceGalaxyAtlas,
  getGalaxyStatusAccent,
} from "@/components/arena/EvidenceGalaxyAtlas";
import {
  ArenaStepProgress,
  ArenaWorkflowShell,
} from "@/components/arena/WorkflowPrimitives";
import type { ArenaStage } from "@/lib/arenaReviewState";
import { formatSupportScore } from "@/lib/caseMetrics";
import type { CaseFile, LandscapeContextNode } from "@/lib/types";

type TelemetryGalaxyProps = {
  cases: CaseFile[];
  landscapeContextNodes?: LandscapeContextNode[];
  selectedCase: CaseFile;
  previewCaseId?: string;
  onSelectCase: (caseId: string) => void;
  onPreviewCase: (caseId: string) => void;
  onClearPreview: () => void;
  onOpenCaseFile: () => void;
  onSelectStage?: (stage: ArenaStage) => void;
};

type SelectedRegionStyle = CSSProperties & {
  "--selected-accent": string;
};

export function TelemetryGalaxy({
  cases,
  landscapeContextNodes = [],
  selectedCase,
  previewCaseId,
  onSelectCase,
  onPreviewCase,
  onClearPreview,
  onOpenCaseFile,
  onSelectStage,
}: TelemetryGalaxyProps) {
  return (
    <ArenaWorkflowShell className="galaxy-stage" ariaLabel="Evidence landscape">
      <ArenaStepProgress
        currentStage="landscape"
        onSelectStage={onSelectStage}
      />

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
          landscapeContextNodes={landscapeContextNodes}
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
    </ArenaWorkflowShell>
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
  const evidenceStrengthClassName =
    getEvidenceStrengthTaxonomyClassName(evidenceStrength);
  const regionName = getDisplayRegionName(caseFile.cluster.name);
  const evidencePacketSummary = getEvidencePacketSummary(caseFile);

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
        <div className="selected-region-review-note">
          <p>{getSelectedRegionReviewNote(caseFile)}</p>
          <span>Open the case file before accepting or revising the label.</span>
        </div>
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
            <dd>
              <span className={evidenceStrengthClassName}>{evidenceStrength}</span>
            </dd>
          </div>
          <div>
            <dt>Uncertainty</dt>
            <dd>{formatSupportScore(caseFile.uncertainty)}</dd>
          </div>
        </dl>
      </div>

      <div className="selected-region-section selected-region-evidence-packet">
        <div className="selected-region-evidence-heading">
          <span className="selected-region-eyebrow">Evidence packet</span>
          <span>{evidencePacketSummary}</span>
        </div>
        <div className="selected-region-feature-list" aria-label="Top evidence signals">
          {caseFile.topFeatures.slice(0, 3).map((feature) => (
            <span key={feature}>{feature}</span>
          ))}
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

function getSelectedRegionReviewNote(caseFile: CaseFile): string {
  switch (caseFile.landscapeStatus) {
    case "supported":
      return "Observed evidence directly matches the model label; verify the linked sessions before accepting it.";
    case "overclaimed":
      return "Administrative changes are present, but intent and abuse remain unproven.";
    case "impure":
      return "The region contains mixed behaviours, so one label may not cover the whole cluster.";
    case "too_broad":
      return "The evidence supports the activity pattern, but the label may be broader than the sessions justify.";
    case "uncertain":
      return "The evidence is suggestive but incomplete; preserve uncertainty unless the case file supports a stronger label.";
  }
}

function getEvidencePacketSummary(caseFile: CaseFile): string {
  return `${caseFile.evidenceItems.length} evidence items / ${caseFile.riskFlags.length} risk flags`;
}
