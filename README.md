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
npm run lint
npm run build
```

## For AI Agents

Before editing, read [AGENTS.md](./AGENTS.md), [docs/PROJECT_CONTEXT.md](./docs/PROJECT_CONTEXT.md), and [docs/PRODUCT_DECISIONS.md](./docs/PRODUCT_DECISIONS.md).

Agent work should preserve the product identity: Telemetry Court validates AI-generated telemetry cluster interpretations through inspectable claims and evidence. Do not turn it into a generic dashboard, chatbot, SIEM, or threat-intelligence product.

## License

MIT. See [LICENSE](./LICENSE).
