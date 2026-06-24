# Issue: Visual Log Field Highlighting

Type: AFK
Status: active
Priority: p1
Milestone: Milestone 4

## Validation outcome
Adds visual field highlighting inside the `EvidenceBoard` detailed logs view. When a reviewer expands an evidence log, specific keys or values in the log structure are highlighted based on the mappings defined in the package metadata, immediately indicating *why* the evidence matches the claim.

## Why this matters
Toponymy labels are LLM-generated summaries. Reading long raw JSON logs to verify if the LLM's claims are true is slow and tedious. Highlighting the exact triggering fields gives the analyst instant visual validation.

## Contract impact
- **CasePackage**: Leverages the existing `evidence_items[].content` structure and can use metadata to specify highlight paths (e.g. JSON paths like `$.eventName`).
- **ReviewResult**: No impact.
- **EvaluationReport**: No impact.

## Scope

### In scope
- Modify `components/arena/EvidenceBoard.tsx` (detailed log view) to render JSON logs in a structured code viewer instead of plain text.
- Match specific paths or text segments inside the log payload against highlight configurations in the `CasePackage`.
- Render matching fields with distinct, high-contrast, premium styling (e.g., subtle yellow/amber background highlights and bold text) that align with our high-trust fintech design system.

### Out of scope
- Highlighting arbitrary external log streams (only highlights data already packaged inside the `CasePackage`).

## Evidence and provenance impact
Makes the trace from claim to raw log fields auditable.

## Acceptance criteria
- [ ] Detailed logs on the Evidence Board render in a clean, scrollable code viewer (with monospace font and code borders).
- [ ] Target fields configured for highlighting (e.g., specific event times, API calls, or user IDs) render with a clear highlight styling.
- [ ] Highlight styles work seamlessly on both desktop and mobile screens.
- [ ] Highlight logic handles missing or invalid highlight paths gracefully without crashing the UI.

## Required checks
- [ ] `npm test`
- [ ] `npm run lint`
- [ ] `npm run build`

## Work type
- [x] `AFK`
- [ ] `human-in-the-loop`

## Blocked by
None.
