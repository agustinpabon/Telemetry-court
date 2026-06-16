import assert from "node:assert/strict";
import test from "node:test";

import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import * as homePageModule from "@/app/page";
import { CaseSwitcher } from "@/components/CaseSwitcher";
import { ClaimLedger } from "@/components/ClaimLedger";
import { EvidenceCard } from "@/components/EvidenceCard";
import { ScorePanel } from "@/components/ScorePanel";
import { sampleCases } from "@/data/sampleCases";
import { getRelationsForEvidence } from "@/lib/caseMetrics";

function getDefaultComponent(moduleValue: unknown): React.ComponentType {
  let currentValue = moduleValue;

  for (let depth = 0; depth < 3; depth += 1) {
    if (typeof currentValue === "function") {
      return currentValue as React.ComponentType;
    }

    if (
      currentValue &&
      typeof currentValue === "object" &&
      "default" in currentValue
    ) {
      currentValue = (currentValue as { default: unknown }).default;
      continue;
    }

    break;
  }

  throw new Error("Home page module did not expose a renderable component.");
}

function renderHomePageText(): string {
  const HomePage = getDefaultComponent(homePageModule);
  const html = renderToStaticMarkup(React.createElement(HomePage));

  return html.replace(/\s+/g, " ");
}

function renderStaticMarkup(element: React.ReactElement): string {
  return renderToStaticMarkup(element).replace(/\s+/g, " ");
}

test("home page static review flow exposes the core Telemetry Court concepts", () => {
  const pageText = renderHomePageText();

  assert.match(pageText, /Telemetry Court/);
  assert.match(pageText, /Evidence review for AI-named telemetry clusters\./);
  assert.match(pageText, /Evidence landscape/);
  assert.match(
    pageText,
    /Open a region to test whether the model&#x27;s label is supported by evidence\./,
  );
  assert.doesNotMatch(pageText, /AI names the pattern\. Humans test the evidence\./);
  assert.doesNotMatch(pageText, /Telemetry Galaxy/);
  assert.doesNotMatch(pageText, /Semantic evidence atlas/);
  assert.match(pageText, /Proximity/);
  assert.match(pageText, /Region size/);
  assert.match(pageText, /Ring/);
  assert.match(pageText, /Tint/);
  assert.match(pageText, /Dashed line/);
  assert.match(pageText, /Selected region/);
  assert.match(pageText, /Review state/);
  assert.match(pageText, /IN REVIEW/);
  assert.match(pageText, /Claim under test/);
  assert.match(pageText, /Why investigate/);
  assert.match(pageText, /Review metadata/);
  assert.match(pageText, /Verdict/);
  assert.match(pageText, /Evidence/);
  assert.match(pageText, /Uncertainty/);
  assert.match(pageText, /126 sessions/);
  assert.match(pageText, /OVERCLAIM/);
  assert.match(pageText, /THIN/);
  assert.match(pageText, /72%/);
  assert.match(pageText, /Open case file/);
  assert.doesNotMatch(pageText, /Investigation Cockpit/);
  assert.doesNotMatch(pageText, /Hidden until blind read/);
  assert.match(pageText, /Review JSON/);
  assert.match(pageText, /Case File/);
  assert.match(pageText, /Blind Read/);
  assert.match(pageText, /AI Reveal/);
  assert.match(pageText, /Evidence Board/);
  assert.match(pageText, /Label Duel/);
  assert.match(pageText, /Impostor/);
  assert.match(pageText, /Verdict/);
});

test("telemetry galaxy renders every synthetic behavioural region", () => {
  const pageText = renderHomePageText();
  const compactMapLabels = [
    "IAM roles",
    "PowerShell",
    "Service maint.",
    "S3 enum.",
    "Cred prep",
  ];

  for (const caseFile of sampleCases) {
    assert.match(pageText, new RegExp(caseFile.cluster.name));
  }

  for (const label of compactMapLabels) {
    assert.match(pageText, new RegExp(label.replace(".", "\\.")));
  }

  assert.match(pageText, /OVERCLAIM/);
  assert.match(pageText, /SUPPORTED/);
  assert.match(pageText, /MIXED/);
  assert.match(pageText, /TOO BROAD/);
  assert.match(pageText, /UNCERTAIN/);
});

test("shared review UI keeps contradicted and unsupported styling distinct", () => {
  const contradictedCase = sampleCases[0];
  const mixedStatusCase = sampleCases[1];
  const contradictingEvidence = mixedStatusCase.evidenceItems.find(
    (evidence) => evidence.id === "ps-e-04",
  );

  assert.ok(contradictingEvidence);

  const markup = renderStaticMarkup(
    React.createElement(
      React.Fragment,
      null,
      React.createElement(CaseSwitcher, {
        cases: sampleCases,
        selectedCaseId: contradictedCase.id,
        onSelect: () => undefined,
      }),
      React.createElement(ClaimLedger, {
        caseFile: mixedStatusCase,
        claims: mixedStatusCase.claims,
        selectedClaimId: "ps-c-03",
        onSelectClaim: () => undefined,
        onClearClaim: () => undefined,
      }),
      React.createElement(ScorePanel, { caseFile: contradictedCase }),
      React.createElement(EvidenceCard, {
        evidence: contradictingEvidence,
        relations: getRelationsForEvidence(mixedStatusCase, contradictingEvidence.id),
      }),
    ),
  );

  assert.match(markup, /Contradicted/);
  assert.match(markup, /Unsupported/);
  assert.match(
    markup,
    /bg-\[var\(--color-contradicted-soft\)\] text-\[var\(--color-contradicted\)\]/,
  );
  assert.match(
    markup,
    /bg-\[var\(--color-unsupported-soft\)\] text-\[var\(--color-unsupported\)\]/,
  );
  assert.match(markup, /text-\[var\(--color-contradicted\)\]/);
  assert.match(markup, /text-\[var\(--color-unsupported\)\]/);
});
