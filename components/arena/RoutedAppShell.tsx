"use client";

import { usePathname, useRouter } from "next/navigation";

import { AppShell } from "@/components/arena/AppShell";
import type { ArenaStage } from "@/lib/arenaReviewState";
import type { CaseFile, LandscapeContextNode } from "@/lib/types";

type RoutedAppShellProps = {
  cases: CaseFile[];
  landscapeContextNodes?: LandscapeContextNode[];
  initialStage: ArenaStage;
};

export function RoutedAppShell({
  cases,
  landscapeContextNodes = [],
  initialStage,
}: RoutedAppShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <AppShell
      cases={cases}
      landscapeContextNodes={landscapeContextNodes}
      initialStage={initialStage}
      pathname={pathname}
      onNavigatePath={(path) => router.push(path)}
    />
  );
}
