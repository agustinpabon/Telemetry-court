# Telemetry Court Roadmap

## Current Status

Telemetry Court is a frontend-first prototype for checking whether AI-generated telemetry cluster labels and explanations are supported by evidence.

The repo currently has:

- Product, architecture, data model, design system, workflow, and commit-standard documentation.
- A Next.js App Router prototype using synthetic sample data.
- A canonical runtime path for claim-to-evidence links through `evidenceRelations`.
- Shared case metrics helpers and focused unit coverage.
- No backend, authentication, live AI generation, telemetry ingestion, or production data handling.

Current execution focus: polish the static evidence-review MVP so a reviewer can open one case, inspect the generated label and explanation, review each claim, inspect linked evidence, understand support status, and decide whether to accept or reject the label.

## Work Tracks

### UI / UX

Make the product understandable, calm, accessible, and easy to scan. If only the builders can read it, the tool is not done.

### Telemetry / Data

Prepare clusters, evidence, labels, fixtures, and adapters that make telemetry-like data usable without introducing real or sensitive telemetry into the repo.

### AI Agents

Define interpretation-agent contracts that cite sources, expose uncertainty, extract claims, and ask for proof rather than merely generating plausible labels.

### Scoring / Evaluation

Define and test the rubric for correctness, grounding, usefulness, support strength, contradiction, missing evidence, and confidence.

### Backend / Platform

Connect the workflow through storage, APIs, import/export boundaries, CI, evaluation runs, and fast iteration only when the static workflow has earned that complexity.

### Security / Governance

Keep data where it belongs: synthetic or research-grade, auditable, explicit about limitations, and not production-risky.

## Milestone Overview

| Milestone | Status | Goal |
|---|---|---|
| Milestone 0 — Foundation And Agent Discipline | Mostly complete | Make the repo safe for AI-assisted development before building more product surface. |
| Milestone 1 — Polished Static Evidence Review MVP | Active | Turn the current static prototype into a clean, usable evidence-review product without backend, auth, live AI, or live telemetry ingestion. |
| Milestone 2 — Evidence Integrity And Scoring Evaluation | Planned | Make the evidence/scoring layer harder to break and easier to explain. |
| Milestone 3 — Telemetry And Data Adapter MVP | Planned | Define how real or semi-real telemetry would enter Telemetry Court without building a full ingestion platform yet. |
| Milestone 4 — AI Agent Interpretation Loop | Planned | Define how an AI-generated label/explanation becomes claims that must be proven. |
| Milestone 5 — Backend And Platform Readiness | Planned | Prepare for persistence, CI, import/export boundaries, and repeatable workflows without prematurely building a full backend. |
| Milestone 6 — Security, Governance, And v0.1 Release | Planned | Make the public demo safe, honest, auditable, and release-ready. |

## Milestone 0 — Foundation And Agent Discipline

### Status

Mostly complete.

### Goal

Make the repo safe for AI-assisted development before building more product surface.

### Completed Foundation Work

- Repository context and agent instructions.
- Product direction and non-goals.
- Architecture notes.
- Canonical data model documentation.
- Runtime case model alignment.
- Case metrics helpers.
- Case metrics tests.
- Canonical evidence relations.
- Evidence-first design system documentation.
- High-trust fintech design reference with legal-safe boundaries.
- Development workflow and commit standards.
- Pull request template and AI changelog practice.

### Definition of Done

- Agents know what Telemetry Court is and is not.
- Product, model, architecture, design, and workflow docs exist.
- Claim-to-evidence linking has one canonical relationship path.
- Checks can be run consistently with `npm test`, `npm run lint`, and `npm run build`.
- Future work can be scoped as small, reviewable issues.

## Milestone 1 — Polished Static Evidence Review MVP

### Status

Active.

### Goal

Turn the current static prototype into a clean, usable evidence-review product without backend, auth, live AI, or live telemetry ingestion.

### Why This Comes Next

The product needs to prove its core review loop before adding infrastructure. A user should be able to understand the generated label, inspect claims, see linked evidence, understand support and contradiction, and make an analyst verdict using only static sample data.

This milestone keeps the focus on the question: can AI prove what it claims?

### Planned Issues

- `style(tokens): add global Telemetry Court design tokens`
- `style(app-shell): align app canvas and panel surfaces`
- `style(claim-ledger): improve claim scanning hierarchy`
- `style(evidence-cards): clarify source, polarity, and strength`
- `feat(claim-selection): select a claim and highlight linked evidence`
- `feat(evidence-filtering): filter evidence through canonical relations`
- `test(render): add smoke coverage for core case review flow`

### Definition of Done

- The static app feels calm, spacious, and evidence-first.
- Global visual tokens exist and are used by follow-up styling work.
- Claims are easy to scan by text, status, score, and linked evidence.
- Evidence cards clearly show source, polarity, strength, and relation explanation.
- A reviewer can select a claim and see related evidence without relying on color alone.
- Evidence filtering uses canonical `evidenceRelations`.
- The core case review language has lightweight render or smoke coverage.
- `npm test`, `npm run lint`, and `npm run build` pass.
- No backend, live AI, auth, real telemetry, or dependency expansion is introduced.

