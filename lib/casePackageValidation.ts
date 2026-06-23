import {
  CASE_PACKAGE_V01_EVIDENCE_RATINGS,
  CASE_PACKAGE_V01_REQUIRED_REVIEWER_ACTIONS,
  CASE_PACKAGE_V01_REQUIRED_REVIEW_STAGES,
  CASE_PACKAGE_V01_RECOMMENDED_ACTIONS,
  CASE_PACKAGE_V01_SCHEMA_VERSION,
  CASE_PACKAGE_V01_VERDICTS,
  type CasePackageV01,
} from "@/lib/types";

export type CasePackageValidationError = {
  path: string;
  code: string;
  message: string;
};

export type CasePackageValidationResult =
  | { ok: true; package: CasePackageV01 }
  | { ok: false; errors: CasePackageValidationError[] };

export type CasePackageValidationPosture = "synthetic_demo" | "controlled";

type ObjectRecord = Record<string, unknown>;

const REVIEWABLE_STATUSES = [
  "reviewable",
  "needs_more_evidence",
  "blocked",
  "synthetic_demo",
] as const;

const REVIEW_INTENTS = [
  "validate_label",
  "compare_labels",
  "assess_cluster_purity",
  "assess_evidence_quality",
  "research_benchmark",
] as const;

const DATASET_TYPES = [
  "cloudtrail",
  "endpoint",
  "identity",
  "network",
  "application",
  "mixed",
  "synthetic",
  "other",
] as const;

const DATA_CLASSIFICATIONS = [
  "public",
  "synthetic",
  "sanitized",
  "restricted_derived",
  "internal",
  "confidential",
] as const;

const CANDIDATE_LABEL_SOURCES = [
  "ai_generated",
  "human_baseline",
  "alternative_model",
  "prompt_variant",
  "synthetic_fixture",
] as const;

const CLAIM_TYPES = [
  "behavioral_summary",
  "intent",
  "risk",
  "cluster_quality",
  "temporal_pattern",
  "tool_or_technique",
  "negative_evidence",
  "other",
] as const;

const CLAIM_EVIDENCE_STATUSES = ["linked", "missing_evidence_declared"] as const;

const EVIDENCE_TYPES = [
  "salient_feature",
  "representative_session",
  "event_summary",
  "sequence_summary",
  "metric_card",
  "neighbor_comparison",
  "outlier_impostor_evidence",
  "analyst_note",
  "safe_drilldown_reference",
  "derived_table",
  "aggregate_statistic",
] as const;

const EVIDENCE_RELATIONSHIPS = [
  "supports",
  "weak_support",
  "contradicts",
  "context",
  "irrelevant",
  "insufficient",
  "missing_evidence",
] as const;

const SESSION_FLAGS = [
  "representative",
  "borderline",
  "outlier_candidate",
  "impostor_candidate",
  "neighbor_like",
  "needs_context",
] as const;

const EXPECTED_REVIEW_USES = [
  "outlier_check",
  "impostor_check",
  "cluster_purity_check",
  "label_support_check",
  "evidence_sufficiency_check",
] as const;

const SANITIZATION_STATUSES = [
  "synthetic",
  "sanitized",
  "deidentified",
  "redacted",
  "aggregate_only",
  "approved_internal",
  "unknown",
] as const;

const ALLOWED_DISPLAY_LEVELS = [
  "summary_only",
  "sanitized_excerpt",
  "derived_features",
  "aggregate_metrics",
  "approved_internal_reference",
] as const;

const SAFE_REFERENCE_TYPES = [
  "none",
  "synthetic_fixture_path",
  "sanitized_file",
  "notebook_cell",
  "dashboard_link",
  "source_artifact_id",
  "internal_runbook",
] as const;

const METRIC_INTERPRETATIONS = [
  "higher_is_better",
  "lower_is_better",
  "contextual",
] as const;

const REVIEW_APPROVAL_STATUSES = ["approved"] as const;

