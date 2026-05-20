import assert from "node:assert/strict";
import { stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
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

test("package bin targets exist and route to a useful CLI", async () => {
  const manifest = JSON.parse(await readFile(new URL("../../package.json", import.meta.url), "utf8"));
  const binTargets = new Set(Object.values(manifest.bin));

  for (const target of binTargets) {
    await stat(new URL(`../..${target.slice(1)}`, import.meta.url));
  }

  const help = spawnSync(process.execPath, ["bin/portable-agent-workflows.mjs", "--help"], {
    cwd: new URL("../..", import.meta.url),
    encoding: "utf8",
  });
  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /portable-agent-workflows/);
  assert.match(help.stdout, /list-harnesses/);

  const list = spawnSync(process.execPath, ["bin/portable-agent-workflows.mjs", "list-harnesses"], {
    cwd: new URL("../..", import.meta.url),
    encoding: "utf8",
  });
  assert.equal(list.status, 0, list.stderr);
  assert.deepEqual(list.stdout.trim().split("\n"), [
    "codex\tCodex\tstable",
    "claude\tClaude Code\tstable",
    "cursor\tCursor\tstable",
    "opencode\tOpenCode\tdocumented",
  ]);

  for (const command of ["init", "check"]) {
    const result = spawnSync(process.execPath, ["bin/portable-agent-workflows.mjs", command], {
      cwd: new URL("../..", import.meta.url),
      encoding: "utf8",
    });
    assert.equal(result.status, 2);
    assert.match(result.stderr, new RegExp(`${command} is not implemented yet`));
  }
});

test("declared harness files exist in the package source", async () => {
  for (const file of filesForHarnesses(ALL_HARNESSES)) {
    await stat(new URL(`../../${file}`, import.meta.url));
  }
});
