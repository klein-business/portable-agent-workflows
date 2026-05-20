---
type: documentation
entity: module
module: "validation-tests"
version: 1.1
---

# Module: validation-tests

> Part of [Portable Agent Workflows](../overview.md)

## Overview

The validation-tests module verifies that the Markdown artifacts remain structurally coherent. It checks required glossary terms, adapter sections, skill metadata, gate definitions, generated harness currentness, example lifecycle frontmatter, enterprise foundation files, public-readiness files, and license metadata.

### Responsibility

This module is responsible for structural validation only. It does not execute a real harness workflow, validate all Markdown prose semantically, or prove production readiness for future skills.

### Dependencies

| Dependency | Type | Purpose |
|-----------|------|---------|
| Domain Model | module | Source for terms, roles, and gate vocabulary tested by the suite. |
| Adapters | module | Source for required role and capability mapping sections. |
| Skills | module | Source for skill metadata and required body sections. |
| Harness Generator | module | Source for generated native harness files and currentness checks. |
| Lifecycle Example | module | Source for example artifact existence, kinds, and statuses. |
| `pytest` | library | Runs the validation tests. |
| `ruff` | library | Checks and formats the Python test file. |

## Structure

| Path | Type | Purpose |
|------|------|---------|
| `tests/` | dir | Contains repository validation tests. |
| `tests/test_agent_work_artifacts.py` | file | Structural validation suite for `.agent-work/` artifacts. |
| `tests/test_harness_integrations.py` | file | Validation suite for generated native harness integration files. |
| `tests/test_enterprise_foundation.py` | file | Validation suite for enterprise governance, security, admin, reference, and compatibility artifacts. |
| `tools/check_markdown_links.py` | file | Repository-owned local Markdown link checker used by CI and quality gates. |
| `pyproject.toml` | file | Declares Python version, dev dependencies, pytest test path, and ruff settings. |

## Key Symbols

