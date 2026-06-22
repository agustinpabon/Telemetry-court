import Link from "next/link";

import { ArenaHeader } from "@/components/arena/WorkflowPrimitives";
import { LocalEvaluationResults } from "@/components/evaluation/LocalEvaluationResults";

export default function EvaluationResultsPage() {
  return (
    <main className="arena-shell arena-shell-investigate arena-stage-results evaluation-report-page">
      <ArenaHeader
        actions={
          <Link className="arena-header-link" href="/">
            Review cases
          </Link>
        }
      />
      <div className="arena-layout">
        <section className="arena-workspace" aria-live="polite">
          <LocalEvaluationResults />
        </section>
      </div>
    </main>
  );
}
