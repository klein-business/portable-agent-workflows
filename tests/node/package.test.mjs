import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

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
