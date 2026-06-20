# Telemetry Court - Model Selection Guide

When asking Codex or another coding agent to work on the repo, include a model recommendation and the validation-bench context.

## Small Docs-Only Tasks

Examples:

- source-of-truth docs;
- README cleanup;
- changelog cleanup;
- issue hygiene;
- small wording corrections;
- GitHub planning updates.

Recommended:

```text
Codex - GPT-5 high
```

## UI / UX Hierarchy Tasks

Examples:

- telemetry landscape hierarchy;
- case file clarity;
- blind investigation and AI reveal flow;
- evidence board interactions;
- label duel or impostor selection polish;
- Apple / Wealthsimple / Linear style refinement.

Recommended:

```text
Codex - GPT-5 medium
```

Escalate to:

```text
Codex - GPT-5 high
```

if:

- first attempt looks unclear;
- many components are involved;
- product clarity is ambiguous;
- layout changes are risky;
- accessibility or responsive behavior is involved.

## Feature Implementation Tasks

Examples:

- review progress controls;
- reset/review-again behavior;
- export JSON schema changes;
- local copy/download behavior;
- local state behavior;
- helper + UI + test changes.

Recommended:

```text
Codex - GPT-5 medium
```

## Tests / Debugging

Examples:

- validation workflow smoke tests;
- broken builds;
- TypeScript errors;
- data model bugs;
- export serialization bugs;
- failing CI.

Recommended:

```text
Codex - GPT-5 medium
```

Escalate to GPT-5 high for repeated failures or difficult debugging.

## PR Review / Merge Tasks

Docs/test-only PR:

```text
Codex - GPT-5 high
```

UI/data feature PR:

```text
Codex - GPT-5 medium
```

## Last Resort

Use stronger reasoning only when:

- repeated attempts failed;
- architecture is ambiguous;
- domain model or review export semantics are changing;
- high cost of wrong answer;
- difficult multi-file debugging;
- production-level risk.

Do not default to the biggest model for every small task.
