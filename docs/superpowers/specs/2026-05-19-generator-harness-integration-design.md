---
type: spec
status: approved
created: 2026-05-19
updated: 2026-05-19
---

# Generator-Based Harness Integration Design

## Context

Portable Agent Workflows currently keeps its source vocabulary, adapters, skills, and lifecycle example under `.agent-work/`. It includes Codex and OpenCode adapter documents, but it does not yet expose native integration files for Codex, Claude Code, or Cursor. It also does not yet include a portable equivalent of the local `brainstorming` skill.

Codex can consume root-level `AGENTS.md` instructions. Claude Code consumes `CLAUDE.md`, supports `@path` imports from memory files, and supports project slash commands under `.claude/commands/`. Cursor supports project rules under `.cursor/rules/*.mdc` and can also consume root-level `AGENTS.md`.

## Goal

Add a generator-based integration layer so native harness files for Codex, Claude Code, and Cursor are reproducibly generated from the portable `.agent-work/` source of truth.

## Non-Goals

- Do not add an installer.
- Do not publish a package.
- Do not install anything into `~/.codex`, `~/.claude`, or global Cursor settings.
- Do not create Claude subagents for every role.
- Do not create one Cursor rule per skill.
- Do not add a runtime library.
- Do not duplicate full skill bodies into every native harness file.

## Architecture

`.agent-work/` remains the only source of truth. Native harness files are generated outputs with explicit marker headers, not hand-maintained policy documents.

Source inputs:

- `.agent-work/glossary.md`
- `.agent-work/skills/*/SKILL.md`
- `.agent-work/adapters/codex.md`
- `.agent-work/adapters/opencode.md`
- `.agent-work/adapters/claude.md`
- `.agent-work/adapters/cursor.md`

Generated outputs:

- `AGENTS.md`
- `CLAUDE.md`
- `.claude/commands/shape-idea.md`
- `.cursor/rules/agent-work.mdc`

Generator and templates:

- `tools/generate_harness_integrations.py`
- `tools/harness_templates/agents.md.tmpl`
- `tools/harness_templates/claude.md.tmpl`
- `tools/harness_templates/claude-shape-idea.md.tmpl`
- `tools/harness_templates/cursor-agent-work.mdc.tmpl`

The generator reads the required source inputs, renders templates with a small deterministic context, and writes the generated outputs. A `--check` mode compares rendered output against files on disk and exits non-zero on drift.

## Portable Brainstorming Skill

Add `.agent-work/skills/shape-idea/SKILL.md` as the portable equivalent of the existing local `brainstorming` skill.

Responsibilities:

- Explore current project context before design.
- Ask clarifying questions one at a time.
- Propose two or three approaches with trade-offs.
- Recommend one approach and explain why.
- Present design sections for approval.
- Stop before implementation until the design is approved.
- Hand off to `shape-spec` and `create-phased-plan` after approval.

The skill should use `agent-work-v1` terms, roles, gates, and artifacts. It should not name Codex, Claude, Cursor, OpenCode, or their concrete tool names in the workflow body.

## Harness Integration Behavior

### Codex

`AGENTS.md` acts as the root project instruction file. It should be thin and point to:

- `.agent-work/glossary.md`
- `.agent-work/adapters/codex.md`
- `.agent-work/skills/shape-idea/SKILL.md`
- `.agent-work/skills/shape-spec/SKILL.md`
- `.agent-work/skills/create-phased-plan/SKILL.md`

### Claude Code

`CLAUDE.md` acts as project memory. It should use `@path` imports where appropriate and point Claude to the portable source files.

`.claude/commands/shape-idea.md` should provide an explicit project slash command for invoking the idea-shaping workflow while still referencing `.agent-work/skills/shape-idea/SKILL.md`.

### Cursor

`.cursor/rules/agent-work.mdc` should be a project rule that makes the portable workflow available in Cursor. It should reference `.agent-work/` artifacts and keep the rule focused enough to avoid copying all skill content.

`AGENTS.md` remains useful as a simple fallback for Cursor contexts that prefer root Markdown instructions.

## Data Flow

```text
.agent-work/glossary.md
.agent-work/skills/*/SKILL.md
.agent-work/adapters/*.md
        |
        v
tools/generate_harness_integrations.py
        |
        v
AGENTS.md
CLAUDE.md
.claude/commands/shape-idea.md
.cursor/rules/agent-work.mdc
        |
        v
tests verify generated output is current
```

## Tests

Extend the existing structural tests and add generator-specific tests:

- `shape-idea` is included in `REQUIRED_SKILLS`.
- Adapter coverage includes `codex`, `opencode`, `claude`, and `cursor`.
- Every adapter maps all required roles and includes role mapping, capability mapping, and boundaries.
- Generated native files exist.
- Generated native files include a marker header.
- Generated native files reference `.agent-work/`.
- Generated native files do not redefine the domain model.
- `uv run python tools/generate_harness_integrations.py --check` fails if generated files drift.

## Documentation

Update:

- `README.md`: mention generated harness integration files and the `shape-idea` skill.
- `docs/overview.md`: include Claude and Cursor adapter support plus generated integration files.
- `docs/modules/adapters.md`: include `claude.md` and `cursor.md`.
- `docs/modules/skills.md`: include `shape-idea`.
- `docs/modules/validation-tests.md`: include generator/currentness validation.
- Feature documentation as needed for harness integration.

## Error Handling

- If a template is missing, the generator exits with a clear missing-template error.
- If a required source input is missing, the generator exits with a clear missing-source error.
- If generated files differ in `--check` mode, the generator prints the stale paths and exits non-zero.
- If a generated directory does not exist in write mode, the generator creates it.
- If adapter or skill coverage is incomplete, tests fail before integration is considered complete.

## Verification

Run:

```bash
uv run python tools/generate_harness_integrations.py --check
uv run pytest tests/ -v
uv run ruff check tests/ tools/
uv run ruff format --check tests/ tools/
```

Also run the local Markdown link check used by this repository before claiming completion.

## Open Decisions

No open design decisions remain for the first implementation. The selected approach is generator-based, with `.agent-work/` as source of truth and thin native harness files as generated outputs.
