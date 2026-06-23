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

## 2026-06-23: Sanitized Adapter Input Contract

- Agent/model: Codex (GPT-5)
- Prompt scope: Implement GitHub issue #156 as a documentation-only slice for
  the sanitized upstream adapter input consumed by the existing mapper and CLI.
- Files changed: `docs/SANITIZED_ADAPTER_INPUT_CONTRACT.md`,
  `docs/CASE_PACKAGE_CONTRACT.md`, and `docs/CHANGELOG_AI.md`.
- Summary: Added a dedicated contract page explaining that the sanitized
  adapter draft is a pre-CasePackage object, documenting the notebook/script
  boundary, exact top-level draft fields, mapper-derived fields, CLI usage,
  validation failure expectations, and prohibited use.
- Decisions made: Kept the change documentation-only; added no runtime app or
  UI behavior, scripts, fixtures, fake CasePackages, fake ReviewResults, fake
  EvaluationReports, fake topology coordinates, pilot data, reviewers, raw
  telemetry examples, or upstream processing execution.
- Checks run: `git status --short` verified only the intended docs changes
  plus pre-existing forbidden untracked paths; `git diff --check` passed;
  `git diff --cached --check` passed; ECC pre-push verification ran
  `npm run lint`, `npm test` (245 tests passed), and `npm run build`
  successfully.
- Assumptions: The existing TypeScript mapper and CLI remain the implemented
  boundary; upstream notebooks/scripts are responsible for approval,
  sanitization, and safe handoff before invoking the CLI.
- Risks/follow-ups: Documentation cannot prove that an upstream producer is
  correctly sanitized; future notebook work still needs approved source
  artifacts and validation without raw telemetry crossing into Telemetry Court.
- Next recommended step: Use this contract as the notebook-author handoff for
  the next Milestone 4 adapter prototype slice.
- Suggested commit message: `docs: document sanitized adapter input contract`

## 2026-06-23: Sanitized CasePackage Adapter CLI

- Agent/model: Antigravity (Gemini 3.5 Flash)
- Prompt scope: Implement GitHub issue #152 to add a fixture-free local CLI wrapper around the sanitized CasePackage adapter mapper.
- Files changed: `scripts/sanitized-case-package-adapter-v01.ts`, `scripts/sanitized-case-package-adapter-v01.test.ts`, `package.json`, and `docs/CHANGELOG_AI.md`.
- Summary: Created a local TypeScript CLI wrapper (`scripts/sanitized-case-package-adapter-v01.ts`) that reads a sanitized adapter draft JSON file, maps it to a `CasePackageV01`, validates the mapped package using `validateCasePackageV01`, and writes the output JSON either to a file specified by `--out` or prints it directly to `stdout`. Added full unit tests (`scripts/sanitized-case-package-adapter-v01.test.ts`) verifying input file immutability, exit codes/failures on invalid JSON, validation failures, missing files, and incorrect CLI usage. Registered the CLI script as `"sanitized-case-package-adapter-v01": "tsx scripts/sanitized-case-package-adapter-v01.ts"` under `"scripts"` in `package.json`.
- Decisions made: Followed the repository's existing script/CLI pattern to pass options (`argv`, `cwd`, custom read/write/stdout/stderr functions) for full in-memory and OS-level testing. Avoided executing clustering components (Toponymy, DataMapPlot, UMAP, HDBSCAN, ACME4), importing raw telemetry, creating public fixtures, modifying runtime UI, or introducing database/backend behavior.
- Checks run: `git diff main...HEAD --check` passed; focused test execution `node --test --import tsx scripts/sanitized-case-package-adapter-v01.test.ts` passed (8 tests); focused test execution `node --test --import tsx lib/sanitizedCasePackageAdapterV01.test.ts` passed (6 tests); complete test suite `npm test` passed (245 tests); typecheck `npx tsc --noEmit` passed; linter `npm run lint` passed; production build `npm run build` passed; `git status --short` verified.
- Assumptions: The CLI input file is already approved and sanitized, containing necessary redaction notes and governance approval references.
- Risks/follow-ups: Integrators must ensure the generated `CasePackageV01` output is successfully processed by the Telemetry Court review workflow.
- Next recommended step: Review the CLI integration and verify output generation with a sanitized upstream producer.
- Suggested commit message: `feat: add sanitized CasePackage adapter CLI`

## 2026-06-23: Sanitized CasePackage Adapter Mapper

- Agent/model: Codex (GPT-5)
- Prompt scope: Implement GitHub issue #150 as the first minimal Milestone 4
  implementation slice: a fixture-free, schema-validated, sanitized
  CasePackage producer mapping helper.
- Files changed: `lib/sanitizedCasePackageAdapterV01.ts`,
  `lib/sanitizedCasePackageAdapterV01.test.ts`, and
  `docs/CHANGELOG_AI.md`.
- Summary: Added a pure TypeScript mapper from an already-approved,
  already-sanitized upstream cluster draft into `CasePackageV01`, with narrow
  preflight errors for missing non-synthetic review approval, missing linked
  claim evidence, missing embedding-map coordinates, and invalid sanitization
  status. Focused inline tests prove the mapped package validates through the
  existing `validateCasePackageV01` runtime validator and keep
  outlier/impostor candidates separate from representative sessions.
- Decisions made: Kept this as a contract-layer mapping seam only. Added no
  runtime app behavior, UI changes, scripts, fixtures, public CasePackages,
  fake pilot data, raw telemetry ingestion, backend/auth/database work,
  Toponymy/DataMapPlot/UMAP/HDBSCAN/ACME4 execution, clustering engine, or
  clustering pipeline execution.
- Checks run: `git diff --check` passed; focused
  `node --test --import tsx lib/sanitizedCasePackageAdapterV01.test.ts` passed
  with 6 tests; `npm test` passed with 237 tests; `npx tsc --noEmit`
  passed; `npm run lint` passed; `npm run build` passed.
- Assumptions: Upstream producers have already completed sanitization,
  approval, projection, clustering, naming, and evidence summarization before
  calling this helper.
- Risks/follow-ups: This helper does not prove real Toponymy, DataMapPlot,
  ACME4, or pilot compatibility; future work still needs approved upstream
  producer usage and package import/review validation.
- Next recommended step: Use the mapper only from an approved upstream
  producer boundary after sanitized draft contracts are accepted.
- Suggested commit message: `feat: add sanitized CasePackage adapter mapper`

## 2026-06-23: Milestone 4 Sanitized Adapter Prototype Plan

- Agent/model: Codex (GPT-5)
- Prompt scope: Implement GitHub issue #148 as a docs-only planning slice for
  the sanitized adapter prototype workflow before any executable adapter work.
- Files changed:
  `docs/MILESTONE_4_ADAPTER_PROTOTYPE_PLAN.md`,
  `docs/MILESTONE_4_ADAPTER_BOUNDARY.md`, `docs/ROADMAP.md`, and
  `docs/CHANGELOG_AI.md`.
- Summary: Added a dedicated Milestone 4 prototype plan covering the sanitized
  upstream-to-CasePackage flow, producer readiness checklist, schema-accurate
  `CasePackageV01` mapping checklist, rejection/failure cases, and
  `cluster_refinement.v0.1` consumer checklist for upstream notebooks.
- Decisions made: Kept the change documentation-only and linked it from the
  existing adapter boundary and roadmap instead of adding scripts, fixtures,
  public CasePackages, runtime behavior, UI changes, fake pilot data, raw
  telemetry ingestion, backend/auth/database work, or clustering execution.
- Checks run: `git diff --check` passed; `npm test` passed with 231 tests;
  `npx tsc --noEmit` passed; `npm run lint` passed; `npm run build` passed.
- Assumptions: Milestone 4 should complete this planning handoff before an
  approved sanitized adapter implementation is attempted.
- Risks/follow-ups: The eventual adapter still needs an approved upstream
  environment, real sanitization/provenance review, and package validation with
  no raw telemetry crossing into Telemetry Court.
- Next recommended step: Review the docs plan, then open a separate scoped
  implementation issue only after the package producer and approval workflow
  are accepted.
- Suggested commit message: `docs: plan milestone 4 sanitized adapter prototype`

## 2026-06-23: Define Milestone 4 Adapter Boundary Spec

- Agent/model: Antigravity (Gemini 3.5 Flash)
- Prompt scope: Implement GitHub issue #146 by defining the adapter boundary and loop refinement specs for Milestone 4, linking upstream pipeline concepts to CasePackageV01, and setting expectations for refinement consumer workflows.
- Files changed: `docs/MILESTONE_4_ADAPTER_BOUNDARY.md`, `docs/ROADMAP.md`, `docs/ARCHITECTURE.md`, and `docs/CHANGELOG_AI.md`.
- Summary: Documented the division of ownership between upstream clustering/naming pipelines and Telemetry Court, mapped upstream cluster metrics/positions to CasePackageV01, documented Pandas/Python consumer expectations for processing refinement JSON, specified provenance/sanitization guidelines, and updated the project roadmap and architecture milestones.
- Decisions made: Created a dedicated spec document (`docs/MILESTONE_4_ADAPTER_BOUNDARY.md`) rather than changing runtime code, UI components, or test fixtures. Ensured that zero raw telemetry crosses the boundary.
- Checks run: Full validation check suite: `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`, and `git diff --check`.
- Assumptions: Milestone 3 is complete and its local utility gate functionality forms the basis of the refinement feedback loop.
- Risks/follow-ups: Upstream Python notebooks must strictly implement the refinement schema parsing to utilize session exclusions, split, and merge recommendations.
- Next recommended step: Review and merge the adapter boundary spec, then open a focused follow-up issue for a docs-first adapter prototype plan.
- Suggested commit message: `docs: define milestone 4 adapter boundary`

## 2026-06-23: Milestone 3 Import-To-Refinement Smoke

- Agent/model: Codex (GPT-5)
- Prompt scope: Add narrow helper-level smoke coverage proving the completed
  local Milestone 3 loop connects validated CasePackage-shaped input,
  compatible ReviewResult bundle import, local EvaluationReport aggregation,
  results galaxy map coordinates, and validated `cluster_refinement.v0.1`
  export availability.
- Files changed: `lib/milestone3RefinementLoop.test.ts` and
  `docs/CHANGELOG_AI.md`.
- Summary: Added inline synthetic test objects that validate package metadata,
  import compatible review results through the local bundle boundary, aggregate
  them into an EvaluationReport, derive a visible results map node from package
  coordinates, and build a validated cluster refinement artifact. The smoke
  also checks that session pruning only includes a selected session when that
  same review carries a qualifying cluster-quality signal, and that missing or
  incompatible package/result references stay unavailable or rejected.
- Decisions made: Kept the test at pure helper level and did not add fixtures,
  public demo data, pilot data, UI automation, backend persistence, raw
  telemetry ingestion, AI assistance, adapter execution, or clustering
  pipeline execution.
- Checks run: Focused smoke test passed with 2 tests.
- Assumptions: Existing helper contracts are the correct integration boundary
  for this smoke; existing EvaluationReport JSON/CSV export coverage remains
  part of the full test suite.
- Risks/follow-ups: This is deterministic local coverage only. It does not
  replace future realistic package pilots or upstream notebook consumers.
- Next recommended step: Run the full required validation suite before opening
  the draft PR.
- Suggested commit message: `test(results): add milestone 3 refinement smoke`

## 2026-06-23: Pruning Recipe Export

- Agent/model: Codex (GPT-5)
- Prompt scope: Implement GitHub issue #140 by adding a validated
  `cluster_refinement.v0.1` local JSON export derived from compatible human
  ReviewResults and EvaluationReport aggregation context.
- Files changed: `app/investigation-workflow.css`,
  `components/evaluation/EvaluationReportExportActions.tsx`,
  `components/evaluation/EvaluationReportResults.tsx`,
  `components/evaluation/LocalEvaluationResults.tsx`,
  `docs/EVALUATION_INFRASTRUCTURE.md`, `lib/clusterRefinementV01.ts`,
  `lib/clusterRefinementTypesV01.ts`,
  `lib/clusterRefinementValidationV01.ts`,
  `lib/clusterRefinementValidationHelpersV01.ts`,
  `lib/localEvaluationResultsV01.ts`, and focused tests.
- Summary: Added a pure cluster-refinement builder, validation result, JSON
  serializer, deterministic filename, and results-page download button beside
  the existing EvaluationReport JSON/CSV exports. Local results groups now
  retain the exact compatible source ReviewResults needed to derive session
  exclusions, split recommendations, merge recommendations, uncertainty, and
  disagreement.
- Decisions made: Implemented the approved `cluster_refinement.v0.1` /
  `cluster_refinement_calculation.v0.1` contract without redesign. Pruning is
  derived only from a human-selected outlier/impostor session plus a qualifying
  human cluster-quality signal. Merge targets remain explicitly unavailable
  because `ReviewResultV01` does not capture a reviewer-selected neighbor
  target.
- Checks run: Focused refinement/results tests passed; `npm test` passed with
  229 tests; `npx tsc --noEmit` passed; `npm run lint` passed; `npm run build`
  passed; `git diff --check` passed.
- Assumptions: Compatible source ReviewResults are available in the local
  results snapshot for reports built from browser-local or imported results.
  Single-review recipes are useful but cannot establish disagreement or
  consensus.
- Risks/follow-ups: The artifact is a local upstream recipe, not a clustering
  engine. Downstream notebooks/scripts still need to decide how strictly to use
  `selected_count`, `supporting_review_count`, uncertainty, and disagreement.
- Next recommended step: Validate the recipe shape against an upstream notebook
  consumer when a realistic sanitized CasePackage review set exists.
- Suggested commit message: `feat(results): export cluster refinement recipe`

## 2026-06-23: Results Topology Galaxy Map

- Agent/model: Codex (GPT-5)
- Prompt scope: Implement issue #139 by rendering a `/results` topology map
  from compatible local or imported `CasePackage` coordinates and aggregated
  human review status, without changing review/result/report schemas or adding
  refinement export behavior.
- Files changed: `app/investigation-workflow.css`,
  `components/arena/ClusterNode.tsx`,
  `components/arena/EvidenceGalaxyAtlas.tsx`,
  `components/evaluation/LocalEvaluationResults.tsx`,
  `components/evaluation/LocalEvaluationResults.test.ts`,
  `components/evaluation/ResultsGalaxyMap.tsx`,
  `lib/resultsGalaxyMapV01.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Added a results-specific adapter and UI surface that reuses the
  existing galaxy atlas to render verdict-colored nodes only when an aggregated
  result can be matched to compatible `CasePackage` map coordinates. Missing
  coordinates, absent packages, incompatible references, and unsupported
  coordinate ranges now produce explicit unavailable states instead of fake
  positions.
- Decisions made: Kept `CasePackage`, `ReviewResult`, `ReviewResultBundle`,
  and `EvaluationReport` semantics unchanged. The map consumes imported/local
  package coordinates and local aggregation output only; it does not execute
  Toponymy, DataMapPlot, UMAP, HDBSCAN, ACME4, or raw telemetry ingestion.
- Checks run: Focused local-results map tests passed; full validation covered
  `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`,
  `git diff --check`, and browser smoke checks on `/results`.
- Assumptions: The compact package reference is the compatibility boundary
  between an aggregated report group and the package coordinates used for the
  map.
- Risks/follow-ups: Imported map coverage depends on users supplying the
  matching `CasePackage` JSON alongside compatible `ReviewResult` artifacts.
  `cluster_refinement.json` export remains a later milestone.
- Next recommended step: Implement the separate refinement export design only
  when issue #140 is explicitly in scope.
- Suggested commit message: `feat(results): add topology galaxy map`

## 2026-06-23: Imported ReviewResult Inspection Summary

- Agent/model: Codex (GPT-5)
- Prompt scope: Add the symmetric UI inspection step for imported
  `ReviewResult` / `ReviewResultBundle` JSON, mirroring the imported
  `CasePackage` summary while preserving strict local validation and
  aggregation boundaries.
- Files changed: `app/investigation-workflow.css`, `app/page.test.ts`,
  `app/results/page.test.ts`, `components/arena/AppShell.tsx`,
  `components/arena/ReviewResultBundleControl.tsx`,
  `components/arena/ReviewResultBundleControl.test.ts`,
  `components/arena/ReviewResultImportSummaryPanel.tsx`,
  `components/evaluation/LocalEvaluationResults.tsx`,
  `components/evaluation/LocalEvaluationResults.test.ts`,
  `lib/localEvaluationResultsV01.ts`,
  `lib/localEvaluationResultsV01.test.ts`, `lib/reviewResultImportV01.ts`,
  `lib/reviewResultImportV01.test.ts`, `lib/reviewResultInspectionV01.ts`,
  `lib/reviewResultInspectionV01.test.ts`, `scripts/validate-review-results.ts`,
  and `docs/CHANGELOG_AI.md`.
- Summary: Added a shared pure ReviewResult inspection helper for already
  validated single-result and bundle artifacts, reused it in the validation CLI,
  and rendered a compact imported result summary in both the review masthead
  import surface and the `/results` import surface. The UI now summarizes result
  counts, referenced CasePackage/case IDs, package and review schema versions,
  protocol versions, verdicts, confidence capture, failure modes, and strict
  compatibility status before users inspect aggregate results.
- Decisions made: Kept invalid imports on the existing loud failure path and
  kept aggregation, `ReviewResult`, `ReviewResultBundle`, and `EvaluationReport`
  shapes unchanged. Added a thin import router so valid single `ReviewResult`
  JSON uses the same one-result bundle storage/import path as bundles.
- Checks run: Focused tests for ReviewResult inspection/import, CLI validation,
  ReviewResult import UI, local results, and results page passed; final
  `npm test` passed with 215 tests after fixing one stale masthead-label
  assertion; `npx tsc --noEmit` passed; `npm run lint` passed with the
  existing 134 warnings under `.agents/skills/impeccable`; `npm run build`
  passed; `git diff --check` passed.
- Assumptions: Showing the imported-result summary at the import control and
  above `/results` report groups is the symmetric counterpart to the imported
  CasePackage masthead summary.
- Risks/follow-ups: The summary is metadata-only and cannot prove reviewer
  independence or evidence quality; it reports validated artifact contents
  without scoring, adjudication, consensus, backend persistence, or pilot data.
- Next recommended step: Use this inspection affordance in the Local Utility
  Gate smoke path for exported review results and aggregation handoff.
- Suggested commit message: `feat(review-result): show imported result summary`

## 2026-06-23: Local ReviewResult and Bundle Validation CLI

- Agent/model: Antigravity (Gemini 3.5 Flash)
- Prompt scope: Implement issue #135 by adding a local command that validates and inspects a `ReviewResult` JSON or `ReviewResultBundle` JSON file without creating reviewer outputs, fabricating pilot data, or writing EvaluationReports.
- Files changed: `package.json`, `scripts/validate-review-results.ts`, `scripts/validate-review-results.test.ts`, `README.md`, `docs/REVIEW_RESULT_CONTRACT.md`, and `docs/CHANGELOG_AI.md`.
- Summary: Added `npm run validate-review-results -- path/to/review-results.json`. The CLI accepts exactly one JSON file, parses it, auto-detects if it is a single result or a bundle, validates it against `validateReviewResultV01` or `importReviewResultBundleV01Json`, and prints a detailed validation posture/summary including verdict distribution, unique reviewers, referenced CasePackages, and failure modes.
- Decisions made: Reused existing schema validation logic to prevent double-specifying validation rules. Added a safe, truncated representation of reviewer/session identifiers to preserve anonymity at the CLI boundary.
- Checks run: `npm test` (all 208 tests passed); `npx tsc --noEmit` (clean); `npm run lint` (0 errors); `npm run build` (clean); `git diff --check`.
- Assumptions: The schema version fields (`review_result.v0.1` and `review_result_bundle.v0.1`) are stable and sufficient to route validation requests.
- Risks/follow-ups: CLI users must ensure the files are generated by a conforming client; raw telemetry is not checked or required.
- Next recommended step: Link validation and imported ReviewResult aggregation as part of the broader results aggregation loop.
- Suggested commit message: `feat(review-result): add local validation cli for results and bundles`

## 2026-06-23: Imported CasePackage Inspection Summary

- Agent/model: Codex (GPT-5)
- Prompt scope: Implement issue #133 by showing the shared CasePackage
  inspection summary after a valid local import without reading raw telemetry,
  following safe references, creating ReviewResults, or creating
  EvaluationReports.
- Files changed: `components/arena/CasePackageImportControl.tsx`,
  `components/arena/AppShell.tsx`, `lib/importCasePackageV01.ts`,
  `components/arena/WorkflowPrimitives.test.tsx`,
  `lib/importCasePackageV01.test.ts`, `app/investigation-workflow.css`,
  `README.md`, and `docs/CHANGELOG_AI.md`.
- Summary: Successful imports now carry the shared
  `inspectCasePackageV01` summary through the import result and render a compact
  UI inspection panel with schema, package/case IDs, reviewable status,
  synthetic-versus-controlled posture, dataset/sanitization/approval metadata,
  pipeline/adapter metadata, and evidence/claim/label/session counts.
- Decisions made: Reused `lib/casePackageInspection.ts` for summary data and
  kept invalid imports on the existing loud failure path. The UI summarizes only
  already-validated CasePackage metadata; it does not resolve safe references,
  read source artifacts, or imply pilot/reviewer/report execution.
- Checks run: `node --test --import tsx components/arena/WorkflowPrimitives.test.tsx lib/importCasePackageV01.test.ts`;
  `npm test`; `npx tsc --noEmit`; `npm run lint` (passed with the existing 134
  warnings under `.agents/skills/impeccable`); `npm run build`;
  `git diff --check`.
- Assumptions: The current import masthead is the right surface for a compact
  summary because it already owns import success and failure state.
- Risks/follow-ups: The panel confirms metadata presence but cannot prove that
  arbitrary package text is safe; upstream authors and approvers remain
  responsible for release scope.
- Next recommended step: Continue the Local Utility Gate by improving package
  authoring/inspection support or the imported review-to-results workflow.
- Suggested commit message: `feat(case-package): show import inspection summary`

## 2026-06-22: Local CasePackage Validation CLI

- Agent/model: Codex (GPT-5)
- Prompt scope: Implement issue #131 by adding a local command that validates
  and inspects one `CasePackage` JSON file without reading raw telemetry,
  following safe references, creating ReviewResults, or creating
  EvaluationReports.
- Files changed: `package.json`, `lib/casePackageValidation.ts`,
  `lib/casePackageInspection.ts`, `scripts/validate-package.ts`,
  `scripts/validate-package.test.ts`, `README.md`,
  `docs/CASE_PACKAGE_CONTRACT.md`, `docs/ADAPTER_BOUNDARY.md`, and
  `docs/CHANGELOG_AI.md`.
- Summary: Added `npm run validate-package -- path/to/case-package.json`.
  The command accepts exactly one JSON path, parses the supplied file, validates
  through `validateCasePackageV01`, prints readable failure diagnostics with
  path/code/message values, and prints a compact inspection summary for valid
  packages including schema, package/case ID, reviewable status, posture,
  dataset and sanitization metadata, approval scope, pipeline/adapter metadata,
  and evidence/claim/label/session counts.
- Decisions made: Reused the validator's explicit synthetic-versus-controlled
  posture logic through a tiny exported helper, then mapped validated packages
  into synthetic demo, sanitized/controlled, or real/approved controlled
  inspection labels. Kept the utility local and file-based; it does not resolve
  source artifacts or safe references.
- Checks run: Focused
  `node --test --import tsx scripts/validate-package.test.ts lib/casePackageValidation.test.ts data/casePackageFixtures.test.ts`
  passed with 30 tests; `npm test` passed with 197 tests; `npx tsc --noEmit`
  passed; `npm run lint` passed with 0 errors and the existing 134 warnings
  under `.agents/skills/impeccable`; `npm run build` passed; `git diff --check`
  passed.
- Assumptions: `approved_internal`, `internal`, and `confidential` identify the
  inspection summary's real/approved controlled posture; other non-synthetic
  valid controlled packages are summarized as sanitized/controlled.
- Risks/follow-ups: The CLI can validate metadata and references but cannot
  prove arbitrary evidence text is safe. Upstream package authors and named
  approvers remain responsible for content minimization and release scope.
- Next recommended step: Use the command as the local preflight before
  importing approved package JSON into the review workflow.
- Suggested commit message: `feat(case-package): add local validation cli`

## 2026-06-22: Restricted-Data And Approved Package Workflow

- Agent/model: Antigravity (Gemini 3.5 Flash) & Codex (GPT-5)
- Prompt scope: Complete issue #66 after auditing merged issue #65 / PR #129;
  document how realistic or sanitized CasePackages enter Telemetry Court
  without raw telemetry ingestion, restricted-data copying, fake reviewers, or
  fabricated review and evaluation artifacts. Correct stale "Next Milestone" references
  across README.md, AGENTS.md, and other documentation to point to the Local Utility Gate.
- Files changed: `README.md`, `AGENTS.md`, `CONTRIBUTING.md`, `PROMPTING_GUIDE.md`,
  `START_HERE_FOR_AGENTS.md`, `docs/ADAPTER_BOUNDARY.md`, `docs/DEVELOPMENT_WORKFLOW.md`,
  and `docs/CHANGELOG_AI.md`.
- Summary: Added a contributor-facing flow from an approved upstream
  environment through minimal evidence selection, sanitization, scoped
  approval, CasePackage validation, local review, and authentic downstream
  artifacts. Distinguished synthetic, sanitized controlled, and real/approved
  controlled package postures and made the public/demo handling rule explicit.
  Corrected all stale references to Milestone 2 (Case Package Contract and Validation
  Infrastructure) to reflect that it is now complete, pointing to Milestone 3 (Local Utility Gate) instead.
- Decisions made: Kept the change documentation-only because PR #129 already
  implemented the required provenance, sanitization, safe-reference, and
  approval validation. Added the missing operational handoff, repository
  handling rules, and current-versus-target capability statement.
- Checks run: `git diff --check` passed; `npm test` passed;
  `npx tsc --noEmit` passed; `npm run lint` passed; `npm run build` passed.
- Assumptions: Both sanitized controlled and real/approved controlled packages
  remain non-synthetic under the current validator. Approval is scoped to one
  package revision and environment; it does not authorize raw-data ingestion
  or public repository publication.
- Risks/follow-ups: Documentation and metadata validation cannot prove that
  arbitrary evidence content is safe. The upstream data owner, adapter author,
  and named approver still own content minimization and release decisions.
- Next recommended step: Close issue #66 after documentation review; execute no
  reviewer pilot until its separate human approvals are in place.
- Suggested commit message: `docs(data-boundary): document approved package workflow`

## 2026-06-22: Adapter Provenance And Sanitization Requirements

- Agent/model: Codex (GPT-5)
- Prompt scope: Implement issue #65 by hardening provenance, sanitization, and
  approval requirements for realistic or adapter-produced `CasePackage v0.1`
  output while keeping local fixtures explicitly synthetic; do not run issues
  #74 or #114 or fabricate reviewer/evaluation artifacts.
- Files changed: `lib/types.ts`, `lib/casePackageValidation.ts`,
  `lib/casePackageValidation.test.ts`, `lib/casePackageV01Fixture.ts`,
  `data/syntheticToponymyStyleCasePackageFixture.ts` and its test,
  `data/syntheticAcme4StyleCasePackageFixture.ts` and its test,
  `docs/CASE_PACKAGE_CONTRACT.md`, `docs/ADAPTER_BOUNDARY.md`,
  `docs/ARCHITECTURE.md`, and `docs/CHANGELOG_AI.md`.
- Summary: Added a structured sanitization review-approval type and conditional
  runtime validation. Packages outside the explicit synthetic-demo posture now
  require matching upstream-run provenance, adapter name/version, concrete safe
  provenance references, non-empty sanitization notes, an auditable approval
  record, and a non-synthetic safe-reference posture. Synthetic fixtures remain
  valid only with explicit synthetic case, dataset, evidence, and sanitization
  metadata and no real-data approval claim.
- Decisions made: Kept `case_package.v0.1` because provenance and sanitization
  were already required sections, the approval field is additive in the
  TypeScript shape, explicit synthetic fixtures remain compatible, and the repo
  has no supported real adapter package to migrate. A future incompatible field
  replacement or supported-package migration still requires a schema bump.
  Restricted telemetry remains upstream; validation requires safe summaries and
  audit pointers, not raw payloads.
- Checks run: Focused 30-test CasePackage/fixture suite passed; `npm test`
  passed with 190 tests; `npx tsc --noEmit` passed; `npm run lint` passed with
  0 errors and the existing 134 warnings under `.agents/skills/impeccable`;
  `npm run build` passed; `git diff --check` passed. `npm audit` was not run or
  modified because dependency work is explicitly out of scope.
- Assumptions: A package is exempt from controlled-data approval requirements
  only when `reviewable_status`, dataset classification, and sanitization status
  all identify an explicit synthetic demo. Approval covers the exported package
  revision and review scope, not unrestricted source access.
- Risks/follow-ups: Previously accepted non-synthetic v0.1 packages without the
  new conditional metadata now fail runtime validation by design. Metadata
  validation cannot prove arbitrary evidence text is safe, so upstream adapters
  and named approvers still own content review. No real adapter, raw telemetry
  ingestion, reviewer execution, ReviewResult generation, or EvaluationReport
  generation was added.
- Next recommended step: Use the hardened contract when an authorized upstream
  owner prepares the first real or realistic sanitized adapter output.
- Suggested commit message: `model(case-package): require adapter provenance and approval`

## 2026-06-22: Issue 74 Pilot Preflight

- Agent/model: Codex (GPT-5)
- Prompt scope: Prepare a docs-only preflight plan and execution checklist for
  the human-run multi-reviewer pilot in issue #74 without running the pilot or
  claiming ReviewResult artifacts exist.
- Files changed: `docs/PILOT_74_PREFLIGHT.md`,
  `docs/VALIDATION_PILOT_PROTOCOL.md`, and `docs/CHANGELOG_AI.md`.
- Summary: Added execution gates for a 3-5 package, 2-3 independent reviewer
  pilot; package validation and safety checks; reviewer instructions;
  ReviewResult naming, metadata, and completeness checks; operational notes;
  aggregation compatibility; explicit human approvals; non-goals; and required
  completion evidence.
- Decisions made: Kept the change documentation-only. Identified seven tracked
  package-shaped TypeScript fixtures as synthetic rehearsal inputs, not an
  approved realistic pilot set. Documented the existing UI import validation
  path because the repository has no standalone JSON package-validator CLI,
  and used the contract's actual `review_id` field without changing the
  `review_result.v0.1` shape.
- Checks run: `git diff --check` passed; `npm test` passed with 185 tests;
  `npx tsc --noEmit` passed; `npm run lint` passed with 0 errors and the
  existing 134 warnings under `.agents/skills/impeccable`; `npm run build`
  passed; `npm audit --audit-level=high` reported two moderate findings in
  Next.js's transitive `postcss` dependency and offered only a breaking forced
  fix.
- Assumptions: Issue #74 remains human-in-the-loop and cannot complete until
  multiple independent reviewers produce real ReviewResults for the same
  approved packages.
- Risks/follow-ups: Human approval is still required for the realistic package
  set, reviewer roster, any restricted-data use, publication, and claims. The
  pilot itself and ReviewResult collection remain unexecuted.
- Next recommended step: Approve and freeze the package manifest and reviewer
  roster, then execute the pilot exactly once per reviewer/package assignment.
- Suggested commit message: `docs(evaluation): prepare multi-reviewer pilot preflight`

## 2026-06-22: Research Validation Study Protocol

- Agent/model: Codex (GPT-5)
- Prompt scope: Implement issue #72 as docs/protocol work only by defining a
  small multi-reviewer research validation study that tests whether Telemetry
  Court produces useful validation signals from `CasePackageV01`,
  `ReviewResultV01`, and `EvaluationReportV01` artifacts.
- Files changed: `README.md`, `docs/VALIDATION_PILOT_PROTOCOL.md`, and
  `docs/CHANGELOG_AI.md`.
- Summary: Reframed the existing validation pilot protocol as a draft research
  validation study protocol. Added explicit study purpose, study questions,
  package selection criteria, reviewer selection guidance, reviewer task
  sequence, blind-review rules, metrics, analysis plan, expected artifacts,
  data-safety limits, success/failure criteria, study notes, post-study
  decisions, and human approval checkpoints.
- Decisions made: Kept the change documentation-only. Documented current
  capability limits instead of inventing target behavior: reports aggregate one
  exact compatible CasePackage reference, current recommended actions are
  derived from final verdicts, `insufficient` is canonical but not emitted by
  the current local UI/export path, and local storage/bundle exchange is not
  durable multi-user study infrastructure. Added a README docs-index link for
  discoverability.
- Checks run: `git diff --check` passed; `npm test` passed with 185 tests;
  `npx tsc --noEmit` passed; `npm run lint` passed with 0 errors and the
  existing 134 warnings under `.agents/skills/impeccable`; `npm run build`
  passed.
- Assumptions: Issue #72 should produce an executable draft protocol while
  preserving human approval gates for real/restricted data, final package
  selection, reviewer recruitment, publishing, and generalizable claims.
- Risks/follow-ups: Product/research owner review is still required before
  executing a real study, recruiting reviewers, selecting final packages, or
  presenting results.
- Next recommended step: Have the product/research owner approve the package
  list, reviewer plan, and publication claims before running the study.
- Suggested commit message: `docs(evaluation): define validation study protocol`

## 2026-06-22: README Masthead and ASCII Art Integration

- Agent/model: Gemini 3.5 Flash
- Prompt scope: Add high-trust, premium ASCII/Unicode art to the repository README.md that integrates the Telemetry Court logo image.
- Files changed: `README.md` and `docs/CHANGELOG_AI.md`.
- Summary: Designed and implemented a side-by-side masthead layout at the top of the README.md. The layout places the official logo image on the left, and a double-line Unicode text banner ("TELEMETRY COURT") with the project tagline ("— AI names the cluster. Humans test the evidence. —") on the right.
- Decisions made: Chose a side-by-side table layout using a clean, borderless HTML structure to keep the design aligned, responsive, and compatible with GitHub's markdown renderer.
- Checks run: `git diff`, `npm run lint`, `npm test`.
- Assumptions: A clean, minimal side-by-side layout aligns well with the project's premium, high-trust fintech aesthetic.
- Risks/follow-ups: None.
- Next recommended step: Review the visual rendering of the README on GitHub.
- Suggested commit message: `docs: update README header with side-by-side ASCII art masthead`

## 2026-06-22: Reviewer Rubric And Instructions

- Agent/model: Codex (GPT-5)
- Prompt scope: Implement issue #73 as a docs-only protocol change that gives reviewers a consistent rubric for producing comparable structured `ReviewResult` artifacts without changing contracts, export shapes, runtime validation, or UI semantics.
- Files changed: `README.md`, `docs/REVIEWER_RUBRIC.md`, `docs/EVALUATION_INFRASTRUCTURE.md`, `docs/VALIDATION_PILOT_PROTOCOL.md`, and `docs/CHANGELOG_AI.md`.
- Summary: Added a focused reviewer rubric covering review purpose, blind-review discipline, canonical evidence ratings, label comparison, outlier or impostor choice, optional confidence semantics, structured failure modes, canonical verdicts, recommended actions, and key distinctions such as missing evidence versus contradiction and uncertainty versus package-context gaps. Linked the rubric from the README docs list, evaluation infrastructure, and the validation pilot protocol.
- Decisions made: Matched the rubric to the existing repository values in `lib/types.ts`, `lib/reviewResultV01.ts`, `lib/exportReview.ts`, `docs/REVIEW_RESULT_CONTRACT.md`, and `docs/VERDICT_AND_FAILURE_MODE_SEMANTICS.md`; documented that `unsupported_overclaimed` is only a legacy internal UI value while `ReviewResultV01` exports canonical `unsupported_or_overclaimed`; documented that confidence is optional in the contract but not emitted by the current local export flow; documented that the current exporter derives recommended action from final verdict rather than collecting a separate action choice. Kept `CasePackageV01`, `ReviewResultV01`, `EvaluationReportV01`, runtime validation, import/export schemas, `review_result.v0.1`, route IDs, stage IDs, protected-stage logic, and review-state semantics unchanged.
- Checks run: `git diff --check`; `npm test`; `npx tsc --noEmit`.
- Assumptions: A dedicated reviewer-facing rubric is the most useful next protocol artifact after the blind-review and ReviewResult/EvaluationReport copy fixes from issue #124.
- Risks/follow-ups: The rubric improves reviewer consistency but does not yet add reviewer training UI, confidence capture, or a formal study packet. If larger validation studies need stronger onboarding, that should remain a later protocol or product issue.
- Next recommended step: Review the docs-only PR for issue #73, then use the rubric during the next realistic validation pilot.
- Suggested commit message: `docs(review): add reviewer rubric`

## 2026-06-22: Blind Review And Aggregation Clarity

- Agent/model: Codex (GPT-5)
- Prompt scope: Implement issue #124 as a narrow UX clarity change explaining why Initial Assessment stays blind and how compatible ReviewResults become EvaluationReports.
- Files changed: `app/page.test.ts`, `components/arena/BlindReadPanel.tsx`, `components/arena/JudgmentReceipt.tsx`, `components/evaluation/EvaluationReportResults.tsx`, `components/evaluation/EvaluationReportResults.test.ts`, `components/evaluation/LocalEvaluationResults.tsx`, `components/evaluation/LocalEvaluationResults.test.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Added concise blind-review rationale explaining that the blind pass captures a first evidence-based judgment before the AI label can anchor the reviewer, while keeping label, claim, and candidate details sealed. Clarified export, receipt, drawer, local results, and EvaluationReport copy so one ReviewResult is one reviewer judgment for one CasePackage, compatible ReviewResults are same CasePackage/protocol reviews by multiple reviewers, and EvaluationReports aggregate those compatible local/exportable artifacts.
- Decisions made: Kept `CasePackageV01`, `ReviewResultV01`, `EvaluationReportV01`, `review_result.v0.1` export shape, import/export schemas, route IDs, stage IDs, protected-stage logic, and review state-machine semantics unchanged. Did not add backend upload, server saving, ReviewResult import, or EvaluationReport generation beyond existing local results behavior.
- Checks run: `node --test --import tsx app/page.test.ts` passed with 39 tests; `npm test` passed with 185 tests; `npx tsc --noEmit` passed; `npm run lint` passed with 0 errors and 134 existing warnings under `.agents/skills/impeccable`; `npm run build` passed; `git diff --check` passed.
- Assumptions: The right fix for issue #124 is compact protocol copy on existing review/export/results surfaces rather than a new flow or data model change.
- Risks/follow-ups: This improves reviewer comprehension but does not add new aggregation capabilities or durable multi-user persistence.
- Next recommended step: Review the draft PR for issue #124.
- Suggested commit message: `fix(review): clarify blind review aggregation purpose`

