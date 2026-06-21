import type {
  CandidateLabelSource,
  CaseFile,
  CasePackageCandidateLabelSourceV01,
  CasePackageEvidenceRelationshipV01,
  CasePackageEvidenceTypeV01,
  CasePackageMetricV01,
  CasePackageV01,
  ClusterSource,
  EvidencePolarity,
  EvidenceSourceType,
  EvidenceStrength,
  SupportStatus,
} from "@/lib/types";
import {
  validateCasePackageV01,
  type CasePackageValidationError,
} from "@/lib/casePackageValidation";

type CaseFileCompatibilitySeed = Pick<
  CaseFile,
  | "id"
  | "cluster"
  | "reviewStatus"
  | "landscapeStatus"
  | "topFeatures"
  | "riskFlags"
  | "blindInterpretationOptions"
  | "seededBestLabelId"
  | "seededImpostorSessionId"
  | "representativeSessions"
  | "failureModes"
  | "defaultEvidenceRatings"
  | "topicLabel"
  | "claims"
  | "evidenceItems"
  | "evidenceRelations"
  | "supportScores"
  | "analystVerdict"
>;

export type CasePackageV01ToCaseFileResult =
  | { ok: true; caseFile: CaseFile }
  | { ok: false; errors: CasePackageValidationError[] };

export function casePackageV01ToCaseFile(
  input: unknown,
  compatibilitySeed: CaseFileCompatibilitySeed | undefined,
): CasePackageV01ToCaseFileResult {
  const validation = validateCasePackageV01(input);

  if (!validation.ok) {
    return validation;
  }

  const compatibilityErrors = getUiCompatibilityErrors(
    validation.package,
    compatibilitySeed,
  );

  if (compatibilityErrors.length > 0 || !compatibilitySeed) {
    return { ok: false, errors: compatibilityErrors };
  }

  return {
    ok: true,
    caseFile: mapValidatedCasePackageV01ToCaseFile(
      validation.package,
      compatibilitySeed,
    ),
  };
}

