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

type CaseFileCompatibilitySeed = Pick<
  CaseFile,
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

export function casePackageV01ToCaseFile(
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
    representativeSessions: compatibilitySeed.representativeSessions,
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
