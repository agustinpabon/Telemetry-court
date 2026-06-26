# Evaluation Infrastructure

## Direction

The backend direction for Telemetry Court is evaluation infrastructure, not a generic web-application backend.

Its purpose is to preserve a trustworthy path from a precomputed cluster and generated interpretation to structured human judgment and reusable evaluation metrics.

## Utility Gate

A feature is useful only if it helps produce or improve an auditable
`EvaluationReport` from real or realistic `CasePackage` inputs. The immediate
utility loop is:

```text
local CasePackage JSON import
-> strict validation
-> structured review
-> ReviewResult persistence/export/import
-> aggregate local or imported ReviewResults
-> EvaluationReport JSON/CSV
```

This gate comes before evidence-constrained AI assistance, generic backend
persistence, accounts, databases, raw telemetry ingestion, live SIEM
connectors, operational action generation, or broad dashboards.

## Priority Order

Milestone 3 implemented the local version of the package import, review result
exchange, aggregation, results, and export loop. Milestone 4 now focuses on
approved adapter producer and refinement consumer usage outside Telemetry
Court, without adding raw ingestion or in-app upstream processing.

1. Import external `CasePackage` JSON through the versioned contract.
2. Validate package identity, provenance, references, sanitization, and
   integrity before rendering.
3. Show useful invalid-package failure UI during import.
4. Preserve blind human review before showing the AI-generated label.
5. Save structured human `ReviewResult` records locally without backend
   infrastructure.
6. Export and import `ReviewResult` bundles.
7. Support multiple independent reviewer results for one compatible package.
8. Aggregate compatible local or imported reviewer judgments.
9. Build the results page from local or imported ReviewResults, not only a
   static fixture.
10. Export `EvaluationReport` metrics that improve models, prompts,
   embeddings, labels, evidence extraction, and clustering decisions.
11. Convert upstream output into approved reviewable packages through adapters
   after the local import and result loop is usable.

## Evaluation Outputs

Expected metrics include:

- label support rate;
- overclaim rate;
- unsupported claim rate;
- partial support rate;
- uncertainty rate;
- cluster impurity rate;
- split recommendation rate;
- merge recommendation rate;
- evidence sufficiency;
- evidence disagreement;
- reviewer agreement;
- label winner distribution;
- failure mode frequency;
- model comparison metrics;
- prompt comparison metrics;
- embedding comparison metrics;
- evidence-extraction comparison metrics.

Every metric must define its inputs, denominator, treatment of incomplete reviews, compatible schema versions, and calculation version. Metrics that cannot be calculated from available data must be reported as unavailable.

Verdict and failure-mode reason-code semantics are defined in
[`VERDICT_AND_FAILURE_MODE_SEMANTICS.md`](./VERDICT_AND_FAILURE_MODE_SEMANTICS.md).
Those definitions specify which concepts each value can contribute to without
turning a human review choice into an automated score or adjudicated consensus.

## Review Integrity

The infrastructure must preserve:

- the exact `CasePackage` version reviewed;
- blind-review state and reveal timing;
- stable claim, evidence, label, and session IDs;
- provenance and sanitization metadata;
- reviewer independence where the study protocol requires it;
- incomplete or uncertain judgments without coercing a definitive answer;
- an audit trail from aggregate metrics back to source review results.

Reviewer-facing guidance for producing comparable structured judgments is
documented in [`REVIEWER_RUBRIC.md`](./REVIEWER_RUBRIC.md).

## Minimal EvaluationReport v0.1

`EvaluationReportV01` is the first local aggregation contract. The pure
`aggregateReviewResultsV01` utility accepts compatible `ReviewResultV01`
objects and returns:

- `evaluation_report.v0.1` schema identity and the separate
  `review_result_aggregation.v0.3` calculation version;
- the reviewed CasePackage reference and sorted source review IDs;
- reviewer count;
- canonical verdict and recommended-action count distributions;
- sorted candidate-label winner counts;
- canonical evidence-rating counts across all evidence decisions;
- sorted selected failure-mode counts;
- deterministic comparison rollups for selected label IDs and available compact
  CasePackage/pipeline metadata;
