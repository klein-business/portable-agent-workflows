---
type: documentation
entity: feature
feature: "harness-adapters"
version: 1.0
---

# Feature: harness-adapters

> Part of [Portable Agent Work Model](../overview.md)

## Summary

Harness Adapters allow the same portable skills and artifacts to be used in Codex, OpenCode, Claude Code, Cursor, or a future harness by mapping neutral roles and capabilities to local execution patterns.

## How It Works

Adapters sit between portable skill intent and harness-specific execution. They consume the domain model, explain how roles map in one harness, and preserve the boundary that portable skills must not name concrete tools. Generated harness files remain thin entrypoints; `.agent-work/` is the source of truth.

### User Flow

1. A user works in a specific harness such as Codex, OpenCode, Claude Code, or Cursor.
2. The agent uses portable skills to decide what workflow applies.
3. The active adapter explains how neutral roles and capabilities should be performed in that harness.
4. Native entrypoints such as `AGENTS.md`, `CLAUDE.md`, `.claude/commands/shape-idea.md`, and `.cursor/rules/agent-work.mdc` point back to `.agent-work/`.
5. The resulting artifacts remain portable because they use `agent-work-v1` vocabulary.

### Technical Flow

1. The glossary defines roles such as `Orchestrator`, `Explorer`, `Implementer`, and `Reviewer`.
2. A skill references those roles instead of harness-specific tools.
3. The Codex, OpenCode, Claude Code, or Cursor adapter maps each role and capability to local execution guidance.
4. Generated files expose harness-native entrypoints without copying the portable model.
5. Boundary sections keep Git ownership, review independence, source-of-truth rules, and adapter-specific details explicit.

## Implementation

| Module | Symbols | Role |
|--------|---------|------|
| [domain-model](../modules/domain-model.md) | `Adapter`, `Role`, `Capability`, `Orchestrator`, `Reviewer` | Supplies neutral terms and responsibilities. |
| [adapters](../modules/adapters.md) | `Codex Adapter`, `OpenCode Adapter`, `Claude Adapter`, `Cursor Adapter` | Implements harness-specific mappings. |
| [skills](../modules/skills.md) | `execute-work-package`, `review-implementation`, `create-handover` | Names roles and gates that adapters translate during execution. |
| [validation-tests](../modules/validation-tests.md) | `test_adapters_map_roles_and_capabilities` | Ensures adapters keep required sections and role mappings. |

## Configuration

The repository does not store an active adapter flag. The active harness determines which adapter file an agent should read.

## Edge Cases & Limitations

- An adapter can describe only capabilities that the harness or environment exposes.
- A future harness needs its own adapter before the model is fully actionable there.
- Adapters do not redefine domain terms; ambiguous terms must be changed in the glossary first.
- Generated harness files should be regenerated rather than edited manually.

## Related Features

- [Portable Skill Lifecycle](portable-skill-lifecycle.md)
- [Artifact Validation](artifact-validation.md)
