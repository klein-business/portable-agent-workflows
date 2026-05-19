---
name: write-portable-skill
version: 1.0
domain_model: agent-work-v1
description: Use when creating or updating a portable skill that follows the agent-work-v1 domain model.
triggers:
  - create portable skill
  - update portable skill
  - define skill workflow
inputs:
  required:
    - skill_goal
    - target_skill_name
  optional:
    - existing_glossary
    - adapter_constraints
outputs:
  artifacts:
    - .agent-work/skills/<skill-name>/SKILL.md
roles:
  primary: Orchestrator
  optional:
    - Explorer
    - Reviewer
gates:
  - skill_scope_confirmed
  - skill_review_complete
---

# Purpose

Create portable skill instructions that are readable by humans, structurally consistent, and independent of a specific harness.

# When To Use

Use this skill when a new reusable workflow is needed or an existing workflow needs to be updated for `agent-work-v1`.

# Inputs

Required inputs are the skill goal and target skill name. Optional inputs include existing glossary entries, related skills, and adapter constraints.

# Workflow

1. Read `.agent-work/glossary.md`.
2. Confirm the skill has one clear responsibility.
3. Define triggers, inputs, outputs, roles, and gates.
4. Write the skill with the required frontmatter keys.
5. Write all required body sections.
6. Check that the workflow names roles and capabilities rather than harness tools.
7. Review the skill for ambiguous gates, hidden state assumptions, and missing outputs.

# Gates

- `skill_scope_confirmed`: The Orchestrator confirms the skill's responsibility and boundaries.
- `skill_review_complete`: The skill passes structural and clarity review before it is used as a source of truth.

# Outputs

The output is one `SKILL.md` file under `.agent-work/skills/<skill-name>/`.

# Adapter Notes

Do not place concrete tool names in the workflow. Put concrete harness mappings in `.agent-work/adapters/`.

# Failure Modes

If the skill has multiple responsibilities, split it before writing. If required gates are unclear, stop and ask the Orchestrator to choose the blocking checkpoint.
