# AGENTS.md

## Project Identity

Telemetry Court is an evidence-based human-in-the-loop validation bench and
topological refiner for AI-generated telemetry cluster interpretations.

```text
AI names the cluster. Humans test the evidence.
```

Core question:

```text
Given a telemetry cluster and an AI-generated label or explanation,
is that interpretation actually supported by the evidence?
```

Treat `docs/PRODUCT_VISION.md`, `docs/PRODUCT_POSITIONING.md`, and `docs/PROJECT_CONTEXT.md` as the current product source of truth. The older Evidence Arena identity and frontend-MVP framing are superseded. Current arena terminology may describe UI components, but it must not define the product.

## Current State And Next Proof

- Milestone 3 (the Local Utility Gate) is implemented: strict local
  `CasePackage` import, structured review, browser-local `ReviewResult`
  persistence and bundle exchange, per-package `EvaluationReport` aggregation,
  results topology, and `cluster_refinement.v0.1` export.
- Milestone 4's repository-owned engineering is implemented: the sanitized
  adapter mapper and CLI, local Hot-Folder scan/polling path, standard-library
  Python companion, sanitized evidence highlights, split/merge capture, and
  external refinement-consumer handoff.
- Milestone 5 now includes a deterministic mocked Evidence Assistance panel on
  the Evidence Board. It uses fixed questions, validated package references,
  guardrails, response validation, and the claim critic. It is not live AI and
  does not write assistance metadata into review or evaluation artifacts.
- Milestone 6 is the active proof boundary: approved realistic packages and
  independent human reviewers must exercise the loop. Synthetic fixtures and
  automated tests cannot establish research validity.
- Real Toponymy, DataMapPlot, UMAP/HDBSCAN, and ACME4 execution are not
  implemented. The repository accepts their approved, sanitized, precomputed
  outputs only through the versioned package boundary.
- Backend work must start with `CasePackage`, `ReviewResult`, and
  `EvaluationReport` requirements, not generic APIs, databases, or
  authentication.

## Product Boundary

```text
Upstream clustering and labeling systems
-> versioned CasePackage JSON
-> Telemetry Court validation and review
-> ReviewResult JSON
-> EvaluationReport metrics
-> cluster_refinement.v0.1
-> external upstream pipeline improvement
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
-> cluster refinement export
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

1. Preserve the existing `CasePackage`, `ReviewResult`, `EvaluationReport`,
   quick-disposition, and cluster-refinement contract boundaries.
2. Keep package, result, local-storage, Hot-Folder, and refinement validation
   strict, deterministic, and safe for sanitized inputs.
3. Fix correctness, accessibility, browser, test, CI, and documentation gaps
   in the implemented local loop.
4. Prepare and execute the approved Milestone 6 study with realistic packages
   and independent human reviewers; record limitations honestly.
5. Scope live provider-backed assistance only through a separate product and
   schema decision. Never extend the mocked panel into generic chat by
   convenience.

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
