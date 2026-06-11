# Architecture

## Current Repo Status

Telemetry Court is currently a Next.js App Router project using TypeScript, Tailwind, and static sample data. The repository already contains frontend components, sample cases, and domain types.

There is no backend, database, authentication layer, telemetry ingestion pipeline, or Toponymy integration.

## Proposed Architecture

For the MVP, keep the architecture frontend-first:

- `app/`: Next.js App Router pages and layout.
- `components/`: Small, composable review-workspace components.
- `data/`: Synthetic case data only.
- `lib/`: Shared TypeScript types and small utility functions.
- `docs/`: Product context, architecture notes, agent workflows, and domain model.

## Frontend-First MVP Approach

The first implementation phase should prove the review experience with static data before adding infrastructure. Static sample data is enough to validate the product questions:

- Can a reviewer see what the AI claimed?
- Can they inspect evidence for each claim?
- Can they see support, contradiction, and missing evidence?
- Can they understand why confidence was assigned?

## Suggested Domain Model

Use the domain model in `docs/DATA_MODEL.md` as the conceptual source of truth:

- `Cluster`
- `TopicLabel`
- `Claim`
- `EvidenceItem`
- `EvidenceRelation`
- `SupportScore`
- `AnalystVerdict`
- `CaseFile`

Existing frontend types may evolve toward this model incrementally. Avoid broad rewrites unless a task explicitly scopes a data-model migration.

## Data Flow

```text
Cluster -> Topic Label -> Claims -> Evidence Items -> Scores -> Verdict
```

1. A cluster is selected for review.
2. A generated topic label and explanation are shown.
3. Claims are extracted or represented as reviewable assertions.
4. Evidence items are linked to each claim.
5. Evidence relations define polarity, strength, and explanation.
6. Support scores summarize claim-level confidence.
7. The analyst records or reviews a verdict.

## Suggested Future Backend Boundaries

Future backend work can be separated into:

- Import boundary: Toponymy-style exports, CSV/JSON, or other cluster-label outputs.
- Claim extraction boundary: generated explanation to claim ledger.
- Evidence scoring boundary: evidence relation and score calculation.
- Case storage boundary: saved reviews, audit trail, and analyst verdicts.
- User/workspace boundary: authentication, permissions, and collaboration.

Do not add these boundaries until product need is clear.

## Not Implemented Yet

- Real telemetry ingestion.
- Toponymy execution or Python services.
- Automated claim extraction.
- Automated support scoring.
- Persistent case storage.
- User accounts or authentication.
- Production deployment workflow.
- DataMapPlot-style map exploration.
