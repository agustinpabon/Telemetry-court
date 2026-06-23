import assert from "node:assert/strict";
import test from "node:test";

import {
  buildClusterRefinementV01,
  getClusterRefinementExportAvailabilityV01,
  serializeClusterRefinementJsonV01,
  validateClusterRefinementV01,
} from "@/lib/clusterRefinementV01";
import {
  serializeEvaluationReportCsvV01,
  serializeEvaluationReportJsonV01,
} from "@/lib/evaluationReportExportV01";
import { validateCasePackageV01 } from "@/lib/casePackageValidation";
import { importLocalEvaluationResultsBundleV01 } from "@/lib/localEvaluationResultsV01";
import {
  buildResultsGalaxyMapV01,
  importResultsMapCasePackageV01Json,
} from "@/lib/resultsGalaxyMapV01";
import {
  createReviewResultBundleV01,
  serializeReviewResultBundleV01,
} from "@/lib/reviewResultBundleV01";
import type { ReviewResultV01 } from "@/lib/reviewResultV01";
import {
  CASE_PACKAGE_V01_EVIDENCE_RATINGS,
  CASE_PACKAGE_V01_RECOMMENDED_ACTIONS,
  CASE_PACKAGE_V01_REQUIRED_REVIEWER_ACTIONS,
  CASE_PACKAGE_V01_REQUIRED_REVIEW_STAGES,
  CASE_PACKAGE_V01_SCHEMA_VERSION,
  CASE_PACKAGE_V01_VERDICTS,
  type CasePackageMetricV01,
  type CasePackageV01,
} from "@/lib/types";

const PACKAGE_ID = "pkg-milestone3-smoke-001";
const CASE_ID = "case-milestone3-smoke-001";
const CLUSTER_ID = "cluster-milestone3-smoke-001";
const PIPELINE_ID = "pipeline-milestone3-smoke";
const PIPELINE_RUN_ID = "run-milestone3-smoke-001";
const PACKAGE_REVISION = "r1";
const LABEL_ID = "label-milestone3-service-access";
const FEATURE_EVIDENCE_ID = "evidence-milestone3-feature-stack";
const BOUNDARY_EVIDENCE_ID = "evidence-milestone3-boundary-session";
const REPRESENTATIVE_SESSION_ID = "session-milestone3-representative";
const IMPOSTOR_SESSION_ID = "session-milestone3-impostor";
const BORDERLINE_SESSION_ID = "session-milestone3-borderline";
const PACKAGE_CREATED_AT = "2026-06-23T13:00:00.000Z";
const PIPELINE_GENERATED_AT = "2026-06-23T12:58:00.000Z";
const BUNDLE_CREATED_AT = "2026-06-23T13:10:00.000Z";
const REFINEMENT_CREATED_AT = "2026-06-23T13:12:00.000Z";

