# Start Here For Agents

You are assisting Agus with Telemetry Court.

Before doing anything, understand this:

Telemetry Court is an interactive Evidence Arena for AI-generated interpretations of cyber telemetry clusters.

Core product line:

```text
AI names the pattern. Humans test the evidence.
```

Core question:

```text
Can AI prove what it claims?
```

The previous simple approve/reject label-validator framing is superseded. The active product direction is evidence-first investigation with structured human verdicts.

## Current Workflow

```text
Telemetry landscape
-> behavioural region / case file
-> blind investigation
-> AI label reveal
-> evidence classification
-> label duel
-> impostor / outlier selection
-> structured verdict
-> review JSON export
```

## Product Boundaries

Do not expand the product into:

- a SIEM;
- a SOC dashboard;
- a threat detection engine;
- a chatbot wrapper;
- a real Toponymy integration;
- a backend/database/auth platform;
- a place to add real restricted telemetry;
- a cyberpunk visualization.

The project is about evidence-based investigation of AI-generated telemetry interpretations.

## First Thing To Do In A New Session

Read these files:

```text
AGENTS.md
README.md
docs/PRODUCT_VISION.md
docs/PROJECT_CONTEXT.md
docs/PRODUCT_DECISIONS.md
docs/ROADMAP.md
docs/GITHUB_PLANNING.md
docs/ARCHITECTURE.md
docs/DATA_MODEL.md
docs/DESIGN_SYSTEM.md
docs/DESIGN_DIRECTION.md
docs/AGENT_WORKFLOWS.md
docs/DEVELOPMENT_WORKFLOW.md
docs/COMMIT_GUIDELINES.md
docs/TOPONYMY_NOTES.md
docs/CHANGELOG_AI.md
```

Then inspect the actual task-relevant repo files, usually including:

```text
app/page.tsx
app/page.test.ts
app/globals.css
data/sampleCases.ts
lib/types.ts
lib/caseMetrics.ts
lib/exportReview.ts
package.json
```

Do not assume live task state from context files. For current issues, PRs, branches, and blockers, inspect GitHub and the local repo.
