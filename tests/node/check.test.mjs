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

function overwriteManifestFiles(target, files) {
  const manifestPath = path.join(target, ".agent-work/install.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  fs.writeFileSync(manifestPath, JSON.stringify({ ...manifest, files }, null, 2) + "\n");
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

test("check rejects manifest file entries that escape the install set", async () => {
  const invalidEntries = [
    { files: ["../AGENTS.md"], message: /Invalid manifest file entry \.\.\/AGENTS\.md/ },
    { files: ["/AGENTS.md"], message: /Invalid manifest file entry \/AGENTS\.md/ },
    { files: [""], message: /Invalid manifest file entry/ },
    { files: [42], message: /Invalid manifest file entry/ },
    { files: ["README.md"], message: /Unknown manifest file entry README\.md/ },
  ];

  for (const { files, message } of invalidEntries) {
    const target = tempTarget();
    await runInit({ target, harness: "codex", yes: true, dryRun: false, force: false }, bufferIo().io);
    const manifestPath = path.join(target, ".agent-work/install.json");
    const beforeManifest = fs.readFileSync(manifestPath, "utf8");
    overwriteManifestFiles(target, files);
    const tamperedManifest = fs.readFileSync(manifestPath, "utf8");

    const { io, output } = bufferIo();
    const status = await runCheck({ target, harness: undefined }, io);

    assert.notEqual(tamperedManifest, beforeManifest);
    assert.equal(status, 1);
    assert.match(output().stderr, message);
    assert.equal(fs.readFileSync(manifestPath, "utf8"), tamperedManifest);
  }
});

test("check refuses broken symlinks at installed paths", async () => {
  const target = tempTarget();
  await runInit({ target, harness: "codex", yes: true, dryRun: false, force: false }, bufferIo().io);
  fs.rmSync(path.join(target, "AGENTS.md"));
  fs.symlinkSync(path.join(target, "missing-target.md"), path.join(target, "AGENTS.md"));

  const { io, output } = bufferIo();
  const status = await runCheck({ target, harness: undefined }, io);

  assert.equal(status, 1);
  assert.match(output().stderr, /Refusing to read through symlink AGENTS.md/);
  assert.equal(fs.lstatSync(path.join(target, "AGENTS.md")).isSymbolicLink(), true);
});

test("check refuses an install manifest symlink to an outside file", async () => {
  const target = tempTarget();
  const outside = tempTarget();
  await runInit({ target, harness: "codex", yes: true, dryRun: false, force: false }, bufferIo().io);
  const manifestPath = path.join(target, ".agent-work/install.json");
  const outsideManifestPath = path.join(outside, "install.json");
  fs.renameSync(manifestPath, outsideManifestPath);
  fs.symlinkSync(outsideManifestPath, manifestPath);

  const { io, output } = bufferIo();
  const status = await runCheck({ target, harness: undefined }, io);

  assert.equal(status, 1);
  assert.match(output().stderr, /Refusing to read through symlink \.agent-work\/install\.json/);
  assert.doesNotMatch(output().stdout, /Installed portable-agent-workflows files are current/);
  assert.equal(fs.lstatSync(manifestPath).isSymbolicLink(), true);
});

test("check refuses a broken install manifest symlink", async () => {
  const target = tempTarget();
  await runInit({ target, harness: "codex", yes: true, dryRun: false, force: false }, bufferIo().io);
  const manifestPath = path.join(target, ".agent-work/install.json");
  fs.rmSync(manifestPath);
  fs.symlinkSync(path.join(target, ".agent-work/missing-install.json"), manifestPath);

  const { io, output } = bufferIo();
  const status = await runCheck({ target, harness: undefined }, io);

  assert.equal(status, 1);
  assert.match(output().stderr, /Refusing to read through symlink \.agent-work\/install\.json/);
  assert.doesNotMatch(output().stdout, /Installed portable-agent-workflows files are current/);
  assert.equal(fs.lstatSync(manifestPath).isSymbolicLink(), true);
});

test("CLI dispatch runs check", async () => {
  const target = tempTarget();
  await runInit({ target, harness: "codex", yes: true, dryRun: false, force: false }, bufferIo().io);

  const result = runCli(["check", "--target", target]);

  assert.equal(result.status, 0);
  assert.match(result.stdout, /Installed portable-agent-workflows files are current/);
});
