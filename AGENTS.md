# AGENTS.md

## Project Identity

Telemetry Court is an evidence-checking interface for AI-generated telemetry cluster labels and explanations.

Core question:
Can AI prove what it claims?

## Core Workflow

Cluster -> AI-generated label/explanation -> Claims -> Evidence -> Support score -> Analyst verdict

## What This Project Is

- A validation layer for AI-generated telemetry interpretations.
- A claim/evidence inspection interface.
- A calm, high-trust analyst workflow.
- A downstream companion to systems like Toponymy.

## What This Project Is Not

- Not a generic AI chatbot.
- Not a SIEM replacement.
- Not a threat-intel dashboard.
- Not a cyberpunk visualization.
- Not primarily a label generator.
- Not a place to add features unrelated to evidence validation.

## Design Rules

- Apple / Wealthsimple style.
- Minimal, spacious, calm.
- Evidence hierarchy must be clear.
- Avoid neon, cyberpunk, dense dashboards, fake terminal aesthetics.
- Prefer fewer elements with better hierarchy.
- Show uncertainty clearly.

## Design System

Before UI or styling work, read:

- `docs/DESIGN_SYSTEM.md`
- `docs/DESIGN_REFERENCE_HIGH_TRUST_FINTECH.md`

Telemetry Court uses a calm, premium, evidence-first visual language inspired by high-trust fintech/product design principles.

Do not copy Wealthsimple or any other brand's protected assets, slogans, exact layouts, icons, imagery, or proprietary visual identity.

Visual changes must support evidence inspection. Avoid cyberpunk, neon, hacker, terminal, and noisy SOC-dashboard aesthetics.

## Product Rules

- Every generated claim must be inspectable.
- Every claim should link to evidence or explicitly say evidence is missing.
- Distinguish supported, weakly supported, contradicted, and unsupported claims.
- Do not hide uncertainty.
- Do not invent evidence.
- Do not invent telemetry fields unless using clearly marked sample data.

## Coding Rules

- Prefer TypeScript.
- Prefer small, reviewable diffs.
- Inspect existing files before editing.
- Do not rewrite unrelated files.
- Do not add dependencies without explaining why.
- Keep components simple and composable.
- Use clear names from the domain model.

## Before Coding

1. Read this file.
2. Read `docs/PROJECT_CONTEXT.md`.
3. Read `docs/PRODUCT_DECISIONS.md`.
4. Inspect the relevant existing files.
5. State the intended change.

## After Coding

1. Run lint/build/tests if available.
2. Summarize changed files.
3. Update `docs/CHANGELOG_AI.md`.
4. Mention any assumptions or risks.

## Commit And Handoff Discipline

- AI-assisted work must produce a structured final summary.
- Any suggested commit must follow `docs/COMMIT_GUIDELINES.md`.
- Update `docs/CHANGELOG_AI.md` for product, model, architecture, design, workflow, test, or behavior changes.
- Do not suggest vague commit messages like "update files" or "fix stuff."
- Prefer narrow tasks and small diffs.
- Do not rewrite git history unless the user explicitly asks.
- Before UI or styling work, read `docs/DESIGN_SYSTEM.md`.
