from __future__ import annotations

import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
AGENT_WORK = REPO_ROOT / ".agent-work"

REQUIRED_TERMS = {
    "Capability",
    "Skill",
    "Artifact",
    "Spec",
    "Plan",
    "Phase",
    "Implementation Plan",
    "Work Package",
    "Gate",
    "Review",
    "Handover",
    "Role",
    "Adapter",
}

REQUIRED_ROLES = {
    "Orchestrator",
    "Explorer",
    "Planner",
    "Implementer",
    "Reviewer",
    "Maintainer",
}

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

REQUIRED_SKILL_KEYS = {
    "name",
    "version",
    "domain_model",
    "description",
    "triggers",
    "inputs",
    "outputs",
    "roles",
    "gates",
}

REQUIRED_SKILL_SECTIONS = {
    "Purpose",
    "When To Use",
    "Inputs",
    "Workflow",
    "Gates",
    "Outputs",
    "Adapter Notes",
    "Failure Modes",
}

EXAMPLE_ARTIFACTS = {
    "spec.md": "spec",
    "plan.md": "plan",
    "phases/phase-1.md": "phase",
    "implementation/phase-1-impl.md": "implementation-plan",
    "reviews/plan-review.md": "review",
    "reviews/impl-plan-review-phase-1.md": "review",
    "reviews/impl-review-phase-1.md": "review",
    "handovers/session-2026-05-19.md": "handover",
    "todo.md": "todo",
}


def _read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def _frontmatter(path: Path) -> str:
    text = _read(path)
    assert text.startswith("---\n"), f"{path} must start with frontmatter"
    parts = text.split("---\n", 2)
    assert len(parts) == 3, f"{path} must close frontmatter"
    return parts[1]


def _frontmatter_value(frontmatter: str, key: str) -> str:
    match = re.search(rf"^{key}:\s*(.+)$", frontmatter, re.MULTILINE)
    assert match, f"frontmatter missing {key}"
    return match.group(1).strip()


def _frontmatter_list(frontmatter: str, key: str) -> set[str]:
    match = re.search(rf"^{key}:\n((?:  - .+\n)+)", frontmatter, re.MULTILINE)
    assert match, f"frontmatter missing list {key}"
    return {line.removeprefix("  - ").strip() for line in match.group(1).splitlines()}


def test_glossary_defines_domain_model_terms_and_roles() -> None:
    glossary = _read(AGENT_WORK / "glossary.md")

    for term in REQUIRED_TERMS:
        assert f"### {term}" in glossary

    for role in REQUIRED_ROLES:
        assert f"- `{role}`:" in glossary

    assert "agent-work-v1" in glossary


def test_adapters_map_roles_and_capabilities() -> None:
    for adapter_name in REQUIRED_ADAPTERS:
        text = _read(AGENT_WORK / "adapters" / f"{adapter_name}.md")
        assert "# " in text
        assert "## Role Mapping" in text
        assert "## Capability Mapping" in text
        assert "## Boundaries" in text

        for role in REQUIRED_ROLES:
            assert f"- `{role}`:" in text

        assert "does not redefine the domain model" in text


def test_all_portable_skills_have_required_metadata_and_sections() -> None:
    skill_files = sorted((AGENT_WORK / "skills").glob("*/SKILL.md"))
    skill_names = {path.parent.name for path in skill_files}
    assert skill_names == REQUIRED_SKILLS

    for path in skill_files:
        text = _read(path)
        frontmatter = _frontmatter(path)

        for key in REQUIRED_SKILL_KEYS:
            assert re.search(rf"^{key}:", frontmatter, re.MULTILINE), f"{path} missing {key}"

        for section in REQUIRED_SKILL_SECTIONS:
            pattern = rf"^#{{1,6}} {re.escape(section)}\s*$"
            assert re.search(pattern, text, re.MULTILINE), f"{path} missing section {section}"

        assert "domain_model: agent-work-v1" in frontmatter
        assert "spawn_agent" not in text
        assert "doc-explorer" not in text
        assert "delegate-fast" not in text


def test_skill_frontmatter_gates_are_defined_in_glossary() -> None:
    glossary = _read(AGENT_WORK / "glossary.md")
    glossary_gates = set(re.findall(r"`([^`]+)`", glossary))

    for path in sorted((AGENT_WORK / "skills").glob("*/SKILL.md")):
        gates = _frontmatter_list(_frontmatter(path), "gates")
        missing = sorted(gate for gate in gates if gate not in glossary_gates)
        assert not missing, f"{path} has glossary-undefined gates: {missing}"


def test_example_plan_contains_required_artifacts_with_frontmatter() -> None:
    example_root = AGENT_WORK / "plans" / "portable-agent-work-example"

    for relative_path, expected_kind in EXAMPLE_ARTIFACTS.items():
        path = example_root / relative_path
        assert path.exists(), f"missing example artifact {relative_path}"
        frontmatter = _frontmatter(path)
        assert "type: artifact" in frontmatter
        assert f"kind: {expected_kind}" in frontmatter
        assert "domain_model: agent-work-v1" in frontmatter
        assert "status:" in frontmatter


def test_example_plan_phase_and_todo_statuses_agree_as_completed() -> None:
    example_root = AGENT_WORK / "plans" / "portable-agent-work-example"
    artifact_paths = [
        example_root / "plan.md",
        example_root / "phases" / "phase-1.md",
        example_root / "todo.md",
    ]
    statuses = {
        path.name: _frontmatter_value(_frontmatter(path), "status") for path in artifact_paths
    }

    assert statuses == {
        "plan.md": "completed",
        "phase-1.md": "completed",
        "todo.md": "completed",
    }
