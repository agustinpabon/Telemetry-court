import assert from "node:assert/strict";
import test from "node:test";

import {
  findCasePackageForCaseFile,
  navigatePath,
} from "@/components/arena/AppShell";
import { casePackageFixtures } from "@/data/casePackageFixtures";
import { sampleCases } from "@/data/sampleCases";

test("imported-case navigation preserves in-memory state across stage paths", () => {
  const calls: Array<{ kind: "push" | "preserve"; path: string }> = [];

  for (const nextPath of ["/ai-reveal", "/evidence-board", "/verdict"]) {
    navigatePath({
      nextPath,
      preserveImportedState: true,
      onNavigatePath: (path) => calls.push({ kind: "push", path }),
      onNavigatePathPreservingState: (path) =>
        calls.push({ kind: "preserve", path }),
    });
  }

  assert.deepEqual(calls, [
    { kind: "preserve", path: "/ai-reveal" },
    { kind: "preserve", path: "/evidence-board" },
    { kind: "preserve", path: "/verdict" },
  ]);
});

test("built-in demo navigation still uses router navigation", () => {
  const calls: Array<{ kind: "push" | "preserve"; path: string }> = [];

  navigatePath({
    nextPath: "/ai-reveal",
    preserveImportedState: false,
    onNavigatePath: (path) => calls.push({ kind: "push", path }),
    onNavigatePathPreservingState: (path) =>
      calls.push({ kind: "preserve", path }),
  });

  assert.deepEqual(calls, [{ kind: "push", path: "/ai-reveal" }]);
});

test("evidence assistance resolves only an exact CasePackage reference", () => {
  assert.equal(
    findCasePackageForCaseFile(sampleCases[0], casePackageFixtures),
    casePackageFixtures[0],
  );

  const caseWithUnknownRevision = {
    ...sampleCases[0],
    casePackageReference: {
      ...sampleCases[0].casePackageReference!,
      package_revision: "unknown-revision",
    },
  };

  assert.equal(
    findCasePackageForCaseFile(caseWithUnknownRevision, casePackageFixtures),
    undefined,
  );
});
