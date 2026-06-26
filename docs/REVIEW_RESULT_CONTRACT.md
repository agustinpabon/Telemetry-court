# Review Result Contract

## Purpose

`ReviewResult v0.1` is one reviewer's structured decision artifact for one
validated `CasePackage v0.1`.

```text
CasePackage v0.1
-> Telemetry Court review
-> ReviewResult v0.1
-> EvaluationReport v0.1 aggregation
```

The canonical TypeScript type is `ReviewResultV01` in
`lib/reviewResultV01.ts`. Its schema version is:

```text
review_result.v0.1
```

## Contract Separation

- `CasePackageV01` contains the upstream cluster interpretation, claims,
  evidence, provenance, sanitization metadata, and review configuration.
- `ReviewResultV01` contains one reviewer's choices and stable references to
  the package that was reviewed.
- `EvaluationReportV01` aggregates compatible review results through the
  separate pure utility in `lib/evaluationReportV01.ts`. It remains distinct
  from this single-review contract and export path.
- `QuickDispositionV01` (`quick_disposition.v0.1`) is a separate early-review
  artifact for dismissing, saving, continuing full review, or recording that a
  reviewer cannot judge from the package. It is stored and imported separately
  and is not a completed `ReviewResult`.

`ReviewResultV01` does not copy claims, evidence content, support scores, raw
references, or the full package. This prevents the result from becoming a UI
state dump and avoids exporting raw restricted telemetry.

## Top-Level Shape

Every result contains:

- `schema_version` and a deterministic export-scoped `review_id`;
- `created_at`;
- a compact `case_package` reference;
- local reviewer and review-session metadata;
- review protocol version and reveal state;
- structured reviewer decisions.

The local exporter builds the `review_id` from the package ID, reviewer ID,
review session ID, and export timestamp. This keeps two independent reviewers
of the same package distinct even when their local exports are produced at the
same instant.

The package reference preserves:

- package ID, package schema version, and optional package revision;
- case and cluster IDs;
- upstream pipeline ID when available;
- required pipeline run ID, upstream tool, and generation timestamp;
- available pipeline, model, clustering, dimensionality-reduction, naming,
  and prompt references.

Optional pipeline fields are omitted when the source package does not provide
them. The exporter does not invent adapter or upstream metadata.

`EvaluationReportV01` can group reviewer verdict and evidence-rating counts by
the selected label ID and these compact package/pipeline fields. An absent
optional field remains explicitly unavailable in the report; it is not inferred
from label text, evidence content, or an upstream system.

The report can also compare verdicts, label winners, and ratings per stable
evidence ID. Because `failure_modes` is multi-select and has no primary marker,
a major failure mode is comparable only for reviews with exactly one selected
mode. Aggregation preserves incomplete coverage instead of selecting a mode or
rating on the reviewer's behalf.

## Structured Decisions

The current export records:

- blind interpretation ID, label, and AI-label agreement;
- AI-label reveal state;
- selected candidate-label ID, meaning the candidate the reviewer judged
  best-supported and most defensible, plus structured reason codes and the
  optional rationale already supported by the label-comparison note;
- one canonical rating for every evidence ID in the reviewed package;
- selected outlier or impostor session ID;
- optional reviewer confidence, when a protocol captures it;
- structured failure modes;
- canonical final verdict;
- canonical recommended action.
- optional reviewer notes.

Selecting the AI-generated label means accepting it as the best-supported
candidate for the reviewed evidence. Selecting another candidate means the
reviewer found that alternative more defensible. The exporter preserves the
reviewer's exact `selected_label_id`; it does not reinterpret the selected
label as the label being rejected or replace it with a seeded recommendation.

The outlier/impostor session ID likewise preserves the exact completed
reviewer choice. The current UI distinguishes package-seeded candidates from
ordinary representative sessions and requires explicit confirmation before an
ordinary non-candidate session completes the cluster-fit step. That
confirmation is UI protocol state, not a new `ReviewResult v0.1` field.

The current synthetic UI does not have a separate recommended-action picker.
For v0.1, the exporter deterministically derives the canonical action from the
reviewer's final verdict. It does not add a new screen or claim that an
independent action choice was collected.

The current synthetic UI also does not have separate controls for reviewer
confidence or free-form notes. The `ReviewResultV01` contract allows those
fields for compatible future protocols, but the local exporter omits them
instead of fabricating values.

## Canonical Values

Evidence ratings:

```text
supports
weak_support
irrelevant
contradicts
insufficient
needs_more_context
```

Final verdicts:

```text
supported
partially_supported
unsupported_or_overclaimed
uncertain
cluster_impure
needs_split
needs_merge
needs_better_evidence
```

Recommended actions:

```text
accept_label
rename_label
broaden_label
narrow_label
split_cluster
merge_cluster
collect_more_evidence
rerun_prompt
rerun_embedding
mark_uncertain
```

These values share the canonical vocabulary declared by the CasePackage v0.1
review configuration. The compatibility exporter translates the current UI's
legacy names, such as `supports_label` and `unsupported_overclaimed`, before
serialization.

