import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCasePackageV01FromSanitizedAdapterDraft,
  SanitizedCasePackageAdapterV01Error,
  type SanitizedCasePackageAdapterDraftV01,
} from "@/lib/sanitizedCasePackageAdapterV01";
import { validateCasePackageV01 } from "@/lib/casePackageValidation";

function createMinimalSanitizedDraft(): SanitizedCasePackageAdapterDraftV01 {
  return {
    package_id: "pkg-sanitized-adapter-001",
    created_at: "2026-06-23T12:00:00.000Z",
    package_revision: "r1",
    case: {
      case_id: "case-sanitized-adapter-001",
      title: "Sanitized privileged access setup review",
      summary:
        "An approved sanitized cluster draft where the generated label needs evidence review.",
      reviewable_status: "reviewable",
      review_intent: "validate_label",
      limitations: ["Sanitized summaries only; raw telemetry remains upstream."],
    },
    dataset: {
      dataset_id: "dataset-sanitized-cloudtrail-review",
      dataset_name: "Sanitized CloudTrail Review Slice",
      dataset_type: "cloudtrail",
      data_classification: "sanitized",
      source_environment: "authorized-research-environment",
      approved_use: "Approved Telemetry Court review of sanitized summaries.",
      approval_notes: "Approval is recorded in sanitization.review_approval.",
      limitations: ["No raw restricted telemetry is included."],
    },
    cluster: {
      cluster_id: "cluster-sanitized-access-001",
      cluster_name: "Privileged access setup region",
      upstream_cluster_label: "Privileged access setup",
      cluster_size: 42,
      embedding_map: {
        map_id: "map-sanitized-access-001",
        map_tool: "approved-upstream-projection",
        coordinate_space: "upstream-2d-v1",
        coordinates: { x: 0.42, y: 0.31 },
      },
      cluster_method: {
        method: "approved-upstream-density-clustering",
        parameters: { min_cluster_size: 12 },
      },
    },
    pipeline: {
      pipeline_id: "pipeline-sanitized-package-export",
      run_id: "run-sanitized-adapter-001",
      upstream_tool: "approved-upstream-notebook",
      pipeline_version: "0.1.0",
      embedding_model: "approved-summary-embedding-v1",
      clustering_method: "approved-upstream-density-clustering",
      dimensionality_reduction_method: "approved-upstream-projection",
      naming_model: "approved-label-summarizer-v1",
      prompt: {
        prompt_id: "prompt-sanitized-label-v1",
        prompt_summary: "Name the cluster from approved sanitized summaries.",
      },
      generated_at: "2026-06-23T11:58:00.000Z",
      config_summary: "Already-approved sanitized upstream draft mapping test.",
    },
    candidate_labels: [
      {
        label_id: "label-ai-access-setup",
        label: "Privileged access setup",
        source: "ai_generated",
        model_reference: "approved-label-summarizer-v1",
        prompt_reference: "prompt-sanitized-label-v1",
        run_id: "run-sanitized-adapter-001",
        rank: 1,
        linked_claim_ids: ["claim-access-pattern"],
        rationale:
          "Sanitized summaries emphasize role creation and policy attachment.",
      },
      {
        label_id: "label-human-routine-access",
        label: "Routine privileged access preparation",
        source: "human_baseline",
        rank: 2,
        linked_claim_ids: ["claim-access-pattern"],
      },
    ],
    claims: [
      {
        claim_id: "claim-access-pattern",
        text: "The cluster contains access setup behavior using role creation and policy attachment.",
        claim_type: "behavioral_summary",
        linked_label_ids: [
          "label-ai-access-setup",
          "label-human-routine-access",
        ],
        evidence_status: "linked",
      },
    ],
    evidence_summaries: [
      {
        evidence_id: "evidence-access-summary",
        title: "Access setup feature summary",
        summary:
          "Approved derived features show role creation, policy attachment, and rollout metadata.",
        evidence_type: "salient_feature",
        content: {
          content_type: "structured_summary",
          fields: {
            feature_count: 3,
            features: ["CreateRole", "AttachRolePolicy", "TagRole"],
          },
        },
        source_reference: {
          source_id: "source-approved-derived-features",
          source_type: "derived_feature_summary",
          safe_reference: {
            reference_id: "ref-approved-derived-features",
            reference_type: "source_artifact_id",
            artifact_id: "artifact-sanitized-cluster-001/features",
          },
        },
        linked_session_ids: ["session-access-representative"],
        salience: {
          status: "available",
          value: 0.84,
          min: 0,
          max: 1,
          interpretation: "higher_is_better",
        },
      },
    ],
    claim_evidence_links: [
      {
        claim_id: "claim-access-pattern",
        evidence_id: "evidence-access-summary",
        relationship: "supports",
        expected_support: "supports",
        rationale: "The feature summary directly supports the access setup claim.",
      },
    ],
    representative_sessions: [
      {
        session_id: "session-access-representative",
        title: "Representative access setup session",
        summary: "Role creation and policy attachment appear in an approved summary.",
        feature_highlights: ["CreateRole", "AttachRolePolicy"],
        safe_reference: {
          reference_id: "ref-session-access-representative",
          reference_type: "source_artifact_id",
          artifact_id: "artifact-sanitized-cluster-001/sessions/representative",
        },
        cluster_membership: {
          membership_score: {
            status: "available",
            value: 0.88,
            min: 0,
            max: 1,
          },
        },
        flags: ["representative"],
        linked_evidence_ids: ["evidence-access-summary"],
      },
      {
        session_id: "session-access-outlier",
        title: "Potential off-pattern access session",
        summary: "The session has weak overlap and may challenge cluster purity.",
        feature_highlights: ["Off-hours access"],
        cluster_membership: {
          membership_score: {
            status: "available",
            value: 0.27,
            min: 0,
            max: 1,
          },
        },
        flags: ["outlier_candidate"],
      },
    ],
    outlier_impostor_candidates: [
      {
        candidate_id: "candidate-access-outlier",
        session_id: "session-access-outlier",
        reason: "Low feature overlap may indicate an outlier within the cluster.",
        expected_review_use: "outlier_check",
        score: {
          status: "available",
          value: 0.76,
          min: 0,
          max: 1,
          interpretation: "higher_is_better",
        },
      },
    ],
    neighbor_clusters: [
      {
        neighbor_cluster_id: "cluster-neighbor-routine-access",
        label: "Routine access maintenance",
        similarity: {
          status: "available",
          value: 0.64,
          min: 0,
          max: 1,
          interpretation: "higher_is_better",
        },
        reason_this_neighbor_matters:
          "The neighbor shares role features and may expose over-broad naming.",
      },
    ],
    metrics: {
      evidence_coverage: {
        status: "available",
        value: 0.73,
        min: 0,
        max: 1,
        interpretation: "higher_is_better",
      },
      temporal_stability: {
        status: "unavailable",
        reason: "The approved draft covers one bounded review window.",
      },
    },
    provenance: {
      provenance_id: "prov-sanitized-adapter-001",
      source_system: "approved-upstream-notebook",
      source_artifact: "artifact-sanitized-cluster-001",
      generating_tool: "sanitized-case-package-adapter-v01-test",
      generated_at: "2026-06-23T11:58:00.000Z",
      upstream_run_id: "run-sanitized-adapter-001",
      adapter_name: "sanitized-case-package-adapter-v01",
      adapter_version: "0.1.0",
      references: [
        {
          reference_id: "ref-sanitized-upstream-run",
          reference_type: "source_artifact_id",
          artifact_id: "artifact-sanitized-cluster-001",
        },
      ],
      owner: {
        team: "Telemetry Court",
      },
    },
    sanitization: {
      status: "sanitized",
      method:
        "Approved derived summaries with account, principal, host, and event identifiers removed upstream.",
      redaction_notes: [
        "Identifiers were replaced with opaque IDs before this draft was produced.",
      ],
      allowed_display_level: "summary_only",
      raw_drilldown_allowed: false,
      safe_reference_type: "source_artifact_id",
      review_approval: {
        status: "approved",
        approved_by: "data-governance-team",
        approved_at: "2026-06-23T11:59:00.000Z",
        scope: "Telemetry Court review of this sanitized package revision.",
        reference: {
          reference_id: "ref-sanitized-review-approval",
          reference_type: "source_artifact_id",
          artifact_id: "approval-sanitized-cluster-001",
        },
      },
    },
  };
}

