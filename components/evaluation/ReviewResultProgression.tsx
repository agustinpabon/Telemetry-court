type ReviewResultProgressionProps = {
  variant: "receipt" | "results";
};

const progressionSteps = [
  {
    label: "Export ReviewResult JSON",
    detail:
      "One reviewer records verdict, evidence ratings, failure modes, and action.",
  },
  {
    label: "Import on /results",
    detail:
      "Bring one or more local ReviewResult files into the results page.",
  },
  {
    label: "Group compatible reviews",
    detail:
      "The app groups matching package / case / cluster references and protocol only.",
  },
  {
    label: "Generate EvaluationReport metrics",
    detail:
      "Existing local aggregation rolls individual reviews into verdict, evidence, agreement, and refinement outputs.",
  },
] as const;

export function ReviewResultProgression({
  variant,
}: ReviewResultProgressionProps) {
  const content = <ReviewResultProgressionContent variant={variant} />;

  if (variant === "receipt") {
    return (
      <details
        className="review-result-progression is-receipt"
        aria-label="ReviewResult to EvaluationReport progression"
      >
        <summary>After export: import on /results for aggregate metrics</summary>
        {content}
      </details>
    );
  }

  return (
    <section
      className="review-result-progression is-results"
      aria-labelledby="review-result-progression-title"
    >
      <div className="review-result-progression-heading">
        <p className="eyebrow">Local loop</p>
        <h3 id="review-result-progression-title">
          ReviewResult to EvaluationReport
        </h3>
      </div>
      {content}
    </section>
  );
}

function ReviewResultProgressionContent({
  variant,
}: ReviewResultProgressionProps) {
  return (
    <>
      <p className="review-result-progression-lead">
        {variant === "results"
          ? "Individual reviews roll up into multi-reviewer EvaluationReport-style metrics only after compatible ReviewResults are grouped."
          : "A ReviewResult is one reviewer's structured judgment, not the final aggregate report."}
      </p>
      <ol className="review-result-progression-steps">
        {progressionSteps.map((step) => (
          <li key={step.label}>
            <strong>{step.label}</strong>
            <span>{step.detail}</span>
          </li>
        ))}
      </ol>
      <p className="review-result-progression-local">
        Local-file workflow only: no backend, auth, database, server-side
        persistence, or cloud sync.
      </p>
    </>
  );
}
