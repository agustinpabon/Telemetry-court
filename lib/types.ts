export type SupportStatus =
  | "supported"
  | "weakly_supported"
  | "contradicted"
  | "unsupported"
  | "insufficient_evidence";

export type EvidenceStrength = "strong" | "moderate" | "weak";

export type EvidencePolarity = "supports" | "contradicts" | "neutral";

export type EvidenceSourceType =
  | "telemetry_event"
  | "session_feature"
  | "exemplar"
  | "keyphrase"
  | "metadata"
  | "analyst_note";

export type AnalystDecision =
  | "accept"
  | "revise"
  | "reject"
  | "needs_more_review";

export type ClusterSource = "sample" | "toponymy" | "manual" | "other";

export type ReviewStatus =
  | "unreviewed"
  | "in_review"
  | "needs_split"
  | "needs_evidence"
  | "reviewed";

export type EvidenceRating =
  | "supports_label"
  | "weak_support"
  | "irrelevant_noise"
  | "contradicts_label"
  | "needs_context";

export type CandidateLabelSource =
  | "baseline_ai"
  | "evidence_constrained_ai"
  | "human_style"
  | "uncertain_label";

export type DuelReason =
  | "better_supported"
  | "less_overclaimed"
  | "more_specific"
  | "too_broad"
  | "missing_evidence"
  | "missing_malicious_intent"
  | "missing_downstream_abuse"
  | "preserves_uncertainty"
  | "cluster_seems_mixed";

export type FinalVerdict =
  | "supported"
  | "partially_supported"
  | "unsupported_overclaimed"
  | "uncertain"
  | "cluster_impure"
  | "needs_split"
  | "needs_merge"
  | "needs_better_evidence";

export const SPLIT_RECOMMENDATION_REASONS = [
  "mixed_behaviors",
  "boundary_sessions",
  "conflicting_evidence",
  "low_coherence",
] as const;

export const MERGE_RECOMMENDATION_REASONS = [
  "shared_behavior",
  "ambiguous_boundary",
  "neighbor_evidence_overlap",
] as const;

export type SplitRecommendationReason =
  (typeof SPLIT_RECOMMENDATION_REASONS)[number];

export type MergeRecommendationReason =
  (typeof MERGE_RECOMMENDATION_REASONS)[number];

export type LandscapeStatus =
  | "supported"
  | "overclaimed"
  | "impure"
  | "too_broad"
  | "uncertain";

export type Cluster = {
  id: string;
  name: string;
  description?: string;
  source: ClusterSource;
  size?: number;
};

export type NearestNeighbor = {
  clusterId: string;
  label: string;
  distance: number;
  note: string;
};

export type LandscapeContextNode = {
  id: string;
  nodeType: "context";
  label: string;
  cluster: Cluster;
  landscapeStatus: LandscapeStatus;
  modelAgreement: number;
  evidenceStrength: number;
  uncertainty: number;
  mapPosition: {
    x: number;
    y: number;
  };
  nearestNeighbor: NearestNeighbor;
};

export type LandscapeNode = CaseFile | LandscapeContextNode;

export type BlindInterpretationOption = {
  id: string;
  label: string;
  helper: string;
};

export type CandidateLabel = {
  id: string;
  source: CandidateLabelSource;
  label: string;
  rationale: string;
  supportEstimate: number;
};

export type RepresentativeSession = {
  id: string;
  title: string;
  principal: string;
  timestamp: string;
  featureOverlap: number;
  outlierScore: number;
  summary: string;
  isOutlierImpostorCandidate?: boolean;
  outlierReason?: string;
};

export type TopicLabel = {
  id: string;
  clusterId: string;
  name: string;
  explanation: string;
  generatedBy: string;
  generatedAt: string;
};

export type Claim = {
  id: string;
  clusterId: string;
  topicLabelId: string;
  text: string;
  status: SupportStatus;
  supportScore: number;
  rationale: string;
};

export type EvidenceHighlightReason =
  | "supports"
  | "weak_support"
  | "contradicts"
  | "context"
  | "needs_more_context";

export type EvidenceHighlight = {
  field: string;
  label?: string;
  value?: string | number | boolean;
  reason?: EvidenceHighlightReason;
  claimIds?: string[];
};

export type EvidenceItem = {
  id: string;
  clusterId: string;
  title: string;
  summary: string;
  sourceType: EvidenceSourceType;
  rawReference?: string;
  highlights?: EvidenceHighlight[];
};

export type EvidenceRelation = {
  claimId: string;
  evidenceId: string;
  polarity: EvidencePolarity;
  strength: EvidenceStrength;
  explanation: string;
};

