# Enterprise Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring Portable Agent Workflows to a pragmatic enterprise foundation level with PR-first governance, CI, supply-chain baseline, compatibility policy, and stronger model validation.

**Architecture:** Keep `.agent-work/` as the source of truth and add enterprise guardrails around it. Validation remains lightweight Python tests and repository-owned scripts; governance lives in versioned Markdown so GitHub settings can be applied reproducibly without mutating repo settings automatically.

**Tech Stack:** Python 3.11+, pytest, ruff, uv, GitHub Actions, CodeQL, Dependabot, Markdown documentation.

---

## File Structure

Create:

- `.github/workflows/ci.yml` - primary validation workflow.
- `.github/workflows/codeql.yml` - CodeQL workflow for code scanning when GitHub Advanced Security is enabled.
- `.github/dependabot.yml` - dependency update policy for GitHub Actions and uv/Python dependencies.
- `.github/pull_request_template.md` - PR checklist for scope, checks, compatibility, and breaking changes.
- `.github/ISSUE_TEMPLATE/bug_report.md` - structured defect report.
- `.github/ISSUE_TEMPLATE/change_request.md` - structured model or governance change request.
- `CODEOWNERS` - first ownership map using `@flitzrrr` as the initial responsible maintainer.
- `SECURITY.md` - vulnerability reporting policy.
- `CONTRIBUTING.md` - contribution workflow and PR-first rules.
- `CHANGELOG.md` - SemVer-oriented changelog seed.
- `docs/governance/release-policy.md` - release rules and gates.
- `docs/governance/compatibility-policy.md` - compatibility and breaking-change rules.
- `docs/governance/deprecation-policy.md` - deprecation lifecycle.
- `docs/governance/adr/README.md` - ADR process and index.
- `docs/governance/adr/0001-enterprise-foundation.md` - first decision record.
- `docs/admin/github-settings.md` - branch protection, ruleset, and security setting instructions.
- `docs/reference/compatibility-matrix.md` - supported harness matrix.
- `tools/check_markdown_links.py` - repository-owned Markdown local link checker.
- `tests/test_enterprise_foundation.py` - enterprise artifact, compatibility, and frontmatter validation.

Modify:

- `README.md` - add enterprise readiness, quality gates, documentation groups, and support matrix links.
- `docs/overview.md` - add governance, compatibility, and enterprise artifact overview.
- `docs/modules/validation-tests.md` - document new tests and link checker.
- `pyproject.toml` - include the new tool in ruff scope only if lint configuration needs adjustment.

Do not modify:

- `.agent-work/skills/*/SKILL.md` unless validation reveals an existing metadata defect.
- `.agent-work/glossary.md` domain semantics.
- generated harness files unless generator output changes unexpectedly.

---

### Task 1: Add Enterprise Validation Tests

**Files:**

- Create: `tests/test_enterprise_foundation.py`
- Modify: none

- [ ] **Step 1: Write failing tests for missing enterprise artifacts**

Create `tests/test_enterprise_foundation.py` with this content:

```python
from __future__ import annotations

import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
AGENT_WORK = REPO_ROOT / ".agent-work"

REQUIRED_ENTERPRISE_FILES = {
    ".github/workflows/ci.yml",
    ".github/workflows/codeql.yml",
    ".github/dependabot.yml",
    ".github/pull_request_template.md",
    ".github/ISSUE_TEMPLATE/bug_report.md",
    ".github/ISSUE_TEMPLATE/change_request.md",
    "CODEOWNERS",
    "SECURITY.md",
    "CONTRIBUTING.md",
    "CHANGELOG.md",
    "docs/governance/release-policy.md",
    "docs/governance/compatibility-policy.md",
    "docs/governance/deprecation-policy.md",
    "docs/governance/adr/README.md",
    "docs/governance/adr/0001-enterprise-foundation.md",
    "docs/admin/github-settings.md",
    "docs/reference/compatibility-matrix.md",
    "tools/check_markdown_links.py",
}

SUPPORTED_HARNESSES = {
    "codex": "Codex",
    "opencode": "OpenCode",
    "claude": "Claude Code",
    "cursor": "Cursor",
}

REQUIRED_README_LINKS = {
    "SECURITY.md",
    "CONTRIBUTING.md",
    "CHANGELOG.md",
    "docs/governance/release-policy.md",
    "docs/governance/compatibility-policy.md",
    "docs/governance/deprecation-policy.md",
    "docs/admin/github-settings.md",
    "docs/reference/compatibility-matrix.md",
}

OLD_REPOSITORY_NAMES = {
    "portable-agent-work-" + "model",
    "Portable Agent Work " + "Model",
    "portable agent work " + "model",
}


def _read(relative_path: str) -> str:
    return (REPO_ROOT / relative_path).read_text(encoding="utf-8")


def _frontmatter(path: Path) -> str:
    text = path.read_text(encoding="utf-8")
    assert text.startswith("---\n"), f"{path.relative_to(REPO_ROOT)} must start with frontmatter"
    parts = text.split("---\n", 2)
    assert len(parts) == 3, f"{path.relative_to(REPO_ROOT)} must close frontmatter"
    return parts[1]


def _all_markdown_files() -> list[Path]:
    ignored_parts = {".git", ".venv"}
    return sorted(
        path
        for path in REPO_ROOT.rglob("*.md")
        if not ignored_parts.intersection(path.relative_to(REPO_ROOT).parts)
    )


def test_required_enterprise_files_exist() -> None:
    missing = sorted(path for path in REQUIRED_ENTERPRISE_FILES if not (REPO_ROOT / path).exists())
    assert not missing, f"missing enterprise foundation files: {missing}"


def test_readme_links_to_enterprise_entrypoints() -> None:
    readme = _read("README.md")

    for link in REQUIRED_README_LINKS:
        assert link in readme, f"README.md must reference {link}"

    for phrase in (
        "Enterprise Readiness",
        "Quality Gates",
        "Supported Harnesses",
        "PR-first",
    ):
        assert phrase in readme


def test_compatibility_matrix_covers_all_adapters() -> None:
    matrix = _read("docs/reference/compatibility-matrix.md")

    for adapter_name, display_name in SUPPORTED_HARNESSES.items():
        assert (AGENT_WORK / "adapters" / f"{adapter_name}.md").exists()
        assert display_name in matrix
        assert f".agent-work/adapters/{adapter_name}.md" in matrix

    for required_heading in (
        "## Stability Levels",
        "## Harness Matrix",
        "## Compatibility Rules",
    ):
        assert required_heading in matrix


def test_agent_work_artifacts_have_required_frontmatter() -> None:
    for path in sorted(AGENT_WORK.rglob("*.md")):
        frontmatter = _frontmatter(path)
        relative = path.relative_to(REPO_ROOT)

        if "skills" in relative.parts:
            required_keys = ("name", "version", "domain_model", "description")
        else:
            required_keys = ("type", "kind", "domain_model", "status", "created", "updated")

        for key in required_keys:
            assert re.search(rf"^{key}:", frontmatter, re.MULTILINE), (
                f"{relative} missing frontmatter key {key}"
            )

        assert "domain_model: agent-work-v1" in frontmatter, (
            f"{relative} must stay on agent-work-v1"
        )


def test_governance_docs_define_enterprise_rules() -> None:
    release_policy = _read("docs/governance/release-policy.md")
    compatibility_policy = _read("docs/governance/compatibility-policy.md")
    deprecation_policy = _read("docs/governance/deprecation-policy.md")
    github_settings = _read("docs/admin/github-settings.md")

    for term in ("SemVer", "Release Gates", "CHANGELOG.md"):
        assert term in release_policy

    for term in ("agent-work-v1", "Breaking Change", "Migration Guide", "ADR"):
        assert term in compatibility_policy

    for term in ("Deprecation Notice", "Removal", "Migration"):
        assert term in deprecation_policy

    for term in ("Require a pull request before merging", "required status checks", "CODEOWNERS"):
        assert term in github_settings


def test_markdown_files_do_not_reference_old_repository_name() -> None:
    offenders = []

    for path in _all_markdown_files():
        text = path.read_text(encoding="utf-8")
        for old_name in OLD_REPOSITORY_NAMES:
            if old_name in text:
                offenders.append(f"{path.relative_to(REPO_ROOT)} contains {old_name}")

    assert not offenders, "\n".join(offenders)
```

- [ ] **Step 2: Run the new tests to verify they fail**

Run:

```bash
uv run pytest tests/test_enterprise_foundation.py -v
```

Expected: fail with missing enterprise foundation files listed by `test_required_enterprise_files_exist`.

- [ ] **Step 3: Commit the failing enterprise tests**

Run:

```bash
git add tests/test_enterprise_foundation.py
git commit -m "test: define enterprise foundation expectations"
```

Expected: commit succeeds and records only the new test file.

---

### Task 2: Add Repository-Owned Markdown Link Checker

**Files:**

- Create: `tools/check_markdown_links.py`
- Modify: none

- [ ] **Step 1: Create the Markdown link checker**

Create `tools/check_markdown_links.py` with this content:

```python
from __future__ import annotations

import argparse
import re
import sys
import urllib.parse
from pathlib import Path

IGNORED_PARTS = {".git", ".venv"}
LINK_RE = re.compile(r"\[[^\]]+\]\(([^)]+)\)")
SCHEME_RE = re.compile(r"^[a-zA-Z][a-zA-Z0-9+.-]*:")


def markdown_files(root: Path) -> list[Path]:
    return sorted(
        path
        for path in root.rglob("*.md")
        if not IGNORED_PARTS.intersection(path.relative_to(root).parts)
    )


def local_link_target(raw_target: str) -> str | None:
    target = raw_target.strip()
    if target.startswith("<") and target.endswith(">"):
        target = target[1:-1]
    target = target.split()[0]

    if not target or target.startswith("#") or SCHEME_RE.match(target):
        return None

    target = target.split("#", 1)[0]
    if not target:
        return None

    return urllib.parse.unquote(target)


def find_missing_links(root: Path) -> list[str]:
    missing = []

    for path in markdown_files(root):
        text = path.read_text(encoding="utf-8")
        for match in LINK_RE.finditer(text):
            target = local_link_target(match.group(1))
            if target is None:
                continue

            resolved = (path.parent / target).resolve()
            if not resolved.exists():
                missing.append(f"{path.relative_to(root)} -> {match.group(1)}")

    return missing


def main() -> int:
    parser = argparse.ArgumentParser(description="Check local Markdown links.")
    parser.add_argument(
        "--root",
        type=Path,
        default=Path.cwd(),
        help="Repository root to scan. Defaults to the current working directory.",
    )
    args = parser.parse_args()

    root = args.root.resolve()
    missing = find_missing_links(root)
    if missing:
        print("Missing Markdown links:")
        print("\n".join(missing))
        return 1

    print(f"Checked {len(markdown_files(root))} Markdown files; local links resolve.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 2: Run the link checker**

Run:

```bash
uv run python tools/check_markdown_links.py
```

Expected: pass with output like `Checked <N> Markdown files; local links resolve.`

- [ ] **Step 3: Run Ruff on the new tool**

Run:

```bash
uv run ruff check tools/check_markdown_links.py
uv run ruff format --check tools/check_markdown_links.py
```

Expected: both commands pass.

- [ ] **Step 4: Commit the link checker**

Run:

```bash
git add tools/check_markdown_links.py
git commit -m "chore: add markdown link checker"
```

Expected: commit succeeds.

---

### Task 3: Add CI And Supply-Chain Configuration

**Files:**

- Create: `.github/workflows/ci.yml`
- Create: `.github/workflows/codeql.yml`
- Create: `.github/dependabot.yml`

- [ ] **Step 1: Create the CI workflow**

Create `.github/workflows/ci.yml` with this content:

```yaml
name: CI

on:
  pull_request:
  push:
    branches:
      - main

permissions:
  contents: read

jobs:
  validate:
    name: validate
    runs-on: ubuntu-latest

    steps:
      - name: Check out repository
        uses: actions/checkout@v6

      - name: Install uv
        uses: astral-sh/setup-uv@08807647e7069bb48b6ef5acd8ec9567f424441b # v8.1.0
        with:
          enable-cache: true

      - name: Install dependencies
        run: uv sync --dev

      - name: Check generated harness integrations
        run: uv run python tools/generate_harness_integrations.py --check

      - name: Run tests
        run: uv run pytest tests/ -v

      - name: Run Ruff lint
        run: uv run ruff check tests/ tools/

      - name: Check Ruff formatting
        run: uv run ruff format --check tests/ tools/

      - name: Check Markdown links
        run: uv run python tools/check_markdown_links.py
```

- [ ] **Step 2: Create the CodeQL workflow**

Create `.github/workflows/codeql.yml` with this content:

```yaml
name: CodeQL

on:
  pull_request:
  push:
    branches:
      - main
  schedule:
    - cron: "24 4 * * 1"

permissions:
  actions: read
  contents: read
  security-events: write

jobs:
  analyze:
    name: analyze
    runs-on: ubuntu-latest

    strategy:
      fail-fast: false
      matrix:
        language:
          - python

    steps:
      - name: Check out repository
        uses: actions/checkout@v6

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v4
        with:
          languages: ${{ matrix.language }}
          queries: security-extended,security-and-quality

      - name: Perform CodeQL analysis
        uses: github/codeql-action/analyze@v4
        with:
          category: "/language:${{ matrix.language }}"
```

- [ ] **Step 3: Create Dependabot configuration**

Create `.github/dependabot.yml` with this content:

```yaml
version: 2
updates:
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
      day: monday
      time: "06:00"
      timezone: Europe/Berlin
    labels:
      - dependencies
      - github-actions
    open-pull-requests-limit: 5

  - package-ecosystem: uv
    directory: /
    schedule:
      interval: weekly
      day: monday
      time: "06:30"
      timezone: Europe/Berlin
    labels:
      - dependencies
      - python
    open-pull-requests-limit: 5
