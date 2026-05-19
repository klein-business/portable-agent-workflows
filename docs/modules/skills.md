---
type: documentation
entity: module
module: "skills"
version: 1.0
---

# Module: skills

> Part of [Portable Agent Work Model](../overview.md)

## Overview

The skills module contains the V1 portable work instructions. Each skill is a Markdown artifact with frontmatter, role ownership, gate declarations, expected outputs, adapter notes, and failure modes.

### Responsibility

This module is responsible for reusable workflow behavior. Skills must describe intent, roles, artifacts, and gates without naming concrete harness tools. Harness-specific execution remains in adapters.

### Dependencies

| Dependency | Type | Purpose |
|-----------|------|---------|
| Domain Model | module | Supplies `agent-work-v1`, roles, artifact kinds, and gate vocabulary. |
| Adapters | module | Translates skill roles and capabilities into concrete harness execution. |
| Lifecycle Example | module | Demonstrates the artifact types that skills create and update. |
| Validation Tests | module | Verifies skill presence, metadata keys, required sections, gate definitions, and forbidden harness-specific terms. |

## Structure

| Path | Type | Purpose |
|------|------|---------|
| `.agent-work/skills/` | dir | Root directory for portable skill definitions. |
| `.agent-work/skills/create-handover/SKILL.md` | file | Captures session state for later continuation. |
| `.agent-work/skills/create-phased-plan/SKILL.md` | file | Converts an approved spec into plan, phase, and todo artifacts. |
| `.agent-work/skills/define-domain-model/SKILL.md` | file | Maintains glossary terms, roles, artifact kinds, gates, and adapter conventions. |
| `.agent-work/skills/execute-work-package/SKILL.md` | file | Runs a bounded implementation unit through blueprint, approval, execution, and digest. |
| `.agent-work/skills/review-artifact/SKILL.md` | file | Reviews specs, plans, implementation plans, and handovers independently. |
| `.agent-work/skills/review-implementation/SKILL.md` | file | Reviews completed changes against approved artifacts and verification evidence. |
| `.agent-work/skills/shape-idea/SKILL.md` | file | Shapes rough ideas into approved design directions before specs or implementation planning. |
| `.agent-work/skills/shape-spec/SKILL.md` | file | Turns rough requests into approved spec artifacts. |
| `.agent-work/skills/update-work-state/SKILL.md` | file | Keeps plan, phase, todo, changelog, and next-step state aligned. |
| `.agent-work/skills/verify-implementation-plan/SKILL.md` | file | Produces codebase-grounded implementation plans for approved phases. |
| `.agent-work/skills/write-portable-skill/SKILL.md` | file | Creates or updates portable skills that follow `agent-work-v1`. |

## Key Symbols

| Symbol | Kind | Visibility | Location | Purpose |
|--------|------|------------|----------|---------|
| `define-domain-model` | skill | public | `.agent-work/skills/define-domain-model/SKILL.md:2` | Updates domain vocabulary before dependent artifacts or skills change. |
| `shape-idea` | skill | public | `.agent-work/skills/shape-idea/SKILL.md:2` | Shapes rough ideas into approved design directions before specs or implementation planning. |
| `shape-spec` | skill | public | `.agent-work/skills/shape-spec/SKILL.md:2` | Converts unclear requests into approved specs. |
| `create-phased-plan` | skill | public | `.agent-work/skills/create-phased-plan/SKILL.md:2` | Converts approved specs into executable phase structures. |
| `verify-implementation-plan` | skill | public | `.agent-work/skills/verify-implementation-plan/SKILL.md:2` | Grounds a phase implementation plan in repository reality. |
| `execute-work-package` | skill | public | `.agent-work/skills/execute-work-package/SKILL.md:2` | Executes approved implementation scope and records verification. |
| `review-artifact` | skill | public | `.agent-work/skills/review-artifact/SKILL.md:2` | Reviews planning artifacts without modifying them. |
| `review-implementation` | skill | public | `.agent-work/skills/review-implementation/SKILL.md:2` | Reviews completed implementation against scope and evidence. |
| `update-work-state` | skill | public | `.agent-work/skills/update-work-state/SKILL.md:2` | Updates statuses, todos, changelog, and next-step state. |
| `create-handover` | skill | public | `.agent-work/skills/create-handover/SKILL.md:2` | Writes continuation state for future sessions. |
| `write-portable-skill` | skill | public | `.agent-work/skills/write-portable-skill/SKILL.md:2` | Creates or updates portable skill artifacts. |
| `required skill metadata` | schema | public | `tests/test_agent_work_artifacts.py:47` | Defines required frontmatter keys for every skill. |
| `required skill sections` | schema | public | `tests/test_agent_work_artifacts.py:59` | Defines required body sections for every skill. |

## Data Flow

Work usually starts with `shape-idea`, `shape-spec`, or `define-domain-model`, moves into `create-phased-plan` and `verify-implementation-plan`, then proceeds through `execute-work-package`, review skills, state updates, and `create-handover` when context must persist. `write-portable-skill` is used when the skill set itself changes.

## Configuration

No runtime configuration is required. Every skill declares `domain_model: agent-work-v1` and gate names in frontmatter.

## Inventory Notes

- **Coverage**: full
- **Notes**: Inventory covers every V1 skill file plus the test-enforced metadata and section schema.
