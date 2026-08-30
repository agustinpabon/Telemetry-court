import { spawn, type ChildProcess } from "node:child_process";
import { copyFile, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";

import { chromium, type Browser, type Locator, type Page } from "playwright";

import { casePackageFixtures } from "../data/casePackageFixtures";

const port = process.env.TELEMETRY_COURT_RELEASE_BROWSER_PORT ?? "3210";
const baseUrl = `http://127.0.0.1:${port}`;
const casePackageSessionStoreKey = "telemetry-court-case-packages-session-v1";
const arenaSessionStateKey = "telemetry-court-arena-state-v1";
const reviewResultLocalStoreKey = "telemetry-court-review-results-v1";
const baseReleaseCasePackage = casePackageFixtures[0];

if (!baseReleaseCasePackage) {
  throw new Error("Release browser smoke requires at least one CasePackage fixture.");
}

const releaseClusterName = requireFixtureString(
  baseReleaseCasePackage.cluster.cluster_name,
  "Release browser smoke requires a named cluster fixture.",
);

const releaseCasePackage = {
  ...baseReleaseCasePackage,
  package_id: "pkg-release-smoke-imported-001",
  case: {
    ...baseReleaseCasePackage.case,
    title: "Release smoke imported IAM role provisioning region",
  },
};

type ReviewRunOptions = {
  quickDisposition?: boolean;
  useKeyboard?: boolean;
};

type SmokeServer = ChildProcess & {
  serverOutput: string[];
};

function requireFixtureString(value: string | undefined, message: string): string {
  if (!value) throw new Error(message);
  return value;
}

async function run() {
  const hotFolder = await mkdtemp(
    path.join(tmpdir(), "telemetry-court-release-smoke-"),
  );
  let server: SmokeServer | undefined;

  try {
    const hotFolderPackageFilename = await writePackageWithPythonClient(hotFolder);
    server = startServer(hotFolder);
    await waitForServer(server);
    await runBrowserLoop(hotFolder, hotFolderPackageFilename);
    console.log("Release browser and local-loop smoke: PASS");
  } finally {
    await stopServer(server);
    await rm(hotFolder, { recursive: true, force: true });
  }
}

async function runBrowserLoop(hotFolder: string, hotFolderPackageFilename: string) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  let page = await context.newPage();
  const browserErrors: string[] = [];

  observeBrowserErrors(page, browserErrors);

  try {
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await loadNewestHotFolderPackage(page);
    await dismissImportSummaryIfOpen(page);
    await configureReviewer(page);
    const importedReview = await completeReview(page);
    assertReviewResult(importedReview, releaseCasePackage.package_id);
    await rm(path.join(hotFolder, hotFolderPackageFilename), { force: true });

    await page.close();
    page = await context.newPage();
    observeBrowserErrors(page, browserErrors);
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await activateControl(
      page,
      page.getByRole("button", { name: "Open case file" }),
      true,
    );
    await expectPath(page, "/case-file");
    const builtInReview = await completeReview(page, {
      quickDisposition: true,
      useKeyboard: true,
    });
    assertReviewResult(builtInReview, "pkg-synthetic-arena-001");
    const reviewBundlePath = await exportCurrentReviewBundle(page);
    await clearResultsCasePackageCache(page);

    await page.goto(new URL("/results", baseUrl).toString(), {
      waitUntil: "networkidle",
    });
    await expectText(page.locator("body"), "Full evidence ReviewResults");
    await expectText(page.locator("body"), "Quick dispositions");
    await expectText(page.locator("body"), "Results map unavailable");

    await exerciseResultsImports(page, reviewBundlePath);
    await loadMapPackageWithoutCoordinates(page);
    await expectText(
      page.locator("body"),
      "does not include cluster embedding_map coordinates",
    );
    await loadResultsMapPackage(page, releaseCasePackage);

    const refinementPath = await downloadRefinement(page);
    const refinement = JSON.parse(await readFile(refinementPath, "utf8"));
    if (refinement.schema_version !== "cluster_refinement.v0.1") {
      throw new Error("Results exported an unexpected refinement schema.");
    }
    const hotFolderRefinementPath = path.join(
      hotFolder,
      "browser-roundtrip.cluster-refinement.json",
    );
    await copyFile(refinementPath, hotFolderRefinementPath);
    await readRefinementWithPythonClient(hotFolder, hotFolderRefinementPath);
    await assertHotFolderCasePackageScanIsClean(page);

    await verifyResponsiveResults(page);
    await assertNoRuntimeErrors(page, browserErrors);
    await verifyCorruptBrowserStateFailsSafely(browser);
  } finally {
    await browser.close();
  }
}