```

- [ ] **Step 4: Run focused validation**

Run:

```bash
uv run pytest tests/test_enterprise_foundation.py::test_required_enterprise_files_exist -v
```

Expected: still fails because policy and governance files do not exist yet, but the missing list no longer includes `.github/workflows/ci.yml`, `.github/workflows/codeql.yml`, or `.github/dependabot.yml`.

- [ ] **Step 5: Commit CI and supply-chain configuration**

Run:

```bash
git add .github/workflows/ci.yml .github/workflows/codeql.yml .github/dependabot.yml
git commit -m "ci: add enterprise validation workflows"
```

Expected: commit succeeds.

---

### Task 4: Add PR, Issue, Ownership, Security, And Contribution Files

**Files:**

- Create: `.github/pull_request_template.md`
- Create: `.github/ISSUE_TEMPLATE/bug_report.md`
- Create: `.github/ISSUE_TEMPLATE/change_request.md`
- Create: `CODEOWNERS`
- Create: `SECURITY.md`
- Create: `CONTRIBUTING.md`
- Create: `CHANGELOG.md`

- [ ] **Step 1: Create `CODEOWNERS`**

Create `CODEOWNERS` with this content:

```text
# Initial ownership map. Replace @flitzrrr with an organization team when one exists.
* @flitzrrr

/.agent-work/ @flitzrrr
/tools/ @flitzrrr
/tests/ @flitzrrr
/.github/ @flitzrrr
/docs/governance/ @flitzrrr
/docs/admin/ @flitzrrr
/docs/reference/ @flitzrrr
/SECURITY.md @flitzrrr
/CONTRIBUTING.md @flitzrrr
/CHANGELOG.md @flitzrrr
```

- [ ] **Step 2: Create the pull request template**

Create `.github/pull_request_template.md` with this content:

```markdown
## Summary

- 

## Scope

- [ ] Changes stay within the stated scope.
- [ ] `.agent-work/` source artifacts remain the source of truth.
- [ ] Generated harness files are updated or verified current.

## Compatibility Impact

- [ ] No compatibility impact.
- [ ] Compatible additive change.
- [ ] Deprecation with documented migration path.
- [ ] Breaking change with ADR and migration guide.

## Required Checks

- [ ] `uv run python tools/generate_harness_integrations.py --check`
- [ ] `uv run pytest tests/ -v`
- [ ] `uv run ruff check tests/ tools/`
- [ ] `uv run ruff format --check tests/ tools/`
- [ ] `uv run python tools/check_markdown_links.py`
- [ ] `git diff --check`

## Review Notes

- 
```

- [ ] **Step 3: Create issue templates**

Create `.github/ISSUE_TEMPLATE/bug_report.md` with this content:

```markdown
---
name: Bug report
about: Report incorrect behavior, broken validation, or stale generated output.
title: "bug: "
labels: bug
assignees: ""
---

## Summary

## Affected Area

- [ ] `.agent-work` artifact
- [ ] generated harness file
- [ ] validation test
- [ ] documentation
- [ ] CI or repository governance

## Current Behavior

## Expected Behavior

## Reproduction

## Verification Evidence
```

Create `.github/ISSUE_TEMPLATE/change_request.md` with this content:

```markdown
---
name: Change request
about: Propose a model, skill, adapter, governance, or compatibility change.
title: "change: "
labels: enhancement
assignees: ""
---

## Summary

## Change Type

- [ ] Domain model
- [ ] Skill contract
- [ ] Adapter contract
- [ ] Generated harness integration
- [ ] Governance or release process
- [ ] Documentation

## Compatibility Impact

- [ ] No compatibility impact
- [ ] Compatible additive change
- [ ] Deprecation
- [ ] Breaking change

## Proposed Direction

## Required Artifacts

- [ ] Spec or ADR
- [ ] Migration guide
- [ ] Deprecation notice
- [ ] Tests or validation update
```

- [ ] **Step 4: Create security, contribution, and changelog files**

Create `SECURITY.md` with this content:

```markdown
# Security Policy

## Reporting A Vulnerability

Do not open a public issue for vulnerabilities. Report security concerns through a
private GitHub security advisory for this repository or contact the current repository
maintainer directly if advisories are unavailable.

Include:

- affected files or workflows
- reproduction steps
- expected impact
- whether generated harness files or `.agent-work` artifacts are affected

## Supported Versions

The supported version is the current `main` branch until the first tagged release.
After tagged releases begin, supported versions are listed in `CHANGELOG.md`.

## Security Scope

This repository does not ship a runtime library. Security review focuses on:

- GitHub Actions permissions and third-party actions
- generated instruction files
- portable workflow instructions
- repository governance files
- supply-chain dependency updates
```

Create `CONTRIBUTING.md` with this content:

````markdown
# Contributing

## Workflow

This repository uses a PR-first workflow.

1. Create a project-oriented branch.
2. Make a focused change.
3. Run the required checks.
4. Open a pull request using the repository template.
5. Get review from the relevant CODEOWNERS entry.
6. Merge only after required checks and review pass.

Direct `main` commits are administrator exceptions, not the normal workflow.

## Required Local Checks

```bash
uv run python tools/generate_harness_integrations.py --check
uv run pytest tests/ -v
uv run ruff check tests/ tools/
uv run ruff format --check tests/ tools/
uv run python tools/check_markdown_links.py
git diff --check
```

## Compatibility Changes

Changes to domain terms, gates, artifact kinds, skill contracts, adapter contracts,
or generated entrypoint expectations must follow
`docs/governance/compatibility-policy.md`.

Breaking changes require an ADR and a migration guide before merge.
````

Create `CHANGELOG.md` with this content:

```markdown
# Changelog