export function validateCasePackageV01(
  input: unknown,
): CasePackageValidationResult {
  const errors: CasePackageValidationError[] = [];

  if (!isObjectRecord(input)) {
    addError(
      errors,
      "$",
      "invalid_type",
      "CasePackage must be a non-array object.",
    );
    return { ok: false, errors };
  }

  const schemaVersion = requireString(input, "schema_version", "$", errors);
  if (schemaVersion && schemaVersion !== CASE_PACKAGE_V01_SCHEMA_VERSION) {
    addError(
      errors,
      "$.schema_version",
      "unsupported_schema_version",
      `Unsupported CasePackage schema_version "${schemaVersion}". Expected "${CASE_PACKAGE_V01_SCHEMA_VERSION}".`,
    );
  }

  requireString(input, "package_id", "$", errors);
  requireString(input, "created_at", "$", errors);

  const caseMetadata = requireObject(input, "case", "$", errors);
  const dataset = requireObject(input, "dataset", "$", errors);
  const cluster = requireObject(input, "cluster", "$", errors);
  const pipeline = requireObject(input, "pipeline", "$", errors);
  const candidateLabels = requireArray(input, "candidate_labels", "$", errors);
  const claims = requireArray(input, "claims", "$", errors);
  const evidenceItems = requireArray(input, "evidence_items", "$", errors);
  const mappings = requireArray(input, "evidence_to_claim_mappings", "$", errors);
  const sessions = requireArray(input, "representative_sessions", "$", errors);
  const outlierCandidates = requireArray(
    input,
    "outlier_impostor_candidates",
    "$",
    errors,
  );
  const neighborClusters = requireArray(input, "neighbor_clusters", "$", errors);
  const metrics = requireObject(input, "metrics", "$", errors);
  const provenance = requireObject(input, "provenance", "$", errors);
  const sanitization = requireObject(input, "sanitization", "$", errors);
  const reviewConfiguration = requireObject(
    input,
    "review_configuration",
    "$",
    errors,
  );

  validateCaseMetadata(caseMetadata, "$.case", errors);
  validateDataset(dataset, "$.dataset", errors);
  const primaryClusterId = validateCluster(cluster, "$.cluster", errors);
  const pipelineRunId = validatePipeline(pipeline, "$.pipeline", errors);
  const packagePosture = determinePackagePosture(
    caseMetadata,
    dataset,
    sanitization,
  );

  const candidateLabelIds = collectUniqueIds(
    candidateLabels,
    "label_id",
    "$.candidate_labels",
    errors,
  );
  const claimIds = collectUniqueIds(claims, "claim_id", "$.claims", errors);
  const evidenceIds = collectUniqueIds(
    evidenceItems,
    "evidence_id",
    "$.evidence_items",
    errors,
  );
  const sessionIds = collectUniqueIds(
    sessions,
    "session_id",
    "$.representative_sessions",
    errors,
  );
  collectUniqueIds(
    outlierCandidates,
    "candidate_id",
    "$.outlier_impostor_candidates",
    errors,
  );
  collectUniqueIds(
    neighborClusters,
    "neighbor_cluster_id",
    "$.neighbor_clusters",
    errors,
  );

  const provenanceId = validateProvenance(
    provenance,
    "$.provenance",
    packagePosture,
    pipelineRunId,
    errors,
  );
  validateSanitization(
    sanitization,
    "$.sanitization",
    packagePosture,
    errors,
  );

  validateCandidateLabels(candidateLabels, claimIds, errors);
  validateClaims(claims, candidateLabelIds, evidenceIds, errors);
  validateEvidenceItems(
    evidenceItems,
    claimIds,
    sessionIds,
    provenanceId,
    errors,
  );
  validateEvidenceToClaimMappings(mappings, claimIds, evidenceIds, errors);
  validateRepresentativeSessions(
    sessions,
    primaryClusterId,
    evidenceIds,
    errors,
  );
  validateOutlierImpostorCandidates(
    outlierCandidates,
    sessionIds,
    evidenceIds,
    errors,
  );
  validateNeighborClusters(neighborClusters, primaryClusterId, errors);
  validateMetricsObject(metrics, "$.metrics", errors);
  validateReviewConfiguration(
    reviewConfiguration,
    candidateLabelIds,
    errors,
  );

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, package: input as CasePackageV01 };
}

export function getCasePackageValidationPosture(
  casePackage: Pick<CasePackageV01, "case" | "dataset" | "sanitization">,
): CasePackageValidationPosture {
  if (
    isExplicitSyntheticPosture(
      casePackage.case.reviewable_status,
      casePackage.dataset.data_classification,
      casePackage.sanitization.status,
    )
  ) {
    return "synthetic_demo";
  }

  return "controlled";
}

function validateCaseMetadata(
  metadata: ObjectRecord | undefined,
  path: string,
  errors: CasePackageValidationError[],
) {
  if (!metadata) {
    return;
  }

  requireString(metadata, "case_id", path, errors);
  requireString(metadata, "title", path, errors);
  requireString(metadata, "summary", path, errors);
  validateEnumField(
    metadata,
    "reviewable_status",
    path,
    REVIEWABLE_STATUSES,
    errors,
  );
  validateEnumField(metadata, "review_intent", path, REVIEW_INTENTS, errors);
  validateOptionalStringArray(metadata, "limitations", path, errors);
}

function validateDataset(
  dataset: ObjectRecord | undefined,
  path: string,
  errors: CasePackageValidationError[],
) {
  if (!dataset) {
    return;
  }

  requireString(dataset, "dataset_id", path, errors);
  requireString(dataset, "dataset_name", path, errors);
  validateEnumField(dataset, "dataset_type", path, DATASET_TYPES, errors);
  validateEnumField(
    dataset,
    "data_classification",
    path,
    DATA_CLASSIFICATIONS,
    errors,
  );
  requireString(dataset, "source_environment", path, errors);
  requireString(dataset, "approved_use", path, errors);
  validateRequiredStringArray(dataset, "limitations", path, errors);
}

function validateCluster(
  cluster: ObjectRecord | undefined,
  path: string,
  errors: CasePackageValidationError[],
): string | undefined {
  if (!cluster) {
    return undefined;
  }

  const clusterId = requireString(cluster, "cluster_id", path, errors);
  requireBoundlessNumber(cluster, "cluster_size", path, errors);
  const clusterMethod = requireObject(cluster, "cluster_method", path, errors);
  if (clusterMethod) {
    requireString(clusterMethod, "method", fieldPath(path, "cluster_method"), errors);
  }

  validateOptionalStringArray(cluster, "child_cluster_ids", path, errors);

  const embeddingMap = optionalObject(cluster, "embedding_map", path, errors);
  if (embeddingMap) {
    const coordinates = optionalObject(
      embeddingMap,
      "coordinates",
      fieldPath(path, "embedding_map"),
      errors,
    );
    if (coordinates) {
      requireBoundlessNumber(
        coordinates,
        "x",
        fieldPath(fieldPath(path, "embedding_map"), "coordinates"),
        errors,
      );
      requireBoundlessNumber(
        coordinates,
        "y",
        fieldPath(fieldPath(path, "embedding_map"), "coordinates"),
        errors,
      );
    }
  }

  return clusterId;
}

