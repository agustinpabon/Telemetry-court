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

## 2026-06-12: Evidence-First Review Screen Redesign

- Agent/model: Codex (GPT-5)
- Prompt scope: Complete issue #10 by substantially redesigning the static review screen so a first-time viewer can understand the AI claim, linked evidence, support score, and analyst verdict in about 10 seconds.
- Files changed: `app/page.tsx`, `app/globals.css`, `app/page.test.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Rebuilt the home page around a focused product frame, compact case selector, primary review summary, four-part quick read, claim ledger, linked-evidence area, full evidence record, and prominent analyst verdict column. Review follow-up fixed the hero question to use an intentional two-line structure so it does not clip at mobile-ish widths.
- Decisions made: Defaulted each selected case to its first claim so the evidence review has an immediate focal point; kept all claim-to-evidence linkage derived from `evidenceRelations` through `lib/caseMetrics.ts`; kept unlinked evidence visible in the full record while highlighting linked evidence; avoided new dependencies, backend behavior, real telemetry, or product-scope expansion.
- Checks run: `npm test` passed; `npm run lint` passed; `npm run build` passed.
- Assumptions: A static default claim focus is appropriate for the MVP because it makes the review path legible immediately without introducing routing, persistence, or extra state complexity.
- Risks/follow-ups: The redesign is still static and does not include browser-level regression tests; future responsive polish may be useful after human review of the draft PR.
- Next recommended step: Review the draft PR visually and decide whether future issues should extract the new page-level helper components into reusable component files.
- Suggested commit message: `ux(review-screen): clarify evidence-first review flow`

## 2026-06-12: Toponymy Source-Of-Truth Guardrails

- Agent/model: Codex
- Prompt scope: Complete issue #11 by making repository docs explicit that factual Toponymy information must come from the official `TutteInstitute/toponymy` GitHub repository, while keeping Toponymy integration out of scope for the MVP.
- Files changed: `AGENTS.md`, `README.md`, `docs/PROJECT_CONTEXT.md`, `docs/TOPONYMY_NOTES.md`, and `docs/CHANGELOG_AI.md`.
- Summary: Reworked the Toponymy notes into a source-of-truth policy, added an explicit non-invention rule for agents, and tightened repository-facing Toponymy language so DeepWiki and other generated summaries are treated only as non-authoritative navigation aids.
- Decisions made: Used the official Toponymy GitHub repository as the only authoritative source named in repo docs; kept the change documentation-only; reinforced that Telemetry Court remains a static downstream validation UI with no current Toponymy integration.
- Checks run: `npm test`; `npm run lint`; `npm run build`.
- Assumptions: Existing Toponymy references elsewhere in the repo are conceptual unless they are explicitly tied to official upstream repo material.
- Risks/follow-ups: If future docs add concrete Toponymy capabilities or examples, they should cite the exact upstream repo file or section they rely on.
- Next recommended step: If the team later wants richer Toponymy planning notes, add them only with file-level citations back to the official upstream repository.
- Suggested commit message: `docs(toponymy): enforce official repo as source of truth`

## 2026-06-12: Core Review Flow Smoke Coverage

- Agent/model: Codex
- Prompt scope: Implement issue #7 by adding lightweight smoke coverage for the static core case review flow without changing app behavior or adding a larger test framework.
- Files changed: `app/page.test.ts` and `docs/CHANGELOG_AI.md`.
- Summary: Added Node test coverage that statically renders the home page and confirms the MVP still exposes Telemetry Court, generated interpretation, claim ledger, evidence workspace, source-of-truth record, support score or verdict language, and a sample claim-to-evidence relationship.
- Decisions made: Reused the existing Node built-in test runner with `tsx` and `react-dom/server`; kept coverage smoke-level rather than introducing Playwright, Cypress, Vitest, or Jest.
- Checks run: `npm test`; `npm run lint`; `npm run build`.
- Assumptions: Static render output is sufficient for this issue because the requested guard is about the current MVP concepts remaining present, not browser interactions.
- Risks/follow-ups: This is lightweight smoke coverage, not full browser or end-to-end coverage; a later UI milestone may add richer render or interaction tests if the app gains more behavior.
- Next recommended step: Keep future UI changes passing this smoke test, and add interaction-level coverage only when user behavior becomes complex enough to justify it.
- Suggested commit message: `test(render): add core review flow smoke coverage`

## 2026-06-12: Global Design Token Reconciliation

- Agent/model: Codex
- Prompt scope: Finish Milestone 1 issue #1 by reconciling documented `--tc-*` design tokens with existing component-facing `--color-*` variables, adding explicit focus-visible styles, and adding reduced-motion handling without component rewrites or behavior changes.
- Files changed: `app/globals.css` and `docs/CHANGELOG_AI.md`.
- Summary: Added canonical Telemetry Court `--tc-*` tokens from the design system, mapped the existing global `--color-*` aliases to those tokens so current components continue to work, and added global accessibility defaults for keyboard focus and reduced motion.
- Decisions made: Preserved existing component class names and runtime behavior by aliasing current variables instead of rewriting React components; kept `--color-unsupported` aligned to the canonical unsupported token and added explicit contradicted aliases for future gradual migration; kept the visual direction calm and evidence-first with muted semantic colors.
- Checks run: `npm test`; `npm run lint`; `npm run build`.
- Assumptions: Existing `--color-*` variables are still the practical component API for this small issue; future styling work can migrate component usage gradually only when it improves clarity.
- Risks/follow-ups: The app still uses the current font setup; this issue intentionally did not address font changes because they were out of scope.
- Next recommended step: Close or update issue #1 after checks pass, then proceed to lightweight render/smoke coverage for the core case review flow.
- Suggested commit message: `style(tokens): reconcile global design tokens`

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
