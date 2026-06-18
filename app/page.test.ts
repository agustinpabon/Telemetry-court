import assert from "node:assert/strict";
import test from "node:test";

import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { AppShell } from "@/components/arena/AppShell";
import { BlindReadPanel } from "@/components/arena/BlindReadPanel";
import { CaseFilePanel } from "@/components/arena/CaseFilePanel";
import { getLandscapeAtlasPosition } from "@/components/arena/EvidenceGalaxyAtlas";
import { CaseSwitcher } from "@/components/CaseSwitcher";
import { ClaimLedger } from "@/components/ClaimLedger";
import { EvidenceCard } from "@/components/EvidenceCard";
import { ScorePanel } from "@/components/ScorePanel";
import {
  sampleCases,
  sampleLandscapeContextNodes,
} from "@/data/sampleCases";
import {
  arenaRouteEntries,
  getArenaStageForSlug,
  getPathForArenaStage,
} from "@/lib/arenaRoutes";
import { getRelationsForEvidence } from "@/lib/caseMetrics";

function renderHomePageText(): string {
  const html = renderToStaticMarkup(
    React.createElement(AppShell, {
      cases: sampleCases,
      landscapeContextNodes: sampleLandscapeContextNodes,
      initialStage: "landscape",
      pathname: "/",
      onNavigatePath: () => undefined,
    }),
  );

  return html.replace(/\s+/g, " ");
}

function renderCaseFilePageText(): string {
  const html = renderToStaticMarkup(
    React.createElement(AppShell, {
      cases: sampleCases,
      landscapeContextNodes: sampleLandscapeContextNodes,
      initialStage: "case_file",
      pathname: "/case-file",
      onNavigatePath: () => undefined,
    }),
  );

  return html.replace(/\s+/g, " ");
}