## 2026-06-22: Precise Masthead Action Alignment Correction

- Agent/model: Antigravity (Gemini 3.5 Flash (High))
- Prompt scope: Align masthead action groups precisely using a CSS grid/subgrid layout for results, CasePackage import, and ReviewResult bundle columns, ensuring shared button/helper baselines.
- Files changed: `app/investigation-workflow.css`, `components/arena/AppShell.tsx`, `components/arena/CasePackageImportControl.tsx`, `components/arena/ReviewResultBundleControl.tsx`, `app/results/page.tsx`.
- Summary: Corrected visual misalignment of buttons and helper texts in the masthead. Wrapped the action grid in a semantic subgrid layout so that all column buttons share a single horizontal baseline and helper texts align directly beneath their respective button columns.
- Decisions made: Preserved all existing test classes for regression protection while layering CSS grid layout rules. Scoped all changes to the masthead action classes.
- Checks run: `node --test --import tsx app/page.test.ts`, `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`, `git diff --check`.
- Assumptions: The layout coordinates perfectly with the 8-step progress rail.
- Risks/follow-ups: None.
- Next recommended step: Review masthead visually across breakpoints.
- Suggested commit message: `fix: align masthead action groups`

## 2026-06-22: Shared Workflow Masthead Alignment

- Agent/model: Codex (GPT-5)
- Prompt scope: Polish the shared Telemetry Court masthead across all eight review stages without changing contracts, import/export semantics, routes, or review-state behavior.
- Files changed: `app/investigation-workflow.css`, `app/page.test.ts`, `app/results/page.tsx`, shared arena header/import controls and tests, and the eight arena stage panels.
- Summary: Moved the eight-step progress rail into `ArenaHeader`, grouped Results, CasePackage import, and ReviewResult bundle actions into one masthead layout, normalized pill geometry and helper placement, aligned masthead and workflow content to the same width, and added deterministic tablet/mobile stacking.
- Decisions made: Kept all existing actions and product language; made progress optional for the non-workflow Results page; removed stage-local progress instances and the late review-only width override that caused cross-stage drift.
- Checks run: `node --test --import tsx app/page.test.ts` passed with 38 tests; `npm test` passed with 184 tests; `npx tsc --noEmit`, `npm run lint`, `npm run build`, and `git diff --check` passed. Lint retained 134 existing warnings under `.agents/skills/impeccable` and reported no errors. Production Playwright review completed the full eight-step flow at 1440px and revisited all eight stages at 390px with identical per-breakpoint masthead/progress geometry, no horizontal overflow, no clipped helper text, and no console errors.
- Assumptions: The existing `1040px` workflow width remains the canonical shared content width for this slice.
- Risks/follow-ups: The mobile masthead is intentionally tall because all import/export controls remain visible and touch-accessible; no controls were collapsed into a menu.
- Next recommended step: Review the shared masthead screenshots alongside the existing design references before merge.
- Suggested commit message: `fix(ui): align shared workflow masthead`

## 2026-06-22: ReviewResult Export Copy Accuracy Fix

- Agent/model: Codex (GPT-5)
- Prompt scope: Fix the PR #120 blocking copy issue without changing schemas, contracts, or export behavior.
- Files changed: `app/page.test.ts`, `components/arena/JudgmentReceipt.tsx`, and `docs/CHANGELOG_AI.md`.
- Summary: Removed `confidence` from the export-purpose sentence because the current review-flow export does not serialize `decisions.confidence`.
- Decisions made: Kept the current `review_result.v0.1` shape and export builder unchanged; retained the existing explanation of the CasePackage, ReviewResult, and EvaluationReport relationship.
- Checks run: Focused `node --test --import tsx app/page.test.ts` completed a red-to-green cycle and passed with 36 tests; `npm test` passed with 182 tests, including normal and context-limited `review_result.v0.1` export coverage; `npx tsc --noEmit` passed; `npm run lint` passed with 0 errors and the existing 134 warnings under `.agents/skills/impeccable`; `npm run build` passed; `git diff --check` passed. Browser review against the production build confirmed the corrected purpose copy and JSON drawer on desktop and mobile, a parseable downloaded `review_result.v0.1` with the unchanged seven decision keys and no `confidence`, no console errors, and no mobile horizontal overflow.
- Assumptions: The current copy should describe only fields emitted by the current review flow, even when the schema permits additional optional fields.
- Risks/follow-ups: None; adding reviewer confidence remains a separate contract and implementation decision.
- Next recommended step: Review the copy-only commit and mark PR #120 ready if no new review findings are raised.
- Suggested commit message: `fix(review): correct ReviewResult export copy`

## 2026-06-22: ReviewResult Export Purpose Copy

- Agent/model: Codex (GPT-5)
- Prompt scope: Implement issue #118 as a narrow product-clarity UX change that explains the purpose of ReviewResult export and the EvaluationReport next step without changing contracts, schemas, export shapes, routes, stage IDs, protected-stage logic, or review-state semantics.
- Files changed: `app/globals.css`, `app/investigation-workflow.css`, `app/page.test.ts`, `components/arena/JudgmentReceipt.tsx`, `components/arena/ReviewSummaryDrawer.tsx`, and `docs/CHANGELOG_AI.md`.
- Summary: Added concise export-moment copy in the verdict receipt and JSON drawer flow explaining that the downloaded JSON is one reviewer’s `ReviewResult`, that it preserves structured review decisions, that compatible ReviewResults for the same CasePackage should be collected together, that aggregation produces an `EvaluationReport`, and that the report is used to evaluate and improve upstream labels, prompts, embeddings, evidence extraction, and clustering. Also relabeled the drawer title to `Structured ReviewResult JSON`.
- Decisions made: Kept `CasePackageV01`, `ReviewResultV01`, and `EvaluationReportV01` unchanged; kept ReviewResult export/import shapes and schema versions unchanged; kept blind review, route/stage IDs, protected-stage logic, and reducer/state-machine semantics unchanged. The change is explanatory copy plus light receipt styling only.
- Checks run: Focused `node --test --import tsx app/page.test.ts` passed with 36 tests after new export-copy assertions were added first; `npm test` passed with 182 tests; `npx tsc --noEmit` passed; `npm run lint` passed with 0 errors and the existing 134 warnings under `.agents/skills/impeccable`; `npm run build` passed; `git diff --check` passed. Manual Playwright review on `next start --hostname 127.0.0.1 --port 3104` confirmed the new ReviewResult/EvaluationReport copy is visible on desktop and mobile, the JSON drawer title/copy renders correctly, the export action remains visible, and the mobile verdict page has no horizontal overflow.
- Assumptions: The most effective place for this clarification is the existing receipt/export surface the reviewer already sees at verdict completion and inside the JSON drawer, rather than a new page or tutorial.
- Risks/follow-ups: This explains the current workflow but does not add ReviewResult import or EvaluationReport generation beyond the existing local results surface. If pilot reviewers still miss the next step, a later issue can add a more explicit Results CTA.
- Next recommended step: Run the full required validation suite, perform a browser pass on the verdict/export flow, then open the requested draft PR for #118.
- Suggested commit message: `ux(review): clarify ReviewResult export purpose`

## 2026-06-22: Checkpoint Card Copy Collision Fix

- Agent/model: Codex (GPT-5)
- Prompt scope: Fix the PR #119 blocking visual regression where new checkpoint card copy inherited old fake-radio direct-span styling.
- Files changed: `app/investigation-workflow.css` and `docs/CHANGELOG_AI.md`.
- Summary: Added scoped investigation-shell CSS resets so `.readiness-option-copy` renders as normal text content and `.readiness-option-state` keeps its selected chip shape without inheriting the old 18px fake-radio span sizing or pseudo-dot.
- Decisions made: Kept the existing `BlindReadPanel` markup, route/stage behavior, review state, contracts, schemas, and ReviewResult export shape unchanged. The actual radio marker remains `.readiness-option-mark`.
- Checks run: `node --test --import tsx app/page.test.ts` passed with 36 tests; `npm test` passed with 182 tests; `npx tsc --noEmit` passed; `npm run lint` passed with 0 errors and the existing 134 warnings under `.agents/skills/impeccable`; `npm run build` passed; `git diff --check` passed. Manual Playwright review on `next start --hostname 127.0.0.1 --port 3102` with imported `case_package_case-arena-002` passed desktop and mobile checkpoint rendering, whole-card click selection, keyboard focus ring, selected state, blind AI-label hiding before AI Claim Check, normal ReviewResult export, low-context ReviewResult export, and console-error checks.
- Assumptions: The blocker is a CSS cascade collision only; no markup, state-machine, route, schema, or copy change is needed.
- Risks/follow-ups: None.
- Next recommended step: Review the small CSS follow-up and mark PR #119 ready if acceptable.
- Suggested commit message: `fix(review): prevent checkpoint copy clipping`

## 2026-06-22: Low-Context Checkpoint Visibility

- Agent/model: Codex (GPT-5)
- Prompt scope: Implement issue #117 as a narrow UI bug fix to make the "Can you judge this case?" checkpoint choices visually obvious without implementing #118 or changing contracts, routes, stage IDs, protected-stage logic, or state-machine semantics.
- Files changed: `app/investigation-workflow.css`, `app/page.test.ts`, `components/arena/BlindReadPanel.tsx`, and `docs/CHANGELOG_AI.md`.
- Summary: Converted the checkpoint choices into compact selectable cards using full-card labels, native radio inputs, a visible radio marker, obvious selected styling, a selected chip, and visible focus styling. The low-context guidance still points to existing insufficient-context interpretation paths without adding explanatory paragraphs.
- Decisions made: Kept `CasePackageV01`, `ReviewResultV01`, and `EvaluationReportV01` unchanged; kept import/export schemas and ReviewResult shape unchanged; kept route IDs, stage IDs, protected-stage logic, and review state-machine semantics unchanged. Preserved blind review by deriving checkpoint context only from visible case text and adding a focused case 002 test that excludes the AI label, AI rationale, and hidden generated claim before AI Claim Check.
- Checks run: Focused `node --test --import tsx app/page.test.ts` passed with 36 tests; full `npm test` passed with 182 tests; `npx tsc --noEmit` passed; `npm run lint` passed with 0 errors and the existing 134 warnings under `.agents/skills/impeccable`; `npm run build` passed; `git diff --check` passed. Manual Playwright review on `next start --hostname 127.0.0.1 --port 3102` with imported `case_package_case-arena-002` passed for desktop checkpoint visibility, mobile checkpoint visibility, whole-card clicking, selected state, keyboard focus, blind AI-label hiding before AI Claim Check, normal path, low-context path, ReviewResult JSON export, and no console errors.
- Assumptions: The appropriate fix for #117 is visual affordance and interaction clarity for the existing checkpoint options, not additional explanatory copy or new ReviewResult data.
- Risks/follow-ups: Built-in compatibility seed data remains unchanged. Any broader blind-choice label policy or schema-level reviewer-confidence capture should stay in a separate issue, not this PR.
- Next recommended step: Review the requested draft PR for issue #117.
- Suggested commit message: `fix(review): clarify checkpoint choices`

## 2026-06-22: Insufficient-Context Review Path

- Agent/model: Codex (GPT-5)
- Prompt scope: Implement issue #115 as a narrow product-safety/usability PR that prevents low-understanding reviews from becoming misleading ReviewResults without changing contracts, routes, stage IDs, protected-stage logic, or export shapes.
- Files changed: `app/globals.css`, `app/page.test.ts`, `components/arena/AppShell.tsx`, `components/arena/BlindReadPanel.tsx`, `components/arena/EvidenceBoard.tsx`, `components/arena/LabelDuelPanel.tsx`, `components/arena/VerdictPanel.tsx`, `components/arena/WorkflowPrimitives.tsx`, `lib/exportReview.test.ts`, `lib/reviewReadiness.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Added a compact "Can you judge this case?" checkpoint before AI Claim Check with three plain-language readiness choices, a one-sentence product goal reminder, and a safe domain-context signal derived only from visible case text. Low-context choices remain local UI state and show concise guidance toward existing insufficient-context decisions: Not enough evidence, Needs context, uncertainty-preserving labels, Uncertain, Needs better evidence, and `collect_more_evidence`.
- Decisions made: Kept `CasePackageV01`, `ReviewResultV01`, and `EvaluationReportV01` unchanged; kept import/export schemas and ReviewResult shape unchanged; kept route IDs, stage IDs, protected-stage logic, and reducer/state-machine semantics unchanged. Did not reveal the AI label, AI explanation, or generated claims before AI Claim Check. Reduced visible text by shortening the orientation/initial-assessment copy and moving the evidence-rating guide and final checklist behind compact disclosure controls.
- Checks run: Focused `npm test -- app/page.test.ts lib/exportReview.test.ts` passed with 41 tests; full `npm test` passed with 178 tests; `npx tsc --noEmit` passed; `npm run lint` passed with 0 errors and the existing 134 warnings under `.agents/skills/impeccable`; `npm run build` passed; `git diff --check` passed. Manual Playwright review on `next start --hostname 127.0.0.1 --port 3100` passed for normal and insufficient-context imports of `case_package_case-arena-001`, with no console errors and unchanged ReviewResult v0.1 top-level/decision keys.
- Assumptions: For early domain-context signaling, only already-visible case text is safe to use before AI Claim Check. For the IAM demo case, that means IAM / CloudTrail / role provisioning rather than the full AI label wording.
- Risks/follow-ups: The checkpoint is intentionally local UI state only and is not persisted into ReviewResult. If future pilot feedback shows reviewers need a durable reviewer-confidence signal, that should be handled as a separate contract discussion rather than hidden inside this PR.
- Next recommended step: Open the requested draft PR for issue #115.
- Suggested commit message: `ux(review): add insufficient-context path`

## 2026-06-22: First-Time Review Flow Comprehension

- Agent/model: Codex (GPT-5)
- Prompt scope: Implement issue #112 as a narrow, copy-first UX comprehension slice for built-in and imported reviews without changing contracts, routes, stage IDs, protected-stage logic, or review state-machine semantics.
- Files changed: `app/investigation-workflow.css`, `app/page.test.ts`, `components/arena/AiRevealPanel.tsx`, `components/arena/AppShell.test.ts`, `components/arena/AppShell.tsx`, `components/arena/BlindReadPanel.tsx`, `components/arena/EvidenceBoard.tsx`, `components/arena/ImpostorPanel.tsx`, `components/arena/LabelDuelPanel.tsx`, `components/arena/VerdictPanel.tsx`, `components/arena/WorkflowPrimitives.test.tsx`, `components/arena/WorkflowPrimitives.tsx`, `lib/casePackageV01ToCaseFile.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Added a compact CasePackage review orientation near the start of the flow, concise decision prompts for all six review stages, a six-concept evidence-rating legend, and a five-question Final Evaluation checklist. Replaced imported-case IAM-specific fallback copy with case-neutral guidance and kept the upstream AI candidate out of imported blind-choice options so the exact label remains sealed until AI Claim Check.
- Decisions made: Kept `CasePackageV01`, `ReviewResultV01`, and `EvaluationReportV01` unchanged; kept import/export schemas and output shapes unchanged; kept routes, stage IDs, protected-stage logic, and reducer semantics unchanged. The legend explains the existing contract concepts without adding interactive rating values. The AI-generated candidate remains available in Label Selection but is excluded from Initial Assessment choices.
- Checks run: Focused `app/page.test.ts`, `components/arena/WorkflowPrimitives.test.tsx`, `components/arena/AppShell.test.ts`, import/adapter tests, full `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`, and `git diff --check` passed. Lint retained the existing warnings under `.agents/skills/impeccable` with no errors.
- Assumptions: The CasePackage candidate whose source is `ai_generated` (or the first candidate fallback used as `topicLabel`) is the upstream AI label that must remain hidden during blind review.
- Risks/follow-ups: No schema or persistence migration is required. Future candidate-source additions should preserve the same rule that the displayed AI claim cannot also appear as an Initial Assessment choice.
- Next recommended step: Review the draft PR for issue #112 and run a fresh-context review before merge.
- Suggested commit message: `feat(review): clarify first-time review decisions`

## 2026-06-22: Project Logo and Favicon Integration

- Agent/model: Gemini 3.5 Flash
- Prompt scope: Integrate the new Telemetry Court logo as the project logo, favicon, and social preview across local browser, Vercel production, and GitHub README/metadata.
- Files changed: `public/telemetry-court-logo.png`, `app/icon.png`, `app/apple-icon.png`, `public/icon-192.png`, `public/icon-512.png`, `public/apple-touch-icon.png`, `app/favicon.ico`, `public/favicon.ico`, `docs/assets/github-social-preview.png`, `README.md`, `package.json`, `docs/CHANGELOG_AI.md`.
- Summary: Saved the provided official logo, generated multi-resolution PNG and ICO favicon/app icon variants using `sips` and a custom Python builder script, configured Next.js file-based metadata, generated a standard 1280x640 GitHub social preview asset, added the logo to the top of the README, updated package.json descriptions, and set up GitHub repository description/topics via CLI.
- Decisions made: Used built-in macOS `sips` tool and a lightweight Python script for image resizing and ICO generation to avoid adding external node dependencies. Configured standard Next.js App Router metadata conventions by placing favicon/icon assets directly under `app/`.
- Checks run: `npm run lint` passed; `npm test` passed with 170 tests; `npm run build` completed successfully with Turbopack identifying `/apple-icon.png` and `/icon.png` static routes; verified that the local Next.js server serves `/favicon.ico` (200 OK) and `/icon.png` (200 OK) with the correct generation timestamps.
- Assumptions: The logo provided is the official source of truth and needs no text additions or design changes.
- Risks/follow-ups: The user should manually verify the tab favicon in a clean browser window or after clearing the browser cache, as browsers aggressively cache favicons.
- Next recommended step: Verify the browser tab icon locally and inspect the updated README.
- Suggested commit message: `meta: integrate official project logo and favicon variants`

## 2026-06-22: Audit and refine the review flow UI labels

- Agent/model: Gemini 3.1 Pro (High)
- Prompt scope: Do a review-flow clarity audit and improve the local review flow UI labels to make it self-explanatory and obviously useful without changing any data contracts.
- Files changed: `app/page.test.ts`, `components/arena/AiRevealPanel.tsx`, `components/arena/AppShell.tsx`, `components/arena/BlindReadPanel.tsx`, `components/arena/CaseFilePanel.tsx`, `components/arena/EvidenceBoard.tsx`, `components/arena/ImpostorPanel.tsx`, `components/arena/JudgmentReceipt.tsx`, `components/arena/LabelDuelPanel.tsx`, `components/arena/VerdictPanel.tsx`, `components/arena/WorkflowPrimitives.test.tsx`, `components/arena/WorkflowPrimitives.tsx`, `lib/arenaReviewState.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Renamed the visible review stages to align with the Telemetry Court product vision ("AI names the cluster. Humans test the evidence"): Initial Assessment, AI Claim Check, Evidence Verification, Label Selection, Cluster Fit Check, and Final Evaluation. Also aligned microcopy, accessible labels, action buttons, and the reviewer-job banner with the approved terminology.
- Decisions made: Changed presentation copy without touching the underlying domain model or contracts (`CasePackageV01`, `ReviewResultV01`, `EvaluationReportV01`). Internal stage IDs, routes, and review-state semantics remain unchanged. Updated focused UI tests to assert the approved visible copy.
- Checks run: focused UI/copy tests passed with 27 tests; `npm test` passed with 170 tests; `npx tsc --noEmit` passed; `npm run lint` passed with the existing 134 warnings under `.agents/skills/impeccable`; `npm run build` passed; and `git diff --check` passed. A production browser walkthrough confirmed the approved stage labels and reviewer-job banner across the built-in review flow with no console warnings or errors. The focused imported-case navigation test confirmed that in-memory imported case state remains preserved across stage paths; the in-app browser could not attach a local fixture for a second manual import pass.
- Assumptions: The user wants to stick strictly to UI copy updates and avoid deep architectural refactoring. The underlying review state machine and actions are unchanged.
- Risks/follow-ups: Legacy route names, component names, state fields, test descriptions, and historical changelog entries retain older terminology where changing it would create route, contract, or history churn.
- Next recommended step: Review the draft PR.
- Suggested commit message: `ux: clarify review flow language`
## 2026-06-22: Preserve Imported Case State During Navigation

- Agent/model: Gemini 3.1 Pro (High)
- Prompt scope: Finalize local follow-up navigation fix for AppShell to keep imported CasePackage state in memory while navigating review stages.
- Files changed: `components/arena/AppShell.tsx`, `components/arena/AppShell.test.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: The `imported-case` stage navigation was still using `router.push`, which remounted the shell and dropped the in-memory imported case. Introduced a `navigatePath` function in `AppShell` that uses `onNavigatePathPreservingState` when navigating with an imported case, preventing the remount.
- Decisions made: Kept the state within React memory using `window.history.pushState` under the hood via `onNavigatePathPreservingState` instead of introducing URL parameters or local storage for the active case. Added focused unit tests for `navigatePath`.
- Checks run: `npm test` passed, `npx tsc --noEmit` passed, `npm run lint` passed, `npm run build` passed, `git diff --check` passed.
- Assumptions: The user has already run the follow-up changes locally.
- Risks/follow-ups: No new risks. The demo built-in case continues to use standard Next.js router.
- Next recommended step: Review the PR.
- Suggested commit message: `fix: preserve imported case across stage navigation`

## 2026-06-22: Imported Blind Read State Isolation