test("Milestone 3 smoke connects validated import, aggregation, results map, and refinement export", () => {
  const casePackage = createSyntheticCasePackage();
  const serializedCasePackage = `${JSON.stringify(casePackage, null, 2)}\n`;
  const packageValidation = validateCasePackageV01(
    JSON.parse(serializedCasePackage),
  );

  assert.equal(packageValidation.ok, true);
  if (!packageValidation.ok) {
    return;
  }
  assert.equal(packageValidation.package.package_id, PACKAGE_ID);
  assert.equal(
    packageValidation.package.provenance.provenance_id,
    "prov-milestone3-smoke",
  );
  assert.equal(packageValidation.package.sanitization.status, "synthetic");
  assert.equal(
    packageValidation.package.sanitization.raw_drilldown_allowed,
    false,
  );
  assert.deepEqual(packageValidation.package.cluster.embedding_map?.coordinates, {
    x: 0.34,
    y: 0.62,
  });

  const mapPackageImport =
    importResultsMapCasePackageV01Json(serializedCasePackage);
  assert.equal(mapPackageImport.ok, true);
  if (!mapPackageImport.ok) {
    return;
  }

  const reviews = [
    createReviewResult({
      reviewerId: "reviewer-milestone3-a",
      createdAt: "2026-06-23T13:01:00.000Z",
      selectedSessionId: IMPOSTOR_SESSION_ID,
      finalVerdict: "cluster_impure",
      recommendedAction: "split_cluster",
      failureModes: ["cluster_seems_mixed"],
    }),
    createReviewResult({
      reviewerId: "reviewer-milestone3-b",
      createdAt: "2026-06-23T13:02:00.000Z",
      selectedSessionId: BORDERLINE_SESSION_ID,
      finalVerdict: "supported",
      recommendedAction: "accept_label",
      failureModes: [],
    }),
    createReviewResult({
      reviewerId: "reviewer-milestone3-c",
      createdAt: "2026-06-23T13:03:00.000Z",
      selectedSessionId: IMPOSTOR_SESSION_ID,
      finalVerdict: "cluster_impure",
      recommendedAction: "split_cluster",
      failureModes: ["cluster_seems_mixed"],
    }),
  ];

  for (const review of reviews) {
    assert.equal(review.case_package.package_id, PACKAGE_ID);
    assert.equal(review.case_package.case_id, CASE_ID);
    assert.equal(review.case_package.cluster_id, CLUSTER_ID);
    assert.equal(review.case_package.pipeline.run_id, PIPELINE_RUN_ID);
    assert.deepEqual(
      review.decisions.evidence_ratings.map((rating) => rating.evidence_id),
      [FEATURE_EVIDENCE_ID, BOUNDARY_EVIDENCE_ID],
    );
  }

  const bundle = createReviewResultBundleV01({
    reviewResults: reviews,
    bundleId: "bundle-milestone3-import-to-refinement",
    createdAt: BUNDLE_CREATED_AT,
  });
  const storage = createMemoryStorage();
  const importResult = importLocalEvaluationResultsBundleV01(
    storage,
    serializeReviewResultBundleV01(bundle),
  );

  assert.equal(importResult.ok, true);
  if (!importResult.ok) {
    return;
  }
  assert.equal(importResult.importedReviewResultCount, 3);
  assert.equal(importResult.snapshot.totalReviewResultCount, 3);
  assert.equal(importResult.snapshot.packageGroups.length, 1);

  const packageGroup = importResult.snapshot.packageGroups[0];
  assert.ok(packageGroup);
  assert.equal(packageGroup.casePackageId, PACKAGE_ID);
  assert.equal(packageGroup.reviewResultCount, 3);
  assert.equal(packageGroup.report.schema_version, "evaluation_report.v0.1");
  assert.equal(
    packageGroup.report.calculation_version,
    "review_result_aggregation.v0.3",
  );
  assert.equal(packageGroup.report.reviewer_count, 3);
  assert.equal(packageGroup.report.verdict_distribution.cluster_impure, 2);
  assert.equal(packageGroup.report.verdict_distribution.supported, 1);
  assert.deepEqual(packageGroup.report.case_package, reviews[0]?.case_package);
  assert.deepEqual(
    packageGroup.sourceReviewResults.map((review) => review.review_id),
    reviews.map((review) => review.review_id).sort(),
  );

  const reportJson = serializeEvaluationReportJsonV01(packageGroup.report);
  const reportCsv = serializeEvaluationReportCsvV01(packageGroup.report);
  assert.deepEqual(
    JSON.parse(reportJson).source_review_ids,
    packageGroup.report.source_review_ids,
  );
  assert.match(reportCsv, /reviewer_count/);
  assert.match(reportCsv, /cluster_impure/);

  const resultsMap = buildResultsGalaxyMapV01({
    packageGroups: importResult.snapshot.packageGroups,
    casePackages: [mapPackageImport.package],
  });

  assert.equal(resultsMap.unavailable.length, 0);
  assert.equal(resultsMap.nodes.length, 1);
  const node = resultsMap.nodes[0];
  assert.ok(node);
  assert.equal(node.casePackage.package_id, PACKAGE_ID);
  assert.deepEqual(node.caseFile.mapPosition, { x: 34, y: 62 });
  assert.equal(node.status.verdict, "cluster_impure");
  assert.equal(node.verdictDisputed, true);
  assert.equal(node.caseFile.casePackageReference?.package_id, PACKAGE_ID);

  const refinementAvailability = getClusterRefinementExportAvailabilityV01(
    packageGroup.report,
    packageGroup.sourceReviewResults,
  );
  assert.deepEqual(refinementAvailability, { available: true });

  const refinement = buildClusterRefinementV01({
    report: packageGroup.report,
    sourceReviewResults: packageGroup.sourceReviewResults,
    generatedAt: REFINEMENT_CREATED_AT,
    refinementId: "refinement-milestone3-smoke",
  });
  const refinementValidation = validateClusterRefinementV01(refinement);

  assert.equal(refinementValidation.ok, true);
  if (!refinementValidation.ok) {
    return;
  }
  assert.equal(refinement.schema_version, "cluster_refinement.v0.1");
  assert.deepEqual(refinement.prune_session_ids, [IMPOSTOR_SESSION_ID]);
  assert.equal(
    refinement.session_exclusion_recommendations.find(
      (recommendation) => recommendation.session_id === IMPOSTOR_SESSION_ID,
    )?.qualifying_review_count,
    2,
  );
  assert.equal(
    refinement.session_exclusion_recommendations.find(
      (recommendation) => recommendation.session_id === BORDERLINE_SESSION_ID,
    )?.status,
    "not_recommended",
  );
  assert.equal(
    refinement.session_exclusion_recommendations.find(
      (recommendation) => recommendation.session_id === BORDERLINE_SESSION_ID,
    )?.qualifying_review_count,
    0,
  );
  assert.deepEqual(refinement.split_recommendations[0]?.signals, {
    final_verdicts: ["cluster_impure"],
    recommended_actions: ["split_cluster"],
    failure_modes: ["cluster_seems_mixed"],
  });
  assert.deepEqual(
    JSON.parse(serializeClusterRefinementJsonV01(refinement)),
    refinement,
  );
});

