# Project Context

_Last updated: 2026-08-30._

This document supersedes the older Evidence Arena framing as the repository's concise product context. `docs/PRODUCT_VISION.md` and `docs/PRODUCT_POSITIONING.md` define the broader product direction; this file is the compact operating context for planning, issues, and coding agents.

## Product Identity

Telemetry Court is an evidence-based human-in-the-loop validation bench and
topological refiner for AI-generated telemetry cluster interpretations.

```text
AI names the cluster. Humans test the evidence.
```

It turns generated cluster labels into testable claims and records structured human judgments that can improve labels, prompts, embeddings, evidence extraction, and clustering pipelines.

## Utility Gate

Telemetry Court is useful only if it can ingest real or realistic
`CasePackage` JSON, collect structured `ReviewResult` objects, produce auditable
`EvaluationReport` outputs, and hand review-derived refinement recommendations
back to an external upstream clustering or naming pipeline.

A polished review UI is not enough. Prioritize features only when they improve one of these capabilities:

- package import and validation;
- evidence-grounded human review;
- `ReviewResult` persistence, export, or import;
- multi-reviewer aggregation;
- `EvaluationReport` quality;
- adapter compatibility with Toponymy, DataMapPlot, notebooks, or sanitized telemetry experiments;
- topology/refinement handoff quality;
- execution of a small validation pilot.

## Current Truth

- Milestone 3 is implemented. Reviewers can import and strictly validate local
  `CasePackage v0.1` JSON, complete the evidence-first workflow, persist/export
  one structured `ReviewResult` per reviewer session, exchange validated
  bundles, and aggregate compatible results locally.
- The results route produces per-package `EvaluationReport v0.1` JSON/CSV,
  shows disagreement and unavailable states, renders topology from coordinates
  supplied by a compatible CasePackage, and exports validated
  `cluster_refinement.v0.1` artifacts from full evidence ReviewResults.
- Quick dispositions are a separate validated artifact and local-store path.
  They remain visible on Results but are excluded from full ReviewResult,
  EvaluationReport, and refinement aggregation.
- Reviewer ID/context controls and non-blocking ReviewResult semantic warnings
  are implemented locally. They do not add accounts, reviewer scoring, or
  server identity.
- Milestone 4's repository-owned engineering is implemented: a pure sanitized
  adapter mapper and CLI, deterministic preflight, local Hot-Folder scan and
  polling, a standard-library Python file-contract companion, sanitized
  evidence field highlights, structured split/merge review controls, and an
  external refinement-consumer handoff.
- The repository still does not execute Toponymy, DataMapPlot, UMAP/HDBSCAN,
  ACME4, or a notebook pipeline. The Toponymy-style and ACME4-style fixtures are
  synthetic, non-authoritative contract rehearsals.
- Milestone 5 now includes the first UI slice: a collapsed, deterministic
  mocked Evidence Assistance panel on the Evidence Board. It uses the canonical
  fixed question set, exact validated package IDs, request guardrails, response
  validation, and the claim critic. It has no live provider, arbitrary prompt,
  streaming, transcript, or ReviewResult/EvaluationReport persistence.
- Browser-local state and local files are the persistence boundary. There is no
  durable server-side review store, multi-user service, report warehouse, auth,
  or production backend.
- One EvaluationReport still requires one exact CasePackage reference.
  Package/pipeline/model/prompt/embedding metadata is therefore per-package
  context or explicitly unavailable, not a cross-run ranking.
- Milestone 6's acceptance study has not been completed. Issue #74 recorded one
  synthetic expert walkthrough and ReviewResult as product feedback, not a
  clean independent validation study. No approved realistic package set,
  independent reviewer result set, scientific validation, model-superiority
  result, or upstream-improvement claim exists in the repository.

## Intended Architecture

```text
Upstream:
  Toponymy, DataMapPlot, notebooks, clustering pipelines,
  ACME4-derived or CloudTrail-derived experiments,
  synthetic or sanitized generators

Boundary:
  versioned CasePackage JSON

Telemetry Court:
  package validation, blind review, evidence classification,
  label comparison, outlier review, structured verdict capture,
  review result persistence/export/import, multi-reviewer aggregation,
  results topology, deterministic mocked evidence assistance

Outputs:
  ReviewResult JSON, EvaluationReport JSON/CSV,
  cluster_refinement.v0.1 JSON

Downstream:
  external prompt improvement, label refinement, embedding comparison,
  evidence extraction improvement, split/merge decisions,
  research reports and validation studies
```

Telemetry Court owns reviewability, auditability, evidence grounding, and human validation. It does not own the complete telemetry-processing stack.

## Core Contracts

