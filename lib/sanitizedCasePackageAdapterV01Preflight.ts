import type {
  SanitizedAdapterDraftInput,
  SanitizedCasePackageAdapterIssueV01,
} from "@/lib/sanitizedCasePackageAdapterV01";
import {
  collectDraftIds,
  forEachDraftObject,
  isObjectRecord,
  requireArrayValue,
  requireBooleanValue,
  requireFiniteNumberValue,
  requireObjectValue,
  requireStringArrayValue,
  requireStringValue,
  validateOptionalReferenceArrayValues,
  validateOptionalReferenceValue,
  validateOptionalStringArrayValue,
  validateReferenceArrayValues,
  validateReferenceValue,
} from "@/lib/sanitizedCasePackageAdapterV01PreflightHelpers";
import type { CasePackageSanitizationStatusV01 } from "@/lib/types";

const CASE_PACKAGE_SANITIZATION_STATUSES = [
  "synthetic",
  "sanitized",
  "deidentified",
  "redacted",
  "aggregate_only",
  "approved_internal",
  "unknown",
] as const satisfies CasePackageSanitizationStatusV01[];

const CLAIM_EVIDENCE_STATUSES = [
  "linked",
  "missing_evidence_declared",
] as const;

export function getSanitizedAdapterDraftPreflightIssues(
  input: SanitizedAdapterDraftInput,
): SanitizedCasePackageAdapterIssueV01[] {
  const topLevelShapeIssues = getTopLevelDraftShapeIssues(input);

  if (topLevelShapeIssues.length > 0) {
    return topLevelShapeIssues;
  }

  const structuralIssues = [
    ...getCaseAndDatasetPostureIssues(input),
    ...getClusterIdentityIssues(input),
    ...getCandidateLabelFieldIssues(input),
    ...getClaimFieldIssues(input),
    ...getEvidenceSummaryFieldIssues(input),
    ...getClaimEvidenceLinkFieldIssues(input),
    ...getRepresentativeSessionFieldIssues(input),
    ...getOutlierImpostorCandidateFieldIssues(input),
    ...getNeighborClusterFieldIssues(input),
    ...getProvenanceMetadataIssues(input),
    ...getSanitizationMetadataIssues(input),
    ...getSanitizationStatusIssues(input),
    ...getEmbeddingMapIssues(input),
  ];

  if (structuralIssues.length > 0) {
    return structuralIssues;
  }

  return [
    ...getReviewApprovalIssues(input),
    ...getDraftReferenceIssues(input),
    ...getClaimEvidenceIssues(input),
  ];
}

function getTopLevelDraftShapeIssues(
  input: SanitizedAdapterDraftInput,
): SanitizedCasePackageAdapterIssueV01[] {
  const issues: SanitizedCasePackageAdapterIssueV01[] = [];

  if (!isObjectRecord(input)) {
    return [
      {
        path: "$",
        message: "Sanitized adapter draft input must be a non-array object.",
      },
    ];
  }

  requireStringValue(input.package_id, "$.package_id", issues);
  requireStringValue(input.created_at, "$.created_at", issues);

  for (const field of [
    "case",
    "dataset",
    "cluster",
    "pipeline",
    "provenance",
    "sanitization",
  ] as const) {
    requireObjectValue(input[field], `$.${field}`, issues);
  }

  for (const field of [
    "candidate_labels",
    "claims",
    "evidence_summaries",
    "claim_evidence_links",
    "representative_sessions",
    "outlier_impostor_candidates",
    "neighbor_clusters",
  ] as const) {
    requireArrayValue(input[field], `$.${field}`, issues);
  }

  if (input.metrics !== undefined) {
    requireObjectValue(input.metrics, "$.metrics", issues);
  }

  if (input.review_configuration !== undefined) {
    requireObjectValue(
      input.review_configuration,
      "$.review_configuration",
      issues,
    );
  }

  return issues;
}

function getCaseAndDatasetPostureIssues(
  input: SanitizedAdapterDraftInput,
): SanitizedCasePackageAdapterIssueV01[] {
  const issues: SanitizedCasePackageAdapterIssueV01[] = [];

  requireStringValue(
    input.case.reviewable_status,
    "$.case.reviewable_status",
    issues,
  );
  requireStringValue(
    input.dataset.data_classification,
    "$.dataset.data_classification",
    issues,
  );

  return issues;
}

