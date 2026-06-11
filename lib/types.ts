export type Verdict = "supported" | "uncertain" | "unsupported";
export type ReviewDecision = "accept" | "revise" | "reject";
export type ClaimStatus = "supported" | "weak" | "contradicted";
export type EvidenceStrength = "strong" | "moderate" | "weak";

export type EvidenceKind = "feature" | "exemplar" | "metadata" | "contradiction";

export type EvidenceRelevance = "high" | "medium" | "low";

export type EvidenceStance = "supports" | "partial" | "contradicts";

export type EvidenceItem = {
  id: string;
  kind: EvidenceKind;
  title: string;
  summary: string;
  relevance: EvidenceRelevance;
  strength: EvidenceStrength;
  stance: EvidenceStance;
  linkedClaimIds: string[];
};

export type InterpretationRisk = {
  id: string;
  title: string;
  detail: string;
};

export type GeneratedInterpretation = {
  title: string;
  description: string;
  modelName: string;
  generatedAt: string;
  promptVersion: string;
};

export type ValidationClaim = {
  id: string;
  text: string;
  status: ClaimStatus;
  evidenceIds: string[];
  rationale: string;
};

export type Cluster = {
  id: string;
  size: number;
  density: string;
  timeWindow: string;
  embeddingSource: string;
  topFeatures: string[];
  representativeExamples: string[];
};

export type Validation = {
  verdict: Verdict;
  confidenceScore: number;
  supportedClaims: ValidationClaim[];
  weakClaims: ValidationClaim[];
  contradictedClaims: ValidationClaim[];
  summary: string;
};

export type Case = {
  id: string;
  generatedInterpretation: GeneratedInterpretation;
  cluster: Cluster;
  evidence: EvidenceItem[];
  interpretationRisks: InterpretationRisk[];
  validation: Validation;
};
