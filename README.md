# Telemetry Court

Telemetry Court is a prototype for validating AI-generated interpretations of cyber telemetry clusters. It helps analysts inspect whether a generated cluster label or explanation is actually supported by the underlying evidence.

Core product question:

```text
Can AI prove what it claims?
```

## What It Is

Telemetry Court is an analyst-facing validation layer for systems that name or explain clusters of telemetry-like information objects. It starts after an AI system has already produced a cluster name, topic label, or explanation.

The product does not primarily generate labels. It evaluates labels, claims, and explanations against evidence.

## MVP Workflow

```text
Cluster
-> AI label / explanation
-> Extracted claims
-> Evidence
-> Support score
-> Analyst judgment
```

The MVP should help a reviewer inspect:

- What the AI claimed.
- Which evidence supports or weakens the claim.
- Whether the claim is supported, weakly supported, contradicted, unsupported, or missing enough evidence.
- Why the system assigned that confidence.

## Product Design North Star

Make every AI label easy to inspect, challenge, and defend.

Telemetry Court should guide a reviewer through a clear evidence-review flow:

```text
Cluster -> Proposed label -> Supporting evidence -> Confidence -> Verdict
```

The product should feel calm, premium, and evidence-first. The standard is Wealthsimple-level restraint and trust clarity, not a clone of Wealthsimple or any other brand. Do not copy another company's branding, exact layouts, copy, colors, iconography, illustrations, or screen compositions.

This is not generic analytics and not a cyber dashboard. The UI should help analysts inspect AI-generated claims against evidence and record a judgment with visible uncertainty.

## Relationship To Toponymy

[Toponymy](https://github.com/TutteInstitute/toponymy) is useful conceptual inspiration for Telemetry Court. Toponymy clusters information objects, extracts features such as keyphrases, exemplars, and subtopics, then uses LLMs to produce human-readable topic names.

Telemetry Court is framed as a downstream validation layer for that kind of topic-naming pipeline. It should stay compatible with Toponymy-style concepts, but the MVP does not depend on Toponymy, Python, or backend services.

See [docs/TOPONYMY_NOTES.md](./docs/TOPONYMY_NOTES.md) for careful project notes.

## Current Status

Telemetry Court is currently a frontend prototype using synthetic sample data.

Implemented today:

- Next.js App Router project.
- TypeScript domain types.
- Static sample cases.
- Evidence review UI prototype.

Not implemented yet:

- Telemetry ingestion.
- Toponymy integration.
- Automated claim extraction.
- Automated evidence scoring.
- Backend storage or authentication.

## Development Philosophy

- Evidence first: every generated claim should map to evidence IDs or explicitly show missing evidence.
- Calm review flow: this is not a SOC dashboard, SIEM clone, or chatbot.
- Small diffs: prefer narrow, reviewable changes over broad rewrites.
- Synthetic data only: do not introduce real telemetry, secrets, customer data, or incident claims.
- Frontend first: use TypeScript, Next.js App Router, Tailwind, and static/sample data until a backend is explicitly scoped.

For UI and visual design guidance, see [docs/DESIGN_DIRECTION.md](./docs/DESIGN_DIRECTION.md), [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md), and [docs/DESIGN_REFERENCE_HIGH_TRUST_FINTECH.md](./docs/DESIGN_REFERENCE_HIGH_TRUST_FINTECH.md).

## Development

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Run checks:

```bash
npm test
npm run lint
npm run build
```

Workflow docs:

- [docs/ROADMAP.md](./docs/ROADMAP.md)
- [docs/GITHUB_PLANNING.md](./docs/GITHUB_PLANNING.md)
- [docs/DEVELOPMENT_WORKFLOW.md](./docs/DEVELOPMENT_WORKFLOW.md)
- [docs/COMMIT_GUIDELINES.md](./docs/COMMIT_GUIDELINES.md)
- [AGENTS.md](./AGENTS.md)

## For AI Agents

Before editing, read [AGENTS.md](./AGENTS.md), [docs/PROJECT_CONTEXT.md](./docs/PROJECT_CONTEXT.md), and [docs/PRODUCT_DECISIONS.md](./docs/PRODUCT_DECISIONS.md). Before UI or styling work, also read [docs/DESIGN_DIRECTION.md](./docs/DESIGN_DIRECTION.md), [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md), and [docs/DESIGN_REFERENCE_HIGH_TRUST_FINTECH.md](./docs/DESIGN_REFERENCE_HIGH_TRUST_FINTECH.md).

Agent work should preserve the product identity: Telemetry Court validates AI-generated telemetry cluster interpretations through inspectable claims and evidence. Do not turn it into a generic analytics dashboard, chatbot, SIEM, threat-intelligence product, or noisy cyber review console.

## License

MIT. See [LICENSE](./LICENSE).
