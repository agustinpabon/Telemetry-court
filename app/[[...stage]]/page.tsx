import { notFound } from "next/navigation";

import { RoutedAppShell } from "@/components/arena/RoutedAppShell";
import {
  sampleCases,
  sampleLandscapeContextNodes,
} from "@/data/sampleCases";
import { getArenaStageForSlug } from "@/lib/arenaRoutes";

type ArenaPageProps = {
  params: Promise<{
    stage?: string[];
  }>;
};

export default async function ArenaPage({ params }: ArenaPageProps) {
  const { stage } = await params;
  const initialStage = getArenaStageForSlug(stage);

  if (!initialStage) {
    notFound();
  }

  return (
    <RoutedAppShell
      cases={sampleCases}
      landscapeContextNodes={sampleLandscapeContextNodes}
      initialStage={initialStage}
    />
  );
}