export type SupportScore = {
  claimId: string;
  value: number;
  status: SupportStatus;
  rationale: string;
};

export type AnalystVerdict = {
  decision: AnalystDecision;
  summary: string;
  reviewer?: string;
  reviewedAt?: string;
};

export type CaseFile = {
  id: string;
  casePackageReference?: CasePackageReferenceV01;
  cluster: Cluster;
  dataset: string;
  reviewStatus: ReviewStatus;
  landscapeStatus: LandscapeStatus;
  modelAgreement: number;
  evidenceStrength: number;
  uncertainty: number;
  mapPosition: {
    x: number;
    y: number;
  };
  topFeatures: string[];
  riskFlags: string[];
  nearestNeighbor: NearestNeighbor;
  neighborClusters?: NearestNeighbor[];
  blindInterpretationOptions: BlindInterpretationOption[];
  candidateLabels: CandidateLabel[];
  seededBestLabelId: string;
  seededImpostorSessionId: string;
  representativeSessions: RepresentativeSession[];
  failureModes: DuelReason[];
  defaultEvidenceRatings: Record<string, EvidenceRating>;
  topicLabel: TopicLabel;
  claims: Claim[];
  evidenceItems: EvidenceItem[];
  evidenceRelations: EvidenceRelation[];
  supportScores: SupportScore[];
  analystVerdict?: AnalystVerdict;
};

export type Case = CaseFile;
export type ReviewDecision = AnalystDecision;

export const CASE_PACKAGE_V01_SCHEMA_VERSION = "case_package.v0.1" as const;

export const CASE_PACKAGE_V01_EVIDENCE_RATINGS = [
  "supports",
  "weak_support",
  "irrelevant",
  "contradicts",
  "insufficient",
  "needs_more_context",
] as const;

export const CASE_PACKAGE_V01_VERDICTS = [
  "supported",
  "partially_supported",
  "unsupported_or_overclaimed",
  "uncertain",
  "cluster_impure",
  "needs_split",
  "needs_merge",
  "needs_better_evidence",
] as const;

export const CASE_PACKAGE_V01_RECOMMENDED_ACTIONS = [
  "accept_label",
  "rename_label",
  "broaden_label",
  "narrow_label",
  "split_cluster",
  "merge_cluster",
  "collect_more_evidence",
  "rerun_prompt",
  "rerun_embedding",
  "mark_uncertain",
] as const;

export const CASE_PACKAGE_V01_REQUIRED_REVIEW_STAGES = [
  "landscape",
  "case_file",
  "blind_review",
  "ai_reveal",
  "evidence_classification",
  "label_comparison",
  "outlier_impostor_review",
  "structured_verdict",
] as const;

export const CASE_PACKAGE_V01_REQUIRED_REVIEWER_ACTIONS = [
  "choose_blind_interpretation",
  "reveal_ai_label",
  "rate_linked_evidence",
  "choose_label_winner",
  "choose_outlier_or_impostor",
  "choose_final_verdict",
  "choose_recommended_action",
] as const;

export type CasePackageV01SchemaVersion =
  typeof CASE_PACKAGE_V01_SCHEMA_VERSION;
export type CasePackageEvidenceRatingV01 =
  (typeof CASE_PACKAGE_V01_EVIDENCE_RATINGS)[number];
export type CasePackageVerdictV01 =
  (typeof CASE_PACKAGE_V01_VERDICTS)[number];
export type CasePackageRecommendedActionV01 =
  (typeof CASE_PACKAGE_V01_RECOMMENDED_ACTIONS)[number];
export type CasePackageRequiredReviewStageV01 =
  (typeof CASE_PACKAGE_V01_REQUIRED_REVIEW_STAGES)[number];
export type CasePackageRequiredReviewerActionV01 =
  (typeof CASE_PACKAGE_V01_REQUIRED_REVIEWER_ACTIONS)[number];

export type CasePackageJsonValue =
  | string
  | number
  | boolean
  | null
  | CasePackageJsonValue[]
  | { [key: string]: CasePackageJsonValue };

export type CasePackageIsoTimestamp = string;
export type CasePackageId = string;
export type CasePackageCaseId = string;
export type CasePackageDatasetId = string;
export type CasePackageClusterId = string;
export type CasePackagePipelineId = string;
export type CasePackageRunId = string;
export type CasePackageLabelId = string;
export type CasePackageClaimId = string;
export type CasePackageEvidenceId = string;
export type CasePackageSessionId = string;

