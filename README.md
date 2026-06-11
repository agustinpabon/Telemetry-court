# Telemetry Court

Evidence-based validation for AI-generated telemetry cluster interpretations.

## The Problem

Modern clustering and topic-naming systems can generate plausible labels and explanations for telemetry clusters.

However, plausible does not mean correct.

Analysts need a way to determine whether generated interpretations are actually supported by evidence.

## What Telemetry Court Does

Telemetry Court evaluates AI-generated cluster interpretations.

It breaks interpretations into reviewable claims, maps evidence to those claims, and produces a transparent verdict.

## Workflow

```text
Telemetry
→ Embedding
→ Clustering
→ Toponymy
→ Generated Interpretation
→ Telemetry Court
→ Claim Validation
→ Evidence Mapping
→ Verdict
```

## Core Concepts

### Generated Interpretation

The model-generated cluster name and description under review.

### Claim Ledger

A readable list of reviewable statements extracted from the interpretation, each with status, rationale, and linked evidence.

### Evidence Workspace

The primary source-of-truth surface for reviewing supporting, partial, and contradictory evidence.

### Court Record

An official-looking review record containing verdict, confidence, review decision, model metadata, and timestamps.

### Verdict

The final judgment on whether the interpretation is supported by the evidence.

## Current Status

v0.1

Frontend prototype using synthetic data.

No telemetry ingestion.
No model integrations yet.

## Roadmap

### v0.2

- Toponymy-compatible JSON import
- Interpretation ingestion workflow

### v0.3

- Automated claim extraction
- Automated evidence mapping

### v0.4

- Human review analytics
- Validation benchmarking

## Screenshots

### Main Review Workspace

Screenshot coming soon.

### Claim Ledger And Evidence Workspace

Screenshot coming soon.

## Development

### Requirements

- Node.js 20+
- npm 10+

### Installation

```bash
npm install
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Quality Checks

```bash
npm run lint
npm run build
```

## License

MIT. See [LICENSE](./LICENSE).
