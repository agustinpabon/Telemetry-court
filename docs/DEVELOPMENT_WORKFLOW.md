# Development Workflow

## Product Gate

Before implementation, confirm that the task advances Telemetry Court as an evidence-based validation bench for AI-generated telemetry cluster interpretations.

Reject or rescope work that primarily adds generic dashboards, SIEM/SOC workflows, alert triage, raw telemetry search, chat-first UX, gamification, generic CRUD, authentication, or database infrastructure without a case package requirement.

## Standard Flow

1. Define one narrow validation outcome.
2. Inspect git status and preserve unrelated work.
3. Read the product and contract source documents.
4. Identify whether the task affects `CasePackage`, `ReviewResult`,
   `EvaluationReport`, quick dispositions, cluster refinement, mocked
   assistance, or only presentation.
5. State scope, non-goals, and the evidence or evaluation benefit.
6. Implement the smallest complete vertical slice.
7. Run tests, lint, and build as applicable.
8. Update `docs/CHANGELOG_AI.md` and any affected contract, architecture, or decision docs.
9. Provide a structured handoff for human review.

## Milestone Discipline

- Milestone 0 is the historical static validation slice, not the full current
  capability statement.
- Milestone 1 is repository realignment.
- Milestone 2 is complete: Case Package Contract and Validation Infrastructure.
- Milestone 3 is complete: Local Utility Gate (focusing on external/approved CasePackage validation workflow, package authoring/inspection support, and realistic/sanitized package readiness).
- Milestone 4 repository engineering is complete: sanitized mapper/CLI,
  preflight, Hot-Folder scan/polling, Python file helper, evidence highlights,
  split/merge capture, and refinement consumer guidance. Approved upstream
  producer/consumer exercise remains external proof.
- Milestone 5 is active. Its first UI slice is deterministic and mocked, uses
  fixed questions and exact package IDs, and has no live provider or artifact
  persistence. Keep future AI/provider work in separate issues.
- Milestone 6 is the active human proof boundary. Do not mark it complete from
  synthetic packages, mocked assistance, or automated tests.
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
- Update `docs/AI_ASSISTANCE_RESPONSE_CONTRACT.md` for question, guardrail,
  response, critic, resolver, or assistance UI boundary changes.
- Update `docs/DATA_MODEL.md` when implemented types or fixture shapes change.
- Update `docs/GITHUB_PLANNING.md` when milestone or issue strategy changes.
- Update `docs/CHANGELOG_AI.md` after material AI-assisted changes.
- Use `docs/NOTEBOOK_HANDOFF_CHECKLIST.md` for Milestone 4 notebook or script
  exports into the existing sanitized adapter mapper and CLI.
- Use `docs/CLUSTER_REFINEMENT_HANDOFF.md` for upstream consumers of
  Telemetry Court `cluster_refinement.v0.1` exports.

## Required Checks

```bash
npm run check
```

The composite command runs `npm run typecheck`, `npm run lint`,
`npm run test:coverage`, `npm run test:python`, and `npm run build`
sequentially with their native output. The coverage command excludes test
files and enforces at least 80% line, branch, and function coverage. Run
focused commands first while iterating, then the composite check before
handoff.

For changes to the Evidence Assistance surface, also run the deterministic
Chromium smoke when the local environment supports Playwright:

```bash
npm run test:browser:assistance
npm run test:browser:release
```

For docs-only work, run these when reasonable because documentation can affect tests that protect product language. If a command is irrelevant, unavailable, or fails for a pre-existing reason, report that explicitly.

## Branch And Commit Discipline

- Prefer one conceptual change per branch and PR.
- Do not mix contract work with unrelated UI redesign.
- Do not auto-commit unless explicitly asked.
- Follow `docs/COMMIT_GUIDELINES.md` for suggested messages.
- Never rewrite history without explicit instruction.

## Handoff Format

Include files changed, major positioning or contract changes, docs added and
updated, old framing removed, commands and results, assumptions, remaining
ambiguities or risks, and the recommended next proof or narrow implementation
slice.
