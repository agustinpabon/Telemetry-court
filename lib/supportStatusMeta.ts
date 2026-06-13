import type { SupportStatus } from "@/lib/types";

export type SupportStatusMeta = {
  label: string;
  shortLabel: string;
  chipClassName: string;
  badgeClassName: string;
  textClassName: string;
  plainLanguage: string;
  note: string;
};

export const supportStatusStates: SupportStatus[] = [
  "supported",
  "weakly_supported",
  "contradicted",
  "unsupported",
  "insufficient_evidence",
];

export const supportStatusMeta: Record<SupportStatus, SupportStatusMeta> = {
  supported: {
    label: "Supported",
    shortLabel: "Supported",
    chipClassName:
      "bg-[var(--color-supported-soft)] text-[var(--color-supported)] border-[color:rgba(63,125,85,0.2)]",
    badgeClassName:
      "bg-[var(--color-supported-soft)] text-[var(--color-supported)]",
    textClassName: "text-[var(--color-supported)]",
    plainLanguage: "The record gives this claim direct support.",
    note: "Evidence consistently reinforces the generated interpretation.",
  },
  weakly_supported: {
    label: "Weakly supported",
    shortLabel: "Weak",
    chipClassName:
      "bg-[var(--color-uncertain-soft)] text-[var(--color-uncertain)] border-[color:rgba(154,106,47,0.2)]",
    badgeClassName:
      "bg-[var(--color-uncertain-soft)] text-[var(--color-uncertain)]",
    textClassName: "text-[var(--color-uncertain)]",
    plainLanguage: "The claim is plausible, but the evidence is not decisive.",
    note: "Some evidence supports the interpretation, but confidence remains limited.",
  },
  contradicted: {
    label: "Contradicted",
    shortLabel: "Contradicted",
    chipClassName:
      "bg-[var(--color-contradicted-soft)] text-[var(--color-contradicted)] border-[color:rgba(155,61,53,0.2)]",
    badgeClassName:
      "bg-[var(--color-contradicted-soft)] text-[var(--color-contradicted)]",
    textClassName: "text-[var(--color-contradicted)]",
    plainLanguage: "The record contains evidence that conflicts with this claim.",
    note: "At least one evidence item directly contradicts a generated claim.",
  },
  unsupported: {
    label: "Unsupported",
    shortLabel: "Unsupported",
    chipClassName:
      "bg-[var(--color-unsupported-soft)] text-[var(--color-unsupported)] border-[color:rgba(111,98,92,0.22)]",
    badgeClassName:
      "bg-[var(--color-unsupported-soft)] text-[var(--color-unsupported)]",
    textClassName: "text-[var(--color-unsupported)]",
    plainLanguage: "The claim does not have enough supporting evidence.",
    note: "The evidence does not adequately support the interpretation.",
  },
  insufficient_evidence: {
    label: "Insufficient evidence",
    shortLabel: "Insufficient",
    chipClassName:
      "bg-[var(--color-uncertain-soft)] text-[var(--color-uncertain)] border-[color:rgba(154,106,47,0.2)]",
    badgeClassName:
      "bg-[var(--color-uncertain-soft)] text-[var(--color-uncertain)]",
    textClassName: "text-[var(--color-uncertain)]",
    plainLanguage: "The record is too thin to treat this claim as proven.",
    note: "The record lacks enough evidence to judge the claim confidently.",
  },
};
