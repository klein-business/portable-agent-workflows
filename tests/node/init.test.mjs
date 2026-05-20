import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { runInit } from "../../src/install.mjs";

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
