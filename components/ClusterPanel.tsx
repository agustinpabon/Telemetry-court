import type { Cluster } from "@/lib/types";

type ClusterPanelProps = {
  cluster: Cluster;
};

export function ClusterPanel({ cluster }: ClusterPanelProps) {
  return (
    <section className="rounded-[30px] border border-[var(--color-border-soft)] bg-[var(--color-surface)]/78 p-6 shadow-[0_14px_40px_rgba(15,23,42,0.04)] sm:p-7">
      <p className="text-sm font-medium text-[var(--color-muted)]">Cluster substrate</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--color-ink)]">
        {cluster.name}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
        {cluster.description ??
          "Supporting context for the interpretation under review."}
      </p>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)]/65 p-4">
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Cluster ID
          </dt>
          <dd className="mt-2 font-mono text-sm font-semibold">{cluster.id}</dd>
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)]/65 p-4">
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Source
          </dt>
          <dd className="mt-2 text-lg font-semibold capitalize">{cluster.source}</dd>
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)]/65 p-4">
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Size
          </dt>
          <dd className="mt-2 text-lg font-semibold">{cluster.size ?? "Unknown"}</dd>
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)]/65 p-4">
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Model role
          </dt>
          <dd className="mt-2 text-sm font-semibold leading-6">
            Evidence case input
          </dd>
        </div>
      </dl>
    </section>
  );
}
