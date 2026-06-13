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

## 2026-06-13: Focused Landscape Galaxy Refinement

- Agent/model: Codex (GPT-5)
- Prompt scope: Improve only the Landscape / Telemetry Galaxy screen so it reads as a premium semantic telemetry space rather than a boxed dashboard chart.
- Files changed: `components/arena/TelemetryGalaxy.tsx`, `components/arena/ClusterNode.tsx`, `components/arena/AppShell.tsx`, `app/globals.css`, and `docs/CHANGELOG_AI.md`.
- Summary: Derived richer ambient session particles from existing synthetic case/session metadata, generated relationship arcs from semantic-map proximity and evidence/agreement/uncertainty similarity, added soft density regions and selected-region focus, reshaped cluster nodes into compact semantic islands with metric glyphs, and tuned explore-mode depth/focus states.
- Decisions made: This is a focused Landscape visual refinement, not a product pivot. No dependencies, real data integrations, workflow changes, schema changes, or Toponymy API assumptions were added.
- Checks run: `git diff --check` passed; `npm test` passed with 22 tests; `npm run lint` passed; `npm run build` passed. Browser verification passed against `next start --port 3010` at 1440x900, 1366x768, 1280x720, and 1024x768 with no horizontal overflow, no detected text-fit issues, all five cluster nodes inside the map field, 82 deterministic session particles, 5 density regions, and 7 relationship arcs. Zoom-equivalent viewport checks passed at 1600x900 and 1024x576, with the short-height check using vertical scroll rather than compressing the map.
- Assumptions: Existing synthetic `mapPosition`, `modelAgreement`, `evidenceStrength`, `uncertainty`, `cluster.size`, and representative-session overlap/outlier values are sufficient for deterministic spatial ambience.
- Risks/follow-ups: The in-app browser did not fire React hover events from synthetic pointer movement, but click/focus and keyboard selection were verified and the node uses mouse, pointer, and focus handlers for real interaction. Future work should keep later workflow stages scoped separately.
- Next recommended step: Continue page-by-page refinement with the next Evidence Arena stage after reviewing the Galaxy in-browser.
- Suggested commit message: `ux(galaxy): refine telemetry landscape visual system`

## 2026-06-13: Cinematic Spatial Interface Pass

- Agent/model: Codex (GPT-5)
- Prompt scope: Refine the immersive Evidence Arena into a more cinematic scientific interface with explicit Explore/Galaxy and Investigation modes, stronger spatial density, stage-specific compositions, and better viewport/zoom tolerance without changing the product direction or data model.
- Files changed: `app/globals.css`, `components/arena/AppShell.tsx`, `components/arena/TelemetryGalaxy.tsx`, `components/arena/SemanticMiniMap.tsx`, `components/arena/CaseFilePanel.tsx`, `components/arena/BlindReadPanel.tsx`, `components/arena/AiRevealPanel.tsx`, `components/arena/EvidenceBoard.tsx`, `components/arena/LabelDuelPanel.tsx`, `components/arena/ImpostorPanel.tsx`, `components/arena/VerdictPanel.tsx`, `docs/DESIGN_DIRECTION.md`, and `docs/CHANGELOG_AI.md`.
- Summary: Added explicit explore/investigation shell modes, made Landscape a frameless galaxy environment with derived ambient session particles, region boundaries, and curved relationship arcs, added a semantic mini-map to investigation stages, introduced cinematic reveal/comparison elements, improved evidence balance and label duel composition, refined impostor and verdict layouts, and reduced reliance on fixed maximum shell widths.
- Decisions made: Added no dependencies; used CSS/SVG/React state only. Decorative session particles are deterministically derived from existing synthetic case metadata and do not introduce real telemetry or new data-model requirements. The structured-choice happy path and JSON export remain intact.
- Checks run: `npm test` passed with 22 tests; `npm run lint` passed; `npm run build` passed. Browser verification passed against `next start --port 3010` at 1440x900, 1366x768, 1280x720, and 1024x768 across Landscape, Case File, Blind Read, AI Reveal, Evidence Board, Label Duel, Impostor, Verdict, and Review Drawer with no console warnings/errors, no horizontal overflow, no detected text clipping, and no flagged accidental empty zones. Zoom-equivalent verification passed for 50%, 80%, 100%, 125%, and 150% based on a 1280x720 browser window.
- Assumptions: Browser zoom was verified through equivalent CSS viewport sizes because the Browser viewport tool controls viewport dimensions rather than native browser zoom state.
- Risks/follow-ups: A final human taste review on the target demo display is still useful; future browser-level regression tests could formalize these viewport/zoom checks if the project adds an E2E runner.
- Next recommended step: Review the cinematic pass visually and decide whether the next increment should add a guided demo script or persist review state.
- Suggested commit message: `ux(arena): refine cinematic spatial interface`

