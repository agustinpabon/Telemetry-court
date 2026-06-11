# Product Decisions

This is the initial decision log for Telemetry Court. Add new entries when product direction, architecture, or evidence-model assumptions change.

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
