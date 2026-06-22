# Validation Pilot Protocol

## Purpose

This protocol prepares a small validation pilot for Telemetry Court's current
local Utility Gate.

Core line:

```text
AI names the cluster. Humans test the evidence.
```

The pilot tests whether the local loop is useful with approved realistic
`CasePackageV01` inputs, not only synthetic demo cases.

Current boundary:

```text
upstream pipeline or notebook
-> precomputed cluster output
-> CasePackage JSON
-> Telemetry Court review
-> ReviewResult
-> EvaluationReport
-> upstream pipeline improvement
```

This protocol does not add or assume backend persistence, databases, auth,
accounts, server-side multi-user coordination, raw telemetry ingestion, SIEM or
SOC behavior, alert triage, chatbot UI, consensus or adjudication, reviewer
scoring, real Toponymy ingestion, DataMapPlot adapters, ACME4 ingestion, or
CloudTrail ingestion.

## Pilot Objective

Run 3-5 approved realistic or sanitized `CasePackageV01` files through 2-3
independent reviewers, exchange exported `ReviewResult` bundles, and produce at
least one auditable `EvaluationReport`.

The question is practical:

```text
Can the current local loop help reviewers identify whether generated telemetry
cluster interpretations are supported by evidence, and produce useful upstream
improvement signals?
```

The pilot should capture whether reviewers can complete the workflow without
developer help, whether package authors can satisfy the contract, whether
review outputs re-import cleanly, and whether the report explains label
support, overclaim or uncertainty, evidence sufficiency, impurity, and
reviewer disagreement where those signals are available.

## Required Inputs

- 3-5 approved realistic or sanitized `case_package.v0.1` JSON files.
- 2-3 independent reviewers.
- Reviewer IDs and review-session IDs, using non-sensitive identifiers.
- Package provenance and sanitization notes, embedded in each package and
  optionally repeated in pilot notes.
- A local browser environment with local storage and file download/import
  enabled.
- One coordinator browser profile for importing ReviewResult bundles and
  checking `/results`.

If reviewers share one machine, use separate browser profiles where practical.
Otherwise, export each review bundle before the next reviewer starts and keep a
manual roster that maps exported files to reviewer and session IDs. Reviewers
should not discuss a package until their exported result bundle is complete.

## CasePackage Acceptance Checklist

Use this checklist before giving a package to reviewers. A package that fails a
required item should be fixed upstream or intentionally excluded from the
pilot.

- [ ] `schema_version` is exactly `case_package.v0.1`.
- [ ] `package_id` is stable and non-sensitive.
- [ ] `package_revision` is stable when present and changes when the package is
  corrected or regenerated.
- [ ] `pipeline` includes the upstream tool or notebook reference, required run
  reference, and generated timestamp.
- [ ] Review protocol metadata is compatible with
  `telemetry_court_review.v0.1`.
- [ ] Package-level provenance is present and specific enough for audit.
- [ ] Sanitization metadata is present and honest about what was removed,
  transformed, summarized, or retained.
- [ ] Evidence cards are sufficient for review: representative examples,
  distinguishing features, boundary cases, contradictory or weak signals where
  available, and any necessary neighbor or outlier context.
- [ ] No raw restricted telemetry payloads are embedded in the package.
- [ ] Safe or compact references are used only where reviewers can act on them
  without exposing restricted data in the app.
- [ ] Evidence IDs, claim IDs, label IDs, session IDs, cluster IDs, and package
  IDs are stable strings rather than array indexes.
- [ ] Every generated claim links to evidence IDs or explicitly declares that
  evidence is missing.
- [ ] `evidence_to_claim_mappings` use valid claim and evidence IDs.
- [ ] Candidate labels are realistic enough to compare, including the AI label
  and any baseline, alternative, or prompt-variant labels the package is meant
  to test.
- [ ] The AI claim or explanation is realistic enough to judge, including
  uncertainty or caveats when the upstream system produced them.
- [ ] The package imports cleanly into Telemetry Court, or fails loudly with
  useful diagnostics that a package author can act on.

## Reviewer Workflow

Each reviewer completes the workflow independently for each assigned package.
The main review should remain structured-choice first; manual notes are for
pilot observation, not required typed input inside the core workflow.

Use [`REVIEWER_RUBRIC.md`](./REVIEWER_RUBRIC.md) during reviewer onboarding so
evidence ratings, label comparison, verdicts, and failure modes are applied
consistently across reviewers.

1. Open Telemetry Court in the local browser environment.
2. Import the assigned `CasePackageV01` JSON file.
3. Confirm the imported package identity and stop if the package fails
   validation.
