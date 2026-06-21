# Verdict And Failure-Mode Semantics

This document defines the evaluation meaning of the canonical
`CasePackage v0.1` and `ReviewResult v0.1` final-verdict values:

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

These values are structured human judgments. They are not automated scores,
clustering actions, or live AI-evaluation results. A `ReviewResultV01` records
one reviewer's selected `final_verdict`; an `EvaluationReportV01` preserves the
distribution of those selections across compatible reviewers.

The current UI compatibility enum still uses the legacy
`unsupported_overclaimed` value internally. The export boundary translates it
to the canonical `unsupported_or_overclaimed` value before serializing
`ReviewResultV01`.

## Shared Distinctions

- Missing evidence means the package does not provide enough linked,
  reviewable evidence for a claim. Missing evidence does not prove the claim is
  false.
- Contradictory evidence means reviewed evidence materially undercuts a claim
  or supports an incompatible interpretation.
- Uncertain evidence means the reviewer cannot responsibly choose a stronger
  support, rejection, evidence-quality, or cluster-quality verdict from the
  available package. Uncertainty is preserved as a result, not repaired by
  forcing consensus.
- Cluster-quality verdicts describe the reviewed cluster composition, not the
  truth of every label claim.
- Split and merge verdicts are human recommendations for upstream review. They
  do not automatically mutate clusters or define exact cluster boundaries.

## Canonical Verdict Semantics

