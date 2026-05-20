---
name: shape-idea
description: Shape an implementation idea into an approved agent-work-v1 design before code changes.
domain_model: agent-work-v1
---

# Shape Idea

Use portable-agent-workflows to shape an idea before implementation.

Reference the portable source artifacts:

- Domain model: `.agent-work/glossary.md`
- Canonical skill: `.agent-work/skills/shape-idea/SKILL.md`
- Claude adapter: `.agent-work/adapters/claude.md`

Process:

1. Understand the current repository context.
2. Clarify the implementation intent and constraints.
3. Propose two or three approaches with trade-offs.
4. Present a design and wait for approval.
5. Write the approved design as a repository artifact.
6. Do not implement code before design approval.

This plugin skill is a thin Claude Code entrypoint. The canonical workflow remains in
`.agent-work/skills/shape-idea/SKILL.md`.
