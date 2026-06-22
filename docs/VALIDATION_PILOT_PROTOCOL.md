# Research Validation Study Protocol

## Purpose

This draft protocol defines a small multi-reviewer validation study for
Telemetry Court's current local Utility Gate. The study tests validation value,
not generic UX preference or whether the interface feels polished.

Core line:

```text
AI names the cluster. Humans test the evidence.
```

The study tests whether reviewers can produce comparable `ReviewResultV01`
artifacts from approved `CasePackageV01` inputs and whether compatible
`EvaluationReportV01` outputs reveal useful upstream improvement signals.

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
scoring, real Toponymy ingestion, DataMapPlot adapters, ACME4 ingestion,
CloudTrail ingestion, or research-grade statistical power.

## Protocol Status

Issue #72 is labeled `needs-decision` and `human-in-the-loop`. Treat this
document as the draft operating protocol for a first credible study, not as
final approval to use real data, recruit reviewers, or publish findings.

Assumptions that require explicit human approval before execution:

- the selected CasePackages are safe, approved, and sufficiently sanitized;
- the selected 2-3 reviewers are appropriate for the first study;
- any real or restricted source data has documented approval outside the app;
- the summary language used for results does not overclaim generalizable
  research findings.

## Study Objective

Run 3-5 approved synthetic, sanitized, or otherwise safe `CasePackageV01` files
through 2-3 independent reviewers, exchange exported `ReviewResult` bundles,
and produce auditable per-package `EvaluationReportV01` JSON/CSV outputs where
the current local app supports them.

The question is practical:

```text
Can the current local loop help reviewers identify whether generated telemetry
cluster interpretations are supported by evidence, produce comparable
ReviewResults, and surface useful upstream improvement signals?
```

The study should capture whether reviewers can complete the workflow without
developer help, whether package authors can satisfy the contract, whether
review outputs re-import cleanly, and whether reports expose label support,
unsupported or overclaimed interpretations, uncertainty, evidence sufficiency,
cluster impurity, and reviewer disagreement where those signals are available.

## Study Questions

- Can independent reviewers apply the current reviewer rubric consistently
  enough to produce comparable `ReviewResultV01` artifacts?
- Do compatible aggregated `EvaluationReportV01` outputs reveal actionable
  signals for upstream labels, prompts, evidence extraction, embeddings, or
  cluster boundaries?
- Which cases fail because the generated interpretation is weak versus because
  the evidence package is too thin, poorly linked, or insufficiently
  reviewable?
- Where do reviewers disagree, and are those disagreements evidence disputes,
  label-scope disputes, cluster-purity disputes, or missing-context disputes?

## Required Inputs

- 3-5 approved synthetic, sanitized, realistic, or otherwise safe
  `case_package.v0.1` JSON files.
- 2-3 independent reviewers.
- Reviewer IDs and review-session IDs, using non-sensitive identifiers.
- A reviewer assignment table or note that records reviewer domain familiarity
  as context only.
- Package provenance and sanitization notes, embedded in each package and
  optionally repeated in study notes.
- A local browser environment with local storage and file download/import
  enabled.
- One coordinator browser profile for importing ReviewResult bundles and
  checking `/results`.

If reviewers share one machine, use separate browser profiles where practical.
Otherwise, export each review bundle before the next reviewer starts and keep a
manual roster that maps exported files to reviewer and session IDs. Reviewers
should not discuss a package until their exported result bundle is complete.

Do not use reviewer outputs to rank reviewers. Reviewer domain familiarity,
confusion, disagreement, uncertainty, or low confidence is study context, not a
performance score.

## Package Selection

Use only CasePackages that are synthetic, sanitized, approved, or otherwise safe
for the local app and review environment. No restricted or raw telemetry may be
copied into the public or portable app unless the study owner explicitly
approves that use and the package still satisfies the `CasePackageV01`
sanitization and provenance requirements.

For the first credible study, prefer 3-5 packages rather than a larger batch.
Select a mix when available:

- clear support, where the label appears well grounded;
- partial support, where a narrower interpretation may be defensible;
- overclaim or unsupported interpretation;
- weak evidence or missing-evidence package quality issue;
- possible cluster impurity, split, merge, outlier, or impostor case.

All selected packages must validate as `case_package.v0.1` inputs before review.
Treat missing provenance, missing sanitization metadata, broken IDs, broken
claim-evidence links, invalid package versions, or unsafe raw payloads as
blockers for real study use, not as reviewer tasks to work around.

Final package selection is a human approval checkpoint. The draft study owner
should approve the package list before any reviewer sees the cases.

## Reviewer Selection

Use 2-3 independent reviewers for the first study. This is enough to test
whether structured judgments can be compared without implying statistical power
or consensus.

Before the study, record non-sensitive context for each reviewer:

- reviewer ID;
- review session ID pattern;
- domain familiarity, such as telemetry, ML evaluation, security analysis, or
  first-time reviewer;
