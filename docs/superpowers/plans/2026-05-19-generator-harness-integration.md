# Generator Harness Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a generator-based native integration layer for Codex, Claude Code, and Cursor while keeping `.agent-work/` as the source of truth.

**Architecture:** The portable model remains under `.agent-work/`. A deterministic Python generator renders thin native harness files from checked-in templates, and tests enforce skill, adapter, and generated-file currentness.

**Tech Stack:** Markdown artifacts, Python 3.11+, `pytest`, `ruff`, `uv`.

---

## File Structure

- Create `.agent-work/skills/shape-idea/SKILL.md`: portable brainstorming workflow that precedes `shape-spec`.
- Create `.agent-work/adapters/claude.md`: Claude Code adapter with role, capability, and boundary mappings.
- Create `.agent-work/adapters/cursor.md`: Cursor adapter with role, capability, and boundary mappings.
- Modify `.agent-work/adapters/codex.md`: mention generated `AGENTS.md` entrypoint and `shape-idea` workflow.
- Modify `.agent-work/adapters/opencode.md`: mention generated-file source-of-truth boundary where useful.
- Create `tools/generate_harness_integrations.py`: deterministic generator with write and `--check` modes.
- Create `tools/harness_templates/agents.md.tmpl`: template for root `AGENTS.md`.
- Create `tools/harness_templates/claude.md.tmpl`: template for root `CLAUDE.md`.
- Create `tools/harness_templates/claude-shape-idea.md.tmpl`: template for Claude project command.
- Create `tools/harness_templates/cursor-agent-work.mdc.tmpl`: template for Cursor project rule.
- Generate `AGENTS.md`: Codex and Cursor fallback entrypoint.
- Generate `CLAUDE.md`: Claude project memory entrypoint.
- Generate `.claude/commands/shape-idea.md`: Claude command for idea shaping.
- Generate `.cursor/rules/agent-work.mdc`: Cursor Project Rule.
- Modify `tests/test_agent_work_artifacts.py`: include `shape-idea`, `claude`, and `cursor` in structural checks.
- Create `tests/test_harness_integrations.py`: verify generator output exists, is current, and references `.agent-work/`.
- Modify `README.md`: describe generated native integrations and `shape-idea`.
- Modify `docs/overview.md`: include generator integration and new adapters.
- Modify `docs/modules/adapters.md`: document Claude and Cursor adapters.
- Modify `docs/modules/skills.md`: document `shape-idea`.
- Modify `docs/modules/validation-tests.md`: document generator currentness tests.
- Modify `docs/features/harness-adapters.md`: include generated harness files and source-of-truth rule.
- Create `docs/features/generated-harness-integration.md`: feature doc for the generator workflow.

## Task 1: Tighten Structural Tests For Skills And Adapters

**Files:**
- Modify: `tests/test_agent_work_artifacts.py`

- [ ] **Step 1: Add the expected adapter set and `shape-idea` to the test constants**

Replace the `REQUIRED_SKILLS` block and add `REQUIRED_ADAPTERS` after it:

```python
REQUIRED_SKILLS = {
    "define-domain-model",
    "shape-idea",
    "shape-spec",
    "create-phased-plan",
    "verify-implementation-plan",
    "execute-work-package",
    "review-artifact",
    "review-implementation",
    "update-work-state",
    "create-handover",
    "write-portable-skill",
}

REQUIRED_ADAPTERS = {
    "codex",
    "opencode",
    "claude",
    "cursor",
}
```

- [ ] **Step 2: Update the adapter test to require all adapters**

Replace the first line of `test_adapters_map_roles_and_capabilities`:

```python
def test_adapters_map_roles_and_capabilities() -> None:
    for adapter_name in REQUIRED_ADAPTERS:
```

Keep the rest of the assertions unchanged.

- [ ] **Step 3: Run the focused test and verify it fails for missing files**

Run:

