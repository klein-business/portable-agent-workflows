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

## Public Contribution Expectations

Issues and pull requests should stay focused on the portable workflow model,
generated harness integrations, validation, documentation, governance, and supported
adapter behavior.

Before opening a pull request:

1. Check whether the change affects `agent-work-v1` compatibility.
2. Update tests or documentation with the change.
3. Run the required local checks.
4. Link any related issue or design discussion.

Behavior expectations are defined in `CODE_OF_CONDUCT.md`.
