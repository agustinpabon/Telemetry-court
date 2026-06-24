import { NextResponse } from "next/server";

import { scanConfiguredHotFolderCasePackages } from "@/lib/hotFolderCasePackageScan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const scan = await scanConfiguredHotFolderCasePackages();

  return NextResponse.json(scan, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
