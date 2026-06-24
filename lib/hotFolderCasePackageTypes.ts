import type { CasePackageValidationError } from "@/lib/casePackageValidation";
import type { CasePackageImportFailureReason } from "@/lib/importCasePackageV01";

export const HOT_FOLDER_CASE_PACKAGE_API_PATH = "/api/hot-folder/casepackages";
export const HOT_FOLDER_CASE_PACKAGE_ENV_VAR = "TELEMETRY_COURT_HOT_FOLDER";

export type HotFolderCasePackageInvalidReason =
  | CasePackageImportFailureReason
  | "file_too_large"
  | "read_error";

export type HotFolderCasePackageValidCandidate = {
  status: "valid";
  candidateId: string;
  filename: string;
  modifiedAt: string;
  sizeBytes: number;
  source: "hot_folder";
  importKey: string;
  duplicateCount: number;
  duplicateIndex: number;
  packageId: string;
  packageRevision?: string;
  caseId: string;
  clusterId: string;
  title: string;
  jsonText: string;
};

export type HotFolderCasePackageInvalidCandidate = {
  status: "invalid";
  candidateId: string;
  filename: string;
  modifiedAt?: string;
  sizeBytes?: number;
  reason: HotFolderCasePackageInvalidReason;
  title: string;
  summary: string;
  suggestedFix: string;
  message: string;
  errors: CasePackageValidationError[];
};

export type HotFolderCasePackageScanResponse = {
  enabled: boolean;
  folderLabel: "configured Hot-Folder" | "Hot-Folder not configured";
  maxBytes: number;
  validCandidates: HotFolderCasePackageValidCandidate[];
  invalidCandidates: HotFolderCasePackageInvalidCandidate[];
  directoryError?: string;
};
