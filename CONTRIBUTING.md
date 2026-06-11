# Contributing

Thanks for your interest in Telemetry Court.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Run quality checks before opening a pull request:

```bash
npm run lint
npm run build
```

## Coding Standards

- Keep the project frontend-only unless a change is explicitly scoped otherwise.
- Preserve TypeScript strictness.
- Keep all demo data synthetic and sanitized.
- Favor calm, premium product UI over dashboard-heavy styling.
- Avoid unnecessary dependencies.

## Pull Requests

- Keep PRs focused and easy to review.
- Include a short description of the user-facing change.
- Mention any design or product rationale when relevant.
- Confirm that `npm run lint` and `npm run build` pass locally.
