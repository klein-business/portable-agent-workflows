---
name: execute-work-package
version: 1.0
domain_model: agent-work-v1
description: Use when executing a bounded implementation unit through blueprint, approval, execution, and digest.
triggers:
  - execute work package
  - implement phase
  - apply approved implementation plan
inputs:
  required:
    - implementation_plan
    - work_package_scope
  optional:
    - review_findings
    - verify_command
outputs:
  artifacts:
    - code changes
    - execution digest
roles:
  primary: Orchestrator
  optional:
    - Implementer
    - Reviewer
gates:
  - work_package_approval
  - verification_passed
---

# Purpose

Execute a bounded unit of work without losing control of scope, verification, or ownership.

# When To Use

Use this skill when an implementation plan is ready and files need to be changed.

# Inputs

Required inputs are the implementation plan and the exact work package scope. Optional inputs include review findings and a preferred verify command.

# Workflow

1. Read the implementation plan and work package scope.
2. Produce a blueprint with files to change, ordered steps, and one primary verify command.
3. Wait for `work_package_approval`.
4. Execute only the approved blueprint.
5. Run the verify command.
6. Apply minimal fixes only when they stay inside the approved scope.
7. Return a digest with outcome, files changed, verification result, and residual risk.

# Gates

- `work_package_approval`: Required before files are changed.
- `verification_passed`: Required before the work package is considered complete.

# Outputs

The outputs are code or artifact changes plus an execution digest. The digest must include verification command, exit result, changed files, and any follow-up risk.

# Adapter Notes

Use an Implementer role when the harness supports bounded write delegation. Keep Git operations with the Orchestrator.

# Failure Modes

If execution reveals scope changes, stop and request a new gate. If verification fails after targeted fixes, return the failing evidence and do not claim completion.
