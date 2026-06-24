import assert from "node:assert/strict";
import { mkdtemp, rm, utimes, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { casePackageFixtures } from "@/data/casePackageFixtures";
import { minimalSyntheticCasePackageV01 } from "@/lib/casePackageV01Fixture";
import {
  HOT_FOLDER_CASE_PACKAGE_ENV_VAR,
  scanConfiguredHotFolderCasePackages,
  scanHotFolderCasePackages,
} from "@/lib/hotFolderCasePackageScan";
import type { CasePackageV01 } from "@/lib/types";

test("Hot-Folder scan is disabled when the configured env var is missing", async () => {
  const scan = await scanConfiguredHotFolderCasePackages({ env: {} });

  assert.equal(scan.enabled, false);
  assert.equal(scan.folderLabel, "Hot-Folder not configured");
  assert.equal(scan.validCandidates.length, 0);
  assert.equal(scan.invalidCandidates.length, 0);
});

test("Hot-Folder scan detects a valid top-level CasePackage JSON without leaking the absolute folder path", async () => {
  await withTempHotFolder(async (folderPath) => {
    await writeCasePackage(folderPath, "valid-package.json", {
      package_id: "pkg-hot-folder-valid-001",
      case: {
        case_id: "case-hot-folder-valid-001",
        title: "Hot-Folder valid package",
      },
    });

    const scan = await scanConfiguredHotFolderCasePackages({
      env: { [HOT_FOLDER_CASE_PACKAGE_ENV_VAR]: folderPath },
    });

    assert.equal(scan.enabled, true);
    assert.equal(scan.folderLabel, "configured Hot-Folder");
    assert.equal(scan.validCandidates.length, 1);
    assert.equal(scan.invalidCandidates.length, 0);
    assert.equal(scan.validCandidates[0].filename, "valid-package.json");
    assert.equal(scan.validCandidates[0].packageId, "pkg-hot-folder-valid-001");
    assert.equal(scan.validCandidates[0].caseId, "case-hot-folder-valid-001");
    assert.equal(scan.validCandidates[0].title, "Hot-Folder valid package");
    assert.equal(
      scan.validCandidates[0].importKey,
      "imported:pkg-hot-folder-valid-001:r1:case-hot-folder-valid-001",
    );
    assert.match(scan.validCandidates[0].jsonText, /pkg-hot-folder-valid-001/);
    assert.doesNotMatch(JSON.stringify(scan), new RegExp(escapeRegExp(folderPath)));
  });
});

test("Hot-Folder scan reports malformed JSON without making it a valid candidate", async () => {
  await withTempHotFolder(async (folderPath) => {
    await writeFile(path.join(folderPath, "broken.json"), "{not-json");

    const scan = await scanHotFolderCasePackages({ folderPath });

    assert.equal(scan.validCandidates.length, 0);
    assert.equal(scan.invalidCandidates.length, 1);
    assert.equal(scan.invalidCandidates[0].filename, "broken.json");
    assert.equal(scan.invalidCandidates[0].reason, "malformed_json");
    assert.equal(scan.invalidCandidates[0].errors[0].code, "invalid_json");
  });
});

test("Hot-Folder scan reports CasePackage validation failures", async () => {
  await withTempHotFolder(async (folderPath) => {
    const invalidPackage = structuredClone(minimalSyntheticCasePackageV01) as Record<
      string,
      unknown
    >;
    invalidPackage.schema_version = "case_package.v9";
    await writeFile(
      path.join(folderPath, "invalid-package.json"),
      JSON.stringify(invalidPackage),
    );

    const scan = await scanHotFolderCasePackages({ folderPath });

    assert.equal(scan.validCandidates.length, 0);
    assert.equal(scan.invalidCandidates.length, 1);
    assert.equal(scan.invalidCandidates[0].filename, "invalid-package.json");
    assert.equal(scan.invalidCandidates[0].reason, "schema_version");
    assert.equal(scan.invalidCandidates[0].errors[0].path, "$.schema_version");
  });
});

test("Hot-Folder scan ignores hidden files, non-JSON files, and nested JSON files", async () => {
  await withTempHotFolder(async (folderPath) => {
    await writeFile(path.join(folderPath, ".hidden.json"), "{not-json");
    await writeFile(path.join(folderPath, "notes.txt"), "{not-json");

    const scan = await scanHotFolderCasePackages({ folderPath });

    assert.equal(scan.validCandidates.length, 0);
    assert.equal(scan.invalidCandidates.length, 0);
  });
});

test("Hot-Folder scan enforces the configured size cap before reading a candidate", async () => {
  await withTempHotFolder(async (folderPath) => {
    await writeFile(path.join(folderPath, "too-large.json"), "{}");

    const scan = await scanHotFolderCasePackages({
      folderPath,
      maxBytes: 1,
    });

    assert.equal(scan.validCandidates.length, 0);
    assert.equal(scan.invalidCandidates.length, 1);
    assert.equal(scan.invalidCandidates[0].filename, "too-large.json");
    assert.equal(scan.invalidCandidates[0].reason, "file_too_large");
    assert.equal(scan.invalidCandidates[0].errors[0].code, "file_too_large");
  });
});

test("Hot-Folder scan sorts deterministically and marks duplicate imported CasePackage keys", async () => {
  await withTempHotFolder(async (folderPath) => {
    await writeCasePackage(folderPath, "older-duplicate.json", {
      package_id: "pkg-hot-folder-duplicate-001",
      case: {
        case_id: "case-hot-folder-duplicate-001",
        title: "Older duplicate package",
      },
    });
    await writeCasePackage(folderPath, "newer-duplicate.json", {
      package_id: "pkg-hot-folder-duplicate-001",
      case: {
        case_id: "case-hot-folder-duplicate-001",
        title: "Newer duplicate package",
      },
    });

    await setModifiedTime(folderPath, "older-duplicate.json", 1_700_000_000);
    await setModifiedTime(folderPath, "newer-duplicate.json", 1_700_000_100);

    const scan = await scanHotFolderCasePackages({ folderPath });

    assert.deepEqual(
      scan.validCandidates.map((candidate) => candidate.filename),
      ["newer-duplicate.json", "older-duplicate.json"],
    );
    assert.equal(scan.validCandidates[0].duplicateCount, 2);
    assert.equal(scan.validCandidates[0].duplicateIndex, 1);
    assert.equal(scan.validCandidates[1].duplicateCount, 2);
    assert.equal(scan.validCandidates[1].duplicateIndex, 2);
    assert.equal(
      scan.validCandidates[0].importKey,
      scan.validCandidates[1].importKey,
    );
  });
});

async function withTempHotFolder(
  callback: (folderPath: string) => Promise<void>,
): Promise<void> {
  const folderPath = await mkdtemp(path.join(tmpdir(), "tc-hot-folder-"));

  try {
    await callback(folderPath);
  } finally {
    await rm(folderPath, { recursive: true, force: true });
  }
}

async function writeCasePackage(
  folderPath: string,
  filename: string,
  overrides: {
    package_id: string;
    case: {
      case_id: string;
      title: string;
    };
  },
): Promise<void> {
  const casePackage: CasePackageV01 = {
    ...structuredClone(casePackageFixtures[0]),
    package_id: overrides.package_id,
    case: {
      ...casePackageFixtures[0].case,
      case_id: overrides.case.case_id,
      title: overrides.case.title,
    },
  };

  await writeFile(path.join(folderPath, filename), JSON.stringify(casePackage));
}

async function setModifiedTime(
  folderPath: string,
  filename: string,
  epochSeconds: number,
): Promise<void> {
  await utimes(
    path.join(folderPath, filename),
    new Date(epochSeconds * 1000),
    new Date(epochSeconds * 1000),
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
