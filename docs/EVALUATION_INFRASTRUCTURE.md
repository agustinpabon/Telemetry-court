# Evaluation Infrastructure

## Direction

The backend direction for Telemetry Court is evaluation infrastructure, not a generic web-application backend.

Its purpose is to preserve a trustworthy path from a precomputed cluster and generated interpretation to structured human judgment and reusable evaluation metrics.

## Priority Order

1. Import precomputed clusters through a versioned contract.
2. Convert upstream output into reviewable case and evidence packages.
3. Validate package identity, provenance, references, and integrity.
4. Preserve blind human review before showing the AI-generated label.
5. Allow safe drill-down into real, sanitized, or approved semi-raw evidence.
6. Save structured human `ReviewResult` records.
7. Support multiple independent reviewers.
8. Aggregate compatible reviewer judgments.
9. Export `EvaluationReport` metrics that improve models, prompts, embeddings, labels, evidence extraction, and clustering decisions.

## Evaluation Outputs

Expected metrics include:

- label support rate;
- overclaim rate;
- unsupported claim rate;
- partial support rate;
- uncertainty rate;
- cluster impurity rate;
- split recommendation rate;
- merge recommendation rate;
- evidence sufficiency;
- evidence disagreement;
- reviewer agreement;
- label winner distribution;
- failure mode frequency;
- model comparison metrics;
- prompt comparison metrics;
- embedding comparison metrics;
- evidence-extraction comparison metrics.

Every metric must define its inputs, denominator, treatment of incomplete reviews, compatible schema versions, and calculation version. Metrics that cannot be calculated from available data must be reported as unavailable.

## Review Integrity

The infrastructure must preserve:

- the exact `CasePackage` version reviewed;
- blind-review state and reveal timing;
- stable claim, evidence, label, and session IDs;
- provenance and sanitization metadata;
- reviewer independence where the study protocol requires it;
- incomplete or uncertain judgments without coercing a definitive answer;
- an audit trail from aggregate metrics back to source review results.

## Current State And Next Proof

The current application stores review state locally and exports a single structured JSON record from synthetic fixtures. It does not yet provide package import, contract validation, durable review storage, multi-reviewer aggregation, or research-grade metrics.

The next proof is a narrow end-to-end slice: validate one package-shaped real or realistic fixture, complete blind review, export a versioned `ReviewResult`, combine multiple compatible results, and produce a deterministic `EvaluationReport`.

## Deferred Concerns

Login, user administration, generic dashboards, admin UX, enterprise permissions, production database design, organization management, billing, and broad API platforms are later concerns. They must not be treated as the next milestone or used to avoid defining the case and evaluation contracts.

Database and identity choices should follow actual evaluation requirements such as reviewer privacy, study protocols, auditability, concurrency, retention, and export. They should not define the product before those requirements exist.
