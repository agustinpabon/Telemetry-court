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

export type EvidenceItem = {
  id: string;
  clusterId: string;
  title: string;
  summary: string;
  sourceType: EvidenceSourceType;
  rawReference?: string;
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
  nearestNeighbor: {
    clusterId: string;
    label: string;
    distance: number;
    note: string;
  };
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