function getUiCompatibilityErrors(
  packageFixture: CasePackageV01,
  compatibilitySeed: CaseFileCompatibilitySeed | undefined,
): CasePackageValidationError[] {
  const errors: CasePackageValidationError[] = [];

  if (!compatibilitySeed) {
    errors.push({
      path: "$compatibility_seed",
      code: "ui_missing_compatibility_seed",
      message:
        "The current UI requires compatibility metadata that is not part of CasePackage v0.1.",
    });
    return errors;
  }

  if (packageFixture.case.reviewable_status === "blocked") {
    addUiCompatibilityError(
      errors,
      "$.case.reviewable_status",
      "ui_case_not_reviewable",
      "The current UI cannot start a review for a blocked case package.",
    );
  }

  if (packageFixture.candidate_labels.length < 2) {
    addUiCompatibilityError(
      errors,
      "$.candidate_labels",
      "ui_missing_candidate_labels",
      "The current label-comparison flow requires at least two candidate labels.",
    );
  }

  if (
    !packageFixture.candidate_labels.some(
      (label) => label.source === "ai_generated",
    )
  ) {
    addUiCompatibilityError(
      errors,
      "$.candidate_labels",
      "ui_missing_ai_label",
      "The current reveal flow requires an AI-generated candidate label.",
    );
  }

  packageFixture.candidate_labels.forEach((label, index) => {
    if (label.confidence?.status !== "available") {
      addUiCompatibilityError(
        errors,
        `$.candidate_labels[${index}].confidence`,
        "ui_missing_metric",
        "The current label comparison requires an available confidence metric.",
      );
    }
  });

  if (packageFixture.claims.length === 0) {
    addUiCompatibilityError(
      errors,
      "$.claims",
      "ui_missing_claim",
      "The current evidence review flow requires at least one claim.",
    );
  }

  packageFixture.claims.forEach((claim, index) => {
    if (claim.confidence?.status !== "available") {
      addUiCompatibilityError(
        errors,
        `$.claims[${index}].confidence`,
        "ui_missing_metric",
        "The current claim display requires an available confidence metric.",
      );
    }
  });

  if (packageFixture.evidence_items.length === 0) {
    addUiCompatibilityError(
      errors,
      "$.evidence_items",
      "ui_missing_evidence",
      "The current evidence board requires at least one evidence item.",
    );
  }

  if (packageFixture.representative_sessions.length === 0) {
    addUiCompatibilityError(
      errors,
      "$.representative_sessions",
      "ui_missing_representative_session",
      "The current outlier review requires at least one representative session.",
    );
  }

  const compatibilitySessionsById = new Map(
    compatibilitySeed.representativeSessions.map((session) => [session.id, session]),
  );
  packageFixture.representative_sessions.forEach((session, index) => {
    if (!compatibilitySessionsById.has(session.session_id)) {
      addUiCompatibilityError(
        errors,
        `$compatibility_seed.representativeSessions[${index}]`,
        "ui_incompatible_seed_reference",
        `The compatibility seed is missing representative session "${session.session_id}".`,
      );
    }

    if (session.cluster_membership.membership_score?.status !== "available") {
      addUiCompatibilityError(
        errors,
        `$.representative_sessions[${index}].cluster_membership.membership_score`,
        "ui_missing_metric",
        "The current outlier review requires an available membership score.",
      );
    }

    if (session.cluster_membership.distance_to_centroid?.status !== "available") {
      addUiCompatibilityError(
        errors,
        `$.representative_sessions[${index}].cluster_membership.distance_to_centroid`,
        "ui_missing_metric",
        "The current outlier review requires an available centroid distance.",
      );
    }
  });

  if (packageFixture.neighbor_clusters.length === 0) {
    addUiCompatibilityError(
      errors,
      "$.neighbor_clusters",
      "ui_missing_neighbor_cluster",
      "The current UI requires at least one neighbor cluster for case context.",
    );
  } else {
    const firstNeighbor = packageFixture.neighbor_clusters[0];

    if (!firstNeighbor.label && !firstNeighbor.name) {
      addUiCompatibilityError(
        errors,
        "$.neighbor_clusters[0]",
        "ui_missing_neighbor_label",
        "The current case context requires a label or name for its first neighbor.",
      );
    }

    if (firstNeighbor.distance?.status !== "available") {
      addUiCompatibilityError(
        errors,
        "$.neighbor_clusters[0].distance",
        "ui_missing_metric",
        "The current case context requires an available neighbor distance metric.",
      );
    }
  }

  if (!packageFixture.cluster.embedding_map?.coordinates) {
    addUiCompatibilityError(
      errors,
      "$.cluster.embedding_map.coordinates",
      "ui_missing_embedding_coordinates",
      "The current landscape requires package-provided embedding coordinates.",
    );
  }

  const requiredMetrics = [
    ["model_agreement", packageFixture.metrics.model_agreement],
    ["evidence_coverage", packageFixture.metrics.evidence_coverage],
    ["uncertainty", packageFixture.metrics.uncertainty],
  ] as const;

  for (const [metricName, metric] of requiredMetrics) {
    if (metric?.status !== "available") {
      addUiCompatibilityError(
        errors,
        `$.metrics.${metricName}`,
        "ui_missing_metric",
        `The current UI requires an available ${metricName} metric.`,
      );
    }
  }

  const candidateLabelIds = new Set(
    packageFixture.candidate_labels.map((label) => label.label_id),
  );
  if (compatibilitySeed.id !== packageFixture.case.case_id) {
    addUiCompatibilityError(
      errors,
      "$compatibility_seed.id",
      "ui_incompatible_seed_reference",
      "The compatibility seed must belong to the package case ID.",
    );
  }

  if (compatibilitySeed.cluster.id !== packageFixture.cluster.cluster_id) {
    addUiCompatibilityError(
      errors,
      "$compatibility_seed.cluster.id",
      "ui_incompatible_seed_reference",
      "The compatibility seed must belong to the package cluster ID.",
    );
  }

  if (
    packageFixture.candidate_labels.length > 0 &&
    !candidateLabelIds.has(compatibilitySeed.seededBestLabelId)
  ) {
    addUiCompatibilityError(
      errors,
      "$compatibility_seed.seededBestLabelId",
      "ui_incompatible_seed_reference",
      "The seeded label winner must reference a package candidate label.",
    );
  }

  const sessionIds = new Set(
    packageFixture.representative_sessions.map((session) => session.session_id),
  );
  if (
    packageFixture.representative_sessions.length > 0 &&
    !sessionIds.has(compatibilitySeed.seededImpostorSessionId)
  ) {
    addUiCompatibilityError(
      errors,
      "$compatibility_seed.seededImpostorSessionId",
      "ui_incompatible_seed_reference",
      "The seeded impostor must reference a package representative session.",
    );
  }

  if (compatibilitySeed.blindInterpretationOptions.length === 0) {
    addUiCompatibilityError(
      errors,
      "$compatibility_seed.blindInterpretationOptions",
      "ui_missing_blind_interpretation",
      "The current blind review requires at least one compatibility option.",
    );
  }

  return errors;
}

function addUiCompatibilityError(
  errors: CasePackageValidationError[],
  path: string,
  code: string,
  message: string,
) {
  errors.push({ path, code, message });
}