## 2026-06-13: Telemetry Galaxy Visual Excellence Pass

- Agent/model: Codex (GPT-5)
- Prompt scope: Polish the already-rebooted Evidence Arena UI so it feels cleaner, more premium, more spatial, and demo-ready without changing the product direction, workflow, sample data, or review export model.
- Files changed: `app/globals.css`, `components/arena/AppShell.tsx`, `components/arena/ClusterNode.tsx`, `components/arena/ImpostorPanel.tsx`, `components/arena/InvestigationCockpit.tsx`, `components/arena/StageRail.tsx`, `docs/DESIGN_DIRECTION.md`, and `docs/CHANGELOG_AI.md`.
- Summary: Tightened the command-center layout, reduced stage rail and inspector visual weight, converted map nodes into compact spatial islands, simplified the cockpit into a focused inspector, reduced repeated panel surfaces, tuned stage density for shorter desktop viewports, pulled impostor satellites inward, and preserved the structured-choice investigation flow and JSON drawer/export.
- Decisions made: Added no dependencies; kept the polish CSS-first with React component trimming only where the existing UI was duplicating detail or overloading map nodes. Preserved the product concept, synthetic data model, workflow stages, and no-typing happy path.
- Checks run: `npm test` passed with 22 tests; `npm run lint` passed; `npm run build` passed; browser verification passed against a clean `next start --port 3010` server at 1440x900, 1280x720, and 1024x768 across Landscape, Case File, Blind Read, AI Reveal, Evidence Board, Label Duel, Impostor, Verdict, and Review Drawer with no console warnings/errors, no horizontal overflow, and no detected text clipping. Narrow fallback smoke check at 390x844 passed for Landscape, Case File, and Blind Read with no horizontal overflow or detected text clipping.
- Assumptions: Low-height desktop viewports can hide non-critical supporting paragraphs or session previews when necessary, as long as the active structured review action remains visible and the full review JSON remains available.
- Risks/follow-ups: Human visual review on the actual demo display is still valuable because this pass optimizes the known screenshots and required viewport sizes rather than every possible monitor density.
- Next recommended step: Use the polished shell for demo review, then decide whether to add browser-level regression tests in a future task.
- Suggested commit message: `ux(arena): polish galaxy cockpit visual system`

## 2026-06-13: Immersive Telemetry Galaxy UI Reboot

- Agent/model: Codex (GPT-5)
- Prompt scope: Reboot the Evidence Arena UI/UX from a static vertical document into an immersive Telemetry Galaxy and staged investigation cockpit while preserving the current product workflow, sample data, and review export model.
- Files changed: `app/page.tsx`, `app/globals.css`, `components/arena/*`, `lib/arenaReviewState.ts`, `lib/arenaReviewState.test.ts`, `app/page.test.ts`, `README.md`, `docs/PRODUCT_VISION.md`, `docs/DESIGN_DIRECTION.md`, and `docs/CHANGELOG_AI.md`.
- Summary: Replaced the long homepage layout with a full-screen spatial app shell: primary telemetry galaxy, persistent stage rail, investigation cockpit, one active investigation stage at a time, evidence balance meter, label duel, orbit-style impostor selection, verdict receipt, and review JSON drawer/actions.
- Decisions made: Added no dependencies; used React state, TypeScript helpers, CSS transforms, SVG lines, and existing fixture fields for agreement, evidence strength, uncertainty, map position, nearest neighbour, evidence ratings, and export JSON. Kept the Evidence Arena workflow and data model intact.
- Checks run: `npm test` passed with 22 tests; `npm run lint` passed; `npm run build` passed; browser verification passed against a clean `next start --port 3010` server with no console warnings/errors and no horizontal overflow at 1280x720.
- Assumptions: Node-level reducer tests are the right fit for interaction coverage in the current test stack because the repo does not have a browser DOM test framework installed.
- Risks/follow-ups: Final polish may still benefit from human visual review across more viewport sizes; future work could add browser-level interaction tests if the project adopts a DOM or Playwright test runner.
- Next recommended step: Review the local app visually and tune spacing/contrast based on demo feedback.
- Suggested commit message: `ux(arena): introduce immersive telemetry galaxy interface`