| Symbol | Kind | Visibility | Location | Purpose |
|--------|------|------------|----------|---------|
| `REPO_ROOT` | const | internal | `tests/test_agent_work_artifacts.py:6` | Locates the repository root from the test file. |
| `AGENT_WORK` | const | internal | `tests/test_agent_work_artifacts.py:7` | Locates the `.agent-work` artifact root. |
| `REQUIRED_TERMS` | const | internal | `tests/test_agent_work_artifacts.py:9` | Lists glossary terms that must remain defined. |
| `REQUIRED_ROLES` | const | internal | `tests/test_agent_work_artifacts.py:25` | Lists logical roles required by the domain model and adapters. |
| `REQUIRED_SKILLS` | const | internal | `tests/test_agent_work_artifacts.py:34` | Lists the expected V1 portable skills. |
| `REQUIRED_ADAPTERS` | const | internal | `tests/test_agent_work_artifacts.py:48` | Lists required harness adapters. |
| `REQUIRED_SKILL_KEYS` | const | internal | `tests/test_agent_work_artifacts.py:55` | Lists required skill frontmatter keys. |
| `REQUIRED_SKILL_SECTIONS` | const | internal | `tests/test_agent_work_artifacts.py:67` | Lists required skill body sections. |
| `EXAMPLE_ARTIFACTS` | const | internal | `tests/test_agent_work_artifacts.py:78` | Maps required lifecycle example paths to expected artifact kinds. |
| `_read` | function | internal | `tests/test_agent_work_artifacts.py:91` | Reads artifact text as UTF-8. |
| `_frontmatter` | function | internal | `tests/test_agent_work_artifacts.py:95` | Extracts Markdown frontmatter and asserts that it is closed. |
| `_frontmatter_value` | function | internal | `tests/test_agent_work_artifacts.py:103` | Extracts scalar frontmatter values. |
| `_frontmatter_list` | function | internal | `tests/test_agent_work_artifacts.py:109` | Extracts frontmatter list values such as skill gates. |
| `test_glossary_defines_domain_model_terms_and_roles` | function | internal | `tests/test_agent_work_artifacts.py:115` | Verifies required terms, roles, and `agent-work-v1` are present in the glossary. |
| `test_adapters_map_roles_and_capabilities` | function | internal | `tests/test_agent_work_artifacts.py:127` | Verifies adapters expose role mapping, capability mapping, boundaries, and all required roles. |
| `test_all_portable_skills_have_required_metadata_and_sections` | function | internal | `tests/test_agent_work_artifacts.py:141` | Verifies skill set completeness, metadata keys, required sections, domain model, and forbidden harness-specific terms. |
| `test_skill_frontmatter_gates_are_defined_in_glossary` | function | internal | `tests/test_agent_work_artifacts.py:163` | Verifies skill gate names are present in the glossary vocabulary. |
| `test_example_plan_contains_required_artifacts_with_frontmatter` | function | internal | `tests/test_agent_work_artifacts.py:173` | Verifies required lifecycle artifacts, kinds, domain model, and status fields. |
| `test_example_plan_phase_and_todo_statuses_agree_as_completed` | function | internal | `tests/test_agent_work_artifacts.py:186` | Verifies plan, phase, and todo statuses agree as completed. |
| `GENERATED_FILES` | const | internal | `tests/test_harness_integrations.py:9` | Lists generated harness integration files that must exist. |
| `MARKER` | const | internal | `tests/test_harness_integrations.py:16` | Defines the generated-file marker required in every native harness file. |
| `test_generated_harness_files_exist_with_marker_and_agent_work_references` | function | internal | `tests/test_harness_integrations.py:23` | Verifies generated files exist, are marked, reference `.agent-work/`, and avoid redefining the domain model. |
| `test_generated_harness_files_are_current` | function | internal | `tests/test_harness_integrations.py:33` | Runs generator `--check` to prevent stale generated files. |
| `REQUIRED_ENTERPRISE_FILES` | const | internal | `tests/test_enterprise_foundation.py:10` | Lists governance, security, admin, CI, license, code of conduct, public-readiness, and reference files required for the enterprise foundation. |
| `SUPPORTED_HARNESSES` | const | internal | `tests/test_enterprise_foundation.py:33` | Maps adapter file names to display names expected in the compatibility matrix. |
| `REQUIRED_README_LINKS` | const | internal | `tests/test_enterprise_foundation.py:40` | Lists enterprise, license, code-of-conduct, and public-readiness entrypoints that README.md must reference. |
| `OLD_REPOSITORY_NAMES` | const | internal | `tests/test_enterprise_foundation.py:53` | Lists legacy repository names that Markdown files must not contain. |
| `PUBLIC_README_FORBIDDEN_PHRASES` | const | internal | `tests/test_enterprise_foundation.py:59` | Lists private-readiness phrases forbidden in the public README. |
| `PUBLIC_README_REQUIRED_PHRASES` | const | internal | `tests/test_enterprise_foundation.py:64` | Lists public-readiness phrases required in the public README. |
| `_read` | function | internal | `tests/test_enterprise_foundation.py:73` | Reads a repository-relative file and asserts that it exists. |
| `_frontmatter` | function | internal | `tests/test_enterprise_foundation.py:79` | Extracts required Markdown frontmatter from `.agent-work` artifacts. |
| `_all_markdown_files` | function | internal | `tests/test_enterprise_foundation.py:87` | Uses tracked Markdown files as the scan set for legacy-name validation. |
| `test_required_enterprise_files_exist` | function | internal | `tests/test_enterprise_foundation.py:98` | Verifies all required enterprise and public community/public-readiness files exist. |
| `test_readme_links_to_enterprise_entrypoints` | function | internal | `tests/test_enterprise_foundation.py:103` | Verifies README.md links to governance, security, admin, license, code of conduct, public-readiness, and reference entrypoints. |
| `test_compatibility_matrix_covers_all_adapters` | function | internal | `tests/test_enterprise_foundation.py:118` | Verifies the compatibility matrix covers each supported adapter and required policy sections. |
| `test_agent_work_artifacts_have_required_frontmatter` | function | internal | `tests/test_enterprise_foundation.py:134` | Verifies `.agent-work` Markdown artifacts keep required frontmatter and `agent-work-v1`. |
| `test_governance_docs_define_enterprise_rules` | function | internal | `tests/test_enterprise_foundation.py:154` | Verifies governance and admin documents contain required enterprise policy terms. |
| `test_license_is_mit` | function | internal | `tests/test_enterprise_foundation.py:173` | Verifies the repository license is MIT and uses the expected copyright owner. |
| `test_public_launch_readme_is_ready` | function | internal | `tests/test_enterprise_foundation.py:181` | Verifies README.md presents the repository as public, open-source, and contribution-ready. |
| `test_process_history_is_explained_for_public_readers` | function | internal | `tests/test_enterprise_foundation.py:191` | Verifies docs explain `docs/superpowers/` as design and planning history. |
| `test_markdown_files_do_not_reference_old_repository_name` | function | internal | `tests/test_enterprise_foundation.py:199` | Verifies tracked Markdown files do not reference legacy repository names. |
| `markdown_files` | function | public | `tools/check_markdown_links.py:13` | Returns Markdown files under a root while skipping ignored directories. |
| `markdown_link_targets` | function | public | `tools/check_markdown_links.py:21` | Extracts raw inline Markdown link targets from text. |
| `parse_markdown_link_target` | function | public | `tools/check_markdown_links.py:42` | Parses a single Markdown link target, including nested parentheses and angle-bracket targets. |
| `local_link_target` | function | public | `tools/check_markdown_links.py:79` | Normalizes local link targets and filters anchors, empty targets, and external schemes. |
| `strip_markdown_title` | function | public | `tools/check_markdown_links.py:99` | Removes optional Markdown link titles from raw targets. |
| `resolve_local_target` | function | public | `tools/check_markdown_links.py:108` | Resolves a local Markdown target relative to the repository root or source file. |
| `find_missing_links` | function | public | `tools/check_markdown_links.py:115` | Scans Markdown files and returns unresolved or out-of-root local links. |
| `main` | function | public | `tools/check_markdown_links.py:133` | Implements the command-line local Markdown link check. |

## Data Flow

Tests load files from `.agent-work/`, parse frontmatter with simple regular expressions, assert consistency between the glossary, adapter files, skill definitions, lifecycle example artifacts, generated harness files, and enterprise foundation documents, then run the harness generator and Markdown link checker to prevent generated-file and documentation-link drift.

## Configuration

`pyproject.toml` sets `testpaths = ["tests"]`, Python target `py311`, ruff line length `100`, and dev dependencies `pytest` and `ruff`.

## Enterprise Foundation Validation

Enterprise validation is implemented in `tests/test_enterprise_foundation.py`.

It checks:

- required enterprise, public community, and public-readiness files exist
- README links to governance, security, contribution, license, code of conduct, public-readiness, admin, and reference entrypoints
- README does not present the repository as private
- public process history is clearly framed for readers
- compatibility matrix covers all supported adapters
- `.agent-work` artifacts retain required frontmatter and `agent-work-v1`
- governance documents define release, compatibility, deprecation, and GitHub settings rules
- the root license is MIT
- Markdown files do not reference the old repository name

`tools/check_markdown_links.py` provides the repository-owned local Markdown link check used by CI.

## Inventory Notes

- **Coverage**: full
- **Notes**: Inventory covers every test helper, constant, test function, link-check helper, and configuration file relevant to validation.
