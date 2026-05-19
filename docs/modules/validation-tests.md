---
type: documentation
entity: module
module: "validation-tests"
version: 1.0
---

# Module: validation-tests

> Part of [Portable Agent Work Model](../overview.md)

## Overview

The validation-tests module verifies that the Markdown artifacts remain structurally coherent. It checks required glossary terms, adapter sections, skill metadata, gate definitions, generated harness currentness, and example lifecycle frontmatter.

### Responsibility

This module is responsible for structural validation only. It does not execute a real harness workflow, validate all Markdown prose semantically, or prove production readiness for future skills.

### Dependencies

| Dependency | Type | Purpose |
|-----------|------|---------|
| Domain Model | module | Source for terms, roles, and gate vocabulary tested by the suite. |
| Adapters | module | Source for required role and capability mapping sections. |
| Skills | module | Source for skill metadata and required body sections. |
| Lifecycle Example | module | Source for example artifact existence, kinds, and statuses. |
| `pytest` | library | Runs the validation tests. |
| `ruff` | library | Checks and formats the Python test file. |

## Structure

| Path | Type | Purpose |
|------|------|---------|
| `tests/` | dir | Contains repository validation tests. |
| `tests/test_agent_work_artifacts.py` | file | Structural validation suite for `.agent-work/` artifacts. |
| `tests/test_harness_integrations.py` | file | Validation suite for generated native harness integration files. |
| `pyproject.toml` | file | Declares Python version, dev dependencies, pytest test path, and ruff settings. |

## Key Symbols

| Symbol | Kind | Visibility | Location | Purpose |
|--------|------|------------|----------|---------|
| `REPO_ROOT` | const | internal | `tests/test_agent_work_artifacts.py:6` | Locates the repository root from the test file. |
| `AGENT_WORK` | const | internal | `tests/test_agent_work_artifacts.py:7` | Locates the `.agent-work` artifact root. |
| `REQUIRED_TERMS` | const | internal | `tests/test_agent_work_artifacts.py:9` | Lists glossary terms that must remain defined. |
| `REQUIRED_ROLES` | const | internal | `tests/test_agent_work_artifacts.py:25` | Lists logical roles required by the domain model and adapters. |
| `REQUIRED_SKILLS` | const | internal | `tests/test_agent_work_artifacts.py:34` | Lists the expected V1 portable skills. |
| `REQUIRED_SKILL_KEYS` | const | internal | `tests/test_agent_work_artifacts.py:47` | Lists required skill frontmatter keys. |
| `REQUIRED_SKILL_SECTIONS` | const | internal | `tests/test_agent_work_artifacts.py:59` | Lists required skill body sections. |
| `EXAMPLE_ARTIFACTS` | const | internal | `tests/test_agent_work_artifacts.py:70` | Maps required lifecycle example paths to expected artifact kinds. |
| `_read` | function | internal | `tests/test_agent_work_artifacts.py:83` | Reads artifact text as UTF-8. |
| `_frontmatter` | function | internal | `tests/test_agent_work_artifacts.py:87` | Extracts Markdown frontmatter and asserts that it is closed. |
| `_frontmatter_value` | function | internal | `tests/test_agent_work_artifacts.py:95` | Extracts scalar frontmatter values. |
| `_frontmatter_list` | function | internal | `tests/test_agent_work_artifacts.py:101` | Extracts frontmatter list values such as skill gates. |
| `test_glossary_defines_domain_model_terms_and_roles` | function | internal | `tests/test_agent_work_artifacts.py:107` | Verifies required terms, roles, and `agent-work-v1` are present in the glossary. |
| `test_adapters_map_roles_and_capabilities` | function | internal | `tests/test_agent_work_artifacts.py:119` | Verifies both adapters expose role mapping, capability mapping, boundaries, and all required roles. |
| `test_all_portable_skills_have_required_metadata_and_sections` | function | internal | `tests/test_agent_work_artifacts.py:133` | Verifies skill set completeness, metadata keys, required sections, domain model, and forbidden harness-specific terms. |
| `test_skill_frontmatter_gates_are_defined_in_glossary` | function | internal | `tests/test_agent_work_artifacts.py:155` | Verifies skill gate names are present in the glossary vocabulary. |
| `test_example_plan_contains_required_artifacts_with_frontmatter` | function | internal | `tests/test_agent_work_artifacts.py:165` | Verifies required lifecycle artifacts, kinds, domain model, and status fields. |
| `test_example_plan_phase_and_todo_statuses_agree_as_completed` | function | internal | `tests/test_agent_work_artifacts.py:178` | Verifies plan, phase, and todo statuses agree as completed. |
| `GENERATED_FILES` | const | internal | `tests/test_harness_integrations.py:9` | Lists generated harness integration files that must exist. |
| `MARKER` | const | internal | `tests/test_harness_integrations.py:16` | Defines the generated-file marker required in every native harness file. |
| `test_generated_harness_files_exist_with_marker_and_agent_work_references` | function | internal | `tests/test_harness_integrations.py:24` | Verifies generated files exist, are marked, reference `.agent-work/`, and avoid redefining the domain model. |
| `test_generated_harness_files_are_current` | function | internal | `tests/test_harness_integrations.py:33` | Runs generator `--check` to prevent stale generated files. |

## Data Flow

Tests load files from `.agent-work/`, parse frontmatter with simple regular expressions, and assert consistency between the glossary, adapter files, skill definitions, lifecycle example artifacts, and generated native harness files.

## Configuration

`pyproject.toml` sets `testpaths = ["tests"]`, Python target `py311`, ruff line length `100`, and dev dependencies `pytest` and `ruff`.

## Inventory Notes

- **Coverage**: full
- **Notes**: Inventory covers every test helper, constant, test function, and configuration file relevant to validation.
