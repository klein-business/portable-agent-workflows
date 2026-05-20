# Adoption-First Distribution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an adoption-first distribution layer with an npm-powered `npx portable-agent-workflows init` workflow, project-local harness installation, OpenCode/Claude distribution artifacts, CI coverage, and release documentation.

**Architecture:** Keep `.agent-work/` as the source of truth. Add a small dependency-free Node CLI that copies and verifies project-local artifacts from the installed package into a target repository. Extend generated/static harness outputs for OpenCode and Claude plugin distribution without adding PyPI, Homebrew, Docker, MCP, global config mutation, or automatic publishing.

**Tech Stack:** Node.js 20+ built-ins, npm package metadata, `node:test`, existing Python generator/tests, GitHub Actions, Markdown documentation.

---

## Source Spec

- `docs/superpowers/specs/2026-05-20-adoption-first-distribution-design.md`

## Relevant External Conventions

- Claude Code project commands live in `.claude/commands/`.
- Claude Code plugin marketplaces use `.claude-plugin/marketplace.json`.
- Claude Code plugin components live at the plugin root, with skills under `skills/<name>/SKILL.md`.
- OpenCode project commands live in `.opencode/commands/`.
- OpenCode reads project rules from `AGENTS.md` and supports `CLAUDE.md` as a compatibility fallback.

## File Structure

Create:

- `package.json` - npm package metadata, `bin` mappings, scripts, packaged file allowlist.
- `bin/portable-agent-workflows.mjs` - executable wrapper for the CLI.
- `src/cli.mjs` - argument parsing and command dispatch.
- `src/harnesses.mjs` - harness IDs, display names, stability, and installed file mappings.
- `src/install.mjs` - dry-run, conflict detection, copy, force overwrite, and install manifest logic.
- `src/check.mjs` - install manifest reading and drift/missing-file verification.
- `tests/node/harnesses.test.mjs` - harness metadata tests.
- `tests/node/cli.test.mjs` - CLI help, list, and unknown-command tests.
- `tests/node/init.test.mjs` - `init` behavior in temporary target directories.
- `tests/node/check.test.mjs` - `check` behavior after install, missing files, and drift.
- `tests/node/package.test.mjs` - npm pack content checks.
- `.opencode/commands/shape-idea.md` - OpenCode-native command.
- `.claude-plugin/marketplace.json` - Claude marketplace manifest at repository root.
- `plugins/portable-agent-workflows/.claude-plugin/plugin.json` - Claude plugin manifest.
- `plugins/portable-agent-workflows/skills/shape-idea/SKILL.md` - Claude plugin skill wrapper for idea shaping.
- `docs/distribution.md` - install, check, publish, and safety documentation.

Modify:

- `README.md` - add `npx` quickstart and distribution links.
- `CHANGELOG.md` - add unreleased distribution entry.
- `.github/workflows/ci.yml` - add Node setup and npm checks.
- `tests/test_enterprise_foundation.py` - require distribution docs and package metadata.
- `tests/test_harness_integrations.py` - include OpenCode/Claude distribution artifacts in structural checks.

Do not create:

- PyPI package.
- Homebrew formula.
- Dockerfile.
- MCP server.
- VS Code or Cursor extension package.
- Global installer for `~/.codex`, `~/.claude`, or global Cursor settings.

## Task 1: Add Harness Metadata And npm Skeleton

**Files:**
- Create: `package.json`
- Create: `src/harnesses.mjs`
- Create: `tests/node/harnesses.test.mjs`

- [ ] **Step 1: Write the failing harness metadata test**

Create `tests/node/harnesses.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";

import { ALL_HARNESSES, HARNESS_IDS, resolveHarnesses } from "../../src/harnesses.mjs";

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
```

- [ ] **Step 2: Run the failing test**

Run:

```bash
node --test tests/node/harnesses.test.mjs
```

Expected: FAIL because `src/harnesses.mjs` does not exist.

- [ ] **Step 3: Add package metadata**

Create `package.json`:

```json
{
  "name": "portable-agent-workflows",
  "version": "0.1.0",
  "description": "Portable, harness-agnostic agent workflows with shared skills, durable artifacts, review gates, and native integrations.",
  "license": "MIT",
  "type": "module",
  "bin": {
    "portable-agent-workflows": "./bin/portable-agent-workflows.mjs",
    "paw": "./bin/portable-agent-workflows.mjs"
  },
  "files": [
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
    "src/"
  ],
  "scripts": {
    "test:node": "node --test tests/node/*.test.mjs",
    "pack:check": "npm pack --dry-run --json",
    "check:node": "npm run test:node && npm run pack:check"
  },
  "engines": {
    "node": ">=20"
  }
}
```

- [ ] **Step 4: Add harness metadata implementation**

Create `src/harnesses.mjs`:

```js
export const ALL_HARNESSES = Object.freeze([
  {
    id: "codex",
    displayName: "Codex",
    stability: "stable",
    files: Object.freeze([".agent-work", "AGENTS.md"]),
  },
  {
    id: "claude",
    displayName: "Claude Code",
    stability: "stable",
    files: Object.freeze([".agent-work", "CLAUDE.md", ".claude/commands/shape-idea.md"]),
  },
  {
    id: "cursor",
    displayName: "Cursor",
    stability: "stable",
    files: Object.freeze([".agent-work", ".cursor/rules/agent-work.mdc"]),
  },
  {
    id: "opencode",
    displayName: "OpenCode",
    stability: "documented",
    files: Object.freeze([".agent-work", "AGENTS.md", ".opencode/commands/shape-idea.md"]),
  },
]);

export const HARNESS_IDS = Object.freeze(ALL_HARNESSES.map((harness) => harness.id));

export function resolveHarnesses(value) {
  const requested = value ? value.split(",").map((item) => item.trim()).filter(Boolean) : HARNESS_IDS;
  const selected = [];
  const seen = new Set();

  for (const id of requested) {
    const harness = ALL_HARNESSES.find((candidate) => candidate.id === id);
    if (!harness) {
      throw new Error(`Unknown harness: ${id}`);
    }
    if (!seen.has(id)) {
      seen.add(id);
      selected.push(harness);
    }
  }

  return selected;
}

export function filesForHarnesses(harnesses) {
  return [...new Set(harnesses.flatMap((harness) => harness.files))];
}
```

- [ ] **Step 5: Run the harness metadata test**

Run:

```bash
node --test tests/node/harnesses.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add package.json src/harnesses.mjs tests/node/harnesses.test.mjs
git commit -m "feat: add distribution harness metadata"
```

## Task 2: Add CLI Dispatch, Help, And Harness Listing

**Files:**
- Create: `bin/portable-agent-workflows.mjs`
- Create: `src/cli.mjs`
- Create: `tests/node/cli.test.mjs`

- [ ] **Step 1: Write the failing CLI test**

Create `tests/node/cli.test.mjs`:

```js
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const binPath = path.join(repoRoot, "bin/portable-agent-workflows.mjs");

function runCli(args) {
  return spawnSync(process.execPath, [binPath, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
  });
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
```

- [ ] **Step 2: Run the failing CLI test**

Run:

```bash
node --test tests/node/cli.test.mjs
```

Expected: FAIL because `bin/portable-agent-workflows.mjs` and `src/cli.mjs` do not exist.

- [ ] **Step 3: Add the executable wrapper**

Create `bin/portable-agent-workflows.mjs`:

```js
#!/usr/bin/env node

import { main } from "../src/cli.mjs";

process.exitCode = await main(process.argv.slice(2), {
  cwd: process.cwd(),
  stdout: process.stdout,
  stderr: process.stderr,
});
```

Run:

```bash
chmod +x bin/portable-agent-workflows.mjs
```

- [ ] **Step 4: Add CLI dispatch**

Create `src/cli.mjs`:

```js
import { ALL_HARNESSES } from "./harnesses.mjs";

export function parseArgs(args) {
  const options = {
    command: "help",
    harness: undefined,
    target: process.cwd(),
    yes: false,
    dryRun: false,
    force: false,
  };

  const remaining = [...args];
  if (remaining.length > 0 && !remaining[0].startsWith("-")) {
    options.command = remaining.shift();
  }

  while (remaining.length > 0) {
    const arg = remaining.shift();
    if (arg === "--help" || arg === "-h") {
      options.command = "help";
    } else if (arg === "--harness") {
      options.harness = remaining.shift();
    } else if (arg === "--target") {
      options.target = remaining.shift();
    } else if (arg === "--yes" || arg === "-y") {
      options.yes = true;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--force") {
      options.force = true;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  return options;
}

export function printHelp(stdout) {
  stdout.write(`portable-agent-workflows

Usage:
  portable-agent-workflows init [--harness codex,claude,cursor,opencode] [--target path] [--yes] [--dry-run] [--force]
  portable-agent-workflows check [--harness codex,claude,cursor,opencode] [--target path]
  portable-agent-workflows list-harnesses

Commands:
  init            Install project-local portable workflow files
  check           Verify installed files against this package
  list-harnesses  List supported harness IDs
`);
}

export function listHarnesses(stdout) {
  for (const harness of ALL_HARNESSES) {
    stdout.write(`${harness.id}\t${harness.displayName}\t${harness.stability}\n`);
  }
}

export async function main(args, io) {
  try {
    const options = parseArgs(args);
    if (options.command === "help") {
      printHelp(io.stdout);
      return 0;
    }
    if (options.command === "list-harnesses") {
      listHarnesses(io.stdout);
      return 0;
    }
    if (options.command === "init") {
      const { runInit } = await import("./install.mjs");
      return runInit(options, io);
    }
    if (options.command === "check") {
      const { runCheck } = await import("./check.mjs");
      return runCheck(options, io);
    }

    io.stderr.write(`Unknown command: ${options.command}\n`);
    return 2;
  } catch (error) {
    io.stderr.write(`${error.message}\n`);
    return 2;
  }
}
```

- [ ] **Step 5: Run CLI tests**

Run:

