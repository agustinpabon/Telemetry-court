# Telemetry Court Design Direction

This document defines the product UI/UX north star for Telemetry Court before implementation work continues.

Telemetry Court should feel like a calm, premium, evidence-first review product for AI-generated cyber telemetry cluster labels. The standard is Wealthsimple-level restraint and trust clarity, not a clone of Wealthsimple or any other product. Do not reuse another company's branding, exact layouts, copy, iconography, colors, illustrations, or screen compositions.

## 1. Product Design North Star

Make every AI label easy to inspect, challenge, and defend.

Telemetry Court should help a reviewer move through one clear loop:

```text
Cluster -> Proposed label -> Supporting evidence -> Confidence -> Verdict
```

The interface exists to help users understand what the AI proposed, why it proposed it, what evidence supports or weakens it, how confident the case should feel, and what judgment the analyst should record.

This is not generic analytics. This is an evidence review workflow.

## 2. Design Principles

- Calm, low-noise interface.
- Evidence-first hierarchy.
- Human, plain-language copy.
- Neutral/pastel visual system with restrained semantic color.
- Rounded cards, generous spacing, clear typography.
- No cyberpunk aesthetic, no overloaded dashboards, no decorative charts.
- AI output must never visually outrank supporting evidence.

Expanded guidance:

- Calm, low-noise interface means fewer panels, fewer simultaneous emphasis cues, and more breathing room around important review elements.
- Evidence-first hierarchy means the reviewer should always be able to trace the path from claim to proof, contradiction, or missing support.
- Human, plain-language copy means short, direct sentences that explain evidence state without hype or vague AI language.
- Restrained semantic color means color is reserved for support status, confidence, warnings, and validation states rather than general decoration.
- Rounded cards and generous spacing should make the product feel premium and readable, not dense or operationally frantic.
- Decorative visual patterns that do not improve evidence inspection should be removed or avoided.

## 3. Initial Visual Direction

- Near-white or off-white app background.
- Dark warm ink text.
- Muted grey cards and borders.
- Soft pastel accents only for section backgrounds or empty states.
- Semantic colors only for evidence status, confidence, warnings, or validation states.
- Use original icons, original copy, and original layouts.

Visual intent:

- The product should feel quiet and deliberate at first glance.
- Surfaces should separate information gently through contrast, spacing, and borders rather than heavy shadows or loud fills.
- Accent color should help orientation, not compete with the evidence.
- The UI should feel product-like and premium, but still subordinate to the review task.

## 4. Core UX Flow

1. User sees a telemetry cluster.
2. User sees the proposed AI-generated label.
3. User sees the top supporting evidence.
4. User can inspect why the label was proposed.
5. User can accept, reject, revise, or mark as needs review.
6. User can compare labels and evidence quality across clusters.

This flow should remain visible in the structure of the product. If a future screen or layout change makes this loop harder to follow, it is likely moving away from the product's core value.

## 5. MVP Screen Priorities

- Cluster overview.
- Cluster detail.
- Evidence panel.
- Label review controls.
- Verdict/status state.
- Empty/loading/error states.

Priority order:

- Cluster overview should help a reviewer choose where to look next.
- Cluster detail should frame the AI label and the case context.
- Evidence panel should make linked support, contradiction, and missing evidence easy to inspect.
- Label review controls should make the analyst judgment explicit.
- Verdict/status state should summarize the current stance without overstating certainty.
- Empty/loading/error states should feel calm, specific, and trustworthy.

## 6. Acceptance Criteria

- The docs clearly say the project is inspired by Wealthsimple-level restraint and trust clarity, not a clone.
- The docs define the core UX loop as evidence review, not generic analytics.
- The docs warn future agents not to build a noisy cyber dashboard.
- The docs include enough visual guidance that future UI work stays consistent.
- No actual implementation changes yet unless Issue #1 requires them.

## How Future UI Work Should Use This

- Start from the review loop, not from a dashboard layout.
- Let evidence readability determine spacing, grouping, and emphasis.
- Keep AI-generated labels visually important but never more prominent than the proof behind them.
- Treat scores and confidence as supporting interpretation, not as decorative metrics.
- Use `docs/DESIGN_SYSTEM.md` for tokens and component rules, and use this document for product-level design intent.
