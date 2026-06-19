import assert from "node:assert/strict";
import test from "node:test";

import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { AppShell } from "@/components/arena/AppShell";
import { AiRevealPanel } from "@/components/arena/AiRevealPanel";
import { BlindReadPanel } from "@/components/arena/BlindReadPanel";
import { CaseFilePanel } from "@/components/arena/CaseFilePanel";
import { EvidenceBoard } from "@/components/arena/EvidenceBoard";
import { getLandscapeAtlasPosition } from "@/components/arena/EvidenceGalaxyAtlas";
import { ImpostorPanel } from "@/components/arena/ImpostorPanel";
import { LabelDuelPanel } from "@/components/arena/LabelDuelPanel";
import { VerdictPanel } from "@/components/arena/VerdictPanel";
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
import {
  getEvidenceBalance,
  getEvidenceRatings,
} from "@/lib/arenaReviewState";

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
  assert.match(pageText, /Step 1 of 8 · Landscape/);
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
  assert.match(pageText, /Case File/);
  assert.match(pageText, /Blind Read/);
  assert.match(pageText, /AI Reveal/);
  assert.match(pageText, /Evidence Board/);
  assert.match(pageText, /Label Duel/);
  assert.match(pageText, /Impostor/);
  assert.match(pageText, /Verdict/);
  assert.doesNotMatch(pageText, /Investigation stages/);
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
  assert.match(pageText, /Step 2 of 8 · Case File/);
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
  assert.match(pageText, /Return to landscape/);
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
  assert.doesNotMatch(pageText, /Investigation stages/);
  assert.doesNotMatch(pageText, />Next<\/button>/);
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

  assert.match(pageText, /Step 3 of 8 · Blind Read/);
  assert.match(pageText, /Judge the evidence first\./);
  assert.match(
    pageText,
    /Choose an independent interpretation before seeing the AI label\./,
  );
  assert.match(pageText, /Landscape/);
  assert.match(pageText, /Case File/);
  assert.match(pageText, /Blind Read/);
  assert.match(pageText, /AI Reveal/);
  assert.match(pageText, /Evidence Board/);
  assert.match(pageText, /Label Duel/);
  assert.match(pageText, /Impostor/);
  assert.match(pageText, /Verdict/);
  assert.match(pageText, /AI claim hidden/);
  assert.match(
    pageText,
    /The AI label remains sealed until you choose one interpretation below\./,
  );
  assert.match(pageText, /Selected behaviour region/);
  assert.match(
    pageText,
    /A small locator for the selected behaviour region and nearby sessions\./,
  );
  assert.match(pageText, /Evidence summary/);
  assert.match(pageText, /Observed/);
  assert.match(pageText, /Context/);
  assert.match(pageText, /Limitations/);
  assert.match(pageText, /Ambiguous signal/);
  assert.match(pageText, /Your interpretation/);
  assert.match(
    pageText,
    /What is the strongest conclusion supported by the evidence\?/,
  );
  assert.match(pageText, /AI claim hidden/);
  assert.match(pageText, /Choose an interpretation to continue/);
  assert.match(
    pageText,
    /Your choice will be saved before the AI label is shown\./,
  );
  assert.match(pageText, /Possible privilege escalation/);
  assert.match(pageText, /disabled=""/);
  assert.doesNotMatch(pageText, /Case status/);
  assert.doesNotMatch(pageText, /Step<\/dt><dd>3 of 8 · Blind Read/);
  assert.doesNotMatch(pageText, /Evidence visible/);
  assert.doesNotMatch(pageText, /Interpretation not selected/);
  assert.doesNotMatch(pageText, /IAM role provisioning region/);
  assert.doesNotMatch(pageText, /Suspicious IAM privilege escalation/);
  assert.doesNotMatch(pageText, /OVERCLAIM/);
  assert.doesNotMatch(pageText, /Agreement/);
  assert.doesNotMatch(pageText, /Evidence support/);
  assert.doesNotMatch(pageText, /Uncertainty/);
  assert.doesNotMatch(pageText, /Average support/);
  assert.doesNotMatch(pageText, /Avg\. support/);
  assert.doesNotMatch(pageText, /38% evidence/);
});

test("later review routes stay sealed until a blind interpretation exists", () => {
  const pageText = renderStaticMarkup(
    React.createElement(AppShell, {
      cases: sampleCases,
      landscapeContextNodes: sampleLandscapeContextNodes,
      initialStage: "ai_reveal",
      pathname: "/ai-reveal",
      onNavigatePath: () => undefined,
    }),
  );

  assert.match(pageText, /Judge the evidence first\./);
  assert.match(pageText, /Choose an interpretation to continue/);
  assert.match(pageText, /Selected behaviour region/);
  assert.doesNotMatch(pageText, /Suspicious IAM privilege escalation/);
  assert.doesNotMatch(pageText, /IAM role provisioning region/);
});