- any known prior exposure to the selected cases.

Domain familiarity helps interpret disagreements and onboarding gaps. It must
not become a reviewer performance ranking, leaderboard, analyst-quality score,
or employment evaluation.

## CasePackage Acceptance Checklist

Use this checklist before giving a package to reviewers. A package that fails a
required item should be fixed upstream or intentionally excluded from the
study.

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
study observation, not required typed input inside the core workflow.

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
11. Record manual study notes about confusion, missing evidence, UI friction,
    or package-authoring friction.

Do not create fake reviewer outputs to fill a report. Incomplete or uncertain
reviews are valid study findings when they reflect the evidence.

## Blind-Review Rules

Blind review is a study integrity requirement, not a decorative UI step.

- The reviewer must make the initial assessment before AI label reveal.
- The purpose is to reduce anchoring bias from plausible AI-generated labels,
  claims, rationales, candidate-label details, or prompt variants.
- Do not reveal the AI label, generated claim, generated rationale, or
  candidate-label details before the blind step is complete.
- Reviewers should judge only the evidence and case context visible before the
  reveal.
- If a reviewer recognizes the case, label, source dataset, or upstream output
  from outside the app, record that as a study limitation for that review.
- If the app or package leaks the hidden interpretation early, quarantine that
  review and treat it as a protocol failure unless the study owner explicitly
  approves keeping it with a limitation note.

## Aggregation Workflow

The coordinator collects the exported `ReviewResult` bundles after reviewers
finish.

1. Use a clean coordinator browser profile or otherwise confirm the local
   ReviewResult store contains only the study artifacts intended for this
   aggregation pass.
2. Import each reviewer bundle.
3. Reject or quarantine any bundle that fails strict import validation.
4. Open `/results`.
5. Generate or inspect the `EvaluationReport` for each compatible
   CasePackage reference.
6. Export the report JSON or CSV needed for the study record.

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
CasePackage reference. If the study reviews 3-5 different packages, treat each
package group as its own report group and keep any cross-package summary as
manual study notes until a report-set contract exists.

The current local workflow supports browser-local ReviewResult storage,
validated bundle exchange, local bundle import, and per-package report export.
It is not durable multi-user study infrastructure, a server workflow, or a
research data warehouse.

## Metrics

Use metrics that can be derived from `ReviewResultV01` artifacts and current
per-package `EvaluationReportV01` outputs. Do not invent hidden scores or claim
statistical significance from a 3-5 package study.

Primary report-derived distributions:

- verdict distribution;
- selected-label or label-winner distribution;
- evidence-rating distribution;
- failure-mode frequency;
- recommended-action distribution, limited to actions actually emitted by the
  current local exporter;
- reviewer agreement and disagreement signals;
- disputed evidence IDs and common evidence disputes;
- compact package and pipeline comparison rollups where metadata is available.

Study-level rates may be calculated manually from the above distributions only
when the study summary defines the numerator, denominator, package grouping,
reviewer-count treatment, and excluded artifacts. Useful draft rates include:

- label support rate, such as `supported` verdicts divided by completed
  compatible reviews;
- unsupported or overclaimed rate, based on
  `unsupported_or_overclaimed` verdict counts;
- partial-support rate;
- uncertainty rate, based on `uncertain` verdict counts;
- needs-better-evidence rate, based on `needs_better_evidence` verdict counts
  and evidence ratings such as `needs_more_context`;
- cluster impurity, split, or merge recommendation rate, based on
  `cluster_impure`, `needs_split`, `needs_merge`, and the derived action
  distribution;
- reviewer disagreement rate, based on report disagreement flags or reviewer
  agreement statuses.

Current exporter caveats:

- `ReviewResultV01` accepts the canonical evidence rating `insufficient`, and
  `EvaluationReportV01` can count it if present in compatible imported
  artifacts.
- The current local UI/export path emits supports, weak support, irrelevant,
  contradicts, and needs more context; it does not expose `insufficient` as a
  separate evidence-rating selection.
- The current local exporter derives `decisions.recommended_action` from
  `decisions.final_verdict`. In the current path, emitted actions are
  `accept_label`, `narrow_label`, `rename_label`, `split_cluster`,
  `merge_cluster`, and `collect_more_evidence`.
- `recommended_action_distribution` is therefore a verdict-derived follow-up
  rollup for this study unless a future protocol explicitly captures an
  independent action choice.

## Analysis Plan

For each selected package:

1. Aggregate compatible `ReviewResultV01` artifacts into one
   `EvaluationReportV01`.
2. Confirm reviewer count, source review IDs, package identity, package
   revision, and compact pipeline metadata.
3. Compare reviewer agreement and disagreement for final verdict, selected
   label, evidence ratings, and major failure mode where available.
4. Identify recurring failure modes and evidence disputes.
5. Decide whether the upstream label is supported, partially supported,
   overclaimed, too broad, too specific, evidence-poor, uncertain, or affected
   by cluster impurity.
