# Product

## Register

product

## Users

Telemetry Court is for researchers, analysts, reviewers, and workshop participants who need to evaluate whether an AI-generated interpretation of telemetry clusters is grounded in evidence. They are working in a structured review context, usually with synthetic, sanitized, or approved demo cases, and they need to test claims without reading huge raw logs or writing labels from scratch.

## Product Purpose

Telemetry Court is an interactive evidence arena for AI-generated interpretations of cyber telemetry clusters. Its purpose is to make generated labels testable: the AI names the pattern, then humans inspect the evidence, classify support, compare candidate labels, identify impurity or outliers, and issue a structured verdict that can be exported as review data.

Success means a reviewer can move through the full workflow without typed input: telemetry landscape, behavioural region or case file, blind investigation, AI label reveal, evidence classification, label duel, impostor selection, structured verdict, and review JSON export. The product should expose unsupported certainty, preserve useful uncertainty, and make every claim inspectable.

## Brand Personality

Calm, scientific, trustworthy. The interface should feel premium, restrained, spatial, and evidence-first without becoming decorative or dramatic. Copy should be plainspoken, analyst-friendly, precise, and transparent about uncertainty.

The experience should feel like a calm scientific instrument for judging claims, not a threat wall. It can be interactive and spatial, but it must remain serious and focused on evidence inspection.

## Anti-references

Telemetry Court must not look or behave like a generic AI chatbot, SIEM replacement, SOC dashboard, threat-intelligence dashboard, attack detector, cyberpunk visualization, fake terminal, hacker interface, or neon telemetry wall.

Do not use Matrix green, alarmist security styling, dense dashboard grids, generic AI sparkle visuals, decorative cyber gradients, or required free-text fields in the main workflow. Do not copy Wealthsimple, Apple, Linear, or any other brand's protected assets, slogans, exact layouts, icons, imagery, screenshots, or proprietary visual identity.

Do not invent evidence, telemetry fields, Toponymy APIs, real incident claims, customer data, or restricted telemetry. Local sample data must remain synthetic, safe, and clearly scoped.

## Design Principles

- Evidence before assertion: show behavioural context and evidence before asking the reviewer to accept an AI label.
- Structured judgment over open-ended guessing: use selectable choices, chips, cards, and verdict controls for the happy path.
- Every claim is inspectable: generated claims must link to evidence or explicitly state when evidence is missing.
- Uncertainty is product signal: distinguish supported, weakly supported, contradicted, unsupported, overclaimed, impure, and uncertain states.
- Calm hierarchy earns trust: use spacious, restrained product UI where semantic color clarifies evidence state rather than decorating the surface.

## Accessibility & Inclusion

Use WCAG AA as the baseline for visual contrast and interaction design unless a future product decision raises the bar. Main workflow controls must be keyboard accessible and must not rely on color alone. Evidence relationships, scores, verdicts, and risk states need text equivalents.

Support visible focus states, reduced motion, readable type, responsive layouts, and structured choices that remain usable for reviewers who are color-blind, motion-sensitive, or navigating without a pointer. Free text may exist later as optional expert input, but it must not block review completion.
