# Start Here For Agents

Telemetry Court is an evidence-based human-in-the-loop validation bench and
topological refiner for AI-generated telemetry cluster interpretations.

```text
AI names the cluster. Humans test the evidence.
```

The current application is a local research product, not only a static demo. It
accepts strictly validated `CasePackage v0.1` JSON through manual import or a
configured Hot-Folder, supports the blind structured review protocol, exchanges
browser-local `ReviewResult` artifacts, aggregates compatible results into
`EvaluationReport v0.1`, renders package-provided topology, and exports
`cluster_refinement.v0.1` recommendations for external upstream use. Built-in
cases and public examples remain synthetic.

## Read First

```text
AGENTS.md
README.md
docs/PRODUCT_VISION.md
docs/PRODUCT_POSITIONING.md
docs/PROJECT_CONTEXT.md
docs/PRODUCT_DECISIONS.md
docs/ROADMAP.md
docs/ARCHITECTURE.md
docs/CASE_PACKAGE_CONTRACT.md
docs/EVALUATION_INFRASTRUCTURE.md
docs/DATA_MODEL.md
```

For UI work, also read the design documents. For planning and handoff work, read `docs/GITHUB_PLANNING.md`, `docs/AGENT_WORKFLOWS.md`, `docs/DEVELOPMENT_WORKFLOW.md`, and `docs/CHANGELOG_AI.md`.

## Boundary To Preserve

```text
Upstream cluster output
-> CasePackage
-> Telemetry Court review
-> ReviewResult
-> EvaluationReport
-> cluster_refinement.v0.1
-> external upstream refinement/rerun
```

Do not turn the project into a SIEM, SOC dashboard, raw telemetry explorer, alert-triage tool, generic chatbot, generic CRUD backend, or auth-first application.

## Current Milestones And Next Proof

- Milestone 3, the Local Utility Gate, is implemented.
- Milestone 4's repository engineering is implemented: sanitized mapper/CLI,
  Hot-Folder scan and polling, Python file-contract companion, evidence field
  highlights, structured split/merge recommendations, and refinement handoff.
- Milestone 5 has a deterministic mocked Evidence Assistance panel on the
  Evidence Board. It uses only canonical fixed questions and validated package
  IDs; it has no provider, prompt execution, streaming, arbitrary chat, or
  review-artifact persistence.
- Milestone 6 remains the honest proof step. It requires a human-approved set
  of realistic/sanitized packages and independent reviewers. Do not infer pilot
  success, scientific validation, or real-world performance from fixtures,
  automated tests, or synthetic EvaluationReport examples.

Real Toponymy, DataMapPlot, UMAP/HDBSCAN, and ACME4 execution remain upstream
and are not implemented by this repository. Before modifying code, inspect git
status and task-relevant files; do not infer current capabilities from one
status document alone.
