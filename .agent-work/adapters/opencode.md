---
type: artifact
kind: adapter
domain_model: agent-work-v1
status: approved
created: 2026-05-19
updated: 2026-05-19
---

# OpenCode Adapter

This adapter maps `agent-work-v1` roles and capabilities to OpenCode execution patterns. It does not redefine the domain model.

## Role Mapping

- `Orchestrator`: Primary maintainer-style agent that owns user gates, scope decisions, artifact coordination, and Git operations.
- `Explorer`: Use a read-focused delegate for code, docs, logs, and external research; return compact findings to the Orchestrator.
- `Planner`: Use a docs-and-plans writer role for artifacts under `.agent-work/` when inputs are explicit.
- `Implementer`: Use a code-writing implementer role through blueprint, gate, execute, and digest.
- `Reviewer`: Use an independent delegate to review artifacts or implementations without changing them.
- `Maintainer`: Use the Orchestrator or a docs-and-plans writer role for state updates and handovers.

## Capability Mapping

- `filesystem`: Read and write repository files.
- `shell`: Run validation, tests, and repository inspection commands.
- `delegation`: Assign bounded exploration, implementation, and review tasks.
- `web`: Use only when current external information is required.
- `git`: Keep commits, branch operations, and pushes under the Orchestrator role.
- `artifact-writing`: Write `.agent-work/` files from explicit source artifacts.

## Boundaries

- Portable skills must not name OpenCode agents directly.
- Adapter guidance may mention OpenCode execution patterns.
- The Orchestrator keeps approval gates explicit.
- Implementers do not perform Git operations.
- Reviews write findings and do not modify the reviewed files.
