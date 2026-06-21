import { casePackageFixtures } from "@/data/casePackageFixtures";
import {
  sampleCaseSeedData,
  sampleLandscapeContextNodeSeedData,
} from "@/data/sampleCaseSeedData";
import { casePackageV01ToCaseFile } from "@/lib/casePackageV01ToCaseFile";
import type { CaseFile, LandscapeContextNode } from "@/lib/types";

// Stable UI import fed by validated package fixtures through a compatibility boundary.
export const sampleCases: CaseFile[] = casePackageFixtures.map(
  (packageFixture, index) =>
    readCompatibleSampleCase(packageFixture, sampleCaseSeedData[index]),
);

export const sampleLandscapeContextNodes: LandscapeContextNode[] =
  sampleLandscapeContextNodeSeedData;

function readCompatibleSampleCase(
  packageFixture: unknown,
  compatibilitySeed: CaseFile | undefined,
): CaseFile {
  const result = casePackageV01ToCaseFile(packageFixture, compatibilitySeed);

  if (!result.ok) {
    throw new Error(
      `CasePackage fixture cannot support the current UI: ${JSON.stringify(result.errors)}`,
    );
  }

  return result.caseFile;
}
