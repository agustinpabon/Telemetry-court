# Product Decisions

This is the initial decision log for Telemetry Court. Add new entries when product direction, architecture, or evidence-model assumptions change.

## 2026-06-28: AI Assistance Requests Pass Deterministic Guardrails

Decision: Any future AI assistance request must pass a deterministic guardrail
helper before it can produce or retrieve assistance output. The helper accepts
only fixed `AI_ASSISTANCE_QUESTION_SET_V01` question IDs plus explicit
CasePackage references and returns bounded `allowed`, `unavailable`, or
`refused` states with stable reason codes.

Rationale: The product boundary rejects chat-first workflows, generic
cybersecurity advice, SOC or alert triage, remediation, operational
investigation, raw telemetry lookup, and external lookup behavior. A reusable
guardrail layer makes the safe path easy for future code and makes generic
chatbot behavior a deliberate bypass rather than an accidental default.

Consequences:

- Future UI must show fixed evidence-question buttons, menus, or selectors and
  must not include a blank chatbot prompt box or arbitrary prompt submission.
- Unsupported, missing-context, unknown-reference, free-form, generic chatbot,
  operational, and external-lookup requests produce bounded unavailable or
  refused states before any response artifact or model execution exists.
- The helper reuses the existing AI assistance refused answer path when a
  response artifact is needed; it does not create a parallel chatbot schema.
- Assistance remains secondary to structured human review. Metadata can be
  recorded when assistance is used, but this decision does not change
  `EvaluationReport` aggregation.
- This does not add UI, live AI calls, prompt execution, provider integration,
  persistence, raw telemetry ingestion, Toponymy/ACME4 execution, SOC triage,
  alert triage, incident response, remediation, or reviewer-pilot work.

## 2026-06-28: AI Assistance Uses Fixed Cross-Examination Questions

Decision: Evidence-constrained AI assistance may only answer a predefined
question set focused on claim support, evidence sufficiency, contradiction,
uncertainty, missing evidence, overclaim detection, cluster impurity, and
unavailable/refusal behavior.

Rationale: AI assistance should help reviewers cross-examine a `CasePackage`
without turning Telemetry Court into a generic chatbot, SOC triage surface, raw
telemetry investigation tool, or remediation assistant.

Consequences:

- Future assistance affordances must select from
  `AI_ASSISTANCE_QUESTION_SET_V01` rather than accept arbitrary reviewer text.
- Substantive successful answers must remain grounded in stable evidence IDs.
- In-scope questions with inadequate package evidence use
  `insufficient_evidence`; out-of-scope or unsupported requests use `refused`
  or remain unavailable before a response is generated.
- This does not add UI, live AI calls, prompt execution, provider integration,
  persistence, raw telemetry ingestion, Toponymy/ACME4 execution, or
  EvaluationReport aggregation changes.

## 2026-06-21: Utility Gate Comes Before AI Assistance

Decision: A feature is useful only if it helps produce or improve an auditable
`EvaluationReport` from real or realistic `CasePackage` inputs.

Rationale: The main product risk is that Telemetry Court remains a beautiful
synthetic demo. The next proof of value is a local external-package validation
loop: import `CasePackage` JSON, validate it strictly, complete structured
reviews, persist/export/import ReviewResults, and aggregate them into an
EvaluationReport.

Consequences:

- Milestone 3 is now the active Local Utility Gate rather than a vague
  evaluation-infrastructure bucket.
- Local CasePackage import, invalid-package UI, ReviewResult bundle exchange,
  results from local/imported reviews, and an end-to-end smoke test come before
  evidence-constrained AI assistance.
- AI assistance issues stay in the roadmap, but they are later priority until
  import/results/aggregation are usable.
- Toponymy, DataMapPlot, ACME4-style, and notebook adapters remain upstream
  producers of approved `CasePackage` JSON; Telemetry Court still does not
  ingest raw restricted telemetry.
- Fast review is allowed only as evidence validation or batch validation, not
  SOC triage, incident response, remediation, or live alert handling.

## 2026-06-21: Persist ReviewResults Locally Before Backend Infrastructure

Decision: Telemetry Court's first persistence step is a browser-local
`ReviewResultV01` store keyed by CasePackage ID.

Rationale: Issue #56 needs ReviewResults to survive the immediate review
session and be retrievable for evaluation without turning the product into an
auth, database, admin, or generic CRUD project before the review/evaluation
contracts have proven their shape.

Consequences:

- The current app can save exported ReviewResult artifacts to local browser
  storage after copy/download actions.
- The local store persists only ReviewResults, not full CasePackages, evidence
  content, raw references, raw telemetry, accounts, teams, or permissions.
- Compatibility checks still reject unsupported ReviewResult, protocol, or
  CasePackage versions and incompatible package references.
- Durable server-side storage, reviewer accounts, package import, report UI,
  consensus, adjudication, and enterprise workflows remain deferred.

