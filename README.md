<p align="center">
  <img src="public/telemetry-court-logo.png" alt="Telemetry Court Logo" width="130" />
</p>

```text
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║ ╔╦╗ ╔═╗ ╦   ╔═╗ ╔╦╗ ╔═╗ ╔╦╗ ╦═╗ ╦ ╦   ╔═╗ ╔═╗ ╦ ╦ ╦═╗ ╔╦╗ ║
║  ║  ║╣  ║   ║╣  ║║║ ║╣   ║  ╠╦╝ ╚╦╝   ║   ║ ║ ║ ║ ╠╦╝  ║  ║
║  ╩  ╚═╝ ╩═╝ ╚═╝ ╩ ╩ ╚═╝  ╩  ╩╚═  ╩    ╚═╝ ╚═╝ ╚═╝ ╩╚═  ╩  ║
║                                                           ║
║    — AI names the cluster. Humans test the evidence. —    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

Telemetry Court is an evidence-based human-in-the-loop validation bench for AI-generated telemetry cluster interpretations.

It exists to answer one question:

```text
Given a telemetry cluster and an AI-generated label or explanation,
is that interpretation actually supported by the evidence?
```

Telemetry Court turns generated labels into testable claims, exposes the evidence behind them, and records structured human judgments that can improve labels, prompts, embeddings, evidence extraction, and clustering pipelines.

## Current State

The repository currently contains a high-quality static validation slice built with Next.js, TypeScript, Tailwind, and synthetic cases. It demonstrates:

- telemetry landscape and case selection;
- blind review before the AI label is revealed;
- claim-level evidence inspection and classification;
- candidate-label comparison;
- impostor or outlier selection;
- structured verdicts and local JSON export;
- browser-local `ReviewResult` persistence and a read-only fixture-backed
  `EvaluationReport` results view with JSON/CSV downloads.

This slice demonstrates the review protocol and current local report/export shape. It does not yet ingest real Toponymy or ACME4-derived outputs, persist multi-reviewer results in durable infrastructure, or produce research-grade evaluation reports from a real report workflow. Those are target capabilities, not current claims.

## Product Boundary

Telemetry Court starts after an upstream system has embedded, clustered, characterized, and named telemetry. Upstream systems may eventually include Toponymy, notebooks, clustering pipelines, ACME4-derived experiments, CloudTrail-derived experiments, or synthetic and sanitized generators.

```text
Upstream clustering or labeling pipeline
-> versioned CasePackage JSON
-> Telemetry Court review and validation
-> ReviewResult JSON
-> EvaluationReport metrics
-> upstream pipeline improvement
```

Telemetry Court owns reviewability, evidence grounding, auditability, structured human judgment, and evaluation output. It does not own the full telemetry-processing stack.

## What It Is

- A validation bench for AI-generated cluster labels and explanations.
- A structured human-in-the-loop evaluation environment.
- A claim-to-evidence inspection interface.
- A way to preserve blind review before AI-label reveal.
- A way to collect multiple reviewers' structured verdicts.
- A downstream companion to systems such as Toponymy.
- Evaluation infrastructure for comparing labels, prompts, models, embeddings, evidence extraction, and cluster quality.

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
```

The main workflow is structured-choice first. Reviewers should classify evidence as supporting, weak support, irrelevant, contradictory, insufficient, or needing more context without being required to type.

## Definition Of Real Usefulness

Telemetry Court becomes serious validation infrastructure only when it can:

- ingest a real or realistic precomputed cluster;
- generate or accept a defensible evidence package;
- let multiple humans review it;
- preserve blind review before AI-label reveal;
- store structured verdicts;
- aggregate reviewer judgments;
- export metrics that improve labels, prompts, embeddings, or pipeline design.

Until then, the current application remains a polished static validation interface rather than complete validation infrastructure.

## Data Posture

The public and portable application must not require raw restricted telemetry. Real or restricted datasets should be converted into approved, minimal, auditable case packages inside the appropriate environment. Local fixtures must remain synthetic, sanitized, or explicitly approved.

Toponymy and ACME4-style integrations should be adapters that produce versioned case packages. They must not turn Telemetry Court into a raw telemetry ingestion engine. The official [TutteInstitute/toponymy](https://github.com/TutteInstitute/toponymy) repository is the factual source of truth for Toponymy in this project.

## Next Milestone

The next implementation milestone is **Case Package Contract and Validation Infrastructure**, not a generic backend. It will define `CasePackage v0.1`, `ReviewResult v0.1`, and `EvaluationReport v0.1`, add package validation rules, and convert the current synthetic cases into package-shaped fixtures while preserving the review UI.

See:

- [Product positioning](./docs/PRODUCT_POSITIONING.md)
- [Product vision](./docs/PRODUCT_VISION.md)
- [Project context](./docs/PROJECT_CONTEXT.md)
- [Case package contract](./docs/CASE_PACKAGE_CONTRACT.md)
- [Reviewer rubric](./docs/REVIEWER_RUBRIC.md)
- [Evaluation infrastructure](./docs/EVALUATION_INFRASTRUCTURE.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Roadmap](./docs/ROADMAP.md)
- [Product decisions](./docs/PRODUCT_DECISIONS.md)
- [Agent instructions](./AGENTS.md)

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm test
npm run lint
npm run build
```

## License

MIT. See [LICENSE](./LICENSE).
