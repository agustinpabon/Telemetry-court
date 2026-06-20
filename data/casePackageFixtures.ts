import { sampleCaseSeedData } from "@/data/sampleCaseSeedData";
import { validateCasePackageV01 } from "@/lib/casePackageValidation";
import {
  CASE_PACKAGE_V01_EVIDENCE_RATINGS,
  CASE_PACKAGE_V01_RECOMMENDED_ACTIONS,
  CASE_PACKAGE_V01_REQUIRED_REVIEWER_ACTIONS,
  CASE_PACKAGE_V01_REQUIRED_REVIEW_STAGES,
  CASE_PACKAGE_V01_SCHEMA_VERSION,
  CASE_PACKAGE_V01_VERDICTS,
  type CandidateLabelSource,
  type CaseFile,
  type CasePackageCandidateLabelSourceV01,
  type CasePackageClaimTypeV01,
  type CasePackageDatasetTypeV01,
  type CasePackageEvidenceRelationshipV01,
  type CasePackageEvidenceTypeV01,
  type CasePackageExpectedReviewUseV01,
  type CasePackageMetricV01,
  type CasePackageV01,
  type CasePackageSessionFlagV01,
  type EvidencePolarity,
  type EvidenceSourceType,
  type ReviewStatus,
} from "@/lib/types";

const FIXTURE_CREATED_AT = "2026-06-20T12:00:00.000Z";
const FIXTURE_PACKAGE_REVISION = "r1";

export const casePackageFixtures = validateCasePackageFixtures(
  sampleCaseSeedData.map(createCasePackageV01FromCaseFile),
);