- Agent/model: Codex (GPT-5)
- Prompt scope: Fix the imported-case Blind Read progression bug where a validated `CasePackage` with `case.case_id = "case-arena-001"` could collide with the built-in seeded verdict demo/session review state and make the reviewer feel stuck after a blind interpretation was selected.
- Files changed: `lib/importCasePackageV01.ts`, `lib/importCasePackageV01.test.ts`, `lib/exportReview.ts`, `components/arena/BlindReadPanel.tsx`, `app/page.test.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Imported CasePackages now receive a local-only UI review identity derived from package ID, package revision, and package case ID, so imported review state no longer shares the built-in demo `case-arena-001` slot. `ReviewResult` export still preserves the original compact CasePackage identity and fails loudly on mismatched package references. Blind Read now shows `Continue to AI Reveal` after reveal instead of `Return to AI Reveal`.
- Decisions made: Kept the CasePackage contract unchanged; kept imported package state local-only; preserved the built-in direct-verdict seeded demo; did not loosen validation; allowed only the exact imported UI identity format to differ from `case_package.case_id` during ReviewResult export.
- Checks run: Focused `npm test -- lib/importCasePackageV01.test.ts app/page.test.ts lib/exportReview.test.ts lib/arenaReviewState.test.ts` passed with 50 tests; `npm test` passed with 168 tests; `npx tsc --noEmit` passed; `npm run lint` passed with 0 errors and the existing 134 warnings under `.agents/skills/impeccable`; `npm run build` passed; `git diff --check` passed.
- Assumptions: The UI-only imported identity is an internal review-state key and must not be serialized into `ReviewResult` or `EvaluationReport` artifacts.
- Risks/follow-ups: Imported packages with the same `package_id` as a built-in fixture still intentionally produce ReviewResults for that exact CasePackage identity; local report grouping remains by compact CasePackage reference, not UI review key.
- Next recommended step: Run the full validation suite and publish the scoped bugfix PR.
- Suggested commit message: `fix(review): isolate imported blind state`

## 2026-06-22: Validation Pilot Protocol

- Agent/model: Codex (GPT-5)
- Prompt scope: Prepare Telemetry Court for a small validation pilot using 3-5 approved realistic CasePackages, 2-3 independent reviewers, exported/imported ReviewResult bundles, and at least one EvaluationReport, without adding product features, backend persistence, databases, auth, raw telemetry ingestion, SIEM/SOC behavior, chatbot behavior, consensus/adjudication, reviewer scoring, or real Toponymy/DataMapPlot/ACME4/CloudTrail support.
- Files changed: `docs/VALIDATION_PILOT_PROTOCOL.md` and `docs/CHANGELOG_AI.md`.
- Summary: Added a concise pilot protocol covering objective, required inputs, CasePackage acceptance checklist, independent reviewer workflow, ReviewResult bundle aggregation workflow, report verification, success and failure criteria, pilot notes template, and post-pilot decision paths.
- Decisions made: Kept the protocol docs-only and local-utility focused; treated realistic/sanitized CasePackages as approved package-boundary inputs from upstream pipelines or notebooks; preserved exact CasePackage-reference aggregation semantics rather than implying cross-package benchmarking or a report-set contract; explicitly prohibited fake pilot results and unsupported adapter/support claims.
- Checks run: No separate docs or markdown lint script is configured; `npm test` passed with 164 tests; `npx tsc --noEmit` passed; `npm run lint` passed with 0 errors and the existing 134 warnings under `.agents/skills/impeccable`; `npm run build` passed; `git diff --check` passed.
- Assumptions: The merged Local Utility Gate capabilities from PRs #103-#107 are available on `main`, and realistic pilot packages will be approved and sanitized before review.
- Risks/follow-ups: The protocol may reveal that package authoring or result interpretation needs more guidance before adapter-boundary implementation should begin.
- Next recommended step: Run the pilot with approved realistic CasePackages, then use the notes and EvaluationReport output to decide whether to improve package authoring, review clarity, report explanations, or start Toponymy/DataMapPlot adapter-boundary work.
- Suggested commit message: `docs(pilot): add validation protocol`

## 2026-06-22: Imported Package To EvaluationReport Smoke Test

- Agent/model: Codex (GPT-5)
- Prompt scope: Implement issue #101 by adding a deterministic end-to-end smoke test for the local Utility Gate path from imported `CasePackage` JSON through structured review, `ReviewResult` bundle exchange, local results loading, `EvaluationReportV01` aggregation, and report exportability, without adding backend persistence, raw telemetry ingestion, auth, SIEM/SOC behavior, chatbot behavior, or product redesign.
- Files changed: `lib/localUtilityGateSmokeV01.test.ts` and `docs/CHANGELOG_AI.md`.
- Summary: Added a focused integration smoke test that serializes a safe synthetic Toponymy-style package as external JSON, imports it through `importCasePackageV01Json`, drives the real arena review-state reducer and ReviewResult export builder, exports/imports a strict `review_result_bundle.v0.1`, loads it through the local EvaluationReport path, and verifies deterministic `EvaluationReportV01` traceability plus JSON/CSV export shape. Added a guard proving an incompatible review protocol is rejected before it can contaminate local aggregation.
- Decisions made: Reused the existing import, validation, review-state, ReviewResult export, bundle validation, local results, aggregation, and export helpers instead of adding a smoke-test-only metrics path. Kept the fixture synthetic and raw-free, with test-local readiness metrics only where the current UI adapter requires available values.
- Checks run: Focused `npm test -- lib/localUtilityGateSmokeV01.test.ts` passed with 2 tests; related utility-loop suite `npm test -- lib/localUtilityGateSmokeV01.test.ts lib/importCasePackageV01.test.ts lib/reviewResultBundleV01.test.ts lib/localEvaluationResultsV01.test.ts lib/evaluationReportV01.test.ts lib/evaluationReportExportV01.test.ts` passed with 64 tests; `npm test` passed with 164 tests; `npx tsc --noEmit` passed; `npm run lint` passed with 0 errors and the existing 134 warnings under `.agents/skills/impeccable`; `npm run build` passed; `git diff --check` passed.
- Assumptions: The synthetic Toponymy-style fixture remains an approved non-authoritative package boundary fixture, not real Toponymy/DataMapPlot support. Full provenance and sanitization metadata remain auditable at the imported package boundary, while ReviewResult and EvaluationReport continue to carry the existing compact CasePackage and pipeline reference by design.
- Risks/follow-ups: The smoke test proves the local deterministic utility path, not durable multi-user persistence, consensus, real adapter ingestion, or research-grade metrics. Browser-local storage remains a local validation-slice mechanism.
- Next recommended step: Run a small validation pilot with 3-5 approved realistic CasePackages and 2-3 reviewers after this proof is merged, then return to Toponymy/DataMapPlot adapter-boundary work.
- Suggested commit message: `test(evaluation): add imported package smoke`

## 2026-06-21: Local And Imported ReviewResult Results

- Agent/model: Codex (GPT-5)
- Prompt scope: Implement issue #100 by replacing the fixture-only `/results` route with a local EvaluationReport-style summary built from validated browser-local and imported `ReviewResultV01` artifacts, while preserving the synthetic demo, CasePackage import diagnostics, #99 bundle exchange, and the local-only architecture boundary.
- Files changed: `app/results/page.tsx`, `app/results/page.test.ts`, `app/page.test.ts`, `app/investigation-workflow.css`, `components/arena/AppShell.tsx`, `components/evaluation/LocalEvaluationResults.tsx`, `components/evaluation/LocalEvaluationResults.test.ts`, `lib/localEvaluationResultsV01.ts`, `lib/localEvaluationResultsV01.test.ts`, `docs/PRODUCT_VISION.md`, `docs/EVALUATION_INFRASTRUCTURE.md`, and `docs/CHANGELOG_AI.md`.
- Summary: Added a results-page loader over the versioned local ReviewResult store, grouped exact CasePackage references into separate reports, reused `aggregateReviewResultsV01`, exposed total result and package coverage, compact package/pipeline provenance, existing verdict/label/evidence/agreement/disagreement signals, per-report JSON/CSV export, an empty state, and direct local bundle import. Added minimal Results and Review cases navigation.
- Decisions made: Kept aggregation local-only and one exact CasePackage reference per report; reused #99 bundle validation and atomic store import; rejected invalid, incompatible, and duplicate bundle results without changing the current snapshot; showed exclusions explicitly; retained all existing EvaluationReport semantics rather than adding rates, scores, consensus, or a parallel metrics system.
- Checks run: Focused #100, demo, CasePackage-import, invalid-package, bundle, storage, and results tests passed with 72 tests; `npm test` passed with 162 tests; `npx tsc --noEmit` passed; `npm run lint` passed with 0 errors and the existing 134 warnings under `.agents/skills/impeccable`; `npm run build` passed and kept `/results` statically prerendered; `git diff --check` passed. Headless Playwright verified the home-to-results navigation, empty state, validated localStorage populated state, package provenance, report signals, zero framework overlays/console errors, and zero horizontal overflow at a 390px viewport.
- Assumptions: Browser-local and imported ReviewResults share the same strict versioned store after import. Result origin is not added to the ReviewResult contract, so the page reports store and package provenance rather than inventing local/imported origin metadata per review.
- Risks/follow-ups: Browser localStorage remains device-local and is not durable multi-user study infrastructure. Exact package-reference compatibility intentionally prevents cross-package aggregation. Issue #101 still owns the imported CasePackage -> review -> exported/imported ReviewResult -> EvaluationReport smoke test.
- Next recommended step: Implement #101 as a focused end-to-end utility-loop smoke test using the now-complete local results surface.
- Suggested commit message: `feat(evaluation): build local results page`

## 2026-06-21: Portable ReviewResult Bundles

- Agent/model: Codex (GPT-5)
- Prompt scope: Implement issue #99 by exporting and importing portable local `ReviewResultV01` bundles without implementing #100's results workflow, #101's end-to-end imported-package-to-report smoke test, backend persistence, databases, auth, accounts, upload services, raw telemetry ingestion, SIEM/SOC workflows, chatbot UI, or real Toponymy/ACME4 support.
- Files changed: `lib/reviewResultBundleV01.ts`, `lib/reviewResultBundleV01.test.ts`, `lib/reviewResultValidationV01.ts`, `lib/reviewResultStorageV01.ts`, `lib/reviewResultStorageV01.test.ts`, `lib/reviewResultV01.ts`, `components/arena/ReviewResultBundleControl.tsx`, `components/arena/ReviewResultBundleControl.test.ts`, `components/arena/AppShell.tsx`, `app/investigation-workflow.css`, `app/page.test.ts`, `docs/REVIEW_RESULT_CONTRACT.md`, and `docs/CHANGELOG_AI.md`.
- Summary: Added the versioned `review_result_bundle.v0.1` local JSON envelope with bundle metadata, declared ReviewResult/protocol/CasePackage compatibility, one or more fully validated `ReviewResultV01` artifacts for one CasePackage, deterministic result ordering, and a dated filename. The main shell now exports locally saved reviews for the selected CasePackage and imports local bundle JSON through a compact utility control.
- Decisions made: Added strict unknown-input ReviewResult and bundle validation; rejected malformed JSON, unsupported or unknown fields, invalid timestamps, inconsistent review identity, incomplete blind-review state, missing evidence decisions, duplicate result IDs, duplicate reviewer/session submissions, mixed CasePackage IDs, incompatible exact CasePackage references, differing blind-review settings, and differing stable evidence-ID sets; staged every import before one local-store write; rejected collisions rather than overwriting existing local results; applied the same ReviewResult validator to the local store; kept single ReviewResult export upsert behavior unchanged.
- Checks run: Focused bundle, storage, session, export, CasePackage import, component, and app tests passed with 71 tests; `npm test` passed with 153 tests; `npx tsc --noEmit` passed; `npm run lint` passed with 0 errors and the existing 134 warnings under `.agents/skills/impeccable`; `npm run build` passed; `git diff --check` passed.
- Assumptions: Each bundle contains ReviewResults for exactly one CasePackage ID and retains the exact package revision, compact package/pipeline/model/prompt compatibility, blind-review setting, and stable evidence-ID set required for later aggregation. Imported results remain browser-local until a user exports them again.
- Risks/follow-ups: Issue #100 still needs to select and aggregate local/imported ReviewResults into the results workflow. Issue #101 still owns the broader imported CasePackage -> review -> exported/imported result -> EvaluationReport smoke test. Lint still reports 134 pre-existing warnings in local `.agents/skills/impeccable` scripts.
- Next recommended step: Implement #100 from the validated local ReviewResult store and bundle-import boundary without widening into backend persistence or generic results dashboards.
- Suggested commit message: `feat(review-results): export and import bundles`

## 2026-06-21: CasePackage Import Failure Diagnostics

- Agent/model: Codex (GPT-5)
- Prompt scope: Start issue #98 by replacing the minimal invalid-package import status with useful, safe failure diagnostics, without implementing #99 ReviewResult bundle import/export, #100 local/imported ReviewResult results, #101 end-to-end smoke testing, backend persistence, databases, auth, upload services, raw telemetry ingestion, SIEM/SOC workflows, chatbot UI, or real Toponymy/ACME4 support.
- Files changed: `lib/importCasePackageV01.ts`, `lib/importCasePackageV01.test.ts`, `components/arena/CasePackageImportControl.tsx`, `components/arena/AppShell.tsx`, `components/arena/RoutedAppShell.tsx`, `components/arena/WorkflowPrimitives.test.tsx`, `app/investigation-workflow.css`, and `docs/CHANGELOG_AI.md`.
- Summary: Added import failure categories for malformed JSON, missing or unsupported schema versions, structural `CasePackageV01` validation failures, and contract-valid packages that cannot enter the current review workflow. The import control now renders a failure panel with concise summary, error count, visible path/code/message diagnostics, suggested fix, review-not-started state, redacted messages, choose-another-file, clear-failed-import/return-to-demo, and copy-diagnostics actions. The import-to-review route transition preserves the validated in-memory CasePackage instead of remounting the routed shell and showing a demo case.
- Decisions made: Kept the existing local file import architecture from #97; kept strict validation and adapter readiness as blocking failures; capped visible and copied diagnostics; preserved successful imports in React memory and the synthetic demo fixture flow; used the Next.js-integrated native History API only for the import-to-review transition; made returning to the demo an explicit clear action.
- Checks run: Focused `npm test -- lib/importCasePackageV01.test.ts components/arena/WorkflowPrimitives.test.tsx` passed with 9 tests; `npm test` passed with 129 tests; `npx tsc --noEmit` passed; `npm run lint` passed with 0 errors and the existing 134 warnings under `.agents/skills/impeccable`; `npm run build` passed; `git diff --check` passed.
- Assumptions: The current UI readiness requirements from the CasePackage adapter remain valid: an AI-generated label, reviewable evidence, representative sessions, neighbor context, embedding coordinates, and available metrics are still needed before review can start.
- Risks/follow-ups: This does not aggregate ReviewResults, import/export result bundles, or run an end-to-end import-to-report smoke test. #99 remains the next step after #98.
- Next recommended step: Implement #99 ReviewResult bundle export/import after this PR is reviewed.
- Suggested commit message: `feat: show CasePackage import diagnostics`

## 2026-06-21: Local CasePackage JSON Import

- Agent/model: Codex (GPT-5)
- Prompt scope: Start issue #97 by adding local `CasePackageV01` JSON import into the existing review flow, without implementing #98's full invalid-package UI, ReviewResult bundle import/export, report generation from imported results, backend persistence, uploads, auth, database work, raw telemetry ingestion, SIEM/SOC workflows, chatbot UI, or real Toponymy/ACME4 support.
- Files changed: `lib/importCasePackageV01.ts`, `lib/importCasePackageV01.test.ts`, `lib/casePackageV01ToCaseFile.ts`, `lib/arenaReviewState.ts`, `components/arena/CasePackageImportControl.tsx`, `components/arena/AppShell.tsx`, `components/arena/WorkflowPrimitives.test.tsx`, `app/investigation-workflow.css`, and `docs/CHANGELOG_AI.md`.
- Summary: Added an in-browser `Import CasePackage` entry point that accepts local `.json` files, parses JSON safely, validates unknown input with `validateCasePackageV01`, adapts successful packages through the existing CasePackage-to-CaseFile adapter, and opens the imported package at the case-file review step. The default synthetic fixture flow remains available when no file is imported.
- Decisions made: Kept imported package state in React memory only and avoided server upload, backend persistence, databases, accounts, or raw telemetry behavior; generated the small current-UI compatibility seed from validated package fields rather than adding a second adapter; kept import failure status intentionally minimal for #97.
- Review correction: Captured the file input element before the async file read so repeated imports can reset the chooser without throwing after React clears the event target.
- Checks run: Focused `npm test -- lib/importCasePackageV01.test.ts lib/casePackageV01ToCaseFile.test.ts lib/arenaReviewState.test.ts components/arena/WorkflowPrimitives.test.tsx data/casePackageFixtures.test.ts` passed with 20 tests; `npx tsc --noEmit` passed; `npm test` passed with 127 tests; `npm run lint` passed with 0 errors and the existing 134 warnings under `.agents/skills/impeccable`; `npm run build` passed; `git diff --check` passed; manual Playwright smoke on `next start --hostname 127.0.0.1 --port 3100` passed for demo open, valid import, malformed JSON rejection, and structurally invalid package rejection.
- Assumptions: The existing UI still requires compatibility fields such as available metrics, at least two candidate labels, representative sessions, neighbor context, and map coordinates before a validated package can be reviewed.
- Risks/follow-ups: #98 should replace the minimal import failure status with a more useful invalid-package diagnostic flow. Later issues still need ReviewResult bundle exchange and report generation from local/imported results.
- Next recommended step: Implement #98's invalid-package failure UI after #97 is reviewed.
- Suggested commit message: `feat: import local CasePackage JSON`

## 2026-06-21: Utility Gate Roadmap Correction

- Agent/model: Codex (GPT-5)
- Prompt scope: Correct the product roadmap without resetting the validation-bench direction; keep `CasePackage` -> `ReviewResult` -> `EvaluationReport`; prioritize real utility through local package import, strict validation, ReviewResult persistence/export/import, aggregation, and EvaluationReport output before evidence-constrained AI assistance.
- Files changed: `docs/PRODUCT_VISION.md`, `docs/PRODUCT_POSITIONING.md`, `docs/PROJECT_CONTEXT.md`, `docs/EVALUATION_INFRASTRUCTURE.md`, `docs/ROADMAP.md`, `docs/GITHUB_PLANNING.md`, `docs/ARCHITECTURE.md`, `docs/PRODUCT_DECISIONS.md`, and `docs/CHANGELOG_AI.md`.
- Summary: Added the Utility Gate: a feature is useful only if it helps produce or improve an auditable EvaluationReport from real or realistic CasePackages. Reframed Milestone 3 as the active Local Utility Gate, moved local CasePackage import, invalid-package failure UI, ReviewResult bundle exchange, local/imported results, and an end-to-end import-to-report smoke test ahead of AI assistance, and documented that fast review must remain evidence or batch validation rather than SOC triage.
- Decisions made: Kept AI assistance in the roadmap as later priority; preserved the Toponymy/DataMapPlot/ACME4 adapter boundary as approved CasePackage JSON rather than raw telemetry ingestion; avoided backend persistence, auth, accounts, databases, generic dashboards, SIEM connectors, operational action generation, and chatbot-first UI.
- Checks run: `git diff --check`; no npm tests were run because this was a documentation and GitHub planning change only.
- Assumptions: Existing local contract, export, storage, and fixture-backed report work should be treated as foundation, not as proof that imported-package evaluation is complete.
- Risks/follow-ups: The new Utility Gate issues still need implementation. The current app remains a local/static validation slice until package import, result bundle import, and report generation from imported/local results are implemented.
- Next recommended step: Implement the Local Utility Gate issue batch in dependency order before starting evidence-constrained AI assistance.
- Suggested commit message: `docs(roadmap): add utility gate`

## 2026-06-21: Synthetic ACME4-Style CasePackage Fixture

- Agent/model: Codex (GPT-5)
- Prompt scope: Start GitHub issue #64 only by adding one safe sanitized ACME4-style fixture that validates through the existing `CasePackage v0.1` boundary, without relying on real ACME4 schemas, restricted telemetry, APIs, outputs, ingestion workflows, adding a general adapter framework, runtime import UI, backend persistence, upload flow, auth, SIEM/SOC behavior, chatbot behavior, scoring/adjudication, consensus logic, UI redesign, or modifying the Toponymy-style fixture.
- Files changed: `data/syntheticAcme4StyleCasePackageFixture.ts`, `data/syntheticAcme4StyleCasePackageFixture.test.ts`, `docs/ADAPTER_BOUNDARY.md`, `docs/CASE_PACKAGE_CONTRACT.md`, `docs/PROJECT_CONTEXT.md`, and `docs/CHANGELOG_AI.md`.
- Summary: Added a Telemetry Court-owned synthetic, sanitized ACME4-style adapter-input fixture and fixture-only converter that emits one validated `CasePackageV01` object. The package includes synthetic feature-family summaries, generated and baseline labels, explicit claims, evidence-to-claim mappings, representative sessions, neighbor and outlier context, safe source-artifact references, provenance metadata, sanitization metadata, and canonical review configuration values.
- Decisions made: Kept the helper explicitly fixture-only and named it as a synthetic converter rather than production support; used an ACME4-style input shape owned by Telemetry Court without claiming real ACME4 compatibility; self-validated the exported package at module load; used `sanitization.status: "sanitized"`, `data_classification: "synthetic"`, safe `source_artifact_id` references, and `raw_drilldown_allowed: false`.
- Checks run: Red `npm test -- data/syntheticAcme4StyleCasePackageFixture.test.ts` failed before the fixture module existed; targeted `npm test -- data/syntheticAcme4StyleCasePackageFixture.test.ts` passed with 5 tests after implementation; targeted fixture/validation/adapter set `npm test -- data/syntheticAcme4StyleCasePackageFixture.test.ts data/syntheticToponymyStyleCasePackageFixture.test.ts data/casePackageFixtures.test.ts lib/casePackageV01.test.ts lib/casePackageValidation.test.ts lib/casePackageV01ToCaseFile.test.ts` passed with 32 tests; `npm test` passed with 122 tests; `npm run lint` passed with 0 errors and the existing 134 warnings under `.agents/skills/impeccable`; `npm run build` passed; `npx tsc --noEmit` passed; `git diff --check` passed.
- Assumptions: A small synthetic, sanitized fixture is enough to exercise the boundary for issue #64 because real ACME4 adapter behavior, source-specific validation, restricted-data handling, ingestion, and review-to-report proof remain future work.
- Risks/follow-ups: This fixture is non-authoritative and should not be promoted as real ACME4 support. Future real adapter work still needs approved upstream artifacts, source-specific conversion rules, restricted-environment processing, and end-to-end review/evaluation validation.
- Next recommended step: Review and merge this focused fixture PR before starting any real ACME4 adapter prototype or package import workflow.
- Suggested commit message: `data(fixtures): add synthetic acme4-style package`

## 2026-06-21: Synthetic Toponymy-Style CasePackage Fixture

- Agent/model: Codex (GPT-5)
- Prompt scope: Start GitHub issue #63 only by adding one safe synthetic Toponymy/DataMapPlot-style fixture that validates through the existing `CasePackage v0.1` boundary, without relying on real Toponymy APIs, executing Toponymy or DataMapPlot, ingesting restricted telemetry, adding ACME4 fixture work, adding an adapter framework, runtime import UI, backend persistence, upload flow, auth, SIEM/SOC behavior, chatbot behavior, scoring/adjudication, consensus logic, or UI redesign.
- Files changed: `data/syntheticToponymyStyleCasePackageFixture.ts`, `data/syntheticToponymyStyleCasePackageFixture.test.ts`, `docs/ADAPTER_BOUNDARY.md`, `docs/TOPONYMY_NOTES.md`, `docs/CASE_PACKAGE_CONTRACT.md`, and `docs/CHANGELOG_AI.md`.
- Summary: Added a Telemetry Court-owned synthetic adapter-input fixture and fixture-only converter that emits one validated `CasePackageV01` object. The package includes synthetic map positions, synthetic labels and claims, safe evidence summaries, explicit evidence-to-claim mappings, representative sessions, neighbor and outlier context, provenance, sanitization metadata, and canonical review configuration values.
- Decisions made: Kept the helper explicitly fixture-only and named it as a synthetic converter rather than a production adapter; used the documented Toponymy/DataMapPlot-style input shape as guidance without claiming official support; self-validated the exported package at module load; preserved raw-free source-artifact references and `raw_drilldown_allowed: false`.
- Checks run: Red `npm test -- data/syntheticToponymyStyleCasePackageFixture.test.ts` failed before the fixture module existed; targeted `npm test -- data/syntheticToponymyStyleCasePackageFixture.test.ts` passed with 4 tests after implementation; targeted fixture/validation/adapter set `npm test -- data/syntheticToponymyStyleCasePackageFixture.test.ts data/casePackageFixtures.test.ts lib/casePackageV01.test.ts lib/casePackageValidation.test.ts lib/casePackageV01ToCaseFile.test.ts` passed with 27 tests; `npm test` passed with 117 tests; `npm run lint` passed with 0 errors and the existing 134 warnings under `.agents/skills/impeccable`; `npm run build` passed; `npx tsc --noEmit` passed; `git diff --check` passed.
- Assumptions: A small synthetic fixture is enough to exercise the boundary for issue #63 because real adapter behavior, official Toponymy compatibility, DataMapPlot execution, and restricted-data handling remain future work.
- Risks/follow-ups: This fixture is non-authoritative and should not be promoted as real Toponymy support. Future real adapter work still needs approved upstream artifacts, source-specific validation, and an end-to-end review-to-report proof.
- Next recommended step: Review and merge this focused fixture PR before starting ACME4 fixture work or any real adapter prototype.
- Suggested commit message: `feat(fixtures): add synthetic toponymy-style package`

## 2026-06-21: Toponymy/DataMapPlot Adapter Input Shape

- Agent/model: Codex (GPT-5)
- Prompt scope: Start GitHub issue #62 only by documenting the precomputed, sanitized adapter input shape for Toponymy/DataMapPlot-style cluster outputs without implementing an adapter, claiming official upstream support, ingesting raw restricted telemetry, inventing upstream function signatures, adding fixtures for later issues, persistence, auth, UI redesign, scoring, adjudication, consensus, or chatbot behavior.
- Files changed: `docs/ADAPTER_BOUNDARY.md` and `docs/CHANGELOG_AI.md`.
- Summary: Added a Telemetry Court-owned intermediate adapter-input shape between upstream notebooks or pipelines and future `CasePackage v0.1` conversion. The doc now names required field groups for artifact identity, dataset context, pipeline context, clusters, map positions, labels, claims, evidence references, evidence-to-claim mappings, representative items, neighbors, outlier/impostor candidates, metrics, provenance, and sanitization. It also includes explicit unknown/unavailable envelopes and a minimal sanitized JSON sketch.
- Decisions made: Treated "Toponymy/DataMapPlot-style" as shape-compatible inspiration rather than official support; cited official Toponymy and DataMapPlot README sections only for broad factual grounding; kept the adapter input distinct from `CasePackage`, `ReviewResult`, and `EvaluationReport`; required future conversion to fail loudly when required fields are unavailable rather than inventing placeholder IDs, labels, coordinates, provenance, or sanitization details.
- Checks run: Parsed all four JSON code blocks in `docs/ADAPTER_BOUNDARY.md`; `git diff --check` passed. Full npm checks were not run because this is a documentation-only change with no TypeScript, fixture, runtime, or UI edits.
- Assumptions: A future adapter can consume an approved sanitized artifact from an upstream environment, but that artifact remains outside Telemetry Court's current runtime until an adapter and validation path are implemented.
- Risks/follow-ups: The documented input sketch is non-authoritative and unvalidated by code. It does not add Toponymy execution, DataMapPlot execution, ACME4 ingestion, raw telemetry import, package upload, backend persistence, adapter-generated fixtures, scoring, adjudication, consensus, or UI behavior.
- Next recommended step: Review this boundary before implementing any Toponymy/DataMapPlot-style adapter prototype or adding realistic adapter fixtures.
- Suggested commit message: `docs(adapter): define cluster output input shape`

## 2026-06-21: Reviewer Agreement And Disputed Evidence Metrics

- Agent/model: Codex (GPT-5)
- Prompt scope: Start GitHub issue #61 only by adding deterministic reviewer-agreement and disputed-evidence metrics to `EvaluationReportV01`, without forcing consensus, treating disagreement as reviewer error, adding statistical coefficients, scoring/adjudication, persistence, auth/accounts, upload/import, raw telemetry behavior, chatbot behavior, adapter implementation, or dashboard redesign.
- Files changed: `lib/evaluationReportV01.ts`, `lib/evaluationReportV01.test.ts`, `lib/evaluationReportExportV01.ts`, `lib/evaluationReportExportV01.test.ts`, `components/evaluation/EvaluationReportResults.tsx`, `components/evaluation/EvaluationReportResults.test.ts`, `app/results/page.test.ts`, `docs/PRODUCT_VISION.md`, `docs/PROJECT_CONTEXT.md`, `docs/DATA_MODEL.md`, `docs/REVIEW_RESULT_CONTRACT.md`, `docs/EVALUATION_INFRASTRUCTURE.md`, and `docs/CHANGELOG_AI.md`.
- Summary: Added additive `reviewer_agreement` signals for final verdict, selected label, evidence ratings by stable evidence ID, and a major failure mode when a review selected exactly one mode. Signals retain compared and unavailable reviewer counts, sorted observed values, distinct-value counts, explicit available/incomplete/unavailable states, and nullable unanimity. Per-evidence entries identify disputes without choosing a correct rating. Bumped the calculation version to `review_result_aggregation.v0.3`, preserved the existing report schema and disagreement fields, and surfaced the new fields in deterministic JSON/CSV export and the fixture-backed `/results` view.
- Decisions made: Required at least two comparable reviewer values before `unanimous` can be true or false; treated one review as unavailable for agreement rather than aligned; preserved uncertainty values as ordinary observed decisions; marked partial per-evidence coverage incomplete without inventing a rating; treated zero comparable major failure-mode values as unavailable and partial failure-mode coverage as incomplete; derived no primary failure mode from zero or multiple selections; retained `disagreement.evidence_ids` as the sorted compatibility index of disputed evidence; made CSV legacy disagreement rows unavailable when fewer than two reviews exist.
- Checks run: Red-green aggregation tests covered agreement, disagreement, disputed evidence, incomplete evidence coverage, single-review unavailability, uncertainty, and failure-mode comparability. Targeted `npm test -- lib/evaluationReportV01.test.ts lib/evaluationReportExportV01.test.ts components/evaluation/EvaluationReportResults.test.ts app/results/page.test.ts` passed with 29 tests; `npm test` passed with 112 tests; `npm run lint` passed with 0 errors and the existing 134 warnings under `.agents/skills/impeccable`; `npm run build` passed and kept `/results` static; `npx tsc --noEmit` passed; `git diff --check` passed.
- Assumptions: Stable evidence IDs present in at least one input review are the only evidence universe available to the aggregator because it intentionally does not load the full CasePackage. The normal ReviewResult builder still requires one rating per package evidence item; incomplete aggregation states are defensive visibility for partial compatible inputs, not validation that a review is complete.
- Risks/follow-ups: `unanimous` is a descriptive all-observed-values flag, not a consensus decision or correctness claim. Major failure-mode comparison is unavailable or incomplete when reviewers select zero or multiple reason codes because ReviewResult has no primary-mode field. No advanced statistics, confidence weighting, adjudication, reviewer scoring, live model evaluation, raw telemetry scoring/search/export, durable persistence, auth/accounts, upload/import, chatbot behavior, or Toponymy/ACME4 adapter behavior was added.
- Next recommended step: Review and merge this focused PR before adding any broader evaluation rates or durable report workflow.
- Suggested commit message: `feat(evaluation): add reviewer agreement metrics`

## 2026-06-21: EvaluationReport Comparison Rollups

- Agent/model: Codex (GPT-5)
- Prompt scope: Start GitHub issue #60 only by adding deterministic descriptive comparison metrics for metadata already present in `ReviewResultV01` or its compact CasePackage reference, without live model evaluation, raw telemetry scoring, invented upstream metadata, adjudication, consensus, persistence, auth/accounts, upload/import, chatbot behavior, adapter implementation, or dashboard redesign.
- Files changed: `lib/evaluationReportV01.ts`, `lib/evaluationReportV01.test.ts`, `lib/evaluationReportExportV01.ts`, `lib/evaluationReportExportV01.test.ts`, `data/evaluationReportFixtures.ts`, `components/evaluation/EvaluationReportResults.tsx`, `components/evaluation/EvaluationReportResults.test.ts`, `app/investigation-workflow.css`, `docs/PRODUCT_VISION.md`, `docs/PROJECT_CONTEXT.md`, `docs/ARCHITECTURE.md`, `docs/DATA_MODEL.md`, `docs/REVIEW_RESULT_CONTRACT.md`, `docs/EVALUATION_INFRASTRUCTURE.md`, and `docs/CHANGELOG_AI.md`.
- Summary: Extended `EvaluationReportV01` with fixed-order `comparison_rollups` and bumped the calculation version to `review_result_aggregation.v0.2`. Rollups group review counts, evidence-decision counts, canonical verdict counts, and canonical evidence-rating counts by selected label ID plus available package, pipeline, embedding, clustering/projection, naming-model, and prompt reference metadata. JSON/CSV exports and the fixture-backed results view expose the groups, denominators, single-value context, and explicit unavailable metadata.
- Decisions made: Used only metadata already present in ReviewResults; represented all-missing optional dimensions with `status: "unavailable"`, a reason, and `missing_review_count`; kept dimensions in contract order and group values in exact lexical order; treated counts as descriptive human signals rather than scores, rankings, or claims that one upstream configuration is best; retained exact compact CasePackage compatibility, so only selected labels can currently form multiple groups within one report.
- Checks run: Red aggregation tests failed before `comparison_rollups` existed; red export tests failed before JSON/CSV preservation; red results tests failed before UI exposure. Targeted `npm test -- lib/evaluationReportV01.test.ts lib/evaluationReportExportV01.test.ts components/evaluation/EvaluationReportResults.test.ts app/results/page.test.ts` passed with 21 tests; `npm test` passed with 104 tests; `npm run lint` passed with 0 errors and the existing 134 warnings under `.agents/skills/impeccable`; `npm run build` passed and kept `/results` static; `npx tsc --noEmit` passed; `git diff --check` passed. Server-rendered `/results` HTML exposed the new available/single-value/unavailable states; the desktop browser automation bridge could not connect, so no visual screenshot review was completed.
- Assumptions: Package ID/revision are the only evidence-package identifiers present in the compact reference; label text and candidate-label model/prompt references are not available in `ReviewResultV01` and must not be reconstructed. One ReviewResult contributes one verdict and all of its evidence-rating decisions to each available dimension group.
- Risks/follow-ups: Exact package-reference compatibility prevents cross-package or cross-pipeline variant comparison inside one report, so model, prompt, embedding, and evidence-package rollups remain single-value context or unavailable. A later report-set contract would be needed for genuine cross-run benchmarking. No live model evaluation, quality ranking, raw telemetry scoring, statistical reviewer agreement, adjudication, consensus, persistence, auth/accounts, upload/import, chatbot behavior, or Toponymy/ACME4 adapter behavior was added.
- Next recommended step: Review the focused report-contract change and merge it before designing any cross-package benchmark or durable report workflow.
- Suggested commit message: `feat(evaluation): add metadata comparison rollups`

## 2026-06-21: EvaluationReport JSON And CSV Export

- Agent/model: Codex (GPT-5)
- Prompt scope: Start GitHub issue #59 only by adding deterministic `EvaluationReportV01` JSON/CSV export without turning `/results` into a BI/dashboard surface or adding raw telemetry export, new metrics, persistence, auth/accounts, upload/import, scoring/adjudication, consensus, chatbot behavior, Toponymy/ACME4 adapters, or broad UI redesign.
- Files changed: `lib/evaluationReportExportV01.ts`, `lib/evaluationReportExportV01.test.ts`, `components/evaluation/EvaluationReportExportActions.tsx`, `components/evaluation/EvaluationReportResults.tsx`, `components/evaluation/EvaluationReportResults.test.ts`, `app/results/page.test.ts`, `app/investigation-workflow.css`, `README.md`, `docs/PRODUCT_VISION.md`, `docs/PROJECT_CONTEXT.md`, `docs/ARCHITECTURE.md`, `docs/EVALUATION_INFRASTRUCTURE.md`, `docs/DATA_MODEL.md`, `docs/ROADMAP.md`, and `docs/CHANGELOG_AI.md`.
- Summary: Added a pure `EvaluationReportV01` export helper that serializes deterministic JSON and long-form CSV from an existing report. The CSV rows repeat compact CasePackage and pipeline provenance, use stable headers and canonical/sorted row ordering, escape cells, and mark unavailable aggregate sections explicitly. The fixture-backed `/results` view now offers small download-only JSON and CSV actions.
- Decisions made: Export helpers normalize ordering without mutating or recalculating the report; unavailable aggregate rows keep provenance but leave aggregate value/count cells blank instead of treating zero or false as conclusions; UI wiring is limited to two scoped download buttons on the existing read-only report surface.
- Review correction: Expanded the stable CSV provenance columns to preserve the CasePackage schema version and every compact pipeline reference field, including optional pipeline, model, clustering, projection, and prompt metadata.
- Checks run: Red helper test first failed on the missing export module; CSV test failed on missing serializer; ordering test failed until JSON distribution key order was canonicalized; unavailable CSV test failed until aggregate values/counts were blanked for unavailable rows; targeted `npm test -- components/evaluation/EvaluationReportResults.test.ts app/results/page.test.ts lib/evaluationReportExportV01.test.ts lib/evaluationReportV01.test.ts` passed with 18 tests; `npm test` passed with 101 tests; `npm run lint` passed with 0 errors and the existing 134 warnings under `.agents/skills/impeccable`; `npm run build` passed and kept `/results` static; `npx tsc --noEmit` passed; `git diff --check` passed.
- Assumptions: The first useful export is a portable serialization of an already-built `EvaluationReportV01`, not a report-generation, import, persistence, or durable multi-reviewer workflow.
- Risks/follow-ups: The `/results` export still uses the deterministic synthetic fixture and does not load browser-local ReviewResults, generate reports from selected packages, persist reports, export raw evidence, calculate research-grade rates, or coordinate multiple real reviewers.
- Next recommended step: Review and merge this focused PR before starting durable report workflow, adapter, model-comparison, or expanded metric issues.
- Suggested commit message: `feat(evaluation): export evaluation reports`

## 2026-06-21: EvaluationReport Results View

- Agent/model: Codex (GPT-5)
- Prompt scope: Start GitHub issue #58 only by adding the smallest `EvaluationReportV01` results view for aggregated reviewer output, without building a generic dashboard, backend persistence, auth/accounts, upload/import flow, CSV/JSON export, scoring/adjudication, consensus logic, chatbot behavior, Toponymy/ACME4 adapters, raw telemetry search, or broad UI redesign.
- Files changed: `app/results/page.tsx`, `app/results/page.test.ts`, `components/evaluation/EvaluationReportResults.tsx`, `components/evaluation/EvaluationReportResults.test.ts`, `data/evaluationReportFixtures.ts`, `app/investigation-workflow.css`, `README.md`, `docs/PRODUCT_VISION.md`, `docs/PROJECT_CONTEXT.md`, `docs/ARCHITECTURE.md`, `docs/EVALUATION_INFRASTRUCTURE.md`, `docs/DATA_MODEL.md`, `docs/ROADMAP.md`, and `docs/CHANGELOG_AI.md`.
- Summary: Added a fixture-backed `/results` route and pure `EvaluationReportResults` presentation component. The view shows reviewer count, verdict distribution, label-winner distribution, evidence-rating distribution, and disagreement indicators from an existing `EvaluationReportV01`, while explicitly distinguishing reviewer output from upstream CasePackage evidence and showing unavailable aggregate sections, including disagreement indicators, as unavailable.
- Decisions made: Kept the view read-only and presentation-only; reused existing workflow primitives and scoped styles; fed the route with a deterministic synthetic EvaluationReport fixture containing reviewer disagreement; treated missing reviewer output as unavailable rather than aligned or no-disagreement; did not wire localStorage retrieval, imports, exports, backend storage, new metrics, scoring, adjudication, consensus, or dashboard navigation.
- Checks run: Red component test first failed with missing `EvaluationReportResults`; red page test then failed with missing `/results` page; targeted `npm test -- components/evaluation/EvaluationReportResults.test.ts app/results/page.test.ts lib/evaluationReportV01.test.ts lib/reviewResultStorageV01.test.ts app/page.test.ts` passed with 41 tests after the unavailable-disagreement correction; `npm test` passed with 96 tests; `npm run lint` passed with 0 errors and the existing 134 warnings under `.agents/skills/impeccable`; `npm run build` passed and generated `/results` as a static route; `npx tsc --noEmit` passed; `git diff --check` passed.
- Assumptions: The smallest useful issue #58 view is a deterministic report reader over an already-built `EvaluationReportV01`, not a retrieval, import, export, or durable multi-user report workflow.
- Risks/follow-ups: The results route uses a synthetic fixture and does not load browser-local ReviewResults, aggregate user-selected packages, persist reports, export reports, resolve label/evidence IDs to upstream package content, calculate research-grade rates, or coordinate multiple real reviewers. Future work should define the report-generation workflow and durable storage requirements before choosing infrastructure.
- Next recommended step: Review and merge this focused PR before starting durable report workflow, export, adapter, or evaluation-metric expansion issues.
- Suggested commit message: `feat(evaluation): add results view`

## 2026-06-21: Local ReviewResult Persistence

- Agent/model: Codex (GPT-5)
- Prompt scope: Start GitHub issue #56 only by adding the smallest local persistence boundary for `ReviewResultV01` artifacts by CasePackage ID, without backend APIs, databases, auth/accounts, admin UX, generic CRUD, upload/import flow, raw telemetry storage, scoring, adjudication, consensus, Toponymy/ACME4 adapter work, chatbot behavior, SIEM/SOC behavior, or UI redesign.
- Files changed: `lib/reviewResultStorageV01.ts`, `lib/reviewResultStorageV01.test.ts`, `components/arena/AppShell.tsx`, `docs/REVIEW_RESULT_CONTRACT.md`, `docs/EVALUATION_INFRASTRUCTURE.md`, `docs/ARCHITECTURE.md`, `docs/DATA_MODEL.md`, `docs/PRODUCT_VISION.md`, `docs/PROJECT_CONTEXT.md`, `docs/PRODUCT_DECISIONS.md`, `docs/ROADMAP.md`, and `docs/CHANGELOG_AI.md`.
- Summary: Added a pure `ReviewResultV01` local-store helper over a minimal `getItem` / `setItem` storage interface. The store uses a versioned envelope, indexes saved ReviewResults by `case_package.package_id`, preserves schema/protocol/timestamp/reviewer-session/package-reference metadata, rejects unsupported or incompatible artifacts, and upserts repeated exports from the same reviewer/session. Wired the existing copy/download export actions to save the built ReviewResult to browser `localStorage` without changing the exported JSON shape.
- Decisions made: Persisted only `ReviewResultV01` artifacts rather than full CasePackages, claims, evidence content, support scores, raw references, or raw telemetry; reused the existing local review-session compatibility checks instead of inventing a backend model; treated this as a portable validation-slice capability, not target enterprise infrastructure.
- Checks run: Red storage test first failed with missing `reviewResultStorageV01`; targeted `npm test -- lib/reviewResultStorageV01.test.ts lib/reviewSessionV01.test.ts lib/evaluationReportV01.test.ts lib/exportReview.test.ts app/page.test.ts` passed with 50 tests; `npm test` passed with 93 tests; `npm run lint` passed with 0 errors and the existing 134 warnings under `.agents/skills/impeccable`; `npm run build` passed; `npx tsc --noEmit` passed; `git diff --check` passed.
- Assumptions: The smallest useful persistence boundary is browser-local storage triggered by existing export actions; a future report/import workflow can retrieve compatible results by CasePackage ID from the helper without introducing server infrastructure yet.
- Risks/follow-ups: Local browser storage is not durable multi-user study infrastructure, has no cross-device synchronization, no reviewer account model, and no report UI. Future work still needs explicit storage requirements for reviewer privacy, auditability, retention, concurrency, and evaluation exports before choosing backend infrastructure.
- Next recommended step: Review and merge this focused PR before starting later durable storage, report, adapter, or multi-reviewer workflow issues.
- Suggested commit message: `feat(review): persist review results locally`

## 2026-06-21: Invalid Package Render State

- Agent/model: Codex (GPT-5)
- Prompt scope: Start GitHub issue #55 only by adding the smallest invalid-package UI/developer error state so broken `CasePackage` input never renders as a normal review, without starting import, upload, persistence, auth, adapter, scoring, consensus, or UI redesign work.
- Files changed: `data/sampleCases.ts`, `components/arena/PackageReviewGate.tsx`, `app/[[...stage]]/page.tsx`, `app/globals.css`, `app/page.test.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Added a package-to-review render state that returns either validated adapted `CaseFile` objects or prefixed validation/compatibility errors. Routed the app through a `PackageReviewGate` that renders the normal review only for valid packages and otherwise shows a calm invalid-package diagnostic with path, code, and sanitized short message. Added UI test coverage proving invalid package errors render without exposing deliberately sensitive invalid values or normal review content.
- Decisions made: Reused `casePackageV01ToCaseFile` and `CasePackageValidationError` rather than adding a new import system; kept built-in valid sample behavior unchanged; redacted quoted values in UI error messages because validator messages may include raw invalid IDs or schema values; preserved path/code for developer actionability.
- Checks run: Red test failed before implementation with missing `PackageReviewGate`; targeted `npm test -- app/page.test.ts lib/casePackageV01ToCaseFile.test.ts data/casePackageFixtures.test.ts` passed with 32 tests; `npx tsc --noEmit` passed; `npm test` passed with 90 tests; `npm run lint` passed with 0 errors and the existing 134 warnings under `.agents/skills/impeccable`; `npm run build` passed; `git diff --check` passed.
- Assumptions: The current app still uses local validated fixture packages, so a deterministic render-state helper is the smallest useful harness for proving invalid-package rendering without adding upload/import infrastructure.
- Risks/follow-ups: The invalid-package UI intentionally does not resolve safe references, inspect raw telemetry, upload packages, persist diagnostics, or provide a full import wizard. Future package import work should reuse the same render state or equivalent sanitized error surface.
- Next recommended step: Review and merge this focused PR before starting later package import or adapter work.
- Suggested commit message: `feat(validation): show invalid package state`

