# Telemetry Court Stable Project Context

Telemetry Court is an evidence-based human-in-the-loop validation bench for AI-generated telemetry cluster interpretations.

```text
AI names the cluster. Humans test the evidence.
```

The canonical context is:

- `docs/PRODUCT_VISION.md`
- `docs/PRODUCT_POSITIONING.md`
- `docs/PROJECT_CONTEXT.md`
- `docs/PRODUCT_DECISIONS.md`
- `docs/CASE_PACKAGE_CONTRACT.md`
- `docs/EVALUATION_INFRASTRUCTURE.md`
- `docs/ROADMAP.md`

## Current State

The current Next.js application is a static validation slice using synthetic cases, local review state, and JSON export. It demonstrates the review protocol but does not yet ingest real Toponymy or ACME4-derived outputs, persist multi-reviewer results, or calculate evaluation reports.

## Target Boundary

```text
Upstream cluster pipeline
-> versioned CasePackage
-> Telemetry Court review and validation
-> ReviewResult
-> EvaluationReport
```

## Next Milestone

Define and validate `CasePackage v0.1`, `ReviewResult v0.1`, and `EvaluationReport v0.1`, then adapt current fixtures through that boundary while preserving UI compatibility.

Do not substitute generic backend, database, auth, dashboard, SIEM/SOC, alert-triage, raw-search, chatbot, or gamification work for this milestone.
