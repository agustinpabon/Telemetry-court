import { notFound } from "next/navigation";

import { PackageReviewGate } from "@/components/arena/PackageReviewGate";
import {
  samplePackageReviewRenderState,
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
    <PackageReviewGate
      renderState={samplePackageReviewRenderState}
      landscapeContextNodes={sampleLandscapeContextNodes}
      initialStage={initialStage}
    />
  );
}
