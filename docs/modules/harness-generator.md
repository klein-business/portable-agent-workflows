---
type: documentation
entity: module
module: "harness-generator"
version: 1.0
---

# Module: harness-generator

> Part of [Portable Agent Workflows](../overview.md)

## Overview

The harness-generator module renders native integration files for Codex, Claude Code, and Cursor from `.agent-work/` source artifacts and checked-in templates.

### Responsibility

This module is responsible for deterministic generated-file creation, generated-file currentness checks, template rendering, and missing-source reporting. It is not responsible for defining the domain model or changing portable workflow semantics.

### Dependencies

| Dependency | Type | Purpose |
|-----------|------|---------|
| Domain Model | module | Supplies the glossary path required by generated files. |
| Adapters | module | Supplies Codex, Claude Code, and Cursor adapter paths rendered into native entrypoints. |
| Skills | module | Supplies `shape-idea`, `shape-spec`, and `create-phased-plan` paths rendered into native entrypoints. |
| Validation Tests | module | Runs generator currentness checks and generated-file assertions. |
| Python standard library | library | Provides `argparse`, `dataclasses`, `pathlib`, and `sys`. |

## Structure

| Path | Type | Purpose |
|------|------|---------|
| `tools/` | dir | Contains repository maintenance tooling. |
| `tools/generate_harness_integrations.py` | file | Generates and checks native harness integration files. |
| `tools/harness_templates/` | dir | Contains templates consumed by the generator. |
| `tools/harness_templates/agents.md.tmpl` | file | Template for root `AGENTS.md`. |
| `tools/harness_templates/claude.md.tmpl` | file | Template for root `CLAUDE.md`. |
| `tools/harness_templates/claude-shape-idea.md.tmpl` | file | Template for `.claude/commands/shape-idea.md`. |
| `tools/harness_templates/cursor-agent-work.mdc.tmpl` | file | Template for `.cursor/rules/agent-work.mdc`. |
| `AGENTS.md` | file | Generated Codex and Cursor fallback entrypoint. |
| `CLAUDE.md` | file | Generated Claude Code project memory entrypoint. |
| `.claude/commands/shape-idea.md` | file | Generated Claude Code command for idea shaping. |
| `.cursor/rules/agent-work.mdc` | file | Generated Cursor project rule. |

## Key Symbols

| Symbol | Kind | Visibility | Location | Purpose |
|--------|------|------------|----------|---------|
| `REPO_ROOT` | const | internal | `tools/generate_harness_integrations.py:8` | Locates the repository root relative to the generator script. |
| `TEMPLATE_ROOT` | const | internal | `tools/generate_harness_integrations.py:9` | Locates checked-in harness templates. |
| `MARKER` | const | public | `tools/generate_harness_integrations.py:10` | Marks generated files as generator-owned. |
| `GeneratedFile` | dataclass | internal | `tools/generate_harness_integrations.py:13` | Pairs a template name with an output path. |
| `GENERATED_FILES` | const | internal | `tools/generate_harness_integrations.py:19` | Defines generated output ordering and template mappings. |
| `REQUIRED_SOURCES` | const | internal | `tools/generate_harness_integrations.py:26` | Lists source artifacts required before rendering. |
| `_read` | function | internal | `tools/generate_harness_integrations.py:37` | Reads required files and raises a clear missing-file error. |
| `_render` | function | internal | `tools/generate_harness_integrations.py:43` | Renders one template with deterministic path context. |
| `render_all` | function | public | `tools/generate_harness_integrations.py:60` | Validates required sources and renders all generated-file content. |
| `write_all` | function | public | `tools/generate_harness_integrations.py:68` | Creates parent directories and writes generated files. |
| `check_all` | function | public | `tools/generate_harness_integrations.py:74` | Returns generated files that are missing or stale. |
| `main` | function | public | `tools/generate_harness_integrations.py:82` | Implements CLI write mode, `--check`, and exit codes. |

## Data Flow

The generator verifies required `.agent-work/` source artifacts, renders each template with fixed repository-relative paths, then either writes generated files or checks whether files on disk match expected output.

## Configuration

No environment variables are required. Run from the repository root:

```bash
uv run python tools/generate_harness_integrations.py
uv run python tools/generate_harness_integrations.py --check
```

## Inventory Notes

- **Coverage**: full
- **Notes**: Inventory covers generator code, templates, and generated outputs because they change together.
