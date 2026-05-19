---
type: artifact
kind: glossary
domain_model: agent-work-v1
status: approved
created: 2026-05-19
updated: 2026-05-19
---

# Agent Work Glossary

This glossary is the vocabulary source for the `agent-work-v1` domain model.

## Core Terms

### Capability

A technical ability exposed by a harness, plugin, or local environment. Examples include filesystem access, shell access, browser access, web access, GitHub access, and subagent execution.

### Skill

A reusable work instruction with triggers, inputs, workflow, gates, expected outputs, and failure handling.

### Artifact

A persistent file that carries work state across agents and sessions.

### Spec

An approved problem, goal, and design description. A spec defines why the work matters and what outcome is expected.

### Plan

A phased implementation structure with scope, definition of done, risks, and ordering.

### Phase

A bounded delivery unit inside a plan with explicit acceptance criteria.

### Implementation Plan

A concrete technical approach for exactly one phase. It defines how the phase will be implemented and verified.

### Work Package

An executable unit of work with explicit inputs, scope, verification, and result digest.

### Gate

An explicit checkpoint before a risky or externally visible next action.

### Review

An independent assessment of an artifact or implementation against defined criteria.

### Handover

A persistent transfer artifact containing current state, decisions, open questions, and the next useful step.

### Role

A logical responsibility that can be mapped to different harness tools or agent types.

### Adapter

A harness-specific mapping from neutral roles and capabilities to concrete tools, agents, commands, or workflows.

## Role Definitions

- `Orchestrator`: Owns user interaction, gates, scope decisions, artifact coordination, and Git operations.
- `Explorer`: Reads code, docs, logs, or external sources and returns compact findings.
- `Planner`: Creates or updates spec, plan, phase, and implementation-plan artifacts.
- `Implementer`: Changes files inside a work package and verifies the result.
- `Reviewer`: Independently reviews artifacts or implementations against criteria.
- `Maintainer`: Updates work state, changelog, handovers, and integration status.

## Artifact Kinds

- `glossary`: Vocabulary and domain model definitions.
- `adapter`: Harness mapping for roles and capabilities.
- `skill`: Portable work instruction.
- `spec`: Approved problem and design description.
- `plan`: Phased scope and delivery structure.
- `phase`: Bounded delivery unit.
- `implementation-plan`: Technical implementation approach for a phase.
- `review`: Independent assessment.
- `handover`: Session transfer state.
- `todo`: Trackable work-state list.

## Required Gates

- `spec_approval`: Required before converting a spec into a plan.
- `plan_approval`: Required before implementation planning for large or risky scope.
- `work_package_approval`: Required before changing files.
- `verification_passed`: Required before work is considered complete.

## V1 Gate Vocabulary

These are the centralized `agent-work-v1` gate names used by portable skills.

- `domain_terms_approved`: Required before new or changed domain terms become source vocabulary for dependent artifacts or skills.
- `skill_scope_confirmed`: Required before authoring or changing a portable skill's responsibilities and boundaries.
- `skill_review_complete`: Required before a portable skill is used as a source of truth.
- `spec_approval`: Required before converting a spec into a plan.
- `plan_approval`: Required before implementation planning for large, risky, or multi-phase work.
- `implementation_plan_ready`: Required before a phase implementation plan becomes executable as a work package.
- `work_package_approval`: Required before changing files.
- `verification_passed`: Required before work is considered complete.
- `review_scope_confirmed`: Required before an artifact review starts.
- `implementation_review_complete`: Required before implementation review findings are used to update work state.
- `state_change_confirmed`: Required before state transitions that affect phase completion or next action.
- `handover_ready`: Required before a handover is treated as current transfer state.

## Design Rules

- Skills describe behavior.
- Artifacts store state.
- Roles define responsibility.
- Capabilities define technical possibility.
- Adapters translate neutral intent into harness-specific execution.
- Chat history is not durable state.