## 2026-06-13: Publish Evidence Arena Handoff

- Agent/model: Codex (GPT-5)
- Prompt scope: Prepare the full Evidence Arena pivot branch for GitHub by aligning untracked root agent context docs, running checks, and committing/pushing with structured context.
- Files changed: `MODEL_SELECTION.md`, `PRODUCT_DIRECTION.md`, `PROJECT_CONTEXT.md`, `PROMPTING_GUIDE.md`, `START_HERE_FOR_AGENTS.md`, `TECHNICAL_CONTEXT.md`, and `docs/CHANGELOG_AI.md`.
- Summary: Replaced stale top-level context files that still described the old simple label-validator MVP with Evidence Arena guidance, canonical doc links, structured-choice workflow rules, and current prompt templates.
- Decisions made: Kept the root context files because they are useful handoff surfaces, but made tracked docs such as `docs/PRODUCT_VISION.md`, `docs/PROJECT_CONTEXT.md`, and `docs/ROADMAP.md` the authoritative sources.
- Checks run: `git diff --check` passed; `npm test` passed with 21 tests; `npm run lint` passed; `npm run build` passed.
- Assumptions: The full dirty worktree belongs in the outgoing pivot PR because the user explicitly asked to push everything properly.
- Risks/follow-ups: The PR is intentionally broad because it packages a major product pivot; future work should resume from the smaller Milestone 0 and Milestone 1 issues created during planning alignment.
- Next recommended step: Open a draft PR and use the PR body to orient reviewers and future agents around the Evidence Arena pivot.
- Suggested commit message: `docs(agent-context): align root handoff docs with evidence arena`

## 2026-06-13: Evidence Arena Planning Alignment

- Agent/model: Codex (GPT-5)
- Prompt scope: Align repository planning docs, GitHub milestones, and immediate issues with the Evidence Arena product pivot without implementing new UI features.
- Files changed: `README.md`, `.github/copilot-instructions.md`, `docs/PRODUCT_VISION.md`, `docs/PROJECT_CONTEXT.md`, `docs/ROADMAP.md`, `docs/GITHUB_PLANNING.md`, `docs/AGENT_WORKFLOWS.md`, `docs/DEVELOPMENT_WORKFLOW.md`, and `docs/CHANGELOG_AI.md`.
- GitHub milestones updated: `Milestone 0 — Evidence Arena Pivot Stabilization`, `Milestone 1 — Polished Static Evidence Arena MVP`, `Milestone 2 — Scientific Review Data Model`, `Milestone 3 — Telemetry Map + Case Exploration`, `Milestone 4 — Pipeline Integration Readiness`, and `Milestone 5 — Advanced Evidence Arena`.
- GitHub milestones closed as historical: `Historical — Security, Governance, And v0.1 Release` and `Historical — Review Clarity And Export`.
- GitHub issues created: #17 `docs: remove superseded label-validator framing`; #18 `test: cover evidence arena happy path`; #19 `chore: commit and document evidence arena pivot`; #20 `ux: polish telemetry landscape as primary entry point`; #21 `ux: improve case file investigation hierarchy`; #22 `ux: refine blind investigation and AI reveal flow`; #23 `ux: make evidence classification feel active and clear`; #24 `ux: refine label duel and impostor interactions`; #25 `feat: add review progress and reset/navigation controls`; #26 `a11y: improve keyboard and screen reader support for structured choices`; #27 `schema: formalize structured review export`; #28 `docs: define evaluation meaning of each verdict and failure mode`.
- Summary: Replaced the older roadmap sequence with the six Evidence Arena milestones, documented the current small issue batch, refreshed agent/Copilot guidance, and added the evaluation workflow framing from telemetry clusters to structured review data.
- Decisions made: Created 12 immediate issues rather than a large backlog; kept optional persistence and demo walkthrough ideas out of the live issue batch; preserved old completed issues and closed surplus old milestones as historical containers rather than deleting them.
- Commands run: `git status --short`; `git branch --show-current`; `find . -maxdepth 3 -type f | sort | sed 's#^\./##' | head -200`; targeted `sed`/`rg` inspection of docs, app, data, types, tests, and GitHub planning files; `gh repo view --json nameWithOwner,url`; `gh issue list --limit 100 --state open`; `gh issue list --limit 100 --state closed`; `gh api repos/:owner/:repo/milestones --paginate`; `gh label list --limit 200`; `gh api -X PATCH repos/:owner/:repo/milestones/...` to update/close milestones; `gh issue create` for issues #17-#28; `git diff --check`.
- Checks run: `git diff --check` passed; no code or config changes were made by this planning task, and the repo has no markdown/docs lint script.
- Assumptions: The untracked top-level context docs are imported/staging material and should be reported for manual triage instead of edited as part of this tracked-doc planning pass.
- Risks/follow-ups: Closed historical issues remain attached to renamed milestones where GitHub preserves their history; untracked top-level context docs still contain pre-pivot wording and should either be removed, ignored, or intentionally folded into tracked docs.
- Next recommended step: Work through Milestone 0 issues #17-#19 before starting MVP polish.
- Suggested commit message: `docs(planning): align roadmap with evidence arena pivot`