function assertAdapterError(
  action: () => unknown,
  expectedPath: string,
  expectedMessage: string,
) {
  assertAdapterIssues(action, [
    { path: expectedPath, message: expectedMessage },
  ]);
}

function assertAdapterIssues(
  action: () => unknown,
  expectedIssues: Array<{ path: string; message: string }>,
) {
  assert.throws(action, (error: unknown) => {
    assert.ok(error instanceof SanitizedCasePackageAdapterV01Error);
    for (const expectedIssue of expectedIssues) {
      assert.ok(
        error.issues.some(
          (issue) =>
            issue.path === expectedIssue.path &&
            issue.message.includes(expectedIssue.message),
        ),
        `Expected ${expectedIssue.path} to include ${
          expectedIssue.message
        }, got ${JSON.stringify(error.issues)}`,
      );
    }
    return true;
  });
}

test("maps a minimal sanitized adapter draft into a valid CasePackage v0.1", () => {
  const mapped = buildCasePackageV01FromSanitizedAdapterDraft(
    createMinimalSanitizedDraft(),
  );
  const validation = validateCasePackageV01(mapped);

  assert.equal(validation.ok, true);
  assert.equal(mapped.schema_version, "case_package.v0.1");
  assert.deepEqual(mapped.claims[0].linked_evidence_ids, [
    "evidence-access-summary",
  ]);
  assert.equal(mapped.claims[0].evidence_status, "linked");
  assert.deepEqual(mapped.evidence_items[0].linked_claim_ids, [
    "claim-access-pattern",
  ]);
  assert.deepEqual(mapped.cluster.embedding_map, {
    map_id: "map-sanitized-access-001",
    map_tool: "approved-upstream-projection",
    coordinate_space: "upstream-2d-v1",
    coordinates: { x: 0.42, y: 0.31 },
  });
});

