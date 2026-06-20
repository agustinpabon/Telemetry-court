## Summary

<!-- What changed? -->

## Validation-Bench Impact

<!-- How does this improve evidence grounding, structured review, provenance, aggregation, or evaluation output? -->

## Current Versus Target Capability

<!-- State what works now and what remains a target. Do not overclaim adapters, persistence, or evaluation metrics. -->

## Contract Impact

- `CasePackage`:
- `ReviewResult`:
- `EvaluationReport`:

## Evidence And Provenance Impact

<!-- Note changes to claims, evidence mappings, IDs, provenance, sanitization, review protocol, or validation failures. -->

## Tests / Checks

- [ ] `npm test`
- [ ] `npm run lint`
- [ ] `npm run build`

## Screenshots / Examples

Required for UI changes. Contract or metric changes should include valid and invalid examples.

## AI-Agent Notes

- Agent/model:
- Prompt scope:
- Changelog entry updated:
- Suggested commit followed `docs/COMMIT_GUIDELINES.md`:

## Risks / Follow-Ups

<!-- Call out deferred contract decisions, data-handling risks, or compatibility concerns. -->

## Review Checklist

- [ ] This change does not reframe Telemetry Court as a SIEM, SOC dashboard, or generic telemetry explorer.
- [ ] This change preserves the product identity as a validation bench.
- [ ] Documentation remains consistent with `CasePackage` / `ReviewResult` / `EvaluationReport` separation.
- [ ] Any new workflow supports evidence-based validation of AI-generated telemetry cluster interpretations.
- [ ] The change does not introduce raw restricted telemetry, invented evidence, or unverified Toponymy claims.
- [ ] Backend work is derived from the case package or evaluation contract rather than generic infrastructure.
- [ ] Current capabilities and future targets are clearly distinguished.
