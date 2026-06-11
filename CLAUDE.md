# Claude Code Instructions

Before editing this repository, read:

1. `AGENTS.md`
2. `docs/PROJECT_CONTEXT.md`
3. `docs/PRODUCT_DECISIONS.md`
4. `docs/ARCHITECTURE.md`
5. `docs/DATA_MODEL.md`

Telemetry Court is an evidence-checking interface for AI-generated telemetry cluster labels and explanations. Preserve that product identity in every change.

## Claude Code Rules

- Prefer small, reviewable diffs.
- Do not perform unrelated redesigns or broad refactors.
- Do not turn the product into a generic chatbot, SOC dashboard, SIEM clone, or cyberpunk visualization.
- Keep all demo data synthetic and clearly marked.
- Do not add dependencies unless the task requires them and the reason is explained.
- Preserve the calm Apple / Wealthsimple visual direction when changing UI.
- Keep claim, evidence, score, verdict, and audit concepts explicit.
- Every AI-generated claim must connect to evidence IDs or explicitly show missing evidence.

## Before Editing

- Inspect the current files related to the task.
- State the intended change and expected files touched.
- Check for existing user changes and avoid overwriting them.

## After Editing

- Run `npm run lint` when applicable.
- Run `npm run build` when applicable.
- Update `docs/CHANGELOG_AI.md` for AI-assisted changes.
- Summarize files changed, checks run, assumptions, and risks.