## Milestone 2 — Evidence Integrity And Scoring Evaluation

### Goal

Make the evidence/scoring layer harder to break and easier to explain.

### Candidate Issues

- `model(case-integrity): validate claim-evidence relation completeness`
- `test(case-integrity): cover orphan claims and orphan evidence`
- `docs(scoring): define support scoring rubric`
- `model(scoring): add evidence strength aggregation helper`
- `feat(export): export case summary as markdown or JSON`

### Definition of Done

- Invalid or incomplete claim-evidence relationships are detectable.
- Orphan claims and orphan evidence are covered by tests or validation helpers.
- The scoring rubric explains support, weak support, contradiction, unsupported claims, and insufficient evidence.
- Evidence strength aggregation is deterministic and easy to inspect.
- Exported summaries preserve claims, evidence, scores, uncertainty, and verdicts.

## Milestone 3 — Telemetry And Data Adapter MVP

### Goal

Define how real or semi-real telemetry would enter Telemetry Court without building a full ingestion platform yet.

### Candidate Issues

- `docs(adapter): define Telemetry Court input contract`
- `model(adapter): define imported cluster interpretation schema`
- `data(fixtures): add imported cluster case fixture`
- `test(fixtures): validate imported case fixture shape`
- `docs(toponymy): document Toponymy handoff assumptions`

### Definition of Done

- A documented input contract explains what upstream systems must provide.
- Imported cluster interpretation shape maps cleanly into the case model.
- Fixtures remain synthetic and safe.
- Fixture validation catches obvious shape errors.
- Toponymy handoff assumptions are documented without adding a hard dependency.

## Milestone 4 — AI Agent Interpretation Loop

### Goal

Define how an AI-generated label/explanation becomes claims that must be proven.

### Candidate Issues

- `docs(ai-contract): define AI interpretation output contract`
- `model(ai-output): define generated claim schema`
- `data(ai-fixture): add mock AI interpretation fixture`
- `docs(prompts): add claim extraction prompt template`
- `docs(prompts): add evidence-grounding critique prompt template`
- `test(ai-output): handle malformed AI output`

### Definition of Done

- AI output contracts distinguish label, explanation, claims, uncertainty, and required evidence.
- Generated claims have a schema that can be validated before review.
- Mock AI fixtures remain clearly synthetic.
- Prompt templates ask for grounded claims and evidence critique.
- Malformed AI output is handled explicitly instead of silently becoming trusted evidence.

## Milestone 5 — Backend And Platform Readiness

### Goal

Prepare for persistence, CI, import/export boundaries, and repeatable workflows without prematurely building a full backend.

### Candidate Issues

- `chore(ci): add GitHub Actions for test lint build`
- `docs(platform): document persistence options`
- `feat(import-export): add local case import export boundary`
- `refactor(case-loading): add case loading abstraction`
- `fix(case-loading): handle invalid case files safely`

### Definition of Done

- CI runs the standard checks.
- Persistence options are documented with tradeoffs and non-goals.
- Local import/export boundaries are explicit and safe.
- Case loading has a narrow abstraction that does not force a backend.
- Invalid case files fail safely and explain what went wrong.

## Milestone 6 — Security, Governance, And v0.1 Release

### Goal

Make the public demo safe, honest, auditable, and release-ready.

### Candidate Issues

- `docs(data-policy): add telemetry sample handling policy`
- `docs(security): define security boundaries`
- `docs(audit): document audit-trail concept`
- `data(samples): review sample data for sensitive content`
- `docs(release): add v0.1 release checklist`
- `docs(readme): add demo walkthrough`
- `docs(release): prepare v0.1 release notes`

### Definition of Done

- Data policy clearly prohibits secrets, customer data, and real incident claims in sample fixtures.
- Security boundaries explain what the demo does and does not protect.
- Audit-trail concepts are documented before persistence is added.
- Sample data has been reviewed for sensitive content.
- Release checklist and notes are ready for a public v0.1 demo.
- README explains the demo honestly without overclaiming product maturity.

## Issue Creation Rule

Only create detailed GitHub issues for the current active milestone and the next one when the current milestone is nearly complete.

Do not create every candidate issue as a GitHub issue up front. Candidate issues are planning inventory, not execution commitments.

## Product Guardrails

- Telemetry Court validates AI-generated interpretations; it is not primarily a label generator.
- Every generated claim must be inspectable.
- Every claim should link to evidence or explicitly say evidence is missing.
- Distinguish supported, weakly supported, contradicted, unsupported, and insufficient-evidence claims.
- Do not hide uncertainty.
- Do not invent evidence.
- Do not introduce real telemetry, secrets, customer data, or incident claims.
- Do not turn the product into a SIEM, chatbot, threat-intelligence dashboard, or cyberpunk SOC interface.
- Visual work must support evidence inspection and follow `docs/DESIGN_SYSTEM.md`.

## Checks Required Before Closing Issues

- `npm test`
- `npm run lint`
- `npm run build`
- Documentation updated when product, model, architecture, workflow, design, test, or behavior context changes.
- PR description follows `.github/pull_request_template.md`.
- UI changes include screenshots or recordings.
- Evidence-model changes explain claim, evidence, relation, score, verdict, and audit impact.