- descriptive reviewer-agreement signals for verdict, label winner,
  per-evidence rating, and a major failure mode where one mode is identifiable;
- simple verdict, action, label, and per-evidence rating disagreement flags.

The v0.1 report represents cluster impurity, split, merge, and recommended
follow-up signals through those canonical distributions rather than through
separate scoring fields:

- `verdict_distribution.cluster_impure` is the direct cluster-impurity signal;
- `verdict_distribution.needs_split` and
  `recommended_action_distribution.split_cluster` are split recommendation
  counts;
- `verdict_distribution.needs_merge` and
  `recommended_action_distribution.merge_cluster` are merge recommendation
  counts;
- `recommended_action_distribution` is the recommended follow-up action
  rollup;
- `failure_mode_counts` captures common selected failure-mode reason codes,
  including cluster-quality reasons such as `cluster_seems_mixed`;
- the compact `case_package` reference and `source_review_ids` preserve the
  metadata rollup needed to audit which package, revision, pipeline, and reviews
  were aggregated.

Named rates are intentionally not materialized by the first utility. Future
rate calculations must define numerators, denominators, incomplete-review
treatment, compatible schema versions, and calculation versions before they are
added to an export.

The disagreement fields report whether reviewers selected different values;
they do not adjudicate a correct answer, calculate statistical agreement, or
choose a consensus. Evidence disagreement also lists the stable evidence IDs
that received more than one rating.

### Reviewer Agreement And Disputed Evidence

`reviewer_agreement` is descriptive and additive to the existing distributions
and disagreement flags. Each signal records:

- `compared_review_count`, the number of reviews with a comparable value;
- `unavailable_review_count`, the number of input reviews without a comparable
  value for that signal;
- sorted observed `values` with reviewer counts and `distinct_value_count`;
- `unanimous`, which is `true` or `false` only when at least two values can be
  compared and is otherwise `null`;
- `status: "available"`, `"incomplete"`, or `"unavailable"`, plus a reason when
  the comparison is not fully available.

Verdict and label-winner agreement compare one canonical value per compatible
ReviewResult. A single review retains its observed value but cannot establish
reviewer agreement. Canonical uncertainty values, including the `uncertain`
verdict and `insufficient` or `needs_more_context` evidence ratings, remain
ordinary observed values rather than missing data or reviewer errors.

Evidence-rating agreement is calculated independently for each stable evidence
ID found in the input reviews. An evidence item is `disputed` only when at least
two comparable ratings exist and more than one rating value was observed.
Missing ratings increase `unavailable_review_count`; they do not become an
implicit rating or a disagreement. Evidence items and their rating values are
sorted by exact string value. The existing `disagreement.evidence_ids` remains
the sorted compatibility index of disputed evidence IDs.

The legacy disagreement booleans remain in the JSON contract for compatibility.
A `false` value with fewer than two reviews is not agreement; consumers must use
the agreement status and denominator. CSV disagreement rows are unavailable and
blank in that case rather than exporting `false` as a completed comparison.

`ReviewResultV01` normally requires one rating for every package evidence ID.
The aggregation status still exposes partial evidence coverage defensively if
compatible input artifacts do not contain the same evidence references. This
does not relax the ReviewResult builder boundary or validate an incomplete
review as complete.

Failure modes are multi-select secondary reason codes, so ReviewResult does not
identify one primary mode. The major-failure-mode signal compares only reviews
with exactly one selected failure mode. Reviews with zero or multiple modes are
counted as unavailable for that comparison, and the report never chooses a
primary mode on their behalf.

These fields do not calculate a quality score, statistical coefficient, correct
answer, consensus value, adjudication result, or reviewer-error rate.

