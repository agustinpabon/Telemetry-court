# Telemetry Court

Telemetry Court is an interactive evidence arena for AI-generated interpretations of cyber telemetry clusters.

Core product line:

```text
AI names the pattern. Humans test the evidence.
```

Core question:

```text
Can AI prove what it claims?
```

## What It Is

Telemetry Court helps a reviewer explore a synthetic telemetry landscape, open a behavioural region as a case file, inspect evidence before seeing the AI label, compare candidate interpretations, identify weak evidence or outlier sessions, and issue a structured verdict.

The product treats an AI-generated label as a testable claim, not a finished answer.

## Current Vertical Slice

The app is a frontend prototype using local synthetic data. The current Evidence Arena slice includes:

- A telemetry landscape with five behavioural regions.
- Case files with cluster context, top features, risk flags, nearest neighbour, claims, and representative sessions.
- Blind investigation choices before the AI label is revealed.
- AI label reveal with agreement/disagreement feedback.
- Evidence cards classifiable as supports, weak support, irrelevant/noise, contradicts, or needs context.
- Label duel across baseline AI, evidence-constrained AI, human-style, and uncertainty-preserving labels.
- Find-the-impostor session selection with seeded outlier explanations.
- Structured verdict options and failure-mode chips.
- Review JSON preview, copy, and download actions.

No typed text is required for the happy path. Optional expert notes may be added later, but structured choices are the primary interaction model.

## Synthetic Cases

The bundled fixture data covers five demo scenarios:

1. AI overclaims suspiciousness: suspicious IAM privilege escalation vs routine IAM role provisioning.
2. Supported suspicious behaviour: encoded PowerShell with external communication.
3. Cluster is impure: Windows service update activity with outlier sessions.
4. Label is too broad: cloud administration activity vs S3 bucket enumeration after role assumption.
5. Correct uncertainty: possible credential access preparation with insufficient proof for a stronger claim.

The repo must not contain real restricted telemetry, secrets, customer data, or incident claims.

## Relationship To Toponymy

[Toponymy](https://github.com/TutteInstitute/toponymy) is useful upstream inspiration for cluster naming workflows. The official `TutteInstitute/toponymy` GitHub repository is the source of truth for factual Toponymy details in this repo.

Telemetry Court starts downstream of clustering and naming. It evaluates whether generated names and explanations are supported by evidence packets. The MVP does not depend on Toponymy, Python services, databases, authentication, or live telemetry ingestion.

Do not treat DeepWiki, generated summaries, or other third-party pages as authoritative. See [docs/TOPONYMY_NOTES.md](./docs/TOPONYMY_NOTES.md).

## Development Philosophy

- Evidence first: every generated claim should be inspectable against evidence or explicitly show missing evidence.
- Structured-choice first: do not require typing for the main workflow.
- Calm review flow: this is not a SIEM, SOC dashboard, chatbot wrapper, or cyberpunk visualization.
- Small diffs: prefer focused, reviewable changes.
- Synthetic data only until a safe import boundary is explicitly scoped.
- Frontend first: use TypeScript, Next.js App Router, Tailwind, and static data for the current MVP.

For product direction, see [docs/PRODUCT_VISION.md](./docs/PRODUCT_VISION.md). For UI guidance, see [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) and [docs/DESIGN_DIRECTION.md](./docs/DESIGN_DIRECTION.md).

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

- [docs/PRODUCT_VISION.md](./docs/PRODUCT_VISION.md)
- [docs/PROJECT_CONTEXT.md](./docs/PROJECT_CONTEXT.md)
- [docs/PRODUCT_DECISIONS.md](./docs/PRODUCT_DECISIONS.md)
- [docs/ROADMAP.md](./docs/ROADMAP.md)
- [docs/GITHUB_PLANNING.md](./docs/GITHUB_PLANNING.md)
- [docs/DEVELOPMENT_WORKFLOW.md](./docs/DEVELOPMENT_WORKFLOW.md)
- [docs/COMMIT_GUIDELINES.md](./docs/COMMIT_GUIDELINES.md)
- [AGENTS.md](./AGENTS.md)

## For AI Agents

Before editing, read [AGENTS.md](./AGENTS.md), [docs/PRODUCT_VISION.md](./docs/PRODUCT_VISION.md), [docs/PROJECT_CONTEXT.md](./docs/PROJECT_CONTEXT.md), and [docs/PRODUCT_DECISIONS.md](./docs/PRODUCT_DECISIONS.md). Before UI or styling work, also read [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md).

Agent work should preserve the Evidence Arena identity: Telemetry Court is where AI-generated telemetry interpretations are tested against evidence through structured human judgment.

## License

MIT. See [LICENSE](./LICENSE).
