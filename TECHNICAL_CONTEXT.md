# Telemetry Court - Technical Context

## Current Architecture

Telemetry Court is currently a static frontend Evidence Arena MVP.

Expected stack:

- Next.js App Router;
- TypeScript;
- Tailwind;
- static synthetic sample data;
- Node built-in test runner with `tsx`.

No current production backend is assumed.

## Current Non-Goals

Do not add unless explicitly requested:

- backend API;
- database;
- auth;
- real telemetry ingestion;
- persistent reviews;
- live AI calls;
- direct Toponymy execution;
- new dependencies;
- deployment complexity.

## Important Folders And Files

Likely repo structure:

```text
app/
  page.tsx
  globals.css
  page.test.ts

components/
  CaseSwitcher.tsx
  ClaimLedger.tsx
  ClaimPanel.tsx
  EvidenceCard.tsx
  EvidenceFilters.tsx
  ReviewActions.tsx
  ScorePanel.tsx
  ...

data/
  sampleCases.ts

lib/
  types.ts
  caseMetrics.ts
  caseMetrics.test.ts
  exportReview.ts
  exportReview.test.ts

docs/
  PRODUCT_VISION.md
  PROJECT_CONTEXT.md
  ROADMAP.md
  GITHUB_PLANNING.md
  ARCHITECTURE.md
  DATA_MODEL.md
  DESIGN_SYSTEM.md
  PROJECT_CONTEXT.md
  PRODUCT_DECISIONS.md
  AGENT_WORKFLOWS.md
  DEVELOPMENT_WORKFLOW.md
  COMMIT_GUIDELINES.md
  TOPONYMY_NOTES.md
  CHANGELOG_AI.md
```

## Canonical Data Rule

`evidenceRelations` is the canonical source of truth for claim-to-evidence links.

Do not create a second parallel link mechanism.

Every evidence relationship should be explainable as:

```text
claimId
evidenceId
polarity: supports / contradicts / neutral
strength: strong / moderate / weak
explanation
```

## Core Domain Objects

Expected conceptual objects:

```text
CaseFile
Cluster
TopicLabel
Claim
EvidenceItem
EvidenceRelation
SupportScore
BlindInterpretationOption
CandidateLabel
RepresentativeSession
EvidenceArenaReview
AnalystVerdict
```

## Evidence Arena Workflow State

The current workflow uses structured local state for:

- selected case;
- blind choice;
- AI label reveal;
- evidence ratings;
- label duel winner and reasons;
- impostor/outlier session;
- failure modes;
- final verdict;
- JSON preview/export visibility.

## Test Strategy

Keep testing lightweight:

- helper/unit tests for data model behavior;
- smoke tests for core Evidence Arena language;
- export serialization tests;
- static render tests for shared UI semantics.

Avoid adding large test frameworks unless there is a clear reason.

## Checks

Run for code/config changes:

```bash
npm test
npm run lint
npm run build
```

Browser checks are important for UI/export behavior, especially:

- copy JSON;
- download JSON;
- selected state;
- case switching;
- reveal behavior;
- evidence rating controls;
- console errors.