function getClusterIdentityIssues(
  input: SanitizedAdapterDraftInput,
): SanitizedCasePackageAdapterIssueV01[] {
  const issues: SanitizedCasePackageAdapterIssueV01[] = [];
  const cluster = input.cluster;

  requireStringValue(cluster.cluster_id, "$.cluster.cluster_id", issues);
  requireFiniteNumberValue(
    cluster.cluster_size,
    "$.cluster.cluster_size",
    issues,
  );

  const clusterMethod = requireObjectValue(
    cluster.cluster_method,
    "$.cluster.cluster_method",
    issues,
  );
  if (clusterMethod) {
    requireStringValue(
      clusterMethod.method,
      "$.cluster.cluster_method.method",
      issues,
    );
  }

  return issues;
}

function getCandidateLabelFieldIssues(
  input: SanitizedAdapterDraftInput,
): SanitizedCasePackageAdapterIssueV01[] {
  const issues: SanitizedCasePackageAdapterIssueV01[] = [];

  forEachDraftObject(
    input.candidate_labels,
    "$.candidate_labels",
    issues,
    (label, path) => {
      requireStringValue(label.label_id, `${path}.label_id`, issues);
      requireStringValue(label.label, `${path}.label`, issues);
      requireStringValue(label.source, `${path}.source`, issues);
      requireStringArrayValue(
        label.linked_claim_ids,
        `${path}.linked_claim_ids`,
        issues,
      );
    },
  );

  return issues;
}

function getClaimFieldIssues(
  input: SanitizedAdapterDraftInput,
): SanitizedCasePackageAdapterIssueV01[] {
  const issues: SanitizedCasePackageAdapterIssueV01[] = [];

  forEachDraftObject(input.claims, "$.claims", issues, (claim, path) => {
    requireStringValue(claim.claim_id, `${path}.claim_id`, issues);
    requireStringValue(claim.text, `${path}.text`, issues);
    requireStringValue(claim.claim_type, `${path}.claim_type`, issues);
    validateOptionalStringArrayValue(
      claim.linked_label_ids,
      `${path}.linked_label_ids`,
      issues,
    );
  });

  return issues;
}

function getEvidenceSummaryFieldIssues(
  input: SanitizedAdapterDraftInput,
): SanitizedCasePackageAdapterIssueV01[] {
  const issues: SanitizedCasePackageAdapterIssueV01[] = [];

  forEachDraftObject(
    input.evidence_summaries,
    "$.evidence_summaries",
    issues,
    (evidence, path) => {
      requireStringValue(evidence.evidence_id, `${path}.evidence_id`, issues);
      requireStringValue(evidence.title, `${path}.title`, issues);
      requireStringValue(evidence.summary, `${path}.summary`, issues);
      requireStringValue(
        evidence.evidence_type,
        `${path}.evidence_type`,
        issues,
      );
      validateOptionalStringArrayValue(
        evidence.linked_session_ids,
        `${path}.linked_session_ids`,
        issues,
      );

      const content = requireObjectValue(
        evidence.content,
        `${path}.content`,
        issues,
      );
      if (content) {
        const contentType = requireStringValue(
          content.content_type,
          `${path}.content.content_type`,
          issues,
        );
        if (contentType === "text") {
          requireStringValue(content.text, `${path}.content.text`, issues);
        }
        if (contentType === "structured_summary") {
          requireObjectValue(content.fields, `${path}.content.fields`, issues);
        }
        if (contentType === "metric_summary") {
          requireObjectValue(content.metrics, `${path}.content.metrics`, issues);
        }
      }

      const sourceReference = requireObjectValue(
        evidence.source_reference,
        `${path}.source_reference`,
        issues,
      );
      if (sourceReference) {
        requireStringValue(
          sourceReference.source_id,
          `${path}.source_reference.source_id`,
          issues,
        );
        requireStringValue(
          sourceReference.source_type,
          `${path}.source_reference.source_type`,
          issues,
        );
      }
    },
  );

  return issues;
}

function getClaimEvidenceLinkFieldIssues(
  input: SanitizedAdapterDraftInput,
): SanitizedCasePackageAdapterIssueV01[] {
  const issues: SanitizedCasePackageAdapterIssueV01[] = [];

  forEachDraftObject(
    input.claim_evidence_links,
    "$.claim_evidence_links",
    issues,
    (link, path) => {
      requireStringValue(link.claim_id, `${path}.claim_id`, issues);
      requireStringValue(link.evidence_id, `${path}.evidence_id`, issues);
      requireStringValue(link.relationship, `${path}.relationship`, issues);
    },
  );

  return issues;
}