```bash
node --test tests/node/cli.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Run Node test suite**

Run:

```bash
npm run test:node
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add bin/portable-agent-workflows.mjs src/cli.mjs tests/node/cli.test.mjs package.json
git commit -m "feat: add distribution CLI shell"
```

## Task 3: Implement `init` Planning, Dry Run, And Safe Writes

**Files:**
- Create: `src/install.mjs`
- Create: `tests/node/init.test.mjs`

- [ ] **Step 1: Write failing init tests**

Create `tests/node/init.test.mjs`:

```js
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
      stdout: { write: (value) => { stdout += value; } },
      stderr: { write: (value) => { stderr += value; } },
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
```

- [ ] **Step 2: Run failing init tests**

Run:

```bash
node --test tests/node/init.test.mjs
```

Expected: FAIL because `src/install.mjs` does not exist.

- [ ] **Step 3: Implement install planning and writes**

Create `src/install.mjs`:

```js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { filesForHarnesses, resolveHarnesses } from "./harnesses.mjs";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function copyRecursive(source, target) {
  const stat = fs.statSync(source);
  if (stat.isDirectory()) {
    fs.mkdirSync(target, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      copyRecursive(path.join(source, entry), path.join(target, entry));
    }
    return;
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function removeInstallManifestFromActions(actions) {
  return actions.filter((action) => action.relativePath !== ".agent-work/install.json");
}

export function buildInstallActions(options) {
  const harnesses = resolveHarnesses(options.harness);
  const files = filesForHarnesses(harnesses);
  const targetRoot = path.resolve(options.target);
  const actions = files.map((relativePath) => ({
    type: fs.existsSync(path.join(targetRoot, relativePath)) ? "OVERWRITE" : "CREATE",
    relativePath,
    source: path.join(packageRoot, relativePath),
    target: path.join(targetRoot, relativePath),
  }));

  actions.push({
    type: fs.existsSync(path.join(targetRoot, ".agent-work/install.json")) ? "OVERWRITE" : "CREATE",
    relativePath: ".agent-work/install.json",
    source: null,
    target: path.join(targetRoot, ".agent-work/install.json"),
    content: JSON.stringify(
      {
        package: "portable-agent-workflows",
        version: "0.1.0",
        harnesses: harnesses.map((harness) => harness.id),
        files,
      },
      null,
      2,
    ) + "\n",
  });

  return { harnesses, actions };
}

export async function runInit(options, io) {
  const { actions } = buildInstallActions(options);
  const fileActions = removeInstallManifestFromActions(actions);

  for (const action of actions) {
    io.stdout.write(`${action.type} ${action.relativePath}\n`);
  }

  if (options.dryRun) {
    return 0;
  }

  for (const action of fileActions) {
    if (action.type === "OVERWRITE" && !options.force) {
      io.stderr.write(`Refusing to overwrite ${action.relativePath}; rerun with --force.\n`);
      return 1;
    }
  }

  for (const action of actions) {
    if (action.content !== undefined) {
      fs.mkdirSync(path.dirname(action.target), { recursive: true });
      fs.writeFileSync(action.target, action.content, "utf8");
    } else {
      copyRecursive(action.source, action.target);
    }
  }

  return 0;
}
```

- [ ] **Step 4: Run init tests**

Run:

```bash
node --test tests/node/init.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Run all Node tests**

Run:

```bash
npm run test:node
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/install.mjs tests/node/init.test.mjs
git commit -m "feat: add safe project-local init"
```

## Task 4: Implement `check` Verification And Drift Detection

**Files:**
- Create: `src/check.mjs`
- Create: `tests/node/check.test.mjs`

- [ ] **Step 1: Write failing check tests**

Create `tests/node/check.test.mjs`:

```js
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { runCheck } from "../../src/check.mjs";
import { runInit } from "../../src/install.mjs";

function tempTarget() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "paw-check-"));
}

function bufferIo() {
  let stdout = "";
  let stderr = "";
  return {
    io: {
      stdout: { write: (value) => { stdout += value; } },
      stderr: { write: (value) => { stderr += value; } },
    },
    output: () => ({ stdout, stderr }),
  };
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
```

- [ ] **Step 2: Run failing check tests**

Run:

```bash
node --test tests/node/check.test.mjs
```

Expected: FAIL because `src/check.mjs` does not exist.

- [ ] **Step 3: Implement check logic**

Create `src/check.mjs`:

```js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { filesForHarnesses, resolveHarnesses } from "./harnesses.mjs";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readManifest(targetRoot) {
  const manifestPath = path.join(targetRoot, ".agent-work/install.json");
  if (!fs.existsSync(manifestPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
}

function readComparableFiles(root, relativePath) {
  const sourcePath = path.join(root, relativePath);
  if (!fs.existsSync(sourcePath)) {
    return null;
  }
  const stat = fs.statSync(sourcePath);
  if (stat.isDirectory()) {
    const result = new Map();
    for (const entry of fs.readdirSync(sourcePath, { recursive: true })) {
      const fullPath = path.join(sourcePath, entry);
      if (fs.statSync(fullPath).isFile()) {
        const nestedRelative = path.join(relativePath, entry);
        if (nestedRelative === ".agent-work/install.json") {
          continue;
        }
        result.set(nestedRelative, fs.readFileSync(fullPath, "utf8"));
      }
    }
    return result;
  }
  return new Map([[relativePath, fs.readFileSync(sourcePath, "utf8")]]);
}

export async function runCheck(options, io) {
  const targetRoot = path.resolve(options.target);
  const manifest = readManifest(targetRoot);
  const files = options.harness
    ? filesForHarnesses(resolveHarnesses(options.harness))
    : manifest?.files ?? filesForHarnesses(resolveHarnesses(undefined));
  const failures = [];

  for (const relativePath of files) {
    const expected = readComparableFiles(packageRoot, relativePath);
    const actual = readComparableFiles(targetRoot, relativePath);
    if (actual === null) {
      failures.push(`Missing ${relativePath}`);
      continue;
    }
    for (const [nestedRelative, expectedContent] of expected.entries()) {
      if (!actual.has(nestedRelative)) {
        failures.push(`Missing ${nestedRelative}`);
      } else if (actual.get(nestedRelative) !== expectedContent) {
        failures.push(`Drifted ${nestedRelative}`);
      }
    }
  }

  if (failures.length > 0) {
    for (const failure of failures) {
      io.stderr.write(`${failure}\n`);
    }
    return 1;
  }

  io.stdout.write("Installed portable-agent-workflows files are current.\n");
  return 0;
}
```

- [ ] **Step 4: Run check tests**

Run:

```bash
node --test tests/node/check.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Run all Node tests**

Run:

```bash
npm run test:node
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/check.mjs tests/node/check.test.mjs
git commit -m "feat: add installed workflow checks"
```

## Task 5: Add OpenCode And Claude Distribution Artifacts

**Files:**
- Create: `.opencode/commands/shape-idea.md`
- Create: `.claude-plugin/marketplace.json`
- Create: `plugins/portable-agent-workflows/.claude-plugin/plugin.json`
- Create: `plugins/portable-agent-workflows/skills/shape-idea/SKILL.md`
- Modify: `tests/test_harness_integrations.py`

- [ ] **Step 1: Extend structural tests first**

Modify `tests/test_harness_integrations.py`:

```python
GENERATED_FILES = (
    "AGENTS.md",
    "CLAUDE.md",
    ".claude/commands/shape-idea.md",
    ".cursor/rules/agent-work.mdc",
)

DISTRIBUTION_FILES = (
    ".opencode/commands/shape-idea.md",
    ".claude-plugin/marketplace.json",
    "plugins/portable-agent-workflows/.claude-plugin/plugin.json",
    "plugins/portable-agent-workflows/skills/shape-idea/SKILL.md",
)
```

Add this test:

```python
def test_distribution_files_exist_and_reference_agent_work() -> None:
    for relative_path in DISTRIBUTION_FILES:
        path = REPO_ROOT / relative_path
        assert path.exists(), f"missing distribution file {relative_path}"
        text = _read(relative_path)
        assert "portable-agent-workflows" in text

    opencode_command = _read(".opencode/commands/shape-idea.md")
    assert "description:" in opencode_command
    assert ".agent-work/" in opencode_command

    marketplace = _read(".claude-plugin/marketplace.json")
    assert "\"plugins\"" in marketplace
    assert "\"source\": \"./plugins/portable-agent-workflows\"" in marketplace

    plugin_skill = _read("plugins/portable-agent-workflows/skills/shape-idea/SKILL.md")
    assert "name: shape-idea" in plugin_skill
    assert "agent-work-v1" in plugin_skill
```

- [ ] **Step 2: Run failing structural test**

Run:

```bash
uv run pytest tests/test_harness_integrations.py::test_distribution_files_exist_and_reference_agent_work -v
```

Expected: FAIL because distribution files do not exist.

- [ ] **Step 3: Add OpenCode command**

Create `.opencode/commands/shape-idea.md`:

```markdown
---
description: Shape an idea into an approved agent-work-v1 design before implementation
---

Use the Portable Agent Workflows source artifacts in this repository:

- Domain model: `.agent-work/glossary.md`
- Skill: `.agent-work/skills/shape-idea/SKILL.md`
- OpenCode adapter: `.agent-work/adapters/opencode.md`

Follow the `shape-idea` workflow. Do not implement code until the design is approved.
```

- [ ] **Step 4: Add Claude marketplace manifest**

Create `.claude-plugin/marketplace.json`:

```json
{
  "name": "portable-agent-workflows",
  "owner": {
    "name": "klein-business"
  },
  "description": "Portable, harness-agnostic workflow skills for coding agents.",
  "version": "0.1.0",
  "plugins": [
    {
      "name": "portable-agent-workflows",
      "source": "./plugins/portable-agent-workflows",
      "description": "Project-local agent-work-v1 workflow skills and guidance.",
      "version": "0.1.0",
      "author": {
        "name": "Martin Klein"
      }
    }
  ]
}
```

- [ ] **Step 5: Add Claude plugin manifest**

Create `plugins/portable-agent-workflows/.claude-plugin/plugin.json`:

```json
{
  "name": "portable-agent-workflows",
  "version": "0.1.0",
  "description": "Portable agent-work-v1 workflow skills for Claude Code.",
  "author": {
    "name": "Martin Klein"
  },
  "skills": [
    "./skills/shape-idea"
  ]
}
```

- [ ] **Step 6: Add Claude plugin skill wrapper**

Create `plugins/portable-agent-workflows/skills/shape-idea/SKILL.md`:

```markdown
---
name: shape-idea
description: Shape an implementation idea into an approved agent-work-v1 design before code changes.
domain_model: agent-work-v1
---

# Shape Idea

Use Portable Agent Workflows to shape an idea before implementation.

Reference the portable source artifacts:

- Domain model: `.agent-work/glossary.md`
- Canonical skill: `.agent-work/skills/shape-idea/SKILL.md`
- Claude adapter: `.agent-work/adapters/claude.md`

Process:

1. Understand the current repository context.
2. Clarify the implementation intent and constraints.
3. Propose two or three approaches with trade-offs.
4. Present a design and wait for approval.
5. Write the approved design as a repository artifact.
6. Do not implement code before design approval.

This plugin skill is a thin Claude Code entrypoint. The canonical workflow remains in
`.agent-work/skills/shape-idea/SKILL.md`.
```

- [ ] **Step 7: Run structural test**

Run:

```bash
uv run pytest tests/test_harness_integrations.py::test_distribution_files_exist_and_reference_agent_work -v
```

Expected: PASS.

- [ ] **Step 8: Run generator and harness tests**

Run:

```bash
uv run python tools/generate_harness_integrations.py --check
uv run pytest tests/test_harness_integrations.py -v
```

Expected: both PASS.

- [ ] **Step 9: Commit**

```bash
git add .opencode .claude-plugin plugins tests/test_harness_integrations.py
git commit -m "feat: add native agent distribution artifacts"
```

## Task 6: Add Package Content Verification

**Files:**
- Create: `tests/node/package.test.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write package content test**

Create `tests/node/package.test.mjs`:

```js
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

test("npm package includes required distribution files", () => {
  const result = spawnSync("npm", ["pack", "--dry-run", "--json"], {
    cwd: repoRoot,
    encoding: "utf8",
  });

  assert.equal(result.status, 0, result.stderr);
  const [pack] = JSON.parse(result.stdout);
  const files = new Set(pack.files.map((file) => file.path));

  for (const required of [
    "bin/portable-agent-workflows.mjs",
    "src/cli.mjs",
    "src/install.mjs",
    "src/check.mjs",
    ".agent-work/glossary.md",
    "AGENTS.md",
    "CLAUDE.md",
    ".cursor/rules/agent-work.mdc",
    ".opencode/commands/shape-idea.md",
    ".claude-plugin/marketplace.json",
    "plugins/portable-agent-workflows/.claude-plugin/plugin.json",
    "plugins/portable-agent-workflows/skills/shape-idea/SKILL.md",
  ]) {
    assert.ok(files.has(required), `package must include ${required}`);
  }
});
```

- [ ] **Step 2: Run package test**

Run:

```bash
node --test tests/node/package.test.mjs
```

Expected: PASS after Tasks 1-5 are complete.

- [ ] **Step 3: Run npm pack check**

Run:

```bash
npm run pack:check
```

Expected: command exits 0 and prints JSON package contents.

- [ ] **Step 4: Commit**

```bash
git add tests/node/package.test.mjs package.json
git commit -m "test: verify npm package contents"
```

## Task 7: Document Distribution And Quickstart

**Files:**
- Create: `docs/distribution.md`
- Modify: `README.md`
- Modify: `CHANGELOG.md`
- Modify: `tests/test_enterprise_foundation.py`

- [ ] **Step 1: Add failing docs coverage test**

Modify `tests/test_enterprise_foundation.py`:

```python
REQUIRED_ENTERPRISE_FILES = {
    # existing entries remain
    "docs/distribution.md",
    "package.json",
}

REQUIRED_README_LINKS = {
    # existing entries remain
    "docs/distribution.md",
}
```

Add:

```python
def test_distribution_docs_describe_safe_project_local_install() -> None:
    docs = _read("docs/distribution.md")

    for term in (
        "npx portable-agent-workflows init",
        "--dry-run",
        "--force",
        "project-local",
        "does not write to global",
        "PyPI",
        "Homebrew",
        "MCP",
    ):
        assert term in docs
```

- [ ] **Step 2: Run failing docs test**

Run:

```bash
uv run pytest tests/test_enterprise_foundation.py::test_distribution_docs_describe_safe_project_local_install -v
```

Expected: FAIL because `docs/distribution.md` does not exist.

- [ ] **Step 3: Create distribution documentation**

Create `docs/distribution.md`:

````markdown
# Distribution

Portable Agent Workflows is distributed as project-local agent workflow artifacts.
The npm package is an initializer, not a runtime framework.

## Quickstart

```bash
npx portable-agent-workflows init --harness codex,claude,cursor,opencode --yes
npx portable-agent-workflows check
```

## Preview Changes

```bash
npx portable-agent-workflows init --harness codex,claude --dry-run
```

`--dry-run` prints planned file actions without writing files.

## Overwrite Policy

Existing files are not overwritten by default. Use `--force` only after reviewing
the planned changes:

```bash
npx portable-agent-workflows init --harness codex --force
```

## Installed Files

The installer writes project-local files such as:

- `.agent-work/`
- `AGENTS.md`
- `CLAUDE.md`
- `.claude/commands/shape-idea.md`
- `.cursor/rules/agent-work.mdc`
- `.opencode/commands/shape-idea.md`

It also writes `.agent-work/install.json` so `check` can verify the selected
harnesses on subsequent runs.

## Safety Boundary

The installer does not write to global Codex, Claude, Cursor, OpenCode, Git, or
GitHub settings. It does not write to global dotfiles such as `~/.codex`,
`~/.claude`, or global Cursor settings. It does not create Git commits or mutate
GitHub repository settings.

## Deferred Channels

Phase 1 intentionally does not publish a PyPI package, Homebrew formula, Docker
image, VS Code or Cursor extension, MCP server, or global installer. Those channels
are future candidates after the project-local installer contract is proven.
````

- [ ] **Step 4: Add README quickstart link**

Modify `README.md` after `## Quickstart`:

````markdown
Install project-local workflow files into another repository:

```bash
npx portable-agent-workflows init --harness codex,claude,cursor,opencode --yes
npx portable-agent-workflows check
```

See [Distribution][distribution] for safety rules, dry runs, overwrite behavior,
and publishing boundaries.
````

Add link reference:

```markdown
[distribution]: docs/distribution.md
```

- [ ] **Step 5: Update changelog**

Modify `CHANGELOG.md` under `## Unreleased` or create that section:

```markdown
## Unreleased

### Added

- Designed and planned adoption-first distribution with npm `npx` initialization,
  project-local install safety, OpenCode command distribution, and Claude plugin
  marketplace metadata.
```

- [ ] **Step 6: Run docs tests**

Run:

```bash
uv run pytest tests/test_enterprise_foundation.py -v
uv run python tools/check_markdown_links.py
```

Expected: both PASS.

- [ ] **Step 7: Commit**

```bash
git add README.md CHANGELOG.md docs/distribution.md tests/test_enterprise_foundation.py
git commit -m "docs: add distribution quickstart"
```

## Task 8: Add CI Node Verification And Full Local Gates

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Modify CI workflow**

In `.github/workflows/ci.yml`, after dependency installation and before Python tests, add:

```yaml
      - name: Set up Node
        uses: actions/setup-node@v6
        with:
          node-version: '20'
          cache: npm

      - name: Run Node distribution checks
        run: npm run check:node
```

- [ ] **Step 2: Run local Node checks**

Run:

```bash
npm run check:node
```

Expected: PASS.

- [ ] **Step 3: Run existing local gates**

Run:

```bash
uv run python tools/generate_harness_integrations.py --check
uv run pytest tests/ -v
uv run ruff check tests/ tools/
uv run ruff format --check tests/ tools/
uv run python tools/check_markdown_links.py
git diff --check
```

Expected: all PASS.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add node distribution checks"
```

## Task 9: Smoke Test npm Installer Locally

**Files:**
- No source files expected unless this smoke test reveals a defect.

- [ ] **Step 1: Pack the npm package locally**

Run:

```bash
npm pack --json
```

Expected: exits 0 and writes a `portable-agent-workflows-0.1.0.tgz` tarball.

- [ ] **Step 2: Install into a clean temporary repository**

Run:

```bash
tmpdir="$(mktemp -d)"
cd "$tmpdir"
git init
npm exec --yes "/Users/Martin/git/portable-agent-workflows/portable-agent-workflows-0.1.0.tgz" -- init --harness codex,claude,cursor,opencode --yes
npm exec --yes "/Users/Martin/git/portable-agent-workflows/portable-agent-workflows-0.1.0.tgz" -- check
git status --short
```

Expected:

- `init` exits 0.
- `check` exits 0.
- `git status --short` shows project-local files under `.agent-work/`, `.claude/`,
  `.cursor/`, `.opencode/`, plus `AGENTS.md` and `CLAUDE.md`.

- [ ] **Step 3: Remove local tarball**

Run from repository root:

```bash
rm -f portable-agent-workflows-0.1.0.tgz
git status --short
```

Expected: no tarball remains in git status.

- [ ] **Step 4: Record smoke result in commit if fixes were needed**

If no source changes were needed, do not create a commit for this task.

## Task 10: Prepare Manual Publishing Checklist

**Files:**
- Modify: `docs/distribution.md`
- Modify: `docs/governance/release-policy.md`

- [ ] **Step 1: Add release checklist docs**

Append to `docs/distribution.md`:

```markdown
## Manual Publishing Checklist

1. Confirm `main` is green.
2. Confirm `CHANGELOG.md` includes the release entry.
3. Run `npm run check:node`.
4. Run the Python validation gates from the README.
5. Run `npm pack --json` and inspect package contents.
6. Run the local tarball smoke test in a clean temporary repository.
7. Publish npm manually with `npm publish --access public`.
8. Tag the release with `git tag v0.1.0`.
9. Push the tag with `git push origin v0.1.0`.
10. Publish GitHub release notes from `CHANGELOG.md`.
```

- [ ] **Step 2: Update release policy**

Add this bullet to `docs/governance/release-policy.md` under `## Release Gates`:

```markdown
- npm package contents and local tarball smoke test verified for distribution releases
```

Add this release step after changelog update:

```markdown
3. Run npm package checks and a local tarball smoke test for distribution releases.
```

Renumber the following release steps.

- [ ] **Step 3: Run docs verification**

Run:

```bash
uv run python tools/check_markdown_links.py
git diff --check
```

Expected: both PASS.

- [ ] **Step 4: Commit**

```bash
git add docs/distribution.md docs/governance/release-policy.md
git commit -m "docs: add manual distribution publishing checklist"
```

## Final Verification

Run all local gates:

```bash
npm run check:node
uv run python tools/generate_harness_integrations.py --check
uv run pytest tests/ -v
uv run ruff check tests/ tools/
uv run ruff format --check tests/ tools/
uv run python tools/check_markdown_links.py
git diff --check
```

Expected: all PASS.

Push `main` only after local gates pass and the user approves direct push or PR flow.

## Self-Review

- Spec coverage: npm `npx` init, `check`, `list-harnesses`, project-local writes, dry run, force overwrite, OpenCode command, Claude marketplace/plugin artifacts, GitHub release preparation, npm package checks, CI, and deferred publishing channels are covered.
- Placeholder scan: no placeholder tokens, no omitted command, no hidden global install, and no automatic publish step.
- Type consistency: harness IDs are `codex`, `claude`, `cursor`, and `opencode` across tests, CLI flags, installer manifest, package checks, and documentation.
