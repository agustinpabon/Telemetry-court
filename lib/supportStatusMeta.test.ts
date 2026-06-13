import assert from "node:assert/strict";
import test from "node:test";

import {
  supportStatusMeta,
  supportStatusStates,
} from "@/lib/supportStatusMeta";
import type { SupportStatus } from "@/lib/types";

const expectedStatuses: SupportStatus[] = [
  "supported",
  "weakly_supported",
  "contradicted",
  "unsupported",
  "insufficient_evidence",
];

test("support status metadata covers every status in a stable order", () => {
  assert.deepEqual(supportStatusStates, expectedStatuses);
  assert.deepEqual(Object.keys(supportStatusMeta).sort(), [...expectedStatuses].sort());

  for (const status of expectedStatuses) {
    const meta = supportStatusMeta[status];

    assert.ok(meta.label);
    assert.ok(meta.shortLabel);
    assert.ok(meta.chipClassName);
    assert.ok(meta.badgeClassName);
    assert.ok(meta.textClassName);
    assert.ok(meta.plainLanguage);
    assert.ok(meta.note);
  }
});

test("contradicted and unsupported support statuses keep distinct semantic tokens", () => {
  const contradicted = supportStatusMeta.contradicted;
  const unsupported = supportStatusMeta.unsupported;

  assert.match(contradicted.chipClassName, /--color-contradicted/);
  assert.match(contradicted.badgeClassName, /--color-contradicted/);
  assert.match(contradicted.textClassName, /--color-contradicted/);
  assert.match(unsupported.chipClassName, /--color-unsupported/);
  assert.match(unsupported.badgeClassName, /--color-unsupported/);
  assert.match(unsupported.textClassName, /--color-unsupported/);
  assert.notEqual(contradicted.chipClassName, unsupported.chipClassName);
  assert.notEqual(contradicted.plainLanguage, unsupported.plainLanguage);
});
