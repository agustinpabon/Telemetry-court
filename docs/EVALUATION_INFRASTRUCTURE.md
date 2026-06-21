# Evaluation Infrastructure

## Direction

The backend direction for Telemetry Court is evaluation infrastructure, not a generic web-application backend.

Its purpose is to preserve a trustworthy path from a precomputed cluster and generated interpretation to structured human judgment and reusable evaluation metrics.

## Priority Order

1. Import precomputed clusters through a versioned contract.
2. Convert upstream output into reviewable case and evidence packages.
3. Validate package identity, provenance, references, and integrity.
4. Preserve blind human review before showing the AI-generated label.
5. Allow safe drill-down into real, sanitized, or approved semi-raw evidence.
6. Save structured human `ReviewResult` records.
7. Support multiple independent reviewers.
8. Aggregate compatible reviewer judgments.
9. Export `EvaluationReport` metrics that improve models, prompts, embeddings, labels, evidence extraction, and clustering decisions.

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

## Read-Only Results View v0.1

The first results view is the `/results` route backed by a deterministic
synthetic `EvaluationReportV01` fixture. It renders reviewer count, verdict
distribution, label-winner distribution, evidence-rating distribution, and
disagreement indicators from an already-built report. It renders reviewer
agreement coverage and observed values, identifies disputed evidence by stable
ID, and marks single-review or partial comparisons unavailable or incomplete
rather than aligned. It also renders the
comparison rollups as descriptive groups, marks single-value dimensions as
context rather than cross-variant comparison, and shows missing dimensions as
unavailable.

The view is intentionally presentation-only. It distinguishes reviewer output
from upstream CasePackage evidence, shows unavailable aggregate data as
unavailable rather than as zero-confidence truth, and does not expose claims,
evidence content, raw telemetry, package import, scoring, adjudication, or
consensus behavior.

This is the current local capability for reading an EvaluationReport shape. It
is not a generic dashboard, BI surface, backend API, durable multi-user report
workflow, account system, admin surface, or adapter implementation.

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

The `/results` fixture view offers JSON and CSV downloads for the already-built
fixture report. This is a portable artifact export for the static validation
slice, not a durable report-generation workflow, backend API, BI dashboard,
raw telemetry export, live model evaluation, cross-package benchmark workflow,
scoring system, adjudication system, or consensus mechanism.

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

## Current State And Next Proof

The current application stores review state locally, exports a single
structured JSON record from synthetic fixtures, and can save ReviewResult
artifacts in browser-local storage by CasePackage ID. The repository now
provides CasePackage validation, local ReviewResult persistence, and
deterministic in-memory aggregation of compatible ReviewResult objects, plus a
fixture-backed read-only results view with JSON/CSV export for an
EvaluationReport. It does not yet provide package uploads, durable server-side
review storage, a multi-reviewer service, a report-generation workflow, or
research-grade metrics.

The next proof after this contract slice is a narrow end-to-end exercise with a
realistic package: complete independent reviews, retain the resulting artifacts,
and aggregate them without relying on synthetic-only assumptions.

## Deferred Concerns

Login, user administration, generic dashboards, admin UX, enterprise permissions, production database design, organization management, billing, and broad API platforms are later concerns. They must not be treated as the next milestone or used to avoid defining the case and evaluation contracts.

Database and identity choices should follow actual evaluation requirements such as reviewer privacy, study protocols, auditability, concurrency, retention, and export. They should not define the product before those requirements exist.
