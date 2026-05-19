---
type: artifact
kind: adapter
domain_model: agent-work-v1
status: approved
created: 2026-05-19
updated: 2026-05-19
---

# Codex Adapter

This adapter maps `agent-work-v1` roles and capabilities to Codex execution patterns. It does not redefine the domain model.

## Role Mapping

- `Orchestrator`: Primary Codex conversation agent that owns user gates, file coordination, and Git operations.
- `Explorer`: Use a read-focused subagent when available; otherwise use targeted file reads and search from the primary agent.
- `Planner`: Use the primary agent for user-facing scope decisions and a planning-capable subagent only when the artifact can be written from explicit inputs.
- `Implementer`: Use a write-capable worker for bounded work packages with clear file ownership; otherwise execute in the primary agent.
- `Reviewer`: Use an independent review-capable agent or a fresh primary-pass review with the relevant artifact paths.
- `Maintainer`: Use the primary agent for work-state updates, changelog changes, and handover creation.

## Capability Mapping

- `filesystem`: Read and write repository files.
- `shell`: Run validation, tests, and repository inspection commands.
- `subagents`: Delegate exploration, implementation, or review when the task is bounded.
- `web`: Use only when current external information is required.
- `browser`: Use for local visual verification when artifacts or apps need rendered inspection.
- `git`: Stage, commit, branch, and push only through the Orchestrator role.

## Boundaries

- Portable skills must not name Codex tools directly.
- Adapter guidance may mention Codex execution patterns.
- The Orchestrator keeps user approval gates explicit.
- Implementers do not perform Git operations.
- Reviews write findings and do not modify the reviewed files.
- Generated `AGENTS.md` should point to `.agent-work/` artifacts instead of duplicating portable skills.
