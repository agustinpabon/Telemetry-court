import { constants } from "node:fs";
import { lstat, open, readdir } from "node:fs/promises";
import path from "node:path";

import { CLUSTER_REFINEMENT_V01_SCHEMA_VERSION } from "@/lib/clusterRefinementTypesV01";
import { importCasePackageV01Json } from "@/lib/importCasePackageV01";
import { CASE_PACKAGE_JSON_MAX_BYTES } from "@/lib/localJsonFileRead";
import {
  HOT_FOLDER_CASE_PACKAGE_ENV_VAR,
  type HotFolderCasePackageInvalidCandidate,
  type HotFolderCasePackageScanResponse,
  type HotFolderCasePackageValidCandidate,
} from "@/lib/hotFolderCasePackageTypes";

export { HOT_FOLDER_CASE_PACKAGE_ENV_VAR } from "@/lib/hotFolderCasePackageTypes";

export const DEFAULT_HOT_FOLDER_CASE_PACKAGE_MAX_BYTES =
  CASE_PACKAGE_JSON_MAX_BYTES;

type ScanConfiguredHotFolderOptions = {
  env?: Record<string, string | undefined>;
  maxBytes?: number;
};

type ScanHotFolderOptions = {
  folderPath: string;
  maxBytes?: number;
  readFileBytes?: (filePath: string, maxBytes: number) => Promise<Uint8Array>;
};

type ScannableFile = {
  filename: string;
  filePath: string;
  modifiedAt: string;
  modifiedAtMs: number;
  changedAtMs: number;
  deviceId: number;
  inode: number;
  sizeBytes: number;
};

type ValidCandidateWithoutDuplicateMetadata = Omit<
  HotFolderCasePackageValidCandidate,
  "duplicateCount" | "duplicateIndex"
>;

export async function scanConfiguredHotFolderCasePackages({
  env = process.env,
  maxBytes = DEFAULT_HOT_FOLDER_CASE_PACKAGE_MAX_BYTES,
}: ScanConfiguredHotFolderOptions = {}): Promise<HotFolderCasePackageScanResponse> {
  const folderPath = env[HOT_FOLDER_CASE_PACKAGE_ENV_VAR]?.trim();

  if (!folderPath) {
    return {
      enabled: false,
      folderLabel: "Hot-Folder not configured",
      maxBytes,
      validCandidates: [],
      invalidCandidates: [],
    };
  }

  return scanHotFolderCasePackages({ folderPath, maxBytes });
}

