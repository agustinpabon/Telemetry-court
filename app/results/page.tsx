import { EvaluationReportResults } from "@/components/evaluation/EvaluationReportResults";
import { ArenaHeader } from "@/components/arena/WorkflowPrimitives";
import { sampleEvaluationReportV01 } from "@/data/evaluationReportFixtures";

export default function EvaluationResultsPage() {
  return (
    <main className="arena-shell arena-shell-investigate arena-stage-results evaluation-report-page">
      <ArenaHeader />
      <div className="arena-layout">
        <section className="arena-workspace" aria-live="polite">
          <EvaluationReportResults report={sampleEvaluationReportV01} />
        </section>
      </div>
    </main>
  );
}
