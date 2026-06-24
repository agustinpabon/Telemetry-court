import type {
  CaseFile,
  MergeRecommendationReason,
  NearestNeighbor,
  SplitRecommendationReason,
} from "@/lib/types";

export const DEFAULT_SPLIT_RECOMMENDATION_REASON: SplitRecommendationReason =
  "mixed_behaviors";

export const DEFAULT_MERGE_RECOMMENDATION_REASON: MergeRecommendationReason =
  "shared_behavior";

export function getCaseFileMergeCandidates(
  caseFile: Pick<CaseFile, "nearestNeighbor" | "neighborClusters">,
): NearestNeighbor[] {
  const sourceCandidates =
    caseFile.neighborClusters !== undefined
      ? caseFile.neighborClusters
      : caseFile.nearestNeighbor.clusterId
        ? [caseFile.nearestNeighbor]
        : [];
  const seenClusterIds = new Set<string>();

  return sourceCandidates.filter((candidate) => {
    if (!candidate.clusterId || seenClusterIds.has(candidate.clusterId)) {
      return false;
    }

    seenClusterIds.add(candidate.clusterId);
    return true;
  });
}