function validatePipeline(
  pipeline: ObjectRecord | undefined,
  path: string,
  errors: CasePackageValidationError[],
): string | undefined {
  if (!pipeline) {
    return undefined;
  }

  const runId = requireString(pipeline, "run_id", path, errors);
  requireString(pipeline, "upstream_tool", path, errors);
  requireString(pipeline, "generated_at", path, errors);

  return runId;
}

function validateCandidateLabels(
  labels: unknown[] | undefined,
  claimIds: Set<string>,
  errors: CasePackageValidationError[],
) {
  forEachObject(labels, "$.candidate_labels", errors, (label, path) => {
    requireString(label, "label_id", path, errors);
    requireString(label, "label", path, errors);
    validateEnumField(label, "source", path, CANDIDATE_LABEL_SOURCES, errors);
    validateReferenceArray(
      label,
      "linked_claim_ids",
      path,
      claimIds,
      "unknown_claim_reference",
      "Candidate label references missing claim ID",
      errors,
    );
    validateOptionalMetric(label, "confidence", path, errors);
    validateOptionalBoundlessNumber(label, "rank", path, errors);
  });
}

function validateClaims(
  claims: unknown[] | undefined,
  labelIds: Set<string>,
  evidenceIds: Set<string>,
  errors: CasePackageValidationError[],
) {
  forEachObject(claims, "$.claims", errors, (claim, path) => {
    requireString(claim, "claim_id", path, errors);
    requireString(claim, "text", path, errors);
    validateEnumField(claim, "claim_type", path, CLAIM_TYPES, errors);

    const linkedEvidenceIds = validateReferenceArray(
      claim,
      "linked_evidence_ids",
      path,
      evidenceIds,
      "unknown_evidence_reference",
      "Claim references missing evidence ID",
      errors,
    );
    if (
      linkedEvidenceIds?.length === 0 &&
      claim.evidence_status !== "missing_evidence_declared"
    ) {
      addError(
        errors,
        fieldPath(path, "linked_evidence_ids"),
        "missing_claim_evidence",
        "Claim must link to evidence or explicitly declare missing evidence.",
      );
    }

    validateOptionalReferenceArray(
      claim,
      "linked_label_ids",
      path,
      labelIds,
      "unknown_label_reference",
      "Claim references missing candidate label ID",
      errors,
    );
    validateOptionalEnumField(
      claim,
      "evidence_status",
      path,
      CLAIM_EVIDENCE_STATUSES,
      errors,
    );
    validateOptionalMetric(claim, "strength", path, errors);
    validateOptionalMetric(claim, "confidence", path, errors);
    validateOptionalStringArray(claim, "caveats", path, errors);
    validateOptionalStringArray(claim, "assumptions", path, errors);
  });
}

function validateEvidenceItems(
  evidenceItems: unknown[] | undefined,
  claimIds: Set<string>,
  sessionIds: Set<string>,
  provenanceId: string | undefined,
  errors: CasePackageValidationError[],
) {
  forEachObject(evidenceItems, "$.evidence_items", errors, (evidence, path) => {
    requireString(evidence, "evidence_id", path, errors);
    requireString(evidence, "title", path, errors);
    requireString(evidence, "summary", path, errors);
    const evidenceType = validateEnumField(
      evidence,
      "evidence_type",
      path,
      EVIDENCE_TYPES,
      errors,
    );

    validateEvidenceContent(
      requireObject(evidence, "content", path, errors),
      fieldPath(path, "content"),
      errors,
    );
    const sourceReference = requireObject(
      evidence,
      "source_reference",
      path,
      errors,
    );
    validateSourceReference(
      sourceReference,
      fieldPath(path, "source_reference"),
      errors,
    );

    const provenanceReference = requireString(
      evidence,
      "provenance_reference",
      path,
      errors,
    );
    if (
      provenanceReference &&
      provenanceId &&
      provenanceReference !== provenanceId
    ) {
      addError(
        errors,
        fieldPath(path, "provenance_reference"),
        "unknown_provenance_reference",
        `Evidence item references provenance "${provenanceReference}", but package provenance is "${provenanceId}".`,
      );
    }

    validateEnumField(
      evidence,
      "sanitization_status",
      path,
      SANITIZATION_STATUSES,
      errors,
    );
    validateOptionalReferenceArray(
      evidence,
      "linked_claim_ids",
      path,
      claimIds,
      "unknown_claim_reference",
      "Evidence item references missing claim ID",
      errors,
    );
    validateOptionalReferenceArray(
      evidence,
      "linked_session_ids",
      path,
      sessionIds,
      "unknown_session_reference",
      "Evidence item references missing representative session ID",
      errors,
    );
    validateOptionalMetric(evidence, "weight", path, errors);
    validateOptionalMetric(evidence, "salience", path, errors);

    if (
      evidenceType === "safe_drilldown_reference" &&
      !hasObject(sourceReference, "safe_reference")
    ) {
      addError(
        errors,
        fieldPath(path, "source_reference.safe_reference"),
        "missing_required_field",
        "Safe drill-down evidence must include an explicit safe reference.",
      );
    }
  });
}

function validateEvidenceContent(
  content: ObjectRecord | undefined,
  path: string,
  errors: CasePackageValidationError[],
) {
  if (!content) {
    return;
  }

  const contentType = validateEnumValue(
    content.content_type,
    fieldPath(path, "content_type"),
    ["text", "structured_summary", "metric_summary"],
    errors,
  );

  if (contentType === "text") {
    requireString(content, "text", path, errors);
  }

  if (contentType === "structured_summary") {
    requireObject(content, "fields", path, errors);
  }

  if (contentType === "metric_summary") {
    const metrics = requireObject(content, "metrics", path, errors);
    validateMetricsObject(metrics, fieldPath(path, "metrics"), errors);
  }
}

