# Claude Code Instructions

Before editing this repository, read:

1. `AGENTS.md`
2. `docs/PRODUCT_VISION.md`
3. `docs/PRODUCT_POSITIONING.md`
4. `docs/PROJECT_CONTEXT.md`
5. `docs/PRODUCT_DECISIONS.md`
6. `docs/ARCHITECTURE.md`
7. `docs/CASE_PACKAGE_CONTRACT.md` and `docs/EVALUATION_INFRASTRUCTURE.md` for contract or backend work

Telemetry Court is an evidence-based human-in-the-loop validation bench for AI-generated telemetry cluster interpretations.

```text
AI names the cluster. Humans test the evidence.
```

The current static synthetic interface demonstrates the review flow. It is not complete validation infrastructure. The next backend milestone is the Case Package Contract and Validation Infrastructure.

## Rules

- Keep changes narrow and inspect current files before editing.
- Preserve the distinction between `CasePackage`, `ReviewResult`, and `EvaluationReport`.
- Prioritize package validation, evidence provenance, structured reviews, aggregation, and evaluation exports.
- Do not add generic dashboards, SIEM/SOC workflows, alert triage, raw log search, chat-first UX, gamification, generic CRUD, auth-first work, or speculative backend infrastructure.
- Keep sample data synthetic and clearly marked.
- Every claim must connect to evidence IDs or explicitly show missing evidence.
- Do not require typed text for the main review workflow.
- Use only the official `TutteInstitute/toponymy` repository for factual Toponymy claims.
- Follow the design docs for UI work and do not copy protected brand expression.
- Update `docs/CHANGELOG_AI.md` after material AI-assisted changes.
- Run applicable tests, lint, and build, and report failures.
- Do not commit unless explicitly asked.
