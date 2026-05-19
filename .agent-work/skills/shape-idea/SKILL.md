---
name: shape-idea
version: 1.0
domain_model: agent-work-v1
description: Use when turning a rough idea into an approved design direction before spec or implementation planning.
triggers:
  - brainstorm
  - shape idea
  - explore design
inputs:
  required:
    - user_request
  optional:
    - repository_context
    - existing_artifacts
    - visual_context
outputs:
  artifacts:
    - approved_design_direction
roles:
  primary: Orchestrator
  optional:
    - Explorer
    - Planner
gates:
  - idea_direction_approved
---

# Purpose

Turn a rough idea into an approved design direction before creating a spec, plan, or implementation work package.

# When To Use

Use this skill before creative work, feature design, behavior changes, workflow changes, or new portable skills when the desired outcome is not already precise enough for `shape-spec`.

# Inputs

The required input is the user's request. Optional inputs include repository context, existing artifacts, examples, constraints, and visual context when the decision would benefit from diagrams or mockups.

# Workflow

1. Explore current repository and artifact context before asking design questions.
2. Decide whether the request is one coherent project or should be split.
3. Ask one clarifying question at a time when required information is missing.
4. Propose two or three approaches with trade-offs.
5. Recommend one approach and explain why.
6. Present the design in reviewable sections.
7. Wait for `idea_direction_approved` before creating a spec or implementation plan.
8. Hand off to `shape-spec` when the design direction is approved.

# Gates

- `idea_direction_approved`: Required before creating a spec, plan, or implementation plan from the shaped idea.

# Outputs

The output is an approved design direction that can be converted into a `spec` artifact by `shape-spec`.

At minimum, the approved direction states the selected approach, rejected alternatives, scope, non-goals, expected artifacts, and verification strategy.

# Adapter Notes

Adapters may provide native entrypoints for invoking this workflow, but the skill itself remains independent of concrete harness file formats or tool names.

# Failure Modes

If the request contains multiple independent systems, stop after identifying the split and shape the first coherent project. If approval is ambiguous, keep the direction unapproved and do not proceed to planning or implementation.