function validateSourceReference(
  sourceReference: ObjectRecord | undefined,
  path: string,
  errors: CasePackageValidationError[],
) {
  if (!sourceReference) {
    return;
  }

  requireString(sourceReference, "source_id", path, errors);
  requireString(sourceReference, "source_type", path, errors);
  const safeReference = optionalObject(
    sourceReference,
    "safe_reference",
    path,
    errors,
  );
  validateSafeReference(safeReference, fieldPath(path, "safe_reference"), errors);
}

function validateEvidenceToClaimMappings(
  mappings: unknown[] | undefined,
  claimIds: Set<string>,
  evidenceIds: Set<string>,
  errors: CasePackageValidationError[],
) {
  forEachObject(mappings, "$.evidence_to_claim_mappings", errors, (mapping, path) => {
    const claimId = requireString(mapping, "claim_id", path, errors);
    const evidenceId = requireString(mapping, "evidence_id", path, errors);
    validateReference(
      claimId,
      claimIds,
      fieldPath(path, "claim_id"),
      "unknown_claim_reference",
      "Evidence-to-claim mapping references missing claim ID",
      errors,
    );
    validateReference(
      evidenceId,
      evidenceIds,
      fieldPath(path, "evidence_id"),
      "unknown_evidence_reference",
      "Evidence-to-claim mapping references missing evidence ID",
      errors,
    );
    validateEnumField(
      mapping,
      "relationship",
      path,
      EVIDENCE_RELATIONSHIPS,
      errors,
    );
    validateOptionalEnumField(
      mapping,
      "expected_support",
      path,
      EVIDENCE_RELATIONSHIPS,
      errors,
    );
  });
}

function validateRepresentativeSessions(
  sessions: unknown[] | undefined,
  primaryClusterId: string | undefined,
  evidenceIds: Set<string>,
  errors: CasePackageValidationError[],
) {
  forEachObject(sessions, "$.representative_sessions", errors, (session, path) => {
    requireString(session, "session_id", path, errors);
    requireString(session, "title", path, errors);
    requireString(session, "summary", path, errors);
    validateRequiredStringArray(session, "feature_highlights", path, errors);
    const safeReference = optionalObject(session, "safe_reference", path, errors);
    validateSafeReference(safeReference, fieldPath(path, "safe_reference"), errors);

    const clusterMembership = requireObject(
      session,
      "cluster_membership",
      path,
      errors,
    );
    if (clusterMembership) {
      const clusterId = requireString(
        clusterMembership,
        "cluster_id",
        fieldPath(path, "cluster_membership"),
        errors,
      );
      if (clusterId && primaryClusterId && clusterId !== primaryClusterId) {
        addError(
          errors,
          fieldPath(fieldPath(path, "cluster_membership"), "cluster_id"),
          "unknown_cluster_reference",
          `Representative session references cluster "${clusterId}", but package cluster is "${primaryClusterId}".`,
        );
      }
      validateOptionalMetric(
        clusterMembership,
        "membership_score",
        fieldPath(path, "cluster_membership"),
        errors,
      );
      validateOptionalMetric(
        clusterMembership,
        "distance_to_centroid",
        fieldPath(path, "cluster_membership"),
        errors,
      );
    }

    validateRequiredEnumArray(session, "flags", path, SESSION_FLAGS, errors);
    validateOptionalReferenceArray(
      session,
      "linked_evidence_ids",
      path,
      evidenceIds,
      "unknown_evidence_reference",
      "Representative session references missing evidence ID",
      errors,
    );
  });
}

function validateOutlierImpostorCandidates(
  candidates: unknown[] | undefined,
  sessionIds: Set<string>,
  evidenceIds: Set<string>,
  errors: CasePackageValidationError[],
) {
  forEachObject(
    candidates,
    "$.outlier_impostor_candidates",
    errors,
    (candidate, path) => {
      requireString(candidate, "candidate_id", path, errors);
      requireString(candidate, "reason", path, errors);
      validateOptionalReference(
        candidate,
        "session_id",
        path,
        sessionIds,
        "unknown_session_reference",
        "Outlier/impostor candidate references missing representative session ID",
        errors,
      );
      validateOptionalReference(
        candidate,
        "evidence_id",
        path,
        evidenceIds,
        "unknown_evidence_reference",
        "Outlier/impostor candidate references missing evidence ID",
        errors,
      );

      if (
        typeof candidate.session_id !== "string" &&
        typeof candidate.evidence_id !== "string"
      ) {
        addError(
          errors,
          path,
          "missing_candidate_reference",
          "Outlier/impostor candidate must reference a representative session or evidence item.",
        );
      }

      validateOptionalMetric(candidate, "score", path, errors);
      validateEnumField(
        candidate,
        "expected_review_use",
        path,
        EXPECTED_REVIEW_USES,
        errors,
      );
    },
  );
}

function validateNeighborClusters(
  neighbors: unknown[] | undefined,
  primaryClusterId: string | undefined,
  errors: CasePackageValidationError[],
) {
  forEachObject(neighbors, "$.neighbor_clusters", errors, (neighbor, path) => {
    const neighborClusterId = requireString(
      neighbor,
      "neighbor_cluster_id",
      path,
      errors,
    );
    if (
      neighborClusterId &&
      primaryClusterId &&
      neighborClusterId === primaryClusterId
    ) {
      addError(
        errors,
        fieldPath(path, "neighbor_cluster_id"),
        "invalid_neighbor_reference",
        "Neighbor cluster must not reference the package's primary cluster ID.",
      );
    }
    requireString(neighbor, "reason_this_neighbor_matters", path, errors);
    validateOptionalMetric(neighbor, "distance", path, errors);
    validateOptionalMetric(neighbor, "similarity", path, errors);
    validateOptionalMetric(neighbor, "confusion_risk", path, errors);
  });
}

