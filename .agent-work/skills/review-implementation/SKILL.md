---
name: review-implementation
version: 1.0
domain_model: agent-work-v1
description: Use when reviewing completed changes against spec, phase, implementation plan, and verification evidence.
triggers:
  - review implementation
  - review code changes
  - validate work package
inputs:
  required:
    - implementation_plan
    - changed_files
    - verification_evidence
  optional:
    - spec_artifact
    - phase_artifact
    - execution_digest
outputs:
  artifacts:
    - .agent-work/plans/<plan-name>/reviews/impl-review-phase-N.md
roles:
  primary: Orchestrator
  optional:
    - Reviewer
gates:
  - implementation_review_complete
---

# Purpose

Check whether completed changes satisfy the approved artifacts and whether the verification evidence is meaningful.

# When To Use

Use this skill after a work package finishes and before merge, pull request, or final completion claims.

# Inputs

Required inputs are the implementation plan, changed files, and verification evidence. Optional inputs include spec, phase, and execution digest artifacts.

# Workflow

1. Read the implementation plan and changed files.
2. Compare the changes to the approved scope.
3. Evaluate whether tests or validation exercise the changed behavior.
4. Identify regressions, missing cases, and maintainability risks.
5. Write findings ordered by severity.
6. State residual risk and test gaps.
7. Write the implementation review artifact.

# Gates

- `implementation_review_complete`: Required before review findings are used to update work state.

# Outputs

The output is an implementation review artifact with verdict, findings, test-quality assessment, and residual risk.

# Adapter Notes

Use a Reviewer role separate from the Implementer role when possible.

# Failure Modes

If verification evidence is absent, mark the review as blocked. If critical findings are present, the Orchestrator must not advance the completion gate.
