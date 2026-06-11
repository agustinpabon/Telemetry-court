import type { CaseFile } from "@/lib/types";

const sampleCasesData: CaseFile[] = [
  {
    id: "case-sample-001",
    cluster: {
      id: "cluster-017",
      name: "Synthetic IAM Review Cluster",
      description:
        "Synthetic cluster of read-oriented identity review activity with one timing-origin outlier.",
      source: "sample",
      size: 148,
    },
    topicLabel: {
      id: "label-017-a",
      clusterId: "cluster-017",
      name: "Repeated Cloud Permission Review",
      explanation:
        "This cluster appears to represent routine identity and access review activity. The pattern is dominated by read-heavy permission inspection with light administrative follow-through.",
      generatedBy: "Toponymy-style summarizer v0.4",
      generatedAt: "2026-06-11T14:42:00Z",
    },
    claims: [
      {
        id: "claim-001",
        clusterId: "cluster-017",
        topicLabelId: "label-017-a",
        text: "The cluster is anchored by read-oriented IAM inspection rather than mutating access changes.",
        status: "supported",
        supportScore: 0.91,
        rationale:
          "The strongest synthetic features are account enumeration and policy reads, with no matching grant or privilege-change pattern.",
      },
      {
        id: "claim-002",
        clusterId: "cluster-017",
        topicLabelId: "label-017-a",
        text: "Representative examples broadly resemble a recurring access review workflow.",
        status: "weakly_supported",
        supportScore: 0.63,
        rationale:
          "The synthetic exemplars look review-oriented, but the support is moderate because examples include administrative follow-through that could fit more than one workflow.",
      },
      {
        id: "claim-003",
        clusterId: "cluster-017",
        topicLabelId: "label-017-a",
        text: "Nothing in the cluster departs from normal review timing and origin patterns.",
        status: "contradicted",
        supportScore: 0.24,
        rationale:
          "A synthetic off-hours session from a rarely seen control-plane region directly contradicts the clean normal-timing claim.",
      },
    ],
    evidenceItems: [
      {
        id: "evidence-001",
        clusterId: "cluster-017",
        title: "Read-heavy IAM inspection features",
        summary:
          "Synthetic salient features center on ListUsers, GetPolicy, and ListAttachedUserPolicies style reads.",
        sourceType: "session_feature",
        rawReference: "sample/features/cluster-017",
      },
      {
        id: "evidence-002",
        clusterId: "cluster-017",
        title: "Administrative review exemplars",
        summary:
          "Synthetic representative samples pair policy reads with role inspection, tagging, and summary-generation steps.",
        sourceType: "exemplar",
        rawReference: "sample/exemplars/cluster-017/review-sequences",
      },
      {
        id: "evidence-003",
        clusterId: "cluster-017",
        title: "Known review-owner metadata",
        summary:
          "Synthetic metadata maps most sessions to an internal identity governance owner path.",
        sourceType: "metadata",
        rawReference: "sample/metadata/cluster-017/owner-path",
      },
      {
        id: "evidence-004",
        clusterId: "cluster-017",
        title: "Off-hours rare-region exemplar",
        summary:
          "One synthetic session occurs at 02:14 local time from a rarely seen control-plane region.",
        sourceType: "exemplar",
        rawReference: "sample/exemplars/cluster-017/session-09",
      },
    ],
    evidenceRelations: [
      {
        claimId: "claim-001",
        evidenceId: "evidence-001",
        polarity: "supports",
        strength: "strong",
        explanation:
          "Read-oriented session features directly support the inspection-workflow claim.",
      },
      {
        claimId: "claim-002",
        evidenceId: "evidence-002",
        polarity: "supports",
        strength: "moderate",
        explanation:
          "The exemplars resemble review routines, but the match is not exclusive enough for strong support.",
      },
      {
        claimId: "claim-002",
        evidenceId: "evidence-003",
        polarity: "neutral",
        strength: "weak",
        explanation:
          "Known-owner metadata is useful context, but it does not prove the examples are specifically a recurring review workflow.",
      },
      {
        claimId: "claim-003",
        evidenceId: "evidence-004",
        polarity: "contradicts",
        strength: "strong",
        explanation:
          "The off-hours rare-region exemplar contradicts the claim that timing and origin are fully normal.",
      },
    ],
    supportScores: [
      {
        claimId: "claim-001",
        value: 0.91,
        status: "supported",
        rationale: "Strong direct support from synthetic session features.",
      },
      {
        claimId: "claim-002",
        value: 0.63,
        status: "weakly_supported",
        rationale:
          "Moderate support from exemplars, with metadata that adds context but not decisive proof.",
      },
      {
        claimId: "claim-003",
        value: 0.24,
        status: "contradicted",
        rationale:
          "Strong contradictory evidence from one synthetic timing-origin outlier.",
      },
    ],
    analystVerdict: {
      decision: "revise",
      summary:
        "The generated label is directionally plausible, but the explanation should acknowledge the off-hours origin outlier instead of implying a fully routine pattern.",
      reviewer: "Synthetic reviewer",
      reviewedAt: "2026-06-11T15:10:00Z",
    },
  },
  {
    id: "case-sample-002",
    cluster: {
      id: "cluster-029",
      name: "Synthetic Connector Onboarding Cluster",
      description:
        "Synthetic cluster of inventory reads and integration setup checks during a daytime rollout window.",
      source: "sample",
      size: 94,
    },
    topicLabel: {
      id: "label-029-a",
      clusterId: "cluster-029",
      name: "Privilege Expansion Attempt",
      explanation:
        "This cluster appears to represent an active privilege expansion attempt across cloud identities.",
      generatedBy: "Toponymy-style summarizer v0.4",
      generatedAt: "2026-06-11T15:07:00Z",
    },
    claims: [
      {
        id: "claim-101",
        clusterId: "cluster-029",
        topicLabelId: "label-029-a",
        text: "The cluster contains concrete signs of active privilege expansion behavior.",
        status: "unsupported",
        supportScore: 0.12,
        rationale:
          "The synthetic record has no evidence of completed grants, durable privilege changes, or persistence-oriented follow-through.",
      },
      {
        id: "claim-102",
        clusterId: "cluster-029",
        topicLabelId: "label-029-a",
        text: "Representative examples support an escalation storyline rather than an onboarding workflow.",
        status: "contradicted",
        supportScore: 0.18,
        rationale:
          "The representative examples look like connector setup and environment preparation, which conflicts with the generated escalation narrative.",
      },
      {
        id: "claim-103",
        clusterId: "cluster-029",
        topicLabelId: "label-029-a",
        text: "There is enough evidence to identify the operator's intent.",
        status: "insufficient_evidence",
        supportScore: 0.34,
        rationale:
          "Synthetic metadata provides rollout context, but there is not enough evidence to infer intent beyond configuration activity.",
      },
    ],
    evidenceItems: [
      {
        id: "evidence-101",
        clusterId: "cluster-029",
        title: "Inventory and status-check features",
        summary:
          "Synthetic salient features emphasize inventory reads, integration status checks, and existing role mapping lookups.",
        sourceType: "session_feature",
        rawReference: "sample/features/cluster-029",
      },
      {
        id: "evidence-102",
        clusterId: "cluster-029",
        title: "Connector setup exemplars",
        summary:
          "Synthetic examples show connector configuration, documentation-style tagging, and environment naming updates.",
        sourceType: "exemplar",
        rawReference: "sample/exemplars/cluster-029/setup-sequences",
      },
      {
        id: "evidence-103",
        clusterId: "cluster-029",
        title: "Daytime rollout metadata",
        summary:
          "Synthetic timing metadata places the cluster inside a standard platform integration rollout window.",
        sourceType: "metadata",
        rawReference: "sample/metadata/cluster-029/rollout-window",
      },
    ],
    evidenceRelations: [
      {
        claimId: "claim-102",
        evidenceId: "evidence-101",
        polarity: "contradicts",
        strength: "strong",
        explanation:
          "The non-mutating feature shape contradicts the escalation storyline.",
      },
      {
        claimId: "claim-102",
        evidenceId: "evidence-102",
        polarity: "contradicts",
        strength: "strong",
        explanation:
          "Setup-oriented exemplars contradict the claim that examples show escalation.",
      },
      {
        claimId: "claim-103",
        evidenceId: "evidence-103",
        polarity: "neutral",
        strength: "weak",
        explanation:
          "Rollout metadata gives context, but it is not enough to infer intent.",
      },
    ],
    supportScores: [
      {
        claimId: "claim-101",
        value: 0.12,
        status: "unsupported",
        rationale:
          "No synthetic evidence links support this claim; the missing evidence is the reason for the unsupported status.",
      },
      {
        claimId: "claim-102",
        value: 0.18,
        status: "contradicted",
        rationale:
          "Strong contradiction from setup-oriented exemplars and non-mutating feature shape.",
      },
      {
        claimId: "claim-103",
        value: 0.34,
        status: "insufficient_evidence",
        rationale:
          "Rollout metadata is useful context, but it does not support an intent claim.",
      },
    ],
    analystVerdict: {
      decision: "reject",
      summary:
        "The generated escalation label should not be accepted because the synthetic evidence points to connector onboarding, not active privilege expansion.",
      reviewer: "Synthetic reviewer",
      reviewedAt: "2026-06-11T15:34:00Z",
    },
  },
];

