# Telemetry Court Roadmap

## Current Status

Telemetry Court is a frontend-first Evidence Arena prototype using Next.js, TypeScript, Tailwind, and local synthetic fixture data.

Core product line:

```text
AI names the pattern. Humans test the evidence.
```

The old passive approve/reject label-validator MVP is superseded. Claim/evidence inspection remains central, but it now lives inside a broader interactive investigation workflow.

## Core Product Flow

```text
Telemetry clusters
-> AI-generated interpretation
-> evidence-first investigation
-> structured human verdict
-> evaluation data for better prompts, labels, embeddings, and cluster quality
```

## Active Vertical Slice

The current app should let a user:

1. Open a telemetry landscape.
2. Select a behavioural region / case.
3. Inspect case context and evidence.
4. Make a blind interpretation from structured options before seeing the AI label.
5. Reveal the AI label.
6. Classify evidence cards.
7. Compare candidate labels in a label duel.
8. Pick an impostor / outlier session.
9. Select structured failure modes and a final verdict.
10. Export or view structured review JSON.

The happy path must not require typed text. Free text can exist later only as optional expert annotation.

## Work Tracks

### Product / UX

Make the arena investigative, calm, credible, and structured-choice first.

### Evidence Model

Keep claims, evidence items, evidence relations, support scores, candidate labels, representative sessions, evidence classifications, failure modes, and verdicts inspectable and exportable.

### Synthetic Data

Maintain safe local cases that demonstrate supported labels, overclaims, broad labels, impure clusters, and correct uncertainty.

### Scientific Review Data

Make review JSON useful as evaluation data for labels, prompts, evidence packets, embeddings, and cluster quality.

### Future Import / Platform

After the static arena is credible, define import/export boundaries for approved upstream artifacts from systems such as Toponymy-style naming workflows and DataMapPlot-style landscape outputs.

## Milestone Overview

| Milestone | Status | Goal |
|---|---|---|
| Milestone 0 — Evidence Arena Pivot Stabilization | Active | Stabilize the pivot, remove outdated framing, and ensure docs/tests/agents agree on the new direction. |
| Milestone 1 — Polished Static Evidence Arena MVP | Active next | Make the synthetic vertical slice demo-ready and credible. |
| Milestone 2 — Scientific Review Data Model | Planned | Make human review output useful as evaluation data, not just UI state. |
| Milestone 3 — Telemetry Map + Case Exploration | Planned | Make the landscape, clusters, uncertainty, neighboring regions, and case navigation more informative. |
| Milestone 4 — Pipeline Integration Readiness | Planned | Prepare import/export boundaries for Toponymy, DataMapPlot, generated cluster labels, and real telemetry-derived artifacts without requiring restricted data. |
| Milestone 5 — Advanced Evidence Arena | Planned | Model debate, cross-examination, counterfactual map lab, live jury/demo mode, and research-grade interaction experiments. |

## Milestone 0 — Evidence Arena Pivot Stabilization

### Goal

Stabilize the pivot, remove outdated framing, ensure docs/tests/agents agree on the new direction.

### Immediate Issues

- `docs: remove superseded label-validator framing`
- `test: cover evidence arena happy path`
- `chore: commit and document evidence arena pivot`

### Definition Of Done

- Product docs and agent docs consistently describe Telemetry Court as an Evidence Arena.
- Historical approve/reject-only language is preserved only as superseded context.
- Tests protect the current structured-choice happy path.
- Changelog and handoff material clearly explain the pivot and validation status.

## Milestone 1 — Polished Static Evidence Arena MVP

### Goal

Make the synthetic vertical slice demo-ready and credible.

### Immediate Issues

- `ux: polish telemetry landscape as primary entry point`
- `ux: improve case file investigation hierarchy`
- `ux: refine blind investigation and AI reveal flow`
- `ux: make evidence classification feel active and clear`
- `ux: refine label duel and impostor interactions`
- `feat: add review progress and reset/navigation controls`
- `a11y: improve keyboard and screen reader support for structured choices`