test("Milestone 3 smoke keeps incompatible packages and ReviewResults unavailable", () => {
  const casePackage = createSyntheticCasePackage();
  const compatibleReviews = [
    createReviewResult({
      reviewerId: "reviewer-milestone3-a",
      createdAt: "2026-06-23T13:01:00.000Z",
      selectedSessionId: IMPOSTOR_SESSION_ID,
      finalVerdict: "cluster_impure",
      recommendedAction: "split_cluster",
      failureModes: ["cluster_seems_mixed"],
    }),
  ];
  const storage = createMemoryStorage();
  const acceptedImport = importLocalEvaluationResultsBundleV01(
    storage,
    serializeReviewResultBundleV01(
      createReviewResultBundleV01({
        reviewResults: compatibleReviews,
        bundleId: "bundle-milestone3-compatible",
        createdAt: BUNDLE_CREATED_AT,
      }),
    ),
  );

  assert.equal(acceptedImport.ok, true);
  if (!acceptedImport.ok) {
    return;
  }

  const missingPackageMap = buildResultsGalaxyMapV01({
    packageGroups: acceptedImport.snapshot.packageGroups,
    casePackages: [],
  });
  assert.deepEqual(missingPackageMap.nodes, []);
  assert.equal(missingPackageMap.unavailable[0]?.reason, "missing_case_package");

  const incompatiblePackageMap = buildResultsGalaxyMapV01({
    packageGroups: acceptedImport.snapshot.packageGroups,
    casePackages: [
      createSyntheticCasePackage({ pipelineRunId: "run-milestone3-smoke-other" }),
    ],
  });
  assert.deepEqual(incompatiblePackageMap.nodes, []);
  assert.equal(
    incompatiblePackageMap.unavailable[0]?.reason,
    "incompatible_case_package_reference",
  );

  const incompatibleReview = createReviewResult({
    reviewerId: "reviewer-milestone3-incompatible",
    createdAt: "2026-06-23T13:04:00.000Z",
    selectedSessionId: IMPOSTOR_SESSION_ID,
    finalVerdict: "cluster_impure",
    recommendedAction: "split_cluster",
    failureModes: ["cluster_seems_mixed"],
    pipelineRunId: "run-milestone3-smoke-other",
  });
  const rejectedImport = importLocalEvaluationResultsBundleV01(
    storage,
    serializeReviewResultBundleV01(
      createReviewResultBundleV01({
        reviewResults: [incompatibleReview],
        bundleId: "bundle-milestone3-incompatible",
        createdAt: "2026-06-23T13:11:00.000Z",
      }),
    ),
  );

  assert.equal(rejectedImport.ok, false);
  if (rejectedImport.ok) {
    return;
  }
  assert.match(rejectedImport.message, /incompatible CasePackage reference/);
  assert.match(rejectedImport.message, /pipeline field "run_id"/);
  assert.equal(rejectedImport.snapshot.totalReviewResultCount, 1);
  assert.equal(rejectedImport.snapshot.packageGroups[0]?.report.reviewer_count, 1);
  assert.equal(
    getClusterRefinementExportAvailabilityV01(
      acceptedImport.snapshot.packageGroups[0]?.report ?? packageGroupReportError(),
    ).available,
    false,
  );
  assert.equal(casePackage.package_id, PACKAGE_ID);
});

