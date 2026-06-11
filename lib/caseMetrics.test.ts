import assert from "node:assert/strict";
import test from "node:test";

import { sampleCases } from "@/data/sampleCases";
import {
  deriveCaseSupportStatus,
  formatSupportScore,
  getAverageSupportScore,
  getClaimStatusCounts,
  getClaimSupportScore,
  getClaimsForCluster,
  getEvidenceForClaim,
  getPrimaryEvidencePolarity,
} from "@/lib/caseMetrics";
import type {
  CaseFile,
  Claim,
  EvidenceItem,
  EvidenceRelation,
  SupportScore,
  SupportStatus,
} from "@/lib/types";

function createClaim(overrides: Partial<Claim> = {}): Claim {
  return {
    id: "claim-1",
    clusterId: "cluster-1",
    topicLabelId: "label-1",
    text: "Synthetic claim",
    status: "supported",
    supportScore: 0.8,
    rationale: "Synthetic rationale",
    ...overrides,
  };
}

function createSupportScore(overrides: Partial<SupportScore> = {}): SupportScore {
  return {
    claimId: "claim-1",
    value: 0.8,
    status: "supported",
    rationale: "Synthetic score rationale",
    evidenceIds: [],
    ...overrides,
  };
}

function createEvidenceItem(overrides: Partial<EvidenceItem> = {}): EvidenceItem {
  return {
    id: "evidence-1",
    clusterId: "cluster-1",
    title: "Synthetic evidence",
    summary: "Synthetic summary",
    sourceType: "metadata",
    ...overrides,
  };
}

function createEvidenceRelation(
  overrides: Partial<EvidenceRelation> = {},
): EvidenceRelation {
  return {
    claimId: "claim-1",
    evidenceId: "evidence-1",
    polarity: "supports",
    strength: "moderate",
    explanation: "Synthetic explanation",
    ...overrides,
  };
}

function createCaseFile({
  id = "case-test-001",
  claims = [],
  evidenceItems = [],
  evidenceRelations = [],
  supportScores = [],
}: {
  id?: string;
  claims?: Claim[];
  evidenceItems?: EvidenceItem[];
  evidenceRelations?: EvidenceRelation[];
  supportScores?: SupportScore[];
} = {}): CaseFile {
  return {
    id,
    cluster: {
      id: "cluster-1",
      name: "Synthetic cluster",
      source: "sample",
    },
    topicLabel: {
      id: "label-1",
      clusterId: "cluster-1",
      name: "Synthetic label",
      explanation: "Synthetic explanation",
      generatedBy: "test",
      generatedAt: "2026-06-11T00:00:00Z",
    },
    claims,
    evidenceItems,
    evidenceRelations,
    supportScores,
  };
}

test("empty or minimal cases stay safe for averages, counts, and derived status", () => {
  const emptyCase = createCaseFile();

  assert.equal(getAverageSupportScore(emptyCase), 0);
  assert.deepEqual(getClaimStatusCounts(emptyCase), {
    supported: 0,
    weakly_supported: 0,
    contradicted: 0,
    unsupported: 0,
    insufficient_evidence: 0,
  });
  assert.equal(deriveCaseSupportStatus(emptyCase), "supported");
});

test("claim support score falls back to claim data when support score entries are missing or invalid", () => {
  const missingScoreCase = createCaseFile({
    claims: [createClaim({ id: "claim-a", supportScore: 0.41 })],
  });
  const invalidScoreCase = createCaseFile({
    claims: [createClaim({ id: "claim-b", supportScore: 0.73 })],
    supportScores: [createSupportScore({ claimId: "claim-b", value: Number.NaN })],
  });
  const noValidScoreCase = createCaseFile({
    claims: [createClaim({ id: "claim-c", supportScore: Number.POSITIVE_INFINITY })],
    supportScores: [
      createSupportScore({ claimId: "claim-c", value: Number.NEGATIVE_INFINITY }),
    ],
  });

  assert.equal(getClaimSupportScore(missingScoreCase, "claim-a"), 0.41);
  assert.equal(getClaimSupportScore(invalidScoreCase, "claim-b"), 0.73);
  assert.equal(getClaimSupportScore(noValidScoreCase, "claim-c"), null);
  assert.equal(getClaimSupportScore(noValidScoreCase, "missing-claim"), null);
});

test("support score formatting stays consistent for valid, missing, invalid, and zero scores", () => {
  assert.equal(formatSupportScore(0.635), "64%");
  assert.equal(formatSupportScore(0), "0%");
  assert.equal(formatSupportScore(null), "0%");
  assert.equal(formatSupportScore(undefined), "0%");
  assert.equal(formatSupportScore(Number.NaN), "0%");
  assert.equal(formatSupportScore(Number.POSITIVE_INFINITY), "0%");
});