export async function scanHotFolderCasePackages({
  folderPath,
  maxBytes = DEFAULT_HOT_FOLDER_CASE_PACKAGE_MAX_BYTES,
  readFileBytes = readCandidateFileBytes,
}: ScanHotFolderOptions): Promise<HotFolderCasePackageScanResponse> {
  let directoryEntries;

  try {
    directoryEntries = await readdir(folderPath, { withFileTypes: true });
  } catch {
    return {
      enabled: true,
      folderLabel: "configured Hot-Folder",
      maxBytes,
      validCandidates: [],
      invalidCandidates: [],
      directoryError:
        "Configured Hot-Folder could not be read. Confirm the configured directory exists and is accessible.",
    };
  }

  const scannableFiles: ScannableFile[] = [];
  const invalidCandidates: HotFolderCasePackageInvalidCandidate[] = [];

  for (const entry of directoryEntries) {
    if (!isTopLevelJsonFile(entry.name) || !entry.isFile()) {
      continue;
    }

    const filePath = path.join(folderPath, entry.name);

    try {
      const fileStat = await lstat(filePath);

      if (!fileStat.isFile()) {
        continue;
      }

      scannableFiles.push({
        filename: entry.name,
        filePath,
        modifiedAt: new Date(fileStat.mtimeMs).toISOString(),
        modifiedAtMs: fileStat.mtimeMs,
        changedAtMs: fileStat.ctimeMs,
        deviceId: fileStat.dev,
        inode: fileStat.ino,
        sizeBytes: fileStat.size,
      });
    } catch {
      invalidCandidates.push(buildReadErrorCandidate(entry.name));
    }
  }

  scannableFiles.sort(compareScannableFiles);

  const validCandidates: ValidCandidateWithoutDuplicateMetadata[] = [];

  for (const file of scannableFiles) {
    if (isCanonicalClusterRefinementFilename(file.filename)) {
      continue;
    }

    if (file.sizeBytes > maxBytes) {
      invalidCandidates.push(buildFileTooLargeCandidate(file, maxBytes));
      continue;
    }

    let fileBytes;

    try {
      fileBytes = await readFileBytes(file.filePath, maxBytes);
    } catch {
      invalidCandidates.push(buildReadErrorCandidate(file.filename, file));
      continue;
    }

    if (fileBytes.byteLength > maxBytes) {
      invalidCandidates.push(
        buildFileTooLargeCandidate(
          { ...file, sizeBytes: fileBytes.byteLength },
          maxBytes,
        ),
      );
      continue;
    }

    let fileStatAfterRead;

    try {
      fileStatAfterRead = await lstat(file.filePath);
    } catch {
      invalidCandidates.push(buildReadErrorCandidate(file.filename, file));
      continue;
    }

    if (
      !fileStatAfterRead.isFile() ||
      fileStatAfterRead.dev !== file.deviceId ||
      fileStatAfterRead.ino !== file.inode ||
      fileStatAfterRead.mtimeMs !== file.modifiedAtMs ||
      fileStatAfterRead.ctimeMs !== file.changedAtMs ||
      fileStatAfterRead.size !== file.sizeBytes ||
      fileBytes.byteLength !== file.sizeBytes
    ) {
      invalidCandidates.push(buildReadErrorCandidate(file.filename, file));
      continue;
    }

    let jsonText: string;

    try {
      jsonText = new TextDecoder("utf-8", { fatal: true }).decode(fileBytes);
    } catch {
      invalidCandidates.push(buildInvalidUtf8Candidate(file));
      continue;
    }

    if (hasClusterRefinementSchema(jsonText)) {
      continue;
    }

    const importResult = importCasePackageV01Json(jsonText);

    if (!importResult.ok) {
      invalidCandidates.push({
        status: "invalid",
        candidateId: getCandidateId(file),
        filename: file.filename,
        modifiedAt: file.modifiedAt,
        sizeBytes: file.sizeBytes,
        reason: importResult.reason,
        title: importResult.title,
        summary: importResult.summary,
        suggestedFix: importResult.suggestedFix,
        message: importResult.message,
        errors: sanitizeValidationErrors(importResult.errors),
      });
      continue;
    }

    validCandidates.push({
      status: "valid",
      candidateId: getCandidateId(file),
      filename: file.filename,
      modifiedAt: file.modifiedAt,
      sizeBytes: file.sizeBytes,
      source: "hot_folder",
      importKey: importResult.caseFile.id,
      packageId: importResult.package.package_id,
      packageRevision: importResult.package.package_revision,
      caseId: importResult.package.case.case_id,
      clusterId: importResult.package.cluster.cluster_id,
      title: importResult.package.case.title,
      jsonText,
    });
  }

  return {
    enabled: true,
    folderLabel: "configured Hot-Folder",
    maxBytes,
    validCandidates: addDuplicateMetadata(validCandidates),
    invalidCandidates,
  };
}

async function readCandidateFileBytes(
  filePath: string,
  maxBytes: number,
): Promise<Uint8Array> {
  const fileHandle = await open(
    filePath,
    constants.O_RDONLY | constants.O_NOFOLLOW,
  );

  try {
    const bytes = Buffer.alloc(maxBytes + 1);
    let totalBytesRead = 0;

    while (totalBytesRead < bytes.byteLength) {
      const { bytesRead } = await fileHandle.read(
        bytes,
        totalBytesRead,
        bytes.byteLength - totalBytesRead,
        totalBytesRead,
      );

      if (bytesRead === 0) {
        break;
      }

      totalBytesRead += bytesRead;
    }

    return bytes.subarray(0, totalBytesRead);
  } finally {
    await fileHandle.close();
  }
}

function isTopLevelJsonFile(filename: string): boolean {
  return !filename.startsWith(".") && path.extname(filename).toLowerCase() === ".json";
}

function isCanonicalClusterRefinementFilename(filename: string): boolean {
  return filename.toLowerCase().endsWith("cluster-refinement.json");
}

function hasClusterRefinementSchema(jsonText: string): boolean {
  try {
    const parsed: unknown = JSON.parse(jsonText);
    return (
      typeof parsed === "object" &&
      parsed !== null &&
      !Array.isArray(parsed) &&
      "schema_version" in parsed &&
      parsed.schema_version === CLUSTER_REFINEMENT_V01_SCHEMA_VERSION
    );
  } catch {
    return false;
  }
}