function getRepresentativeSessionFieldIssues(
  input: SanitizedAdapterDraftInput,
): SanitizedCasePackageAdapterIssueV01[] {
  const issues: SanitizedCasePackageAdapterIssueV01[] = [];

  forEachDraftObject(
    input.representative_sessions,
    "$.representative_sessions",
    issues,
    (session, path) => {
      requireStringValue(session.session_id, `${path}.session_id`, issues);
      requireStringValue(session.title, `${path}.title`, issues);
      requireStringValue(session.summary, `${path}.summary`, issues);
      requireStringArrayValue(
        session.feature_highlights,
        `${path}.feature_highlights`,
        issues,
      );
      requireStringArrayValue(session.flags, `${path}.flags`, issues);
      if (session.cluster_membership !== undefined) {
        requireObjectValue(
          session.cluster_membership,
          `${path}.cluster_membership`,
          issues,
        );
      }
      validateOptionalStringArrayValue(
        session.linked_evidence_ids,
        `${path}.linked_evidence_ids`,
        issues,
      );
    },
  );

  return issues;
}

function getOutlierImpostorCandidateFieldIssues(
  input: SanitizedAdapterDraftInput,
): SanitizedCasePackageAdapterIssueV01[] {
  const issues: SanitizedCasePackageAdapterIssueV01[] = [];

  forEachDraftObject(
    input.outlier_impostor_candidates,
    "$.outlier_impostor_candidates",
    issues,
    (candidate, path) => {
      requireStringValue(candidate.candidate_id, `${path}.candidate_id`, issues);
      requireStringValue(candidate.reason, `${path}.reason`, issues);
      requireStringValue(
        candidate.expected_review_use,
        `${path}.expected_review_use`,
        issues,
      );
      if (candidate.session_id !== undefined) {
        requireStringValue(candidate.session_id, `${path}.session_id`, issues);
      }
      if (candidate.evidence_id !== undefined) {
        requireStringValue(candidate.evidence_id, `${path}.evidence_id`, issues);
      }
      if (
        typeof candidate.session_id !== "string" &&
        typeof candidate.evidence_id !== "string"
      ) {
        issues.push({
          path,
          message:
            "Outlier/impostor candidate must reference a representative session or evidence item.",
        });
      }
    },
  );

  return issues;
}

function getNeighborClusterFieldIssues(
  input: SanitizedAdapterDraftInput,
): SanitizedCasePackageAdapterIssueV01[] {
  const issues: SanitizedCasePackageAdapterIssueV01[] = [];

  forEachDraftObject(
    input.neighbor_clusters,
    "$.neighbor_clusters",
    issues,
    (neighbor, path) => {
      requireStringValue(
        neighbor.neighbor_cluster_id,
        `${path}.neighbor_cluster_id`,
        issues,
      );
      requireStringValue(
        neighbor.reason_this_neighbor_matters,
        `${path}.reason_this_neighbor_matters`,
        issues,
      );
    },
  );

  return issues;
}

function getProvenanceMetadataIssues(
  input: SanitizedAdapterDraftInput,
): SanitizedCasePackageAdapterIssueV01[] {
  const issues: SanitizedCasePackageAdapterIssueV01[] = [];
  const provenance = input.provenance;

  requireStringValue(
    provenance.provenance_id,
    "$.provenance.provenance_id",
    issues,
  );
  requireStringValue(
    provenance.source_system,
    "$.provenance.source_system",
    issues,
  );
  requireStringValue(
    provenance.source_artifact,
    "$.provenance.source_artifact",
    issues,
  );
  requireStringValue(
    provenance.generating_tool,
    "$.provenance.generating_tool",
    issues,
  );
  requireStringValue(
    provenance.generated_at,
    "$.provenance.generated_at",
    issues,
  );

  const references = requireArrayValue(
    provenance.references,
    "$.provenance.references",
    issues,
  );
  if (references && references.length === 0) {
    issues.push({
      path: "$.provenance.references",
      message:
        "Provenance references must include at least one safe source reference.",
    });
  }

  return issues;
}