test("rejects a non-synthetic draft missing review approval", () => {
  const draft = createMinimalSanitizedDraft();
  delete draft.sanitization.review_approval;

  assertAdapterError(
    () => buildCasePackageV01FromSanitizedAdapterDraft(draft),
    "$.sanitization.review_approval",
    "Non-synthetic sanitized adapter drafts require review approval.",
  );
});

test("rejects a linked claim without a claim-to-evidence link", () => {
  const draft = createMinimalSanitizedDraft();
  draft.claim_evidence_links = [];

  assertAdapterError(
    () => buildCasePackageV01FromSanitizedAdapterDraft(draft),
    "$.claims[0].claim_evidence_links",
    "Linked claims must have at least one claim-to-evidence link.",
  );
});

test("rejects a topology-bearing draft missing map coordinates", () => {
  const draft = createMinimalSanitizedDraft();
  delete draft.cluster.embedding_map.coordinates;

  assertAdapterError(
    () => buildCasePackageV01FromSanitizedAdapterDraft(draft),
    "$.cluster.embedding_map.coordinates",
    "Embedding map coordinates with numeric x and y are required.",
  );
});

test("keeps outlier and impostor candidates separate from representative sessions", () => {
  const mapped = buildCasePackageV01FromSanitizedAdapterDraft(
    createMinimalSanitizedDraft(),
  );

  assert.equal(mapped.outlier_impostor_candidates.length, 1);
  assert.equal(
    mapped.outlier_impostor_candidates[0].candidate_id,
    "candidate-access-outlier",
  );
  assert.equal(
    mapped.outlier_impostor_candidates[0].session_id,
    "session-access-outlier",
  );
  assert.equal(mapped.representative_sessions.length, 2);
  assert.equal(
    "candidate_id" in mapped.representative_sessions[1],
    false,
  );
  assert.deepEqual(mapped.representative_sessions[1].flags, [
    "outlier_candidate",
  ]);
});

test("rejects an invalid sanitization status before mapping", () => {
  const draft = createMinimalSanitizedDraft();
  draft.sanitization.status =
    "raw" as SanitizedCasePackageAdapterDraftV01["sanitization"]["status"];

  assertAdapterError(
    () => buildCasePackageV01FromSanitizedAdapterDraft(draft),
    "$.sanitization.status",
    "Sanitization status must be a CasePackageSanitizationStatusV01 value.",
  );
});

test("rejects non-object draft input before mapping", () => {
  assertAdapterError(
    () =>
      buildCasePackageV01FromSanitizedAdapterDraft(
        null as unknown as SanitizedCasePackageAdapterDraftV01,
      ),
    "$",
    "Sanitized adapter draft input must be a non-array object.",
  );
});

test("rejects missing required top-level draft fields before mapping", () => {
  const draft =
    createMinimalSanitizedDraft() as Partial<SanitizedCasePackageAdapterDraftV01>;
  delete draft.case;
  delete draft.cluster;
  delete draft.evidence_summaries;

  assertAdapterIssues(
    () =>
      buildCasePackageV01FromSanitizedAdapterDraft(
        draft as SanitizedCasePackageAdapterDraftV01,
      ),
    [
      { path: "$.case", message: "$.case is required." },
      { path: "$.cluster", message: "$.cluster is required." },
      {
        path: "$.evidence_summaries",
        message: "$.evidence_summaries is required.",
      },
    ],
  );
});

