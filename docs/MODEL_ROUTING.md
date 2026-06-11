# Model Routing

Use the cheapest model that can solve the task reliably. Do not use maximum reasoning by default.

## Recommended Tiers

Mechanical edits, renaming, formatting:

- Use a cheap/fast model.
- Examples: copy edits, small markdown updates, renaming a prop after the design is already clear.

One-file UI component or simple TypeScript type changes:

- Use a cheap-to-medium coding model.
- Examples: one component state fix, a small type addition, a small static-data cleanup.

Multi-file implementation:

- Use a medium coding model.
- Examples: adding a new review panel, threading a new field through sample data and components, updating docs and types together.

Data model changes, architecture, evidence scoring, complex state management:

- Use a stronger reasoning model.
- Examples: changing `Claim` or `EvidenceRelation`, adding score calculation logic, restructuring case data.

Security, auth, database migrations, production bugs:

- Use a high-reasoning model.
- These changes are not MVP defaults and should be explicitly scoped.

## Escalation Rules

Escalate gradually only when:

- The previous attempt failed.
- The bug is ambiguous.
- The change affects architecture.
- The change affects the evidence model.
- A wrong answer would waste significant time.

## Defaults

- Do not select the most expensive or highest-reasoning model by default.
- Prefer small tasks that cheaper models can complete safely.
- Use stronger models for judgment-heavy work, not mechanical edits.
