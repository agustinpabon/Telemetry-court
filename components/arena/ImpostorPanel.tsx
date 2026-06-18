import type { CSSProperties } from "react";

import { SemanticMiniMap } from "@/components/arena/SemanticMiniMap";
import {
  ArenaActionFooter,
  ArenaStatusBadge,
  ArenaStepHero,
  ArenaStepProgress,
  ArenaWorkflowShell,
  SectionHeader,
} from "@/components/arena/WorkflowPrimitives";
import { formatSupportScore } from "@/lib/caseMetrics";
import type { ArenaStage, CaseReviewState } from "@/lib/arenaReviewState";
import type { CaseFile } from "@/lib/types";

const orbitPositions = [
  { x: "50%", y: "16%" },
  { x: "76%", y: "36%" },
  { x: "68%", y: "72%" },
  { x: "32%", y: "72%" },
  { x: "24%", y: "36%" },
];

type ImpostorPanelProps = {
  caseFile: CaseFile;
  reviewState: CaseReviewState;
  onSelectSession: (sessionId: string) => void;
  onBackToLabelDuel?: () => void;
  onContinue: () => void;
  onSelectStage?: (stage: ArenaStage) => void;
};

type SessionStyle = CSSProperties & {
  "--session-x": string;
  "--session-y": string;
};

export function ImpostorPanel({
  caseFile,
  reviewState,
  onSelectSession,
  onBackToLabelDuel,
  onContinue,
  onSelectStage,
}: ImpostorPanelProps) {
  const selectedSession = caseFile.representativeSessions.find(
    (session) => session.id === reviewState.impostorSessionId,
  );

  return (
    <ArenaWorkflowShell className="impostor-stage" ariaLabel="Find the Impostor">
      <ArenaStepProgress currentStage="impostor" onSelectStage={onSelectStage} />

      <ArenaStepHero
        eyebrow="Find the Impostor"
        status={
          <ArenaStatusBadge tone="uncertain">
            {caseFile.representativeSessions.length} representative sessions
          </ArenaStatusBadge>
        }
        title="Which representative session least belongs?"
        summary="Test cluster purity by selecting the session with the weakest fit against the behavioural region."
      />

      <div className="impostor-context-row">
        <SemanticMiniMap caseFile={caseFile} label="Purity context" />
        <SectionHeader
          title="Session fit map"
          description="Outlier score and feature overlap help explain whether the cluster is coherent or mixed."
        />
      </div>

      <div className="impostor-layout">
        <div className="session-orbit" aria-label="Representative session orbit">
          <div className="orbit-core" aria-hidden="true">
            <span>Cluster core</span>
          </div>
          {caseFile.representativeSessions.map((session, index) => {
            const position = orbitPositions[index % orbitPositions.length];
            const isSelected = session.id === reviewState.impostorSessionId;
            const style: SessionStyle = {
              "--session-x": position.x,
              "--session-y": position.y,
            };

            return (
              <button
                key={session.id}
                type="button"
                className={`session-orbit-card ${isSelected ? "is-selected" : ""}`}
                style={style}
                onClick={() => onSelectSession(session.id)}
                aria-pressed={isSelected}
              >
                <span>{session.id}</span>
                <strong>{session.title}</strong>
                <em>outlier {formatSupportScore(session.outlierScore)}</em>
              </button>
            );
          })}
        </div>

        <article className="impostor-detail">
          {selectedSession ? (
            <>
              <span className="mono-value">{selectedSession.id}</span>
              <h3>{selectedSession.title}</h3>
              <p>{selectedSession.summary}</p>
              <dl className="session-detail-metrics">
                <div>
                  <dt>Feature overlap</dt>
                  <dd>{formatSupportScore(selectedSession.featureOverlap)}</dd>
                </div>
                <div>
                  <dt>Outlier score</dt>
                  <dd>{formatSupportScore(selectedSession.outlierScore)}</dd>
                </div>
              </dl>
              <div className="outlier-explanation">
                <span>Confidence impact</span>
                <p>
                  {selectedSession.outlierReason ??
                    "This reviewer-selected session is recorded in the JSON export, but it is not the seeded outlier for this synthetic case."}
                </p>
              </div>
            </>
          ) : (
            <>
              <span className="mono-value">Purity test</span>
              <h3>Cluster purity unresolved</h3>
              <p>
                The final purity judgment needs the session with the weakest feature
                overlap and highest outlier pressure.
              </p>
            </>
          )}
        </article>
      </div>

      <ArenaActionFooter
        className="impostor-actions"
        ariaLabel="Impostor actions"
        microcopy={
          selectedSession
            ? "Use the weakest-fit session to inform the final verdict."
            : "Select the least representative session before continuing."
        }
        secondaryAction={
          onBackToLabelDuel
            ? {
                label: "Back to label duel",
                onClick: onBackToLabelDuel,
              }
            : undefined
        }
        primaryAction={{
          label: "Continue to verdict",
          disabled: !selectedSession,
          onClick: onContinue,
        }}
      />
    </ArenaWorkflowShell>
  );
}
