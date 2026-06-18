# Telemetry Court - Prompting Guide

This file gives durable prompting patterns.

It does not contain current PR numbers or temporary branch state.

## Good Prompt Structure

A good Codex prompt should include:

```text
Recommended model:
<model>

Task:
<one narrow task>

Issue:
#<number> <title>

Before coding:
- inspect git status
- inspect current branch
- read relevant docs/files
- identify unrelated dirty files and leave them alone

Scope:
- what to change

Out of scope:
- what not to change

Constraints:
- Evidence Arena direction
- no backend unless explicitly scoped
- no Toponymy integration unless explicitly scoped
- no new dependencies unless necessary
- preserve evidenceRelations
- no invented evidence
- no typed text required in the happy path

Required checks:
- npm test
- npm run lint
- npm run build

Commit / PR:
- commit only if asked
- use structured commit message
- open draft PR if asked
- link issue
- do not merge

Final response:
- branch
- commit hash if committed
- PR URL if opened
- files changed
- checks run
- assumptions
- risks
- working tree status
```

## Prompt Template - Implement Issue

```text
You are working on Telemetry Court.

Recommended model:
<MODEL>

Task:
Implement issue #<ISSUE_NUMBER> and open a draft PR.

Issue:
#<ISSUE_NUMBER> `<ISSUE_TITLE>`

Before coding:
- Run `git status -sb`.
- Confirm current branch and upstream.
- Inspect the issue body.
- Inspect relevant files before editing.
- Identify unrelated dirty files and leave them alone.

Read before editing:
- AGENTS.md
- README.md
- docs/PRODUCT_VISION.md
- docs/PROJECT_CONTEXT.md
- docs/PRODUCT_DECISIONS.md
- docs/ROADMAP.md
- docs/GITHUB_PLANNING.md
- docs/ARCHITECTURE.md
- docs/DATA_MODEL.md
- docs/DESIGN_SYSTEM.md
- docs/AGENT_WORKFLOWS.md
- docs/DEVELOPMENT_WORKFLOW.md
- docs/COMMIT_GUIDELINES.md
- docs/CHANGELOG_AI.md
- <TASK_SPECIFIC_FILES>

Scope:
- <SCOPE>

Out of scope:
- No backend/API/auth unless explicitly requested.
- No Toponymy integration unless explicitly requested.
- No new dependencies unless necessary and justified.
- No broad redesign.
- No unrelated rewrites.
- Do not invent evidence.
- Preserve `evidenceRelations` as canonical claim-to-evidence link.
- Do not require typed text for the main Evidence Arena workflow.

Required checks:
- `npm test`
- `npm run lint`
- `npm run build`

Commit instructions:
- If asked to commit, use a structured commit message following docs/COMMIT_GUIDELINES.md.
- If not asked to commit, leave changes unstaged and summarize them.

Push / PR instructions:
- Push the branch only if asked.
- Open a draft PR into `main` only if asked.
- Link the issue with `Closes #<ISSUE_NUMBER>` only when the PR fully satisfies it.
- Do not merge the PR.

Final response must include:
- Recommended model used
- Branch name
- Commit hash if committed
- PR URL if opened
- Files changed
- What changed
- Checks run
- Assumptions
- Risks/follow-up
- Whether working tree is clean
- Whether branch was pushed
- Whether PR is draft and unmerged
```

## Prompt Template - Review PR

```text
You are working on Telemetry Court.

Recommended model:
<MODEL>

Task:
Review PR #<PR_NUMBER> before it is marked ready or merged.

PR:
<PR_URL>

Issue:
#<ISSUE_NUMBER> `<ISSUE_TITLE>`

Before reviewing:
- Fetch latest remote state.
- Run `git status -sb`.
- Inspect PR metadata.
- Inspect PR diff.
- Inspect relevant files.

Review goals:
- Confirm PR matches issue scope.
- Confirm no unrelated behavior changed.
- Confirm no unexpected dependencies were added.
- Confirm Evidence Arena structured-choice workflow is preserved.
- Confirm `evidenceRelations` remains canonical if evidence is involved.
- Confirm tests are useful.
- Confirm changelog entry is accurate.
- Confirm PR body links the issue when appropriate.

Required checks:
- npm test
- npm run lint
- npm run build

Do not:
- Merge the PR.
- Mark ready if blocking verification is missing.
- Push new commits unless a real issue must be fixed.
- Add dependencies.
- Add backend/API/auth/persistence.
- Add Toponymy integration.
- Redesign unrelated UI.
- Add required free-text steps to the happy path.

If PR is good:
- Leave it draft unless the user explicitly asks to mark ready.
- Leave a short comment saying it is ready from your review perspective.
- Do not merge.

If PR needs fixes:
- Keep as draft.
- Make the smallest fix.
- Run checks.
- Commit fix if asked.
- Push branch if asked.
- Explain what changed.

Final response must include:
- Review verdict
- Whether PR was marked ready
- Whether commits were added
- Checks run
- Files reviewed
- Risks
- Recommended merge method
- Whether PR remains unmerged
```

## Prompt Template - Planning Next Issues

```text
You are working on Telemetry Court.

Recommended model:
Codex - GPT-5 high

Task:
Plan the next small set of issues for the active milestone.

Before planning:
- Inspect `docs/ROADMAP.md`.
- Inspect `docs/GITHUB_PLANNING.md`.
- Inspect open GitHub issues and milestones.
- Do not create a giant backlog.

Constraints:
- Preserve the Evidence Arena direction.
- Prefer a small, high-quality batch of actionable issues.
- Do not blindly close historical issues.
- Keep old approve/reject label-validator language marked as superseded.

Final response:
- milestone state
- proposed issues grouped by milestone
- old issues needing triage
- docs changed
- checks run
```
