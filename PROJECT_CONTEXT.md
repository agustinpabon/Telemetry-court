# Telemetry Court - Stable Project Context

## One-Sentence Description

Telemetry Court is an interactive evidence arena for testing whether AI-generated interpretations of cyber telemetry clusters are supported by inspectable evidence.

## Core Product Line

```text
AI names the pattern. Humans test the evidence.
```

## Core Product Question

```text
Can AI prove what it claims?
```

## Current Source Of Truth

Use the tracked docs as the active source of truth:

- `docs/PRODUCT_VISION.md`
- `docs/PROJECT_CONTEXT.md`
- `docs/PRODUCT_DECISIONS.md`
- `docs/ROADMAP.md`
- `docs/GITHUB_PLANNING.md`

The previous simple approve/reject label-validator framing is superseded. It can be mentioned only as historical context.

## Current Evidence Arena Workflow

```text
Telemetry landscape
-> behavioural region / case file
-> blind investigation
-> AI label reveal
-> evidence classification
-> label duel
-> impostor / outlier selection
-> structured verdict
-> review JSON export
```

## Evaluation Workflow

```text
Telemetry clusters
-> AI-generated interpretation
-> evidence-first investigation
-> structured human verdict
-> evaluation data for better prompts, labels, embeddings, and cluster quality
```

## What The User Should Understand Quickly

A reviewer should quickly see:

- what behavioural region or case is under review;
- what evidence is visible before the AI label is revealed;
- what the AI claimed after reveal;
- which evidence supports, weakly supports, contradicts, needs context, or is noise;
- which candidate label is best supported;
- whether the cluster appears pure or contains an impostor/outlier session;
- what structured verdict and failure modes are exported.

## What The Product Is

Telemetry Court is:

- an evidence-first investigation interface;
- a trust layer for AI-assisted telemetry interpretation;
- a structured human-in-the-loop evaluation environment;
- a claim/evidence inspection interface;
- a downstream companion to systems such as Toponymy-style cluster naming workflows;
- a way to produce structured review data about labels, evidence packets, prompts, and clusters.

## What The Product Is Not

Telemetry Court is not:

- a SIEM;
- a SOC dashboard;
- a threat detection engine;
- a generic AI chatbot;
- a real-time alerting interface;
- a backend-heavy platform;
- a Toponymy integration yet;
- a place to invent evidence;
- only an approve/reject label validator.

## MVP Philosophy

Keep the MVP narrow:

```text
Static synthetic cases first.
Evidence traceability first.
Structured choices first.
Readable investigation flow first.
No backend until product need is clear.
No real telemetry ingestion until safe contracts exist.
No Toponymy integration until the input/output contract is designed.
```

## Good MVP Features

Good MVP features:

- telemetry landscape;
- case file;
- blind interpretation choices;
- AI label reveal;
- evidence classification board;
- label duel;
- impostor/outlier selection;
- structured verdict and failure-mode chips;
- review JSON preview/copy/download;
- lightweight tests protecting core review language and export shape.

## Risky Premature Features

Avoid too early:

- backend storage;
- auth;
- real telemetry ingestion;
- direct Toponymy execution;
- live AI calls;
- automated claim extraction;
- complex scoring models;
- dense dashboards;
- leaderboards or gamification;
- too many charts;
- free-text requirements in the happy path.