- `CasePackage`: what the upstream system produced and what is under review.
- `ReviewResult`: what one human reviewer decided.
- `EvaluationReport`: what Telemetry Court learns by aggregating compatible reviews.

Do not collapse these objects into one generic case record. See [CASE_PACKAGE_CONTRACT.md](./CASE_PACKAGE_CONTRACT.md).

## Utility Loop

```text
local CasePackage import
-> strict validation and useful failure UI
-> structured review
-> ReviewResult persistence/export/import
-> local or imported result aggregation
-> EvaluationReport JSON/CSV
-> results topology when compatible coordinates exist
-> cluster_refinement.v0.1 export
-> external upstream consumer
```

Features that do not improve this path should wait unless they fix correctness, validation, data handling, or serious review usability blockers.

## Product Guardrails

Do not drift toward:

- generic dashboards;
- SIEM, SOC, EDR, or alert-triage workflows;
- raw telemetry search or live ingestion;
- chat-first UX or gamification;
- authentication or database work without a separately approved contract and
  validated research need;
- generic CRUD or speculative enterprise features.

Do not add Splunk, Elastic, remediation, or operational action generation as a core promise. If tactical queries or actions ever appear, they must be optional upstream metadata inside a `CasePackage`, not something Telemetry Court invents.

## Milestone Reality And Priority

This is not a product reset. Preserve the
CasePackage -> ReviewResult -> EvaluationReport -> cluster refinement direction.

- Milestone 3 is complete in the repository.
- Milestone 4's planned local engineering is complete. The Hot-Folder is a
  local scan/polling path, not a remote daemon or ingestion service; the Python
  module is a file-contract helper, not a clustering SDK.
- Milestone 5 is active and deliberately narrow. The first fixed-question
  mocked panel is implemented. Live providers, prompt execution, transcripts,
  configurable questions, assistance-use metrics, and ReviewResult schema
  changes remain separate unresolved scope.
- Milestone 6 is the priority proof step. Run the approved protocol with 3-5
  realistic/sanitized packages and 2-3 independent reviewers, then evaluate an
  external refinement/rerun. Code and synthetic examples cannot complete it.

Near-term engineering should harden correctness, local file and browser-state
boundaries, accessibility, tests, CI, and study operability. Do not add another
speculative feature layer to avoid the human proof.

Fast review is allowed when it means evidence validation or batch validation.
It must preserve blind review, claim-to-evidence grounding, structured ratings,
structured verdicts, exportable ReviewResults, and aggregation into an
EvaluationReport. Do not frame fast review as SOC triage, live alert handling,
incident response, remediation, or operational action generation.

## Toponymy And ACME4

Telemetry Court starts after an upstream process has produced a cluster and candidate interpretation. Toponymy and ACME4-style workflows are adapter sources, not raw integrations. They should generate approved case packages rather than push raw restricted telemetry into the app.

Adapter-generated packages should not only include central exemplars. They should include evidence that can challenge the label: representative examples, boundary examples, outliers or impostors, confusing neighbors, distinctive features, provenance, sanitization metadata, and any available coherence or uncertainty metrics.

The official [TutteInstitute/toponymy](https://github.com/TutteInstitute/toponymy) repository is the authoritative source for factual Toponymy claims in this repo.

## Definition Of Real Usefulness

Telemetry Court's local implementation can run this artifact loop:

```text
external real or realistic CasePackage
-> strict package validation
-> blind evidence-grounded review
-> structured ReviewResult export
-> multi-reviewer import/aggregation
-> EvaluationReport showing label support, overclaim, evidence sufficiency, cluster impurity, and reviewer disagreement
-> cluster_refinement.v0.1
-> external upstream prompt/model/embedding/evidence extraction improvement
```

A credible proof point still requires 3-5 approved realistic/sanitized case
packages, 2-3 independent reviewers, exported ReviewResults, auditable
EvaluationReports, and an external upstream iteration that evaluates what
should be accepted, renamed, split, merged, rerun, or marked uncertain. None of
those human study results should be inferred from repository fixtures.

## Glossary

- **Case package:** A versioned, provenance-bearing cluster interpretation and its reviewable evidence.
- **Claim:** A specific assertion made by a generated label or explanation.
- **Evidence item:** A stable, reviewable object that may support, weakly support, contradict, fail to address, or require more context for a claim.
- **Blind interpretation:** A structured human choice made before the AI label is shown.
- **Label comparison:** A structured choice among candidate labels; the current UI calls this a label duel.
- **Outlier or impostor:** A representative session that may weaken cluster coherence.
- **Structured verdict:** The reviewer's final judgment and recommended action.
- **Review result:** One reviewer's versioned output.
- **Evaluation report:** Aggregated judgments and metrics across compatible reviews.
