import type { GeneratedInterpretation } from "@/lib/types";

type ClaimPanelProps = {
  generatedInterpretation: GeneratedInterpretation;
};

export function ClaimPanel({ generatedInterpretation }: ClaimPanelProps) {
  return (
    <section className="rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.07)] sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--color-muted)]">
            Generated interpretation
          </p>
          <h2 className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.05em] text-balance sm:text-5xl">
            {generatedInterpretation.title}
          </h2>
        </div>
        <span className="inline-flex w-fit rounded-full border border-[var(--color-border-strong)] bg-[var(--color-accent-soft)] px-3 py-1 text-sm font-medium text-[var(--color-accent-strong)]">
          Model output
        </span>
      </div>

      <p className="mt-8 max-w-4xl text-lg leading-9 text-[var(--color-muted)]">
        {generatedInterpretation.description}
      </p>

      <div className="mt-8 grid gap-3 md:grid-cols-[1.2fr_1fr]">
        <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-panel)]/55 p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
            What is being judged
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
            The title and description above are treated as a provisional interpretation
            produced by a Toponymy-style system. Telemetry Court tests whether the record
            actually supports that reading.
          </p>
        </div>
        <div className="rounded-[24px] border border-[var(--color-border)] bg-white/78 p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Editorial note
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
            The interpretation should feel like a concise research claim, not a raw model
            dump. The panels below supply the supporting record.
          </p>
        </div>
      </div>
    </section>
  );
}
