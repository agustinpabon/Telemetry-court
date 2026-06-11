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

## 2026-06-11: App Shell Surface Alignment

- Agent/model: Codex
- Prompt scope: Implement `style(app-shell): align app canvas and panel surfaces` as a styling-only pass using the existing `--tc-*` token foundation. Preserve behavior, avoid new dependencies, charts, product features, or broad redesign.
- Files changed: `app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `components/CaseSwitcher.tsx`, `components/ClaimPanel.tsx`, `components/ClaimLedger.tsx`, `components/ClusterPanel.tsx`, `components/CourtRecord.tsx`, `components/EvidenceCard.tsx`, `components/EvidenceFilters.tsx`, `components/InterpretationRisks.tsx`, `components/ReviewActions.tsx`, `components/ScorePanel.tsx`, and `docs/CHANGELOG_AI.md`.
- Summary: Added shared token-backed shell/surface classes for the off-white app canvas, major panels, inset panels, selected cards, hover states, and pills. Updated the app shell, case queue, generated interpretation, verdict rail, claim ledger, evidence workspace, evidence cards, review controls, risk panel, and cluster substrate to use warm muted Telemetry Court surfaces, restrained borders, quieter shadows, and direct `--tc-*` tokens. Corrected visual status mappings so contradicted and insufficient-evidence states use their distinct semantic tokens.
- Decisions made: Kept the existing component structure and review behavior intact; reduced hero and generated-label visual dominance so evidence and review surfaces remain primary; retained compatibility `--color-*` aliases in `app/globals.css` while moving rendered components to `--tc-*` tokens.
- Checks run: `npm test`; `npm run lint`; `npm run build`; attempted in-app Browser smoke check against local dev server but navigation to localhost/127.0.0.1 was blocked by the browser client with `ERR_BLOCKED_BY_CLIENT`; confirmed local HTTP render with `curl http://localhost:3000`.
- Assumptions: This issue should align the shell and major surfaces only; detailed claim-row and evidence-card hierarchy can continue in their dedicated follow-up issues.
- Risks/follow-ups: Some component-level duplication remains in status maps and card markup; a future cleanup could centralize shared status presentation after the focused styling issues land.
- Next recommended step: Continue Milestone 1 with the dedicated claim-ledger/evidence-card hierarchy issues.
- Suggested commit message: `style(app-shell): align app canvas and panel surfaces`

## 2026-06-11: Global Telemetry Court Design Tokens

- Agent/model: Codex
- Prompt scope: Implement Issue #1, `style(tokens): add global Telemetry Court design tokens`, as a narrow tokenization and global-base-style pass without component redesign, behavior changes, new dependencies, or package changes.
- Files changed: `app/globals.css` and `docs/CHANGELOG_AI.md`.
- Summary: Added canonical `--tc-*` CSS variables for the documented warm ink, off-white canvas, muted surfaces, borders, semantic statuses, focus color, radius, spacing, and type scale. Mapped the existing `--color-*` aliases to the new token foundation so current app shell and card surfaces inherit the calmer palette. Replaced the decorative body gradient with a plain off-white canvas, added accessible `:focus-visible` defaults, and added reduced-motion handling.
- Decisions made: Kept this as a global foundation pass rather than a component redesign; preserved current React layout and behavior; exposed distinct canonical tokens for supported, weakly supported, contradicted, unsupported, and insufficient-evidence states for follow-up component work.
- Checks run: `npm test`; `npm run lint`; `npm run build`.
- Assumptions: Issue #1 should update implementation tokens to match the existing documented design system, not change product/design documentation or restructure components.
- Risks/follow-ups: Some existing component class maps still use older compatibility aliases and can adopt the distinct canonical status tokens in the later claim-ledger and evidence-card styling issues.
- Next recommended step: Continue Milestone 1 with `style(app-shell): align app canvas and panel surfaces` while preserving the evidence-first hierarchy.
- Suggested commit message: `style(tokens): add global Telemetry Court design tokens`

## 2026-06-11: UI And UX Design North Star Documentation

- Agent/model: Codex
- Prompt scope: Update the project's UI/UX direction before Issue #1 so future agents have a clear evidence-first design north star. Add or update documentation only; do not make implementation changes.
- Files changed: `README.md`, `docs/DESIGN_DIRECTION.md`, `docs/DESIGN_SYSTEM.md`, `docs/PRODUCT_DECISIONS.md`, `docs/ROADMAP.md`, and `docs/CHANGELOG_AI.md`.
- Summary: Added a dedicated design-direction document and updated core product docs so Telemetry Court is clearly framed as a calm, premium, evidence-first review product for AI-generated telemetry labels. Documented the north star, design principles, initial visual direction, core UX flow, MVP screen priorities, and explicit warnings against noisy cyber-dashboard drift.
- Decisions made: Established "Make every AI label easy to inspect, challenge, and defend" as the product design north star; made the evidence-review loop explicit as `Cluster -> Proposed label -> Supporting evidence -> Confidence -> Verdict`; reinforced that Wealthsimple-class restraint is inspiration for trust and clarity, not a cloning target.
- Checks run: `npm test`; `npm run lint`; `npm run build`.
- Assumptions: Existing design docs were directionally correct and should be tightened rather than replaced; documentation-only changes are the right precondition before Issue #1 implementation work.
- Risks/follow-ups: Future UI implementation still needs to translate this guidance into actual tokens, layout choices, and component hierarchy without overfitting to any one reference product.
- Next recommended step: Start Issue #1 by aligning global tokens and the app shell to the documented off-white canvas, muted surfaces, warm ink text, and evidence-first hierarchy.
- Suggested commit message: `docs(design): add UI north star and evidence-review direction`

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
