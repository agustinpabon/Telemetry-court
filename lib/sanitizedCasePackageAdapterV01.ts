import {
  CASE_PACKAGE_V01_EVIDENCE_RATINGS,
  CASE_PACKAGE_V01_RECOMMENDED_ACTIONS,
  CASE_PACKAGE_V01_REQUIRED_REVIEWER_ACTIONS,
  CASE_PACKAGE_V01_REQUIRED_REVIEW_STAGES,
  CASE_PACKAGE_V01_SCHEMA_VERSION,
  CASE_PACKAGE_V01_VERDICTS,
  type CasePackageAiClaimV01,
  type CasePackageCandidateLabelV01,
  type CasePackageClusterId,
  type CasePackageClusterMetadataV01,
  type CasePackageDatasetMetadataV01,
  type CasePackageEvidenceItemV01,
  type CasePackageEvidenceToClaimMappingV01,
  type CasePackageMetricsV01,
  type CasePackageOutlierImpostorCandidateV01,
  type CasePackagePipelineMetadataV01,
  type CasePackageProvenanceMetadataV01,
  type CasePackageRepresentativeSessionV01,
  type CasePackageReviewConfigurationV01,
  type CasePackageSanitizationMetadataV01,
  type CasePackageSanitizationStatusV01,
  type CasePackageV01,
} from "@/lib/types";
import { getSanitizedAdapterDraftPreflightIssues } from "@/lib/sanitizedCasePackageAdapterV01Preflight";

export type SanitizedCasePackageAdapterIssueV01 = {
  path: string;
  message: string;
};

export class SanitizedCasePackageAdapterV01Error extends Error {
  readonly issues: SanitizedCasePackageAdapterIssueV01[];

  constructor(issues: SanitizedCasePackageAdapterIssueV01[]) {
    super(formatAdapterErrorMessage(issues));
    this.name = "SanitizedCasePackageAdapterV01Error";
    this.issues = issues;
    Object.setPrototypeOf(this, SanitizedCasePackageAdapterV01Error.prototype);
  }
}

export type SanitizedCasePackageAdapterEmbeddingMapV01 = {
  map_id?: string;
  map_tool?: string;
  coordinate_space?: string;
  coordinates?: {
    x?: number;
    y?: number;
    z?: number;
  };
};

export type SanitizedCasePackageAdapterClusterDraftV01 = Omit<
  CasePackageClusterMetadataV01,
  "embedding_map"
> & {
  embedding_map: SanitizedCasePackageAdapterEmbeddingMapV01;
};

export type SanitizedCasePackageAdapterClaimDraftV01 = Omit<
  CasePackageAiClaimV01,
  "linked_evidence_ids"
>;

export type SanitizedCasePackageAdapterEvidenceSummaryV01 = Omit<
  CasePackageEvidenceItemV01,
  "linked_claim_ids" | "provenance_reference" | "sanitization_status"
> & {
  sanitization_status?: CasePackageSanitizationStatusV01;
};

export type SanitizedCasePackageAdapterRepresentativeSessionDraftV01 = Omit<
  CasePackageRepresentativeSessionV01,
  "cluster_membership"
> & {
  cluster_membership?: Omit<
    CasePackageRepresentativeSessionV01["cluster_membership"],
    "cluster_id"
  > & {
    cluster_id?: CasePackageClusterId;
  };
};

