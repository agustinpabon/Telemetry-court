# Agent Workflows

## How To Ask AI Agents For Changes

Give agents narrow, concrete tasks. Name the relevant file or product surface when possible. Tell the agent whether the task is documentation, data model, UI, or verification work.

Good tasks include a clear expected output and remind the agent that Telemetry Court is an evidence-checking product, not a generic dashboard.

## Good Task Prompt Template

```txt
You are working on Telemetry Court.

This is not a generic AI dashboard. It is an evidence-checking interface for AI-generated telemetry cluster labels.

Before coding, read:
- AGENTS.md
- docs/PROJECT_CONTEXT.md
- docs/PRODUCT_DECISIONS.md
- docs/ARCHITECTURE.md
- docs/DATA_MODEL.md

Task:
<insert narrow task here>

Constraints:
- Make the smallest safe change.
- Do not redesign unrelated areas.
- Preserve Apple / Wealthsimple visual discipline.
- Every claim must connect to evidence or explicitly show missing evidence.
- Use existing domain model names.
- Update docs/CHANGELOG_AI.md after changes.

Expected output:
- Files changed
- What changed
- Checks run
- Assumptions
- Suggested next step
```

## Bad Prompt Examples

- "Make the app better."
- "Redesign the dashboard."
- "Add AI features."
- "Integrate Toponymy end to end."
- "Make it look more cybersecurity."
- "Add real telemetry samples."

These are too broad, conflict with product direction, or risk introducing unsafe data and unreviewable changes.

## Small-Diff Workflow

1. Human defines a narrow issue.
2. Agent reads `AGENTS.md` and relevant docs.
3. Agent inspects the existing files.
4. Agent states the intended change.
5. Agent makes the smallest safe change.
6. Agent runs available checks.
7. Agent updates `docs/CHANGELOG_AI.md`.
8. Agent summarizes changes, checks, assumptions, and risks.

## Branch / PR Workflow

- Create a focused branch for each task.
- Keep commits scoped to one product or technical concern.
- Use the pull request template.
- Include screenshots for UI changes.
- Call out evidence model impact, even if the answer is "None."
- Human review should check product fit, evidence traceability, visual discipline, and build health.

## When To Escalate To Stronger Models

Escalate gradually when:

- A previous attempt failed.
- The bug is ambiguous.
- The change affects architecture or the domain model.
- Evidence scoring logic is involved.
- A wrong answer would waste significant review time.
- Security, auth, database migrations, or production bugs are in scope.

Do not use maximum reasoning by default.

## Required Post-Change Summary

Agents should finish with:

```txt
Files changed:
- <file>

What changed:
- <short summary>

Checks run:
- <commands or "Not run">

Assumptions:
- <assumptions>

Risks / follow-ups:
- <risks or suggested next step>
```