All notable changes to this repository are documented here.

This project follows Semantic Versioning for repository releases. The portable domain
model version is tracked separately as `agent-work-v1`.

## Unreleased

### Added

- Enterprise foundation design for governance, CI, compatibility, and release rules.

### Changed

- Repository renamed to Portable Agent Workflows.
```

- [ ] **Step 5: Run focused validation**

Run:

```bash
uv run pytest tests/test_enterprise_foundation.py::test_required_enterprise_files_exist -v
uv run python tools/check_markdown_links.py
```

Expected: first command still fails because governance docs are missing; link checker passes.

- [ ] **Step 6: Commit repository policy files**

Run:

```bash
git add CODEOWNERS SECURITY.md CONTRIBUTING.md CHANGELOG.md .github/pull_request_template.md .github/ISSUE_TEMPLATE/bug_report.md .github/ISSUE_TEMPLATE/change_request.md
git commit -m "docs: add repository governance entrypoints"
```

Expected: commit succeeds.

---

### Task 5: Add Governance, Admin, ADR, And Compatibility Docs

**Files:**

- Create: `docs/governance/release-policy.md`
- Create: `docs/governance/compatibility-policy.md`
- Create: `docs/governance/deprecation-policy.md`
- Create: `docs/governance/adr/README.md`
- Create: `docs/governance/adr/0001-enterprise-foundation.md`
- Create: `docs/admin/github-settings.md`
- Create: `docs/reference/compatibility-matrix.md`

- [ ] **Step 1: Create release policy**

Create `docs/governance/release-policy.md` with this content:

```markdown
# Release Policy

## Versioning

Repository releases follow SemVer:

- patch releases fix documentation, validation, or generated-output defects
- minor releases add compatible skills, adapters, governance, or validation
- major releases contain repository-level breaking changes

The portable domain model version is tracked separately. The current domain version
is `agent-work-v1`.

## Release Gates

A release requires:

- all required CI checks passing
- generated harness files verified current
- Markdown links verified
- compatibility impact recorded in the pull request
- `CHANGELOG.md` updated
- migration notes for breaking changes
- ADR for breaking changes to model, skill, adapter, or generated-entrypoint contracts

## Release Steps

1. Confirm `main` is green.
2. Update `CHANGELOG.md`.
3. Tag the release with the SemVer version.
4. Publish GitHub release notes from the changelog entry.
5. Record follow-up deprecations or migrations as issues.
```

- [ ] **Step 2: Create compatibility policy**

Create `docs/governance/compatibility-policy.md` with this content:

```markdown
# Compatibility Policy

## Stable Surface

The stable surface includes:

- `agent-work-v1` domain terms
- gate names in `.agent-work/glossary.md`
- artifact kinds in `.agent-work/glossary.md`
- portable skill frontmatter contracts
- adapter role and capability mappings
- generated harness entrypoint expectations

## Breaking Change

A Breaking Change is any change that requires existing users or future agents to
change their artifacts, skill invocations, adapter assumptions, generated harness
files, or validation expectations.

Breaking changes require:

- an ADR under `docs/governance/adr/`
- a migration guide or migration section in the release notes
- compatibility matrix update
- deprecation notice when removal is delayed

## Compatible Changes

Compatible changes include:

- adding a new optional skill input
- adding a new adapter note without changing existing mappings
- adding validation for documented existing behavior
- adding new documentation that does not alter contracts

## Domain Version Rules

The current domain version is `agent-work-v1`.

A breaking domain change requires either:

- a new domain version such as `agent-work-v2`, or
- an ADR explaining why the change can remain within `agent-work-v1`

## Migration Guide

A migration guide must state:

- affected artifacts
- old behavior
- new behavior
- exact steps to migrate
- validation commands that prove migration completed
```

- [ ] **Step 3: Create deprecation policy**

Create `docs/governance/deprecation-policy.md` with this content:

```markdown
# Deprecation Policy

## Deprecation Notice

A Deprecation Notice is required before removing or replacing a stable model,
skill, adapter, gate, generated entrypoint, or governance contract.

The notice must include:

- deprecated surface
- replacement
- reason
- first release or commit where the deprecation appears
- earliest removal point
- migration steps

## Deprecation Period

Deprecations remain documented for at least one minor release cycle after the notice
is introduced.

## Removal

Removal requires:

- compatibility policy review
- ADR when the removal is breaking
- migration guide
- changelog entry
- updated validation tests

## Migration

Migration instructions must use exact file paths and validation commands. If no
automatic migration exists, the policy must state the manual steps.
```

- [ ] **Step 4: Create ADR docs**

Create `docs/governance/adr/README.md` with this content:

```markdown
# Architecture Decision Records

ADRs record decisions that affect compatibility, governance, repository operation,
or the `agent-work-v1` model.

## When An ADR Is Required