## 2026-06-21: Adapter Boundary Documentation

- Agent/model: Codex (GPT-5)
- Prompt scope: Start GitHub issue #54 only by documenting the Toponymy / ACME4 adapter boundary without implementing an adapter, inventing upstream APIs, introducing raw restricted telemetry, or claiming real Toponymy or ACME4 support.
- Files changed: `docs/ADAPTER_BOUNDARY.md`, `docs/ARCHITECTURE.md`, `docs/CASE_PACKAGE_CONTRACT.md`, `docs/TOPONYMY_NOTES.md`, and `docs/CHANGELOG_AI.md`.
- Summary: Added a dedicated adapter-boundary note that defines the flow from upstream pipeline or notebook to precomputed cluster output, approved `CasePackage` JSON, Telemetry Court review, `ReviewResult`, and `EvaluationReport`. The note names Toponymy, DataMapPlot, ACME4-style experiments, CloudTrail-style experiments, and synthetic/sanitized package generators as possible upstream producer categories while keeping Telemetry Court on the package boundary.
- Decisions made: Kept the change documentation-only; framed future adapters as producers of approved package-shaped JSON; included a minimal synthetic/sanitized adapter-produced `CasePackage` example; explicitly stated that the repo must not claim real Toponymy, real ACME4, DataMapPlot execution, raw telemetry ingestion, persistence, auth, upload flows, scoring, adjudication, consensus, SIEM/SOC behavior, chatbot behavior, or UI redesign from this boundary work.
- Checks run: Embedded JSON example parsed and passed `validateCasePackageV01`; `git diff --check` passed. No formatter or markdown-check script is configured.
- Assumptions: A dedicated adapter-boundary doc plus links from architecture, the CasePackage contract, and Toponymy notes gives future adapter implementers a clearer handoff than expanding one existing product page.
- Risks/follow-ups: Future real adapters still need verified upstream source contracts, approved data-handling procedures, validation fixtures, and end-to-end review-to-report proof before any real support claim is made.
- Next recommended step: Use this boundary as the entry point for a later approved adapter prototype issue.
- Suggested commit message: `docs(adapter): document upstream package boundary`

## 2026-06-21: Issue #27 Contract Audit Closure

- Agent/model: Codex (GPT-5)
- Prompt scope: Audit issue #27 against merged Milestone 2 work after PR #85, without starting adapter, backend, persistence, UI, or next-issue work.
- Files changed: `lib/reviewResultV01.ts`, `lib/exportReview.test.ts`, `lib/evaluationReportV01.test.ts`, `docs/REVIEW_RESULT_CONTRACT.md`, `docs/EVALUATION_INFRASTRUCTURE.md`, and `docs/CHANGELOG_AI.md`.
- Summary: Found one direct contract gap before closing #27: `ReviewResultV01` did not expose confidence or optional notes. Added optional reviewer confidence and notes to the type, documented that the current local exporter omits them because the UI does not capture those values, and clarified how existing EvaluationReport v0.1 distributions represent cluster impurity, split/merge recommendation counts, common failure modes, metadata rollups, and recommended follow-up actions without adding scoring or consensus logic.
- Decisions made: Kept the patch type/docs/test-only; did not change the exporter output, aggregation algorithm, UI workflow, persistence, adapters, or durable schema version. Treated named rates as future calculated metrics that require explicit denominators and calculation versions.
- Checks run: Targeted contract checks passed with `npm test -- lib/exportReview.test.ts lib/evaluationReportV01.test.ts lib/reviewSessionV01.test.ts` (22 tests); `npm test` passed with 89 tests; `npm run lint` passed with 0 errors and the existing 134 warnings under `.agents/skills/impeccable`; `npm run build` passed; `npx tsc --noEmit` passed; `git diff --check` passed.
- Assumptions: Optional confidence and notes satisfy the v0.1 contract requirement without fabricating values in the current synthetic export path; EvaluationReport v0.1 can satisfy #27's rollup requirements through distributions and traceable references rather than separate score fields.
- Risks/follow-ups: Future protocols need UI or import support before local exports can populate confidence and free-form notes. Future rate exports still need explicit metric definitions.
- Next recommended step: Close issue #27 after the focused PR is reviewed and merged.
- Suggested commit message: `model(review): close review result contract gaps`

## 2026-06-21: Verdict And Failure-Mode Semantics

- Agent/model: Codex (GPT-5)
- Prompt scope: Start GitHub issue #28 only by defining the evaluation semantics for canonical final verdicts and failure-mode reason codes, after reading current contract/evaluation docs, ReviewResult/EvaluationReport types, sample cases, and relevant tests; audit issue #27 for effective satisfaction without expanding into #27 implementation.
- Files changed: `docs/VERDICT_AND_FAILURE_MODE_SEMANTICS.md`, `docs/CASE_PACKAGE_CONTRACT.md`, `docs/REVIEW_RESULT_CONTRACT.md`, `docs/EVALUATION_INFRASTRUCTURE.md`, `docs/PRODUCT_VISION.md`, and `docs/CHANGELOG_AI.md`.
- Summary: Added a dedicated semantics document for `supported`, `partially_supported`, `unsupported_or_overclaimed`, `uncertain`, `cluster_impure`, `needs_split`, `needs_merge`, and `needs_better_evidence`, covering evidence conditions, missing-vs-contradictory-vs-uncertain distinctions, primary evaluation concepts, EvaluationReport contributions, and invalid inferences. Also mapped current structured failure-mode reason codes to evaluation concepts and linked the new semantics from the product, package, review-result, and evaluation docs.
- Decisions made: Kept the change documentation-first and did not alter TypeScript contracts, sample cases, scoring, aggregation, UI, persistence, or adapters; treated `final_verdict` as the primary evaluation judgment and `failure_modes` as secondary reason-code counts; preserved reviewer disagreement as distributions and flags rather than consensus; kept split and merge as human recommendations for upstream review, not automatic clustering actions.
- Checks run: Targeted vocabulary/fixture checks passed with `npm test -- lib/exportReview.test.ts lib/evaluationReportV01.test.ts data/casePackageFixtures.test.ts` (20 tests); `npm test` passed with 88 tests; `npm run lint` passed with 0 errors and the existing 134 warnings under `.agents/skills/impeccable`; `npm run build` passed; `npx tsc --noEmit` passed; `git diff --check` passed. No formatter script is configured.
- Assumptions: Issue #27 is effectively satisfied locally by the existing `ReviewResultV01`, `EvaluationReportV01`, local review-session, contract docs, and tests, so this issue only needed a semantics layer over the existing vocabulary; the current UI legacy `unsupported_overclaimed` value remains acceptable because export tests prove it maps to canonical `unsupported_or_overclaimed`.
- Risks/follow-ups: These semantics do not add scoring algorithms, automated adjudication, live AI evaluation, backend persistence, auth, raw telemetry ingestion, SIEM/SOC behavior, chatbot behavior, Toponymy/ACME4 implementation, or UI redesign. Future metric implementations still need explicit numerators, denominators, incomplete-review treatment, schema compatibility, and calculation versions.
- Next recommended step: Human review of the semantics before implementing any named EvaluationReport rates or changing durable review vocabulary.
- Suggested commit message: `docs(evaluation): define verdict semantics`

## 2026-06-21: Milestone 2 Regression Coverage Hardening

- Agent/model: Codex (GPT-5)
- Prompt scope: Inspect GitHub issue #53, compare its acceptance criteria against the merged Milestone 2 validation, adapter, export, aggregation, and multi-reviewer tests, and add only missing regression coverage without introducing new product behavior.
- Files changed: `lib/casePackageValidation.test.ts` and `docs/CHANGELOG_AI.md`.
- Summary: Added the one uncovered #53 regression test: packages without `claims` now have an explicit behavior-oriented test proving they fail runtime CasePackage validation before review evidence can be trusted.
- Decisions made: Treated existing tests as satisfying valid package, broken evidence links, missing provenance, invalid metric bounds, package-to-UI adapter, ReviewResult export, EvaluationReport aggregation, and behavior-oriented naming; avoided duplicate tests and made no production-code changes.
- Checks run: `npm test` passed with 88 tests; `npm run lint` passed with 0 errors and the existing 134 warnings under `.agents/skills/impeccable`; `npm run build` passed; `npx tsc --noEmit` passed; `git diff --check` passed.
- Assumptions: Issue #53 intended explicit regression coverage for named package-boundary risks, so a generic missing top-level-section test deleting `dataset` was not strong enough to count as missing-claims coverage.
- Risks/follow-ups: None known; this is test-only hardening and does not add persistence, uploads, backend APIs, auth/accounts, dashboards, report UI, Toponymy/ACME4 import, raw telemetry ingestion, or UI redesign.
- Next recommended step: Review and merge this test-only PR before starting later Milestone 3 or adapter work.
- Suggested commit message: `test(validation): harden Milestone 2 regression coverage`

## 2026-06-21: Multi-Reviewer Review Sessions

- Agent/model: Codex (GPT-5)
- Prompt scope: Implement GitHub issue #57 by adding the smallest local multi-reviewer session boundary for multiple independent `ReviewResultV01` objects against one compatible `CasePackageV01`, without persistence, backend APIs, accounts, consensus, report UI, raw telemetry ingestion, Toponymy, or ACME4 integration.
- Files changed: `lib/reviewSessionV01.ts`, `lib/reviewSessionV01.test.ts`, `lib/exportReview.ts`, `lib/exportReview.test.ts`, `docs/REVIEW_RESULT_CONTRACT.md`, and `docs/CHANGELOG_AI.md`.
- Summary: Added `LocalReviewSessionV01` helpers that associate reviewer/session identifiers with one compact CasePackage reference, preserve independent local review state per session, accept compatible `ReviewResultV01` submissions, reject duplicate ReviewResult IDs and duplicate reviewer/session submissions, reject incompatible package references, and keep submitted disagreements available for `aggregateReviewResultsV01`.
- Decisions made: Kept the first implementation pure and in-memory; preserved disagreement instead of consensus; treated duplicate and incompatible submissions as loud boundary errors; updated generated `review_id` values to include package, reviewer, review-session, and timestamp identity so concurrent local exports do not collide.
- Checks run: `npm test` passed with 87 tests; `npm run lint` passed with 0 errors and the existing 134 warnings under `.agents/skills/impeccable`; `npm run build` passed; `npx tsc --noEmit` passed; `git diff --check` passed.
- Assumptions: UI orchestration can remain deferred because the issue can be satisfied through the local review-session model and tested aggregation path; the current static demo export still uses the existing synthetic reviewer/session metadata.
- Risks/follow-ups: This does not add durable storage, reviewer accounts, a local reviewer selector, import/export orchestration for multiple files, EvaluationReport result views, or broader comparison metrics.
- Next recommended step: Exercise the helper with independently exported reviews from a realistic validated package before adding persistence or UI orchestration.
- Suggested commit message: `feat(review): support multi-reviewer sessions`

## 2026-06-21: EvaluationReport v0.1 Aggregation

- Agent/model: Codex (GPT-5)
- Prompt scope: Implement GitHub issue #52 with the smallest deterministic aggregation utility for compatible `ReviewResultV01` objects, without persistence, backend APIs, report UI, automated adjudication, reviewer accounts, uploads, or raw telemetry ingestion.
- Files changed: `lib/evaluationReportV01.ts`, `lib/evaluationReportV01.test.ts`, `docs/EVALUATION_INFRASTRUCTURE.md`, `docs/REVIEW_RESULT_CONTRACT.md`, `docs/PROJECT_CONTEXT.md`, `docs/ARCHITECTURE.md`, and `docs/CHANGELOG_AI.md`.
- Summary: Added the typed `evaluation_report.v0.1` contract and pure `aggregateReviewResultsV01` utility with reviewer count, canonical verdict/action/evidence distributions, sorted label-winner and failure-mode counts, source review traceability, and simple verdict, action, label, and per-evidence disagreement indicators.
- Decisions made: Used `review_result_aggregation.v0.1` as an explicit calculation version; counted all evidence decisions in the aggregate evidence distribution; listed only selected failure modes with deterministic counts; treated disagreement as a descriptive difference signal rather than consensus or adjudication; rejected empty, unsupported, missing-metadata, mixed-package, mixed-schema, mixed-revision, and mismatched package-reference inputs.
- Checks run: No formatter script is configured; `npm test` passed with 83 tests; `npm run lint` passed with the existing 134 warnings under `.agents/skills/impeccable`; `npm run build` passed; `npx tsc --noEmit` passed; `git diff --check` passed.
- Assumptions: One valid `ReviewResultV01` represents one reviewer for `reviewer_count`; compatible inputs carry the same complete compact CasePackage reference; current `selected_label_id`, `recommended_action`, evidence rating, and failure mode fields are the canonical aggregation sources.
- Risks/follow-ups: This utility does not validate arbitrary unknown JSON, persist reviews, enforce reviewer independence, calculate statistical agreement, adjudicate a winner, expose a report screen, or produce comparison metrics across packages, models, prompts, or embeddings.
- Next recommended step: Exercise the contracts end to end with independently produced reviews of one realistic validated package before adding persistence or broader metrics.
- Suggested commit message: `feat(evaluation): add EvaluationReport aggregation utility`

## 2026-06-21: ReviewResult v0.1 Export

- Agent/model: Codex (GPT-5)
- Prompt scope: Implement GitHub issue #51 by replacing the local UI-state export with a typed `ReviewResultV01` artifact, while deferring issue #52, `EvaluationReport`, persistence, uploads, backend APIs, real adapters, raw telemetry ingestion, and UI redesign.
- Files changed: `lib/reviewResultV01.ts`, `lib/exportReview.ts`, `lib/exportReview.test.ts`, `lib/types.ts`, `lib/casePackageV01ToCaseFile.ts`, `lib/casePackageV01ToCaseFile.test.ts`, `lib/arenaReviewState.ts`, `lib/arenaReviewState.test.ts`, `data/casePackageFixtures.test.ts`, `components/arena/AppShell.tsx`, `docs/REVIEW_RESULT_CONTRACT.md`, `docs/CASE_PACKAGE_CONTRACT.md`, `docs/DATA_MODEL.md`, and `docs/CHANGELOG_AI.md`.
- Summary: Added the `review_result.v0.1` TypeScript contract and changed copy/download serialization to emit one structured reviewer decision with compact CasePackage and pipeline references instead of duplicating cluster, claim, evidence, score, or raw-reference content.
- Decisions made: Reused the CasePackage canonical evidence-rating, verdict, and recommended-action vocabularies; translated legacy UI values at the export boundary; preserved optional label-comparison rationale; derived the current demo's canonical recommended action from its final verdict because no separate action picker exists; failed loudly on incomplete or mismatched package/review references.
- Checks run: `npm test` passed with 73 tests; `npm run lint` passed with the existing 134 warnings under `.agents/skills/impeccable`; `npm run build` passed; `npx tsc --noEmit` passed; `git diff --check` passed. No formatter script is configured.
- Assumptions: `review_result.v0.1` and `telemetry_court_review.v0.1` are the stable first schema/protocol values; local synthetic reviewer/session metadata is sufficient until reviewer identity work is explicitly scoped.
- Risks/follow-ups: The builder is not a general ReviewResult runtime validator or import boundary. Confidence capture, independent recommended-action selection, persistence, multi-reviewer aggregation, and `EvaluationReport` remain deferred.
- Next recommended step: Review and merge issue #51 independently before beginning the next contract milestone.
- Suggested commit message: `feat(export): emit ReviewResult v0.1`

## 2026-06-21: CasePackage-To-UI Compatibility Boundary

- Agent/model: Codex (GPT-5)
- Prompt scope: Audit GitHub issue #50 against merged PR #79, then complete only the missing `CasePackageV01`-to-current-UI adapter behavior without adding `ReviewResult`, aggregation, persistence, ingestion, backend APIs, or UI changes.
- Files changed: `lib/casePackageV01ToCaseFile.ts`, `lib/casePackageV01ToCaseFile.test.ts`, `data/sampleCases.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Changed the compatibility adapter to accept unknown package-shaped input, validate it with `validateCasePackageV01`, reject packages that cannot support the current static review flow, and return an explicit success/failure result before producing the existing `CaseFile` UI shape. Kept `data/sampleCases.ts` as the stable UI import and made fixture adaptation fail loudly instead of substituting plausible-looking fallback data.
- Decisions made: Kept `CasePackageV01` as the durable input contract and `CaseFile` as a compatibility-only UI model; treated missing AI labels, claims, evidence, representative sessions, neighbor context, map coordinates, and currently displayed metrics as adapter readiness failures rather than weakening the package contract.
- Checks run: `npm test` passed with 70 tests; `npm run lint` passed with the existing 134 warnings under `.agents/skills/impeccable`; `npm run build` passed; `npx tsc --noEmit` passed; `git diff --check` passed.
- Assumptions: The existing synthetic compatibility seed remains necessary for UI-only demo fields that are intentionally absent from `CasePackageV01`; current visual and interaction behavior must remain byte-for-byte equivalent at the `sampleCases` boundary.
- Risks/follow-ups: The adapter remains intentionally temporary and compatibility-oriented. It does not define `ReviewResultV01`, import external files, persist data, aggregate reviewers, or produce evaluation reports.
- Next recommended step: Close issue #50 after review, then plan the separate structured `ReviewResult` contract issue.
- Suggested commit message: `feat(adapter): validate package-to-UI compatibility`

## 2026-06-20: Package-Shaped Synthetic Fixtures

- Agent/model: Codex (GPT-5)
- Prompt scope: Implement GitHub issue #49 by converting the current synthetic sample cases into valid `CasePackage v0.1`-shaped fixtures while preserving the existing static review UI behavior and avoiding ingestion, persistence, `ReviewResult`, `EvaluationReport`, Toponymy, ACME4, or backend API work.
- Files changed: `data/sampleCaseSeedData.ts`, `data/sampleCases.ts`, `data/casePackageFixtures.ts`, `data/casePackageFixtures.test.ts`, `lib/casePackageV01ToCaseFile.ts`, `lib/types.ts`, `lib/casePackageValidation.ts`, `lib/casePackageValidation.test.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Added validated `CasePackageV01` fixtures for all five current synthetic cases, including schema identity, package metadata, dataset and cluster metadata, candidate labels, claims, evidence, claim-evidence mappings, representative sessions, outlier/impostor candidates, neighbor context, metrics, provenance, sanitization, and canonical review configuration. Kept the app import surface stable by adapting the validated package fixtures back to the existing `CaseFile` shape.
- Decisions made: Kept the legacy UI-only review seed data explicit rather than adding non-contract fields to `CasePackageV01`; exported canonical required review stage and reviewer-action constants so fixture tests and runtime validation share the same contract values.
- Checks run: `npm test -- data/casePackageFixtures.test.ts` passed after a red adapter parity check; `npm test -- lib/casePackageV01.test.ts lib/casePackageValidation.test.ts` passed; `npx tsc --noEmit` passed after tightening a validator-test assertion helper; `npm test` passed with 66 tests; `npm run lint` passed with the existing 134 warnings under `.agents/skills/impeccable`; `npm run build` passed.
- Assumptions: The current synthetic `CaseFile` data remains the compatibility seed for UI-only fields that are not part of `CasePackageV01`, such as seeded default reviewer choices and old topic-label IDs.
- Risks/follow-ups: The compatibility adapter is intentionally narrow and should be replaced or reduced as `ReviewResult v0.1` and later package-to-review UI contracts mature. No real Toponymy or ACME4 adapter, file import, persistence, multi-reviewer aggregation, or evaluation report work was added.
- Next recommended step: Implement the next milestone slice for review-result contract/export grounding without expanding into backend platform work.
- Suggested commit message: `feat(fixtures): add case package sample fixtures`

## 2026-06-20: CasePackage v0.1 Runtime Validation

- Agent/model: Codex (GPT-5)
- Prompt scope: Implement GitHub issue #48 by adding runtime validation for `CasePackage v0.1` without sample-case conversion, UI adapter work, `ReviewResult` export changes, `EvaluationReport` aggregation, or backend infrastructure.
- Files changed: `lib/casePackageValidation.ts`, `lib/casePackageValidation.test.ts`, `lib/casePackageV01Fixture.ts`, `lib/casePackageV01.test.ts`, `docs/CASE_PACKAGE_CONTRACT.md`, and `docs/CHANGELOG_AI.md`.
- Summary: Added `validateCasePackageV01(input: unknown)` with typed success/failure results and actionable error paths/messages for schema identity, required sections, ID/reference integrity, evidence structure, metric envelopes, provenance, sanitization, and review configuration. Extracted the synthetic v0.1 package fixture for reuse across contract and validation tests.
- Decisions made: Kept validation explicit and dependency-free; avoided changing app runtime behavior; preserved the `CasePackageV01` contract instead of weakening types for validation convenience.
- Checks run: Targeted validation tests passed after an initial red run against the stub. Full requested checks are recorded after completion of this issue work.
- Assumptions: `case_package.v0.1` remains the only supported runtime schema version; validator errors are intended for import/fixture boundaries before rendering, not as UI warning copy.
- Risks/follow-ups: Issue #49 still needs package-shaped fixture conversion, and issue #50 still needs the narrow `CasePackage`-to-current-UI adapter. The validator does not resolve safe references or inspect raw telemetry.
- Next recommended step: Convert one package-shaped synthetic fixture through this validation boundary.
- Suggested commit message: `feat(contract): validate case package v0.1`

## 2026-06-20: CasePackage v0.1 Contract Definition

- Agent/model: Codex (GPT-5)
- Prompt scope: Implement GitHub issue #47 by defining the `CasePackage v0.1` TypeScript contract without runtime validation, UI adapters, backend work, or sample-case conversion.
- Files changed: `lib/types.ts`, `lib/casePackageV01.test.ts`, `docs/CASE_PACKAGE_CONTRACT.md`, and `docs/CHANGELOG_AI.md`.
- Summary: Added the canonical `CasePackageV01` boundary type with schema identity, case, dataset, cluster, pipeline, candidate label, claim, evidence, mapping, session, outlier/impostor, neighbor, metric, provenance, sanitization, and review-configuration structures. Added canonical future evidence-rating, verdict, and recommended-action vocabularies for compatibility with later `ReviewResult` work.
- Decisions made: Kept existing static `CaseFile` behavior unchanged; represented metrics as available/unavailable envelopes for later validation; documented that Telemetry Court ingests safe package-shaped evidence rather than raw restricted telemetry.
- Checks run: Targeted `npm test -- lib/casePackageV01.test.ts` passed. Full requested checks are recorded after completion of this issue work.
- Assumptions: `case_package.v0.1` is the stable schema-version string for this first TypeScript contract; runtime validation remains deferred to issue #48.
- Risks/follow-ups: Future issues still need runtime validation, sample fixture conversion, UI adapter work, `ReviewResult` export, and `EvaluationReport` aggregation.
- Next recommended step: Implement issue #48, `Add runtime CasePackage validation`.
- Suggested commit message: `feat(contract): define case package v0.1`

## 2026-06-20: Validation Bench Repository Realignment

