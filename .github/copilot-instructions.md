# GitHub Copilot Instructions

Telemetry Court is an interactive evidence arena for AI-generated interpretations of cyber telemetry clusters.

Core product line:

```text
AI names the pattern. Humans test the evidence.
```

Core question:

```text
Can AI prove what it claims?
```

The previous framing of Telemetry Court as a simple approve/reject label validator is superseded. Treat `docs/PRODUCT_VISION.md` and `docs/PROJECT_CONTEXT.md` as the current source of truth.

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

## Product Direction

- Treat AI-generated interpretations as testable claims.
- Keep the product focused on evidence-first investigation and structured human verdicts.
- Do not require typed text for the happy path.
- Use structured choices for interpretation choices, evidence classifications, label duel choices, impostor/outlier selection, failure-mode chips, and verdicts.
- Use Toponymy concepts as upstream inspiration only.
- Do not create Toponymy integration code unless explicitly requested.
- Use only synthetic sample data unless a future task defines a safe import boundary.

## Style Direction

- Apple / Wealthsimple / Linear inspired in principle: calm, minimal, spacious, premium, trustworthy, and restrained.
- Evidence-first hierarchy.
- No cyberpunk, neon, terminal theater, noisy SOC dashboard styling, or fake incident drama.
- Follow `docs/DESIGN_SYSTEM.md`, `docs/DESIGN_DIRECTION.md`, and `docs/DESIGN_REFERENCE_HIGH_TRUST_FINTECH.md` for UI and visual suggestions.
- Preserve the calm, evidence-first hierarchy in visual changes.
- Do not copy protected brand assets, exact layouts, icons, imagery, slogans, screenshots, or proprietary visual identity.

## Coding Expectations

- Prefer TypeScript, Next.js App Router, and Tailwind.
- Keep the frontend simple and static-data friendly.
- Make the smallest safe change.
- Keep changes narrow and reviewable.
- Do not add backend/API dependencies unless explicitly scoped.
- Do not add packages without a clear reason.
- Use domain names from `docs/DATA_MODEL.md` and `lib/types.ts`.
- Preserve `evidenceRelations` as the canonical claim-to-evidence link.

## Evidence Expectations

- Every generated claim should map to evidence IDs or explicitly show missing evidence.
- Every evidence card should be classifiable as supports, weak support, irrelevant/noise, contradicts, or needs context.
- Distinguish supported, weakly supported, contradicted, unsupported, overclaimed, impure, and uncertain states.
- Do not hide uncertainty.
- Do not invent evidence.

## Validation Expectations

- Run `npm test`, `npm run lint`, and `npm run build` when code or config changes require it.
- For docs-only changes, run available docs-safe checks or document why code checks were unnecessary.
- Update `docs/CHANGELOG_AI.md` after AI-assisted product, planning, workflow, design, model, test, or behavior changes.
- Follow `docs/COMMIT_GUIDELINES.md`.
- PRs or summaries should include why, what changed, validation, risks, and unrelated dirty files left untouched.