An ADR is required for:

- breaking changes
- new domain versions
- changes to stable skill or adapter contracts
- release policy changes
- security or supply-chain posture changes

## ADR Format

Each ADR includes:

- status
- context
- decision
- consequences
- compatibility impact

## Index

- [0001: Enterprise Foundation][adr-0001]

[adr-0001]: 0001-enterprise-foundation.md
```

Create `docs/governance/adr/0001-enterprise-foundation.md` with this content:

```markdown
# 0001: Enterprise Foundation

## Status

Accepted

## Context

Portable Agent Workflows has a coherent `agent-work-v1` model, generated harness
entrypoints, and structural tests. It needs enterprise-grade operating rules without
adding product features or changing model semantics.

## Decision

Adopt an Enterprise Foundation Slice with:

- PR-first governance
- CI validation
- CodeQL workflow
- Dependabot configuration
- compatibility policy
- release policy
- deprecation policy
- ADR process
- documented GitHub settings
- compatibility matrix
- stronger model validation

## Consequences

The repository gains clear operating rules and stronger validation. Some future
changes require ADRs and migration notes before merge.

## Compatibility Impact

No `agent-work-v1` semantics change. This ADR adds governance around existing stable
surfaces.
```

- [ ] **Step 5: Create GitHub settings documentation**

Create `docs/admin/github-settings.md` with this content:

```markdown
# GitHub Settings

These settings should be applied by a repository administrator after the workflows
exist and have run at least once.

## Branch Protection For `main`

Enable:

- Require a pull request before merging
- Require approvals: 1
- Dismiss stale pull request approvals when new commits are pushed
- Require review from CODEOWNERS
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Block force pushes
- Block deletions

Required status checks:

- `validate`

Optional after GitHub Advanced Security is enabled:

- `analyze`

## Ruleset Recommendation

Create a ruleset targeting `main` with:

- pull request required
- required status checks
- required code owner review
- non-fast-forward updates blocked
- branch deletion blocked

## Actions Settings

Use these settings:

- Allow GitHub Actions for this repository.
- Allow actions created by GitHub.
- Allow selected third-party actions used by this repository.
- Review third-party action use during dependency updates.

## Security Settings

Enable when available for the organization plan:

- Dependabot alerts
- Dependabot security updates
- Code scanning
- Secret scanning
- Private vulnerability reporting

## Administrator Exception

Direct `main` changes are reserved for explicit administrator exceptions. Record the
reason in the commit message or a follow-up issue.
```

- [ ] **Step 6: Create compatibility matrix**

Create `docs/reference/compatibility-matrix.md` with this content:

```markdown
# Compatibility Matrix

## Stability Levels

- `stable`: supported by source artifacts, generated entrypoints, and validation
- `documented`: supported by adapter documentation but not generated entrypoints
- `experimental`: allowed for exploration but not a stable contract

## Harness Matrix

| Harness | Adapter | Native entrypoint | Generated | Stability |
|---------|---------|-------------------|-----------|-----------|
| Codex | `.agent-work/adapters/codex.md` | `AGENTS.md` | yes | stable |
| OpenCode | `.agent-work/adapters/opencode.md` | adapter documentation | no | documented |
| Claude Code | `.agent-work/adapters/claude.md` | `CLAUDE.md`, `.claude/commands/shape-idea.md` | yes | stable |
| Cursor | `.agent-work/adapters/cursor.md` | `.cursor/rules/agent-work.mdc`, `AGENTS.md` fallback | yes | stable |

## Compatibility Rules