test("rejects malformed cluster identity before mapping", () => {
  const draft = createMinimalSanitizedDraft();
  draft.cluster.cluster_id = " ";
  draft.cluster.cluster_size = Number.NaN;
  delete (
    draft.cluster as Partial<
      SanitizedCasePackageAdapterDraftV01["cluster"]
    >
  ).cluster_method;

  assertAdapterIssues(
    () => buildCasePackageV01FromSanitizedAdapterDraft(draft),
    [
      {
        path: "$.cluster.cluster_id",
        message: "$.cluster.cluster_id must be a non-empty string.",
      },
      {
        path: "$.cluster.cluster_size",
        message: "$.cluster.cluster_size must be a finite number.",
      },
      {
        path: "$.cluster.cluster_method",
        message: "$.cluster.cluster_method is required.",
      },
    ],
  );
});

test("rejects malformed AI label and claim fields before mapping", () => {
  const draft = createMinimalSanitizedDraft();
  draft.candidate_labels[0].label_id = " ";
  draft.candidate_labels[0].label = " ";
  draft.claims[0].claim_id = " ";
  draft.claims[0].text = " ";

  assertAdapterIssues(
    () => buildCasePackageV01FromSanitizedAdapterDraft(draft),
    [
      {
        path: "$.candidate_labels[0].label_id",
        message: "$.candidate_labels[0].label_id must be a non-empty string.",
      },
      {
        path: "$.candidate_labels[0].label",
        message: "$.candidate_labels[0].label must be a non-empty string.",
      },
      {
        path: "$.claims[0].claim_id",
        message: "$.claims[0].claim_id must be a non-empty string.",
      },
      {
        path: "$.claims[0].text",
        message: "$.claims[0].text must be a non-empty string.",
      },
    ],
  );
});

test("rejects evidence summaries with missing IDs and blank text content before mapping", () => {
  const draft = createMinimalSanitizedDraft();
  delete (
    draft.evidence_summaries[0] as Partial<
      SanitizedCasePackageAdapterDraftV01["evidence_summaries"][number]
    >
  ).evidence_id;
  draft.evidence_summaries[0].content = {
    content_type: "text",
    text: " ",
  };

  assertAdapterIssues(
    () => buildCasePackageV01FromSanitizedAdapterDraft(draft),
    [
      {
        path: "$.evidence_summaries[0].evidence_id",
        message: "$.evidence_summaries[0].evidence_id is required.",
      },
      {
        path: "$.evidence_summaries[0].content.text",
        message:
          "$.evidence_summaries[0].content.text must be a non-empty string.",
      },
    ],
  );
});

test("rejects claim-evidence links that point to unknown draft IDs before mapping", () => {
  const draft = createMinimalSanitizedDraft();
  const claimId = draft.claims[0].claim_id;
  const evidenceId = draft.evidence_summaries[0].evidence_id;
  draft.claim_evidence_links = [
    draft.claim_evidence_links[0],
    {
      claim_id: "claim-placeholder-missing",
      evidence_id: evidenceId,
      relationship: "supports",
    },
    {
      claim_id: claimId,
      evidence_id: "evidence-placeholder-missing",
      relationship: "supports",
    },
  ];

  assertAdapterIssues(
    () => buildCasePackageV01FromSanitizedAdapterDraft(draft),
    [
      {
        path: "$.claim_evidence_links[1].claim_id",
        message:
          'Claim-evidence link references missing claim ID: "claim-placeholder-missing".',
      },
      {
        path: "$.claim_evidence_links[2].evidence_id",
        message:
          'Claim-evidence link references missing evidence ID: "evidence-placeholder-missing".',
      },
    ],
  );
});

test("rejects malformed outlier, impostor, and neighbor references before mapping", () => {
  const draft = createMinimalSanitizedDraft();
  draft.outlier_impostor_candidates = [
    {
      candidate_id: "candidate-placeholder-001",
      session_id: "session-placeholder-missing",
      evidence_id: "evidence-placeholder-missing",
      reason: "Placeholder candidate reference.",
      expected_review_use: "outlier_check",
    },
  ];
  draft.neighbor_clusters = [
    {
      neighbor_cluster_id: draft.cluster.cluster_id,
      reason_this_neighbor_matters: "Placeholder neighbor reference.",
    },
  ];

  assertAdapterIssues(
    () => buildCasePackageV01FromSanitizedAdapterDraft(draft),
    [
      {
        path: "$.outlier_impostor_candidates[0].session_id",
        message:
          'Outlier/impostor candidate references missing representative session ID: "session-placeholder-missing".',
      },
      {
        path: "$.outlier_impostor_candidates[0].evidence_id",
        message:
          'Outlier/impostor candidate references missing evidence ID: "evidence-placeholder-missing".',
      },
      {
        path: "$.neighbor_clusters[0].neighbor_cluster_id",
        message:
          "Neighbor cluster must not reference the package's primary cluster ID.",
      },
    ],
  );
});
