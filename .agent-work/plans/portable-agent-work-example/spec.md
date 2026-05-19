---
type: artifact
kind: spec
domain_model: agent-work-v1
status: approved
created: 2026-05-19
updated: 2026-05-19
---

# Spec: Portable Agent Work Example

## Goal

Demonstrate that a future agent can continue work from explicit artifacts without reading the original chat.

## Scope

The example covers one documentation-only phase that validates the glossary, adapters, skill files, and lifecycle artifacts.

## Non-Goals

- It does not change application runtime behavior.
- It does not define a production release process.
- It does not require a specific harness.

## Design

The example stores every lifecycle artifact under `.agent-work/plans/portable-agent-work-example/` and uses frontmatter compatible with `agent-work-v1`.

## Validation

Validation is performed by `poetry run pytest tests/test_agent_work_artifacts.py -v --no-cov`.
