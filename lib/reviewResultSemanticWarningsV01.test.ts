import assert from "node:assert/strict";
import test from "node:test";

import { casePackageFixtures } from "@/data/casePackageFixtures";
import {
  buildReviewResultSemanticContextFromCasePackageV01,
  getReviewResultSemanticWarningsV01,
} from "@/lib/reviewResultSemanticWarningsV01";
import { validateReviewResultV01 } from "@/lib/reviewResultValidationV01";
import type { ReviewResultV01 } from "@/lib/reviewResultV01";
import type { CasePackageV01 } from "@/lib/types";

test("valid ReviewResults without semantic inconsistencies produce no warnings", () => {
  const review = buildReviewResult();

  assert.deepEqual(getReviewResultSemanticWarningsV01(review), []);
  assert.equal(validateReviewResultV01(review).ok, true);
});

test("insufficient blind interpretation plus selected overclaim AI label emits a non-blocking warning", () => {
  const review = buildReviewResult({
    blindLabel: "Insufficient evidence to support a label",
  });
  const context = buildReviewResultSemanticContextFromCasePackageV01(
    buildContextPackage({
      selectedLabelSource: "ai_generated",
      selectedLabelRationale:
        "This AI-generated label may overclaim malicious intent from thin evidence.",
    }),
  );

  const warnings = getReviewResultSemanticWarningsV01(review, { caseContext: context });

  assert.deepEqual(
    warnings.map((warning) => warning.code),
    ["semantic.insufficient_blind_interpretation_selected_overclaim_label"],
  );
  assert.match(warnings[0]?.message ?? "", /insufficient evidence/i);
  assert.equal(validateReviewResultV01(review).ok, true);
});

test("needs_better_evidence without failure modes emits a non-blocking warning", () => {
  const review = buildReviewResult({
    finalVerdict: "needs_better_evidence",
    recommendedAction: "collect_more_evidence",
    failureModes: [],
  });

  const warnings = getReviewResultSemanticWarningsV01(review);

  assert.deepEqual(warnings.map((warning) => warning.code), [
    "semantic.needs_better_evidence_without_failure_modes",
  ]);
  assert.equal(validateReviewResultV01(review).ok, true);
});

test("core or high-membership session selected as outlier emits a non-blocking warning", () => {
  const review = buildReviewResult();
  const context = buildReviewResultSemanticContextFromCasePackageV01(
    buildContextPackage({
      selectedSessionFlags: ["representative"],
      selectedSessionMembershipScore: 0.94,
      outlierCandidateSessionIds: [],
    }),
  );

  const warnings = getReviewResultSemanticWarningsV01(review, { caseContext: context });

  assert.deepEqual(warnings.map((warning) => warning.code), [
    "semantic.core_session_selected_as_outlier",
  ]);
  assert.match(warnings[0]?.message ?? "", /representative/i);
  assert.equal(validateReviewResultV01(review).ok, true);
});

test("negative reason codes attached to the selected best-supported label emit a warning", () => {
  const review = buildReviewResult({
    reasonCodes: ["missing_evidence"],
    failureModes: ["missing_evidence"],
  });

  const warnings = getReviewResultSemanticWarningsV01(review);

  assert.deepEqual(warnings.map((warning) => warning.code), [
    "semantic.negative_reason_on_selected_label",
  ]);
  assert.match(warnings[0]?.message ?? "", /selected best-supported label/i);
  assert.equal(validateReviewResultV01(review).ok, true);
});

test("negative failure modes alone do not count as selected-label reason warnings", () => {
  const review = buildReviewResult({
    reasonCodes: ["better_supported"],
    failureModes: ["missing_evidence"],
  });

  assert.deepEqual(getReviewResultSemanticWarningsV01(review), []);
});

test("semantic warning generation does not mutate ReviewResult artifacts or context", () => {
  const review = buildReviewResult({
    finalVerdict: "needs_better_evidence",
    recommendedAction: "collect_more_evidence",
    failureModes: [],
  });
  const context = buildReviewResultSemanticContextFromCasePackageV01(
    buildContextPackage({
      selectedSessionFlags: ["representative"],
      selectedSessionMembershipScore: 0.91,
      outlierCandidateSessionIds: [],
    }),
  );
  const before = JSON.stringify({ review, context });

  getReviewResultSemanticWarningsV01(review, { caseContext: context });

  assert.equal(JSON.stringify({ review, context }), before);
});