The evaluation semantics for final verdicts and structured failure-mode reason
codes are defined in
[`VERDICT_AND_FAILURE_MODE_SEMANTICS.md`](./VERDICT_AND_FAILURE_MODE_SEMANTICS.md).
`final_verdict` is the primary evaluation judgment. `failure_modes` are
secondary reason codes that explain the reviewer's choice and may be counted in
aggregate reports, but they do not override the final verdict or force
consensus.

## Integrity Behavior

`buildReviewResultExport` refuses to emit a result when required package,
pipeline, reviewer, reveal, evidence-rating, label, session, or verdict data is
missing or references an unknown UI object. This is a builder boundary, not a
general `ReviewResult` validator or import service.

The current app uses deterministic test timestamps and local synthetic reviewer
metadata in tests. Browser exports use the export timestamp at the time the
artifact is built.

`LocalReviewSessionV01` in `lib/reviewSessionV01.ts` is the first in-memory
multi-reviewer boundary. It associates multiple reviewer/session identifiers
with one compatible compact CasePackage reference, stores independent local
review state per review session, accepts compatible `ReviewResultV01`
submissions, and rejects duplicate reviewer/session submissions or incompatible
package references before aggregation.

## Local Persistence Boundary

`lib/reviewResultStorageV01.ts` is the current lightweight persistence boundary.
It stores only `ReviewResultV01` artifacts in browser-local storage under a
versioned local-store envelope and indexes them by
`case_package.package_id`.

The helper:

- saves and loads compatible `ReviewResultV01` objects by CasePackage ID;
- preserves the result schema version, protocol version, creation timestamp,
  reviewer ID, review-session ID, and compact CasePackage reference;
- rejects unsupported ReviewResult schemas, unsupported protocol versions,
  unsupported CasePackage schemas, and incompatible package references;
- upserts the same reviewer/session for a package so repeated local exports do
  not create accidental duplicate reviews;
- does not persist the full `CasePackage`, claims, evidence content, support
  scores, raw references, raw telemetry, accounts, teams, or permissions.

The current UI saves the built ReviewResult to this local store when the user
copies or downloads the structured JSON export. This is a convenience boundary
for the portable validation slice, not target enterprise infrastructure.

Quick dispositions use their own browser-local store keyed by CasePackage ID.
They preserve package, reviewer/session, source-stage, disposition, reason-code,
and timestamp metadata, but intentionally omit evidence ratings, label winners,
outlier/impostor selections, final verdicts, and recommended actions. They may
be listed on `/results`, but they are not aggregated into `EvaluationReportV01`.
The results view groups them beside matching package coverage while keeping a
separate quick-disposition section with disposition, source-stage, reason-code,
reviewer/session, and optional escalation summaries. A package with only quick
dispositions has no full evidence verdict, EvaluationReport, or refinement
output. Adding quick dispositions to a package with full ReviewResults does not
change the full-review aggregation.

## Portable ReviewResult Bundle v0.1

`lib/reviewResultBundleV01.ts` defines the local JSON exchange envelope
`review_result_bundle.v0.1`. A bundle contains:

- bundle ID, creation timestamp, source application, local JSON format, and a
  declared result count;
- the supported ReviewResult, review protocol, and CasePackage schema versions;
- one or more fully validated `ReviewResultV01` artifacts.

Bundle export reads the ReviewResults already saved for the currently selected
CasePackage in the browser-local store, sorts them deterministically by
`review_id`, and downloads a dated
`telemetry-court-review-results-YYYY-MM-DD.json` file. It does not copy full
CasePackages, claims, evidence content, or raw telemetry into the bundle.

Bundle import parses local JSON, validates the envelope and every contained
ReviewResult, rejects unsupported or unknown fields, invalid timestamps,
inconsistent review identity, incomplete blind-review state, missing evidence
decisions, duplicate `review_id` values, duplicate reviewer/session
submissions, and incompatible compact CasePackage references. Import is
atomic: all results are staged before one local-store write, and an existing
local result is never overwritten by bundle import.

Each bundle carries results for exactly one CasePackage ID. Every result must
have the same package revision, exact compact package, pipeline, model,
embedding, clustering, naming, and prompt references, blind-review setting,
and stable evidence-ID set already used by local sessions and
`EvaluationReportV01` aggregation. An import must also match any results for
that CasePackage already present in the local store.

Issue #100 remains responsible for choosing local or imported results and
building the results workflow from them. Issue #101 remains responsible for the
broader imported-package-to-EvaluationReport smoke test. Bundle import itself
does not aggregate, adjudicate, score, or render an EvaluationReport.

## Preflight Validation CLI

A local preflight validation command (`npm run validate-review-results`) validates a supplied `ReviewResult` JSON or `ReviewResultBundle` JSON path before import or aggregation. It performs strict validation using the same schema check and bundle compatibility logic used at the application boundary, printing a safe summary of reviewer counts, referenced CasePackages, and verdict distributions, without requiring backend persistence, raw telemetry files, or fabricating reviewer data.

## Deferred Work

This contract does not implement backend persistence, reviewer accounts,
package uploads, a reviewer selector UI, real Toponymy or ACME4 adapters, or
raw telemetry ingestion. The separate aggregation utility does not add those
capabilities.