4. Complete the blind review before revealing the AI interpretation.
5. Reveal the AI label, explanation, and claims.
6. Classify each evidence item against the relevant claim using the available
   current UI ratings: supports, weak support, irrelevant or noise,
   contradicts, or needs more context. The canonical v0.1 vocabulary also
   includes `insufficient`, but the current local review flow does not collect
   it as a separate evidence-rating choice.
7. Compare candidate labels and select the best-supported label when possible.
8. Select any impostor or outlier signal requested by the review flow.
9. Complete the structured verdict. The current local export derives the
   canonical recommended action from that verdict rather than collecting a
   separate action choice.
10. Download or copy the structured `ReviewResult` so it is saved to the local
    review store, then export the package `ReviewResult` bundle.
11. Record manual pilot notes about confusion, missing evidence, UI friction,
    or package-authoring friction.

Do not create fake reviewer outputs to fill a report. Incomplete or uncertain
reviews are valid pilot findings when they reflect the evidence.

## Aggregation Workflow

The coordinator collects the exported `ReviewResult` bundles after reviewers
finish.

1. Use a clean coordinator browser profile or otherwise confirm the local
   ReviewResult store contains only the pilot artifacts intended for this
   aggregation pass.
2. Import each reviewer bundle.
3. Reject or quarantine any bundle that fails strict import validation.
4. Open `/results`.
5. Generate or inspect the `EvaluationReport` for each compatible
   CasePackage reference.
6. Export the report JSON or CSV needed for the pilot record.

For each report, verify:

- reviewer count;
- source review IDs;
- verdict distribution;
- selected-label distribution;
- evidence-rating distribution and evidence sufficiency signals;
- reviewer disagreement signals;
- disputed evidence IDs where available;
- failure-mode counts;
- package ID, revision, case ID, cluster ID, and compact pipeline identity;
- unavailable or excluded data is shown as unavailable or excluded, not as a
  silent zero;
- JSON and CSV export shape is readable enough to audit.

`EvaluationReportV01` currently aggregates compatible reviews for one exact
CasePackage reference. If the pilot reviews 3-5 different packages, treat each
package group as its own report group and keep any cross-package summary as
manual pilot notes until a report-set contract exists.

## Success Criteria

The pilot succeeds for the current local Utility Gate if:

- all approved packages import cleanly or fail with useful, actionable
  diagnostics;
- reviewers can complete the review without developer help;
- exported `ReviewResult` bundles re-import cleanly;
- the `EvaluationReport` is understandable and auditable;
- the report exposes label support, overclaim or uncertainty, evidence
  sufficiency, impurity, and reviewer disagreement where those signals are
  available in the current contract;
- excluded, duplicate, incompatible, or unavailable artifacts are visible
  enough for the coordinator to explain;
- at least one actionable upstream improvement is identified, such as changing
  a label, prompt, embedding choice, evidence extraction step, package
  authoring rule, or split/merge decision.

## Failure Criteria

The pilot fails or needs redesign if:

- reviewers cannot understand the generated claim, candidate labels, evidence,
  or required review action;
- the `CasePackageV01` schema is too hard to author for realistic packages;
- the evidence supplied is insufficient for validation;
- reviewers need developer help to complete normal import, review, export,
  bundle import, or report inspection;
- exported results cannot be re-imported reliably;
- `/results` cannot explain disagreement, exclusions, or unavailable data;
- the `EvaluationReport` does not help improve labels, prompts, embeddings,
  evidence extraction, or clustering decisions.

## Pilot Notes Template

Use one row or note block per package and reviewer.

```md
Package ID:
Package revision:
Reviewer ID:
Review session ID:
Time to complete:
Final verdict:
Selected label:
Evidence confusion:
Missing evidence:
UI friction:
Schema or package friction:
Import/export issues:
Results/report issues:
Suggested upstream fix:
```

The pilot summary should separate observed reviewer notes from generated
`EvaluationReport` output. Do not rewrite uncertain or incomplete reviews into
cleaner conclusions after the fact.

## Post-Pilot Decision

After the pilot, decide which path is justified by the evidence:

- improve CasePackage authoring guidance, examples, validation diagnostics, or
  upstream package generation;
- improve review UI clarity for claim, evidence, label comparison, impostor,
  outlier, or verdict steps;
- improve `/results` or `EvaluationReport` explanations, exports, unavailable
  states, or disagreement visibility;
- begin Toponymy/DataMapPlot adapter-boundary work only if the package,
  review, bundle, and report loop proved useful enough with realistic inputs.

Do not treat a visually completed review as success by itself. The pilot is
successful only when it produces auditable evaluation output that can improve an
upstream pipeline.
