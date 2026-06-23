import {
  CASE_PACKAGE_V01_VERDICTS,
  type CaseFile,
  type CasePackageReferenceV01,
  type CasePackageVerdictV01,
  type CasePackageV01,
  type LandscapeStatus,
  type ReviewStatus,
} from "@/lib/types";
import type { EvaluationReportV01 } from "@/lib/evaluationReportV01";
import { validateCasePackageV01 } from "@/lib/casePackageValidation";

export type ResultsGalaxyPackageGroupV01 = {
  casePackageId: string;
  reviewResultCount: number;
  report: EvaluationReportV01;
};

export type ResultsGalaxyStatusPresentationV01 = {
  verdict: CasePackageVerdictV01;
  label: string;
  accent: string;
  className: string;
  nodeClassName: string;
};

export type ResultsGalaxyMapNodeV01 = {
  caseFile: CaseFile;
  casePackage: CasePackageV01;
  report: EvaluationReportV01;
  status: ResultsGalaxyStatusPresentationV01;
  verdictDisputed: boolean;
};

export type ResultsGalaxyUnavailableReasonV01 =
  | "missing_case_package"
  | "incompatible_case_package_reference"
  | "missing_coordinates"
  | "unsupported_coordinate_range";

export type ResultsGalaxyUnavailableV01 = {
  casePackageId: string;
  reason: ResultsGalaxyUnavailableReasonV01;
  message: string;
};

export type ResultsGalaxyMapV01 = {
  nodes: ResultsGalaxyMapNodeV01[];
  unavailable: ResultsGalaxyUnavailableV01[];
};

export type ResultsMapCasePackageImportV01 =
  | { ok: true; package: CasePackageV01 }
  | { ok: false; message: string };

export const resultsGalaxyStatusOrder = CASE_PACKAGE_V01_VERDICTS;

export const resultsGalaxyStatusPresentation: Record<
  CasePackageVerdictV01,
  ResultsGalaxyStatusPresentationV01
> = {
  supported: {
    verdict: "supported",
    label: "Supported",
    accent: "#7fa883",
    className: "status-chip results-status-chip results-status-supported",
    nodeClassName: "cluster-node-supported",
  },
  partially_supported: {
    verdict: "partially_supported",
    label: "Partially supported",
    accent: "#8fa8d5",
    className:
      "status-chip results-status-chip results-status-partially-supported",
    nodeClassName: "cluster-node-broad",
  },
  unsupported_or_overclaimed: {
    verdict: "unsupported_or_overclaimed",
    label: "Unsupported or overclaimed",
    accent: "#c98378",
    className:
      "status-chip results-status-chip results-status-unsupported-overclaimed",
    nodeClassName: "cluster-node-overclaimed",
  },
  uncertain: {
    verdict: "uncertain",
    label: "Uncertain",
    accent: "#a997bf",
    className: "status-chip results-status-chip results-status-uncertain",
    nodeClassName: "cluster-node-uncertain",
  },
  cluster_impure: {
    verdict: "cluster_impure",
    label: "Cluster impure",
    accent: "#c9a662",
    className: "status-chip results-status-chip results-status-cluster-impure",
    nodeClassName: "cluster-node-impure",
  },
  needs_split: {
    verdict: "needs_split",
    label: "Needs split",
    accent: "#d0a15f",
    className: "status-chip results-status-chip results-status-needs-split",
    nodeClassName: "cluster-node-impure",
  },
  needs_merge: {
    verdict: "needs_merge",
    label: "Needs merge",
    accent: "#7ea8b8",
    className: "status-chip results-status-chip results-status-needs-merge",
    nodeClassName: "cluster-node-broad",
  },
  needs_better_evidence: {
    verdict: "needs_better_evidence",
    label: "Needs better evidence",
    accent: "#b69f7a",
    className:
      "status-chip results-status-chip results-status-needs-better-evidence",
    nodeClassName: "cluster-node-uncertain",
  },
};

