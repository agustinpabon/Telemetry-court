# Product Vision

Telemetry Court is an evidence-based human-in-the-loop validation bench for AI-generated telemetry cluster interpretations.

```text
AI names the cluster. Humans test the evidence.
```

The product asks:

```text
Given a telemetry cluster and an AI-generated label or explanation,
is that interpretation actually supported by the evidence?
```

## Product Thesis

Generated cluster names are easy to accept when they sound coherent. That fluency can hide unsupported claims, overreach, mixed clusters, weak evidence coverage, or instability across models and prompts. Telemetry Court makes those interpretations reviewable and turns human judgment into evaluation data for the upstream pipeline.

```text
Precomputed cluster
-> versioned CasePackage
-> blind evidence review
-> AI label and claim reveal
-> structured human verdict
-> ReviewResult
-> multi-reviewer EvaluationReport
-> upstream pipeline improvement
```

The current landscape, case file, evidence board, label comparison, outlier review, and verdict interface are interaction mechanisms inside this validation workflow. They are not the product identity by themselves.

## Utility Gate

Telemetry Court is useful only if it helps produce or improve an auditable
`EvaluationReport` from real or realistic `CasePackage` inputs. A feature
passes the Utility Gate when it improves at least one part of this loop:

```text
import CasePackage JSON
-> validate it strictly
-> complete structured review
-> persist/export ReviewResult
-> import or aggregate ReviewResults
-> produce EvaluationReport output
```

The next proof of value is this external-package validation loop, not more
synthetic polish, generic backend infrastructure, or evidence-constrained AI
assistance. AI assistance remains later priority until reviewers can import a
package, complete reviews, exchange result bundles, and aggregate them into a
report.

## Product Responsibilities

Telemetry Court is responsible for:

- accepting validated case packages from upstream systems;
- preserving package provenance and sanitization metadata;
- exposing every generated claim and its linked evidence;
- showing missing or broken evidence explicitly;
- preserving blind review before AI-label reveal;
- supporting structured evidence classification and verdicts;
- collecting independent reviews from multiple people;
- aggregating judgments and disagreement;
- exporting evaluation data for labels, prompts, models, embeddings, evidence extraction, and cluster design.

Telemetry Court is not responsible for the full telemetry processing stack, live detection, operational alert response, or unrestricted raw data ingestion.

## Core Review Protocol

1. Select or import a reviewable case package.
2. Inspect cluster context and approved evidence without seeing the generated label.
3. Choose a blind interpretation, including insufficient-evidence options.
4. Reveal the AI label, explanation, and claims.
5. Classify evidence against specific claims.
6. Compare candidate labels.
7. Identify outlier or impostor sessions that weaken cluster coherence.
8. Record failure modes and uncertainty.
9. Issue a structured verdict and recommended action.
10. Export or save a versioned `ReviewResult`.
11. Aggregate compatible results into an `EvaluationReport`.

The happy path is structured-choice first. Optional expert notes may exist, but typed text must not be required to complete the review.

Fast or batch review modes are allowed when they preserve this protocol and
produce exportable `ReviewResult` artifacts. They must be framed as evidence
validation or batch validation, not SOC triage, incident response, live alert
handling, remediation, or operational action generation.

## Evidence And Verdict Language

Evidence classifications should distinguish supports, weak support, irrelevant or noise, contradicts, insufficient, and needs more context.

Verdicts should distinguish supported, partially supported, unsupported or overclaimed, uncertain, cluster impure, needs split, needs merge, and needs better evidence.

Uncertainty is a valid result. Telemetry Court must not force certainty when the evidence cannot support it.

The evaluation semantics for canonical verdict values and structured
failure-mode reason codes are defined in
[`VERDICT_AND_FAILURE_MODE_SEMANTICS.md`](./VERDICT_AND_FAILURE_MODE_SEMANTICS.md).

## Current Static Validation Slice

The current Next.js interface uses five synthetic cases and local state. It demonstrates the review protocol, structured JSON export, browser-local `ReviewResult` persistence keyed by CasePackage ID, deterministic in-memory `EvaluationReport` aggregation, and a fixture-backed read-only results view with JSON/CSV export. It does not yet prove real-world validation value, run Toponymy, ingest ACME4, provide durable server-side persistence, or support a multi-reviewer report workflow.

The current EvaluationReport shape includes descriptive reviewer-signal rollups
for selected label IDs and compact package/pipeline metadata already carried by
ReviewResults. Missing optional metadata is explicit. Exact package-reference
compatibility means non-label rollups are single-value context rather than
cross-run model, prompt, embedding, or evidence-package rankings.

It also reports descriptive reviewer agreement for verdicts, selected labels,
per-evidence ratings, and a major failure mode where one mode is identifiable.
Per-evidence comparisons retain coverage counts and disputed stable IDs.
Single-review and partial comparisons remain unavailable or incomplete; the
report does not infer consensus, correctness, or reviewer error.

Synthetic cases remain useful for UI and protocol testing, but they must be described as fixtures, not evidence that the product has completed its validation mission.

## Definition Of Done For Real Usefulness

Telemetry Court becomes a serious tool only when it can:

- ingest a real or realistic precomputed cluster;
- generate or accept a defensible evidence package;
- let multiple humans review it;
- preserve blind review before AI-label reveal;
- store structured verdicts;
- aggregate reviewer judgments;
- export metrics that improve labels, prompts, embeddings, or pipeline design.

If it cannot do those things, it remains a polished interface rather than validation infrastructure.

## Non-Goals

- SIEM, EDR, SOC, alert triage, incident response, or raw log search.
- Generic cyber investigation or telemetry exploration.
- Chat-first or open-ended agent workflows.
- Gamification, leaderboards, or theatrical courtroom mechanics.
- Generic CRUD, auth-first development, or speculative enterprise features.
- Copying raw restricted telemetry into the public or portable app.
- Claiming current Toponymy or ACME4 integration before an adapter exists.

## Data Posture

Public and portable deployments use synthetic, sanitized, or approved evidence packages. Restricted data should be transformed within its authorized environment, and case packages should carry provenance and sanitization metadata plus safe drill-down references where permitted.

## Source Documents

- [Product positioning](./PRODUCT_POSITIONING.md)
- [Project context](./PROJECT_CONTEXT.md)
- [Case package contract](./CASE_PACKAGE_CONTRACT.md)
- [Evaluation infrastructure](./EVALUATION_INFRASTRUCTURE.md)
- [Roadmap](./ROADMAP.md)
