# Data Model

This document describes the domain model currently implemented by the static validation slice. It is not the approved `CasePackage v0.1` contract.

The target model must separate:

- `CasePackage`: the versioned upstream cluster interpretation and evidence under review;
- `ReviewResult`: one human review of that package;
- `EvaluationReport`: aggregated metrics across compatible review results.

See `docs/CASE_PACKAGE_CONTRACT.md` before changing or renaming current types. Milestone 2 should introduce an explicit adapter or migration path rather than treating the current `CaseFile` shape as the final package contract.

Current product flow:

```text
Telemetry landscape
-> CaseFile
-> blind interpretation
-> AI label reveal
-> evidence ratings
-> label duel
-> impostor session
-> structured verdict
-> review export
```

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

type EvidenceRating =
  | "supports_label"
  | "weak_support"
  | "irrelevant_noise"
  | "contradicts_label"
  | "needs_context";

type CandidateLabelSource =
  | "baseline_ai"
  | "evidence_constrained_ai"
  | "human_style"
  | "uncertain_label";

type DuelReason =
  | "better_supported"
  | "less_overclaimed"
  | "more_specific"
  | "too_broad"
  | "missing_evidence"
  | "cluster_seems_mixed";

type FinalVerdict =
  | "supported"
  | "partially_supported"
  | "unsupported_overclaimed"
  | "uncertain"
  | "cluster_impure"
  | "needs_split"
  | "needs_merge"
  | "needs_better_evidence";

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
}

interface BlindInterpretationOption {
  id: string;
  label: string;
  helper: string;
}

interface CandidateLabel {
  id: string;
  source: CandidateLabelSource;
  label: string;
  rationale: string;
  supportEstimate: number;
}

interface RepresentativeSession {
  id: string;
  title: string;
  principal: string;
  timestamp: string;
  featureOverlap: number;
  outlierScore: number;
  summary: string;
  outlierReason?: string;
}

interface EvidenceArenaReview {
  blindChoiceId?: string;
  blindChoiceLabel?: string;
  aiLabel: string;
  blindChoiceAgreesWithAi?: boolean;
  labelDuelWinnerId?: string;
  labelDuelWinnerLabel?: string;
  duelReasons: DuelReason[];
  duelNote?: string;
  evidenceRatings: Record<string, EvidenceRating>;
  impostorSessionId?: string;
  impostorSessionTitle?: string;
  impostorExplanation?: string;
  failureModes: DuelReason[];
  finalVerdict?: FinalVerdict;
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
  dataset: string;
  reviewStatus: "unreviewed" | "in_review" | "needs_split" | "needs_evidence" | "reviewed";
  landscapeStatus: "supported" | "overclaimed" | "impure" | "too_broad" | "uncertain";
  modelAgreement: number;
  evidenceStrength: number;
  uncertainty: number;
  mapPosition: { x: number; y: number };
  topFeatures: string[];
  riskFlags: string[];
  nearestNeighbor: {
    clusterId: string;
    label: string;
    distance: number;
    note: string;
  };
  topicLabel: TopicLabel;
  blindInterpretationOptions: BlindInterpretationOption[];
  candidateLabels: CandidateLabel[];
  seededBestLabelId: string;
  seededImpostorSessionId: string;
  representativeSessions: RepresentativeSession[];
  failureModes: DuelReason[];
  defaultEvidenceRatings: Record<string, EvidenceRating>;
  claims: Claim[];
  evidenceItems: EvidenceItem[];
  evidenceRelations: EvidenceRelation[];
  supportScores: SupportScore[];
  analystVerdict?: AnalystVerdict;
}
```

## Current Review Export

The current review export preserves the case evidence trail and the reviewer's structured UI choices:

- blind choice;
- AI label;
- blind agreement/disagreement;
- label duel winner;
- duel reason chips;
- optional label duel note;
- evidence ratings;
- impostor session;
- failure modes;
- final verdict.

Typing must not be required to produce this export.

The current export is not yet `ReviewResult v0.1`. It lacks an approved schema version, source package version, review protocol version, and multi-reviewer compatibility rules. Those are Milestone 2 decisions.

## Runtime Fixture

Use `data/sampleCases.ts` as the current runtime fixture reference. It contains five synthetic validation cases and an integrity check for claim IDs, evidence IDs, candidate labels, seeded impostor sessions, default evidence ratings, and support scores.
