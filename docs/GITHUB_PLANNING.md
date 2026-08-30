# GitHub Planning

## Planning Source

`docs/ROADMAP.md` is the canonical roadmap. Planning must describe Telemetry
Court as an evidence-based human-in-the-loop validation bench and topological
refiner, not a frontend MVP, investigation platform, or generic backend
application.

## Utility Gate

Every planning artifact should preserve this gate:

```text
A feature is useful only if it helps produce or improve an auditable
EvaluationReport and external refinement outcome from real or realistic
CasePackages.
```

Those local mechanics are implemented. Near-term issues should fix confirmed
correctness, validation, data-safety, accessibility, CI, or study-operability
gaps, or prepare the approved human/external proof. Do not reopen completed
slices because historical planning prose describes them as future work.

## Milestones

| Milestone | Planning outcome |
|---|---|
| Milestone 0 - Historical Static Validation Slice | Preserve the shipped synthetic review protocol as a historical baseline. |
| Milestone 1 - Product Realignment And Documentation | Align repository identity, contracts, architecture, and contributor guidance. |
| Milestone 2 - Case Package Contract And Validation Infrastructure | Define and validate the three versioned contracts and package-shaped fixtures. |
| Milestone 3 - Local Utility Gate | Import local CasePackage JSON, persist/export/import ReviewResults, aggregate local or imported results, and generate an EvaluationReport without backend infrastructure. |
| Milestone 4 - Toponymy / ACME4 Adapter Prototype | Repository engineering is implemented; direct upstream execution and realistic consumer proof remain external. |
| Milestone 5 - Evidence-Constrained AI Assistance | The first fixed-question deterministic mocked panel is implemented; live providers and artifact metadata remain separate scope. |
| Milestone 6 - Research Validation Study | Active human/external proof: approved realistic packages, independent reviewers, and an evaluated refinement/rerun. |

Historical Evidence Arena and static MVP milestones may remain closed for recordkeeping, but new work must use the validation-bench roadmap.

## Immediate Planning Priority

Milestone 3 is complete. Milestone 4 repository engineering is implemented:
adapter boundary, sanitized mapper/CLI/preflight, local Hot-Folder scan/polling,
Python file helper, sanitized evidence highlights, split/merge capture, and
refinement consumer handoff. The first Milestone 5 deterministic mocked
Evidence Assistance panel is also implemented.

The immediate priority is Milestone 6 study readiness and execution under human
approval. Create an engineering issue only for a confirmed blocker discovered
by preflight, reviewer exercise, artifact validation, or external refinement
consumption. Do not create synthetic reviewer outputs or pilot claims to close
the milestone. Any live provider-backed assistance must remain a separate issue
with explicit secrets, failure, blind-review, provider-isolation, and artifact
schema boundaries.

Do not create issues yet for auth, production databases, admin UX, broad
analytics dashboards, enterprise features, raw telemetry ingestion, SIEM
connectors, operational action generation, or chatbot-first UI.

## Issue Gate

Every issue must answer:

- Does this change pass the Utility Gate by improving auditable
  `EvaluationReport`/refinement production from real or realistic
  `CasePackage` inputs?
- Does this change support the validation-bench direction?
- Does it preserve the distinction between `CasePackage`, `ReviewResult`,
  `EvaluationReport`, quick dispositions, and cluster refinement?
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
- QuickDisposition / cluster_refinement / mocked assistance, if applicable:

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
- [ ] Any refinement output remains traceable, advisory, and externally
      applied rather than automatic.
- [ ] Contract separation is preserved or an explicit decision updates it.
- [ ] Broken evidence, IDs, versions, or provenance fail visibly where applicable.
- [ ] Current and target capabilities are not conflated.

## Required checks
- [ ] `npm run check`
- [ ] Relevant browser smoke for UI/workflow changes

## Work type
- [ ] `AFK`
- [ ] `human-in-the-loop`

## Blocked by
```

## Label Guidance

- `AFK`: sufficiently specified for an agent to complete without product decisions.
- `human-in-the-loop`: requires approval of a contract, research protocol, data-handling rule, or product judgment.
- `priority/p0`: active Utility Gate blockers.
- `priority/p3`: later optional work that does not block the human validation
  proof or a confirmed release-candidate defect.
- Preserve existing team, type, priority, and status labels where they remain useful.
- Replace `scope/mvp` with validation-oriented scope labels when label maintenance is next performed.

## Issue Sizing

- Prefer thin vertical slices through contract, validation, fixture, UI compatibility, export, and tests where applicable.
- Do not create horizontal "build the backend" or "design the database" issues.
- One issue should produce one independently verifiable validation outcome.
- Keep direct upstream integration and any live assistance provider behind a
  separately approved contract/safety issue. Keep research execution human in
  the loop and never replace it with fixture-generated results.

## PR Requirements

Use `.github/pull_request_template.md`. PRs must state product identity impact, contract impact, evidence/provenance impact, current-versus-target capability, checks, and risks. UI changes require screenshots; contract and metric changes require examples and tests.
