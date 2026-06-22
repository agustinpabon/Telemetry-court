import assert from "node:assert/strict";
import test from "node:test";

import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { CasePackageImportControl } from "@/components/arena/CasePackageImportControl";
import {
  ArenaActionFooter,
  ArenaHeader,
  ArenaReviewerGoal,
  ArenaStatusBadge,
  ArenaStepHero,
  ArenaWorkflowShell,
} from "@/components/arena/WorkflowPrimitives";

function renderStaticMarkup(element: React.ReactElement): string {
  return renderToStaticMarkup(element).replace(/\s+/g, " ");
}

test("workflow primitives render the shared arena page language", () => {
  const markup = renderStaticMarkup(
    React.createElement(
      ArenaWorkflowShell,
      { ariaLabel: "AI Claim Check", className: "test-stage" },
      React.createElement(ArenaHeader, {
        currentStage: "ai_reveal",
        actions: React.createElement("button", { type: "button" }, "Results"),
      }),
      React.createElement(ArenaReviewerGoal),
      React.createElement(ArenaStepHero, {
        eyebrow: "AI Claim Check",
        status: React.createElement(
          ArenaStatusBadge,
          { tone: "overclaim" },
          "Likely overclaim",
        ),
        title: "Your read and the AI label diverge.",
        summary: "The model claim is visible, but it still needs evidence review.",
        context: "This is not a verdict.",
      }),
      React.createElement(ArenaActionFooter, {
        microcopy: "Inspect the signals before deciding.",
        secondaryAction: {
          label: "Return to initial assessment",
          onClick: () => undefined,
        },
        primaryAction: {
          label: "Proceed to verification",
          onClick: () => undefined,
        },
      }),
    ),
  );

  assert.match(markup, /class="arena-workflow-shell stage-surface test-stage"/);
  assert.match(markup, /Telemetry Court/);
  assert.match(markup, /Evidence review for AI-named telemetry clusters\./);
  assert.match(markup, /class="arena-topbar arena-header tc-masthead"/);
  assert.match(markup, /class="tc-masthead__inner"/);
  assert.match(markup, /class="arena-topbar-actions tc-masthead__actions"/);
  assert.match(markup, /class="arena-step-progress tc-masthead__progress-row"/);
  assert.match(markup, /What you are reviewing/);
  assert.match(markup, /Step 4 of 8 · AI Claim Check/);
  assert.match(markup, /aria-current="step"/);
  assert.match(markup, /arena-status-badge arena-status-badge-overclaim/);
  assert.match(markup, /Your read and the AI label diverge\./);
  assert.match(markup, /This is not a verdict\./);
  assert.match(markup, /Return to initial assessment/);
  assert.match(markup, /Proceed to verification/);
});

test("review orientation explains the CasePackage task without exposing a label", () => {
  const markup = renderStaticMarkup(React.createElement(ArenaReviewerGoal));

  assert.match(markup, /What you are reviewing/);
  assert.match(markup, /testing whether evidence supports an AI label/);
  assert.match(markup, /not whether the cluster is dangerous/);
  assert.doesNotMatch(markup, /Suspicious IAM privilege escalation/);
});

test("CasePackage import control renders local import status", () => {
  const successMarkup = renderStaticMarkup(
    React.createElement(CasePackageImportControl, {
      status: {
        state: "success",
        packageId: "pkg-imported-001",
        caseId: "case-imported-001",
        title: "Imported validation package",
      },
      onImportStart: () => undefined,
      onImportText: () => undefined,
      onImportReadError: () => undefined,
      onClearImport: () => undefined,
    }),
  );
  const errorMarkup = renderStaticMarkup(
    React.createElement(CasePackageImportControl, {
      status: {
        state: "error",
        failure: {
          reason: "schema_version",
          title: "Missing or unsupported schema version",
          summary:
            "Package validation could not confirm a supported CasePackage schema version. Review cannot start.",
          suggestedFix:
            'Set schema_version to "case_package.v0.1" and retry the import.',
          message:
            "Missing or unsupported CasePackage schema version. Review cannot start.",
          errors: [
            {
              path: "$.schema_version",
              code: "unsupported_schema_version",
              message:
                'Unsupported CasePackage schema_version "case_package.v9-secret-account-111111111111". Expected "case_package.v0.1".',
            },
          ],
        },
      },
      onImportStart: () => undefined,
      onImportText: () => undefined,
      onImportReadError: () => undefined,
      onClearImport: () => undefined,
    }),
  );

  assert.match(successMarkup, /Import CasePackage/);
  assert.match(successMarkup, /accept="application\/json,.json"/);
  assert.match(successMarkup, /Imported CasePackage pkg-imported-001/);
  assert.match(successMarkup, /case-imported-001/);
  assert.match(errorMarkup, /role="alert"/);
  assert.match(errorMarkup, /Package validation/);
  assert.match(errorMarkup, /Missing or unsupported schema version/);
  assert.match(errorMarkup, /Review not started/);
  assert.match(errorMarkup, /Error count/);
  assert.match(errorMarkup, /First validation errors/);
  assert.match(errorMarkup, /\$\.schema_version/);
  assert.match(errorMarkup, /unsupported_schema_version/);
  assert.match(errorMarkup, /\[redacted\]/);
  assert.match(errorMarkup, /Choose Another File/);
  assert.match(errorMarkup, /Clear failed import \/ return to demo/);
  assert.match(errorMarkup, /Copy diagnostics/);
  assert.doesNotMatch(errorMarkup, /case_package\.v9-secret-account-111111111111/);
});
