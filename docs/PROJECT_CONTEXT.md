# Project Context

## Product Summary

Telemetry Court is an interactive evidence arena for AI-generated interpretations of cyber telemetry clusters.

Core line:

```text
AI names the pattern. Humans test the evidence.
```

Core question:

```text
Can AI prove what it claims?
```

Core evaluation workflow:

```text
Telemetry clusters
-> AI-generated interpretation
-> evidence-first investigation
-> structured human verdict
-> evaluation data for better prompts, labels, embeddings, and cluster quality
```

## Current Source Of Truth

The current source of truth is the Evidence Arena vision in [docs/PRODUCT_VISION.md](./PRODUCT_VISION.md).

The older approve/reject label-validator framing is superseded. It can be discussed only as historical baseline:

```text
AI label -> evidence cards -> approve / reject
```

The active product direction is:

```text
Telemetry landscape
-> behavioural region / case file
-> blind investigation
-> AI label reveal
-> evidence classification
-> label duel
-> impostor session selection
-> structured verdict
-> review JSON export
```

## Problem Statement

AI systems can generate cluster labels that sound plausible while being unsupported, overly broad, overly specific, mixed, or uncertain. Analysts and researchers need an evidence-first environment for testing whether generated interpretations are defensible.

Telemetry Court should make unsupported certainty visible. It should also reward good uncertainty when evidence is suggestive but incomplete.

## Target User

The target user is a researcher, analyst, reviewer, or workshop participant evaluating whether an AI-generated telemetry interpretation is grounded in evidence.

The user should not have to enjoy reading huge logs or writing labels from scratch. The workflow should be mostly selectable, visual, and structured.

## MVP Scope

- Use local synthetic fixture data.
- Show a telemetry landscape with multiple behavioural regions.
- Open a case file for a selected region.
- Show evidence before revealing the AI label.
- Let the user choose a blind interpretation from options.
- Reveal the AI label and show agreement/disagreement.
- Let the user classify evidence cards.
- Let the user compare candidate labels.
- Let the user choose an impostor / outlier session.
- Let the user choose failure-mode chips and a structured verdict.
- Export or view structured review JSON.

## Non-Goals

- No live telemetry ingestion.
- No real incident claims.
- No SIEM replacement.
- No SOC-dashboard clone.
- No generic chatbot wrapper.
- No threat-intelligence dashboard.
- No automated detection claims.
- No required Toponymy, Python, database, auth, or backend integration in the MVP.

## Relationship To Toponymy

Telemetry Court starts after a cluster has been embedded, clustered, characterized, and named. Its job is to ask what the AI is claiming, what evidence supports or weakens that claim, whether the cluster is coherent, and what a human reviewer should conclude.

The official [`TutteInstitute/toponymy`](https://github.com/TutteInstitute/toponymy) GitHub repository is the source of truth for factual Toponymy details used in this repo. Do not invent Toponymy APIs, workflows, capabilities, function signatures, supported models, or outputs.

## Glossary

- Behavioural region: A visible cluster or region in the telemetry landscape.
- Case file: One behavioural region plus candidate interpretations, evidence, sessions, reviewer interactions, and verdict.
- Blind interpretation: The user's structured choice before seeing the AI label.
- AI label: The generated interpretation under test.
- Evidence card: A synthetic evidence item that can be classified by the reviewer.
- Label duel: A structured comparison among candidate labels from different sources.
- Impostor session: A representative session that least belongs in the cluster.
- Failure mode: A structured reason such as overclaimed, too broad, missing evidence, or mixed cluster.
- Structured verdict: The final review outcome exported as evaluation data.