function getSanitizationMetadataIssues(
  input: SanitizedAdapterDraftInput,
): SanitizedCasePackageAdapterIssueV01[] {
  const issues: SanitizedCasePackageAdapterIssueV01[] = [];
  const sanitization = input.sanitization;

  requireStringValue(sanitization.method, "$.sanitization.method", issues);
  requireStringArrayValue(
    sanitization.redaction_notes,
    "$.sanitization.redaction_notes",
    issues,
  );
  requireStringValue(
    sanitization.allowed_display_level,
    "$.sanitization.allowed_display_level",
    issues,
  );
  requireBooleanValue(
    sanitization.raw_drilldown_allowed,
    "$.sanitization.raw_drilldown_allowed",
    issues,
  );
  requireStringValue(
    sanitization.safe_reference_type,
    "$.sanitization.safe_reference_type",
    issues,
  );

  return issues;
}

function getSanitizationStatusIssues(
  input: SanitizedAdapterDraftInput,
): SanitizedCasePackageAdapterIssueV01[] {
  const status = input.sanitization.status;

  if (isCasePackageSanitizationStatus(status)) {
    return [];
  }

  return [
    {
      path: "$.sanitization.status",
      message:
        "Sanitization status must be a CasePackageSanitizationStatusV01 value.",
    },
  ];
}

function getReviewApprovalIssues(
  input: SanitizedAdapterDraftInput,
): SanitizedCasePackageAdapterIssueV01[] {
  if (isExplicitSyntheticPosture(input)) {
    return [];
  }

  const issues: SanitizedCasePackageAdapterIssueV01[] = [];

  if (
    input.sanitization.status === "synthetic" ||
    input.sanitization.status === "unknown"
  ) {
    issues.push({
      path: "$.sanitization.status",
      message:
        "Non-synthetic sanitized adapter drafts require a concrete sanitization status.",
    });
  }

  if (!input.sanitization.review_approval) {
    issues.push({
      path: "$.sanitization.review_approval",
      message:
        "Non-synthetic sanitized adapter drafts require review approval.",
    });
  }

  return issues;
}

function getEmbeddingMapIssues(
  input: SanitizedAdapterDraftInput,
): SanitizedCasePackageAdapterIssueV01[] {
  const embeddingMap = input.cluster.embedding_map;
  const coordinates = embeddingMap?.coordinates;
  const issues: SanitizedCasePackageAdapterIssueV01[] = [];

  if (!embeddingMap) {
    return [
      {
        path: "$.cluster.embedding_map",
        message: "Embedding map metadata is required for adapter drafts.",
      },
    ];
  }

  for (const field of ["map_id", "map_tool", "coordinate_space"] as const) {
    if (
      typeof embeddingMap[field] !== "string" ||
      embeddingMap[field]?.trim() === ""
    ) {
      issues.push({
        path: `$.cluster.embedding_map.${field}`,
        message: "Embedding map metadata must include non-empty map fields.",
      });
    }
  }

  if (
    !coordinates ||
    !Number.isFinite(coordinates.x) ||
    !Number.isFinite(coordinates.y)
  ) {
    issues.push({
      path: "$.cluster.embedding_map.coordinates",
      message: "Embedding map coordinates with numeric x and y are required.",
    });
    return issues;
  }

  if (coordinates.z !== undefined && !Number.isFinite(coordinates.z)) {
    issues.push({
      path: "$.cluster.embedding_map.coordinates.z",
      message: "Embedding map z coordinate must be numeric when present.",
    });
  }

  return issues;
}

function getClaimEvidenceIssues(
  input: SanitizedAdapterDraftInput,
): SanitizedCasePackageAdapterIssueV01[] {
  const claimEvidenceLinksByClaimId = groupClaimEvidenceLinksByClaimId(
    input.claim_evidence_links,
  );

  return input.claims.flatMap((claim, index) => {
    const evidenceStatus = claim.evidence_status ?? "linked";
    const linkedEvidenceIds = claimEvidenceLinksByClaimId.get(claim.claim_id) ?? [];

    if (!CLAIM_EVIDENCE_STATUSES.includes(evidenceStatus)) {
      return [
        {
          path: `$.claims[${index}].evidence_status`,
          message:
            'Claim evidence status must be "linked" or "missing_evidence_declared".',
        },
      ];
    }

    if (evidenceStatus === "linked" && linkedEvidenceIds.length === 0) {
      return [
        {
          path: `$.claims[${index}].claim_evidence_links`,
          message: "Linked claims must have at least one claim-to-evidence link.",
        },
      ];
    }

    if (
      evidenceStatus === "missing_evidence_declared" &&
      linkedEvidenceIds.length > 0
    ) {
      return [
        {
          path: `$.claims[${index}].claim_evidence_links`,
          message:
            "Claims declaring missing evidence must not include claim-to-evidence links.",
        },
      ];
    }

    return [];
  });
}