export type CasePackageReviewableStatusV01 =
  | "reviewable"
  | "needs_more_evidence"
  | "blocked"
  | "synthetic_demo";

export type CasePackageReviewIntentV01 =
  | "validate_label"
  | "compare_labels"
  | "assess_cluster_purity"
  | "assess_evidence_quality"
  | "research_benchmark";

export type CasePackageDatasetTypeV01 =
  | "cloudtrail"
  | "endpoint"
  | "identity"
  | "network"
  | "application"
  | "mixed"
  | "synthetic"
  | "other";

export type CasePackageDataClassificationV01 =
  | "public"
  | "synthetic"
  | "sanitized"
  | "restricted_derived"
  | "internal"
  | "confidential";

export type CasePackageCandidateLabelSourceV01 =
  | "ai_generated"
  | "human_baseline"
  | "alternative_model"
  | "prompt_variant"
  | "synthetic_fixture";

export type CasePackageClaimTypeV01 =
  | "behavioral_summary"
  | "intent"
  | "risk"
  | "cluster_quality"
  | "temporal_pattern"
  | "tool_or_technique"
  | "negative_evidence"
  | "other";

export type CasePackageEvidenceTypeV01 =
  | "salient_feature"
  | "representative_session"
  | "event_summary"
  | "sequence_summary"
  | "metric_card"
  | "neighbor_comparison"
  | "outlier_impostor_evidence"
  | "analyst_note"
  | "safe_drilldown_reference"
  | "derived_table"
  | "aggregate_statistic";

export type CasePackageEvidenceRelationshipV01 =
  | "supports"
  | "weak_support"
  | "contradicts"
  | "context"
  | "irrelevant"
  | "insufficient"
  | "missing_evidence";

export type CasePackageEvidenceHighlightReasonV01 = EvidenceHighlightReason;

export type CasePackageSessionFlagV01 =
  | "representative"
  | "borderline"
  | "outlier_candidate"
  | "impostor_candidate"
  | "neighbor_like"
  | "needs_context";

export type CasePackageExpectedReviewUseV01 =
  | "outlier_check"
  | "impostor_check"
  | "cluster_purity_check"
  | "label_support_check"
  | "evidence_sufficiency_check";

export type CasePackageSanitizationStatusV01 =
  | "synthetic"
  | "sanitized"
  | "deidentified"
  | "redacted"
  | "aggregate_only"
  | "approved_internal"
  | "unknown";

export type CasePackageAllowedDisplayLevelV01 =
  | "summary_only"
  | "sanitized_excerpt"
  | "derived_features"
  | "aggregate_metrics"
  | "approved_internal_reference";

export type CasePackageSafeReferenceTypeV01 =
  | "none"
  | "synthetic_fixture_path"
  | "sanitized_file"
  | "notebook_cell"
  | "dashboard_link"
  | "source_artifact_id"
  | "internal_runbook";

export type CasePackageMetricV01 =
  | {
      status: "available";
      value: number;
      min: 0;
      max: 1;
      interpretation?: "higher_is_better" | "lower_is_better" | "contextual";
      method?: string;
      notes?: string;
    }
  | {
      status: "unavailable";
      reason: string;
    };

export type CasePackageSafeReferenceV01 = {
  reference_id: string;
  reference_type: CasePackageSafeReferenceTypeV01;
  label?: string;
  uri?: string;
  artifact_id?: string;
  notes?: string;
};

export type CasePackageCaseMetadataV01 = {
  case_id: CasePackageCaseId;
  title: string;
  summary: string;
  description?: string;
  reviewable_status: CasePackageReviewableStatusV01;
  review_intent: CasePackageReviewIntentV01;
  limitations?: string[];
};

export type CasePackageDatasetMetadataV01 = {
  dataset_id: CasePackageDatasetId;
  dataset_name: string;
  dataset_type: CasePackageDatasetTypeV01;
  data_classification: CasePackageDataClassificationV01;
  source_environment: string;
  approved_use: string;
  approval_notes?: string;
  limitations: string[];
};

export type CasePackageClusterMethodMetadataV01 = {
  method: string;
  method_version?: string;
  distance_metric?: string;
  parameters?: { [key: string]: CasePackageJsonValue };
};

export type CasePackageEmbeddingMapV01 = {
  map_id?: string;
  map_tool?: string;
  coordinate_space?: string;
  coordinates?: {
    x: number;
    y: number;
    z?: number;
  };
};

export type CasePackageTimeRangeV01 = {
  start_at?: CasePackageIsoTimestamp;
  end_at?: CasePackageIsoTimestamp;
  timezone?: string;
};

