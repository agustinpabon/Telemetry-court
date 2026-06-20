import { casePackageFixtures } from "@/data/casePackageFixtures";
import {
  sampleCaseSeedData,
  sampleLandscapeContextNodeSeedData,
} from "@/data/sampleCaseSeedData";
import { casePackageV01ToCaseFile } from "@/lib/casePackageV01ToCaseFile";
import type { CaseFile, LandscapeContextNode } from "@/lib/types";

export const sampleCases: CaseFile[] = casePackageFixtures.map(
  (packageFixture, index) =>
    casePackageV01ToCaseFile(packageFixture, sampleCaseSeedData[index]),
);

export const sampleLandscapeContextNodes: LandscapeContextNode[] =
  sampleLandscapeContextNodeSeedData;