export function buildResultsGalaxyMapV01({
  packageGroups,
  casePackages,
}: {
  packageGroups: readonly ResultsGalaxyPackageGroupV01[];
  casePackages: readonly CasePackageV01[];
}): ResultsGalaxyMapV01 {
  const casePackagesById = groupCasePackagesById(casePackages);
  const nodes: ResultsGalaxyMapNodeV01[] = [];
  const unavailable: ResultsGalaxyUnavailableV01[] = [];

  for (const group of packageGroups) {
    const packageCandidates = casePackagesById.get(group.casePackageId) ?? [];

    if (packageCandidates.length === 0) {
      unavailable.push({
        casePackageId: group.casePackageId,
        reason: "missing_case_package",
        message:
          "No local or imported CasePackage metadata is available for this result group.",
      });
      continue;
    }

    const compatiblePackage = packageCandidates.find((casePackage) =>
      hasMatchingCasePackageReference(
        group.report.case_package,
        buildReviewedCasePackageReferenceV01(casePackage),
      ),
    );

    if (!compatiblePackage) {
      unavailable.push({
        casePackageId: group.casePackageId,
        reason: "incompatible_case_package_reference",
        message:
          "A CasePackage with this package ID is available, but its compact package or pipeline reference does not match the ReviewResults.",
      });
      continue;
    }

    const coordinates = compatiblePackage.cluster.embedding_map?.coordinates;

    if (!coordinates) {
      unavailable.push({
        casePackageId: group.casePackageId,
        reason: "missing_coordinates",
        message:
          "The compatible CasePackage does not include cluster embedding_map coordinates.",
      });
      continue;
    }

    const mapPosition = toNormalizedMapPosition(coordinates.x, coordinates.y);

    if (!mapPosition) {
      unavailable.push({
        casePackageId: group.casePackageId,
        reason: "unsupported_coordinate_range",
        message:
          "The compatible CasePackage coordinates are outside the supported normalized 0-1 map range.",
      });
      continue;
    }

    const status = getDominantResultsStatus(group.report);

    nodes.push({
      casePackage: compatiblePackage,
      report: group.report,
      status,
      verdictDisputed: group.report.disagreement.verdict,
      caseFile: buildResultsCaseFile({
        casePackage: compatiblePackage,
        report: group.report,
        mapPosition,
        status,
      }),
    });
  }

  return { nodes, unavailable };
}

export function importResultsMapCasePackageV01Json(
  jsonText: string,
): ResultsMapCasePackageImportV01 {
  let parsedPackage: unknown;

  try {
    parsedPackage = JSON.parse(jsonText) as unknown;
  } catch {
    return {
      ok: false,
      message: "CasePackage map JSON could not be parsed.",
    };
  }

  const validation = validateCasePackageV01(parsedPackage);

  if (!validation.ok) {
    const firstError = validation.errors[0];

    return {
      ok: false,
      message: firstError
        ? `CasePackage map JSON failed validation at ${firstError.path}: ${firstError.message}`
        : "CasePackage map JSON failed validation.",
    };
  }

  return {
    ok: true,
    package: validation.package,
  };
}

function groupCasePackagesById(casePackages: readonly CasePackageV01[]) {
  const casePackagesById = new Map<string, CasePackageV01[]>();

  for (const casePackage of casePackages) {
    casePackagesById.set(casePackage.package_id, [
      ...(casePackagesById.get(casePackage.package_id) ?? []),
      casePackage,
    ]);
  }

  return casePackagesById;
}