export type CasePackageClusterMetadataV01 = {
  cluster_id: CasePackageClusterId;
  cluster_name?: string;
  upstream_cluster_label?: string;
  cluster_size: number;
  embedding_map?: CasePackageEmbeddingMapV01;
  parent_cluster_id?: CasePackageClusterId;
  child_cluster_ids?: CasePackageClusterId[];
  time_range?: CasePackageTimeRangeV01;
  cluster_method: CasePackageClusterMethodMetadataV01;
};

export type CasePackagePromptMetadataV01 = {
  prompt_id?: string;
  prompt_name?: string;
  prompt_version?: string;
  prompt_digest?: string;
  prompt_summary?: string;
};

export type CasePackagePipelineMetadataV01 = {
  pipeline_id?: CasePackagePipelineId;
  run_id: CasePackageRunId;
  upstream_tool: string;
  pipeline_version?: string;
  embedding_model?: string;
  clustering_method?: string;
  dimensionality_reduction_method?: string;
  naming_model?: string;
  prompt?: CasePackagePromptMetadataV01;
  generated_at: CasePackageIsoTimestamp;
  parameters?: { [key: string]: CasePackageJsonValue };
  config_summary?: string;
};

export type CasePackagePipelineReferenceV01 = {
  pipeline_id?: CasePackagePipelineId;
  run_id: CasePackageRunId;
  upstream_tool: string;
  pipeline_version?: string;
  embedding_model?: string;
  clustering_method?: string;
  dimensionality_reduction_method?: string;
  naming_model?: string;
  prompt_id?: string;
  prompt_version?: string;
  prompt_digest?: string;
  generated_at: CasePackageIsoTimestamp;
};

export type CasePackageReferenceV01 = {
  schema_version: CasePackageV01SchemaVersion;
  package_id: CasePackageId;
  package_revision?: string;
  case_id: CasePackageCaseId;
  cluster_id: CasePackageClusterId;
  pipeline: CasePackagePipelineReferenceV01;
  blind_review_enabled: boolean;
};

export type CasePackageCandidateLabelV01 = {
  label_id: CasePackageLabelId;
  label: string;
  source: CasePackageCandidateLabelSourceV01;
  model_reference?: string;
  prompt_reference?: string;
  run_id?: CasePackageRunId;
  confidence?: CasePackageMetricV01;
  rank?: number;
  linked_claim_ids: CasePackageClaimId[];
  rationale?: string;
};

export type CasePackageAiClaimV01 = {
  claim_id: CasePackageClaimId;
  text: string;
  claim_type: CasePackageClaimTypeV01;
  linked_evidence_ids: CasePackageEvidenceId[];
  linked_label_ids?: CasePackageLabelId[];
  strength?: CasePackageMetricV01;
  confidence?: CasePackageMetricV01;
  caveats?: string[];
  assumptions?: string[];
  evidence_status?: "linked" | "missing_evidence_declared";
};

export type CasePackageEvidenceContentV01 =
  | {
      content_type: "text";
      text: string;
    }
  | {
      content_type: "structured_summary";
      fields: { [key: string]: CasePackageJsonValue };
    }
  | {
      content_type: "metric_summary";
      metrics: { [key: string]: CasePackageMetricV01 };
    };

export type CasePackageSourceReferenceV01 = {
  source_id: string;
  source_type: string;
  safe_reference?: CasePackageSafeReferenceV01;
  notes?: string;
};

export type CasePackageEvidenceHighlightV01 = {
  field: string;
  label?: string;
  value?: string | number | boolean;
  reason?: CasePackageEvidenceHighlightReasonV01;
  claim_ids?: CasePackageClaimId[];
};

export type CasePackageEvidenceItemV01 = {
  evidence_id: CasePackageEvidenceId;
  title: string;
  summary: string;
  evidence_type: CasePackageEvidenceTypeV01;
  content: CasePackageEvidenceContentV01;
  source_reference: CasePackageSourceReferenceV01;
  provenance_reference: string;
  sanitization_status: CasePackageSanitizationStatusV01;
  linked_session_ids?: CasePackageSessionId[];
  linked_claim_ids?: CasePackageClaimId[];
  weight?: CasePackageMetricV01;
  salience?: CasePackageMetricV01;
  highlights?: CasePackageEvidenceHighlightV01[];
};

export type CasePackageEvidenceToClaimMappingV01 = {
  claim_id: CasePackageClaimId;
  evidence_id: CasePackageEvidenceId;
  relationship: CasePackageEvidenceRelationshipV01;
  expected_support?: CasePackageEvidenceRelationshipV01;
  rationale?: string;
};

