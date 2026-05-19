---
type: documentation
entity: feature
feature: "artifact-validation"
version: 1.0
---

# Feature: artifact-validation

> Part of [Portable Agent Work Model](../overview.md)

## Summary

Artifact Validation provides executable checks that keep the domain model, adapters, skills, and lifecycle example structurally aligned as the repository evolves.

## How It Works

The validation suite reads Markdown artifacts from `.agent-work/`, extracts frontmatter where needed, and checks cross-artifact consistency. It is intended to catch structural drift early when skills, gates, adapters, or example artifacts change.

### User Flow

1. A contributor changes glossary, adapter, skill, or lifecycle artifact files.
2. The contributor runs `uv run pytest tests/ -v`.
3. The suite reports missing terms, missing roles, missing sections, undefined gates, or lifecycle artifact inconsistencies.
4. The contributor fixes the artifact graph before committing.

### Technical Flow

1. `tests/test_agent_work_artifacts.py` locates `.agent-work/`.
2. Constants define required terms, roles, skills, skill keys, skill sections, and example artifacts.
3. Helper functions read files and parse frontmatter.
4. Test functions compare actual artifacts against expected structure.
5. Ruff checks keep the Python validation code consistent.

## Implementation

| Module | Symbols | Role |
|--------|---------|------|
| [validation-tests](../modules/validation-tests.md) | `REQUIRED_TERMS`, `REQUIRED_ROLES`, `REQUIRED_SKILLS`, `EXAMPLE_ARTIFACTS` | Defines structural expectations. |
| [validation-tests](../modules/validation-tests.md) | `_frontmatter`, `_frontmatter_value`, `_frontmatter_list` | Parses Markdown frontmatter for assertions. |
| [validation-tests](../modules/validation-tests.md) | `test_glossary_defines_domain_model_terms_and_roles`, `test_all_portable_skills_have_required_metadata_and_sections`, `test_example_plan_contains_required_artifacts_with_frontmatter` | Executes the main consistency checks. |
| [domain-model](../modules/domain-model.md) | `V1 gate vocabulary` | Provides the gate definitions that skill frontmatter must reference. |
| [adapters](../modules/adapters.md) | `Codex Adapter`, `OpenCode Adapter` | Provides adapter documents checked for role and capability mapping. |
| [lifecycle-example](../modules/lifecycle-example.md) | `Portable Agent Work Example` | Provides the sample artifact lifecycle checked by tests. |

## Configuration

`pyproject.toml` configures pytest to use `tests/` and ruff to target Python 3.11 with a 100-character line length.

## Edge Cases & Limitations

- Frontmatter parsing is intentionally simple and expects the repository's current Markdown shape.
- Validation checks structure and cross-reference consistency; it does not deeply parse YAML or Markdown semantics.
- The example review artifacts contain sample verification evidence, not current CI output.

## Related Features

- [Portable Skill Lifecycle](portable-skill-lifecycle.md)
- [Harness Adapters](harness-adapters.md)