type BuildReviewResultInput = {
  blindLabel?: string;
  reasonCodes?: ReviewResultV01["decisions"]["label_comparison"]["reason_codes"];
  failureModes?: ReviewResultV01["decisions"]["failure_modes"];
  finalVerdict?: ReviewResultV01["decisions"]["final_verdict"];
  recommendedAction?: ReviewResultV01["decisions"]["recommended_action"];
};

function buildReviewResult({
  blindLabel = "Routine administration",
  reasonCodes = ["better_supported"],
  failureModes = [],
  finalVerdict = "supported",
  recommendedAction = "accept_label",
}: BuildReviewResultInput = {}): ReviewResultV01 {
  return {
    schema_version: "review_result.v0.1",
    review_id:
      "review:pkg-semantic-001:reviewer-a:session-a:2026-06-23T12:00:00.000Z",
    created_at: "2026-06-23T12:00:00.000Z",
    case_package: {
      schema_version: "case_package.v0.1",
      package_id: "pkg-semantic-001",
      case_id: "case-semantic-001",
      cluster_id: "cluster-semantic-001",
      pipeline: {
        run_id: "run-semantic-001",
        upstream_tool: "semantic-test-generator",
        generated_at: "2026-06-23T11:55:00.000Z",
      },
    },
    reviewer: {
      reviewer_id: "reviewer-a",
      review_session_id: "session-a",
      context: "local_review",
    },
    protocol: {
      protocol_version: "telemetry_court_review.v0.1",
      blind_review_enabled: true,
      ai_label_revealed: true,
    },
    decisions: {
      blind_interpretation: {
        option_id: "blind-semantic-001",
        label: blindLabel,
        agrees_with_ai: false,
      },
      label_comparison: {
        selected_label_id: "label-semantic-ai",
        reason_codes: reasonCodes,
      },
      evidence_ratings: [
        { evidence_id: "evidence-semantic-001", rating: "supports" },
      ],
      outlier_impostor: {
        selected_session_id: "session-semantic-core",
      },
      failure_modes: failureModes,
      final_verdict: finalVerdict,
      recommended_action: recommendedAction,
    },
  };
}

function buildContextPackage({
  selectedLabelSource,
  selectedLabelRationale,
  selectedSessionFlags,
  selectedSessionMembershipScore,
  outlierCandidateSessionIds,
}: {
  selectedLabelSource?: CasePackageV01["candidate_labels"][number]["source"];
  selectedLabelRationale?: string;
  selectedSessionFlags?: CasePackageV01["representative_sessions"][number]["flags"];
  selectedSessionMembershipScore?: number;
  outlierCandidateSessionIds?: string[];
} = {}): CasePackageV01 {
  const basePackage = casePackageFixtures[0];
  assert.ok(basePackage);

  return {
    ...basePackage,
    package_id: "pkg-semantic-001",
    case: {
      ...basePackage.case,
      case_id: "case-semantic-001",
    },
    cluster: {
      ...basePackage.cluster,
      cluster_id: "cluster-semantic-001",
    },
    pipeline: {
      ...basePackage.pipeline,
      run_id: "run-semantic-001",
      upstream_tool: "semantic-test-generator",
      generated_at: "2026-06-23T11:55:00.000Z",
    },
    candidate_labels: [
      {
        ...basePackage.candidate_labels[0],
        label_id: "label-semantic-ai",
        source: selectedLabelSource ?? "ai_generated",
        rationale:
          selectedLabelRationale ??
          "A conservative label supported by the provided evidence.",
      },
      ...basePackage.candidate_labels.slice(1),
    ],
    representative_sessions: [
      {
        ...basePackage.representative_sessions[0],
        session_id: "session-semantic-core",
        cluster_membership: {
          ...basePackage.representative_sessions[0].cluster_membership,
          membership_score:
            selectedSessionMembershipScore === undefined
              ? basePackage.representative_sessions[0].cluster_membership
                  .membership_score
              : {
                  status: "available",
                  value: selectedSessionMembershipScore,
                  min: 0,
                  max: 1,
                },
        },
        flags: selectedSessionFlags ?? ["outlier_candidate"],
      },
      ...basePackage.representative_sessions.slice(1),
    ],
    outlier_impostor_candidates: (
      outlierCandidateSessionIds ?? ["session-semantic-core"]
    ).map((sessionId) => ({
      candidate_id: `candidate-${sessionId}`,
      session_id: sessionId,
      reason: "Test candidate.",
      expected_review_use: "outlier_check",
    })),
  };
}
