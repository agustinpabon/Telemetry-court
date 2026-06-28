# AI Assistance Response Contract

## Purpose

`AI assistance response v0.1` is a local, strict TypeScript contract for future
evidence-constrained AI assistance.

It exists so any future assistant output can be audited against stable evidence
IDs from the current `CasePackage` or `ReviewResult` context.

```text
CasePackage / ReviewResult context
-> evidence-constrained question
-> AI assistance response v0.1
-> human review or evaluation use
```

Telemetry Court remains an evidence-based validation bench:

```text
AI names the cluster. Humans test the evidence.
```

## Non-Goals

This contract does not implement:

- live LLM calls;
- OpenAI, provider, or API integration;
- chatbot UI or chat history;
- streaming;
- prompt execution;
- backend persistence;
- auth, accounts, cloud sync, or remote jobs;
- raw telemetry ingestion;
- SOC triage, alert triage, incident response, or remediation actions.

The contract is local and deterministic. It defines what a response must look
like if evidence-constrained assistance is added later.

## Schema Identity

The canonical TypeScript type is:

```ts
import type { AiAssistanceResponseV01 } from "@/lib/aiAssistanceResponseV01";
```

The schema version value is:

```text
ai_assistance_response.v0.1
```

Runtime validation is provided by:

```ts
import { validateAiAssistanceResponseV01 } from "@/lib/aiAssistanceResponseValidationV01";
```

The validator accepts `unknown` input and returns a typed result. It can also
validate evidence references against a supplied `CasePackageV01` or
`ReviewResultV01` context.

## Top-Level Shape

Every response includes:

- `schema_version`;
- `response_id`;
- `created_at`;
- compact `case_package` reference metadata;
- optional compact `review_result` reference metadata;
- `question` metadata for the future evidence-assistance question;
- `generation` metadata, including model and prompt references;
- `answer`, including status, summary text, and cited evidence IDs;
- `findings`, each with its own evidence IDs;
- optional contract-level warning objects.

## Grounding Rules

An answered response must cite at least one evidence ID in `answer.evidence_ids`
and must include at least one grounded finding.

Every substantive finding must cite stable evidence IDs:

```json
{
  "finding_id": "finding-role-lifecycle",
  "text": "Role lifecycle activity is present in the package evidence.",
  "support": "supports",
  "evidence_ids": ["evidence-role-lifecycle"],
  "related_claim_ids": ["claim-role-changes"]
}
```

Evidence IDs are stable references such as `evidence-role-lifecycle`. They are
not prose citations, footnotes, raw telemetry snippets, URLs, or generated
free-text references.

When a `CasePackageV01` context is supplied, cited evidence IDs must exist in
`casePackage.evidence_items`. When only a `ReviewResultV01` context is supplied,
the validator can check cited IDs against the evidence IDs present in the
review's evidence ratings.

## Insufficient Evidence And Refusal

A response may omit evidence IDs only when it explicitly represents that the
answer cannot be grounded from the provided evidence.

Use `answer.status: "insufficient_evidence"` when the question is in scope but
the package does not support a grounded answer. Include
`answer.insufficiency_reason`.

Use `answer.status: "refused"` when the request is outside the evidence bench
or asks for unsupported behavior. Include `answer.refusal_reason`.

Ungrounded answers must not be emitted as confident claims. They must be
represented as insufficient evidence or refusal-style output.

## Validation Behavior

The validator rejects:

- unsupported `schema_version` values;
- unsupported or missing required fields;
- unknown fields in strict contract objects;
- empty successful answers with no evidence IDs;
- findings that claim support, weak support, or contradiction without evidence
  IDs;
- malformed evidence IDs that look like free-text citations;
- unknown evidence IDs when a `CasePackageV01` or `ReviewResultV01` context is
  supplied;
- missing insufficiency or refusal reasons on those answer paths.

The validator may emit non-blocking warnings in the `ai_assistance.*`
namespace. These warnings are separate from ReviewResult semantic warning codes
and do not change `ReviewResult`, `CasePackage`, or `EvaluationReport`
behavior.

The first warning is `ai_assistance.generic_chatbot_answer`, which flags
generic chatbot-style summary copy while preserving the response as valid when
the findings are still grounded.

## Deterministic Claim Critic Report

Issue #70 adds a deterministic verifier helper on top of the existing response
contract:

```ts
import { createAiAssistanceClaimCriticReportV01 } from "@/lib/aiAssistanceClaimCriticV01";
```

The helper accepts an `AiAssistanceResponseV01` plus a `CasePackageV01`
validation context. It first runs `validateAiAssistanceResponseV01`, then
returns a stable `ai_assistance_claim_critic.v0.1` report containing:

- validator errors and warnings, including generic-chatbot warnings;
- answer-path assessment for grounded answers, insufficient evidence, and
  refusals;
- sorted claim IDs referenced by findings;
- sorted evidence IDs cited by the answer and findings;
- support counts for `supports`, `weak_support`, `contradicts`,
  `insufficient`, and `needs_more_context`;
- per-claim coverage summaries with stable claim IDs, finding IDs, evidence
  IDs, support counts, and uncertainty levels;
- missing, unsupported, unknown-claim, and unknown-evidence ID summaries;
- critique items keyed to stable claim IDs, evidence IDs, finding IDs,
  warning codes, or validator error codes where applicable.

This report is deterministic verifier metadata for inspection and future
evaluation-report metadata. It is not live AI output, not prompt execution, not
a chatbot interface, not a final human verdict, and not an automated label
adjudication. It does not change `EvaluationReportV01` aggregation.

## Deterministic Mock Fixtures

Deterministic synthetic examples live in:

```ts
import { mockAiAssistanceResponseV01Fixtures } from "@/lib/aiAssistanceResponseV01Fixtures";
```

These mocks conform to `ai_assistance_response.v0.1` and validate against the
existing synthetic `CasePackageV01` fixture. They cover grounded answered
output, explicit insufficient-evidence output, and refused out-of-scope output.

The mocks are not live AI output, not prompt execution, not pilot evidence, and
not evidence that Telemetry Court has run a real model or reviewer study. They
exist only to support future UI, verifier, and contract tests without network
calls or provider integration.

A deliberately invalid generic-chatbot-style sample is exported separately with
a validator-test-only name. Do not use it as a product fixture or UI demo.

## Contract Separation

`AiAssistanceResponseV01` is not a `CasePackage`, `ReviewResult`, or
`EvaluationReport`.

It does not copy package evidence content, raw references, raw telemetry, or a
completed human review. It carries compact package metadata plus stable
evidence references so future assistance can remain auditable and subordinate
to the review workflow.