async function configureReviewer(page: Page) {
  const metadataDisclosure = page.getByLabel(/Edit export metadata:/);
  await metadataDisclosure.click();
  await page.getByLabel("Local reviewer ID").fill("release-smoke-reviewer");
  await page.getByLabel("Review context").selectOption("local_review");
  await metadataDisclosure.click();
}

async function dismissImportSummaryIfOpen(page: Page) {
  const closeSummary = page.getByRole("button", { name: "Close summary" });
  await closeSummary.waitFor({ state: "visible", timeout: 2_000 }).catch(() => {
    // Auto-loading is optional; absence of the dialog is a valid state.
  });
  if (await closeSummary.isVisible().catch(() => false)) {
    await closeSummary.click();
  }
}

async function loadNewestHotFolderPackage(page: Page) {
  await page
    .waitForURL((url) => url.pathname === "/case-file", { timeout: 5_000 })
    .catch(() => undefined);

  if (new URL(page.url()).pathname === "/case-file") {
    await expectText(page.locator("body"), releaseClusterName);
    return;
  }

  await page.getByRole("button", { name: "Check Hot-Folder" }).click();
  const loadNewest = page.getByRole("button", { name: "Load newest" });
  await Promise.any([
    page.waitForURL((url) => url.pathname === "/case-file", {
      timeout: 10_000,
    }),
    loadNewest.waitFor({ state: "visible", timeout: 10_000 }),
  ]).catch(() => {
    throw new Error("Hot-Folder package did not auto-load or expose Load newest.");
  });

  if (new URL(page.url()).pathname === "/case-file") {
    await expectText(page.locator("body"), releaseCasePackage.case.title);
    return;
  }

  await loadNewest.click();
  await expectPath(page, "/case-file");
  await expectText(page.locator("body"), releaseClusterName);
}

async function completeReview(
  page: Page,
  { quickDisposition = false, useKeyboard = false }: ReviewRunOptions = {},
) {
  if (quickDisposition) {
    const quickDownloadPromise = page.waitForEvent("download");
    await activateControl(
      page,
      page.getByRole("button", { name: "Cannot judge from this package" }),
      useKeyboard,
    );
    const quickDownload = await quickDownloadPromise;
    const quickPath = requireDownloadPath(
      quickDownload.suggestedFilename(),
      await quickDownload.path(),
    );
    const quickArtifact = JSON.parse(await readFile(quickPath, "utf8"));
    if (
      quickArtifact.schema_version !== "quick_disposition.v0.1" ||
      quickArtifact.disposition !== "cannot_judge_from_package"
    ) {
      throw new Error("Quick disposition download did not preserve its boundary.");
    }
    await activateControl(
      page,
      page.getByRole("button", { name: "Continue full review" }),
      useKeyboard,
    );
  } else {
    await activateControl(
      page,
      page.getByRole("button", { name: "Start validation" }),
      useKeyboard,
    );
  }

  await expectPath(page, "/blind-read");
  await selectRadioControl(
    page,
    page.locator('input[name="review-readiness"]').first(),
    useKeyboard,
  );
  await selectRadioControl(
    page,
    page.locator('input[name="blind-interpretation"]').first(),
    useKeyboard,
  );
  await activateControl(
    page,
    page.getByRole("button", {
      name: /^(Reveal AI claim|Continue to AI Claim Check)/,
    }),
    useKeyboard,
  );
  await expectPath(page, "/ai-reveal");
  await activateControl(
    page,
    page.getByRole("button", { name: "Proceed to verification" }),
    useKeyboard,
  );
  await expectPath(page, "/evidence-board");

  const firstEvidence = page.locator("#evidence-review-item-0");
  await activateControl(
    page,
    firstEvidence.getByRole("button", { name: /^Weak support/ }),
    useKeyboard,
  );
  await expectAttribute(
    firstEvidence.getByRole("button", { name: /^Weak support/ }),
    "aria-pressed",
    "true",
  );
  await activateControl(
    page,
    page.getByRole("button", {
      name: /Proceed to label selection|Select label/,
    }),
    useKeyboard,
  );
  await expectPath(page, "/label-duel");

  await activateControl(page, page.locator(".duel-card-primary"), useKeyboard);
  await activateControl(
    page,
    page.getByRole("button", { name: "Proceed to cluster fit check" }),
    useKeyboard,
  );
  await expectPath(page, "/impostor");
  await activateControl(
    page,
    page.locator(".session-comparison-card.is-strongest"),
    useKeyboard,
  );
  const confirmation = page.getByRole("button", {
    name: "Confirm representative session as outlier / impostor",
  });
  if (await confirmation.isVisible().catch(() => false)) {
    await activateControl(page, confirmation, useKeyboard);
  }
  await activateControl(
    page,
    page.getByRole("button", { name: "Continue to final evaluation" }),
    useKeyboard,
  );
  await expectPath(page, "/verdict");
  await activateControl(
    page,
    page.getByRole("button", { name: "Unsupported / overclaimed" }),
    useKeyboard,
  );

  const reviewDownloadPromise = page.waitForEvent("download");
  await activateControl(
    page,
    page.getByRole("button", { name: "Export review result" }),
    useKeyboard,
  );
  const reviewDownload = await reviewDownloadPromise;
  const reviewPath = await requireDownloadPath(
    reviewDownload.suggestedFilename(),
    await reviewDownload.path(),
  );

  return JSON.parse(await readFile(reviewPath, "utf8"));
}

