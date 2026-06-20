# GitHub Copilot Instructions

Telemetry Court is an evidence-based human-in-the-loop validation bench for AI-generated telemetry cluster interpretations.

```text
AI names the cluster. Humans test the evidence.
```

The current UI is a static synthetic validation slice. The target architecture is:

```text
Upstream cluster pipeline
-> versioned CasePackage
-> Telemetry Court review and validation
-> ReviewResult
-> EvaluationReport
```

## Product Expectations

- Treat generated labels and explanations as claims to test against evidence.
- Preserve blind review before AI-label reveal.
- Keep `CasePackage`, `ReviewResult`, and `EvaluationReport` separate.
- Keep evidence provenance, sanitization, stable IDs, and claim mappings explicit.
- Preserve uncertainty and missing-evidence states.
- Use structured choices for the main workflow.

## Boundaries

- Do not add SIEM, SOC, EDR, alert-triage, raw-search, or incident-response behavior.
- Do not create generic dashboards, chat-first UX, gamification, generic CRUD, or auth-first backend work.
- Do not add databases or APIs before the case package contract requires them.
- Do not claim current Toponymy or ACME4 integration.
- Use only synthetic, sanitized, or approved data.
- Use the official `TutteInstitute/toponymy` repository for factual Toponymy claims.

## Coding Expectations

- Prefer TypeScript, current Next.js patterns, small diffs, and no new dependencies without justification.
- Preserve `evidenceRelations` as the current canonical claim-to-evidence link until Milestone 2 deliberately replaces or adapts it.
- Read `docs/CASE_PACKAGE_CONTRACT.md` and `docs/EVALUATION_INFRASTRUCTURE.md` before backend or schema work.
- Follow the design docs for UI work.
- Run `npm test`, `npm run lint`, and `npm run build` when applicable.
- Update `docs/CHANGELOG_AI.md` for material product, planning, architecture, model, workflow, test, or behavior changes.
