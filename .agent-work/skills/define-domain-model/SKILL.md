---
name: define-domain-model
version: 1.0
domain_model: agent-work-v1
description: Use when creating or changing the glossary, roles, artifact kinds, gates, or adapter conventions.
triggers:
  - define domain model
  - update glossary
  - change artifact vocabulary
inputs:
  required:
    - domain_model_change_request
  optional:
    - existing_glossary
    - affected_skills
outputs:
  artifacts:
    - .agent-work/glossary.md
roles:
  primary: Orchestrator
  optional:
    - Explorer
    - Reviewer
gates:
  - domain_terms_approved
---

# Purpose

Maintain the domain vocabulary that all portable skills and artifacts use.

# When To Use

Use this skill before adding or changing core terms, role meanings, artifact kinds, required gates, or adapter responsibilities.

# Inputs

The required input is a clear change request. Optional inputs include affected skills, existing adapter docs, and examples showing why the vocabulary needs to change.

# Workflow

1. Read `.agent-work/glossary.md`.
2. Identify the exact terms, roles, artifact kinds, or gates affected.
3. Check whether an existing term already covers the need.
4. Propose the smallest vocabulary change that removes ambiguity.
5. Update the glossary with definitions and design rules.
6. List affected skills and adapters that need follow-up updates.

# Gates

- `domain_terms_approved`: The Orchestrator approves new or changed domain terms before dependent skills are updated.

# Outputs

The output is an updated `.agent-work/glossary.md` and a short list of affected follow-up artifacts.

# Adapter Notes

Adapters may map terms differently to concrete harness capabilities, but they must not redefine the vocabulary.

# Failure Modes

If a requested term overlaps an existing term, keep the existing term and clarify its definition. If the change would affect many skills, stop after updating the glossary and create a work-state note for dependent updates.
