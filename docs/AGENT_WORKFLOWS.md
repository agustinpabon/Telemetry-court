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
- Any factual Toponymy statement must be grounded in the official `TutteInstitute/toponymy` GitHub repository, not DeepWiki or generated summaries.
- Update docs/CHANGELOG_AI.md after changes.

Expected output:
- Files changed
- What changed
- Checks run
- Assumptions
- Suggested commit message
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

## GitHub Issue Workflow

- Issues should be created from `docs/ROADMAP.md`.
- Only the active milestone should have detailed issues by default.
- Every issue should have a clear goal, scope, out-of-scope list, acceptance criteria, checks, and agent notes.
- Agents should work from one issue at a time.
- Agents should not combine issues unless explicitly asked.
- PRs should link issues using `Closes #<issue-number>` when appropriate.
- Every non-trivial PR should include the structured context required by `.github/pull_request_template.md`.

## Toponymy Source Rule

- The official source of truth for factual Toponymy information in this repo is <https://github.com/TutteInstitute/toponymy>.
- DeepWiki, generated summaries, blog posts, and other third-party pages are non-authoritative and must not be used as proof of Toponymy capabilities or integration details.
- Agents must not invent Toponymy APIs, workflows, capabilities, outputs, or supported models.
- If an agent cannot confirm a Toponymy detail from the official repo README or source files, it should omit the detail or mark it explicitly as unknown.

## Commit And Handoff Workflow

- Task prompts should require a suggested commit message.
- Agents should not auto-commit unless explicitly asked.
- Final answers should include a structured commit body, not only a one-line title.
- `docs/CHANGELOG_AI.md` and the suggested commit message should agree on scope and terminology.
- Commit messages should stay compact; `docs/CHANGELOG_AI.md` can hold more detail.
- Human reviewers should reject vague commit titles such as "update files" or "fix stuff."

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

````md
**Files changed**
- <file>

**Summary**
<short summary>

**Decisions made**
- <decision>

**Checks run**
- `npm test` — passed / failed / not run
- `npm run lint` — passed / failed / not run
- `npm run build` — passed / failed / not run

**Assumptions**
- <assumption>

**Risks / follow-up**
- <risk or suggested next step>

**Suggested commit message**
```text
<full structured commit message>
```

**Recommended next step**
<next narrow task>
````
