import assert from "node:assert/strict";
import test from "node:test";

import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  QuickDispositionControl,
  type QuickDispositionControlEvent,
} from "@/components/arena/QuickDispositionControl";

test("quick disposition control renders early-review actions without triage language", () => {
  const markup = renderToStaticMarkup(
    React.createElement(QuickDispositionControl, {
      sourceStage: "case_file",
      statusMessage: "Quick disposition saved.",
      onRecordDisposition: () => undefined,
      onContinueFullReview: () => undefined,
    }),
  );

  assert.match(markup, /Quick disposition/);
  assert.match(markup, /Not interesting \/ skip/);
  assert.match(markup, /Save for later/);
  assert.match(markup, /Continue full review/);
  assert.match(markup, /Cannot judge from this package/);
  assert.match(markup, /Quick disposition saved/);
  assert.doesNotMatch(markup, /triage/i);
  assert.doesNotMatch(markup, /incident/i);
  assert.doesNotMatch(markup, /remediation/i);
});

test("continue full review does not record a quick disposition and preserves the normal review path", () => {
  const events: Array<
    | { type: "record"; event: QuickDispositionControlEvent }
    | { type: "continue" }
  > = [];
  const element = QuickDispositionControl({
    sourceStage: "case_file",
    onRecordDisposition: (event) => events.push({ type: "record", event }),
    onContinueFullReview: () => events.push({ type: "continue" }),
  });

  findButtonByText(element, "Continue full review").props.onClick();

  assert.deepEqual(events, [
    { type: "continue" },
  ]);
});

test("saving for later records only the quick disposition path", () => {
  const events: Array<
    | { type: "record"; event: QuickDispositionControlEvent }
    | { type: "continue" }
  > = [];
  const element = QuickDispositionControl({
    sourceStage: "case_file",
    onRecordDisposition: (event) => events.push({ type: "record", event }),
    onContinueFullReview: () => events.push({ type: "continue" }),
  });

  findButtonByText(element, "Save for later").props.onClick();

  assert.deepEqual(events, [
    {
      type: "record",
      event: {
        sourceStage: "case_file",
        disposition: "save_for_later",
        reasonCodes: ["needs_later_review"],
      },
    },
  ]);
});

function findButtonByText(element: React.ReactNode, label: string): React.ReactElement<{
  onClick: () => void;
}> {
  if (!React.isValidElement(element)) {
    throw new Error(`Could not find button "${label}".`);
  }

  if (
    element.type === "button" &&
    getTextContent(
      (element.props as { children?: React.ReactNode }).children,
    ) === label
  ) {
    return element as React.ReactElement<{ onClick: () => void }>;
  }

  const children = React.Children.toArray(
    (element.props as { children?: React.ReactNode }).children,
  );

  for (const child of children) {
    if (React.isValidElement(child)) {
      try {
        return findButtonByText(child, label);
      } catch {
        // Continue searching siblings.
      }
    }
  }

  throw new Error(`Could not find button "${label}".`);
}

function getTextContent(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(getTextContent).join("");
  }

  if (React.isValidElement(node)) {
    return getTextContent(
      (node.props as { children?: React.ReactNode }).children,
    );
  }

  return "";
}
