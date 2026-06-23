# Product Positioning

## One-Sentence Definition

Telemetry Court is an evidence-based human-in-the-loop validation and topological refinement bench for AI-generated telemetry cluster interpretations.

## Product Thesis

AI-generated cluster labels can sound plausible while being unsupported, overbroad, overly specific, unstable, or based on impure clusters. The useful product is not another place to display those labels. It is a disciplined environment for turning them into testable claims, judging them against representative evidence and topology, and producing reusable human evaluation and cluster-refinement data.

## What Telemetry Court Is

- A review bench for precomputed telemetry clusters and generated interpretations.
- A structured workflow for blind review, claim inspection, evidence classification, label comparison, outlier review, and verdict capture.
- A validation layer between clustering or labeling pipelines and the teams improving those pipelines.
- A source of reviewer agreement, evidence sufficiency, overclaim, impurity, split, merge, and uncertainty signals.
- A downstream companion to Toponymy-style cluster naming workflows.
- A topological cluster refiner that helps translate visual UMAP/HDBSCAN/DataMapPlot structure into actionable split, merge, and pruning recommendations.

## What Telemetry Court Is Not

- A SIEM, EDR, SOC dashboard, alert-triage system, or incident-response console.
- A raw log search, telemetry ingestion, or detection platform.
- A general cyber investigation tool.
- A generic chatbot or open-ended AI assistant.
- A game, leaderboard, or theatrical courtroom experience.
- An auth-first SaaS application or generic CRUD backend.
- A claim that the current synthetic interface already provides research validation.

## Primary Users

- Researchers evaluating AI-assisted telemetry interpretation.
- Toponymy users or contributors validating generated cluster names.
- AI/ML and cyber data science teams comparing prompts, models, embeddings, evidence extraction, or clustering choices.
- Data scientists tuning UMAP, HDBSCAN, DataMapPlot-adjacent projections, or
  notebook-based cluster naming loops.
- Analysts and senior reviewers judging whether generated interpretations are defensible.
- Educators and research institutions teaching evidence-grounded interpretation.

## Non-Users And Out-Of-Scope Users

Telemetry Court is not primarily for frontline SOC analysts responding to live alerts, teams seeking endpoint response actions, users who need raw log search first, or organizations looking for case management, ticketing, or a SIEM replacement.

## Real-World Problem

Clustering pipelines can produce coherent-looking maps and confident labels without proving that the labels reflect the underlying sessions or events. Teams often lack a repeatable way to review the evidence over the spatial topology, preserve pre-label human judgment, compare alternative interpretations, aggregate disagreements, and feed precise pruning, split, or merge guidance back into the pipeline instead of tuning parameters by trial and error.

## Strongest Use Case

A research or AI/ML team imports a real or realistic precomputed cluster as a versioned case package, has multiple reviewers inspect it without seeing the generated label first, views the aggregated verdicts over the cluster topology, and exports both an `EvaluationReport` and `cluster_refinement.json` so an upstream Toponymy/HDBSCAN notebook can prune noisy sessions, split mixed regions, merge confusing neighbors, or rerun the labeling pass with better evidence.

## Utility Gate

A feature is useful only if it helps produce or improve an auditable
`EvaluationReport` or actionable `cluster_refinement.json` output from real or
realistic `CasePackage` inputs. The near-term product should prioritize local
package import, strict invalid-package failure, structured `ReviewResult`
persistence/export/import, visual results topology from imported package
coordinates, refinement export, and aggregation from local or imported results
before evidence-constrained AI assistance.

The target proof is small but real: several real or realistic packages,
multiple independent reviewers, exported ReviewResults, and one report that
surfaces label support, overclaim, evidence sufficiency, cluster impurity,
reviewer disagreement, and actionable split, merge, or pruning signals.

## Contract Separation

- `CasePackage` is the versioned cluster interpretation and evidence produced upstream.
- `ReviewResult` is one human review of that package.
- `EvaluationReport` aggregates compatible review results into evaluation metrics.

These objects must not collapse into one generic case or database record.

## Relationship To Toponymy

Telemetry Court begins after an upstream cluster naming process. Toponymy is a credible upstream system and the official [TutteInstitute/toponymy](https://github.com/TutteInstitute/toponymy) repository is the only authoritative source for Toponymy facts in this repo. Telemetry Court does not currently integrate with or execute Toponymy. A future adapter should convert approved Toponymy outputs into the versioned `CasePackage` contract.

## Relationship To ACME4-Style Datasets

ACME4-style and other real or realistic datasets can supply meaningful validation cases, but they should be processed in an appropriate environment. Adapters or notebooks should emit sanitized, minimal, auditable case packages. Telemetry Court should not require raw restricted telemetry in the public or portable app, and it does not currently ingest ACME4.

## Relationship To SIEM, EDR, And SOC Tools

SIEM, EDR, and SOC tools support operational detection, search, triage, investigation, and response. Telemetry Court evaluates whether an AI-generated interpretation of a precomputed cluster is supported by evidence. It complements upstream analytics and operational tools; it does not replace them.

Fast review, keyboard-first review, or batch validation may be useful, but that
workflow must remain evidence validation. It should use language such as fast
evidence review, batch validation, or reviewer workbench, not alert triage,
SOC queue, incident response, remediation, or live investigation.

## Product Success Criteria

Telemetry Court is successful when it can:

- ingest real or realistic precomputed clusters through a validated package boundary;
- preserve evidence provenance and claim-to-evidence traceability;
- support blind, structured review by multiple people;
- expose missing, weak, irrelevant, and contradictory evidence;
- aggregate reviewer judgments and disagreements;
- show aggregated judgments over the approved projection map;
- export evaluation metrics and refinement configuration that lead to
  measurable improvements in labels, prompts, embeddings, evidence extraction,
  or clustering decisions.

Visual polish and review completion alone are not success criteria.

## Positioning Statement

Telemetry Court is an evidence and topology review bench for AI-labeled telemetry clusters. It helps researchers, analysts, and data scientists test whether generated cluster names are supported by representative evidence, identify overclaims and impure regions, and produce structured human review plus refinement data for improving Toponymy-style labeling, prompts, embeddings, HDBSCAN parameters, and validation workflows.
