# Reviewer Rubric

## Purpose

Telemetry Court is an evidence-based human-in-the-loop validation bench for
AI-generated telemetry cluster interpretations.

Core line:

```text
AI names the cluster. Humans test the evidence.
```

One `ReviewResult v0.1` is one reviewer's structured judgment for one
`CasePackage v0.1`. Compatible `ReviewResult` artifacts from multiple
reviewers can be aggregated into an `EvaluationReport v0.1`.

This rubric exists so reviewers can produce comparable structured judgments
without inventing new values, inferring hidden information, or forcing
certainty the evidence does not support.

## Reviewer Job

The review question is:

```text
Given a telemetry cluster and an AI-generated label or explanation,
is that interpretation actually supported by the evidence?
```

The reviewer is not doing live alert triage, operational response, or raw log
analysis. The reviewer is judging whether the provided `CasePackage` supports
the generated interpretation.

Reviewers should:

- stay inside the evidence and references provided by the package;
- preserve uncertainty honestly;
- avoid filling gaps with outside assumptions;
- choose the strongest supported structured judgment, not the most dramatic
  story.

## Blind Review

Blind review comes before AI reveal.

- Make the initial assessment before seeing the AI label.
- The purpose is to reduce anchoring bias from a plausible-sounding label.
- Do not try to infer the hidden AI label from tone, package shape, or likely
  upstream behavior.
- Judge only what the visible evidence supports at that stage.

The blind step is successful when the reviewer records an honest first
evidence-based interpretation before the AI label can steer the judgment.

## Evidence Ratings

Use the canonical evidence-rating values exactly as defined by the contract:

```text
supports
weak_support
irrelevant
contradicts
insufficient
needs_more_context
```

Apply them consistently:

- `supports`: The evidence directly supports the reviewed claim.
- `weak_support`: The evidence points in the same direction but is incomplete,
  indirect, or too thin to carry the claim on its own.
- `irrelevant`: The evidence may be real but does not help judge the claim.
- `contradicts`: The evidence materially undercuts the claim or supports an
  incompatible interpretation.
- `insufficient`: The package does not provide enough relevant linked evidence
  to judge the claim fairly.
- `needs_more_context`: The reviewer cannot responsibly judge from the
  provided package because needed context is missing from the review packet.

Important distinctions:

- Missing evidence is not the same as contradiction.
- `insufficient` means the evidence packet is too thin.
- `needs_more_context` means the reviewer cannot judge from the provided
  package context.
- Uncertainty is acceptable and should be recorded honestly rather than hidden.

## Label Comparison

Label comparison asks which candidate label is best supported by the evidence,
not which label sounds most polished.

When comparing labels:

- prefer the label with the strongest evidence grounding;
- prefer the label that makes the fewest unsupported claims;
- prefer the label whose scope matches the evidence;
- avoid rewarding specificity when the evidence does not support it;
- avoid accepting a broad label that hides meaningful differences inside the
  cluster.

Use the current structured reason-code vocabulary when it helps explain the
choice:

```text
better_supported
less_overclaimed
more_specific
too_broad
missing_evidence
missing_malicious_intent
missing_downstream_abuse
preserves_uncertainty
cluster_seems_mixed
```

Consistent interpretation:

- Over-broad labels should usually push toward `too_broad`,
  `better_supported`, or a narrower final verdict/action later.
- Over-specific labels should only win when the evidence supports that extra
  specificity.
- Unsupported intent or abuse claims should use
  `missing_malicious_intent`, `missing_downstream_abuse`, or
  `less_overclaimed` rather than reviewer intuition.
- When a label better preserves unresolved ambiguity, use
  `preserves_uncertainty`.

## Outlier Or Impostor Choice

The outlier or impostor step helps test cluster coherence.

- Choose the session that most weakens a single coherent interpretation.
- Prefer sessions that suggest a different behavior family, subgroup, or
  neighboring cluster story.
- Do not treat a merely unusual example as an impostor unless it materially
  weakens the cluster interpretation.

This step is about cluster coherence, not operational severity.

## Confidence

`ReviewResultV01` allows optional reviewer confidence:

```text
low
medium
high
```

Confidence should reflect evidential certainty, not reviewer seniority,
confidence in the upstream model, or personal vibes.

- `low`: The reviewer can record a judgment, but major ambiguity or thin
  evidence remains.
- `medium`: The reviewer sees a defensible answer, but important uncertainty
  remains.
- `high`: The reviewer sees strong, well-linked evidence for the judgment.

Current repository note:

- The v0.1 contract supports optional confidence.
- The current local export flow does not capture or emit
  `decisions.confidence`.

