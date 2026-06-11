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

export type Cluster = {
  id: string;
  name: string;
  description?: string;
  source: ClusterSource;
  size?: number;
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
  topicLabel: TopicLabel;
  claims: Claim[];
  evidenceItems: EvidenceItem[];
  evidenceRelations: EvidenceRelation[];
  supportScores: SupportScore[];
  analystVerdict?: AnalystVerdict;
};

export type Case = CaseFile;
export type ReviewDecision = AnalystDecision;
