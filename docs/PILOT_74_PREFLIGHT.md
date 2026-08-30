# Pilot Preflight (Originally Issue #74)

## Status And Execution Gate

This checklist prepares the human-run pilot described in
[`VALIDATION_PILOT_PROTOCOL.md`](./VALIDATION_PILOT_PROTOCOL.md). GitHub issue
#74 was later closed as not planned/superseded after one expert walkthrough and
one synthetic ReviewResult produced product feedback. Its multiple-reviewer,
realistic-package acceptance criteria were not completed. Issue closure and
that synthetic exercise are not research-study completion evidence.

Do not begin review until a human study owner has approved the final package
manifest and reviewer roster. Do not claim pilot completion until multiple
independent reviewers have reviewed the same approved packages and their actual
`ReviewResultV01` artifacts have been collected.

## Pilot Scope

- [ ] Select 3-5 valid, approved, realistic `CasePackageV01` files.
- [ ] Assign 2-3 independent reviewers to every selected package.
- [ ] Require every reviewer to review the same frozen package bytes without
  discussion or shared judgments.
- [ ] Expect 6-15 `ReviewResultV01` artifacts: one per reviewer per package.
- [ ] Treat this as a workflow and package-quality pilot. Do not make broad,
  statistically generalizable, model-superiority, or operational-quality
  claims from this sample.

## Package Readiness

### Current repository inventory

The repository tracks package-shaped TypeScript fixtures with these identities:

| Package ID | Case ID | Intended use |
| --- | --- | --- |
| `pkg-synthetic-arena-001` | `case-arena-001` | Synthetic demo/dry run only |
| `pkg-synthetic-arena-002` | `case-arena-002` | Synthetic demo/dry run only |
| `pkg-synthetic-arena-003` | `case-arena-003` | Synthetic demo/dry run only |
| `pkg-synthetic-arena-004` | `case-arena-004` | Synthetic demo/dry run only |
| `pkg-synthetic-arena-005` | `case-arena-005` | Synthetic demo/dry run only |
| `pkg-synthetic-toponymy-style-access-review-001` | `case-synthetic-toponymy-style-access-review-001` | Synthetic, non-authoritative adapter-boundary dry run only |
| `pkg-synthetic-acme4-style-access-review-001` | `case-synthetic-acme4-style-access-review-001` | Synthetic, sanitized, non-authoritative adapter-boundary dry run only |

These fixtures validate repository behavior, but they are explicitly synthetic
and are not an approved realistic pilot set. Generated, untracked, private, or
locally copied files are never approved study inputs merely because they exist
in the workspace. **Study execution is blocked on human approval of 3-5
realistic/sanitized package files unless the study owner explicitly records a
synthetic-only rehearsal as the intended exercise. A rehearsal is not the
research pilot.**

### Pre-review package gate

- [ ] Record the final `package_id`, `package_revision`, `case_id`, `cluster_id`,
  filename, and SHA-256 digest in a package manifest.
- [ ] Confirm `schema_version` is `case_package.v0.1` and the review protocol is
  compatible with `telemetry_court_review.v0.1`.
- [ ] Confirm each reviewer-facing CasePackage is no larger than the 2 MiB
  browser/Hot-Folder import limit. Keep packages minimal rather than raising the
  bound for a pilot.
- [ ] Start the local app with `npm run dev`, import each exact JSON file through
  the CasePackage import control, and require a successful import with the
  expected package and case identity. Failed import or any validation
  diagnostic blocks the package.
- [ ] Run `npm run validate-package -- path/to/package.json` on each exact
  frozen file. The CLI validates and inspects the package locally; it does not
  resolve safe references or inspect raw upstream data.
- [ ] For tracked code fixtures used in a rehearsal, run
  `npm test -- data/casePackageFixtures.test.ts data/syntheticToponymyStyleCasePackageFixture.test.ts data/syntheticAcme4StyleCasePackageFixture.test.ts`.
- [ ] Apply the full CasePackage acceptance checklist in
  [`VALIDATION_PILOT_PROTOCOL.md`](./VALIDATION_PILOT_PROTOCOL.md), including
  stable IDs, valid claim/evidence links, reviewable evidence, and required
  provenance.