function createSyntheticCasePackage({
  pipelineRunId = PIPELINE_RUN_ID,
  coordinates = { x: 0.34, y: 0.62 },
}: {
  pipelineRunId?: string;
  coordinates?: { x: number; y: number };
} = {}): CasePackageV01 {
  return {
    schema_version: CASE_PACKAGE_V01_SCHEMA_VERSION,
    package_id: PACKAGE_ID,
    created_at: PACKAGE_CREATED_AT,
    package_revision: PACKAGE_REVISION,
    case: {
      case_id: CASE_ID,
      title: "Milestone 3 synthetic import-to-refinement smoke",
      summary:
        "Inline synthetic package for deterministic local import-to-refinement coverage.",
      reviewable_status: "synthetic_demo",
      review_intent: "assess_cluster_purity",
      limitations: ["Inline test object only; no raw telemetry is present."],
    },
    dataset: {
      dataset_id: "dataset-milestone3-smoke",
      dataset_name: "Milestone 3 Inline Synthetic Dataset",
      dataset_type: "synthetic",
      data_classification: "synthetic",
      source_environment: "local-test",
      approved_use:
        "Deterministic helper-level smoke coverage with inline synthetic objects.",
      limitations: ["Not pilot data.", "Not a public fixture."],
    },
    cluster: {
      cluster_id: CLUSTER_ID,
      cluster_name: "Synthetic service access cluster",
      upstream_cluster_label: "Service access maintenance",
      cluster_size: 12,
      embedding_map: {
        map_id: "map-milestone3-smoke",
        map_tool: "synthetic-normalized-projection",
        coordinate_space: "normalized_0_1",
        coordinates,
      },
      cluster_method: {
        method: "synthetic-precomputed-cluster",
      },
    },
    pipeline: {
      pipeline_id: PIPELINE_ID,
      run_id: pipelineRunId,
      upstream_tool: "synthetic-smoke-package-author",
      pipeline_version: "0.1.0",
      embedding_model: "synthetic-embedding-v1",
      clustering_method: "synthetic-precomputed-cluster",
      dimensionality_reduction_method: "synthetic-normalized-2d-projection",
      naming_model: "synthetic-labeler-v1",
      prompt: {
        prompt_id: "prompt-milestone3-smoke",
        prompt_version: "1",
        prompt_digest: "sha256:milestone3smoke",
      },
      generated_at: PIPELINE_GENERATED_AT,
    },
    candidate_labels: [
      {
        label_id: LABEL_ID,
        label: "Service access maintenance",
        source: "ai_generated",
        confidence: metric(0.56, "contextual"),
        rank: 1,
        linked_claim_ids: [
          "claim-milestone3-service-access",
          "claim-milestone3-cluster-quality",
        ],
        rationale:
          "Synthetic label used only to connect the local smoke-test loop.",
      },
    ],
    claims: [
      {
        claim_id: "claim-milestone3-service-access",
        text:
          "The cluster mostly contains service account access maintenance behavior.",
        claim_type: "behavioral_summary",
        linked_evidence_ids: [FEATURE_EVIDENCE_ID],
        linked_label_ids: [LABEL_ID],
        evidence_status: "linked",
      },
      {
        claim_id: "claim-milestone3-cluster-quality",
        text:
          "One boundary session may weaken cluster purity and should be reviewed.",
        claim_type: "cluster_quality",
        linked_evidence_ids: [BOUNDARY_EVIDENCE_ID],
        linked_label_ids: [LABEL_ID],
        evidence_status: "linked",
      },
    ],
    evidence_items: [
      {
        evidence_id: FEATURE_EVIDENCE_ID,
        title: "Synthetic service access feature stack",
        summary:
          "Derived summaries show repeat service access setup and policy checks.",
        evidence_type: "salient_feature",
        content: {
          content_type: "text",
          text: "Synthetic derived feature summary only.",
        },
        source_reference: {
          source_id: "source-milestone3-features",
          source_type: "derived_feature_summary",
          safe_reference: safeReference("ref-milestone3-features"),
        },
        provenance_reference: "prov-milestone3-smoke",
        sanitization_status: "synthetic",
        linked_session_ids: [REPRESENTATIVE_SESSION_ID],
        linked_claim_ids: ["claim-milestone3-service-access"],
        salience: metric(0.72),
      },
      {
        evidence_id: BOUNDARY_EVIDENCE_ID,
        title: "Synthetic boundary session",
        summary:
          "A boundary session shares access features but has a different operational pattern.",
        evidence_type: "outlier_impostor_evidence",
        content: {
          content_type: "structured_summary",
          fields: {
            posture: "synthetic_boundary",
            raw_payload_included: false,
          },
        },
        source_reference: {
          source_id: "source-milestone3-boundary",
          source_type: "derived_session_summary",
          safe_reference: safeReference("ref-milestone3-boundary"),
        },
        provenance_reference: "prov-milestone3-smoke",
        sanitization_status: "synthetic",
        linked_session_ids: [IMPOSTOR_SESSION_ID, BORDERLINE_SESSION_ID],
        linked_claim_ids: ["claim-milestone3-cluster-quality"],
        salience: metric(0.81, "contextual"),
      },
    ],
    evidence_to_claim_mappings: [
      {
        claim_id: "claim-milestone3-service-access",
        evidence_id: FEATURE_EVIDENCE_ID,
        relationship: "supports",
        expected_support: "supports",
        rationale: "Synthetic support mapping for service-access behavior.",
      },
      {
        claim_id: "claim-milestone3-cluster-quality",
        evidence_id: BOUNDARY_EVIDENCE_ID,
        relationship: "weak_support",
        expected_support: "weak_support",
        rationale: "Synthetic boundary evidence for cluster-quality review.",
      },
    ],
    representative_sessions: [
      {
        session_id: REPRESENTATIVE_SESSION_ID,
        title: "Representative service access setup",
        summary: "Synthetic representative session with matching features.",
        feature_highlights: ["service_access", "policy_check"],
        safe_reference: safeReference("ref-milestone3-representative"),
        cluster_membership: {
          cluster_id: CLUSTER_ID,
          membership_score: metric(0.88),
          distance_to_centroid: metric(0.14, "lower_is_better"),
        },
        flags: ["representative"],
        linked_evidence_ids: [FEATURE_EVIDENCE_ID],
      },
      {
        session_id: IMPOSTOR_SESSION_ID,
        title: "Synthetic impostor-like access session",
        summary:
          "Synthetic session selected by qualifying reviewers as weakening cluster purity.",
        feature_highlights: ["service_access", "unexpected_boundary"],
        safe_reference: safeReference("ref-milestone3-impostor"),
        cluster_membership: {
          cluster_id: CLUSTER_ID,
          membership_score: metric(0.41, "contextual"),
          distance_to_centroid: metric(0.76, "contextual"),
        },
        flags: ["impostor_candidate"],
        linked_evidence_ids: [BOUNDARY_EVIDENCE_ID],
      },
      {
        session_id: BORDERLINE_SESSION_ID,
        title: "Synthetic borderline access session",
        summary:
          "Synthetic session selected without a cluster-quality signal by one reviewer.",
        feature_highlights: ["service_access", "borderline"],
        safe_reference: safeReference("ref-milestone3-borderline"),
        cluster_membership: {
          cluster_id: CLUSTER_ID,
          membership_score: metric(0.52, "contextual"),
          distance_to_centroid: metric(0.48, "contextual"),
        },
        flags: ["borderline"],
        linked_evidence_ids: [BOUNDARY_EVIDENCE_ID],
      },
    ],
    outlier_impostor_candidates: [
      {
        candidate_id: "candidate-milestone3-impostor",
        session_id: IMPOSTOR_SESSION_ID,
        reason: "Synthetic boundary pattern may be an impostor.",
        score: metric(0.74, "contextual"),
        expected_review_use: "cluster_purity_check",
      },
      {
        candidate_id: "candidate-milestone3-borderline",
        session_id: BORDERLINE_SESSION_ID,
        reason: "Synthetic borderline pattern is reviewable but not decisive.",
        score: metric(0.42, "contextual"),
        expected_review_use: "outlier_check",
      },
    ],
    neighbor_clusters: [
      {
        neighbor_cluster_id: "cluster-milestone3-neighbor-001",
        label: "Administrative access setup",
        distance: metric(0.29, "lower_is_better"),
        reason_this_neighbor_matters:
          "Synthetic neighbor used to preserve comparison context.",
        confusion_risk: metric(0.34, "contextual"),
      },
    ],
    metrics: {
      cluster_coherence: metric(0.62),
      evidence_coverage: metric(0.71),
      uncertainty: metric(0.39, "lower_is_better"),
    },
    provenance: {
      provenance_id: "prov-milestone3-smoke",
      source_system: "telemetry-court-inline-test",
      source_artifact: "lib/milestone3RefinementLoop.test.ts",
      generating_tool: "inline synthetic test object",
      generated_at: PIPELINE_GENERATED_AT,
      references: [safeReference("ref-milestone3-source")],
    },
    sanitization: {
      status: "synthetic",
      method:
        "Inline synthetic summaries with no raw identifiers or restricted payloads.",
      redaction_notes: ["No real accounts, principals, events, or logs exist."],
      allowed_display_level: "summary_only",
      raw_drilldown_allowed: false,
      safe_reference_type: "synthetic_fixture_path",
      notes: "Synthetic smoke coverage only.",
    },
    review_configuration: {
      blind_review_enabled: true,
      initially_hidden_label_ids: [LABEL_ID],
      required_review_stages: [...CASE_PACKAGE_V01_REQUIRED_REVIEW_STAGES],
      allowed_evidence_ratings: [...CASE_PACKAGE_V01_EVIDENCE_RATINGS],
      allowed_verdicts: [...CASE_PACKAGE_V01_VERDICTS],
      allowed_recommended_actions: [...CASE_PACKAGE_V01_RECOMMENDED_ACTIONS],
      required_reviewer_actions: [...CASE_PACKAGE_V01_REQUIRED_REVIEWER_ACTIONS],
    },
  };
}

