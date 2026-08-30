# Telemetry Court Roadmap

## Direction

Telemetry Court is an evidence-based human-in-the-loop validation bench and
topological refiner for AI-generated telemetry cluster interpretations. The
roadmap is organized around proving validation value, not adding generic
product infrastructure.

## Utility Gate

A feature is useful only if it helps produce or improve an auditable
`EvaluationReport` and useful external refinement output from real or realistic
`CasePackage` inputs.

The next proof of value is:

```text
import CasePackage JSON
-> validate it strictly
-> review it
-> persist/export ReviewResult
-> import/aggregate ReviewResults
-> produce EvaluationReport
-> export cluster_refinement.v0.1
-> evaluate an external upstream refinement/rerun
```

The local artifact loop is implemented. Work that does not strengthen its
correctness, validation, data handling, study operability, or evidence-review
quality should wait. The next proof is human and external, not another layer of
synthetic feature breadth.

## Milestone Overview

| Milestone | Status | Outcome |
|---|---|---|
| Milestone 0 - Historical Static Validation Slice | Complete/historical baseline | Synthetic interface established the review protocol; it no longer describes the full current repository. |
| Milestone 1 - Product Realignment And Documentation | Complete | Repository language, planning, architecture, and agent guidance align around the validation-bench direction. |
| Milestone 2 - Case Package Contract And Validation Infrastructure | Complete/current foundation | Versioned `CasePackage`, `ReviewResult`, and `EvaluationReport` contracts, package validation, package-shaped fixtures, and local export/aggregation foundations. |
| Milestone 3 - Local Utility Gate | Complete | Local CasePackage import, useful invalid-package failure UI, ReviewResult persistence/export/import, results from local/imported ReviewResults, and an end-to-end imported-package smoke test. |
| Milestone 4 - Toponymy / ACME4 Adapter Prototype & Hot-Loop Connection | Repository engineering complete; external proof pending | Sanitized mapper/CLI, Hot-Folder scan/polling, Python file helper, evidence highlights, split/merge capture, and refinement handoff are implemented. No upstream system executes inside Telemetry Court. See [MILESTONE_4_ADAPTER_BOUNDARY.md](./MILESTONE_4_ADAPTER_BOUNDARY.md) and [MILESTONE_4_ADAPTER_PROTOTYPE_PLAN.md](./MILESTONE_4_ADAPTER_PROTOTYPE_PLAN.md). |
| Milestone 5 - Evidence-Constrained AI Assistance | Active; first mocked UI slice implemented | The Evidence Board exposes fixed evidence-citing questions through a deterministic local resolver and guardrail/validation chain. Live providers and artifact metadata remain separately scoped. |
| Milestone 6 - Research Validation Study | Active external/human proof | Approved realistic packages and independent reviewers must demonstrate useful evaluation and refinement signals. No pilot result is claimed yet. |

## Milestone 0 - Historical Static Validation Slice

- Existing Next.js review interface and five synthetic cases.
- Telemetry landscape, case file, blind review, AI reveal, evidence classification, label comparison, outlier selection, verdict, and local JSON export.
- Useful for demonstrating and testing the review protocol.
- At that milestone there was no versioned package import, browser-local
  ReviewResult exchange, or EvaluationReport/refinement workflow. Those local
  capabilities were added in Milestones 2-4; durable multi-user storage remains
  out of scope.

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

## Milestone 4 - Toponymy / ACME4 Adapter Prototype & Hot-Loop Connection

Repository-owned engineering is implemented:

- adapter boundary and `cluster_refinement.v0.1` consumer specification;
- pure sanitized `CasePackageV01` mapper, CLI, explicit input/output flags,
  and deterministic preflight validation;
- local server-side Hot-Folder scan/polling route that validates top-level JSON
  candidates without exposing the configured absolute path to the browser;
- standard-library `telemetry_court_client.py` helper for safe atomic package
  writes and refinement discovery/readback;
- optional sanitized field highlights in the Evidence Board;
- structured split and merge controls carried into ReviewResult and
  refinement artifacts;
- documentation for upstream notebook/script and refinement-consumer handoff.

The Hot-Folder is intentionally a local polling path, not a remote daemon or raw
telemetry ingestion service. The browser exports refinement JSON locally; an
approved upstream workflow still decides how to place/read it and whether to
apply pruning, split, or merge recommendations. Direct Toponymy, DataMapPlot,
UMAP/HDBSCAN, and ACME4 execution remains upstream.

Engineering definition of done: the file-contract boundaries are implemented
and tested with synthetic data. Research definition of done remains part of
Milestone 6: exercise them with an approved realistic package and external
upstream consumer.

## Milestone 5 - Evidence-Constrained AI Assistance

Implemented first slice:

- a collapsed, visually secondary panel on the Evidence Board only;
- the canonical fixed eight-question set, with no arbitrary prompt input;
- exact validated claim/evidence/label references from the current CasePackage;
- request guardrail -> deterministic local resolver -> response validation ->
  claim critic -> UI;
- distinct answered, insufficient-evidence, unavailable, guardrail-refused, and
  invalid-response-withheld states;
- visible question, finding, evidence, claim, label, warning, and critic
  references without mutating ratings, verdicts, or workflow state.

Not implemented and not implied by this milestone slice: live providers,
prompt execution, streaming, transcripts, configurable question sets,
assistance metadata in ReviewResult, assistance-use metrics in EvaluationReport,
external intelligence, or raw telemetry drill-down. Each requires separate
product, safety, and schema scope.

## Milestone 6 - Research Validation Study

- Obtain human approval for 3-5 frozen realistic/sanitized CasePackages and a
  2-3 reviewer roster.
- Run reviewers independently across the same package bytes.
- Evaluate reviewer agreement, label support, evidence sufficiency, and common failure modes.
- Compare at least one deliberately controlled upstream variable such as label,
  prompt, model, embedding, or evidence extraction method; keep cross-package
  analysis manual and explicit because v0.1 reports do not rank across runs.
- Validate and aggregate actual ReviewResults, export per-package reports and
  refinement artifacts, and evaluate an external upstream iteration.
- Publish or share findings only with explicit data-safety and claim approval,
  with limitations stated.

Status: not completed. Issue #74 recorded one synthetic expert walkthrough and
ReviewResult as product feedback, not the required independent validation
study. Synthetic fixtures, automated tests, mocked assistance, and synthetic
EvaluationReport examples are rehearsals, not completion evidence.

## Product-Level Definition Of Done

Telemetry Court becomes a serious tool only when it can ingest an approved
realistic precomputed cluster, accept a defensible evidence package, support
multiple blind human reviews, store structured verdicts, aggregate judgments,
export auditable evaluation/refinement artifacts, and demonstrate through an
external upstream iteration that those signals can improve labels, prompts,
embeddings, evidence extraction, or cluster design.

## Planning Guardrails

- Do not create a generic backend milestone.
- Do not start with auth, production database design, admin UX, user management, or generic CRUD.
- Do not add SIEM, SOC, alert-triage, raw-search, or live-ingestion work.
- Do not schedule UI polish as a substitute for package and evaluation proof.
- Treat the adapter/Hot-Folder/refinement engineering as implemented; do not
  reopen completed slices because older status prose says they are missing.
- Keep any next AI assistance slice separate from the deterministic mocked UI
  and require explicit provider, secret, failure, and artifact-schema
  decisions before implementation.
- Prioritize Milestone 6 study readiness and honest external proof over new
  speculative capability.
- Create only small, independently reviewable issue slices for confirmed gaps.