function validateMetricsObject(
  metrics: ObjectRecord | undefined,
  path: string,
  errors: CasePackageValidationError[],
) {
  if (!metrics) {
    return;
  }

  for (const [metricName, metricValue] of Object.entries(metrics)) {
    validateMetricEnvelope(metricValue, fieldPath(path, metricName), errors);
  }
}

function validateProvenance(
  provenance: ObjectRecord | undefined,
  path: string,
  packagePosture: "synthetic" | "controlled" | undefined,
  pipelineRunId: string | undefined,
  errors: CasePackageValidationError[],
): string | undefined {
  if (!provenance) {
    return undefined;
  }

  const provenanceId = requireString(provenance, "provenance_id", path, errors);
  requireString(provenance, "source_system", path, errors);
  requireString(provenance, "source_artifact", path, errors);
  requireString(provenance, "generating_tool", path, errors);
  requireString(provenance, "generated_at", path, errors);

  if (packagePosture === "controlled") {
    const upstreamRunId = requireString(
      provenance,
      "upstream_run_id",
      path,
      errors,
    );
    requireString(provenance, "adapter_name", path, errors);
    requireString(provenance, "adapter_version", path, errors);

    if (upstreamRunId && pipelineRunId && upstreamRunId !== pipelineRunId) {
      addError(
        errors,
        fieldPath(path, "upstream_run_id"),
        "provenance_run_mismatch",
        `Provenance upstream run "${upstreamRunId}" must match pipeline run "${pipelineRunId}".`,
      );
    }
  }

  const references = requireArray(provenance, "references", path, errors);
  if (references && references.length === 0) {
    addError(
      errors,
      fieldPath(path, "references"),
      "empty_required_array",
      "Provenance references must include at least one safe source reference.",
    );
  }
  forEachObject(references, fieldPath(path, "references"), errors, (reference, itemPath) => {
    validateSafeReference(reference, itemPath, errors);
  });

  if (
    packagePosture === "controlled" &&
    references &&
    !references.some(isAuditableControlledReference)
  ) {
    addError(
      errors,
      fieldPath(path, "references"),
      "missing_auditable_reference",
      "Adapter provenance must include at least one safe reference with a URI or artifact ID.",
    );
  }

  return provenanceId;
}

function validateSanitization(
  sanitization: ObjectRecord | undefined,
  path: string,
  packagePosture: "synthetic" | "controlled" | undefined,
  errors: CasePackageValidationError[],
) {
  if (!sanitization) {
    return;
  }

  const status = validateEnumField(
    sanitization,
    "status",
    path,
    SANITIZATION_STATUSES,
    errors,
  );
  requireString(sanitization, "method", path, errors);
  const redactionNotes = requireArray(
    sanitization,
    "redaction_notes",
    path,
    errors,
  );
  validateStringArrayValues(
    redactionNotes,
    fieldPath(path, "redaction_notes"),
    errors,
  );
  validateEnumField(
    sanitization,
    "allowed_display_level",
    path,
    ALLOWED_DISPLAY_LEVELS,
    errors,
  );
  const rawDrilldownAllowed = requireBoolean(
    sanitization,
    "raw_drilldown_allowed",
    path,
    errors,
  );
  const safeReferenceType = validateEnumField(
    sanitization,
    "safe_reference_type",
    path,
    SAFE_REFERENCE_TYPES,
    errors,
  );

  if (rawDrilldownAllowed === true && safeReferenceType === "none") {
    addError(
      errors,
      fieldPath(path, "safe_reference_type"),
      "unsafe_drilldown_configuration",
      "Raw drill-down cannot be allowed without an explicit safe reference type.",
    );
  }

  if (packagePosture === "synthetic") {
    if (sanitization.review_approval !== undefined) {
      addError(
        errors,
        fieldPath(path, "review_approval"),
        "synthetic_approval_not_allowed",
        "Synthetic demo packages must not claim real-data review approval.",
      );
    }
    return;
  }

  if (packagePosture !== "controlled") {
    return;
  }

  if (status === "synthetic" || status === "unknown") {
    addError(
      errors,
      fieldPath(path, "status"),
      "invalid_controlled_data_sanitization",
      "Non-synthetic packages must declare a concrete sanitization or approved-internal status.",
    );
  }

  if (redactionNotes && redactionNotes.length === 0) {
    addError(
      errors,
      fieldPath(path, "redaction_notes"),
      "empty_required_array",
      "Non-synthetic packages must describe what was removed, transformed, or retained.",
    );
  }

  if (safeReferenceType === "none" || safeReferenceType === "synthetic_fixture_path") {
    addError(
      errors,
      fieldPath(path, "safe_reference_type"),
      "invalid_controlled_data_reference",
      "Non-synthetic packages must use an auditable safe reference type.",
    );
  }

  validateReviewApproval(
    requireObject(sanitization, "review_approval", path, errors),
    fieldPath(path, "review_approval"),
    errors,
  );
}