### Definition Of Done

- The homepage starts with a telemetry landscape, not a form.
- Five synthetic cases are available and credible as demo data.
- Case files clearly distinguish context, claims, evidence, sessions, and uncertainty.
- The reviewer can complete the full workflow without typing.
- Evidence ratings, label duel, impostor selection, failure modes, verdict, and export feel connected.
- Structured choice controls are accessible by keyboard and screen reader.
- `npm test`, `npm run lint`, and `npm run build` pass.

## Milestone 2 — Scientific Review Data Model

### Goal

Make the human review output useful as evaluation data, not just UI state.

### Immediate Issues

- `schema: formalize structured review export`
- `docs: define evaluation meaning of each verdict and failure mode`

### Candidate Later Issue

- `feat: add local review persistence`

### Definition Of Done

- Review export schema is documented, versioned, and tested.
- Export includes reviewer choices, evidence ratings, label duel result, impostor selection, failure modes, verdict, timestamps, and version metadata.
- Verdicts and failure modes have clear evaluation meaning.
- The docs explain how outputs can support prompt, label, embedding, evidence-packet, and cluster-quality evaluation.

## Milestone 3 — Telemetry Map + Case Exploration

### Goal

Make the landscape, clusters, uncertainty, neighboring regions, and case navigation more informative.

### Candidate Work

- Improve cluster neighborhood explanations.
- Show uncertainty and model agreement without dashboard clutter.
- Add safer case navigation and review-state scanning.
- Explore DataMapPlot-style import assumptions only after a safe contract exists.

## Milestone 4 — Pipeline Integration Readiness

### Goal

Prepare import/export boundaries for Toponymy, DataMapPlot, generated cluster labels, and real telemetry-derived artifacts without requiring real restricted data.

### Candidate Work

- Define the approved evidence-packet input contract.
- Define generated-label and generated-claim contracts.
- Document Toponymy handoff assumptions using only the official repository as source of truth.
- Add fixture validation for imported local JSON.
- Keep real restricted telemetry out of the repo.

## Milestone 5 — Advanced Evidence Arena

### Goal

Model debate, cross-examination, counterfactual map lab, live jury/demo mode, and research-grade interaction experiments.

### Candidate Work

- Model-vs-model label debate.
- Cross-examination prompts tied to evidence cards.
- Counterfactual map lab for cluster split/merge experiments.
- Live jury/demo mode for workshops.
- Research-grade interaction experiments around anchoring, uncertainty, and evidence quality.

## Issue Creation Rule

Create only a small immediate batch for the active milestone and the nearest follow-up. Do not turn every future idea into a GitHub issue. Candidate work remains planning inventory until it is close enough for execution.

## Product Guardrails

- Telemetry Court is an evidence-first investigation environment, not a chatbot wrapper.
- It is not a SIEM, SOC dashboard, threat-intelligence dashboard, or cyberpunk visualization.
- It is not just an approve/reject label validator.
- Every generated claim must be inspectable.
- Every evidence card should be classifiable as supports, weak support, irrelevant/noise, contradicts, or needs context.
- Distinguish supported, weakly supported, contradicted, unsupported, overclaimed, impure, and uncertain states.
- Do not hide uncertainty.
- Do not invent evidence.
- Do not require typing for the core workflow.
- Do not introduce real telemetry, secrets, customer data, or incident claims.
- Visual work must follow `docs/DESIGN_SYSTEM.md` and support evidence inspection.

## Checks Required Before Closing Issues

- `npm test`
- `npm run lint`
- `npm run build`
- Documentation updated when product, model, architecture, workflow, design, test, or behavior context changes.
- PR description follows `.github/pull_request_template.md`.
- UI changes include screenshots or recordings.
- Evidence-model changes explain claim, evidence, relation, score, verdict, review-data, and audit impact.
