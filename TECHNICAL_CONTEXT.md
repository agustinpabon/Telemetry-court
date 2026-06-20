# Telemetry Court Technical Context

## Current Implementation

Telemetry Court currently uses Next.js App Router, TypeScript, Tailwind, synthetic fixture data, local React/session state, and the Node test runner with `tsx`.

It is a static validation slice. There is no implemented `CasePackage` import boundary, runtime schema validator, production persistence, multi-reviewer service, `EvaluationReport` generator, Toponymy adapter, or ACME4 adapter.

## Target Technical Boundary

```text
Adapter-produced CasePackage JSON
-> runtime package validation
-> current structured review UI
-> versioned ReviewResult JSON
-> deterministic multi-reviewer EvaluationReport
```

The backend direction is evaluation infrastructure. Do not introduce generic APIs, databases, authentication, admin UX, or CRUD before a contract and evaluation requirement demands them.

## Current Domain Objects

The implemented code currently uses `CaseFile`, `Cluster`, `TopicLabel`, `Claim`, `EvidenceItem`, `EvidenceRelation`, `SupportScore`, `BlindInterpretationOption`, `CandidateLabel`, `RepresentativeSession`, `EvidenceArenaReview`, and `AnalystVerdict`.

These are current implementation types, not the approved `CasePackage v0.1` contract. Milestone 2 must define an explicit adapter or migration rather than silently renaming them.

`evidenceRelations` remains the current canonical claim-to-evidence link. Do not create a second link mechanism before the contract work resolves the mapping shape.

## Technical Priorities

1. Define schema versions and compatibility rules.
2. Validate package IDs, references, provenance, sanitization, metrics, and review configuration.
3. Adapt one package-shaped fixture into the current UI.
4. Bind review exports to source package and protocol versions.
5. Aggregate compatible results with deterministic, tested metrics.
6. Prototype one approved Toponymy or ACME4-style adapter only after the contract holds.

## Data Safety

Keep raw restricted telemetry outside the public or portable app. Adapters should produce minimal approved evidence and safe drill-down references with provenance and sanitization metadata.

## Test Strategy

- Unit tests for contract and metric behavior.
- Fixture tests for valid and invalid packages.
- Export tests for package and protocol version traceability.
- Existing smoke and interaction tests for blind review and structured choices.
- Browser checks for user-visible workflow changes.

## Checks

```bash
npm test
npm run lint
npm run build
```
