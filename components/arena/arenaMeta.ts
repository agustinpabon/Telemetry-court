import type {
  CandidateLabelSource,
  DuelReason,
  EvidenceRating,
  FinalVerdict,
  LandscapeStatus,
  ReviewStatus,
} from "@/lib/types";

export const landscapeStatusMeta: Record<
  LandscapeStatus,
  {
    label: string;
    tone: "supported" | "overclaimed" | "impure" | "broad" | "uncertain";
    className: string;
    nodeClassName: string;
    accent: string;
  }
> = {
  supported: {
    label: "Supported",
    tone: "supported",
    className: "status-chip status-chip-supported",
    nodeClassName: "cluster-node-supported",
    accent: "#7fb18b",
  },
  overclaimed: {
    label: "Overclaimed",
    tone: "overclaimed",
    className: "status-chip status-chip-overclaimed",
    nodeClassName: "cluster-node-overclaimed",
    accent: "#d18a7e",
  },
  impure: {
    label: "Impure",
    tone: "impure",
    className: "status-chip status-chip-impure",
    nodeClassName: "cluster-node-impure",
    accent: "#d5ad63",
  },
  too_broad: {
    label: "Too broad",
    tone: "broad",
    className: "status-chip status-chip-broad",
    nodeClassName: "cluster-node-broad",
    accent: "#8fa8d5",
  },
  uncertain: {
    label: "Uncertain",
    tone: "uncertain",
    className: "status-chip status-chip-uncertain",
    nodeClassName: "cluster-node-uncertain",
    accent: "#b8a68c",
  },
};

export const reviewStatusLabel: Record<ReviewStatus, string> = {
  unreviewed: "Unreviewed",
  in_review: "In review",
  needs_split: "Needs split",
  needs_evidence: "Needs evidence",
  reviewed: "Reviewed",
};

export const candidateSourceLabel: Record<CandidateLabelSource, string> = {
  baseline_ai: "Baseline AI",
  evidence_constrained_ai: "Evidence-constrained AI",
  human_style: "Human-style label",
  uncertain_label: "Uncertainty-preserving label",
};

export const evidenceRatingMeta: Record<
  EvidenceRating,
  {
    label: string;
    shortLabel: string;
    meterLabel: string;
    className: string;
  }
> = {
  supports_label: {
    label: "Supports label",
    shortLabel: "Supports",
    meterLabel: "Supporting evidence",
    className: "evidence-rating evidence-rating-supports",
  },
  weak_support: {
    label: "Weak support",
    shortLabel: "Weak",
    meterLabel: "Weak evidence",
    className: "evidence-rating evidence-rating-weak",
  },
  irrelevant_noise: {
    label: "Noise / irrelevant",
    shortLabel: "Noise",
    meterLabel: "Noise",
    className: "evidence-rating evidence-rating-noise",
  },
  contradicts_label: {
    label: "Contradicts label",
    shortLabel: "Contradicts",
    meterLabel: "Contradictory evidence",
    className: "evidence-rating evidence-rating-contradicts",
  },
  needs_context: {
    label: "Needs context",
    shortLabel: "Context",
    meterLabel: "Context gaps",
    className: "evidence-rating evidence-rating-context",
  },
};

export const evidenceRatingOptions: EvidenceRating[] = [
  "supports_label",
  "weak_support",
  "irrelevant_noise",
  "contradicts_label",
  "needs_context",
];

export const duelReasonLabel: Record<DuelReason, string> = {
  better_supported: "Better supported",
  less_overclaimed: "Less overclaimed",
  more_specific: "More specific",
  too_broad: "Too broad",
  missing_evidence: "Missing evidence",
  cluster_seems_mixed: "Cluster seems mixed",
};

export const finalVerdictLabel: Record<FinalVerdict, string> = {
  supported: "Supported",
  partially_supported: "Partially supported",
  unsupported_overclaimed: "Unsupported / overclaimed",
  uncertain: "Uncertain",
  cluster_impure: "Cluster is impure",
  needs_split: "Needs split",
  needs_merge: "Needs merge",
  needs_better_evidence: "Needs better evidence",
};

export const finalVerdicts: FinalVerdict[] = [
  "supported",
  "partially_supported",
  "unsupported_overclaimed",
  "uncertain",
  "cluster_impure",
  "needs_split",
  "needs_merge",
  "needs_better_evidence",
];

export function formatReasonList(reasons?: DuelReason[]): string | undefined {
  if (!reasons || reasons.length === 0) {
    return undefined;
  }

  return reasons.map((reason) => duelReasonLabel[reason]).join(", ");
}
