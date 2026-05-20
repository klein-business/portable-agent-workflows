---
type: documentation
entity: feature
feature: "generated-harness-integration"
version: 1.1
---

# Feature: generated-harness-integration

> Part of [Portable Agent Workflows](../overview.md)

## Summary

Generated Harness Integration creates native entrypoint files for Codex, Claude Code, and Cursor from `.agent-work/` source artifacts so harness-specific context stays current without duplicating the portable model.

## How It Works

The generator reads required source artifacts, renders checked-in templates, and writes generated files with a marker header. In `--check` mode it compares rendered output with files on disk and fails if any generated file is stale.

### User Flow

1. A contributor changes `.agent-work/` skills, adapters, or glossary files.
2. The contributor runs `uv run python tools/generate_harness_integrations.py`.
3. The contributor runs `uv run python tools/generate_harness_integrations.py --check`.
4. Codex, Claude Code, and Cursor consume their native generated entrypoints.

### Technical Flow

1. `tools/generate_harness_integrations.py` verifies required source files exist.
2. It renders templates from `tools/harness_templates/`.
3. It writes `AGENTS.md`, `CLAUDE.md`, `.claude/commands/shape-idea.md`, and `.cursor/rules/agent-work.mdc`.
4. Tests verify the generated files are present, marked, current, and linked back to `.agent-work/`.

## Implementation

| Module | Symbols | Role |
|--------|---------|------|
| [harness-generator](../modules/harness-generator.md) | `GENERATED_FILES`, `REQUIRED_SOURCES`, `render_all`, `write_all`, `check_all`, `main` | Implements rendering, writing, checking, and CLI behavior. |
| [adapters](../modules/adapters.md) | `Codex Adapter`, `Claude Adapter`, `Cursor Adapter` | Defines harness-specific mappings consumed by generated files. |
| [skills](../modules/skills.md) | `shape-idea`, `shape-spec`, `create-phased-plan` | Defines the workflows referenced by generated files. |
| [validation-tests](../modules/validation-tests.md) | `test_generated_harness_files_are_current` | Prevents generated-file drift. |

## Configuration

No environment variables are required. Run the generator from the repository root with Python.

## Edge Cases & Limitations

- Generated files are intentionally thin and do not contain full skill bodies.
- The repository does not install global Claude, Codex, or Cursor settings.
- Manual edits to generated files are overwritten by the generator and caught by currentness tests.

## Related Features

- [Harness Adapters](harness-adapters.md)
- [Portable Skill Lifecycle](portable-skill-lifecycle.md)
- [Artifact Validation](artifact-validation.md)
