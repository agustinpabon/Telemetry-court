# Data Model

This document describes the compatibility UI model used by the local review
workflow. The approved package and result boundaries are documented in
`docs/CASE_PACKAGE_CONTRACT.md` and `docs/REVIEW_RESULT_CONTRACT.md`.
The implemented deterministic mocked assistance response boundary is documented in
`docs/AI_ASSISTANCE_RESPONSE_CONTRACT.md`.

The model must separate:

- `CasePackage`: the versioned upstream cluster interpretation and evidence under review;
- `ReviewResult`: one human review of that package;
- `EvaluationReport`: aggregated metrics across compatible review results.
- `QuickDisposition`: a shallow early artifact excluded from full aggregation.
- `cluster_refinement.v0.1`: review-derived recommendations for an external
  upstream consumer.

Do not treat the current `CaseFile` shape as either versioned contract. The
existing adapter carries a compact CasePackage reference into the UI model so
the export can identify what was reviewed without copying the package.

Current product flow:

```text
Telemetry landscape
-> validated CasePackage / compatibility CaseFile
-> blind interpretation
-> AI label reveal
-> evidence ratings
-> label duel
-> impostor session
-> structured verdict
-> ReviewResult export
-> EvaluationReport
-> cluster refinement export
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
  aiLabelRevealed: boolean;
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

The current review export emits `ReviewResultV01` with schema version
`review_result.v0.1`. It contains:

- compact CasePackage and pipeline references;
- local synthetic reviewer/session metadata and protocol version;
- blind interpretation and reveal state;
- candidate-label winner and structured reason codes;
- optional label-comparison rationale already captured by the UI;
- canonical evidence ratings keyed by evidence ID;
- outlier or impostor session ID;
- failure modes, canonical final verdict, and canonical recommended action.

Typing must not be required to produce this export.

The export does not include the full cluster, claims, evidence items, support
scores, or raw telemetry. It is one local review artifact. The current app can
persist that artifact in browser-local storage by CasePackage ID after copy or
download. The local `/results` view aggregates compatible browser-local or
imported full ReviewResults into `EvaluationReportV01`, with JSON/CSV downloads
and `cluster_refinement.v0.1` export when exact source reviews are available.
Quick dispositions are stored and summarized separately and never enter those
aggregates. The report includes deterministic descriptive rollups grouped by
selected label ID and compact package/pipeline metadata, with absent optional
metadata recorded as unavailable. It also includes descriptive agreement signals
for verdict, label winner, evidence ratings by stable evidence ID, and a major
failure mode when a review selects exactly one mode. Agreement signals retain
compared and unavailable review counts, observed value counts, explicit
available/incomplete/unavailable states, and disputed-evidence flags without
choosing a correct value or consensus. Exact package-reference compatibility means
non-label metadata remains single-value context; durable backend storage,
cross-package report-set ranking, confidence capture, and production
multi-user workflows remain future work.

## Runtime Fixture

Use `data/sampleCases.ts` as the current runtime fixture reference. It contains five synthetic validation cases and an integrity check for claim IDs, evidence IDs, candidate labels, seeded impostor sessions, default evidence ratings, and support scores.