- [ ] Have the data owner confirm sanitization metadata is accurate, no raw or
  restricted payload is embedded, and every safe reference is authorized for
  the reviewer environment.
- [ ] Freeze the approved files. Do not change evidence during review. A
  correction requires a new package revision, a new manifest digest, and a
  documented decision to restart or quarantine affected reviews.

## Reviewer Instructions

- [ ] Onboard reviewers with [`REVIEWER_RUBRIC.md`](./REVIEWER_RUBRIC.md) and
  use only its repository-defined ratings, verdicts, and reason codes.
- [ ] Assign non-sensitive `reviewer_id` and `review_session_id` values before
  review; do not reuse one reviewer identity for different people.
- [ ] Record each reviewer's domain familiarity and any prior exposure to each
  case in the study notes, not as a performance score.
- [ ] Record one study-wide mocked-assistance condition: disabled/unused for all
  reviewers, or available to all reviewers only after human evidence ratings.
  Do not mix conditions silently; ReviewResult does not record assistance use.
- [ ] Complete and record the blind interpretation before AI-label reveal.
- [ ] Stay within package evidence and preserve uncertainty or missing context
  rather than filling gaps with outside assumptions.
- [ ] Do not discuss a case, reveal judgments, or inspect another reviewer's
  exports until all assigned reviews have been exported.
- [ ] Export exactly one `ReviewResultV01` per reviewer per CasePackage.
- [ ] Do not substitute `quick_disposition.v0.1` for a full ReviewResult. A
  quick disposition may be retained as separate operational context, but the
  reviewer/package matrix cell remains incomplete or explicitly excluded.
- [ ] If a reviewer recognizes a case, label, dataset, or upstream output,
  finish only if the protocol owner permits it and record the exposure as a
  limitation.

## ReviewResult Collection

Rename each single-result export after download without editing its JSON:

```text
issue-74__<package-id>__<reviewer-id>__<session-id>__review-result-v0.1.json
```

Use filesystem-safe, non-sensitive identifiers. Keep an artifact manifest with
the filename and SHA-256 digest. A coordinator should collect exports only
after the applicable independent reviews are complete.

For every artifact, confirm:

- [ ] `schema_version` is `review_result.v0.1`.
- [ ] `review_id` is present and unique. This is the v0.1 contract's
  ReviewResult identifier; the current export shape does not contain a field
  literally named `review_result_id`.
- [ ] `case_package.schema_version`, `package_id`, `package_revision`,
  `case_id`, `cluster_id`, and compact pipeline reference match the frozen
  package manifest.
- [ ] `reviewer.reviewer_id` and `reviewer.review_session_id` match the roster.
- [ ] `protocol.protocol_version` is `telemetry_court_review.v0.1`, blind review
  was enabled, and AI reveal is recorded as complete.
- [ ] `created_at` is present and is a valid exported timestamp.
- [ ] Blind interpretation, label comparison, evidence ratings, outlier or
  impostor choice, failure modes, final verdict, and recommended action are
  present and use valid v0.1 values.
- [ ] Every expected package evidence ID has one rating; there are no missing,
  duplicate, or foreign evidence IDs.
- [ ] The reviewer-package matrix has exactly one complete artifact in every
  expected cell. Missing, duplicate, malformed, quarantined, or incompatible
  artifacts are resolved or explicitly excluded before aggregation.
- [ ] Import the collected artifacts through the strict ReviewResult bundle
  import path in a clean coordinator profile. Any rejected import blocks that
  artifact from aggregation; do not hand-edit it into compatibility.
- [ ] Run
  `npm run validate-review-results -- path/to/review-result-or-bundle.json`
  on collected files before aggregation and retain the validation outcome.
- [ ] Keep each browser-imported ReviewResult bundle or quick-disposition JSON
  file within the 8 MiB local artifact limit; split collection bundles along
  exact compatible package boundaries when needed.

## Operational Notes

Keep one note block per reviewer and package using the study-notes template in
the protocol. Record observed facts separately from later interpretation:

- [ ] confusion about claims, evidence, ratings, labels, or verdict choices;
- [ ] workflow, import, export, bundle, or results-page friction;
- [ ] missing context, missing baseline, or insufficient evidence;
- [ ] suspected broken IDs, links, provenance, sanitization, or other package
  defects;
- [ ] recognized cases, labels, datasets, or upstream outputs;
- [ ] interruptions, protocol deviations, developer assistance, quarantines,
  exclusions, and other limitations.

Do not repair a package silently or rewrite an uncertain/incomplete reviewer
judgment after export.

## Aggregation Readiness

- [ ] Aggregate only complete, validated `ReviewResultV01` artifacts with the
  same exact CasePackage reference and compatible protocol version.
- [ ] Produce a separate report group for each CasePackage. Do not combine
  different packages, revisions, pipeline references, or incompatible
  protocols.
- [ ] Verify reviewer count and `source_review_ids` against the artifact
  manifest before interpreting distributions or disagreement.
- [ ] Treat `EvaluationReportV01` as the study artifact that summarizes
  compatible reviewer judgments, not as consensus, adjudication, a reviewer
  ranking, or a cross-package benchmark.
- [ ] Keep cross-package observations in clearly labeled manual study notes
  until a report-set contract exists.
- [ ] Export and validate one `cluster_refinement.v0.1` artifact per compatible
  report group. Verify its package reference, source review IDs, reviewer
  count, uncertainty, and disagreement against the report. For the strict
  consumer check, place the downloaded artifact in the configured Hot-Folder
  and, following the
  [Python companion instructions](./HOT_FOLDER_PYTHON_CLIENT.md#read-refinement-exports),
  load it with
  `TelemetryCourtHotFolder.from_env().read_refinement("<filename>.json")`;
  a valid no-action artifact is accepted and must be recorded without mutating
  the upstream working set.
- [ ] Assign an authorized upstream owner to record an
  apply/reject/defer/no-action decision for every refinement artifact and each
  prune/split/merge recommendation. Telemetry Court must not apply the recipe
  automatically.

## Human Approval Checkpoints

Record approver, date, decision, and limitations for each checkpoint:

- [ ] final set of 3-5 package files and the frozen manifest;
- [ ] final list of 2-3 reviewers and independence/assignment plan;
- [ ] any use of real, realistic, proprietary, restricted, or sensitive data
  and any safe drill-down references;
- [ ] any publication, presentation, screenshot, or external sharing of pilot
  artifacts or results;
- [ ] any claim beyond the observed behavior of this small pilot.

## Explicit Non-Goals

- No raw telemetry ingestion.
- No backend, auth, database, accounts, or server persistence.
- No SIEM, SOC, alert-triage, incident-response, or remediation workflow.
- No reviewer ranking, quality score, or employment assessment.
- No changing package evidence or identity mid-review.
- No broad validation, statistical significance, or generalizable performance
  claim from this tiny sample.

## Study Completion Evidence

This preflight document and the closed issue are not completion evidence. A
credible study record must include the approved package manifest, reviewer
roster, actual collected ReviewResult artifact manifest, completeness check,
operational notes and limitations, compatible per-package EvaluationReport and
cluster-refinement artifacts, plus the external
apply/reject/defer/no-action record. Do not fabricate or substitute
fixture-generated review results for independent human reviews.

## Study Execution Handoff Draft

```md
Preflight is prepared in `docs/PILOT_74_PREFLIGHT.md` and follows the validation
protocol and reviewer rubric. Proposed scope is 3-5 frozen, validated
realistic/sanitized CasePackages reviewed independently by 2-3 reviewers, with
one full ReviewResult per reviewer/package and strict completeness checks before
per-package aggregation.

The repo currently has tracked synthetic package-shaped fixtures suitable for
rehearsal, but no human-approved realistic pilot package set. Before execution,
please approve: (1) the final package manifest, (2) reviewer roster and
assignments, (3) any real/restricted-data use, (4) the mocked-assistance
condition, (5) the external refinement owner, and (6) limits on publication or
claims. This preflight does not run the pilot or produce ReviewResults,
EvaluationReports, refinement outcomes, or validation claims.
```