## 2026-06-13: Evidence Arena Product Pivot

- Agent/model: Codex (GPT-5)
- Prompt scope: Pivot Telemetry Court from a passive label-validation prototype into an interactive Evidence Arena vertical slice with five synthetic cases, structured-choice interactions, and updated documentation.
- Files changed: `app/page.tsx`, `data/sampleCases.ts`, `lib/types.ts`, `lib/exportReview.ts`, `app/page.test.ts`, `lib/caseMetrics.test.ts`, `lib/exportReview.test.ts`, `README.md`, `AGENTS.md`, `CLAUDE.md`, `docs/PRODUCT_VISION.md`, `docs/PROJECT_CONTEXT.md`, `docs/PRODUCT_DECISIONS.md`, `docs/ROADMAP.md`, `docs/DESIGN_DIRECTION.md`, `docs/ARCHITECTURE.md`, `docs/DATA_MODEL.md`, and `docs/CHANGELOG_AI.md`.
- Summary: Rebuilt the homepage as a complete Evidence Arena flow: telemetry landscape, case file, blind investigation, AI label reveal, evidence classification, label duel, impostor selection, structured verdict, and review JSON view/copy/download. Replaced the old two-case sample data with five rich synthetic arena cases covering overclaiming, supported suspicious behavior, impure clusters, too-broad labels, and correct uncertainty.
- Decisions made: Kept the implementation frontend-only and synthetic-data-only; preserved canonical `evidenceRelations` for claim-to-evidence links; made no typing required for the happy path; extended exports with `arenaReview` rather than removing the existing claim/evidence export trail.
- Checks run: `npm test` passed; `npm run lint` passed; `npm run build` passed.
- Assumptions: The first vertical slice can be a single-page app with local React state and synthetic seeded metadata; persistence, import, backend storage, optional notes, and live AI are out of scope for this pivot.
- Risks/follow-ups: The arena page is substantial and may benefit from component extraction after visual review; browser-based responsive verification should be added when polishing the flow; docs outside the required source-of-truth path may still contain historical phrasing and should be reviewed opportunistically.
- Next recommended step: Run lint/build, visually inspect the page locally, then extract page sections into focused components if the slice is accepted.
- Suggested commit message: `feat(arena): pivot to evidence investigation workflow`

## 2026-06-13: Shared Support Status Metadata Helper

- Agent/model: Codex (GPT-5)
- Prompt scope: Extract duplicated support-status labels, semantic styling, and descriptions into one reusable frontend helper while preserving the contradicted/unsupported distinction.
- Files changed: `lib/supportStatusMeta.ts`, `lib/supportStatusMeta.test.ts`, `app/page.tsx`, `components/CaseSwitcher.tsx`, `components/ClaimLedger.tsx`, `components/ScorePanel.tsx`, and `docs/CHANGELOG_AI.md`.
- Summary: Added a shared `supportStatusMeta` source of truth for labels, short labels, chip/badge/text classes, plain-language descriptions, and score-panel notes. Reused it across the review page, case switcher, claim ledger, and score panel.
- Decisions made: Kept evidence polarity styling in `EvidenceCard` separate because it represents evidence relation polarity rather than support status; kept the change frontend-only with no new dependencies.
- Checks run: `npm test` passed; `npm run lint` passed; `npm run build` passed.
- Assumptions: The concise support-status descriptions from the current review page are the canonical plain-language explanations across the shared review UI.
- Risks/follow-ups: Some legacy components still have their own non-status copy and layout choices; this change only centralizes support-status semantics.
- Next recommended step: Visually confirm status labels remain calm and distinct in the review UI.
- Suggested commit message: `refactor(status): centralize support status metadata`

