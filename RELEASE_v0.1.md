# Telemetry Court v0.1

This historical release is the current static validation slice. It demonstrates the review protocol; it is not complete validation infrastructure.

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

## Next Milestone

Define `CasePackage v0.1`, `ReviewResult v0.1`, and `EvaluationReport v0.1`; add validation rules; and adapt the current fixtures through the package boundary without redesigning the UI.

Authentication, production database design, admin UX, generic dashboards, and enterprise features are not the next milestone.