export type CasePackageRepresentativeSessionV01 = {
  session_id: CasePackageSessionId;
  title: string;
  summary: string;
  feature_highlights: string[];
  safe_reference?: CasePackageSafeReferenceV01;
  cluster_membership: {
    cluster_id: CasePackageClusterId;
    membership_score?: CasePackageMetricV01;
    distance_to_centroid?: CasePackageMetricV01;
  };
  flags: CasePackageSessionFlagV01[];
  linked_evidence_ids?: CasePackageEvidenceId[];
};

export type CasePackageOutlierImpostorCandidateV01 = {
  candidate_id: string;
  session_id?: CasePackageSessionId;
  evidence_id?: CasePackageEvidenceId;
  reason: string;
  score?: CasePackageMetricV01;
  expected_review_use: CasePackageExpectedReviewUseV01;
};

export type CasePackageNeighborClusterV01 = {
  neighbor_cluster_id: CasePackageClusterId;
  label?: string;
  name?: string;
  distance?: CasePackageMetricV01;
  similarity?: CasePackageMetricV01;
  reason_this_neighbor_matters: string;
  confusion_risk?: CasePackageMetricV01;
};

export type CasePackageMetricsV01 = {
  cluster_coherence?: CasePackageMetricV01;
  feature_distinctiveness?: CasePackageMetricV01;
  evidence_coverage?: CasePackageMetricV01;
  model_agreement?: CasePackageMetricV01;
  uncertainty?: CasePackageMetricV01;
  outlier_score?: CasePackageMetricV01;
  temporal_stability?: CasePackageMetricV01;
};

export type CasePackageProvenanceMetadataV01 = {
  provenance_id: string;
  source_system: string;
  source_artifact: string;
  generating_tool: string;
  generated_at: CasePackageIsoTimestamp;
  upstream_run_id?: CasePackageRunId;
  adapter_name?: string;
  adapter_version?: string;
  references: CasePackageSafeReferenceV01[];
  owner?: {
    name?: string;
    team?: string;
    contact?: string;
  };
};

export type CasePackageReviewApprovalMetadataV01 = {
  status: "approved";
  approved_by: string;
  approved_at: CasePackageIsoTimestamp;
  scope: string;
  reference: CasePackageSafeReferenceV01;
};

export type CasePackageSanitizationMetadataV01 = {
  status: CasePackageSanitizationStatusV01;
  method: string;
  redaction_notes: string[];
  allowed_display_level: CasePackageAllowedDisplayLevelV01;
  raw_drilldown_allowed: boolean;
  safe_reference_type: CasePackageSafeReferenceTypeV01;
  review_approval?: CasePackageReviewApprovalMetadataV01;
  notes?: string;
};

export type CasePackageReviewConfigurationV01 = {
  blind_review_enabled: boolean;
  initially_hidden_label_ids: CasePackageLabelId[];
  initially_revealed_label_ids?: CasePackageLabelId[];
  required_review_stages: CasePackageRequiredReviewStageV01[];
  allowed_evidence_ratings: CasePackageEvidenceRatingV01[];
  allowed_verdicts: CasePackageVerdictV01[];
  allowed_recommended_actions: CasePackageRecommendedActionV01[];
  required_reviewer_actions: CasePackageRequiredReviewerActionV01[];
};

export type CasePackageV01 = {
  schema_version: CasePackageV01SchemaVersion;
  package_id: CasePackageId;
  created_at: CasePackageIsoTimestamp;
  package_revision?: string;
  case: CasePackageCaseMetadataV01;
  dataset: CasePackageDatasetMetadataV01;
  cluster: CasePackageClusterMetadataV01;
  pipeline: CasePackagePipelineMetadataV01;
  candidate_labels: CasePackageCandidateLabelV01[];
  claims: CasePackageAiClaimV01[];
  evidence_items: CasePackageEvidenceItemV01[];
  evidence_to_claim_mappings: CasePackageEvidenceToClaimMappingV01[];
  representative_sessions: CasePackageRepresentativeSessionV01[];
  outlier_impostor_candidates: CasePackageOutlierImpostorCandidateV01[];
  neighbor_clusters: CasePackageNeighborClusterV01[];
  metrics: CasePackageMetricsV01;
  provenance: CasePackageProvenanceMetadataV01;
  sanitization: CasePackageSanitizationMetadataV01;
  review_configuration: CasePackageReviewConfigurationV01;
};
