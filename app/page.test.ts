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
import { ReviewSummaryDrawer } from "@/components/arena/ReviewSummaryDrawer";
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
import { importCasePackageV01Json } from "@/lib/importCasePackageV01";
import { getRelationsForEvidence } from "@/lib/caseMetrics";
import {
  arenaReducer,
  createInitialArenaState,
  getCurrentReviewState,
  getEvidenceBalance,
  getEvidenceRatings,
} from "@/lib/arenaReviewState";
import { reviewReadinessOptions } from "@/lib/reviewReadiness";
import type { EvidenceHighlight } from "@/lib/types";

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

function assertReviewResultProgressionCopy(markup: string): void {
  assert.match(
    markup,
    /After export: import on \/results for aggregate metrics/,
  );
  assert.match(
    markup,
    /A ReviewResult is one reviewer&#x27;s structured judgment, not the final aggregate report\./,
  );
  assert.match(markup, /Import on \/results/);
  assert.match(markup, /Group compatible reviews/);
  assert.match(markup, /Generate EvaluationReport metrics/);
  assert.match(
    markup,
    /Local-file workflow only: no backend, auth, database, server-side persistence, or cloud sync\./,
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function assertReadinessOptionWrapsRadio(
  markup: string,
  option: (typeof reviewReadinessOptions)[number],
): void {
  const labelPattern = new RegExp(
    `<label class="readiness-option[^"]*">[\\s\\S]*?<input[^>]*name="review-readiness"[^>]*value="${escapeRegExp(
      option.id,
    )}"[\\s\\S]*?${escapeRegExp(option.label)}[\\s\\S]*?</label>`,
  );

  assert.match(
    markup,
    labelPattern,
    `${option.id} radio must be wrapped by the visible card label`,
  );
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
  assert.match(pageText, /Review outputs/);
  assert.match(pageText, /Review JSON/);
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

test("all workflow stages render one progress rail inside the shared masthead", () => {
  for (const entry of arenaRouteEntries) {
    const markup = renderStaticMarkup(
      React.createElement(AppShell, {
        cases: sampleCases,
        landscapeContextNodes: sampleLandscapeContextNodes,
        initialStage: entry.stage,
        pathname: entry.path,
        onNavigatePath: () => undefined,
      }),
    );
    const progressRailCount =
      markup.match(/<nav class="arena-step-progress(?: |")/g)?.length ?? 0;

    assert.equal(
      progressRailCount,
      1,
      `${entry.stage} must render exactly one shared progress rail`,
    );
    assert.match(
      markup,
      /<header class="arena-topbar arena-header tc-masthead">[\s\S]*?class="arena-step-progress tc-masthead__progress-row"[\s\S]*?<\/header>/,
      `${entry.stage} progress must stay inside the masthead`,
    );
  }
});

test("shared masthead keeps controls in semantic action groups", () => {
  const markup = renderHomePageText();

  assert.match(
    markup,
    /class="case-package-import-control tc-masthead__action-group tc-masthead__action-group--review"[\s\S]*?Review[\s\S]*?Results[\s\S]*?Import CasePackage/,
  );
  assert.match(
    markup,
    /class="hot-folder-case-package-control tc-masthead__action-group tc-masthead__action-group--hot-folder"[\s\S]*?Hot-Folder[\s\S]*?Check Hot-Folder[\s\S]*?Polling/,
  );
  assert.match(
    markup,
    /class="review-result-bundle-control tc-masthead__secondary-menu"[\s\S]*?<summary[^>]*>Review outputs<\/summary>[\s\S]*?Review JSON[\s\S]*?Export reviews[\s\S]*?Import review results/,
  );
  assert.match(
    markup,
    /class="local-reviewer-metadata-control tc-masthead__action-group"[\s\S]*?Local export metadata[\s\S]*?Local reviewer ID[\s\S]*?Review context/,
  );
  assert.equal(
    markup.match(/class="tc-masthead__action-row/g)?.length,
    3,
  );
  assert.equal(
    markup.match(/tc-masthead__helper/g)?.length,
    3,
  );
  assert.match(markup, /role="switch"/);
  assert.match(markup, /aria-checked="false"/);
  assert.doesNotMatch(markup, /Polling off/);
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
  assert.match(pageText, /Start with what you can judge\./);
  assert.match(
    pageText,
    /Use only the visible evidence\. The AI label stays hidden\./,
  );
  assert.match(
    pageText,
    /Judge whether the visible evidence supports an interpretation—not whether the cluster is dangerous\./,
  );
  assert.match(pageText, /The AI label stays hidden until you choose\./);
  assert.match(pageText, /Landscape/);
  assert.match(pageText, /Case File/);
  assert.match(pageText, /Initial Assessment/);
  assert.match(pageText, /AI Claim Check/);
  assert.match(pageText, /Evidence Verification/);
  assert.match(pageText, /Label Selection/);
  assert.match(pageText, /Cluster Fit Check/);
  assert.match(pageText, /Final Evaluation/);
  assert.match(pageText, /AI claim hidden/);
  assert.match(pageText, /Terms in this step/);
  assert.match(pageText, /Blind assessment/);
  assert.match(pageText, /Can you judge this case\?/);
  assert.match(
    pageText,
    /Yes — I can judge from this evidence/,
  );
  assert.match(pageText, /No — I cannot judge from this evidence/);
  assert.match(
    pageText,
    /I do not understand enough domain terms to review this case\./,
  );
  assert.match(
    pageText,
    /IAM<\/dt><dd>Identity and access management activity involving roles, policies, or permissions\./,
  );
  assert.match(
    pageText,
    /CloudTrail<\/dt><dd>AWS event records that show actions taken in an account\./,
  );
  assert.match(pageText, /Selected behaviour region/);
  assert.match(pageText, /Evidence summary/);
  assert.match(pageText, /Observed/);
  assert.match(pageText, /Context/);
  assert.match(pageText, /Limitations/);
  assert.match(pageText, /Ambiguous signal/);
  assert.match(pageText, /Your interpretation/);
  assert.match(
    pageText,
    /Choose the strongest supported conclusion\./,
  );
  assert.match(pageText, /AI claim hidden/);
  assert.match(pageText, /Choose whether you can judge/);
  assert.match(
    pageText,
    /Answer the checkpoint and choose an interpretation\./,
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

test("checkpoint options render as obvious selectable radio cards", () => {
  const selectedCase = sampleCases[0];
  assert.ok(selectedCase);
  const markup = renderStaticMarkup(
    React.createElement(BlindReadPanel, {
      caseFile: selectedCase,
      reviewState: {},
      onChooseReviewReadiness: () => undefined,
      onChooseBlindInterpretation: () => undefined,
      onRevealAiLabel: () => undefined,
    }),
  );

  assert.match(
    markup,
    /<section class="review-readiness-checkpoint is-required"/,
  );
  assert.match(
    markup,
    /<legend class="review-readiness-legend">Choose one path to continue<\/legend>/,
  );
  assert.equal(
    markup.match(/<label class="readiness-option[^"]*">/g)?.length,
    reviewReadinessOptions.length,
  );

  for (const option of reviewReadinessOptions) {
    assertReadinessOptionWrapsRadio(markup, option);
  }

  assert.match(markup, /class="readiness-option-mark" aria-hidden="true"/);
  assert.match(markup, /Yes — I can judge from this evidence/);
  assert.match(markup, /Choose the best-supported interpretation below\./);
  assert.match(markup, /No — I cannot judge from this evidence/);
  assert.match(
    markup,
    /Record insufficient context and continue without guessing\./,
  );
  assert.match(markup, /class="readiness-option is-cannot-judge"/);
});

test("selected checkpoint state is exposed by the native checked radio", () => {
  const selectedCase = sampleCases[0];
  assert.ok(selectedCase);
  const markup = renderStaticMarkup(
    React.createElement(BlindReadPanel, {
      caseFile: selectedCase,
      reviewState: {
        reviewReadiness: "need_context",
        blindChoiceId: "not-enough-evidence",
        evidenceRatings: Object.fromEntries(
          selectedCase.evidenceItems.map((evidence) => [
            evidence.id,
            "needs_context" as const,
          ]),
        ),
      },
      onChooseReviewReadiness: () => undefined,
      onChooseBlindInterpretation: () => undefined,
      onRevealAiLabel: () => undefined,
    }),
  );

  assert.match(
    markup,
    /<label class="readiness-option is-cannot-judge is-selected">[\s\S]*?<input(?=[^>]*checked="")(?=[^>]*name="review-readiness")(?=[^>]*type="radio")(?=[^>]*value="need_context")[^>]*\/>/,
  );
  assert.match(
    markup,
    /<span class="readiness-option-state"[^>]*>Insufficient context recorded<\/span>/,
  );
  assert.match(markup, /Cannot judge recorded/);
  assert.match(
    markup,
    /Not enough evidence is saved as your blind assessment\./,
  );
  assert.match(markup, /Reveal AI claim with insufficient context recorded/);
  assert.doesNotMatch(
    markup,
    /disabled="">Reveal AI claim with insufficient context recorded/,
  );
});

test("case 002 checkpoint remains blind while showing visible domain terms", () => {
  const packageFixture = casePackageFixtures[1];
  assert.ok(packageFixture);
  const importResult = importCasePackageV01Json(JSON.stringify(packageFixture));

  assert.equal(importResult.ok, true);
  if (!importResult.ok) {
    return;
  }

  const aiLabel = packageFixture.candidate_labels.find(
    (candidate) => candidate.source === "ai_generated",
  );
  const aiClaim = packageFixture.claims[0];
  assert.ok(aiLabel);
  assert.ok(aiClaim);
  const aiRationale = aiLabel.rationale;
  if (typeof aiRationale !== "string") {
    throw new Error("case 002 AI label fixture must include a rationale");
  }
  const markup = renderStaticMarkup(
    React.createElement(BlindReadPanel, {
      caseFile: importResult.caseFile,
      reviewState: {},
      onChooseReviewReadiness: () => undefined,
      onChooseBlindInterpretation: () => undefined,
      onRevealAiLabel: () => undefined,
    }),
  );

  assert.match(markup, /Can you judge this case\?/);
  assert.match(
    markup,
    /The AI label stays hidden until you choose/,
  );
  assert.match(
    markup,
    /PowerShell<\/dt><dd>A Windows command-line and scripting environment\./,
  );
  assert.match(
    markup,
    /Encoded command<\/dt><dd>A command stored in encoded text that must be decoded to inspect\./,
  );
  assert.doesNotMatch(markup, new RegExp(escapeRegExp(aiLabel.label)));
  assert.doesNotMatch(markup, new RegExp(escapeRegExp(aiRationale)));
  assert.doesNotMatch(markup, new RegExp(escapeRegExp(aiClaim.text)));
});

test("normal and low-context checkpoint paths still allow progression after an interpretation", () => {
  const selectedCase = sampleCases[0];
  assert.ok(selectedCase);
  const normalChoice = selectedCase.blindInterpretationOptions[0];
  const lowContextChoice = selectedCase.blindInterpretationOptions.find(
    (option) => option.id === "not-enough-evidence",
  );
  assert.ok(normalChoice);
  assert.ok(lowContextChoice);
  const normalMarkup = renderStaticMarkup(
    React.createElement(BlindReadPanel, {
      caseFile: selectedCase,
      reviewState: {
        reviewReadiness: "ready",
        blindChoiceId: normalChoice.id,
      },
      onChooseReviewReadiness: () => undefined,
      onChooseBlindInterpretation: () => undefined,
      onRevealAiLabel: () => undefined,
    }),
  );
  const lowContextMarkup = renderStaticMarkup(
    React.createElement(BlindReadPanel, {
      caseFile: selectedCase,
      reviewState: {
        reviewReadiness: "domain_terms",
        blindChoiceId: lowContextChoice.id,
      },
      onChooseReviewReadiness: () => undefined,
      onChooseBlindInterpretation: () => undefined,
      onRevealAiLabel: () => undefined,
    }),
  );

  assert.match(normalMarkup, /Reveal AI claim/);
  assert.doesNotMatch(normalMarkup, /disabled="">Reveal AI claim/);
  assert.match(lowContextMarkup, /Cannot judge recorded/);
  assert.match(lowContextMarkup, /Context-safe choice/);
  assert.match(
    lowContextMarkup,
    /Reveal AI claim with insufficient context recorded/,
  );
  assert.doesNotMatch(
    lowContextMarkup,
    /disabled="">Reveal AI claim with insufficient context recorded/,
  );
});

test("low-context checkpoint stays blind and points to insufficient-context choices", () => {
  const selectedCase = sampleCases[0];
  assert.ok(selectedCase);

  const markup = renderStaticMarkup(
    React.createElement(BlindReadPanel, {
      caseFile: selectedCase,
      reviewState: {
        reviewReadiness: "domain_terms",
        blindChoiceId: "not-enough-evidence",
      },
      onChooseReviewReadiness: () => undefined,
      onChooseBlindInterpretation: () => undefined,
      onRevealAiLabel: () => undefined,
    }),
  );

  assert.match(markup, /I do not understand enough domain terms to review this case\./);
  assert.match(
    markup,
    /Not enough evidence is saved as your blind assessment\./,
  );
  assert.match(markup, /Context-safe choice/);
  assert.match(markup, /Not enough evidence/);
  assert.match(markup, /Cannot judge recorded/);
  assert.match(
    markup,
    /Reveal AI claim with insufficient context recorded/,
  );
  assert.doesNotMatch(markup, /Suspicious IAM privilege escalation/);
  assert.doesNotMatch(markup, /The baseline model labels this region/);
});

test("imported Initial Assessment excludes the upstream AI label", () => {
  const packageFixture = casePackageFixtures[1];
  assert.ok(packageFixture);
  const importResult = importCasePackageV01Json(JSON.stringify(packageFixture));

  assert.equal(importResult.ok, true);
  if (!importResult.ok) {
    return;
  }

  const aiLabel = packageFixture.candidate_labels.find(
    (candidate) => candidate.source === "ai_generated",
  );
  assert.ok(aiLabel);
  const markup = renderStaticMarkup(
    React.createElement(AppShell, {
      cases: [importResult.caseFile],
      initialStage: "blind_read",
      pathname: "/blind-read",
      onNavigatePath: () => undefined,
    }),
  );

  assert.match(markup, /Terms in this step/);
  assert.match(markup, /Blind assessment/);
  assert.match(markup, /AI claim hidden/);
  assert.doesNotMatch(markup, new RegExp(aiLabel.label));
});

test("imported claim and evidence guidance stays case-neutral", () => {
  const packageFixture = casePackageFixtures[1];
  assert.ok(packageFixture);
  const importResult = importCasePackageV01Json(JSON.stringify(packageFixture));

  assert.equal(importResult.ok, true);
  if (!importResult.ok) {
    return;
  }

  const caseFile = importResult.caseFile;
  const evidenceRatings = getEvidenceRatings(caseFile, {});
  const markup = renderStaticMarkup(
    React.createElement(
      React.Fragment,
      null,
      React.createElement(AiRevealPanel, {
        caseFile,
        reviewState: {
          blindChoiceId: caseFile.blindInterpretationOptions[0]?.id,
          aiLabelRevealed: true,
        },
        onRevealAiLabel: () => undefined,
        onContinue: () => undefined,
        onBackToBlindRead: () => undefined,
      }),
      React.createElement(EvidenceBoard, {
        caseFile,
        evidenceRatings,
        balance: getEvidenceBalance(caseFile, evidenceRatings),
        onRateEvidence: () => undefined,
      }),
    ),
  );

  assert.match(markup, /What to verify in the AI claim/);
  assert.match(
    markup,
    /Weigh supporting, contradictory, and incomplete evidence against the AI claim before choosing a label\./,
  );
  assert.doesNotMatch(markup, /The evidence confirms IAM activity/);
  assert.doesNotMatch(markup, /IAM activity is present/);
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

  assert.match(pageText, /Start with what you can judge\./);
  assert.match(pageText, /Choose whether you can judge/);
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

  assert.match(markup, /Your read and the AI label diverge\./);
  assert.match(markup, /Compare both interpretations\. This is not your verdict\./);
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

  assert.match(markup, /Does the evidence support the AI claim\?/);
  assert.match(markup, /AI claim/);
  assert.match(markup, /Suspicious IAM privilege escalation/);
  assert.match(markup, /Initial assessment/);
  assert.match(markup, /Cloud resource discovery/);
  assert.match(markup, /Evidence balance/);
  assert.match(
    markup,
    /Rate each item against the claim\./,
  );
  assert.match(markup, /1 weak support · 2 contradictions · 1 needs context/);
  assert.match(
    markup,
    /IAM activity is present, but downstream abuse, sensitive access, and malicious intent are missing\./,
  );
  assert.match(markup, /Suggested ratings are preselected and editable/);
  assert.match(markup, /4 of 4 classified/);
  assert.match(markup, /Claim checklist/);
  assert.match(markup, /Details/);
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

test("each review stage states the decision the reviewer must make", () => {
  const selectedCase = sampleCases[0];
  assert.ok(selectedCase);

  const evidenceRatings = getEvidenceRatings(selectedCase, {});
  const balance = getEvidenceBalance(selectedCase, evidenceRatings);
  const markup = renderStaticMarkup(
    React.createElement(
      React.Fragment,
      null,
      React.createElement(BlindReadPanel, {
        caseFile: selectedCase,
        reviewState: { reviewReadiness: "ready" },
        onChooseReviewReadiness: () => undefined,
        onChooseBlindInterpretation: () => undefined,
        onRevealAiLabel: () => undefined,
      }),
      React.createElement(AiRevealPanel, {
        caseFile: selectedCase,
        reviewState: {
          blindChoiceId: "cloud-resource-discovery",
          aiLabelRevealed: true,
        },
        onRevealAiLabel: () => undefined,
        onContinue: () => undefined,
        onBackToBlindRead: () => undefined,
      }),
      React.createElement(EvidenceBoard, {
        caseFile: selectedCase,
        reviewState: {
          blindChoiceId: "cloud-resource-discovery",
          aiLabelRevealed: true,
        },
        evidenceRatings,
        balance,
        onRateEvidence: () => undefined,
      }),
      React.createElement(LabelDuelPanel, {
        caseFile: selectedCase,
        reviewState: {},
        onSelectWinner: () => undefined,
        onToggleReason: () => undefined,
        onSetDuelNote: () => undefined,
        onContinue: () => undefined,
      }),
      React.createElement(ImpostorPanel, {
        caseFile: selectedCase,
        reviewState: {
          labelDuelWinnerId: selectedCase.candidateLabels[0]?.id,
        },
        onSelectSession: () => undefined,
        onContinue: () => undefined,
      }),
      React.createElement(VerdictPanel, {
        caseFile: selectedCase,
        reviewState: {},
        balance,
        onSelectVerdict: () => undefined,
        onToggleFailureMode: () => undefined,
        onOpenReviewDrawer: () => undefined,
        onCopyJson: () => undefined,
        onDownloadJson: () => undefined,
      }),
    ),
  );

  assert.match(
    markup,
    /Use only the visible evidence\. The AI label stays hidden\./,
  );
  assert.match(
    markup,
    /Compare your blind assessment with the AI label\./,
  );
  assert.match(
    markup,
    /Rate each item against the claim\./,
  );
  assert.match(
    markup,
    /Select the candidate you judge best-supported and most defensible\./,
  );
  assert.match(
    markup,
    /Choose the session least consistent with the selected label\./,
  );
  assert.match(
    markup,
    /Choose the outcome that best fits the evidence and cluster\./,
  );
});

test("review stages define domain terms with compact in-context disclosures", () => {
  const selectedCase = sampleCases[0];
  assert.ok(selectedCase);

  const evidenceRatings = getEvidenceRatings(selectedCase, {});
  const balance = getEvidenceBalance(selectedCase, evidenceRatings);
  const markup = renderStaticMarkup(
    React.createElement(
      React.Fragment,
      null,
      React.createElement(CaseFilePanel, {
        caseFile: selectedCase,
        cases: sampleCases,
        landscapeContextNodes: sampleLandscapeContextNodes,
        onStartInvestigation: () => undefined,
      }),
      React.createElement(BlindReadPanel, {
        caseFile: selectedCase,
        reviewState: {},
        onChooseReviewReadiness: () => undefined,
        onChooseBlindInterpretation: () => undefined,
        onRevealAiLabel: () => undefined,
      }),
      React.createElement(AiRevealPanel, {
        caseFile: selectedCase,
        reviewState: {
          blindChoiceId: "cloud-resource-discovery",
          aiLabelRevealed: true,
        },
        onRevealAiLabel: () => undefined,
        onContinue: () => undefined,
        onBackToBlindRead: () => undefined,
      }),
      React.createElement(EvidenceBoard, {
        caseFile: selectedCase,
        reviewState: {
          blindChoiceId: "cloud-resource-discovery",
          aiLabelRevealed: true,
        },
        evidenceRatings,
        balance,
        onRateEvidence: () => undefined,
      }),
      React.createElement(LabelDuelPanel, {
        caseFile: selectedCase,
        reviewState: {},
        onSelectWinner: () => undefined,
        onToggleReason: () => undefined,
        onSetDuelNote: () => undefined,
        onContinue: () => undefined,
      }),
      React.createElement(ImpostorPanel, {
        caseFile: selectedCase,
        reviewState: {
          labelDuelWinnerId: selectedCase.candidateLabels[0]?.id,
        },
        onSelectSession: () => undefined,
        onContinue: () => undefined,
      }),
      React.createElement(VerdictPanel, {
        caseFile: selectedCase,
        reviewState: {
          blindChoiceId: "cloud-resource-discovery",
          labelDuelWinnerId: "label-iam-baseline",
          impostorSessionId: "iam-s-01",
          finalVerdict: "unsupported_overclaimed",
        },
        balance,
        onSelectVerdict: () => undefined,
        onToggleFailureMode: () => undefined,
        onOpenReviewDrawer: () => undefined,
        onCopyJson: () => undefined,
        onDownloadJson: () => undefined,
      }),
    ),
  );

  assert.ok(
    (markup.match(/class="review-terminology-help"/g)?.length ?? 0) >= 7,
  );
  assert.match(markup, /CasePackage<\/dt><dd>The versioned cluster/);
  assert.match(markup, /Cluster<\/dt><dd>A group of similar telemetry sessions/);
  assert.match(markup, /Claim<\/dt><dd>A specific statement made by the AI label/);
  assert.match(markup, /Evidence<\/dt><dd>A reviewable item used to support/);
  assert.match(markup, /AI label<\/dt><dd>The generated name or interpretation/);
  assert.match(markup, /Blind assessment<\/dt><dd>Your evidence-based interpretation/);
  assert.match(markup, /Representative session<\/dt><dd>A selected session/);
  assert.match(markup, /Outlier \/ impostor<\/dt><dd>A session that may not fit/);
  assert.match(markup, /Verdict<\/dt><dd>The final structured judgment/);
  assert.match(markup, /Split<\/dt><dd>Separate a mixed cluster/);
  assert.match(markup, /Merge<\/dt><dd>Combine this cluster/);
  assert.match(markup, /ReviewResult<\/dt><dd>The versioned export of one reviewer/);
});

test("copy reductions preserve blind review and keep progression UI compact", () => {
  const blindMarkup = renderBlindReadPageText();
  const verdictMarkup = renderVerdictPageText();

  assert.match(
    blindMarkup,
    /Judge whether the visible evidence supports an interpretation—not whether the cluster is dangerous\./,
  );
  assert.match(blindMarkup, /The AI label stays hidden until you choose\./);
  assert.doesNotMatch(
    blindMarkup,
    /The blind pass captures your first evidence-based judgment/,
  );
  assert.doesNotMatch(
    blindMarkup,
    /Label, claim, and candidate label details stay sealed until you choose/,
  );
  assertReviewResultProgressionCopy(verdictMarkup);
  assert.doesNotMatch(verdictMarkup, /Combine those compatible ReviewResults/);
  assert.doesNotMatch(verdictMarkup, /Use that EvaluationReport to evaluate/);
});

test("insufficient-context guidance uses existing review choices", () => {
  const selectedCase = sampleCases[0];
  assert.ok(selectedCase);

  const evidenceRatings = getEvidenceRatings(selectedCase, {});
  const balance = getEvidenceBalance(selectedCase, evidenceRatings);
  const reviewState = {
    blindChoiceId: "not-enough-evidence",
    aiLabelRevealed: true,
  };
  const markup = renderStaticMarkup(
    React.createElement(
      React.Fragment,
      null,
      React.createElement(EvidenceBoard, {
        caseFile: selectedCase,
        reviewState,
        evidenceRatings,
        balance,
        insufficientContextGuidance: "need_context",
        onRateEvidence: () => undefined,
      }),
      React.createElement(LabelDuelPanel, {
        caseFile: selectedCase,
        reviewState: {},
        insufficientContextGuidance: "need_context",
        onSelectWinner: () => undefined,
        onToggleReason: () => undefined,
        onSetDuelNote: () => undefined,
        onContinue: () => undefined,
      }),
      React.createElement(VerdictPanel, {
        caseFile: selectedCase,
        reviewState: {},
        balance,
        insufficientContextGuidance: "need_context",
        onSelectVerdict: () => undefined,
        onToggleFailureMode: () => undefined,
        onOpenReviewDrawer: () => undefined,
        onCopyJson: () => undefined,
        onDownloadJson: () => undefined,
      }),
    ),
  );

  assert.match(markup, /Context-limited review/);
  assert.match(markup, /Use Needs context instead of guessing support\./);
  assert.match(markup, /Choose the uncertainty-preserving label when no label is defensible\./);
  assert.match(markup, /Context-safe option/);
  assert.match(markup, /Uncertain/);
  assert.match(markup, /Needs better evidence/);
  assert.match(markup, /Collect more evidence is the exported action for these outcomes\./);
});

test("evidence verification explains how to interpret every rating concept", () => {
  const selectedCase = sampleCases[0];
  assert.ok(selectedCase);

  const evidenceRatings = getEvidenceRatings(selectedCase, {});
  const markup = renderStaticMarkup(
    React.createElement(EvidenceBoard, {
      caseFile: selectedCase,
      evidenceRatings,
      balance: getEvidenceBalance(selectedCase, evidenceRatings),
      onRateEvidence: () => undefined,
    }),
  );

  assert.match(markup, /How to rate evidence/);
  assert.match(markup, /Supports<\/dt><dd>Directly backs the claim\./);
  assert.match(
    markup,
    /Weak support<\/dt><dd>Points in the same direction but is not enough alone\./,
  );
  assert.match(
    markup,
    /Irrelevant<\/dt><dd>Does not materially affect the claim\./,
  );
  assert.match(
    markup,
    /Contradicts<\/dt><dd>Weakens or conflicts with the claim\./,
  );
  assert.match(
    markup,
    /Insufficient<\/dt><dd>Not enough evidence to support the claim\./,
  );
  assert.match(
    markup,
    /Needs more context<\/dt><dd>Cannot judge without more baseline, provenance, or detail\./,
  );
});

test("evidence verification renders optional sanitized field highlights", () => {
  const selectedCase = sampleCases[0];
  assert.ok(selectedCase);

  const targetEvidence = selectedCase.evidenceItems[0];
  assert.ok(targetEvidence);
  const linkedClaimId =
    getRelationsForEvidence(selectedCase, targetEvidence.id)[0]?.claimId ??
    selectedCase.claims[0]?.id;
  assert.ok(linkedClaimId);
  const highlights = [
    {
      field: "features[0]",
      label: "Observed event",
      value: "CreateRole",
      reason: "supports",
      claimIds: [linkedClaimId],
    },
    {
      field: "rollout_window",
      label: "Rollout context",
      value: "daytime maintenance window",
      reason: "context",
    },
    {
      field: "unrelated_sanitized_field",
      label: "Unrelated claim field",
      value: "not shown for this claim",
      reason: "context",
      claimIds: ["claim-not-linked-to-this-evidence"],
    },
  ] satisfies EvidenceHighlight[];

  const highlightedCase = {
    ...selectedCase,
    evidenceItems: selectedCase.evidenceItems.map((evidence) =>
      evidence.id === targetEvidence.id
        ? {
            ...evidence,
            highlights,
          }
        : evidence,
    ),
  };
  const evidenceRatings = getEvidenceRatings(highlightedCase, {});
  const markup = renderStaticMarkup(
    React.createElement(EvidenceBoard, {
      caseFile: highlightedCase,
      evidenceRatings,
      balance: getEvidenceBalance(highlightedCase, evidenceRatings),
      onRateEvidence: () => undefined,
    }),
  );

  assert.match(markup, /Sanitized fields/);
  assert.match(markup, /aria-label="[^"]+ sanitized field highlights"/);
  assert.match(markup, /Observed event/);
  assert.match(markup, /features\[0\]/);
  assert.match(markup, /CreateRole/);
  assert.match(markup, /Supports/);
  assert.match(markup, /Rollout context/);
  assert.match(markup, /daytime maintenance window/);
  assert.match(markup, /Context/);
  assert.match(markup, /aria-label="Weak support, preselected suggestion"/);
  assert.match(markup, /Mark irrelevant \/ noise/);
  assert.doesNotMatch(markup, /Unrelated claim field/);
  assert.doesNotMatch(markup, /not shown for this claim/);
});

test("evidence verification omits highlight UI when metadata is absent", () => {
  const selectedCase = sampleCases[0];
  assert.ok(selectedCase);

  const evidenceRatings = getEvidenceRatings(selectedCase, {});
  const markup = renderStaticMarkup(
    React.createElement(EvidenceBoard, {
      caseFile: selectedCase,
      evidenceRatings,
      balance: getEvidenceBalance(selectedCase, evidenceRatings),
      onRateEvidence: () => undefined,
    }),
  );

  assert.match(markup, /How to rate evidence/);
  assert.match(markup, /Mark irrelevant \/ noise/);
  assert.doesNotMatch(markup, /Sanitized fields/);
  assert.doesNotMatch(markup, /sanitized field highlights/);
});

test("final evaluation prompts a complete verdict and action check", () => {
  const selectedCase = sampleCases[0];
  assert.ok(selectedCase);

  const evidenceRatings = getEvidenceRatings(selectedCase, {});
  const markup = renderStaticMarkup(
    React.createElement(VerdictPanel, {
      caseFile: selectedCase,
      reviewState: {},
      balance: getEvidenceBalance(selectedCase, evidenceRatings),
      onSelectVerdict: () => undefined,
      onToggleFailureMode: () => undefined,
      onOpenReviewDrawer: () => undefined,
      onCopyJson: () => undefined,
      onDownloadJson: () => undefined,
    }),
  );

  assert.match(markup, /Decision checks/);
  assert.match(markup, /Is the AI label supported by the evidence\?/);
  assert.match(markup, /Is the label too broad, too specific, or overclaimed\?/);
  assert.match(markup, /Is uncertainty high enough to avoid a strong conclusion\?/);
  assert.match(markup, /Does the cluster appear mixed or impure\?/);
  assert.match(markup, /Is the recommended action aligned with the evidence\?/);
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

  assert.match(markup, /Final Evaluation · Review complete/);
  assert.match(markup, /Unsupported \/ overclaimed/);
  assert.match(markup, /The AI claim overstates what the evidence supports\./);
  assert.match(
    markup,
    /The reviewed evidence points to cloud resource discovery, but does not establish suspicious IAM privilege escalation\./,
  );
  assert.match(markup, /Ready to export/);
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
  assertReviewResultProgressionCopy(markup);
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
  assert.match(markup, /Ready to export/);
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
  assert.match(pageText, /Ready to export/);
  assert.match(pageText, /Evaluation outcome<\/dt><dd>Unsupported \/ overclaimed/);
  assert.match(
    pageText,
    /class="verdict-button is-selected"[^>]*aria-pressed="true"[^>]*><span class="verdict-button-label">Unsupported \/ overclaimed/,
  );
  assertReviewResultProgressionCopy(pageText);
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

test("review summary drawer keeps export and aggregation boundaries explicit", () => {
  const selectedCase = sampleCases[0];
  assert.ok(selectedCase);

  const blindChoice = selectedCase.blindInterpretationOptions.find(
    (option) => option.id === "cloud-resource-discovery",
  );
  const duelWinner = selectedCase.candidateLabels.find(
    (candidate) => candidate.id === "label-iam-baseline",
  );
  const impostor = selectedCase.representativeSessions.find(
    (session) => session.id === "iam-s-01",
  );
  assert.ok(blindChoice);
  assert.ok(duelWinner);
  assert.ok(impostor);

  const evidenceRatings = getEvidenceRatings(selectedCase, {});
  const markup = renderStaticMarkup(
    React.createElement(ReviewSummaryDrawer, {
      open: true,
      caseFile: selectedCase,
      reviewState: {
        blindChoiceId: "cloud-resource-discovery",
        aiLabelRevealed: true,
        labelDuelWinnerId: "label-iam-baseline",
        impostorSessionId: "iam-s-01",
        failureModes: ["less_overclaimed", "missing_evidence"],
        finalVerdict: "unsupported_overclaimed",
      },
      blindChoice,
      duelWinner,
      impostor,
      balance: getEvidenceBalance(selectedCase, evidenceRatings),
      exportJson: '{"schema_version":"review_result.v0.1"}',
      onClose: () => undefined,
      onCopyJson: () => undefined,
      onDownloadJson: () => undefined,
    }),
  );

  assert.match(markup, /Structured ReviewResult JSON/);
  assertReviewResultProgressionCopy(markup);
  assert.match(markup, /review_result\.v0\.1/);
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
    /Select the candidate you judge best-supported and most defensible\./,
  );
  assert.match(
    emptyMarkup,
    /selected_label_id records the candidate you accept as best-supported/,
  );
  assert.match(emptyMarkup, /AI-generated label/);
  assert.match(emptyMarkup, /Suspicious IAM privilege escalation/);
  assert.match(emptyMarkup, /Your evidence read/);
  assert.match(emptyMarkup, /1 weak support · 2 contradictions · 1 needs context/);
  assert.match(emptyMarkup, /Current signal/);
  assert.match(emptyMarkup, /Likely overclaim/);
  assert.match(emptyMarkup, /Candidate labels/);
  assert.doesNotMatch(
    emptyMarkup,
    /Select the label that is best supported by the evidence/,
  );
  assert.match(emptyMarkup, /Best supported/);
  assert.match(
    emptyMarkup,
    /Best matches the observed IAM activity without assuming malicious escalation/,
  );
  assert.match(emptyMarkup, /Choose as best supported/);
  assert.doesNotMatch(emptyMarkup, /Recommended/);
  assert.doesNotMatch(emptyMarkup, /Selected/);
  assert.match(emptyMarkup, /AI-generated label/);
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
  assert.match(selectedMarkup, /Chosen as best supported/);
  assert.match(
    selectedMarkup,
    /These reasons compare the selected label with the AI label/,
  );
  assert.match(selectedMarkup, /Chosen label avoids unsupported overclaim/);
  assert.match(selectedMarkup, /AI label lacks malicious-intent evidence/);
  assert.match(selectedMarkup, /AI label lacks downstream-abuse evidence/);
  assert.match(selectedMarkup, /Chosen label is better supported/);
  assert.match(selectedMarkup, /Cluster may need more than one label/);
  assert.match(selectedMarkup, /Add a short note, optional/);
  assert.match(
    selectedMarkup,
    /Optional rationale for why this candidate is best-supported/,
  );
  assert.match(
    selectedMarkup,
    /Chosen as more defensible than the AI label: Routine IAM role provisioning\./,
  );
  assert.match(
    selectedMarkup,
    /Proceed to cluster fit check/,
  );
  assert.doesNotMatch(
    selectedMarkup,
    /disabled="">Proceed to cluster fit check/,
  );

  const aiAcceptedMarkup = renderStaticMarkup(
    React.createElement(LabelDuelPanel, {
      caseFile: selectedCase,
      reviewState: {
        blindChoiceId: "cloud-resource-discovery",
        aiLabelRevealed: true,
        labelDuelWinnerId: "label-iam-baseline",
        duelReasons: ["more_specific"],
      },
      onSelectWinner: () => undefined,
      onToggleReason: () => undefined,
      onSetDuelNote: () => undefined,
      onBackToEvidenceBoard: () => undefined,
      onContinue: () => undefined,
    }),
  );

  assert.match(aiAcceptedMarkup, /Why accept the AI label\?/);
  assert.match(
    aiAcceptedMarkup,
    /Choosing the AI label accepts it as the best-supported candidate/,
  );
  assert.match(aiAcceptedMarkup, /Accepted as best supported/);
  assert.match(
    aiAcceptedMarkup,
    /AI label accepted as best-supported: Suspicious IAM privilege escalation\./,
  );
  assert.doesNotMatch(aiAcceptedMarkup, /Chosen label is better supported/);
  assert.doesNotMatch(aiAcceptedMarkup, /AI label lacks malicious-intent evidence/);
  assert.doesNotMatch(aiAcceptedMarkup, /AI label lacks downstream-abuse evidence/);
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
    /Choose the session least consistent with the selected label\./,
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
  assert.match(markup, /Weakest-fit signal/);
  assert.match(markup, /Seeded outlier \/ impostor candidate/);
  assert.match(markup, /Representative session/);
  assert.match(
    markup,
    /Seeded candidates were flagged upstream\. Ordinary representative sessions require confirmation/,
  );
  assert.match(markup, /What to look for/);
  assert.match(markup, /High outlier risk/);
  assert.match(markup, /Low cluster pattern match/);
  assert.match(
    markup,
    /High outlier risk plus low pattern match signals the weakest fit\./,
  );
  assert.match(markup, /iam-s-04 currently has the clearest mismatch\./);
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
  assert.match(alternateMarkup, /Confirmation required/);
  assert.match(
    alternateMarkup,
    /This is an ordinary representative session, not a seeded outlier or impostor candidate/,
  );
  assert.match(
    alternateMarkup,
    /Confirm representative session as outlier \/ impostor/,
  );
  assert.match(
    alternateMarkup,
    /Selected representative session: Role validation checks\. Confirm this non-candidate choice before continuing\./,
  );
  assert.match(alternateMarkup, /disabled="">Continue to final evaluation/);
  assert.doesNotMatch(
    alternateMarkup,
    /This is the strongest mismatch candidate because it has the highest outlier risk/,
  );

  const confirmedAlternateMarkup = renderStaticMarkup(
    React.createElement(ImpostorPanel, {
      caseFile: selectedCase,
      reviewState: {
        labelDuelWinnerId: "label-iam-uncertain",
        impostorSessionId: "iam-s-03",
        nonCandidateImpostorConfirmed: true,
      },
      onSelectSession: () => undefined,
      onBackToLabelDuel: () => undefined,
      onContinue: () => undefined,
    }),
  );

  assert.match(confirmedAlternateMarkup, /Selection confirmed/);
  assert.match(confirmedAlternateMarkup, /Non-candidate choice confirmed/);
  assert.doesNotMatch(
    confirmedAlternateMarkup,
    /Confirm representative session as outlier \/ impostor/,
  );
  assert.doesNotMatch(
    confirmedAlternateMarkup,
    /disabled="">Continue to final evaluation/,
  );
});

test("blind interpretation choices render as accessible radio cards", () => {
  const selectedCase = sampleCases[0];
  assert.ok(selectedCase);

  const markup = renderStaticMarkup(
    React.createElement(BlindReadPanel, {
      caseFile: selectedCase,
      reviewState: {
        reviewReadiness: "ready",
        blindChoiceId: "routine-iam-provisioning",
      },
      onChooseReviewReadiness: () => undefined,
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

test("persisted blind choices from older sessions derive the checkpoint state", () => {
  const selectedCase = sampleCases[0];
  assert.ok(selectedCase);

  const markup = renderStaticMarkup(
    React.createElement(BlindReadPanel, {
      caseFile: selectedCase,
      reviewState: {
        blindChoiceId: "routine-iam-provisioning",
      },
      onChooseReviewReadiness: () => undefined,
      onChooseBlindInterpretation: () => undefined,
      onRevealAiLabel: () => undefined,
    }),
  );

  assert.match(
    markup,
    /<input(?=[^>]*checked="")(?=[^>]*name="review-readiness")(?=[^>]*value="ready")[^>]*\/>/,
  );
  assert.match(markup, /Reveal AI claim/);
  assert.doesNotMatch(markup, /disabled="">Reveal AI claim/);
});

test("blind read offers a clear path to AI Reveal once the label is already revealed", () => {
  const selectedCase = sampleCases[0];
  assert.ok(selectedCase);

  const markup = renderStaticMarkup(
    React.createElement(BlindReadPanel, {
      caseFile: selectedCase,
      reviewState: {
        reviewReadiness: "ready",
        blindChoiceId: "routine-iam-provisioning",
        aiLabelRevealed: true,
      },
      onChooseReviewReadiness: () => undefined,
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
