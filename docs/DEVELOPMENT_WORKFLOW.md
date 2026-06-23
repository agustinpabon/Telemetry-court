# Development Workflow

## Product Gate

Before implementation, confirm that the task advances Telemetry Court as an evidence-based validation bench for AI-generated telemetry cluster interpretations.

Reject or rescope work that primarily adds generic dashboards, SIEM/SOC workflows, alert triage, raw telemetry search, chat-first UX, gamification, generic CRUD, authentication, or database infrastructure without a case package requirement.

## Standard Flow

1. Define one narrow validation outcome.
2. Inspect git status and preserve unrelated work.
3. Read the product and contract source documents.
4. Identify whether the task affects `CasePackage`, `ReviewResult`, `EvaluationReport`, or only the current static interface.
5. State scope, non-goals, and the evidence or evaluation benefit.
6. Implement the smallest complete vertical slice.
7. Run tests, lint, and build as applicable.
8. Update `docs/CHANGELOG_AI.md` and any affected contract, architecture, or decision docs.
9. Provide a structured handoff for human review.

## Milestone Discipline

- Milestone 0 is the current static validation slice.
- Milestone 1 is repository realignment.
- Milestone 2 is complete: Case Package Contract and Validation Infrastructure.
- Milestone 3 is complete: Local Utility Gate (focusing on external/approved CasePackage validation workflow, package authoring/inspection support, and realistic/sanitized package readiness).
- Milestone 4 is the active implementation milestone: Toponymy / DataMapPlot / ACME4 Adapter Prototype (the local sanitized mapper, CLI, preflight validation, and handoff docs are in place; remaining work focuses on an approved upstream notebook/script adapter and refinement consumer usage outside Telemetry Court).
- Do not create a generic backend milestone.
- Do not pull persistence, auth, admin UX, or enterprise concerns ahead of the contract.
- Keep issues narrow, independently verifiable, and tied to a roadmap outcome.

## Backend Readiness Gate

Backend work must answer:

- Which contract does it serve?
- Which package or review integrity rule requires it?
- How is schema versioning preserved?
- How are provenance and sanitization handled?
- How does it improve multi-reviewer aggregation or evaluation export?

If those questions have no concrete answer, the work is premature.

## Documentation Rules

- Update `docs/PRODUCT_DECISIONS.md` for product or boundary decisions.
- Update `docs/ARCHITECTURE.md` for system ownership, data flow, or integration changes.
- Update `docs/CASE_PACKAGE_CONTRACT.md` for package, result, or report contract decisions.
- Update `docs/EVALUATION_INFRASTRUCTURE.md` for aggregation or metric decisions.
- Update `docs/DATA_MODEL.md` when implemented types or fixture shapes change.
- Update `docs/GITHUB_PLANNING.md` when milestone or issue strategy changes.
- Update `docs/CHANGELOG_AI.md` after material AI-assisted changes.
- Use `docs/NOTEBOOK_HANDOFF_CHECKLIST.md` for Milestone 4 notebook or script
  exports into the existing sanitized adapter mapper and CLI.
- Use `docs/CLUSTER_REFINEMENT_HANDOFF.md` for upstream consumers of
  Telemetry Court `cluster_refinement.v0.1` exports.

## Required Checks

```bash
npm test
npm run lint
npm run build
```

For docs-only work, run these when reasonable because documentation can affect tests that protect product language. If a command is irrelevant, unavailable, or fails for a pre-existing reason, report that explicitly.

## Branch And Commit Discipline

- Prefer one conceptual change per branch and PR.
- Do not mix contract work with unrelated UI redesign.
- Do not auto-commit unless explicitly asked.
- Follow `docs/COMMIT_GUIDELINES.md` for suggested messages.
- Never rewrite history without explicit instruction.

## Handoff Format

Include files changed, major positioning or contract changes, docs added and updated, old framing removed, commands and results, assumptions, remaining ambiguities or risks, and the recommended next milestone.
