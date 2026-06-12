# Project Context

## Product Summary

Telemetry Court is a prototype for validating AI-generated interpretations of cyber telemetry clusters. It helps analysts inspect whether a generated cluster label or explanation is actually supported by underlying evidence.

Core question:

```text
Can AI prove what it claims?
```

## Problem Statement

Topic-naming and cluster-labeling systems can produce labels that sound plausible. Plausibility is not the same as evidence. Analysts need a structured way to inspect generated claims, compare them with evidence, see uncertainty, and record a judgment.

## Core Workflow

```text
Cluster -> AI label / explanation -> Extracted claims -> Evidence -> Support score -> Analyst judgment
```

## Target User

The target user is an analyst, researcher, or reviewer evaluating AI-generated interpretations of telemetry-like clusters. They need a calm workspace for reviewing evidence, not another alert queue or chat interface.

## MVP Scope

- Use synthetic sample data.
- Display a generated cluster label and explanation.
- Break the explanation into inspectable claims.
- Link each claim to supporting, weakening, contradicting, or missing evidence.
- Show support status and support score.
- Capture or display an analyst verdict.
- Keep data structures compatible with future Toponymy-style exports.

## Non-Goals

- No live telemetry ingestion.
- No real incident claims.
- No SIEM replacement.
- No generic threat-intel dashboard.
- No generic AI chatbot.
- No automated detection claims.
- No Toponymy, Python, database, auth, or backend integration in the MVP unless explicitly scoped later.

## Relationship To Toponymy

Telemetry Court is inspired by the upstream shape of systems like [Toponymy](https://github.com/TutteInstitute/toponymy), but it focuses on downstream validation. The official `TutteInstitute/toponymy` GitHub repository is the source of truth for factual Toponymy details used in this repo.

Telemetry Court should stay compatible with Toponymy-style concepts without inventing unverified details about Toponymy itself. See `docs/TOPONYMY_NOTES.md` for source-of-truth and non-invention rules.

## Glossary

- Information object: A document, event, session, exemplar, or other item that can be embedded and clustered.
- Embedding: A vector representation of an information object.
- Cluster: A group of related information objects or telemetry-like items.
- Topic label: A generated human-readable name for a cluster.
- Generated explanation: AI-written rationale describing what a cluster represents.
- Claim: A reviewable assertion extracted from a generated label or explanation.
- Evidence item: A sample, keyphrase, feature, metadata note, or analyst note used to evaluate a claim.
- Evidence relation: A typed link between a claim and evidence, including polarity and strength.
- Support score: A numeric estimate of how well evidence supports a claim.
- Analyst verdict: Human judgment about whether the claim or case should be accepted, revised, rejected, or escalated.
- Claim ledger: The auditable list of claims, evidence links, rationales, and statuses.
- Audit trail: The record of how a judgment was reached.
