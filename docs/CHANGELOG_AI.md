# AI Changelog

Use this file to record AI-assisted changes that affect product context, architecture, workflows, UI behavior, or the evidence model.

## Entry Template

```md
## YYYY-MM-DD: <short title>

- Agent/model:
- Prompt scope:
- Files changed:
- Summary:
- Decisions made:
- Checks run:
- Assumptions:
- Risks/follow-ups:
- Next recommended step:
- Suggested commit message:
```

## 2026-06-11: GitHub Roadmap And Issue Structure

- Agent/model: GPT-5.5
- Prompt scope: Create a durable GitHub execution structure for Telemetry Court with roadmap, milestones, labels, Milestone 1 issues, issue standards, workflow docs, and changelog documentation. Do not implement product features or change runtime behavior.
- Files changed: `README.md`, `docs/ROADMAP.md`, `docs/GITHUB_PLANNING.md`, `docs/AGENT_WORKFLOWS.md`, `docs/DEVELOPMENT_WORKFLOW.md`, and `docs/CHANGELOG_AI.md`.
- GitHub objects created: Required team, type, priority, status, and scope labels; ordered roadmap milestones; seven actionable issues for `Milestone 1 — Polished Static Evidence Review MVP`.
- Summary: Added roadmap documentation, GitHub planning standards, issue title/body rules, milestone discipline, and workflow guidance so future AI-agent work can proceed from small, ordered issues.
- Decisions made: Treat tracks as labels and milestones as ordered deliverables; only create detailed GitHub issues for the active milestone by default; document future milestone work as candidate issues until the active milestone is nearly complete.
- Checks run: `npm test`; `npm run lint`; `npm run build`.
- Assumptions: The repo should continue using docs-first planning, static synthetic sample data, and human-controlled commits; Milestone 1 is the active execution focus.
- Risks/follow-ups: GitHub issue bodies should be kept current if implementation discoveries change scope; future milestones should not be expanded into issue backlogs too early.
- Next recommended step: Start Milestone 1 with `style(tokens): add global Telemetry Court design tokens`.
- Suggested commit message: `docs(github-planning): add roadmap milestones and issue structure`

## 2026-06-11: Repository Context And Agent Workflow Setup

- Agent/model: Codex
- Prompt scope: Create repository context, AI-agent instructions, project documentation, and workflow scaffolding before feature development.
- Files changed: `README.md`, `AGENTS.md`, `CLAUDE.md`, `.gitignore`, `.github/copilot-instructions.md`, `.github/pull_request_template.md`, and `docs/*`.
- Summary: Added durable product identity, Toponymy context, architecture notes, domain model guidance, model routing, PR checklist, and AI workflow rules for Telemetry Court.
- Checks run: `npm run lint`; `npm run build`; local HTTP render check against the existing dev server on port 3000.
- Assumptions: The existing Next.js prototype remains the active stack; no UI or dependency changes were requested.
- Risks/follow-ups: Future feature work should reconcile existing `lib/types.ts` with the canonical MVP model in `docs/DATA_MODEL.md` incrementally.

## 2026-06-11: Runtime Data Model Alignment

- Agent/model: Codex
- Prompt scope: Align the actual TypeScript model and synthetic sample data with the documented MVP `CaseFile` model.
- Files changed: `lib/types.ts`, `data/sampleCases.ts`, `app/page.tsx`, `components/CaseSwitcher.tsx`, `components/ClaimPanel.tsx`, `components/ClaimLedger.tsx`, `components/ClusterPanel.tsx`, `components/CourtRecord.tsx`, `components/EvidenceCard.tsx`, `components/EvidenceFilters.tsx`, `components/InterpretationRisks.tsx`, `components/ReviewActions.tsx`, and `components/ScorePanel.tsx`.
- Decisions made: Made `CaseFile` the runtime model; replaced legacy grouped validation claims with flat `claims`, `evidenceItems`, `evidenceRelations`, `supportScores`, and `analystVerdict`; kept sample data synthetic and static; represented missing support with empty support-score evidence IDs and explicit unsupported/insufficient-evidence rationales.
- Checks run: `npm run lint`; `npm run build`.
- Assumptions: Existing UI panels should stay in place and read from the new model rather than be redesigned.
- Risks/follow-ups: Consider extracting shared case-status and support-score helpers if additional screens need the same derived metrics.

## 2026-06-11: Shared Case Metrics Helpers

- Agent/model: Codex
- Prompt scope: Extract duplicated derived status, support-score display, and evidence-polarity logic into a small shared helper module for the MVP `CaseFile` model.
- Files changed: `lib/caseMetrics.ts`, `app/page.tsx`, `components/CaseSwitcher.tsx`, `components/ClaimLedger.tsx`, `components/CourtRecord.tsx`, `components/EvidenceCard.tsx`, `components/ScorePanel.tsx`, and `docs/CHANGELOG_AI.md`.
- Decisions made: Centralized case status precedence in `lib/caseMetrics.ts`; standardized average support as a safe claim-level average with shared percentage formatting; reused the same evidence-polarity derivation in the evidence workspace and cards; treated `insufficient_evidence` as its own overall case status instead of collapsing it into `weakly_supported`.
- Checks run: `npm run lint`; `npm run build`.
- Assumptions: `supportScores.value` is the preferred source for claim scoring when present, with `claim.supportScore` used as a safe fallback for malformed or missing score entries.
- Risks/follow-ups: Evidence chips in `ClaimLedger` still read linked IDs from `supportScores.evidenceIds`, while evidence workspace filtering now derives linked evidence from `evidenceRelations`; if those fields can drift in future data, consider centralizing claim-to-evidence IDs in one helper as well.
- Next recommended step: Add focused unit tests for `lib/caseMetrics.ts` covering empty cases, invalid scores, and mixed-status precedence.

