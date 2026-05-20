import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { filesForHarnesses, resolveHarnesses } from "../../src/harnesses.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function packageFiles() {
  const result = spawnSync("npm", ["pack", "--dry-run", "--json"], {
    cwd: repoRoot,
    encoding: "utf8",
  });

  assert.equal(result.status, 0, result.stderr);
  const [pack] = JSON.parse(result.stdout);
  return pack.files.map((file) => file.path);
}

test("npm package includes installable harness files and runtime distribution files", () => {
  const packageFilePaths = packageFiles();
  const files = new Set(packageFilePaths);

  for (const required of [
    ...filesForHarnesses(resolveHarnesses(undefined)),
    "bin/portable-agent-workflows.mjs",
    "src/cli.mjs",
    "src/harnesses.mjs",
    "src/install.mjs",
    "src/check.mjs",
    ".claude-plugin/marketplace.json",
    "plugins/portable-agent-workflows/.claude-plugin/plugin.json",
    "plugins/portable-agent-workflows/skills/shape-idea/SKILL.md",
  ]) {
    const includesRequired = required.endsWith("/")
      ? packageFilePaths.some((file) => file.startsWith(required))
      : files.has(required) || packageFilePaths.some((file) => file.startsWith(`${required}/`));

    assert.ok(includesRequired, `package must include ${required}`);
  }
});

test("npm package excludes development-only files", () => {
  const packageFilePaths = packageFiles();

  for (const excluded of [
    "tests/",
    "docs/",
    ".github/",
    "pyproject.toml",
    "uv.lock",
    ".pytest_cache/",
    ".ruff_cache/",
    ".venv/",
    ".worktrees/",
  ]) {
    assert.ok(
      !packageFilePaths.some((file) => file === excluded || file.startsWith(excluded)),
      `package must not include ${excluded}`,
    );
  }
});
