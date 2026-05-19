---
name: create-handover
version: 1.0
domain_model: agent-work-v1
description: Use when ending or pausing a work session so another agent can continue from artifacts.
triggers:
  - create handover
  - pause session
  - transfer context
inputs:
  required:
    - plan_directory
    - current_status
  optional:
    - latest_review
    - latest_execution_digest
    - branch_state
    - known_blockers
outputs:
  artifacts:
    - .agent-work/plans/<plan-name>/handovers/session-YYYY-MM-DD.md
roles:
  primary: Orchestrator
  optional:
    - Maintainer
gates:
  - handover_ready
---

# Purpose

Capture enough state for another agent or future session to continue without relying on hidden chat context.

# When To Use

Use this skill at session end, before long pauses, after interrupted execution, or before handing work to another agent.

# Inputs

Required inputs are the plan directory and current status. Optional inputs include latest review, execution digest, branch state, and known blockers.

# Workflow

1. Read current plan, phase, todo, and recent review artifacts.
2. Summarize completed work.
3. Record decisions and rationale.
4. Record open questions and blockers.
5. Identify changed files and verification status.
6. State the next useful step.
7. Write the handover artifact.

# Gates

- `handover_ready`: The Orchestrator confirms the handover reflects current state.

# Outputs

The output is a dated handover artifact under `handovers/`.

At minimum, the handover includes frontmatter fields for `type`, `kind`, `domain_model`, `status`, `created`, and `updated`, plus sections for completed work, decisions, blockers or open questions, changed files, verification status, and the next useful step.

# Adapter Notes

A Maintainer role may draft the handover from explicit artifact paths. The Orchestrator verifies that the next step is correct.

# Failure Modes

If current state cannot be determined from artifacts, state the uncertainty in the handover and list the artifacts that must be inspected next.
