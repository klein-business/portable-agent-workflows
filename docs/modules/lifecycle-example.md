---
type: documentation
entity: module
module: "lifecycle-example"
version: 1.0
---

# Module: lifecycle-example

> Part of [Portable Agent Work Model](../overview.md)

## Overview

The lifecycle-example module is a complete sample plan directory. It shows how `agent-work-v1` stores durable state from approved spec through handover.

### Responsibility

This module is responsible for demonstrating artifact shape, frontmatter, status flow, and completed plan state. It is not responsible for proving that every future real workflow is semantically complete.

### Dependencies

| Dependency | Type | Purpose |
|-----------|------|---------|
| Domain Model | module | Supplies artifact kinds, statuses, and the `agent-work-v1` frontmatter field. |
| Skills | module | Defines the workflows represented by the example artifacts. |
| Validation Tests | module | Verifies that required example artifacts exist and expose coherent frontmatter. |

## Structure

| Path | Type | Purpose |
|------|------|---------|
| `.agent-work/plans/` | dir | Root directory for persistent plan directories. |
| `.agent-work/plans/portable-agent-work-example/` | dir | Complete example lifecycle. |
| `.agent-work/plans/portable-agent-work-example/spec.md` | file | Approved scope and design for the example. |
| `.agent-work/plans/portable-agent-work-example/plan.md` | file | Completed phased plan and definition of done. |
| `.agent-work/plans/portable-agent-work-example/phases/` | dir | Phase artifact directory. |
| `.agent-work/plans/portable-agent-work-example/phases/phase-1.md` | file | Completed phase with acceptance criteria. |
| `.agent-work/plans/portable-agent-work-example/implementation/` | dir | Implementation-plan artifact directory. |
| `.agent-work/plans/portable-agent-work-example/implementation/phase-1-impl.md` | file | Technical approach and verification command for the phase. |
| `.agent-work/plans/portable-agent-work-example/reviews/` | dir | Review artifact directory. |
| `.agent-work/plans/portable-agent-work-example/reviews/plan-review.md` | file | Review of the plan artifact. |
| `.agent-work/plans/portable-agent-work-example/reviews/impl-plan-review-phase-1.md` | file | Review of the implementation plan. |
| `.agent-work/plans/portable-agent-work-example/reviews/impl-review-phase-1.md` | file | Review of completed phase implementation and verification evidence. |
| `.agent-work/plans/portable-agent-work-example/handovers/` | dir | Handover artifact directory. |
| `.agent-work/plans/portable-agent-work-example/handovers/session-2026-05-19.md` | file | Session transfer state with decisions, changed files, verification, and next step. |
| `.agent-work/plans/portable-agent-work-example/todo.md` | file | Completed todo checklist for the example lifecycle. |

## Key Symbols

| Symbol | Kind | Visibility | Location | Purpose |
|--------|------|------------|----------|---------|
| `Portable Agent Work Example` | plan | public | `.agent-work/plans/portable-agent-work-example/plan.md:10` | Demonstrates the complete artifact lifecycle. |
| `Spec: Portable Agent Work Example` | spec | public | `.agent-work/plans/portable-agent-work-example/spec.md:10` | Records the goal, scope, non-goals, design, and validation strategy. |
| `Phase 1: Artifact Lifecycle Sample` | phase | public | `.agent-work/plans/portable-agent-work-example/phases/phase-1.md:10` | Defines the bounded sample phase and acceptance criteria. |
| `Implementation Plan: Phase 1` | implementation-plan | public | `.agent-work/plans/portable-agent-work-example/implementation/phase-1-impl.md:10` | Defines affected files and verification command for the sample. |
| `Plan Review` | review | public | `.agent-work/plans/portable-agent-work-example/reviews/plan-review.md:10` | Records review acceptance for the plan artifact. |
| `Implementation Plan Review: Phase 1` | review | public | `.agent-work/plans/portable-agent-work-example/reviews/impl-plan-review-phase-1.md:10` | Records review acceptance for the implementation plan. |
| `Implementation Review: Phase 1` | review | public | `.agent-work/plans/portable-agent-work-example/reviews/impl-review-phase-1.md:10` | Records review acceptance and verification evidence for the implementation. |
| `Handover: 2026-05-19` | handover | public | `.agent-work/plans/portable-agent-work-example/handovers/session-2026-05-19.md:10` | Captures continuation state and next useful step. |
| `Todo: Portable Agent Work Example` | todo | public | `.agent-work/plans/portable-agent-work-example/todo.md:10` | Tracks completed lifecycle checklist items. |

## Data Flow

The example begins with an approved spec, converts it into a completed plan and phase, records an implementation plan, captures reviews, updates todo state, and ends with a handover. Tests read the same directory to ensure expected artifact kinds and completion statuses remain present.

## Configuration

No runtime configuration is required. The example uses static dates and frontmatter values for a completed sample.

## Inventory Notes

- **Coverage**: full
- **Notes**: Inventory covers every file under `.agent-work/plans/portable-agent-work-example/` and every artifact validated by tests.
