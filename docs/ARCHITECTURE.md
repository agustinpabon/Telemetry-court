# Architecture

## Architectural Purpose

Telemetry Court is the validation layer for AI-generated telemetry cluster interpretations. It does not own the full telemetry-processing stack.

```text
Upstream systems
-> versioned CasePackage JSON
-> Telemetry Court review interface and validation engine
-> ReviewResult JSON
-> EvaluationReport metrics
-> upstream pipeline improvement
```

## Upstream

Potential upstream producers include Toponymy, notebooks and clustering pipelines, embedding and prompt-comparison experiments, ACME4-derived or CloudTrail-derived experiments, DataMapPlot or other cluster-map outputs, and synthetic, sanitized, or approved evidence-package generators.

Upstream systems own raw telemetry processing, sessionization, embeddings, clustering, and initial label generation. Telemetry Court must not invent those capabilities or require one specific upstream implementation.

The adapter boundary for those producer categories is documented in
[`ADAPTER_BOUNDARY.md`](./ADAPTER_BOUNDARY.md). It frames future Toponymy,
DataMapPlot, ACME4-style, CloudTrail-style, and synthetic/sanitized producers
as sources of approved `CasePackage` JSON, not as raw telemetry integrations.

## Boundary: CasePackage JSON

The integration boundary is a validated, versioned `CasePackage`, not direct access to raw telemetry or an unspecified backend API.

The package contains the cluster interpretation, claims, evidence, provenance, review configuration, and safe references needed for review. Adapters translate approved upstream output into this contract. See [CASE_PACKAGE_CONTRACT.md](./CASE_PACKAGE_CONTRACT.md).

This repository must not claim real Toponymy support, real ACME4 support,
DataMapPlot execution, or raw restricted telemetry ingestion until a concrete
adapter is implemented, validated, and documented.

## Telemetry Court

Telemetry Court owns:

- package schema validation and compatibility checks;
- blind-review protocol enforcement;
- evidence-to-claim inspection;
- structured evidence classifications;
- candidate-label comparison;
- outlier or impurity review;
- structured verdict capture;
- review result integrity;
- multi-reviewer aggregation;
- evaluation export and auditability.

The current repository implements the static review interface, local state,
synthetic fixtures, package validation, `ReviewResultV01` export, browser-local
ReviewResult storage keyed by CasePackage ID, and a pure in-memory
`EvaluationReportV01` aggregation utility. It has no package upload flow,
server-side persistence layer, multi-reviewer service, report UI, Toponymy
adapter, or ACME4 adapter yet.

## Outputs

`ReviewResult` contains one reviewer's versioned decisions about one case package. `EvaluationReport` aggregates compatible review results into agreement, disagreement, support, overclaim, uncertainty, impurity, split or merge, evidence sufficiency, label winner, and comparison metrics.

## Downstream

Outputs should support prompt improvement, label refinement, model and embedding comparison, evidence-extraction improvement, cluster split or merge decisions, research reports, and validation studies.

## Data Handling Boundary

The public or portable app should use synthetic, sanitized, or approved packages. Restricted telemetry should remain in its authorized environment. Adapter code may produce safe summaries and drill-down references, but Telemetry Court must not assume those references can be resolved in every deployment.

Missing provenance, unsupported schema versions, broken evidence links, and invalid references are validation errors. They are not UI warnings to ignore.

## Current Repository Structure

- `app/`: Next.js App Router entry and route handling.
- `components/`: Review workflow and visual components.
- `data/`: Current synthetic fixtures.
- `lib/`: Current TypeScript domain types, review state, metrics, and export helpers.
- `docs/`: Product, contract, architecture, evaluation, and workflow guidance.

These folders describe the present implementation, not the final service decomposition.

## Next Architectural Milestone

Milestone 2 must define and validate `CasePackage v0.1`, `ReviewResult v0.1`, and `EvaluationReport v0.1`, then adapt one package-shaped fixture through the existing UI and export path.

Do not choose a production database, authentication system, workspace model, admin interface, or broad API surface before the contract and evaluation requirements are proven.
