# GitHub Planning

This document defines how Telemetry Court uses GitHub labels, milestones, issues, PRs, and structured commits.

## Current Planning Source

`docs/ROADMAP.md` is the canonical roadmap. GitHub milestones should mirror that milestone structure, and GitHub issues should remain a small executable batch rather than a giant future backlog.

Current Evidence Arena milestones:

| Milestone | Goal |
|---|---|
| Milestone 0 — Evidence Arena Pivot Stabilization | Stabilize the pivot, remove outdated framing, ensure docs/tests/agents agree on the new direction. |
| Milestone 1 — Polished Static Evidence Arena MVP | Make the synthetic vertical slice demo-ready and credible. |
| Milestone 2 — Scientific Review Data Model | Make human review output useful as evaluation data, not just UI state. |
| Milestone 3 — Telemetry Map + Case Exploration | Make the landscape, clusters, uncertainty, neighboring regions, and case navigation more informative. |
| Milestone 4 — Pipeline Integration Readiness | Prepare import/export boundaries for Toponymy, DataMapPlot, generated cluster labels, and real telemetry-derived artifacts without requiring restricted data. |
| Milestone 5 — Advanced Evidence Arena | Model debate, cross-examination, counterfactual map lab, live jury/demo mode, and research-grade interaction experiments. |

Historical pre-pivot milestones should be preserved for context, not deleted. If they no longer contain open work, close them as historical planning containers and move future work into the Evidence Arena milestone structure.

## Current Immediate Issue Batch

Do not create issues for every future idea. The current small batch is:

### Milestone 0 — Evidence Arena Pivot Stabilization

- `docs: remove superseded label-validator framing`
- `test: cover evidence arena happy path`
- `chore: commit and document evidence arena pivot`

### Milestone 1 — Polished Static Evidence Arena MVP

- `ux: polish telemetry landscape as primary entry point`
- `ux: improve case file investigation hierarchy`
- `ux: refine blind investigation and AI reveal flow`
- `ux: make evidence classification feel active and clear`
- `ux: refine label duel and impostor interactions`
- `feat: add review progress and reset/navigation controls`
- `a11y: improve keyboard and screen reader support for structured choices`

### Milestone 2 — Scientific Review Data Model

- `schema: formalize structured review export`
- `docs: define evaluation meaning of each verdict and failure mode`

## Label Taxonomy

Use labels as routing metadata. Tracks are labels, not milestones.

### Team Labels

- `team/ui-ux`: UI, layout, interaction, accessibility, and product clarity.
- `team/telemetry-data`: Data model, fixtures, adapters, telemetry cases, and cluster inputs.
- `team/ai-agents`: AI interpretation contracts, prompts, generated claims, and uncertainty handling.
- `team/scoring-evaluation`: Support scoring, evaluation rubrics, evidence integrity, and validation logic.
- `team/backend-platform`: Tooling, CI, workflow, storage boundaries, and platform structure.
- `team/security-governance`: Data handling, auditability, release safety, and governance boundaries.

### Type Labels

- `type/docs`: Documentation-only changes.
- `type/feat`: User-facing feature work.
- `type/fix`: Bug fixes.
- `type/refactor`: Code restructuring without intended behavior change.
- `type/test`: Tests or test infrastructure.
- `type/style`: Visual styling without behavior change.
- `type/model`: Domain model, types, schema, or evidence-model changes.
- `type/chore`: Maintenance, tooling, and repo operations.
- `type/data`: Sample data, fixtures, and safe synthetic examples.

### Priority Labels

- `priority/p0`: Required for the active milestone.
- `priority/p1`: Important, but not the first blocker.
- `priority/p2`: Useful follow-up or lower urgency.

### Status Labels

- `status/ready`: Clear enough for an agent or human to start.
- `status/blocked`: Cannot proceed without an external decision or dependency.
- `status/needs-decision`: Needs product, design, architecture, or security judgment before implementation.

### Scope Labels

- `scope/mvp`: Work that contributes directly to the static MVP review flow.
- `scope/foundation`: Repo, model, workflow, architecture, or testing foundation.
- `scope/design-system`: Design tokens, visual system, accessibility, and UI standards.
- `scope/evidence-model`: Claims, evidence, relations, support scores, verdicts, and audit concepts.
- `scope/github-planning`: Roadmap, milestones, labels, issue templates, and planning hygiene.

## Milestone Naming Rules

- Milestones are ordered deliverables, not team buckets.
- Use the format `Milestone N — <Deliverable Name>`.
- Keep milestone goals outcome-oriented.
- Do not create catch-all milestones such as "UI", "Backend", or "Ideas".
- Do not create issues for every future milestone until that milestone is close enough for execution.

## Issue Title Format

Use simple, imperative titles. Prefer this current format:

```text
<type>: <short imperative task>
```

Use a scoped title only when it improves scanability:

```text
<type>(<scope>): <short imperative task>
```

Current examples:

- `docs: remove superseded label-validator framing`
- `test: cover evidence arena happy path`
- `ux: polish telemetry landscape as primary entry point`
- `ux: refine blind investigation and AI reveal flow`
- `schema: formalize structured review export`

## Issue Body Template

```md
## Goal

## Why this matters

## Scope

### In scope
- 

### Out of scope
- 

## Required context

Read:
- 

## Implementation notes

## Acceptance criteria
- [ ] 
- [ ] 
- [ ] 

## Required checks
- [ ] `npm test`
- [ ] `npm run lint`
- [ ] `npm run build`

## Documentation updates
- [ ] `docs/CHANGELOG_AI.md` updated, if required
- [ ] Product/design/architecture/data docs updated, if required

## Suggested labels

## Suggested milestone

## Notes for AI agents
```

## Issue Sizing Rules

- One issue should describe one executable task.
- A single issue should be small enough for one focused branch and PR.
- Do not combine styling, model changes, tests, backend work, and documentation unless the issue explicitly requires that combination.
- Avoid vague notes such as "improve UI" or "make evidence better".
- Split an issue when it has multiple independent acceptance paths.
- Keep Milestone 1 focused on the polished static Evidence Arena MVP.

## How To Close Issues

- Close an issue only when its acceptance criteria and required checks have been satisfied or the issue has been explicitly superseded.
- Do not auto-close issues from unrelated commits.
- Do not close planning issues just because documentation mentions them.
- If an issue is no longer valid, comment with the reason before closing.
- If an issue is partially complete, leave it open and document what remains.

## How To Connect Issues To PRs

- Use `Closes #<issue-number>` in PR descriptions when a PR fully satisfies the issue.
- Use `Refs #<issue-number>` or `Part of #<issue-number>` when the PR is related but does not close the issue.
- Every non-trivial PR should use `.github/pull_request_template.md`.
- PRs should call out product impact, evidence model impact, design system impact, tests/checks, risks, and AI-agent notes.
- UI PRs should include screenshots or recordings.

## How To Use Structured Commits With Issues

- Follow `docs/COMMIT_GUIDELINES.md` for non-trivial changes.
- Match commit type and scope to the issue title when possible.
- Mention the issue number in the commit body when useful.
- Keep the commit title narrow and imperative.
- Include validation status for `npm test`, `npm run lint`, and `npm run build`.
- Keep `docs/CHANGELOG_AI.md` and the structured commit message aligned for AI-assisted work.