```bash
uv run pytest tests/test_agent_work_artifacts.py::test_adapters_map_roles_and_capabilities -v
```

Expected: FAIL because `.agent-work/adapters/claude.md` or `.agent-work/adapters/cursor.md` does not exist.

- [ ] **Step 4: Run the skill-set test and verify it fails for `shape-idea`**

Run:

```bash
uv run pytest tests/test_agent_work_artifacts.py::test_all_portable_skills_have_required_metadata_and_sections -v
```

Expected: FAIL because `.agent-work/skills/shape-idea/SKILL.md` does not exist.

- [ ] **Step 5: Commit the failing tests**

```bash
git add tests/test_agent_work_artifacts.py
git commit -m "test: require generated harness model coverage"
```

## Task 2: Add `shape-idea`, Claude Adapter, And Cursor Adapter

**Files:**
- Create: `.agent-work/skills/shape-idea/SKILL.md`
- Create: `.agent-work/adapters/claude.md`
- Create: `.agent-work/adapters/cursor.md`
- Modify: `.agent-work/adapters/codex.md`
- Modify: `.agent-work/adapters/opencode.md`

- [ ] **Step 1: Create the portable `shape-idea` skill**

Create `.agent-work/skills/shape-idea/SKILL.md`:

```markdown
---
name: shape-idea
version: 1.0
domain_model: agent-work-v1
description: Use when turning a rough idea into an approved design direction before spec or implementation planning.
triggers:
  - brainstorm
  - shape idea
  - explore design
inputs:
  required:
    - user_request
  optional:
    - repository_context
    - existing_artifacts
    - visual_context
outputs:
  artifacts:
    - approved_design_direction
roles:
  primary: Orchestrator
  optional:
    - Explorer
    - Planner
gates:
  - idea_direction_approved
---

# Purpose

Turn a rough idea into an approved design direction before creating a spec, plan, or implementation work package.

# When To Use

Use this skill before creative work, feature design, behavior changes, workflow changes, or new portable skills when the desired outcome is not already precise enough for `shape-spec`.

# Inputs

The required input is the user's request. Optional inputs include repository context, existing artifacts, examples, constraints, and visual context when the decision would benefit from diagrams or mockups.

# Workflow

1. Explore current repository and artifact context before asking design questions.
2. Decide whether the request is one coherent project or should be split.
3. Ask one clarifying question at a time when required information is missing.
4. Propose two or three approaches with trade-offs.
5. Recommend one approach and explain why.
6. Present the design in reviewable sections.
7. Wait for `idea_direction_approved` before creating a spec or implementation plan.
8. Hand off to `shape-spec` when the design direction is approved.

# Gates

- `idea_direction_approved`: Required before creating a spec, plan, or implementation plan from the shaped idea.

# Outputs

The output is an approved design direction that can be converted into a `spec` artifact by `shape-spec`.

At minimum, the approved direction states the selected approach, rejected alternatives, scope, non-goals, expected artifacts, and verification strategy.

# Adapter Notes

Adapters may provide native entrypoints for invoking this workflow, but the skill itself remains independent of concrete harness file formats or tool names.

# Failure Modes

If the request contains multiple independent systems, stop after identifying the split and shape the first coherent project. If approval is ambiguous, keep the direction unapproved and do not proceed to planning or implementation.
```

- [ ] **Step 2: Add `idea_direction_approved` to the glossary gate vocabulary**

Add this bullet to `.agent-work/glossary.md` under `## V1 Gate Vocabulary`:

```markdown
- `idea_direction_approved`: Required before converting a shaped idea into a spec, plan, or implementation plan.
```

- [ ] **Step 3: Create the Claude adapter**

Create `.agent-work/adapters/claude.md`:

