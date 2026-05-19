---
name: verify-implementation-plan
version: 1.0
domain_model: agent-work-v1
description: Use when creating a codebase-grounded implementation plan for one approved phase.
triggers:
  - write implementation plan
  - verify phase against codebase
  - prepare work package
inputs:
  required:
    - plan_artifact
    - phase_artifact
  optional:
    - repository_docs
    - previous_phase_implementation_plan
outputs:
  artifacts:
    - .agent-work/plans/<plan-name>/implementation/phase-N-impl.md
roles:
  primary: Orchestrator
  optional:
    - Explorer
    - Planner
    - Reviewer
gates:
  - implementation_plan_ready
---

# Purpose

Create an implementation plan that is grounded in actual repository files, symbols, tests, and verification commands.

# When To Use

Use this skill after a phase is approved and before executing a work package for that phase.

# Inputs

Required inputs are `plan.md` and one `phase-N.md`. Optional inputs include docs inventories, previous implementation plans, and known test commands.

# Workflow

1. Read `plan.md` and the target phase artifact.
2. Use an Explorer role to locate relevant files, symbols, tests, and existing patterns.
3. Write the technical approach with exact file paths.
4. Define implementation steps that preserve the phase scope.
5. Choose one primary verify command that exercises the changed behavior.
6. Record code anchors used for reality checking.
7. Record mismatches that require Orchestrator decisions.

# Gates

- `implementation_plan_ready`: The Orchestrator confirms the plan is concrete enough for a work package.

# Outputs

The output is `implementation/phase-N-impl.md` with approach, affected files, implementation steps, testing plan, rollback strategy, open decisions, and reality-check notes.

# Adapter Notes

Use an Explorer role for repository inspection. Use a Planner role for writing the artifact when the input paths are explicit.

# Failure Modes

If repository reality conflicts with the phase scope, record the mismatch and stop for Orchestrator decision. If no meaningful verify command exists, ask for a testing decision before execution.
