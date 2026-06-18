# Architecture

## Current Repo Status

Telemetry Court is currently a Next.js App Router project using TypeScript, Tailwind, and static sample data. The repository contains frontend components, Evidence Arena sample cases, shared helpers, and domain types.

There is no backend, database, authentication layer, telemetry ingestion pipeline, or Toponymy integration.

## Proposed Architecture

For the MVP, keep the architecture frontend-first:

- `app/`: Next.js App Router pages and layout.
- `components/`: Small, composable review-workspace components.
- `data/`: Synthetic case data only.
- `lib/`: Shared TypeScript types and small utility functions.
- `docs/`: Product context, architecture notes, agent workflows, and domain model.

## Frontend-First MVP Approach

The current implementation phase should prove the Evidence Arena with static data before adding infrastructure. Static sample data is enough to validate the product questions:

- Can a reviewer explore multiple behavioural regions?
- Can they inspect a selected case file?
- Can they make a blind interpretation before seeing the AI label?
- Can they classify evidence cards?
- Can they compare candidate labels?
- Can they identify an outlier session?
- Can they issue and export a structured verdict?

## Suggested Domain Model

Use the domain model in `docs/DATA_MODEL.md` as the conceptual source of truth:

- `Cluster`
- `TopicLabel`
- `Claim`
- `EvidenceItem`
- `EvidenceRelation`
- `SupportScore`
- `CandidateLabel`
- `RepresentativeSession`
- `EvidenceArenaReview`
- `AnalystVerdict`
- `CaseFile`

Existing frontend types may evolve toward this model incrementally. Avoid broad rewrites unless a task explicitly scopes a data-model migration.

## Data Flow

```text
Telemetry landscape
-> CaseFile
-> blind interpretation
-> AI label reveal
-> evidence ratings
-> label duel
-> impostor session
-> structured verdict
-> review export
```

1. A behavioural region is selected from the landscape.
2. The selected case file exposes cluster context, claims, evidence, candidate labels, and sessions.
3. The reviewer makes a blind structured choice before reveal.
4. The AI label is revealed and compared with the blind choice.
5. Evidence cards are classified by the reviewer.
6. Candidate labels are compared in a label duel.
7. A representative session is selected as the likely impostor / outlier.
8. Failure modes and final verdict are selected.
9. The review is exported as structured JSON.

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
- Full DataMapPlot-style map exploration.
