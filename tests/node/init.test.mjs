import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { buildInstallActions, runInit } from "../../src/install.mjs";

function tempTarget() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "paw-init-"));
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

test("dry-run reports planned files without writing them", async () => {
  const target = tempTarget();
  const { io, output } = bufferIo();
  const status = await runInit(
    { target, harness: "codex", yes: true, dryRun: true, force: false },
    io,
  );

  assert.equal(status, 0);
  assert.match(output().stdout, /CREATE AGENTS.md/);
  assert.equal(fs.existsSync(path.join(target, "AGENTS.md")), false);
});

test("init installs selected harness files and manifest", async () => {
  const target = tempTarget();
  const { io } = bufferIo();
  const status = await runInit(
    { target, harness: "codex,claude", yes: true, dryRun: false, force: false },
    io,
  );

  assert.equal(status, 0);
  assert.equal(fs.existsSync(path.join(target, "AGENTS.md")), true);
  assert.equal(fs.existsSync(path.join(target, "CLAUDE.md")), true);
  assert.equal(fs.existsSync(path.join(target, ".agent-work/install.json")), true);

  const manifest = JSON.parse(
    fs.readFileSync(path.join(target, ".agent-work/install.json"), "utf8"),
  );
  assert.deepEqual(manifest.harnesses, ["codex", "claude"]);
});

test("init refuses to overwrite existing files without force", async () => {
  const target = tempTarget();
  fs.writeFileSync(path.join(target, "AGENTS.md"), "local instructions\n");
  const { io, output } = bufferIo();
  const status = await runInit(
    { target, harness: "codex", yes: true, dryRun: false, force: false },
    io,
  );

  assert.equal(status, 1);
  assert.match(output().stderr, /Refusing to overwrite AGENTS.md/);
  assert.equal(fs.readFileSync(path.join(target, "AGENTS.md"), "utf8"), "local instructions\n");
});

test("init refuses an existing file symlink even with force", async () => {
  const target = tempTarget();
  const outside = tempTarget();
  const outsideFile = path.join(outside, "AGENTS.md");
  fs.writeFileSync(outsideFile, "external instructions\n");
  fs.symlinkSync(outsideFile, path.join(target, "AGENTS.md"));

  const { io, output } = bufferIo();
  const status = await runInit(
    { target, harness: "codex", yes: true, dryRun: false, force: true },
    io,
  );

  assert.equal(status, 1);
  assert.match(output().stderr, /Refusing to write through symlink AGENTS.md/);
  assert.equal(fs.readFileSync(outsideFile, "utf8"), "external instructions\n");
});

test("init refuses an existing directory symlink even with force", async () => {
  const target = tempTarget();
  const outside = tempTarget();
  fs.mkdirSync(path.join(outside, ".agent-work"));
  const outsideFile = path.join(outside, ".agent-work", "external.txt");
  fs.writeFileSync(outsideFile, "external state\n");
  fs.symlinkSync(path.join(outside, ".agent-work"), path.join(target, ".agent-work"));

  const { io, output } = bufferIo();
  const status = await runInit(
    { target, harness: "codex", yes: true, dryRun: false, force: true },
    io,
  );

  assert.equal(status, 1);
  assert.match(output().stderr, /Refusing to write through symlink \.agent-work/);
  assert.equal(fs.readFileSync(outsideFile, "utf8"), "external state\n");
  assert.equal(fs.existsSync(path.join(outside, ".agent-work", "install.json")), false);
});

test("planned action targets stay within the resolved target root", () => {
  const parent = tempTarget();
  const target = path.join(parent, "nested", "..", "project");
  const { actions } = buildInstallActions({ target, harness: "codex" });
  const targetRoot = path.resolve(target);

  for (const action of actions) {
    const relative = path.relative(targetRoot, action.target);
    assert.equal(
      relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative)),
      true,
      `${action.relativePath} escapes ${targetRoot}`,
    );
  }
});