function buildResultsCaseFile({
  casePackage,
  report,
  mapPosition,
  status,
}: {
  casePackage: CasePackageV01;
  report: EvaluationReportV01;
  mapPosition: CaseFile["mapPosition"];
  status: ResultsGalaxyStatusPresentationV01;
}): CaseFile {
  const firstCandidateLabel = casePackage.candidate_labels[0];
  const selectedLabelId =
    report.label_winner_distribution[0]?.label_id ??
    firstCandidateLabel?.label_id ??
    "label-unavailable";

  return {
    id: getResultsCaseFileId(casePackage),
    casePackageReference: {
      ...buildReviewedCasePackageReferenceV01(casePackage),
      blind_review_enabled:
        casePackage.review_configuration.blind_review_enabled,
    },
    cluster: {
      id: casePackage.cluster.cluster_id,
      name:
        casePackage.cluster.cluster_name ??
        casePackage.cluster.upstream_cluster_label ??
        casePackage.case.title,
      description: casePackage.case.summary,
      source:
        casePackage.dataset.data_classification === "synthetic"
          ? "sample"
          : "other",
      size: casePackage.cluster.cluster_size,
    },
    dataset: casePackage.dataset.dataset_name,
    reviewStatus: getReviewStatusForVerdict(status.verdict),
    landscapeStatus: getLandscapeStatusForVerdict(status.verdict),
    modelAgreement: getReviewerAgreementWeight(report),
    evidenceStrength: getEvidenceSupportWeight(report),
    uncertainty: getReviewerUncertaintyWeight(report, status.verdict),
    mapPosition,
    topFeatures: getTopFeatures(casePackage),
    riskFlags: getRiskFlags(report),
    nearestNeighbor: {
      clusterId:
        casePackage.neighbor_clusters[0]?.neighbor_cluster_id ??
        casePackage.cluster.cluster_id,
      label:
        casePackage.neighbor_clusters[0]?.label ??
        casePackage.neighbor_clusters[0]?.name ??
        "No compatible neighbor supplied",
      distance: readMetricValue(casePackage.neighbor_clusters[0]?.distance, 1),
      note:
        casePackage.neighbor_clusters[0]?.reason_this_neighbor_matters ??
        "No compatible neighbor metadata supplied for this results map node.",
    },
    blindInterpretationOptions: [],
    candidateLabels: casePackage.candidate_labels.map((label) => ({
      id: label.label_id,
      label: label.label,
      source: "baseline_ai",
      rationale:
        label.rationale ??
        "Candidate label metadata came from the compatible CasePackage.",
      supportEstimate: readMetricValue(label.confidence, 0),
    })),
    seededBestLabelId: selectedLabelId,
    seededImpostorSessionId:
      casePackage.representative_sessions[0]?.session_id ?? "session-unavailable",
    representativeSessions: casePackage.representative_sessions.map((session) => ({
      id: session.session_id,
      title: session.title,
      principal: session.safe_reference?.label ?? casePackage.dataset.dataset_name,
      timestamp: casePackage.cluster.time_range?.start_at ?? casePackage.created_at,
      featureOverlap: readMetricValue(
        session.cluster_membership.membership_score,
        0,
      ),
      outlierScore: readMetricValue(
        session.cluster_membership.distance_to_centroid,
        0,
      ),
      summary: session.summary,
    })),
    failureModes: report.failure_mode_counts.map(
      (failureMode) => failureMode.failure_mode,
    ),
    defaultEvidenceRatings: {},
    topicLabel: {
      id: selectedLabelId,
      clusterId: casePackage.cluster.cluster_id,
      name: firstCandidateLabel?.label ?? casePackage.case.title,
      explanation: firstCandidateLabel?.rationale ?? casePackage.case.summary,
      generatedBy:
        firstCandidateLabel?.model_reference ??
        casePackage.pipeline.naming_model ??
        casePackage.pipeline.upstream_tool,
      generatedAt: casePackage.pipeline.generated_at,
    },
    claims: [],
    evidenceItems: casePackage.evidence_items.map((evidence) => ({
      id: evidence.evidence_id,
      clusterId: casePackage.cluster.cluster_id,
      title: evidence.title,
      summary: evidence.summary,
      sourceType: "metadata",
      rawReference:
        evidence.source_reference.safe_reference?.uri ??
        evidence.source_reference.safe_reference?.artifact_id,
    })),
    evidenceRelations: [],
    supportScores: [],
    analystVerdict: undefined,
  };
}

function buildReviewedCasePackageReferenceV01(
  casePackage: CasePackageV01,
): Omit<CasePackageReferenceV01, "blind_review_enabled"> {
  return {
    schema_version: casePackage.schema_version,
    package_id: casePackage.package_id,
    package_revision: casePackage.package_revision,
    case_id: casePackage.case.case_id,
    cluster_id: casePackage.cluster.cluster_id,
    pipeline: {
      pipeline_id: casePackage.pipeline.pipeline_id,
      run_id: casePackage.pipeline.run_id,
      upstream_tool: casePackage.pipeline.upstream_tool,
      pipeline_version: casePackage.pipeline.pipeline_version,
      embedding_model: casePackage.pipeline.embedding_model,
      clustering_method: casePackage.pipeline.clustering_method,
      dimensionality_reduction_method:
        casePackage.pipeline.dimensionality_reduction_method,
      naming_model: casePackage.pipeline.naming_model,
      prompt_id: casePackage.pipeline.prompt?.prompt_id,
      prompt_version: casePackage.pipeline.prompt?.prompt_version,
      prompt_digest: casePackage.pipeline.prompt?.prompt_digest,
      generated_at: casePackage.pipeline.generated_at,
    },
  };
}