function validateReviewApproval(
  approval: ObjectRecord | undefined,
  path: string,
  errors: CasePackageValidationError[],
) {
  if (!approval) {
    return;
  }

  validateEnumField(
    approval,
    "status",
    path,
    REVIEW_APPROVAL_STATUSES,
    errors,
  );
  requireString(approval, "approved_by", path, errors);
  requireString(approval, "approved_at", path, errors);
  requireString(approval, "scope", path, errors);
  const reference = requireObject(approval, "reference", path, errors);
  validateSafeReference(reference, fieldPath(path, "reference"), errors);

  if (reference && !isAuditableControlledReference(reference)) {
    addError(
      errors,
      fieldPath(path, "reference"),
      "missing_auditable_reference",
      "Review approval must include a safe reference with a URI or artifact ID.",
    );
  }
}

function determinePackagePosture(
  caseMetadata: ObjectRecord | undefined,
  dataset: ObjectRecord | undefined,
  sanitization: ObjectRecord | undefined,
): "synthetic" | "controlled" | undefined {
  if (!caseMetadata || !dataset || !sanitization) {
    return undefined;
  }

  if (
    isExplicitSyntheticPosture(
      caseMetadata.reviewable_status,
      dataset.data_classification,
      sanitization.status,
    )
  ) {
    return "synthetic";
  }

  return "controlled";
}

function isExplicitSyntheticPosture(
  reviewableStatus: unknown,
  dataClassification: unknown,
  sanitizationStatus: unknown,
): boolean {
  return (
    reviewableStatus === "synthetic_demo" &&
    dataClassification === "synthetic" &&
    sanitizationStatus === "synthetic"
  );
}

function hasConcreteSafeReferenceTarget(reference: unknown): boolean {
  if (!isObjectRecord(reference)) {
    return false;
  }

  return [reference.uri, reference.artifact_id].some(
    (value) => typeof value === "string" && value.trim() !== "",
  );
}

function isAuditableControlledReference(reference: unknown): boolean {
  if (!isObjectRecord(reference)) {
    return false;
  }

  return (
    reference.reference_type !== "none" &&
    reference.reference_type !== "synthetic_fixture_path" &&
    hasConcreteSafeReferenceTarget(reference)
  );
}

function validateReviewConfiguration(
  configuration: ObjectRecord | undefined,
  labelIds: Set<string>,
  errors: CasePackageValidationError[],
) {
  if (!configuration) {
    return;
  }

  requireBoolean(configuration, "blind_review_enabled", "$.review_configuration", errors);
  validateReferenceArray(
    configuration,
    "initially_hidden_label_ids",
    "$.review_configuration",
    labelIds,
    "unknown_label_reference",
    "Review configuration references missing hidden label ID",
    errors,
  );
  validateOptionalReferenceArray(
    configuration,
    "initially_revealed_label_ids",
    "$.review_configuration",
    labelIds,
    "unknown_label_reference",
    "Review configuration references missing revealed label ID",
    errors,
  );
  validateRequiredEnumArray(
    configuration,
    "required_review_stages",
    "$.review_configuration",
    CASE_PACKAGE_V01_REQUIRED_REVIEW_STAGES,
    errors,
  );
  validateRequiredEnumArray(
    configuration,
    "allowed_evidence_ratings",
    "$.review_configuration",
    CASE_PACKAGE_V01_EVIDENCE_RATINGS,
    errors,
  );
  validateRequiredEnumArray(
    configuration,
    "allowed_verdicts",
    "$.review_configuration",
    CASE_PACKAGE_V01_VERDICTS,
    errors,
  );
  validateRequiredEnumArray(
    configuration,
    "allowed_recommended_actions",
    "$.review_configuration",
    CASE_PACKAGE_V01_RECOMMENDED_ACTIONS,
    errors,
  );
  validateRequiredEnumArray(
    configuration,
    "required_reviewer_actions",
    "$.review_configuration",
    CASE_PACKAGE_V01_REQUIRED_REVIEWER_ACTIONS,
    errors,
  );
}

function validateMetricEnvelope(
  value: unknown,
  path: string,
  errors: CasePackageValidationError[],
) {
  if (!isObjectRecord(value)) {
    addError(
      errors,
      path,
      "invalid_metric_envelope",
      "Metric must be an object with status and either value bounds or an unavailable reason.",
    );
    return;
  }

  const status = validateEnumValue(
    value.status,
    fieldPath(path, "status"),
    ["available", "unavailable"],
    errors,
  );

  if (status === "available") {
    const metricValue = requireNumber(value, "value", path, errors);
    const min = requireNumber(value, "min", path, errors);
    const max = requireNumber(value, "max", path, errors);

    if (min !== undefined && min !== 0) {
      addError(
        errors,
        fieldPath(path, "min"),
        "invalid_metric_envelope",
        "Available CasePackage v0.1 metrics must declare min: 0.",
      );
    }

    if (max !== undefined && max !== 1) {
      addError(
        errors,
        fieldPath(path, "max"),
        "invalid_metric_envelope",
        "Available CasePackage v0.1 metrics must declare max: 1.",
      );
    }

    if (
      metricValue !== undefined &&
      (metricValue < 0 || metricValue > 1)
    ) {
      addError(
        errors,
        fieldPath(path, "value"),
        "metric_value_out_of_bounds",
        "Available metric value must be a number between 0 and 1.",
      );
    }

    validateOptionalEnumField(
      value,
      "interpretation",
      path,
      METRIC_INTERPRETATIONS,
      errors,
    );
    return;
  }

  if (status === "unavailable") {
    requireString(value, "reason", path, errors);
  }
}

function validateSafeReference(
  reference: ObjectRecord | undefined,
  path: string,
  errors: CasePackageValidationError[],
) {
  if (!reference) {
    return;
  }

  requireString(reference, "reference_id", path, errors);
  validateEnumField(reference, "reference_type", path, SAFE_REFERENCE_TYPES, errors);
}

