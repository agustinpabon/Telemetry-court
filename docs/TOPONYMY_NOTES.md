# Toponymy Notes

Useful references:

- [Toponymy repository](https://github.com/TutteInstitute/toponymy)
- [DeepWiki Toponymy overview](https://deepwiki.com/TutteInstitute/toponymy/1-overview)

## Useful Toponymy Concepts

Toponymy is a hierarchical topic naming system. It works with information objects, vector representations, clustering at multiple levels of granularity, contextual feature extraction, and LLM-generated topic names.

Concepts useful to Telemetry Court:

- Information objects.
- Embeddings.
- Clusterable vectors.
- Hierarchical clusters.
- Cluster labels.
- Topic names.
- Exemplars.
- Keyphrases.
- Representative samples.
- Subtopics.
- LLM-generated topic names.
- Disambiguation.
- DataMapPlot-style visual exploration.

## What Telemetry Court Borrows Conceptually

Telemetry Court can be downstream of systems that produce clusters and topic names. It can use cluster labels, explanations, exemplars, keyphrases, and representative samples as inputs to a review case.

The MVP should stay compatible with this shape, especially in naming and data model choices.

## What Telemetry Court Adds

Telemetry Court adds a validation layer:

- Generated claim.
- Evidence item.
- Supporting evidence.
- Contradicting evidence.
- Missing evidence.
- Confidence score.
- Support score.
- Analyst verdict.
- Audit trail.
- Rationale.
- Claim ledger.

## Why Validation Matters After Cluster Naming

LLM-generated topic names can be useful but can also overstate, omit, or misread evidence. A label may sound plausible while being weakly supported, contradicted by an exemplar, or based on missing context.

Telemetry Court exists to make that gap visible. It asks whether the generated interpretation is supported by the evidence, not whether the generated text sounds fluent.

## Integration Stance

Use careful language:

- "inspired by Toponymy"
- "compatible with Toponymy-style exports"
- "downstream of cluster naming"
- "could validate outputs from systems like Toponymy"

Do not claim current integration. Do not add Toponymy, Python, or backend services unless a future task explicitly requests it.
