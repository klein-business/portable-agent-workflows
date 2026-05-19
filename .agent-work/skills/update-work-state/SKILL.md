---
name: update-work-state
version: 1.0
domain_model: agent-work-v1
description: Use when updating plan status, phase status, todo items, changelog, or next-step state.
triggers:
  - update work state
  - update todo
  - mark phase status
inputs:
  required:
    - plan_directory
    - state_change
  optional:
    - execution_digest
    - review_artifact
    - user_decisions
outputs:
  artifacts:
    - .agent-work/plans/<plan-name>/plan.md
    - .agent-work/plans/<plan-name>/phases/phase-N.md
    - .agent-work/plans/<plan-name>/todo.md
roles:
  primary: Orchestrator
  optional:
    - Maintainer
gates:
  - state_change_confirmed
---

# Purpose

Keep persistent work artifacts aligned with actual progress.

# When To Use

Use this skill after planning, execution, review, phase transition, or session interruption changes the source-of-truth state.

# Inputs

Required inputs are the plan directory and state change. Optional inputs include execution digests, review artifacts, and user decisions.

# Workflow

1. Read `plan.md`, relevant phase files, and `todo.md`.
2. Identify the exact state transition.
3. Update status fields and checklist items.
4. Add a dated changelog entry.
5. Preserve historical decisions.
6. Record the next useful step.
7. Verify that plan, phase, and todo state agree.

# Gates

- `state_change_confirmed`: The Orchestrator confirms the state transition when it affects phase completion or next action.

# Outputs

The outputs are updated plan, phase, and todo artifacts.

# Adapter Notes

A Maintainer role may update artifacts from explicit state-change instructions. The Orchestrator owns decisions about completion.

# Failure Modes

If artifacts disagree about current state, reconcile them from the latest approved gate and record the correction in the changelog.
