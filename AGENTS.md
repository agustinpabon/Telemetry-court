# AGENTS.md

## Project Identity

Telemetry Court is an evidence-based human-in-the-loop validation bench for AI-generated telemetry cluster interpretations.

```text
AI names the cluster. Humans test the evidence.
```

Core question:

```text
Given a telemetry cluster and an AI-generated label or explanation,
is that interpretation actually supported by the evidence?
```

Treat `docs/PRODUCT_VISION.md`, `docs/PRODUCT_POSITIONING.md`, and `docs/PROJECT_CONTEXT.md` as the current product source of truth. The older Evidence Arena identity and frontend-MVP framing are superseded. Current arena terminology may describe UI components, but it must not define the product.

## Current State And Next Milestone

- The current application is a static validation slice with synthetic cases and local review export.
- Real Toponymy ingestion, ACME4 ingestion, package validation, persistence, multi-reviewer aggregation, and evaluation reports are not implemented.
- The next implementation milestone is Case Package Contract and Validation Infrastructure.
- Backend work must start with `CasePackage`, `ReviewResult`, and `EvaluationReport` contracts, not generic APIs, databases, or authentication.

## Product Boundary

```text
Upstream clustering and labeling systems
-> versioned CasePackage JSON
-> Telemetry Court validation and review
-> ReviewResult JSON
-> EvaluationReport metrics
-> upstream pipeline improvement
```

Telemetry Court owns reviewability, evidence grounding, auditability, structured human verdicts, and evaluation output. It does not own raw telemetry processing, live detection, or operational response.

## Core Review Workflow

```text
Telemetry landscape
-> case package
-> blind review
-> AI label reveal
-> evidence classification
-> label comparison
-> impostor / outlier selection
-> structured verdict
-> ReviewResult export
-> multi-reviewer EvaluationReport
```

## Product Rules

- Do not require typed text for the main workflow.
- Every generated claim must link to evidence or explicitly say evidence is missing.
- Evidence must be classifiable as supports, weak support, irrelevant/noise, contradicts, insufficient, or needs more context.
- Preserve uncertainty and incomplete judgments.
- Keep `CasePackage`, `ReviewResult`, and `EvaluationReport` distinct.
- Preserve stable IDs, evidence provenance, sanitization metadata, and claim-to-evidence traceability.
- Package validation must fail loudly on broken IDs, links, versions, or required provenance.
- Keep local sample data synthetic and safe.
- The official factual source for Toponymy is the [TutteInstitute/toponymy](https://github.com/TutteInstitute/toponymy) repository.
- Do not invent Toponymy APIs, workflows, capabilities, function signatures, supported models, or outputs.

## Do Not Drift Toward

- generic dashboards or telemetry explorers;
- SIEM, SOC, EDR, alert-triage, or incident-response workflows;
- raw log search or live telemetry ingestion;
- chat-first UX or gamification;
- auth-first backend work;
- generic CRUD or database work without a case package contract;
- speculative enterprise or SaaS features;
- visual polish as a substitute for validation proof.

## Implementation Priorities

1. Case package schema and versioning.
2. Runtime package validation.
3. Evidence provenance and sanitization.
4. Structured review results.
5. Multi-reviewer aggregation.
6. Evaluation exports and deterministic metrics.
7. Toponymy and ACME4 adapter boundaries.

## Design Rules

- Follow `docs/DESIGN_SYSTEM.md`, `docs/DESIGN_DIRECTION.md`, and `docs/DESIGN_REFERENCE_HIGH_TRUST_FINTECH.md` for UI work.
- Keep the interface calm, premium, spacious, restrained, and evidence-first.
- Avoid neon, cyberpunk, fake terminal, threat-wall, dense dashboard, and theatrical courtroom aesthetics.
- Prefer fewer elements with clear evidence hierarchy.
- Do not copy protected brand assets, slogans, exact layouts, icons, imagery, or proprietary identity.

## Coding Rules

- Prefer TypeScript and existing repository patterns.
- Prefer small, reviewable diffs.
- Inspect existing files before editing.
- Do not rewrite unrelated files or touch existing unstaged feature work.
- Do not add dependencies without explaining why.
- Keep components simple and composable.
- Use domain language from the current contracts and data model.
- Do not implement backend infrastructure unless the task explicitly reaches the relevant roadmap milestone.

## Before Work

1. Read this file.
2. Read `docs/PRODUCT_VISION.md`.
3. Read `docs/PRODUCT_POSITIONING.md`.
4. Read `docs/PROJECT_CONTEXT.md`.
5. Read `docs/PRODUCT_DECISIONS.md`.
6. For contract or backend work, read `docs/CASE_PACKAGE_CONTRACT.md`, `docs/EVALUATION_INFRASTRUCTURE.md`, and `docs/ARCHITECTURE.md`.
7. Inspect relevant existing files and git status.
8. State the intended change.

## After Work

1. Run formatting if configured.
2. Run tests, lint, and build when applicable.
3. Update `docs/CHANGELOG_AI.md` for product, architecture, workflow, model, test, or behavior changes.
4. Summarize files changed, assumptions, risks, and validation results.
5. Do not hide failures.

## Commit And Handoff Discipline

- Do not commit unless the user explicitly asks.
- Do not rewrite git history.
- Any suggested commit must follow `docs/COMMIT_GUIDELINES.md`.
- Keep handoffs explicit about current capability versus target capability.

## Agent Skills

- Use local markdown issue files under `./issues/` when issue artifacts are requested.
- Use `$grill-me` before planning or coding when a decision tree is unresolved.
- Use `$to-prd` after a grilling session for implementation initiatives.
- Use `$to-issues` to create vertical-slice issues and mark them `AFK` or `human-in-the-loop`.
- Use `$tdd` for implementation work where practical.
- Use fresh-context review before merge.
- Do not commit anything unless explicitly asked.

## UI and frontend quality

- Build real, usable screens first, not marketing placeholders.
- Prefer premium, minimal, Apple/Linear-style interfaces: calm hierarchy, strong spacing, clear typography, and restrained color.
- Avoid generic AI-looking UI: decorative blobs, excessive gradients, random glass cards, noisy shadows, and overdesigned sections.
- Use existing components, styling conventions, and framework patterns before adding new abstractions.
- For React/Next.js UI, preserve existing route behavior and state unless the task explicitly asks to change it.
- Use shadcn/ui components when they fit the project and do not fight the existing design system.
- After UI changes, verify desktop and mobile layout, run the project’s tests/typecheck/lint/build commands when available, and use browser tooling to catch visual or runtime issues.