function collectUniqueIds(
  items: unknown[] | undefined,
  idField: string,
  path: string,
  errors: CasePackageValidationError[],
): Set<string> {
  const ids = new Set<string>();
  const firstPaths = new Map<string, string>();

  forEachObject(items, path, errors, (item, itemPath) => {
    const id = requireString(item, idField, itemPath, errors);
    if (!id) {
      return;
    }

    const firstPath = firstPaths.get(id);
    if (firstPath) {
      addError(
        errors,
        fieldPath(itemPath, idField),
        "duplicate_id",
        `Duplicate ID "${id}" also appears at ${firstPath}.`,
      );
      return;
    }

    firstPaths.set(id, fieldPath(itemPath, idField));
    ids.add(id);
  });

  return ids;
}

function validateReferenceArray(
  record: ObjectRecord,
  key: string,
  parentPath: string,
  allowedIds: Set<string>,
  code: string,
  messagePrefix: string,
  errors: CasePackageValidationError[],
): string[] | undefined {
  const value = record[key];
  const path = fieldPath(parentPath, key);

  if (value === undefined) {
    addError(errors, path, "missing_required_field", `${path} is required.`);
    return undefined;
  }

  if (!Array.isArray(value)) {
    addError(errors, path, "invalid_type", `${path} must be an array.`);
    return undefined;
  }

  return validateReferenceArrayValues(
    value,
    path,
    allowedIds,
    code,
    messagePrefix,
    errors,
  );
}

function validateOptionalReferenceArray(
  record: ObjectRecord,
  key: string,
  parentPath: string,
  allowedIds: Set<string>,
  code: string,
  messagePrefix: string,
  errors: CasePackageValidationError[],
) {
  const value = record[key];
  const path = fieldPath(parentPath, key);

  if (value === undefined) {
    return;
  }

  if (!Array.isArray(value)) {
    addError(errors, path, "invalid_type", `${path} must be an array.`);
    return;
  }

  validateReferenceArrayValues(value, path, allowedIds, code, messagePrefix, errors);
}

function validateReferenceArrayValues(
  values: unknown[],
  path: string,
  allowedIds: Set<string>,
  code: string,
  messagePrefix: string,
  errors: CasePackageValidationError[],
): string[] {
  const ids: string[] = [];

  values.forEach((value, index) => {
    const itemPath = `${path}[${index}]`;
    if (typeof value !== "string" || value.trim() === "") {
      addError(errors, itemPath, "invalid_type", `${itemPath} must be a string ID.`);
      return;
    }

    ids.push(value);
    validateReference(value, allowedIds, itemPath, code, messagePrefix, errors);
  });

  return ids;
}

function validateOptionalReference(
  record: ObjectRecord,
  key: string,
  parentPath: string,
  allowedIds: Set<string>,
  code: string,
  messagePrefix: string,
  errors: CasePackageValidationError[],
) {
  const value = record[key];

  if (value === undefined) {
    return;
  }

  const path = fieldPath(parentPath, key);
  if (typeof value !== "string" || value.trim() === "") {
    addError(errors, path, "invalid_type", `${path} must be a string ID.`);
    return;
  }

  validateReference(value, allowedIds, path, code, messagePrefix, errors);
}

function validateReference(
  value: string | undefined,
  allowedIds: Set<string>,
  path: string,
  code: string,
  messagePrefix: string,
  errors: CasePackageValidationError[],
) {
  if (!value || allowedIds.has(value)) {
    return;
  }

  addError(errors, path, code, `${messagePrefix}: "${value}".`);
}

function validateRequiredEnumArray(
  record: ObjectRecord,
  key: string,
  parentPath: string,
  allowedValues: readonly string[],
  errors: CasePackageValidationError[],
) {
  const values = requireArray(record, key, parentPath, errors);
  const path = fieldPath(parentPath, key);

  if (!values) {
    return;
  }

  if (values.length === 0) {
    addError(errors, path, "empty_required_array", `${path} must not be empty.`);
  }

  values.forEach((value, index) => {
    validateEnumValue(value, `${path}[${index}]`, allowedValues, errors);
  });
}

function validateEnumField(
  record: ObjectRecord,
  key: string,
  parentPath: string,
  allowedValues: readonly string[],
  errors: CasePackageValidationError[],
): string | undefined {
  const value = requireString(record, key, parentPath, errors);
  if (!value) {
    return undefined;
  }

  return validateEnumValue(
    value,
    fieldPath(parentPath, key),
    allowedValues,
    errors,
  );
}

function validateOptionalEnumField(
  record: ObjectRecord,
  key: string,
  parentPath: string,
  allowedValues: readonly string[],
  errors: CasePackageValidationError[],
) {
  const value = record[key];
  if (value === undefined) {
    return;
  }

  validateEnumValue(value, fieldPath(parentPath, key), allowedValues, errors);
}

function validateEnumValue(
  value: unknown,
  path: string,
  allowedValues: readonly string[],
  errors: CasePackageValidationError[],
): string | undefined {
  if (typeof value !== "string" || value.trim() === "") {
    addError(errors, path, "invalid_type", `${path} must be a non-empty string.`);
    return undefined;
  }

  if (!allowedValues.includes(value)) {
    addError(
      errors,
      path,
      "invalid_enum_value",
      `${path} must be one of: ${allowedValues.join(", ")}.`,
    );
    return undefined;
  }

  return value;
}

function validateOptionalMetric(
  record: ObjectRecord,
  key: string,
  parentPath: string,
  errors: CasePackageValidationError[],
) {
  if (record[key] === undefined) {
    return;
  }

  validateMetricEnvelope(record[key], fieldPath(parentPath, key), errors);
}

