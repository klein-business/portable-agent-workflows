---
type: documentation
entity: project-overview
version: 1.0
---

# Portable Agent Work Model

## Purpose

Portable Agent Work Model defines a harness-agnostic workflow layer for coding agents. It provides a shared domain model, portable skill format, adapter mappings, persistent lifecycle artifacts, and structural tests so Codex, OpenCode, Claude Code, Cursor, and similar harnesses can run the same work model without sharing concrete tool names or hidden chat state.

## Architecture

The repository is documentation-and-artifact first. The canonical model lives under `.agent-work/`; tests verify that the artifact graph remains coherent. Runtime-specific behavior is isolated in adapters, while portable skills describe role-based workflows in neutral terms.

### System Diagram

```text
User request
    |
    v
Portable skill in .agent-work/skills/
    |
    v
agent-work-v1 glossary: terms, roles, artifact kinds, gates
    |
    +--> adapter mapping for Codex
    +--> adapter mapping for OpenCode
    +--> adapter mapping for Claude Code
    +--> adapter mapping for Cursor
    |
    v
Persistent plan/spec/review/handover artifacts
    |
    v
tests/test_agent_work_artifacts.py and tests/test_harness_integrations.py validation
```

### Tech Stack

- Markdown frontmatter and structured Markdown artifacts.
- Python 3.11+ for validation tests.
- `pytest` for structural test execution.
- `ruff` for linting and formatting checks.
- `uv` as the preferred development dependency runner, with plain Python commands documented as fallback.

## Modules

| Module | Description | Documentation |
|--------|-------------|---------------|
| Domain Model | Defines `agent-work-v1` vocabulary, roles, artifact kinds, gates, and design rules. | [Detail](modules/domain-model.md) |
| Adapters | Maps neutral roles and capabilities to Codex, OpenCode, Claude Code, and Cursor execution patterns. | [Detail](modules/adapters.md) |
| Skills | Contains the eleven V1 portable skills and their required metadata, gates, workflow sections, and boundaries. | [Detail](modules/skills.md) |
| Lifecycle Example | Demonstrates the full artifact lifecycle from spec through handover. | [Detail](modules/lifecycle-example.md) |
| Validation Tests | Verifies glossary, adapter, skill, generated-file, and example-artifact consistency. | [Detail](modules/validation-tests.md) |

## Key Features

| Feature | Description | Documentation |
|---------|-------------|---------------|
| Portable Skill Lifecycle | Guides requests from domain-model changes through specs, phased plans, implementation, reviews, state updates, and handovers. | [Detail](features/portable-skill-lifecycle.md) |
| Harness Adapters | Keeps workflows portable while allowing each harness to map roles and capabilities to its own execution model. | [Detail](features/harness-adapters.md) |
| Generated Harness Integration | Generates thin native entrypoints for Codex, Claude Code, and Cursor from `.agent-work/` source artifacts. | [Detail](features/generated-harness-integration.md) |
| Artifact Validation | Catches structural drift in glossary terms, adapters, skill metadata, gates, and lifecycle examples. | [Detail](features/artifact-validation.md) |

## Development

### Setup

Install development dependencies with `uv`:

```bash
uv sync --dev
```

Plain Python fallback:

```bash
python -m pip install pytest ruff
```

### Build & Run

There is no runtime build step. This repository ships Markdown artifacts plus tests, not an importable runtime library.

### Testing

Run the full validation suite:

```bash
uv run pytest tests/ -v
uv run ruff check tests/
uv run ruff format --check tests/
```

The test strategy is structural: it checks required terms, role mappings, skill shape, gate vocabulary, and example lifecycle frontmatter.

## References

- [Root README](../README.md)
- [Domain model glossary](../.agent-work/glossary.md)
- [Codex adapter](../.agent-work/adapters/codex.md)
- [OpenCode adapter](../.agent-work/adapters/opencode.md)
