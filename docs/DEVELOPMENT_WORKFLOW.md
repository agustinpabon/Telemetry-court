# Development Workflow

## Project Workflow

Recommended flow:

1. Define a narrow task.
2. Create or use a focused branch.
3. Agent reads required context files.
4. Agent proposes a short plan.
5. Agent makes the smallest safe change.
6. Agent runs checks.
7. Agent updates `docs/CHANGELOG_AI.md`.
8. Agent provides a structured final summary.
9. Human reviews.
10. Human commits with structured message.
11. Human opens PR if appropriate.

## Branch Naming

Prefer:

- `docs/<short-topic>`
- `feat/<short-topic>`
- `fix/<short-topic>`
- `refactor/<short-topic>`
- `test/<short-topic>`
- `style/<short-topic>`
- `model/<short-topic>`
- `chore/<short-topic>`

Examples:

- `docs/commit-guidelines`
- `model/case-file-alignment`
- `refactor/case-metrics`
- `test/case-metrics`
- `style/design-tokens`
- `feat/claim-selection`

## Task Sizing

- One conceptual change per task.
- Avoid mixing model changes with visual redesign.
- Avoid mixing tests with unrelated UI restyling.
- Avoid broad prompts like "improve the app."
- Prefer prompts that name files, constraints, and checks.

## Documentation Update Rules

Update `docs/CHANGELOG_AI.md` when a change affects:

- product context
- architecture
- domain model
- evidence model
- design system
- agent workflow
- tests/tooling
- UI behavior
- scoring/validation logic

Update `docs/PRODUCT_DECISIONS.md` when a decision affects product direction.

Update `docs/ARCHITECTURE.md` when a change affects structure, data flow, dependencies, or boundaries.

Update `docs/DATA_MODEL.md` when types, sample data shape, evidence relations, scoring, or verdicts change.

Update `docs/DESIGN_SYSTEM.md` when visual rules, tokens, hierarchy, accessibility, or interaction guidance changes.

## Required Checks

Before work is considered complete, run:

```bash
npm test
npm run lint
npm run build
```

If a check is unavailable or fails for pre-existing reasons, document it clearly.

## Agent Final Summary Format

Use this exact final format:

````md
**Files changed**
- ...

**Summary**
...

**Decisions made**
- ...

**Checks run**
- `npm test` — passed / failed / not run
- `npm run lint` — passed / failed / not run
- `npm run build` — passed / failed / not run

**Assumptions**
- ...

**Risks / follow-up**
- ...

**Suggested commit message**
```text
<full structured commit message>
```

**Recommended next step**
...
````

## PR Workflow

PR descriptions should include:

- Summary
- Why this change exists
- Files changed
- Product impact
- Evidence model impact
- Design impact
- Tests/checks
- Risks/follow-ups
- Screenshots if UI changed
- AI-agent notes

## Merge Policy

Recommend:

- Prefer squash merge for focused branches if the branch contains multiple small agent attempts.
- Use a structured squash commit message.
- Do not merge with failing checks.
- Do not merge broad AI-generated changes without human review.

## AI Handoff Rules

Every agent should leave enough context for the next agent:

- what changed
- why it changed
- what was intentionally not changed
- what assumptions were made
- which checks passed
- what the next narrow task should be
