# Contributing

Telemetry Court is an evidence-based human-in-the-loop validation bench for AI-generated telemetry cluster interpretations. The current application is a static synthetic validation slice; the next implementation milestone is the Case Package Contract and Validation Infrastructure.

## Setup

```bash
npm install
npm run dev
```

Run checks with:

```bash
npm test
npm run lint
npm run build
```

## Before Contributing

Read `AGENTS.md`, `docs/PRODUCT_VISION.md`, `docs/PRODUCT_POSITIONING.md`, `docs/PROJECT_CONTEXT.md`, and `docs/PRODUCT_DECISIONS.md`. For schema, backend, import, persistence, or evaluation work, also read `docs/CASE_PACKAGE_CONTRACT.md`, `docs/EVALUATION_INFRASTRUCTURE.md`, and `docs/ARCHITECTURE.md`.

## Contribution Rules

- Keep changes narrow and use existing TypeScript and Next.js patterns.
- Preserve the distinction between `CasePackage`, `ReviewResult`, and `EvaluationReport`.
- Do not add generic dashboards, SIEM/SOC workflows, alert triage, raw log search, chat-first UX, gamification, generic CRUD, or auth-first infrastructure.
- Do not add a database or API unless a defined contract and evaluation requirement needs it.
- Keep sample data synthetic, sanitized, or explicitly approved.
- Preserve evidence IDs, provenance, sanitization metadata, and visible uncertainty.
- Use only the official `TutteInstitute/toponymy` repository for factual Toponymy claims.
- Do not claim current Toponymy or ACME4 integration.
- Do not add dependencies without a clear reason.

## Pull Requests

Keep PRs focused. Explain the validation outcome, contract impact, evidence/provenance impact, current-versus-target capability, checks, and risks. Use `.github/pull_request_template.md` and update `docs/CHANGELOG_AI.md` for material AI-assisted changes.