function assertCaseIntegrity(cases: CaseFile[]): CaseFile[] {
  for (const currentCase of cases) {
    const claimIds = new Set(currentCase.claims.map((claim) => claim.id));
    const evidenceIds = new Set(currentCase.evidenceItems.map((item) => item.id));
    const scoreClaimIds = new Set(
      currentCase.supportScores.map((score) => score.claimId),
    );

    for (const claim of currentCase.claims) {
      if (!scoreClaimIds.has(claim.id)) {
        throw new Error(
          `Case ${currentCase.id} is missing a support score for claim ${claim.id}.`,
        );
      }
    }

    for (const relation of currentCase.evidenceRelations) {
      if (!claimIds.has(relation.claimId)) {
        throw new Error(
          `Case ${currentCase.id} relation references missing claim ${relation.claimId}.`,
        );
      }

      if (!evidenceIds.has(relation.evidenceId)) {
        throw new Error(
          `Case ${currentCase.id} relation references missing evidence ${relation.evidenceId}.`,
        );
      }
    }

    for (const score of currentCase.supportScores) {
      if (!claimIds.has(score.claimId)) {
        throw new Error(
          `Case ${currentCase.id} score references missing claim ${score.claimId}.`,
        );
      }
    }
  }

  return cases;
}

export const sampleCases: CaseFile[] = assertCaseIntegrity(sampleCasesData);
