import Link from "next/link";
import type { CSSProperties } from "react";

import { reviewStatusLabel } from "@/components/arena/arenaMeta";
import {
  getGalaxyStatusAccent,
  getLandscapeAtlasPosition,
} from "@/components/arena/EvidenceGalaxyAtlas";
import {
  ArenaActionFooter,
  ArenaStatusBadge,
  ArenaStepHero,
  ArenaWorkflowShell,
  SectionHeader,
} from "@/components/arena/WorkflowPrimitives";
import { ReviewTerminologyHelp } from "@/components/arena/ReviewTerminologyHelp";
import { formatSupportScore, getAverageSupportScore } from "@/lib/caseMetrics";
import type {
  CaseFile,
  EvidenceSourceType,
  LandscapeContextNode,
  LandscapeNode,
  LandscapeStatus,
} from "@/lib/types";

type CaseFilePanelProps = {
  caseFile: CaseFile;
  cases: CaseFile[];
  landscapeContextNodes?: LandscapeContextNode[];
  onBackToLandscape?: () => void;
  onStartInvestigation: () => void;
};

type EvidencePreviewType = "feature" | "timing" | "counterexample" | "neighbour";

type EvidencePreviewRow = {
  id: string;
  title: string;
  summary: string;
  type: EvidencePreviewType;
};

const evidencePreviewTypeLabel: Record<EvidencePreviewType, string> = {
  feature: "feature",
  timing: "timing",
  counterexample: "counterexample",
  neighbour: "neighbour",
};

const caseBriefStateCopy: Record<LandscapeStatus, string> = {
  supported: "Evidence supported",
  overclaimed: "Evidence gap",
  impure: "Purity concern",
  too_broad: "Scope concern",
  uncertain: "Context needed",
};

const caseBriefReviewCopy: Record<LandscapeStatus, string> = {
  supported: "The core behaviour is evidenced; confirm the packet before accepting.",
  overclaimed:
    "Administrative IAM activity is present, but malicious intent is not evidenced.",
  impure:
    "Several behaviours may be mixed together and need a purity check.",
  too_broad:
    "The packet supports a narrower behaviour than a broad generated label.",
  uncertain:
    "The packet is suggestive, but context is too thin for a confident interpretation.",
};

const heroDescriptionCopy: Record<LandscapeStatus, string> = {
  supported:
    "A behavioural region with strong evidence signals and a lower uncertainty profile.",
  overclaimed:
    "A behavioural region with strong IAM administration signals and weak evidence of malicious intent.",
  impure:
    "A behavioural region with useful signals and signs that the cluster may be mixed.",
  too_broad:
    "A behavioural region with specific evidence that may not support a broad interpretation.",
  uncertain:
    "A behavioural region with suggestive signals and material context gaps.",
};

const sourceTypePreviewType: Record<EvidenceSourceType, EvidencePreviewType> = {
  telemetry_event: "feature",
  session_feature: "feature",
  exemplar: "feature",
  keyphrase: "feature",
  metadata: "timing",
  analyst_note: "counterexample",
};

function getCaseFileStatusTone(status: LandscapeStatus) {
  switch (status) {
    case "supported":
      return "supported" as const;
    case "overclaimed":
      return "evidence-gap" as const;
    case "uncertain":
      return "uncertain" as const;
    case "impure":
    case "too_broad":
      return "weak" as const;
  }
}

