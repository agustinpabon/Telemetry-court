import type { ArenaStage } from "@/lib/arenaReviewState";

export const arenaStagePathMap: Record<ArenaStage, string> = {
  landscape: "/",
  case_file: "/case-file",
  blind_read: "/blind-read",
  ai_reveal: "/ai-reveal",
  evidence_board: "/evidence-board",
  label_duel: "/label-duel",
  impostor: "/impostor",
  verdict: "/verdict",
};

const arenaSlugStageMap = new Map<string, ArenaStage>(
  Object.entries(arenaStagePathMap).flatMap(([stage, path]) => {
    if (path === "/") {
      return [];
    }

    return [[path.slice(1), stage as ArenaStage]];
  }),
);

export function getPathForArenaStage(stage: ArenaStage): string {
  return arenaStagePathMap[stage];
}

export function getArenaStageForSlug(slug?: string | string[]): ArenaStage | null {
  if (!slug) {
    return "landscape";
  }

  if (Array.isArray(slug)) {
    if (slug.length !== 1) {
      return null;
    }

    return arenaSlugStageMap.get(slug[0] ?? "") ?? null;
  }

  return arenaSlugStageMap.get(slug) ?? null;
}

export function getArenaStageForPathname(pathname: string): ArenaStage | null {
  if (pathname === "/") {
    return "landscape";
  }

  return arenaSlugStageMap.get(pathname.replace(/^\/+/, "")) ?? null;
}

export const arenaRouteEntries = [
  { stage: "landscape", label: "Evidence landscape", path: "/" },
  { stage: "case_file", label: "Case File", path: "/case-file" },
  { stage: "blind_read", label: "Blind Read", path: "/blind-read" },
  { stage: "ai_reveal", label: "AI Reveal", path: "/ai-reveal" },
  { stage: "evidence_board", label: "Evidence Board", path: "/evidence-board" },
  { stage: "label_duel", label: "Label Duel", path: "/label-duel" },
  { stage: "impostor", label: "Impostor", path: "/impostor" },
  { stage: "verdict", label: "Verdict", path: "/verdict" },
] as const satisfies ReadonlyArray<{
  stage: ArenaStage;
  label: string;
  path: string;
}>;
