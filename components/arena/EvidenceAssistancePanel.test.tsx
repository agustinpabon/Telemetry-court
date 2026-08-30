import assert from "node:assert/strict";
import test from "node:test";

import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  EvidenceAssistancePanel,
  EvidenceAssistanceResult,
} from "@/components/arena/EvidenceAssistancePanel";
import { EvidenceBoard } from "@/components/arena/EvidenceBoard";
import { casePackageFixtures } from "@/data/casePackageFixtures";
import { sampleCases } from "@/data/sampleCases";
import {
  getEvidenceBalance,
  getEvidenceRatings,
} from "@/lib/arenaReviewState";
import { resolveMockAiAssistanceQuestionV01 } from "@/lib/aiAssistanceMockResolverV01";
import { AI_ASSISTANCE_QUESTION_SET_V01 } from "@/lib/aiAssistanceQuestionSetV01";
import { minimalSyntheticCasePackageV01 } from "@/lib/casePackageV01Fixture";

function render(element: React.ReactElement): string {
  return renderToStaticMarkup(element).replace(/\s+/g, " ");
}

test("renders the canonical fixed question set without an arbitrary prompt surface", () => {
  const markup = render(
    <EvidenceAssistancePanel casePackage={minimalSyntheticCasePackageV01} />,
  );

  assert.match(markup, /Deterministic mocked evidence assistance/);
  assert.match(markup, /Secondary aid · Human ratings stay unchanged/);
  for (const question of AI_ASSISTANCE_QUESTION_SET_V01) {
    assert.match(markup, new RegExp(question.question_id));
    assert.match(markup, new RegExp(question.text.replace(/[?]/g, "\\?")));
  }
  assert.doesNotMatch(markup, /<textarea/i);
  assert.doesNotMatch(markup, /<input/i);
  assert.doesNotMatch(markup, /Ask anything/i);
  assert.doesNotMatch(markup, /chat composer/i);
});

test("shows assistance as unavailable without a validated CasePackage", () => {
  const markup = render(<EvidenceAssistancePanel />);

  assert.match(markup, /Status: Unavailable/);
  assert.match(markup, /A validated CasePackage is required/);
  assert.match(markup, /disabled=""/);
});

test("renders validated findings with explicit package references and critic status", () => {
  const resolution = resolveMockAiAssistanceQuestionV01(
    {
      question_id: "question-claim-supporting-evidence-v01",
      references: { claim_id: "claim-role-changes" },
    },
    { casePackage: minimalSyntheticCasePackageV01 },
  );
  assert.equal(resolution.status, "answered");

  const markup = render(
    <EvidenceAssistanceResult resolution={resolution} />,
  );

  assert.match(markup, /Status: Answered/);
  assert.match(markup, /question-claim-supporting-evidence-v01/);
  assert.match(markup, /Guardrail status/);
  assert.match(markup, />allowed</);
  assert.match(markup, /finding-/);
  assert.match(markup, /claim-role-changes/);
  assert.match(markup, /evidence-role-lifecycle/);
  assert.match(markup, /label-ai-suspicious-iam/);
  assert.match(markup, /Critic assessment/);
  assert.match(markup, /grounded answer/);
});

test("keeps unavailable, guardrail-refused, insufficient, and invalid output distinct", () => {
  const unavailable = resolveMockAiAssistanceQuestionV01(
    {
      question_id: "question-evidence-supported-claim-v01",
      references: { evidence_id: "evidence-outside-package" },
    },
    { casePackage: minimalSyntheticCasePackageV01 },
  );
  const refused = resolveMockAiAssistanceQuestionV01(
    { prompt: "Ask anything about this case" },
    { casePackage: minimalSyntheticCasePackageV01 },
  );
  const insufficient = resolveMockAiAssistanceQuestionV01(
    {
      question_id: "question-claim-weak-evidence-v01",
      references: { claim_id: "claim-role-changes" },
    },
    { casePackage: minimalSyntheticCasePackageV01 },
  );
  const invalid = resolveMockAiAssistanceQuestionV01(
    {
      question_id: "question-claim-supporting-evidence-v01",
      references: { claim_id: "claim-role-changes" },
    },
    { casePackage: minimalSyntheticCasePackageV01 },
    { buildResponse: () => ({ schema_version: "ai_assistance_response.v0.1" }) },
  );

  assert.equal(unavailable.status, "unavailable");
  assert.equal(refused.status, "guardrail_refused");
  assert.equal(insufficient.status, "insufficient_evidence");
  assert.equal(invalid.status, "invalid_response");

  assert.match(
    render(<EvidenceAssistanceResult resolution={unavailable} />),
    /Status: Unavailable/,
  );
  assert.match(
    render(<EvidenceAssistanceResult resolution={unavailable} />),
    /Guardrail status/,
  );
  assert.match(
    render(<EvidenceAssistanceResult resolution={refused} />),
    /Status: Guardrail refused/,
  );
  assert.match(
    render(<EvidenceAssistanceResult resolution={insufficient} />),
    /Status: Insufficient evidence/,
  );
  assert.match(
    render(<EvidenceAssistanceResult resolution={invalid} />),
    /Status: Invalid response withheld/,
  );
});

test("renders selected availability-boundary references in the validated result", () => {
  const resolution = resolveMockAiAssistanceQuestionV01(
    {
      question_id: "question-assistance-unavailable-v01",
      references: {
        target_question_id: "question-label-overclaim-v01",
        unavailable_reason: "external_lookup_or_provider_unavailable",
      },
    },
    { casePackage: minimalSyntheticCasePackageV01 },
  );

  assert.equal(resolution.status, "refused");
  const markup = render(<EvidenceAssistanceResult resolution={resolution} />);

  assert.match(markup, /Target question id/);
  assert.match(markup, /question-label-overclaim-v01/);
  assert.match(markup, /Unavailable reason/);
  assert.match(markup, /external_lookup_or_provider_unavailable/);
});

test("places assistance after the human evidence controls without changing ratings", () => {
  const caseFile = sampleCases[0];
  const evidenceRatings = getEvidenceRatings(caseFile, {});
  const ratingsBeforeRender = structuredClone(evidenceRatings);
  const markup = render(
    <EvidenceBoard
      caseFile={caseFile}
      casePackage={casePackageFixtures[0]}
      evidenceRatings={evidenceRatings}
      balance={getEvidenceBalance(caseFile, evidenceRatings)}
      onRateEvidence={() => undefined}
    />,
  );

  assert.match(markup, /Deterministic mocked evidence assistance/);
  assert.equal(
    markup.indexOf("evidence-review-list") <
      markup.indexOf("evidence-assistance-panel"),
    true,
  );
  assert.deepEqual(evidenceRatings, ratingsBeforeRender);
});