function validateRequiredStringArray(
  record: ObjectRecord,
  key: string,
  parentPath: string,
  errors: CasePackageValidationError[],
) {
  const values = requireArray(record, key, parentPath, errors);
  validateStringArrayValues(values, fieldPath(parentPath, key), errors);
}

function validateOptionalStringArray(
  record: ObjectRecord,
  key: string,
  parentPath: string,
  errors: CasePackageValidationError[],
) {
  const value = record[key];
  const path = fieldPath(parentPath, key);
  if (value === undefined) {
    return;
  }

  if (!Array.isArray(value)) {
    addError(errors, path, "invalid_type", `${path} must be an array.`);
    return;
  }

  validateStringArrayValues(value, path, errors);
}

function validateStringArrayValues(
  values: unknown[] | undefined,
  path: string,
  errors: CasePackageValidationError[],
) {
  if (!values) {
    return;
  }

  values.forEach((value, index) => {
    if (typeof value !== "string" || value.trim() === "") {
      addError(
        errors,
        `${path}[${index}]`,
        "invalid_type",
        `${path}[${index}] must be a non-empty string.`,
      );
    }
  });
}

function forEachObject(
  items: unknown[] | undefined,
  path: string,
  errors: CasePackageValidationError[],
  callback: (item: ObjectRecord, path: string) => void,
) {
  if (!items) {
    return;
  }

  items.forEach((item, index) => {
    const itemPath = `${path}[${index}]`;
    if (!isObjectRecord(item)) {
      addError(errors, itemPath, "invalid_type", `${itemPath} must be an object.`);
      return;
    }

    callback(item, itemPath);
  });
}

function requireObject(
  record: ObjectRecord,
  key: string,
  parentPath: string,
  errors: CasePackageValidationError[],
): ObjectRecord | undefined {
  const value = record[key];
  const path = fieldPath(parentPath, key);

  if (value === undefined) {
    addError(errors, path, "missing_required_field", `${path} is required.`);
    return undefined;
  }

  if (!isObjectRecord(value)) {
    addError(errors, path, "invalid_type", `${path} must be an object.`);
    return undefined;
  }

  return value;
}

function optionalObject(
  record: ObjectRecord,
  key: string,
  parentPath: string,
  errors: CasePackageValidationError[],
): ObjectRecord | undefined {
  const value = record[key];
  const path = fieldPath(parentPath, key);

  if (value === undefined) {
    return undefined;
  }

  if (!isObjectRecord(value)) {
    addError(errors, path, "invalid_type", `${path} must be an object.`);
    return undefined;
  }

  return value;
}

function requireArray(
  record: ObjectRecord,
  key: string,
  parentPath: string,
  errors: CasePackageValidationError[],
): unknown[] | undefined {
  const value = record[key];
  const path = fieldPath(parentPath, key);

  if (value === undefined) {
    addError(errors, path, "missing_required_field", `${path} is required.`);
    return undefined;
  }

  if (!Array.isArray(value)) {
    addError(errors, path, "invalid_type", `${path} must be an array.`);
    return undefined;
  }

  return value;
}

function requireString(
  record: ObjectRecord,
  key: string,
  parentPath: string,
  errors: CasePackageValidationError[],
): string | undefined {
  const value = record[key];
  const path = fieldPath(parentPath, key);

  if (value === undefined) {
    addError(errors, path, "missing_required_field", `${path} is required.`);
    return undefined;
  }

  if (typeof value !== "string" || value.trim() === "") {
    addError(errors, path, "invalid_type", `${path} must be a non-empty string.`);
    return undefined;
  }

  return value;
}

function requireBoolean(
  record: ObjectRecord,
  key: string,
  parentPath: string,
  errors: CasePackageValidationError[],
): boolean | undefined {
  const value = record[key];
  const path = fieldPath(parentPath, key);

  if (value === undefined) {
    addError(errors, path, "missing_required_field", `${path} is required.`);
    return undefined;
  }

  if (typeof value !== "boolean") {
    addError(errors, path, "invalid_type", `${path} must be a boolean.`);
    return undefined;
  }

  return value;
}

function requireNumber(
  record: ObjectRecord,
  key: string,
  parentPath: string,
  errors: CasePackageValidationError[],
): number | undefined {
  const value = record[key];
  const path = fieldPath(parentPath, key);

  if (value === undefined) {
    addError(errors, path, "missing_required_field", `${path} is required.`);
    return undefined;
  }

  if (typeof value !== "number" || !Number.isFinite(value)) {
    addError(errors, path, "invalid_type", `${path} must be a finite number.`);
    return undefined;
  }

  return value;
}

function requireBoundlessNumber(
  record: ObjectRecord,
  key: string,
  parentPath: string,
  errors: CasePackageValidationError[],
): number | undefined {
  return requireNumber(record, key, parentPath, errors);
}

function validateOptionalBoundlessNumber(
  record: ObjectRecord,
  key: string,
  parentPath: string,
  errors: CasePackageValidationError[],
) {
  if (record[key] === undefined) {
    return;
  }

  requireBoundlessNumber(record, key, parentPath, errors);
}

function hasObject(record: ObjectRecord | undefined, key: string): boolean {
  return Boolean(record && isObjectRecord(record[key]));
}

function isObjectRecord(value: unknown): value is ObjectRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function fieldPath(parentPath: string, key: string): string {
  return `${parentPath}.${key}`;
}

function addError(
  errors: CasePackageValidationError[],
  path: string,
  code: string,
  message: string,
) {
  errors.push({ path, code, message });
}
