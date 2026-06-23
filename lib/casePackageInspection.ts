import {
  getCasePackageValidationPosture,
  type CasePackageValidationPosture,
} from "@/lib/casePackageValidation";
import type { CasePackageV01 } from "@/lib/types";

export type CasePackageInspectionPosture =
  | "synthetic demo"
  | "sanitized/controlled"
  | "real/approved controlled";

export type CasePackageInspectionSummary = {
  schemaVersion: string;
  packageId: string;
  packageRevision?: string;
  caseId: string;
  reviewableStatus: string;
  packagePosture: CasePackageInspectionPosture;
  datasetClassification: string;
  sanitizationStatus: string;
  approvalStatus: string;
  approvalScope?: string;
  pipelineName: string;
  pipelineVersion?: string;
  adapterName?: string;
  adapterVersion?: string;
  evidenceCount: number;
  claimCount: number;
  candidateLabelCount: number;
  representativeSessionCount: number;
};

export function inspectCasePackageV01(
  casePackage: CasePackageV01,
): CasePackageInspectionSummary {
  const validationPosture = getCasePackageValidationPosture(casePackage);
  const reviewApproval = casePackage.sanitization.review_approval;

  return {
    schemaVersion: casePackage.schema_version,
    packageId: casePackage.package_id,
    packageRevision: casePackage.package_revision,
    caseId: casePackage.case.case_id,
    reviewableStatus: casePackage.case.reviewable_status,
    packagePosture: describeInspectionPosture(casePackage, validationPosture),
    datasetClassification: casePackage.dataset.data_classification,
    sanitizationStatus: casePackage.sanitization.status,
    approvalStatus:
      reviewApproval?.status ??
      (validationPosture === "synthetic_demo"
        ? "not required for synthetic demo"
        : "missing"),
    approvalScope: reviewApproval?.scope,
    pipelineName: casePackage.pipeline.upstream_tool,
    pipelineVersion: casePackage.pipeline.pipeline_version,
    adapterName: casePackage.provenance.adapter_name,
    adapterVersion: casePackage.provenance.adapter_version,
    evidenceCount: casePackage.evidence_items.length,
    claimCount: casePackage.claims.length,
    candidateLabelCount: casePackage.candidate_labels.length,
    representativeSessionCount: casePackage.representative_sessions.length,
  };
}

function describeInspectionPosture(
  casePackage: CasePackageV01,
  validationPosture: CasePackageValidationPosture,
): CasePackageInspectionPosture {
  if (validationPosture === "synthetic_demo") {
    return "synthetic demo";
  }

  if (
    casePackage.sanitization.status === "approved_internal" ||
    casePackage.dataset.data_classification === "internal" ||
    casePackage.dataset.data_classification === "confidential"
  ) {
    return "real/approved controlled";
  }

  return "sanitized/controlled";
}
