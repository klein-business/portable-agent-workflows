---
title: Adoption-First Distribution Design
status: approved
created: 2026-05-20
domain_model: agent-work-v1
---

# Adoption-First Distribution Design

## Context

Portable Agent Workflows is now public, MIT licensed, and has a complete GitHub
Community Profile. The repository is currently a documentation-and-artifact model
with `.agent-work/` as the source of truth, generated native entrypoints for
Codex, Claude Code, and Cursor, and adapter documentation for OpenCode.

The next product step is distribution. The goal is to make adoption easy without
turning the repository into a runtime framework, server, IDE extension, or global
configuration manager.

## Decision

Use an adoption-first distribution strategy:

1. Publish a GitHub release.
2. Publish an npm package that exposes `npx portable-agent-workflows init`.
3. Add native agent distribution artifacts for Codex, Claude Code, Cursor, and
   OpenCode.
4. Defer PyPI, Homebrew, Docker, VS Code/Cursor extensions, MCP server work, and
   global installers until there is a clearer product reason.

This keeps the first public distribution path narrow, useful, and easy to trust.

## Distribution Target

The repository remains the source of truth for `agent-work-v1`. The distribution
layer installs project-local workflow artifacts into a target repository.

Primary command:

```bash
npx portable-agent-workflows init
```

Non-interactive harness selection:

```bash
npx portable-agent-workflows init --harness codex,claude,cursor,opencode --yes
```

The installer writes only project-local files. It does not mutate global Codex,
Claude, Cursor, OpenCode, Git, or GitHub settings.

## Phase 1 Scope

Phase 1 includes one official installation package and native agent distribution
files.

### npm Package

Package name:

- `portable-agent-workflows`

Executable names:

- `portable-agent-workflows`
- optional short alias: `paw`

Commands:

- `init`
- `check`
- `list-harnesses`

The npm package is a project initializer. It is not a runtime library.

### Harness Outputs

The installer supports:

- Codex: `AGENTS.md`
- Claude Code: `CLAUDE.md` and `.claude/commands/shape-idea.md`
- Cursor: `.cursor/rules/agent-work.mdc`
- OpenCode: OpenCode-native command or skill files, plus an `AGENTS.md` fallback
- Shared source artifacts: `.agent-work/`

The generated or copied outputs must continue to point back to `.agent-work/`
rather than redefining the portable domain model.

### GitHub Release

Publish a `v0.1.0` release after:

- `CHANGELOG.md` is updated
- local verification passes
- GitHub CI is green
- package contents are inspected
- a smoke test installs into a temporary target repository

Release notes must state supported harnesses, the `npx` quickstart, and known
limitations.

## Explicit Non-Goals For Phase 1

The following are intentionally out of scope for Phase 1:

- PyPI package
- Homebrew formula
- Docker image
- VS Code or Cursor extension marketplace package
- MCP server
- global installer that writes to `~/.codex`, `~/.claude`, or global Cursor
  settings
- automatic publishing to npm or GitHub without explicit manual approval

These are not rejected permanently. They are deferred because they would create
additional product surfaces and release obligations before the project-local
installer contract is proven.

## CLI Behavior

`init`:

- defaults to the current working directory
- accepts `--target <path>`
- accepts `--harness <list>`
- prompts for harnesses when no harness flag is provided
- supports `--yes` for non-interactive defaults
- supports `--dry-run`
- refuses to overwrite existing files unless `--force` is provided
- prints exact file actions before writing
- reports conflicts clearly

`check`:

- verifies `.agent-work/` exists
- verifies selected harness files exist
- verifies generated or copied files match the package source for the current
  version
- reports drift without mutating files

`list-harnesses`:

- prints supported harness IDs and display names
- marks stability level where available

## Safety Rules

The CLI must:

- avoid network access except for npm package installation itself
- avoid global dotfile writes
- avoid secrets
- avoid GitHub repository setting mutations
- avoid Git commits
- make all writes visible as normal project file changes
- be safe to run in CI with explicit flags

## Testing Strategy

Tests must cover:

- CLI help and command parsing
- `init` into an empty temporary directory
- `init` with selected harnesses
- `init --dry-run`
- conflict handling without `--force`
- overwrite behavior with `--force`
- `check` passing after install
- `check` detecting missing or drifted files
- package contents include required source artifacts and templates
- existing Python validation still passes

CI should add Node/npm checks while keeping the existing Python checks.

## Publishing Order

1. Add distribution documentation and README quickstart.
2. Add npm package metadata, CLI implementation, and package tests.
3. Add or complete OpenCode and Claude marketplace distribution artifacts.
4. Run full local and remote verification.
5. Manually publish npm package.
6. Tag and publish GitHub release `v0.1.0`.
7. Update GitHub topics and launch copy.

## Acceptance Criteria

A new user can run this in a clean test repository:

```bash
npx portable-agent-workflows init --harness codex,claude,cursor,opencode --yes
npx portable-agent-workflows check
```

The command installs project-local workflow files, `check` passes, and `git diff`
shows the exact artifacts added to the target repository.

## Future Phases

Phase 2 candidates:

- PyPI package if a Python CLI or Python project workflow becomes a real user
  need
- Homebrew if the CLI becomes a frequently used global tool
- MCP server if the project offers live validation, generation, or inspection
  tools through MCP
- explicit global install mode only with a visible `--global` flag and strong
  confirmation
