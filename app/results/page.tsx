import Link from "next/link";

import { ArenaHeader } from "@/components/arena/WorkflowPrimitives";
import { LocalEvaluationResults } from "@/components/evaluation/LocalEvaluationResults";

export default function EvaluationResultsPage() {
  return (
    <main className="arena-shell arena-shell-investigate arena-stage-results evaluation-report-page">
      <ArenaHeader
        actions={
          <div className="arena-local-file-actions tc-masthead__actions-grid">
            <div className="tc-masthead__action-group tc-masthead__action-group--results">
              <span className="tc-masthead__group-label tc-masthead__action-label tc-masthead__action-label--empty" aria-hidden="true" />
              <div className="tc-masthead__action-row tc-masthead__button-row">
                <Link className="arena-header-link" href="/">
                  Review cases
                </Link>
              </div>
              <p className="tc-masthead__action-helper tc-masthead__action-helper--empty" aria-hidden="true" />
            </div>
          </div>
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
