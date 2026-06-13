# Design Direction

Telemetry Court should feel like a serious, calm, evidence-first investigation environment.

The visual direction remains Apple / Wealthsimple / Linear-inspired in spirit: premium restraint, warm neutral canvas, clear hierarchy, spacious cards, subtle borders, and carefully reserved semantic color. Do not copy any protected brand assets, slogans, exact layouts, icons, imagery, or proprietary visual identity.

## Current Product Feel

The Evidence Arena should feel:

- calm;
- scientific;
- trustworthy;
- structured;
- interactive without feeling gamey;
- attractive for a workshop audience;
- focused on evidence rather than threat drama.

## Avoid

- Neon, Matrix green, cyberpunk, hacker, fake terminal, or SOC-wall aesthetics.
- Dense dashboard grids that make the user scan everything at once.
- Decorative visuals that do not clarify evidence, uncertainty, or review state.
- Generic chatbot-first layouts.
- Required free-text fields in the main workflow.

## Preferred Patterns

- Start with a telemetry landscape that communicates multiple behavioural regions.
- Use case-file language for selected clusters.
- Reveal the AI label only after a blind structured choice.
- Use evidence cards as reviewable objects with explicit classification controls.
- Use candidate-label cards for the label duel.
- Use representative-session cards for impostor/outlier selection.
- Use chips for reasons and failure modes.
- Use a structured verdict panel and JSON preview/export for review output.

## Visual Hierarchy

Prioritize:

1. Behavioural region / case context
2. Evidence before AI label
3. AI claim reveal
4. Evidence classification
5. Candidate label comparison
6. Cluster purity / impostor session
7. Failure modes
8. Structured verdict and export

## Color

Use the tokens in `docs/DESIGN_SYSTEM.md`. Semantic color should clarify evidence state or review state:

- Supported
- Weak support
- Contradicted
- Unsupported / overclaimed
- Impure
- Uncertain

Do not use color as decoration or rely on color alone.

## Interaction

The primary workflow is structured-choice first. Use buttons, segmented controls, chips, and selectable cards. Free text can be optional expert input later, but must not block review completion.