async function activateControl(
  page: Page,
  control: Locator,
  useKeyboard: boolean,
) {
  await control.waitFor({ state: "visible", timeout: 10_000 });

  if (!useKeyboard) {
    await control.click();
    return;
  }

  await control.focus();
  await page.keyboard.press("Enter");
}

async function selectRadioControl(
  page: Page,
  control: Locator,
  useKeyboard: boolean,
) {
  if (!useKeyboard) {
    await control.check();
    return;
  }

  await control.focus();
  await page.keyboard.press("Space");
  if (!(await control.isChecked())) {
    throw new Error("Keyboard selection did not check the focused radio control.");
  }
}

async function exportCurrentReviewBundle(page: Page): Promise<string> {
  await page.getByText("Review outputs", { exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export reviews" }).click();
  const download = await downloadPromise;
  const downloadPath = await requireDownloadPath(
    download.suggestedFilename(),
    await download.path(),
  );
  const bundle = JSON.parse(await readFile(downloadPath, "utf8"));

  if (
    bundle.schema_version !== "review_result_bundle.v0.1" ||
    bundle.review_results.length !== 1
  ) {
    throw new Error("ReviewResult bundle export was not compatible and scoped.");
  }

  return downloadPath;
}

async function exerciseResultsImports(page: Page, reviewBundlePath: string) {
  const reviewInput = page.locator(".local-results-import input").nth(0);
  await reviewInput.setInputFiles({
    name: "invalid-review.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"private_marker":"must-not-leak"'),
  });
  await expectText(
    page.locator(".local-results-import"),
    "Review artifact JSON is malformed",
  );
  if ((await page.locator("body").innerText()).includes("must-not-leak")) {
    throw new Error("Invalid ReviewResult content leaked into the Results UI.");
  }

  await reviewInput.setInputFiles(reviewBundlePath);
  await expectText(page.locator(".local-results-import"), "already exists");
}

async function loadMapPackageWithoutCoordinates(page: Page) {
  const packageWithoutCoordinates = {
    ...releaseCasePackage,
    cluster: {
      ...releaseCasePackage.cluster,
      embedding_map: undefined,
    },
  };
  await loadResultsMapPackage(page, packageWithoutCoordinates);
  await expectText(page.locator(".local-results-import"), "without coordinates");
}

async function loadResultsMapPackage(page: Page, casePackage: unknown) {
  const mapInput = page.locator(".local-results-import input").nth(1);
  await mapInput.setInputFiles({
    name: "safe-case-package.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(casePackage)),
  });
  await expectText(page.locator(".local-results-import"), "Imported CasePackage");
}

async function downloadRefinement(page: Page): Promise<string> {
  const button = page
    .locator("button:enabled")
    .filter({ hasText: "Download refinement JSON" })
    .first();
  await button.waitFor({ state: "visible" });
  const downloadPromise = page.waitForEvent("download");
  await button.click();
  const download = await downloadPromise;
  return requireDownloadPath(download.suggestedFilename(), await download.path());
}

async function verifyResponsiveResults(page: Page) {
  for (const width of [820, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    if (dimensions.content > dimensions.viewport + 1) {
      throw new Error(
        `Results overflow at ${width}px: ${dimensions.content}px content for ${dimensions.viewport}px viewport.`,
      );
    }
  }
}

async function assertHotFolderCasePackageScanIsClean(page: Page) {
  const response = await page.request.get(
    new URL("/api/hot-folder/casepackages", baseUrl).toString(),
  );
  const scan = (await response.json()) as {
    validCandidates?: unknown[];
    invalidCandidates?: unknown[];
  };

  if (
    !response.ok() ||
    !Array.isArray(scan.validCandidates) ||
    !Array.isArray(scan.invalidCandidates) ||
    scan.validCandidates.length !== 0 ||
    scan.invalidCandidates.length !== 0
  ) {
    throw new Error(
      "The shared Hot-Folder did not distinguish refinement output from CasePackage candidates.",
    );
  }
}

async function verifyCorruptBrowserStateFailsSafely(browser: Browser) {
  const marker = "private-storage-marker-must-not-leak";
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  const browserErrors: string[] = [];
  observeBrowserErrors(page, browserErrors);

  try {
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.evaluate(
      ({ arenaKey, reviewKey, suppliedMarker }) => {
        window.sessionStorage.setItem(
          arenaKey,
          JSON.stringify({
            selectedCaseId: "case-synthetic-001",
            reviewsByCase: {
              "case-synthetic-001": {
                blindChoiceId: { suppliedMarker },
                aiLabelRevealed: "yes",
                evidenceRatings: { [suppliedMarker]: "supports_label" },
              },
            },
          }),
        );
        window.localStorage.setItem(
          reviewKey,
          JSON.stringify({
            schema_version: suppliedMarker,
            review_results_by_case_package_id: {},
          }),
        );
      },
      {
        arenaKey: arenaSessionStateKey,
        reviewKey: reviewResultLocalStoreKey,
        suppliedMarker: marker,
      },
    );

    await page.goto(new URL("/evidence-board", baseUrl).toString(), {
      waitUntil: "networkidle",
    });
    await expectPath(page, "/blind-read");
    await expectText(page.locator("body"), "Initial Assessment");
    await expectAbsentText(page.locator("body"), marker);
    await expectAbsentText(
      page.locator("body"),
      "Deterministic mocked evidence assistance",
    );

    await page.goto(new URL("/results", baseUrl).toString(), {
      waitUntil: "networkidle",
    });
    await expectText(
      page.locator("body"),
      "Browser-local review artifacts are invalid",
    );
    await expectText(page.locator("body"), "Supplied values are not shown");
    await expectAbsentText(page.locator("body"), marker);
    await assertNoRuntimeErrors(page, browserErrors);
  } finally {
    await context.close();
  }
}

function assertReviewResult(review: Record<string, unknown>, packageId: string) {
  const packageReference = review.case_package as
    | Record<string, unknown>
    | undefined;
  if (
    review.schema_version !== "review_result.v0.1" ||
    packageReference?.package_id !== packageId ||
    !isNonEmptyArray(
      (review.decisions as Record<string, unknown> | undefined)
        ?.evidence_ratings,
    )
  ) {
    throw new Error(`ReviewResult export failed for ${packageId}.`);
  }
}

function isNonEmptyArray(value: unknown): value is unknown[] {
  return Array.isArray(value) && value.length > 0;
}

function observeBrowserErrors(page: Page, browserErrors: string[]) {
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text());
  });
  page.on("pageerror", (error) => browserErrors.push(error.message));
}

