import assert from "node:assert/strict";
import test from "node:test";

import {
  CASE_PACKAGE_JSON_MAX_BYTES,
  LocalJsonFileReadError,
  REVIEW_ARTIFACT_JSON_MAX_BYTES,
  readBoundedLocalJsonFile,
} from "@/lib/localJsonFileRead";

test("local JSON limits keep CasePackages at 2 MiB and review bundles at 8 MiB", () => {
  assert.equal(CASE_PACKAGE_JSON_MAX_BYTES, 2 * 1024 * 1024);
  assert.equal(REVIEW_ARTIFACT_JSON_MAX_BYTES, 8 * 1024 * 1024);
});

test("bounded local JSON reads return text within both declared and UTF-8 limits", async () => {
  const text = '{"summary":"café"}';

  assert.equal(
    await readBoundedLocalJsonFile(
      {
        size: new TextEncoder().encode(text).byteLength,
        text: async () => text,
      },
      64,
    ),
    text,
  );
});

test("bounded local JSON reads reject invalid UTF-8 bytes without falling back to replacement text", async () => {
  const privateMarker = "PRIVATE_UTF8_MARKER";
  const invalidBytes = new Uint8Array([
    ...new TextEncoder().encode(`{"schema_version":"${privateMarker}`),
    0xc3,
    0x28,
    ...new TextEncoder().encode('"}'),
  ]);
  let textFallbackAttempted = false;
  const fileLike = {
    size: invalidBytes.byteLength,
    arrayBuffer: async () => invalidBytes.buffer,
    text: async () => {
      textFallbackAttempted = true;
      return new TextDecoder().decode(invalidBytes);
    },
  } as File;

  await assert.rejects(
    readBoundedLocalJsonFile(fileLike, 128),
    (error: unknown) => {
      assert.ok(error instanceof LocalJsonFileReadError);
      assert.equal(error.code, "read_failed");
      assert.doesNotMatch(error.message, new RegExp(privateMarker));
      return true;
    },
  );
  assert.equal(textFallbackAttempted, false);
});

test("bounded local JSON reads enforce the actual byte limit on File-like array buffers", async () => {
  const oversizedBytes = new TextEncoder().encode("x".repeat(65));

  await assert.rejects(
    readBoundedLocalJsonFile(
      {
        size: 1,
        arrayBuffer: async () => oversizedBytes.buffer,
      },
      64,
    ),
    (error: unknown) => {
      assert.ok(error instanceof LocalJsonFileReadError);
      assert.equal(error.code, "file_too_large");
      return true;
    },
  );
});

test("bounded local JSON reads reject declared oversize before reading", async () => {
  let readAttempted = false;

  await assert.rejects(
    readBoundedLocalJsonFile(
      {
        size: 65,
        text: async () => {
          readAttempted = true;
          return "{}";
        },
      },
      64,
    ),
    (error: unknown) => {
      assert.ok(error instanceof LocalJsonFileReadError);
      assert.equal(error.code, "file_too_large");
      assert.doesNotMatch(error.message, /secret|\.json/i);
      return true;
    },
  );
  assert.equal(readAttempted, false);
});

test("bounded local JSON reads enforce actual UTF-8 size after reading", async () => {
  const multibyteText = "🔐".repeat(20);

  await assert.rejects(
    readBoundedLocalJsonFile(
      {
        size: 1,
        text: async () => multibyteText,
      },
      64,
    ),
    (error: unknown) => {
      assert.ok(error instanceof LocalJsonFileReadError);
      assert.equal(error.code, "file_too_large");
      assert.doesNotMatch(error.message, /🔐/);
      return true;
    },
  );
});

test("bounded local JSON reads replace supplied read errors with a generic error", async () => {
  await assert.rejects(
    readBoundedLocalJsonFile(
      {
        size: 2,
        text: async () => {
          throw new Error("private-case.json contained restricted-value");
        },
      },
      64,
    ),
    (error: unknown) => {
      assert.ok(error instanceof LocalJsonFileReadError);
      assert.equal(error.code, "read_failed");
      assert.doesNotMatch(error.message, /private-case|restricted-value/);
      return true;
    },
  );
});

test("bounded local JSON reads fail closed on invalid file metadata", async () => {
  await assert.rejects(
    readBoundedLocalJsonFile(
      {
        size: Number.NaN,
        text: async () => "{}",
      },
      64,
    ),
    (error: unknown) => {
      assert.ok(error instanceof LocalJsonFileReadError);
      assert.equal(error.code, "invalid_file_metadata");
      return true;
    },
  );
});
