---
type: documentation
entity: module
module: "domain-model"
version: 1.0
---

# Module: domain-model

> Part of [Portable Agent Work Model](../overview.md)

## Overview

The domain-model module is the vocabulary source for `agent-work-v1`. It names the concepts that all portable skills, adapters, lifecycle artifacts, and tests use.

### Responsibility

This module is responsible for defining stable terms, logical roles, artifact kinds, required gates, V1 gate vocabulary, and design rules. It is not responsible for mapping those terms to a concrete harness; that belongs to the adapter module.

### Dependencies

| Dependency | Type | Purpose |
|-----------|------|---------|
| Adapters | module | Consume role and capability definitions without redefining them. |
| Skills | module | Use glossary terms, roles, artifact kinds, and gate names in portable workflows. |
| Lifecycle Example | module | Demonstrates glossary terms as persistent artifacts. |
| Validation Tests | module | Verifies that required terms, roles, and gate names remain present. |

## Structure

| Path | Type | Purpose |
|------|------|---------|
| `.agent-work/` | dir | Root namespace for portable work artifacts. |
| `.agent-work/glossary.md` | file | Canonical `agent-work-v1` vocabulary and design rules. |

## Key Symbols

| Symbol | Kind | Visibility | Location | Purpose |
|--------|------|------------|----------|---------|
| `Capability` | term | public | `.agent-work/glossary.md:16` | Names technical abilities exposed by a harness or local environment. |
| `Skill` | term | public | `.agent-work/glossary.md:20` | Names reusable work instructions with triggers, workflow, gates, outputs, and failure handling. |
| `Artifact` | term | public | `.agent-work/glossary.md:24` | Names persistent files that carry work state across agents and sessions. |
| `Spec` | term | public | `.agent-work/glossary.md:28` | Defines approved problem, goal, and design intent. |
| `Plan` | term | public | `.agent-work/glossary.md:32` | Defines phased scope, definition of done, risks, and ordering. |
| `Phase` | term | public | `.agent-work/glossary.md:36` | Defines a bounded delivery unit with acceptance criteria. |
| `Implementation Plan` | term | public | `.agent-work/glossary.md:40` | Defines the technical approach for exactly one phase. |
| `Work Package` | term | public | `.agent-work/glossary.md:44` | Defines an executable work unit with scope and verification. |
| `Gate` | term | public | `.agent-work/glossary.md:48` | Defines explicit checkpoints before risky or externally visible actions. |
| `Review` | term | public | `.agent-work/glossary.md:52` | Defines independent assessment of artifacts or implementations. |
| `Handover` | term | public | `.agent-work/glossary.md:56` | Defines durable transfer state for later sessions or agents. |
| `Role` | term | public | `.agent-work/glossary.md:60` | Defines logical responsibility independent of harness-specific tool names. |
| `Adapter` | term | public | `.agent-work/glossary.md:64` | Defines harness-specific mapping from neutral roles and capabilities. |
| `Orchestrator` | role | public | `.agent-work/glossary.md:70` | Owns user interaction, scope, gates, artifact coordination, and Git operations. |
| `Explorer` | role | public | `.agent-work/glossary.md:71` | Reads code, docs, logs, or external sources and returns compact findings. |
| `Planner` | role | public | `.agent-work/glossary.md:72` | Creates and updates planning artifacts. |
| `Implementer` | role | public | `.agent-work/glossary.md:73` | Changes files inside approved work-package scope and verifies results. |
| `Reviewer` | role | public | `.agent-work/glossary.md:74` | Reviews artifacts or implementations independently. |
| `Maintainer` | role | public | `.agent-work/glossary.md:75` | Updates work state, changelog, handovers, and integration status. |
| `artifact kinds` | vocabulary | public | `.agent-work/glossary.md:77` | Lists allowed artifact categories such as `spec`, `plan`, `review`, and `handover`. |
| `V1 gate vocabulary` | vocabulary | public | `.agent-work/glossary.md:97` | Lists the centralized gate names that portable skills may reference. |
| `Design Rules` | rules | public | `.agent-work/glossary.md:114` | States the core separation between skills, artifacts, roles, capabilities, adapters, and chat history. |

## Data Flow

Changes enter through the `define-domain-model` skill. The glossary becomes the source vocabulary for skills and adapters. Tests then read the glossary and compare it against required terms, roles, and gate references used in skill frontmatter.

## Configuration

No runtime configuration is required. The active domain model version is expressed in frontmatter as `domain_model: agent-work-v1`.

## Inventory Notes

- **Coverage**: full
- **Notes**: Inventory covers every file in the module and the glossary sections that downstream artifacts or tests depend on.
