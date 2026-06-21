import { casePackageFixtures } from "@/data/casePackageFixtures";
import {
  sampleCaseSeedData,
  sampleLandscapeContextNodeSeedData,
} from "@/data/sampleCaseSeedData";
import { casePackageV01ToCaseFile } from "@/lib/casePackageV01ToCaseFile";
import type { CasePackageValidationError } from "@/lib/casePackageValidation";
import type { CaseFile, LandscapeContextNode } from "@/lib/types";

export type PackageReviewRenderState =
  | { ok: true; cases: CaseFile[] }
  | { ok: false; errors: CasePackageValidationError[] };

export const samplePackageReviewRenderState = buildPackageReviewRenderState(
  casePackageFixtures,
  sampleCaseSeedData,
);

// Stable UI import fed by validated package fixtures through a compatibility boundary.
export const sampleCases: CaseFile[] = samplePackageReviewRenderState.ok
  ? samplePackageReviewRenderState.cases
  : [];

export const sampleLandscapeContextNodes: LandscapeContextNode[] =
  sampleLandscapeContextNodeSeedData;

export function buildPackageReviewRenderState(
  packageFixtures: readonly unknown[],
  compatibilitySeeds: readonly (CaseFile | undefined)[],
): PackageReviewRenderState {
  const cases: CaseFile[] = [];
  const errors: CasePackageValidationError[] = [];

  packageFixtures.forEach((packageFixture, index) => {
    const result = casePackageV01ToCaseFile(
      packageFixture,
      compatibilitySeeds[index],
    );

    if (result.ok) {
      cases.push(result.caseFile);
      return;
    }

    errors.push(...prefixPackageErrors(result.errors, index));
  });

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, cases };
}

function prefixPackageErrors(
  errors: CasePackageValidationError[],
  packageIndex: number,
): CasePackageValidationError[] {
  return errors.map((error) => ({
    ...error,
    path: prefixPackagePath(error.path, packageIndex),
  }));
}

function prefixPackagePath(path: string, packageIndex: number): string {
  if (path === "$") {
    return `$.packages[${packageIndex}]`;
  }

  if (path.startsWith("$")) {
    return `$.packages[${packageIndex}]${path.slice(1)}`;
  }

  return `$.packages[${packageIndex}].${path}`;
}
