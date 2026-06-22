import assert from "node:assert/strict";
import test from "node:test";

import { navigatePath } from "@/components/arena/AppShell";

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
