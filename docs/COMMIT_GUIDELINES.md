# Commit Guidelines

## Purpose

Commit messages are part of Telemetry Court's agent memory system. They should help humans and AI agents understand what changed, why it changed, what was validated, and what remains risky.

Use commit history as a durable audit layer:

- Commit title: quick index.
- Commit body: compact technical context.
- `docs/CHANGELOG_AI.md`: longer-term AI memory.

If you want Git to prefill the structured template in this repo, you can run:

```bash
git config commit.template .gitmessage
```

Do not run that automatically from agent tasks unless a human explicitly asks.

## Commit Message Format

Use this standard for non-trivial changes:

```text
<type>(<scope>): <short imperative summary>

Why:
- <why this change was needed>

What changed:
- <main change 1>
- <main change 2>
- <main change 3>

Validation:
- npm test: <passed / not run + why>
- npm run lint: <passed / not run + why>
- npm run build: <passed / not run + why>

Risks / follow-ups:
- <known limitation or "None known">

AI context:
- Agent/model: <agent or model>
- Related changelog entry: <date + title>
```

## Allowed Types

- `docs` — documentation-only changes
- `feat` — user-facing feature
- `fix` — bug fix
- `refactor` — code restructuring without behavior change
- `test` — tests only or test infrastructure
- `style` — visual styling without behavior change
- `chore` — maintenance/tooling/config
- `data` — sample data or fixtures
- `model` — domain model/types/evidence schema changes

## Scope Guidance

Examples:

- `docs(agent-workflow)`
- `docs(design-system)`
- `model(case-file)`
- `refactor(case-metrics)`
- `test(case-metrics)`
- `style(tokens)`
- `feat(claim-ledger)`
- `fix(evidence-relations)`

Pick the narrowest scope that will still help someone scan history quickly.

## Good Examples

### Documentation setup

```text
docs(agent-workflow): add structured commit and handoff rules

Why:
- Future AI-agent changes need a consistent audit trail.
- Short one-line commits are not enough to preserve product and architecture context.

What changed:
- Added commit message rules and examples.
- Updated agent instructions to require structured commit bodies.
- Linked the development workflow from README.

Validation:
- npm test: passed
- npm run lint: passed
- npm run build: passed

Risks / follow-ups:
- Existing historical commits were not rewritten.

AI context:
- Agent/model: Codex
- Related changelog entry: 2026-06-11: Development Workflow And Commit Standards
```

### Model change

```text
model(case-file): make evidence relations the canonical claim link

Why:
- Claim-to-evidence links were represented in both support scores and evidence relations.
- Duplicate link sources could drift and make the UI inconsistent.

What changed:
- Removed evidence IDs from support score data.
- Made evidenceRelations the canonical claim-to-evidence source.
- Updated helpers, sample data, and tests to use relation-based lookup.

Validation:
- npm test: passed
- npm run lint: passed
- npm run build: passed

Risks / follow-ups:
- Future import tooling should validate that relation records are complete.

AI context:
- Agent/model: Codex
- Related changelog entry: 2026-06-11: Canonical Claim-Evidence Linking
```

### Design system change

```text
docs(design-system): add evidence-first visual guidance

Why:
- UI work needs a durable visual direction before component restyling begins.
- Telemetry Court should use calm, premium, evidence-first product design rather than cyberpunk or SOC-dashboard patterns.

What changed:
- Added design tokens, hierarchy rules, component guidance, motion guidance, accessibility rules, and content voice.
- Added a legal-safe high-trust fintech design reference.
- Updated agent instructions to read design docs before styling work.

Validation:
- npm test: passed
- npm run lint: passed
- npm run build: passed

Risks / follow-ups:
- UI has not been restyled yet.
- Next step should be tokenizing global CSS without component redesign.

AI context:
- Agent/model: Codex
- Related changelog entry: 2026-06-11: Evidence-First Design System
```

## Bad Examples

```text
update files
```

Bad because it says nothing about why, what changed, or validation.

```text
fix stuff
```

Bad because it hides scope and risk.

```text
add design
```

Bad because it does not say whether this is documentation, CSS, components, or assets.

## When A Short Commit Is Allowed

A short one-line commit is allowed only for truly trivial changes, such as typo fixes, and only if no product, architecture, model, design, or workflow context changed.

Example:

```text
docs(readme): fix typo in project description
```

Even then, prefer structured commits for AI-assisted work.

## History Policy

- Do not rewrite public/shared git history unless explicitly requested.
- If recent local commits have weak messages and have not been pushed, they may be amended or interactively rebased only with explicit user approval.
- If weak commits are already pushed, prefer improving future commits and relying on `docs/CHANGELOG_AI.md` for historical detail.
