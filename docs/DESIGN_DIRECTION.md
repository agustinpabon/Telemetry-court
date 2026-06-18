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

## Immersive Evidence Arena Direction

The app should open as a spatial Telemetry Galaxy with the five synthetic behavioural regions visible as the primary interaction. The map should use restrained visual encoding for model agreement, evidence strength, uncertainty, impurity, and overclaim risk.

Selecting a behavioural region should update an investigation cockpit immediately. The cockpit should feel like a calm scientific instrument panel, with case title, hidden or revealed AI claim state, compact metadata, key metrics, top features, risk flags, progress, and the next structured action. Detailed evidence, neighbour, and session material belongs in the active stage rather than being duplicated in the inspector.

The investigation workflow should be staged rather than a long vertical document:

```text
Landscape
-> Case File
-> Blind Read
-> AI Reveal
-> Evidence Board
-> Label Duel
-> Impostor
-> Verdict
```

Only one stage should occupy the main workspace at a time. The review summary and JSON export should remain available as a drawer or judgment receipt rather than always consuming page space.

Motion should clarify state changes: selected cluster focus, cockpit updates, stage transitions, AI reveal, evidence-balance changes, and verdict receipt reveal. Motion must remain subtle, non-blocking, and compatible with `prefers-reduced-motion`.

## Visual Excellence Constraints

The immersive shell should read as a command-center composition rather than a stack of dashboard cards:

- Top bar, stage rail, main stage, and inspector must fit common desktop viewports without clipped headings or horizontal overflow.
- The stage rail should be persistent but visually quiet.
- The Telemetry Galaxy should be the primary spatial object, using compact islands/nodes, halos, rings, and relationship lines rather than rectangular information cards.
- The cockpit should remain a focused inspector and action surface, not a duplicated case document.
- Each workflow stage should present one strong composition at a time, with secondary details compressed or moved into the review drawer when viewport height is limited.
- JSON export must remain available, but it should not dominate the visual hierarchy.

## Cinematic Spatial Composition

The interface uses two spatial modes:

- Explore / Galaxy Mode: the Telemetry Galaxy is the environment. It should feel frameless, layered, and alive, with ambient session points, region halos, relationship arcs, selected-cluster focus, and a floating contextual inspector.
- Investigation Mode: the active stage becomes the focus, but a compact semantic mini-map keeps the selected behavioural region anchored in the larger galaxy.

The shell should not depend on one fixed maximum width. It should adapt fluidly across viewport sizes and browser zoom levels using clamp-based spacing/type, fluid grid columns, compact stage rails, and responsive cockpit behavior.

When a stage has naturally concise content, fill the space with purposeful scientific visualization structure rather than extra copy: sealed-claim indicators, comparison lanes, evidence balance instruments, label-duel lanes, session orbits, or judgment receipts.

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
