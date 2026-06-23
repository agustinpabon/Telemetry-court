# Notebook Handoff Checklist

## Purpose

This checklist is for upstream notebook and script authors preparing a
sanitized adapter export for Telemetry Court. It helps authors produce an
approved sanitized draft that the existing mapper and CLI can convert into a
validated `CasePackageV01`.

This page is an operational handoff checklist, not a new schema. The source of
truth for the draft shape, field meanings, mapper-derived fields, and
validation behavior is
[`SANITIZED_ADAPTER_INPUT_CONTRACT.md`](./SANITIZED_ADAPTER_INPUT_CONTRACT.md).

## Responsibility Boundary

### Upstream Notebook Or Script Authors

Upstream authors are responsible for:

- running Toponymy, DataMapPlot, UMAP, HDBSCAN, ACME4, or other experiments
  outside Telemetry Court;
- selecting the cluster or case to export;
- producing only an approved, sanitized upstream draft object;
- supplying topology or map coordinates already computed upstream;
- supplying evidence summaries, claims, claim-evidence links,
  representative sessions, neighbor and outlier/impostor references,
  provenance, and sanitization metadata according to the sanitized adapter
  input contract;
- choosing an input and output location appropriate for the data sensitivity
  and intended environment.

The upstream author and named approver remain responsible for content
minimization, sanitization, approval scope, and safe storage before the draft
crosses the Telemetry Court boundary.

### Telemetry Court

Telemetry Court:

- accepts only the approved sanitized draft object through the existing mapper
  or CLI;
- converts that draft into `CasePackageV01`;
- validates and imports CasePackages for structured review;
- exports `ReviewResult`, `EvaluationReport`, and `cluster_refinement.json`
  artifacts through the existing review and evaluation workflow;
- does not run upstream clustering, embedding, dimensionality reduction,
  naming, or raw telemetry processing.

`cluster_refinement.json` is an output for an upstream notebook or script to
interpret. It is not a trigger for Telemetry Court to rerun any upstream
pipeline. For the consumer-side refinement handoff, see
[`CLUSTER_REFINEMENT_HANDOFF.md`](./CLUSTER_REFINEMENT_HANDOFF.md).

## CLI Handoff

The npm script keeps the existing positional input form with an optional
`--out` output path:

```bash
npm run sanitized-case-package-adapter-v01 -- <approved-sanitized-draft.json> --out <case-package.json>
```

It also accepts the explicit input and output flag form:

```bash
npm run sanitized-case-package-adapter-v01 -- --input <approved-sanitized-draft.json> --output <case-package.json>
```

Omit the output flag to print the mapped package to standard output. Use
exactly one input path and at most one output path. Duplicate or conflicting
input or output paths fail before the CLI writes a package.

These are placeholder paths only. They are not fixture paths, generated public
examples, or permission to write sensitive artifacts into the repository. Use
an approved location such as
`<restricted-workspace-or-approved-output-directory>` when required by the
data classification.

The CLI reads the supplied sanitized draft, maps it, validates the resulting
`CasePackageV01`, and writes output only when mapping and validation succeed.
It does not execute a notebook or any upstream processing.

## Pre-Export Checklist

Before invoking the CLI, confirm:

- [ ] The sanitized draft shape matches
      [`SANITIZED_ADAPTER_INPUT_CONTRACT.md`](./SANITIZED_ADAPTER_INPUT_CONTRACT.md).
- [ ] The draft contains no raw telemetry.
- [ ] The draft contains no unsanitized restricted records.
- [ ] The draft contains no realistic hostnames, IP addresses, usernames, file
      paths, command lines, cloud account IDs, process trees, CloudTrail
      events, ACME4-derived values, or real dataset artifacts unless each item
      is explicitly approved for the target environment.
- [ ] Package, case, dataset, cluster, label, claim, evidence, session,
      candidate, neighbor, provenance, and source IDs are stable and all
      internal references resolve.
- [ ] Claim-evidence links are complete, valid, and consistent with each
      claim's declared evidence status.
- [ ] Representative sessions, neighbor references, and outlier/impostor
      candidates reference valid sanitized IDs.
- [ ] Topology or map coordinates are present, finite, and bounded for the
      declared coordinate space. When the current normalized results map is
      intended, `x` and `y` are within the supported `0..1` range.
- [ ] Required provenance metadata identifies the approved upstream run,
      adapter, and safe source references without embedding restricted
      content.
- [ ] Required sanitization metadata records the status, method, redaction
      notes, display level, drill-down posture, approval scope, and safe
      approval reference.
- [ ] The draft input and generated output locations match the data
      sensitivity, approval scope, and intended environment.

If any item is unresolved, keep the artifact upstream and do not invoke the
Telemetry Court adapter.

## Post-Export Checklist

After the upstream draft is approved:

- [ ] Run the existing sanitized adapter CLI with placeholder paths replaced
      by approved local paths.
- [ ] Confirm the CLI reports success and `CasePackageV01` validation passes.
- [ ] Import the generated CasePackage into Telemetry Court only in the
      intended and approved environment.
- [ ] Do not commit or publish generated packages unless the exact artifact and
      target repository or environment are explicitly approved.
- [ ] Preserve an exported `cluster_refinement.json` as an input for the
      upstream notebook or script when refinement feedback is part of the
      approved workflow.
- [ ] Treat `cluster_refinement.json` as reviewer-derived guidance for upstream
      interpretation, not as a Telemetry Court instruction or trigger to rerun
      clustering.
- [ ] Follow
      [`CLUSTER_REFINEMENT_HANDOFF.md`](./CLUSTER_REFINEMENT_HANDOFF.md)
      before pruning sessions, acting on split or merge hints, or producing the
      next approved sanitized draft.

## Non-Goals And Prohibitions

This handoff does not add, authorize, or require:

- fixtures;
- fake public CasePackages;
- fake ReviewResults or EvaluationReports;
- fabricated reviewers, review counts, pilot data, or validation outcomes;
- app, UI, or runtime changes;
- package, dependency, configuration, or build-setting changes;
- in-app Toponymy, DataMapPlot, UMAP, HDBSCAN, ACME4, clustering, embedding,
  dimensionality-reduction, naming, or telemetry-processing execution;
- raw telemetry ingestion.

Do not invent topology coordinates, restricted values, source artifacts, or
approval records to make a draft pass validation.