The utility rejects empty input, unsupported ReviewResult or CasePackage schema
versions, mixed package IDs or revisions, mismatched compact package references,
and missing required review, package, pipeline, reviewer, or protocol metadata.
It uses no database, server, file IO, or account system.

### Comparison Rollups

`comparison_rollups` is a fixed-order list of descriptive groups. It reads only
metadata already carried by `ReviewResultV01`: selected label ID, package ID and
revision, pipeline ID and run ID, upstream tool, pipeline version, embedding
model, clustering and dimensionality-reduction methods, naming model, and
prompt ID, version, and digest. It does not resolve label text, copy evidence
content, inspect raw telemetry, or infer missing upstream metadata.

For each available metadata value:

- `review_count` is the number of compatible ReviewResults with that exact
  value;
- `evidence_decision_count` is the number of evidence-rating decisions in
  those ReviewResults;
- `verdict_distribution` counts one canonical final verdict per included
  ReviewResult;
- `evidence_rating_distribution` counts every canonical evidence-rating
  decision in those ReviewResults.

`missing_review_count` records how many input ReviewResults lack the dimension.
When every input lacks it, the rollup uses `status: "unavailable"`, retains the
missing count and a reason, and emits no groups. Missing metadata is never
coerced to an empty group or zero-valued upstream variable.

Dimension order is the contract order declared by
`EVALUATION_REPORT_V01_COMPARISON_DIMENSIONS`. Available group values are sorted
by exact string value, while verdict and evidence-rating keys stay in canonical
contract order. Input order therefore does not change the report.

These counts are descriptive. They do not calculate a quality score, rank a
model or prompt, adjudicate reviewer choices, or identify a best configuration.
The v0.1 compatibility rule still requires one exact compact CasePackage
reference per report. As a result, selected label IDs can form multiple groups,
while package, pipeline, model, embedding, and prompt dimensions currently form
one available group or an explicit unavailable entry. Cross-package or
cross-pipeline benchmarking needs a later report-set contract; it must not be
implied by these single-package rollups.

## Local Results View v0.1

The `/results` route reads the strict browser-local ReviewResult store and
builds one `EvaluationReportV01` for each compatible CasePackage reference by
calling the existing `aggregateReviewResultsV01` utility. It renders an empty
state when no ReviewResults exist, total result and package coverage, compact
package/pipeline provenance, verdict and label-winner distributions,
evidence-rating sufficiency signals, reviewer agreement, disputed evidence,
disagreement indicators, comparison rollups, and per-report JSON/CSV export.
It also lists validated `quick_disposition.v0.1` artifacts from their separate
local store as early structured outcomes. Each CasePackage group displays full
evidence ReviewResults and quick disposition artifacts in separate sections.
Quick-only groups explicitly report that no full evidence verdicts exist yet.
Quick disposition summaries count dispositions, source stages, reason codes,
unique reviewer/session pairs, and escalation rate when a disposition requests
full evidence review.

Quick dispositions are not treated as ReviewResults and are never passed to
`aggregateReviewResultsV01`. They therefore do not affect final-verdict,
evidence-rating, label-winner, reviewer-agreement, comparison-rollup,
EvaluationReport export, or cluster-refinement output. Mixed package groups
retain the same full ReviewResult aggregation they would have without the
quick disposition artifacts.

Locally completed reviews and validated imported bundle results enter the same
versioned local store. The route accepts local ReviewResult bundle JSON through
the existing strict bundle and store-import boundaries. Invalid, incompatible,
and mixed duplicate/new imports are rejected atomically, remain excluded from
the report, and leave the current aggregate unchanged. Re-importing a bundle
whose ReviewResults all already exist locally is a harmless no-op and is
reported as already imported with no action needed. Results for different
CasePackage IDs are displayed as separate report groups; exact-reference
compatibility is still required within each group.