- `.agent-work/` artifacts are the source of truth.
- Generated files must be regenerated or checked before merge.
- Adapter behavior must not redefine the domain model.
- Breaking changes require an ADR and migration guide.
- Deprecations must follow `docs/governance/deprecation-policy.md`.
```

- [ ] **Step 7: Run enterprise tests**

Run:

```bash
uv run pytest tests/test_enterprise_foundation.py -v
```

Expected: failures now move to README links and frontmatter coverage if those are still missing.

- [ ] **Step 8: Commit governance and reference docs**

Run:

```bash
git add docs/governance docs/admin docs/reference
git commit -m "docs: add enterprise governance foundation"
```

Expected: commit succeeds.

---

### Task 6: Update README And Existing Documentation

**Files:**

- Modify: `README.md`
- Modify: `docs/overview.md`
- Modify: `docs/modules/validation-tests.md`

- [ ] **Step 1: Update README sections**

Modify `README.md` so it contains these sections in this order:

````markdown
# Portable Agent Workflows

Portable Agent Workflows is a harness-agnostic workflow layer for coding agents. It defines a shared vocabulary, portable skills, adapter mappings, persistent artifacts, and generated native entrypoints so Codex, OpenCode, Claude Code, Cursor, and similar harnesses can follow the same workflow model without sharing tool names or hidden chat state.

## Origins

This model combines the strongest ideas from [obra/superpowers](https://github.com/obra/superpowers) and [DasDigitaleMomentum/opencode-processing-skills](https://github.com/DasDigitaleMomentum/opencode-processing-skills): explicit skill workflows, durable planning artifacts, review gates, handovers, and harness-specific adapters. It does not copy either system directly; it defines a clean `agent-work-v1` domain model that can be used across Codex, OpenCode, Claude Code, Cursor, and future harnesses.

## What This Repository Is

- A portable workflow and artifact model for coding agents.
- A set of harness-agnostic skills under `.agent-work/skills/`.
- A generated integration layer for Codex, Claude Code, and Cursor.
- A governance-backed reference repository for `agent-work-v1`.

## What This Repository Is Not

- It is not a runtime library.
- It is not an installer.
- It is not tied to one agent harness.
- It does not mutate GitHub repository settings automatically.

## Enterprise Readiness

- PR-first governance is documented in [CONTRIBUTING.md][contributing].
- Security reporting is documented in [SECURITY.md][security].
- Releases follow the [release policy][release-policy].
- Compatibility is governed by the [compatibility policy][compatibility-policy].
- Deprecations follow the [deprecation policy][deprecation-policy].
- Recommended repository settings are documented in [GitHub settings][github-settings].
- Supported harnesses are tracked in the [compatibility matrix][compatibility-matrix].

## Quality Gates

```bash
uv run python tools/generate_harness_integrations.py --check
uv run pytest tests/ -v
uv run ruff check tests/ tools/
uv run ruff format --check tests/ tools/
uv run python tools/check_markdown_links.py
git diff --check
```

## What Is Included

- `.agent-work/glossary.md` defines the `agent-work-v1` domain model.
- `.agent-work/adapters/` maps neutral roles and capabilities to Codex, OpenCode, Claude Code, and Cursor.
- `.agent-work/skills/` contains the eleven V1 portable skills.
- `.agent-work/plans/portable-agent-work-example/` demonstrates the full artifact lifecycle.
- `AGENTS.md`, `CLAUDE.md`, `.claude/commands/`, and `.cursor/rules/` are generated native harness entrypoints.
- `tools/generate_harness_integrations.py` regenerates native harness files from `.agent-work/`.
- `tools/check_markdown_links.py` validates local Markdown links.
- `tests/` validates model structure, generated files, and enterprise foundation artifacts.
- `docs/` documents architecture, governance, reference material, modules, and features.

## Core Ideas

- Skills describe behavior.
- Artifacts store durable state.
- Roles define responsibility.
- Capabilities define what a harness can do.
- Adapters translate neutral intent into concrete harness execution.
- Later agents should be able to continue from files, not hidden chat context.

## Quickstart

Install development dependencies with `uv`:

```bash
uv sync --dev
```

Run validation:

```bash
uv run python tools/generate_harness_integrations.py --check
uv run pytest tests/ -v
uv run ruff check tests/ tools/
uv run ruff format --check tests/ tools/
uv run python tools/check_markdown_links.py
```

## Supported Harnesses

See the [compatibility matrix][compatibility-matrix] for current support status.

## Documentation

- Start here: [Project overview][overview]
- Governance: [Release policy][release-policy], [Compatibility policy][compatibility-policy], [Deprecation policy][deprecation-policy], [ADRs][adrs]
- Administration: [GitHub settings][github-settings]
- Reference: [Compatibility matrix][compatibility-matrix]
- Modules: [Domain model][domain-model], [Adapters][adapters], [Harness generator][harness-generator], [Skills][skills], [Lifecycle example][lifecycle-example], [Validation tests][validation-tests]
- Features: [Generated harness integration][generated-harness-integration], [Portable skill lifecycle][portable-skill-lifecycle], [Artifact validation][artifact-validation], [Harness adapters][harness-adapters]

[adapters]: docs/modules/adapters.md
[adrs]: docs/governance/adr/README.md
[artifact-validation]: docs/features/artifact-validation.md
[compatibility-matrix]: docs/reference/compatibility-matrix.md
[compatibility-policy]: docs/governance/compatibility-policy.md
[contributing]: CONTRIBUTING.md
[deprecation-policy]: docs/governance/deprecation-policy.md
[domain-model]: docs/modules/domain-model.md
[generated-harness-integration]: docs/features/generated-harness-integration.md
[github-settings]: docs/admin/github-settings.md
[harness-adapters]: docs/features/harness-adapters.md
[harness-generator]: docs/modules/harness-generator.md
[lifecycle-example]: docs/modules/lifecycle-example.md
[overview]: docs/overview.md
[portable-skill-lifecycle]: docs/features/portable-skill-lifecycle.md
[release-policy]: docs/governance/release-policy.md
[security]: SECURITY.md
[skills]: docs/modules/skills.md
[validation-tests]: docs/modules/validation-tests.md

## V1 Skills

- `define-domain-model`
- `shape-idea`
- `shape-spec`
- `create-phased-plan`
- `verify-implementation-plan`
- `execute-work-package`
- `review-artifact`
- `review-implementation`
- `update-work-state`
- `create-handover`
- `write-portable-skill`

## Repository Status

This repository is a documentation-and-artifact model. It does not ship a runtime library. The tests validate that the files remain structurally coherent.
````

- [ ] **Step 2: Update `docs/overview.md`**

Add concise sections to `docs/overview.md`:

```markdown
## Enterprise Foundation

