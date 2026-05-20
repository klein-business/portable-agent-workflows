import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  ALL_HARNESSES,
  HARNESS_IDS,
  filesForHarnesses,
  resolveHarnesses,
} from "../../src/harnesses.mjs";

test("defines the phase 1 harnesses in stable order", () => {
  assert.deepEqual(HARNESS_IDS, ["codex", "claude", "cursor", "opencode"]);
  assert.deepEqual(
    ALL_HARNESSES.map((harness) => harness.displayName),
    ["Codex", "Claude Code", "Cursor", "OpenCode"],
  );
});

test("each harness installs only project-local paths", () => {
  for (const harness of ALL_HARNESSES) {
    assert.ok(harness.files.includes(".agent-work"));
    for (const file of harness.files) {
      assert.equal(file.startsWith("/"), false, `${harness.id} has absolute path ${file}`);
      assert.equal(file.startsWith("~"), false, `${harness.id} has home path ${file}`);
    }
  }
});

test("resolveHarnesses deduplicates and validates selected harnesses", () => {
  assert.deepEqual(resolveHarnesses("codex,claude,codex").map((harness) => harness.id), [
    "codex",
    "claude",
  ]);
  assert.throws(() => resolveHarnesses("codex,unknown"), /Unknown harness: unknown/);
});

test("filesForHarnesses returns unique files in harness order", () => {
  assert.deepEqual(filesForHarnesses(resolveHarnesses("codex,opencode")), [
    ".agent-work",
    "AGENTS.md",
    ".opencode/commands/shape-idea.md",
  ]);
});

test("package metadata defines the npm distribution skeleton", async () => {
  const manifest = JSON.parse(await readFile(new URL("../../package.json", import.meta.url), "utf8"));

  assert.equal(manifest.name, "portable-agent-workflows");
  assert.equal(manifest.version, "0.1.0");
  assert.equal(manifest.type, "module");
  assert.deepEqual(manifest.bin, {
    "portable-agent-workflows": "./bin/portable-agent-workflows.mjs",
    paw: "./bin/portable-agent-workflows.mjs",
  });
  assert.deepEqual(manifest.files, [
    ".agent-work/",
    ".claude-plugin/",
    ".claude/commands/",
    ".cursor/rules/",
    ".opencode/commands/",
    "AGENTS.md",
    "CLAUDE.md",
    "LICENSE",
    "README.md",
    "bin/",
    "plugins/",
    "src/",
  ]);
  assert.deepEqual(manifest.scripts, {
    "test:node": "node --test tests/node/*.test.mjs",
    "pack:check": "npm pack --dry-run --json",
    "check:node": "npm run test:node && npm run pack:check",
  });
  assert.deepEqual(manifest.engines, { node: ">=20" });
});