export type SanitizedCasePackageAdapterDraftV01 = {
  package_id: CasePackageV01["package_id"];
  created_at: CasePackageV01["created_at"];
  package_revision?: CasePackageV01["package_revision"];
  case: CasePackageV01["case"];
  dataset: CasePackageDatasetMetadataV01;
  cluster: SanitizedCasePackageAdapterClusterDraftV01;
  pipeline: CasePackagePipelineMetadataV01;
  candidate_labels: CasePackageCandidateLabelV01[];
  claims: SanitizedCasePackageAdapterClaimDraftV01[];
  evidence_summaries: SanitizedCasePackageAdapterEvidenceSummaryV01[];
  claim_evidence_links: CasePackageEvidenceToClaimMappingV01[];
  representative_sessions: SanitizedCasePackageAdapterRepresentativeSessionDraftV01[];
  outlier_impostor_candidates: CasePackageOutlierImpostorCandidateV01[];
  neighbor_clusters: CasePackageV01["neighbor_clusters"];
  metrics?: CasePackageMetricsV01;
  provenance: CasePackageProvenanceMetadataV01;
  sanitization: CasePackageSanitizationMetadataV01;
  review_configuration?: Partial<CasePackageReviewConfigurationV01>;
};

export type SanitizedAdapterDraftInput = SanitizedCasePackageAdapterDraftV01;

export function buildCasePackageV01FromSanitizedAdapterDraft(
  input: SanitizedAdapterDraftInput,
): CasePackageV01 {
  const issues = getSanitizedAdapterDraftPreflightIssues(input);

  if (issues.length > 0) {
    throw new SanitizedCasePackageAdapterV01Error(issues);
  }

  const claimEvidenceLinksByClaimId = groupClaimEvidenceLinksByClaimId(
    input.claim_evidence_links,
  );
  const claimIdsByEvidenceId = groupClaimIdsByEvidenceId(
    input.claim_evidence_links,
  );

  return {
    schema_version: CASE_PACKAGE_V01_SCHEMA_VERSION,
    package_id: input.package_id,
    created_at: input.created_at,
    ...(input.package_revision
      ? { package_revision: input.package_revision }
      : {}),
    case: cloneValue(input.case),
    dataset: cloneValue(input.dataset),
    cluster: mapCluster(input.cluster),
    pipeline: cloneValue(input.pipeline),
    candidate_labels: input.candidate_labels.map((label) => cloneValue(label)),
    claims: input.claims.map((claim) =>
      mapClaim(claim, claimEvidenceLinksByClaimId),
    ),
    evidence_items: input.evidence_summaries.map((evidence) =>
      mapEvidenceSummary(evidence, input, claimIdsByEvidenceId),
    ),
    evidence_to_claim_mappings: input.claim_evidence_links.map((link) =>
      cloneValue(link),
    ),
    representative_sessions: input.representative_sessions.map((session) =>
      mapRepresentativeSession(session, input.cluster.cluster_id),
    ),
    outlier_impostor_candidates: input.outlier_impostor_candidates.map(
      (candidate) => cloneValue(candidate),
    ),
    neighbor_clusters: input.neighbor_clusters.map((neighbor) =>
      cloneValue(neighbor),
    ),
    metrics: cloneValue(input.metrics ?? {}),
    provenance: cloneValue(input.provenance),
    sanitization: cloneValue(input.sanitization),
    review_configuration: buildReviewConfiguration(input),
  };
}

function mapCluster(
  cluster: SanitizedCasePackageAdapterClusterDraftV01,
): CasePackageV01["cluster"] {
  const coordinates = cluster.embedding_map.coordinates;

  return {
    ...cloneValue(cluster),
    embedding_map: {
      map_id: cluster.embedding_map.map_id,
      map_tool: cluster.embedding_map.map_tool,
      coordinate_space: cluster.embedding_map.coordinate_space,
      coordinates: {
        x: coordinates?.x as number,
        y: coordinates?.y as number,
        ...(coordinates?.z === undefined ? {} : { z: coordinates.z }),
      },
    },
  };
}

function mapClaim(
  claim: SanitizedCasePackageAdapterClaimDraftV01,
  claimEvidenceLinksByClaimId: Map<string, string[]>,
): CasePackageV01["claims"][number] {
  const linkedEvidenceIds = uniqueStrings(
    claimEvidenceLinksByClaimId.get(claim.claim_id) ?? [],
  );

  return {
    ...cloneValue(claim),
    linked_evidence_ids: linkedEvidenceIds,
    evidence_status:
      claim.evidence_status ??
      (linkedEvidenceIds.length > 0 ? "linked" : "missing_evidence_declared"),
  };
}

