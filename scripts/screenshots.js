async function captureScreenshots() {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const { chromium } = await import("playwright");
  const baseUrl = process.env.TELEMETRY_COURT_BASE_URL ?? "http://localhost:3000";
  const screenshotDir = path.resolve(process.cwd(), "screenshots");
  const routes = [
    { path: "/", fileName: "01-landscape.png" },
    { path: "/case-file", fileName: "02-case-file.png" },
    { path: "/blind-read", fileName: "03-blind-read.png" },
    { path: "/ai-reveal", fileName: "04-ai-reveal.png" },
    { path: "/evidence-board", fileName: "05-evidence-board.png" },
    { path: "/label-duel", fileName: "06-label-duel.png" },
    { path: "/impostor", fileName: "07-impostor.png" },
    { path: "/verdict", fileName: "08-verdict.png" },
  ];

  await fs.mkdir(screenshotDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });

  try {
    for (const route of routes) {
      const url = new URL(route.path, baseUrl).toString();

      await page.goto(url, { waitUntil: "networkidle" });
      await page.screenshot({
        path: path.join(screenshotDir, route.fileName),
        fullPage: true,
      });
    }
  } finally {
    await browser.close();
  }
}

captureScreenshots().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
