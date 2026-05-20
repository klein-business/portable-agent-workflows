import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { parseArgs } from "../../src/cli.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const binPath = path.join(repoRoot, "bin/portable-agent-workflows.mjs");

function runCli(args, options = {}) {
  return spawnSync(process.execPath, [binPath, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
    input: options.input,
  });
}

function tempTarget() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "paw-cli-"));
}

test("prints help", () => {
  const result = runCli(["--help"]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /portable-agent-workflows/);
  assert.match(result.stdout, /init/);
  assert.match(result.stdout, /check/);
  assert.match(result.stdout, /list-harnesses/);
});

test("lists supported harnesses", () => {
  const result = runCli(["list-harnesses"]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /codex\s+Codex\s+stable/);
  assert.match(result.stdout, /opencode\s+OpenCode\s+documented/);
});

test("rejects unknown commands", () => {
  const result = runCli(["publish"]);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /Unknown command: publish/);
});

test("parses future init options", () => {
  assert.deepEqual(
    parseArgs([
      "init",
      "--harness",
      "codex,claude",
      "--target",
      "example-target",
      "--yes",
      "--dry-run",
      "--force",
    ]),
    {
      command: "init",
      harness: "codex,claude",
      target: "example-target",
      yes: true,
      dryRun: true,
      force: true,
      help: false,
    },
  );
});

test("parses future check options and short help", () => {
  assert.deepEqual(parseArgs(["check", "--harness", "opencode", "--target", ".", "-h"]), {
    command: "check",
    harness: "opencode",
    target: ".",
    yes: false,
    dryRun: false,
    force: false,
    help: true,
  });
});

test("prints command help without dispatching future modules", () => {
  for (const command of ["init", "check"]) {
    const result = runCli([command, "--help"]);
    assert.equal(result.status, 0);
    assert.equal(result.stderr, "");
    assert.match(result.stdout, /portable-agent-workflows/);
    assert.match(result.stdout, /init/);
    assert.match(result.stdout, /check/);
  }
});

test("bare init prompts for harness selection", () => {
  const target = tempTarget();
  const result = runCli(["init", "--target", target], { input: "codex\n" });

  assert.equal(result.status, 0);
  assert.match(result.stdout, /Select harnesses/);
  assert.equal(fs.existsSync(path.join(target, "AGENTS.md")), true);
  assert.equal(fs.existsSync(path.join(target, "CLAUDE.md")), false);

  const manifest = JSON.parse(
    fs.readFileSync(path.join(target, ".agent-work/install.json"), "utf8"),
  );
  assert.deepEqual(manifest.harnesses, ["codex"]);
});

test("bare init without non-interactive input does not install defaults", () => {
  const target = tempTarget();
  const result = runCli(["init", "--target", target], { input: "" });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Pass --harness or --yes/);
  assert.equal(fs.existsSync(path.join(target, "AGENTS.md")), false);
  assert.equal(fs.existsSync(path.join(target, ".agent-work/install.json")), false);
});