function getDraftReferenceIssues(
  input: SanitizedAdapterDraftInput,
): SanitizedCasePackageAdapterIssueV01[] {
  const issues: SanitizedCasePackageAdapterIssueV01[] = [];
  const labelIds = collectDraftIds(input.candidate_labels, "label_id");
  const claimIds = collectDraftIds(input.claims, "claim_id");
  const evidenceIds = collectDraftIds(input.evidence_summaries, "evidence_id");
  const sessionIds = collectDraftIds(
    input.representative_sessions,
    "session_id",
  );
  const primaryClusterId = input.cluster.cluster_id;

  forEachDraftObject(
    input.candidate_labels,
    "$.candidate_labels",
    issues,
    (label, path) => {
      validateReferenceArrayValues(
        label.linked_claim_ids,
        `${path}.linked_claim_ids`,
        claimIds,
        "Candidate label references missing claim ID",
        issues,
      );
    },
  );

  forEachDraftObject(input.claims, "$.claims", issues, (claim, path) => {
    validateOptionalReferenceArrayValues(
      claim.linked_label_ids,
      `${path}.linked_label_ids`,
      labelIds,
      "Claim references missing candidate label ID",
      issues,
    );
  });

  forEachDraftObject(
    input.claim_evidence_links,
    "$.claim_evidence_links",
    issues,
    (link, path) => {
      validateReferenceValue(
        link.claim_id,
        claimIds,
        `${path}.claim_id`,
        "Claim-evidence link references missing claim ID",
        issues,
      );
      validateReferenceValue(
        link.evidence_id,
        evidenceIds,
        `${path}.evidence_id`,
        "Claim-evidence link references missing evidence ID",
        issues,
      );
    },
  );

  forEachDraftObject(
    input.evidence_summaries,
    "$.evidence_summaries",
    issues,
    (evidence, path) => {
      validateOptionalReferenceArrayValues(
        evidence.linked_session_ids,
        `${path}.linked_session_ids`,
        sessionIds,
        "Evidence summary references missing representative session ID",
        issues,
      );
    },
  );

  forEachDraftObject(
    input.representative_sessions,
    "$.representative_sessions",
    issues,
    (session, path) => {
      validateOptionalReferenceArrayValues(
        session.linked_evidence_ids,
        `${path}.linked_evidence_ids`,
        evidenceIds,
        "Representative session references missing evidence ID",
        issues,
      );
    },
  );

  forEachDraftObject(
    input.outlier_impostor_candidates,
    "$.outlier_impostor_candidates",
    issues,
    (candidate, path) => {
      validateOptionalReferenceValue(
        candidate.session_id,
        sessionIds,
        `${path}.session_id`,
        "Outlier/impostor candidate references missing representative session ID",
        issues,
      );
      validateOptionalReferenceValue(
        candidate.evidence_id,
        evidenceIds,
        `${path}.evidence_id`,
        "Outlier/impostor candidate references missing evidence ID",
        issues,
      );
    },
  );

  forEachDraftObject(
    input.neighbor_clusters,
    "$.neighbor_clusters",
    issues,
    (neighbor, path) => {
      if (
        typeof neighbor.neighbor_cluster_id === "string" &&
        neighbor.neighbor_cluster_id === primaryClusterId
      ) {
        issues.push({
          path: `${path}.neighbor_cluster_id`,
          message:
            "Neighbor cluster must not reference the package's primary cluster ID.",
        });
      }
    },
  );

  return issues;
}

function groupClaimEvidenceLinksByClaimId(
  links: SanitizedAdapterDraftInput["claim_evidence_links"],
): Map<string, string[]> {
  return links.reduce((linksByClaimId, link) => {
    return new Map(linksByClaimId).set(link.claim_id, [
      ...(linksByClaimId.get(link.claim_id) ?? []),
      link.evidence_id,
    ]);
  }, new Map<string, string[]>());
}

function isExplicitSyntheticPosture(input: SanitizedAdapterDraftInput): boolean {
  return (
    input.case.reviewable_status === "synthetic_demo" &&
    input.dataset.data_classification === "synthetic" &&
    input.sanitization.status === "synthetic"
  );
}

function isCasePackageSanitizationStatus(
  status: unknown,
): status is CasePackageSanitizationStatusV01 {
  return CASE_PACKAGE_SANITIZATION_STATUSES.includes(
    status as CasePackageSanitizationStatusV01,
  );
}
