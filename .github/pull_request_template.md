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
