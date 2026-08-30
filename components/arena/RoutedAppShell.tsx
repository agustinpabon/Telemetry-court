"use client";

import { usePathname, useRouter } from "next/navigation";

import { AppShell } from "@/components/arena/AppShell";
import type { ArenaStage } from "@/lib/arenaReviewState";
import type {
  CaseFile,
  CasePackageV01,
  LandscapeContextNode,
} from "@/lib/types";

type RoutedAppShellProps = {
  cases: CaseFile[];
  casePackages: CasePackageV01[];
  landscapeContextNodes?: LandscapeContextNode[];
  initialStage: ArenaStage;
};

export function RoutedAppShell({
  cases,
  casePackages,
  landscapeContextNodes = [],
  initialStage,
}: RoutedAppShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <AppShell
      cases={cases}
      casePackages={casePackages}
      landscapeContextNodes={landscapeContextNodes}
      initialStage={initialStage}
      pathname={pathname}
      onNavigatePath={(path) => router.push(path)}
      onNavigatePathPreservingState={(path) =>
        window.history.pushState(null, "", path)
      }
    />
  );
}
