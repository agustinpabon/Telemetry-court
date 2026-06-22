# Start Here For Agents

Telemetry Court is an evidence-based human-in-the-loop validation bench for AI-generated telemetry cluster interpretations.

```text
AI names the cluster. Humans test the evidence.
```

The current application is a static synthetic validation slice. The target product ingests versioned case packages, supports blind structured review by multiple people, and exports evaluation metrics that improve upstream AI/ML pipelines.

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
```

Do not turn the project into a SIEM, SOC dashboard, raw telemetry explorer, alert-triage tool, generic chatbot, generic CRUD backend, or auth-first application.

## Next Implementation Milestone

The next milestone is the **Local Utility Gate** (focusing on external/approved CasePackage validation workflow, package authoring/inspection support, and realistic/sanitized package readiness). It will support local CasePackage JSON file import, show useful validation failures for invalid inputs, persist and export ReviewResults, and aggregate compatible results into an EvaluationReport.

Before modifying code, inspect git status and the task-relevant files. Do not assume current branch, issues, or capabilities from documentation alone.
