# Portable Agent Work Model

Portable Agent Work Model is a harness-agnostic workflow layer for coding agents. It defines a shared vocabulary, portable skills, adapter mappings, and persistent artifacts so Codex, OpenCode, and similar harnesses can follow the same work model without sharing tool names or hidden chat state.

## What Is Included

- `.agent-work/glossary.md` defines the `agent-work-v1` domain model.
- `.agent-work/adapters/` maps neutral roles and capabilities to Codex, OpenCode, Claude Code, and Cursor.
- `.agent-work/skills/` contains the eleven V1 portable skills.
- `.agent-work/plans/portable-agent-work-example/` demonstrates the full artifact lifecycle.
- `AGENTS.md`, `CLAUDE.md`, `.claude/commands/`, and `.cursor/rules/` are generated native harness entrypoints.
- `tools/generate_harness_integrations.py` regenerates native harness files from `.agent-work/`.
- `tests/test_agent_work_artifacts.py` validates the model structure and key consistency rules.
- `docs/` documents architecture, modules, and features for humans and agents.

## Core Ideas

- Skills describe behavior.
- Artifacts store durable state.
- Roles define responsibility.
- Capabilities define what a harness can do.
- Adapters translate neutral intent into concrete harness execution.
- Later agents should be able to continue from files, not hidden chat context.

## Quickstart

Install development dependencies with `uv`:

```bash
uv sync --dev
```

Run validation:

```bash
uv run python tools/generate_harness_integrations.py --check
uv run pytest tests/ -v
uv run ruff check tests/
uv run ruff format --check tests/
```

If you prefer a plain Python environment:

```bash
python -m pip install pytest ruff
python -m pytest tests/ -v
ruff check tests/
ruff format --check tests/
```

## Documentation

- [Project overview](docs/overview.md)
- [Domain model module](docs/modules/domain-model.md)
- [Adapters module](docs/modules/adapters.md)
- [Skills module](docs/modules/skills.md)
- [Lifecycle example module](docs/modules/lifecycle-example.md)
- [Validation tests module](docs/modules/validation-tests.md)

## V1 Skills

- `define-domain-model`
- `shape-idea`
- `shape-spec`
- `create-phased-plan`
- `verify-implementation-plan`
- `execute-work-package`
- `review-artifact`
- `review-implementation`
- `update-work-state`
- `create-handover`
- `write-portable-skill`

## Repository Status

This repository is a documentation-and-artifact model. It does not ship a runtime library. The tests validate that the files remain structurally coherent.
