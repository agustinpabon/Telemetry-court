import assert from "node:assert/strict";
import test from "node:test";

import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  ArenaActionFooter,
  ArenaHeader,
  ArenaStatusBadge,
  ArenaStepHero,
  ArenaStepProgress,
  ArenaWorkflowShell,
} from "@/components/arena/WorkflowPrimitives";

function renderStaticMarkup(element: React.ReactElement): string {
  return renderToStaticMarkup(element).replace(/\s+/g, " ");
}

test("workflow primitives render the shared arena page language", () => {
  const markup = renderStaticMarkup(
    React.createElement(
      ArenaWorkflowShell,
      { ariaLabel: "AI Reveal", className: "test-stage" },
      React.createElement(ArenaHeader),
      React.createElement(ArenaStepProgress, { currentStage: "ai_reveal" }),
      React.createElement(ArenaStepHero, {
        eyebrow: "AI Reveal",
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
          label: "Back to blind read",
          onClick: () => undefined,
        },
        primaryAction: {
          label: "Review evidence board",
          onClick: () => undefined,
        },
      }),
    ),
  );

  assert.match(markup, /class="arena-workflow-shell stage-surface test-stage"/);
  assert.match(markup, /Telemetry Court/);
  assert.match(markup, /Evidence review for AI-named telemetry clusters\./);
  assert.match(markup, /Step 4 of 8 · AI Reveal/);
  assert.match(markup, /aria-current="step"/);
  assert.match(markup, /arena-status-badge arena-status-badge-overclaim/);
  assert.match(markup, /Your read and the AI label diverge\./);
  assert.match(markup, /This is not a verdict\./);
  assert.match(markup, /Back to blind read/);
  assert.match(markup, /Review evidence board/);
});
