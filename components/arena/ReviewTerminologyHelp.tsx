const reviewTermDefinitions = {
  case_package: {
    label: "CasePackage",
    definition:
      "The versioned cluster, AI interpretation, and evidence under review.",
  },
  cluster: {
    label: "Cluster",
    definition: "A group of similar telemetry sessions produced upstream.",
  },
  claim: {
    label: "Claim",
    definition: "A specific statement made by the AI label or explanation.",
  },
  evidence: {
    label: "Evidence",
    definition:
      "A reviewable item used to support, weaken, or contextualize a claim.",
  },
  ai_label: {
    label: "AI label",
    definition: "The generated name or interpretation being tested.",
  },
  blind_assessment: {
    label: "Blind assessment",
    definition:
      "Your evidence-based interpretation recorded before the AI label is shown.",
  },
  representative_session: {
    label: "Representative session",
    definition:
      "A selected session that shows typical or boundary behavior in the cluster.",
  },
  outlier_impostor: {
    label: "Outlier / impostor",
    definition: "A session that may not fit the rest of the cluster.",
  },
  verdict: {
    label: "Verdict",
    definition:
      "The final structured judgment about support, uncertainty, and cluster fit.",
  },
  split: {
    label: "Split",
    definition: "Separate a mixed cluster into more coherent groups upstream.",
  },
  merge: {
    label: "Merge",
    definition:
      "Combine this cluster with a compatible neighboring cluster upstream.",
  },
  review_result: {
    label: "ReviewResult",
    definition:
      "The versioned export of one reviewer’s structured decisions for one CasePackage.",
  },
} as const;

export type ReviewTerm = keyof typeof reviewTermDefinitions;

export type AdditionalReviewTermDefinition = {
  label: string;
  definition: string;
};

type ReviewTerminologyHelpProps = {
  terms: readonly ReviewTerm[];
  summary?: string;
  additionalDefinitions?: readonly AdditionalReviewTermDefinition[];
};

export function ReviewTerminologyHelp({
  terms,
  summary = "Terms in this step",
  additionalDefinitions = [],
}: ReviewTerminologyHelpProps) {
  const entries = [
    ...[...new Set(terms)].map((term) => reviewTermDefinitions[term]),
    ...additionalDefinitions,
  ];
  const uniqueEntries = entries.filter(
    (entry, index) =>
      entries.findIndex((candidate) => candidate.label === entry.label) === index,
  );

  if (uniqueEntries.length === 0) {
    return null;
  }

  return (
    <details className="review-terminology-help">
      <summary>{summary}</summary>
      <dl>
        {uniqueEntries.map((entry) => (
          <div key={entry.label}>
            <dt>{entry.label}</dt>
            <dd>{entry.definition}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
