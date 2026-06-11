import type { TopicLabel } from "@/lib/types";

type ClaimPanelProps = {
  topicLabel: TopicLabel;
};

export function ClaimPanel({ topicLabel }: ClaimPanelProps) {
  return (
    <section className="tc-panel p-6 sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--tc-muted)]">
            Generated interpretation
          </p>
          <h2 className="mt-3 max-w-4xl text-3xl font-semibold tracking-[-0.04em] text-balance sm:text-4xl">
            {topicLabel.name}
          </h2>
        </div>
        <span className="tc-pill inline-flex w-fit px-3 py-1 text-sm font-medium">
          Model output
        </span>
      </div>

      <p className="mt-7 max-w-4xl text-base leading-8 text-[var(--tc-muted)]">
        {topicLabel.explanation}
      </p>

      <div className="mt-8 grid gap-3 md:grid-cols-[1.2fr_1fr]">
        <div className="tc-panel-subtle p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--tc-muted)]">
            What is being judged
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--tc-muted)]">
            The title and description above are treated as a provisional interpretation
            produced by a Toponymy-style system. Telemetry Court tests whether the record
            actually supports that reading.
          </p>
        </div>
        <div className="tc-panel-inset p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--tc-muted)]">
            Editorial note
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--tc-muted)]">
            The interpretation should feel like a concise research claim, not a raw model
            dump. The panels below supply the supporting record.
          </p>
        </div>
      </div>
    </section>
  );
}
