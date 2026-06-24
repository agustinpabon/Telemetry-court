# Project Context

_Last updated: 2026-06-23._

This document supersedes the older Evidence Arena framing as the repository's concise product context. `docs/PRODUCT_VISION.md` and `docs/PRODUCT_POSITIONING.md` define the broader product direction; this file is the compact operating context for planning, issues, and coding agents.

## Product Identity

Telemetry Court is an evidence-based human-in-the-loop validation bench for AI-generated telemetry cluster interpretations.

```text
AI names the cluster. Humans test the evidence.
```

It turns generated cluster labels into testable claims and records structured human judgments that can improve labels, prompts, embeddings, evidence extraction, and clustering pipelines.

## Utility Gate

Telemetry Court is useful only if it can ingest real or realistic `CasePackage` JSON, collect structured `ReviewResult` objects, and produce auditable `EvaluationReport` outputs that help improve an upstream clustering or naming pipeline.

A polished review UI is not enough. Prioritize features only when they improve one of these capabilities:

- package import and validation;
- evidence-grounded human review;
- `ReviewResult` persistence, export, or import;
- multi-reviewer aggregation;
- `EvaluationReport` quality;
- adapter compatibility with Toponymy, DataMapPlot, notebooks, or sanitized telemetry experiments;
- execution of a small validation pilot.

## Current Truth

- The current application is a local validation slice using synthetic demo
  cases and validated local `CasePackage` JSON import.
- It demonstrates the evidence-first review flow, strict package validation
  and invalid-package failure surfaces, local structured export, browser-local
  `ReviewResult` persistence by CasePackage ID, and strict local
  `ReviewResult` bundle exchange.
- It does not implement real Toponymy or ACME4 ingestion.
- It does not yet include a real approved Toponymy/DataMapPlot/ACME4 notebook
  adapter, upstream refinement consumer, or real-data pilot.
- It includes synthetic, non-authoritative adapter-boundary fixtures for Toponymy/DataMapPlot-style and ACME4-style `CasePackage v0.1` shapes.
- It includes deterministic in-memory `EvaluationReportV01` aggregation and a
  local results view with per-package EvaluationReport JSON/CSV downloads and
  `cluster_refinement.v0.1` export when compatible source ReviewResults are
  available.
- It does not provide durable server-side review storage, multi-user
  persistence, a durable report workflow, or research-grade metrics.
- Because one report still requires one exact compact CasePackage reference, package/pipeline/model/prompt/embedding rollups are currently single-value context or explicitly unavailable, not cross-run rankings.
- The main product risk is not visual quality. The main risk is mistaking the
  local validation loop for real-world validation before an approved adapter,
  realistic packages, and independent reviewer exercise prove the loop.
- Evidence-constrained AI assistance remains later priority until the approved
  adapter, refinement, and pilot loop has evidence beyond synthetic demos.

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
  review result persistence/export/import, multi-reviewer aggregation

Outputs:
  ReviewResult JSON and EvaluationReport JSON/CSV

Downstream:
  prompt improvement, label refinement, embedding comparison,
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
```

Features that do not improve this path should wait unless they fix correctness, validation, data handling, or serious review usability blockers.

## Product Guardrails

Do not drift toward:

- generic dashboards;
- SIEM, SOC, EDR, or alert-triage workflows;
- raw telemetry search or live ingestion;
- chat-first UX or gamification;
- authentication or database work before the imported-package review-to-report
  loop is proven locally;
- generic CRUD or speculative enterprise features.

Do not add Splunk, Elastic, remediation, or operational action generation as a core promise. If tactical queries or actions ever appear, they must be optional upstream metadata inside a `CasePackage`, not something Telemetry Court invents.

## Priority Correction

This is not a full product reset. Preserve the CasePackage -> ReviewResult -> EvaluationReport direction. The priority correction is to move the real utility loop ahead of further cosmetic polish or evidence-constrained AI assistance.

Milestone 4 is active: Toponymy / DataMapPlot / ACME4 Adapter Prototype & Hot-Loop Connection.

Completed local Milestone 4 producer pieces:

1. Define the adapter boundary and loop refinement spec.
2. Complete the sanitized adapter prototype plan.
3. Implement the pure sanitized `CasePackageV01` adapter mapper helper.
4. Create the CLI wrapper for the sanitized CasePackage adapter mapper.
5. Document the sanitized adapter input contract and notebook handoff.
6. Add deterministic mapper/CLI preflight validation.
7. Add explicit CLI input and output flags.

Prioritize next:

1. Build a local file system watcher daemon API in Next.js that loads packages from a Hot-Folder and reloads the browser dynamically.
2. Create `telemetry_court_client.py`, a simple Python helper module, to automate sending clusters from Jupyter notebooks and picking up results.
3. Implement visual log highlighting in the Evidence Board to show exactly which telemetry fields support/contradict LLM-generated claims.
4. Add visual split and merge controls in the UI next to UMAP neighborhood boundaries.
5. Consume `cluster_refinement.v0.1` and run a small approved pilot with 3-5 real or realistic packages to verify the closed-loop developer workflow.

Evidence-constrained AI assistance remains a later milestone. It should cite evidence IDs, admit missing evidence, and avoid generic chatbot behavior.

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

Telemetry Court becomes serious when someone can run this loop:

```text
external real or realistic CasePackage
-> strict package validation
-> blind evidence-grounded review
-> structured ReviewResult export
-> multi-reviewer import/aggregation
-> EvaluationReport showing label support, overclaim, evidence sufficiency, cluster impurity, and reviewer disagreement
-> upstream prompt/model/embedding/evidence extraction improvement
```

A credible proof point is 3-5 real or realistic case packages, 2-3 independent reviewers, exported ReviewResults, and one EvaluationReport that identifies what should be accepted, renamed, split, merged, rerun, or marked uncertain.

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
