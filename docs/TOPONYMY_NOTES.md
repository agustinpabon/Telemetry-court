# Toponymy Notes

## Source Of Truth

The official [TutteInstitute/toponymy GitHub repository](https://github.com/TutteInstitute/toponymy) is the source of truth for factual Toponymy information used in this repository.

Use official repository materials when a Toponymy detail matters, such as:

- Repository root: <https://github.com/TutteInstitute/toponymy>
- Official README: <https://github.com/TutteInstitute/toponymy/blob/main/README.rst>
- Other official files or folders inside that repository, cited by file and section when relevant.

Do not invent Toponymy APIs, workflows, capabilities, function signatures, supported models, or outputs. Any factual Toponymy claim must be grounded in the official TutteInstitute/toponymy GitHub repository.

When writing docs, prompts, or planning notes in this repo:

- Cite or reference the specific official repo file or section used for each factual Toponymy claim.
- Prefer exact file paths or section names over vague references to "Toponymy docs."
- If a detail cannot be confirmed from the official repo, leave it out or mark it explicitly as unknown.

## Non-Authoritative Sources

DeepWiki, generated summaries, blog posts, or other third-party pages are not authoritative sources for Toponymy facts.

DeepWiki may be mentioned only as a non-authoritative navigation aid:

- DeepWiki link: <https://deepwiki.com/TutteInstitute/toponymy/1-overview>
- Do not use DeepWiki as the factual basis for repository docs, architecture notes, API assumptions, or product planning.
- Do not cite generated summaries as proof that Toponymy supports a capability.

## Telemetry Court Stance

Telemetry Court treats Toponymy as upstream conceptual inspiration, not as a current implementation dependency.

Use careful language:

- "inspired by Toponymy"
- "compatible with Toponymy-style exports"
- "downstream of cluster naming"
- "could validate outputs from systems like Toponymy"

## Explicit Guardrails

- Do not claim current Toponymy integration.
- Do not add Toponymy, Python, backend services, ingestion, auth, database work, or persistence under the banner of "Toponymy support" unless a future task explicitly scopes it.
- Toponymy integration remains out of scope for the current MVP.
- Telemetry Court remains a static downstream validation UI for AI-generated telemetry cluster interpretations.

## Working Rule For Agents

Before adding or editing any factual Toponymy statement in this repository:

1. Find the official Toponymy repo file or section that supports the statement.
2. Reference that file or section in the doc or note you are editing.
3. If you cannot find support in the official repo, do not present the statement as fact.
