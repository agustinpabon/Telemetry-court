import type { Cluster } from "@/lib/types";

type ClusterPanelProps = {
  cluster: Cluster;
};

export function ClusterPanel({ cluster }: ClusterPanelProps) {
  const hasTopFeatures = cluster.topFeatures.length > 0;
  const hasRepresentativeExamples = cluster.representativeExamples.length > 0;

  return (
    <section className="rounded-[30px] border border-[var(--color-border-soft)] bg-[var(--color-surface)]/78 p-6 shadow-[0_14px_40px_rgba(15,23,42,0.04)] sm:p-7">
      <p className="text-sm font-medium text-[var(--color-muted)]">Cluster substrate</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--color-ink)]">
        Source cluster
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
        Supporting context for the interpretation, including the cluster&apos;s composition,
        exemplars, and feature shape.
      </p>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)]/65 p-4">
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Size
          </dt>
          <dd className="mt-2 text-lg font-semibold">{cluster.size}</dd>
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)]/65 p-4">
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Density
          </dt>
          <dd className="mt-2 text-lg font-semibold">{cluster.density}</dd>
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)]/65 p-4">
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Time window
          </dt>
          <dd className="mt-2 text-sm font-semibold leading-6">{cluster.timeWindow}</dd>
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)]/65 p-4">
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Embedding source
          </dt>
          <dd className="mt-2 text-sm font-semibold leading-6">
            {cluster.embeddingSource}
          </dd>
        </div>
      </dl>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold tracking-[-0.01em]">Top features</h3>
        {hasTopFeatures ? (
          <ul className="mt-3 space-y-2">
            {cluster.topFeatures.map((feature) => (
              <li
                key={feature}
                className="rounded-2xl border border-[var(--color-border)] bg-white/68 px-4 py-3 text-sm leading-7 text-[var(--color-muted)]"
              >
                {feature}
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-3 rounded-2xl border border-dashed border-[var(--color-border)] bg-white/60 px-4 py-4 text-sm leading-6 text-[var(--color-muted)]">
            No salient features are available for this synthetic case.
          </div>
        )}
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-[-0.01em]">
            Representative examples
          </h3>
        {hasRepresentativeExamples ? (
          <ul className="mt-3 space-y-2">
            {cluster.representativeExamples.map((example) => (
              <li
                key={example}
                className="rounded-2xl border border-[var(--color-border)] bg-white/68 px-4 py-3 text-sm leading-7 text-[var(--color-muted)]"
              >
                {example}
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-3 rounded-2xl border border-dashed border-[var(--color-border)] bg-white/60 px-4 py-4 text-sm leading-6 text-[var(--color-muted)]">
            No representative examples are available for this synthetic case.
          </div>
        )}
        </div>
      </div>
    </section>
  );
}
