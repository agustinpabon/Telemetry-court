# GitHub Planning

## Planning Source

`docs/ROADMAP.md` is the canonical roadmap. Planning must describe Telemetry Court as an evidence-based human-in-the-loop validation bench, not a frontend MVP, investigation platform, or generic backend application.

## Utility Gate

Every planning artifact should preserve this gate:

```text
A feature is useful only if it helps produce or improve an auditable
EvaluationReport from real or realistic CasePackages.
```

Near-term issues should advance local `CasePackage` import, strict validation,
useful invalid-package failure UI, `ReviewResult` persistence/export/import,
aggregation from local or imported ReviewResults, or an end-to-end
import-to-report smoke test. Evidence-constrained AI assistance stays later
priority until that loop is usable.

## Milestones

| Milestone | Planning outcome |
|---|---|
| Milestone 0 - Current Static Validation Slice | Preserve the shipped synthetic review protocol as the baseline. |
| Milestone 1 - Product Realignment And Documentation | Align repository identity, contracts, architecture, and contributor guidance. |
| Milestone 2 - Case Package Contract And Validation Infrastructure | Define and validate the three versioned contracts and package-shaped fixtures. |
| Milestone 3 - Local Utility Gate | Import local CasePackage JSON, persist/export/import ReviewResults, aggregate local or imported results, and generate an EvaluationReport without backend infrastructure. |
| Milestone 4 - Toponymy / ACME4 Adapter Prototype | Convert one approved real or realistic cluster output into a case package after the local utility loop works. |
| Milestone 5 - Evidence-Constrained AI Assistance | Add only evidence-citing, predefined assistance after import/results/aggregation are usable. |
| Milestone 6 - Research Validation Study | Prove useful upstream signals with multiple reviewers and real or realistic cases. |

Historical Evidence Arena and static MVP milestones may remain closed for recordkeeping, but new work must use the validation-bench roadmap.

## Immediate Planning Priority

Milestone 4 - Toponymy / ACME4 Adapter Prototype & Hot-Loop Connection is the active implementation milestone. Its issue batch is small and dependency ordered:

1. Define the adapter boundary and loop refinement spec (completed).
2. Complete the docs-first sanitized adapter prototype plan (completed).
3. Implement the pure sanitized CasePackage adapter mapper helper (completed).
4. Create the CLI wrapper for the sanitized CasePackage adapter mapper (completed).
5. Build a local file system watcher daemon API in Next.js (Hot-Folder watcher) to dynamically detect and load CasePackages from disk.
6. Create the companion python client module (`telemetry_court_client.py`) to easily submit cases from Jupyter and load the refinement outputs.
7. Implement visual log highlighting on the Evidence Board to show which fields support or contradict claims.
8. Add visual split/merge buttons next to UMAP neighborhood boundaries in the UI.
9. Run a small approved pilot with 3-5 real or realistic packages to verify the closed-loop developer workflow.

Do not create issues yet for auth, production databases, admin UX, broad
analytics dashboards, enterprise features, raw telemetry ingestion, SIEM
connectors, operational action generation, or chatbot-first UI.

## Issue Gate

Every issue must answer:

- Does this change pass the Utility Gate by improving auditable
  `EvaluationReport` production from real or realistic `CasePackage` inputs?
- Does this change support the validation-bench direction?
- Does it preserve the distinction between `CasePackage`, `ReviewResult`, and `EvaluationReport`?
- Does it avoid SIEM/SOC/dashboard, alert-triage, raw-search, chat-first, and gamification drift?
- Does it improve evidence grounding, review structure, provenance, aggregation, or evaluation output?
- Does it require backend work, and if so, is it blocked by or derived from the case package contract?

## Issue Template

```md
## Validation outcome

## Why this matters

## Contract impact
- CasePackage:
- ReviewResult:
- EvaluationReport:

## Scope

### In scope
-

### Out of scope
- SIEM/SOC/dashboard behavior
- Raw telemetry ingestion or search
- Generic CRUD, auth, or speculative database work

## Evidence and provenance impact

## Acceptance criteria
- [ ] The change advances evidence-based validation of AI-generated cluster interpretations.
- [ ] The change helps produce or improve an auditable EvaluationReport from real or realistic CasePackages, or it fixes a correctness/validation blocker on that path.
- [ ] Contract separation is preserved or an explicit decision updates it.
- [ ] Broken evidence, IDs, versions, or provenance fail visibly where applicable.
- [ ] Current and target capabilities are not conflated.

## Required checks
- [ ] `npm test`
- [ ] `npm run lint`
- [ ] `npm run build`

## Work type
- [ ] `AFK`
- [ ] `human-in-the-loop`

## Blocked by
```

## Label Guidance

- `AFK`: sufficiently specified for an agent to complete without product decisions.
- `human-in-the-loop`: requires approval of a contract, research protocol, data-handling rule, or product judgment.
- `priority/p0`: active Utility Gate blockers.
- `priority/p3`: later work, including evidence-constrained AI assistance until
  import/results/aggregation are usable.
- Preserve existing team, type, priority, and status labels where they remain useful.
- Replace `scope/mvp` with validation-oriented scope labels when label maintenance is next performed.

## Issue Sizing

- Prefer thin vertical slices through contract, validation, fixture, UI compatibility, export, and tests where applicable.
- Do not create horizontal "build the backend" or "design the database" issues.
- One issue should produce one independently verifiable validation outcome.
- Keep future adapter and research-study work behind the Local Utility Gate
  until imported packages and imported/local ReviewResults can produce an
  auditable EvaluationReport.

## PR Requirements

Use `.github/pull_request_template.md`. PRs must state product identity impact, contract impact, evidence/provenance impact, current-versus-target capability, checks, and risks. UI changes require screenshots; contract and metric changes require examples and tests.