Review protocols may still use this scale in notes or future compatible
capture, but reviewers should not invent confidence data in the current export.

## Failure Modes

`failure_modes` is multi-select. Choose the smallest set of reason codes that
materially explains the verdict. Do not select every plausible code.

Use the current code set exactly:

```text
better_supported
less_overclaimed
more_specific
too_broad
missing_evidence
missing_malicious_intent
missing_downstream_abuse
preserves_uncertainty
cluster_seems_mixed
```

Consistency guide:

- Overclaim: use `less_overclaimed`, and use the more specific missing-claim
  codes when the label asserts unsupported intent or downstream abuse.
- Missing baseline or context, weak evidence coverage, or thin claim support:
  use `missing_evidence`.
- Cluster impurity or subgroup contamination: use `cluster_seems_mixed`.
- Unsupported causal or intent claims: use `missing_malicious_intent`,
  `missing_downstream_abuse`, or `less_overclaimed` depending on what was
  overstated.
- Nearest-neighbor confusion has no dedicated code. If it shows the cluster is
  mixed, use `cluster_seems_mixed`. If it shows another label is better
  grounded, use `better_supported`. Do not invent a new code.
- Preserved uncertainty: use `preserves_uncertainty` when the evidence cannot
  resolve the ambiguity responsibly.

## Final Verdict

Use the canonical verdict values exactly:

```text
supported
partially_supported
unsupported_or_overclaimed
uncertain
cluster_impure
needs_split
needs_merge
needs_better_evidence
```

Guidance:

- `supported`: The core interpretation is directly supported by enough linked
  evidence, without material unresolved contradiction.
- `partially_supported`: Some core of the interpretation is defensible, but
  important scope, certainty, or subgroup claims are too strong.
- `unsupported_or_overclaimed`: The interpretation is not supported, or it
  claims more certainty, intent, attribution, impact, or scope than the
  evidence justifies.
- `uncertain`: The reviewer cannot responsibly choose a stronger verdict.
- `cluster_impure`: The cluster appears to contain materially different
  behavior families or subgroup stories.
- `needs_split`: The cluster should likely be separated into coherent
  subgroups.
- `needs_merge`: The cluster appears artificially fragmented from a coherent
  neighbor.
- `needs_better_evidence`: The package does not provide enough relevant,
  linked, reviewable evidence for a fair judgment.

Repository detail:

- The current UI compatibility state still uses legacy
  `unsupported_overclaimed` internally.
- The export boundary serializes the canonical
  `unsupported_or_overclaimed` value in `ReviewResultV01`.

## Recommended Action

The canonical recommended-action values are:

```text
accept_label
rename_label
broaden_label
narrow_label
split_cluster
merge_cluster
collect_more_evidence
rerun_prompt
rerun_embedding
mark_uncertain
```

Current repository note:

- `ReviewResultV01` supports these canonical action values.
- The current local exporter derives `recommended_action` from the final
  verdict rather than collecting a separate independent action choice.

Reviewers should still understand the intended meaning:

- `accept_label`: The current label is defensible as reviewed.
- `rename_label`: The current label should be replaced because it is
  unsupported or overclaimed.
- `broaden_label`: The current label is too narrow for the supported evidence.
- `narrow_label`: The current label needs tighter scope to match supported
  evidence.
- `split_cluster`: The cluster likely contains multiple behavior families.
- `merge_cluster`: The cluster likely belongs with a neighboring cluster.
- `collect_more_evidence`: The package needs stronger or better-linked
  evidence.
- `rerun_prompt`: The label-generation prompt likely needs improvement.
- `rerun_embedding`: The embedding or clustering setup may need upstream
  reconsideration.
- `mark_uncertain`: The responsible outcome is to preserve uncertainty.

## ReviewResult And EvaluationReport

Keep these artifacts distinct:

- A `ReviewResult` is one reviewer's structured judgment for one
  `CasePackage`.
- An `EvaluationReport` aggregates compatible `ReviewResult` artifacts from
  multiple reviewers of the same compatible package and protocol.

Do not treat one review as consensus.

Reviewer disagreement is a useful signal. It should remain visible rather than
being smoothed away.

## Quick Consistency Checks

Before finishing a review, ask:

- Did I make the initial assessment before AI reveal?
- Did I rate the evidence based on what it shows, not what I expected?
- Did I keep missing evidence separate from contradiction?
- Did I preserve uncertainty where the package could not support certainty?
- Did I choose the label best supported by evidence rather than the most
  polished label?
- Did I use only repository-defined values and reason codes?
- Does my verdict reflect the evidence, cluster quality, or evidence quality
  problem I actually observed?

If the answer to any of those is no, revise the structured judgment before the
review is exported or aggregated.
