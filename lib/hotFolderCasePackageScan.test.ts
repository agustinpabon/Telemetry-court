import assert from "node:assert/strict";
import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  utimes,
  writeFile,
} from "node:fs/promises";
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

test("Hot-Folder scan rejects invalid UTF-8 bytes without replacement decoding", async () => {
  await withTempHotFolder(async (folderPath) => {
    const privateMarker = "PRIVATE_UTF8_HOT_FOLDER_MARKER";
    const invalidBytes = new Uint8Array([
      ...new TextEncoder().encode(`{"schema_version":"${privateMarker}`),
      0xc3,
      0x28,
      ...new TextEncoder().encode('"}'),
    ]);
    await writeFile(path.join(folderPath, "invalid-utf8.json"), invalidBytes);

    const scan = await scanHotFolderCasePackages({ folderPath });

    assert.equal(scan.validCandidates.length, 0);
    assert.equal(scan.invalidCandidates.length, 1);
    assert.equal(scan.invalidCandidates[0].reason, "read_error");
    assert.equal(scan.invalidCandidates[0].errors[0].path, "$file");
    assert.equal(scan.invalidCandidates[0].errors[0].code, "invalid_utf8");
    assert.doesNotMatch(JSON.stringify(scan), new RegExp(privateMarker));
  });
});

test("Hot-Folder scan reports CasePackage validation failures", async () => {
  await withTempHotFolder(async (folderPath) => {
    const privateMarker = "PRIVATE_HOT_FOLDER_SCHEMA_MARKER";
    const invalidPackage = structuredClone(minimalSyntheticCasePackageV01) as Record<
      string,
      unknown
    >;
    invalidPackage.schema_version = `case_package.${privateMarker}`;
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
    assert.equal(
      scan.invalidCandidates[0].errors[0].code,
      "unsupported_schema_version",
    );
    assert.equal(
      scan.invalidCandidates[0].errors[0].message,
      "The Hot-Folder candidate did not satisfy this CasePackage validation rule.",
    );
    assert.doesNotMatch(JSON.stringify(scan), new RegExp(privateMarker));
  });
});

test("Hot-Folder CasePackage scan ignores refinement artifacts from the shared local loop", async () => {
  await withTempHotFolder(async (folderPath) => {
    await writeFile(
      path.join(folderPath, "case-001-cluster-refinement.json"),
      JSON.stringify({
        schema_version: "cluster_refinement.v0.1",
        private_marker: "REFINEMENT_CONTENT_MUST_NOT_APPEAR",
      }),
    );
    await writeFile(
      path.join(folderPath, "custom-handoff.json"),
      JSON.stringify({
        schema_version: "cluster_refinement.v0.1",
        private_marker: "REFINEMENT_CONTENT_MUST_NOT_APPEAR",
      }),
    );

    const scan = await scanHotFolderCasePackages({ folderPath });

    assert.equal(scan.validCandidates.length, 0);
    assert.equal(scan.invalidCandidates.length, 0);
    assert.doesNotMatch(JSON.stringify(scan), /REFINEMENT_CONTENT_MUST_NOT_APPEAR/);
  });
});

test("Hot-Folder scan ignores hidden, non-JSON, nested, and symlink candidates", async () => {
  await withTempHotFolder(async (folderPath) => {
    const outsideFolderPath = await mkdtemp(
      path.join(tmpdir(), "tc-hot-folder-outside-"),
    );

    try {
      await mkdir(path.join(folderPath, "nested"));
      await writeFile(path.join(folderPath, ".hidden.json"), "{not-json");
      await writeFile(path.join(folderPath, "notes.txt"), "{not-json");
      await writeFile(
        path.join(folderPath, "nested", "nested-package.json"),
        "{not-json",
      );
      const outsideFilePath = path.join(outsideFolderPath, "outside-package.json");
      await writeFile(outsideFilePath, "{not-json");
      await symlink(outsideFilePath, path.join(folderPath, "linked-package.json"));

      const scan = await scanHotFolderCasePackages({ folderPath });

      assert.equal(scan.validCandidates.length, 0);
      assert.equal(scan.invalidCandidates.length, 0);
      assert.doesNotMatch(
        JSON.stringify(scan),
        new RegExp(escapeRegExp(outsideFolderPath)),
      );
    } finally {
      await rm(outsideFolderPath, { recursive: true, force: true });
    }
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

test("Hot-Folder scan enforces the byte cap again after a candidate is read", async () => {
  await withTempHotFolder(async (folderPath) => {
    await writeFile(path.join(folderPath, "grew-during-read.json"), "{}");

    const scan = await scanHotFolderCasePackages({
      folderPath,
      maxBytes: 2,
      readFileBytes: async () => Buffer.from("{} ", "utf8"),
    });

    assert.equal(scan.validCandidates.length, 0);
    assert.equal(scan.invalidCandidates.length, 1);
    assert.equal(scan.invalidCandidates[0].filename, "grew-during-read.json");
    assert.equal(scan.invalidCandidates[0].reason, "file_too_large");
    assert.equal(scan.invalidCandidates[0].sizeBytes, 3);
  });
});

test("Hot-Folder scan rejects a candidate that changes while it is read", async () => {
  await withTempHotFolder(async (folderPath) => {
    await writeCasePackage(folderPath, "changing-package.json", {
      package_id: "pkg-hot-folder-changing-001",
      case: {
        case_id: "case-hot-folder-changing-001",
        title: "Changing package",
      },
    });

    const scan = await scanHotFolderCasePackages({
      folderPath,
      readFileBytes: async (filePath) => {
        const originalBytes = await readFile(filePath);
        await writeFile(filePath, Buffer.concat([originalBytes, Buffer.from(" ")]));
        return originalBytes;
      },
    });

    assert.equal(scan.validCandidates.length, 0);
    assert.equal(scan.invalidCandidates.length, 1);
    assert.equal(scan.invalidCandidates[0].filename, "changing-package.json");
    assert.equal(scan.invalidCandidates[0].reason, "read_error");
    assert.equal(scan.invalidCandidates[0].errors[0].code, "file_read_failed");
    assert.doesNotMatch(JSON.stringify(scan), new RegExp(escapeRegExp(folderPath)));
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
