# Telemetry Court Roadmap

## Direction

Telemetry Court is an evidence-based human-in-the-loop validation bench for AI-generated telemetry cluster interpretations. The roadmap is organized around proving validation value, not adding generic product infrastructure.

## Utility Gate

A feature is useful only if it helps produce or improve an auditable
`EvaluationReport` from real or realistic `CasePackage` inputs.

The next proof of value is:

```text
import CasePackage JSON
-> validate it strictly
-> review it
-> persist/export ReviewResult
-> import/aggregate ReviewResults
-> produce EvaluationReport
```

Work that does not improve this loop should wait unless it fixes correctness,
validation, data handling, or a serious evidence-review usability blocker.
Evidence-constrained AI assistance is intentionally later priority until local
package import, result exchange, and aggregation are usable.

## Milestone Overview

| Milestone | Status | Outcome |
|---|---|---|
| Milestone 0 - Current Static Validation Slice | Complete/current baseline | Synthetic interface demonstrates the review protocol without claiming real validation infrastructure. |
| Milestone 1 - Product Realignment And Documentation | Complete | Repository language, planning, architecture, and agent guidance align around the validation-bench direction. |
| Milestone 2 - Case Package Contract And Validation Infrastructure | Complete/current foundation | Versioned `CasePackage`, `ReviewResult`, and `EvaluationReport` contracts, package validation, package-shaped fixtures, and local export/aggregation foundations. |
| Milestone 3 - Local Utility Gate | Complete | Local CasePackage import, useful invalid-package failure UI, ReviewResult persistence/export/import, results from local/imported ReviewResults, and an end-to-end imported-package smoke test. |
| Milestone 4 - Toponymy / ACME4 Adapter Prototype | Active/In progress | One approved adapter converts a real or realistic cluster output into a case package without raw restricted telemetry ingestion. See [MILESTONE_4_ADAPTER_BOUNDARY.md](./MILESTONE_4_ADAPTER_BOUNDARY.md) and [MILESTONE_4_ADAPTER_PROTOTYPE_PLAN.md](./MILESTONE_4_ADAPTER_PROTOTYPE_PLAN.md). |
| Milestone 5 - Evidence-Constrained AI Assistance | Later/deferred | Predefined evidence-citing questions with explicit missing-evidence behavior after import/results/aggregation are usable. |
| Milestone 6 - Research Validation Study | Target proof | Multiple reviewers demonstrate useful evaluation signals on real or realistic cases. |

## Milestone 0 - Current Static Validation Slice

- Existing Next.js review interface and five synthetic cases.
- Telemetry landscape, case file, blind review, AI reveal, evidence classification, label comparison, outlier selection, verdict, and local JSON export.
- Browser-local `ReviewResult` persistence keyed by CasePackage ID for exported review artifacts.
- Deterministic in-memory `EvaluationReport` aggregation, a fixture-backed read-only results view, and JSON/CSV export for that existing report shape.
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

## Milestone 3 - Local Utility Gate (Complete)

- Import external `CasePackage` JSON from a local file.
- Validate imported packages before review and show useful failures for broken
  IDs, links, versions, provenance, sanitization, or review configuration.
- Persist `ReviewResult` artifacts locally without adding backend persistence,
  accounts, auth, or databases.
- Export and import `ReviewResult` bundles for one compatible package.
- Build the results page from local or imported ReviewResults instead of only
  a static fixture report.
- Aggregate compatible results into an `EvaluationReport` that exposes label
  support, overclaim, evidence sufficiency, cluster impurity, and reviewer
  disagreement signals where the current contracts can support them.
- Add an end-to-end smoke test for imported package -> review -> exported
  result -> EvaluationReport.

Definition of done: a reviewer can import a realistic package JSON file, see
loud and useful validation failures for invalid input, complete a structured
review, export a ReviewResult, import compatible ReviewResults from local
artifacts, and produce an auditable EvaluationReport without a backend service.

## Milestone 4 - Toponymy / ACME4 Adapter Prototype

- Define the adapter boundary and loop refinement spec. See [MILESTONE_4_ADAPTER_BOUNDARY.md](./MILESTONE_4_ADAPTER_BOUNDARY.md).
- Complete the docs-first sanitized adapter prototype plan before adding any
  executable adapter workflow. See
  [MILESTONE_4_ADAPTER_PROTOTYPE_PLAN.md](./MILESTONE_4_ADAPTER_PROTOTYPE_PLAN.md).
- Build one script or notebook-level adapter for an approved real or realistic precomputed cluster output.
- Emit minimal, auditable `CasePackage` JSON.
- Preserve provenance and sanitization metadata.
- Keep raw restricted telemetry outside the public or portable app.

Definition of done: the adapter boundary is documented; one adapter-generated package validates and completes the review-to-report path; and the refinement feedback loop is defined without inventing Toponymy APIs or ACME4 access.

## Milestone 5 - Evidence-Constrained AI Assistance

- Offer predefined cross-examination questions only where they improve review quality.
- Require responses to cite case-package evidence IDs and admit missing evidence.
- Record model and prompt metadata for evaluation.
- Do not add generic chatbot behavior.
- Do not start before local CasePackage import, ReviewResult bundle exchange,
  and EvaluationReport aggregation from local/imported results are usable.

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
- Keep the Adapter Prototype and Refinement Integration as the active implementation milestone.
- Keep evidence-constrained AI assistance later until import/results/aggregation
  can produce an auditable EvaluationReport.
- Create only a small executable issue batch for the active milestone and its immediate blocker.
