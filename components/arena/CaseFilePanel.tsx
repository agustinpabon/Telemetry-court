import { landscapeStatusMeta, reviewStatusLabel } from "@/components/arena/arenaMeta";
import { SemanticMiniMap } from "@/components/arena/SemanticMiniMap";
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
      <div className="stage-heading">
        <div>
          <p className="eyebrow">Case File</p>
          <h2>{caseFile.cluster.name}</h2>
        </div>
        <span className={status.className}>{status.label}</span>
      </div>

      <SemanticMiniMap caseFile={caseFile} label="Case position" />

      <div className="case-file-grid">
        <article className="case-file-brief">
          <span className="case-file-kicker">{caseFile.cluster.id}</span>
          <h3>{caseFile.cluster.description}</h3>
          <p>
            {reviewStatusLabel[caseFile.reviewStatus]} - {caseFile.dataset} -{" "}
            {caseFile.cluster.size ?? "Unknown"} sessions
          </p>
          <div className="case-file-metrics">
            <Metric label="Agreement" value={formatSupportScore(caseFile.modelAgreement)} />
            <Metric
              label="Evidence strength"
              value={formatSupportScore(caseFile.evidenceStrength)}
            />
            <Metric
              label="Uncertainty"
              value={formatSupportScore(caseFile.uncertainty)}
            />
            <Metric
              label="Average support"
              value={formatSupportScore(getAverageSupportScore(caseFile))}
            />
          </div>
          <button type="button" className="primary-action" onClick={onStartInvestigation}>
            Start blind investigation
          </button>
        </article>

        <article className="case-file-panel">
          <h3>Feature stack</h3>
          <div className="chip-row">
            {caseFile.topFeatures.map((feature) => (
              <span className="soft-chip" key={feature}>
                {feature}
              </span>
            ))}
          </div>
          <h3>Risk flags</h3>
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

      <div className="claims-strip" aria-label="Claims under test">
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

      <div className="session-preview-row" aria-label="Representative sessions">
        {caseFile.representativeSessions.slice(0, 4).map((session) => (
          <article key={session.id} className="session-preview">
            <span>{session.id}</span>
            <strong>{session.title}</strong>
            <p>
              overlap {formatSupportScore(session.featureOverlap)} - {session.summary}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