```markdown
---
type: artifact
kind: adapter
domain_model: agent-work-v1
status: approved
created: 2026-05-19
updated: 2026-05-19
---

# Claude Adapter

This adapter maps `agent-work-v1` roles and capabilities to Claude Code execution patterns. It does not redefine the domain model.

## Role Mapping

- `Orchestrator`: Primary Claude Code conversation agent that owns user gates, scope decisions, artifact coordination, and Git operations.
- `Explorer`: Use focused repository reads, search, or a project subagent when available; return compact findings to the Orchestrator.
- `Planner`: Use the primary agent for approval-sensitive planning and a bounded planning helper only when artifact inputs are explicit.
- `Implementer`: Use the primary agent or a bounded implementation helper for approved work packages with clear file ownership.
- `Reviewer`: Use a separate review pass or specialized review helper that does not modify reviewed files.
- `Maintainer`: Use the primary agent for memory, work-state, changelog, handover, and integration file updates.

## Capability Mapping

- `filesystem`: Read and write repository files and project memory files.
- `shell`: Run validation, tests, and repository inspection commands when permitted.
- `commands`: Use project slash commands for explicit reusable workflows.
- `memory`: Use project memory to point to portable `.agent-work/` artifacts.
- `subagents`: Use project subagents only when a task is bounded and their instructions are explicit.
- `git`: Keep commits, branch operations, and pushes under the Orchestrator role.

## Boundaries

- Portable skills must not name Claude Code tools directly.
- Generated Claude files may mention Claude Code memory and command conventions.
- The Orchestrator keeps approval gates explicit.
- Implementers do not perform Git operations.
- Reviews write findings and do not modify the reviewed files.
```

- [ ] **Step 4: Create the Cursor adapter**

Create `.agent-work/adapters/cursor.md`:

```markdown
---
type: artifact
kind: adapter
domain_model: agent-work-v1
status: approved
created: 2026-05-19
updated: 2026-05-19
---

# Cursor Adapter

This adapter maps `agent-work-v1` roles and capabilities to Cursor execution patterns. It does not redefine the domain model.

## Role Mapping

- `Orchestrator`: Primary Cursor Agent conversation that owns user gates, scope decisions, artifact coordination, and Git operations.
- `Explorer`: Use repository search, file reads, and scoped context attachments to return compact findings.
- `Planner`: Use Cursor Agent to create or update artifacts when source inputs are explicit and approval gates are clear.
- `Implementer`: Use Cursor Agent or Inline Edit only inside an approved work package with clear file scope.
- `Reviewer`: Use a separate review prompt or fresh review pass that does not modify reviewed files.
- `Maintainer`: Use Cursor Agent to update generated files, work state, docs, and handovers from explicit source artifacts.

## Capability Mapping

- `filesystem`: Read and write repository files.
- `shell`: Run validation, tests, and repository inspection commands when available.
- `rules`: Use project rules to keep portable workflow context available.
- `context`: Attach relevant `.agent-work/` artifacts rather than relying on hidden chat state.
- `inline-edit`: Use only for local, bounded edits that remain inside approved scope.
- `git`: Keep commits, branch operations, and pushes under the Orchestrator role.

## Boundaries

- Portable skills must not name Cursor tools directly.
- Generated Cursor rules may mention Cursor rule conventions.
- The Orchestrator keeps approval gates explicit.
- Implementers do not perform Git operations.
- Reviews write findings and do not modify the reviewed files.
```

- [ ] **Step 5: Add native-integration notes to existing adapters**

Append this sentence to the `## Boundaries` section in `.agent-work/adapters/codex.md`:

```markdown
- Generated `AGENTS.md` should point to `.agent-work/` artifacts instead of duplicating portable skills.
```

Append this sentence to the `## Boundaries` section in `.agent-work/adapters/opencode.md`:

```markdown
- Generated native integration files must remain downstream of `.agent-work/` source artifacts.
```

- [ ] **Step 6: Run the focused structural tests and verify they pass**

Run:

```bash
uv run pytest tests/test_agent_work_artifacts.py::test_adapters_map_roles_and_capabilities tests/test_agent_work_artifacts.py::test_all_portable_skills_have_required_metadata_and_sections tests/test_agent_work_artifacts.py::test_skill_frontmatter_gates_are_defined_in_glossary -v
```

Expected: PASS for all selected tests.

- [ ] **Step 7: Commit the model additions**

```bash
git add .agent-work/glossary.md .agent-work/adapters/codex.md .agent-work/adapters/opencode.md .agent-work/adapters/claude.md .agent-work/adapters/cursor.md .agent-work/skills/shape-idea/SKILL.md
git commit -m "feat: add idea shaping and harness adapters"
```

## Task 3: Add Generator Currentness Tests

**Files:**
- Create: `tests/test_harness_integrations.py`
- Modify: `pyproject.toml`

- [ ] **Step 1: Create the generator test file**

Create `tests/test_harness_integrations.py`:

```python
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]

GENERATED_FILES = {
    "AGENTS.md",
    "CLAUDE.md",
    ".claude/commands/shape-idea.md",
    ".cursor/rules/agent-work.mdc",
}

MARKER = "<!-- GENERATED BY tools/generate_harness_integrations.py; DO NOT EDIT. -->"


def _read(relative_path: str) -> str:
    return (REPO_ROOT / relative_path).read_text(encoding="utf-8")


def test_generated_harness_files_exist_with_marker_and_agent_work_references() -> None:
    for relative_path in GENERATED_FILES:
        path = REPO_ROOT / relative_path
        assert path.exists(), f"missing generated file {relative_path}"
        text = _read(relative_path)
        assert MARKER in text
        assert ".agent-work/" in text
        assert "does not redefine the domain model" in text


def test_generated_harness_files_are_current() -> None:
    result = subprocess.run(
        [sys.executable, "tools/generate_harness_integrations.py", "--check"],
        cwd=REPO_ROOT,
        text=True,
        capture_output=True,
        check=False,
    )

    assert result.returncode == 0, result.stdout + result.stderr
```

- [ ] **Step 2: Add `tools/` to ruff coverage if needed**

Inspect `pyproject.toml`. If no ruff include/exclude blocks restrict checks, leave it unchanged. If checks are scoped elsewhere, update the plan execution command to lint `tools/` explicitly rather than changing project config.

- [ ] **Step 3: Run the new tests and verify they fail for missing generator/output**

Run:

```bash
uv run pytest tests/test_harness_integrations.py -v
```

Expected: FAIL because generated files and `tools/generate_harness_integrations.py` do not exist.

- [ ] **Step 4: Commit the failing generator tests**

```bash
git add tests/test_harness_integrations.py pyproject.toml
git commit -m "test: require generated harness integrations"
```

If `pyproject.toml` was unchanged, omit it from `git add`.

## Task 4: Implement Generator, Templates, And Generated Files

**Files:**
- Create: `tools/generate_harness_integrations.py`
- Create: `tools/harness_templates/agents.md.tmpl`
- Create: `tools/harness_templates/claude.md.tmpl`
- Create: `tools/harness_templates/claude-shape-idea.md.tmpl`
- Create: `tools/harness_templates/cursor-agent-work.mdc.tmpl`
- Create generated: `AGENTS.md`
- Create generated: `CLAUDE.md`
- Create generated: `.claude/commands/shape-idea.md`
- Create generated: `.cursor/rules/agent-work.mdc`

- [ ] **Step 1: Create the generator script**

Create `tools/generate_harness_integrations.py`:

```python
from __future__ import annotations

import argparse
import sys
from dataclasses import dataclass
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
TEMPLATE_ROOT = REPO_ROOT / "tools" / "harness_templates"
MARKER = "<!-- GENERATED BY tools/generate_harness_integrations.py; DO NOT EDIT. -->"


@dataclass(frozen=True)
class GeneratedFile:
    template: str
    output: str


GENERATED_FILES = (
    GeneratedFile("agents.md.tmpl", "AGENTS.md"),
    GeneratedFile("claude.md.tmpl", "CLAUDE.md"),
    GeneratedFile("claude-shape-idea.md.tmpl", ".claude/commands/shape-idea.md"),
    GeneratedFile("cursor-agent-work.mdc.tmpl", ".cursor/rules/agent-work.mdc"),
)

REQUIRED_SOURCES = (
    ".agent-work/glossary.md",
    ".agent-work/skills/shape-idea/SKILL.md",
    ".agent-work/skills/shape-spec/SKILL.md",
    ".agent-work/skills/create-phased-plan/SKILL.md",
    ".agent-work/adapters/codex.md",
    ".agent-work/adapters/claude.md",
    ".agent-work/adapters/cursor.md",
)


def _read(path: Path) -> str:
    if not path.exists():
        raise FileNotFoundError(f"missing required file: {path.relative_to(REPO_ROOT)}")
    return path.read_text(encoding="utf-8")


def _render(template_name: str) -> str:
    template = _read(TEMPLATE_ROOT / template_name)
    rendered = template.format(
        marker=MARKER,
        glossary=".agent-work/glossary.md",
        shape_idea=".agent-work/skills/shape-idea/SKILL.md",
        shape_spec=".agent-work/skills/shape-spec/SKILL.md",
        create_phased_plan=".agent-work/skills/create-phased-plan/SKILL.md",
        codex_adapter=".agent-work/adapters/codex.md",
        claude_adapter=".agent-work/adapters/claude.md",
        cursor_adapter=".agent-work/adapters/cursor.md",
    )
    if not rendered.endswith("\n"):
        rendered += "\n"
    return rendered


def render_all() -> dict[Path, str]:
    for source in REQUIRED_SOURCES:
        _read(REPO_ROOT / source)
    return {
        REPO_ROOT / generated.output: _render(generated.template)
        for generated in GENERATED_FILES
    }


def write_all(rendered: dict[Path, str]) -> None:
    for path, content in rendered.items():
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")


def check_all(rendered: dict[Path, str]) -> list[Path]:
    stale: list[Path] = []
    for path, expected in rendered.items():
        if not path.exists() or path.read_text(encoding="utf-8") != expected:
            stale.append(path)
    return stale


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate native harness integration files.")
    parser.add_argument("--check", action="store_true", help="Fail if generated files are stale.")
    args = parser.parse_args()

    try:
        rendered = render_all()
        if args.check:
            stale = check_all(rendered)
            if stale:
                print("Stale generated harness files:")
                for path in stale:
                    print(f"- {path.relative_to(REPO_ROOT)}")
                return 1
            print("Generated harness files are current.")
            return 0

        write_all(rendered)
        print("Generated harness integration files.")
        return 0
    except FileNotFoundError as error:
        print(str(error), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
```

- [ ] **Step 2: Create the `AGENTS.md` template**

Create `tools/harness_templates/agents.md.tmpl`:

```markdown
{marker}

# Portable Agent Work Model Instructions

This file is generated from `.agent-work/` source artifacts. It does not redefine the domain model.

## Source Of Truth

- Glossary: `{glossary}`
- Codex adapter: `{codex_adapter}`
- Idea shaping skill: `{shape_idea}`
- Spec shaping skill: `{shape_spec}`
- Phased planning skill: `{create_phased_plan}`

## Workflow

- For creative work, unclear requests, new features, or behavior changes, use `{shape_idea}` before implementation.
- After the idea direction is approved, use `{shape_spec}` to create the durable spec.
- After the spec is approved, use `{create_phased_plan}` to create phased work artifacts.
- Keep generated native files downstream of `.agent-work/`.
```

- [ ] **Step 3: Create the `CLAUDE.md` template**

Create `tools/harness_templates/claude.md.tmpl`:

```markdown
{marker}

# Portable Agent Work Model For Claude Code

This project uses `.agent-work/` as the portable source of truth. This file does not redefine the domain model.

Read these artifacts when working in this repository:

- @{glossary}
- @{claude_adapter}
- @{shape_idea}
- @{shape_spec}
- @{create_phased_plan}

For creative work, unclear requests, new features, or behavior changes, start with the idea-shaping workflow before implementation.
```

- [ ] **Step 4: Create the Claude command template**

Create `tools/harness_templates/claude-shape-idea.md.tmpl`:

```markdown
{marker}

---
description: Shape a rough idea into an approved design direction before specs or implementation
argument-hint: [idea or request]
---

# Shape Idea

This generated command does not redefine the domain model.

Use the portable workflow in @{shape_idea}.

Context sources:

- @{glossary}
- @{claude_adapter}
- @{shape_spec}
- @{create_phased_plan}

User request:

$ARGUMENTS

Follow the workflow, ask one clarifying question at a time when needed, present approaches with trade-offs, and stop before implementation until the design direction is approved.
```

- [ ] **Step 5: Create the Cursor rule template**

Create `tools/harness_templates/cursor-agent-work.mdc.tmpl`:

```markdown
{marker}

---
description: Use the portable agent work model for idea shaping, specs, plans, reviews, and generated harness files.
globs:
alwaysApply: true
---

# Portable Agent Work Model

This rule points Cursor to `.agent-work/` source artifacts. It does not redefine the domain model.

Primary references:

- `{glossary}`
- `{cursor_adapter}`
- `{shape_idea}`
- `{shape_spec}`
- `{create_phased_plan}`

Use `{shape_idea}` before creative work, unclear requests, new features, or behavior changes. Keep generated native files downstream of `.agent-work/`.
```

- [ ] **Step 6: Generate native harness files**

Run:

```bash
uv run python tools/generate_harness_integrations.py
```

Expected output:

```text
Generated harness integration files.
```

- [ ] **Step 7: Run generator currentness tests and focused generated-file checks**

Run:

```bash
uv run pytest tests/test_harness_integrations.py -v
```

Expected: PASS for both tests.

- [ ] **Step 8: Run ruff on new Python files**

Run:

```bash
uv run ruff check tests/test_harness_integrations.py tools/generate_harness_integrations.py
uv run ruff format --check tests/test_harness_integrations.py tools/generate_harness_integrations.py
```

Expected: both commands pass.

- [ ] **Step 9: Commit generator, templates, and generated files**

```bash
git add AGENTS.md CLAUDE.md .claude/commands/shape-idea.md .cursor/rules/agent-work.mdc tools/generate_harness_integrations.py tools/harness_templates tests/test_harness_integrations.py
git commit -m "feat: generate native harness integrations"
```

## Task 5: Update Documentation

**Files:**
- Modify: `README.md`
- Modify: `docs/overview.md`
- Modify: `docs/modules/adapters.md`
- Modify: `docs/modules/skills.md`
- Modify: `docs/modules/validation-tests.md`
- Modify: `docs/features/harness-adapters.md`
- Create: `docs/features/generated-harness-integration.md`

- [ ] **Step 1: Update README include lists**

Add these bullets to `README.md` under `## What Is Included`:

```markdown
- `AGENTS.md`, `CLAUDE.md`, `.claude/commands/`, and `.cursor/rules/` are generated native harness entrypoints.
- `tools/generate_harness_integrations.py` regenerates native harness files from `.agent-work/`.
```

Add `shape-idea` to `## V1 Skills` immediately before `shape-spec`:

```markdown
- `shape-idea`
```

- [ ] **Step 2: Update README validation commands**

Add this command before `uv run pytest tests/ -v`:

```bash
uv run python tools/generate_harness_integrations.py --check
```

- [ ] **Step 3: Update overview module and feature tables**

