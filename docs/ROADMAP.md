# Telemetry Court Roadmap

## Direction

Telemetry Court is an evidence-based human-in-the-loop validation bench for AI-generated telemetry cluster interpretations. The roadmap is organized around proving validation value, not adding generic product infrastructure.

## Milestone Overview

| Milestone | Status | Outcome |
|---|---|---|
| Milestone 0 - Current Static Validation Slice | Complete/current baseline | Synthetic interface demonstrates the review protocol without claiming real validation infrastructure. |
| Milestone 1 - Product Realignment And Documentation | Complete | Repository language, planning, architecture, and agent guidance align around the validation-bench direction. |
| Milestone 2 - Case Package Contract And Validation Infrastructure | Next | Versioned `CasePackage`, `ReviewResult`, and `EvaluationReport` contracts plus package validation. |
| Milestone 3 - Evaluation Infrastructure | Planned | Durable structured reviews, multi-reviewer aggregation, and evaluation exports. |
| Milestone 4 - Toponymy / ACME4 Adapter Prototype | Planned | One approved adapter converts a real or realistic cluster output into a case package. |
| Milestone 5 - Evidence-Constrained AI Assistance | Optional/later | Predefined evidence-citing questions with explicit missing-evidence behavior. |
| Milestone 6 - Research Validation Study | Target proof | Multiple reviewers demonstrate useful evaluation signals on real or realistic cases. |

## Milestone 0 - Current Static Validation Slice

- Existing Next.js review interface and five synthetic cases.
- Telemetry landscape, case file, blind review, AI reveal, evidence classification, label comparison, outlier selection, verdict, and local JSON export.
- Browser-local `ReviewResult` persistence keyed by CasePackage ID for exported review artifacts.
- Deterministic in-memory `EvaluationReport` aggregation and a fixture-backed read-only results view.
- Useful for demonstrating and testing the review protocol.
- Not real validation infrastructure: no package import, durable multi-user review storage, or report-generation workflow.

## Milestone 1 - Product Realignment And Documentation

- Align repository identity, product language, architecture, roadmap, planning, and agent instructions.
- Define current state, target state, data posture, and out-of-scope boundaries.
- Remove positive framing as a frontend MVP, game-like arena, generic investigation environment, dashboard, or vague future backend.
- Add positioning, case package contract, and evaluation infrastructure documents.

Definition of done: contributors can identify the validation-bench purpose and limitations; the three core contracts are separated; architecture points to evaluation infrastructure; and templates block SIEM/SOC/dashboard drift.

## Milestone 2 - Case Package Contract And Validation Infrastructure

- Define `CasePackage v0.1`, `ReviewResult v0.1`, and `EvaluationReport v0.1`.
- Specify required provenance, sanitization, stable IDs, evidence mappings, and safe drill-down references.
- Add validation rules and actionable errors for broken packages.
- Convert current sample cases into package-shaped fixtures or explicit adapters.
- Preserve current UI behavior through a narrow compatibility boundary.
- Test valid packages, unsupported versions, missing provenance, broken IDs, broken evidence links, and review export compatibility.

Definition of done: one versioned package-shaped fixture passes runtime validation and drives the current flow; invalid packages fail before rendering; review export identifies the package and protocol versions; contract decisions precede database or auth work.

## Milestone 3 - Evaluation Infrastructure

- Harden structured `ReviewResult` persistence beyond the current browser-local store.
- Support multiple independent reviewers.
- Aggregate compatible results.
- Export deterministic `EvaluationReport` JSON/CSV.
- Compare labels, prompts, models, embeddings, and evidence packages.
- Calculate support, overclaim, unsupported claim, partial support, uncertainty, impurity, split/merge, evidence sufficiency, disagreement, reviewer agreement, label winner, and failure-mode metrics.

Definition of done: multiple reviewers can review the same package without losing blind-review integrity; calculations are versioned, tested, and traceable; missing data is reported as unavailable.

## Milestone 4 - Toponymy / ACME4 Adapter Prototype

- Build one script or notebook-level adapter for an approved real or realistic precomputed cluster output.
- Emit minimal, auditable `CasePackage` JSON.
- Preserve provenance and sanitization metadata.
- Keep raw restricted telemetry outside the public or portable app.

Definition of done: one adapter-generated package validates and completes the review-to-report path without inventing Toponymy APIs or ACME4 access.

## Milestone 5 - Evidence-Constrained AI Assistance

- Offer predefined cross-examination questions only where they improve review quality.
- Require responses to cite case-package evidence IDs and admit missing evidence.
- Record model and prompt metadata for evaluation.
- Do not add generic chatbot behavior.

## Milestone 6 - Research Validation Study

- Run multiple reviewers across real or realistic cases.
- Evaluate reviewer agreement, label support, evidence sufficiency, and common failure modes.
- Compare at least one upstream variable such as label, prompt, model, embedding, or evidence extraction method.
- Publish a reproducible evaluation report and limitations.

## Product-Level Definition Of Done

Telemetry Court becomes a serious tool only when it can ingest a real or realistic precomputed cluster, accept a defensible evidence package, support multiple blind human reviews, store structured verdicts, aggregate judgments, and export metrics that improve labels, prompts, embeddings, or pipeline design.

## Planning Guardrails

- Do not create a generic backend milestone.
- Do not start with auth, production database design, admin UX, user management, or generic CRUD.
- Do not add SIEM, SOC, alert-triage, raw-search, or live-ingestion work.
- Do not schedule UI polish as a substitute for package and evaluation proof.
- Keep Milestone 2 as the next implementation milestone.
- Create only a small executable issue batch for the active milestone and its immediate blocker.