## 2026-06-11: Focused Case Metrics Unit Tests

- Agent/model: Codex
- Prompt scope: Add focused unit tests for `lib/caseMetrics.ts` covering safe empty-case behavior, score formatting and fallback, status precedence, evidence polarity, and lookup helpers.
- Files changed: `package.json`, `package-lock.json`, `lib/caseMetrics.test.ts`, and `docs/CHANGELOG_AI.md`.
- Decisions made: Used Node's built-in test runner with a single `tsx` dev dependency so the repo can run TypeScript unit tests without introducing a larger framework; kept fixtures local to the test file except where existing sample cases improved domain realism for lookup coverage; left `lib/caseMetrics.ts` unchanged because the current helper surface was already testable.
- Checks run: `npm test`; `npm run lint`; `npm run build`.
- Assumptions: The current helper behavior for invalid or missing scores should remain `null` at lookup time and `"0%"` at formatting time; returning `"supported"` for a case with no claims is an acceptable empty-state default for now.
- Risks/follow-ups: If the repo later adopts a broader test framework such as Vitest or Jest, these Node tests may be worth folding into that runner to keep tooling unified; empty-case status semantics may deserve a product decision if the UI eventually distinguishes "no claims yet" from "supported".
- Next recommended step: Add a small second unit test file for any future helper that maps claim-to-evidence links so score-linked evidence IDs and relation-linked evidence IDs cannot drift silently.

## 2026-06-11: Canonical Claim-Evidence Linking

- Agent/model: Codex
- Prompt scope: Remove ambiguity between `supportScores.evidenceIds` and `evidenceRelations` so claim-to-evidence linking flows through one shared source of truth.
- Files changed: `lib/types.ts`, `lib/caseMetrics.ts`, `lib/caseMetrics.test.ts`, `data/sampleCases.ts`, `components/ClaimLedger.tsx`, `app/page.tsx`, `docs/DATA_MODEL.md`, `docs/PRODUCT_DECISIONS.md`, and `docs/CHANGELOG_AI.md`.
- Decisions made: Removed `evidenceIds` from `SupportScore`; made `evidenceRelations` the canonical runtime link between claims and evidence; added shared helpers for claim-to-evidence IDs, claim relations, and evidence relations so the ledger and evidence workspace use the same path.
- Checks run: `npm test`; `npm run lint`; `npm run build`.
- Assumptions: Evidence linking should be inspectable through relation records, while support scores should summarize confidence and rationale only; preserving existing UI behavior matters more than reshaping component layouts.
- Risks/follow-ups: If future imported data omits `evidenceRelations`, the UI will now correctly show missing evidence links rather than trying to recover from score metadata; if import tooling is added later, it should validate relation completeness up front.
- Next recommended step: If future scoring logic needs richer traceability, add helper-level tests for relation strength aggregation so score narratives and evidence polarity remain aligned.

## 2026-06-11: Official Design System Documentation

- Agent/model: Codex
- Prompt scope: Create Telemetry Court's official design system documentation from high-trust fintech research and update AI-agent guidance.
- Files changed: `docs/DESIGN_SYSTEM.md`, `docs/DESIGN_REFERENCE_HIGH_TRUST_FINTECH.md`, `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, `docs/PRODUCT_DECISIONS.md`, `README.md`, and `docs/CHANGELOG_AI.md`.
- Decisions made: Established "Evidence first, ornament last" as the core interface principle; defined Telemetry Court-specific visual tokens; documented a legal-safe inspiration boundary that permits structural design inspiration while prohibiting protected brand assets, exact layouts, icons, slogans, screenshots, or proprietary identity.
- Checks run: `npm test`; `npm run lint`; `npm run build`.
- Assumptions: The uploaded Wealthsimple-style research is source material for a concise repo-local design reference, not content to paste verbatim or a directive to reproduce Wealthsimple.
- Risks/follow-ups: Future UI work should migrate existing styles toward the documented tokens incrementally without broad restyling or new dependencies.
- Next recommended step: Audit existing CSS against `docs/DESIGN_SYSTEM.md` and propose a small tokenization-only follow-up before changing component styling.

## 2026-06-11: Development Workflow And Commit Standards

- Agent/model: Codex
- Prompt scope: Improve the project workflow structure before more UI or feature work by adding durable commit standards, PR standards, branch guidance, changelog discipline, and agent handoff rules.
- Files changed: `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, `.github/pull_request_template.md`, `README.md`, `docs/AGENT_WORKFLOWS.md`, `docs/CHANGELOG_AI.md`, `docs/COMMIT_GUIDELINES.md`, `docs/DEVELOPMENT_WORKFLOW.md`, and `.gitmessage`.
- Summary: Added a structured commit-message standard, a reusable Git commit template, a documented narrow-task development workflow, stronger PR requirements, and explicit agent handoff expectations for future AI-assisted work.
- Decisions made: Treat commit history as part of the repo's agent-memory system; require structured final summaries and structured suggested commits for non-trivial AI work; keep changelog entries and commit messages aligned on scope and terminology; leave git history untouched unless a human explicitly asks otherwise.
- Checks run: `npm test`; `npm run lint`; `npm run build`.
- Assumptions: Documentation-only workflow standards are the right next step before additional UI or feature work; the current repo should keep human-controlled commits and PR merges rather than letting agents commit by default.
- Risks/follow-ups: Historical weak commit messages remain in history; the new standards only improve future work unless a human later chooses to clean up unpublished local commits.
- Next recommended step: Start the next narrow task on a focused branch and use the new structured summary plus suggested commit format end to end.
- Suggested commit message: Optional. Suggested message for this change: `docs(agent-workflow): add development workflow and commit standards`