Validated ReviewResult imports can include non-blocking semantic consistency
warnings in their inspection summary. These warnings make suspicious but
schema-valid reviewer decisions visible, such as evidence-insufficient blind
interpretations paired with selected overclaim AI labels, better-evidence
verdicts without failure-mode reasons, core/high-membership sessions selected
as outlier or impostor choices, or negative reason codes attached to the
selected best-supported label. Warnings are not aggregation inputs, do not
change `EvaluationReportV01`, do not block import, and do not rewrite reviewer
choices.

Validated CasePackages imported through the review shell or the results map
control produce a minimal results-map metadata projection in browser
`sessionStorage`. The projection contains the exact compact package reference,
case title/summary, dataset display classification, cluster display metadata,
and coordinates only; it excludes claims, evidence, representative sessions,
safe references, provenance, sanitization records, and approval metadata.
`/results` combines that session cache with bundled fixture projections after
navigation or reload and still requires an exact compact CasePackage reference
before using metadata or coordinates. The map-unavailable state keeps the
ReviewResult group visible, shows `package_id`, `case_id`, and `cluster_id`, and
asks the user to import or reload the matching CasePackage. This cache does not
change or expand the ReviewResult contract.

The view distinguishes reviewer output from upstream CasePackage evidence and
also makes artifact depth explicit during import and local display: a full
evidence `ReviewResult` can enter EvaluationReport aggregation, while a quick
disposition artifact cannot. Unavailable aggregate data remains unavailable
rather than zero-confidence truth. The view does not expose claims, evidence
content, raw telemetry, scoring, adjudication, consensus behavior, a generic
dashboard, backend API, durable multi-user report workflow, account system,
admin surface, or adapter implementation.

## EvaluationReport Export v0.1

`lib/evaluationReportExportV01.ts` serializes an existing
`EvaluationReportV01` as deterministic JSON and long-form CSV. The helper does
not aggregate ReviewResults, recalculate metrics, load storage, persist files,
or fetch upstream package evidence.

The JSON export preserves the report schema version, calculation version,
compact CasePackage reference, sorted source review IDs, reviewer count,
canonical count distributions, label-winner counts, evidence-rating counts,
failure-mode counts, reviewer-agreement signals, disputed evidence IDs,
comparison rollups, and disagreement flags. The CSV export
repeats compact package and pipeline provenance on each row, uses stable
headers, emits rows in canonical or sorted order, escapes CSV cells, and marks
unavailable aggregate sections explicitly instead of treating zero or false
values as factual conclusions when reviewer output is unavailable. Comparison
rows preserve review and evidence-decision denominators, canonical
verdict/evidence counts, missing-review counts, and unavailable reasons.
Agreement rows preserve compared and unavailable review counts, observed values,
distinct-value counts, incomplete reasons, and per-evidence dispute flags.

The `/results` view offers JSON and CSV downloads for each report built from a
compatible local CasePackage group. This is a portable artifact export for the
local validation slice, not a durable report-generation workflow, backend API,
BI dashboard, raw telemetry export, live model evaluation, cross-package
benchmark workflow, scoring system, adjudication system, or consensus
mechanism.

## Cluster Refinement Export v0.1

`lib/clusterRefinementV01.ts` builds and validates the first local
`cluster_refinement.v0.1` artifact. Its calculation version is
`cluster_refinement_calculation.v0.1`.

The artifact is a small upstream refinement recipe derived from compatible
human `ReviewResultV01` objects and their existing `EvaluationReportV01`
aggregation context. It preserves stable package, case, cluster, pipeline,
source review, review-session, and created-at metadata; it does not copy claims,
evidence content, safe-reference contents, raw telemetry, or full CasePackages.

Session pruning is intentionally conservative. `prune_session_ids` is only the
sorted list of `session_exclusion_recommendations` with
`status: "recommended"`. A session can be recommended only when a human review
selected `decisions.outlier_impostor.selected_session_id` and that same review
also captured at least one cluster-quality signal: `cluster_impure`,
`needs_split`, `split_cluster`, or `cluster_seems_mixed`. Selected sessions
without one of those human signals remain `not_recommended`; map position,
coordinates, outlier score, model score, cluster metrics, neighbor position, AI
label text, and package evidence alone do not create pruning recommendations.

