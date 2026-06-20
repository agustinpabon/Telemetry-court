# Agent Workflows

## Orientation

Every agent task must preserve the product identity: Telemetry Court is validation infrastructure for AI-generated telemetry cluster interpretations.

The current static interface is a protocol demonstration. The next implementation work begins with the case package and evaluation contracts, not generic backend development.

## Required Context

Before product, architecture, data, or backend work, read:

- `AGENTS.md`
- `docs/PRODUCT_VISION.md`
- `docs/PRODUCT_POSITIONING.md`
- `docs/PROJECT_CONTEXT.md`
- `docs/PRODUCT_DECISIONS.md`
- `docs/ROADMAP.md`
- `docs/ARCHITECTURE.md`
- `docs/CASE_PACKAGE_CONTRACT.md`
- `docs/EVALUATION_INFRASTRUCTURE.md`
- `docs/DATA_MODEL.md`

## Task Prompt Template

```text
You are working on Telemetry Court, an evidence-based human-in-the-loop
validation bench for AI-generated telemetry cluster interpretations.

The current app is a static synthetic validation slice.
The next backend direction is Case Package Contract and Evaluation Infrastructure.

Task:
<narrow task>

Product checks:
- Does this improve evidence grounding, review structure, or evaluation output?
- Does it preserve CasePackage / ReviewResult / EvaluationReport separation?
- Does it avoid SIEM, SOC, dashboard, raw-ingestion, chat-first, and generic-backend drift?
- If backend work is involved, is the case package contract defined first?

Constraints:
- Make the smallest safe change.
- Preserve evidence provenance and claim-to-evidence traceability.
- Do not invent evidence or Toponymy capabilities.
- Keep the main review workflow structured-choice first.
- Update docs/CHANGELOG_AI.md when required.

Expected output:
- Files changed
- Major decisions
- Checks run
- Assumptions
- Risks and follow-up
```

## Good Tasks

- Define one contract decision for `CasePackage v0.1`.
- Add runtime validation for broken evidence-to-claim references.
- Adapt one synthetic fixture through a package boundary.
- Version the `ReviewResult` export.
- Define and test one deterministic evaluation metric.
- Document a Toponymy or ACME4 adapter boundary without implementing raw ingestion.

## Bad Tasks

- "Connect a backend."
- "Build an admin dashboard."
- "Add user accounts first."
- "Turn this into a telemetry explorer."
- "Add live alert triage."
- "Add an AI chatbot."
- "Make the court experience more game-like."
- "Integrate Toponymy end to end" without a verified source contract.

## Small-Diff Workflow

1. Confirm the issue supports the validation-bench direction.
2. Read required context and inspect git status.
3. Inspect task-relevant files and existing tests.
4. State the intended change and explicit non-goals.
5. Implement one narrow vertical slice.
6. Run applicable checks.
7. Update `docs/CHANGELOG_AI.md` and contract docs when behavior or boundaries change.
8. Summarize current capability without overclaiming future targets.

## Issue And PR Review Questions

- Does the change support the validation-bench direction?
- Does it preserve the distinction between `CasePackage`, `ReviewResult`, and `EvaluationReport`?
- Does it improve evidence grounding, structured review, provenance, aggregation, or evaluation output?
- Does it avoid SIEM/SOC/dashboard, raw-search, chat-first, and gamification drift?
- If it requires backend work, is that work blocked by or derived from the case package contract?
- Does it keep restricted telemetry outside the public or portable app?

## Toponymy Source Rule

Use the official [TutteInstitute/toponymy](https://github.com/TutteInstitute/toponymy) repository for factual claims. Do not infer APIs, outputs, models, or workflows from third-party summaries or memory. If a detail cannot be verified, omit it or mark it unknown.

## Required Handoff

Report files changed, positioning or contract impact, checks and results, assumptions, risks, deferred work, and the recommended next roadmap milestone. Do not commit unless explicitly asked.
