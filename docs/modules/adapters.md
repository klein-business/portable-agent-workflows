---
type: documentation
entity: module
module: "adapters"
version: 1.0
---

# Module: adapters

> Part of [Portable Agent Workflows](../overview.md)

## Overview

The adapters module maps `agent-work-v1` roles and capabilities to specific harness execution patterns. It lets portable skills stay neutral while still giving Codex, OpenCode, Claude Code, and Cursor enough operational guidance.

### Responsibility

This module is responsible for harness-specific role mapping, capability mapping, and boundary rules. It is not responsible for changing glossary definitions or embedding concrete harness tool names into portable skills.

### Dependencies

| Dependency | Type | Purpose |
|-----------|------|---------|
| Domain Model | module | Supplies the role and capability vocabulary that adapters map. |
| Skills | module | Provides neutral workflows that adapters make executable in a harness. |
| Validation Tests | module | Verifies required adapter sections and role coverage. |

## Structure

| Path | Type | Purpose |
|------|------|---------|
| `.agent-work/adapters/` | dir | Contains harness-specific mappings. |
| `.agent-work/adapters/codex.md` | file | Maps neutral roles and capabilities to Codex execution patterns. |
| `.agent-work/adapters/opencode.md` | file | Maps neutral roles and capabilities to OpenCode execution patterns. |
| `.agent-work/adapters/claude.md` | file | Maps neutral roles and capabilities to Claude Code execution patterns. |
| `.agent-work/adapters/cursor.md` | file | Maps neutral roles and capabilities to Cursor execution patterns. |

## Key Symbols

| Symbol | Kind | Visibility | Location | Purpose |
|--------|------|------------|----------|---------|
| `Codex Adapter` | adapter | public | `.agent-work/adapters/codex.md:10` | Defines Codex-specific execution mapping for `agent-work-v1`. |
| `Codex Role Mapping` | section | public | `.agent-work/adapters/codex.md:14` | Maps Orchestrator, Explorer, Planner, Implementer, Reviewer, and Maintainer into Codex patterns. |
| `Codex Capability Mapping` | section | public | `.agent-work/adapters/codex.md:23` | Maps filesystem, shell, subagents, web, browser, and git capabilities. |
| `Codex Boundaries` | section | public | `.agent-work/adapters/codex.md:32` | Keeps portable skills free of Codex tool names and constrains Git and review ownership. |
| `OpenCode Adapter` | adapter | public | `.agent-work/adapters/opencode.md:10` | Defines OpenCode-specific execution mapping for `agent-work-v1`. |
| `OpenCode Role Mapping` | section | public | `.agent-work/adapters/opencode.md:14` | Maps neutral roles into OpenCode execution responsibilities. |
| `OpenCode Capability Mapping` | section | public | `.agent-work/adapters/opencode.md:23` | Maps filesystem, shell, delegation, web, git, and artifact-writing capabilities. |
| `OpenCode Boundaries` | section | public | `.agent-work/adapters/opencode.md:32` | Keeps adapter details out of portable skills and keeps Git under Orchestrator ownership. |
| `Claude Adapter` | adapter | public | `.agent-work/adapters/claude.md:10` | Defines Claude Code-specific execution mapping for `agent-work-v1`. |
| `Claude Role Mapping` | section | public | `.agent-work/adapters/claude.md:14` | Maps neutral roles into Claude Code execution responsibilities. |
| `Claude Capability Mapping` | section | public | `.agent-work/adapters/claude.md:23` | Maps filesystem, shell, commands, memory, subagents, and git capabilities. |
| `Cursor Adapter` | adapter | public | `.agent-work/adapters/cursor.md:10` | Defines Cursor-specific execution mapping for `agent-work-v1`. |
| `Cursor Role Mapping` | section | public | `.agent-work/adapters/cursor.md:14` | Maps neutral roles into Cursor execution responsibilities. |
| `Cursor Capability Mapping` | section | public | `.agent-work/adapters/cursor.md:23` | Maps filesystem, shell, rules, context, inline-edit, and git capabilities. |

## Data Flow

A portable skill names neutral roles and required capabilities. The active harness uses its adapter file to translate those roles into local execution behavior. Work output then flows back into `.agent-work/` artifacts using the shared domain model.

## Configuration

No environment variables or feature flags are used. Harness selection is operational: choose the adapter that matches the agent runtime.

## Inventory Notes

- **Coverage**: full
- **Notes**: Inventory covers existing adapter files and the sections that tests require: role mapping, capability mapping, and boundaries.