The repository includes versioned governance and administrative guidance for enterprise operation. PR-first contribution rules live in `CONTRIBUTING.md`, security reporting lives in `SECURITY.md`, release and compatibility rules live under `docs/governance/`, and recommended GitHub settings live in `docs/admin/github-settings.md`.

## Source Of Truth

`.agent-work/` remains the source of truth for the domain model, skills, adapters, and lifecycle example. Generated harness files and governance docs must point back to those artifacts rather than redefining them.
```

Keep the existing module and feature links and add links to:

- `docs/governance/release-policy.md`
- `docs/governance/compatibility-policy.md`
- `docs/governance/deprecation-policy.md`
- `docs/reference/compatibility-matrix.md`
- `docs/admin/github-settings.md`

- [ ] **Step 3: Update `docs/modules/validation-tests.md`**

Add a section:

```markdown
## Enterprise Foundation Validation

Enterprise validation is implemented in `tests/test_enterprise_foundation.py`.

It checks:

- required enterprise files exist
- README links to governance, security, contribution, admin, and reference entrypoints
- compatibility matrix covers all supported adapters
- `.agent-work` artifacts retain required frontmatter and `agent-work-v1`
- governance documents define release, compatibility, deprecation, and GitHub settings rules
- Markdown files do not reference the old repository name

`tools/check_markdown_links.py` provides the repository-owned local Markdown link check used by CI.
```

- [ ] **Step 4: Run README and documentation validation**

Run:

```bash
uv run pytest tests/test_enterprise_foundation.py -v
uv run python tools/check_markdown_links.py
```

Expected: all enterprise foundation tests pass and Markdown local links resolve.

- [ ] **Step 5: Commit documentation updates**

Run:

```bash
git add README.md docs/overview.md docs/modules/validation-tests.md
git commit -m "docs: document enterprise foundation entrypoints"
```

Expected: commit succeeds.

---

### Task 7: Final Validation And Push

**Files:**

- Modify: none expected after previous tasks.

- [ ] **Step 1: Run generator check**

Run:

```bash
uv run python tools/generate_harness_integrations.py --check
```

Expected: `Generated harness files are current.`

- [ ] **Step 2: Run full test suite**

Run:

```bash
uv run pytest tests/ -v
```

Expected: all tests pass, including `tests/test_enterprise_foundation.py`.

- [ ] **Step 3: Run lint and format checks**

Run:

```bash
uv run ruff check tests/ tools/
uv run ruff format --check tests/ tools/
```

Expected: Ruff reports no lint errors and all checked files are formatted.

- [ ] **Step 4: Run Markdown link and diff hygiene checks**

Run:

```bash
uv run python tools/check_markdown_links.py
git diff --check
python3 - <<'PY'
from pathlib import Path

old_names = (
    "portable-agent-work-" + "model",
    "portable agent work " + "model",
    "Portable Agent Work " + "Model",
)

matches = []
for path in Path.cwd().rglob("*"):
    if path.is_dir() or ".git" in path.parts or ".venv" in path.parts:
        continue
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        continue
    for old_name in old_names:
        if old_name in text:
            matches.append(f"{path}: {old_name}")

if matches:
    print("\n".join(matches))
    raise SystemExit(1)
PY
```

Expected:

- Markdown links resolve.
- `git diff --check` prints no output.
- the Python old-name scan prints no output.

- [ ] **Step 5: Inspect final status**

Run:

```bash
git status --short --branch
git log --oneline -8
```

Expected: working tree is clean except for intentional committed changes; recent commits match this plan's task commits.

- [ ] **Step 6: Push `main`**

Run:

```bash
git push origin main
```

Expected: local commits push to `https://github.com/klein-business/portable-agent-workflows.git`.

---

## Plan Self-Review

Spec coverage:

- PR-first governance: Task 4 and Task 5.
- CI and supply-chain baseline: Task 3.
- Security, contribution, release, compatibility, and deprecation documentation: Task 4 and Task 5.
- GitHub settings as administrator documentation: Task 5.
- ADR structure: Task 5.
- Stronger model validation: Task 1.
- README and docs enterprise readiness: Task 6.
- Verification and push: Task 7.

Scope check:

- The plan does not add V1.1 product features.
- The plan does not mutate GitHub settings automatically.
- The plan does not add SBOM, SLSA, signed releases, new harnesses, or runtime packaging.
- The plan keeps `agent-work-v1` semantics unchanged.

Placeholder scan:

- No incomplete implementation markers are used.
- Each created code or configuration file has exact content.
- Each verification step has exact commands and expected results.