function createReviewResult({
  reviewerId,
  createdAt,
  selectedSessionId,
  finalVerdict,
  recommendedAction,
  failureModes,
  pipelineRunId = PIPELINE_RUN_ID,
}: {
  reviewerId: string;
  createdAt: string;
  selectedSessionId: string;
  finalVerdict: ReviewResultV01["decisions"]["final_verdict"];
  recommendedAction: ReviewResultV01["decisions"]["recommended_action"];
  failureModes: ReviewResultV01["decisions"]["failure_modes"];
  pipelineRunId?: string;
}): ReviewResultV01 {
  const reviewSessionId = `session-${reviewerId}`;
  const casePackage = createSyntheticCasePackage({ pipelineRunId });

  return {
    schema_version: "review_result.v0.1",
    review_id: ["review", PACKAGE_ID, reviewerId, reviewSessionId, createdAt].join(
      ":",
    ),
    created_at: createdAt,
    case_package: toReviewCasePackageReference(casePackage),
    reviewer: {
      reviewer_id: reviewerId,
      review_session_id: reviewSessionId,
      context: "local_review",
    },
    protocol: {
      protocol_version: "telemetry_court_review.v0.1",
      blind_review_enabled: true,
      ai_label_revealed: true,
    },
    decisions: {
      blind_interpretation: {
        option_id: "blind-milestone3-service-access",
        label: "Service access maintenance with possible boundary sessions",
        agrees_with_ai: finalVerdict === "supported",
      },
      label_comparison: {
        selected_label_id: LABEL_ID,
        reason_codes:
          finalVerdict === "supported"
            ? ["better_supported"]
            : ["cluster_seems_mixed"],
      },
      evidence_ratings: [
        { evidence_id: FEATURE_EVIDENCE_ID, rating: "supports" },
        {
          evidence_id: BOUNDARY_EVIDENCE_ID,
          rating: finalVerdict === "supported" ? "weak_support" : "contradicts",
        },
      ],
      outlier_impostor: {
        selected_session_id: selectedSessionId,
      },
      failure_modes: failureModes,
      final_verdict: finalVerdict,
      recommended_action: recommendedAction,
    },
  };
}

