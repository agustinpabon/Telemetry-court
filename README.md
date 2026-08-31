<p align="center">
  <img src="public/telemetry-court-logo.png" alt="Telemetry Court Logo" width="130" />
</p>

```text
 ╔╦╗ ╔═╗ ╦   ╔═╗ ╔╦╗ ╔═╗ ╔╦╗ ╦═╗ ╦ ╦   ╔═╗ ╔═╗ ╦ ╦ ╦═╗ ╔╦╗
  ║  ║╣  ║   ║╣  ║║║ ║╣   ║  ╠╦╝ ╚╦╝   ║   ║ ║ ║ ║ ╠╦╝  ║ 
  ╩  ╚═╝ ╩═╝ ╚═╝ ╩ ╩ ╚═╝  ╩  ╩╚═  ╩    ╚═╝ ╚═╝ ╚═╝ ╩╚═  ╩ 

      AI names the cluster. Humans test the evidence. 
```

Telemetry Court is an evidence-based human-in-the-loop validation bench and
topological refiner for AI-generated telemetry cluster interpretations.

It exists to answer one question:

```text
Given a telemetry cluster and an AI-generated label or explanation,
is that interpretation actually supported by the evidence?
```

Telemetry Court turns generated labels into testable claims, exposes the
evidence behind them, and records structured human judgments that can improve
labels, prompts, embeddings, evidence extraction, and cluster topology.

## Current State

The repository contains a local Next.js/TypeScript research product with safe
synthetic built-in cases and a strict external-package path. The implemented
loop includes:

- manual `CasePackage v0.1` JSON import, actionable validation diagnostics, and
  a local validation CLI;
- an optional configured Hot-Folder scan/polling path plus a standard-library
  Python companion for atomic package writes and refinement reads;
- blind review, AI-label reveal, evidence classification, label comparison,
  outlier or impostor selection, split/merge recommendations, and structured
  verdict export;
- optional sanitized field highlights and a deterministic mocked Evidence
  Assistance panel that uses fixed questions and exact validated package IDs;
- browser-local reviewer identity/context, `ReviewResult` persistence,
  semantic warnings, strict result/bundle import and export, and separate quick
  disposition artifacts;
- compatible multi-reviewer `EvaluationReport v0.1` aggregation, JSON/CSV
  export, explicit unavailable states, and a results topology map using
  coordinates supplied by a matching CasePackage;
- validated `cluster_refinement.v0.1` export for external upstream pruning,
  split, merge, uncertainty, and disagreement handling.

This is a local file-contract workflow, not a production multi-user service.
It does not execute Toponymy, DataMapPlot, UMAP/HDBSCAN, ACME4, or raw telemetry
processing; call a live AI provider; provide durable server-side persistence;
or prove research validity. The tracked examples are synthetic, and the real
study still requires approved realistic packages and independent human
reviewers.

Browser and Hot-Folder CasePackage reads are bounded at 2 MiB. Browser imports
of ReviewResult bundles and quick-disposition artifacts are bounded at 8 MiB.
The UI checks declared size before reading and actual UTF-8 bytes after reading;
byte-backed imports reject invalid UTF-8. Oversized, malformed-encoding, or
unreadable local files fail without echoing supplied content.

## Product Boundary

Telemetry Court starts after an upstream system has embedded, clustered, characterized, and named telemetry. Upstream systems may eventually include Toponymy, notebooks, clustering pipelines, ACME4-derived experiments, CloudTrail-derived experiments, or synthetic and sanitized generators.

```text
Upstream clustering or labeling pipeline
-> versioned CasePackage JSON
-> Telemetry Court review and validation
-> ReviewResult JSON
-> EvaluationReport metrics
-> cluster_refinement.v0.1
-> external upstream pipeline improvement
```

Telemetry Court owns reviewability, evidence grounding, auditability, structured human judgment, and evaluation output. It does not own the full telemetry-processing stack.

## What It Is

- A validation bench and topological refiner for AI-generated cluster labels
  and explanations.
- A structured human-in-the-loop evaluation environment.
- A claim-to-evidence inspection interface.
- A way to preserve blind review before AI-label reveal.
- A way to collect multiple reviewers' structured verdicts.
- A downstream companion to systems such as Toponymy.
- Versioned evaluation artifacts that can support explicitly designed external
  comparisons of labels, prompts, models, embeddings, evidence extraction, and
  cluster quality; v0.1 does not rank packages or runs by itself.
- A local, versioned refinement handoff for upstream pruning, split, merge, and
  rerun decisions.

## What It Is Not

- Not a SIEM, EDR, SOC dashboard, or alert-triage system.
- Not a Splunk, Elastic, CrowdStrike, Sentinel, or Chronicle competitor.
- Not a raw telemetry search or ingestion engine.
- Not a generic cyber investigation platform.
- Not a chatbot-first product.
- Not a game-like review experience.
- Not a generic CRUD backend or auth-first application.
- Not merely a polished frontend with an undefined backend.

The court metaphor may support evidence-based validation, but it must not make the product theatrical or unserious.

## Core Review Flow