function mapValidatedCasePackageV01ToCaseFile(
  packageFixture: CasePackageV01,
  compatibilitySeed: CaseFileCompatibilitySeed,
): CaseFile {
  const firstAiLabel =
    packageFixture.candidate_labels.find(
      (label) => label.source === "ai_generated",
    ) ?? packageFixture.candidate_labels[0];
  const firstNeighbor = packageFixture.neighbor_clusters[0];
  const coordinates = packageFixture.cluster.embedding_map?.coordinates;

  return {
    id: packageFixture.case.case_id,
    dataset: packageFixture.dataset.dataset_name,
    reviewStatus: compatibilitySeed.reviewStatus,
    landscapeStatus: compatibilitySeed.landscapeStatus,
    modelAgreement: readAvailableMetric(
      packageFixture.metrics.model_agreement,
      0,
    ),
    evidenceStrength: readAvailableMetric(
      packageFixture.metrics.evidence_coverage,
      0,
    ),
    uncertainty: readAvailableMetric(packageFixture.metrics.uncertainty, 0),
    mapPosition: {
      x: coordinates ? Math.round(coordinates.x * 100) : 0,
      y: coordinates ? Math.round(coordinates.y * 100) : 0,
    },
    topFeatures: compatibilitySeed.topFeatures,
    riskFlags: compatibilitySeed.riskFlags,
    nearestNeighbor: {
      clusterId: firstNeighbor?.neighbor_cluster_id ?? "",
      label: firstNeighbor?.label ?? firstNeighbor?.name ?? "",
      distance: readAvailableMetric(firstNeighbor?.distance, 0),
      note: firstNeighbor?.reason_this_neighbor_matters ?? "",
    },
    cluster: {
      id: packageFixture.cluster.cluster_id,
      name: packageFixture.cluster.cluster_name ?? packageFixture.case.title,
      description: packageFixture.case.summary,
      source: readClusterSource(packageFixture.dataset.data_classification),
      size: packageFixture.cluster.cluster_size,
    },
    topicLabel: {
      id: compatibilitySeed.topicLabel.id,
      clusterId: packageFixture.cluster.cluster_id,
      name:
        firstAiLabel?.label ??
        packageFixture.cluster.upstream_cluster_label ??
        packageFixture.case.title,
      explanation:
        packageFixture.case.description ?? compatibilitySeed.topicLabel.explanation,
      generatedBy:
        firstAiLabel?.model_reference ??
        compatibilitySeed.topicLabel.generatedBy,
      generatedAt: compatibilitySeed.topicLabel.generatedAt,
    },
    blindInterpretationOptions: compatibilitySeed.blindInterpretationOptions,
    candidateLabels: packageFixture.candidate_labels.map((label) => ({
      id: label.label_id,
      source: readCandidateLabelSource(label.source),
      label: label.label,
      rationale: label.rationale ?? "",
      supportEstimate: readAvailableMetric(label.confidence, 0),
    })),
    seededBestLabelId: compatibilitySeed.seededBestLabelId,
    seededImpostorSessionId: compatibilitySeed.seededImpostorSessionId,
    representativeSessions: packageFixture.representative_sessions.map(
      (session) => {
        const seedSession = compatibilitySeed.representativeSessions.find(
          (candidate) => candidate.id === session.session_id,
        );

        return {
          id: session.session_id,
          title: session.title,
          principal: seedSession?.principal ?? "",
          timestamp: seedSession?.timestamp ?? "",
          featureOverlap: readAvailableMetric(
            session.cluster_membership.membership_score,
            0,
          ),
          outlierScore: readAvailableMetric(
            session.cluster_membership.distance_to_centroid,
            0,
          ),
          summary: session.summary,
          ...(seedSession?.outlierReason
            ? { outlierReason: seedSession.outlierReason }
            : {}),
        };
      },
    ),
    failureModes: compatibilitySeed.failureModes,
    defaultEvidenceRatings: compatibilitySeed.defaultEvidenceRatings,
    claims: packageFixture.claims.map((claim) => {
      const seedClaim = compatibilitySeed.claims.find(
        (candidate) => candidate.id === claim.claim_id,
      );

      return {
        id: claim.claim_id,
        clusterId: packageFixture.cluster.cluster_id,
        topicLabelId: compatibilitySeed.topicLabel.id,
        text: claim.text,
        status: seedClaim?.status ?? readSupportStatus(claim.confidence),
        supportScore: readAvailableMetric(claim.confidence, 0),
        rationale: seedClaim?.rationale ?? claim.caveats?.join(" ") ?? "",
      };
    }),
    evidenceItems: packageFixture.evidence_items.map((evidence) => {
      const seedEvidence = compatibilitySeed.evidenceItems.find(
        (candidate) => candidate.id === evidence.evidence_id,
      );

      return {
        id: evidence.evidence_id,
        clusterId: packageFixture.cluster.cluster_id,
        title: evidence.title,
        summary: evidence.summary,
        sourceType:
          seedEvidence?.sourceType ??
          readEvidenceSourceType(evidence.evidence_type),
        rawReference:
          evidence.source_reference.safe_reference?.uri ??
          seedEvidence?.rawReference,
      };
    }),
    evidenceRelations: packageFixture.evidence_to_claim_mappings.map(
      (mapping) => {
        const seedRelation = compatibilitySeed.evidenceRelations.find(
          (candidate) =>
            candidate.claimId === mapping.claim_id &&
            candidate.evidenceId === mapping.evidence_id,
        );

        return {
          claimId: mapping.claim_id,
          evidenceId: mapping.evidence_id,
          polarity:
            seedRelation?.polarity ?? readEvidencePolarity(mapping.relationship),
          strength: seedRelation?.strength ?? readEvidenceStrength(mapping.relationship),
          explanation: mapping.rationale ?? seedRelation?.explanation ?? "",
        };
      },
    ),
    supportScores: packageFixture.claims.map((claim) => {
      const seedScore = compatibilitySeed.supportScores.find(
        (score) => score.claimId === claim.claim_id,
      );

      return {
        claimId: claim.claim_id,
        value: readAvailableMetric(claim.confidence, 0),
        status: seedScore?.status ?? readSupportStatus(claim.confidence),
        rationale: seedScore?.rationale ?? claim.caveats?.join(" ") ?? "",
      };
    }),
    analystVerdict: compatibilitySeed.analystVerdict
      ? {
          decision: compatibilitySeed.analystVerdict.decision,
          summary: compatibilitySeed.analystVerdict.summary,
          reviewer: compatibilitySeed.analystVerdict.reviewer,
          reviewedAt: compatibilitySeed.analystVerdict.reviewedAt,
        }
      : undefined,
  };
}