test("AI Reveal presents divergence as an evidence review moment", () => {
  const selectedCase = sampleCases[0];
  assert.ok(selectedCase);

  const reviewState = {
    blindChoiceId: "cloud-resource-discovery",
    aiLabelRevealed: true,
  };
  const markup = renderStaticMarkup(
    React.createElement(AiRevealPanel, {
      caseFile: selectedCase,
      reviewState,
      onRevealAiLabel: () => undefined,
      onContinue: () => undefined,
      onBackToBlindRead: () => undefined,
    }),
  );

  assert.match(markup, /Step 4 of 8 · AI Reveal/);
  assert.match(markup, /Your read and the AI label diverge\./);
  assert.match(
    markup,
    /You selected Cloud resource discovery\. The model suggested Suspicious IAM privilege escalation\./,
  );
  assert.match(markup, /Likely overclaim/);
  assert.match(markup, /Your blind read/);
  assert.match(markup, /Discovery-like activity is present/);
  assert.match(markup, /AI label/);
  assert.match(
    markup,
    /The model raised the severity because IAM role creation and policy attachment were observed\./,
  );
  assert.match(markup, /Why this may be an overclaim/);
  assert.match(markup, /Observed/);
  assert.match(markup, /IAM role creation and policy attachment\./);
  assert.match(markup, /Missing/);
  assert.match(
    markup,
    /No confirmed downstream abuse, sensitive data access, or malicious intent\./,
  );
  assert.match(markup, /Ambiguous/);
  assert.match(markup, /One PassRole-like probe appears outside the rollout window\./);
  assert.match(markup, /View scoring details/);
  assert.match(markup, /Evidence support for AI claim/);
  assert.match(markup, /Review evidence board/);
  assert.match(markup, /Back to blind read/);
  assert.doesNotMatch(markup, /Next<\/dt><dd>Evidence Board/);
  assert.doesNotMatch(markup, /Compare blind interpretation with the model claim/);
  assert.doesNotMatch(markup, /Disagreement/);
  assert.doesNotMatch(markup, />tests</);
  assert.doesNotMatch(markup, /Open evidence board/);
  assert.doesNotMatch(markup, /Open review summary/);
  assert.doesNotMatch(markup, /AI suggested:/);
  assert.doesNotMatch(markup, /2\/6 review steps complete/);
});

test("later workflow panels use compact chrome and descriptive actions", () => {
  const selectedCase = sampleCases[0];
  assert.ok(selectedCase);

  const evidenceRatings = getEvidenceRatings(selectedCase, {});
  const balance = getEvidenceBalance(selectedCase, evidenceRatings);
  const confirmedEvidenceReviewState = {
    blindChoiceId: "cloud-resource-discovery",
    aiLabelRevealed: true,
  };
  const markup = renderStaticMarkup(
    React.createElement(
      React.Fragment,
      null,
      React.createElement(EvidenceBoard, {
        caseFile: selectedCase,
        reviewState: confirmedEvidenceReviewState,
        evidenceRatings,
        balance,
        onRateEvidence: () => undefined,
        onBackToAiReveal: () => undefined,
        onContinue: () => undefined,
      }),
      React.createElement(LabelDuelPanel, {
        caseFile: selectedCase,
        reviewState: { labelDuelWinnerId: selectedCase.candidateLabels[0]?.id },
        onSelectWinner: () => undefined,
        onToggleReason: () => undefined,
        onBackToEvidenceBoard: () => undefined,
        onContinue: () => undefined,
      }),
      React.createElement(ImpostorPanel, {
        caseFile: selectedCase,
        reviewState: {
          impostorSessionId: selectedCase.representativeSessions[0]?.id,
        },
        onSelectSession: () => undefined,
        onBackToLabelDuel: () => undefined,
        onContinue: () => undefined,
      }),
      React.createElement(VerdictPanel, {
        caseFile: selectedCase,
        reviewState: { finalVerdict: "unsupported_overclaimed" },
        balance,
        onSelectVerdict: () => undefined,
        onToggleFailureMode: () => undefined,
        onBackToImpostor: () => undefined,
        onOpenReviewDrawer: () => undefined,
        onCopyJson: () => undefined,
        onDownloadJson: () => undefined,
      }),
    ),
  );

  assert.match(markup, /Step 5 of 8 · Evidence Board/);
  assert.match(markup, /Step 6 of 8 · Label Duel/);
  assert.match(markup, /Step 7 of 8 · Impostor/);
  assert.match(markup, /Step 8 of 8 · Verdict/);
  assert.match(markup, /Does the evidence support the AI claim\?/);
  assert.match(markup, /AI claim/);
  assert.match(markup, /Suspicious IAM privilege escalation/);
  assert.match(markup, /Your read/);
  assert.match(markup, /Cloud resource discovery/);
  assert.match(markup, /Evidence balance/);
  assert.match(markup, /IAM activity is present, but malicious escalation is not proven\./);
  assert.match(markup, /1 weak support · 2 contradictions · 1 needs context/);
  assert.match(
    markup,
    /IAM activity is present, but downstream abuse, sensitive access, and malicious intent are missing\./,
  );
  assert.match(markup, /Suggested classifications are preselected/);
  assert.match(markup, /4 of 4 classified/);
  assert.match(markup, /Claim checklist/);
  assert.match(markup, /Show details/);
  assert.match(markup, /Mark irrelevant \/ noise/);
  assert.match(markup, /Continue with 4 classifications/);
  assert.doesNotMatch(markup, /disabled="">Continue with 4 classifications/);
  assert.match(markup, /Back to AI reveal/);
  assert.match(markup, /Continue to impostor review/);
  assert.match(markup, /Back to evidence board/);
  assert.match(markup, /Continue to verdict/);
  assert.match(markup, /Back to label duel/);
  assert.match(markup, /Open review JSON/);
  assert.match(markup, /Back to impostor review/);
  assert.doesNotMatch(markup, /Open review summary/);
  assert.doesNotMatch(markup, />Next<\/button>/);
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

test("blind read returns to AI Reveal once the label is already revealed", () => {
  const selectedCase = sampleCases[0];
  assert.ok(selectedCase);

  const markup = renderStaticMarkup(
    React.createElement(BlindReadPanel, {
      caseFile: selectedCase,
      reviewState: {
        blindChoiceId: "routine-iam-provisioning",
        aiLabelRevealed: true,
      },
      onChooseBlindInterpretation: () => undefined,
      onRevealAiLabel: () => undefined,
    }),
  );

  assert.match(markup, /Return to AI Reveal/);
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
