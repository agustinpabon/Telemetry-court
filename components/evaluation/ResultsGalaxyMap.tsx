import { useMemo, useState, type CSSProperties } from "react";

import { EvidenceGalaxyAtlas } from "@/components/arena/EvidenceGalaxyAtlas";
import type { LocalEvaluationReportGroupV01 } from "@/lib/localEvaluationResultsV01";
import {
  buildResultsGalaxyMapV01,
  resultsGalaxyStatusOrder,
  resultsGalaxyStatusPresentation,
  type ResultsCasePackageMetadataV01,
  type ResultsGalaxyMapNodeV01,
  type ResultsGalaxyUnavailableV01,
} from "@/lib/resultsGalaxyMapV01";
import type { CasePackageV01 } from "@/lib/types";

type ResultsGalaxyMapProps = {
  packageGroups: LocalEvaluationReportGroupV01[];
  availableCasePackages: Array<
    CasePackageV01 | ResultsCasePackageMetadataV01
  >;
};

export function ResultsGalaxyMap({
  packageGroups,
  availableCasePackages,
}: ResultsGalaxyMapProps) {
  const map = useMemo(
    () =>
      buildResultsGalaxyMapV01({
        packageGroups,
        casePackages: availableCasePackages,
      }),
    [availableCasePackages, packageGroups],
  );
  const [selectedCaseId, setSelectedCaseId] = useState(
    map.nodes[0]?.caseFile.id,
  );
  const [previewCaseId, setPreviewCaseId] = useState<string>();
  const selectedNode =
    map.nodes.find((node) => node.caseFile.id === selectedCaseId) ??
    map.nodes[0];

  if (map.nodes.length === 0) {
    return (
      <ResultsMapUnavailableState
        unavailable={map.unavailable}
        variant="empty"
      />
    );
  }

  const selectedCase = selectedNode.caseFile;

  return (
    <section className="results-topology-map" aria-label="Results topology map">
      <header className="results-topology-header">
        <div>
          <p className="eyebrow">Results topology map</p>
          <h2>Results topology map</h2>
          <p>
            This map uses imported or local CasePackage coordinates and colors
            nodes by aggregated ReviewResult verdict status. Telemetry Court is
            not executing Toponymy, DataMapPlot, UMAP, or HDBSCAN here.
          </p>
        </div>
        <dl>
          <div>
            <dt>Mapped clusters</dt>
            <dd>{formatCount(map.nodes.length, "node", "nodes")}</dd>
          </div>
          <div>
            <dt>Unavailable groups</dt>
            <dd>
              {formatCount(map.unavailable.length, "group", "groups")}
            </dd>
          </div>
        </dl>
      </header>

      <div className="results-topology-atlas arena-shell-explore">
        <EvidenceGalaxyAtlas
          cases={map.nodes.map((node) => node.caseFile)}
          selectedCase={selectedCase}
          previewCaseId={previewCaseId}
          ariaLabel="Results topology map. Select a cluster node to inspect aggregated reviewer verdict status. Use arrow keys to move between mapped clusters."
          keyNote="Position comes from compatible CasePackage coordinates. Tint comes from aggregated ReviewResult verdict status; ring and brightness preserve reviewer uncertainty and evidence-rating pressure."
          selectedRegionLabel="Selected result"
          statusMetricLabel="Aggregated verdict"
          statusLegend={resultsGalaxyStatusOrder.map((verdict) => ({
            id: verdict,
            label: resultsGalaxyStatusPresentation[verdict].label,
            accent: resultsGalaxyStatusPresentation[verdict].accent,
          }))}
          getNodePresentation={(node) =>
            findNodePresentation(map.nodes, node.id)
          }
          onSelectCase={setSelectedCaseId}
          onPreviewCase={setPreviewCaseId}
          onClearPreview={() => setPreviewCaseId(undefined)}
        />
      </div>

      <ol className="results-topology-node-list" aria-label="Mapped result nodes">
        {map.nodes.map((node) => (
          <li
            key={node.caseFile.id}
            data-result-status={node.status.verdict}
            style={
              {
                "--result-status-accent": node.status.accent,
              } as CSSProperties
            }
          >
            <span>{node.report.case_package.package_id}</span>
            <strong>{node.status.label}</strong>
            <em>
              {node.verdictDisputed
                ? "Verdict disagreement present"
                : "Verdict disagreement not detected"}
            </em>
          </li>
        ))}
      </ol>

      {map.unavailable.length > 0 ? (
        <ResultsMapUnavailableState
          unavailable={map.unavailable}
          variant="partial"
        />
      ) : null}
    </section>
  );
}

function ResultsMapUnavailableState({
  unavailable,
  variant,
}: {
  unavailable: ResultsGalaxyUnavailableV01[];
  variant: "empty" | "partial";
}) {
  return (
    <section
      className={`results-topology-unavailable is-${variant}`}
      role="alert"
      aria-label="Results map unavailable"
    >
      <strong>Results map unavailable</strong>
      <p>
        A results map is rendered only when a compatible local or imported
        CasePackage supplies normalized cluster coordinates for the ReviewResult
        group. ReviewResults alone carry compact package references, not map
        positions.
      </p>
      {unavailable.length > 0 ? (
        <ol>
          {unavailable.map((entry) => (
            <li key={`${entry.casePackageId}-${entry.reason}`}>
              <dl>
                <div>
                  <dt>package_id</dt>
                  <dd>{entry.casePackageId}</dd>
                </div>
                <div>
                  <dt>case_id</dt>
                  <dd>{entry.caseId}</dd>
                </div>
                <div>
                  <dt>cluster_id</dt>
                  <dd>{entry.clusterId}</dd>
                </div>
              </dl>
              <em>{entry.message}</em>
              <p>
                Import or reload the matching CasePackage for this
                package_id / case_id / cluster_id reference.
              </p>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}

function findNodePresentation(
  nodes: ResultsGalaxyMapNodeV01[],
  nodeId: string,
) {
  return (
    nodes.find((node) => node.caseFile.id === nodeId)?.status ??
    resultsGalaxyStatusPresentation.uncertain
  );
}

function formatCount(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}
