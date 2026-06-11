import type {
  CaseFile,
  Claim,
  EvidenceItem,
  EvidencePolarity,
  EvidenceRelation,
  SupportStatus,
} from "@/lib/types";

const supportStatusOrder: SupportStatus[] = [
  "contradicted",
  "unsupported",
  "insufficient_evidence",
  "weakly_supported",
  "supported",
];

function isValidSupportScore(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function getClaimSupportScore(
  caseFile: CaseFile,
  claimId: string,
): number | null {
  const supportScore = caseFile.supportScores.find((score) => score.claimId === claimId);

  if (isValidSupportScore(supportScore?.value)) {
    return supportScore.value;
  }

  const claim = caseFile.claims.find((currentClaim) => currentClaim.id === claimId);

  if (isValidSupportScore(claim?.supportScore)) {
    return claim.supportScore;
  }

  return null;
}

export function getAverageSupportScore(caseFile: CaseFile): number {
  const scores = caseFile.claims
    .map((claim) => getClaimSupportScore(caseFile, claim.id))
    .filter((score): score is number => score !== null);

  if (scores.length === 0) {
    return 0;
  }

  const total = scores.reduce((sum, score) => sum + score, 0);

  return total / scores.length;
}

export function formatSupportScore(score: number | null | undefined): string {
  if (!isValidSupportScore(score)) {
    return "0%";
  }

  return `${Math.round(score * 100)}%`;
}

export function getClaimStatusCounts(caseFile: CaseFile): Record<SupportStatus, number> {
  return caseFile.claims.reduce<Record<SupportStatus, number>>(
    (counts, claim) => {
      counts[claim.status] += 1;
      return counts;
    },
    {
      supported: 0,
      weakly_supported: 0,
      contradicted: 0,
      unsupported: 0,
      insufficient_evidence: 0,
    },
  );
}

export function deriveCaseSupportStatus(caseFile: CaseFile): SupportStatus {
  const claimStatusCounts = getClaimStatusCounts(caseFile);

  const matchedStatus = supportStatusOrder.find((status) => claimStatusCounts[status] > 0);

  return matchedStatus ?? "supported";
}

export function getPrimaryEvidencePolarity(
  relations: EvidenceRelation[],
): EvidencePolarity {
  if (relations.some((relation) => relation.polarity === "contradicts")) {
    return "contradicts";
  }

  if (relations.some((relation) => relation.polarity === "supports")) {
    return "supports";
  }

  return "neutral";
}

export function getClaimsForCluster(caseFile: CaseFile, clusterId: string): Claim[] {
  return caseFile.claims.filter((claim) => claim.clusterId === clusterId);
}

export function getEvidenceRelationsForClaim(
  caseFile: CaseFile,
  claimId: string,
): EvidenceRelation[] {
  return caseFile.evidenceRelations.filter((relation) => relation.claimId === claimId);
}

export function getEvidenceIdsForClaim(caseFile: CaseFile, claimId: string): string[] {
  return Array.from(
    new Set(
      getEvidenceRelationsForClaim(caseFile, claimId).map(
        (relation) => relation.evidenceId,
      ),
    ),
  );
}

export function getEvidenceForClaim(caseFile: CaseFile, claimId: string): EvidenceItem[] {
  const relatedEvidenceIds = new Set(getEvidenceIdsForClaim(caseFile, claimId));

  return caseFile.evidenceItems.filter((item) => relatedEvidenceIds.has(item.id));
}

export function getRelationsForEvidence(
  caseFile: CaseFile,
  evidenceId: string,
): EvidenceRelation[] {
  return caseFile.evidenceRelations.filter(
    (relation) => relation.evidenceId === evidenceId,
  );
}
