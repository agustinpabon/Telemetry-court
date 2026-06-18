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
    console.log(`Setting origin to ${baseUrl} and seeding state...`);
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    
    // Seed the required state to bypass route guards
    await page.evaluate(() => {
      const state = {
        selectedCaseId: "case-arena-001",
        reviewsByCase: {
          "case-arena-001": {
            blindChoiceId: "none-of-these",
            aiLabelRevealed: true,
            evidenceRatings: {},
            labelDuelWinnerId: "candidate-0",
            impostorSessionId: "session-5-impostor",
            finalVerdict: "accept"
          }
        }
      };
      window.sessionStorage.setItem("telemetry-court-arena-state-v1", JSON.stringify(state));
    });

    for (const route of routes) {
      console.log(`Capturing ${route.fileName} on route ${route.path}...`);
      const url = new URL(route.path, baseUrl).toString();

      await page.goto(url, { waitUntil: "networkidle" });
      
      const currentUrl = new URL(page.url());
      if (currentUrl.pathname !== route.path && currentUrl.pathname !== route.path + '/') {
         console.warn(`Warning: Expected to be on ${route.path} but was redirected to ${currentUrl.pathname}`);
      }

      await page.screenshot({
        path: path.join(screenshotDir, route.fileName),
        fullPage: true,
      });
      console.log(`Saved ${route.fileName}`);
    }
  } finally {
    await browser.close();
  }
}

captureScreenshots().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
