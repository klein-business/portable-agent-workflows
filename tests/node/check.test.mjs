import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { runCheck } from "../../src/check.mjs";
import { runInit } from "../../src/install.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const binPath = path.join(repoRoot, "bin/portable-agent-workflows.mjs");

function tempTarget() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "paw-check-"));
}

function bufferIo() {
  let stdout = "";
  let stderr = "";
  return {
    io: {
      stdout: {
        write: (value) => {
          stdout += value;
        },
      },
      stderr: {
        write: (value) => {
          stderr += value;
        },
      },
    },
    output: () => ({ stdout, stderr }),
  };
}

function runCli(args) {
  return spawnSync(process.execPath, [binPath, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
  });
}

test("check passes after init", async () => {
  const target = tempTarget();
  await runInit({ target, harness: "codex", yes: true, dryRun: false, force: false }, bufferIo().io);

  const { io, output } = bufferIo();
  const status = await runCheck({ target, harness: undefined }, io);

  assert.equal(status, 0);
  assert.match(output().stdout, /Installed portable-agent-workflows files are current/);
});

test("check fails when an installed file is missing", async () => {
  const target = tempTarget();
  await runInit({ target, harness: "codex", yes: true, dryRun: false, force: false }, bufferIo().io);
  fs.rmSync(path.join(target, "AGENTS.md"));

  const { io, output } = bufferIo();
  const status = await runCheck({ target, harness: undefined }, io);

  assert.equal(status, 1);
  assert.match(output().stderr, /Missing AGENTS.md/);
});

test("check fails when an installed file drifts", async () => {
  const target = tempTarget();
  await runInit({ target, harness: "codex", yes: true, dryRun: false, force: false }, bufferIo().io);
  fs.appendFileSync(path.join(target, "AGENTS.md"), "\nlocal drift\n");

  const { io, output } = bufferIo();
  const status = await runCheck({ target, harness: undefined }, io);

  assert.equal(status, 1);
  assert.match(output().stderr, /Drifted AGENTS.md/);
});

test("check uses install manifest files when harness is omitted", async () => {
  const target = tempTarget();
  await runInit({ target, harness: "codex", yes: true, dryRun: false, force: false }, bufferIo().io);
  fs.writeFileSync(path.join(target, "CLAUDE.md"), "local claude notes\n");

  const { io, output } = bufferIo();
  const status = await runCheck({ target, harness: undefined }, io);

  assert.equal(status, 0);
  assert.equal(output().stderr, "");
});

test("check does not mutate installed files or manifest", async () => {
  const target = tempTarget();
  await runInit({ target, harness: "codex", yes: true, dryRun: false, force: false }, bufferIo().io);
  const manifestPath = path.join(target, ".agent-work/install.json");
  const agentsPath = path.join(target, "AGENTS.md");
  const beforeManifest = fs.readFileSync(manifestPath, "utf8");
  const beforeAgents = fs.readFileSync(agentsPath, "utf8");
  const beforeManifestMtime = fs.statSync(manifestPath).mtimeMs;
  const beforeAgentsMtime = fs.statSync(agentsPath).mtimeMs;

  const status = await runCheck({ target, harness: undefined }, bufferIo().io);

  assert.equal(status, 0);
  assert.equal(fs.readFileSync(manifestPath, "utf8"), beforeManifest);
  assert.equal(fs.readFileSync(agentsPath, "utf8"), beforeAgents);
  assert.equal(fs.statSync(manifestPath).mtimeMs, beforeManifestMtime);
  assert.equal(fs.statSync(agentsPath).mtimeMs, beforeAgentsMtime);
});

test("check refuses to read installed files through symlinks", async () => {
  const target = tempTarget();
  const outside = tempTarget();
  await runInit({ target, harness: "codex", yes: true, dryRun: false, force: false }, bufferIo().io);
  fs.renameSync(path.join(target, "AGENTS.md"), path.join(outside, "AGENTS.md"));
  fs.symlinkSync(path.join(outside, "AGENTS.md"), path.join(target, "AGENTS.md"));

  const { io, output } = bufferIo();
  const status = await runCheck({ target, harness: undefined }, io);

  assert.equal(status, 1);
  assert.match(output().stderr, /Refusing to read through symlink AGENTS.md/);
});

test("CLI dispatch runs check", async () => {
  const target = tempTarget();
  await runInit({ target, harness: "codex", yes: true, dryRun: false, force: false }, bufferIo().io);

  const result = runCli(["check", "--target", target]);

  assert.equal(result.status, 0);
  assert.match(result.stdout, /Installed portable-agent-workflows files are current/);
});
