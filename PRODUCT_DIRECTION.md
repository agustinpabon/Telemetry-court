# Telemetry Court Product And Design Direction

## Product Direction

Telemetry Court is a validation bench for AI-generated telemetry cluster interpretations. The interface exists to help reviewers test claims against evidence and produce structured evaluation output.

```text
AI names the cluster. Humans test the evidence.
```

The current landscape, case file, evidence board, label duel, impostor review, and verdict screens are useful review mechanisms. They are subordinate to the validation purpose and must not turn the product into a game, generic investigation environment, or visual demo.

## Desired Feel

- calm;
- premium;
- sparse;
- trustworthy;
- evidence-first;
- serious;
- readable by non-builders;
- interactive without becoming theatrical.

Use broad principles of clarity, spacing, restraint, hierarchy, and trust. Do not copy protected layouts, assets, icons, illustrations, slogans, screenshots, imagery, or exact patterns.

## Design Principle

```text
Evidence first, ornament last.
```

## Visual Direction

Use warm neutral surfaces, restrained borders and shadows, readable typography, calm semantic accents, generous whitespace, and structured-choice controls.

Avoid cyberpunk, hacker styling, neon green, fake terminals, red-alert overload, dense SOC dashboards, decorative telemetry walls, courtroom theater, and generic AI-wrapper layouts.

## Information Hierarchy

1. Case package and cluster context.
2. Evidence visible before AI-label reveal.
3. AI-generated interpretation and explicit claims.
4. Evidence-to-claim classifications.
5. Candidate-label comparison.
6. Cluster purity and outlier review.
7. Failure modes and uncertainty.
8. Structured verdict and `ReviewResult` export.
9. Aggregated `EvaluationReport` when available.

## Ten-Second Rule

A reviewer should understand which case is under review, whether the AI label is hidden or revealed, what evidence is available, which claims it supports or weakens, and what action comes next.

## Language

Prefer validation bench, case package, evidence item, claim support, blind review, label comparison, outlier review, structured verdict, review result, and evaluation report.

Existing UI names such as Evidence Board, Label Duel, and Find the Impostor may remain when their controls are serious and unambiguous. Do not use game, player, score, win, jury spectacle, command center, autonomous detection, or threat brain as product framing.

## Review Behavior

The reviewer should never have to guess which evidence supports which claim, why a metric exists, whether evidence or provenance is missing, whether the cluster appears mixed, whether the label overclaims, what data is exported, or whether a capability is only a future target.
