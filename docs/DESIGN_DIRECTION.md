# Design Direction

Telemetry Court is a serious, calm validation bench for AI-generated telemetry cluster interpretations. The UI exists to clarify evidence, claims, uncertainty, reviewer choices, and evaluation output.

The visual direction uses premium restraint, warm neutral surfaces, clear hierarchy, spacious cards, subtle borders, and carefully reserved semantic color. Do not copy protected brand assets, slogans, exact layouts, icons, imagery, or proprietary identity.

## Current Interface

The current static validation slice uses a Telemetry Galaxy, case file, blind read, AI reveal, Evidence Board, Label Duel, impostor review, and verdict stages. These names describe the shipped interface. They do not make Telemetry Court a game, generic investigation environment, command center, or product category called an Evidence Arena.

The court metaphor is acceptable only when it improves evidence-based review. Avoid theatrical, competitive, or playful framing.

## Desired Feel

- calm;
- scientific;
- trustworthy;
- structured;
- interactive without feeling game-like;
- focused on evidence rather than threat drama;
- explicit about missing evidence and current limitations.

## Review Flow

```text
Landscape
-> Case File
-> Blind Review
-> AI Reveal
-> Evidence Board
-> Label Comparison
-> Outlier Review
-> Structured Verdict
-> ReviewResult
```

The interface should preserve blind review before label reveal and present one decision stage at a time. Review JSON may remain in a drawer or receipt, but its language should identify it as a local structured result until the versioned contract exists.

## Visual Hierarchy

1. Case package and cluster context.
2. Evidence visible before AI label.
3. AI-generated label and explicit claims.
4. Evidence-to-claim classification.
5. Candidate-label comparison.
6. Cluster purity and outlier selection.
7. Failure modes and uncertainty.
8. Structured verdict and result export.

## Avoid

- Neon, Matrix green, cyberpunk, hacker, fake terminal, threat-wall, or SOC aesthetics.
- Dense dashboard grids.
- Command-center or live-operations framing.
- Courtroom theater, scoring, leaderboards, or competitive gamification.
- Decorative visuals that do not clarify evidence or uncertainty.
- Generic chatbot-first layouts.
- Required free-text fields in the main workflow.

## Preferred Patterns

- Use the landscape as a case selector, not as a claim of raw telemetry exploration.
- Reveal the AI label only after a blind structured choice.
- Make evidence items explicitly classifiable against specific claims.
- Use candidate-label cards for serious comparison.
- Use representative sessions for cluster-coherence review.
- Use structured failure modes, verdicts, and recommended actions.
- Show provenance, sanitization, missing evidence, and unavailable metrics plainly when those fields exist.

## Interaction And Accessibility

Use buttons, segmented controls, chips, and selectable cards for the main workflow. Free text may be optional expert annotation. Preserve keyboard access, visible focus, reduced motion, text equivalents for visual encoding, and no color-only status.
