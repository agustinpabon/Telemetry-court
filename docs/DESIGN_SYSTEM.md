# Telemetry Court Design System

This is the official design system for Telemetry Court. It defines how the product should feel, how UI decisions should be made, and how future visual work should support evidence inspection.

Use this document with `docs/DESIGN_DIRECTION.md`: design direction defines the product north star and UX target, while this document defines the reusable system rules, tokens, and component guidance.

## 1. Design Positioning

Telemetry Court should feel calm, premium, spacious, trustworthy, evidence-first, analyst-friendly, minimal, and warm but serious. Its visual direction is high-trust fintech-inspired: Apple / Wealthsimple-class restraint, but not copied from either.

Telemetry Court's design goal is not to look like a SOC dashboard. It should not use cyberpunk, hacker, neon, terminal, or threat-map aesthetics. It should feel like a calm premium product UI for judging whether AI-generated interpretations are supported by evidence.

## 2. Core Interface Principle

Evidence first, ornament last.

The UI exists to help analysts judge whether AI-generated claims are supported by evidence. Visual hierarchy must make claim -> evidence -> score -> verdict easy to inspect. Color should clarify support status, not decorate. Uncertainty must be visible. Missing evidence must be shown calmly and explicitly.

AI output must never visually outrank the supporting evidence that justifies it.

## 3. Legal-Safe Inspiration Boundary

Telemetry Court may use structural design inspiration from high-trust fintech and product interfaces, including Wealthsimple-style research, but it must not reproduce protected brand expression.

- Use structural principles, not protected expression.
- Do not copy brand assets, logos, slogans, screenshots, exact screen layouts, icon sets, illustrations, 3D renders, or marketing copy.
- Do not make the product look like it belongs to Wealthsimple.
- Do use calm spacing, rounded cards, restrained color, direct copy, high contrast, and trust-signalling clarity.
- Telemetry Court must have its own identity, vocabulary, evidence model, and interaction patterns.

This design system is for a legally safe, Telemetry Court-specific visual language: high-trust fintech-inspired, not a visual clone.

## 4. Visual Language

Use neutral base surfaces, a warm off-white canvas, soft muted panels, restrained semantic accents, rounded cards, subtle borders instead of heavy shadows, thin minimal icons if icons are used, sparse layouts, clear typography hierarchy, and minimal decorative elements.

Avoid dense dashboard grids, glowing charts, neon colors, fake terminals, cyberpunk gradients, overly dramatic alert styling, excessive badges, and generic AI sparkle visuals.

Visual changes should communicate evidence state, inspection priority, and analyst judgment. Decoration should be rare and quiet.

## 5. Design Tokens

These are Telemetry Court tokens. They are not Wealthsimple tokens. They are an initial direction and may evolve as the product matures. Semantic colors must not rely on color alone; always pair color with text, labels, icons, or accessible descriptions.

```css
:root {
  --tc-ink: #32302f;
  --tc-bg: #f4f2ee;
  --tc-surface: #fbfaf7;
  --tc-surface-muted: #efede7;
  --tc-border: rgba(50, 48, 47, 0.1);
  --tc-muted: rgba(50, 48, 47, 0.62);
  --tc-faint: rgba(50, 48, 47, 0.08);

  --tc-supported: #3f7d55;
  --tc-weak: #9a6a2f;
  --tc-contradicted: #9b3d35;
  --tc-unsupported: #6f625c;
  --tc-insufficient: #6b6f7a;
  --tc-focus: #5f6f52;

  --tc-radius-sm: 12px;
  --tc-radius-md: 18px;
  --tc-radius-lg: 24px;
  --tc-radius-xl: 32px;

  --tc-space-1: 4px;
  --tc-space-2: 8px;
  --tc-space-3: 12px;
  --tc-space-4: 16px;
  --tc-space-5: 24px;
  --tc-space-6: 32px;
  --tc-space-7: 48px;
  --tc-space-8: 64px;
}
```

## 6. Color Usage Ratio

Use this starting ratio:

- 80% neutral surfaces and ink.
- 15% warm muted fields.
- 5% semantic accents.

The app should mostly feel neutral. Status colors should appear only where they clarify claim, evidence, score, verdict, or risk state. Avoid colorful dashboards and decorative palettes.

## 7. Typography

Product UI should use a clean system sans-serif by default. Do not add external fonts by default, and do not add external fonts in documentation-only or small styling tasks. A marketing or editorial serif can be considered later only if it is licensed and product-appropriate.

