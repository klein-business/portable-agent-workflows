---
name: review-artifact
version: 1.0
domain_model: agent-work-v1
description: Use when independently reviewing a spec, plan, implementation plan, or handover artifact.
triggers:
  - review spec
  - review plan
  - review implementation plan
  - review handover
inputs:
  required:
    - artifact_under_review
    - review_focus
  optional:
    - related_artifacts
outputs:
  artifacts:
    - .agent-work/plans/<plan-name>/reviews/<review-name>.md
roles:
  primary: Orchestrator
  optional:
    - Reviewer
gates:
  - review_scope_confirmed
---

# Purpose

Produce an independent assessment of an artifact without modifying the artifact under review.

# When To Use

Use this skill when a spec, plan, implementation plan, or handover needs a quality gate or second perspective.

# Inputs

Required inputs are the artifact path and review focus. Optional inputs include related specs, plans, phases, implementation plans, and previous reviews.

# Workflow

1. Confirm the review focus.
2. Read the artifact under review and related artifacts.
3. Check for correctness, completeness, ambiguity, scope drift, and verification gaps.
4. Prioritize functional and technical risks over formatting issues.
5. Write findings by severity.
6. State residual risk even when there are no findings.
7. Write the review artifact.

# Gates

- `review_scope_confirmed`: The Orchestrator defines what the review should prioritize.

# Outputs

The output is a review artifact with verdict, severity-count summary, findings, assumptions, and residual risk.

# Adapter Notes

Use a Reviewer role that has not authored the reviewed artifact when available.

# Failure Modes

If the review scope is unclear, ask the Orchestrator to define focus. If required related artifacts are missing, write that as a blocking finding.