export function createCasePackageV01FromCaseFile(
  caseFile: CaseFile,
): CasePackageV01 {
  const runId = `run-${caseFile.id}-synthetic-fixture`;
  const provenanceId = `prov-${caseFile.id}`;
  const allClaimIds = caseFile.claims.map((claim) => claim.id);
  const allLabelIds = caseFile.candidateLabels.map((label) => label.id);
  const aiLabelIds = caseFile.candidateLabels
    .filter((label) => label.source === "baseline_ai")
    .map((label) => label.id);
  const timeRange = readTimeRange(caseFile);
  const outlierCandidates = caseFile.representativeSessions.filter(
    (session) =>
      session.id === caseFile.seededImpostorSessionId ||
      Boolean(session.outlierReason) ||
      session.outlierScore >= 0.65,
  );

  return {
    schema_version: CASE_PACKAGE_V01_SCHEMA_VERSION,
    package_id: packageIdFromCaseId(caseFile.id),
    created_at: FIXTURE_CREATED_AT,
    package_revision: FIXTURE_PACKAGE_REVISION,
    case: {
      case_id: caseFile.id,
      title: caseFile.cluster.name,
      summary: caseFile.cluster.description ?? caseFile.topicLabel.explanation,
      description: caseFile.topicLabel.explanation,
      reviewable_status: "synthetic_demo",
      review_intent: readReviewIntent(caseFile),
      limitations: [
        "Synthetic fixture; not evidence of real Toponymy, ACME4, or live ingestion support.",
        "Compatibility metadata preserves the current static UI review flow.",
      ],
    },
    dataset: {
      dataset_id: datasetIdFromName(caseFile.dataset),
      dataset_name: caseFile.dataset,
      dataset_type: readDatasetType(caseFile),
      data_classification: "synthetic",
      source_environment: "local-fixture",
      approved_use:
        "Contract and review-flow testing with safe synthetic package data.",
      approval_notes:
        "Generated from existing Telemetry Court synthetic sample cases.",
      limitations: [
        "No raw restricted telemetry is included.",
        "Safe references point to synthetic fixture paths only.",
      ],
    },
    cluster: {
      cluster_id: caseFile.cluster.id,
      cluster_name: caseFile.cluster.name,
      upstream_cluster_label: caseFile.topicLabel.name,
      cluster_size: caseFile.cluster.size ?? caseFile.representativeSessions.length,
      embedding_map: {
        map_id: `map-${caseFile.cluster.id}`,
        map_tool: "synthetic-static-review-map",
        coordinate_space: "synthetic-2d",
        coordinates: {
          x: caseFile.mapPosition.x / 100,
          y: caseFile.mapPosition.y / 100,
        },
      },
      time_range: timeRange,
      cluster_method: {
        method: "synthetic-static-clustering",
        method_version: "0.1",
        distance_metric: "synthetic-feature-distance",
        parameters: {
          review_status: caseFile.reviewStatus,
          landscape_status: caseFile.landscapeStatus,
        },
      },
    },
    pipeline: {
      pipeline_id: "pipeline-synthetic-sample-fixtures",
      run_id: runId,
      upstream_tool: "synthetic-demo-fixture",
      pipeline_version: "0.1.0",
      embedding_model: "synthetic-embedding-fixture",
      clustering_method: "synthetic-static-clustering",
      dimensionality_reduction_method: "synthetic-static-review-map",
      naming_model: caseFile.topicLabel.generatedBy,
      prompt: {
        prompt_id: "prompt-synthetic-baseline-labeler-v0.7",
        prompt_summary:
          "Generate a concise cluster label from safe synthetic summaries.",
      },
      generated_at: caseFile.topicLabel.generatedAt,
      config_summary:
        "Package-shaped fixture generated from current synthetic review cases.",
    },
    candidate_labels: caseFile.candidateLabels.map((label, index) => ({
      label_id: label.id,
      label: label.label,
      source: readCandidateLabelSource(label.source),
      model_reference: readModelReference(label.source, caseFile.topicLabel.generatedBy),
      prompt_reference: "prompt-synthetic-baseline-labeler-v0.7",
      run_id: runId,
      confidence: availableMetric(label.supportEstimate, "higher_is_better"),
      rank: index + 1,
      linked_claim_ids: allClaimIds,
      rationale: label.rationale,
    })),
    claims: caseFile.claims.map((claim) => {
      const linkedEvidenceIds = caseFile.evidenceRelations
        .filter((relation) => relation.claimId === claim.id)
        .map((relation) => relation.evidenceId);

      return {
        claim_id: claim.id,
        text: claim.text,
        claim_type: readClaimType(claim.text),
        linked_evidence_ids: linkedEvidenceIds,
        linked_label_ids: allLabelIds,
        confidence: availableMetric(claim.supportScore, "higher_is_better"),
        caveats:
          claim.status === "unsupported" || claim.status === "contradicted"
            ? [claim.rationale]
            : undefined,
        assumptions:
          claim.status === "weakly_supported" ? [claim.rationale] : undefined,
        evidence_status:
          linkedEvidenceIds.length > 0 ? "linked" : "missing_evidence_declared",
      };
    }),
    evidence_items: caseFile.evidenceItems.map((evidence) => ({
      evidence_id: evidence.id,
      title: evidence.title,
      summary: evidence.summary,
      evidence_type: readEvidenceType(evidence.sourceType, evidence.title),
      content: {
        content_type: "text",
        text: evidence.summary,
      },
      source_reference: {
        source_id: evidence.rawReference ?? evidence.id,
        source_type: evidence.sourceType,
        safe_reference: {
          reference_id: `ref-${evidence.id}`,
          reference_type: "synthetic_fixture_path",
          uri: evidence.rawReference ?? `sample/synthetic/${evidence.id}`,
          notes: "Synthetic fixture reference only; not raw telemetry.",
        },
      },
      provenance_reference: provenanceId,
      sanitization_status: "synthetic",
      linked_claim_ids: caseFile.evidenceRelations
        .filter((relation) => relation.evidenceId === evidence.id)
        .map((relation) => relation.claimId),
      weight: availableMetric(
        readEvidenceWeight(caseFile, evidence.id),
        "higher_is_better",
      ),
    })),
    evidence_to_claim_mappings: caseFile.evidenceRelations.map((relation) => ({
      claim_id: relation.claimId,
      evidence_id: relation.evidenceId,
      relationship: readEvidenceRelationship(
        relation.polarity,
        relation.strength,
      ),
      expected_support: readEvidenceRelationship(
        relation.polarity,
        relation.strength,
      ),
      rationale: relation.explanation,
    })),
    representative_sessions: caseFile.representativeSessions.map((session) => ({
      session_id: session.id,
      title: session.title,
      summary: session.summary,
      feature_highlights: readSessionFeatureHighlights(caseFile, session.summary),
      safe_reference: {
        reference_id: `ref-${session.id}`,
        reference_type: "synthetic_fixture_path",
        uri: `sample/synthetic/${caseFile.cluster.id}/${session.id}`,
        label: session.title,
      },
      cluster_membership: {
        cluster_id: caseFile.cluster.id,
        membership_score: availableMetric(
          session.featureOverlap,
          "higher_is_better",
        ),
        distance_to_centroid: availableMetric(
          session.outlierScore,
          "lower_is_better",
        ),
      },
      flags: readSessionFlags(caseFile, session),
    })),
    outlier_impostor_candidates: outlierCandidates.map((session) => ({
      candidate_id: `candidate-${session.id}`,
      session_id: session.id,
      reason:
        session.outlierReason ??
        "High synthetic outlier score makes this session useful for cluster-purity review.",
      score: availableMetric(session.outlierScore, "higher_is_better"),
      expected_review_use: readExpectedReviewUse(caseFile.reviewStatus),
    })),
    neighbor_clusters: [
      {
        neighbor_cluster_id: caseFile.nearestNeighbor.clusterId,
        label: caseFile.nearestNeighbor.label,
        distance: availableMetric(
          caseFile.nearestNeighbor.distance,
          "lower_is_better",
        ),
        reason_this_neighbor_matters: caseFile.nearestNeighbor.note,
        confusion_risk: availableMetric(
          Math.max(0, Math.min(1, 1 - caseFile.nearestNeighbor.distance)),
          "higher_is_better",
        ),
      },
    ],
    metrics: {
      cluster_coherence: availableMetric(
        Math.max(0, Math.min(1, 1 - caseFile.uncertainty)),
        "higher_is_better",
      ),
      feature_distinctiveness: availableMetric(
        average(
          caseFile.representativeSessions.map(
            (session) => session.featureOverlap,
          ),
        ),
        "higher_is_better",
      ),
      evidence_coverage: availableMetric(
        caseFile.evidenceStrength,
        "higher_is_better",
      ),
      model_agreement: availableMetric(
        caseFile.modelAgreement,
        "higher_is_better",
      ),
      uncertainty: availableMetric(caseFile.uncertainty, "higher_is_better"),
      outlier_score: availableMetric(
        Math.max(
          ...caseFile.representativeSessions.map(
            (session) => session.outlierScore,
          ),
        ),
        "higher_is_better",
      ),
      temporal_stability: {
        status: "unavailable",
        reason:
          "Synthetic sample cases do not include repeated runs for temporal stability.",
      },
    },
    provenance: {
      provenance_id: provenanceId,
      source_system: "telemetry-court-synthetic-fixtures",
      source_artifact: "data/sampleCaseSeedData.ts",
      generating_tool: "Telemetry Court fixture converter",
      generated_at: FIXTURE_CREATED_AT,
      upstream_run_id: runId,
      adapter_name: "current-sample-case-to-case-package-v01",
      adapter_version: "0.1.0",
      references: [
        {
          reference_id: `ref-${caseFile.id}-seed`,
          reference_type: "synthetic_fixture_path",
          uri: "data/sampleCaseSeedData.ts",
          notes:
            "Compatibility seed for the current static synthetic review flow.",
        },
      ],
      owner: {
        team: "Telemetry Court",
      },
    },
    sanitization: {
      status: "synthetic",
      method:
        "Generated safe fixture summaries with no raw restricted telemetry.",
      redaction_notes: [
        "No real principals, accounts, hosts, domains, or events are present.",
        "Principal and reference strings are synthetic review examples.",
      ],
      allowed_display_level: "summary_only",
      raw_drilldown_allowed: false,
      safe_reference_type: "synthetic_fixture_path",
      notes:
        "Fixtures are suitable for local contract and UI workflow testing only.",
    },
    review_configuration: {
      blind_review_enabled: true,
      initially_hidden_label_ids: aiLabelIds,
      initially_revealed_label_ids: caseFile.candidateLabels
        .filter((label) => label.source !== "baseline_ai")
        .map((label) => label.id),
      required_review_stages: [...CASE_PACKAGE_V01_REQUIRED_REVIEW_STAGES],
      allowed_evidence_ratings: [...CASE_PACKAGE_V01_EVIDENCE_RATINGS],
      allowed_verdicts: [...CASE_PACKAGE_V01_VERDICTS],
      allowed_recommended_actions: [...CASE_PACKAGE_V01_RECOMMENDED_ACTIONS],
      required_reviewer_actions: [
        ...CASE_PACKAGE_V01_REQUIRED_REVIEWER_ACTIONS,
      ],
    },
  };
}