async function clearResultsCasePackageCache(page: Page) {
  await page.evaluate((key) => {
    window.sessionStorage.removeItem(key);
  }, casePackageSessionStoreKey);
}

async function expectPath(page: Page, expectedPath: string) {
  await page.waitForURL((url) => url.pathname === expectedPath, {
    timeout: 10_000,
  });
}

async function expectText(locator: Locator, expected: string) {
  const deadline = Date.now() + 8_000;
  let lastText = "";
  while (Date.now() < deadline) {
    lastText = await locator.innerText();
    if (
      lastText.toLocaleLowerCase().includes(expected.toLocaleLowerCase())
    ) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(
    `Expected visible text: ${expected}\nVisible text excerpt: ${lastText.slice(0, 2_000)}`,
  );
}

async function expectAbsentText(locator: Locator, unexpected: string) {
  const visibleText = await locator.innerText();
  if (
    visibleText.toLocaleLowerCase().includes(unexpected.toLocaleLowerCase())
  ) {
    throw new Error(`Unexpected visible text: ${unexpected}`);
  }
}

async function expectAttribute(
  locator: Locator,
  name: string,
  expected: string,
) {
  const actual = await locator.getAttribute(name);
  if (actual !== expected) {
    throw new Error(`Expected ${name}=${expected}, received ${actual}.`);
  }
}

async function assertNoRuntimeErrors(page: Page, browserErrors: string[]) {
  if (await page.locator("[data-nextjs-dialog]").count()) {
    throw new Error("Next.js error overlay appeared during release smoke.");
  }
  if (browserErrors.length > 0) {
    throw new Error(`Browser errors detected:\n${browserErrors.join("\n")}`);
  }
}

function requireDownloadPath(
  suggestedFilename: string,
  downloadPath: string | null,
): string {
  if (!downloadPath) {
    throw new Error(`Download ${suggestedFilename} did not produce a local file.`);
  }
  return downloadPath;
}

async function writePackageWithPythonClient(hotFolder: string): Promise<string> {
  const script = [
    "import json, pathlib, sys",
    "sys.path.insert(0, str(pathlib.Path.cwd() / 'python'))",
    "from telemetry_court_client import TelemetryCourtHotFolder",
    "package = json.load(sys.stdin)",
    "client = TelemetryCourtHotFolder(pathlib.Path(sys.argv[1]))",
    "print(client.write_case_package(package)['filename'])",
  ].join("; ");
  return (await runPython(script, [hotFolder], JSON.stringify(releaseCasePackage))).trim();
}

async function readRefinementWithPythonClient(
  hotFolder: string,
  refinementPath: string,
) {
  const script = [
    "import pathlib, sys",
    "sys.path.insert(0, str(pathlib.Path.cwd() / 'python'))",
    "from telemetry_court_client import TelemetryCourtHotFolder",
    "client = TelemetryCourtHotFolder(pathlib.Path(sys.argv[1]))",
    "artifact = client.read_refinement(pathlib.Path(sys.argv[2]))",
    "print(artifact['schema_version'])",
  ].join("; ");
  const output = await runPython(script, [hotFolder, refinementPath]);
  if (!output.includes("cluster_refinement.v0.1")) {
    throw new Error("Python companion did not read the exported refinement.");
  }
}

async function runPython(
  script: string,
  args: string[],
  input?: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn("python3", ["-c", script, ...args], {
      cwd: process.cwd(),
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += chunk.toString()));
    child.stderr.on("data", (chunk) => (stderr += chunk.toString()));
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`Python companion exited ${code}: ${stderr}`));
    });
    child.stdin.end(input);
  });
}