- Agent/model: Codex (GPT-5)
- Prompt scope: Audit and realign the repository around Telemetry Court as an evidence-based human-in-the-loop validation bench before backend implementation.
- Files changed: `README.md`, `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`, `PRODUCT.md`, `PRODUCT_DIRECTION.md`, `PROJECT_CONTEXT.md`, `TECHNICAL_CONTEXT.md`, `START_HERE_FOR_AGENTS.md`, `PROMPTING_GUIDE.md`, `MODEL_SELECTION.md`, `DESIGN.md`, `RELEASE_v0.1.md`, `.github/copilot-instructions.md`, `.github/pull_request_template.md`, `docs/PRODUCT_POSITIONING.md`, `docs/PRODUCT_VISION.md`, `docs/PROJECT_CONTEXT.md`, `docs/CASE_PACKAGE_CONTRACT.md`, `docs/EVALUATION_INFRASTRUCTURE.md`, `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`, `docs/PRODUCT_DECISIONS.md`, `docs/DATA_MODEL.md`, `docs/DESIGN_DIRECTION.md`, `docs/DESIGN_SYSTEM.md`, `docs/AGENT_WORKFLOWS.md`, `docs/DEVELOPMENT_WORKFLOW.md`, `docs/GITHUB_PLANNING.md`, `docs/MODEL_ROUTING.md`, `docs/TOPONYMY_NOTES.md`, `components/arena/AppShell.tsx`, `lib/exportReview.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Replaced the Evidence Arena and frontend-MVP identity with the validation-bench definition, documented the current static synthetic slice without overclaiming it, and aligned architecture, roadmap, planning, agent instructions, templates, design language, release notes, and direct user-facing copy around a versioned case-package boundary and evaluation output.
- Decisions made: The backend direction is evaluation infrastructure; `CasePackage`, `ReviewResult`, and `EvaluationReport` remain distinct versioned contracts; the next milestone is Case Package Contract and Validation Infrastructure; Toponymy and ACME4-style integrations enter through approved adapters rather than raw telemetry ingestion; SIEM/SOC, alert triage, raw search, generic dashboards, chat-first UX, gamification, auth-first work, generic CRUD, and speculative enterprise features are out of scope.
- Checks run: repository-wide legacy-framing searches completed; `npm test` passed with 35 tests; `npm run lint` passed with 0 errors and the existing 134 warnings under `.agents/skills/impeccable`; `npm run build` passed; `git diff --check` passed.
- Assumptions: Existing UI component and type names containing `arena` remain implementation details until a separately scoped migration; historical changelog and decision entries remain intact but are explicitly superseded by the 2026-06-20 decision.
- Risks/follow-ups: `CasePackage v0.1`, `ReviewResult v0.1`, and `EvaluationReport v0.1` are documentation contracts only and still require human-approved schema decisions, runtime validation, package-shaped fixtures, and tests. No real Toponymy or ACME4 integration exists.
- Next recommended step: Execute Milestone 2 by approving the three v0.1 contracts, adding runtime package validation, and adapting one synthetic fixture through the boundary without redesigning the UI.
- Suggested commit message: `docs(product): realign repository around validation bench`

## 2026-06-20: Workflow Screenshot Seed Integrity Fix

- Agent/model: Codex (GPT-5)
- Prompt scope: Review PR #44, repair the screenshot seed, and verify that committed workflow captures reflect valid current review state.
- Files changed: `scripts/screenshots.js`, `screenshots/01-landscape.png`, `screenshots/06-label-duel.png`, `screenshots/07-impostor.png`, `screenshots/08-verdict.png`, and `docs/CHANGELOG_AI.md`.
- Summary: Replaced obsolete label, session, and verdict seed values with current domain IDs; made route redirects and Next.js error overlays fail screenshot generation; added a verdict consistency assertion; and regenerated the affected screenshots with a completed evidence-grounded review state.
- Decisions made: Kept deterministic session-state seeding for the static workflow capture, but made invalid or internally contradictory screenshots hard failures instead of warnings.
- Checks run: `npm test` passed with 48 tests; `npm run lint` passed with 0 errors and the existing 134 Impeccable warnings; `npm run build` passed; the screenshot script completed all eight routes against the production build; the Verdict capture shows a selected `Unsupported / overclaimed` verdict with matching summary and export state; `git diff --check` passed.
- Assumptions: The first synthetic case remains the canonical deterministic workflow screenshot case.
- Risks/follow-ups: The local `agent-browser` binary was unavailable, so browser verification used the repository's Playwright screenshot runner with added route, overlay, and verdict-state assertions.
- Next recommended step: Merge PR #44, close issues #35-#37 and #41, then align the documentation realignment PR with the updated `main` branch.
- Suggested commit message: `fix(screenshots): validate seeded review state`

## 2026-06-20: Verdict Evidence Consistency Fix

- Agent/model: Codex (GPT-5)
- Prompt scope: Focused bug fix for `/verdict` semantic consistency between selected verdict, evidence balance, selected reasons, conclusion, and recommended action.
- Files changed: `components/arena/VerdictPanel.tsx`, `components/arena/JudgmentReceipt.tsx`, `lib/arenaReviewState.ts`, `app/page.test.ts`, `lib/arenaReviewState.test.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Derived evidence-balance conclusion from evidence ratings instead of verdict label alone; made supported verdicts with conflicting evidence recommend reviewing conflicts rather than accepting the label; cleared negative failure-mode reasons when `Supported` is selected; and added tests that prevent seeded `/verdict` from selecting `Supported` for the overclaimed demo case.
- Decisions made: Kept the demo seed as `unsupported_overclaimed` with `less_overclaimed` and `missing_evidence`; preserved the existing export schema; treated current failure-mode chips as incompatible with `Supported` rather than inventing new positive rationale data.
- Checks run: `npm test -- app/page.test.ts lib/arenaReviewState.test.ts` passed with 30 tests; `npx tsc --noEmit` passed; `npm test` passed with 48 tests; `npm run lint` exited 0 with the existing 134 warnings under `.agents/skills/impeccable`; `npm run build` passed; `git diff --check` passed; the Impeccable detector returned `[]`; browser verification on fresh `http://127.0.0.1:3077/verdict` confirmed cleared-storage direct load renders `Unsupported / overclaimed`, selected option is `Unsupported / overclaimed`, evidence conclusion is `Claim is not sufficiently supported`, recommended action does not say `Accept the label`, selecting/persisting `Supported` clears negative reasons and shows conflict-review action, and screenshot `/tmp/telemetry-verdict-consistent-unsupported.png`.
- Assumptions: Positive rationale chips should wait for explicit domain/model support; for now, `Supported` simply clears negative failure-mode reasons.
- Risks/follow-ups: None known.
- Next recommended step: Review the fresh `http://localhost:3077/verdict` preview with storage cleared.
- Suggested commit message: `fix(arena): align verdict with evidence balance`

## 2026-06-20: Verdict Source-of-Truth State Fix

- Agent/model: Codex (GPT-5)
- Prompt scope: Focused bug fix for `/verdict` mixed completed/unfinished rendering, especially direct-route demo hydration with stale partial session state.
- Files changed: `components/arena/VerdictPanel.tsx`, `lib/arenaReviewState.ts`, `app/page.test.ts`, `lib/arenaReviewState.test.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Made `reviewState.finalVerdict` the explicit completion source for the verdict page; prevented partial persisted demo state from overwriting the seeded direct `/verdict` final verdict; added contradiction guards for `Ready to export` with `Verdict not selected`, `Review complete` with unfinished copy, enabled export without final verdict, and completed state without an active selected verdict.
- Decisions made: Direct `/verdict` for `case-arena-001` now prefers the completed seeded demo state when hydrated session data lacks `finalVerdict`; explicitly persisted final verdicts are still preserved.
- Checks run: `npm test -- app/page.test.ts lib/arenaReviewState.test.ts` passed with 28 tests; `npx tsc --noEmit` passed; `npm test` passed with 46 tests; `npm run lint` exited 0 with the existing 134 warnings under `.agents/skills/impeccable`; `npm run build` passed; `git diff --check` passed; the Impeccable detector returned `[]`; browser verification on fresh `http://127.0.0.1:3077/verdict` confirmed both clean direct load and stale partial session state render the completed unsupported/overclaimed verdict with no mixed copy, no overflow, no console errors, and screenshot `/tmp/telemetry-verdict-fixed-3077.png`.
- Assumptions: The direct demo route should showcase the completed judgment even if old partial session data exists; normal unfinished component state remains coherent when no `finalVerdict` is passed.
- Risks/follow-ups: None known.
- Next recommended step: Use the fresh `http://localhost:3077/verdict` preview for visual confirmation.
- Suggested commit message: `fix(arena): prevent mixed verdict completion state`

## 2026-06-20: Verdict Completion State Polish

- Agent/model: Codex (GPT-5)
- Prompt scope: Focused refinement of `/verdict` completion logic, hero hierarchy, selected-state clarity, and export readiness without redesigning the page again.
- Files changed: `components/arena/VerdictPanel.tsx`, `components/arena/JudgmentReceipt.tsx`, `lib/arenaReviewState.ts`, `app/investigation-workflow.css`, `app/page.test.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Fixed contradictory selected/empty verdict states; changed the completed hero so the verdict itself is the largest message; seeded the static demo `/verdict` route with the current case's unsupported/overclaimed review state; made the selected verdict option visually explicit; emphasized the final verdict and recommended action rows; and clarified when `Ready to export` appears.
- Decisions made: Kept the existing export schema and handlers unchanged; used existing sample/default review state mechanics for the demo completion state; kept empty-state export disabled until a verdict is chosen.
- Checks run: `npm test -- app/page.test.ts` passed with 22 tests; `npx tsc --noEmit` passed; `npm test` passed with 43 tests; `npm run lint` exited 0 with the existing 134 warnings under `.agents/skills/impeccable`; `npm run build` passed; `git diff --check` passed; the Impeccable detector returned `[]`; browser verification on `http://127.0.0.1:3078/verdict` confirmed completed-state hero/summary/active verdict, JSON drawer contents, export filename, verdict reselection, no desktop/mobile overflow, no console errors, and an intentionally unfinished session with export disabled and no `Ready to export` copy.
- Assumptions: The seeded completed review is only for the direct demo arrival at `/verdict`; unfinished user/session state still renders as an internally consistent empty state.
- Risks/follow-ups: None known for this polish pass.
- Next recommended step: None after full verification passes.
- Suggested commit message: `polish(arena): clarify verdict completion state`

## 2026-06-20: Verdict Final Judgment Redesign

- Agent/model: Codex (GPT-5)
- Prompt scope: Redesign only `/verdict` so the final workflow step feels like a calm, premium judgment screen with clearer evidence grounding and export actions.
- Files changed: `components/arena/VerdictPanel.tsx`, `components/arena/JudgmentReceipt.tsx`, `components/arena/WorkflowPrimitives.tsx`, `components/arena/AppShell.tsx`, `components/arena/arenaMeta.ts`, `app/investigation-workflow.css`, `app/page.test.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Replaced the dark final-judgment banner and decorative verdict context map with a light verdict hero and compact evidence-balance card; grouped final verdict options into claim support, cluster quality, and evidence quality; renamed failure-mode chips to `Why this verdict?`; converted the receipt grid into a vertical review summary; simplified final actions around `View JSON` and `Export review result`; and removed contradictory `Awaiting review choice` copy after verdict selection.
- Decisions made: Kept the review/export data model unchanged; reused existing evidence-balance counts and JSON export handlers; removed the redundant top-right verdict `Review data` menu because the footer now carries the final export path; kept copy/download JSON as subtle secondary actions in the summary.
- Checks run: No formatter script is configured; `npm test -- app/page.test.ts` passed with 20 tests; `npx tsc --noEmit` passed; `npm test` passed with 41 tests; `npm run lint` passed with the existing 134 warnings under `.agents/skills/impeccable` and no app errors; `npm run build` passed; `git diff --check` passed; the Impeccable detector returned `[]`; Playwright against a rebuilt production preview at `http://127.0.0.1:3077` verified the completed `/verdict` state, selected-verdict copy, evidence balance, JSON drawer, export download filename, verdict reselection, no old `Final judgment` / `Verdict context` / `Failure-mode chips` / `Awaiting review choice` text, no desktop/mobile horizontal overflow, and no console errors. Screenshots saved to `/tmp/telemetry-verdict-desktop.png` and `/tmp/telemetry-verdict-mobile.png`.
- Assumptions: Export remains allowed when no failure reason is selected, so the summary uses `No failure reason selected.` rather than blocking export for missing reasons.
- Risks/follow-ups: Direct `/verdict` still follows the existing guarded workflow behavior when no prior review state exists; this change does not alter route protection.
- Next recommended step: Review the final screenshots with the rest of the 8-step flow to confirm the verdict now feels like a satisfying close rather than another form step.
- Suggested commit message: `ux(arena): redesign verdict judgment screen`

## 2026-06-20: Impostor Micro Polish

- Agent/model: Codex (GPT-5)
- Prompt scope: Very small final polish pass on `/impostor`, preserving the approved ranked comparison structure and workflow logic while fixing footer truncation, metric spacing, and hero copy wrapping.
- Files changed: `components/arena/ImpostorPanel.tsx`, `app/investigation-workflow.css`, `app/page.test.ts`, `issues/afk-impostor-decision-polish.md`, and `docs/CHANGELOG_AI.md`.
- Summary: Changed the alternate-selection footer copy from “Stronger signal” to “Strongest signal,” removed the desktop footer ellipsis behavior so confirmation text wraps intentionally, kept CTA buttons stable on the right, widened the impostor hero copy lane, and gave the two session metric columns more room with non-wrapping desktop labels and values.
- Decisions made: Kept session ranking, selection behavior, right-panel logic, route flow, and visual direction unchanged.
- Checks run: `npm test -- app/page.test.ts` passed; `npm test` passed with 39 tests; `npx tsc --noEmit` passed; `npm run lint` exited 0 with the existing 134 warnings under `.agents/skills/impeccable`; `npm run build` passed; `git diff --check` passed; the Impeccable detector returned `[]`; Playwright on a production server at `127.0.0.1:3068` verified `/impostor` at 1440px and 390px with no footer truncation, no footer/button collision, one-line desktop footer copy, intentional mobile footer wrapping, one-line desktop metric labels and values, one-line desktop hero summary, disabled CTA before selection, enabled CTA after selecting `iam-s-03`, and no horizontal overflow. Screenshots saved to `/tmp/telemetry-impostor-micro-polish-desktop.png` and `/tmp/telemetry-impostor-micro-polish-mobile.png`.
- Assumptions: The approved structure should remain frozen; this slice only adjusts spacing, wrapping, alignment, and copy polish.
- Risks/follow-ups: None expected.
- Next recommended step: None.
- Suggested commit message: `polish(arena): tighten impostor layout details`

## 2026-06-20: Impostor Final UI Polish

- Agent/model: Codex (GPT-5)
- Prompt scope: Final refinement pass on `/impostor`, keeping the ranked comparison structure while making the screen lighter, more breathable, and clearer when the reviewer selects a non-strongest session.
- Files changed: `components/arena/ImpostorPanel.tsx`, `app/investigation-workflow.css`, `app/page.test.ts`, `issues/prd-impostor-polish.md`, `issues/afk-impostor-decision-polish.md`, and `docs/CHANGELOG_AI.md`.
- Summary: Reduced hero and summary-strip visual weight, lightened session rows and detail panels, tightened row spacing, refined the Strongest signal badge, made the effect panel feel integrated instead of alert-like, and added explicit non-strongest selection copy in the detail panel and footer.
- Decisions made: Kept workflow logic, ranking, and review-state shape unchanged; used existing strongest-candidate data for mismatch copy; kept the reviewer’s non-strongest choice allowed but clearly contextualized.
- Checks run: `npm test` passed with 39 tests; `npx tsc --noEmit` passed; `npm run build` passed; Playwright verified the real Label Duel-to-Impostor path at 1440px and 390px, including initial disabled CTA, non-strongest `iam-s-03` selection, stronger `iam-s-04` guidance, enabled CTA, and no horizontal overflow.
- Assumptions: The final verdict should still accept a non-strongest session; the UI’s job is to explain the evidence mismatch, not block it.
- Risks/follow-ups: None for this slice.
- Next recommended step: None.
- Suggested commit message: `polish(arena): lighten impostor decision UI`

## 2026-06-19: Impostor Decision Interface Polish

- Agent/model: Codex (GPT-5)
- Prompt scope: Refine the ranked `/impostor` interface so it inherits the Label Duel choice, scans faster, uses a more useful decision panel, and confirms the selected session before the verdict.
- Files changed: `components/arena/ImpostorPanel.tsx`, `app/investigation-workflow.css`, `app/page.test.ts`, `issues/prd-impostor-polish.md`, `issues/afk-impostor-decision-polish.md`, and `docs/CHANGELOG_AI.md`.
- Summary: Added an explicit missing-label recovery state; renamed purity language to Review status and Fit check; compressed the five ranked sessions into full-row controls with side-by-side higher-contrast metrics; replaced the helper pill with a criterion row; changed the recommendation treatment to a restrained Strongest signal state; added current-candidate guidance to the detail panel; and made the selected footer name the session and outlier risk.
- Decisions made: Kept ranking and review-state semantics unchanged; treated the highest-risk session as guidance only; used the existing Label Duel winner as required context; and kept both metrics visible on narrow screens so the inverse relationship remains comparable.
- Checks run: `npm test` passed with 39 tests; `npx tsc --noEmit` passed; `npm run lint` passed with the existing 134 warnings under `.agents/skills/impeccable` and no application errors; `npm run build` passed; the Impeccable detector returned `[]`; `git diff --check` passed; and Playwright completed the real Label Duel-to-Impostor flow at 1440px and 390px with five 101px desktop rows, inherited label context, disabled/enabled CTA states, keyboard focus, selected feedback, no horizontal overflow, and no console errors.
- Assumptions: Missing Label Duel context is invalid for this step and should be recovered before session comparison; no reducer or route restriction change is required because the panel now guards invalid hydrated or direct-stage state.
- Risks/follow-ups: Session match labels and ranking remain presentation guidance based on existing synthetic scores; any future export or verdict semantics should be documented in the domain model first.
- Next recommended step: None for this slice.
- Suggested commit message: `polish(arena): refine impostor comparison flow`

## 2026-06-19: Impostor Decision Interface Redesign

- Agent/model: Codex (GPT-5)
- Prompt scope: Redesign `/impostor` as a clear Step 7 comparison-and-decision interface that carries forward the selected label and evidence read from `/label-duel`, makes the strongest outlier signal scannable without preselecting it, and explains how the reviewer choice affects the final verdict.
- Files changed: `components/arena/ImpostorPanel.tsx`, `app/investigation-workflow.css`, `app/page.test.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Replaced the circular session orbit and low-value purity map with a compact hero, dynamic four-part decision summary, ranked five-session comparison list, explicit outlier-risk and cluster-match measures, useful initial guidance, recorded selected state, strong-candidate confirmation, neutral alternate-choice warning, and responsive action footer behavior.
- Decisions made: Ranked sessions by descending outlier score with lower feature overlap as the tie-breaker; derived plain-language High/Medium/Low cluster-match labels from existing synthetic overlap values; kept the highest-risk session visibly prominent but unselected; used the existing session summaries and outlier reasons without adding telemetry or evidence fields.
- Checks run: No formatter script is configured; `node --test --import tsx --test-name-pattern="impostor review teaches" app/page.test.ts` failed against the old orbit UI and passed after the first implementation slice; selected-state coverage passed; `npx tsc --noEmit` passed; `npm test` passed with 38 tests; `npm run lint` passed with the existing 134 warnings under `.agents/skills/impeccable` and no app errors; `npm run build` passed; the Impeccable detector returned `[]`; Playwright against a fresh production server on `127.0.0.1:3064` completed the real `/blind-read` -> `/ai-reveal` -> `/evidence-board` -> `/label-duel` -> `/impostor` flow, confirmed five ranked cards, useful initial guidance, disabled CTA before selection, immediate detail-panel update, enabled CTA after selection, recorded state, strong-candidate explanation, no desktop/mobile horizontal overflow, and no console errors. Screenshots saved to `/tmp/telemetry-impostor-initial-desktop.png`, `/tmp/telemetry-impostor-selected-desktop.png`, and `/tmp/telemetry-impostor-selected-mobile.png`.
- Assumptions: Cluster-match labels are presentation guidance only and do not change review data or verdict logic; the selected label should remain dynamic because reviewers may choose any Label Duel candidate.
- Risks/follow-ups: The match-level thresholds are intentionally UI-only; if they later affect exported review semantics, they should move into the domain model with a documented product decision and dedicated tests.
- Next recommended step: Validate the Step 7 wording with workshop participants before changing the session scoring or adding more comparison dimensions.
- Suggested commit message: `ux(arena): redesign impostor decision flow`

## 2026-06-19: Label Duel Final Tiny UI Polish

- Agent/model: Codex (GPT-5)
- Prompt scope: Tiny final UI polish pass on `/label-duel`, preserving the current structure, state behavior, cards, checklist handoff, evidence summary, and selected-label CTA.
- Files changed: `components/arena/LabelDuelPanel.tsx`, `app/investigation-workflow.css`, `app/page.test.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Removed the redundant `Recommended` label from the primary recommendation, changed the primary card cue from `Select this label` to `Select label`, softened and clarified the disabled footer CTA state, added a slightly stronger but calm hover/focus affordance to the recommended card, and added a little more breathing room before `Other possible labels`.
- Decisions made: Kept `Best supported` as the single evidence-based recommendation badge; did not add percentages, maps, new sections, routing changes, or workflow changes.
- Checks run: No formatter script is configured; `npm test -- app/page.test.ts` failed first on the old recommendation copy, then passed after the patch; `node .agents/skills/impeccable/scripts/detect.mjs --json components/arena/LabelDuelPanel.tsx app/investigation-workflow.css app/page.test.ts` returned `[]`; `npx tsc --noEmit` passed; `npm test` passed with 36 tests; `npm run lint` passed with the existing 134 warnings under `.agents/skills/impeccable` and no app errors; `npm run build` passed; `git diff --check` passed; Playwright against a freshly built production server on `127.0.0.1:3002` confirmed the disabled CTA computed as muted/not-allowed, `Best supported` remained, `Recommended` and `Select this label` were absent, the primary card hover/focus affordance changed border/lift, selected state revealed reasons and enabled the CTA, no console issues appeared, and mobile had no horizontal overflow. Screenshots saved to `/tmp/telemetry-label-duel-tiny-polish-initial.png`, `/tmp/telemetry-label-duel-tiny-polish-selected.png`, and `/tmp/telemetry-label-duel-tiny-polish-mobile.png`.
- Assumptions: The existing development server on port 3000 appeared stale for React interaction verification, so visual QA used the already-built app on a temporary production server at port 3002 and then stopped that server.
- Risks/follow-ups: None known; this was intentionally limited to copy and scoped CSS state polish.
- Next recommended step: Freeze `/label-duel` unless user testing surfaces a concrete comprehension issue.
- Suggested commit message: `ux(arena): polish label duel microstates`

## 2026-06-19: Label Duel Explicit Selection Micro-Polish

- Agent/model: Codex (GPT-5)
- Prompt scope: Final micro-polish pass on `/label-duel`, preserving the compact hero, evidence summary strip, recommended label card, contextual reasons, secondary alternatives, and footer CTA while improving state clarity and mobile-safe conversion copy.
- Files changed: `components/arena/LabelDuelPanel.tsx`, `app/investigation-workflow.css`, `app/page.test.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Kept the recommended label unselected on initial load, kept reasons hidden until explicit selection, changed the CTA to `Continue with selected label`, moved the selected label into footer helper text, turned `Likely overclaim` into a subtle status pill, added `Other possible labels`, clarified the reason helper copy, softened the optional note placeholder, and made selected cards/chips clearer without adding dashboard noise.
- Decisions made: Preserved the existing structured-choice state model and did not add percentages, maps, or new workflow steps. Kept `Select this label` as the primary card's action cue while using `Recommended` as the non-selected recommendation label.
- Checks run: `npm test -- app/page.test.ts` passed; `npx tsc --noEmit` passed; `npm test` passed with 36 tests; `npm run lint` passed with the existing 134 warnings under `.agents/skills/impeccable` and no app errors; `npm run build` passed; `git diff --check` passed; `node .agents/skills/impeccable/scripts/detect.mjs --json components/arena/LabelDuelPanel.tsx app/investigation-workflow.css app/page.test.ts` returned `[]`; Playwright verification against `http://localhost:3000` passed through `/blind-read` -> `/ai-reveal` -> `/evidence-board` -> `/label-duel`, confirmed initial unselected recommendation, hidden reason panel, disabled `Continue with selected label`, calm `Likely overclaim` pill, selected badge after click, selected reason chip state, selected-label footer helper, active CTA, no support percentages, no duel map, no console issues, and no desktop/mobile horizontal overflow. Screenshots saved to `/tmp/telemetry-label-duel-micro-debug-viewport.png`, `/tmp/telemetry-label-duel-micro-polish-selected-desktop-settled.png`, and `/tmp/telemetry-label-duel-micro-polish-selected-mobile-settled.png`.
- Assumptions: The current local dev server on port 3000 was already running and reflected the hot-reloaded source, so browser verification used that server.
- Risks/follow-ups: The CTA no longer repeats the selected label, so the footer helper text now carries that specificity; future footer copy changes should keep the selected label visible nearby.
- Next recommended step: Freeze `/label-duel` unless user testing shows a concrete comprehension issue.
- Suggested commit message: `ux(arena): clarify label duel selection state`

## 2026-06-19: Label Duel Final Premium Polish

- Agent/model: Codex (GPT-5)
- Prompt scope: Final senior UI/UX polish pass on `/label-duel`, preserving the current Step 6 structure, evidence summary, candidate-label decision flow, contextual reasons, and enabled route behavior while making the page feel more premium and interactive.
- Files changed: `components/arena/LabelDuelPanel.tsx`, `app/investigation-workflow.css`, `app/page.test.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Tightened the Label Duel hero, softened the evidence summary strip away from an admin-table feel, added subtle surface hierarchy, hover, focus, selected, and action-cue states to candidate cards, rewrote the primary recommendation and alternative label copy to be more human and evidence-grounded, added visible `Select this label` / `Selected` affordances, and moved the reason panel directly under the selected recommended label.
- Decisions made: Kept exact support percentages and the duel mini-map out of Step 6; preserved `Routine IAM role provisioning` as the seeded best-supported recommendation; kept the optional note and reason chips contextual after selection; used quiet neutral depth instead of introducing new colors, charts, or motion.
- Checks run: `npx tsc --noEmit` passed; `npm test` passed with 36 tests; `npm run lint` passed with the existing 134 warnings under `.agents/skills/impeccable` and no app errors; `npm run build` passed; `git diff --check` passed; `node .agents/skills/impeccable/scripts/detect.mjs --json components/arena/LabelDuelPanel.tsx app/investigation-workflow.css app/page.test.ts` returned `[]`; Playwright verification against the existing `http://localhost:3000` dev server passed through `/blind-read` -> `/ai-reveal` -> `/evidence-board` -> `/label-duel`, confirmed the disabled CTA before selection, visible `Select this label` cue, selected-card badge, reason panel appearing before alternatives after selecting the recommendation, updated `Continue with Routine IAM role provisioning` CTA, no support percentages, no duel map, no console issues, and no desktop/mobile horizontal overflow. Screenshots saved to `/tmp/telemetry-label-duel-polish-before.png`, `/tmp/telemetry-label-duel-polish-selected-desktop.png`, and `/tmp/telemetry-label-duel-polish-selected-mobile.png`.
- Assumptions: The existing local dev server on port 3000 reflected current source changes after hot reload, so it was used for browser verification instead of starting a competing Next dev server.
- Risks/follow-ups: Because the reason panel opens directly below the selected recommendation, the secondary alternatives move lower after selection; this is intentional for the primary seeded path but should be watched if future cases commonly select a secondary label.
- Next recommended step: Review the final selected-state screenshots alongside Evidence Board to confirm the Step 5 -> Step 6 handoff now feels calm and decisive.
- Suggested commit message: `ux(arena): polish label duel decision affordance`

## 2026-06-19: Label Duel Defensible Decision Redesign

- Agent/model: Codex (GPT-5)
- Prompt scope: Redesign `/label-duel` as Step 6's decision bridge from Evidence Board classifications to the most defensible label, preserving workflow routing while reducing empty space, removing the decorative duel context map, de-emphasizing support percentages, and making reasons/CTA contextual.
- Files changed: `components/arena/LabelDuelPanel.tsx`, `components/arena/AppShell.tsx`, `components/arena/arenaMeta.ts`, `lib/types.ts`, `lib/arenaReviewState.ts`, `lib/arenaReviewState.test.ts`, `lib/exportReview.ts`, `lib/exportReview.test.ts`, `app/investigation-workflow.css`, `app/page.test.ts`, `docs/DATA_MODEL.md`, and `docs/CHANGELOG_AI.md`.
- Summary: Rebuilt Label Duel around `Choose the most defensible label`, added an evidence summary bar carrying forward the original AI claim, `1 weak support · 2 contradictions · 1 needs context`, and `Likely overclaim`, removed the mini-map and exact support-percentage cues, promoted `Routine IAM role provisioning` as the primary best-supported card, made the other labels secondary alternatives with human-readable fit badges, moved reason chips behind candidate selection, added an optional persisted duel note, and changed the CTA from a generic continue action to `Continue with [selected label]`.
- Decisions made: Kept label selection as the only required Step 6 completion state; treated the note as optional structured review data persisted in session state and export JSON; added reason labels for missing malicious intent, missing downstream abuse, and preserving uncertainty so the chip language matches the evidence-review decision.
- Checks run: `npx tsc --noEmit` passed; `npm test` passed with 36 tests; `npm run lint` passed with the existing 134 warnings under `.agents/skills/impeccable` and no app errors; `npm run build` passed; `git diff --check` passed; `node .agents/skills/impeccable/scripts/detect.mjs --json components/arena/LabelDuelPanel.tsx app/investigation-workflow.css app/page.test.ts` returned `[]`; Playwright verification against `http://localhost:3062` passed through `/blind-read` -> `/ai-reveal` -> `/evidence-board` -> `/label-duel`, confirmed no mini-map, no support percentages, disabled CTA before selection, contextual reasons after selection, selected-label CTA, note persistence in session storage, successful navigation to `/impostor`, and no desktop/mobile horizontal overflow. Screenshots saved to `/tmp/telemetry-label-duel-redesign-desktop-before.png`, `/tmp/telemetry-label-duel-redesign-desktop-selected.png`, `/tmp/telemetry-label-duel-redesign-mobile-selected.png`, and `/tmp/telemetry-label-duel-redesign-mobile-selected-final.png`.
- Assumptions: The seeded IAM case should intentionally prioritize `Routine IAM role provisioning` because it is already marked as `seededBestLabelId` and matches the Evidence Board conclusion that malicious escalation is not proven.
- Risks/follow-ups: The new optional duel note is now exported, but downstream consumers of exported review JSON should tolerate the optional `duelNote` field.
- Next recommended step: Review the new `/label-duel` desktop and mobile screenshots next to the finalized Evidence Board to confirm the narrative handoff feels continuous.
- Suggested commit message: `ux(arena): redesign label duel decision flow`

## 2026-06-19: Evidence Board Mobile Conversion Polish

- Agent/model: Codex (GPT-5)
- Prompt scope: Tiny final mobile/conversion polish pass on `/evidence-board`, preserving the current structure, content model, evidence cards, checklist, evidence balance, preselected classifications, and enabled CTA.
- Files changed: `components/arena/EvidenceBoard.tsx`, `components/arena/WorkflowPrimitives.tsx`, `app/investigation-workflow.css`, and `docs/CHANGELOG_AI.md`.
- Summary: Kept the desktop primary CTA as `Continue with 4 classifications` while showing `Compare labels` on mobile, tightened the mobile hero spacing and headline size slightly, and added mobile-only concise evidence summaries so cards scan as one decision sentence without changing desktop copy.
- Decisions made: Used responsive inline labels/summaries instead of changing workflow state or evidence structure; left the four-option classification control, collapsed details, sticky checklist, and evidence balance untouched.
- Checks run: `npx tsc --noEmit` passed; `npm test` passed with 35 tests; `npm run lint` passed with the existing 134 warnings under `.agents/skills/impeccable` and no app errors; `npm run build` passed; `git diff --check` passed; `node .agents/skills/impeccable/scripts/detect.mjs --json components/arena/EvidenceBoard.tsx components/arena/WorkflowPrimitives.tsx app/investigation-workflow.css` returned `[]`; Playwright verification against `http://localhost:3061` passed through `/blind-read` -> `/ai-reveal` -> `/evidence-board`, confirmed desktop CTA remains `Continue with 4 classifications`, mobile CTA shows `Compare labels` at 44px without wrapping, four classifications remain selected, mobile summaries switch to concise copy, no horizontal overflow appears, and a settled mobile screenshot has stage opacity 1. Screenshots saved to `/tmp/telemetry-evidence-board-mobile-conversion-desktop.png`, `/tmp/telemetry-evidence-board-mobile-conversion-mobile.png`, and `/tmp/telemetry-evidence-board-mobile-conversion-mobile-settled.png`.
- Assumptions: The 620px breakpoint is the appropriate threshold for the shorter mobile CTA and compact summary treatment because it matches the existing Evidence Board mobile polish rules.
- Risks/follow-ups: Responsive duplicate text is hidden with CSS, so future copy changes should update both desktop and mobile summary strings for the seeded IAM case.
- Next recommended step: Verify the mobile guarded flow once more and then freeze this page direction.
- Suggested commit message: `ux(arena): tighten evidence board mobile cta`

