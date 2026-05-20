# Compatibility Matrix

## Stability Levels

- `stable`: supported by source artifacts, generated entrypoints, and validation
- `documented`: supported by adapter documentation but not generated entrypoints
- `experimental`: allowed for exploration but not a stable contract

## Harness Matrix

| Harness | Adapter | Native entrypoint | Generated | Stability |
|---------|---------|-------------------|-----------|-----------|
| Codex | `.agent-work/adapters/codex.md` | `AGENTS.md` | yes | stable |
| OpenCode | `.agent-work/adapters/opencode.md` | `.opencode/commands/shape-idea.md` | yes | documented |
| Claude Code | `.agent-work/adapters/claude.md` | `CLAUDE.md`, `.claude/commands/shape-idea.md` | yes | stable |
| Cursor | `.agent-work/adapters/cursor.md` | `.cursor/rules/agent-work.mdc`, `AGENTS.md` fallback | yes | stable |

## Compatibility Rules

- `.agent-work/` artifacts are the source of truth.
- Generated files must be regenerated or checked before merge.
- Adapter behavior must not redefine the domain model.
- Breaking changes require an ADR and migration guide.
- Deprecations must follow `docs/governance/deprecation-policy.md`.