| Value | Evidence condition | Missing, contradictory, and uncertain distinction | Primary evaluation concept | EvaluationReport contribution | Must not infer |
| --- | --- | --- | --- | --- | --- |
| `supported` | The core label or explanation claims are directly supported by linked evidence, with no material unresolved contradiction and enough coverage for the claimed scope. | Ancillary missing context can remain, but the core claim set is covered. Material contradiction should move the verdict away from `supported`. This is stronger than uncertainty because the reviewer can identify sufficient positive support. | Label quality and evidence sufficiency. It can imply reviewer confidence in this label for this package, but it is not a numeric confidence score. | Counts in `verdict_distribution.supported`; may be used as the numerator for a label support rate with an explicit denominator and calculation version. Usually aligns with `accept_label` when the derived action is used. | Do not infer that the label is optimal, complete, risk-free, or proven for future data. Do not infer that the cluster is pure unless cluster quality was also reviewed. Do not generalize one supported review to model, prompt, or embedding quality. |
| `partially_supported` | A defensible part of the label is supported, but important scope, certainty, intent, attribution, or subgroup claims are weak, missing, or over-specific. | Missing or weak evidence affects part of the claim. Contradiction may narrow the supported scope without invalidating the whole interpretation. If the reviewer cannot isolate a supported core, use `uncertain` or a stronger negative verdict instead. | Label quality and evidence sufficiency, especially label scope. | Counts in `verdict_distribution.partially_supported`; may contribute to partial-support and overclaim analyses. Often suggests label narrowing or caveat work rather than acceptance. | Do not infer full acceptance, full rejection, or that unsupported portions are false. Do not infer that narrowing can be automated without reviewing the specific supported and unsupported claim links. |
| `unsupported_or_overclaimed` | The label or explanation is not supported by the reviewed evidence, or it asserts more intent, certainty, attribution, risk, or scope than the evidence can justify. | Missing evidence means the claim is unproven. Contradictory evidence means the package contains evidence against the claim. Both can justify this verdict when they materially affect the label. If the package only lacks enough evidence to judge, use `needs_better_evidence`; if evidence is genuinely balanced or ambiguous, use `uncertain`. | Label quality and evidence sufficiency; often a prompt or label-generation failure signal. | Counts in `verdict_distribution.unsupported_or_overclaimed`; may contribute to unsupported-claim and overclaim rates. Derived actions commonly route to label rename, prompt rerun, or evidence review, depending on the selected reason codes. | Do not infer benignness, safety, absence of the behavior, or that the cluster is bad. Do not infer whether the failure came from the model, prompt, embedding, or evidence extraction without additional metadata and review. |
| `uncertain` | The reviewer cannot responsibly select a stronger verdict because evidence is balanced, ambiguous, sparse in a non-decisive way, context-dependent, or in tension across claims. | Use this when neither missing evidence nor contradictory evidence dominates the judgment. If evidence is plainly insufficient as a package-quality problem, use `needs_better_evidence`. If contradiction clearly undercuts the label, use `unsupported_or_overclaimed`. | Reviewer confidence and uncertainty preservation. It may also surface package or cluster ambiguity, but it does not specify the cause alone. | Counts in `verdict_distribution.uncertain`; may contribute to uncertainty rate and reviewer-disagreement analysis. Derived actions may mark uncertain or collect more evidence. | Do not infer indecision, reviewer error, label failure, or consensus. Do not collapse uncertainty into support or rejection during aggregation. |
| `cluster_impure` | Evidence shows the reviewed cluster contains materially different behavior families, outliers, or subgroups that weaken a single label interpretation. | Missing evidence alone is not impurity. Contradictory evidence can indicate impurity when it is tied to identifiable subsets or outliers. If composition is merely unclear, use `uncertain` or `needs_better_evidence`. | Cluster quality. It can inform embedding, clustering, or package-construction evaluation more than label wording alone. | Counts in `verdict_distribution.cluster_impure`; may contribute to cluster impurity rate and cluster-quality follow-up. Related reason codes such as `cluster_seems_mixed` may appear in `failure_mode_counts`. | Do not infer that the label is wrong for every subgroup, that a split is automatically required, or that any session is malicious or operationally important. |
| `needs_split` | The reviewer recommends separating coherent subgroups because one cluster appears to contain multiple reviewable patterns that need distinct labels, evidence, or evaluation. | Missing evidence alone should point to `needs_better_evidence`. Contradiction supports `needs_split` only when it reflects coherent subgroups rather than a single bad claim. If subgroup boundaries are unclear, preserve uncertainty. | Cluster quality and human split recommendation. | Counts in `verdict_distribution.needs_split`; may contribute to split recommendation rate and the `split_cluster` recommended-action distribution. It can inform embedding or clustering evaluation. | Do not infer that Telemetry Court will split the cluster, that the exact number of clusters is known, or that the clustering algorithm is solely responsible. Split is a recommendation for upstream review. |
| `needs_merge` | The reviewer recommends merging this cluster with another cluster or neighbor because the evidence suggests artificial fragmentation of one coherent behavior. | Missing evidence alone is not a merge signal. Contradictory evidence may show the compared neighbor is wrong rather than that a merge is needed. If neighbor evidence is weak or unavailable, use `uncertain` or `needs_better_evidence`. | Cluster quality, neighborhood quality, and human merge recommendation. | Counts in `verdict_distribution.needs_merge`; may contribute to merge recommendation rate and the `merge_cluster` recommended-action distribution. It can inform embedding, dimensionality-reduction, or clustering evaluation. | Do not infer the exact merge target, automatic merge execution, or that a merged cluster's future label is already validated. |
| `needs_better_evidence` | The package lacks enough relevant, linked, provenance-bearing, or safe evidence for a fair verdict on the generated interpretation. Evidence may be missing, irrelevant, too thin, poorly linked, or require more context. | Missing or insufficient evidence is the dominant condition. Contradictory evidence may exist but cannot be trusted enough to decide. If enough evidence exists to reject the label, use `unsupported_or_overclaimed`; if enough exists to preserve ambiguity, use `uncertain`. | Evidence sufficiency and evidence-extraction/package quality. | Counts in `verdict_distribution.needs_better_evidence`; may contribute to evidence sufficiency gap metrics and `collect_more_evidence` recommended-action distribution. Evidence ratings such as `insufficient` and `needs_more_context` should remain traceable. | Do not infer the label is false, the cluster is impure, the reviewer failed, or raw telemetry should be exposed. The right follow-up may be better extraction, provenance, sanitization, or claim-evidence linking. |

## Failure-Mode Reason Codes

`ReviewResultV01.decisions.failure_modes` currently stores structured reason
codes from the label-comparison and verdict UI. These reason codes explain why
a reviewer chose a verdict; they do not replace `final_verdict`.

