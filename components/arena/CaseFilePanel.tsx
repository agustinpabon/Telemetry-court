import { landscapeStatusMeta, reviewStatusLabel } from "@/components/arena/arenaMeta";
import { SemanticMiniMap } from "@/components/arena/SemanticMiniMap";
import {
  MetricCard,
  SectionHeader,
  StageHeader,
} from "@/components/arena/WorkflowPrimitives";
import { formatSupportScore, getAverageSupportScore } from "@/lib/caseMetrics";
import type { CaseFile } from "@/lib/types";

type CaseFilePanelProps = {
  caseFile: CaseFile;
  onStartInvestigation: () => void;
};

export function CaseFilePanel({ caseFile, onStartInvestigation }: CaseFilePanelProps) {
  const status = landscapeStatusMeta[caseFile.landscapeStatus];

  return (
    <section className="case-file-stage stage-surface" aria-label="Case File">
      <StageHeader
        kicker="Case File"
        title={caseFile.cluster.name}
        description="Open the behavioural region as an investigation file before any blind interpretation."
        meta={<span className={status.className}>{status.label}</span>}
      />

      <div className="case-file-context-row">
        <SemanticMiniMap caseFile={caseFile} label="Case position" />
        <div className="case-file-context-note">
          <span className="mono-value">{caseFile.cluster.id}</span>
          <strong>{reviewStatusLabel[caseFile.reviewStatus]}</strong>
          <p>
            {caseFile.dataset} · {caseFile.cluster.size ?? "Unknown"} synthetic sessions
          </p>
        </div>
      </div>

      <div className="case-file-grid">
        <article className="case-file-brief">
          <span className="case-file-kicker">Investigation summary</span>
          <h3>{caseFile.cluster.description}</h3>
          <div className="case-file-metrics">
            <MetricCard
              label="Agreement"
              value={formatSupportScore(caseFile.modelAgreement)}
            />
            <MetricCard
              label="Evidence strength"
              value={formatSupportScore(caseFile.evidenceStrength)}
            />
            <MetricCard
              label="Uncertainty"
              value={formatSupportScore(caseFile.uncertainty)}
            />
            <MetricCard
              label="Average support"
              value={formatSupportScore(getAverageSupportScore(caseFile))}
            />
          </div>
          <button type="button" className="primary-action" onClick={onStartInvestigation}>
            Start blind investigation
          </button>
        </article>

        <article className="case-file-panel">
          <SectionHeader
            title="Feature stack"
            description="The strongest behavioural signals attached to this region."
          />
          <div className="chip-row">
            {caseFile.topFeatures.map((feature) => (
              <span className="soft-chip" key={feature}>
                {feature}
              </span>
            ))}
          </div>
          <SectionHeader
            title="Risk flags"
            description="Known review risks before the blind read begins."
          />
          <div className="chip-row">
            {caseFile.riskFlags.map((flag) => (
              <span className="risk-chip" key={flag}>
                {flag}
              </span>
            ))}
          </div>
          <div className="case-file-neighbour">
            <span>Nearest neighbour</span>
            <strong>{caseFile.nearestNeighbor.label}</strong>
            <p>
              {caseFile.nearestNeighbor.clusterId} - distance{" "}
              {caseFile.nearestNeighbor.distance.toFixed(2)}.{" "}
              {caseFile.nearestNeighbor.note}
            </p>
          </div>
        </article>
      </div>

      <section className="case-file-section" aria-label="Claims under test">
        <SectionHeader
          title="Claims under test"
          description="Each generated claim will need evidence support or an explicit gap."
        />
        <div className="claims-strip">
          {caseFile.claims.map((claim) => (
            <article key={claim.id} className="claim-tile">
              <div>
                <span>{claim.id}</span>
                <strong>{formatSupportScore(claim.supportScore)}</strong>
              </div>
              <h3>{claim.text}</h3>
              <p>{claim.rationale}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="case-file-section" aria-label="Evidence packet preview">
        <SectionHeader
          title="Evidence packet preview"
          description="Representative evidence and sessions that will be classified later."
        />
        <div className="case-file-evidence-row">
          {caseFile.evidenceItems.slice(0, 3).map((evidence) => (
            <article key={evidence.id} className="session-preview">
              <span>{evidence.id}</span>
              <strong>{evidence.title}</strong>
              <p>{evidence.summary}</p>
            </article>
          ))}
          {caseFile.representativeSessions.slice(0, 2).map((session) => (
            <article key={session.id} className="session-preview">
              <span>{session.id}</span>
              <strong>{session.title}</strong>
              <p>
                overlap {formatSupportScore(session.featureOverlap)} · {session.summary}
              </p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
