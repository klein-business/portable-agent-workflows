---
type: artifact
kind: adapter
domain_model: agent-work-v1
status: approved
created: 2026-05-19
updated: 2026-05-19
---

# Claude Adapter

This adapter maps `agent-work-v1` roles and capabilities to Claude Code execution patterns. It does not redefine the domain model.

## Role Mapping

- `Orchestrator`: Primary Claude Code conversation agent that owns user gates, scope decisions, artifact coordination, and Git operations.
- `Explorer`: Use focused repository reads, search, or a project subagent when available; return compact findings to the Orchestrator.
- `Planner`: Use the primary agent for approval-sensitive planning and a bounded planning helper only when artifact inputs are explicit.
- `Implementer`: Use the primary agent or a bounded implementation helper for approved work packages with clear file ownership.
- `Reviewer`: Use a separate review pass or specialized review helper that does not modify reviewed files.
- `Maintainer`: Use the primary agent for memory, work-state, changelog, handover, and integration file updates.

## Capability Mapping

- `filesystem`: Read and write repository files and project memory files.
- `shell`: Run validation, tests, and repository inspection commands when permitted.
- `commands`: Use project slash commands for explicit reusable workflows.
- `memory`: Use project memory to point to portable `.agent-work/` artifacts.
- `subagents`: Use project subagents only when a task is bounded and their instructions are explicit.
- `git`: Keep commits, branch operations, and pushes under the Orchestrator role.

## Boundaries

- Portable skills must not name Claude Code tools directly.
- Generated Claude files may mention Claude Code memory and command conventions.
- The Orchestrator keeps approval gates explicit.
- Implementers do not perform Git operations.
- Reviews write findings and do not modify the reviewed files.