function validateCasePackageFixtures(
  packages: CasePackageV01[],
): CasePackageV01[] {
  return packages.map((packageFixture) => {
    const result = validateCasePackageV01(packageFixture);

    if (!result.ok) {
      throw new Error(
        `Invalid CasePackage fixture ${packageFixture.package_id}: ${JSON.stringify(
          result.errors,
        )}`,
      );
    }

    return result.package;
  });
}

function packageIdFromCaseId(caseId: string): string {
  return `pkg-${caseId.replace(/^case-/, "synthetic-")}`;
}

function datasetIdFromName(datasetName: string): string {
  return `dataset-${slugify(datasetName)}`;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function readReviewIntent(
  caseFile: CaseFile,
):
  | "validate_label"
  | "compare_labels"
  | "assess_cluster_purity"
  | "assess_evidence_quality"
  | "research_benchmark" {
  if (
    caseFile.reviewStatus === "needs_split" ||
    caseFile.landscapeStatus === "impure"
  ) {
    return "assess_cluster_purity";
  }

  if (caseFile.landscapeStatus === "too_broad") {
    return "compare_labels";
  }

  if (caseFile.reviewStatus === "needs_evidence") {
    return "assess_evidence_quality";
  }

  return "validate_label";
}

function readDatasetType(caseFile: CaseFile): CasePackageDatasetTypeV01 {
  const dataset = caseFile.dataset.toLowerCase();
  const clusterId = caseFile.cluster.id.toLowerCase();

  if (dataset.includes("cloudtrail") || clusterId.includes("s3")) {
    return "cloudtrail";
  }

  if (dataset.includes("identity") && dataset.includes("endpoint")) {
    return "mixed";
  }

  if (dataset.includes("endpoint") || dataset.includes("windows")) {
    return "endpoint";
  }

  if (dataset.includes("identity")) {
    return "identity";
  }

  return "synthetic";
}

function readCandidateLabelSource(
  source: CandidateLabelSource,
): CasePackageCandidateLabelSourceV01 {
  const sourceMap: Record<
    CandidateLabelSource,
    CasePackageCandidateLabelSourceV01
  > = {
    baseline_ai: "ai_generated",
    evidence_constrained_ai: "prompt_variant",
    human_style: "human_baseline",
    uncertain_label: "synthetic_fixture",
  };

  return sourceMap[source];
}

function readModelReference(
  source: CandidateLabelSource,
  baselineModel: string,
): string {
  const modelMap: Record<CandidateLabelSource, string> = {
    baseline_ai: baselineModel,
    evidence_constrained_ai: "Synthetic evidence-constrained labeler",
    human_style: "Synthetic human-style baseline",
    uncertain_label: "Synthetic uncertainty-preserving labeler",
  };

  return modelMap[source];
}

function readClaimType(text: string): CasePackageClaimTypeV01 {
  const lowerText = text.toLowerCase();

  if (lowerText.includes("malicious") || lowerText.includes("intent")) {
    return "intent";
  }

  if (
    lowerText.includes("pure") ||
    lowerText.includes("split") ||
    lowerText.includes("specific enough") ||
    lowerText.includes("uncertainty")
  ) {
    return "cluster_quality";
  }

  if (
    lowerText.includes("credential") ||
    lowerText.includes("exfiltration") ||
    lowerText.includes("suspicious")
  ) {
    return "risk";
  }

  if (
    lowerText.includes("powershell") ||
    lowerText.includes("role") ||
    lowerText.includes("s3") ||
    lowerText.includes("service update") ||
    lowerText.includes("administration")
  ) {
    return "behavioral_summary";
  }

  return "other";
}

function readEvidenceType(
  sourceType: EvidenceSourceType,
  title: string,
): CasePackageEvidenceTypeV01 {
  if (sourceType === "session_feature" || sourceType === "keyphrase") {
    return "salient_feature";
  }

  if (sourceType === "exemplar") {
    return "representative_session";
  }

  if (sourceType === "analyst_note") {
    return "analyst_note";
  }

  if (title.toLowerCase().includes("neighbour")) {
    return "neighbor_comparison";
  }

  if (sourceType === "metadata") {
    return "event_summary";
  }

  return "sequence_summary";
}

function readEvidenceRelationship(
  polarity: EvidencePolarity,
  strength: "strong" | "moderate" | "weak",
): CasePackageEvidenceRelationshipV01 {
  if (polarity === "contradicts") {
    return "contradicts";
  }

  if (polarity === "neutral") {
    return "context";
  }

  return strength === "strong" ? "supports" : "weak_support";
}

function readEvidenceWeight(caseFile: CaseFile, evidenceId: string): number {
  const relationStrengths = caseFile.evidenceRelations
    .filter((relation) => relation.evidenceId === evidenceId)
    .map((relation) => {
      if (relation.strength === "strong") {
        return 0.9;
      }

      if (relation.strength === "moderate") {
        return 0.65;
      }

      return 0.4;
    });

  return relationStrengths.length > 0 ? average(relationStrengths) : 0.5;
}

function readSessionFeatureHighlights(
  caseFile: CaseFile,
  summary: string,
): string[] {
  const lowerSummary = summary.toLowerCase();
  const matchingFeatures = caseFile.topFeatures.filter((feature) =>
    lowerSummary.includes(feature.toLowerCase().split(" ")[0]),
  );

  return matchingFeatures.length > 0
    ? matchingFeatures.slice(0, 4)
    : caseFile.topFeatures.slice(0, 4);
}

function readSessionFlags(
  caseFile: CaseFile,
  session: CaseFile["representativeSessions"][number],
): CasePackageSessionFlagV01[] {
  const flags: CasePackageSessionFlagV01[] = [];

  if (session.outlierScore < 0.5) {
    flags.push("representative");
  }

  if (
    session.id === caseFile.seededImpostorSessionId ||
    Boolean(session.outlierReason) ||
    session.outlierScore >= 0.65
  ) {
    flags.push("outlier_candidate");
  }

  if (session.featureOverlap < 0.5) {
    flags.push("borderline");
  }

  if (session.outlierScore >= 0.7) {
    flags.push("needs_context");
  }

  return flags.length > 0 ? flags : ["representative"];
}

function readExpectedReviewUse(
  reviewStatus: ReviewStatus,
): CasePackageExpectedReviewUseV01 {
  if (reviewStatus === "needs_split") {
    return "cluster_purity_check";
  }

  if (reviewStatus === "needs_evidence") {
    return "evidence_sufficiency_check";
  }

  return "outlier_check";
}

function readTimeRange(caseFile: CaseFile) {
  const timestamps = caseFile.representativeSessions
    .map((session) => session.timestamp)
    .sort();

  return {
    start_at: timestamps[0],
    end_at: timestamps[timestamps.length - 1],
    timezone: "UTC",
  };
}

function availableMetric(
  value: number,
  interpretation: "higher_is_better" | "lower_is_better" | "contextual",
): CasePackageMetricV01 {
  return {
    status: "available",
    value: Number(Math.max(0, Math.min(1, value)).toFixed(2)),
    min: 0,
    max: 1,
    interpretation,
  };
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
