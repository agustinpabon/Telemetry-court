import type { Case } from "@/lib/types";

const sampleCasesData: Case[] = [
  {
    id: "case-000",
    generatedInterpretation: {
      title: "Scheduled Access Certification Cycle",
      description:
        "This cluster appears to capture a recurring access certification workflow. The cluster substrate and examples consistently reflect review-oriented permission inspection with expected administrative follow-through.",
      modelName: "Toponymy-style summarizer v0.4",
      generatedAt: "2026-06-11 09:18 ET",
      promptVersion: "prompt-review-03",
    },
    cluster: {
      id: "cluster-011",
      size: 132,
      density: "0.88 cohesion score",
      timeWindow: "7-day observation window",
      embeddingSource: "Synthetic IAM activity embeddings",
      topFeatures: [
        "Repeated `ListUsers`, `GetPolicy`, and entitlement comparison reads",
        "Stable weekday cadence aligned to a morning governance review block",
        "Actor path consistently matches an internal identity governance role",
      ],
      representativeExamples: [
        "Account review sweep across 31 identities with only read-oriented permission lookups",
        "Role inspection paired with standard certification tagging and summary generation",
        "Review bursts occur in the same daily window across the entire cluster",
      ],
    },
    evidence: [
      {
        id: "E-001",
        kind: "feature",
        title: "Salient features are dominated by certification reads",
        summary:
          "The strongest cluster features are read-only entitlement inspection actions, which cleanly support a certification-style interpretation.",
        relevance: "high",
        strength: "strong",
        stance: "supports",
        linkedClaimIds: ["C-001", "C-002"],
      },
      {
        id: "E-002",
        kind: "exemplar",
        title: "Representative sequences resemble governance review routines",
        summary:
          "Examples show inspection, comparison, and harmless administrative tagging without evidence of net-new access expansion.",
        relevance: "high",
        strength: "strong",
        stance: "supports",
        linkedClaimIds: ["C-002", "C-003"],
      },
      {
        id: "E-003",
        kind: "metadata",
        title: "Origin and timing are highly consistent",
        summary:
          "The cluster stays within a normal weekday review window and maps to a known identity governance owner path, reinforcing the generated meaning.",
        relevance: "medium",
        strength: "moderate",
        stance: "supports",
        linkedClaimIds: ["C-003"],
      },
    ],
    interpretationRisks: [],
    validation: {
      verdict: "supported",
      confidenceScore: 92,
      supportedClaims: [
        {
          id: "C-001",
          text: "The substrate is anchored by read-oriented entitlement inspection rather than mutating behavior.",
          status: "supported",
          evidenceIds: ["E-001"],
          rationale:
            "The strongest feature cluster is made up of read-only entitlement inspection calls, with no matching pattern of mutating access changes.",
        },
        {
          id: "C-002",
          text: "Representative examples match a recurring certification workflow.",
          status: "supported",
          evidenceIds: ["E-001", "E-002"],
          rationale:
            "Examples show consistent review and tagging sequences that fit a certification cycle rather than an escalation path.",
        },
        {
          id: "C-003",
          text: "Timing and ownership metadata align with a normal governance process.",
          status: "supported",
          evidenceIds: ["E-002", "E-003"],
          rationale:
            "Origin metadata and review timing remain stable across the case, reinforcing the governance interpretation.",
        },
      ],
      weakClaims: [],
      contradictedClaims: [],
      summary:
        "The generated interpretation holds up well. Features, exemplars, and metadata all point toward a routine access certification cycle with no meaningful contradictory signal present.",
    },
  },
  {
    id: "case-001",
    generatedInterpretation: {
      title: "Repeated Cloud Permission Review",
      description:
        "This cluster appears to represent routine identity and access review activity. The pattern is dominated by read-heavy permission inspection with light administrative follow-through, rather than a clear intrusion sequence.",
      modelName: "Toponymy-style summarizer v0.4",
      generatedAt: "2026-06-11 10:42 ET",
      promptVersion: "prompt-review-03",
    },
    cluster: {
      id: "cluster-017",
      size: 148,
      density: "0.81 cohesion score",
      timeWindow: "14-day observation window",
      embeddingSource: "Synthetic IAM activity embeddings",
      topFeatures: [
        "Frequent `ListUsers`, `GetPolicy`, and `ListAttachedUserPolicies` lookups",
        "Stable origin from an internal platform administration subnet",
        "Recurring bursts line up with a weekly review cadence",
      ],
      representativeExamples: [
        "Inventory sweep across 43 identities completed in 18 minutes with read-only IAM calls",
        "Policy inspection sequence followed by routine role tagging and summary lookups",
        "Single off-hours review burst arrived from an infrequent control-plane region",
      ],
    },
    evidence: [
      {
        id: "E-101",
        kind: "feature",
        title: "Read-heavy IAM inspection dominates the cluster",
        summary:
          "Salient features repeatedly center on account enumeration and policy reads, which is consistent with a permission review substrate rather than overt privilege escalation behavior.",
        relevance: "high",
        strength: "strong",
        stance: "supports",
        linkedClaimIds: ["C-1", "C-2"],
      },
      {
        id: "E-102",
        kind: "exemplar",
        title: "Representative examples look like administrative hygiene",
        summary:
          "Example sequences pair policy reads with standard role inspection and tagging actions, which partially supports the interpretation of a routine review workflow.",
        relevance: "medium",
        strength: "moderate",
        stance: "partial",
        linkedClaimIds: ["C-2", "C-3"],
      },
      {
        id: "E-103",
        kind: "metadata",
        title: "Reviewer continuity matches known platform operations owners",
        summary:
          "Actor metadata aligns with a known operations owner set, adding support that the cluster may be tied to normal review activity rather than an unknown operator.",
        relevance: "medium",
        strength: "moderate",
        stance: "supports",
        linkedClaimIds: ["C-3"],
      },
      {
        id: "E-104",
        kind: "contradiction",
        title: "One burst occurred at an unusual hour from a rare region",
        summary:
          "A single session arrived at 02:14 local time from a rarely seen control-plane region. That signal does not fully overturn the interpretation, but it weakens confidence in a clean routine-review label.",
        relevance: "high",
        strength: "strong",
        stance: "contradicts",
        linkedClaimIds: ["C-4"],
      },
    ],
    interpretationRisks: [
      {
        id: "R-101",
        title: "Contradictory evidence exists",
        detail:
          "A meaningful timing-and-region outlier is present, so the model output should not be accepted at face value.",
      },
      {
        id: "R-102",
        title: "Geographic signal is underrepresented",
        detail:
          "The cluster looks stable overall, but regional coverage is thin enough that one outlier meaningfully changes confidence.",
      },
    ],
    validation: {
      verdict: "uncertain",
      confidenceScore: 68,
      supportedClaims: [
        {
          id: "C-1",
          text: "The cluster substrate is anchored by read-oriented IAM inspection rather than a burst of mutating actions.",
          status: "supported",
          evidenceIds: ["E-101"],
          rationale:
            "The salient features are strongly read-heavy, which supports a review-oriented substrate instead of an active access-change sequence.",
        },
        {
          id: "C-2",
          text: "Representative examples broadly resemble a recurring access review workflow.",
          status: "supported",
          evidenceIds: ["E-101", "E-102"],
          rationale:
            "The examples mostly look routine, but that support depends partly on less conclusive admin-like follow-through.",
        },
      ],
      weakClaims: [
        {
          id: "C-3",
          text: "The activity likely belongs to a known administrative owner path.",
          status: "weak",
          evidenceIds: ["E-102", "E-103"],
          rationale:
            "Known-owner metadata helps, but it is not strong enough on its own to fully settle the interpretation.",
        },
      ],
      contradictedClaims: [
        {
          id: "C-4",
          text: "Nothing in the cluster meaningfully departs from normal review timing and origin patterns.",
          status: "contradicted",
          evidenceIds: ["E-104"],
          rationale:
            "The off-hours burst from a rare region creates a concrete contradiction to the clean routine-review narrative.",
        },
      ],
      summary:
        "The interpretation is directionally plausible because the cluster is shaped by permission-inspection features and admin-like exemplars. Confidence remains limited because one timing-and-region outlier introduces a real contradiction to the 'routine review' story.",
    },
  },
  {
    id: "case-002",
    generatedInterpretation: {
      title: "Privilege Expansion Attempt",
      description:
        "This cluster appears to represent an active privilege expansion attempt. The generated description suggests that the examples and salient features indicate a coordinated effort to broaden access across cloud identities.",
      modelName: "Toponymy-style summarizer v0.4",
      generatedAt: "2026-06-11 11:07 ET",
      promptVersion: "prompt-review-03",
    },
    cluster: {
      id: "cluster-029",
      size: 94,
      density: "0.74 cohesion score",
      timeWindow: "5-day observation window",
      embeddingSource: "Synthetic cloud control-plane embeddings",
      topFeatures: [
        "High frequency of inventory reads and integration status checks",
        "Examples cluster around onboarding-like API configuration sequences",
        "Timing aligns to a daytime rollout window rather than a burst escalation pattern",
      ],
      representativeExamples: [
        "Connector setup sequence checks account summaries, integration state, and existing role mappings",
        "API inventory calls are followed by documentation-style tagging and environment naming updates",
        "No exemplar shows a completed privilege grant or persistence-oriented step",
      ],
    },
    evidence: [
      {
        id: "E-201",
        kind: "feature",
        title: "Feature set does not show mutating privilege steps",
        summary:
          "The most salient features emphasize inventory and status checks rather than policy attachment, role assumption chaining, or persistent grant activity.",
        relevance: "high",
        strength: "strong",
        stance: "contradicts",
        linkedClaimIds: ["C-201", "C-202"],
      },
      {
        id: "E-202",
        kind: "exemplar",
        title: "Representative examples resemble integration onboarding",
        summary:
          "Examples consistently look like connector configuration and environment preparation, which conflicts with the generated escalation narrative.",
        relevance: "high",
        strength: "strong",
        stance: "contradicts",
        linkedClaimIds: ["C-202", "C-203"],
      },
      {
        id: "E-203",
        kind: "metadata",
        title: "Timing fits a controlled rollout window",
        summary:
          "The cluster sits inside a standard daytime rollout period and maps to a known platform integration owner path, which weakens the privilege-expansion interpretation.",
        relevance: "medium",
        strength: "weak",
        stance: "partial",
        linkedClaimIds: ["C-203"],
      },
      {
        id: "E-204",
        kind: "contradiction",
        title: "No exemplar completes a grant or persistence action",
        summary:
          "Across the cluster, there is no representative sequence showing a completed permission grant, backdoor creation, or durable follow-on step.",
        relevance: "high",
        strength: "strong",
        stance: "contradicts",
        linkedClaimIds: ["C-201"],
      },
    ],
    interpretationRisks: [
      {
        id: "R-201",
        title: "Cluster density is low",
        detail:
          "This cluster is less cohesive than the others in the demo set, which raises the odds of an overly confident generated label.",
      },
      {
        id: "R-202",
        title: "Limited exemplar coverage",
        detail:
          "The examples are consistent, but they cover a narrower operating slice than the generated interpretation implies.",
      },
      {
        id: "R-203",
        title: "Contradictory evidence exists",
        detail:
          "Multiple strong contradictions directly undermine the model's escalation story, which is why the verdict falls to unsupported.",
      },
    ],
    validation: {
      verdict: "unsupported",
      confidenceScore: 24,
      supportedClaims: [],
      weakClaims: [
        {
          id: "C-203",
          text: "Some surrounding metadata could be read as preparation for broader access changes.",
          status: "weak",
          evidenceIds: ["E-203"],
          rationale:
            "There is a faint preparation signal in the rollout metadata, but it does not carry the generated escalation story very far.",
        },
      ],
      contradictedClaims: [
        {
          id: "C-201",
          text: "The cluster contains concrete signs of active privilege expansion behavior.",
          status: "contradicted",
          evidenceIds: ["E-201", "E-204"],
          rationale:
            "Neither the feature set nor the exemplars show completed grants or persistence steps that would support active expansion.",
        },
        {
          id: "C-202",
          text: "Representative examples support an escalation storyline rather than an onboarding workflow.",
          status: "contradicted",
          evidenceIds: ["E-201", "E-202"],
          rationale:
            "The examples look much more like configuration and onboarding sequences than coordinated privilege growth.",
        },
      ],
      summary:
        "The generated interpretation does not hold up. The substrate and examples look much more like a controlled integration onboarding sequence than an active privilege expansion attempt.",
    },
  },
];