function compareScannableFiles(left: ScannableFile, right: ScannableFile): number {
  const modifiedTimeComparison = right.modifiedAtMs - left.modifiedAtMs;

  if (modifiedTimeComparison !== 0) {
    return modifiedTimeComparison;
  }

  return left.filename.localeCompare(right.filename);
}

function addDuplicateMetadata(
  candidates: ValidCandidateWithoutDuplicateMetadata[],
): HotFolderCasePackageValidCandidate[] {
  const countsByImportKey = new Map<string, number>();
  const indexesByImportKey = new Map<string, number>();

  for (const candidate of candidates) {
    countsByImportKey.set(
      candidate.importKey,
      (countsByImportKey.get(candidate.importKey) ?? 0) + 1,
    );
  }

  return candidates.map((candidate) => {
    const duplicateIndex = (indexesByImportKey.get(candidate.importKey) ?? 0) + 1;
    indexesByImportKey.set(candidate.importKey, duplicateIndex);

    return {
      ...candidate,
      duplicateCount: countsByImportKey.get(candidate.importKey) ?? 1,
      duplicateIndex,
    };
  });
}

function buildFileTooLargeCandidate(
  file: ScannableFile,
  maxBytes: number,
): HotFolderCasePackageInvalidCandidate {
  return {
    status: "invalid",
    candidateId: getCandidateId(file),
    filename: file.filename,
    modifiedAt: file.modifiedAt,
    sizeBytes: file.sizeBytes,
    reason: "file_too_large",
    title: "Hot-Folder file is too large",
    summary:
      "The candidate exceeds the local CasePackage scan size cap. It was not read and review cannot start from this file.",
    suggestedFix: `Write a minimal, approved CasePackage JSON file no larger than ${formatBytes(maxBytes)}.`,
    message: "Hot-Folder candidate is too large to scan. Review not started.",
    errors: [
      {
        path: "$file",
        code: "file_too_large",
        message:
          "The Hot-Folder candidate is larger than the configured CasePackage scan size cap.",
      },
    ],
  };
}

function buildReadErrorCandidate(
  filename: string,
  file?: ScannableFile,
): HotFolderCasePackageInvalidCandidate {
  return {
    status: "invalid",
    candidateId: file ? getCandidateId(file) : filename,
    filename,
    modifiedAt: file?.modifiedAt,
    sizeBytes: file?.sizeBytes,
    reason: "read_error",
    title: "Hot-Folder file could not be read",
    summary:
      "The candidate could not be read from the configured Hot-Folder. Package validation did not run and review cannot start from this file.",
    suggestedFix:
      "Confirm the file is complete, accessible, and still present in the configured Hot-Folder before retrying.",
    message: "Hot-Folder candidate could not be read. Review not started.",
    errors: [
      {
        path: "$file",
        code: "file_read_failed",
        message: "The Hot-Folder candidate could not be read.",
      },
    ],
  };
}

function buildInvalidUtf8Candidate(
  file: ScannableFile,
): HotFolderCasePackageInvalidCandidate {
  return {
    status: "invalid",
    candidateId: getCandidateId(file),
    filename: file.filename,
    modifiedAt: file.modifiedAt,
    sizeBytes: file.sizeBytes,
    reason: "read_error",
    title: "Hot-Folder file encoding is invalid",
    summary:
      "The candidate is not valid UTF-8 JSON. Package validation did not run and review cannot start from this file.",
    suggestedFix:
      "Write the complete CasePackage as valid UTF-8 JSON before retrying the Hot-Folder scan.",
    message: "Hot-Folder candidate is not valid UTF-8 JSON. Review not started.",
    errors: [
      {
        path: "$file",
        code: "invalid_utf8",
        message: "The Hot-Folder candidate is not valid UTF-8 JSON.",
      },
    ],
  };
}

function sanitizeValidationErrors(
  errors: HotFolderCasePackageInvalidCandidate["errors"],
): HotFolderCasePackageInvalidCandidate["errors"] {
  return errors.map((error) => ({
    path: error.path,
    code: error.code,
    message:
      "The Hot-Folder candidate did not satisfy this CasePackage validation rule.",
  }));
}

function getCandidateId(file: ScannableFile): string {
  return `${file.filename}:${file.modifiedAtMs}:${file.sizeBytes}`;
}

function formatBytes(byteCount: number): string {
  if (byteCount < 1024) {
    return `${byteCount} B`;
  }

  const kibibytes = byteCount / 1024;

  if (kibibytes < 1024) {
    return `${Math.round(kibibytes)} KiB`;
  }

  return `${Math.round(kibibytes / 1024)} MiB`;
}