function mapEvidenceSummary(
  evidence: SanitizedCasePackageAdapterEvidenceSummaryV01,
  input: SanitizedAdapterDraftInput,
  claimIdsByEvidenceId: Map<string, string[]>,
): CasePackageV01["evidence_items"][number] {
  return {
    ...cloneValue(evidence),
    provenance_reference: input.provenance.provenance_id,
    sanitization_status: evidence.sanitization_status ?? input.sanitization.status,
    linked_claim_ids: uniqueStrings(
      claimIdsByEvidenceId.get(evidence.evidence_id) ?? [],
    ),
  };
}

function mapRepresentativeSession(
  session: SanitizedCasePackageAdapterRepresentativeSessionDraftV01,
  clusterId: CasePackageClusterId,
): CasePackageRepresentativeSessionV01 {
  return {
    ...cloneValue(session),
    cluster_membership: {
      ...cloneValue(session.cluster_membership ?? {}),
      cluster_id: clusterId,
    },
  };
}

function buildReviewConfiguration(
  input: SanitizedAdapterDraftInput,
): CasePackageReviewConfigurationV01 {
  const hiddenLabelIds =
    input.review_configuration?.initially_hidden_label_ids ??
    input.candidate_labels
      .filter((label) => label.source === "ai_generated")
      .map((label) => label.label_id);

  return {
    blind_review_enabled:
      input.review_configuration?.blind_review_enabled ?? true,
    initially_hidden_label_ids: [...hiddenLabelIds],
    ...(input.review_configuration?.initially_revealed_label_ids
      ? {
          initially_revealed_label_ids: [
            ...input.review_configuration.initially_revealed_label_ids,
          ],
        }
      : {}),
    required_review_stages: [
      ...(input.review_configuration?.required_review_stages ??
        CASE_PACKAGE_V01_REQUIRED_REVIEW_STAGES),
    ],
    allowed_evidence_ratings: [
      ...(input.review_configuration?.allowed_evidence_ratings ??
        CASE_PACKAGE_V01_EVIDENCE_RATINGS),
    ],
    allowed_verdicts: [
      ...(input.review_configuration?.allowed_verdicts ??
        CASE_PACKAGE_V01_VERDICTS),
    ],
    allowed_recommended_actions: [
      ...(input.review_configuration?.allowed_recommended_actions ??
        CASE_PACKAGE_V01_RECOMMENDED_ACTIONS),
    ],
    required_reviewer_actions: [
      ...(input.review_configuration?.required_reviewer_actions ??
        CASE_PACKAGE_V01_REQUIRED_REVIEWER_ACTIONS),
    ],
  };
}

function groupClaimEvidenceLinksByClaimId(
  links: CasePackageEvidenceToClaimMappingV01[],
): Map<string, string[]> {
  return links.reduce((linksByClaimId, link) => {
    return new Map(linksByClaimId).set(link.claim_id, [
      ...(linksByClaimId.get(link.claim_id) ?? []),
      link.evidence_id,
    ]);
  }, new Map<string, string[]>());
}

function groupClaimIdsByEvidenceId(
  links: CasePackageEvidenceToClaimMappingV01[],
): Map<string, string[]> {
  return links.reduce((claimIdsByEvidenceId, link) => {
    return new Map(claimIdsByEvidenceId).set(link.evidence_id, [
      ...(claimIdsByEvidenceId.get(link.evidence_id) ?? []),
      link.claim_id,
    ]);
  }, new Map<string, string[]>());
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values)];
}

function cloneValue<T>(value: T): T {
  return structuredClone(value);
}

function formatAdapterErrorMessage(
  issues: SanitizedCasePackageAdapterIssueV01[],
): string {
  const suffix = issues
    .map((issue) => `${issue.path}: ${issue.message}`)
    .join("; ");

  return `Invalid sanitized CasePackage adapter draft: ${suffix}`;
}