export function CaseFilePanel({
  caseFile,
  cases,
  landscapeContextNodes = [],
  onBackToLandscape,
  onStartInvestigation,
}: CaseFilePanelProps) {
  const evidencePreviewRows = getEvidencePreviewRows(caseFile);
  const reviewQuestions = getReviewQuestions(caseFile);
  const relativeDistanceLabel = getRelativeDistanceLabel(
    caseFile.nearestNeighbor.distance,
  );

  return (
    <ArenaWorkflowShell className="case-file-stage" ariaLabel="Case File">
      <ArenaStepHero
        eyebrow="Case File"
        status={
          <ArenaStatusBadge tone={getCaseFileStatusTone(caseFile.landscapeStatus)}>
            {caseBriefStateCopy[caseFile.landscapeStatus]}
          </ArenaStatusBadge>
        }
        title={caseFile.cluster.name}
        summary={heroDescriptionCopy[caseFile.landscapeStatus]}
        context="AI claim remains hidden until your first read."
      />
      <ReviewTerminologyHelp
        terms={["cluster", "evidence", "blind_assessment"]}
      />

      <div className="case-file-intake-grid">
        <div className="case-file-main-grid">
          <article className="case-file-card case-file-brief-card">
            <SectionHeader
              title="Case brief"
              description="Core context for the initial assessment."
            />
            <dl className="case-file-fact-list">
              <div>
                <dt>Cluster</dt>
                <dd className="mono-value">{caseFile.cluster.id}</dd>
              </div>
              <div>
                <dt>Dataset</dt>
                <dd>{caseFile.dataset}</dd>
              </div>
              <div>
                <dt>Sessions</dt>
                <dd>{caseFile.cluster.size ?? "Unknown"} synthetic sessions</dd>
              </div>
              <div>
                <dt>Review status</dt>
                <dd>{reviewStatusLabel[caseFile.reviewStatus]}</dd>
              </div>
            </dl>
            <div className="case-file-why-review">
              <span>Why review</span>
              <p>{caseBriefReviewCopy[caseFile.landscapeStatus]}</p>
            </div>
          </article>

          <article className="case-file-card case-file-signals-card">
            <SectionHeader
              title="Signals at a glance"
              description="Directional signals, not a verdict."
            />
            <div className="case-file-signal-grid">
              <SignalTile
                label="Agreement"
                value={formatSupportScore(caseFile.modelAgreement)}
              />
              <SignalTile
                label="Evidence strength"
                value={formatSupportScore(caseFile.evidenceStrength)}
              />
              <SignalTile
                label="Uncertainty"
                value={formatSupportScore(caseFile.uncertainty)}
              />
              <SignalTile
                label="Avg. support"
                value={formatSupportScore(getAverageSupportScore(caseFile))}
              />
            </div>
            <p className="case-file-card-note">
              High uncertainty and low evidence strength suggest the label may be
              overclaiming.
            </p>
          </article>

          <article className="case-file-card case-file-feature-card">
            <SectionHeader
              title="Observed feature stack"
              description="Visible signals before the AI reveal."
            />
            <div className="chip-row">
              {caseFile.topFeatures.map((feature) => (
                <span className="soft-chip" key={feature}>
                  {feature}
                </span>
              ))}
            </div>
            <div className="case-file-risk-block">
              <span>Risk flags</span>
              <div className="chip-row">
                {caseFile.riskFlags.map((flag) => (
                  <span className="risk-chip" key={flag}>
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          </article>

          <article className="case-file-card case-file-questions-card">
            <SectionHeader
              title="Review questions"
              description="Questions to keep in mind."
            />
            <div className="case-file-question-list">
              {reviewQuestions.map((question) => (
                <p key={question}>{question}</p>
              ))}
            </div>
          </article>

          <section
            className="case-file-card case-file-evidence-preview"
            aria-label="Evidence packet preview"
          >
            <SectionHeader
              title="Evidence packet preview"
              description="Signals you will classify later."
            />
            <div className="case-file-evidence-list">
              {evidencePreviewRows.map((evidence) => (
                <article className="case-file-evidence-preview-row" key={evidence.id}>
                  <span className="mono-value">{evidence.id}</span>
                  <div>
                    <strong>{evidence.title}</strong>
                    <p>{evidence.summary}</p>
                  </div>
                  <em>{evidencePreviewTypeLabel[evidence.type]}</em>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="case-file-intake-rail" aria-label="Case file support context">
          <RegionContext
            caseFile={caseFile}
            cases={cases}
            landscapeContextNodes={landscapeContextNodes}
            relativeDistanceLabel={relativeDistanceLabel}
          />

          <div className="case-file-rail-action-group">
            <article className="case-file-readiness-card">
              <SectionHeader
                title="Review readiness"
                description="What is visible before the AI reveal."
              />
              <dl className="case-file-readiness-list">
                <div>
                  <dt>Claim state</dt>
                  <dd>Hidden until initial assessment</dd>
                </div>
                <div>
                  <dt>Known packet</dt>
                  <dd>{caseFile.evidenceItems.length} evidence items</dd>
                </div>
                <div>
                  <dt>Method</dt>
                  <dd>Structured choices only</dd>
                </div>
              </dl>
            </article>

          </div>
        </aside>
      </div>

      <ArenaActionFooter
        className="case-file-actions"
        ariaLabel="Case File actions"
        microcopy="Read the packet before the generated claim is revealed."
        secondaryAction={
          onBackToLandscape
            ? {
                label: "Return to landscape",
                onClick: onBackToLandscape,
              }
            : undefined
        }
        primaryAction={{
          label: "Start validation",
          onClick: onStartInvestigation,
        }}
      />
    </ArenaWorkflowShell>
  );
}

function SignalTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="case-file-signal-tile">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function getEvidencePreviewRows(caseFile: CaseFile): EvidencePreviewRow[] {
  const packetRows = caseFile.evidenceItems.slice(0, 3).map((evidence) => ({
    id: evidence.id,
    title: evidence.title,
    summary: evidence.summary,
    type: sourceTypePreviewType[evidence.sourceType],
  }));

  return [
    ...packetRows,
    {
      id: caseFile.nearestNeighbor.clusterId,
      title: "Neighbour comparison",
      summary: `Similar to ${caseFile.nearestNeighbor.label}.`,
      type: "neighbour",
    },
  ];
}

function getReviewQuestions(caseFile: CaseFile): string[] {
  const routineOption =
    caseFile.blindInterpretationOptions[0]?.label ?? "the routine explanation";
  const higherRiskOption =
    caseFile.blindInterpretationOptions[1]?.label ?? "the higher-risk interpretation";

  return [
    `Does the evidence support ${lowerFirst(routineOption)}?`,
    `Is there proof of ${lowerFirst(higherRiskOption)}?`,
    "Is this cluster mixed or impure?",
    "What evidence would change the verdict?",
  ];
}

function lowerFirst(value: string): string {
  return value.length > 0 ? `${value.charAt(0).toLowerCase()}${value.slice(1)}` : value;
}

function RegionContext({
  caseFile,
  cases,
  landscapeContextNodes,
  relativeDistanceLabel,
}: {
  caseFile: CaseFile;
  cases: CaseFile[];
  landscapeContextNodes: LandscapeContextNode[];
  relativeDistanceLabel: string;
}) {
  const nearestNeighbourNode = getLandscapeNodeByClusterId(
    cases,
    landscapeContextNodes,
    caseFile.nearestNeighbor.clusterId,
  );

  return (
    <article className="case-file-card case-file-region-context">
      <SectionHeader
        title="Region context"
        description="Where this case sits before the initial assessment."
      />
      {nearestNeighbourNode ? (
        <LandscapeLocator
          cases={cases}
          selectedCase={caseFile}
          contextNodes={landscapeContextNodes}
          nearestNeighbourNode={nearestNeighbourNode}
        />
      ) : (
        <div className="region-context-fallback" role="note">
          <strong>Neighbour summary</strong>
          <p>Comparison is based on nearest-neighbour metadata, not plotted geometry.</p>
        </div>
      )}
      <p className="region-context-statement">
        <span className="mono-value">{caseFile.cluster.id}</span> is closest to a
        routine role lifecycle neighbour, but evidence strength is lower than
        uncertainty.
      </p>
      <div className="region-context-comparison" aria-label="Region comparison">
        <section className="region-context-entity">
          <span>Selected region</span>
          <strong className="mono-value">{caseFile.cluster.id}</strong>
          <em>{reviewStatusLabel[caseFile.reviewStatus]}</em>
        </section>
        <section className="region-context-entity">
          <span>Nearest neighbour</span>
          <strong className="mono-value">{caseFile.nearestNeighbor.clusterId}</strong>
          <em>{caseFile.nearestNeighbor.label}</em>
        </section>
      </div>
      <dl className="region-context-signals" aria-label="Region context signals">
        <div>
          <dt>Similarity</dt>
          <dd>{relativeDistanceLabel}</dd>
        </div>
        <div>
          <dt>Evidence strength</dt>
          <dd>{formatSupportScore(caseFile.evidenceStrength)}</dd>
        </div>
        <div>
          <dt>Uncertainty</dt>
          <dd>{formatSupportScore(caseFile.uncertainty)}</dd>
        </div>
      </dl>
      <p className="region-context-caption">
        This suggests the selected region may belong near routine IAM
        administration rather than a malicious interpretation.
      </p>
      <p className="region-context-note">
        Review before assigning malicious intent.
      </p>
      <Link
        className="region-context-action"
        href="/"
        aria-label={`View ${caseFile.cluster.id} in the Evidence Landscape`}
      >
        View in landscape
      </Link>
    </article>
  );
}

type LandscapeLocatorPointRole = "selected" | "nearest" | "context";

type LandscapeLocatorPoint = {
  node: LandscapeNode;
  role: LandscapeLocatorPointRole;
};

type LandscapeLocatorPointStyle = CSSProperties & {
  "--locator-x": string;
  "--locator-y": string;
  "--locator-accent": string;
  "--locator-evidence": string;
  "--locator-uncertainty": string;
};

type LandscapeLocatorStyle = CSSProperties & {
  "--locator-selected-accent": string;
  "--locator-nearest-accent": string;
};

function LandscapeLocator({
  cases,
  contextNodes,
  selectedCase,
  nearestNeighbourNode,
}: {
  cases: CaseFile[];
  contextNodes: LandscapeContextNode[];
  selectedCase: CaseFile;
  nearestNeighbourNode: LandscapeNode;
}) {
  const landscapeNodes: LandscapeNode[] = [...cases, ...contextNodes];
  const locatorPoints: LandscapeLocatorPoint[] = [
    ...landscapeNodes
      .filter(
        (node) =>
          node.id !== selectedCase.id &&
          node.id !== nearestNeighbourNode.id,
      )
      .map((node) => ({
        node,
        role: "context" as const,
      })),
    { node: nearestNeighbourNode, role: "nearest" },
    { node: selectedCase, role: "selected" },
  ];
  const style: LandscapeLocatorStyle = {
    "--locator-selected-accent": getGalaxyStatusAccent(selectedCase),
    "--locator-nearest-accent": getGalaxyStatusAccent(nearestNeighbourNode),
  };

  return (
    <div className="landscape-locator" aria-label="Landscape locator" style={style}>
      <span className="landscape-locator-label">Landscape locator</span>
      <div
        className="landscape-locator-field"
        role="list"
        aria-label={`Landscape locator for ${selectedCase.cluster.id}`}
      >
        {locatorPoints.map((point) => (
          <LandscapeLocatorPointMarker
            key={`${point.role}-${point.node.id}`}
            point={point}
          />
        ))}
      </div>
      <div className="landscape-locator-legend" aria-label="Locator legend">
        <span>
          <i className="is-selected" aria-hidden="true" />
          selected
        </span>
        <span>
          <i className="is-nearest" aria-hidden="true" />
          nearest neighbour
        </span>
        <span>
          <i className="is-context" aria-hidden="true" />
          context
        </span>
      </div>
      <p>This locator uses the same case coordinates as the Evidence Landscape.</p>
    </div>
  );
}

function LandscapeLocatorPointMarker({
  point,
}: {
  point: LandscapeLocatorPoint;
}) {
  const position = getLandscapeAtlasPosition(point.node);
  const style: LandscapeLocatorPointStyle = {
    "--locator-x": `${position.x}%`,
    "--locator-y": `${position.y}%`,
    "--locator-accent": getGalaxyStatusAccent(point.node),
    "--locator-evidence": point.node.evidenceStrength.toFixed(2),
    "--locator-uncertainty": point.node.uncertainty.toFixed(2),
  };
  const roleLabel =
    point.role === "nearest" ? "nearest neighbour" : point.role;

  return (
    <span
      className={`landscape-locator-point is-${point.role}`}
      role="listitem"
      aria-label={`${point.node.cluster.id} ${roleLabel}`}
      style={style}
    />
  );
}

function getLandscapeNodeByClusterId(
  cases: CaseFile[],
  contextNodes: LandscapeContextNode[],
  clusterId: string,
): LandscapeNode | undefined {
  return [...cases, ...contextNodes].find(
    (node) => node.cluster.id === clusterId,
  );
}

function getRelativeDistanceLabel(distance: number): string {
  if (distance <= 0.22) {
    return "Close neighbour";
  }

  if (distance <= 0.38) {
    return "Nearby comparison";
  }

  return "Loose comparison";
}