```text
Telemetry landscape
-> case package
-> blind interpretation
-> AI label reveal
-> evidence classification
-> label comparison
-> impostor / outlier selection
-> structured verdict
-> ReviewResult export
-> multi-reviewer EvaluationReport
-> cluster_refinement export
-> external upstream refinement/rerun
```

The main workflow is structured-choice first. Reviewers should classify evidence as supporting, weak support, irrelevant, contradictory, insufficient, or needing more context without being required to type.

## Definition Of Real Usefulness

The repository now implements the local contract loop needed for a serious
validation study. It can accept a precomputed, defensible CasePackage, preserve
blind review, exchange multiple structured human results, aggregate compatible
judgments, and export an upstream refinement recipe.

Real usefulness is not established by implementation alone. It requires a
human-approved set of realistic/sanitized packages, 2-3 independent reviewers,
auditable exported artifacts, and an external upstream team applying or
rejecting the resulting recommendations or recording an explicit no-action
handoff. Until that study is run, Telemetry Court may claim an implemented
local research workflow, not scientific
validation, model superiority, or real-world operational impact.

## Data Posture

The public and portable application consumes validated `CasePackage` JSON, not raw restricted telemetry. Real or restricted datasets must be converted upstream into minimal, auditable packages inside an approved environment. Public fixtures and demos must use synthetic packages or sanitized packages whose approval scope explicitly permits public/demo use; contributors must never commit restricted data or raw-telemetry fixtures.

Toponymy and ACME4-style integrations should be adapters that produce versioned case packages. They must not turn Telemetry Court into a raw telemetry ingestion engine. The official [TutteInstitute/toponymy](https://github.com/TutteInstitute/toponymy) repository is the factual source of truth for Toponymy in this project.

See [the approved evidence package workflow](./docs/ADAPTER_BOUNDARY.md#approved-evidence-package-workflow) for the synthetic, sanitized controlled, and real/approved controlled postures; required provenance, sanitization, safe-reference, and approval metadata; and contributor handling rules.

## Current Milestones And Next Proof

Milestone 3 (Local Utility Gate) and the repository-owned engineering for
Milestone 4 (adapter/Hot-Folder/refinement loop) are implemented. Milestone 5
now includes a deliberately narrow, deterministic mocked assistance panel on
the Evidence Board. It is secondary to human evidence ratings and has no live
provider, arbitrary prompt, streaming, transcript, or ReviewResult metadata.

The highest-value next action is Milestone 6: run the approved protocol with
3-5 realistic/sanitized CasePackages and 2-3 independent reviewers, validate
and aggregate their actual ReviewResults, export EvaluationReports and
`cluster_refinement.v0.1`, and evaluate the next upstream iteration. That is a
human/external proof step; repository code must not fabricate it.

See:

- [Product positioning](./docs/PRODUCT_POSITIONING.md)
- [Product vision](./docs/PRODUCT_VISION.md)
- [Project context](./docs/PROJECT_CONTEXT.md)
- [Case package contract](./docs/CASE_PACKAGE_CONTRACT.md)
- [Reviewer rubric](./docs/REVIEWER_RUBRIC.md)
- [Evaluation infrastructure](./docs/EVALUATION_INFRASTRUCTURE.md)
- [Hot-Folder and Python companion](./docs/HOT_FOLDER_PYTHON_CLIENT.md)
- [Cluster refinement handoff](./docs/CLUSTER_REFINEMENT_HANDOFF.md)
- [Mocked Evidence Assistance contract](./docs/AI_ASSISTANCE_RESPONSE_CONTRACT.md)
- [Research validation study protocol](./docs/VALIDATION_PILOT_PROTOCOL.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Roadmap](./docs/ROADMAP.md)
- [Product decisions](./docs/PRODUCT_DECISIONS.md)
- [Agent instructions](./AGENTS.md)

## Development

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run check
```

`npm run check` runs typecheck, lint, TypeScript/JavaScript tests with 80%
line, branch, and function coverage thresholds, Python tests, and the
production build without hiding their individual output. The same steps
remain available as `npm run typecheck`, `npm run lint`,
`npm run test:coverage`, `npm test`, `npm run test:python`, and
`npm run build`.

The deterministic Evidence Assistance browser smoke uses Playwright/Chromium
and only synthetic package data:

```bash
npm run test:browser:assistance
npm run test:browser:release
```

Validate and inspect one local `CasePackage` JSON file:

```bash
npm run validate-package -- path/to/case-package.json
```

This command validates the supplied package file only. It does not read raw
telemetry, resolve source artifacts, or follow safe references.

The in-app CasePackage import summary mirrors this local validator inspection
boundary after a valid import. It summarizes validated CasePackage metadata
only and remains separate from ReviewResult or EvaluationReport creation.

Validate and inspect one local `ReviewResult` JSON or `ReviewResultBundle` JSON file:

```bash
npm run validate-review-results -- path/to/review-results.json
```

This command validates the supplied results file strictly against existing validation contracts, summarizes the verdict/confidence distributions, compatibility status, and reviewer sessions, and exits with a non-zero status code on parsing or validation failures. It operates strictly locally on existing reviewer output files and does not fabricate reviews, produce pilot outputs, or write new EvaluationReports.

## License

MIT. See [LICENSE](./LICENSE).