function startServer(hotFolder: string): SmokeServer {
  const nextCli = path.resolve("node_modules/next/dist/bin/next");
  const serverOutput: string[] = [];
  const child = spawn(
    process.execPath,
    [nextCli, "dev", "--hostname", "127.0.0.1", "--port", port],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        NEXT_TELEMETRY_DISABLED: "1",
        TELEMETRY_COURT_HOT_FOLDER: hotFolder,
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  ) as SmokeServer;

  child.serverOutput = serverOutput;
  for (const stream of [child.stdout, child.stderr]) {
    stream?.on("data", (chunk) => {
      serverOutput.push(chunk.toString());
      if (serverOutput.length > 40) {
        serverOutput.shift();
      }
    });
  }

  return child;
}

async function waitForServer(server: SmokeServer) {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(
        `Next.js exited before the release smoke started.\n${server.serverOutput.join("")}`,
      );
    }
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // The bounded retry is expected while the local server starts.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for ${baseUrl}.`);
}

async function stopServer(server?: ChildProcess) {
  if (!server || server.exitCode !== null) return;
  server.kill("SIGTERM");
  await waitForServerExit(server, 5_000);
  if (server.exitCode === null) server.kill("SIGKILL");
  await waitForServerExit(server, 5_000);
  await new Promise((resolve) => setTimeout(resolve, 750));
}

async function waitForServerExit(server: ChildProcess, timeoutMs: number) {
  if (server.exitCode !== null) return;
  await Promise.race([
    new Promise((resolve) => server.once("exit", resolve)),
    new Promise((resolve) => setTimeout(resolve, timeoutMs)),
  ]);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
