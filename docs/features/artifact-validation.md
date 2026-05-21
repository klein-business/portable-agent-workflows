---
type: documentation
entity: feature
feature: "artifact-validation"
version: 1.2
---

# Feature: artifact-validation

> Part of [Portable Agent Workflows](../overview.md)

## Summary

Artifact Validation provides executable checks that keep the domain model, adapters, skills, lifecycle example, enterprise foundation, npm package metadata, release metadata, and generated or distributed harness files structurally aligned as the repository evolves.

## How It Works

The validation suite reads Markdown artifacts from `.agent-work/`, extracts frontmatter where needed, checks cross-artifact consistency, runs generator currentness checks, and verifies the npm package surface. It is intended to catch structural drift early when skills, gates, adapters, generated files, package metadata, or example artifacts change.

### User Flow

1. A contributor changes glossary, adapter, skill, generator, template, generated entrypoint, package metadata, or lifecycle artifact files.
2. The contributor runs `npm run check:node`.
3. The contributor runs `uv run python tools/generate_harness_integrations.py --check`.
4. The contributor runs `uv run pytest tests/ -v`.
5. The suite reports missing terms, missing roles, missing sections, undefined gates, stale generated files, package metadata regressions, or lifecycle artifact inconsistencies.
5. The contributor fixes the artifact graph before committing.

### Technical Flow

1. `tests/test_agent_work_artifacts.py` locates `.agent-work/`.
2. Constants define required terms, roles, skills, skill keys, skill sections, and example artifacts.
3. Helper functions read files and parse frontmatter.
4. Test functions compare actual artifacts against expected structure.
5. `tests/test_harness_integrations.py` verifies generated files and generator currentness.
6. `tests/test_enterprise_foundation.py` verifies governance, admin, security, README, and license entrypoints.
7. `tests/node/*.test.mjs` verifies CLI parsing, project-local init/check behavior, package contents, publish dry-run behavior, and npm metadata.
8. Ruff checks keep the Python validation and generator code consistent.

## Implementation

| Module | Symbols | Role |
|--------|---------|------|
| [validation-tests](../modules/validation-tests.md) | `REQUIRED_TERMS`, `REQUIRED_ROLES`, `REQUIRED_SKILLS`, `EXAMPLE_ARTIFACTS`, `GENERATED_FILES` | Defines structural expectations. |
| [validation-tests](../modules/validation-tests.md) | `_frontmatter`, `_frontmatter_value`, `_frontmatter_list` | Parses Markdown frontmatter for assertions. |
| [validation-tests](../modules/validation-tests.md) | `test_glossary_defines_domain_model_terms_and_roles`, `test_all_portable_skills_have_required_metadata_and_sections`, `test_example_plan_contains_required_artifacts_with_frontmatter`, `test_generated_harness_files_are_current` | Executes the main consistency checks. |
| [validation-tests](../modules/validation-tests.md) | `test_package_metadata_defines_the_npm_distribution_skeleton`, `test_npm_publish_dry_run_preserves_bin_metadata_without_auto_correction` | Protects npm package metadata and publish shape. |
| [domain-model](../modules/domain-model.md) | `V1 gate vocabulary` | Provides the gate definitions that skill frontmatter must reference. |
| [adapters](../modules/adapters.md) | `Codex Adapter`, `OpenCode Adapter`, `Claude Adapter`, `Cursor Adapter` | Provides adapter documents checked for role and capability mapping. |
| [harness-generator](../modules/harness-generator.md) | `GENERATED_FILES`, `check_all`, `main` | Provides generated-file currentness behavior. |
| [lifecycle-example](../modules/lifecycle-example.md) | `Portable Agent Work Example` | Provides the sample artifact lifecycle checked by tests. |

## Configuration

`package.json` configures Node checks through `npm run check:node`. `pyproject.toml` configures pytest to use `tests/` and ruff to target Python 3.11 with a 100-character line length. Generated-file currentness is checked with `uv run python tools/generate_harness_integrations.py --check`.

## Edge Cases & Limitations

- Frontmatter parsing is intentionally simple and expects the repository's current Markdown shape.
- Validation checks structure, generated-file currentness, package metadata, and cross-reference consistency; it does not deeply parse YAML or Markdown semantics.
- The example review artifacts contain sample verification evidence, not current CI output.

## Related Features

- [Portable Skill Lifecycle](portable-skill-lifecycle.md)
- [Harness Adapters](harness-adapters.md)
