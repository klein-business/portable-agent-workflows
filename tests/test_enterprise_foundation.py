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