In `docs/overview.md`, update the adapters/module description to mention Codex, OpenCode, Claude Code, and Cursor.

Add this feature row under `## Key Features`:

```markdown
| Generated Harness Integration | Generates thin native entrypoints for Codex, Claude Code, and Cursor from `.agent-work/` source artifacts. | [Detail](features/generated-harness-integration.md) |
```

- [ ] **Step 4: Update adapter module docs**

In `docs/modules/adapters.md`, add structure rows:

```markdown
| `.agent-work/adapters/claude.md` | file | Maps neutral roles and capabilities to Claude Code execution patterns. |
| `.agent-work/adapters/cursor.md` | file | Maps neutral roles and capabilities to Cursor execution patterns. |
```

Add these key-symbol rows:

```markdown
| `Claude Adapter` | adapter | public | `.agent-work/adapters/claude.md:10` | Defines Claude Code-specific execution mapping for `agent-work-v1`. |
| `Claude Role Mapping` | section | public | `.agent-work/adapters/claude.md:14` | Maps neutral roles into Claude Code execution responsibilities. |
| `Claude Capability Mapping` | section | public | `.agent-work/adapters/claude.md:23` | Maps filesystem, shell, commands, memory, subagents, and git capabilities. |
| `Cursor Adapter` | adapter | public | `.agent-work/adapters/cursor.md:10` | Defines Cursor-specific execution mapping for `agent-work-v1`. |
| `Cursor Role Mapping` | section | public | `.agent-work/adapters/cursor.md:14` | Maps neutral roles into Cursor execution responsibilities. |
| `Cursor Capability Mapping` | section | public | `.agent-work/adapters/cursor.md:23` | Maps filesystem, shell, rules, context, inline-edit, and git capabilities. |
```

- [ ] **Step 5: Update skill module docs**

In `docs/modules/skills.md`, add `.agent-work/skills/shape-idea/SKILL.md` to the structure table and add this key-symbol row:

```markdown
| `shape-idea` | skill | public | `.agent-work/skills/shape-idea/SKILL.md:2` | Shapes rough ideas into approved design directions before specs or implementation planning. |
```

- [ ] **Step 6: Update validation module docs**

In `docs/modules/validation-tests.md`, add `tests/test_harness_integrations.py` to the structure table and add these key-symbol rows:

```markdown
| `GENERATED_FILES` | const | internal | `tests/test_harness_integrations.py:9` | Lists generated harness integration files that must exist. |
| `MARKER` | const | internal | `tests/test_harness_integrations.py:16` | Defines the generated-file marker required in every native harness file. |
| `test_generated_harness_files_exist_with_marker_and_agent_work_references` | function | internal | `tests/test_harness_integrations.py:24` | Verifies generated files exist, are marked, reference `.agent-work/`, and avoid redefining the domain model. |
| `test_generated_harness_files_are_current` | function | internal | `tests/test_harness_integrations.py:33` | Runs generator `--check` to prevent stale generated files. |
```

- [ ] **Step 7: Create generated harness integration feature doc**

Create `docs/features/generated-harness-integration.md`:

```markdown
---
type: documentation
entity: feature
feature: "generated-harness-integration"
version: 1.0
---

# Feature: generated-harness-integration

> Part of [Portable Agent Work Model](../overview.md)

## Summary

Generated Harness Integration creates native entrypoint files for Codex, Claude Code, and Cursor from `.agent-work/` source artifacts so harness-specific context stays current without duplicating the portable model.

## How It Works

The generator reads required source artifacts, renders checked-in templates, and writes generated files with a marker header. In `--check` mode it compares rendered output with files on disk and fails if any generated file is stale.

### User Flow

1. A contributor changes `.agent-work/` skills, adapters, or glossary files.
2. The contributor runs `uv run python tools/generate_harness_integrations.py`.
3. The contributor runs `uv run python tools/generate_harness_integrations.py --check`.
4. Codex, Claude Code, and Cursor consume their native generated entrypoints.

### Technical Flow

1. `tools/generate_harness_integrations.py` verifies required source files exist.
2. It renders templates from `tools/harness_templates/`.
3. It writes `AGENTS.md`, `CLAUDE.md`, `.claude/commands/shape-idea.md`, and `.cursor/rules/agent-work.mdc`.
4. Tests verify the generated files are present, marked, current, and linked back to `.agent-work/`.

## Implementation

| Module | Symbols | Role |
|--------|---------|------|
| [adapters](../modules/adapters.md) | `Codex Adapter`, `Claude Adapter`, `Cursor Adapter` | Defines harness-specific mappings consumed by generated files. |
| [skills](../modules/skills.md) | `shape-idea`, `shape-spec`, `create-phased-plan` | Defines the workflows referenced by generated files. |
| [validation-tests](../modules/validation-tests.md) | `test_generated_harness_files_are_current` | Prevents generated-file drift. |

## Configuration

No environment variables are required. Run the generator from the repository root with Python.

## Edge Cases & Limitations

- Generated files are intentionally thin and do not contain full skill bodies.
- The repository does not install global Claude, Codex, or Cursor settings.
- Manual edits to generated files are overwritten by the generator and caught by currentness tests.

## Related Features

- [Harness Adapters](harness-adapters.md)
- [Portable Skill Lifecycle](portable-skill-lifecycle.md)
- [Artifact Validation](artifact-validation.md)
```

- [ ] **Step 8: Run documentation link check**

Run:

```bash
python - <<'PY'
from pathlib import Path
import re

root = Path.cwd()
failures = []
for path in [Path("README.md"), *Path("docs").rglob("*.md")]:
    text = path.read_text(encoding="utf-8")
    for match in re.finditer(r"\[[^\]]+\]\(([^)]+)\)", text):
        target = match.group(1)
        if "://" in target or target.startswith("#"):
            continue
        rel = target.split("#", 1)[0]
        if not rel:
            continue
        resolved = (path.parent / rel).resolve()
        if not resolved.exists():
            failures.append(f"{path}:{match.start()+1}: missing {target}")
if failures:
    print("\n".join(failures))
    raise SystemExit(1)
print("local markdown links ok")
PY
```

Expected output:

```text
local markdown links ok
```

- [ ] **Step 9: Commit documentation updates**

```bash
git add README.md docs/
git commit -m "docs: document generated harness integrations"
```

## Task 6: Final Verification And Push

**Files:**
- Verify all changed files.

- [ ] **Step 1: Run generator currentness check**

Run:

```bash
uv run python tools/generate_harness_integrations.py --check
```

Expected output:

```text
Generated harness files are current.
```

- [ ] **Step 2: Run the full test suite**

Run:

```bash
uv run pytest tests/ -v
```

Expected: all collected tests pass.

- [ ] **Step 3: Run ruff checks**

Run:

```bash
uv run ruff check tests/ tools/
uv run ruff format --check tests/ tools/
```

Expected: both commands pass.

- [ ] **Step 4: Run the Markdown link check**

Run the same local Markdown link check from Task 5 Step 8.

Expected output:

```text
local markdown links ok
```

- [ ] **Step 5: Check generated file drift and whitespace**

Run:

```bash
git diff --check
git status --short --branch
```

Expected: `git diff --check` exits 0. `git status --short --branch` shows the current branch and no uncommitted files after all task commits are complete.

- [ ] **Step 6: Push the branch**

Run:

```bash
git push origin main
```

Expected: `main` pushes to `origin/main`.

## Self-Review

- Spec coverage: the plan covers `shape-idea`, Claude and Cursor adapters, generated files, generator `--check`, templates, tests, docs, error handling, and final verification.
- Placeholder scan: no unresolved placeholders are left in implementation steps.
- Type consistency: generator names are consistent across tests, templates, generated paths, and commands.
