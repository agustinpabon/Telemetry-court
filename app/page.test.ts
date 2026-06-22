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
import { PackageReviewGate } from "@/components/arena/PackageReviewGate";
import { VerdictPanel } from "@/components/arena/VerdictPanel";
import { CaseSwitcher } from "@/components/CaseSwitcher";
import { ClaimLedger } from "@/components/ClaimLedger";
import { EvidenceCard } from "@/components/EvidenceCard";
import { ScorePanel } from "@/components/ScorePanel";
import { casePackageFixtures } from "@/data/casePackageFixtures";
import { buildPackageReviewRenderState } from "@/data/sampleCases";
import {
  sampleCases,
  sampleLandscapeContextNodes,
} from "@/data/sampleCases";
import { sampleCaseSeedData } from "@/data/sampleCaseSeedData";
import {
  arenaRouteEntries,
  getArenaStageForSlug,
  getPathForArenaStage,
} from "@/lib/arenaRoutes";
import { getRelationsForEvidence } from "@/lib/caseMetrics";
import {
  arenaReducer,
  createInitialArenaState,
  getCurrentReviewState,
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

function renderVerdictPageText(): string {
  const html = renderToStaticMarkup(
    React.createElement(AppShell, {
      cases: sampleCases,
      landscapeContextNodes: sampleLandscapeContextNodes,
      initialStage: "verdict",
      pathname: "/verdict",
      onNavigatePath: () => undefined,
    }),
  );

  return html.replace(/\s+/g, " ");
}

function renderStaticMarkup(element: React.ReactElement): string {
  return renderToStaticMarkup(element).replace(/\s+/g, " ");
}

function assertNoMixedVerdictState(markup: string): void {
  const showsReady = markup.includes("Ready to export");
  const showsVerdictMissing = markup.includes("Evaluation not selected.");
  const showsReviewComplete = markup.includes("Review complete");
  const showsChooseVerdict = markup.includes("Choose a verdict to finish the review");

  assert.equal(
    showsReady && showsVerdictMissing,
    false,
    "Ready to export cannot appear with Evaluation not selected.",
  );
  assert.equal(
    showsReviewComplete && showsChooseVerdict,
    false,
    "Review complete cannot appear with unfinished verdict copy.",
  );

  if (showsReady) {
    assert.match(markup, /class="verdict-button is-selected"/);
  }

  if (showsVerdictMissing) {
    assert.match(markup, /disabled="">Export review result/);
  }
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
  assert.match(pageText, /Final Evaluation/);
  assert.match(pageText, /Evidence/);
  assert.match(pageText, /Uncertainty/);
  assert.match(pageText, /126 sessions/);
  assert.match(pageText, /OVERCLAIM/);
  assert.match(pageText, /THIN/);
  assert.match(pageText, /72%/);
  assert.match(pageText, /Open case file/);
  assert.match(pageText, /Import CasePackage/);
  assert.match(pageText, /ReviewResult bundle/);
  assert.match(pageText, /Export reviews/);
  assert.match(pageText, /Import review results/);
  assert.match(pageText, /Local JSON for portable review outputs/);
  assert.match(pageText, /Results/);
  assert.doesNotMatch(pageText, /Investigation Cockpit/);
  assert.doesNotMatch(pageText, /Hidden until blind read/);
  assert.match(pageText, /Case File/);
  assert.match(pageText, /Initial Assessment/);
  assert.match(pageText, /AI Claim Check/);
  assert.match(pageText, /Evidence Verification/);
  assert.match(pageText, /Label Selection/);
  assert.match(pageText, /Cluster Fit Check/);
  assert.match(pageText, /Final Evaluation/);
  assert.doesNotMatch(pageText, /Investigation stages/);
});