function toReviewCasePackageReference(
  casePackage: CasePackageV01,
): ReviewResultV01["case_package"] {
  return {
    schema_version: casePackage.schema_version,
    package_id: casePackage.package_id,
    package_revision: casePackage.package_revision,
    case_id: casePackage.case.case_id,
    cluster_id: casePackage.cluster.cluster_id,
    pipeline: {
      pipeline_id: casePackage.pipeline.pipeline_id,
      run_id: casePackage.pipeline.run_id,
      upstream_tool: casePackage.pipeline.upstream_tool,
      pipeline_version: casePackage.pipeline.pipeline_version,
      embedding_model: casePackage.pipeline.embedding_model,
      clustering_method: casePackage.pipeline.clustering_method,
      dimensionality_reduction_method:
        casePackage.pipeline.dimensionality_reduction_method,
      naming_model: casePackage.pipeline.naming_model,
      prompt_id: casePackage.pipeline.prompt?.prompt_id,
      prompt_version: casePackage.pipeline.prompt?.prompt_version,
      prompt_digest: casePackage.pipeline.prompt?.prompt_digest,
      generated_at: casePackage.pipeline.generated_at,
    },
  };
}

function metric(
  value: number,
  interpretation: Extract<
    CasePackageMetricV01,
    { status: "available" }
  >["interpretation"] = "higher_is_better",
): CasePackageMetricV01 {
  return {
    status: "available",
    value,
    min: 0,
    max: 1,
    interpretation,
    method: "inline synthetic smoke value",
  };
}

function safeReference(referenceId: string) {
  return {
    reference_id: referenceId,
    reference_type: "synthetic_fixture_path" as const,
    uri: "lib/milestone3RefinementLoop.test.ts",
  };
}

function packageGroupReportError(): never {
  throw new Error("Expected a local EvaluationReport group.");
}

function createMemoryStorage() {
  const values = new Map<string, string>();

  return {
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
  };
}