## 2026-06-13: Distinct Contradicted Support Styling

- Agent/model: Codex (GPT-5)
- Prompt scope: Fix inconsistent shared review UI semantics so `contradicted` and `unsupported` are visually distinct without broad redesign or unrelated refactors.
- Files changed: `components/CaseSwitcher.tsx`, `components/ClaimLedger.tsx`, `components/EvidenceCard.tsx`, `components/ScorePanel.tsx`, `app/page.test.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Updated shared status and evidence polarity styling so contradicted states use the dedicated `--color-contradicted*` tokens, while unsupported states continue to use `--color-unsupported*` tokens.
- Decisions made: Kept the existing calm semantic palette and component structure; added a lightweight static render regression test over shared review UI surfaces rather than introducing new test tooling.
- Checks run: `npm test` passed; `npm run lint` passed; `npm run build` passed.
- Assumptions: The documented contradicted token is the intended visual treatment for both contradicted support status and contradicting evidence polarity.
- Risks/follow-ups: Status metadata is still duplicated across page-level and shared components, so a future small extraction could reduce drift if these surfaces become active together again.
- Next recommended step: Visually review the affected status pills in the review UI.
- Suggested commit message: `fix(status): distinguish contradicted support styling`

## 2026-06-12: Static Review Result Export

- Agent/model: Codex (GPT-5)
- Prompt scope: Implement issue #12 by adding a small frontend-only JSON export path for the currently selected static review result and opening a draft PR.
- Files changed: `app/page.tsx`, `app/page.test.ts`, `lib/exportReview.ts`, `lib/exportReview.test.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Added Copy JSON and Download JSON actions to the review panel. The export includes the selected case ID, cluster, topic label, generated explanation, claims, evidence items, canonical `evidenceRelations`, support scores, analyst verdict, and export timestamp.
- Decisions made: Kept export static/frontend-only; used `evidenceRelations` as the only claim-to-evidence link; included local analyst verdict selections by replacing the exported verdict with the in-session decision and timestamp; avoided backend storage, persistence, Markdown export, new dependencies, and evidence invention.
- Checks run: `npm test` passed; `npm run lint` passed; `npm run build` passed; browser verification was attempted but blocked by the in-app Browser URL policy before localhost loaded.
- Assumptions: JSON is the most reliable MVP export format because it preserves the case model and evidence trail without inventing a human-readable report structure.
- Risks/follow-ups: Exported local verdicts are not persisted after refresh; future backend storage, signed audit trails, or Markdown summaries remain out of scope.
- Next recommended step: Have a reviewer inspect the draft PR and decide whether a future issue should add Markdown export for readable handoffs.
- Suggested commit message: `feat(export): add static review result export`

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
- Files changed: `AGENTS.md`, `docs/AGENT_WORKFLOWS.md`, `docs/TOPONYMY_NOTES.md`, and `docs/CHANGELOG_AI.md`.
- Summary: Tightened the repo's Toponymy guardrails by making the official GitHub repository the only factual source, removing the explicit DeepWiki link from Toponymy notes, and adding a reusable agent workflow rule that says unverified Toponymy details must be omitted or marked unknown.
- Decisions made: Kept the change documentation-only; treated official GitHub repo files and README sections as the only authoritative basis for Toponymy facts; preserved Telemetry Court's stance that Toponymy is conceptual upstream inspiration rather than a current implementation dependency.
- Checks run: `npm test` passed; `npm run lint` passed; `npm run build` passed.
- Assumptions: Existing Toponymy references elsewhere in the repo are conceptual unless they are explicitly tied to official upstream repo material.
- Risks/follow-ups: If future docs add concrete Toponymy capabilities or examples, they should cite the exact upstream repo file or section they rely on; contributors may still need review reminders if they reference non-authoritative summaries outside these docs.
- Next recommended step: If the team later wants richer Toponymy planning notes, add them only with file-level citations back to the official upstream repository.
- Suggested commit message: `docs(toponymy): enforce official source-of-truth rule`

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
