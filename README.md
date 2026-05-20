# Portable Agent Workflows

<p align="center">
  <img alt="Private repository" src="https://img.shields.io/badge/repository-private-111827?style=for-the-badge">
  <img alt="Domain model agent-work-v1" src="https://img.shields.io/badge/domain-agent--work--v1-2563eb?style=for-the-badge">
  <img alt="Harness agnostic" src="https://img.shields.io/badge/harness-agnostic-0f766e?style=for-the-badge">
  <img alt="PR first" src="https://img.shields.io/badge/governance-PR--first-7c3aed?style=for-the-badge">
  <img alt="Compatibility governed" src="https://img.shields.io/badge/compatibility-governed-4338ca?style=for-the-badge">
  <img alt="Security policy" src="https://img.shields.io/badge/security-policy-b91c1c?style=for-the-badge">
</p>

<p align="center">
  <img alt="CI configured" src="https://img.shields.io/badge/CI-configured-16a34a?style=for-the-badge">
  <img alt="CodeQL configured" src="https://img.shields.io/badge/CodeQL-configured-0f172a?style=for-the-badge">
  <img alt="Dependabot configured" src="https://img.shields.io/badge/Dependabot-configured-025e8c?style=for-the-badge">
  <img alt="Python 3.11+" src="https://img.shields.io/badge/Python-3.11%2B-3776ab?style=for-the-badge&logo=python&logoColor=white">
  <img alt="uv" src="https://img.shields.io/badge/uv-managed-de5fe9?style=for-the-badge">
  <img alt="Ruff" src="https://img.shields.io/badge/Ruff-enabled-d7ff64?style=for-the-badge">
  <img alt="pytest" src="https://img.shields.io/badge/pytest-14%20tests-0a9edc?style=for-the-badge">
</p>

<p align="center">
  <img alt="Codex supported" src="https://img.shields.io/badge/Codex-stable-111827?style=for-the-badge">
  <img alt="OpenCode documented" src="https://img.shields.io/badge/OpenCode-documented-334155?style=for-the-badge">
  <img alt="Claude Code supported" src="https://img.shields.io/badge/Claude%20Code-stable-d97706?style=for-the-badge">
  <img alt="Cursor supported" src="https://img.shields.io/badge/Cursor-stable-000000?style=for-the-badge">
</p>

Portable Agent Workflows is a harness-agnostic workflow layer for coding agents. It defines a shared vocabulary, portable skills, adapter mappings, persistent artifacts, and generated native entrypoints so Codex, OpenCode, Claude Code, Cursor, and similar harnesses can follow the same workflow model without sharing tool names or hidden chat state.

## Origins

This model combines the strongest ideas from [obra/superpowers](https://github.com/obra/superpowers) and [DasDigitaleMomentum/opencode-processing-skills](https://github.com/DasDigitaleMomentum/opencode-processing-skills): explicit skill workflows, durable planning artifacts, review gates, handovers, and harness-specific adapters. It does not copy either system directly; it defines a clean `agent-work-v1` domain model that can be used across Codex, OpenCode, Claude Code, Cursor, and future harnesses.

## What This Repository Is

- A portable workflow and artifact model for coding agents.
- A set of harness-agnostic skills under `.agent-work/skills/`.
- A generated integration layer for Codex, Claude Code, and Cursor.
- A governance-backed reference repository for `agent-work-v1`.

## What This Repository Is Not

- It is not a runtime library.
- It is not an installer.
- It is not tied to one agent harness.
- It does not mutate GitHub repository settings automatically.

## Enterprise Readiness

- PR-first governance is documented in [CONTRIBUTING.md][contributing].
- Security reporting is documented in [SECURITY.md][security].
- Releases follow the [release policy][release-policy].
- Release history is tracked in [CHANGELOG.md][changelog].
- Compatibility is governed by the [compatibility policy][compatibility-policy].
- Deprecations follow the [deprecation policy][deprecation-policy].
- Recommended repository settings are documented in [GitHub settings][github-settings].
- Supported harnesses are tracked in the [compatibility matrix][compatibility-matrix].

## Quality Gates

```bash
uv run python tools/generate_harness_integrations.py --check
uv run pytest tests/ -v
uv run ruff check tests/ tools/
uv run ruff format --check tests/ tools/
uv run python tools/check_markdown_links.py
git diff --check
```

## What Is Included

- `.agent-work/glossary.md` defines the `agent-work-v1` domain model.
- `.agent-work/adapters/` maps neutral roles and capabilities to Codex, OpenCode, Claude Code, and Cursor.
- `.agent-work/skills/` contains the eleven V1 portable skills.
- `.agent-work/plans/portable-agent-work-example/` demonstrates the full artifact lifecycle.
- `AGENTS.md`, `CLAUDE.md`, `.claude/commands/`, and `.cursor/rules/` are generated native harness entrypoints.
- `tools/generate_harness_integrations.py` regenerates native harness files from `.agent-work/`.
- `tools/check_markdown_links.py` validates local Markdown links.
- `tests/` validates model structure, generated files, and enterprise foundation artifacts.
- `docs/` documents architecture, governance, reference material, modules, and features.

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
uv run ruff check tests/ tools/
uv run ruff format --check tests/ tools/
uv run python tools/check_markdown_links.py
```

## Supported Harnesses

See the [compatibility matrix][compatibility-matrix] for current support status.

## Documentation

- Start here: [Project overview][overview]
- Governance: [Release policy][release-policy], [Compatibility policy][compatibility-policy], [Deprecation policy][deprecation-policy], [ADRs][adrs]
- Administration: [GitHub settings][github-settings]
- Reference: [Compatibility matrix][compatibility-matrix]
- Modules: [Domain model][domain-model], [Adapters][adapters], [Harness generator][harness-generator], [Skills][skills], [Lifecycle example][lifecycle-example], [Validation tests][validation-tests]
- Features: [Generated harness integration][generated-harness-integration], [Portable skill lifecycle][portable-skill-lifecycle], [Artifact validation][artifact-validation], [Harness adapters][harness-adapters]

[adapters]: docs/modules/adapters.md
[adrs]: docs/governance/adr/README.md
[artifact-validation]: docs/features/artifact-validation.md
[compatibility-matrix]: docs/reference/compatibility-matrix.md
[compatibility-policy]: docs/governance/compatibility-policy.md
[changelog]: CHANGELOG.md
[contributing]: CONTRIBUTING.md
[deprecation-policy]: docs/governance/deprecation-policy.md
[domain-model]: docs/modules/domain-model.md
[generated-harness-integration]: docs/features/generated-harness-integration.md
[github-settings]: docs/admin/github-settings.md
[harness-adapters]: docs/features/harness-adapters.md
[harness-generator]: docs/modules/harness-generator.md
[lifecycle-example]: docs/modules/lifecycle-example.md
[overview]: docs/overview.md
[portable-skill-lifecycle]: docs/features/portable-skill-lifecycle.md
[release-policy]: docs/governance/release-policy.md
[security]: SECURITY.md
[skills]: docs/modules/skills.md
[validation-tests]: docs/modules/validation-tests.md

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
