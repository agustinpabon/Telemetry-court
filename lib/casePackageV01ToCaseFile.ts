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

export type CaseFileCompatibilitySeed = Pick<
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

export function createCaseFileCompatibilitySeedFromCasePackageV01(
  packageFixture: CasePackageV01,
): CaseFileCompatibilitySeed {
  const firstAiLabel =
    packageFixture.candidate_labels.find(
      (label) => label.source === "ai_generated",
    ) ?? packageFixture.candidate_labels[0];
  const topicLabelId = firstAiLabel?.label_id ?? `label-${packageFixture.case.case_id}`;
  const blindCandidateLabels = packageFixture.candidate_labels.filter(
    (label) =>
      label.label_id !== topicLabelId && label.label !== firstAiLabel?.label,
  );
  const bestLabelId = getBestSupportedLabelId(packageFixture);
  const seededImpostorSessionId = getSeededImpostorSessionId(packageFixture);
  const defaultEvidenceRatings = buildDefaultEvidenceRatings(packageFixture);

  return {
    id: packageFixture.case.case_id,
    cluster: {
      id: packageFixture.cluster.cluster_id,
      name: packageFixture.cluster.cluster_name ?? packageFixture.case.title,
      description: packageFixture.case.summary,
      source: readClusterSource(packageFixture.dataset.data_classification),
      size: packageFixture.cluster.cluster_size,
    },
    reviewStatus: readReviewStatus(packageFixture),
    landscapeStatus: readLandscapeStatus(packageFixture),
    topFeatures: readTopFeatures(packageFixture),
    riskFlags: readRiskFlags(packageFixture),
    blindInterpretationOptions: [
      ...blindCandidateLabels.map((label) => ({
        id: `blind-${label.label_id}`,
        label: label.label,
        helper:
          label.rationale ??
          `Assess whether the case package evidence supports ${label.label}.`,
      })),
      {
        id: "blind-insufficient-evidence",
        label: "Not enough evidence",
        helper:
          "Use when the case package evidence supports activity but not a confident interpretation.",
      },
      {
        id: "blind-none-of-these",
        label: "None of these",
        helper: "Use when the structured interpretations do not fit the evidence.",
      },
    ],
    seededBestLabelId: bestLabelId,
    seededImpostorSessionId,
    representativeSessions: packageFixture.representative_sessions.map(
      (session) => {
        const outlierReason = readOutlierReason(
          packageFixture,
          session.session_id,
        );

        return {
          id: session.session_id,
          title: session.title,
          principal:
            session.safe_reference?.label ?? packageFixture.dataset.dataset_name,
          timestamp:
            packageFixture.cluster.time_range?.start_at ??
            packageFixture.created_at,
          featureOverlap: readAvailableMetric(
            session.cluster_membership.membership_score,
            0,
          ),
          outlierScore: readAvailableMetric(
            session.cluster_membership.distance_to_centroid,
            0,
          ),
          summary: session.summary,
          ...(outlierReason ? { outlierReason } : {}),
        };
      },
    ),
    failureModes: readFailureModes(packageFixture),
    defaultEvidenceRatings,
    topicLabel: {
      id: topicLabelId,
      clusterId: packageFixture.cluster.cluster_id,
      name:
        firstAiLabel?.label ??
        packageFixture.cluster.upstream_cluster_label ??
        packageFixture.case.title,
      explanation:
        firstAiLabel?.rationale ??
        packageFixture.case.description ??
        packageFixture.case.summary,
      generatedBy:
        firstAiLabel?.model_reference ??
        packageFixture.pipeline.naming_model ??
        packageFixture.pipeline.upstream_tool,
      generatedAt: packageFixture.pipeline.generated_at,
    },
    claims: packageFixture.claims.map((claim) => ({
      id: claim.claim_id,
      clusterId: packageFixture.cluster.cluster_id,
      topicLabelId,
      text: claim.text,
      status: readSupportStatus(claim.confidence),
      supportScore: readAvailableMetric(claim.confidence, 0),
      rationale: readClaimRationale(claim),
    })),
    evidenceItems: packageFixture.evidence_items.map((evidence) => ({
      id: evidence.evidence_id,
      clusterId: packageFixture.cluster.cluster_id,
      title: evidence.title,
      summary: evidence.summary,
      sourceType: readEvidenceSourceType(evidence.evidence_type),
      rawReference:
        evidence.source_reference.safe_reference?.uri ??
        evidence.source_reference.safe_reference?.artifact_id,
    })),
    evidenceRelations: packageFixture.evidence_to_claim_mappings.map(
      (mapping) => ({
        claimId: mapping.claim_id,
        evidenceId: mapping.evidence_id,
        polarity: readEvidencePolarity(mapping.relationship),
        strength: readEvidenceStrength(mapping.relationship),
        explanation: mapping.rationale ?? "",
      }),
    ),
    supportScores: packageFixture.claims.map((claim) => ({
      claimId: claim.claim_id,
      value: readAvailableMetric(claim.confidence, 0),
      status: readSupportStatus(claim.confidence),
      rationale: readClaimRationale(claim),
    })),
    analystVerdict: undefined,
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
    casePackageReference: {
      schema_version: packageFixture.schema_version,
      package_id: packageFixture.package_id,
      ...(packageFixture.package_revision
        ? { package_revision: packageFixture.package_revision }
        : {}),
      case_id: packageFixture.case.case_id,
      cluster_id: packageFixture.cluster.cluster_id,
      pipeline: {
        ...(packageFixture.pipeline.pipeline_id
          ? { pipeline_id: packageFixture.pipeline.pipeline_id }
          : {}),
        run_id: packageFixture.pipeline.run_id,
        upstream_tool: packageFixture.pipeline.upstream_tool,
        ...(packageFixture.pipeline.pipeline_version
          ? { pipeline_version: packageFixture.pipeline.pipeline_version }
          : {}),
        ...(packageFixture.pipeline.embedding_model
          ? { embedding_model: packageFixture.pipeline.embedding_model }
          : {}),
        ...(packageFixture.pipeline.clustering_method
          ? { clustering_method: packageFixture.pipeline.clustering_method }
          : {}),
        ...(packageFixture.pipeline.dimensionality_reduction_method
          ? {
              dimensionality_reduction_method:
                packageFixture.pipeline.dimensionality_reduction_method,
            }
          : {}),
        ...(packageFixture.pipeline.naming_model
          ? { naming_model: packageFixture.pipeline.naming_model }
          : {}),
        ...(packageFixture.pipeline.prompt?.prompt_id
          ? { prompt_id: packageFixture.pipeline.prompt.prompt_id }
          : {}),
        ...(packageFixture.pipeline.prompt?.prompt_version
          ? { prompt_version: packageFixture.pipeline.prompt.prompt_version }
          : {}),
        ...(packageFixture.pipeline.prompt?.prompt_digest
          ? { prompt_digest: packageFixture.pipeline.prompt.prompt_digest }
          : {}),
        generated_at: packageFixture.pipeline.generated_at,
      },
      blind_review_enabled:
        packageFixture.review_configuration.blind_review_enabled,
    },
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

function getBestSupportedLabelId(packageFixture: CasePackageV01): string {
  const sortedLabels = [...packageFixture.candidate_labels].sort(
    (left, right) =>
      readAvailableMetric(right.confidence, -1) -
        readAvailableMetric(left.confidence, -1) ||
      (left.rank ?? Number.MAX_SAFE_INTEGER) -
        (right.rank ?? Number.MAX_SAFE_INTEGER) ||
      left.label_id.localeCompare(right.label_id),
  );

  return sortedLabels[0]?.label_id ?? "";
}

function getSeededImpostorSessionId(packageFixture: CasePackageV01): string {
  const outlierCandidate = [...packageFixture.outlier_impostor_candidates]
    .filter((candidate) => candidate.session_id)
    .sort(
      (left, right) =>
        readAvailableMetric(right.score, -1) -
          readAvailableMetric(left.score, -1) ||
        (left.session_id ?? "").localeCompare(right.session_id ?? ""),
    )[0];

  return (
    outlierCandidate?.session_id ??
    packageFixture.representative_sessions[0]?.session_id ??
    ""
  );
}

function buildDefaultEvidenceRatings(
  packageFixture: CasePackageV01,
): CaseFile["defaultEvidenceRatings"] {
  const relationshipsByEvidence = new Map<
    string,
    CasePackageEvidenceRelationshipV01[]
  >();

  for (const mapping of packageFixture.evidence_to_claim_mappings) {
    relationshipsByEvidence.set(mapping.evidence_id, [
      ...(relationshipsByEvidence.get(mapping.evidence_id) ?? []),
      mapping.relationship,
    ]);
  }

  return Object.fromEntries(
    packageFixture.evidence_items.map((evidence) => [
      evidence.evidence_id,
      readDefaultEvidenceRating(
        relationshipsByEvidence.get(evidence.evidence_id) ?? [],
      ),
    ]),
  ) as CaseFile["defaultEvidenceRatings"];
}

function readDefaultEvidenceRating(
  relationships: CasePackageEvidenceRelationshipV01[],
): CaseFile["defaultEvidenceRatings"][string] {
  if (relationships.includes("contradicts")) {
    return "contradicts_label";
  }

  if (relationships.includes("supports")) {
    return "supports_label";
  }

  if (relationships.includes("weak_support")) {
    return "weak_support";
  }

  if (relationships.includes("irrelevant")) {
    return "irrelevant_noise";
  }

  return "needs_context";
}

function readReviewStatus(packageFixture: CasePackageV01): CaseFile["reviewStatus"] {
  if (packageFixture.case.reviewable_status === "needs_more_evidence") {
    return "needs_evidence";
  }

  if (packageFixture.case.review_intent === "assess_cluster_purity") {
    return "needs_split";
  }

  return "unreviewed";
}

function readLandscapeStatus(
  packageFixture: CasePackageV01,
): CaseFile["landscapeStatus"] {
  if (packageFixture.case.review_intent === "assess_cluster_purity") {
    return "impure";
  }

  if (packageFixture.case.review_intent === "compare_labels") {
    return "too_broad";
  }

  const evidenceCoverage = readAvailableMetric(
    packageFixture.metrics.evidence_coverage,
    0,
  );
  const modelAgreement = readAvailableMetric(
    packageFixture.metrics.model_agreement,
    0,
  );
  const uncertainty = readAvailableMetric(packageFixture.metrics.uncertainty, 1);

  if (uncertainty >= 0.68) {
    return "uncertain";
  }

  if (evidenceCoverage >= 0.72 && modelAgreement >= 0.55) {
    return "supported";
  }

  return "overclaimed";
}

function readTopFeatures(packageFixture: CasePackageV01): string[] {
  const featureHighlights = packageFixture.representative_sessions.flatMap(
    (session) => session.feature_highlights,
  );
  const evidenceTitles = packageFixture.evidence_items.map(
    (evidence) => evidence.title,
  );
  const features = uniqueStrings([...featureHighlights, ...evidenceTitles]).slice(
    0,
    6,
  );

  return features.length > 0 ? features : ["Case package evidence"];
}

function readRiskFlags(packageFixture: CasePackageV01): string[] {
  const riskFlags = new Set<string>();
  const evidenceCoverage = readAvailableMetric(
    packageFixture.metrics.evidence_coverage,
    0,
  );
  const uncertainty = readAvailableMetric(packageFixture.metrics.uncertainty, 0);

  if (
    packageFixture.claims.some(
      (claim) => claim.evidence_status === "missing_evidence_declared",
    )
  ) {
    riskFlags.add("Claim has missing evidence");
  }

  if (
    packageFixture.evidence_to_claim_mappings.some((mapping) =>
      ["insufficient", "missing_evidence"].includes(mapping.relationship),
    )
  ) {
    riskFlags.add("Evidence sufficiency gap");
  }

  if (packageFixture.outlier_impostor_candidates.length > 0) {
    riskFlags.add("Outlier/impostor candidates");
  }

  if (evidenceCoverage < 0.55) {
    riskFlags.add("Thin evidence coverage");
  }

  if (uncertainty >= 0.65) {
    riskFlags.add("High uncertainty");
  }

  if (!packageFixture.sanitization.raw_drilldown_allowed) {
    riskFlags.add("Summary-only references");
  }

  const flags = [...riskFlags].slice(0, 5);

  return flags.length > 0 ? flags : ["Validate evidence grounding"];
}

function readFailureModes(packageFixture: CasePackageV01): CaseFile["failureModes"] {
  const failureModes = new Set<CaseFile["failureModes"][number]>([
    "better_supported",
    "less_overclaimed",
  ]);
  const uncertainty = readAvailableMetric(packageFixture.metrics.uncertainty, 0);

  if (
    packageFixture.claims.some(
      (claim) => claim.evidence_status === "missing_evidence_declared",
    ) ||
    packageFixture.evidence_to_claim_mappings.some((mapping) =>
      ["insufficient", "missing_evidence"].includes(mapping.relationship),
    )
  ) {
    failureModes.add("missing_evidence");
  }

  if (
    packageFixture.case.review_intent === "assess_cluster_purity" ||
    packageFixture.outlier_impostor_candidates.length > 0
  ) {
    failureModes.add("cluster_seems_mixed");
  }

  if (uncertainty >= 0.6) {
    failureModes.add("preserves_uncertainty");
  }

  return [...failureModes].slice(0, 5);
}

function readOutlierReason(
  packageFixture: CasePackageV01,
  sessionId: string,
): string | undefined {
  return packageFixture.outlier_impostor_candidates.find(
    (candidate) => candidate.session_id === sessionId,
  )?.reason;
}

function readClaimRationale(claim: CasePackageV01["claims"][number]): string {
  return (
    claim.caveats?.join(" ") ??
    claim.assumptions?.join(" ") ??
    (claim.evidence_status === "missing_evidence_declared"
      ? "The package declares missing evidence for this claim."
      : "")
  );
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
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
