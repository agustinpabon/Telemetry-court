# Product Vision

Telemetry Court is an evidence-based human-in-the-loop validation bench and
topological refiner for AI-generated telemetry cluster interpretations.

```text
AI names the cluster. Humans test the evidence.
```

The product asks:

```text
Given a telemetry cluster and an AI-generated label or explanation,
is that interpretation actually supported by the evidence?
```

## Product Thesis

Generated cluster names are easy to accept when they sound coherent. That
fluency can hide unsupported claims, overreach, mixed clusters, weak evidence
coverage, or instability across models and prompts. Telemetry Court makes those
interpretations reviewable, tests them against package evidence and cluster
topology, and turns human judgment into evaluation and refinement data for the
upstream pipeline.

```text
Precomputed cluster
-> versioned CasePackage
-> blind evidence review
-> AI label and claim reveal
-> structured human verdict
-> ReviewResult
-> multi-reviewer EvaluationReport
-> cluster_refinement.v0.1
-> external upstream pipeline improvement
```

The current landscape, case file, evidence board, label comparison, outlier review, and verdict interface are interaction mechanisms inside this validation workflow. They are not the product identity by themselves.

## Utility Gate

Telemetry Court is useful only if it helps produce or improve an auditable
`EvaluationReport` and actionable topological refinement output from real or
realistic `CasePackage` inputs. A feature passes the Utility Gate when it
improves at least one part of this loop:

```text
import CasePackage JSON
-> validate it strictly
-> complete structured review
-> persist/export ReviewResult
-> import or aggregate ReviewResults
-> produce EvaluationReport output
-> render results topology from package-provided coordinates
-> export cluster_refinement.v0.1 for upstream refinement
```

The local engineering loop is implemented. The next proof of value is a human
study using approved realistic/sanitized packages and independent reviewers,
followed by external application, rejection, deferral, or explicit no-action
handling of the refinement output. More synthetic polish, generic backend
infrastructure, and live AI integration do not substitute for that proof.

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
- rendering package-provided cluster topology on the results page when
  compatible coordinates are available;
- exporting evaluation data for labels, prompts, models, embeddings, evidence extraction, and cluster design.
- exporting refinement data for external pruning, split, merge, and rerun
  decisions.

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
12. Export a `cluster_refinement.v0.1` artifact for external upstream review
    and application.

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

## Current Local Research Implementation

The current Next.js interface uses five synthetic demo cases and also accepts
strictly validated local `CasePackage` JSON through manual import or a
configured Hot-Folder. It implements the blind review protocol, browser-local
reviewer metadata and `ReviewResult` persistence, strict ReviewResult bundle
exchange, separate quick dispositions, semantic import warnings, and
deterministic in-memory `EvaluationReport` aggregation.

The `/results` route summarizes validated local or imported ReviewResults,
keeps exact CasePackage references separate, renders package-provided topology
when compatible coordinates are available, and exports report JSON/CSV plus a
validated `cluster_refinement.v0.1` artifact. The local Python companion writes
approved package-shaped JSON atomically and reads refinement artifacts; it does
not run an upstream pipeline.

The Evidence Board includes optional sanitized field highlights and a
deterministic mocked Evidence Assistance panel. Assistance is limited to the
canonical fixed question set and exact package IDs, runs request guardrails,
response validation, and the claim critic, and remains secondary to human
ratings. It makes no provider or network call and does not persist assistance
metadata in ReviewResult or EvaluationReport.

The repository does not prove real-world validation value, run Toponymy,
DataMapPlot, UMAP/HDBSCAN, or ACME4, provide durable server-side persistence, or
support a durable multi-user report workflow.

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

The repository implements the local mechanics for accepting a defensible
precomputed package, preserving blind review, collecting structured verdicts,
aggregating compatible reviewers, and exporting evaluation and refinement
artifacts. Real usefulness still requires evidence outside the codebase:

- 3-5 approved realistic/sanitized CasePackages;
- 2-3 independent reviewers using the frozen packages and rubric;
- validated ReviewResult bundles and auditable per-package reports;
- explicit review of disagreement and uncertainty;
- an external upstream decision that applies, rejects, defers, or records a
  no-action result for the exported recommendations and compares the next
  iteration when an action changes the upstream working set.

Until that proof exists, the product may claim an implemented local research
workflow, not successful scientific validation or real-world pipeline
improvement.

## Non-Goals

- SIEM, EDR, SOC, alert triage, incident response, or raw log search.
- Generic cyber investigation or telemetry exploration.
- Chat-first or open-ended agent workflows.
- Gamification, leaderboards, or theatrical courtroom mechanics.
- Generic CRUD, auth-first development, or speculative enterprise features.
- Copying raw restricted telemetry into the public or portable app.
- Claiming live Toponymy, DataMapPlot, UMAP/HDBSCAN, or ACME4 execution when
  only the sanitized file-contract adapter boundary exists.

## Data Posture

Public and portable deployments use synthetic, sanitized, or approved evidence packages. Restricted data should be transformed within its authorized environment, and case packages should carry provenance and sanitization metadata plus safe drill-down references where permitted.

## Source Documents

- [Product positioning](./PRODUCT_POSITIONING.md)
- [Project context](./PROJECT_CONTEXT.md)
- [Case package contract](./CASE_PACKAGE_CONTRACT.md)
- [Evaluation infrastructure](./EVALUATION_INFRASTRUCTURE.md)
- [Roadmap](./ROADMAP.md)
