# GitHub Copilot Instructions

Telemetry Court is an evidence-checking interface for AI-generated telemetry cluster labels and explanations.

Core workflow:

```text
Cluster -> AI label / explanation -> Claims -> Evidence -> Support score -> Analyst verdict
```

## Product Direction

- Treat Telemetry Court as a downstream validation layer, not a label generator.
- Keep the product focused on whether AI-generated claims are supported by evidence.
- Use Toponymy concepts as inspiration only: information objects, embeddings, clusters, topic labels, exemplars, keyphrases, subtopics, and representative samples.
- Do not create Toponymy integration code unless explicitly requested.
- Use only synthetic sample data.

## Style Direction

- Apple / Wealthsimple inspired.
- Calm, minimal, spacious, premium, and trustworthy.
- Evidence-first hierarchy.
- No cyberpunk, neon, terminal theater, noisy SOC dashboard styling, or fake incident drama.

## Coding Expectations

- Prefer TypeScript, Next.js App Router, and Tailwind.
- Keep the frontend simple and static-data friendly.
- Make the smallest safe change.
- Do not add backend/API dependencies unless explicitly scoped.
- Do not add packages without a clear reason.
- Use domain names from `docs/DATA_MODEL.md`.

## Validation Expectations

- Every generated claim should map to evidence IDs or explicitly show missing evidence.
- Distinguish supported, weakly supported, contradicted, unsupported, and insufficient-evidence states.
- Run `npm run lint` and `npm run build` when applicable.
- Update `docs/CHANGELOG_AI.md` after AI-assisted changes.