Split recommendations come only from human split or impurity signals:
`needs_split`, `cluster_impure`, `split_cluster`, or
`cluster_seems_mixed`. Merge recommendations come only from `needs_merge` or
`merge_cluster`. Because `ReviewResultV01` does not capture a
reviewer-selected neighbor merge target, merge targets are exported as
explicitly unavailable rather than inferred.

The export preserves reviewer counts, supporting review counts, sorted source
review IDs, uncertainty, and disagreement state. A single-review recipe remains
valid but marks disagreement comparison unavailable instead of claiming
consensus. The `/results` view exposes this JSON download beside the existing
EvaluationReport JSON and CSV downloads, and disables the refinement export if
compatible source ReviewResults are not available for the report.

This is not an in-app clustering engine, Toponymy/DataMapPlot/UMAP/HDBSCAN
executor, raw telemetry workflow, backend persistence API, scoring system, or
automatic correctness claim.

For upstream operator guidance, use
[`CLUSTER_REFINEMENT_HANDOFF.md`](./CLUSTER_REFINEMENT_HANDOFF.md). That page
describes how to verify the artifact, preserve source review IDs, inspect
session exclusion counts, carry uncertainty and disagreement forward, apply
`prune_session_ids` externally, and return through the existing sanitized
adapter path.

## Local ReviewResult Persistence v0.1

The first persistence boundary is `lib/reviewResultStorageV01.ts`. It is a pure
helper over a minimal `getItem` / `setItem` storage interface and is wired to
browser `localStorage` only from the existing copy/download export actions.

The local store persists `ReviewResultV01` artifacts by
`case_package.package_id`. It does not persist full CasePackages, claim text,
evidence content, support scores, raw references, or raw telemetry. It preserves
the ReviewResult schema version, protocol version, creation timestamp,
reviewer/session identity, and compact CasePackage reference already present in
the export contract.

Compatibility remains explicit. Saves and loads reject unsupported
ReviewResult, review-protocol, or CasePackage versions, and reject incompatible
package references for the same package ID. Re-exporting from the same local
reviewer/session replaces that reviewer/session's stored result instead of
creating duplicate local submissions.

This is a portable validation-slice capability. It is not a backend API,
database, auth/account system, admin workflow, generic CRUD surface, or durable
multi-user study store.

The separate browser-session metadata cache used for results-map recovery is
not part of this ReviewResult store. It derives a minimal projection only from
validated `CasePackageV01` objects, replaces only the same exact compact package
reference, and is scoped to the current browser tab/session so compatible map
metadata can survive route navigation and reload without being embedded in
ReviewResult.

## Current State And Next Proof

The current application imports validated local CasePackage JSON, preserves the
synthetic demo flow, exports structured ReviewResults, stores them in browser
local storage by CasePackage ID, and exchanges strict local ReviewResult
bundles. The repository provides deterministic in-memory aggregation of
compatible ReviewResult objects and a local results view with per-package
EvaluationReport JSON/CSV export. It does not provide server uploads, durable
server-side review storage, a multi-reviewer service, a durable report workflow,
or research-grade metrics.

The next proof after this local results slice is a narrow Milestone 4 adapter
exercise: produce an approved sanitized draft outside Telemetry Court, map it
through the existing adapter path, import and review the resulting package,
export ReviewResults, EvaluationReport, and `cluster_refinement.v0.1`, consume
the refinement artifact upstream, and produce the next approved package
iteration without relying on synthetic-only assumptions.

## Deferred Concerns

Login, user administration, generic dashboards, admin UX, enterprise permissions, production database design, organization management, billing, and broad API platforms are later concerns. They must not be treated as the next milestone or used to avoid defining the case and evaluation contracts.

Database and identity choices should follow actual evaluation requirements such as reviewer privacy, study protocols, auditability, concurrency, retention, and export. They should not define the product before those requirements exist.
