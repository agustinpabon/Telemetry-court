# Architecture

## Architectural Purpose

Telemetry Court is the validation and human-derived topological-refinement
layer for AI-generated telemetry cluster interpretations. It does not own the
full telemetry-processing stack.

```text
Upstream systems
-> versioned CasePackage JSON
-> Telemetry Court review interface and validation engine
-> ReviewResult JSON
-> EvaluationReport metrics
-> cluster_refinement.v0.1
-> external upstream pipeline improvement
```

## Upstream

Potential upstream producers include Toponymy, notebooks and clustering pipelines, embedding and prompt-comparison experiments, ACME4-derived or CloudTrail-derived experiments, DataMapPlot or other cluster-map outputs, and synthetic, sanitized, or approved evidence-package generators.

Upstream systems own raw telemetry processing, sessionization, embeddings, clustering, and initial label generation. Telemetry Court must not invent those capabilities or require one specific upstream implementation.

The adapter boundary for those producer categories is documented in
[`ADAPTER_BOUNDARY.md`](./ADAPTER_BOUNDARY.md). The spec for Milestone 4, detailing the adapter interface mapping and the refinement consumer loop, is documented in [`MILESTONE_4_ADAPTER_BOUNDARY.md`](./MILESTONE_4_ADAPTER_BOUNDARY.md). It frames future Toponymy,
DataMapPlot, ACME4-style, CloudTrail-style, and synthetic/sanitized producers
as sources of approved `CasePackage` JSON, not as raw telemetry integrations.

## Boundary: CasePackage JSON

The integration boundary is a validated, versioned `CasePackage`, not direct access to raw telemetry or an unspecified backend API.

The package contains the cluster interpretation, claims, evidence, provenance, review configuration, and safe references needed for review. Adapters translate approved upstream output into this contract. See [CASE_PACKAGE_CONTRACT.md](./CASE_PACKAGE_CONTRACT.md).

The repository implements a generic sanitized mapper/CLI and local file handoff,
not direct Toponymy or ACME4 integration. It must not claim Toponymy,
DataMapPlot, UMAP/HDBSCAN, or ACME4 execution, or raw restricted telemetry
ingestion. Concrete upstream notebooks/scripts remain outside Telemetry Court.

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
- evaluation export and auditability;
- results topology from compatible CasePackage coordinates;
- versioned refinement export for external upstream use.

The current repository implements strict manual CasePackage import, a
server-configured local Hot-Folder scan/polling route, browser-local review and
package metadata, structured ReviewResult and separate quick-disposition
artifacts, result/bundle validation and exchange, deterministic
`EvaluationReportV01` aggregation, results topology, JSON/CSV export, and
validated `cluster_refinement.v0.1` export. A standard-library Python companion
writes approved package-shaped JSON atomically and reads refinement artifacts.

The Evidence Board also has optional sanitized field highlights and a
deterministic mocked assistance layer. The assistance boundary uses only fixed
questions and exact validated package references, and validates/criticizes the
response before display. It has no provider, network call, prompt execution,
transcript, or persistence into ReviewResult/EvaluationReport.

There is no server-side review persistence, multi-user service, durable report
workflow, production database, authentication system, direct Toponymy adapter,
or ACME4 adapter/executor.

## Outputs

`ReviewResult` contains one reviewer's versioned decisions about one case
package. `EvaluationReport` aggregates compatible full ReviewResults into
agreement, disagreement, support, overclaim, uncertainty, impurity, split or
merge, evidence sufficiency, label winner, and comparison metrics.

`QuickDisposition v0.1` is a shallower early disposition. It is stored and
displayed separately and never masquerades as a completed ReviewResult or
enters EvaluationReport/refinement aggregation.

`cluster_refinement.v0.1` is derived from an EvaluationReport plus the exact
compatible source ReviewResults. It carries traceable pruning, split, merge,
uncertainty, and disagreement recommendations. It is a review-derived recipe,
not an executable clustering command or an automatic verdict.

The current comparison metrics group canonical verdict and evidence-rating
counts by selected label ID and metadata already present in compact CasePackage
references. Exact package-reference compatibility remains required, so
non-label metadata is single-value context within one report. Cross-package or
cross-run benchmarking is not implemented.

## Downstream

Outputs should support external prompt improvement, label refinement, model and
embedding comparison, evidence-extraction improvement, cluster pruning/split/
merge decisions, research reports, and validation studies. Telemetry Court
exports recommendations; the authorized upstream environment decides whether
and how to apply them.

## Data Handling Boundary

The public or portable app should use synthetic, sanitized, or approved packages. Restricted telemetry should remain in its authorized environment. Adapter code may produce safe summaries and drill-down references, but Telemetry Court must not assume those references can be resolved in every deployment.

Explicit synthetic demos carry synthetic case, dataset, and sanitization
markers and do not claim real-data approval. Non-synthetic adapter outputs must
carry adapter/run provenance, concrete safe audit references, sanitization
details, and a scoped review-approval record. That approval covers the exported
package revision, not raw telemetry access or ingestion.

Missing provenance, unsupported schema versions, broken evidence links, and invalid references are validation errors. They are not UI warnings to ignore.

Local file reads are bounded at the UI/server boundary: CasePackage browser and
Hot-Folder inputs use a 2 MiB limit, while browser-imported review artifacts use
an 8 MiB limit. Browser readers check file metadata before reading and actual
UTF-8 bytes afterward. Hot-Folder reads also use top-level/no-follow path checks
and post-read race/size verification. Byte-backed browser and Hot-Folder
imports reject invalid UTF-8. Hot-Folder validation diagnostics and unsupported
ReviewResult/bundle import-schema errors stay generic and do not echo supplied
values or artifact content.

## Current Repository Structure

- `app/`: Next.js App Router entry, results route, and local Hot-Folder API.
- `components/`: Review, assistance, results, and topology UI components.
- `data/`: Synthetic fixtures and synthetic report examples.
- `lib/`: Versioned contracts, validators, review state, storage/import helpers,
  aggregation, assistance guardrails, and refinement logic.
- `scripts/`: Local validation/adapter/browser utilities; no raw telemetry
  processing.
- `python/`: Standard-library Hot-Folder file-contract companion and tests; no
  Toponymy/ACME4/clustering execution.
- `docs/`: Product, contract, architecture, evaluation, and workflow guidance.

These folders describe the present implementation, not the final service decomposition.

## Next Architectural Proof

The repository-owned Local Utility Gate and adapter/refinement boundaries are
implemented. The next architectural proof is not a new service layer: an
approved external notebook/script must produce realistic sanitized packages,
independent reviewers must create compatible ReviewResults, and an authorized
upstream consumer must inspect and deliberately apply, reject, defer, or record
an explicit no-action outcome for the exported refinement artifact.

Do not choose a production database, authentication system, workspace model,
admin interface, broad API surface, raw telemetry ingestion path, or live
provider architecture until a concrete, separately approved contract or study
need requires it. Do not let any future assistance provider leak into the UI or
weaken blind/human review.