test("invalid package render state shows sanitized validation errors instead of review UI", () => {
  const invalidPackage = structuredClone(casePackageFixtures[0]) as Record<
    string,
    unknown
  > & {
    claims: Array<{ linked_evidence_ids: string[] }>;
  };
  invalidPackage.schema_version =
    "case_package.v9-secret-account-111111111111";
  invalidPackage.claims[0].linked_evidence_ids = [
    "raw-secret-evidence-id-98765",
  ];
  const renderState = buildPackageReviewRenderState(
    [invalidPackage],
    [sampleCaseSeedData[0]],
  );
  const markup = renderStaticMarkup(
    React.createElement(PackageReviewGate, {
      renderState,
      landscapeContextNodes: sampleLandscapeContextNodes,
      initialStage: "landscape",
    }),
  );

  assert.match(markup, /Invalid CasePackage/);
  assert.match(markup, /failed validation and cannot be reviewed/);
  assert.match(markup, /\$\.packages\[0\]\.schema_version/);
  assert.match(markup, /unsupported_schema_version/);
  assert.match(markup, /\$\.packages\[0\]\.claims\[0\]\.linked_evidence_ids\[0\]/);
  assert.match(markup, /unknown_evidence_reference/);
  assert.match(markup, /Claim references missing evidence ID/);
  assert.match(markup, /\[redacted\]/);
  assert.doesNotMatch(markup, /case_package\.v9-secret-account-111111111111/);
  assert.doesNotMatch(markup, /raw-secret-evidence-id-98765/);
  assert.doesNotMatch(markup, /IAM role provisioning region/);
  assert.doesNotMatch(markup, /Open case file/);
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
  assert.match(pageText, /Where this case sits before the initial assessment\./);
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
  assert.match(pageText, /Start validation/);
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

  assert.match(pageText, /Step 3 of 8 · Initial Assessment/);
  assert.match(pageText, /Establish an independent baseline\./);
  assert.match(
    pageText,
    /Review the evidence without anchoring on the AI&#x27;s claim\./,
  );
  assert.match(pageText, /Landscape/);
  assert.match(pageText, /Case File/);
  assert.match(pageText, /Initial Assessment/);
  assert.match(pageText, /AI Claim Check/);
  assert.match(pageText, /Evidence Verification/);
  assert.match(pageText, /Label Selection/);
  assert.match(pageText, /Cluster Fit Check/);
  assert.match(pageText, /Final Evaluation/);
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

  assert.match(pageText, /Establish an independent baseline\./);
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

  assert.match(markup, /Step 4 of 8 · AI Claim Check/);
  assert.match(markup, /Your read and the AI label diverge\./);
  assert.match(
    markup,
    /You selected Cloud resource discovery\. The model suggested Suspicious IAM privilege escalation\./,
  );
  assert.match(markup, /Likely overclaim/);
  assert.match(markup, /Your initial assessment/);
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
  assert.match(markup, /Proceed to verification/);
  assert.match(markup, /Return to initial assessment/);
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
        onSetDuelNote: () => undefined,
        onBackToEvidenceBoard: () => undefined,
        onContinue: () => undefined,
      }),
      React.createElement(ImpostorPanel, {
        caseFile: selectedCase,
        reviewState: {
          labelDuelWinnerId: selectedCase.candidateLabels[0]?.id,
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

  assert.match(markup, /Step 5 of 8 · Evidence Verification/);
  assert.match(markup, /Step 6 of 8 · Label Selection/);
  assert.match(markup, /Step 7 of 8 · Cluster Fit Check/);
  assert.match(markup, /Step 8 of 8 · Final Evaluation/);
  assert.match(markup, /Does the evidence support the AI claim\?/);
  assert.match(markup, /AI claim/);
  assert.match(markup, /Suspicious IAM privilege escalation/);
  assert.match(markup, /Initial assessment/);
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
  assert.match(markup, /Proceed to label selection/);
  assert.doesNotMatch(markup, /disabled="">Proceed to label selection/);
  assert.match(markup, /Proceed to cluster fit check/);
  assert.match(markup, /Return to evidence verification/);
  assert.match(markup, /Continue to final evaluation/);
  assert.match(markup, /Return to label selection/);
  assert.match(markup, /Export review result/);
  assert.match(markup, /View JSON/);
  assert.doesNotMatch(markup, /Open review JSON/);
  assert.doesNotMatch(markup, /Open review summary/);
  assert.doesNotMatch(markup, />Next<\/button>/);
});

test("verdict page reads as a final judgment and preserves export actions", () => {
  const selectedCase = sampleCases[0];
  assert.ok(selectedCase);

  const evidenceRatings = getEvidenceRatings(selectedCase, {});
  const balance = getEvidenceBalance(selectedCase, evidenceRatings);
  const markup = renderStaticMarkup(
    React.createElement(VerdictPanel, {
      caseFile: selectedCase,
      reviewState: {
        blindChoiceId: "cloud-resource-discovery",
        aiLabelRevealed: true,
        labelDuelWinnerId: "label-iam-baseline",
        impostorSessionId: "iam-s-01",
        failureModes: [
          "less_overclaimed",
          "missing_evidence",
          "better_supported",
        ],
        finalVerdict: "unsupported_overclaimed",
      },
      balance,
      onSelectVerdict: () => undefined,
      onToggleFailureMode: () => undefined,
      onBackToImpostor: () => undefined,
      onOpenReviewDrawer: () => undefined,
      onCopyJson: () => undefined,
      onDownloadJson: () => undefined,
    }),
  );

  assert.match(markup, /Step 8 of 8 · Final Evaluation/);
  assert.match(markup, /Final Evaluation · Review complete/);
  assert.match(markup, /Unsupported \/ overclaimed/);
  assert.match(markup, /The AI claim overstates what the evidence supports\./);
  assert.match(
    markup,
    /The reviewed evidence points to cloud resource discovery, but does not establish suspicious IAM privilege escalation\./,
  );
  assert.match(
    markup,
    /Evidence balance: 0 support · 1 weak · 2 contradict · 1 context/,
  );
  assert.match(markup, /Status: Review complete · Ready to export/);
  assert.match(markup, /Strong support<\/dt><dd>0/);
  assert.match(markup, /Weak support<\/dt><dd>1/);
  assert.match(markup, /Contradict<\/dt><dd>2/);
  assert.match(markup, /Needs context<\/dt><dd>1/);
  assert.match(markup, /Conclusion: Claim is not sufficiently supported\./);
  assert.match(markup, /Claim support/);
  assert.match(markup, /Cluster quality/);
  assert.match(markup, /Evidence quality/);
  assert.match(markup, /Why this evaluation\?/);
  assert.match(markup, /Overclaimed intent/);
  assert.match(markup, /Missing evidence/);
  assert.match(markup, /Better label available/);
  assert.match(
    markup,
    /class="verdict-button is-selected"[^>]*aria-pressed="true"[^>]*><span class="verdict-button-label">Unsupported \/ overclaimed/,
  );
  assert.match(markup, /Final evaluation/);
  assert.match(markup, /Initial assessment/);
  assert.match(markup, /Cloud resource discovery/);
  assert.match(markup, /AI claim/);
  assert.match(markup, /Suspicious IAM privilege escalation/);
  assert.match(markup, /Selected label/);
  assert.match(markup, /Weakest-fit session/);
  assert.match(markup, /Role created for analytics connector/);
  assert.match(markup, /0 support · 1 weak · 2 contradict · 1 context/);
  assert.match(markup, /Evaluation outcome<\/dt><dd>Unsupported \/ overclaimed/);
  assert.match(
    markup,
    /Rename the label or request stronger evidence before accepting the AI claim\./,
  );
  assert.match(markup, /Review complete\. Export the structured result/);
  assert.match(markup, /View JSON/);
  assert.match(markup, /Copy JSON/);
  assert.match(markup, /Download JSON/);
  assert.match(markup, /Export review result/);
  assert.doesNotMatch(markup, /Verdict context/);
  assert.doesNotMatch(markup, /Final judgment/);
  assert.doesNotMatch(markup, /Failure-mode chips/);
  assert.doesNotMatch(markup, /Open review JSON/);
  assert.doesNotMatch(markup, /Awaiting review choice/);
  assert.doesNotMatch(markup, /Evaluation not selected/);
  assert.doesNotMatch(markup, /Select a verdict to close the review/);
  assert.doesNotMatch(markup, /Make the final call/);
  assertNoMixedVerdictState(markup);
});

test("verdict selection updates the displayed outcome through review state", () => {
  const selectedCase = sampleCases[0];
  assert.ok(selectedCase);

  const evidenceRatings = getEvidenceRatings(selectedCase, {});
  const balance = getEvidenceBalance(selectedCase, evidenceRatings);
  const initialState = createInitialArenaState([selectedCase], "verdict");
  const updatedState = arenaReducer(
    initialState,
    { type: "selectVerdict", verdict: "supported" },
    [selectedCase],
  );
  const markup = renderStaticMarkup(
    React.createElement(VerdictPanel, {
      caseFile: selectedCase,
      reviewState: getCurrentReviewState(updatedState),
      balance,
      onSelectVerdict: () => undefined,
      onToggleFailureMode: () => undefined,
      onBackToImpostor: () => undefined,
      onOpenReviewDrawer: () => undefined,
      onCopyJson: () => undefined,
      onDownloadJson: () => undefined,
    }),
  );

  assert.match(markup, /Final Evaluation · Review complete/);
  assert.match(markup, /<h2 id="verdict-hero-title">Supported<\/h2>/);
  assert.match(markup, /Evaluation outcome<\/dt><dd>Supported/);
  assert.match(markup, /Status: Review complete · Ready to export/);
  assert.match(markup, /Conclusion: Claim is not sufficiently supported\./);
  assert.match(markup, /Reasons selected<\/dt><dd>No failure reason selected\./);
  assert.match(
    markup,
    /Recommended action<\/dt><dd>Review evidence conflicts before accepting this label\./,
  );
  assert.match(
    markup,
    /class="verdict-button is-selected"[^>]*aria-pressed="true"[^>]*><span class="verdict-button-label">Supported/,
  );
  assert.doesNotMatch(markup, /<h2 id="verdict-hero-title">Unsupported \/ overclaimed<\/h2>/);
  assert.doesNotMatch(markup, /Awaiting review choice/);
  assert.doesNotMatch(markup, /Evaluation not selected/);
  assert.doesNotMatch(markup, /Conclusion: Claim is supported\./);
  assert.doesNotMatch(markup, /Accept the label and keep the evidence packet attached for audit\./);
  assert.doesNotMatch(markup, /Selected: Overclaimed intent/);
  assertNoMixedVerdictState(markup);
});

test("verdict empty state stays internally consistent and softens export", () => {
  const selectedCase = sampleCases[0];
  assert.ok(selectedCase);

  const evidenceRatings = getEvidenceRatings(selectedCase, {});
  const balance = getEvidenceBalance(selectedCase, evidenceRatings);
  const markup = renderStaticMarkup(
    React.createElement(VerdictPanel, {
      caseFile: selectedCase,
      reviewState: {},
      balance,
      onSelectVerdict: () => undefined,
      onToggleFailureMode: () => undefined,
      onBackToImpostor: () => undefined,
      onOpenReviewDrawer: () => undefined,
      onCopyJson: () => undefined,
      onDownloadJson: () => undefined,
    }),
  );

  assert.match(markup, /Final Evaluation · Awaiting evaluation/);
  assert.match(markup, /Make the final call/);
  assert.match(markup, /Choose a verdict to finish the review\./);
  assert.match(markup, /Conclusion: Claim is not sufficiently supported\./);
  assert.match(markup, /Evaluation outcome<\/dt><dd>Evaluation not selected\./);
  assert.match(
    markup,
    /Recommended action<\/dt><dd>Choose a verdict to produce a recommended review action\./,
  );
  assert.match(markup, /disabled="">Export review result/);
  assert.match(markup, /View JSON/);
  assert.doesNotMatch(markup, /Verdict selected/);
  assert.doesNotMatch(markup, /Final Evaluation · Review complete/);
  assert.doesNotMatch(markup, /Ready to export/);
  assert.doesNotMatch(markup, /class="verdict-button is-selected"/);
  assertNoMixedVerdictState(markup);
});

test("verdict cannot mix completed cues with missing-verdict summary", () => {
  const selectedCase = sampleCases[0];
  assert.ok(selectedCase);

  const evidenceRatings = getEvidenceRatings(selectedCase, {});
  const balance = getEvidenceBalance(selectedCase, evidenceRatings);
  const unfinishedMarkup = renderStaticMarkup(
    React.createElement(VerdictPanel, {
      caseFile: selectedCase,
      reviewState: {
        blindChoiceId: "cloud-resource-discovery",
        aiLabelRevealed: true,
        labelDuelWinnerId: "label-iam-baseline",
        impostorSessionId: "iam-s-01",
        failureModes: ["less_overclaimed", "missing_evidence"],
      },
      balance,
      onSelectVerdict: () => undefined,
      onToggleFailureMode: () => undefined,
      onBackToImpostor: () => undefined,
      onOpenReviewDrawer: () => undefined,
      onCopyJson: () => undefined,
      onDownloadJson: () => undefined,
    }),
  );

  assert.match(unfinishedMarkup, /Make the final call/);
  assert.match(unfinishedMarkup, /Evaluation not selected\./);
  assert.match(unfinishedMarkup, /disabled="">Export review result/);
  assert.doesNotMatch(unfinishedMarkup, /Ready to export/);
  assert.doesNotMatch(unfinishedMarkup, /Final Evaluation · Review complete/);
  assert.doesNotMatch(unfinishedMarkup, /class="verdict-button is-selected"/);
  assertNoMixedVerdictState(unfinishedMarkup);

  const completedMarkup = renderStaticMarkup(
    React.createElement(VerdictPanel, {
      caseFile: selectedCase,
      reviewState: {
        blindChoiceId: "cloud-resource-discovery",
        aiLabelRevealed: true,
        labelDuelWinnerId: "label-iam-baseline",
        impostorSessionId: "iam-s-01",
        failureModes: ["less_overclaimed", "missing_evidence"],
        finalVerdict: "unsupported_overclaimed",
      },
      balance,
      onSelectVerdict: () => undefined,
      onToggleFailureMode: () => undefined,
      onBackToImpostor: () => undefined,
      onOpenReviewDrawer: () => undefined,
      onCopyJson: () => undefined,
      onDownloadJson: () => undefined,
    }),
  );

  assert.match(completedMarkup, /Ready to export/);
  assert.match(completedMarkup, /Evaluation outcome<\/dt><dd>Unsupported \/ overclaimed/);
  assert.match(completedMarkup, /Overclaimed intent, Missing evidence/);
  assert.match(completedMarkup, /class="verdict-button is-selected"/);
  assert.doesNotMatch(completedMarkup, /Evaluation not selected\./);
  assert.doesNotMatch(completedMarkup, /Choose a verdict to finish the review/);
  assert.doesNotMatch(completedMarkup, /disabled="">Export review result/);
  assertNoMixedVerdictState(completedMarkup);
});

test("supported verdict with conflicting evidence clears negative reasons and avoids accept copy", () => {
  const selectedCase = sampleCases[0];
  assert.ok(selectedCase);

  const evidenceRatings = getEvidenceRatings(selectedCase, {});
  const balance = getEvidenceBalance(selectedCase, evidenceRatings);
  const markup = renderStaticMarkup(
    React.createElement(VerdictPanel, {
      caseFile: selectedCase,
      reviewState: {
        blindChoiceId: "cloud-resource-discovery",
        aiLabelRevealed: true,
        labelDuelWinnerId: "label-iam-baseline",
        impostorSessionId: "iam-s-01",
        failureModes: ["less_overclaimed", "missing_evidence"],
        finalVerdict: "supported",
      },
      balance,
      onSelectVerdict: () => undefined,
      onToggleFailureMode: () => undefined,
      onBackToImpostor: () => undefined,
      onOpenReviewDrawer: () => undefined,
      onCopyJson: () => undefined,
      onDownloadJson: () => undefined,
    }),
  );

  assert.match(markup, /<h2 id="verdict-hero-title">Supported<\/h2>/);
  assert.match(markup, /Evaluation outcome<\/dt><dd>Supported/);
  assert.match(markup, /Reasons selected<\/dt><dd>No failure reason selected\./);
  assert.match(markup, /Conclusion: Claim is not sufficiently supported\./);
  assert.match(
    markup,
    /Recommended action<\/dt><dd>Review evidence conflicts before accepting this label\./,
  );
  assert.match(
    markup,
    /class="verdict-button is-selected"[^>]*aria-pressed="true"[^>]*><span class="verdict-button-label">Supported/,
  );
  assert.doesNotMatch(markup, /Selected: Overclaimed intent/);
  assert.doesNotMatch(markup, /Reasons selected<\/dt><dd>Overclaimed intent, Missing evidence/);
  assert.doesNotMatch(markup, /Accept the label and keep the evidence packet attached for audit\./);
  assert.doesNotMatch(markup, /Conclusion: Claim is supported\./);
  assertNoMixedVerdictState(markup);
});

test("verdict route opens the demo case as a completed structured judgment", () => {
  const pageText = renderVerdictPageText();

  assert.match(pageText, /Step 8 of 8 · Final Evaluation/);
  assert.match(pageText, /Final Evaluation · Review complete/);
  assert.match(pageText, /<h2 id="verdict-hero-title">Unsupported \/ overclaimed<\/h2>/);
  assert.match(pageText, /Overclaimed intent/);
  assert.match(pageText, /Missing evidence/);
  assert.match(pageText, /Status: Review complete · Ready to export/);
  assert.match(pageText, /Evaluation outcome<\/dt><dd>Unsupported \/ overclaimed/);
  assert.match(
    pageText,
    /class="verdict-button is-selected"[^>]*aria-pressed="true"[^>]*><span class="verdict-button-label">Unsupported \/ overclaimed/,
  );
  assert.match(pageText, /Conclusion: Claim is not sufficiently supported\./);
  assert.match(
    pageText,
    /Recommended action<\/dt><dd>Rename the label or request stronger evidence before accepting the AI claim\./,
  );
  assert.match(pageText, /Export review result/);
  assert.doesNotMatch(pageText, /<h2 id="verdict-hero-title">Supported<\/h2>/);
  assert.doesNotMatch(pageText, /Evaluation outcome<\/dt><dd>Supported/);
  assert.doesNotMatch(pageText, /Accept the label and keep the evidence packet attached for audit\./);
  assert.doesNotMatch(pageText, /Conclusion: Claim is supported\./);
  assert.doesNotMatch(pageText, /Evaluation not selected/);
  assert.doesNotMatch(pageText, /Select a verdict to close the review/);
  assertNoMixedVerdictState(pageText);
});

test("label duel turns evidence balance into a defensible label decision", () => {
  const selectedCase = sampleCases[0];
  assert.ok(selectedCase);

  const emptyMarkup = renderStaticMarkup(
    React.createElement(LabelDuelPanel, {
      caseFile: selectedCase,
      reviewState: {
        blindChoiceId: "cloud-resource-discovery",
        aiLabelRevealed: true,
      },
      onSelectWinner: () => undefined,
      onToggleReason: () => undefined,
      onSetDuelNote: () => undefined,
      onBackToEvidenceBoard: () => undefined,
      onContinue: () => undefined,
    }),
  );

  assert.match(emptyMarkup, /Select one label to continue\./);
  assert.match(
    emptyMarkup,
    /Pick the interpretation that best matches what was actually observed\./,
  );
  assert.match(emptyMarkup, /Original AI claim/);
  assert.match(emptyMarkup, /Suspicious IAM privilege escalation/);
  assert.match(emptyMarkup, /Your evidence read/);
  assert.match(emptyMarkup, /1 weak support · 2 contradictions · 1 needs context/);
  assert.match(emptyMarkup, /Current signal/);
  assert.match(emptyMarkup, /Likely overclaim/);
  assert.match(emptyMarkup, /Candidate labels/);
  assert.match(emptyMarkup, /Select the label that is best supported by the evidence/);
  assert.match(emptyMarkup, /Best supported/);
  assert.match(
    emptyMarkup,
    /Best matches the observed IAM activity without assuming malicious escalation/,
  );
  assert.match(emptyMarkup, /Select label/);
  assert.doesNotMatch(emptyMarkup, /Recommended/);
  assert.doesNotMatch(emptyMarkup, /Selected/);
  assert.match(emptyMarkup, /Original AI claim/);
  assert.match(emptyMarkup, /Too strong/);
  assert.match(emptyMarkup, /Other possible labels/);
  assert.match(emptyMarkup, /More specific label/);
  assert.match(emptyMarkup, /Plausible but narrow/);
  assert.match(emptyMarkup, /Uncertainty label/);
  assert.match(emptyMarkup, /Safer but vague/);
  assert.doesNotMatch(emptyMarkup, /Support 86%/);
  assert.doesNotMatch(emptyMarkup, /Semantic evidence atlas/);
  assert.doesNotMatch(emptyMarkup, /Why this label\?/);
  assert.match(emptyMarkup, /Select one label to continue\./);
  assert.match(emptyMarkup, /disabled="">Proceed to cluster fit check/);

  const selectedMarkup = renderStaticMarkup(
    React.createElement(LabelDuelPanel, {
      caseFile: selectedCase,
      reviewState: {
        blindChoiceId: "cloud-resource-discovery",
        aiLabelRevealed: true,
        labelDuelWinnerId: "label-iam-constrained",
        duelReasons: ["less_overclaimed", "missing_downstream_abuse"],
        duelNote: "Routine provisioning best fits the current evidence.",
      },
      onSelectWinner: () => undefined,
      onToggleReason: () => undefined,
      onSetDuelNote: () => undefined,
      onBackToEvidenceBoard: () => undefined,
      onContinue: () => undefined,
    }),
  );

  assert.match(selectedMarkup, /Why this label\?/);
  assert.match(selectedMarkup, /Selected/);
  assert.match(
    selectedMarkup,
    /Select one or more reasons, or add a short note/,
  );
  assert.match(selectedMarkup, /Less overclaimed/);
  assert.match(selectedMarkup, /Missing malicious intent/);
  assert.match(selectedMarkup, /Missing downstream abuse/);
  assert.match(selectedMarkup, /Better supported/);
  assert.match(selectedMarkup, /Cluster seems mixed/);
  assert.match(selectedMarkup, /Add a short note, optional/);
  assert.match(selectedMarkup, /Optional note for the final review/);
  assert.match(
    selectedMarkup,
    /Selected: Routine IAM role provisioning\. Its cluster fit will be checked next\./,
  );
  assert.match(
    selectedMarkup,
    /Proceed to cluster fit check/,
  );
  assert.doesNotMatch(
    selectedMarkup,
    /disabled="">Proceed to cluster fit check/,
  );
});

test("impostor review teaches the comparison before a session is selected", () => {
  const selectedCase = sampleCases[0];
  assert.ok(selectedCase);

  const markup = renderStaticMarkup(
    React.createElement(ImpostorPanel, {
      caseFile: selectedCase,
      reviewState: {
        labelDuelWinnerId: "label-iam-uncertain",
      },
      onSelectSession: () => undefined,
      onBackToLabelDuel: () => undefined,
      onContinue: () => undefined,
    }),
  );

  assert.match(markup, /Find the weakest-fit session/);
  assert.match(
    markup,
    /Compare the five representative sessions and choose the one that least matches the cluster pattern\./,
  );
  assert.match(markup, /Selected label/);
  assert.match(markup, /IAM administration with unknown intent/);
  assert.match(markup, /Evidence read/);
  assert.match(markup, /Review status/);
  assert.match(markup, /Needs review/);
  assert.match(markup, /Fit check/);
  assert.match(
    markup,
    /Weakest fit = high outlier risk \+ low cluster pattern match/,
  );
  assert.match(markup, /Strongest signal/);
  assert.match(markup, /What to look for/);
  assert.match(markup, /High outlier risk/);
  assert.match(markup, /Low cluster pattern match/);
  assert.match(markup, /Behavior that does not match the other sessions/);
  assert.match(markup, /iam-s-04 currently has the strongest outlier signal\./);
  assert.match(markup, /Select a session to see how it affects the final evaluation\./);
  assert.match(markup, /82% outlier risk/);
  assert.match(markup, /Cluster pattern match/);
  assert.match(markup, /Low · 29%/);
  assert.ok(
    markup.indexOf("iam-s-04") < markup.indexOf("iam-s-03"),
    "sessions should be ordered by outlier risk",
  );
  assert.match(
    markup,
    /Choose the session with the weakest match to the cluster before continuing\./,
  );
  assert.match(markup, /disabled="">Continue to final evaluation/);
  assert.doesNotMatch(markup, /aria-pressed="true"/);
});

test("impostor review guards the workflow when no label was selected", () => {
  const selectedCase = sampleCases[0];
  assert.ok(selectedCase);

  const markup = renderStaticMarkup(
    React.createElement(ImpostorPanel, {
      caseFile: selectedCase,
      reviewState: {},
      onSelectSession: () => undefined,
      onBackToLabelDuel: () => undefined,
      onContinue: () => undefined,
    }),
  );

  assert.match(markup, /Choose a label before the fit check/);
  assert.match(markup, /Return to label selection/);
  assert.doesNotMatch(markup, /No label recorded/);
  assert.doesNotMatch(markup, /Compare session fit/);
  assert.doesNotMatch(markup, /Continue to final evaluation/);
});

test("impostor review explains the strength of the selected session", () => {
  const selectedCase = sampleCases[0];
  assert.ok(selectedCase);

  const strongestMarkup = renderStaticMarkup(
    React.createElement(ImpostorPanel, {
      caseFile: selectedCase,
      reviewState: {
        labelDuelWinnerId: "label-iam-uncertain",
        impostorSessionId: "iam-s-04",
      },
      onSelectSession: () => undefined,
      onBackToLabelDuel: () => undefined,
      onContinue: () => undefined,
    }),
  );

  assert.match(strongestMarkup, /Selection recorded/);
  assert.match(strongestMarkup, /Cross-account PassRole probe/);
  assert.match(strongestMarkup, /Cluster pattern match/);
  assert.match(strongestMarkup, /Low · 29%/);
  assert.match(strongestMarkup, /Outlier risk/);
  assert.match(strongestMarkup, /Effect on final evaluation/);
  assert.match(
    strongestMarkup,
    /This is the strongest mismatch candidate because it has the highest outlier risk and weakest match to the cluster\./,
  );
  assert.match(
    strongestMarkup,
    /Selected: Cross-account PassRole probe · 82% outlier risk/,
  );
  assert.match(strongestMarkup, /aria-pressed="true"/);
  assert.doesNotMatch(strongestMarkup, /disabled="">Continue to final evaluation/);

  const alternateMarkup = renderStaticMarkup(
    React.createElement(ImpostorPanel, {
      caseFile: selectedCase,
      reviewState: {
        labelDuelWinnerId: "label-iam-uncertain",
        impostorSessionId: "iam-s-03",
      },
      onSelectSession: () => undefined,
      onBackToLabelDuel: () => undefined,
      onContinue: () => undefined,
    }),
  );

  assert.match(
    alternateMarkup,
    /Selection recorded, but iam-s-04 has stronger outlier evidence: 82% outlier risk and lower cluster match\./,
  );
  assert.match(
    alternateMarkup,
    /Selected: Role validation checks · 28% outlier risk\. Strongest signal: iam-s-04 · 82%\./,
  );
  assert.doesNotMatch(
    alternateMarkup,
    /This is the strongest mismatch candidate because it has the highest outlier risk/,
  );
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
  assert.match(markup, /Reveal AI claim/);
  assert.doesNotMatch(markup, /disabled=""/);
});

test("blind read offers a clear path to AI Reveal once the label is already revealed", () => {
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

  assert.match(markup, /Continue to AI Claim Check/);
  assert.doesNotMatch(markup, /Return to AI Reveal/);
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