function assertCaseIntegrity(cases: Case[]): Case[] {
  for (const currentCase of cases) {
    const evidenceIds = new Set(currentCase.evidence.map((item) => item.id));
    const claimIds = new Set(
      [
        ...currentCase.validation.supportedClaims,
        ...currentCase.validation.weakClaims,
        ...currentCase.validation.contradictedClaims,
      ].map((claim) => claim.id),
    );

    for (const claim of [
      ...currentCase.validation.supportedClaims,
      ...currentCase.validation.weakClaims,
      ...currentCase.validation.contradictedClaims,
    ]) {
      for (const evidenceId of claim.evidenceIds) {
        if (!evidenceIds.has(evidenceId)) {
          throw new Error(
            `Case ${currentCase.id} references missing evidence ID ${evidenceId} in claim ${claim.id}.`,
          );
        }
      }
    }

    for (const evidenceItem of currentCase.evidence) {
      for (const linkedClaimId of evidenceItem.linkedClaimIds) {
        if (!claimIds.has(linkedClaimId)) {
          throw new Error(
            `Case ${currentCase.id} evidence ${evidenceItem.id} links to missing claim ${linkedClaimId}.`,
          );
        }
      }
    }
  }

  return cases;
}

export const sampleCases: Case[] = assertCaseIntegrity(sampleCasesData);