function renderBlindReadPageText(): string {
  const html = renderToStaticMarkup(
    React.createElement(AppShell, {
      cases: sampleCases,
      landscapeContextNodes: sampleLandscapeContextNodes,
      initialStage: "blind_read",
      pathname: "/blind-read",
      onNavigatePath: () => undefined,
    }),
  );

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

test("evidence landscape context data exposes the IAM nearest neighbour", () => {
  const iamNeighbour = sampleLandscapeContextNodes.find(
    (node) => node.cluster.id === "cluster-iam-041",
  );
  const pageText = renderHomePageText();

  assert.ok(iamNeighbour);
  assert.equal(iamNeighbour.nodeType, "context");
  assert.equal(iamNeighbour.label, "Standard platform role lifecycle");
  assert.equal(iamNeighbour.nearestNeighbor.clusterId, "cluster-iam-029");
  const position = getLandscapeAtlasPosition(iamNeighbour);
  assert.equal(position.x.toFixed(2), "49.12");
  assert.equal(position.y.toFixed(2), "59.36");
  assert.match(pageText, /cluster-iam-041 context node/);
});

test("case file intake summarizes the selected region before blind investigation", () => {
  const pageText = renderCaseFilePageText();

  assert.match(pageText, /Case File/);
  assert.match(pageText, /IAM role provisioning region/);
  assert.match(pageText, /cluster-iam-029/);
  assert.match(pageText, /Evidence gap/);
  assert.match(pageText, /Review status/);
  assert.match(pageText, /Region context/);
  assert.match(pageText, /Where this case sits before the blind read\./);
  assert.match(
    pageText,
    /cluster-iam-029.*is closest to a routine role lifecycle neighbour, but evidence strength is lower than uncertainty\./,
  );
  assert.match(pageText, /Selected region/);
  assert.match(pageText, /Needs evidence/);
  assert.match(pageText, /Nearest neighbour/);
  assert.match(pageText, /cluster-iam-041/);
  assert.match(pageText, /Standard platform role lifecycle/);
  assert.match(pageText, /Similarity/);
  assert.match(pageText, /Close neighbour/);
  assert.match(pageText, /Evidence strength/);
  assert.match(pageText, /38%/);
  assert.match(pageText, /Uncertainty/);
  assert.match(pageText, /72%/);
  assert.match(
    pageText,
    /This suggests the selected region may belong near routine IAM administration rather than a malicious interpretation\./,
  );
  assert.match(pageText, /Review before assigning malicious intent\./);
  assert.match(pageText, /View in landscape/);
  assert.match(pageText, /Start blind investigation/);
  assert.match(pageText, /AI claim remains hidden until your first read\./);
  assert.match(pageText, /Landscape locator/);
  assert.match(pageText, /cluster-iam-029 selected/);
  assert.match(pageText, /cluster-iam-041 nearest neighbour/);
  assert.match(
    pageText,
    /This locator uses the same case coordinates as the Evidence Landscape\./,
  );
  assert.doesNotMatch(pageText, /Neighbour summary/);
  assert.doesNotMatch(
    pageText,
    /Comparison is based on nearest-neighbour metadata, not plotted geometry\./,
  );
  assert.doesNotMatch(pageText, /Resource discovery/);
  assert.doesNotMatch(pageText, /IAM administration neighbourhood/);
  assert.doesNotMatch(pageText, /Suspicious IAM privilege escalation/);
});

test("case file region context falls back when neighbour coordinates are unavailable", () => {
  const selectedCase = sampleCases[0];
  assert.ok(selectedCase);

  const markup = renderStaticMarkup(
    React.createElement(CaseFilePanel, {
      caseFile: selectedCase,
      cases: sampleCases,
      landscapeContextNodes: [],
      onStartInvestigation: () => undefined,
    }),
  );

  assert.match(markup, /Neighbour summary/);
  assert.match(
    markup,
    /Comparison is based on nearest-neighbour metadata, not plotted geometry\./,
  );
  assert.doesNotMatch(markup, /Landscape locator/);
});

test("case file region context renders a real locator for real context nodes", () => {
  const selectedCase = sampleCases[0];
  const neighbourNode = sampleLandscapeContextNodes.find(
    (node) => node.cluster.id === "cluster-iam-041",
  );
  assert.ok(selectedCase);
  assert.ok(neighbourNode);

  const selectedPosition = getLandscapeAtlasPosition(selectedCase);
  const neighbourPosition = getLandscapeAtlasPosition(neighbourNode);
  const markup = renderStaticMarkup(
    React.createElement(CaseFilePanel, {
      caseFile: selectedCase,
      cases: sampleCases,
      landscapeContextNodes: sampleLandscapeContextNodes,
      onStartInvestigation: () => undefined,
    }),
  );

  assert.match(markup, /Landscape locator/);
  assert.match(markup, /selected/);
  assert.match(markup, /nearest neighbour/);
  assert.match(markup, /context/);
  assert.match(markup, /cluster-iam-029 selected/);
  assert.match(markup, /cluster-iam-041 nearest neighbour/);
  assert.match(markup, new RegExp(`--locator-x:${selectedPosition.x}%`));
  assert.match(markup, new RegExp(`--locator-y:${selectedPosition.y}%`));
  assert.match(markup, new RegExp(`--locator-x:${neighbourPosition.x}%`));
  assert.match(markup, new RegExp(`--locator-y:${neighbourPosition.y}%`));
  assert.match(
    markup,
    /This locator uses the same case coordinates as the Evidence Landscape\./,
  );
  assert.doesNotMatch(markup, /Comparison is based on nearest-neighbour metadata/);
});

test("blind read protects the AI judgment until the reviewer chooses", () => {
  const pageText = renderBlindReadPageText();

  assert.match(pageText, /Read the evidence first\./);
  assert.match(
    pageText,
    /Choose what the behaviour supports before seeing the AI’s label\./,
  );
  assert.match(pageText, /AI claim hidden/);
  assert.match(
    pageText,
    /The model’s label is hidden until you submit your own interpretation\./,
  );
  assert.match(pageText, /Evidence summary/);
  assert.match(pageText, /What happened/);
  assert.match(pageText, /What limits a stronger conclusion/);
  assert.match(pageText, /What remains ambiguous/);
  assert.match(pageText, /Your interpretation/);
  assert.match(
    pageText,
    /What is the strongest conclusion supported by the evidence\?/,
  );
  assert.match(pageText, /Case status/);
  assert.match(pageText, /Stage<\/dt><dd>Blind Read/);
  assert.match(pageText, /AI claim<\/dt><dd>Hidden/);
  assert.match(pageText, /Your choice<\/dt><dd>Not selected yet/);
  assert.match(pageText, /Next step<\/dt><dd>Choose an interpretation/);
  assert.match(pageText, /Choose an interpretation to reveal AI label/);
  assert.match(pageText, /Possible privilege escalation/);
  assert.doesNotMatch(pageText, /Suspicious IAM privilege escalation/);
  assert.doesNotMatch(pageText, /OVERCLAIM/);
  assert.doesNotMatch(pageText, /Agreement/);
  assert.doesNotMatch(pageText, /Evidence support/);
  assert.doesNotMatch(pageText, /Uncertainty/);
  assert.doesNotMatch(pageText, /Average support/);
  assert.doesNotMatch(pageText, /Avg\. support/);
  assert.doesNotMatch(pageText, /38% evidence/);
});

test("blind interpretation choices render as accessible radio cards", () => {
  const selectedCase = sampleCases[0];
  assert.ok(selectedCase);

  const markup = renderStaticMarkup(
    React.createElement(BlindReadPanel, {
      caseFile: selectedCase,
      reviewState: { blindChoiceId: "routine-iam-provisioning" },
      onChooseBlindInterpretation: () => undefined,
      onRevealAiLabel: () => undefined,
    }),
  );

  assert.match(markup, /<fieldset class="blind-choice-fieldset"/);
  assert.match(markup, /type="radio"/);
  assert.match(markup, /name="blind-interpretation"/);
  assert.match(markup, /checked=""/);
  assert.match(markup, /Selected/);
  assert.match(markup, /Reveal AI label/);
  assert.doesNotMatch(markup, /disabled=""/);
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

test("arena routes map every main stage to a stable path", () => {
  assert.deepEqual(
    arenaRouteEntries.map((entry) => entry.path),
    [
      "/",
      "/case-file",
      "/blind-read",
      "/ai-reveal",
      "/evidence-board",
      "/label-duel",
      "/impostor",
      "/verdict",
    ],
  );

  for (const entry of arenaRouteEntries) {
    const slug = entry.path === "/" ? undefined : entry.path.slice(1);

    assert.equal(getPathForArenaStage(entry.stage), entry.path);
    assert.equal(getArenaStageForSlug(slug), entry.stage);
  }

  assert.equal(getArenaStageForSlug(["extra", "segment"]), null);
});
