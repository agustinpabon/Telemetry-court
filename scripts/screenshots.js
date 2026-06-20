async function captureScreenshots() {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const { chromium } = await import("playwright");
  const baseUrl = process.env.TELEMETRY_COURT_BASE_URL ?? "http://localhost:3000";
  const screenshotDir = path.resolve(process.cwd(), "screenshots");
  const seededState = {
    selectedCaseId: "case-arena-001",
    reviewsByCase: {
      "case-arena-001": {
        blindChoiceId: "none-of-these",
        aiLabelRevealed: true,
        evidenceRatings: {},
        labelDuelWinnerId: "label-iam-constrained",
        impostorSessionId: "iam-s-04",
        failureModes: ["less_overclaimed", "missing_evidence"],
        finalVerdict: "unsupported_overclaimed",
      },
    },
  };
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
    await page.evaluate((state) => {
      window.sessionStorage.setItem(
        "telemetry-court-arena-state-v1",
        JSON.stringify(state),
      );
    }, seededState);

    for (const route of routes) {
      console.log(`Capturing ${route.fileName} on route ${route.path}...`);
      const url = new URL(route.path, baseUrl).toString();

      await page.goto(url, { waitUntil: "networkidle" });
      
      const currentUrl = new URL(page.url());
      if (
        currentUrl.pathname !== route.path &&
        currentUrl.pathname !== `${route.path}/`
      ) {
        throw new Error(
          `Expected ${route.path} but was redirected to ${currentUrl.pathname}`,
        );
      }

      const errorOverlay = await page.locator("[data-nextjs-dialog]").count();

      if (errorOverlay > 0) {
        throw new Error(`Next.js error overlay detected on ${route.path}`);
      }

      if (route.path === "/verdict") {
        const verdictState = await page.evaluate(() => {
          const pageText = document.body.innerText;

          return {
            ready: pageText.includes("Ready to export"),
            verdictMissing: pageText.includes("Verdict not selected"),
            selectedVerdict: Boolean(
              document.querySelector('.verdict-button[aria-pressed="true"]'),
            ),
          };
        });

        if (
          !verdictState.ready ||
          verdictState.verdictMissing ||
          !verdictState.selectedVerdict
        ) {
          throw new Error(
            `Inconsistent verdict screenshot state: ${JSON.stringify(verdictState)}`,
          );
        }
      }

      await page.waitForTimeout(250);

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