## 2026-06-19: Evidence Board Final Visual Softening

- Agent/model: Codex (GPT-5)
- Prompt scope: Visual-only polish pass on `/evidence-board` to make the existing structure feel calmer, lighter, and more premium without changing workflow, state model, card structure, sticky checklist, or CTA behavior.
- Files changed: `components/arena/EvidenceBoard.tsx`, `app/investigation-workflow.css`, `app/page.test.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Lightened the top hero/context/balance treatment, changed the balance summary into one natural sentence, softened evidence card body typography and line-height, restyled `Show details →` as a subtle text-button disclosure, reduced segmented-control height and border weight, and made the sticky claim checklist more editorial.
- Decisions made: Kept the preselected four classifications, enabled CTA, vertical evidence cards, collapsed details, mobile 2-column segmented controls, and sticky/compact claim checklist unchanged.
- Checks run: `npx tsc --noEmit` passed; `npm test` passed with 35 tests; `npm run lint` passed with the existing 134 warnings under `.agents/skills/impeccable` and no app errors; `npm run build` passed; `git diff --check` passed; `node .agents/skills/impeccable/scripts/detect.mjs --json components/arena/EvidenceBoard.tsx app/investigation-workflow.css app/page.test.ts` returned `[]`; Playwright verification against `http://localhost:3060` passed through `/blind-read` -> `/ai-reveal` -> `/evidence-board`, confirmed the enabled default CTA, natural balance sentence, collapsed details, selected controls, desktop/mobile no horizontal overflow, mobile collapsed checklist, 2-column mobile controls, and successful transition to Label Duel. Screenshots saved to `/tmp/telemetry-evidence-board-final-visual-polish-desktop.png` and `/tmp/telemetry-evidence-board-final-visual-polish-mobile.png`.
- Assumptions: This page is now in final polish mode, so only visual weight, rhythm, and copy-flow adjustments should be made unless future testing finds a concrete usability issue.
- Risks/follow-ups: The mobile page remains a deliberate scroll because it still contains four evidence cards; further shortening would require content or workflow changes, which were out of scope for this pass.
- Next recommended step: Review the final screenshots or `/evidence-board` at normal zoom and decide whether this visual direction is ready to freeze.
- Suggested commit message: `ux(arena): soften evidence board visuals`

## 2026-06-19: Evidence Board Final Polish And Classified Defaults

- Agent/model: Codex (GPT-5)
- Prompt scope: Final `/evidence-board` polish pass focused on clarity, state consistency, premium UI details, and preserving the compact guided-review direction.
- Files changed: `components/arena/EvidenceBoard.tsx`, `components/arena/AppShell.tsx`, `components/arena/WorkflowPrimitives.tsx`, `lib/arenaReviewState.ts`, `lib/arenaReviewState.test.ts`, `app/investigation-workflow.css`, `app/page.test.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Treated seeded evidence suggestions as the default classified state, changed the page to `4 of 4 classified`, enabled `Continue with 4 classifications` by default, added explicit copy that suggestions are preselected and editable, tightened hero/context/balance/checklist/card styling, moved the noise action into collapsed details, and removed the duplicate hero `Evidence Board` eyebrow. Also fixed saved-session hydration for guarded later-stage reloads so `/evidence-board` can reload without a dev overlay while direct unqualified access remains sealed.
- Decisions made: Adopted Option A from the brief: default evidence ratings are active classifications until the reviewer changes them. Kept `Irrelevant / noise` in the data model but out of the primary four-option segmented control. Kept the route guard sealed server-side and hydrated saved review state only after the first matching client render to avoid SSR/client drift.
- Checks run: `npx tsc --noEmit` passed; `npm test` passed with 35 tests; `npm run lint` passed with the existing 134 warnings under `.agents/skills/impeccable` and no app errors; `npm run build` passed; `git diff --check` passed; `node .agents/skills/impeccable/scripts/detect.mjs --json components/arena/EvidenceBoard.tsx components/arena/WorkflowPrimitives.tsx components/arena/AppShell.tsx lib/arenaReviewState.ts lib/arenaReviewState.test.ts app/investigation-workflow.css app/page.test.ts` returned `[]`; Playwright verification against `http://localhost:3058` passed through `/blind-read` -> `/ai-reveal` -> `/evidence-board`, confirmed `4 of 4 classified`, enabled default CTA, collapsed details, hidden noise action until details open, desktop sticky checklist, mobile collapsed checklist, 2-column mobile rating controls, no horizontal overflow, successful Label Duel transition, valid saved-session reload of `/evidence-board` without hydration warnings, and sealed direct `/evidence-board` access redirecting to `/blind-read` without AI-label leakage. Screenshots saved to `/tmp/telemetry-evidence-board-final-polish-desktop.png` and `/tmp/telemetry-evidence-board-final-polish-mobile.png`.
- Assumptions: The seeded default ratings are intended to represent the system's suggested classification pass and are acceptable as editable defaults for the guided workflow.
- Risks/follow-ups: Default-classified evidence shortens the workflow and should be revisited if future cases require a stricter manual-review gate.
- Next recommended step: Review `/evidence-board` in the app at normal zoom and confirm the default-enabled CTA feels appropriate for the workshop flow.
- Suggested commit message: `ux(arena): polish evidence board classified defaults`

## 2026-06-18: Evidence Board Density And Mobile Polish

- Agent/model: Codex (GPT-5)
- Prompt scope: Second refinement pass on `/evidence-board` focused on reducing vertical length, improving mobile usability, and making the page feel less form-like while preserving the redesigned evidence-review direction.
- Files changed: `components/arena/EvidenceBoard.tsx`, `app/investigation-workflow.css`, `app/page.test.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Compact hero copy now carries the single conclusion, cards default to title/status/summary/classification with deeper rationale and key signals hidden behind `Show details`, the main classification control is four options with `Irrelevant / noise` as a secondary action, the claim checklist is a light sticky sidebar on desktop and a collapsed summary near the top on mobile, and footer helper text is shorter.
- Decisions made: Kept the existing evidence ratings data model, including the noise option, but removed it from the primary segmented control; kept the desktop two-column evidence/checklist layout while reordering the mobile experience around checklist, balance, then compact cards.
- Checks run: `npx tsc --noEmit` passed; `npm test` passed with 33 tests; `npm run lint` passed with the existing 134 warnings under `.agents/skills/impeccable` and no app errors; `npm run build` passed; `git diff --check` passed; `node .agents/skills/impeccable/scripts/detect.mjs --json components/arena/EvidenceBoard.tsx app/investigation-workflow.css app/page.test.ts` returned `[]`; Playwright verification against `http://localhost:3057` passed through the guarded `/blind-read` -> `/ai-reveal` -> `/evidence-board` path at desktop and mobile sizes with no console errors, no horizontal overflow, collapsed evidence details by default, static desktop claim checklist, collapsed mobile claim checklist, 2-column mobile classification controls, disabled CTA before confirmations, enabled CTA after four confirmations, and successful transition to Label Duel. Screenshots saved to `/tmp/telemetry-evidence-board-refined-desktop.png` and `/tmp/telemetry-evidence-board-refined-mobile.png`.
- Assumptions: Native disclosure controls are appropriate for progressive evidence detail because they preserve accessibility and avoid adding client state.
- Risks/follow-ups: The mobile screenshot is intentionally still a full-page scroll because the workflow has four evidence items, but default collapsed details and the compact 2x2 controls substantially reduce the vertical load.
- Next recommended step: Recheck `/evidence-board` on a real mobile viewport for perceived density after this compaction.
- Suggested commit message: `ux(arena): compact evidence board review`

## 2026-06-18: Evidence Board Guided Review Redesign

- Agent/model: Codex (GPT-5)
- Prompt scope: Redesign `/evidence-board` into a calmer, premium, decision-oriented evidence review while preserving the 8-step workflow, route behavior, and evidence classification state model.
- Files changed: `components/arena/EvidenceBoard.tsx`, `components/arena/AppShell.tsx`, `components/arena/arenaMeta.ts`, `app/investigation-workflow.css`, `app/page.test.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Rebuilt Evidence Board around the question `Does the evidence support the AI claim?`, added compact AI-claim/blind-read/overclaim context from AI Reveal, replaced the large map/card grid with a compact evidence balance summary, stacked neutral evidence review cards, suggested-versus-confirmed classifications, and a sticky claim checklist. The primary CTA now reads `Continue with 4 classifications` and remains disabled until all evidence items are explicitly confirmed.
- Decisions made: Kept existing fixture data and rating/export types intact; treated default evidence ratings as suggested classifications and `reviewState.evidenceRatings` as reviewer confirmation; retained `Irrelevant / noise` as a fifth compact option because the product rules require that evidence remain classifiable as noise when needed.
- Checks run: `npx tsc --noEmit` passed; `npm test` passed with 33 tests; `npm run lint` passed with the existing 134 warnings under `.agents/skills/impeccable` and no app errors; `npm run build` passed; `git diff --check` passed; `node .agents/skills/impeccable/scripts/detect.mjs --json components/arena/EvidenceBoard.tsx components/arena/AppShell.tsx components/arena/arenaMeta.ts app/investigation-workflow.css app/page.test.ts` returned `[]`; Playwright verification against the existing dev server at `http://localhost:3000` passed through the guarded `/blind-read` -> `/ai-reveal` -> `/evidence-board` path at desktop and mobile sizes with no console errors, no horizontal overflow, disabled CTA before confirmations, enabled CTA after four confirmations, and successful transition to Label Duel. Screenshots saved to `/tmp/telemetry-evidence-board-desktop.png` and `/tmp/telemetry-evidence-board-mobile.png`.
- Assumptions: The seeded IAM overclaim case remains the target narrative for this page, so the copy can name IAM activity, missing downstream abuse, sensitive access, malicious intent, and the ambiguous PassRole-like probe without inventing evidence.
- Risks/follow-ups: The `Irrelevant / noise` option remains available as a compact fifth segment to satisfy the product taxonomy, even though the current IAM case uses only weak support, contradictions, and needs-context classifications.
- Next recommended step: Run focused visual review of `/evidence-board` after selecting Cloud resource discovery and revealing the AI label.
- Suggested commit message: `ux(arena): redesign evidence board review flow`

## 2026-06-18: Global Workflow Chrome Migration

- Agent/model: Codex (GPT-5)
- Prompt scope: Migrate all 8 Telemetry Court workflow pages onto the shared `/ai-reveal` visual foundation without deeply redesigning page-specific task content.
- Files changed: `components/arena/WorkflowPrimitives.tsx`, `components/arena/AppShell.tsx`, `components/arena/TelemetryGalaxy.tsx`, `components/arena/CaseFilePanel.tsx`, `components/arena/BlindReadPanel.tsx`, `components/arena/AiRevealPanel.tsx`, `components/arena/EvidenceBoard.tsx`, `components/arena/LabelDuelPanel.tsx`, `components/arena/ImpostorPanel.tsx`, `components/arena/VerdictPanel.tsx`, `app/investigation-workflow.css`, `app/page.test.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Migrated Evidence Landscape, Case File, Blind Read, AI Reveal, Evidence Board, Label Duel, Impostor, and Verdict to the shared centered workflow shell, aligned header, compact 8-step progress, shared hero pattern, status badges, and action footer language. Removed the mounted heavy stage rail, right case-status cockpit, and generic global Back/Next controls from the active workflow chrome while preserving route guards, session state, evidence classification, label duel, impostor selection, verdict, export, and review drawer behavior.
- Decisions made: Kept the Evidence Landscape's dark galaxy experience but aligned its app header and progress chrome with the light shared system; extended `ArenaStepProgress` to support compact guarded stage navigation so the old rail's navigational affordance is preserved without dominating the layout; used a shared 1040px centered workflow width; kept the Verdict review-data menu; left the old StageRail and InvestigationCockpit source in place for a later cleanup-only pass instead of removing unrelated code.
- Checks run: `npx tsc --noEmit` passed; `npm test` passed with 33 tests; `npm run lint` passed with the existing 134 warnings under `.agents/skills/impeccable` and no app errors; `npm run build` passed; `git diff --check` passed; `node .agents/skills/impeccable/scripts/detect.mjs --json components/arena/WorkflowPrimitives.tsx components/arena/TelemetryGalaxy.tsx components/arena/CaseFilePanel.tsx components/arena/BlindReadPanel.tsx components/arena/AiRevealPanel.tsx components/arena/EvidenceBoard.tsx components/arena/LabelDuelPanel.tsx components/arena/ImpostorPanel.tsx components/arena/VerdictPanel.tsx components/arena/AppShell.tsx app/investigation-workflow.css app/page.test.ts` returned `[]`; desktop screenshots captured all 8 workflow pages through the real guarded flow; mobile smoke test passed with no console errors, no horizontal overflow, no old rail/cockpit/global controls, and correct step labels. Screenshots saved in `/tmp/telemetry-court-global-chrome/`.
- Assumptions: Replacing the left rail with compact clickable progress segments is an acceptable global navigation treatment because it still uses the existing guarded `navigateToStage` path; page internals can remain visually denser until their dedicated redesign passes.
- Risks/follow-ups: Evidence Board, Label Duel, Impostor, and Verdict still contain older task-card compositions by design; the next pass should redesign those internals one page at a time. Old unused chrome components and CSS can be removed after the new shell direction settles.
- Next recommended step: Start the page-specific redesign pass with `/evidence-board`, reducing card nesting while keeping evidence classification logic intact.
- Suggested commit message: `ux(arena): migrate workflow chrome globally`

## 2026-06-18: Fix Arena Screenshot Route Guards

- Agent/model: Antigravity (Gemini 3.1 Pro)
- Prompt scope: Fix the Playwright screenshot script that was failing to capture unique stages due to the recently added route guards in the arena layout.
- Files changed: `scripts/screenshots.js`
- Summary: Injected a safe seed state into `sessionStorage` under `telemetry-court-arena-state-v1` immediately after the first navigation to allow Playwright to bypass the `isStageAccessible` route guards and capture distinct screenshots for pages 3-8. Added logging warnings if redirection still happens.
- Decisions made: Simulated the completion of previous stages directly via the store rather than running a full automated click-through, ensuring the screenshots stay focused and the test runs quickly.
- Checks run: Executed `node scripts/screenshots.js` manually; verified images in `screenshots/` updated correctly for stages 3-8 without falling back to stage 3.
- Assumptions: The structure of `telemetry-court-arena-state-v1` will remain stable enough for the screenshot script, or the script will be updated alongside the state schema.
- Risks/follow-ups: If the reducer logic drastically changes or requires more keys (like `reviewsByCase[id].evidenceRatings` being populated for stage 5), the mock state might need expanding.
- Next recommended step: None.
- Suggested commit message: `test(e2e): seed arena state to bypass route guards for screenshots`

## 2026-06-18: Shared Workflow Layout Foundation

- Agent/model: Codex (GPT-5)
- Prompt scope: Create a reusable workflow layout foundation from the current `/ai-reveal` visual direction without redesigning the remaining workflow pages.
- Files changed: `components/arena/WorkflowPrimitives.tsx`, `components/arena/WorkflowPrimitives.test.tsx`, `components/arena/AppShell.tsx`, `components/arena/AiRevealPanel.tsx`, `components/arena/BlindReadPanel.tsx`, `app/investigation-workflow.css`, `app/page.test.ts`, `next.config.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Added shared arena primitives for workflow shell, header, compact step progress, step hero, status badges, soft sections/evidence rows, and CTA footer. Migrated `/ai-reveal` to those shared primitives with visual parity, lightly aligned `/blind-read` to the same centered header/progress/hero/shell language, and kept `/evidence-board`, `/label-duel`, `/impostor`, and `/verdict` behaviorally unchanged for later migration.
- Decisions made: Centralized the header markup in `ArenaHeader`; removed the repeated side cockpit from `/blind-read` and `/ai-reveal` because those pages now carry their own state; left the heavier rail/cockpit treatment on pages 5-8 as an intentional unmigrated follow-up; disabled the Next.js dev indicator with `devIndicators: false` after confirming the black circular `N` was framework dev UI, not app UI.
- Checks run: `npx tsc --noEmit` passed; `npm test` passed with 32 tests; `npm run lint` passed with the existing 134 warnings under `.agents/skills/impeccable` and no app errors; `npm run build` passed; `git diff --check` passed; `node .agents/skills/impeccable/scripts/detect.mjs --json components/arena/WorkflowPrimitives.tsx components/arena/WorkflowPrimitives.test.tsx components/arena/AiRevealPanel.tsx components/arena/BlindReadPanel.tsx components/arena/AppShell.tsx app/investigation-workflow.css app/page.test.ts next.config.ts` returned `[]`; Playwright verification against `http://localhost:3047` captured `/blind-read`, `/ai-reveal`, `/evidence-board`, `/label-duel`, `/impostor`, and `/verdict` screenshots with no console errors and no horizontal overflow.
- Assumptions: This pass should create a migration foundation and only apply it immediately where low-risk: `/ai-reveal` and `/blind-read`.
- Risks/follow-ups: Pages 5-8 still use older dashboard-like sections, stage rail, right case cockpit, and generic bottom `Next` controls. Migrate them one page at a time onto the new primitives.
- Next recommended step: Apply `ArenaWorkflowShell`, `ArenaStepProgress`, `ArenaStepHero`, `ArenaStatusBadge`, and `ArenaActionFooter` to `/evidence-board` next, replacing generic `Next` with a descriptive CTA.
- Suggested commit message: `ux(arena): extract workflow layout foundation`

## 2026-06-18: AI Reveal Bottom Action Cleanup

- Agent/model: Codex (GPT-5)
- Prompt scope: Tiny final cleanup pass on `/ai-reveal` only, focused on making the bottom action area more compact, keeping `View scoring details` clearly interactive, preserving the main reveal structure/copy, and keeping the evidence-board transition intact.
- Files changed: `components/arena/AiRevealPanel.tsx`, `app/investigation-workflow.css`, and `docs/CHANGELOG_AI.md`.
- Summary: Grouped the scoring disclosure and CTA footer into one compact bottom-control cluster, kept the scoring control as a native disclosure with clearer hover/focus/active states, tightened the microcopy/button grouping, gave the AI Reveal primary CTA scoped dark hover/focus behavior without heavy shadows, and trimmed the AI Reveal stage gap slightly.
- Decisions made: Kept the reveal hero, comparison, evidence explanation, copy, route guards, `/blind-read` behavior, 8-step progress, and `Review evidence board` transition unchanged; kept scoring details available but secondary.
- Checks run: `npx tsc --noEmit` passed; `npm test` passed with 32 tests; `npm run lint` passed with the existing 134 warnings under `.agents/skills/impeccable` and no app errors; `npm run build` passed; `git diff --check` passed; `node .agents/skills/impeccable/scripts/detect.mjs --json app/investigation-workflow.css components/arena/AiRevealPanel.tsx` returned `[]`; browser verification against `http://localhost:3030` in Brave confirmed one `Review evidence board` CTA, one functional `View scoring details` disclosure, no horizontal overflow at 1440x900 or 1116x632, direct `/ai-reveal` guard back to `/blind-read`, and successful transition to `/evidence-board`. Screenshots saved to `/private/tmp/telemetry-ai-reveal-tiny-cleanup-desktop-settled.png` and `/private/tmp/telemetry-ai-reveal-tiny-cleanup-110-width-settled.png`.
- Assumptions: A tiny structural wrapper around the existing disclosure and footer is acceptable because it does not change review state, routing, copy, or workflow behavior.
- Risks/follow-ups: A very short 1116x632 viewport still needs slight vertical scrolling, but the prior horizontal clipping/dispersion problem remains fixed and the bottom controls stay grouped.
- Next recommended step: Review `/ai-reveal` in Brave at your normal zoom and confirm the lower action cluster feels final.
- Suggested commit message: `ux(arena): tighten ai reveal actions`

## 2026-06-18: AI Reveal Final Premium Polish

- Agent/model: Codex (GPT-5)
- Prompt scope: Final premium polish pass on `/ai-reveal` only, focused on alignment, visual hierarchy, softer surfaces, less dashboard-like comparison/evidence treatment, and preserving all workflow behavior.
- Files changed: `components/arena/AiRevealPanel.tsx`, `app/investigation-workflow.css`, and `docs/CHANGELOG_AI.md`.
- Summary: Aligned the Telemetry Court header to the same max-width as the reveal stage, removed the outer stage panel so the page no longer reads as cards inside a card, moved `Likely overclaim` beside the `AI Reveal` eyebrow, removed the `versus` divider, softened the comparison into one neutral two-lane surface, made the evidence explanation less table-like, and grouped the CTA/microcopy into a cleaner next-step row.
- Decisions made: Preserved the AI Reveal content, route guards, reducer state, 8-step progress, Blind Read behavior, hidden AI Reveal sidebar, collapsed scoring disclosure, and `Review evidence board` transition; kept all changes scoped to AI Reveal styling and markup.
- Checks run: `npx tsc --noEmit` passed; `npm test` passed with 32 tests; `npm run lint` passed with the existing 134 warnings under `.agents/skills/impeccable` and no app errors; `npm run build` passed; `git diff --check` passed; `node .agents/skills/impeccable/scripts/detect.mjs --json app/investigation-workflow.css components/arena/AiRevealPanel.tsx components/arena/InvestigationCockpit.tsx components/arena/AppShell.tsx app/page.test.ts` returned `[]`; browser verification against `http://localhost:3028` passed at 1440x900, 1116x632, and 390x844 with no horizontal overflow, no generic `Next`, no `Open review summary`, no `tests` text, no `versus` text, one `Review evidence board` CTA, hidden AI Reveal sidebar, direct `/ai-reveal` guard back to `/blind-read` without visible AI-label leak, and working transition to `/evidence-board`. Screenshots saved to `/private/tmp/telemetry-ai-reveal-final-polish-desktop.png`, `/private/tmp/telemetry-ai-reveal-final-polish-110-width.png`, and `/private/tmp/telemetry-ai-reveal-final-polish-mobile.png`.
- Assumptions: AI Reveal should behave as a focused reveal moment where the page itself carries the case state, so the case-status sidebar can remain hidden on this route.
- Risks/follow-ups: The final mobile page still scrolls, but the desktop and zoom-width compositions now fit comfortably without horizontal drift or repeated summary blocks.
- Next recommended step: Review `/ai-reveal` in Brave at your usual zoom and confirm the final centered composition feels presentation-ready.
- Suggested commit message: `ux(arena): polish ai reveal final layout`

## 2026-06-18: AI Reveal 110% Zoom Resilience

- Agent/model: Codex (GPT-5)
- Prompt scope: Fix the `/ai-reveal` layout when Brave/browser zoom is around 110%, where the reveal stage could drift horizontally and leave the user looking at the clipped right edge of the page.
- Files changed: `app/investigation-workflow.css` and `docs/CHANGELOG_AI.md`.
- Summary: Added an AI Reveal-specific mid-width layout from 861px to 1320px that switches the page to a true single-column stack, keeps the main reveal stage first, moves the case-status panel below it, and hard-constrains the workspace, stage, and cockpit to the viewport width.
- Decisions made: Matched the earlier Blind Read zoom-resilience pattern instead of shrinking all text; preserved the desktop side summary above 1320px and the existing mobile stack below 860px.
- Checks run: `npx tsc --noEmit` passed; `npm test` passed with 32 tests; `npm run lint` passed with the existing 134 warnings under `.agents/skills/impeccable` and no app errors; `npm run build` passed; `git diff --check` passed; `node .agents/skills/impeccable/scripts/detect.mjs --json app/investigation-workflow.css components/arena/AiRevealPanel.tsx components/arena/InvestigationCockpit.tsx components/arena/AppShell.tsx app/page.test.ts` returned `[]`; browser verification against `http://localhost:3000` passed at 1116x632, 1024x640, and a 1228x696 viewport with an added 110% page zoom stress check, with no horizontal overflow, one `Review evidence board` CTA, no generic `Next`, and no console issues. Screenshots saved to `/private/tmp/telemetry-ai-reveal-zoom-110-equivalent.png`, `/private/tmp/telemetry-ai-reveal-zoom-125-equivalent.png`, and `/private/tmp/telemetry-ai-reveal-css-zoom-110.png`.
- Assumptions: The problematic 110% screenshot corresponds to a mid-width CSS viewport around 1116px after browser chrome and zoom are accounted for.
- Risks/follow-ups: Browser zoom can combine with each user's window size differently; if another awkward breakpoint appears, add the specific CSS viewport dimensions to the verification matrix.
- Next recommended step: Recheck `/ai-reveal` in Brave at 110% zoom with the same window size and confirm the page no longer drifts to the right.
- Suggested commit message: `fix(arena): harden ai reveal zoom layout`

## 2026-06-18: AI Reveal Premium Overclaim Moment

- Agent/model: Codex (GPT-5)
- Prompt scope: Redesign only `/ai-reveal` into a calm, premium reveal screen that makes the Blind Read/AI-label divergence, likely overclaim assessment, evidence rationale, and evidence-board action immediately clear.
- Files changed: `components/arena/AiRevealPanel.tsx`, `components/arena/InvestigationCockpit.tsx`, `components/arena/AppShell.tsx`, `app/investigation-workflow.css`, `app/page.test.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Rebuilt AI Reveal around `Your read and the AI label diverge.`, a single `Likely overclaim` assessment, side-by-side blind-read/AI-label comparison, three evidence alignment rows for observed/missing/ambiguous signals, collapsed technical scoring, one primary `Review evidence board` CTA, and a compact case-state sidebar. Removed the large reveal mini-map from this stage, removed the debug-looking `tests` comparison node, hid the generic Back/Next footer on AI Reveal, and removed the review-summary action from this page.
- Decisions made: Kept the existing route guards, reducer state, 8-step workflow, and evidence-board transition intact; reused the synthetic IAM evidence already in `data/sampleCases.ts`; kept raw scores available only under `View scoring details`; left broader non-AI-Reveal cockpit behavior unchanged.
- Checks run: `npx tsc --noEmit` passed; `npm test` passed with 32 tests; `npm run lint` passed with the existing 134 warnings under `.agents/skills/impeccable` and no app errors; `npm run build` passed; `git diff --check` passed; `node .agents/skills/impeccable/scripts/detect.mjs --json components/arena/AiRevealPanel.tsx components/arena/InvestigationCockpit.tsx components/arena/AppShell.tsx app/investigation-workflow.css app/page.test.ts` returned `[]`; browser verification against the existing dev server at `http://localhost:3000` confirmed the Blind Read selection/reveal path, one `Review evidence board` CTA, no generic `Next` button, no `Open review summary`, no `tests` text, no desktop/mobile horizontal overflow, route guard from direct `/ai-reveal` access back to `/blind-read`, and working transition to `/evidence-board`. Screenshots saved to `/private/tmp/telemetry-ai-reveal-compare-blind-read.png`, `/private/tmp/telemetry-ai-reveal-redesign-desktop.png`, `/private/tmp/telemetry-ai-reveal-redesign-clean-desktop.png`, and `/private/tmp/telemetry-ai-reveal-redesign-mobile.png`.
- Assumptions: The default IAM sample case remains the primary demo route for `/ai-reveal`, so the overclaim explanation can name IAM role creation, policy attachment, missing abuse evidence, and the ambiguous PassRole-like probe without inventing evidence.
- Risks/follow-ups: The existing dev server on port 3000 emits historical hot-reload log noise from prior edits, but the fresh browser verification for this pass reported no current console issues. A future workflow-wide pass could standardize the same compact progress treatment across Evidence Board and Label Duel.
- Next recommended step: Review `http://localhost:3000/ai-reveal` after selecting Cloud resource discovery on `/blind-read` and confirm the reveal moment feels presentation-ready.
- Suggested commit message: `ux(arena): redesign ai reveal overclaim moment`

## 2026-06-18: Blind Read Zoom Resilience

- Agent/model: Codex (GPT-5)
- Prompt scope: Fix the `/blind-read` layout at browser zoom levels, especially 110%, after the simplified premium layout still felt cramped at intermediate widths.
- Files changed: `app/investigation-workflow.css`, `screenshots/blind-read.png`, and `docs/CHANGELOG_AI.md`.
- Summary: Added a mid-width Blind Read layout for zoomed desktop windows so the main stage becomes full width and the compact status card moves below it instead of squeezing the stage sideways. Also changed the interpretation grid from a fixed two-column layout to a width-aware `auto-fit` grid so cards only sit side by side when each card has enough room.
- Decisions made: Preserved the compact right status card on wide desktop and kept the existing mobile collapse behavior; solved the 110% failure by removing the narrow side-by-side composition at mid widths rather than only shrinking typography or spacing.
- Checks run: `npx tsc --noEmit` passed; `npm test` passed with 31 tests; `npm run lint` passed with the existing 134 warnings under `.agents/skills/impeccable` and no app errors; `npm run build` passed; `git diff --check` passed; `node .agents/skills/impeccable/scripts/detect.mjs --json app/investigation-workflow.css components/arena/BlindReadPanel.tsx components/arena/InvestigationCockpit.tsx app/page.test.ts` returned `[]`; Playwright zoom-equivalent verification passed at 80%, 90%, 100%, 110%, 125%, and 150% with no horizontal overflow, no visible text overflow, no pre-reveal leakage, enabled reveal after selection, and status-panel update after selecting an interpretation.
- Assumptions: The reported 110% issue is the intermediate-width desktop layout around a 1440px browser window at 110% zoom, approximated with a 1309px CSS viewport in automated verification.
- Risks/follow-ups: If reviewers commonly run browser zoom above 150%, consider a broader workflow-wide zoom audit across Case File, AI Reveal, Evidence Board, Label Duel, Impostor, and Verdict.
- Next recommended step: Try `http://localhost:3020/blind-read` at 90%, 100%, 110%, 125%, and 150% in your browser and confirm the card density now feels right.
- Suggested commit message: `ux(arena): harden blind read zoom layout`

## 2026-06-18: Blind Read Premium Simplification Pass

- Agent/model: Codex (GPT-5)
- Prompt scope: Refine the `/blind-read` stage one more step so it feels calmer, less crowded, and more intentional while preserving the pre-reveal blind-read guardrails.
- Files changed: `components/arena/BlindReadPanel.tsx`, `components/arena/InvestigationCockpit.tsx`, `components/arena/AiRevealPanel.tsx`, `app/investigation-workflow.css`, `app/page.test.ts`, `screenshots/blind-read.png`, and `docs/CHANGELOG_AI.md`.
- Summary: Removed the duplicated Blind Read left-rail navigation from the active layout, replaced the crowded labeled 8-step strip with `Step 3 of 8 · Blind Read` and compact progress segments, changed the hero copy to `Judge the evidence first.`, made the evidence/context area full-width above the choices, moved the cluster preview into a secondary context-preview module, tightened interpretation cards into a denser two-column desktop grid, added CTA save-before-reveal microcopy, and compacted the pre-reveal case-status card.
- Decisions made: Kept all pre-reveal AI claim, agreement, support, suspiciousness, overclaim, and result metrics hidden; treated checklist evidence state as `Evidence visible` rather than inferred review completion; used explicit completed/incomplete checklist icons; kept `None of these` visually secondary; normalized user-facing step-name casing to `Blind Read`.
- Checks run: `npx tsc --noEmit` passed; `npm test` passed with 31 tests; `npm run lint` passed with the existing 134 warnings under `.agents/skills/impeccable` and no app errors; `npm run build` passed; `git diff --check` passed; `node .agents/skills/impeccable/scripts/detect.mjs --json components/arena/BlindReadPanel.tsx components/arena/InvestigationCockpit.tsx components/arena/AiRevealPanel.tsx app/investigation-workflow.css app/page.test.ts` returned `[]`; Playwright verification against `http://localhost:3020/blind-read` passed on 1440x900 and 390x844 with no pre-reveal label/status/metric leakage, no horizontal overflow, hidden rail, 8 progress segments, disabled CTA before selection, enabled reveal after selection, and status-panel update after selecting an interpretation.
- Assumptions: The Blind Read page should use the page-level progress treatment as its only primary navigation, with the global stage rail hidden only on this step.
- Risks/follow-ups: The compact status card remains below the main content on narrow screens; if mobile needs persistent status, a future pass could collapse it into a top summary row rather than restoring a sidebar.
- Next recommended step: Review the updated `/blind-read` screenshot against the demo viewport and decide whether the same compact progress treatment should become the workflow-wide pattern.
- Suggested commit message: `ux(arena): simplify blind read decision stage`

## 2026-06-18: Blind Read Flow Coherence Refinement

