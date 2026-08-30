# Telemetry Court v0.1

This file records the historical `v0.1.0` release published on 2026-06-11. It
describes that tag, not the current repository. The release demonstrated the
review protocol; it was not complete validation infrastructure.

## Implemented

- Synthetic telemetry landscape and case selection.
- Blind review before AI-label reveal.
- Claim-level evidence traceability and classification.
- Candidate-label comparison.
- Impostor or outlier review.
- Structured verdict and local JSON export.
- Responsive TypeScript interface with tests, lint, and build checks.

## Limitations

- Synthetic fixtures only.
- No versioned `CasePackage` import or runtime package validation.
- No real Toponymy or ACME4 ingestion.
- No durable `ReviewResult` persistence.
- No multi-reviewer aggregation or `EvaluationReport` metrics.
- No approved adapter for real or realistic cluster output.

## Historical Next Milestone

Define `CasePackage v0.1`, `ReviewResult v0.1`, and `EvaluationReport v0.1`; add validation rules; and adapt the current fixtures through the package boundary without redesigning the UI.

Authentication, production database design, admin UX, generic dashboards, and enterprise features are not the next milestone.

## Current Repository Note

The repository has advanced substantially beyond this tag. Milestone 3 local
package/result/report exchange and Milestone 4 Hot-Folder/Python/refinement
engineering are implemented, and Milestone 5 now contains a deterministic
mocked Evidence Assistance panel. See [`README.md`](./README.md),
[`docs/PROJECT_CONTEXT.md`](./docs/PROJECT_CONTEXT.md), and
[`docs/ROADMAP.md`](./docs/ROADMAP.md) for current capability truth.

Those later changes do not retroactively alter the historical release. The
repository still does not claim live Toponymy/ACME4 execution, live AI,
production multi-user persistence, or a completed human validation study.