## 2026-06-20: Telemetry Court Realigns As A Validation Bench

Decision: Telemetry Court is an evidence-based human-in-the-loop validation bench for AI-generated telemetry cluster interpretations.

Rationale: The project risks becoming a polished static interface or generic cyber dashboard unless its backend direction is grounded in evaluation infrastructure. The useful product validates whether generated cluster labels and explanations are supported by evidence and produces structured human review data for improving upstream AI/ML pipelines.

Consequences:

- The core line is "AI names the cluster. Humans test the evidence."
- Backend work must start with a versioned `CasePackage`, `ReviewResult`, and `EvaluationReport` contract.
- Raw telemetry ingestion is not the first backend milestone.
- SIEM, SOC, EDR, alert-triage, raw-search, and generic dashboard features are out of scope.
- Review exports, reviewer agreement, and evaluation metrics are core product outputs.
- Toponymy and ACME4-style integration must use adapters that generate approved case packages.
- The current interface is a static synthetic validation slice, not proof of real-world validation value.
- The 2026-06-13 Evidence Arena decision remains relevant to the shipped interaction flow but is superseded as the product identity.

## 2026-06-13: Telemetry Court Pivots To Evidence Arena

Decision: Telemetry Court is now an interactive evidence arena, not a passive approve/reject label validator.

Rationale: The old static validation flow was useful but too form-like. The product should help users explore behavioural regions, inspect evidence before anchoring on the AI label, compare candidate interpretations, identify weak evidence or outlier sessions, and produce structured review data.

Consequences:

- `docs/PRODUCT_VISION.md` is the current product source of truth.
- The main workflow must be structured-choice first and must not require typed text.
- The vertical slice should include telemetry landscape, case file, blind investigation, AI reveal, evidence board, label duel, impostor selection, structured verdict, and JSON export.
- Old language that frames the product as only "one cluster, one claim, one evidence check" is superseded.
- The existing claim/evidence model remains useful but now sits inside a broader investigation workflow.

## 2026-06-11: Telemetry Court Validates Labels

Decision: Telemetry Court validates labels; it does not primarily generate labels.

Rationale: The core product question is whether AI can prove what it claims. Generation may happen upstream, but the product value is evidence review.

## 2026-06-11: Toponymy Is Inspiration, Not A Required Dependency

Decision: Toponymy is upstream inspiration, not a required dependency for the MVP.

Rationale: Toponymy provides useful concepts such as clusters, topic names, keyphrases, exemplars, and subtopics. The MVP should remain lightweight and not require Python services or Toponymy integration.

## 2026-06-11: MVP Starts With Static Sample Data

Decision: The MVP starts with static/sample data.

Rationale: Static synthetic data allows the team to validate the review flow without backend complexity or real telemetry handling risk.

## 2026-06-11: Evidence Checking Comes Before Map Exploration

Decision: The first UI should prioritize evidence checking over map exploration.

Rationale: Visual cluster exploration can help later, but the first product question is claim support. Reviewers need to inspect claims, evidence, scores, and verdicts before browsing maps.

## 2026-06-11: Calm Premium Style Over Cyberpunk

Decision: Use Apple / Wealthsimple style over cyberpunk or security-dashboard style.

Rationale: The product should feel trustworthy, calm, and analytical. Neon visuals, fake terminal aesthetics, and noisy dashboards would weaken the evidence-first review posture.

## 2026-06-11: Every Claim Must Be Inspectable

Decision: Every AI-generated claim must be inspectable against evidence.

Rationale: The audit flow depends on a clear path from generated claim to evidence IDs, polarity, strength, rationale, score, and analyst judgment. Unsupported or missing evidence should be visible.

## 2026-06-11: Evidence Relations Are The Canonical Claim-Evidence Link

Decision: `evidenceRelations` is the canonical source of truth for linking claims to evidence; `supportScores` should hold score information only.

Rationale: Duplicating claim-evidence links inside `supportScores` creates avoidable drift between evidence chips, evidence filtering, and support logic. A single relationship path keeps the review workflow inspectable and consistent.

## 2026-06-11: Use A High-Trust, Evidence-First Visual Language

Decision: Telemetry Court will use a calm, premium, evidence-first visual language inspired by high-trust fintech/product design principles. Wealthsimple-style research may inform restraint, spacing, hierarchy, and tone, but Telemetry Court must not copy Wealthsimple's assets, copy, identity, icons, screenshots, or exact layouts.

Rationale: The product asks analysts to judge whether AI-generated labels are supported by evidence. A calm, restrained interface supports trust and careful review better than a noisy cybersecurity dashboard.

Consequences:

- UI work must follow `docs/DESIGN_SYSTEM.md`.
- Semantic color is reserved for support state and evidence polarity.
- Visual changes should improve claim/evidence inspection.
- Agents must not add decorative cyber styling.
