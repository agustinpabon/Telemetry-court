import type { CSSProperties } from "react";

import { ReviewTerminologyHelp } from "@/components/arena/ReviewTerminologyHelp";
import {
  ArenaActionFooter,
  ArenaStatusBadge,
  ArenaStepHero,
  ArenaWorkflowShell,
} from "@/components/arena/WorkflowPrimitives";
import { formatSupportScore } from "@/lib/caseMetrics";
import {
  getEvidenceBalance,
  getEvidenceRatings,
  type CaseReviewState,
} from "@/lib/arenaReviewState";
import type { CaseFile, RepresentativeSession } from "@/lib/types";

type ImpostorPanelProps = {
  caseFile: CaseFile;
  reviewState: CaseReviewState;
  onSelectSession: (sessionId: string) => void;
  onBackToLabelDuel?: () => void;
  onContinue: () => void;
};

type SessionCardStyle = CSSProperties & {
  "--outlier-risk": string;
  "--cluster-match": string;
};

export function ImpostorPanel({
  caseFile,
  reviewState,
  onSelectSession,
  onBackToLabelDuel,
  onContinue,
}: ImpostorPanelProps) {
  const selectedSession = caseFile.representativeSessions.find(
    (session) => session.id === reviewState.impostorSessionId,
  );
  const selectedLabel = caseFile.candidateLabels.find(
    (candidate) => candidate.id === reviewState.labelDuelWinnerId,
  );

  if (!selectedLabel) {
    return (
      <ArenaWorkflowShell className="impostor-stage" ariaLabel="Cluster Fit Check">
        <ArenaStepHero
          status={<ArenaStatusBadge tone="uncertain">Fit check</ArenaStatusBadge>}
          title="Choose a label before the fit check"
          summary="This comparison depends on the label selected in the previous step. Return to Label Selection to choose the interpretation you want to test."
        />

        <section className="impostor-label-guard" aria-labelledby="label-guard-title">
          <span>Label selection required</span>
          <h3 id="label-guard-title">The comparison is waiting for context</h3>
          <p>
            Once a label is selected, the five representative sessions can be compared
            against that interpretation.
          </p>
        </section>

        <ArenaActionFooter
          className="impostor-actions"
          ariaLabel="Cluster Fit Check recovery actions"
          microcopy="Choose the most defensible label before checking session fit."
          primaryAction={{
            label: "Return to label selection",
            disabled: !onBackToLabelDuel,
            onClick: onBackToLabelDuel ?? (() => undefined),
          }}
        />
      </ArenaWorkflowShell>
    );
  }

  const evidenceRatings = getEvidenceRatings(caseFile, reviewState);
  const evidenceBalance = getEvidenceBalance(caseFile, evidenceRatings);
  const rankedSessions = [...caseFile.representativeSessions].sort(
    (left, right) =>
      right.outlierScore - left.outlierScore ||
      left.featureOverlap - right.featureOverlap,
  );
  const strongestCandidate = rankedSessions[0];

  return (
    <ArenaWorkflowShell className="impostor-stage" ariaLabel="Cluster Fit Check">
      <ArenaStepHero
        status={
          <ArenaStatusBadge tone="uncertain">
            Cluster Fit Check · {caseFile.representativeSessions.length} representative
            sessions
          </ArenaStatusBadge>
        }
        title="Find the weakest-fit session"
        summary="Choose the session least consistent with the selected label."
      />
      <ReviewTerminologyHelp
        terms={["cluster", "representative_session", "outlier_impostor"]}
      />

      <section className="impostor-evidence-summary" aria-label="Decision context">
        <div>
          <span>Selected label</span>
          <strong>{selectedLabel.label}</strong>
        </div>
        <div>
          <span>Evidence read</span>
          <strong>{formatEvidenceBalance(evidenceBalance)}</strong>
        </div>
        <div>
          <span>Review status</span>
          <strong className="impostor-review-pill">Needs review</strong>
        </div>
        <div>
          <span>Decision</span>
          <strong>Fit check</strong>
        </div>
      </section>

      <div className="impostor-decision-layout">
        <section className="session-comparison" aria-labelledby="session-comparison-title">
          <div className="impostor-section-heading">
            <div>
              <h3 id="session-comparison-title">Compare session fit</h3>
              <p>
                Compare the same two signals across every session.
              </p>
            </div>
          </div>

          <div
            className="impostor-criterion-row"
            aria-label="Weakest fit = high outlier risk + low cluster pattern match"
          >
            <strong>Weakest fit</strong>
            <span>High outlier risk</span>
            <i aria-hidden="true">+</i>
            <span>Low cluster pattern match</span>
          </div>

          <ol className="session-comparison-list">
            {rankedSessions.map((session, index) => {
              const isSelected = session.id === reviewState.impostorSessionId;
              const isStrongestCandidate = session.id === strongestCandidate?.id;
              const matchLevel = getClusterMatchLevel(session.featureOverlap);
              const style: SessionCardStyle = {
                "--outlier-risk": formatSupportScore(session.outlierScore),
                "--cluster-match": formatSupportScore(session.featureOverlap),
              };

              return (
                <li key={session.id}>
                  <button
                    type="button"
                    className={`session-comparison-card ${
                      isStrongestCandidate ? "is-strongest" : ""
                    } ${isSelected ? "is-selected" : ""}`}
                    style={style}
                    onClick={() => onSelectSession(session.id)}
                    aria-pressed={isSelected}
                  >
                    <span className="session-rank" aria-hidden="true">
                      {index + 1}
                    </span>
                    <span className="session-card-content">
                      <span className="session-card-topline">
                        <span className="mono-value">{session.id}</span>
                        {isStrongestCandidate ? (
                          <span className="strongest-candidate-badge">
                            Weakest-fit signal
                          </span>
                        ) : null}
                        <span className="session-selection-state" aria-hidden="true">
                          {isSelected ? "Selected" : "Select"}
                        </span>
                      </span>
                      <strong className="session-card-title">{session.title}</strong>
                      <span className="session-card-summary">{session.summary}</span>
                      <span className="session-card-metrics">
                        <span className="session-card-metric session-card-metric-risk">
                          <span>Outlier risk</span>
                          <strong aria-label={`${formatSupportScore(
                            session.outlierScore,
                          )} outlier risk`}>
                            {formatSupportScore(session.outlierScore)} outlier risk
                          </strong>
                          <span className="session-meter" aria-hidden="true">
                            <span />
                          </span>
                        </span>
                        <span className="session-card-metric session-card-metric-match">
                          <span>Cluster pattern match</span>
                          <strong>
                            {matchLevel} · {formatSupportScore(session.featureOverlap)}
                          </strong>
                          <span className="session-meter" aria-hidden="true">
                            <span />
                          </span>
                        </span>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>

        <ImpostorDetailPanel
          selectedSession={selectedSession}
          strongestCandidate={strongestCandidate}
        />
      </div>

      <ArenaActionFooter
        className="impostor-actions"
        ariaLabel="Cluster Fit Check actions"
        microcopy={
          selectedSession
            ? formatImpostorFooterMicrocopy(selectedSession, strongestCandidate)
            : "Choose the session with the weakest match to the cluster before continuing."
        }
        secondaryAction={
          onBackToLabelDuel
            ? {
                label: "Return to label selection",
                onClick: onBackToLabelDuel,
              }
            : undefined
        }
        primaryAction={{
          label: "Continue to final evaluation",
          disabled: !selectedSession,
          onClick: onContinue,
        }}
      />
    </ArenaWorkflowShell>
  );
}

function ImpostorDetailPanel({
  selectedSession,
  strongestCandidate,
}: {
  selectedSession?: RepresentativeSession;
  strongestCandidate?: RepresentativeSession;
}) {
  if (!selectedSession) {
    return (
      <aside className="impostor-detail impostor-detail-guide" aria-live="polite">
        <span className="impostor-detail-label">Fit check</span>
        <h3>What to look for</h3>
        <p>
          High outlier risk plus low pattern match signals the weakest fit.
        </p>
        {strongestCandidate ? (
          <section
            className="impostor-current-candidate"
            aria-label="Current weakest-fit candidate"
          >
            <span>Current weakest-fit candidate</span>
            <div>
              <span className="mono-value">{strongestCandidate.id}</span>
              <strong>{strongestCandidate.title}</strong>
            </div>
            <dl>
              <div>
                <dt>Outlier risk</dt>
                <dd>{formatSupportScore(strongestCandidate.outlierScore)}</dd>
              </div>
              <div>
                <dt>Cluster match</dt>
                <dd>{formatSupportScore(strongestCandidate.featureOverlap)}</dd>
              </div>
            </dl>
            <p>{strongestCandidate.id} currently has the clearest mismatch.</p>
          </section>
        ) : null}
        <p className="impostor-detail-helper">
          Select a session to see how it affects the final evaluation.
        </p>
      </aside>
    );
  }

  const isStrongestCandidate = selectedSession.id === strongestCandidate?.id;
  const alternateCandidateNote = strongestCandidate
    ? `Selection recorded, but ${strongestCandidate.id} has stronger outlier evidence: ${formatSupportScore(
        strongestCandidate.outlierScore,
      )} outlier risk and lower cluster match.`
    : "This selection will be recorded, but another session has stronger outlier evidence.";

  return (
    <aside className="impostor-detail is-resolved" aria-live="polite">
      <div className="impostor-detail-topline">
        <span className="impostor-detail-label">Selection recorded</span>
        <span className="impostor-recorded-indicator">Recorded</span>
      </div>
      <span className="mono-value">{selectedSession.id}</span>
      <h3>{selectedSession.title}</h3>
      <p>{selectedSession.summary}</p>
      <dl className="session-detail-metrics">
        <div>
          <dt>Cluster pattern match</dt>
          <dd>
            {getClusterMatchLevel(selectedSession.featureOverlap)} ·{" "}
            {formatSupportScore(selectedSession.featureOverlap)}
          </dd>
        </div>
        <div>
          <dt>Outlier risk</dt>
          <dd>{formatSupportScore(selectedSession.outlierScore)}</dd>
        </div>
      </dl>
      <div
        className={`outlier-explanation ${
          isStrongestCandidate ? "is-strong-candidate" : "is-neutral-warning"
        }`}
      >
        <span>Effect on final evaluation</span>
        <p>
          {isStrongestCandidate
            ? "This is the strongest mismatch candidate because it has the highest outlier risk and weakest match to the cluster."
            : alternateCandidateNote}
        </p>
      </div>
      {selectedSession.outlierReason ? (
        <p className="impostor-evidence-note">{selectedSession.outlierReason}</p>
      ) : null}
    </aside>
  );
}

function getClusterMatchLevel(featureOverlap: number) {
  if (featureOverlap >= 0.72) {
    return "High";
  }

  if (featureOverlap >= 0.45) {
    return "Medium";
  }

  return "Low";
}

function formatImpostorFooterMicrocopy(
  selectedSession: RepresentativeSession,
  strongestCandidate?: RepresentativeSession,
) {
  const selectedCopy = `Selected: ${selectedSession.title} · ${formatSupportScore(
    selectedSession.outlierScore,
  )} outlier risk`;

  if (!strongestCandidate || selectedSession.id === strongestCandidate.id) {
    return selectedCopy;
  }

  return `${selectedCopy}. Weakest-fit signal: ${strongestCandidate.id} · ${formatSupportScore(
    strongestCandidate.outlierScore,
  )}.`;
}

function formatEvidenceBalance(balance: ReturnType<typeof getEvidenceBalance>) {
  const parts = [
    { value: balance.supporting, singular: "support", plural: "supports" },
    { value: balance.weak, singular: "weak support", plural: "weak support" },
    {
      value: balance.contradictory,
      singular: "contradiction",
      plural: "contradictions",
    },
    {
      value: balance.contextGaps,
      singular: "needs context",
      plural: "need context",
    },
  ].filter((part) => part.value > 0);

  return parts
    .map(
      (part) =>
        `${part.value} ${part.value === 1 ? part.singular : part.plural}`,
    )
    .join(" · ");
}