- Agent/model: Codex (GPT-5)
- Prompt scope: Refine the `/blind-read` stage so it reads as step 3 of the full 8-step review flow, protects the blind interpretation before AI reveal, removes conflicting navigation, and improves the premium evidence-first layout.
- Files changed: `components/arena/BlindReadPanel.tsx`, `components/arena/InvestigationCockpit.tsx`, `components/arena/AppShell.tsx`, `lib/arenaReviewState.ts`, `lib/arenaRoutes.ts`, `app/investigation-workflow.css`, `app/page.test.ts`, `lib/arenaReviewState.test.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Replaced the 4-step Blind Read progress with an 8-step progress model, neutralized the pre-reveal case title, tightened the sealed-claim notice and secondary cluster preview, converted evidence bullets into scan-friendly rows, polished the technical-evidence disclosure, strengthened radio-card affordance, hid top-level export until Verdict, and removed the Blind Read footer `Next` path. Added route protection so `/ai-reveal` and later stages render/redirect back until the required blind read and reveal gates are satisfied.
- Decisions made: Used `Landscape` as the short step label while retaining the Evidence landscape page title; treated seeded default evidence ratings as fixture defaults rather than completed user classification work; kept one compact sealed-claim notice plus the right-panel `AI claim: Hidden` status; kept the mini-map only as a small neutral locator with no pre-reveal evidence/status metrics.
- Checks run: `npx tsc --noEmit` passed; `npm test` passed with 31 tests; `npm run lint` passed with the existing 134 warnings under `.agents/skills/impeccable` and no app errors; `npm run build` passed; `git diff --check` passed; `node .agents/skills/impeccable/scripts/detect.mjs --json components/arena/BlindReadPanel.tsx components/arena/InvestigationCockpit.tsx components/arena/AppShell.tsx lib/arenaReviewState.ts lib/arenaRoutes.ts app/investigation-workflow.css app/page.test.ts lib/arenaReviewState.test.ts` returned `[]`; browser verification against the existing dev server at `http://localhost:3000` confirmed no pre-reveal AI label/case-title/status/metric leakage, disabled CTA before selection, exactly one reveal CTA after selection, route guard from `/ai-reveal` back to `/blind-read`, no desktop/mobile horizontal overflow, no error overlay, and no console errors. Screenshots saved to `/private/tmp/telemetry-blind-read-refined-desktop-v2.png` and `/private/tmp/telemetry-blind-read-refined-mobile-v2.png`.
- Assumptions: The default IAM sample remains the primary demo case, and evidence-summary copy should stay neutral while still naming observed IAM operations because those are visible evidence, not the hidden AI interpretation.
- Risks/follow-ups: The global left rail is still visually compact and number-forward, but the Blind Read page now has a labeled 8-step progress component in the main workspace. A future workflow-wide pass could standardize all stage navigation around the same clearer progress model.
- Next recommended step: Apply the same route-gate and progress-language audit to `/ai-reveal`, `/evidence-board`, and `/label-duel` so every stage has the same 8-step coherence.
- Suggested commit message: `ux(arena): refine blind read flow protection`

## 2026-06-18: Blind Read Decision-Focused Redesign

- Agent/model: Codex (GPT-5)
- Prompt scope: Redesign the `/blind-read` stage into a calm, premium, decision-focused blind review that prevents pre-reveal AI judgment leakage and makes the reveal action singular and obvious.
- Files changed: `components/arena/BlindReadPanel.tsx`, `components/arena/InvestigationCockpit.tsx`, `components/arena/SemanticMiniMap.tsx`, `components/arena/WorkflowPrimitives.tsx`, `components/arena/AppShell.tsx`, `data/sampleCases.ts`, `app/investigation-workflow.css`, `app/page.test.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Rebuilt Blind Read around the heading `Read the evidence first.`, a neutral AI-claim-hidden card, four-step progress cue, concise evidence summary, secondary technical-evidence disclosure, accessible radio-card interpretations, one disabled/enabled reveal CTA, and a neutral `Case status` panel before reveal. Moved `Review JSON` under an `Export` menu and added session-scoped review-state persistence so selecting and revealing on `/blind-read` survives the route transition to `/ai-reveal`.
- Decisions made: Hid `OVERCLAIM`, agreement, evidence, uncertainty, and average-support metrics before reveal; renamed the blind choice to `Possible privilege escalation` while keeping the actual AI label hidden and unchanged; kept the mini-map as a smaller neutral context object without evidence percentages; moved the status panel below the main content on narrow screens.
- Checks run: Added blind-read guardrail and accessible-radio-card tests; `npm test` passed with 29 tests; `npm run lint` passed with the existing 134 `.agents/skills/impeccable` warnings and no app errors; `npm run build` passed; `git diff --check` passed; `node .agents/skills/impeccable/scripts/detect.mjs --json components/arena/BlindReadPanel.tsx components/arena/InvestigationCockpit.tsx components/arena/SemanticMiniMap.tsx components/arena/AppShell.tsx app/investigation-workflow.css app/page.test.ts` returned `[]`; Playwright verification against `http://localhost:3000/blind-read` saved `/private/tmp/telemetry-blind-read-redesign-desktop.png`, `/private/tmp/telemetry-blind-read-redesign-mobile.png`, and `/private/tmp/telemetry-ai-reveal-after-blind-redesign.png`, confirming no pre-reveal hidden-label/status/metric leakage, disabled CTA before choice, exactly one reveal button after choice, visible AI claim and metrics after reveal, and no desktop/mobile horizontal overflow.
- Assumptions: The default IAM sample case remains the main demo path, so the evidence summary uses only facts already present in that synthetic packet.
- Risks/follow-ups: The broad stage rail still contains the full workflow; the added four-step progress cue now clarifies the review path on Blind Read, but a future scoped pass could simplify the global stage rail across all investigation screens.
- Next recommended step: Review the desktop and mobile screenshots in the target presentation viewport and decide whether the same decision-focused treatment should be applied to `/ai-reveal`.
- Suggested commit message: `ux(arena): protect blind read decision flow`

## 2026-06-18: Case File Region Context Real Neighbour Locator

- Agent/model: Codex (GPT-5)
- Prompt scope: Use `$impeccable` for a final targeted `/case-file` Region context pass, making `cluster-iam-041` a real plotted neighbour in the shared Evidence Landscape data model while avoiding fake geography.
- Files changed: `lib/types.ts`, `data/sampleCases.ts`, `app/[[...stage]]/page.tsx`, `components/arena/RoutedAppShell.tsx`, `components/arena/AppShell.tsx`, `components/arena/TelemetryGalaxy.tsx`, `components/arena/EvidenceGalaxyAtlas.tsx`, `components/arena/CaseFilePanel.tsx`, `app/globals.css`, `app/investigation-workflow.css`, `app/page.test.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Added a `LandscapeContextNode` type and exposed `cluster-iam-041` as a context-only landscape node with real coordinates, status, label, and nearest-neighbour metadata. Routed the shared context-node data into the Evidence Landscape and Case File Region context so `cluster-iam-029` now renders the real locator branch with selected, nearest-neighbour, and faint surrounding real nodes.
- Decisions made: Kept `cluster-iam-041` out of the full reviewable case workflow; reused `getLandscapeAtlasPosition` and `getGalaxyStatusAccent` from the Evidence Landscape for the locator; kept the fallback summary for cases where the nearest neighbour cannot be resolved to a plotted landscape node; avoided fake background regions, invented blobs, decorative territory labels, and inferred geometry.
- Checks run: `npm test` passed with 27 tests; `npm run lint` passed with the existing 134 `.agents/skills/impeccable` warnings and no app errors; `npm run build` passed; `node .agents/skills/impeccable/scripts/detect.mjs --json components/arena/CaseFilePanel.tsx components/arena/EvidenceGalaxyAtlas.tsx components/arena/TelemetryGalaxy.tsx components/arena/AppShell.tsx components/arena/RoutedAppShell.tsx data/sampleCases.ts app/page.test.ts app/globals.css app/investigation-workflow.css` reported only the two known pre-existing `transition: width` warnings in `app/globals.css`; Playwright verification against `http://localhost:3038/case-file` saved `/private/tmp/telemetry-region-context-real-locator-desktop.png` and `/private/tmp/telemetry-region-context-real-locator-mobile.png`, confirmed real locator rendering, no fallback, `View in landscape` navigation to `/`, the `cluster-iam-041` Evidence Landscape context node, no hidden AI claim exposure, and no desktop or mobile horizontal overflow.
- Assumptions: A context-only neighbour is the right model because `cluster-iam-041` needs landscape coordinates and comparison metadata, but does not need the full evidence packet/review workflow.
- Risks/follow-ups: If context nodes later become selectable or reviewable, promote them deliberately into full `CaseFile` records instead of overloading the context-only type.
- Next recommended step: Review `/case-file` and `/` in the local browser to confirm the context-only node should remain non-selectable.
- Suggested commit message: `ux(arena): add real region context neighbour locator`

## 2026-06-18: Case File Region Context Real Locator Gate

- Agent/model: Codex (GPT-5)
- Prompt scope: Use `$impeccable` to refine only the `/case-file` Region context card into a hybrid module that can show a real Evidence Landscape locator without inventing geography.
- Files changed: `components/arena/CaseFilePanel.tsx`, `components/arena/EvidenceGalaxyAtlas.tsx`, `app/investigation-workflow.css`, `app/page.test.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Extracted the Evidence Landscape atlas coordinate helper for reuse, added a compact read-only `Landscape locator` branch that renders selected, nearest-neighbour, and context points only when the nearest neighbour is present as real landscape case data, and kept the current production view as an explicit neighbour-summary fallback because `cluster-iam-041` has no case coordinates today.
- Decisions made: Reused the same `cases` data, `getLandscapeAtlasPosition`, and `getGalaxyStatusAccent` logic as the Evidence Landscape; avoided plotting `cluster-iam-041` from distance metadata alone; removed Region-context-specific `SemanticMiniMap` CSS hooks so the old fake reference-point map is not revived in this card.
- Checks run: Added test coverage for the current fallback and the future locator-available branch; `npm test` passed with 25 tests; `npm run lint` passed with the existing 134 `.agents/skills/impeccable` warnings and no app errors; `npm run build` passed; `node .agents/skills/impeccable/scripts/detect.mjs --json components/arena/CaseFilePanel.tsx components/arena/EvidenceGalaxyAtlas.tsx app/investigation-workflow.css app/page.test.ts` returned `[]`; Playwright verification against `http://localhost:3036/case-file` saved `/private/tmp/telemetry-region-context-hybrid-desktop.png` and `/private/tmp/telemetry-region-context-hybrid-mobile.png`, confirmed fallback rendering, no locator with current data, no hidden AI claim exposure, no mobile horizontal overflow, and `View in landscape` navigating to `/`.
- Assumptions: The current sample landscape intentionally includes `cluster-iam-041` as nearest-neighbour metadata only, not as a first-class plotted region.
- Risks/follow-ups: To show the locator in production, add `cluster-iam-041` as real landscape case data with coordinates from the same fixture model; do not infer its position from neighbour distance.
- Next recommended step: Promote nearest-neighbour clusters into the Evidence Landscape data model if spatial comparison should be visible on `/case-file`.
- Suggested commit message: `ux(arena): gate region locator on real landscape data`

## 2026-06-17: Case File Region Context Semantic Refinement

- Agent/model: Codex (GPT-5)
- Prompt scope: Use `$impeccable` to stop iterating on the failed Region context mini-map and refactor only that module into a real-context fallback.
- Files changed: `components/arena/CaseFilePanel.tsx`, `app/investigation-workflow.css`, `app/page.test.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Implemented Option B: removed the fake abstract mini-map entirely and replaced it with a compact neighbour-comparison card showing the selected region, nearest neighbour, similarity, evidence strength, uncertainty, interpretation, caution, and `View in landscape` action.
- Decisions made: Chose the no-map fallback because `cluster-iam-041` exists as nearest-neighbour metadata rather than a selectable Evidence Landscape case with real coordinates; drawing it on a mini-map would require inventing geometry. Preserved the hidden AI claim by saying “malicious interpretation” rather than exposing the generated label.
- Checks run: Updated static render expectations for the comparison module and added negative checks against fake region labels; `npm test` passed with 24 tests; `npm run lint` passed with the existing 134 `.agents/skills/impeccable` warnings and no app errors; `npm run build` passed; Playwright verification against the production build on `localhost:3033` saved `/private/tmp/telemetry-region-context-fallback-desktop.png` and `/private/tmp/telemetry-region-context-fallback-mobile.png`, confirmed zero locator fields/maps, two comparison entities, three signal rows, no fake labels, no horizontal overflow, and no hidden AI claim exposure.
- Assumptions: Until the nearest-neighbour metadata has real Evidence Landscape coordinates, a clear comparison is more truthful than a locator visualization.
- Risks/follow-ups: If neighbour clusters become first-class landscape cases later, Region context can be revisited as Option A by rendering actual landscape geometry from shared atlas data.
- Next recommended step: Keep Region context text-only until the data model exposes real neighbouring-region coordinates.
- Suggested commit message: `ux(arena): replace region context map with comparison`

## 2026-06-17: Case File Region Context Locator Refactor

- Agent/model: Codex (GPT-5)
- Prompt scope: Use `$impeccable` to refactor only the `/case-file` Region context module as navigation plus context, not another decorative mini chart.
- Files changed: `components/arena/CaseFilePanel.tsx`, `components/arena/AppShell.tsx`, `app/investigation-workflow.css`, `app/page.test.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Rebuilt Region context into a two-level module with a global landscape locator, a local nearest-neighbour zoom, compact comparison facts, and revised ambiguity copy while preserving the rest of the Case File structure and pre-blind hidden-claim logic.
- Decisions made: Passed the existing case list into `CaseFilePanel` so Region context can render a simplified full-field locator; reused known synthetic case positions for the locator with a fallback for future cases; kept the nearest-neighbour cluster as a virtual local comparison because `cluster-iam-041` is neighbour metadata rather than a full selectable sample case.
- Checks run: Added test coverage for `Landscape position`, `Nearest neighbour context`, neighbour meaning, and the updated ambiguity statement; `npm test` passed with 24 tests; `npm run lint` passed with the existing 134 `.agents/skills/impeccable` warnings and no app errors; `npm run build` passed; `node .agents/skills/impeccable/scripts/detect.mjs --json components/arena/CaseFilePanel.tsx app/investigation-workflow.css app/page.test.ts` returned `[]`; Playwright screenshots saved to `/private/tmp/telemetry-region-context-refactor-desktop.png` and `/private/tmp/telemetry-region-context-refactor-mobile.png`; browser verification confirmed no hidden AI claim exposure, no mobile horizontal overflow, and `Start blind investigation` routes to `/blind-read`.
- Assumptions: The IAM case should be positioned as part of a routine IAM neighbourhood before the blind read without making the hidden suspicious claim dominant.
- Risks/follow-ups: The locator uses a simplified level-of-detail map rather than a reusable shared galaxy-position helper; if the atlas geometry becomes dynamic, extracting a shared landscape-position utility would prevent drift.
- Next recommended step: Review the new Region context screenshots against the Evidence Landscape and decide whether the locator geometry should be shared with the main atlas component in a later cleanup.
- Suggested commit message: `ux(arena): refactor case file region context locator`

## 2026-06-17: Case File Region Context Refinement

- Agent/model: Codex (GPT-5)
- Prompt scope: Use `$impeccable` to refine the current `/case-file` implementation without redesigning the screen from scratch, with priority on Region Context usefulness and reducing card-heavy visual weight.
- Files changed: `components/arena/CaseFilePanel.tsx`, `app/investigation-workflow.css`, `app/page.test.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Refined the existing Case File intake by making the hero slightly tighter, softening repeated panel treatments, converting nested facts/readiness boxes into row rhythm, tightening evidence preview density, grouping readiness with the CTA, and rebuilding Region Context into an analytical comparison module.
- Decisions made: Kept the current Case File structure and content model; preserved the pre-blind hidden-claim state; added relative-distance labeling from existing nearest-neighbour distance data; kept the mini-map quiet and paired it with explicit selected/nearest/evidence/uncertainty facts instead of a heavy legend.
- Checks run: Added a red test for the Region Context comparison language, then `npm test` passed with 24 tests; `npm run lint` passed with the existing 134 `.agents/skills/impeccable` warnings and no app errors; `npm run build` passed; `node .agents/skills/impeccable/scripts/detect.mjs --json components/arena/CaseFilePanel.tsx app/investigation-workflow.css app/page.test.ts` returned `[]`; Playwright screenshots saved to `/private/tmp/telemetry-case-file-refined-desktop.png` and `/private/tmp/telemetry-case-file-refined-mobile.png`; Playwright CTA check confirmed `Start blind investigation` routes to `/blind-read`.
- Assumptions: The default IAM case should communicate routine-role-lifecycle proximity and ambiguity before revealing the AI label, without making the suspicious claim dominant.
- Risks/follow-ups: The stylesheet still contains older unused Case File selectors from prior iterations; a future cleanup-only pass can consolidate those once this refined direction is accepted.
- Next recommended step: Review the refined `/case-file` screenshots in the target demo viewport and then do a narrow CSS cleanup pass if the direction is approved.
- Suggested commit message: `ux(arena): refine case file region context`

## 2026-06-17: Case File Intake Redesign

- Agent/model: Codex (GPT-5)
- Prompt scope: Redesign only Screen 2, `/case-file`, as a calm pre-blind investigation intake screen without redesigning the Evidence Landscape.
- Files changed: `components/arena/CaseFilePanel.tsx`, `components/arena/AppShell.tsx`, `app/investigation-workflow.css`, `app/page.test.ts`, `data/sampleCases.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Rebuilt the Case File stage around a compact hero, evidence-gap status, case brief, signal metrics, observed feature stack, review questions, compact evidence packet preview, useful region-context evidence map, review-readiness rail, and normal-sized blind-investigation CTA.
- Decisions made: Removed the Case File-only duplicate external review cockpit so the stage can use its own right rail; kept the generated AI label hidden before blind read; derived preview rows and review questions from existing case data; appended `rollout metadata` to the synthetic IAM feature stack because that signal already exists in the case description and evidence.
- Checks run: `npm test` passed with 24 tests; `npm run lint` passed with existing `.agents/skills/impeccable` warnings and no app errors; `npm run build` passed; `node .agents/skills/impeccable/scripts/detect.mjs --json components/arena/CaseFilePanel.tsx app/investigation-workflow.css components/arena/AppShell.tsx` returned `[]`; Playwright screenshots saved to `/private/tmp/telemetry-case-file-desktop.png` and `/private/tmp/telemetry-case-file-mobile.png`; Playwright CTA check confirmed `Start blind investigation` routes to `/blind-read`.
- Assumptions: The default selected behavioural region remains the IAM provisioning case; the Case File screen should show possible overclaim/evidence-gap risk without making the hidden AI claim the dominant headline.
- Risks/follow-ups: `app/investigation-workflow.css` still contains prior Case File CSS layers that are now unused by the new markup; a later cleanup-only pass can consolidate old selectors after this direction is accepted.
- Next recommended step: Review `/case-file` in the demo browser at the target presentation viewport and then decide whether to remove the old unused Case File CSS selectors.
- Suggested commit message: `ux(arena): redesign case file intake`

## 2026-06-16: Case File Intake Composition Polish

- Agent/model: Codex (GPT-5)
- Prompt scope: Run `$impeccable polish` only on Screen 2, Case File, to make it read as a compact investigation intake document without redesigning Screens 1 or 3-8.
- Files changed: `components/arena/CaseFilePanel.tsx`, `components/arena/InvestigationCockpit.tsx`, `app/investigation-workflow.css`, and `docs/CHANGELOG_AI.md`.
- Summary: Reworked the Case File screen around a stronger case brief, specific evidence-gap copy, compact region context, integrated claim rows, balanced evidence packet preview cards, lower-weight support metrics, scan-friendly feature/risk sections, and a lighter Case File-specific review cockpit with the single primary `Start blind investigation` CTA.
- Decisions made: Kept the existing light dossier direction and synthetic fixture data; reduced the former map-first composition into a smaller useful region-context module; removed the competing main-content CTA in favor of the cockpit action; hid generic Case File bottom stage controls to avoid duplicate next actions; preserved later-stage cockpit behavior.
- Checks run: `node .agents/skills/impeccable/scripts/detect.mjs --json components/arena/CaseFilePanel.tsx components/arena/InvestigationCockpit.tsx app/investigation-workflow.css` returned `[]`; `npm test` passed with 23 tests; `npm run lint` passed with the existing 134 `.agents/skills/impeccable` warnings and no errors; `npm run build` passed; `git diff --check` passed; Brave headless screenshots were captured at `/private/tmp/tc-case-file-direct.png` and `/private/tmp/tc-case-file-mobile-direct.png`.
- Assumptions: The requested Screen 2 polish should prioritize the default IAM role provisioning case while keeping status/gap copy safe for the other synthetic cases if selected.
- Risks/follow-ups: The app still has substantial pre-existing dirty routing/screenshot changes and older global responsive cockpit overrides; this pass added scoped Case File overrides rather than consolidating the historical CSS layers.
- Next recommended step: Review `/private/tmp/tc-case-file-direct.png` in the target demo viewport, then separately consolidate old global cockpit/mobile CSS once the Case File direction is accepted.
- Suggested commit message: `ux(arena): polish case file intake`

## 2026-06-16: Stage URLs for Main Arena Views

- Agent/model: Codex (GPT-5)
- Prompt scope: Fix the local navigation/routing structure so the real eight main Telemetry Court arena views each have a stable URL path, keep the existing UI intact, make refresh and browser history work, and add a screenshot capture script for every main route.
- Files changed: `app/[[...stage]]/page.tsx`, `app/page.test.ts`, `components/arena/AppShell.tsx`, `components/arena/RoutedAppShell.tsx`, `lib/arenaReviewState.ts`, `lib/arenaRoutes.ts`, `scripts/screenshots.js`, `screenshots/01-landscape.png`, `screenshots/02-case-file.png`, `screenshots/03-blind-read.png`, `screenshots/04-ai-reveal.png`, `screenshots/05-evidence-board.png`, `screenshots/06-label-duel.png`, `screenshots/07-impostor.png`, `screenshots/08-verdict.png`, and `docs/CHANGELOG_AI.md`.
- Summary: Added a shared arena stage-to-path map, replaced the single root-only page with an optional catch-all App Router entry for the eight existing arena stages, synced the stage rail and stage actions to the current pathname, preserved the existing shell and panels, and kept a single standalone Playwright script that captures full-page screenshots for every routed stage under `./screenshots`.
- Decisions made: Used the existing `arenaStages` workflow as the source of truth for route discovery; kept route names aligned to the real stage IDs instead of inventing new product areas; used one optional catch-all route to keep refreshes working across stage URLs with a small diff; avoided touching the already-dirty `package.json` and `package-lock.json` by shipping the screenshot tool as a standalone script rather than a new npm script; removed the duplicate screenshot helper and standardized on `node scripts/screenshots.js` as the final command.
- Checks run: `npm test` passed with 23 tests; `npm run lint` passed with 134 pre-existing warnings in `.agents/skills/impeccable` and no errors; `npm run build` passed; browser verification against `http://localhost:3000` confirmed `/`, `/case-file`, `/blind-read`, `/ai-reveal`, `/evidence-board`, `/label-duel`, `/impostor`, and `/verdict` each loaded with the matching active stage; `node scripts/screenshots.js` generated eight screenshots in `./screenshots`.
- Assumptions: The task required stable URLs for the eight top-level arena workflow views, not per-case deep links, so case selection still defaults to the current in-memory case state instead of encoding case IDs in the route.
- Risks/follow-ups: Navigation between stage URLs preserves the visible stage and browser history, but case selection and review progress remain in client state rather than URL state. If you want shareable deep links for a specific case or in-progress review later, that should be a separate scoped pass.
- Next recommended step: Decide whether case identity should stay implicit or become a second route/query seam such as `?case=<id>` in a follow-up change.
- Suggested commit message: `feat(arena): add stable stage urls for main views`

## 2026-06-16: Investigation Workflow Light Dossier Polish

- Agent/model: Codex (GPT-5)
- Prompt scope: Run `$impeccable polish` to bring Screens 2-8, from Case File through Structured Verdict, into the same calm evidence-first product system as the redesigned Evidence Landscape screen without redesigning Screen 1.
- Files changed: `app/investigation-workflow.css`, `app/layout.tsx`, `components/arena/AppShell.tsx`, `components/arena/WorkflowPrimitives.tsx`, `components/arena/CaseFilePanel.tsx`, `components/arena/BlindReadPanel.tsx`, `components/arena/AiRevealPanel.tsx`, `components/arena/EvidenceBoard.tsx`, `components/arena/LabelDuelPanel.tsx`, `components/arena/ImpostorPanel.tsx`, `components/arena/VerdictPanel.tsx`, `components/arena/InvestigationCockpit.tsx`, `lib/arenaReviewState.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Added a light investigation-only stylesheet imported from the root layout, introduced shared workflow primitives for stage headings, section headers, metrics, and sealed-claim blocks, redesigned Screens 2-8 as a warm dossier workflow, lightened the stage rail and review cockpit, compacted investigation mini-maps, made evidence rating controls roomy, attached label-duel reasons to the selected judgment area, strengthened the impostor and verdict hierarchy, and kept Review JSON export available.
- Decisions made: Avoided modifying the already-dirty first-screen files and `app/globals.css`; used a new global investigation stylesheet rather than a component CSS module because Node static-render tests do not handle CSS imports from React components; preserved the existing reducer, fixture data, structured-choice handlers, and export schema; added a stage-change scroll reset so every screen opens at its title after lower-page CTAs.
- Checks run: `npm test` passed with 22 tests; `npm run lint` passed with 134 existing `.agents/skills/impeccable` warnings and no errors; `npm run build` passed; `node .agents/skills/impeccable/scripts/detect.mjs --json app/investigation-workflow.css app/layout.tsx components/arena/AppShell.tsx components/arena/WorkflowPrimitives.tsx components/arena/CaseFilePanel.tsx components/arena/BlindReadPanel.tsx components/arena/AiRevealPanel.tsx components/arena/EvidenceBoard.tsx components/arena/LabelDuelPanel.tsx components/arena/ImpostorPanel.tsx components/arena/VerdictPanel.tsx components/arena/InvestigationCockpit.tsx lib/arenaReviewState.ts` returned `[]`; production server on port 3036 returned `200 OK`; in-app Browser was unavailable, so headless Brave DevTools verified Screens 1-8 at 1440x900 with no horizontal overflow, top-of-stage scroll reset, structured interactions through verdict, and JSON drawer export containing `finalVerdict`.
- Assumptions: The investigation stages should now use the light dossier surface as the dominant mode, while Screen 1 remains governed by the existing Evidence Landscape implementation and dirty first-screen changes.
- Risks/follow-ups: Existing pre-work dirty files remain in `app/globals.css`, `components/arena/TelemetryGalaxy.tsx`, `components/arena/EvidenceGalaxyAtlas.tsx`, `components/arena/ClusterNode.tsx`, `components/arena/arenaMeta.ts`, `AGENTS.md`, and earlier changelog entries. A later CSS consolidation pass should reconcile the new investigation stylesheet with the accumulated global layers once the direction is accepted.
- Next recommended step: Review the final screenshots in the target demo viewport, especially `/private/tmp/tc-polish-final-ai-reveal-visible-cta.png`, `/private/tmp/tc-polish-final-05-evidence-board.png`, and `/private/tmp/tc-polish-final-08-verdict-selected.png`.
- Suggested commit message: `ux(arena): align investigation stages with evidence landscape`

## 2026-06-16: Evidence Landscape Presence Polish

- Agent/model: Codex (GPT-5)
- Prompt scope: Run `$impeccable polish the Telemetry Court evidence landscape screen`, restoring presence after the previous muted pass while keeping the first-screen map, inspector, header structure, typography direction, static data, and workflow scope intact.
- Files changed: `components/arena/TelemetryGalaxy.tsx`, `components/arena/EvidenceGalaxyAtlas.tsx`, `components/arena/arenaMeta.ts`, `app/globals.css`, and `docs/CHANGELOG_AI.md`.
- Summary: Restored subtle map color separation, strengthened selected-region contour/halo/label treatment, made `OVERCLAIM` and `THIN` read as operational status metadata instead of disabled UI, reduced the mobile legend footprint, restored a more premium utility-header presence, and balanced the selected-region inspector with a compact evidence packet summary built from existing synthetic case data.
- Decisions made: Added a reusable evidence-taxonomy class helper rather than one-off label styling; used restrained warm/rose/amber/graphite accents for review metadata; kept the legend readable but visually secondary; added no dependencies, no new screens, and no new sample data.
- Checks run: `git diff --check`; `npm test`; `npm run lint`; `npm run build`; `node .agents/skills/impeccable/scripts/detect.mjs --json components/arena/TelemetryGalaxy.tsx components/arena/EvidenceGalaxyAtlas.tsx components/arena/ClusterNode.tsx components/arena/arenaMeta.ts app/globals.css app/page.test.ts`; production server on port 3034; local Brave DevTools screenshots saved to `/private/tmp/tc-presence-desktop.png` and `/private/tmp/tc-presence-mobile-reduced.png`.
- Assumptions: The first screen should keep a serious research-tool posture, but selected verdict/evidence state can carry restrained semantic warmth so the map feels like the primary evidence instrument again.
- Risks/follow-ups: `app/globals.css` still contains accumulated historical atlas override layers and two older non-first-screen detector warnings at lines 827 and 1109. A cleanup-only CSS consolidation pass remains useful once the direction is accepted.
- Next recommended step: Review the final screenshots in the intended demo viewport, then consolidate the first-screen CSS layers without changing behavior.
- Suggested commit message: `ux(arena): restore evidence landscape presence`

## 2026-06-16: Evidence Landscape Implementation Audit

- Agent/model: Codex (GPT-5)
- Prompt scope: Run `$impeccable audit the Telemetry Court evidence landscape screen`, focusing on first-screen accessibility, keyboard navigation, reduced motion, responsive behavior, text overflow, contrast, performance, CSS hygiene, layout stability, and status-label consistency.
- Files changed: `components/arena/EvidenceGalaxyAtlas.tsx`, `components/arena/ClusterNode.tsx`, `app/globals.css`, and `docs/CHANGELOG_AI.md`.
- Summary: Fixed arrow-key focus handoff so focus follows the newly selected cluster, added a semantic group role for the atlas, restored readable legend/helper-text contrast without redesigning the screen, strengthened the compact stage-rail focus state, preserved uppercase review taxonomy labels, added overflow guards for selected-region copy, disabled remaining first-screen hover transitions in reduced-motion mode, and raised narrow-viewport header/stage controls to 44px touch targets.
- Decisions made: Kept the existing layout, typography, colors, motion direction, static data, and product scope. Left old non-first-screen width-transition warnings untouched because this audit was first-screen scoped.
- Checks run: `git diff --check` passed; `npm test` passed with 22 tests; `npm run lint` passed with 134 existing warnings in `.agents/skills/impeccable` scripts and no errors; `npm run build` passed; detector still reports the two existing non-first-screen `transition: width` warnings at `app/globals.css:827` and `app/globals.css:1109`; production server on port 3033 returned `200 OK`; in-app Browser was unavailable, so local Brave DevTools fallback verified desktop/mobile screenshots, no horizontal overflow, keyboard focus handoff, 44px mobile hit areas, and reduced-motion disabling selected animations.
- Assumptions: The atlas legend should remain visible and readable at rest; visual quietness is now carried by scale and placement rather than parent opacity on text.
- Risks/follow-ups: `app/globals.css` still contains accumulated historical atlas/header override layers and two older width transitions outside the first screen. A cleanup-only consolidation pass remains useful once this visual direction is locked.
- Next recommended step: Consolidate the accumulated first-screen CSS layers without changing behavior.
- Suggested commit message: `fix(arena): audit evidence landscape accessibility`

## 2026-06-16: Evidence Landscape Motion Pass

- Agent/model: Codex (GPT-5)
- Prompt scope: Run `$impeccable animate the Telemetry Court evidence landscape screen`, adding restrained, purposeful motion only to the first-screen Evidence landscape map and selected-region inspector.
- Files changed: `components/arena/EvidenceGalaxyAtlas.tsx`, `app/globals.css`, and `docs/CHANGELOG_AI.md`.
- Summary: Added a scoped motion layer for subtle first-screen entrance, staggered region contour reveal, one-shot selected-region contour/halo confirmation, selected-summary and inspector content settling, connector-line draw-in, quieter hover/active states, CTA feedback, and explicit reduced-motion overrides.
- Decisions made: Kept layout, typography, colors, static sample data, and product scope unchanged. Replaced older ambient loops in the first-screen cascade with state-based one-shot motion, and used a computed `--region-delay` style variable for reliable region staggering without animation dependencies.
- Checks run: `git diff --check` passed; `npm test` passed with 22 tests; `npm run lint` passed with the existing `.agents/skills/impeccable` warnings; `node .agents/skills/impeccable/scripts/detect.mjs --json components/arena/EvidenceGalaxyAtlas.tsx components/arena/ClusterNode.tsx app/globals.css app/page.test.ts` reported only the existing `transition: width` warnings in `app/globals.css`; `npm run build` passed; `next start --port 3032` served the production build; local HTTP check returned `200 OK`; in-app Browser was unavailable, so a local Brave DevTools screenshot check saved `/private/tmp/telemetry-motion-desktop.png` and `/private/tmp/telemetry-motion-reduced.png`; a CDP interaction check confirmed selecting PowerShell updates the inspector and that reduced-motion disables the selected halo/region animations.
- Assumptions: One-shot selection confirmation and crossfade/settle transitions are enough to clarify state without adding ongoing decorative motion.
- Risks/follow-ups: Headless Brave's direct `--screenshot` path hung twice, so visual verification used DevTools protocol screenshots instead. `app/globals.css` still contains older overridden atlas layers from prior passes; a later cleanup-only consolidation remains useful.
- Next recommended step: Review the motion in the intended demo browser, especially selection changes, before consolidating the accumulated CSS layers.
- Suggested commit message: `ux(arena): animate evidence landscape states`

## 2026-06-16: Evidence Landscape Workspace Polish

- Agent/model: Codex (GPT-5)
- Prompt scope: Run `$impeccable polish the Telemetry Court evidence landscape screen`, focusing only on the first-screen Evidence landscape map and selected-region inspector.
- Files changed: `components/arena/TelemetryGalaxy.tsx`, `components/arena/EvidenceGalaxyAtlas.tsx`, `app/globals.css`, and `docs/CHANGELOG_AI.md`.
- Summary: Tightened the product toolbar and view-title rhythm, brought the map/inspector workspace higher, reduced decorative atlas glow/chroma, made the map key smaller and quieter, recast status labels as rectangular review metadata, and replaced the heavy inspector rationale paragraph with a concise status-derived review note.
- Decisions made: Kept the map plus inspector structure, static synthetic data, `Review JSON` action, `Open case file` CTA, and review taxonomy unchanged. Used a final scoped CSS layer instead of consolidating older accumulated atlas overrides.
- Checks run: `git diff --check` passed; `npm test` passed with 22 tests; `npm run lint` passed with existing warnings in `.agents/skills/impeccable`; `npm run build` passed; `node .agents/skills/impeccable/scripts/detect.mjs --json components/arena/TelemetryGalaxy.tsx components/arena/EvidenceGalaxyAtlas.tsx app/globals.css app/page.test.ts` reported only the existing `transition: width` warnings in `app/globals.css`; `next start --port 3031` served the production build; local HTTP check returned `200 OK`; Brave headless desktop and narrow screenshots saved `/private/tmp/telemetry-landscape-polish-final2-desktop.png` and `/private/tmp/telemetry-landscape-polish-final2-narrow.png`.
- Assumptions: The first-screen header can visually suppress the optional product subtitle because the view title and single support sentence now carry the intended orientation.
- Risks/follow-ups: `app/globals.css` still contains older overridden atlas/header layers; a separate cleanup-only pass should consolidate them once this first-screen direction is accepted.
- Next recommended step: Review the final first-screen screenshots in the intended demo viewport, then do a CSS consolidation pass if the direction is locked.
- Suggested commit message: `ux(arena): polish evidence landscape workspace`

## 2026-06-15: First Screen Evidence Review Polish

- Agent/model: Codex (GPT-5)
- Prompt scope: Run `$impeccable polish first screen` to make the Telemetry Court landing state read as a serious evidence-review tool rather than an AI landing-page mockup.
- Files changed: `components/arena/AppShell.tsx`, `components/arena/TelemetryGalaxy.tsx`, `components/arena/EvidenceGalaxyAtlas.tsx`, `components/arena/arenaMeta.ts`, `app/globals.css`, `app/page.test.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Replaced the stacked tagline header with a quiet utility header, renamed the first stage to `Evidence landscape`, added one restrained instruction line, recast map and inspector statuses as review taxonomy metadata, and made the selected-region inspector separate review state, verdict, evidence strength, and uncertainty.
- Decisions made: Preserved the existing atlas geometry, synthetic case data, evidence workflow, and map-inspector layout. Added a small evidence-strength taxonomy helper rather than changing fixture values. Used scoped CSS overrides because the current stylesheet still contains accumulated atlas polish layers.
- Checks run: `node .agents/skills/impeccable/scripts/detect.mjs --json components/arena/AppShell.tsx components/arena/TelemetryGalaxy.tsx components/arena/EvidenceGalaxyAtlas.tsx components/arena/ClusterNode.tsx components/arena/arenaMeta.ts app/globals.css app/page.test.ts` reported only the existing `layout-transition` warnings in `app/globals.css`; `git diff --check` passed; `npm test` passed with 22 tests; `npm run lint` passed with existing warnings in `.agents/skills/impeccable`; `npm run build` passed; `next start --port 3030` served the production build; local HTTP check returned `200 OK`; Brave headless desktop and narrow verification screenshots saved `/private/tmp/telemetry-first-screen-polish-desktop.png` and `/private/tmp/telemetry-first-screen-polish-narrow.png`.
- Assumptions: First-screen status wording can use compact uppercase taxonomy labels because those labels are review metadata, not prose.
- Risks/follow-ups: Brave's bare 390px CLI screenshot path appears to crop a wider headless layout viewport, so the visual mobile check used the 500px narrow render plus the compiled CSS bundle evidence. `app/globals.css` still needs a separate consolidation pass to remove older overridden atlas/header layers.
- Next recommended step: Review the first screen in the target demo browser, then consolidate the repeated atlas CSS layers if the direction is accepted.
- Suggested commit message: `ux(arena): quiet first screen taxonomy`

