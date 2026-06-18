# AGENTS.md

## Project Identity

Telemetry Court is an interactive evidence arena for AI-generated interpretations of cyber telemetry clusters.

Core line:

```text
AI names the pattern. Humans test the evidence.
```

Core question:

```text
Can AI prove what it claims?
```

The previous framing of Telemetry Court as a simple approve/reject label validator is superseded. Treat [docs/PRODUCT_VISION.md](./docs/PRODUCT_VISION.md) and [docs/PROJECT_CONTEXT.md](./docs/PROJECT_CONTEXT.md) as the current source of truth.

## Core Workflow

```text
Telemetry landscape
-> behavioural region / case file
-> blind investigation
-> AI label reveal
-> evidence classification
-> label duel
-> impostor / outlier selection
-> structured verdict
-> review JSON export
```

## What This Project Is

- An evidence-first investigation interface.
- A trust layer for AI-assisted telemetry interpretation.
- A structured human-in-the-loop evaluation environment.
- A claim/evidence inspection interface.
- A downstream companion to systems like Toponymy.
- A way to produce structured review data about labels, evidence packets, prompts, and clusters.

## What This Project Is Not

- Not a generic AI chatbot.
- Not a SIEM replacement.
- Not a SOC dashboard.
- Not a threat-intel dashboard.
- Not a cyberpunk visualization.
- Not primarily a label generator.
- Not a place to add features unrelated to evidence validation.

## Design Rules

- Apple / Wealthsimple / Linear style principles: calm, premium, spacious, restrained.
- Evidence hierarchy must be clear.
- Avoid neon, cyberpunk, dense dashboards, fake terminal aesthetics, and Matrix green.
- Prefer fewer elements with better hierarchy.
- Show uncertainty clearly.
- Make the interface interactive without making it unserious.

## Design System

Before UI or styling work, read:

- `docs/DESIGN_SYSTEM.md`
- `docs/DESIGN_DIRECTION.md`
- `docs/DESIGN_REFERENCE_HIGH_TRUST_FINTECH.md`

Telemetry Court uses a calm, premium, evidence-first visual language inspired by high-trust fintech/product design principles.

Do not copy Wealthsimple or any other brand's protected assets, slogans, exact layouts, icons, imagery, or proprietary visual identity.

## Product Rules

- Do not require typed text for the main workflow.
- Use structured choices for blind interpretation, evidence classification, label duel, impostor selection, failure modes, and verdict.
- Every generated claim must be inspectable.
- Every claim should link to evidence or explicitly say evidence is missing.
- Every evidence card should be classifiable as supports, weak support, irrelevant/noise, contradicts, or needs context.
- Distinguish supported, weakly supported, contradicted, unsupported, overclaimed, impure, and uncertain states.
- Do not hide uncertainty.
- Do not invent evidence.
- Do not invent telemetry fields unless using clearly marked sample data.
- The official factual source for Toponymy in this repo is the `TutteInstitute/toponymy` GitHub repository: <https://github.com/TutteInstitute/toponymy>
- Do not treat DeepWiki, generated summaries, or other third-party pages as authoritative for Toponymy facts.
- Do not invent Toponymy APIs, workflows, capabilities, function signatures, supported models, or outputs.

## Coding Rules

- Prefer TypeScript.
- Prefer small, reviewable diffs.
- Inspect existing files before editing.
- Do not rewrite unrelated files.
- Do not add dependencies without explaining why.
- Keep components simple and composable.
- Use clear names from the domain model.
- Keep local sample data synthetic and safe.

## Before Coding

1. Read this file.
2. Read `docs/PRODUCT_VISION.md`.
3. Read `docs/PROJECT_CONTEXT.md`.
4. Read `docs/PRODUCT_DECISIONS.md`.
5. Inspect relevant existing files.
6. State the intended change.

Before UI or styling work, also read `docs/DESIGN_SYSTEM.md`.

## After Coding

1. Run formatting if configured.
2. Run tests.
3. Run lint.
4. Run build.
5. Update `docs/CHANGELOG_AI.md`.
6. Summarize changed files.
7. Mention assumptions or risks.

## Commit And Handoff Discipline

- AI-assisted work must produce a structured final summary.
- Any suggested commit must follow `docs/COMMIT_GUIDELINES.md`.
- Update `docs/CHANGELOG_AI.md` for product, model, architecture, design, workflow, test, or behavior changes.
- Do not suggest vague commit messages like "update files" or "fix stuff."
- Prefer narrow tasks and small diffs.
- Do not rewrite git history unless the user explicitly asks.

## Agent skills

- Use local markdown issue files under `./issues/`.
- Use `$grill-me` before planning or coding.
- Use `$to-prd` after the grilling session.
- Use `$to-issues` to create vertical-slice / tracer-bullet issues.
- Mark issues as `AFK` or `human-in-the-loop`.
- Use `$tdd` for implementation work where practical.
- Use fresh-context review before merge.
- Do not touch existing unstaged feature files.
- Do not commit anything.
