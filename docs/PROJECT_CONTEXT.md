# Project Context

_Last updated: 2026-06-20._

This document supersedes the older Evidence Arena framing as the repository's concise product context. `docs/PRODUCT_VISION.md` and `docs/PRODUCT_POSITIONING.md` define the current product direction.

## Product Identity

Telemetry Court is an evidence-based human-in-the-loop validation bench for AI-generated telemetry cluster interpretations.

```text
AI names the cluster. Humans test the evidence.
```

It turns generated cluster labels into testable claims and records structured human judgments that can improve labels, prompts, embeddings, evidence extraction, and clustering pipelines.

## Current Truth

- The current application is a static validation slice using synthetic cases.
- It demonstrates the evidence-first review flow and local structured export.
- It does not implement real Toponymy or ACME4 ingestion.
- It does not persist multi-reviewer results or generate aggregated evaluation reports.
- The next implementation milestone is the Case Package Contract and Validation Infrastructure, not generic backend work.

## Intended Architecture

```text
Upstream:
  Toponymy, notebooks, clustering pipelines,
  ACME4-derived or CloudTrail-derived experiments,
  synthetic/sanitized generators

Boundary:
  versioned CasePackage JSON

Telemetry Court:
  package validation, blind review, evidence classification,
  label comparison, outlier review, structured verdict capture,
  multi-reviewer aggregation

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

## Product Guardrails

Do not drift toward:

- generic dashboards;
- SIEM, SOC, EDR, or alert-triage workflows;
- raw telemetry search or live ingestion;
- chat-first UX or gamification;
- authentication or database work before the contracts are defined;
- generic CRUD or speculative enterprise features.

Prioritize:

- case package schema and validation;
- evidence provenance and sanitization;
- stable claim-to-evidence mappings;
- structured review results;
- multi-reviewer aggregation;
- evaluation exports;
- Toponymy and ACME4 adapter boundaries.

## Toponymy And ACME4

Telemetry Court starts after an upstream process has produced a cluster and candidate interpretation. Toponymy and ACME4-style workflows are future adapter sources, not current integrations. They should generate approved case packages rather than push raw restricted telemetry into the app.

The official [TutteInstitute/toponymy](https://github.com/TutteInstitute/toponymy) repository is the authoritative source for factual Toponymy claims in this repo.

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