test("mixed claim statuses are counted explicitly across every support bucket", () => {
  const statuses: SupportStatus[] = [
    "supported",
    "weakly_supported",
    "contradicted",
    "unsupported",
    "insufficient_evidence",
  ];
  const mixedCase = createCaseFile({
    claims: statuses.map((status, index) =>
      createClaim({
        id: `claim-${index}`,
        status,
      }),
    ),
  });

  assert.deepEqual(getClaimStatusCounts(mixedCase), {
    supported: 1,
    weakly_supported: 1,
    contradicted: 1,
    unsupported: 1,
    insufficient_evidence: 1,
  });
});

test("overall case status precedence keeps contradictions visible before softer statuses", () => {
  const contradictedCase = createCaseFile({
    claims: [
      createClaim({ id: "claim-supported", status: "supported" }),
      createClaim({ id: "claim-contradicted", status: "contradicted" }),
    ],
  });
  const unsupportedCase = createCaseFile({
    claims: [
      createClaim({ id: "claim-supported", status: "supported" }),
      createClaim({ id: "claim-unsupported", status: "unsupported" }),
    ],
  });
  const insufficientEvidenceCase = createCaseFile({
    claims: [
      createClaim({ id: "claim-supported", status: "supported" }),
      createClaim({
        id: "claim-insufficient",
        status: "insufficient_evidence",
      }),
    ],
  });
  const weaklySupportedCase = createCaseFile({
    claims: [
      createClaim({ id: "claim-supported", status: "supported" }),
      createClaim({
        id: "claim-weak",
        status: "weakly_supported",
      }),
    ],
  });
  const supportedCase = createCaseFile({
    claims: [createClaim({ id: "claim-supported", status: "supported" })],
  });

  assert.equal(deriveCaseSupportStatus(contradictedCase), "contradicted");
  assert.equal(deriveCaseSupportStatus(unsupportedCase), "unsupported");
  assert.equal(
    deriveCaseSupportStatus(insufficientEvidenceCase),
    "insufficient_evidence",
  );
  assert.equal(deriveCaseSupportStatus(weaklySupportedCase), "weakly_supported");
  assert.equal(deriveCaseSupportStatus(supportedCase), "supported");
});

test("primary evidence polarity handles support, contradiction, neutral, and empty relation sets safely", () => {
  assert.equal(
    getPrimaryEvidencePolarity([
      createEvidenceRelation({ polarity: "supports" }),
    ]),
    "supports",
  );
  assert.equal(
    getPrimaryEvidencePolarity([
      createEvidenceRelation({ polarity: "supports" }),
      createEvidenceRelation({
        evidenceId: "evidence-2",
        polarity: "contradicts",
      }),
    ]),
    "contradicts",
  );
  assert.equal(
    getPrimaryEvidencePolarity([
      createEvidenceRelation({ polarity: "neutral" }),
    ]),
    "neutral",
  );
  assert.equal(getPrimaryEvidencePolarity([]), "neutral");
});

test("cluster and claim evidence lookups return matching domain records and empty arrays for missing ids", () => {
  const iamReviewCase = sampleCases[0];
  const reviewClaims = getClaimsForCluster(iamReviewCase, "cluster-017");
  const claimEvidence = getEvidenceForClaim(iamReviewCase, "claim-002");

  assert.equal(reviewClaims.length, 3);
  assert.deepEqual(
    reviewClaims.map((claim) => claim.id),
    ["claim-001", "claim-002", "claim-003"],
  );
  assert.deepEqual(
    claimEvidence.map((item) => item.id),
    ["evidence-002", "evidence-003"],
  );
  assert.deepEqual(getClaimsForCluster(iamReviewCase, "missing-cluster"), []);
  assert.deepEqual(getEvidenceForClaim(iamReviewCase, "missing-claim"), []);
});

test("average support score ignores invalid values and uses the remaining valid claim-level scores", () => {
  const caseFile = createCaseFile({
    claims: [
      createClaim({ id: "claim-a", supportScore: 0.9 }),
      createClaim({ id: "claim-b", supportScore: 0.4 }),
      createClaim({ id: "claim-c", supportScore: Number.NaN }),
    ],
    supportScores: [
      createSupportScore({ claimId: "claim-a", value: 0.9 }),
      createSupportScore({ claimId: "claim-b", value: Number.NaN }),
      createSupportScore({ claimId: "claim-c", value: Number.NaN }),
    ],
  });

  assert.equal(getAverageSupportScore(caseFile), 0.65);
});

test("evidence lookup safely ignores relations that point to missing evidence items", () => {
  const caseFile = createCaseFile({
    claims: [createClaim({ id: "claim-1" })],
    evidenceRelations: [
      createEvidenceRelation({
        claimId: "claim-1",
        evidenceId: "missing-evidence",
      }),
    ],
    evidenceItems: [createEvidenceItem({ id: "evidence-1" })],
  });

  assert.deepEqual(getEvidenceForClaim(caseFile, "claim-1"), []);
});
