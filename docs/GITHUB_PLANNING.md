# GitHub Planning

## Planning Source

`docs/ROADMAP.md` is the canonical roadmap. Planning must describe Telemetry Court as an evidence-based human-in-the-loop validation bench, not a frontend MVP, investigation platform, or generic backend application.

## Milestones

| Milestone | Planning outcome |
|---|---|
| Milestone 0 - Current Static Validation Slice | Preserve the shipped synthetic review protocol as the baseline. |
| Milestone 1 - Product Realignment And Documentation | Align repository identity, contracts, architecture, and contributor guidance. |
| Milestone 2 - Case Package Contract And Validation Infrastructure | Define and validate the three versioned contracts and package-shaped fixtures. |
| Milestone 3 - Evaluation Infrastructure | Persist, aggregate, and export multi-reviewer evaluation data. |
| Milestone 4 - Toponymy / ACME4 Adapter Prototype | Convert one approved real or realistic cluster output into a case package. |
| Milestone 5 - Evidence-Constrained AI Assistance | Add only evidence-citing, predefined assistance if it improves review quality. |
| Milestone 6 - Research Validation Study | Prove useful upstream signals with multiple reviewers and real or realistic cases. |

Historical Evidence Arena and static MVP milestones may remain closed for recordkeeping, but new work must use the validation-bench roadmap.

## Immediate Planning Priority

Milestone 2 is the next implementation milestone. Its first issue batch should stay small and dependency ordered:

1. Resolve the `CasePackage v0.1`, `ReviewResult v0.1`, and `EvaluationReport v0.1` contract decisions (`human-in-the-loop`).
2. Add runtime validation and invalid-package diagnostics (`AFK` after the contract is approved).
3. Adapt one current synthetic fixture through the versioned package boundary (`AFK`).
4. Version the current review export against its source package and protocol (`AFK`).

Do not create issues yet for auth, production databases, admin UX, broad analytics dashboards, or enterprise features.

## Issue Gate

Every issue must answer:

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
- Preserve existing team, type, priority, and status labels where they remain useful.
- Replace `scope/mvp` with validation-oriented scope labels when label maintenance is next performed.

## Issue Sizing

- Prefer thin vertical slices through contract, validation, fixture, UI compatibility, export, and tests where applicable.
- Do not create horizontal "build the backend" or "design the database" issues.
- One issue should produce one independently verifiable validation outcome.
- Keep future adapter and research-study work in the roadmap until Milestone 2 proves the contract.

## PR Requirements

Use `.github/pull_request_template.md`. PRs must state product identity impact, contract impact, evidence/provenance impact, current-versus-target capability, checks, and risks. UI changes require screenshots; contract and metric changes require examples and tests.