function readAvailableMetric(
  metric: CasePackageMetricV01 | undefined,
  fallback: number,
): number {
  if (metric?.status !== "available") {
    return fallback;
  }

  return metric.value;
}

function readClusterSource(
  dataClassification: CasePackageV01["dataset"]["data_classification"],
): ClusterSource {
  if (dataClassification === "synthetic") {
    return "sample";
  }

  return "other";
}

function readCandidateLabelSource(
  source: CasePackageCandidateLabelSourceV01,
): CandidateLabelSource {
  const sourceMap: Record<
    CasePackageCandidateLabelSourceV01,
    CandidateLabelSource
  > = {
    ai_generated: "baseline_ai",
    alternative_model: "evidence_constrained_ai",
    prompt_variant: "evidence_constrained_ai",
    human_baseline: "human_style",
    synthetic_fixture: "uncertain_label",
  };

  return sourceMap[source];
}

function readSupportStatus(
  confidence: CasePackageMetricV01 | undefined,
): SupportStatus {
  const value = readAvailableMetric(confidence, 0);

  if (value >= 0.75) {
    return "supported";
  }

  if (value >= 0.5) {
    return "weakly_supported";
  }

  if (value >= 0.25) {
    return "insufficient_evidence";
  }

  return "unsupported";
}

function readEvidenceSourceType(
  evidenceType: CasePackageEvidenceTypeV01,
): EvidenceSourceType {
  const sourceTypeMap: Record<CasePackageEvidenceTypeV01, EvidenceSourceType> = {
    salient_feature: "session_feature",
    representative_session: "exemplar",
    event_summary: "telemetry_event",
    sequence_summary: "telemetry_event",
    metric_card: "metadata",
    neighbor_comparison: "metadata",
    outlier_impostor_evidence: "exemplar",
    analyst_note: "analyst_note",
    safe_drilldown_reference: "metadata",
    derived_table: "metadata",
    aggregate_statistic: "metadata",
  };

  return sourceTypeMap[evidenceType];
}

function readEvidencePolarity(
  relationship: CasePackageEvidenceRelationshipV01,
): EvidencePolarity {
  if (relationship === "supports" || relationship === "weak_support") {
    return "supports";
  }

  if (relationship === "contradicts") {
    return "contradicts";
  }

  return "neutral";
}

function readEvidenceStrength(
  relationship: CasePackageEvidenceRelationshipV01,
): EvidenceStrength {
  if (relationship === "supports" || relationship === "contradicts") {
    return "strong";
  }

  if (relationship === "weak_support" || relationship === "context") {
    return "moderate";
  }

  return "weak";
}
