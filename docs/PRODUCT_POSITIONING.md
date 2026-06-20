# Product Positioning

## One-Sentence Definition

Telemetry Court is an evidence-based human-in-the-loop validation bench for AI-generated telemetry cluster interpretations.

## Product Thesis

AI-generated cluster labels can sound plausible while being unsupported, overbroad, overly specific, unstable, or based on impure clusters. The useful product is not another place to display those labels. It is a disciplined environment for turning them into testable claims, judging them against representative evidence, and producing reusable human evaluation data.

## What Telemetry Court Is

- A review bench for precomputed telemetry clusters and generated interpretations.
- A structured workflow for blind review, claim inspection, evidence classification, label comparison, outlier review, and verdict capture.
- A validation layer between clustering or labeling pipelines and the teams improving those pipelines.
- A source of reviewer agreement, evidence sufficiency, overclaim, impurity, split, merge, and uncertainty signals.
- A downstream companion to Toponymy-style cluster naming workflows.

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
- Analysts and senior reviewers judging whether generated interpretations are defensible.
- Educators and research institutions teaching evidence-grounded interpretation.

## Non-Users And Out-Of-Scope Users

Telemetry Court is not primarily for frontline SOC analysts responding to live alerts, teams seeking endpoint response actions, users who need raw log search first, or organizations looking for case management, ticketing, or a SIEM replacement.

## Real-World Problem

Clustering pipelines can produce coherent-looking maps and confident labels without proving that the labels reflect the underlying sessions or events. Teams often lack a repeatable way to review the evidence, preserve pre-label human judgment, compare alternative interpretations, aggregate disagreements, and feed the results back into the pipeline.

## Strongest Use Case

A research or AI/ML team imports a real or realistic precomputed cluster as a versioned case package, has multiple reviewers inspect it without seeing the generated label first, captures structured evidence ratings and verdicts, and exports an evaluation report that identifies which label, prompt, model, embedding, or evidence package performed better.

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

## Product Success Criteria

Telemetry Court is successful when it can:

- ingest real or realistic precomputed clusters through a validated package boundary;
- preserve evidence provenance and claim-to-evidence traceability;
- support blind, structured review by multiple people;
- expose missing, weak, irrelevant, and contradictory evidence;
- aggregate reviewer judgments and disagreements;
- export evaluation metrics that lead to measurable improvements in labels, prompts, embeddings, evidence extraction, or clustering decisions.

Visual polish and review completion alone are not success criteria.

## Positioning Statement

Telemetry Court is an evidence review bench for AI-labeled telemetry clusters. It helps researchers and analysts test whether generated cluster names are supported by representative evidence, identify overclaims and impure clusters, and produce structured human review data for improving Toponymy-style labeling, prompts, embeddings, and validation workflows.