Use generous line height and avoid tiny dense text. Establish a strong hierarchy for case title, AI-generated label, claim text, evidence summary, support score, and analyst verdict.

Recommended scale:

- Page title: 40-56px desktop, 30-36px mobile.
- Section title: 24-32px.
- Card title: 16-20px.
- Body: 15-17px.
- Metadata: 12-14px.
- Score number: 32-48px.
- Button label: 14-16px, semibold.

## 8. Layout and Spacing

Use an 8px spacing foundation, generous whitespace, and max content widths where appropriate. Avoid edge-to-edge dense panels. Cards should have breathing room. Related claim and evidence elements should sit visually close. Unrelated panels should be separated by spacing rather than heavy borders.

Recommended layout values:

- Card radius: 18-24px.
- Major panel radius: 24-32px.
- Panel padding: 20-32px.
- Section gap: 24-48px.
- Page padding: 24-64px depending on viewport.

## 9. Component Guidance

### Cards

Cards should be rounded, light-surface containers with subtle borders, minimal shadow, and clear title/body hierarchy. Use cards for evidence objects, claim summaries, case summaries, and bounded review decisions.

### Buttons

Buttons may be pill-shaped or softly rounded. Use one primary action per region. Preserve high contrast and avoid flashy gradients.

### Status Pills

Status pills should be compact and include text plus color. Never use color alone. Status labels must map directly to the support status values:

- `supported`
- `weakly_supported`
- `contradicted`
- `unsupported`
- `insufficient_evidence`

### Claim Rows

Claim rows must be scannable. Put claim text first, support status second, score third, and evidence count or evidence chips last. The analyst should understand the claim before seeing decorative or secondary metadata.

### Evidence Cards

Evidence cards should show evidence title, source type, polarity, strength, and relation explanation when selected. Distinguish supporting and contradicting evidence calmly, without alarmist styling.

### Score Panels

Score panels should emphasize the score but not overstate certainty. Include rationale and show missing evidence states explicitly.

### App Shell

The app shell should feel quiet, warm, and spacious. Prefer an off-white background, muted surfaces, dark warm text, restrained borders, and only occasional pastel fields for orientation or empty states. Do not turn the shell into a dashboard frame with heavy chrome, dense sidebars, or decorative metrics.

### Empty States

Empty states should be calm, specific, and useful. Do not use cute filler. Explain what is missing and suggest the next action if appropriate.

### Warnings / Risks

Warnings should use muted severity. Avoid alarmist red unless contradiction or high-risk evidence requires it. Explain the condition clearly.

### Filters

Filters should be simple chips or segmented controls with visible selected state. They must be keyboard accessible and should help inspect evidence rather than create complexity.

## 10. Motion and Interaction

Use subtle hover and tap transitions, typically 120-220ms. Avoid flashy animation and unnecessary motion. Support reduced motion.

Selection should clarify relationships between claims and evidence. Hover and focus states should be visible but quiet.

## 11. Content Voice

Telemetry Court copy should be calm, precise, plainspoken, short, analyst-friendly, evidence-grounded, and transparent about uncertainty.

Avoid hype, sensational threat language, AI magic, fake urgency, vague claims like "powerful insights", and overconfident verdicts without evidence.

Preferred wording examples:

- "Evidence is missing for this claim."
- "This claim is weakly supported."
- "The label may overstate the cluster behavior."
- "Contradicting evidence was found."
- "Review the linked sessions before accepting this label."

## 12. Accessibility

Use visible focus states, semantic HTML, strong contrast, keyboard-accessible filters and selection, no color-only status, ARIA only where useful, and reduced-motion support.

Charts or scores must have text equivalents. Evidence relationships must be understandable without color.

## 13. Telemetry Court UI Hierarchy

Any UI redesign should preserve this order unless there is a documented product decision:

1. Case / cluster context
2. AI-generated label or explanation
3. Claims
4. Evidence
5. Support score
6. Analyst verdict
7. Risks / missing evidence

This hierarchy aligns to the core review loop:

```text
Cluster -> Proposed label -> Supporting evidence -> Confidence -> Verdict
```

## 14. Implementation Rules for Future UI Work

- Use the existing CSS approach unless asked otherwise.
- Do not add a design library by default.
- Do not add external fonts by default.
- Do not restyle unrelated components.
- Prefer tokenized CSS variables.
- Keep visual changes small and reviewable.
- If changing layout, explain how it improves evidence inspection.
- Do not introduce decorative charts or dense operational dashboard patterns unless a product decision explicitly requires them.
