---
name: create-phased-plan
version: 1.0
domain_model: agent-work-v1
description: Use when converting an approved spec into plan, phase, and todo artifacts.
triggers:
  - create phased plan
  - plan approved spec
  - define phases
inputs:
  required:
    - approved_spec
  optional:
    - existing_plan
    - repository_docs
outputs:
  artifacts:
    - .agent-work/plans/<plan-name>/plan.md
    - .agent-work/plans/<plan-name>/phases/phase-1.md
    - .agent-work/plans/<plan-name>/todo.md
roles:
  primary: Orchestrator
  optional:
    - Planner
    - Reviewer
gates:
  - plan_approval
---

# Purpose

Turn an approved spec into an executable phased structure without mixing scope decisions with code-level implementation details.

# When To Use

Use this skill after `spec_approval` and before writing phase-level implementation plans.

# Inputs

The required input is an approved spec artifact. Optional inputs include existing repository docs, known delivery constraints, and previous plan artifacts.

# Workflow

1. Read the approved `spec.md`.
2. Extract goals, non-goals, risks, and validation expectations.
3. Decide whether one phase is enough or multiple phases are needed.
4. Write `plan.md` with objective, scope, definition of done, risks, and phase table.
5. Write one `phase-N.md` file per phase with acceptance criteria.
6. Write `todo.md` with current status and next action.
7. Confirm the plan keeps implementation detail out of phase scope.

# Gates

- `plan_approval`: Required before implementation plans are authored for large, risky, or multi-phase work.

# Outputs

The output is a plan directory containing `plan.md`, `phases/`, and `todo.md`.

# Adapter Notes

A Planner role may write artifacts from explicit inputs. The Orchestrator owns phase-scope decisions and approval.

# Failure Modes

If a phase cannot be verified independently, split or reshape it. If the spec is not approved, stop and return to `shape-spec`.
