# Data Model

This document defines the conceptual MVP domain model. Existing application types can evolve toward this model incrementally.

## TypeScript-Like Pseudocode

```ts
type SupportStatus =
  | "supported"
  | "weakly_supported"
  | "contradicted"
  | "unsupported"
  | "insufficient_evidence";

type EvidenceStrength =
  | "strong"
  | "moderate"
  | "weak";

type EvidencePolarity =
  | "supports"
  | "contradicts"
  | "neutral";

type AnalystDecision =
  | "accept"
  | "revise"
  | "reject"
  | "needs_more_review";

interface Cluster {
  id: string;
  name: string;
  description?: string;
  source: "sample" | "toponymy" | "manual" | "other";
  size?: number;
}

interface TopicLabel {
  id: string;
  clusterId: string;
  name: string;
  explanation: string;
  generatedBy: string;
  generatedAt: string;
}

interface Claim {
  id: string;
  clusterId: string;
  topicLabelId: string;
  text: string;
  status: SupportStatus;
  supportScore: number;
  rationale: string;
}

interface EvidenceItem {
  id: string;
  clusterId: string;
  title: string;
  summary: string;
  sourceType:
    | "telemetry_event"
    | "session_feature"
    | "exemplar"
    | "keyphrase"
    | "metadata"
    | "analyst_note";
  rawReference?: string;
}

interface EvidenceRelation {
  claimId: string;
  evidenceId: string;
  polarity: EvidencePolarity;
  strength: EvidenceStrength;
  explanation: string;
}

interface SupportScore {
  claimId: string;
  value: number;
  status: SupportStatus;
  rationale: string;
  evidenceIds: string[];
}

interface AnalystVerdict {
  decision: AnalystDecision;
  summary: string;
  reviewer?: string;
  reviewedAt?: string;
}

interface CaseFile {
  id: string;
  cluster: Cluster;
  topicLabel: TopicLabel;
  claims: Claim[];
  evidenceItems: EvidenceItem[];
  evidenceRelations: EvidenceRelation[];
  supportScores: SupportScore[];
  analystVerdict?: AnalystVerdict;
}
```

## Sample JSON

```json
{
  "id": "case-sample-001",
  "cluster": {
    "id": "cluster-017",
    "name": "Synthetic IAM Review Cluster",
    "description": "Synthetic cluster of read-oriented identity review activity.",
    "source": "sample",
    "size": 148
  },
  "topicLabel": {
    "id": "label-017-a",
    "clusterId": "cluster-017",
    "name": "Repeated Cloud Permission Review",
    "explanation": "This cluster appears to represent routine identity and access review activity with read-heavy permission inspection.",
    "generatedBy": "Toponymy-style summarizer v0.4",
    "generatedAt": "2026-06-11T14:42:00Z"
  },
  "claims": [
    {
      "id": "claim-001",
      "clusterId": "cluster-017",
      "topicLabelId": "label-017-a",
      "text": "The cluster is anchored by read-oriented IAM inspection rather than mutating access changes.",
      "status": "supported",
      "supportScore": 0.91,
      "rationale": "The strongest synthetic features are account enumeration and policy reads, with no matching grant or privilege-change pattern."
    },
    {
      "id": "claim-002",
      "clusterId": "cluster-017",
      "topicLabelId": "label-017-a",
      "text": "Nothing in the cluster departs from normal review timing and origin patterns.",
      "status": "contradicted",
      "supportScore": 0.28,
      "rationale": "One synthetic exemplar includes an unusual off-hours origin that weakens the clean routine-review narrative."
    }
  ],
  "evidenceItems": [
    {
      "id": "evidence-001",
      "clusterId": "cluster-017",
      "title": "Read-heavy IAM inspection features",
      "summary": "Synthetic salient features center on ListUsers, GetPolicy, and ListAttachedUserPolicies.",
      "sourceType": "session_feature",
      "rawReference": "sample/features/cluster-017"
    },
    {
      "id": "evidence-002",
      "clusterId": "cluster-017",
      "title": "Off-hours rare-region exemplar",
      "summary": "A synthetic session occurs at 02:14 local time from a rarely seen control-plane region.",
      "sourceType": "exemplar",
      "rawReference": "sample/exemplars/cluster-017/session-09"
    }
  ],
  "evidenceRelations": [
    {
      "claimId": "claim-001",
      "evidenceId": "evidence-001",
      "polarity": "supports",
      "strength": "strong",
      "explanation": "Read-oriented features directly support the inspection-workflow claim."
    },
    {
      "claimId": "claim-002",
      "evidenceId": "evidence-002",
      "polarity": "contradicts",
      "strength": "strong",
      "explanation": "The off-hours rare-region exemplar contradicts the claim that timing and origin are fully normal."
    }
  ],
  "supportScores": [
    {
      "claimId": "claim-001",
      "value": 0.91,
      "status": "supported",
      "rationale": "Strong direct support from synthetic session features.",
      "evidenceIds": ["evidence-001"]
    },
    {
      "claimId": "claim-002",
      "value": 0.28,
      "status": "contradicted",
      "rationale": "Strong contradictory evidence from one synthetic exemplar.",
      "evidenceIds": ["evidence-002"]
    }
  ],
  "analystVerdict": {
    "decision": "revise",
    "summary": "The label is directionally plausible, but the explanation should acknowledge the off-hours origin outlier.",
    "reviewer": "Synthetic reviewer",
    "reviewedAt": "2026-06-11T15:10:00Z"
  }
}
```
