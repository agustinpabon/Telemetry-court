import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";

import { chromium } from "playwright";

const externallyManagedBaseUrl = process.env.TELEMETRY_COURT_BASE_URL;
const port = process.env.TELEMETRY_COURT_BROWSER_TEST_PORT ?? "3206";
const baseUrl = externallyManagedBaseUrl ?? `http://127.0.0.1:${port}`;
const seededState = {
  selectedCaseId: "case-arena-001",
  reviewsByCase: {
    "case-arena-001": {
      blindChoiceId: "none-of-these",
      aiLabelRevealed: true,
      evidenceRatings: {},
    },
  },
};

async function run() {
  const server = externallyManagedBaseUrl ? undefined : startServer();

  try {
    await waitForServer(baseUrl, server);
    await verifyEvidenceAssistance();
    console.log("Evidence assistance browser smoke: PASS");
  } finally {
    await stopServer(server);
  }
}

function startServer() {
  const nextCli = path.resolve("node_modules/next/dist/bin/next");
  const output = [];
  const child = spawn(
    process.execPath,
    [nextCli, "dev", "--hostname", "127.0.0.1", "--port", port],
    {
      cwd: process.cwd(),
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  for (const stream of [child.stdout, child.stderr]) {
    stream?.on("data", (chunk) => {
      output.push(chunk.toString());
      if (output.length > 40) output.shift();
    });
  }

  child.serverOutput = output;
  return child;
}

async function waitForServer(url, server) {
  const deadline = Date.now() + 60_000;

  while (Date.now() < deadline) {
    if (server?.exitCode !== null) {
      throw new Error(
        `Next.js exited before browser smoke startup.\n${server.serverOutput.join("")}`,
      );
    }

    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The bounded retry is expected while the local Next.js server starts.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(
    `Timed out waiting for ${url}.\n${server?.serverOutput.join("") ?? ""}`,
  );
}

async function verifyEvidenceAssistance() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const browserErrors = [];

  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text());
  });
  page.on("pageerror", (error) => browserErrors.push(error.message));

  try {
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.evaluate((state) => {
      window.sessionStorage.setItem(
        "telemetry-court-arena-state-v1",
        JSON.stringify(state),
      );
    }, seededState);

    await assertAssistanceAbsent(page, "/blind-read");
    await assertAssistanceAbsent(page, "/ai-reveal");
    await page.goto(new URL("/evidence-board", baseUrl).toString(), {
      waitUntil: "networkidle",
    });

    const panel = page.locator(".evidence-assistance-panel");
    await expectCount(panel, 1, "Evidence Board assistance panel");
    await panel.locator("summary").click();

    const firstEvidence = page.locator("#evidence-review-item-0");
    const weakSupport = firstEvidence.getByRole("button", {
      name: /^Weak support/,
    });
    await weakSupport.click();
    await expectAttribute(weakSupport, "aria-pressed", "true");

    await panel.getByLabel("Fixed question").selectOption(
      "question-cluster-impurity-v01",
    );
    await panel.getByLabel("Evidence filter (optional)").selectOption(
      "iam-e-01",
    );
    await panel.getByLabel("Claim filter (optional)").selectOption(
      "iam-c-01",
    );
    await panel.getByLabel("Label filter (optional)").selectOption(
      "label-iam-baseline",
    );
    await panel.getByRole("button", { name: "Check package evidence" }).click();

    await expectText(panel, "Status: Insufficient evidence");
    await expectText(panel, "Guardrail status");
    await expectText(panel, "iam-e-01");
    await expectText(panel, "iam-c-01");
    await expectText(panel, "label-iam-baseline");
    await expectAttribute(weakSupport, "aria-pressed", "true");

    await panel.getByLabel("Fixed question").selectOption(
      "question-claim-supporting-evidence-v01",
    );
    await panel.getByLabel("Claim reference").selectOption("iam-c-01");
    await panel.getByRole("button", { name: "Check package evidence" }).click();
    await expectText(panel, "Status: Answered");
    await expectText(panel, "iam-e-01");

    await panel
      .getByRole("button", { name: "iam-e-01" })
      .first()
      .click();
    const focusedEvidenceId = await page.evaluate(
      () => document.activeElement?.id,
    );
    if (focusedEvidenceId !== "evidence-review-item-0") {
      throw new Error(
        `Expected cited evidence focus on evidence-review-item-0, received ${focusedEvidenceId ?? "none"}.`,
      );
    }
    await expectAttribute(weakSupport, "aria-pressed", "true");

    if (
      await panel
        .locator("textarea, input[type='text'], [contenteditable='true']")
        .count()
    ) {
      throw new Error("Arbitrary text input appeared in the assistance surface.");
    }
    if (await page.locator("[data-nextjs-dialog]").count()) {
      throw new Error("Next.js error overlay appeared during assistance smoke.");
    }
    if (browserErrors.length > 0) {
      throw new Error(`Browser errors detected:\n${browserErrors.join("\n")}`);
    }
  } finally {
    await browser.close();
  }
}

async function assertAssistanceAbsent(page, route) {
  await page.goto(new URL(route, baseUrl).toString(), { waitUntil: "networkidle" });
  await expectCount(
    page.locator(".evidence-assistance-panel"),
    0,
    `${route} assistance panel`,
  );
}

async function expectCount(locator, expected, label) {
  const actual = await locator.count();
  if (actual !== expected) {
    throw new Error(`Expected ${label} count ${expected}, received ${actual}.`);
  }
}

async function expectAttribute(locator, name, expected) {
  const actual = await locator.getAttribute(name);
  if (actual !== expected) {
    throw new Error(`Expected ${name}=${expected}, received ${actual}.`);
  }
}

async function expectText(locator, expected) {
  const deadline = Date.now() + 5_000;

  while (Date.now() < deadline) {
    const text = await locator.innerText();
    if (text.toLocaleLowerCase().includes(expected.toLocaleLowerCase())) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  throw new Error(
    `Expected assistance output to include ${expected}. Received:\n${await locator.innerText()}`,
  );
}

async function stopServer(server) {
  if (!server || server.exitCode !== null) return;

  server.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => server.once("exit", resolve)),
    new Promise((resolve) => setTimeout(resolve, 5_000)),
  ]);
  if (server.exitCode === null) server.kill("SIGKILL");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