## 2026-06-15: Evidence Galaxy Atlas Final Polish

- Agent/model: Codex (GPT-5)
- Prompt scope: Run `$impeccable polish components/arena/EvidenceGalaxyAtlas.tsx` as the final atlas polish pass after quieter, layout, node, and typeset refinements.
- Files changed: `components/arena/EvidenceGalaxyAtlas.tsx`, `app/globals.css`, and `docs/CHANGELOG_AI.md`.
- Summary: Added accessible atlas/key relationships, arrow-key shortcut metadata, polite selected-summary announcements, a stronger but restrained focus treatment, quieter atlas/key/summary surface shadows, and a tighter mobile atlas fit so the selected rail remains connected to the main map interaction.
- Decisions made: Kept the evidence encodings, region positions, node data, and workflow semantics intact. Used a final scoped CSS layer instead of consolidating older accumulated atlas overrides, preserving the current dirty-tree history.
- Checks run: `node .agents/skills/impeccable/scripts/detect.mjs --json components/arena/EvidenceGalaxyAtlas.tsx app/globals.css` reported only the existing `layout-transition` warnings in `app/globals.css`; `git diff --check` passed; `npm test` passed with 22 tests; `npm run lint` passed with existing warnings in `.agents/skills/impeccable`; `npm run build` passed; `next start --port 3029` served the production build; local HTTP check returned `200 OK`; Brave headless desktop and mobile screenshots saved `/private/tmp/evidence-atlas-final-polish.png` and `/private/tmp/evidence-atlas-final-polish-mobile.png`.
- Assumptions: The quality bar is flagship demo polish based on the current Impeccable sequence and the user's prior "Full Atlas polish" direction.
- Risks/follow-ups: `app/globals.css` still contains older overridden atlas blocks; a separate cleanup-only pass should consolidate those once the visual direction is accepted.
- Next recommended step: Review the final atlas in the intended demo viewport and then run a CSS consolidation pass if approved.
- Suggested commit message: `ux(galaxy): polish evidence atlas`

## 2026-06-15: Evidence Galaxy Atlas Typeset Pass

- Agent/model: Codex (GPT-5)
- Prompt scope: Run `$impeccable typeset components/arena/EvidenceGalaxyAtlas.tsx` to refine the atlas typography after the quieter, layout, and node polish passes.
- Files changed: `components/arena/EvidenceGalaxyAtlas.tsx`, `app/globals.css`, and `docs/CHANGELOG_AI.md`.
- Summary: Tightened the atlas legend note, added a scoped fixed-rem type layer for the atlas title, key, selected-region rail, node labels, status chips, and numeric metrics, and made the visible atlas typography rely on role consistency rather than tiny uppercase/tracked microcopy.
- Decisions made: Kept the existing Geist/system sans stack and added no font dependency. Preserved tested product vocabulary and evidence semantics while normalizing the visible type roles in a final override layer.
- Checks run: `node .agents/skills/impeccable/scripts/detect.mjs --json components/arena/EvidenceGalaxyAtlas.tsx app/globals.css` reported only the existing `layout-transition` warnings in `app/globals.css`; `git diff --check` passed; `npm test` passed with 22 tests; `npm run lint` passed with existing warnings in `.agents/skills/impeccable`; `npm run build` passed; `next start --port 3027` served the production build; local HTTP check returned `200 OK`; Brave headless desktop and mobile screenshots saved `/private/tmp/evidence-atlas-typeset.png` and `/private/tmp/evidence-atlas-typeset-mobile.png`.
- Assumptions: The atlas is product UI, so fixed rem sizing and a single familiar sans stack are more appropriate than fluid display typography or a decorative type pairing.
- Risks/follow-ups: Older overridden atlas typography rules remain earlier in `app/globals.css`; a cleanup-only consolidation is still separate from this scoped pass.
- Next recommended step: Run `$impeccable polish components/arena/EvidenceGalaxyAtlas.tsx` once the typeset hierarchy is reviewed in the browser.
- Suggested commit message: `ux(galaxy): typeset evidence atlas`

## 2026-06-15: Cluster Node Polish Pass

- Agent/model: Codex (GPT-5)
- Prompt scope: Run `$impeccable polish components/arena/ClusterNode.tsx` to refine the atlas node affordances after the quieter and layout passes.
- Files changed: `components/arena/ClusterNode.tsx`, `app/globals.css`, and `docs/CHANGELOG_AI.md`.
- Summary: Added a proper selected-region accessibility signal, shortened the selected node marker, refined node label/status wrapping, tightened selected/focus/active states, reduced card-like shadow treatment, and improved mobile node fit.
- Decisions made: Kept the node semantics and evidence encodings intact. Used a final scoped CSS layer rather than deleting older overridden atlas passes, preserving the current dirty-tree history.
- Checks run: `git diff --check` passed; `npm test` passed with 22 tests; `npm run lint` passed with existing warnings in `.agents/skills/impeccable`; `npm run build` passed; `next start --port 3025` served the production build; local HTTP check returned `200 OK`; Brave headless desktop and mobile screenshots saved `/private/tmp/cluster-node-polish.png` and `/private/tmp/cluster-node-polish-mobile.png`.
- Assumptions: The selected-region rail now carries the detailed selected context, so the node itself should stay compact and only signal identity, status, and current selection.
- Risks/follow-ups: Older overridden node styles still exist earlier in `app/globals.css`; a cleanup-only CSS consolidation remains separate.
- Next recommended step: Run `$impeccable polish components/arena/EvidenceGalaxyAtlas.tsx` for a final whole-atlas pass.
- Suggested commit message: `ux(galaxy): polish cluster node states`

## 2026-06-15: Evidence Galaxy Atlas Layout Pass

- Agent/model: Codex (GPT-5)
- Prompt scope: Run `$impeccable layout components/arena/EvidenceGalaxyAtlas.tsx` to improve spacing, rhythm, and hierarchy after the quieter visual pass.
- Files changed: `components/arena/EvidenceGalaxyAtlas.tsx`, `app/globals.css`, and `docs/CHANGELOG_AI.md`.
- Summary: Reworked the selected evidence snapshot from a node-following floating card into a stable bottom selection rail, added a clear map key header, removed summary-position CSS variables and helper code, and reserved atlas layout zones for key, map field, and selected context across desktop and mobile.
- Decisions made: Kept the right-side case dossier as the deeper inspection surface while preserving a compact selected-region rail inside the atlas for orientation. Added no dependencies and changed no fixture data or workflow state.
- Checks run: `git diff --check` passed; `npm test` passed with 22 tests; `npm run lint` passed with existing warnings in `.agents/skills/impeccable`; `npm run build` passed; `next start --port 3025` served the production build; local HTTP check returned `200 OK`; Brave headless desktop and mobile screenshots saved `/private/tmp/evidence-atlas-layout.png` and `/private/tmp/evidence-atlas-layout-mobile.png`.
- Assumptions: The atlas should prioritize the spatial evidence field, with selected metrics available but not competing with the map or right dossier.
- Risks/follow-ups: The CSS still contains older overridden atlas passes; a cleanup-only consolidation remains separate from this layout task.
- Next recommended step: Run `$impeccable polish components/arena/EvidenceGalaxyAtlas.tsx` after reviewing the new hierarchy.
- Suggested commit message: `ux(galaxy): improve atlas layout hierarchy`

## 2026-06-15: Quieter Evidence Galaxy Atlas

- Agent/model: Codex (GPT-5)
- Prompt scope: Run `$impeccable quieter components/arena/EvidenceGalaxyAtlas.tsx` after the atlas critique, focusing on a calmer premium cyber-analytics tone and full atlas polish without changing the workflow.
- Files changed: `app/globals.css` and `docs/CHANGELOG_AI.md`.
- Summary: Added a scoped final atlas quieting pass that reduces decorative galaxy motion, hides excess background/orbit layers, lowers glow and chroma, softens region fields and semantic links, refines node/selection states, and makes the map key plus selected evidence summary read more like restrained product UI.
- Decisions made: Kept the implementation CSS-only to avoid changing evidence data, interactions, or component contracts. Preserved the dark premium atlas direction while removing the more generic space/HUD intensity.
- Checks run: `git diff --check` passed; `npm test` passed with 22 tests; `npm run lint` passed with existing warnings in `.agents/skills/impeccable`; `npm run build` passed; `next start --port 3025` served the production build; local HTTP check returned `200 OK`; Brave headless screenshot verification saved `/private/tmp/evidence-atlas-quiet.png`.
- Assumptions: Existing atlas DOM hooks remain useful for later art-direction passes even when some decorative layers are visually hidden. Older overridden atlas CSS remains in place for a future cleanup-only task.
- Risks/follow-ups: The selected evidence summary is still a floating element inside the map; a later layout pass should decide whether it belongs in the right-side dossier instead.
- Next recommended step: Run the planned atlas layout/polish pass if the quieter direction is approved.
- Suggested commit message: `ux(galaxy): quiet evidence atlas visuals`

## 2026-06-15: Impeccable Project Context Initialization

- Agent/model: Codex (GPT-5)
- Prompt scope: Run `$impeccable init` for Telemetry Court so future design work has explicit product, visual-system, and live-mode context.
- Files changed: `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`, `.impeccable/live/config.json`, and `docs/CHANGELOG_AI.md`.
- Summary: Added a root `PRODUCT.md` derived from the current Evidence Arena source-of-truth docs, generated a Stitch-format `DESIGN.md` from existing tokens/components, added the Impeccable design sidecar, and configured live mode for the Next.js App Router entry at `app/layout.tsx`.
- Decisions made: Treated the repo as a product/tool register. Preserved the existing Telemetry Court design language instead of seeding a new palette. Marked live CSP as checked because `detect-csp.mjs` returned no CSP.
- Checks run: `node -e` JSON parse check for `.impeccable/design.json` and `.impeccable/live/config.json` passed; `node .agents/skills/impeccable/scripts/context.mjs` now loads `PRODUCT.md` and `DESIGN.md`; `npm test` passed with 22 tests; `npm run lint` passed with warnings in `.agents/skills/impeccable` scripts; `npm run build` passed; `git diff --check` passed.
- Assumptions: Existing docs fully answered the init interview requirements for register, users, purpose, brand personality, anti-references, and accessibility. Existing dirty UI files were not reverted or normalized.
- Risks/follow-ups: The current CSS contains historical visual overrides and at least one side-accent treatment that future polish could consolidate; this init only documents the active system.
- Next recommended step: Run `$impeccable critique /` or `$impeccable polish components/arena/EvidenceGalaxyAtlas.tsx` after reviewing the current surface.
- Suggested commit message: `docs(design): initialize impeccable project context`

## 2026-06-15: Semantic Evidence Encoding Pass

- Agent/model: Codex (GPT-5)
- Prompt scope: Refine the existing galactic atlas into a clearer semantic evidence atlas, preserving the current architecture and product workflow while making visual encodings more evidence-driven.
- Files changed: `components/arena/EvidenceGalaxyAtlas.tsx`, `components/arena/ClusterNode.tsx`, `app/globals.css`, and `docs/CHANGELOG_AI.md`.
- Summary: Remapped region field size to session count, particle density to representative sessions, inner node brightness to evidence support, ring behavior to uncertainty/status, and path styling to derived semantic relationship type. Added a compact selected evidence snapshot inside the atlas and restored a more readable map key with tiny encoding samples and contextual evidence microcopy.
- Decisions made: Added no dependencies and did not change the fixture/data model. Semantic relationship types are derived locally from existing status, evidence-strength, uncertainty, and distance fields.
- Checks run: `npx tsc --noEmit` passed; `npm run lint` passed; `npm test` passed with 22 tests; `npm run build` passed; `git diff --check` passed. Browser verification against `next start --port 3013` covered desktop 1280x720 and mobile 390x844 layout metrics, cluster click selection, keyboard arrow selection, Open case file handoff, no horizontal overflow, all five regions inside the atlas, selected evidence summary updates, and no browser console warnings/errors.
- Assumptions: In-app browser screenshot capture timed out even for a small clip, so browser verification used DOM/layout metrics and real interactions instead of saved screenshot artifacts. Remaining visual styling avoids additional effects and trims blur/drop-shadow work in the semantic layer.
- Risks/follow-ups: `app/globals.css` still contains earlier overridden atlas sections from prior passes; a separate cleanup-only pass could collapse those once the design direction is approved.
- Next recommended step: Review the semantic encodings on the intended demo display and decide whether relationship typing should later come from explicit fixture data instead of local derivation.
- Suggested commit message: `ux(galaxy): clarify semantic evidence encodings`

## 2026-06-15: Semantic Galaxy Atlas Art Direction Refinement

- Agent/model: Codex (GPT-5)
- Prompt scope: Refine the existing Semantic evidence galaxy atlas so the viewport feels more like a premium spatial evidence map and less like a dark dashboard, without changing the product workflow or right-side case panel behavior.
- Files changed: `components/arena/EvidenceGalaxyAtlas.tsx`, `components/arena/ClusterNode.tsx`, `app/globals.css`, and `docs/CHANGELOG_AI.md`.
- Summary: Added layered galaxy depth hooks, a central semantic density field, a softer observation-window rim, quieter atmospheric adjacency paths, explicit selected-neighbour state, more organic region clouds, refined floating glass labels, smaller translucent legend styling, and a stronger selected evidence-lens treatment.
- Decisions made: Added no dependencies and kept the implementation in CSS/SVG/React. The existing case fixture fields remain the source for selection, status tint, evidence support, uncertainty, session density, and selected-panel accent color.
- Checks run: `npx tsc --noEmit` passed; `npm run lint` passed; `npm test` passed with 22 tests; `npm run build` passed; `git diff --check` passed. Browser verification against `next start --port 3012` covered 1280x720 and 390x844 screenshots, cluster click selection, keyboard arrow selection, Open case file handoff, no horizontal overflow, all five regions inside the atlas at mobile width, and no browser console warnings/errors.
- Assumptions: Broad blur/blend layers were trimmed after an initial browser screenshot timeout; final browser screenshot capture and interaction checks succeeded on the fresh production build.
- Risks/follow-ups: `app/globals.css` still contains older overridden atlas rules from prior passes; this pass deliberately appends scoped refinements to avoid disturbing unrelated dirty-tree work.
- Next recommended step: Review the refined atlas on the intended demo display and, if approved, do a separate cleanup-only CSS pass to collapse superseded galaxy rules.
- Suggested commit message: `ux(galaxy): refine atlas art direction`

## 2026-06-15: Semantic Evidence Galaxy Atlas

- Agent/model: Codex (GPT-5)
- Prompt scope: Redesign only the main Semantic evidence atlas / telemetry landscape visualization into a premium, calm, galactic evidence map while preserving the evidence-first case flow.
- Files changed: `components/arena/EvidenceGalaxyAtlas.tsx`, `components/arena/TelemetryGalaxy.tsx`, `components/arena/ClusterNode.tsx`, `app/globals.css`, and `docs/CHANGELOG_AI.md`.
- Summary: Split the atlas viewport into a dedicated `EvidenceGalaxyAtlas` component, added a deep-space atlas surface with nebula gradients, subtle starfields, orbital rings, semantic adjacency lines, glass legend, and data-driven glowing region bubbles. Updated cluster buttons with richer session particles, selected-state halo/status reveal, and clearer accessible labels while keeping the selected-region dossier and case-opening flow intact.
- Decisions made: Added no dependencies and no data-model changes. Existing fixture fields remain the source for region position, status tint, evidence support, uncertainty pressure, model agreement, session count, selected claim copy, and review metrics. The rest of the app remains light and unchanged.
- Checks run: `npx tsc --noEmit` passed; `npm run lint` passed; `npm test` passed with 22 tests; `npm run build` passed. Browser verification against `next start --port 3010` passed at 1280x720 and 390x844 with no horizontal overflow, all five regions visible/selectable, click selection updating the panel, arrow-key selection, Open case file handoff, and no production-tab console warnings/errors.
- Assumptions: The current synthetic fixture fields are sufficient for a maintainable CSS/SVG/React MVP; the galaxy palette is scoped to the atlas so global status semantics do not drift.
- Risks/follow-ups: A pre-existing dev server on port 3000 served stale CSS during verification, so final browser verification used the freshly built production server on port 3010. A future cleanup pass could remove older overridden galaxy CSS blocks from `app/globals.css`.
- Next recommended step: Review the atlas on the intended demo display and keep any additional workflow-stage polish as a separate scoped task.
- Suggested commit message: `ux(galaxy): redesign atlas as galactic evidence map`

## 2026-06-14: Landscape Premium Atlas Refinement

- Agent/model: Codex (GPT-5)
- Prompt scope: Refine only the Landscape / Telemetry Galaxy screen to keep the light readable redesign while making it more premium, spatial, scientific, and workshop-demo polished.
- Files changed: `components/arena/ClusterNode.tsx`, `app/globals.css`, and `docs/CHANGELOG_AI.md`.
- Summary: Upgraded the atlas canvas from a flat framed map to a lighter scientific surface with subtle grid, contour, and focus gradients. Reworked behavioural regions with density points, softer fields, contour pressure, anchored labels, and selected/focused status reveal. Quieted the stage rail and map key, removed the heavy grey rim, and made the selected-region inspector feel more like an integrated evidence dossier with a shared tint connector.
- Decisions made: Added no dependencies, data fields, or workflow changes. The selected-region copy, metrics, AI-claim-under-test framing, region selection state, keyboard navigation, and Open case file flow remain intact.
- Checks run: `npm test` passed with 22 tests; `npm run lint` passed; `git diff --check` passed; `npm run build` passed. Browser verification covered 1280x720, 1152x720, and 2560x1440 viewports, screenshot review, real coordinate clicks for all five regions, arrow-key selection, and the Open case file CTA flow.
- Assumptions: Browser viewport sizes were used as practical equivalents for 100%, 125%, and 50% zoom checks because the in-app browser exposes viewport control rather than native browser zoom.
- Risks/follow-ups: `app/globals.css` still contains older overridden Landscape rules from earlier visual passes. This refinement adds explicit final overrides where needed instead of deleting prior dirty-tree work.
- Next recommended step: Review on the intended demo display and, if approved, follow with a separate CSS cleanup pass to remove dead overridden Landscape styles.
- Suggested commit message: `ux(galaxy): refine landscape into premium semantic atlas`

## 2026-06-14: Landscape Semantic Evidence Atlas Redesign

- Agent/model: Codex (GPT-5)
- Prompt scope: Redesign only the Landscape / Telemetry Galaxy screen for readability, product polish, interaction reliability, selected-region clarity, and controlled motion.
- Files changed: `components/arena/TelemetryGalaxy.tsx`, `components/arena/ClusterNode.tsx`, `app/globals.css`, `app/page.test.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Rebuilt the Landscape composition as a light, premium semantic evidence atlas with a dedicated selected-region module, readable AI-claim-under-test copy, why-investigate rationale from fixture data, three clear signal metrics, a compact useful map key, clearer selected-region states, and a calmer map with no particle field or terrain wallpaper.
- Decisions made: Added no dependencies, no data fields, and no changes to downstream workflow stages. Existing fixture values remain the source for session count, evidence support, uncertainty, status tint, region size, and claim rationale. The five sample regions now use explicit atlas display positions to keep semantic proximity while preventing hitbox overlap.
- Checks run: `npm test` passed with 22 tests; `npm run lint` passed; `git diff --check` passed; `npm run build` passed. Browser verification checked 1280x720, 1152x720, and 2560x1440 viewports, real coordinate clicks for all five regions, arrow-key selection, and the Open case file CTA flow.
- Assumptions: The selected-region module may reveal the AI label as a claim under test on the Landscape screen because this task explicitly requires that preview copy.
- Risks/follow-ups: The file still contains older overridden Landscape CSS from earlier passes; this pass adds the canonical final override block instead of deleting user/previous-agent work in the dirty tree.
- Next recommended step: Review the visual result at the requested zoom levels, then keep later-stage polish as separate scoped work.
- Suggested commit message: `ux(galaxy): redesign landscape as readable evidence atlas`

## 2026-06-14: Landscape Visual & Interaction Quality Upgrade

- Agent/model: Claude (Gemini Antigravity)
- Prompt scope: Major design-engineering upgrade of the Landscape / Telemetry Galaxy screen. Fix interaction bugs (region selection blocking), reduce visual noise, consolidate CSS, upgrade motion system, simplify component structure.
- Files changed: `components/arena/TelemetryGalaxy.tsx`, `components/arena/ClusterNode.tsx`, `app/globals.css`, `app/page.test.ts`, `docs/CHANGELOG_AI.md`.
- Summary:
  - **Interaction fix**: Command rail and overlays now use `pointer-events: none` with `pointer-events: auto` only on interactive children, fixing the critical bug where selecting a region blocked access to other regions.
  - **Visual noise removal**: Removed 12 categories of clutter — floating annotations (4 callouts), focus label, count pill, subtitle, signal ring, metric bars, second contour ring. Legend is now minimal and hover-revealable (opacity 0.36 → 1 on hover).
  - **CSS consolidation**: Replaced ~1100 lines of cascade-override CSS (4+ passes at different points in globals.css) with one clean canonical section. Net file size similar but zero duplication.
  - **Command rail → strip**: Multi-row grid command rail replaced with slim horizontal flex strip. Pointer-events passthrough ensures map clicks work through the strip.
  - **Motion system**: New entrance animations (`galaxyMapEnter`, `nodeEnter` with stagger, `commandStripEnter`), upgraded camera transition (900ms cinematic cubic-bezier), improved terrain entrance, gentler ambient drift.
  - **Node simplification**: Cluster nodes reduced to dot + title in galaxy view. Signal ring, metric bars, and detail row removed. Nodes now read as scientific map points.
  - **Particle/connection reduction**: Particles reduced ~60% (max 14 per cluster). Connections reduced to max 4.
  - **Typography**: Title weight 700, tracking -0.02em. Eyebrow smaller/more spaced. Node titles consistent monospace.
- Decisions made: No new dependencies. No changes to other stages. No data model changes. Legend encodings simplified (4 entries instead of 5, shorter labels).
- Checks run: `npm run build` ✓, `npm run lint` ✓, `npm test` 22/22 pass ✓.
- Assumptions: Removed text (subtitle, annotations, investigation thesis) contained information already available in the command strip or was redundant. The investigation thesis was the primary loss — it showed a rationale sentence that is not available elsewhere in the landscape view.
- Risks/follow-ups: The earlier CSS sections (lines 428-3500) still contain some galaxy-related base styles that are overridden by the new section. These are dead weight but harmless. A future cleanup pass could remove them.
- Next recommended step: Manual visual testing at 50%, 100%, 125% zoom. Verify all 5 regions are selectable. Verify case-opening flow works.
- Suggested commit message: `feat(landscape): upgrade visual quality, fix interaction blocking, consolidate galaxy CSS`

## 2026-06-14: Cinematic Evidence Atlas Rebuild

- Agent/model: Codex (GPT-5.5)
- Prompt scope: Rebuild only the Landscape / Telemetry Galaxy first screen using the supplied cinematic motion references as design-language inspiration while preserving Telemetry Court's evidence-first scientific workflow.
- Files changed: `components/arena/TelemetryGalaxy.tsx`, `components/arena/ClusterNode.tsx`, `components/arena/AppShell.tsx`, `app/globals.css`, `app/page.test.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Reframed the Landscape as a cinematic semantic evidence atlas with a dominant selected-region terrain body, camera-style focus variables, subtle pointer parallax, session-particle density, contour/ring pressure, precise annotations, a compact map key, and a selected-region command rail that frames the AI label as a claim under test.
- Decisions made: Added no dependencies and no new telemetry fields. Visual encodings still map to existing fixture data: semantic proximity, region weight, evidence support, uncertainty pressure, status tint, nearest-neighbour adjacency, and selected AI claim. The rest of the investigation workflow was not redesigned.
- Checks run: `npm test` passed with 22 tests; `npm run lint` passed; `git diff --check` passed; `npm run build` passed. Safari/Computer Use visual checks covered default desktop zoom, enlarged zoom, reduced/50-ish zoom, tablet-width bottom-sheet behavior, and mobile-width bottom-sheet behavior. The `Open case file` CTA was clicked and confirmed to enter the Case File stage with `Start blind investigation` available.
- Assumptions: The supplied videos were treated as composition/motion references only, not literal subject references. Existing fixture fields remain the source for all atlas encodings and copy.
- Risks/follow-ups: The in-app Browser bridge became unavailable during verification, so the final visual pass used Safari/Computer Use against the existing local dev server at `localhost:3000`. A final human taste pass on the intended demo display is still useful.
- Next recommended step: Review the atlas in the intended demo environment and keep any later workflow-stage polish as separate scoped tasks.
- Suggested commit message: `ux(galaxy): rebuild landscape as cinematic evidence atlas`

## 2026-06-14: Semantic Atlas Landscape Refinement

- Agent/model: Codex (GPT-5)
- Prompt scope: Improve only the Landscape / Telemetry Galaxy screen so the first impression reads as a premium semantic investigation atlas rather than a dashboard with a decorative chart.
- Files changed: `components/arena/TelemetryGalaxy.tsx`, `components/arena/ClusterNode.tsx`, `components/arena/AppShell.tsx`, `app/globals.css`, `app/page.test.ts`, and `docs/CHANGELOG_AI.md`.
- Summary: Moved the Landscape out of the three-column cockpit layout, kept the Galaxy as the hero, added an integrated selected-region inspector with AI-claim-under-test copy, added a scientific map legend and axis annotations, quieted the stage rail into a flow marker, projected existing map coordinates into a display field so all regions remain visible around the inspector, and kept later investigation stages unchanged.
- Decisions made: Added no dependencies and no new telemetry fields. The visual map still uses existing fixture fields for status, uncertainty, evidence strength, model agreement, session count, nearest neighbour, features, and evidence items. The AI label is presented as a claim to investigate, not as an accepted truth.
- Checks run: `npm test` passed with 22 tests; `npm run lint` passed; `git diff --check` passed; `npm run build` passed. Browser verification passed against `next start --port 3010` at 1440x900, 1280x720, 1024x576, 2560x1440, 768x1024, and 390x844 with no horizontal overflow, all five regions visible, the map immediately visible, readable inspector placement, no console warnings/errors, and a working `Open case file` click-through.
- Assumptions: Viewport dimensions were used as practical browser-zoom equivalents for 125% and 50% checks because this browser surface controls viewport size rather than native browser zoom.
- Risks/follow-ups: The Landscape now intentionally reveals the AI claim as a claim under test before opening the case file, matching this task's preview requirement. If strict blind-label concealment is later required on the entry screen, that product decision should be revisited explicitly.
- Next recommended step: Review the first screenshot in the intended demo environment, then continue with a separate scoped pass for the Case File stage if desired.
- Suggested commit message: `ux(galaxy): refine landscape as semantic atlas`

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