function hasMatchingCasePackageReference(
  left: Omit<CasePackageReferenceV01, "blind_review_enabled">,
  right: Omit<CasePackageReferenceV01, "blind_review_enabled">,
): boolean {
  return (
    left.schema_version === right.schema_version &&
    left.package_id === right.package_id &&
    left.package_revision === right.package_revision &&
    left.case_id === right.case_id &&
    left.cluster_id === right.cluster_id &&
    left.pipeline.pipeline_id === right.pipeline.pipeline_id &&
    left.pipeline.run_id === right.pipeline.run_id &&
    left.pipeline.upstream_tool === right.pipeline.upstream_tool &&
    left.pipeline.pipeline_version === right.pipeline.pipeline_version &&
    left.pipeline.embedding_model === right.pipeline.embedding_model &&
    left.pipeline.clustering_method === right.pipeline.clustering_method &&
    left.pipeline.dimensionality_reduction_method ===
      right.pipeline.dimensionality_reduction_method &&
    left.pipeline.naming_model === right.pipeline.naming_model &&
    left.pipeline.prompt_id === right.pipeline.prompt_id &&
    left.pipeline.prompt_version === right.pipeline.prompt_version &&
    left.pipeline.prompt_digest === right.pipeline.prompt_digest &&
    left.pipeline.generated_at === right.pipeline.generated_at
  );
}

function toNormalizedMapPosition(
  x: number,
  y: number,
): CaseFile["mapPosition"] | undefined {
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return undefined;
  }

  if (x < 0 || x > 1 || y < 0 || y > 1) {
    return undefined;
  }

  return {
    x: Math.round(x * 100),
    y: Math.round(y * 100),
  };
}

function getDominantResultsStatus(
  report: EvaluationReportV01,
): ResultsGalaxyStatusPresentationV01 {
  const verdict = [...resultsGalaxyStatusOrder].sort(
    (left, right) =>
      report.verdict_distribution[right] - report.verdict_distribution[left] ||
      resultsGalaxyStatusOrder.indexOf(left) -
        resultsGalaxyStatusOrder.indexOf(right),
  )[0];

  return resultsGalaxyStatusPresentation[verdict ?? "uncertain"];
}

function getLandscapeStatusForVerdict(
  verdict: CasePackageVerdictV01,
): LandscapeStatus {
  switch (verdict) {
    case "supported":
      return "supported";
    case "unsupported_or_overclaimed":
      return "overclaimed";
    case "cluster_impure":
    case "needs_split":
      return "impure";
    case "partially_supported":
    case "needs_merge":
      return "too_broad";
    case "uncertain":
    case "needs_better_evidence":
      return "uncertain";
  }
}

function getReviewStatusForVerdict(verdict: CasePackageVerdictV01): ReviewStatus {
  switch (verdict) {
    case "needs_split":
      return "needs_split";
    case "needs_better_evidence":
    case "uncertain":
      return "needs_evidence";
    case "supported":
    case "partially_supported":
    case "unsupported_or_overclaimed":
    case "cluster_impure":
    case "needs_merge":
      return "reviewed";
  }
}

function getEvidenceSupportWeight(report: EvaluationReportV01): number {
  const distribution = report.evidence_rating_distribution;
  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);

  if (total === 0) {
    return 0;
  }

  return Math.min(
    1,
    (distribution.supports + distribution.weak_support * 0.55) / total,
  );
}

function getReviewerAgreementWeight(report: EvaluationReportV01): number {
  if (report.reviewer_agreement.verdict.unanimous === true) {
    return 0.9;
  }

  if (report.reviewer_agreement.verdict.unanimous === false) {
    return 0.45;
  }

  return report.reviewer_count >= 2 ? 0.55 : 0.35;
}

function getReviewerUncertaintyWeight(
  report: EvaluationReportV01,
  verdict: CasePackageVerdictV01,
): number {
  if (
    verdict === "uncertain" ||
    verdict === "needs_better_evidence" ||
    report.disagreement.has_any_disagreement
  ) {
    return 0.78;
  }

  if (verdict === "partially_supported" || verdict === "cluster_impure") {
    return 0.58;
  }

  return 0.32;
}

function getTopFeatures(casePackage: CasePackageV01): string[] {
  const sessionFeatures = casePackage.representative_sessions.flatMap(
    (session) => session.feature_highlights,
  );

  return sessionFeatures.length > 0
    ? [...new Set(sessionFeatures)].slice(0, 4)
    : casePackage.claims.map((claim) => claim.claim_id).slice(0, 4);
}

function getRiskFlags(report: EvaluationReportV01): string[] {
  return report.failure_mode_counts.length > 0
    ? report.failure_mode_counts.map((failureMode) => failureMode.failure_mode)
    : ["No failure mode selected"];
}

function readMetricValue(
  metric: { status: "available"; value: number } | { status: "unavailable" } | undefined,
  fallback: number,
): number {
  return metric?.status === "available" ? metric.value : fallback;
}

function getResultsCaseFileId(casePackage: CasePackageV01): string {
  return [
    "results",
    casePackage.package_id,
    casePackage.package_revision ?? "unrevisioned",
    casePackage.case.case_id,
  ].join(":");
}
