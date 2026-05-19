---
type: artifact
kind: adapter
domain_model: agent-work-v1
status: approved
created: 2026-05-19
updated: 2026-05-19
---

# Cursor Adapter

This adapter maps `agent-work-v1` roles and capabilities to Cursor execution patterns. It does not redefine the domain model.

## Role Mapping

- `Orchestrator`: Primary Cursor Agent conversation that owns user gates, scope decisions, artifact coordination, and Git operations.
- `Explorer`: Use repository search, file reads, and scoped context attachments to return compact findings.
- `Planner`: Use Cursor Agent to create or update artifacts when source inputs are explicit and approval gates are clear.
- `Implementer`: Use Cursor Agent or Inline Edit only inside an approved work package with clear file scope.
- `Reviewer`: Use a separate review prompt or fresh review pass that does not modify reviewed files.
- `Maintainer`: Use Cursor Agent to update generated files, work state, docs, and handovers from explicit source artifacts.

## Capability Mapping

- `filesystem`: Read and write repository files.
- `shell`: Run validation, tests, and repository inspection commands when available.
- `rules`: Use project rules to keep portable workflow context available.
- `context`: Attach relevant `.agent-work/` artifacts rather than relying on hidden chat state.
- `inline-edit`: Use only for local, bounded edits that remain inside approved scope.
- `git`: Keep commits, branch operations, and pushes under the Orchestrator role.

## Boundaries

- Portable skills must not name Cursor tools directly.
- Generated Cursor rules may mention Cursor rule conventions.
- The Orchestrator keeps approval gates explicit.
- Implementers do not perform Git operations.
- Reviews write findings and do not modify the reviewed files.
