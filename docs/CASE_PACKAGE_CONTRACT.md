# Case Package Contract

## Purpose

The next serious backend milestone is not to "connect a backend." It is to define a versioned boundary between upstream cluster-generation systems, human review, and evaluation output.

```text
CasePackage -> ReviewResult -> EvaluationReport
```

- `CasePackage`: what the upstream model, Toponymy pipeline, notebook, adapter, or clustering process produced.
- `ReviewResult`: what one human reviewer decided after following the review protocol.
- `EvaluationReport`: what Telemetry Court learns after aggregating one or more review results.

This document defines the intended contract. It does not implement schemas, persistence, APIs, or adapters.

## CasePackage

A `CasePackage` is the versioned object under review. It should eventually include:

- `schema_version` and stable package ID;
- case metadata and review title;
- dataset identity, version, environment, and handling classification;
- cluster identity, size, characterization, and upstream references;
- pipeline metadata for clustering, embeddings, prompts, models, and evidence extraction where available;
- candidate labels and their generation metadata;
- AI-generated explanations decomposed into stable claims;
- evidence items with stable IDs, source types, summaries, and provenance;
- explicit evidence-to-claim mappings;
- representative sessions or approved exemplars;
- outlier or impostor candidates;
- neighboring clusters and comparison context where available;
- coherence, distinctiveness, evidence coverage, model agreement, uncertainty, outlier score, and temporal stability metrics where available;
- safe drill-down references to approved semi-raw or derived evidence;
- provenance, transformation, and sanitization metadata;
- review configuration, including blind-review rules and allowed structured choices.

Metrics are optional when an upstream pipeline cannot provide them. Missing metrics must be represented as unavailable, not invented or silently defaulted.

## ReviewResult

A `ReviewResult` records one completed or intentionally incomplete human review. It should eventually include:

- review ID and reviewer or session identifier;
- case package ID and `schema_version`;
- review protocol and UI version;
- blind interpretation choice before label reveal;
- label reveal state;
- evidence ratings linked to evidence and claim IDs;
- candidate-label winner and reasons;
- outlier or impostor choice;
- confidence and uncertainty;
- failure modes;
- final structured verdict;
- recommended action;
- optional expert notes;
- timestamps and completion state.

A `ReviewResult` must not mutate the source `CasePackage`. It is an auditable judgment about that package.

## EvaluationReport

An `EvaluationReport` aggregates one or more compatible `ReviewResult` records. It should eventually include:

- case and package version references;
- reviewer count and completion count;
- verdict and label-winner distributions;
- evidence-rating distributions;
- reviewer agreement and disagreement signals;
- disputed or insufficient evidence;
- common failure modes;
- cluster impurity and split or merge signals;
- model, prompt, embedding, and evidence-extraction comparison metadata where available;
- recommended follow-up actions;
- calculation version and report provenance.

An `EvaluationReport` is not a generic product analytics dashboard. It is evaluation output about the quality and support of AI-generated cluster interpretations.

## Package Validation

Package validation must fail loudly and return useful, addressable errors. At minimum, validation should check:

- `schema_version` is present and supported;
- package, case, cluster, label, claim, evidence, and session IDs are unique and well formed;
- every referenced claim, evidence item, label, session, and neighbor exists;
- evidence-to-claim mappings are not broken;
- claims with no evidence are explicitly marked unsupported or missing evidence;
- candidate labels reference valid claims where the contract requires it;
- representative sessions and outlier candidates are internally consistent;
- metric values are correctly typed, bounded, and marked unavailable when absent;
- dataset and pipeline metadata meet the package's declared requirements;
- provenance and sanitization metadata are present where required;
- drill-down references use approved reference types and do not embed prohibited raw data;
- review configuration can support the required blind and structured review flow.

Telemetry Court must not silently render a package with broken evidence links, missing provenance, or ambiguous IDs.

## Data And Adapter Boundary

Telemetry Court should not require raw restricted telemetry for the public or portable application. Real or restricted data should be transformed into approved evidence packages inside the environment authorized to process it.

Toponymy, ACME4-derived experiments, CloudTrail-derived experiments, notebooks, and other upstream systems should integrate through adapters that generate `CasePackage` JSON. They should not force the application to become a raw telemetry ingestion or search engine.

Safe drill-down may point to semi-raw or approved evidence in the source environment. A reference must carry provenance and handling metadata; it must not imply that the referenced data can be copied into every deployment.

## Versioning And Compatibility

- Schema versioning is mandatory for all three contracts.
- Readers must reject unsupported major versions.
- Migrations or adapters must be explicit and testable.
- Exported `ReviewResult` records must retain the exact case package and protocol versions reviewed.
- `EvaluationReport` generation must document which result versions it accepts and how metrics were calculated.
- Current synthetic `CaseFile` fixtures are implementation-specific data. Milestone 2 should convert or adapt them into package-shaped fixtures without silently declaring the existing type to be `CasePackage v0.1`.

## v0.1 Design Questions

The contract milestone must resolve, with tests and examples:

- required versus optional dataset and pipeline provenance;
- safe drill-down reference types;
- claim-to-evidence cardinality and missing-evidence representation;
- package-level versus claim-level metrics;
- reviewer identity and privacy posture;
- compatibility rules for aggregation;
- deterministic calculation rules for evaluation metrics;
- error taxonomy for invalid packages.

Those decisions belong before database selection, authentication, admin interfaces, or generic API design.