`EvaluationReportV01.failure_mode_counts` counts selected reason codes as
qualitative frequencies. Those counts are useful for diagnosis, but they are
not scores and they do not adjudicate the correct verdict.

| Reason code | Evaluation concept | Typical implication | Must not infer |
| --- | --- | --- | --- |
| `better_supported` | Label comparison | A different candidate label appeared better grounded in the evidence. | The selected label is globally correct or all rejected labels are false. |
| `less_overclaimed` | Label or prompt quality | A candidate avoided unsupported intent, attribution, risk, certainty, or scope. | The underlying behavior is benign or low risk. |
| `more_specific` | Label specificity | A candidate better matched the observed behavior granularity. | More specific is always better; specificity must still be evidence-grounded. |
| `too_broad` | Label scope | A label hid important distinctions or collapsed subpatterns. | The cluster necessarily needs a split without subgroup evidence. |
| `missing_evidence` | Evidence sufficiency | Required evidence for a claim, scope, or action was absent or not linked. | The claim is false or contradicted. |
| `missing_malicious_intent` | Evidence sufficiency and overclaim risk | A label implied malicious intent that the package did not substantiate. | The activity is benign or authorized. |
| `missing_downstream_abuse` | Evidence sufficiency and overclaim risk | A label implied impact or abuse that the package did not substantiate. | Downstream abuse did not happen outside the reviewed package. |
| `preserves_uncertainty` | Reviewer confidence and label comparison | A candidate label better retained uncertainty that the evidence could not resolve. | The reviewer was unable to decide or that uncertainty should be converted into a negative score. |
| `cluster_seems_mixed` | Cluster quality | Evidence suggested multiple behavior families, outliers, or subgroup stories. | Telemetry Court should automatically split or merge the cluster. |

## Aggregation Rules

Reviewer disagreement must be preserved. Each compatible `ReviewResultV01`
contributes one verdict to the aggregate distribution, and the report keeps
source review IDs so reviewers can be audited independently.

An `EvaluationReportV01` may show multiple verdicts for the same package. That
is a signal, not a defect. The current aggregation utility reports count
distributions and disagreement flags; it does not pick a consensus winner,
calculate statistical agreement, or convert verdicts into an automated score.

Named rates such as label support rate, overclaim rate, uncertainty rate,
cluster impurity rate, split recommendation rate, merge recommendation rate,
and evidence sufficiency gap rate must define:

- the included schema versions;
- the numerator values;
- the denominator;
- how incomplete reviews are handled;
- the calculation version.

If those inputs are unavailable, the metric should be unavailable rather than
invented.

## Pipeline Evaluation Implications

- Label evaluation should use verdict distributions, label winner
  distributions, evidence ratings, and source review IDs together. One verdict
  does not prove a label family is generally good or bad.
- Prompt or model evaluation can compare compatible reports across prompt,
  model, and run metadata, but it must not attribute a failure to a prompt or
  model without checking evidence sufficiency, cluster quality, and package
  provenance.
- Embedding and clustering evaluation should treat `cluster_impure`,
  `needs_split`, and `needs_merge` as human review signals for upstream
  analysis, not as automatic clustering operations.
- Evidence-extraction evaluation should focus on `needs_better_evidence`,
  `insufficient`, `needs_more_context`, missing-evidence declarations, broken
  links, provenance gaps, and disagreement on evidence ratings.
- Claim and label refinement should inspect which claims were supported,
  weakly supported, contradicted, or left without enough context before
  rewriting a label or rerunning a prompt.

## Repository Vocabulary Audit

The current repository vocabulary is compatible with these semantics:

- `CASE_PACKAGE_V01_VERDICTS` and `REVIEW_RESULT_V01_VERDICTS` contain the
  canonical final-verdict values listed above.
- The current UI `FinalVerdict` type uses `unsupported_overclaimed`; the
  `ReviewResultV01` exporter maps it to `unsupported_or_overclaimed`.
- Synthetic sample-case `failureModes` are reason-code chips, not canonical
  final-verdict values.
- `EvaluationReportV01` currently preserves verdict distributions,
  recommended-action distributions, evidence-rating distributions,
  failure-mode counts, and disagreement flags without forcing consensus.
