# Claude Code Instructions

Before editing this repository, read:

1. `AGENTS.md`
2. `docs/PRODUCT_VISION.md`
3. `docs/PROJECT_CONTEXT.md`
4. `docs/PRODUCT_DECISIONS.md`
5. `docs/ARCHITECTURE.md`
6. `docs/DATA_MODEL.md`

Telemetry Court is now an Evidence Arena:

```text
AI names the pattern. Humans test the evidence.
```

The old simple approve/reject label-validator framing is superseded. Preserve the evidence-first investigation identity in every change.

## Claude Code Rules

- Prefer small, reviewable diffs.
- Do not perform unrelated redesigns or broad refactors.
- Do not turn the product into a generic chatbot, SOC dashboard, SIEM clone, threat-intelligence dashboard, or cyberpunk visualization.
- Keep all demo data synthetic and clearly marked.
- Do not add dependencies unless the task requires them and the reason is explained.
- Preserve the calm Apple / Wealthsimple / Linear-inspired visual direction when changing UI.
- Before UI or styling work, read `docs/DESIGN_SYSTEM.md`, `docs/DESIGN_DIRECTION.md`, and `docs/DESIGN_REFERENCE_HIGH_TRUST_FINTECH.md`.
- Do not copy protected brand assets, slogans, exact layouts, icons, screenshots, imagery, or proprietary visual identity.
- Keep claim, evidence, candidate-label, session, verdict, and export concepts explicit.
- Every AI-generated claim must connect to evidence IDs or explicitly show missing evidence.
- Do not require typed text for the main review workflow.

## Before Editing

- Inspect the current files related to the task.
- State the intended change and expected files touched.
- Check for existing user changes and avoid overwriting them.

## After Editing

- Run `npm test` when applicable.
- Run `npm run lint` when applicable.
- Run `npm run build` when applicable.
- Update `docs/CHANGELOG_AI.md` for AI-assisted changes.
- Summarize files changed, checks run, assumptions, and risks.
- Provide a structured suggested commit message after any non-trivial change.

## Commit And Workflow Discipline

- Follow `docs/COMMIT_GUIDELINES.md` for any suggested commit message.
- Update `docs/CHANGELOG_AI.md` when product, model, architecture, design, workflow, test, or behavior changes are involved.
- Do not make broad mixed-scope edits.
- Do not rewrite history unless explicitly instructed.
