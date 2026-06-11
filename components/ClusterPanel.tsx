import type { Cluster } from "@/lib/types";

type ClusterPanelProps = {
  cluster: Cluster;
};

export function ClusterPanel({ cluster }: ClusterPanelProps) {
  return (
    <section className="rounded-[var(--tc-radius-xl)] border border-[var(--tc-faint)] bg-[var(--tc-surface)] p-6 sm:p-7">
      <p className="text-sm font-medium text-[var(--tc-muted)]">Cluster substrate</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--tc-ink)]">
        {cluster.name}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--tc-muted)]">
        {cluster.description ??
          "Supporting context for the interpretation under review."}
      </p>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="tc-panel-subtle p-4">
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--tc-muted)]">
            Cluster ID
          </dt>
          <dd className="mt-2 font-mono text-sm font-semibold">{cluster.id}</dd>
        </div>
        <div className="tc-panel-subtle p-4">
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--tc-muted)]">
            Source
          </dt>
          <dd className="mt-2 text-lg font-semibold capitalize">{cluster.source}</dd>
        </div>
        <div className="tc-panel-subtle p-4">
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--tc-muted)]">
            Size
          </dt>
          <dd className="mt-2 text-lg font-semibold">{cluster.size ?? "Unknown"}</dd>
        </div>
        <div className="tc-panel-subtle p-4">
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--tc-muted)]">
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
