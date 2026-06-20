# Product

## Register

product

## Definition

Telemetry Court is an evidence-based human-in-the-loop validation bench for AI-generated telemetry cluster interpretations.

```text
AI names the cluster. Humans test the evidence.
```

## Users

Primary users are researchers, analysts, reviewers, educators, and AI/ML or cyber data science teams evaluating whether generated cluster labels and explanations are supported by representative evidence. They compare labels, prompts, models, embeddings, evidence extraction, and clustering choices; they are not responding to live alerts.

## Product Purpose

Telemetry Court accepts precomputed cluster outputs as reviewable case packages, exposes generated claims and their evidence, preserves blind human review before label reveal, captures structured verdicts, and produces evaluation data for improving upstream pipelines.

The current interface is a static validation slice with synthetic cases. It demonstrates the review protocol but does not yet provide case package import, durable multi-reviewer results, or evaluation reports.

## Product Boundary

```text
CasePackage -> structured review -> ReviewResult -> EvaluationReport
```

Telemetry Court owns reviewability, evidence grounding, auditability, and evaluation output. It does not own raw telemetry ingestion, operational detection, SIEM/SOC workflows, or incident response.

## Brand Personality

Calm, scientific, trustworthy, restrained, and evidence-first. The interface may use the existing landscape and court vocabulary when it clarifies review, but it must not feel theatrical, game-like, or security-dashboard driven.

## Anti-References

Do not make Telemetry Court look or behave like a chatbot, SIEM, SOC dashboard, threat wall, raw telemetry explorer, game, generic admin product, or auth-first SaaS application. Do not copy protected brand expression. Do not invent evidence, telemetry fields, Toponymy capabilities, real incident claims, or restricted data.

## Design Principles

- Evidence before assertion.
- Structured judgment over open-ended guessing.
- Every claim inspectable through stable evidence links or explicit missing-evidence states.
- Uncertainty and disagreement treated as evaluation signals.
- Current and target capabilities stated separately.
- Calm hierarchy used to support review, not conceal weak evidence.

## Accessibility

Use WCAG AA as the baseline. Main controls must be keyboard accessible, must not rely on color alone, and must preserve reduced-motion support. Free text may be optional expert annotation but must not block review completion.
