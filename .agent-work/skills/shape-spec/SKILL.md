---
name: shape-spec
version: 1.0
domain_model: agent-work-v1
description: Use when turning a rough request into an approved Spec artifact.
triggers:
  - rough idea
  - new feature
  - behavior change
inputs:
  required:
    - user_request
  optional:
    - existing_docs
    - existing_plan
outputs:
  artifacts:
    - .agent-work/plans/<plan-name>/spec.md
roles:
  primary: Orchestrator
  optional:
    - Explorer
gates:
  - spec_approval
---

# Purpose

Convert an unclear request into a focused, approved spec that captures goals, non-goals, alternatives, design, risks, and validation approach.

# When To Use

Use this skill before creating a plan for new functionality, behavior changes, workflow changes, or multi-step documentation changes.

# Inputs

The required input is the user's request. Optional inputs include existing docs, existing plans, examples, and repository constraints.

# Workflow

1. Inspect relevant existing artifacts before asking design questions.
2. Identify whether the request is one project or needs decomposition.
3. Ask one clarifying question at a time.
4. Present two or three approaches with trade-offs.
5. Recommend one approach and explain why.
6. Present the design in reviewable sections.
7. Write `spec.md` only after the Orchestrator receives approval.
8. Self-review the spec for contradictions, ambiguous scope, missing non-goals, and missing validation.

# Gates

- `spec_approval`: The user or Orchestrator approves the design before a plan is created.

# Outputs

The output is `.agent-work/plans/<plan-name>/spec.md` with approved scope, goals, non-goals, design, risks, and validation strategy.

# Adapter Notes

Use an Explorer role when codebase or external context must be gathered. Keep final approval with the Orchestrator.

# Failure Modes

If the request spans independent systems, split it into multiple specs. If approval is not explicit, keep the spec in draft status and stop before planning.
