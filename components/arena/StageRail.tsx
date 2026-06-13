import { arenaStages, type ArenaStage } from "@/lib/arenaReviewState";

type StageRailProps = {
  activeStage: ArenaStage;
  completedStages: Record<ArenaStage, boolean>;
  onSelectStage: (stage: ArenaStage) => void;
};

export function StageRail({
  activeStage,
  completedStages,
  onSelectStage,
}: StageRailProps) {
  return (
    <nav className="stage-rail" aria-label="Investigation stages">
      {arenaStages.map((stage, index) => {
        const isActive = activeStage === stage.id;
        const isComplete = completedStages[stage.id];

        return (
          <button
            key={stage.id}
            type="button"
            className={`stage-rail-button ${isActive ? "is-active" : ""} ${
              isComplete ? "is-complete" : ""
            }`}
            onClick={() => onSelectStage(stage.id)}
            aria-current={isActive ? "step" : undefined}
            aria-label={stage.label}
            title={stage.label}
          >
            <span className="stage-rail-index">{index + 1}</span>
            <span className="stage-rail-label">{stage.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
