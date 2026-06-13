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
  assert.match(pageText, /AI names the pattern\. Humans test the evidence\./);
  assert.match(pageText, /Telemetry Landscape/);
  assert.match(pageText, /Behavioural regions awaiting judgment/);
  assert.match(pageText, /Case File/);
  assert.match(pageText, /Blind Investigation/);
  assert.match(pageText, /AI Label Reveal/);
  assert.match(pageText, /Evidence Board/);
  assert.match(pageText, /Label Duel/);
  assert.match(pageText, /Find the Impostor/);
  assert.match(pageText, /Structured Verdict/);
  assert.match(pageText, /Review Summary/);
  assert.match(pageText, /View JSON/);
  assert.match(pageText, /Copy JSON/);
  assert.match(pageText, /Download JSON/);
});

test("home page smoke render includes a sample claim and linked evidence relationship", () => {
  const pageText = renderHomePageText();

  assert.match(
    pageText,
    /The evidence proves suspicious or malicious privilege escalation\./,
  );
  assert.match(pageText, /iam-e-01/);
  assert.match(pageText, /Role lifecycle feature stack/);
  assert.match(pageText, /Routine IAM role provisioning/);
  assert.match(pageText, /Suspicious IAM privilege escalation/);
  assert.match(pageText, /Supports label/);
  assert.match(pageText, /Contradicts label/);
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