6. Record recommended upstream improvements, such as prompt edits, label
   changes, evidence extraction changes, embedding or clustering changes,
   split or merge review, or package-authoring fixes.

Across packages, summarize patterns manually until a report-set contract exists.
Keep package-level findings separate from cross-package observations. Avoid
claims about statistical significance, operational detection quality, reviewer
skill, or generalizable model performance from this small study.

## Study Artifacts

Expected artifacts for the study record:

- selected `CasePackageV01` files or approved references, including package ID,
  package revision, case ID, cluster ID, and source/provenance notes;
- reviewer assignment table or notes with non-sensitive reviewer IDs,
  review-session IDs, domain familiarity context, and any prior case exposure;
- exported `ReviewResultV01` JSON files or validated
  `review_result_bundle.v0.1` files from each reviewer;
- per-package `EvaluationReportV01` JSON and CSV outputs where the current
  local results view supports export;
- study notes covering confusion, missing evidence, import/export issues,
  package-authoring issues, and limitations;
- a summary of upstream improvement recommendations, separated from raw report
  counts and clearly labeled as interpretation.

Do not copy restricted source data into the study record. If a package uses safe
references to an approved source environment, keep the reference minimal and
auditable without exposing raw telemetry in the app or public repository.

## Data Safety And Limitations

- Use approved, sanitized, synthetic, or otherwise safe packages only.
- Do not copy restricted data into the public app, portable fixtures, public
  repository, PR description, screenshots, changelog, or study summary.
- Treat missing provenance or missing sanitization metadata as a blocker for
  real study use.
- Treat unsafe raw payloads, broken safe references, or hidden restricted data
  in evidence content as blockers until fixed upstream.
- Do not overclaim results from 3-5 packages and 2-3 reviewers.
- Do not treat findings as SOC detection quality, alert-triage quality,
  incident-response quality, or operational safety evidence.
- Do not evaluate analyst performance, reviewer seniority, or reviewer
  employment quality.
- Do not infer model, prompt, embedding, or clustering superiority unless the
  selected packages and metadata were explicitly designed for that comparison
  and the limitation is stated.
- Do not publish or present results without human approval of data safety,
  limitations, and claims.

## Human Approval Checkpoints

Because this protocol is still a `needs-decision` / `human-in-the-loop`
artifact, require explicit human approval before:

- using real, realistic, proprietary, restricted, or sensitive datasets;
- selecting the final study CasePackage list;
- recruiting or assigning reviewers;
- exposing any safe drill-down references outside the authorized environment;
- changing the reviewer rubric or structured values for study convenience;
- publishing, presenting, or externally sharing study results;
- claiming generalizable findings, model superiority, detection quality, SOC
  usefulness, or operational incident-response value.

## Success Criteria

The study succeeds for the current local Utility Gate if:

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
  authoring rule, or split/merge decision;
- the study can distinguish validation value from UI preference feedback.

## Failure Criteria

The study fails or needs redesign if:

- reviewers cannot understand the generated claim, candidate labels, evidence,
  or required review action;
- the `CasePackageV01` schema is too hard to author for realistic packages;
- the evidence supplied is insufficient for validation;
- reviewers need developer help to complete normal import, review, export,
  bundle import, or report inspection;
- exported results cannot be re-imported reliably;
- `/results` cannot explain disagreement, exclusions, or unavailable data;
- the `EvaluationReport` does not help improve labels, prompts, embeddings,
  evidence extraction, or clustering decisions;
- study notes mostly describe visual taste, navigation preference, or general
  UX sentiment without producing evidence-grounded validation signals.

## Study Notes Template

Use one row or note block per package and reviewer.

```md
Package ID:
Package revision:
Reviewer ID:
Review session ID:
Reviewer domain familiarity:
Known prior exposure:
Time to complete:
Final verdict:
Selected label:
Evidence confusion:
Missing evidence:
Disputed evidence IDs:
UI friction:
Schema or package friction:
Import/export issues:
Results/report issues:
Suggested upstream fix:
Study limitation:
```

The study summary should separate observed reviewer notes from generated
`EvaluationReport` output. Do not rewrite uncertain or incomplete reviews into
cleaner conclusions after the fact.

## Post-Study Decision

After the study, decide which path is justified by the evidence:

- improve CasePackage authoring guidance, examples, validation diagnostics, or
  upstream package generation;
- improve review UI clarity for claim, evidence, label comparison, impostor,
  outlier, or verdict steps;
- improve `/results` or `EvaluationReport` explanations, exports, unavailable
  states, or disagreement visibility;
- begin Toponymy/DataMapPlot adapter-boundary work only if the package,
  review, bundle, and report loop proved useful enough with realistic inputs.

Do not treat a visually completed review as success by itself. The study is
successful only when it produces auditable evaluation output that can improve an
upstream pipeline.
