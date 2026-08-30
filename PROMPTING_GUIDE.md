# Telemetry Court Prompting Guide

Use this guide for durable agent prompts. Do not include temporary PR, branch, or issue state unless the task needs it.

## Required Product Context

```text
Telemetry Court is an evidence-based human-in-the-loop validation bench and
topological refiner for AI-generated telemetry cluster interpretations.

AI names the cluster. Humans test the evidence.

Current state: the local CasePackage -> ReviewResult -> EvaluationReport ->
cluster_refinement.v0.1 loop and Milestone 4 repository engineering are
implemented. Evidence Assistance is fixed-question, deterministic, and mocked.

Next proof: Milestone 6 requires approved realistic/sanitized packages,
independent human reviewers, and an external refinement/rerun. Do not fabricate
that evidence.
```

## Prompt Structure

```text
Task:
<one narrow validation outcome>

Before work:
- inspect git status and current files
- read AGENTS.md and canonical product docs
- read CASE_PACKAGE_CONTRACT.md and EVALUATION_INFRASTRUCTURE.md for schema/backend work
- preserve unrelated user changes

Contract impact:
- CasePackage
- ReviewResult
- EvaluationReport
- QuickDisposition / cluster_refinement / mocked assistance, if applicable

Scope:
<what changes>

Out of scope:
- SIEM/SOC/EDR or alert-triage workflows
- raw telemetry search or ingestion
- generic dashboards or chatbot behavior
- gamification
- generic CRUD, auth, or database work without a contract requirement
- invented evidence or Toponymy capabilities

Required checks:
- npm run check
- relevant browser smoke for UI/workflow changes

Final response:
- files changed
- positioning or contract impact
- checks and results
- assumptions
- risks and remaining ambiguities
- recommended next proof or narrow slice
```

## Implementation Prompt

```text
You are working on Telemetry Court, an evidence-based human-in-the-loop
validation bench and topological refiner for AI-generated telemetry cluster
interpretations.

Task:
Implement <narrow issue>.

Required context:
- AGENTS.md
- docs/PRODUCT_VISION.md
- docs/PRODUCT_POSITIONING.md
- docs/PROJECT_CONTEXT.md
- docs/PRODUCT_DECISIONS.md
- docs/ROADMAP.md
- docs/ARCHITECTURE.md
- docs/CASE_PACKAGE_CONTRACT.md
- docs/EVALUATION_INFRASTRUCTURE.md
- docs/DATA_MODEL.md

Product gate:
- Explain how this improves evidence grounding, structured review, provenance,
  aggregation, evaluation output, or refinement handoff.
- Preserve CasePackage / ReviewResult / EvaluationReport / QuickDisposition /
  cluster_refinement separation.
- If backend work is involved, identify the contract requirement that justifies it.

Constraints:
- Make the smallest complete change.
- Preserve blind review and structured choices.
- Preserve stable evidence links and visible uncertainty.
- Do not claim direct Toponymy, DataMapPlot, UMAP/HDBSCAN, or ACME4 execution;
  the current adapter is a sanitized file-contract boundary only.
- Do not turn the deterministic mocked assistance panel into live AI or generic
  chat without a separate approved issue and schema/safety decision.
- Do not add generic infrastructure or redesign unrelated UI.
- Update docs/CHANGELOG_AI.md.

Run:
- npm run check
- the relevant browser smoke for UI/workflow changes

Do not commit, push, or open a PR unless explicitly asked.
```

## Review Prompt

```text
Review this change for correctness and product drift.

Prioritize:
- broken contract assumptions
- evidence or provenance loss
- blind-review leakage
- incompatible ReviewResult aggregation
- unsupported metrics
- current-versus-target overclaims
- SIEM/SOC/dashboard, raw-ingestion, chat-first, gamification, auth-first,
  or generic-backend drift
- missing tests

Report findings first with file and line references.
Run `npm run check` and relevant browser smoke when practical.
Do not merge or commit unless explicitly asked.
```

## Planning Prompt

```text
Plan only the next small executable issue batch from docs/ROADMAP.md.

Milestone 3 and the repository-owned Milestone 4 engineering are implemented.
Milestone 5 contains the first deterministic mocked assistance UI. Milestone 6
is the active human/external proof boundary; do not convert it into fabricated
synthetic reviewer work.
Prefer thin vertical slices that connect contract, validation, fixture,
UI compatibility, export, and tests where applicable.

Do not create issues for auth, production databases, admin UX,
generic dashboards, raw ingestion, or enterprise features.
Mark unresolved contract decisions human-in-the-loop and fully specified work AFK.
```
