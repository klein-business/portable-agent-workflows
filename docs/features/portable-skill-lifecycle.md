---
type: documentation
entity: feature
feature: "portable-skill-lifecycle"
version: 1.1
---

# Feature: portable-skill-lifecycle

> Part of [Portable Agent Workflows](../overview.md)

## Summary

Portable Skill Lifecycle gives agents a repeatable, harness-neutral way to turn rough ideas and requests into approved directions, durable specs, plans, implementation work, reviews, state updates, and handovers.

## How It Works

The lifecycle is modeled as skill artifacts. Each skill declares triggers, required inputs, outputs, roles, gates, and failure modes so future agents can resume from files instead of hidden chat context.

### User Flow

1. A user makes a request or asks to change the workflow model.
2. The agent uses `shape-idea` when the request still needs design exploration.
3. The agent chooses the next matching portable skill and checks required inputs.
4. The agent creates or updates persistent artifacts under `.agent-work/`.
5. Gates are handled explicitly before risky scope changes, file edits, verification claims, or handovers.
6. Later sessions continue by reading artifacts rather than reconstructing decisions from chat.

### Technical Flow

1. Skill frontmatter declares `domain_model: agent-work-v1`, roles, gates, and output artifact paths.
2. `shape-idea` produces an approved design direction when the request is not precise enough for a spec.
3. The workflow body defines ordered steps and failure modes.
4. Adapters translate role intent into concrete harness execution behavior.
5. Artifacts such as `spec.md`, `plan.md`, `phase-1.md`, reviews, and handovers store state.
6. Tests verify skill structure and gate consistency against the glossary.

## Implementation

| Module | Symbols | Role |
|--------|---------|------|
| [domain-model](../modules/domain-model.md) | `Skill`, `Artifact`, `Gate`, `Role`, `V1 gate vocabulary` | Defines the vocabulary that makes lifecycle steps portable. |
| [skills](../modules/skills.md) | `shape-idea`, `shape-spec`, `create-phased-plan`, `verify-implementation-plan`, `execute-work-package`, `review-artifact`, `review-implementation`, `update-work-state`, `create-handover`, `write-portable-skill` | Implements the lifecycle as reusable workflows. |
| [lifecycle-example](../modules/lifecycle-example.md) | `Portable Agent Work Example`, `Handover: 2026-05-19` | Demonstrates the complete lifecycle artifact sequence. |
| [validation-tests](../modules/validation-tests.md) | `test_all_portable_skills_have_required_metadata_and_sections`, `test_skill_frontmatter_gates_are_defined_in_glossary` | Guards lifecycle shape and gate definitions. |

## Configuration

No runtime configuration is required. Skill selection is based on trigger phrases and task fit. All V1 skills use `domain_model: agent-work-v1`.

## Edge Cases & Limitations

- The lifecycle is structural and procedural; it does not replace domain expertise for deciding scope.
- Tests verify required shape, not the semantic quality of every future skill workflow.
- Real harness execution still depends on adapter quality and the available capabilities in the active environment.

## Related Features

- [Harness Adapters](harness-adapters.md)
- [Artifact Validation](artifact-validation.md)
